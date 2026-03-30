"use client";

import React, { useState } from 'react';
import VideoUploadDialog from '@/components/VideoUploadDialog';
import { VideoIcon, X } from 'lucide-react';

interface VideoUploadProps {
  label: string;
  currentVideo: string;
  onChange: (url: string) => void;
  aspectRatio?: string;
  previewWidth?: number;
  previewHeight?: number;
  description?: string;
}

export default function VideoUpload({ 
  label, 
  currentVideo, 
  onChange, 
  aspectRatio = "aspect-video",
  previewWidth = 400,
  previewHeight = 225,
  description
}: VideoUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRemove = () => {
    onChange("");
  };

  const handleInsert = (url: string) => {
    onChange(url);
  };

  return (
    <>
      <div className="space-y-4">
        {label && <label className="block text-sm font-medium text-zinc-300">{label}</label>}
        {description && <p className="text-sm text-zinc-400 mb-2">{description}</p>}

        <div className="flex flex-col items-start w-full">
          {currentVideo ? (
            <div className="relative group w-full">
              <div 
                className={`relative ${aspectRatio} rounded-lg overflow-hidden border border-zinc-600 bg-black`}
                style={{ 
                  width: previewWidth ? `${previewWidth}px` : '100%', 
                  maxWidth: '100%', 
                  height: previewHeight ? `${previewHeight}px` : 'auto' 
                }}
              >
                {currentVideo.includes('youtube.com') || currentVideo.includes('youtu.be') ? (
                  // YouTube embed
                  <iframe
                    src={currentVideo.includes('embed') ? currentVideo : `https://www.youtube.com/embed/${currentVideo.split('v=')[1]?.split('&')[0] || ''}`}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  // Video element para URLs diretas
                  <video
                    src={currentVideo}
                    className="w-full h-full object-contain"
                    controls
                    preload="metadata"
                  />
                )}
                
                {/* Overlay com botões */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsDialogOpen(true)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Substituir vídeo"
                    >
                      <VideoIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleRemove}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title="Remover vídeo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setIsDialogOpen(true)}
              className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-[var(--color-primary)]/50 transition-colors w-full"
            >
              <VideoIcon className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
              <div>
                <p className="text-sm text-zinc-300 mb-1">
                  Clique para adicionar um vídeo
                </p>
                <p className="text-xs text-zinc-500">
                  Upload ou link do YouTube
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <VideoUploadDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onInsert={handleInsert}
      />
    </>
  );
}
