 'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SmartImage from '@/components/media/SmartImage';
import AnimatedSection from '../AnimatedSection';
import { blogsPublicAPI } from '../../services/api';
import { SearchIcon } from '../icons/Icons';
import type { BlogPost } from '../../types/blog';
import { normalizeImageUrl } from '../../utils/image';
import { SkeletonCard } from '../ui/skeleton';

const PAGE_SIZE = 12;

const PageHeader: React.FC = () => (
  <header className="py-16 sm:py-20 lg:py-24" aria-labelledby="blog-hero-title">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Blog</p>
      <h1 id="blog-hero-title" className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-2xl">
        From Our Blog
      </h1>
      <p className="mt-5 text-base text-text-secondary leading-relaxed max-w-xl sm:text-lg">
        Stay updated with the latest insights, tips, and news from the Jinubify team.
      </p>
    </div>
  </header>
);

const BlogPostCard: React.FC<{ post: BlogPost; formatDate: (date: string | Date) => string }> = ({ post, formatDate }) => (
  <Link
    href={`/blog/${post.slug}`}
    className="group flex flex-col rounded-lg border border-border-subtle bg-[color:var(--surface-card)] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)] focus-visible:ring-offset-2"
  >
    <div className="relative w-full overflow-hidden bg-transparent">
      <SmartImage
        src={normalizeImageUrl(post.imageUrl || post.coverImage || '')}
        alt={post.title}
        aspect="16/9"
        rounded="none"
        sizesPreset="gridThree"
      />
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted">{formatDate(post.date)}</span>
        <span className="font-medium px-2 py-1 rounded bg-brand-soft text-brand-primary">{post.category}</span>
      </div>
      <h3 className="mt-3 text-base font-bold text-text-primary sm:text-lg">{post.title}</h3>
      <p className="mt-2 text-text-secondary flex-grow text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
      <p className="mt-3 text-xs text-text-muted">by {post.author}</p>
      <span className="mt-3 font-medium text-brand-primary text-sm">Read Article →</span>
    </div>
  </Link>
);

const CardSkeleton: React.FC = () => (
  <SkeletonCard />
);

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featured, setFeatured] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });

  const formatDate = useCallback((date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }, []);

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        const params: { page: number; limit: number; search?: string } = { page, limit: PAGE_SIZE };
        if (searchQuery.trim()) params.search = searchQuery.trim();
        const response = await blogsPublicAPI.getList(params);
        setPosts(response.posts || []);
        setPagination(response.pagination || { page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });
        setError('');
      } catch (err: unknown) {
        console.error('Error fetching blog posts:', err);
        setPosts([]);
        setError('Unable to load articles. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [page, searchQuery]);

  useEffect(() => {
    if (searchQuery.trim()) return;
    const fetchFeatured = async () => {
      try {
        const res = await blogsPublicAPI.getFeatured();
        setFeatured(res.posts || []);
      } catch {
        setFeatured([]);
      }
    };
    fetchFeatured();
  }, [searchQuery]);

  const showFeatured = !loading && !error && featured.length > 0 && !searchQuery.trim() && page === 1;

  return (
    <div className="animate-fade-in blog-page" data-page="blog">
      <PageHeader />

      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-text-muted" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder="Search articles by title, keyword, or category..."
                className="block w-full pl-12 pr-4 py-3 border border-border-subtle rounded-lg shadow-md focus:ring-2 focus:ring-brand-ring focus:border-brand-primary bg-surface-card transition-all text-text-primary hover:border-brand-primary"
                aria-label="Search blog posts"
              />
            </div>
          </div>

          <AnimatedSection>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-text-primary">Error Loading Articles</h2>
                <p className="mt-2 text-text-secondary">{error}</p>
              </div>
            ) : (
              <>
                {showFeatured && (
                  <div className="mb-12">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Featured</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featured.slice(0, 3).map((post) => (
                        <BlogPostCard key={post.slug || post._id} post={post} formatDate={formatDate} />
                      ))}
                    </div>
                  </div>
                )}
                {posts.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {posts.map((post) => (
                        <BlogPostCard key={post.slug || post._id} post={post} formatDate={formatDate} />
                      ))}
                    </div>
                    {pagination.pages > 1 && (
                      <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          disabled={page <= 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className="btn-primary"
                        >
                          Previous
                        </button>
                        <span className="px-4 py-2 text-text-secondary text-sm">
                          Page {page} of {pagination.pages}
                        </span>
                        <button
                          type="button"
                          disabled={page >= pagination.pages}
                          onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                          className="btn-primary"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <h2 className="text-2xl font-bold text-text-primary">No Articles Found</h2>
                    <p className="mt-2 text-text-secondary">
                      {searchQuery.trim() ? 'Try adjusting your search.' : 'No posts have been published yet.'}
                    </p>
                  </div>
                )}
              </>
            )}
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
