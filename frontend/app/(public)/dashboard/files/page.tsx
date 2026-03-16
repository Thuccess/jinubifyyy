'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { clientAPI } from '@/services/api';

interface FileItem {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const data = await clientAPI.getFiles();
      setFiles(data.files || []);
    };
    fetchFiles();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Files</h1>
        <p className="text-sm text-text-secondary mt-1">
          Access your project assets, documents, and shared files.
        </p>
      </div>

      <Card>
        {files.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No files have been shared with you yet. When Jinubify uploads designs, reports, or other assets, they’ll
            appear here.
          </p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {files.map((file) => (
              <li key={file.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">{file.name}</p>
                  <p className="text-xs text-text-muted">
                    Uploaded {new Date(file.created_at).toLocaleString()}
                  </p>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-brand-primary hover:text-text-primary"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

