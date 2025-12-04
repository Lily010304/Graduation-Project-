# Zoom OAuth 2.0 Implementation Guide

## Overview

This guide explains how to implement **per-instructor Zoom authentication** so each instructor can host meetings using their own Zoom account and email (matching their Sconce email).

---

## Current Architecture (Single Account)

```
All Instructors → Supabase Edge Function → Your Zoom Account
❌ Problem: All meetings created under one account
❌ Problem: Only you can be the host
```

---

## New Architecture (Multi-Account OAuth)

```
Each Instructor → Backend API → Their Own Zoom Account
✅ Each instructor connects their Zoom account
✅ Meetings created under instructor's email
✅ Instructor is the meeting host
✅ Meetings appear in instructor's Zoom dashboard
```

---

## Backend Implementation (ASP.NET Core)

### 1. Database Schema

Add table to store instructor Zoom tokens:

```sql
CREATE TABLE InstructorZoomAuth (
    Id INT PRIMARY KEY IDENTITY(1,1),
    InstructorId INT NOT NULL FOREIGN KEY REFERENCES Instructors(Id),
    ZoomUserId NVARCHAR(255) NOT NULL,
    ZoomEmail NVARCHAR(255) NOT NULL,
    AccessToken NVARCHAR(MAX) NOT NULL, -- Encrypted
    RefreshToken NVARCHAR(MAX) NOT NULL, -- Encrypted
    TokenExpiry DATETIME NOT NULL,
    Scope NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT UK_InstructorZoomAuth_InstructorId UNIQUE(InstructorId)
);

CREATE INDEX IX_InstructorZoomAuth_InstructorId ON InstructorZoomAuth(InstructorId);
```

### 2. App Configuration (appsettings.json)

```json
{
  "Zoom": {
    "ClientId": "YOUR_ZOOM_CLIENT_ID",
    "ClientSecret": "YOUR_ZOOM_CLIENT_SECRET",
    "RedirectUri": "https://sconce.runasp.net/api/zoom/callback",
    "AuthorizationEndpoint": "https://zoom.us/oauth/authorize",
    "TokenEndpoint": "https://zoom.us/oauth/token",
    "ApiBaseUrl": "https://api.zoom.us/v2"
  },
  "Encryption": {
    "Key": "YOUR_32_CHAR_ENCRYPTION_KEY_HERE"
  }
}
```

### 3. Zoom OAuth App Setup

1. Go to https://marketplace.zoom.us/
2. Click **Develop** → **Build App**
3. Select **OAuth** (NOT Server-to-Server)
4. Configure:
   - **App Name**: Sconce LMS
   - **Redirect URL**: `https://sconce.runasp.net/api/zoom/callback`
   - **Scopes Required**:
     - `meeting:write` - Create meetings
     - `meeting:read` - Read meeting details
     - `user:read` - Get user info
5. Copy **Client ID** and **Client Secret**

### 4. Create ZoomController.cs

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;
using System.Security.Cryptography;

namespace Sconce.Controllers
{
    [ApiController]
    [Route("api/zoom")]
    [Authorize] // Requires authenticated instructor
    public class ZoomController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        private readonly IHttpClientFactory _httpClientFactory;

        public ZoomController(
            ApplicationDbContext context,
            IConfiguration config,
            IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _config = config;
            _httpClientFactory = httpClientFactory;
        }

        // Step 1: Redirect instructor to Zoom OAuth page
        [HttpGet("authorize")]
        public IActionResult Authorize()
        {
            var clientId = _config["Zoom:ClientId"];
            var redirectUri = _config["Zoom:RedirectUri"];
            
            // Generate random state for CSRF protection
            var state = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            
            // Store state in session/cache for validation
            HttpContext.Session.SetString("zoom_oauth_state", state);
            
            var authUrl = $"{_config["Zoom:AuthorizationEndpoint"]}?" +
                         $"response_type=code&" +
                         $"client_id={clientId}&" +
                         $"redirect_uri={Uri.EscapeDataString(redirectUri)}&" +
                         $"state={state}";
            
            return Redirect(authUrl);
        }

