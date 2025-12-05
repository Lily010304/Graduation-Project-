/**
 * API Client for Backend Integration
 * Connects Sconce frontend to ASP.NET Core backend
 */

// Import Supabase for Zoom functions
import { supabase } from './supabase.js';

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sconce.runasp.net';

/**
 * Generic API request handler
 * @param {string} endpoint - API endpoint (e.g., '/api/Identity/Account/Login')
 * @param {object} options - Fetch options
 * @returns {Promise<object>} Response data
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/plain',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Extract error message from various response formats
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      if (data?.message) {
        errorMessage = data.message;
      } else if (data?.error) {
        errorMessage = data.error;
      } else if (typeof data === 'string' && data.trim()) {
        errorMessage = data;
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// ==================== IDENTITY / AUTH ENDPOINTS ====================

/**
 * Login user
 * POST /api/Identity/Account/Login
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{message: string}>}
 */
export const login = async (email, password) => {
  const response = await apiRequest('/api/Identity/Account/Login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  // Store auth token if provided in response
  if (response.token) {
    localStorage.setItem('authToken', response.token);
  }
  
  // Store user data if provided
  if (response.user) {
    localStorage.setItem('userData', JSON.stringify(response.user));
  }
  
  return response;
};

/**
 * Confirm email address
 * GET /api/Identity/Account/ConfirmEmail
 * @param {string} token 
 * @param {string} userID 
 * @returns {Promise<{message: string}>}
 */
export const confirmEmail = async (token, userID) => {
  return await apiRequest(`/api/Identity/Account/ConfirmEmail?token=${encodeURIComponent(token)}&userID=${encodeURIComponent(userID)}`, {
    method: 'GET',
  });
};

/**
 * Request password reset
 * POST /api/Identity/Account/ForgotPassword
 * @param {string} email 
 * @returns {Promise<{message: string}>}
 */
export const forgotPassword = async (email) => {
  return await apiRequest('/api/Identity/Account/ForgotPassword', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

/**
 * Reset password with code
 * PATCH /api/Identity/Account/ResetPassword
 * @param {string} email 
 * @param {string} newPassword 
 * @param {string} code 
 * @returns {Promise<{message: string}>}
 */
export const resetPassword = async (email, newPassword, code) => {
  return await apiRequest('/api/Identity/Account/ResetPassword', {
    method: 'PATCH',
    body: JSON.stringify({ email, newPassword, code }),
  });
};

// ==================== STUDENT ENDPOINTS ====================

/**
 * Register student account
 * POST /api/Student/Account/RegisterStudent
 * @param {object} data - {email, fullName, password}
 * @returns {Promise<{message: string}>}
 */
export const registerStudent = async (data) => {
  return await apiRequest('/api/Student/Account/RegisterStudent', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Approve parent link
 * GET /api/Student/Account/ApproveParentLink
 * @param {string} token 
 * @returns {Promise<void>}
 */
export const approveParentLink = async (token) => {
  return await apiRequest(`/api/Student/Account/ApproveParentLink?token=${encodeURIComponent(token)}`, {
    method: 'GET',
  });
};

/**
 * Submit student application
 * POST /api/Student/Application/Apply
 * @param {FormData} formData - Multipart form with City, Country, DateOfBirth, Document, etc.
 * @returns {Promise<void>}
 */
export const applyStudent = async (formData) => {
  return await apiRequest('/api/Student/Application/Apply', {
    method: 'POST',
    headers: {
      // Remove Content-Type to let browser set it with boundary for multipart
      'Content-Type': undefined,
    },
    body: formData,
  });
};

/**
 * Check student application status
 * GET /api/Student/Application/Status
 * @param {string} email 
 * @returns {Promise<object>}
 */
export const getStudentApplicationStatus = async (email) => {
  return await apiRequest(`/api/Student/Application/Status?email=${encodeURIComponent(email)}`, {
    method: 'GET',
  });
};

// ==================== PARENT ENDPOINTS ====================

/**
 * Register parent account
 * POST /api/Parent/Account/RegisterParent
 * @param {object} data - {dateOfBirth, email, fullName, gender, password, relationshipWithStudent, studentEmail}
 * @returns {Promise<{message: string}>}
 */
export const registerParent = async (data) => {
  return await apiRequest('/api/Parent/Account/RegisterParent', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Register parent with invite token
 * POST /api/Parent/Account/RegisterParentWithInvite
 * @param {object} data - {dateOfBirth, fullName, gender, password, relationshipWithStudent, token}
 * @returns {Promise<void>}
 */
export const registerParentWithInvite = async (data) => {
  return await apiRequest('/api/Parent/Account/RegisterParentWithInvite', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// ==================== INSTRUCTOR ENDPOINTS ====================

/**
 * Submit instructor application
 * POST /api/Instructor/Application/Apply
 * @param {FormData} formData - Multipart form with CV, experience data, etc.
 * @returns {Promise<void>}
 */
export const applyInstructor = async (formData) => {
  return await apiRequest('/api/Instructor/Application/Apply', {
    method: 'POST',
    headers: {
      'Content-Type': undefined,
    },
    body: formData,
  });
};

/**
 * Check instructor application status
 * GET /api/Instructor/Application/Status
 * @param {string} email 
 * @returns {Promise<object>}
 */
export const getInstructorApplicationStatus = async (email) => {
  return await apiRequest(`/api/Instructor/Application/Status?email=${encodeURIComponent(email)}`, {
    method: 'GET',
  });
};

// ==================== ADMIN ENDPOINTS ====================

/**
 * Get all courses
 * GET /api/Admin/Course
 * @param {boolean} onlyActive 
 * @returns {Promise<Array>}
 */
export const getCourses = async (onlyActive = false) => {
  return await apiRequest(`/api/Admin/Course?onlyActive=${onlyActive}`, {
    method: 'GET',
  });
};

/**
 * Create course
 * POST /api/Admin/Course
 * @param {object} data - {name, programId, description}
 * @returns {Promise<object>}
 */
export const createCourse = async (data) => {
  return await apiRequest('/api/Admin/Course', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Get all programs
 * GET /api/Admin/Program
 * @param {boolean} onlyActive 
 * @returns {Promise<Array>}
 */
export const getPrograms = async (onlyActive = false) => {
  return await apiRequest(`/api/Admin/Program?onlyActive=${onlyActive}`, {
    method: 'GET',
  });
};

/**
 * Create program
 * POST /api/Admin/Program
 * @param {object} data - {name, description}
 * @returns {Promise<object>}
 */
export const createProgram = async (data) => {
  return await apiRequest('/api/Admin/Program', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Get all sections
 * GET /api/Admin/Section
 * @param {boolean} onlyActive 
 * @returns {Promise<Array>}
 */
export const getSections = async (onlyActive = false) => {
  return await apiRequest(`/api/Admin/Section?onlyActive=${onlyActive}`, {
    method: 'GET',
  });
};

/**
 * Create section
 * POST /api/Admin/Section
 * @param {object} data - {courseId, name, description}
 * @returns {Promise<object>}
 */
export const createSection = async (data) => {
  return await apiRequest('/api/Admin/Section', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Get instructor applications
 * GET /api/Admin/Instructor/Applications
 * @param {number} status - Application status filter
 * @returns {Promise<Array>}
 */
export const getInstructorApplications = async (status) => {
  return await apiRequest(`/api/Admin/Instructor/Applications?status=${status}`, {
    method: 'GET',
  });
};

/**
 * Get instructor application by ID
 * GET /api/Admin/Instructor/Applications/:id
 * @param {number} id 
 * @returns {Promise<object>}
 */
export const getInstructorApplicationById = async (id) => {
  return await apiRequest(`/api/Admin/Instructor/Applications/${id}`, {
    method: 'GET',
  });
};

/**
 * Get student applications
 * GET /api/Admin/Student/Applications?status=2
 * @param {number} status - Application status filter
 * @returns {Promise<Array>}
 */
export const getStudentApplications = async (status) => {
  const endpoint = status !== undefined 
    ? `/api/Admin/Student/Applications?status=${status}`
    : `/api/Admin/Student/Applications`;
  return await apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * Get student application by ID
 * GET /api/Admin/Student/Applications/:id
 * @param {number} id 
 * @returns {Promise<object>}
 */
export const getStudentApplicationById = async (id) => {
  return await apiRequest(`/api/Admin/Student/Applications/${id}`, {
    method: 'GET',
  });
};

// ==================== ZOOM INTEGRATION ENDPOINTS ====================

/**
 * Get Zoom OAuth authorization URL
 * Redirects instructor to Zoom to connect their account
 * @returns {Promise<string>} Authorization URL to redirect user to
 */
export const getZoomAuthUrl = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const instructorId = user?.id || getCurrentUser()?.id;
  
  if (!instructorId) {
    throw new Error("Instructor ID not found");
  }
  
  const clientId = import.meta.env.VITE_ZOOM_CLIENT_ID;
  const redirectUri = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zoom-oauth-callback`;
  const state = generateRandomState();
  
  // Create temporary session to store mapping of state -> instructor_id
  // The callback function will retrieve the instructor_id using the state parameter
  const { error } = await supabase
    .from('zoom_oauth_sessions')
    .insert({
      state,
      instructor_id: instructorId,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
    });
  
  if (error) {
    console.error('Failed to create OAuth session:', error);
    throw new Error("Failed to initiate Zoom OAuth session");
  }
  
  // Return authorization URL
  return `https://zoom.us/oauth/authorize?` +
         `response_type=code&` +
         `client_id=${clientId}&` +
         `redirect_uri=${encodeURIComponent(redirectUri)}&` +
         `state=${state}`;
};

/**
 * Check if instructor has connected their Zoom account
 * @returns {Promise<object>} { connected: boolean, email: string }
 */
export const getZoomConnectionStatus = async () => {
  try {
    // Get user ID from Supabase session
    const { data: { user } } = await supabase.auth.getUser();
    const instructorId = user?.id || getCurrentUser()?.id;
    
    console.log('Checking Zoom status for instructor:', instructorId);
    
    const { data, error } = await supabase
      .functions
      .invoke('zoom-meetings', {
        body: {
          action: 'status',
          instructorId,
        }
      });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }
    
    console.log('Zoom status response:', data);
    return data;
  } catch (error) {
    console.error('Error checking Zoom connection:', error);
    return { connected: false };
  }
};

/**
 * Disconnect instructor's Zoom account
 */
export const disconnectZoom = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const instructorId = user?.id || getCurrentUser()?.id;
    
    const { data, error } = await supabase
      .functions
      .invoke('zoom-meetings', {
        body: {
          action: 'disconnect',
          instructorId,
        }
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error disconnecting Zoom:', error);
    throw error;
  }
};

/**
 * Create Zoom meeting using instructor's connected account
 * @param {object} meetingData - Meeting configuration
 * @returns {Promise<object>} Meeting details (join URL, ID, password, etc.)
 */
export const createZoomMeeting = async (meetingData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const instructorId = user?.id || getCurrentUser()?.id;
    
    const { data, error } = await supabase
      .functions
      .invoke('zoom-meetings', {
        body: {
          action: 'create',
          instructorId,
          ...meetingData,
        }
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    throw error;
  }
};

/**
 * Delete/cancel a Zoom meeting
 * @param {string} meetingId - Meeting ID from Sconce database
 */
export const deleteZoomMeeting = async (meetingId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const instructorId = user?.id || getCurrentUser()?.id;
    
    const { data, error } = await supabase
      .functions
      .invoke('zoom-meetings', {
        body: {
          action: 'delete',
          instructorId,
          meetingId,
        }
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting Zoom meeting:', error);
    throw error;
  }
};

/**
 * Helper to generate random state for OAuth CSRF protection
 */
function generateRandomState() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// ==================== UTILITY ENDPOINTS ====================

/**
 * Delete user (Database utility)
 * POST /api/Db/DeleteUser?email=string
 * @param {string} email 
 * @returns {Promise<void>}
 */
export const deleteUser = async (email) => {
  if (!email) {
    throw new Error('Email is required to delete user');
  }
  return await apiRequest(`/api/Db/DeleteUser?email=${encodeURIComponent(email)}`, {
    method: 'POST',
  });
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Logout user (clear local storage)
 */
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  window.location.hash = '#/login';
};

/**
 * Get current user data from localStorage
 * @returns {object|null}
 */
export const getCurrentUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};
