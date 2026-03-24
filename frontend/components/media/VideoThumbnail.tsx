'use client';

import clsx from 'clsx';
import { useState } from 'react';
import SmartImage, { type SmartImageProps } from './SmartImage';
import VideoModal from './VideoModal';

export type VideoThumbnailProps = Omit<
  SmartImageProps,
  'priority' | 'overlay'
> & {
  /** YouTube or direct video file URL — opens modal on play. */
  videoUrl: string;
  videoTitle?: string;
  priority?: boolean;
};

/**
 * Thumbnail + play control; full video loads only after click (muted autoplay in modal).
 */
export default function VideoThumbnail({
  videoUrl,
  videoTitle = 'Video',
  priority = false,
  aspect = '16/9',
  rounded = 'xl',
  className,
  ...imageRest
}: VideoThumbnailProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx(
          'group relative block w-full cursor-pointer bg-transparent text-left',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]',
          className,
        )}
        aria-label={`Play video: ${videoTitle}`}
      >
        <SmartImage
          {...imageRest}
          aspect={aspect}
          rounded={rounded}
          priority={priority}
        />
        <span className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-transparent">
          <span
            className={clsx(
              'flex h-14 w-14 min-h-[48px] min-w-[48px] items-center justify-center rounded-full border border-white/30 bg-black/45 text-white shadow-lg backdrop-blur-sm transition-transform duration-200',
              'group-hover:scale-105 group-hover:bg-black/55',
              'motion-reduce:transition-none motion-reduce:group-hover:scale-100',
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="ml-0.5 h-7 w-7"
              aria-hidden
            >
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </span>
        </span>
      </button>

      <VideoModal
        open={open}
        onClose={() => setOpen(false)}
        videoUrl={videoUrl}
        title={videoTitle}
      />
    </>
  );
}