        // Step 2: Handle OAuth callback from Zoom
        [HttpGet("callback")]
        public async Task<IActionResult> Callback([FromQuery] string code, [FromQuery] string state)
        {
            // Validate state (CSRF protection)
            var savedState = HttpContext.Session.GetString("zoom_oauth_state");
            if (string.IsNullOrEmpty(savedState) || savedState != state)
            {
                return BadRequest(new { error = "Invalid state parameter" });
            }

            try
            {
                // Exchange authorization code for access token
                var tokenResponse = await ExchangeCodeForToken(code);
                
                // Get current instructor ID from JWT token
                var instructorId = GetCurrentInstructorId();
                
                // Get Zoom user info
                var userInfo = await GetZoomUserInfo(tokenResponse.AccessToken);
                
                // Save/update tokens in database
                await SaveInstructorZoomAuth(instructorId, tokenResponse, userInfo);
                
                // Redirect back to frontend with success
                return Redirect("/#/dashboard/instructor?zoom=connected");
            }
            catch (Exception ex)
            {
                return Redirect($"/#/dashboard/instructor?zoom=error&message={Uri.EscapeDataString(ex.Message)}");
            }
        }

        // Step 3: Check if instructor has connected Zoom account
        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            var instructorId = GetCurrentInstructorId();
            
            var auth = await _context.InstructorZoomAuth
                .FirstOrDefaultAsync(a => a.InstructorId == instructorId);
            
            if (auth == null)
            {
                return Ok(new { connected = false, email = (string)null });
            }
            
