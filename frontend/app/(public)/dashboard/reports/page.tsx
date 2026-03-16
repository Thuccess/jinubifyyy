'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { clientAPI } from '@/services/api';

interface Report {
  id: string;
  title: string;
  file_url: string;
  created_at: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      const data = await clientAPI.getReports();
      setReports(data.reports || []);
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
        <p className="text-sm text-text-secondary mt-1">
          Access SEO reports, marketing analytics, and performance summaries for your projects.
        </p>
      </div>

      <Card>
        {reports.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No reports are available yet. As campaigns go live, downloadable reports will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {reports.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">{r.title}</p>
                  <p className="text-xs text-text-muted">
                    Generated {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
                <a
                  href={r.file_url}
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

