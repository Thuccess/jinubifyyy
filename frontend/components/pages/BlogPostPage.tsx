import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogsPublicAPI } from '../../services/api';
import AnimatedSection from '../AnimatedSection';
import Comments from '../Comments';
import type { BlogPost } from '../../types/blog';
import { Theme } from '../../App';

interface BlogPostPageProps {
  theme: Theme;
}

const shareUrl = (slug: string) =>
  typeof window !== 'undefined' ? `${window.location.origin}/blog/${slug}` : '';

const ShareButtons: React.FC<{ slug: string; title: string; excerpt: string }> = ({ slug, title, excerpt }) => {
  const url = shareUrl(slug);
  const text = encodeURIComponent(`${title} – ${(excerpt || '').slice(0, 100)}`);
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-text-muted mr-1">Share:</span>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm px-3 py-1.5 rounded-md border border-border-subtle bg-surface-card text-text-secondary hover:bg-[color:var(--surface-elevated)]"
      >
        X (Twitter)
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm px-3 py-1.5 rounded-md border border-border-subtle bg-surface-card text-text-secondary hover:bg-[color:var(--surface-elevated)]"
      >
        LinkedIn
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="text-sm px-3 py-1.5 rounded-md border border-border-subtle bg-surface-card text-text-secondary hover:bg-[color:var(--surface-elevated)]"
      >
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  );
};

const BlogPostPage: React.FC<BlogPostPageProps> = ({ theme }) => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const response = await blogsPublicAPI.getBySlug(slug);
        setPost(response.post);
        setError('');
      } catch (err: unknown) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post. Please try again later.');
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    const title = post.seo?.title || post.title;
    const desc = post.seo?.description || post.excerpt;
    document.title = `${title} | Blog | Jinubify`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && desc) metaDesc.setAttribute('content', desc.slice(0, 160));
    return () => {
      document.title = 'Jinubify';
    };
  }, [post]);

  if (loading) {
    return (
      <div className="text-center py-20 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mx-auto" />
        <p className="mt-4 text-text-muted">Loading article...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-20 min-h-screen">
        <h1 className="text-2xl font-bold text-text-primary">Post not found</h1>
        <p className="mt-2 text-text-secondary">
          {error || "Sorry, we couldn't find the article you're looking for."}
        </p>
        <Link
          to="/blog"
          className="mt-6 inline-block text-sm font-semibold text-text-inverted bg-brand-primary hover:opacity-90 px-5 py-2.5 rounded-md"
        >
          Back to Blog
        </Link>
      </div>
    );
  }

  const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const imageUrl = post.imageUrl || post.coverImage || '';
  const lazyLoadedContent = (post.content || '').replace(/<img /g, '<img loading="lazy" ');

  return (
    <div className="animate-fade-in blog-post-page" data-page="blog-post">
      <div className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="mb-8">
              <Link
                to="/blog"
                className="font-medium text-brand-primary hover:underline rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]"
              >
                &larr; Back to all articles
              </Link>
            </div>
            <header>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{post.category}</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl max-w-3xl">
                {post.title}
              </h1>
              <p className="mt-5 text-sm text-text-muted">
                By {post.author} · {formatDate(post.date)}
                {typeof post.views === 'number' && post.views > 0 && (
                  <span> · {post.views} view{post.views !== 1 ? 's' : ''}</span>
                )}
              </p>
            </header>

            {imageUrl && (
              <div className="mt-8">
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full rounded-lg border border-border-subtle aspect-video object-cover"
                />
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ShareButtons slug={post.slug} title={post.title} excerpt={post.excerpt} />
            </div>

            <article
              className="prose prose-lg lg:prose-xl dark:prose-invert max-w-none mt-12 text-text-secondary prose-headings:font-extrabold prose-headings:text-text-primary prose-a:text-brand-primary"
              dangerouslySetInnerHTML={{ __html: lazyLoadedContent }}
            />

            <div className="mt-16 border-t border-border-subtle pt-12">
              <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Join the Conversation
              </h2>
              <p className="mt-2 text-text-secondary">
                Comments are powered by{' '}
                <a
                  href="https://utteranc.es/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:underline"
                >
                  Utterances
                </a>
                , which uses GitHub issues for commenting.
              </p>
              <div className="mt-6">
                <Comments theme={theme} />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
