import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, LogOut } from 'lucide-react';
import { useNotebook } from '../../hooks/useNotebook';

export default function NotebookHeader({ notebookId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { notebook, updateNotebook, isUpdating } = useNotebook(notebookId);

  useEffect(() => {
    if (notebook?.title) {
      setEditedTitle(notebook.title);
    }
  }, [notebook?.title]);

  const handleTitleClick = () => {
    if (notebookId) {
      setIsEditing(true);
    }
  };

  const handleTitleSubmit = () => {
    if (notebookId && editedTitle.trim() && editedTitle !== notebook?.title) {
      updateNotebook({ title: editedTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setEditedTitle(notebook?.title || 'Untitled notebook');
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleTitleSubmit();
  };

  const handleIconClick = () => {
    window.location.hash = '#/dashboard/instructor/notebooks';
  };

  const handleLogout = () => {
    window.location.hash = '#/login';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleIconClick}
              className="hover:bg-gray-50 rounded transition-colors p-1"
            >
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">💡</span>
              </div>
            </button>
            {isEditing ? (
              <input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="text-lg font-medium text-gray-900 border-none shadow-none p-0 h-auto focus:outline-none min-w-[300px] w-auto"
                autoFocus
                disabled={isUpdating}
              />
            ) : (
              <span 
                className="text-lg font-medium text-gray-900 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                onClick={handleTitleClick}
              >
                {notebook?.title || 'Untitled notebook'}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors"
            >
              <User className="h-4 w-4 text-white" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