            return Ok(new { connected = true, email = auth.ZoomEmail });
        }

        // Step 4: Disconnect Zoom account
        [HttpDelete("disconnect")]
        public async Task<IActionResult> Disconnect()
        {
            var instructorId = GetCurrentInstructorId();
            
            var auth = await _context.InstructorZoomAuth
                .FirstOrDefaultAsync(a => a.InstructorId == instructorId);
            
            if (auth != null)
            {
                _context.InstructorZoomAuth.Remove(auth);
                await _context.SaveChangesAsync();
            }
            
            return Ok(new { message = "Zoom account disconnected" });
        }

        // Step 5: Create Zoom meeting using instructor's account
        [HttpPost("create-meeting")]
        public async Task<IActionResult> CreateMeeting([FromBody] ZoomMeetingRequest request)
        {
            var instructorId = GetCurrentInstructorId();
            
            // Get instructor's Zoom auth
            var auth = await _context.InstructorZoomAuth
                .FirstOrDefaultAsync(a => a.InstructorId == instructorId);
            
            if (auth == null)
            {
                return BadRequest(new { error = "Zoom account not connected. Please connect your Zoom account first." });
            }
            
            // Refresh token if expired
            if (auth.TokenExpiry <= DateTime.UtcNow.AddMinutes(5))
            {
                auth = await RefreshAccessToken(auth);
            }
            
            // Create meeting via Zoom API
            var meeting = await CreateZoomMeetingApi(auth.AccessToken, request);
            
            return Ok(new { meeting });
        }

        // ==================== HELPER METHODS ====================

        private async Task<TokenResponse> ExchangeCodeForToken(string code)
        {
            var client = _httpClientFactory.CreateClient();
            
            var credentials = Convert.ToBase64String(
                Encoding.UTF8.GetBytes($"{_config["Zoom:ClientId"]}:{_config["Zoom:ClientSecret"]}")
            );
            
            var requestBody = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("grant_type", "authorization_code"),
                new KeyValuePair<string, string>("code", code),
                new KeyValuePair<string, string>("redirect_uri", _config["Zoom:RedirectUri"])
            });
            
            var request = new HttpRequestMessage(HttpMethod.Post, _config["Zoom:TokenEndpoint"])
            {
                Content = requestBody,
                Headers = { { "Authorization", $"Basic {credentials}" } }
            };
            
            var response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();
            
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<TokenResponse>(json);
        }

        private async Task<ZoomUserInfo> GetZoomUserInfo(string accessToken)
        {
            var client = _httpClientFactory.CreateClient();
            
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_config["Zoom:ApiBaseUrl"]}/users/me")
            {
                Headers = { { "Authorization", $"Bearer {accessToken}" } }
            };
            
            var response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();
            
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<ZoomUserInfo>(json);
        }

        private async Task SaveInstructorZoomAuth(int instructorId, TokenResponse tokenResponse, ZoomUserInfo userInfo)
        {
            var existing = await _context.InstructorZoomAuth
                .FirstOrDefaultAsync(a => a.InstructorId == instructorId);
            
            if (existing == null)
            {
                existing = new InstructorZoomAuth { InstructorId = instructorId };
                _context.InstructorZoomAuth.Add(existing);
            }
            
            existing.ZoomUserId = userInfo.Id;
            existing.ZoomEmail = userInfo.Email;
            existing.AccessToken = EncryptToken(tokenResponse.AccessToken);
            existing.RefreshToken = EncryptToken(tokenResponse.RefreshToken);
            existing.TokenExpiry = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn);
            existing.Scope = tokenResponse.Scope;
            existing.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
        }

        private async Task<InstructorZoomAuth> RefreshAccessToken(InstructorZoomAuth auth)
        {
            var client = _httpClientFactory.CreateClient();
            
            var credentials = Convert.ToBase64String(
                Encoding.UTF8.GetBytes($"{_config["Zoom:ClientId"]}:{_config["Zoom:ClientSecret"]}")
            );
            
            var requestBody = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("grant_type", "refresh_token"),
                new KeyValuePair<string, string>("refresh_token", DecryptToken(auth.RefreshToken))
            });
            
            var request = new HttpRequestMessage(HttpMethod.Post, _config["Zoom:TokenEndpoint"])
            {
                Content = requestBody,
                Headers = { { "Authorization", $"Basic {credentials}" } }
            };
            
            var response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();
            
            var json = await response.Content.ReadAsStringAsync();
            var tokenResponse = JsonSerializer.Deserialize<TokenResponse>(json);
            
            // Update tokens
            auth.AccessToken = EncryptToken(tokenResponse.AccessToken);
            auth.RefreshToken = EncryptToken(tokenResponse.RefreshToken);
            auth.TokenExpiry = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn);
            auth.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return auth;
        }

        private async Task<object> CreateZoomMeetingApi(string accessToken, ZoomMeetingRequest request)
        {
            var client = _httpClientFactory.CreateClient();
            
            var meetingBody = new
            {
                topic = request.Topic,
                type = 2, // Scheduled meeting
                start_time = request.StartTime,
                duration = request.Duration,
                timezone = request.Timezone ?? "UTC",
                password = request.Password,
                settings = new
                {
                    waiting_room = request.WaitingRoom,
                    join_before_host = request.JoinBeforeHost,
                    mute_upon_entry = request.MuteUponEntry
                }
            };
            
            var httpRequest = new HttpRequestMessage(HttpMethod.Post, $"{_config["Zoom:ApiBaseUrl"]}/users/me/meetings")
            {
                Content = new StringContent(JsonSerializer.Serialize(meetingBody), Encoding.UTF8, "application/json"),
                Headers = { { "Authorization", $"Bearer {DecryptToken(accessToken)}" } }
            };
            
            var response = await client.SendAsync(httpRequest);
            response.EnsureSuccessStatusCode();
            
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<object>(json);
        }

        private int GetCurrentInstructorId()
        {
            // Extract instructor ID from JWT token claims
            var instructorIdClaim = User.Claims.FirstOrDefault(c => c.Type == "InstructorId");
            if (instructorIdClaim == null)
            {
                throw new UnauthorizedAccessException("Instructor ID not found in token");
            }
            return int.Parse(instructorIdClaim.Value);
        }

        // ==================== ENCRYPTION ====================

        private string EncryptToken(string plainText)
        {
            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(_config["Encryption:Key"]);
            aes.GenerateIV();
            
            using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream();
            ms.Write(aes.IV, 0, aes.IV.Length);
            
            using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
            using (var sw = new StreamWriter(cs))
            {
                sw.Write(plainText);
            }
            
            return Convert.ToBase64String(ms.ToArray());
        }

        private string DecryptToken(string cipherText)
        {
            var buffer = Convert.FromBase64String(cipherText);
            
            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(_config["Encryption:Key"]);
            
            var iv = new byte[16];
            Array.Copy(buffer, 0, iv, 0, iv.Length);
            aes.IV = iv;
            
            using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream(buffer, iv.Length, buffer.Length - iv.Length);
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var sr = new StreamReader(cs);
            
            return sr.ReadToEnd();
        }
    }

    // ==================== MODELS ====================

    public class ZoomMeetingRequest
    {
        public string Topic { get; set; }
        public string StartTime { get; set; }
        public int Duration { get; set; }
        public string Timezone { get; set; }
        public string Password { get; set; }
        public bool WaitingRoom { get; set; }
        public bool JoinBeforeHost { get; set; }
        public bool MuteUponEntry { get; set; }
        public string Description { get; set; }
    }

    public class TokenResponse
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public int ExpiresIn { get; set; }
        public string Scope { get; set; }
    }

    public class ZoomUserInfo
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
}
```

### 5. Register InstructorZoomAuth Entity

Add to `ApplicationDbContext.cs`:

```csharp
public DbSet<InstructorZoomAuth> InstructorZoomAuth { get; set; }
```

---

## Frontend Changes (Already Implemented)

✅ Added `ZoomAccountConnect.jsx` - Connection dialog
✅ Updated `ZoomMeetingDialog.jsx` - Checks connection before creating meetings
✅ Updated `api.js` - Added Zoom API endpoints

---

## User Flow

### First Time Setup (One-Time per Instructor)

1. Instructor clicks "Add Content" → "Zoom Meeting"
2. System checks if Zoom account is connected
3. If not connected, shows `ZoomAccountConnect` dialog
4. Instructor clicks "Connect Zoom Account"
5. Redirected to Zoom OAuth page
6. Instructor signs in with their Zoom account (must match Sconce email)
7. Authorizes Sconce to create meetings
8. Redirected back to Sconce with success message
9. Tokens stored encrypted in database

### Creating Meetings (Every Time)

1. Instructor clicks "Add Content" → "Zoom Meeting"
2. System verifies Zoom connection (checks token expiry)
3. If expired, automatically refreshes token
4. Shows meeting creation form
5. On submit, calls backend `/api/zoom/create-meeting`
6. Backend uses instructor's access token
7. Zoom creates meeting under instructor's account
8. Meeting details saved to course content

---

## Security Considerations

### ✅ Token Encryption
- Access tokens and refresh tokens encrypted using AES-256
- Encryption key stored in app settings (NOT in code)
- Unique IV (initialization vector) per encrypted value

### ✅ CSRF Protection
- State parameter validated in OAuth callback
- Stored in session between authorize and callback

### ✅ Token Refresh
- Automatic refresh before expiry
- Prevents unnecessary re-authorization

### ✅ Authorization
- All endpoints require authenticated instructor
- Instructor can only access their own tokens

---

## Testing

### 1. Test OAuth Flow
```bash
# Start backend
dotnet run

