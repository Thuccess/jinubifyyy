'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import { clientAPI } from '@/services/api';

export default function RequestServicePage() {
  const [form, setForm] = useState({
    serviceType: '',
    projectDescription: '',
    budget: '',
    deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await clientAPI.submitServiceRequest({
        serviceType: form.serviceType,
        projectDescription: form.projectDescription,
        budget: form.budget ? Number(form.budget) : undefined,
        deadline: form.deadline || undefined,
      });
      setMessage('Your request has been sent. Our team will contact you shortly.');
      setForm({ serviceType: '', projectDescription: '', budget: '', deadline: '' });
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">New Service Request</h1>
        <p className="text-sm text-text-secondary mt-1">
          Tell us about the project you&apos;d like Jinubify to handle.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Service Type</label>
            <input
              name="serviceType"
              value={form.serviceType}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-border-subtle bg-bg-primary px-3 py-2 text-sm"
              placeholder="e.g. Website redesign, SEO, Social media campaign"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Project Description</label>
            <textarea
              name="projectDescription"
              value={form.projectDescription}
              onChange={handleChange}
              required
              rows={5}
              className="w-full rounded-lg border border-border-subtle bg-bg-primary px-3 py-2 text-sm"
              placeholder="Describe your goals, target audience, and any references or links..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Budget (optional)</label>
              <input
                name="budget"
                type="number"
                min={0}
                value={form.budget}
                onChange={handleChange}
                className="w-full rounded-lg border border-border-subtle bg-bg-primary px-3 py-2 text-sm"
                placeholder="e.g. 1500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Preferred Deadline</label>
              <input
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={handleChange}
                className="w-full rounded-lg border border-border-subtle bg-bg-primary px-3 py-2 text-sm"
              />
            </div>
          </div>

          {message && <p className="text-sm text-text-secondary">{message}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-text-inverted shadow-md hover:bg-[color-mix(in_oklab,var(--accent-primary)_0.9,var(--bg-primary))] disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </Card>
    </div>
  );
}

