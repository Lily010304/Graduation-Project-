import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function NotebookHeader({ notebookId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('Untitled Notebook');
  const [saving, setSaving] = useState(false);

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!notebookId) return setIsEditing(false);
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('notebooks')
        .update({ title })
        .eq('id', notebookId)
        .select()
        .single();

      if (error) throw error;
    } catch (e) {
      console.error('Failed to save title', e);
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };

  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          {isEditing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="text-lg font-medium"
              autoFocus
              disabled={saving}
            />
          ) : (
            <h1 className="text-lg font-medium cursor-pointer" onClick={handleTitleClick}>{title}</h1>
          )}
        </div>

        <div>
          <button className="px-3 py-1 border rounded" onClick={() => window.location.href = '/'}>Home</button>
        </div>
      </div>
    </header>
  );
}
