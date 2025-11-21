import { useState, useEffect } from 'react';
import { 
  createNotebook, 
  getUserNotebooks, 
  getNotebookWithSources,
  uploadSource,
  addYouTubeSource
} from '../../lib/insightsLM';
import { supabase, checkSupabaseConnectivity } from '../../lib/supabase';
import { BookOpen, Plus, Upload, Youtube, FileText, Mic, AlertCircle } from 'lucide-react';
import AddSourcesDialog from '../../components/notebook/AddSourcesDialog';

/**
 * Instructor's Notebook Manager
 * Full InsightsLM features: Chat, Upload Resources, Generate Podcasts, Notes
 */
export default function InstructorNotebooks() {
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'create'
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    // Get current authenticated user
    const getCurrentUser = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        // First check if a session exists. Calling getUser() when there is no
        // session can throw AuthSessionMissingError in the current supabase-js
        // client. Use getSession() and only call getUser() when a session is present.
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          // Could be network or configuration issue; log and fall through to sign-in UI
          console.error('Failed to get auth session:', sessionError);
          setUserId(null);
          return;
        }

        const session = sessionData?.session ?? null;
        if (!session) {
          // No active session — user not signed in
          setUserId(null);
          return;
        }

        // If session exists, fetch the user safely
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Failed to fetch user after session present:', userError);
          setUserId(null);
        } else if (user) {
          setUserId(user.id);
        } else {
          setUserId(null);
        }
      } catch (error) {
        console.error('Failed to get user:', error);
        setUserId(null);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadNotebooks();
    }
  }, [userId]);

  const loadNotebooks = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const data = await getUserNotebooks(userId);
      setNotebooks(data);
    } catch (error) {
      console.error('Failed to load notebooks:', error);
      // Don't set error state here, let the UI check supabase directly
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotebook = async (weekNumber, title) => {
    try {
      const newNotebook = await createNotebook(weekNumber, userId, { 
        title,
        description: `Resources and materials for Week ${weekNumber}`
      });
      setNotebooks([...notebooks, newNotebook]);
      setView('list');
    } catch (error) {
      console.error('Failed to create notebook:', error);
      alert('Failed to create notebook: ' + error.message);
    }
  };

  const handleSelectNotebook = async (notebookId) => {
    try {
      const notebook = await getNotebookWithSources(notebookId);
      setSelectedNotebook(notebook);
      setView('detail');
    } catch (error) {
      console.error('Failed to load notebook:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto bg-[#58ACA9] text-white p-6 rounded-3xl border border-white/30">
        <div className="text-center">Loading notebooks...</div>
      </div>
    );
  }

  // Check if Supabase is configured
  if (!supabase) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#58ACA9] text-white p-6 rounded-3xl border border-white/30">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">InsightsLM Notebooks</h1>
              <p className="text-sm text-white/80">AI-powered learning materials by week</p>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-amber-900 mb-3">Supabase Configuration Required</h3>
              <p className="text-amber-800 mb-4">
                To use InsightsLM Notebooks, you need to configure your Supabase connection.
              </p>
              
              <div className="bg-white rounded-xl p-4 mb-4 font-mono text-sm">
                <p className="text-gray-600 mb-2">Add to <code className="bg-gray-100 px-2 py-1 rounded">Sconce/.env</code>:</p>
                <pre className="text-gray-800">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`}
                </pre>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
                <p className="font-semibold mb-2">📍 Where to find these values:</p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Go to your Supabase project dashboard</li>
                  <li>Click on "Settings" → "API"</li>
                  <li>Copy "Project URL" and "anon public" key</li>
                  <li>Paste them into your <code>.env</code> file</li>
                  <li>Restart the dev server: <code className="bg-blue-100 px-2 py-1 rounded">npm run dev</code></li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If Supabase is configured but no user is signed in, show sign-in UI
  if (!userId) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#58ACA9] text-white p-6 rounded-3xl border border-white/30">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">InsightsLM Notebooks</h1>
              <p className="text-sm text-white/80">Sign in to manage your notebooks</p>
            </div>
          </div>
        </div>

        <SignIn onSignIn={(user) => setUserId(user.id)} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#58ACA9] text-white p-6 rounded-3xl border border-white/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">InsightsLM Notebooks</h1>
              <p className="text-sm text-white/80">AI-powered learning materials by week</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                setView('create');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#58ACA9] rounded-full font-semibold hover:bg-white/90 transition"
            >
              <Plus className="w-4 h-4" />
              Create Notebook
            </button>
            <ConnectionCheck />
          </div>
        </div>
      </div>

      {/* Views */}
      {view === 'list' && (
        <NotebookList 
          notebooks={notebooks} 
          onSelect={handleSelectNotebook}
        />
      )}

      {view === 'create' && (
        <CreateNotebook 
          onSubmit={handleCreateNotebook}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'detail' && selectedNotebook && (
        <NotebookDetail 
          notebook={selectedNotebook}
          onBack={() => {
            setView('list');
            setSelectedNotebook(null);
          }}
          onUpdate={loadNotebooks}
        />
      )}
    </div>
  );
}

/**
 * Notebook List View
 */
function NotebookList({ notebooks, onSelect }) {
  if (notebooks.length === 0) {
    return (
      <div className="bg-white text-[#0f5a56] p-12 rounded-3xl border border-[#0f5a56]/20 text-center">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-[#58ACA9]" />
        <h3 className="text-xl font-semibold mb-2">No notebooks yet</h3>
        <p className="text-[#0f5a56]/70">Create your first notebook to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notebooks.map((notebook) => (
        <button
          key={notebook.id}
          onClick={() => onSelect(notebook.id)}
          className="bg-white text-[#0f5a56] p-6 rounded-3xl border border-[#0f5a56]/20 hover:border-[#58ACA9] hover:shadow-lg transition text-left group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="text-4xl">{notebook.icon || '📚'}</div>
            <div className="text-xs bg-[#58ACA9]/10 text-[#58ACA9] px-2 py-1 rounded-full">
              Week {notebook.week_number}
            </div>
          </div>
          <h3 className="font-semibold text-lg mb-2 group-hover:text-[#58ACA9] transition">
            {notebook.title}
          </h3>
          <p className="text-sm text-[#0f5a56]/70 mb-3 line-clamp-2">
            {notebook.description || 'No description'}
          </p>
          <div className="flex items-center gap-4 text-xs text-[#0f5a56]/60">
            <span>{notebook.sources?.[0]?.count || 0} resources</span>
            <span className={`px-2 py-1 rounded-full ${
              notebook.generation_status === 'completed' ? 'bg-green-100 text-green-700' :
              notebook.generation_status === 'generating' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {notebook.generation_status}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

/**
 * Simple Sign In / Sign Up component
 */
function SignIn({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const user = data?.user;
      if (!user || !user.email) throw new Error('Signed-in user has no email.');
      onSignIn(user);
    } catch (err) {
      // Improve error message display with any available details
      let msg = err?.message || String(err);
      // If Supabase client error object contains status/details, include them
      if (err?.status) msg += ` (status: ${err.status})`;
      if (err?.details) msg += ` - ${err.details}`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      // If signUp succeeds, an email confirmation may be required.
      // Try to get user object and proceed if available.
      const user = data?.user;
      if (user && user.email) {
        onSignIn(user);
      } else {
        setError('Sign-up successful. Please check your email to confirm your account before signing in.');
      }
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-[#0f5a56]/10">
      <h2 className="text-xl font-semibold mb-4">Instructor Sign In</h2>
      <form onSubmit={handleSignIn} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#58ACA9] text-white rounded-lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="px-4 py-2 border rounded-lg"
          >
            {loading ? 'Please wait...' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Create Notebook Form
 */
function CreateNotebook({ onSubmit, onCancel }) {
  const [weekNumber, setWeekNumber] = useState(1);
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    onSubmit(weekNumber, title);
  };

  return (
    <div className="bg-white text-[#0f5a56] p-8 rounded-3xl border border-[#0f5a56]/20">
      <h2 className="text-2xl font-bold mb-6">Create New Notebook</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Week Number</label>
          <input
            type="number"
            min="1"
            max="52"
            value={weekNumber}
            onChange={(e) => setWeekNumber(parseInt(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl border border-[#0f5a56]/20 focus:outline-none focus:border-[#58ACA9]"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Introduction to Arabic Alphabet"
            className="w-full px-4 py-3 rounded-2xl border border-[#0f5a56]/20 focus:outline-none focus:border-[#58ACA9]"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-[#58ACA9] text-white rounded-full font-semibold hover:bg-[#034242] transition"
          >
            Create Notebook
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-[#0f5a56]/20 text-[#0f5a56] rounded-full font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Notebook Detail View with Tabs
 */
function NotebookDetail({ notebook, onBack, onUpdate }) {
  const [activeTab, setActiveTab] = useState('resources'); // 'resources' | 'chat' | 'podcast' | 'notes'

  const tabs = [
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'chat', label: 'AI Chat', icon: BookOpen },
    { id: 'podcast', label: 'Podcast', icon: Mic },
    { id: 'notes', label: 'Notes', icon: FileText },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white text-[#0f5a56] p-6 rounded-3xl border border-[#0f5a56]/20">
        <button
          onClick={onBack}
          className="text-sm text-[#58ACA9] hover:underline mb-3"
        >
          ← Back to notebooks
        </button>
        <div className="flex items-start gap-4">
          <div className="text-5xl">{notebook.icon || '📚'}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{notebook.title}</h1>
              <span className="text-xs bg-[#58ACA9]/10 text-[#58ACA9] px-2 py-1 rounded-full">
                Week {notebook.week_number}
              </span>
            </div>
            <p className="text-[#0f5a56]/70">{notebook.description}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white text-[#0f5a56] rounded-3xl border border-[#0f5a56]/20 overflow-hidden">
        <div className="flex border-b border-[#0f5a56]/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-[#58ACA9] text-white'
                    : 'text-[#0f5a56]/60 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'resources' && <ResourcesTab notebook={notebook} onUpdate={onUpdate} />}
          {activeTab === 'chat' && <ChatTab notebookId={notebook.id} />}
          {activeTab === 'podcast' && <PodcastTab notebookId={notebook.id} />}
          {activeTab === 'notes' && <NotesTab notebookId={notebook.id} />}
        </div>
      </div>
    </div>
  );
}

/**
 * Resources Tab - Upload & Manage Sources
 */
function ResourcesTab({ notebook, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showAddSourcesDialog, setShowAddSourcesDialog] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const ext = file.name.split('.').pop().toLowerCase();
      const sourceType = ext === 'pdf' ? 'pdf' : ext === 'docx' ? 'docx' : 'file';
      
      await uploadSource(notebook.id, file, sourceType);
      onUpdate();
      alert('Resource uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleYouTubeAdd = async () => {
    if (!youtubeUrl.trim()) return;

    try {
      setUploading(true);
      await addYouTubeSource(notebook.id, youtubeUrl);
      setYoutubeUrl('');
      onUpdate();
      alert('YouTube video added successfully!');
    } catch (error) {
      console.error('Failed to add YouTube:', error);
      alert('Failed to add YouTube: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Upload */}
        <label className="border-2 border-dashed border-[#0f5a56]/20 rounded-2xl p-6 cursor-pointer hover:border-[#58ACA9] hover:bg-[#58ACA9]/5 transition text-center">
          <Upload className="w-8 h-8 mx-auto mb-2 text-[#58ACA9]" />
          <div className="text-sm font-semibold mb-1">Upload File</div>
          <div className="text-xs text-[#0f5a56]/60">PDF, DOCX, TXT</div>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        <div className="flex items-center justify-center">
          <button onClick={() => setShowAddSourcesDialog(true)} className="px-4 py-2 bg-[#58ACA9] text-white rounded-lg">Add Multiple Files</button>
        </div>

        {/* YouTube */}
        <div className="border-2 border-dashed border-[#0f5a56]/20 rounded-2xl p-6">
          <Youtube className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <div className="text-sm font-semibold mb-2">Add YouTube Video</div>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#0f5a56]/20 mb-2"
            disabled={uploading}
          />
          <button
            onClick={handleYouTubeAdd}
            disabled={uploading || !youtubeUrl.trim()}
            className="w-full px-4 py-2 bg-[#58ACA9] text-white rounded-lg text-sm font-semibold hover:bg-[#034242] transition disabled:opacity-50"
          >
            Add Video
          </button>
        </div>
      </div>

      <AddSourcesDialog open={showAddSourcesDialog} onOpenChange={(v) => { setShowAddSourcesDialog(v); if (!v) onUpdate(); }} notebookId={notebook.id} />

      {/* Sources List */}
      <div>
        <h3 className="font-semibold mb-3">Uploaded Resources ({notebook.sources?.length || 0})</h3>
        {notebook.sources && notebook.sources.length > 0 ? (
          <div className="space-y-2">
            {notebook.sources.map((source) => (
              <div
                key={source.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-[#0f5a56]/10 hover:bg-gray-50"
              >
                <div className="w-10 h-10 rounded-lg bg-[#58ACA9]/10 flex items-center justify-center">
                  {source.source_type === 'youtube' ? '📹' : '📄'}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{source.title}</div>
                  {source.summary && (
                    <div className="text-xs text-[#0f5a56]/60 line-clamp-1">{source.summary}</div>
                  )}
                </div>
                <div className="text-xs text-[#0f5a56]/40">
                  {new Date(source.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[#0f5a56]/60 text-sm">
            No resources uploaded yet
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Chat Tab - RAG Chat Interface
 */
function ChatTab({ notebookId }) {
  return (
    <div className="space-y-4">
      <div className="bg-[#58ACA9]/10 p-4 rounded-2xl text-center">
        <p className="text-sm text-[#0f5a56]/70">
          💬 Chat interface will be implemented here
        </p>
        <p className="text-xs text-[#0f5a56]/50 mt-2">
          Connect to <code>src/components/instructor/Chat.jsx</code>
        </p>
      </div>
    </div>
  );
}

/**
 * Podcast Tab
 */
function PodcastTab({ notebookId }) {
  return (
    <div className="space-y-4">
      <div className="bg-[#58ACA9]/10 p-4 rounded-2xl text-center">
        <p className="text-sm text-[#0f5a56]/70">
          🎙️ Podcast generation will be implemented here
        </p>
        <p className="text-xs text-[#0f5a56]/50 mt-2">
          Generate AI-powered audio overviews
        </p>
      </div>
    </div>
  );
}

/**
 * Notes Tab
 */
function NotesTab({ notebookId }) {
  return (
    <div className="space-y-4">
      <div className="bg-[#58ACA9]/10 p-4 rounded-2xl text-center">
        <p className="text-sm text-[#0f5a56]/70">
          📝 Notes interface will be implemented here
        </p>
        <p className="text-xs text-[#0f5a56]/50 mt-2">
          Create and manage notes for this week
        </p>
      </div>
    </div>
  );
}

/** Connection check UI component */
function ConnectionCheck() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);

  const runCheck = async () => {
    setChecking(true);
    setResult(null);
    try {
      const res = await checkSupabaseConnectivity();
      if (res.ok) {
        setResult({ ok: true, message: 'Supabase reachable and tables accessible.' });
      } else {
        setResult({ ok: false, message: res.error || 'Unknown connectivity error' });
      }
    } catch (e) {
      setResult({ ok: false, message: e?.message || String(e) });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={runCheck}
        disabled={checking}
        className="px-3 py-2 border rounded-full bg-white text-[#0f5a56] text-sm"
      >
        {checking ? 'Checking...' : 'Check Connection'}
      </button>
      {result && (
        <div className={`text-sm ${result.ok ? 'text-green-800' : 'text-red-700'}`}>
          {result.message}
        </div>
      )}
    </div>
  );
}
