'use client';

import React, { useRef, useState, DragEvent } from 'react';
import { uploadAPI } from '../../../services/api';
import { useNotification } from '../useNotification';
import { PlusIcon } from '../../icons/Icons';

interface MediaUploaderProps {
  onUploadComplete?: () => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({ onUploadComplete }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { showNotification, NotificationComponent } = useNotification();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const file = files[0];
      await uploadAPI.uploadImage(file);
      showNotification('Image uploaded successfully', 'success');
      if (onUploadComplete) onUploadComplete();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Upload failed';
      showNotification(message, 'error');
    } finally {
      setUploading(false);
      setIsDragging(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="space-y-2">
      <div
        className={`relative flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          isDragging
            ? 'border-brand-primary bg-brand-soft/40'
            : 'border-border-subtle hover:border-brand-primary/80 hover:bg-surface-muted/60'
        }`}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <PlusIcon className="h-7 w-7 text-brand-primary mb-2" />
        <p className="text-sm font-medium text-text-primary">
          {uploading ? 'Uploading…' : 'Click to upload or drag & drop'}
        </p>
        <p className="text-xs text-text-secondary mt-1">PNG, JPG, GIF, WEBP up to 5MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      <NotificationComponent />
    </div>
  );
};

export default MediaUploader;

