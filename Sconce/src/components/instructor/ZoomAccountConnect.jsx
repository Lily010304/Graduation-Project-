import { useState, useEffect } from 'react';
import { Video, CheckCircle, AlertCircle, X } from 'lucide-react';
import { getZoomConnectionStatus, getZoomAuthUrl, disconnectZoom } from '../../lib/api';

/**
 * Component for instructors to connect their Zoom account
 * Displays connection status and provides OAuth flow
 */
export default function ZoomAccountConnect({ onClose, onConnected }) {
  const [status, setStatus] = useState({ connected: false, email: null, loading: true });
  const [error, setError] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const result = await getZoomConnectionStatus();
      setStatus({ ...result, loading: false });
    } catch (err) {
      setError(err.message);
      setStatus({ connected: false, email: null, loading: false });
    }
  };

  const handleConnect = () => {
    // Redirect to backend OAuth flow
    window.location.href = getZoomAuthUrl();
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Zoom account?')) return;
    
    try {
      await disconnectZoom();
      setStatus({ connected: false, email: null, loading: false });
      alert('Zoom account disconnected successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  if (status.loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">Loading Zoom connection status...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#58ACA9] to-[#034242] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6" />
            <h2 className="text-xl font-bold">Zoom Account Connection</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-1 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {status.connected ? (
            // Connected State
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-1">Connected Successfully</h3>
                  <p className="text-sm text-green-800">
                    Your Zoom account is connected: <strong>{status.email}</strong>
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2">✅ You can now:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Create Zoom meetings directly from course content</li>
                  <li>Host meetings using your Zoom account</li>
                  <li>Students will see you as the meeting host</li>
                  <li>Meetings appear in your Zoom dashboard</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onClose();
                    if (onConnected) onConnected();
                  }}
                  className="flex-1 px-4 py-3 bg-[#58ACA9] text-white rounded-xl font-semibold hover:brightness-110 transition"
                >
                  Continue to Create Meeting
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-3 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            // Not Connected State
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 mb-1">Zoom Account Not Connected</h3>
                  <p className="text-sm text-yellow-800">
                    Connect your Zoom account to create and host meetings using your Sconce instructor email.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📋 How it works:</h4>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Click "Connect Zoom Account" below</li>
                  <li>Sign in to Zoom with your instructor email (<strong>must match your Sconce email</strong>)</li>
                  <li>Authorize Sconce to create meetings on your behalf</li>
                  <li>Return here to create meetings as the host</li>
                </ol>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">🔒 Privacy & Security:</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Your Zoom credentials are securely encrypted</li>
                  <li>Sconce only creates meetings - no access to your account settings</li>
                  <li>You can disconnect anytime</li>
                  <li>Meetings appear in your Zoom dashboard for full control</li>
                </ul>
              </div>

              <button
                onClick={handleConnect}
                className="w-full px-4 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-3"
              >
                <Video className="w-5 h-5" />
                Connect Zoom Account
              </button>

              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
