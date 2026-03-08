import { useRef, useState } from 'react';
import { uploadAPI } from '../../services/api';
import { getImageUrl } from '../../utils/getImageUrl';

const labelBase = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';
const inputBase =
  'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-ring focus:border-transparent text-sm';

export interface ImageUrlWithUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  id?: string;
  /** Optional class for the wrapper div */
  className?: string;
  compact?: boolean;
}

export function ImageUrlWithUpload({
  value,
  onChange,
  label = 'Image URL',
  placeholder = 'https://… or upload a file below',
  id,
  className = '',
  compact = false,
}: ImageUrlWithUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const { url, image } = await uploadAPI.uploadImage(file);
      // Prefer the relative image path (e.g. /uploads/filename.jpg) for storage,
      // but fall back to absolute URL for older backends.
      onChange(image || url);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Upload failed';
      setUploadError(String(message));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className={className}>
      {label && !compact && (
        <label className={labelBase} htmlFor={id}>
          {label}
        </label>
      )}
      {value && !compact ? (
        <div className="mb-2 flex items-center gap-3">
          <img
            src={getImageUrl(value)}
            alt="Upload preview"
            className="h-14 w-14 rounded object-cover bg-[color:var(--surface-muted)] ring-1 ring-border-subtle"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1 max-w-[200px]">
            {value}
          </span>
        </div>
      ) : null}
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={compact ? `${inputBase} flex-1 min-w-0` : inputBase}
          placeholder={placeholder}
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
          aria-label="Upload image file"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 px-3 py-2 text-sm font-medium text-brand-primary bg-brand-soft hover:bg-surface-muted/90 rounded-lg transition-colors duration-300 ease-out disabled:opacity-60"
        >
          {uploading ? '…' : 'Upload'}
        </button>
      </div>
      {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
    </div>
  );
}
