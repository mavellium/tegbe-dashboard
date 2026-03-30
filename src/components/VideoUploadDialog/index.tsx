"use client";

import React, { useState, useRef } from 'react';
import { VideoIcon, Upload, Link, X, Loader2 } from 'lucide-react';

interface VideoUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
}

export default function VideoUploadDialog({ isOpen, onClose, onInsert }: VideoUploadDialogProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    const storageZone = process.env.NEXT_PUBLIC_BUNNY_STORAGE_ZONE;
    const accessKey = process.env.NEXT_PUBLIC_BUNNY_ACCESS_KEY;
    const pullZone = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE;
    const host = process.env.NEXT_PUBLIC_BUNNY_HOST;

    if (!storageZone || !accessKey || !pullZone) {
      setError("Configuração de CDN não encontrada (.env)");
      setIsUploading(false);
      return;
    }

    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
    const fileName = `${timestamp}-${cleanFileName}`;
    
    // Caminho na Storage
    const uploadUrl = `https://${host}/${storageZone}/uploads/${fileName}`;

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("AccessKey", accessKey);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 201 || xhr.status === 200) {
            // Sucesso! Retorna a URL pública
            const publicUrl = `https://${pullZone}/uploads/${fileName}`;
            onInsert(publicUrl);
            onClose();
            resolve();
          } else {
            reject(new Error(`Erro no upload: ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Erro de conexão"));
        };

        xhr.send(file);
      });
    } catch (err) {
      console.error(err);
      setError("Falha ao enviar vídeo. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validação se é vídeo
      if (!file.type.startsWith("video/")) {
        setError("Por favor, selecione um arquivo de vídeo válido.");
        return;
      }

      // Validação de tamanho
      const maxSizeMB = 1000; // 1GB
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Arquivo muito grande. Máximo permitido: ${maxSizeMB}MB`);
        return;
      }

      setError('');
      handleFileUpload(file);
    }
  };

  const handleUrlInsert = () => {
    if (videoUrl.trim()) {
      onInsert(videoUrl.trim());
      onClose();
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        setError("Por favor, selecione um arquivo de vídeo válido.");
        return;
      }
      setError('');
      handleFileUpload(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-100">Inserir Vídeo</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-800 p-1 rounded-lg mb-4">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'upload' 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Enviar
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'url' 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Link className="w-4 h-4" />
            Link
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-[var(--color-primary)]/50 transition-colors"
            >
              {isUploading ? (
                <div className="space-y-3">
                  <Loader2 className="w-8 h-8 text-[var(--color-primary)] mx-auto animate-spin" />
                  <div className="text-sm text-zinc-400">
                    Enviando... {uploadProgress}%
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div 
                      className="bg-[var(--color-primary)] h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <VideoIcon className="w-8 h-8 text-zinc-400 mx-auto" />
                  <div>
                    <p className="text-sm text-zinc-300 mb-1">
                      Arraste um vídeo aqui ou clique para selecionar
                    </p>
                    <p className="text-xs text-zinc-500">
                      MP4, WebM, OGG até 1GB
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* URL Tab */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
              autoFocus
            />
            <button
              onClick={handleUrlInsert}
              className="w-full px-4 py-3 bg-[var(--color-primary)] hover:opacity-90 text-white rounded-xl transition-colors font-medium"
            >
              Inserir Vídeo
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
