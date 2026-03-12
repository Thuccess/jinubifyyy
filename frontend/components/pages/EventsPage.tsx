'use client';

import React from 'react';
import Link from 'next/link';
import { useEvents } from '../../hooks/useEvents';
import { resolveImageUrl } from '../../utils/image';

const EventsPage: React.FC = () => {
  const { data, isLoading, isError } = useEvents({ page: 1, limit: 50 });
  const events = (data?.data || []) as any[];

  return (
    <section className="py-8 sm:py-14 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Upcoming & Recent Events
          </h2>
          <p className="mt-2 text-sm sm:text-base text-text-secondary">
            Webinars, workshops, and training sessions from Jinubify on branding, digital marketing,
            websites, and technology for businesses across East Africa.
          </p>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="py-12 text-center text-text-secondary">
              Loading events...
            </div>
          ) : isError ? (
            <div className="py-12 text-center text-red-500">
              Failed to load events. Please try again later.
            </div>
          ) : events.length === 0 ? (
            <div className="py-12 text-center text-text-secondary">
              No events available yet. Check back soon for upcoming webinars and sessions.
            </div>
          ) : (
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event: any) => (
                <article
                  key={event._id}
                  className="group rounded-xl border border-border-subtle bg-surface-card/80 shadow-sm overflow-hidden flex flex-col hover:border-brand-soft hover:shadow-md transition-all duration-200"
                >
                  {event.imageUrl && (
                    <div className="relative h-40 w-full overflow-hidden">
                      <img
                        src={resolveImageUrl(event.imageUrl)}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <div className="text-xs text-text-muted">
                      {event.date ? new Date(event.date).toLocaleString() : 'Date TBA'}
                    </div>
                    <h3 className="mt-2 text-base sm:text-lg font-semibold text-text-primary group-hover:text-brand-primary transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="mt-2 text-sm text-text-secondary line-clamp-3">
                      {event.description}
                    </p>
                    {Array.isArray(event.tags) && event.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {event.tags.slice(0, 4).map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-medium text-text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4">
                      <Link
                        href={`/events/${encodeURIComponent(event.slug)}`}
                        className="inline-flex items-center text-sm font-semibold text-brand-primary hover:text-brand-strong"
                      >
                        View details
                        <span aria-hidden="true" className="ml-1">
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EventsPage;

