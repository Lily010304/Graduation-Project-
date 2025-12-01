import { useState } from 'react';
import { 
  X, Link as LinkIcon, Youtube, FileText, Video, File, CheckSquare, HelpCircle,
  Book, MessageSquare, CheckCircle, Users, Folder, MessageCircle, Star,
  Clock, Globe, FileIcon, BookOpen, VideoIcon, Calendar
} from 'lucide-react';

const CONTENT_TYPES = [
  // Activities
  { 
    id: 'assignment', 
    label: 'Assignment', 
    icon: CheckSquare,
    color: 'bg-pink-500',
    category: 'activities',
    description: 'Create a graded assignment'
  },
  { 
    id: 'quiz', 
    label: 'Quiz', 
    icon: HelpCircle,
    color: 'bg-pink-500',
    category: 'activities',
    description: 'Create an interactive quiz'
  },
  { 
    id: 'choice', 
    label: 'Choice', 
    icon: CheckCircle,
    color: 'bg-green-600',
    category: 'activities',
    description: 'Ask a question with multiple choice'
  },
  { 
    id: 'forum', 
    label: 'Forum', 
    icon: MessageCircle,
    color: 'bg-blue-500',
    category: 'activities',
    description: 'Discussion board for students'
  },
  { 
    id: 'workshop', 
    label: 'Workshop', 
    icon: Users,
    color: 'bg-pink-500',
    category: 'activities',
    description: 'Peer assessment activity'
  },
  { 
    id: 'feedback', 
    label: 'Feedback', 
    icon: Star,
    color: 'bg-green-500',
    category: 'activities',
    description: 'Create custom surveys'
  },
  { 
    id: 'lesson', 
    label: 'Lesson', 
    icon: BookOpen,
    color: 'bg-gray-600',
    category: 'activities',
    description: 'Interactive lesson with conditional paths'
  },
  { 
    id: 'zoom', 
    label: 'Zoom Meeting', 
    icon: VideoIcon,
    color: 'bg-blue-600',
    category: 'activities',
    description: 'Schedule a live Zoom meeting'
  },
  
  // Resources
  { 
    id: 'file', 
    label: 'File', 
    icon: File,
    color: 'bg-gray-600',
    category: 'resources',
    description: 'Upload PDF, DOCX, or other files'
  },
  { 
    id: 'folder', 
    label: 'Folder', 
    icon: Folder,
    color: 'bg-gray-600',
    category: 'resources',
    description: 'Organize multiple files in a folder'
  },
  { 
    id: 'page', 
    label: 'Page', 
    icon: FileText,
    color: 'bg-gray-600',
    category: 'resources',
    description: 'Create a web page with rich content'
  },
  { 
    id: 'book', 
    label: 'Book', 
    icon: Book,
    color: 'bg-blue-500',
    category: 'resources',
    description: 'Multi-page book-like resource'
  },
  { 
    id: 'url', 
    label: 'URL', 
    icon: LinkIcon,
    color: 'bg-blue-500',
    category: 'resources',
    description: 'Link to external website'
  },
  { 
    id: 'youtube', 
    label: 'YouTube', 
    icon: Youtube,
    color: 'bg-red-500',
    category: 'resources',
    description: 'Embed a YouTube video'
  },
  { 
    id: 'lecture', 
    label: 'Lecture', 
    icon: Video,
    color: 'bg-purple-500',
    category: 'resources',
    description: 'Video lecture with duration'
  },
  { 
    id: 'text', 
    label: 'Text', 
    icon: FileText,
    color: 'bg-gray-500',
    category: 'resources',
    description: 'Simple text content'
  },
];

export default function AddContentDialog({ open, onClose, onSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  if (!open) return null;

  const filteredTypes = CONTENT_TYPES.filter(type => {
    const matchesSearch = type.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         type.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || type.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleSelect = (typeId) => {
    onSelect(typeId);
    setSearchQuery('');
    setActiveTab('all');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#0f5a56]">Add an activity or resource</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#58ACA9]"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all' ? 'border-[#58ACA9] text-[#58ACA9]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'activities' ? 'border-[#58ACA9] text-[#58ACA9]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Activities
          </button>
          <button 
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'resources' ? 'border-[#58ACA9] text-[#58ACA9]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Resources
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => handleSelect(type.id)}
                  className="flex flex-col items-center p-4 rounded-xl border-2 border-gray-200 hover:border-[#58ACA9] hover:shadow-md transition-all group"
                >
                  <div className={`w-16 h-16 ${type.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-[#0f5a56] text-center mb-1">
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {type.description}
                  </div>
                </button>
              );
            })}
          </div>
          
          {filteredTypes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No matching content types found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
