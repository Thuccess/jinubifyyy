'use client';

import React, { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import { clientAPI } from '@/services/api';

interface ProjectDetail {
  project: {
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
  };
  updates: { description: string; createdAt: string }[];
  files: { id: string; name: string; url: string; created_at: string }[];
  messages: any[];
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await clientAPI.getProjectById(params.id);
        setData(res);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          notFound();
          return;
        }
        setError(err?.response?.data?.message || 'Failed to load project.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-border-subtle border-t-brand-primary animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-sm text-text-secondary">{error || 'Project not found.'}</p>;
  }

  const { project, updates, files } = data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{project.title}</h1>
          <p className="text-sm text-text-secondary mt-1">
            Started {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-surface-muted text-text-secondary">
          {project.status}
        </span>
      </div>

      {project.description && (
        <Card>
          <h2 className="text-sm font-semibold text-text-primary mb-1">Project Overview</h2>
          <p className="text-sm text-text-secondary whitespace-pre-line">{project.description}</p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-text-primary mb-2">Recent Updates</h2>
          {updates.length === 0 ? (
            <p className="text-sm text-text-secondary">No updates have been logged yet.</p>
          ) : (
            <ul className="space-y-2">
              {updates.map((u, idx) => (
                <li key={idx} className="text-sm text-text-secondary">
                  <span className="block text-text-primary">{u.description}</span>
                  <span className="text-[11px] text-text-muted">
                    {new Date(u.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-text-primary mb-2">Files</h2>
          {files.length === 0 ? (
            <p className="text-sm text-text-secondary">No files have been attached yet.</p>
          ) : (
            <ul className="space-y-2">
              {files.map((f) => (
                <li key={f.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-text-primary">{f.name}</p>
                    <p className="text-[11px] text-text-muted">
                      Uploaded {new Date(f.created_at).toLocaleString()}
                    </p>
                  </div>
                  <a
                    href={f.url}
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
    </div>
  );
}

