'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const CHART_COLORS = ['var(--brand-primary)', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export interface AnalyticsData {
  traffic: { date: string; count: number }[];
  leads: { date: string; count: number }[];
  conversions: { date: string; count: number }[];
  topServices: { name: string; count: number }[];
  topBlogPosts: { title: string; slug: string; views: number; date?: string }[];
}

interface AdminAnalyticsChartsProps {
  data: AnalyticsData;
}

const AdminAnalyticsCharts: React.FC<AdminAnalyticsChartsProps> = ({ data }) => {
  const trafficData = data.traffic.map((t) => ({ ...t, label: t.date }));
  const leadsData = data.leads.map((l) => ({ ...l, label: l.date }));
  const conversionsData = data.conversions.map((c) => ({ ...c, label: c.date }));
  const pieData = data.topServices.map((s, i) => ({ name: s.name || 'Other', value: s.count, color: CHART_COLORS[i % CHART_COLORS.length] }));

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border-card bg-[color:var(--surface-card)] p-4 sm:p-6 shadow-card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Traffic (activity events)</h3>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trafficData.length ? trafficData : [{ date: '-', count: 0, label: '-' }]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--card-edge)', borderRadius: 8, boxShadow: 'var(--card-shadow)' }} />
              <Legend />
              <Line type="monotone" dataKey="count" name="Events" stroke="var(--brand-primary)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-border-card bg-[color:var(--surface-card)] p-4 sm:p-6 shadow-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Leads (contacts)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsData.length ? leadsData : [{ date: '-', count: 0, label: '-' }]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--card-edge)', borderRadius: 8, boxShadow: 'var(--card-shadow)' }} />
                <Bar dataKey="count" name="Leads" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border-card bg-[color:var(--surface-card)] p-4 sm:p-6 shadow-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Conversions (orders)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionsData.length ? conversionsData : [{ date: '-', count: 0, label: '-' }]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--card-edge)', borderRadius: 8, boxShadow: 'var(--card-shadow)' }} />
                <Bar dataKey="count" name="Orders" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-border-card bg-[color:var(--surface-card)] p-4 sm:p-6 shadow-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Service popularity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.length ? pieData : [{ name: 'No data', value: 1, color: 'var(--border-subtle)' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(pieData.length ? pieData : [{ name: 'No data', value: 1, color: 'var(--border-subtle)' }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--card-edge)', borderRadius: 8, boxShadow: 'var(--card-shadow)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border-card bg-[color:var(--surface-card)] p-4 sm:p-6 shadow-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Top blog posts (by views)</h3>
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {data.topBlogPosts.length === 0 ? (
              <li className="text-sm text-text-muted">No published posts yet.</li>
            ) : (
              data.topBlogPosts.map((p, i) => (
                <li key={p.slug} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-text-primary truncate" title={p.title}>
                    {i + 1}. {p.title}
                  </span>
                  <span className="text-text-muted shrink-0">{p.views} views</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsCharts;
