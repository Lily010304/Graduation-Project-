import React, { useState } from 'react';
import * as insightsLM from '../../lib/insightsLM';

export default function StudioSidebar({ notebookId }) {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const handleGeneratePodcast = async () => {
    if (!notebookId) return;
    setLoading(true);
    try {
      const res = await insightsLM.generatePodcast(notebookId);
      // expect res to include audioUrl or similar
      const url = res?.audioUrl || (res && res[0]?.audio_url) || null;
      setAudioUrl(url);
      if (!url) console.warn('No audio URL returned from generatePodcast', res);
    } catch (e) {
      console.error('Failed to generate podcast', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full p-4">
      <h3 className="font-medium mb-4">Studio</h3>
      <div className="space-y-3">
        <button className="w-full px-3 py-2 bg-blue-600 text-white rounded" onClick={handleGeneratePodcast} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Podcast'}
        </button>

        {audioUrl && (
          <div className="mt-4">
            <audio src={audioUrl} controls className="w-full" />
            <div className="mt-2 text-sm text-gray-600">Podcast generated</div>
          </div>
        )}

        <div className="mt-6">
          <h4 className="font-medium">Notes</h4>
          <p className="text-xs text-gray-500">Save chat snippets as notes in the notebook studio.</p>
        </div>
      </div>
    </div>
  );
}
