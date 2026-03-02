// src/components/admin/events/ImageUpload.tsx
'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  onImageRemove: () => void;
  preview: string | null;
}

export function ImageUpload({ onImageSelect, onImageRemove, preview }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  if (preview) {
    return (
      <div className="relative">
        <div className="aspect-video rounded-lg overflow-hidden bg-slate-100">
          <img
            src={preview}
            alt="Flyer preview"
            className="w-full h-full object-cover"
          />
        </div>
        <button
          type="button"
          onClick={onImageRemove}
          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors',
        'flex flex-col items-center justify-center gap-2 text-center',
        isDragActive 
          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
          : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
      )}
    >
      <input {...getInputProps()} />
      <div className="p-3 bg-slate-100 rounded-full">
        {isDragActive ? (
          <Upload className="w-6 h-6 text-emerald-600" />
        ) : (
          <ImageIcon className="w-6 h-6 text-slate-400" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700">
          {isDragActive ? 'Drop the image here' : 'Click to upload or drag and drop'}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          PNG, JPG, WebP up to 5MB
        </p>
      </div>
    </div>
  );
}