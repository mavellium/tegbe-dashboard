/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/Input";
import { Switch } from "@/components/Switch";
import { Button } from "@/components/Button";
import { ImageUpload } from "@/components/ImageUpload";
import IconSelector from "@/components/IconSelector";
import { Card } from "@/components/Card";
import { 
  Palette, Check, ChevronDown, ChevronUp, AlertTriangle, 
  CheckCircle2, Layers, X, Save, RefreshCw, Trash2, 
  Image as ImageIcon, Type as TypeIcon, AlignLeft, Smile, List, 
  PlayCircle, Link as LinkIcon, ArrowUp, ArrowDown, PlusCircle, Settings2,
  VideoIcon, Upload, Play, Pause, Volume2, VolumeX, Loader2,
  Code
} from "lucide-react";

// ==========================================
// 1. COMPONENTE VIDEO UPLOAD
// ==========================================
interface VideoUploadProps {
  label: string; currentVideo: string; onChange: (url: string) => void;
  aspectRatio?: string; previewWidth?: number; previewHeight?: number;
  description?: string; accept?: string; maxSizeMB?: number;
}

const VideoUpload = ({ 
  label, currentVideo, onChange, aspectRatio = "aspect-video",
  previewWidth = 400, previewHeight = 225, description,
  accept = "video/mp4,video/webm,video/ogg", maxSizeMB = 1000
}: VideoUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>("");
  
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isUploading) setPreviewUrl(currentVideo || "");
  }, [currentVideo, isUploading]);

  const handleUpload = async (file: File) => {
    setIsUploading(true); setUploadProgress(0); setError("");
    const storageZone = process.env.NEXT_PUBLIC_BUNNY_STORAGE_ZONE;
    const accessKey = process.env.NEXT_PUBLIC_BUNNY_ACCESS_KEY;
    const pullZone = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE;
    const host = process.env.NEXT_PUBLIC_BUNNY_HOST || "storage.bunnycdn.com";

    if (!storageZone || !accessKey || !pullZone) {
      setError("Configuração de CDN não encontrada.");
      setIsUploading(false); return;
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
          if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status === 201 || xhr.status === 200) {
            onChange(`https://${pullZone}/uploads/${fileName}`);
            resolve();
          } else reject(new Error(`Erro: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Erro de rede"));
        xhr.send(file);
      });
    } catch (err: any) {
      setError("Falha ao enviar vídeo.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`); return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    handleUpload(file);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="space-y-4">
        <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">{label}</label>
        {description && <p className="text-xs text-zinc-500 mb-2">{description}</p>}
        {error && <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg"><p className="text-sm text-red-400">{error}</p></div>}

        <div className="flex flex-col items-start w-full">
          {previewUrl ? (
            <div className="relative group w-full">
              <div className={`relative ${aspectRatio} rounded-lg overflow-hidden border border-[var(--color-border)] bg-black cursor-pointer`} 
                   style={{ width: previewWidth ? `${previewWidth}px` : '100%', height: previewHeight ? `${previewHeight}px` : 'auto' }} 
                   onClick={() => setShowFullscreen(true)}>
                {isUploading && (
                  <div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin mb-2" />
                    <span className="text-white font-medium">{uploadProgress}%</span>
                  </div>
                )}
                <video src={previewUrl} className="w-full h-full object-contain" muted />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className={`${aspectRatio} flex items-center justify-center bg-zinc-900 rounded-lg border-2 border-dashed border-zinc-800 w-full`}>
                <VideoIcon className="w-12 h-12 text-zinc-700" />
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <label className="cursor-pointer px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-semibold flex items-center gap-2">
              <Upload size={16} /> {previewUrl ? "Trocar Vídeo" : "Selecionar Vídeo"}
              <input type="file" accept={accept} className="hidden" onChange={handleFileSelect} />
            </label>
            {previewUrl && (
              <button type="button" onClick={() => { setPreviewUrl(""); onChange(""); }} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm font-semibold">Remover</button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFullscreen && (
          <div className="fixed inset-0 z-[999999] bg-black/90 flex items-center justify-center p-8" onClick={() => setShowFullscreen(false)}>
             <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
                <button className="absolute -top-12 right-0 text-white" onClick={() => setShowFullscreen(false)}><X /></button>
                <video src={previewUrl} controls autoPlay className="w-full h-auto rounded-xl" />
             </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// ==========================================
// 2. COMPONENTE COLOR PICKER
// ==========================================
const presetColors = ["#FFFFFF", "#000000", "#E61A4A", "#C9A050", "#1E40AF", "#10B981", "#F59E0B", "#3B82F6", "#8B5CF6", "#6366F1"];

function ColorPicker({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  const [show, setShow] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOut = (e: any) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setShow(false); };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  const safeColor = color?.startsWith("#") ? color : "#000000";

  return (
    <div className="relative w-full" ref={pickerRef}>
      <button type="button" onClick={() => setShow(!show)} className="h-10 px-3 w-full rounded-lg border border-[var(--color-border)] bg-zinc-950 flex items-center justify-between">
        <span className="text-xs font-mono text-zinc-400 uppercase">{safeColor}</span>
        <div className="w-5 h-5 rounded border border-white/10" style={{ backgroundColor: safeColor }} />
      </button>
      {show && (
        <div className="absolute z-50 top-full mt-2 p-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl space-y-3 w-48">
          <input type="color" value={safeColor} onChange={(e) => onChange(e.target.value)} className="w-full h-8 rounded cursor-pointer bg-transparent" />
          <div className="grid grid-cols-5 gap-1">
            {presetColors.map(c => (
              <button key={c} onClick={() => { onChange(c); setShow(false); }} className="w-6 h-6 rounded border border-white/5" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. RENDERIZADOR DINÂMICO
// ==========================================
function humanizeKey(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function DynamicFieldRenderer({ dataKey, value, path, onChange }: any) {
  const lKey = dataKey.toLowerCase();
  const label = humanizeKey(dataKey);

  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between p-3 bg-black/20 border border-zinc-800 rounded-lg">
        <label className="text-sm font-medium text-zinc-300">{label}</label>
        <Switch checked={value} onCheckedChange={(val) => onChange(path, val)} />
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div>
        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">{label}</label>
        <Input type="number" value={value} onChange={(e) => onChange(path, Number(e.target.value))} className="bg-zinc-950 border-zinc-800" />
      </div>
    );
  }

  if (typeof value === "string") {
    if (lKey.includes("color") || value.startsWith("#")) {
      return (
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">{label}</label>
          <ColorPicker color={value} onChange={(c) => onChange(path, c)} />
        </div>
      );
    }
    if (lKey.includes("video") || value.endsWith(".mp4")) {
      return (
        <div className="col-span-full">
          <VideoUpload label={label} currentVideo={value} onChange={(url) => onChange(path, url)} />
        </div>
      );
    }
    if (lKey.includes("image") || lKey.includes("logo") || value.startsWith("https://")) {
      return (
        <div className="col-span-full">
          <ImageUpload label={label} currentImage={value} onChange={(url) => onChange(path, url)} />
        </div>
      );
    }
    if (lKey.includes("icon")) {
      return (
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">{label}</label>
          <IconSelector value={value} onChange={(val) => onChange(path, val)} />
        </div>
      );
    }
    if (value.length > 50 || lKey.includes("desc") || lKey.includes("text")) {
      return (
        <div className="col-span-full">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">{label}</label>
          <textarea value={value} onChange={(e) => onChange(path, e.target.value)} className="w-full p-3 border border-zinc-800 rounded-lg bg-zinc-950 text-sm text-zinc-300 outline-none focus:border-indigo-500 min-h-[100px]" />
        </div>
      );
    }
    return (
      <div>
        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">{label}</label>
        <Input value={value} onChange={(e) => onChange(path, e.target.value)} className="bg-zinc-950 border-zinc-800" />
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="col-span-full border-2 border-indigo-500/10 bg-indigo-500/5 rounded-xl p-4 space-y-4">
        <h5 className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-2">
           <List size={14} /> {label} (Lista Dinâmica)
        </h5>
        {value.map((item, idx) => (
          <div key={idx} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg relative pt-10">
            <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-800/50 flex items-center px-3 justify-between rounded-t-lg">
               <span className="text-[10px] font-bold text-zinc-500">ITEM #{idx + 1}</span>
               <button onClick={() => {
                 const newVal = value.filter((_, i) => i !== idx);
                 onChange(path, newVal);
               }} className="text-red-500 hover:text-red-400"><Trash2 size={12}/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(item).map(([k, v]) => (
                <DynamicFieldRenderer key={k} dataKey={k} value={v} path={`${path}.${idx}.${k}`} onChange={onChange} />
              ))}
            </div>
          </div>
        ))}
        <button onClick={() => {
          const newItem = value.length > 0 ? JSON.parse(JSON.stringify(value[0])) : { titulo: "Novo Item" };
          onChange(path, [...value, newItem]);
        }} className="w-full py-2 border border-dashed border-indigo-500/30 text-indigo-500 text-xs font-bold rounded-lg hover:bg-indigo-500/10 transition-colors">
          + Adicionar Item
        </button>
      </div>
    );
  }

  return null;
}

const SectionHeader = ({ title, expanded, onToggle }: any) => (
  <button onClick={onToggle} className="w-full flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800/50 transition-colors">
    <div className="flex items-center gap-3">
      <Layers className="text-indigo-500" size={18} />
      <span className="text-sm font-bold text-white uppercase tracking-wider">{title}</span>
    </div>
    {expanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
  </button>
);

const INBUILT_TEMPLATES = [
  { name: "Nova Seção", icon: <Layers size={14}/>, category: "complex", key: "secao", data: { titulo: "Título", ativo: true } },
  { name: "Lista / Array", icon: <List size={14}/>, category: "complex", key: "lista", data: [{ item: "Texto" }] },
  { name: "Cor", icon: <Palette size={14}/>, category: "simple", key: "cor", data: "#E61A4A" },
  { name: "Texto", icon: <TypeIcon size={14}/>, category: "simple", key: "texto", data: "Escreva algo..." },
  { name: "Imagem", icon: <ImageIcon size={14}/>, category: "simple", key: "imagem", data: "" },
  { name: "Botão", icon: <LinkIcon size={14}/>, category: "simple", key: "link", data: { label: "Saiba mais", url: "#" } }
];

// ==========================================
// 4. COMPONENTE PRINCIPAL
// ==========================================
interface AdvancedJsonEditorProps {
  data: any;
  structure?: any;
  readOnlyStructure?: boolean;
  basePath?: string;
  onChange: (path: string, value: any) => void;
  onReplaceData?: (newData: any) => void;
  previewUrl?: string;
}

export default function AdvancedJsonEditor({ 
  data, structure, readOnlyStructure = false, basePath = "data", onChange, onReplaceData, previewUrl = "/" 
}: AdvancedJsonEditorProps) {
  
  const safeData = useMemo(() => (data && typeof data === 'object') ? data : {}, [data]);
  const displaySchema = useMemo(() => structure || safeData, [structure, safeData]);
  const dynamicKeys = Object.keys(displaySchema);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isDevMode, setIsDevMode] = useState(false);
  const [rawJson, setRawJson] = useState("");
  const [targetSection, setTargetSection] = useState("ROOT");
  const [tab, setTab] = useState<"manage" | "add">("manage");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isDevMode) setRawJson(JSON.stringify(safeData, null, 2));
  }, [safeData, isDevMode]);

  const toggleSection = (s: string) => setExpanded(prev => ({ ...prev, [s]: !prev[s] }));
  const reloadPreview = () => { if(iframeRef.current) iframeRef.current.src = `${previewUrl}?t=${Date.now()}`; };

  const handleJsonApply = () => {
    try {
      const parsed = JSON.parse(rawJson);
      if (onReplaceData) onReplaceData(parsed);
      reloadPreview();
    } catch (e) { alert("JSON Inválido"); }
  };

  const handleInjectTemplate = (temp: any) => {
    const current = JSON.parse(JSON.stringify(safeData));
    const key = `${temp.key}_${Math.random().toString(36).substr(2, 4)}`;
    
    if (temp.category === "complex" || targetSection === "ROOT") {
      current[key] = temp.data;
    } else {
      if (current[targetSection]) current[targetSection][key] = temp.data;
    }
    
    if (onReplaceData) onReplaceData(current);
  };

  const manageAction = (type: "up" | "down" | "del", key: string) => {
    const keys = Object.keys(safeData);
    const idx = keys.indexOf(key);
    if (type === "del") {
       if(!confirm("Excluir seção?")) return;
       const next = { ...safeData }; delete next[key];
       if (onReplaceData) onReplaceData(next);
    } else {
       if (type === "up" && idx > 0) [keys[idx-1], keys[idx]] = [keys[idx], keys[idx-1]];
       if (type === "down" && idx < keys.length-1) [keys[idx], keys[idx+1]] = [keys[idx+1], keys[idx]];
       const next: any = {}; keys.forEach(k => next[k] = safeData[k]);
       if (onReplaceData) onReplaceData(next);
    }
  };

  return (
    <div className="flex flex-col h-[700px] overflow-hidden bg-zinc-950 border border-zinc-800 rounded-2xl">
      <div className="flex flex-1 overflow-hidden divide-x divide-zinc-800">
        
        {/* LADO ESQUERDO: CAMPOS */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-black/40">
           {dynamicKeys.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                <Layers size={48} className="mb-4" />
                <p className="text-sm font-medium">Nenhum campo definido ainda.</p>
             </div>
           ) : (
             dynamicKeys.map(key => (
               <div key={key} className="space-y-3">
                  <SectionHeader title={humanizeKey(key)} expanded={expanded[key]} onToggle={() => toggleSection(key)} />
                  <AnimatePresence>
                    {expanded[key] && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6">
                           {Object.entries(displaySchema[key]).map(([subK, subV]: [string, any]) => (
                             <DynamicFieldRenderer 
                               key={subK} dataKey={subK} 
                               value={safeData[key]?.[subK] !== undefined ? safeData[key][subK] : subV} 
                               path={`${key}.${subK}`} onChange={onChange} 
                             />
                           ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
             ))
           )}
        </div>

        {/* LADO DIREITO: PREVIEW (SÓ SE HOUVER URL) */}
        {!readOnlyStructure && previewUrl !== "/" && (
           <div className="hidden lg:flex w-[400px] flex-col bg-zinc-950">
              <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-black/20">
                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Visualização Real</span>
                 <button onClick={reloadPreview} className="text-zinc-500 hover:text-white"><RefreshCw size={14}/></button>
              </div>
              <iframe ref={iframeRef} src={previewUrl} className="flex-1 w-full bg-white" />
           </div>
        )}
      </div>

      {/* FOOTER: ADMIN TOOLS */}
      {!readOnlyStructure && (
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center">
           <p className="text-[10px] text-zinc-500 font-medium">Use o modo construtor para definir a estrutura da página.</p>
           <button onClick={() => setIsDevMode(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">
              <Settings2 size={14} /> Gerenciar Estrutura
           </button>
        </div>
      )}

      {/* DRAWER ADMIN */}
      <AnimatePresence>
        {isDevMode && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm" onClick={() => setIsDevMode(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed inset-y-0 right-0 w-[500px] z-[1001] bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl">
               <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                  <h2 className="text-white font-bold flex items-center gap-2"><Code size={20} className="text-indigo-500" /> Editor de Layout</h2>
                  <div className="flex gap-2">
                     <Button onClick={handleJsonApply} className="bg-green-600 h-8 text-xs">Aplicar Alterações</Button>
                     <button onClick={() => setIsDevMode(false)} className="p-1.5 bg-zinc-800 rounded-md text-zinc-400"><X size={16}/></button>
                  </div>
               </div>

               <div className="flex-1 flex flex-col overflow-hidden">
                  <textarea value={rawJson} onChange={e => setRawJson(e.target.value)} className="flex-1 w-full bg-black text-emerald-500 font-mono p-4 text-xs outline-none resize-none custom-scrollbar" />
                  
                  <div className="h-[300px] bg-zinc-900 border-t border-zinc-800 flex flex-col">
                     <div className="flex border-b border-zinc-800">
                        <button onClick={() => setTab("manage")} className={`flex-1 py-3 text-[10px] font-bold uppercase transition-colors ${tab === 'manage' ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-zinc-500'}`}>Organizar</button>
                        <button onClick={() => setTab("add")} className={`flex-1 py-3 text-[10px] font-bold uppercase transition-colors ${tab === 'add' ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-zinc-500'}`}>Novo Campo</button>
                     </div>

                     <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {tab === "manage" ? (
                           <div className="space-y-2">
                              <select value={targetSection} onChange={e => setTargetSection(e.target.value)} className="w-full bg-zinc-800 border-zinc-700 text-xs text-white p-2 rounded-md mb-4 outline-none">
                                 <option value="ROOT">RAIZ DO DOCUMENTO</option>
                                 {dynamicKeys.map(k => <option key={k} value={k}>Dentro de: {humanizeKey(k)}</option>)}
                              </select>
                              {dynamicKeys.map(key => (
                                 <div key={key} className="flex items-center justify-between p-2 bg-black/40 border border-zinc-800 rounded-lg">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase">{key}</span>
                                    <div className="flex gap-1">
                                       <button onClick={() => manageAction("up", key)} className="p-1 text-zinc-500 hover:text-white"><ArrowUp size={12}/></button>
                                       <button onClick={() => manageAction("down", key)} className="p-1 text-zinc-500 hover:text-white"><ArrowDown size={12}/></button>
                                       <button onClick={() => manageAction("del", key)} className="p-1 text-red-500"><Trash2 size={12}/></button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="grid grid-cols-2 gap-2">
                              {INBUILT_TEMPLATES.map(temp => (
                                 <button key={temp.name} onClick={() => handleInjectTemplate(temp)} className="flex items-center gap-2 p-3 bg-zinc-800 hover:bg-indigo-600/20 border border-zinc-700 rounded-xl text-left transition-all">
                                    <div className="p-1.5 bg-zinc-900 rounded-md text-indigo-400">{temp.icon}</div>
                                    <span className="text-[10px] font-bold text-zinc-300 uppercase">{temp.name}</span>
                                 </button>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}