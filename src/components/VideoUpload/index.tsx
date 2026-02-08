/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import { VideoIcon, Upload, X, Play, Pause, Volume2, VolumeX, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { motion, AnimatePresence } from "framer-motion";

interface VideoUploadProps {
  label: string;
  currentVideo: string;
  onChange: (url: string) => void;
  aspectRatio?: string;
  previewWidth?: number;
  previewHeight?: number;
  description?: string;
  accept?: string;
  maxSizeMB?: number;
}

export const VideoUpload = ({ 
  label, 
  currentVideo, 
  onChange, 
  aspectRatio = "aspect-video",
  previewWidth = 400,
  previewHeight = 225,
  description,
  accept = "video/mp4,video/webm,video/ogg",
  maxSizeMB = 1000
}: VideoUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>("");
  
  // Player states
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Sincroniza preview com a URL que vem do pai (apenas se não estiver fazendo upload local no momento)
  useEffect(() => {
    if (!isUploading) {
      setPreviewUrl(currentVideo || "");
    }
  }, [currentVideo, isUploading]);

  // Limpeza de memória de blobs antigos
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
    const fileName = `${timestamp}-${cleanFileName}`;
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
            const publicUrl = `https://${pullZone}/uploads/${fileName}`;
            onChange(publicUrl); // Atualiza o pai com a URL da CDN
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
      setError("Falha ao enviar vídeo. Tente novamente.");
      // Se falhar, volta a mostrar o vídeo antigo se existir
      setPreviewUrl(currentVideo || "");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
      return;
    }

    // 1. Cria URL temporária para mostrar o vídeo IMEDIATAMENTE ao fundo
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // 2. Inicia o upload
    handleUpload(file);
  };

  const handleRemove = () => {
    onChange(""); 
    setPreviewUrl("");
  };

  // Funções de Player
  const handleVideoClick = () => { if (previewUrl && !isUploading) setShowFullscreen(true); };
  const handleFullscreenClose = () => { setShowFullscreen(false); setIsPlaying(false); if(videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }};
  const togglePlay = () => { if (videoRef.current) { isPlaying ? videoRef.current.pause() : videoRef.current.play(); setIsPlaying(!isPlaying); }};
  const toggleMute = () => { if (videoRef.current) { videoRef.current.muted = !isMuted; setIsMuted(!isMuted); }};
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => { const v = parseFloat(e.target.value); setVolume(v); if(videoRef.current) { videoRef.current.volume = v; setIsMuted(v===0); }};
  const handleTimeUpdate = () => { if (videoRef.current) { setCurrentTime(videoRef.current.currentTime); if(videoRef.current.ended) setIsPlaying(false); }};
  const handleLoadedMetadata = () => { if (videoRef.current) setDuration(videoRef.current.duration); };
  const formatTime = (seconds: number) => { const m = Math.floor(seconds / 60); const s = Math.floor(seconds % 60); return `${m}:${s.toString().padStart(2, '0')}`; };
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current && duration > 0) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
      setCurrentTime(pos * duration);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-zinc-300">{label}</label>
        {description && <p className="text-sm text-zinc-400 mb-2">{description}</p>}
        {error && <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg"><p className="text-sm text-red-400">{error}</p></div>}

        <div className="flex flex-col items-start w-full">
          {previewUrl ? (
            <div className="relative group w-full">
              <div 
                className={`relative ${aspectRatio} rounded-lg overflow-hidden border border-zinc-600 bg-black ${!isUploading ? 'cursor-pointer' : ''}`}
                style={{ width: previewWidth ? `${previewWidth}px` : '100%', maxWidth: '100%', height: previewHeight ? `${previewHeight}px` : 'auto' }}
                onClick={handleVideoClick}
              >
                {/* Overlay de Upload com Transparência para ver o vídeo ao fundo */}
                {isUploading && (
                  <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center transition-all duration-300">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
                    <span className="text-white font-medium drop-shadow-md">{uploadProgress}%</span>
                    <div className="w-1/2 h-1 bg-zinc-700/50 rounded-full mt-2 overflow-hidden backdrop-blur-sm">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-300 mt-2 drop-shadow-md">Enviando vídeo...</p>
                  </div>
                )}

                <video 
                  ref={videoRef} 
                  src={previewUrl} 
                  className="w-full h-full object-contain" 
                  onTimeUpdate={handleTimeUpdate} 
                  onLoadedMetadata={handleLoadedMetadata} 
                  playsInline 
                  preload="metadata"
                  muted // Muta o preview automático durante upload para não atrapalhar
                />
                
                {/* Controles só aparecem se NÃO estiver fazendo upload */}
                {!isUploading && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                         <div className="flex items-center justify-between">
                            <button onClick={(e)=>{e.stopPropagation();togglePlay()}} className="p-2 bg-white/20 rounded-full hover:bg-white/30">{isPlaying?<Pause className="w-4 h-4 text-white"/>:<Play className="w-4 h-4 text-white"/>}</button>
                            <div className="flex items-center gap-2 flex-1 mx-4">
                                <span className="text-xs text-white">{formatTime(currentTime)}</span>
                                <div ref={progressRef} onClick={(e)=>{e.stopPropagation();handleProgressClick(e)}} className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden cursor-pointer"><div className="h-full bg-blue-500" style={{width:`${(currentTime/duration)*100}%`}}/></div>
                                <span className="text-xs text-white">{formatTime(duration)}</span>
                            </div>
                            <button onClick={(e)=>{e.stopPropagation();toggleMute()}} className="p-2 bg-white/20 rounded-full hover:bg-white/30">{isMuted?<VolumeX className="w-4 h-4 text-white"/>:<Volume2 className="w-4 h-4 text-white"/>}</button>
                         </div>
                    </div>
                )}
                
                {!isUploading && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                    <div className="bg-zinc-800/90 p-3 rounded-full"><Play className="w-6 h-6 text-zinc-300" /></div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`${aspectRatio} flex items-center justify-center bg-zinc-900 rounded-lg border-2 border-dashed border-zinc-700`}
                style={{ width: previewWidth ? `${previewWidth}px` : '100%', maxWidth: '100%', height: previewHeight ? `${previewHeight}px` : 'auto' }}>
                <VideoIcon className="w-12 h-12 text-zinc-600" />
            </div>
          )}

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
             {!isUploading && (
                <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {previewUrl ? "Substituir Vídeo" : "Selecionar Vídeo"}
                    <input type="file" accept={accept} className="hidden" onChange={handleFileSelect} />
                </label>
             )}
             
             {previewUrl && !isUploading && (
                <Button type="button" variant="danger" onClick={handleRemove} className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/50 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Remover
                </Button>
             )}
          </div>

          <div className="mt-3 text-center w-full"><p className="text-sm text-zinc-400">Formatos: MP4, WebM • Máx: {maxSizeMB}MB</p></div>
        </div>
      </div>
      
      <AnimatePresence>
        {showFullscreen && previewUrl && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4" onClick={handleFullscreenClose}>
             <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.8,opacity:0}} className="relative max-w-6xl max-h-full w-full" onClick={(e)=>e.stopPropagation()}>
                <Button type="button" onClick={handleFullscreenClose} className="absolute -top-4 -right-4 !p-3 !rounded-full bg-red-500 hover:bg-red-600 z-10"><X className="w-5 h-5"/></Button>
                <div className="relative w-full h-full"><video ref={videoRef} src={previewUrl} className="w-full max-h-[80vh] rounded-2xl" controls autoPlay /></div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};