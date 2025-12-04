import { useState, useEffect } from 'react';
import { X, Video, Calendar, Clock, Users, Lock, AlertCircle } from 'lucide-react';
import { createZoomMeeting, getZoomConnectionStatus } from '../../lib/api';
import ZoomAccountConnect from './ZoomAccountConnect';

export default function ZoomMeetingDialog({ open, onClose, onSave, courseTitle }) {
  const [meetingData, setMeetingData] = useState({
    topic: courseTitle ? `${courseTitle} - Live Session` : 'Live Class Session',
    startTime: '',
    duration: 60,
    timezone: 'UTC',
    password: '',
    waitingRoom: true,
    joinBeforeHost: false,
    muteUponEntry: true,
    description: '',
  });

  const [showZoomSetup, setShowZoomSetup] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [zoomConnected, setZoomConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  useEffect(() => {
    if (open) {
      checkZoomConnection();
    }
  }, [open]);

  const checkZoomConnection = async () => {
    try {
      const status = await getZoomConnectionStatus();
      setZoomConnected(status.connected);
      if (!status.connected) {
        setShowConnectDialog(true);
      }
    } catch (err) {
      console.error('Error checking Zoom connection:', err);
      setZoomConnected(false);
      setShowConnectDialog(true);
    } finally {
      setCheckingConnection(false);
    }
  };

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check connection before creating
    if (!zoomConnected) {
      setShowConnectDialog(true);
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      // Call backend API to create Zoom meeting using instructor's account
      const data = await createZoomMeeting({
        topic: meetingData.topic,
        startTime: meetingData.startTime,
        duration: meetingData.duration,
        timezone: meetingData.timezone,
        password: meetingData.password || undefined,
        waitingRoom: meetingData.waitingRoom,
        joinBeforeHost: meetingData.joinBeforeHost,
        muteUponEntry: meetingData.muteUponEntry,
        description: meetingData.description || undefined,
      });

      if (!data?.meeting) {
        throw new Error('Failed to create Zoom meeting');
      }

      console.log('Zoom meeting created successfully:', data.meeting);

      // Pass the meeting data back to parent
      onSave({
        ...data.meeting,
        settings: {
          waitingRoom: meetingData.waitingRoom,
          joinBeforeHost: meetingData.joinBeforeHost,
          muteUponEntry: meetingData.muteUponEntry,
        },
      });

      // Reset form
      setMeetingData({
        topic: courseTitle ? `${courseTitle} - Live Session` : 'Live Class Session',
        startTime: '',
        duration: 60,
        timezone: 'UTC',
        password: '',
        waitingRoom: true,
        joinBeforeHost: false,
        muteUponEntry: true,
        description: '',
      });
    } catch (err) {
      console.error('Error creating Zoom meeting:', err);
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Show connection dialog if not connected
  if (showConnectDialog) {
    return (
      <ZoomAccountConnect
        onClose={() => {
          setShowConnectDialog(false);
          onClose();
        }}
        onConnected={() => {
          setZoomConnected(true);
          setShowConnectDialog(false);
        }}
      />
    );
  }

  // Show loading state while checking connection
  if (checkingConnection) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">Checking Zoom connection...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#0f5a56]">Schedule Zoom Meeting</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {/* Zoom Setup Notice */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Zoom API Configuration Required</h3>
                <p className="text-sm text-blue-800 mb-2">
                  To create live Zoom meetings, you need to configure your Zoom API credentials in Supabase Edge Function secrets.
                </p>
                <button
                  onClick={() => setShowZoomSetup(!showZoomSetup)}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  {showZoomSetup ? 'Hide Setup Instructions' : 'Show Setup Instructions'}
                </button>
              </div>
            </div>

            {showZoomSetup && (
              <div className="mt-4 space-y-3 text-sm">
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2">📋 Step-by-Step Setup:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Go to <a href="https://marketplace.zoom.us/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Zoom Marketplace</a></li>
                    <li>Click "Develop" → "Build App" → Select "Server-to-Server OAuth"</li>
                    <li>Fill in app information and create the app</li>
                    <li>Copy your <strong>Account ID</strong>, <strong>Client ID</strong>, and <strong>Client Secret</strong></li>
                    <li>Add these to Supabase Edge Function secrets using the Supabase CLI:</li>
                  </ol>
                  <pre className="mt-3 bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
{`# Set secrets for the Edge Function
supabase secrets set ZOOM_ACCOUNT_ID=your_account_id
supabase secrets set ZOOM_CLIENT_ID=your_client_id
supabase secrets set ZOOM_CLIENT_SECRET=your_client_secret

# Or for hosted Supabase, go to:
# Dashboard → Project Settings → Edge Functions → Add Secret`}
                  </pre>
                  <p className="mt-3 text-xs text-gray-600">
                    <strong>Note:</strong> The Edge Function at <code className="bg-gray-100 px-1 rounded">supabase/functions/create-zoom-meeting</code> handles all API calls securely on the server.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-800">
                    <strong>✅ Secure Implementation:</strong> Your Zoom credentials are stored securely in Supabase Edge Function secrets and never exposed to the frontend.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">Error Creating Meeting</h3>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Meeting Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meeting Topic *
              </label>
              <input
                type="text"
                required
                value={meetingData.topic}
                onChange={(e) => setMeetingData({ ...meetingData, topic: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#58ACA9]"
                placeholder="e.g., Week 1: Introduction to Arabic"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={meetingData.startTime}
                  onChange={(e) => setMeetingData({ ...meetingData, startTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#58ACA9]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration (minutes) *
                </label>
                <select
                  value={meetingData.duration}
                  onChange={(e) => setMeetingData({ ...meetingData, duration: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#58ACA9]"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Meeting Password (optional)
              </label>
              <input
                type="text"
                value={meetingData.password}
                onChange={(e) => setMeetingData({ ...meetingData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#58ACA9]"
                placeholder="Leave empty for no password"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={meetingData.description}
                onChange={(e) => setMeetingData({ ...meetingData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#58ACA9]"
                placeholder="Add any additional information about this session..."
              />
            </div>

            {/* Meeting Settings */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Meeting Settings
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={meetingData.waitingRoom}
                    onChange={(e) => setMeetingData({ ...meetingData, waitingRoom: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-[#58ACA9] focus:ring-[#58ACA9]"
                  />
                  <span className="text-sm text-gray-700">Enable waiting room</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={meetingData.joinBeforeHost}
                    onChange={(e) => setMeetingData({ ...meetingData, joinBeforeHost: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-[#58ACA9] focus:ring-[#58ACA9]"
                  />
                  <span className="text-sm text-gray-700">Allow participants to join before host</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={meetingData.muteUponEntry}
                    onChange={(e) => setMeetingData({ ...meetingData, muteUponEntry: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-[#58ACA9] focus:ring-[#58ACA9]"
                  />
                  <span className="text-sm text-gray-700">Mute participants upon entry</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 px-6 py-3 bg-[#58ACA9] text-white rounded-xl font-semibold hover:bg-[#58ACA9]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating Meeting...' : 'Create Meeting'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isCreating}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
