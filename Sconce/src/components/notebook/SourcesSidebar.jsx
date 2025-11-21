import React from 'react';
import { useSources } from '../../hooks/useSources';
import { useFileUpload } from '../../hooks/useFileUpload';

export default function SourcesSidebar({ notebookId }) {
  const { sources, isLoading } = useSources(notebookId);
  const { getFileUrl } = useFileUpload();

  return (
    <div className="h-full overflow-auto p-4">
      <h3 className="font-medium mb-4">Sources</h3>
      {isLoading && <div>Loading...</div>}
      {!isLoading && (!sources || sources.length === 0) && <div className="text-sm text-gray-500">No sources yet</div>}
      <ul className="space-y-3">
        {sources?.map(src => (
          <li key={src.id} className="p-3 border rounded">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{src.title || src.file_path || src.source_type}</div>
                <div className="text-xs text-gray-500">{src.source_type} • {new Date(src.created_at).toLocaleString()}</div>
              </div>
              <div>
                {src.file_path && <a className="text-sm text-blue-600" href={getFileUrl(src.file_path)} target="_blank" rel="noreferrer">Open</a>}
              </div>
            </div>

            {src.summary && <div className="mt-2 text-sm text-gray-700">{src.summary}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