# Frontend should redirect to:
GET https://sconce.runasp.net/api/zoom/authorize

# After Zoom login, callback to:
GET https://sconce.runasp.net/api/zoom/callback?code=xxx&state=yyy
```

### 2. Test Meeting Creation
```bash
# Check connection status
GET /api/zoom/status
Authorization: Bearer {instructor_token}

# Create meeting
POST /api/zoom/create-meeting
Authorization: Bearer {instructor_token}
Content-Type: application/json

{
  "topic": "Test Meeting",
  "startTime": "2025-12-10T14:00:00Z",
  "duration": 60,
  "password": "test123",
  "waitingRoom": true,
  "joinBeforeHost": false,
  "muteUponEntry": true
}
```

---

## Migration from Current System

### Current (Supabase Edge Function)
- Delete or keep as fallback
- All meetings under single account

### New (OAuth per Instructor)
- Each instructor connects their account
- Meetings created under instructor's email
- Better control and organization

---

## FAQ

**Q: What if instructor doesn't have a Zoom account?**
A: They need to create a free Zoom account using their Sconce email.

**Q: Can one instructor have multiple Zoom accounts?**
A: No, one Zoom account per instructor. They can disconnect and reconnect a different account.

**Q: What happens if token expires?**
A: Backend automatically refreshes using refresh token. No user action needed.

**Q: What if refresh token expires?**
A: Instructor must reconnect their Zoom account (typically after 90 days of inactivity).

**Q: Does this cost money?**
A: Zoom OAuth is free. Each instructor uses their own Zoom plan (free or paid).

---

## Next Steps

1. ✅ Frontend code ready (already implemented)
2. 🔄 **Backend implementation needed** (this document)
3. 🔄 Create Zoom OAuth app in Zoom Marketplace
4. 🔄 Add database migration for `InstructorZoomAuth` table
5. 🔄 Test OAuth flow end-to-end
6. 🔄 Deploy to production

---

**Last Updated**: December 4, 2025
