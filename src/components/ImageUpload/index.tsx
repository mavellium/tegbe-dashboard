/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Upload, X, ZoomIn, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";

interface ImageUploadProps {
  label: string;
  currentImage: string; // URL da imagem atual
  onChange: (url: string) => void; // Callback devolvendo a URL (string)
  aspectRatio?: string;
  previewWidth?: number;
  previewHeight?: number;
  description?: string;
  showRemoveButton?: boolean;
  maxSizeMB?: number;
}

export const ImageUpload = ({ 
  label, 
  currentImage, 
  onChange, 
  aspectRatio = "aspect-video",
  previewWidth = 300,
  previewHeight = 200,
  description,
  showRemoveButton = false,
  maxSizeMB = 5 // Limite padrão de 5MB para imagens
}: ImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasLoadError, setHasLoadError] = useState(false);
  
  // Estados de Upload (Identicos ao VideoUpload)
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Sincroniza preview com a URL que vem do pai (apenas se não estiver fazendo upload local)
  useEffect(() => {
    if (!isUploading) {
      setPreviewUrl(currentImage || "");
      setHasLoadError(false);
    }
  }, [currentImage, isUploading]);

  // Limpeza de memória de blobs antigos
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Função de Upload para BunnyCDN (Mesma lógica do VideoUpload)
  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError("");

    const storageZone = process.env.NEXT_PUBLIC_BUNNY_STORAGE_ZONE;
    const accessKey = process.env.NEXT_PUBLIC_BUNNY_ACCESS_KEY;
    const pullZone = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE;
    const host = process.env.NEXT_PUBLIC_BUNNY_HOST || "storage.bunnycdn.com";

    if (!storageZone || !accessKey || !pullZone) {
      setError("Configuração de CDN não encontrada (.env)");
      setIsUploading(false);
      return;
    }

    // Gerar nome único: timestamp-nomelimpo.extensao
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
    const fileName = `${timestamp}-${cleanFileName}`;
    
    // Caminho na Storage (pode ajustar a pasta 'uploads' se desejar)
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
            onChange(publicUrl); 
            resolve();
          } else {
            reject(new Error(`Erro no upload: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Erro de rede"));
        xhr.send(file);
      });
    } catch (err) {
      console.error(err);
      setError("Falha ao enviar imagem. Tente novamente.");
      // Se falhar, volta a mostrar a imagem antiga se existir
      setPreviewUrl(currentImage || "");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de Tamanho
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
      return;
    }

    setHasLoadError(false);
    setError("");

    // 1. Cria URL temporária para mostrar a imagem IMEDIATAMENTE (UX)
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // 2. Inicia o upload
    handleUpload(file);
  };

  const handleRemove = () => {
    onChange("");
    setPreviewUrl("");
    setHasLoadError(false);
  };

  const handleImageClick = () => {
    if (previewUrl && !hasLoadError && !isUploading) {
      setShowFullscreen(true);
    }
  };

  // Determina se deve renderizar a imagem ou o placeholder
  const shouldShowImage = !!previewUrl && !hasLoadError;

  return (
    <>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-zinc-300">
          {label}
        </label>
        
        {description && (
          <p className="text-sm text-zinc-400 mb-2">
            {description}
          </p>
        )}

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center justify-center">
          {shouldShowImage ? (
            <div className="relative group w-full flex flex-col justify-center items-center">
              <div 
                className={`relative flex ${aspectRatio} rounded-lg overflow-hidden border border-zinc-600 bg-zinc-900 ${!isUploading ? 'cursor-pointer' : ''}`}
                style={{ 
                  width: previewWidth ? `${previewWidth}px` : '100%',
                  maxWidth: '100%',
                  height: previewHeight ? `${previewHeight}px` : 'auto'
                }}
                onClick={handleImageClick}
              >
                {/* Overlay de Upload (Barra de Progresso) */}
                {isUploading && (
                  <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center transition-all duration-300">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                    <span className="text-white font-medium drop-shadow-md">{uploadProgress}%</span>
                    <div className="w-1/2 h-1 bg-zinc-700/50 rounded-full mt-2 overflow-hidden backdrop-blur-sm">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setHasLoadError(true)}
                />

                {/* Ícone de Zoom (apenas se não estiver carregando) */}
                {!isUploading && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-zinc-800/90 p-2 rounded-full">
                      <ZoomIn className="w-5 h-5 text-zinc-300" />
                    </div>
                  </div>
                )}
              </div>
              
              {!isUploading && (
                <p className="text-xs text-zinc-400 mt-1 text-center">
                  Clique na imagem para visualizar em tela cheia
                </p>
              )}
            </div>
          ) : (
            // Placeholder (Estado Vazio)
            <div 
              className={`${aspectRatio} flex items-center justify-center bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-600`}
              style={{ 
                width: previewWidth ? `${previewWidth}px` : '100%',
                maxWidth: '100%',
                height: previewHeight ? `${previewHeight}px` : 'auto'
              }}
            >
              <div className="flex flex-col items-center justify-center text-zinc-400">
                {isUploading ? (
                   <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                ) : (
                   <ImageIcon className="w-12 h-12 mb-2" />
                )}
                
                {previewUrl && hasLoadError && !isUploading && (
                  <span className="text-xs text-red-400 font-medium">Erro ao carregar imagem</span>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            {!isUploading && (
              <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {shouldShowImage ? "Substituir Imagem" : "Selecionar Imagem"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            )}
            
            {(showRemoveButton || shouldShowImage) && !isUploading && (
              <Button
                type="button"
                variant="danger"
                onClick={handleRemove}
                className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Remover
              </Button>
            )}
          </div>
          
          <div className="mt-3 text-center w-full">
            <p className="text-sm text-zinc-400">
              Formatos: JPG, PNG, WebP • Máx: {maxSizeMB}MB
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFullscreen && shouldShowImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-6xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                type="button"
                onClick={() => setShowFullscreen(false)}
                className="absolute -top-4 -right-4 !p-3 !rounded-full bg-red-500 hover:bg-red-600 z-10"
              >
                <X className="w-5 h-5" />
              </Button>
              
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Preview expandido"
                  className="max-w-full max-h-[90vh] object-contain rounded-2xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};