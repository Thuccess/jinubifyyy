'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import { clientAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  project_id: string | null;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

interface Thread {
  projectId: string | null;
  messages: Message[];
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchMessages = async () => {
      const data = await clientAPI.getMessages();
      setMessages(data.messages || []);
    };
    fetchMessages();
  }, []);

  const threads = useMemo<Thread[]>(() => {
    const byProject = new Map<string | null, Message[]>();
    messages.forEach((m) => {
      const key = m.project_id || 'general';
      if (!byProject.has(key)) byProject.set(key, []);
      byProject.get(key)!.push(m);
    });
    return Array.from(byProject.entries()).map(([projectId, msgs]) => ({
      projectId: projectId === 'general' ? null : projectId,
      messages: msgs,
    }));
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      const res = await clientAPI.sendMessage({ message: input.trim() });
      const item = res.item as Message;
      setMessages((prev) => [...prev, item]);
      setInput('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Messages</h1>
        <p className="text-sm text-text-secondary mt-1">
          Communicate with the Jinubify team about your projects.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="py-4 px-4">
          {threads.length === 0 ? (
            <p className="text-sm text-text-secondary">
              You have no conversations yet. Send a message below to start a thread with the Jinubify team.
            </p>
          ) : (
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {threads.map((thread, idx) => (
                <div key={idx} className="space-y-2">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                    {thread.projectId ? `Project #${thread.projectId}` : 'General'}
                  </p>
                  <div className="space-y-2">
                    {thread.messages.map((m) => {
                      const fromClient = m.sender_id === currentUser?._id;
                      return (
                        <div
                          key={m.id}
                          className={`flex ${fromClient ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                              fromClient
                                ? 'bg-brand-primary text-text-inverted rounded-br-sm'
                                : 'bg-surface-muted text-text-primary rounded-bl-sm'
                            }`}
                          >
                            <p>{m.message}</p>
                            <p className="mt-1 text-[10px] opacity-80">
                              {new Date(m.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="py-4 px-4">
          <p className="text-sm font-semibold text-text-primary mb-2">New message</p>
          <form onSubmit={handleSend} className="space-y-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border-subtle bg-bg-primary px-3 py-2 text-sm"
              placeholder="Ask a question, share an update, or request support..."
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-text-inverted shadow-md disabled:opacity-60"
            >
              {sending ? 'Sending...' : 'Send message'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}

