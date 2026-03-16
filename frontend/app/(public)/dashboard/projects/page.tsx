'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { clientAPI } from '@/services/api';
import Card from '@/components/ui/Card';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await clientAPI.getProjects();
        setProjects(data.projects || []);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Projects</h1>
        <p className="text-sm text-text-secondary mt-1">
          Track the status of your Jinubify services and projects.
        </p>
      </div>

      {loading ? (
        <div className="h-32 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-border-subtle border-t-brand-primary animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-sm text-text-secondary">
            You don&apos;t have any active projects yet. Once you place an order, it will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="hover:border-brand-primary/60 cursor-pointer transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">{project.title}</h2>
                    <p className="mt-1 text-sm text-text-secondary line-clamp-3">
                      {project.description || 'No description yet.'}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-surface-muted text-text-secondary">
                    {project.status}
                  </span>
                </div>
                <p className="mt-3 text-xs text-text-muted">
                  Started {new Date(project.created_at).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

