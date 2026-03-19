/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/Input";
import { Switch } from "@/components/Switch";
import { Button } from "@/components/Button";
import { ImageUpload } from "@/components/ImageUpload";
import IconSelector from "@/components/IconSelector"; 
import { VideoUpload } from "@/components/VideoUpload"; 
import { Icon } from "@iconify/react"; 
import * as Icons from "lucide-react"; 
import { 
  Palette, ChevronDown, ChevronUp, Layers, X, RefreshCw, Trash2, 
  Type as TypeIcon, List, Link as LinkIcon, ArrowUp, ArrowDown, Settings2,
  VideoIcon, LayoutTemplate, Image as ImageIcon, Code, AlignLeft, Paintbrush
} from "lucide-react";

// ==========================================
// 1. COMPONENTE COLOR PICKER
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
      <button type="button" onClick={() => setShow(!show)} className="h-[34px] px-3 w-full rounded border border-zinc-800 bg-black flex items-center justify-between mt-1">
        <span className="text-xs font-mono text-zinc-400 uppercase">{safeColor}</span>
        <div className="w-4 h-4 rounded border border-white/10" style={{ backgroundColor: safeColor }} />
      </button>
      {show && (
        <div className="absolute z-50 top-full mt-2 p-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl space-y-3 w-48">
          <input type="color" value={safeColor} onChange={(e) => onChange(e.target.value)} className="w-full h-8 rounded cursor-pointer bg-transparent" />
          <div className="grid grid-cols-5 gap-1">
            {presetColors.map(c => <button key={c} onClick={() => { onChange(c); setShow(false); }} className="w-6 h-6 rounded border border-white/5" style={{ backgroundColor: c }} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function humanizeKey(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

// ==========================================
// 2. RENDERIZADOR DINÂMICO
// ==========================================
function DynamicFieldRenderer({ dataKey, value, path, onChange, formsList }: any) {
  const lKey = dataKey.toLowerCase();
  const label = humanizeKey(dataKey);

  // --- LÓGICA ESPECIAL PARA PARÁGRAFOS COMPOSTOS (EX: HIGHLIGHTS E TEXTOS JUNTOS) ---
  if ((lKey.includes("paragraph") || lKey.includes("paragrafo")) && Array.isArray(value)) {
    return (
      <div className="col-span-full border-2 border-indigo-500/10 bg-indigo-500/5 rounded-xl p-4 space-y-4">
        <h5 className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-2"><AlignLeft size={14} /> {label}</h5>
        
        {value.map((paragraphArray, pIdx) => (
          <div key={pIdx} className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg relative pt-10 shadow-inner">
            <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-800/50 flex items-center px-3 justify-between rounded-t-lg">
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Parágrafo #{pIdx + 1}</span>
               <button onClick={() => { const newVal = value.filter((_, i) => i !== pIdx); onChange(path, newVal); }} className="text-red-500 hover:text-red-400"><Trash2 size={12}/></button>
            </div>
            
            <div className="space-y-3">
              {(Array.isArray(paragraphArray) ? paragraphArray : []).map((fragment: any, fIdx: number) => (
                <div key={fIdx} className="flex flex-col gap-2 bg-black/40 p-3 rounded-lg border border-zinc-800 relative group">
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${fragment.type === 'highlight' ? 'bg-amber-500/20 text-amber-500' : 'bg-zinc-800 text-zinc-400'}`}>
                      {fragment.type === 'highlight' ? 'Palavra de Destaque' : 'Texto Normal'}
                    </span>
                    <button onClick={() => {
                      const newParagraph = paragraphArray.filter((_: any, i: number) => i !== fIdx);
                      const newVal = [...value];
                      newVal[pIdx] = newParagraph;
                      onChange(path, newVal);
                    }} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-all"><X size={14} /></button>
                  </div>
                  
                  <div className="flex w-full gap-2 items-start">
                    <textarea 
                      value={fragment.value || ""} 
                      onChange={e => {
                        const newParagraph = [...paragraphArray];
                        newParagraph[fIdx] = { ...newParagraph[fIdx], value: e.target.value };
                        const newVal = [...value];
                        newVal[pIdx] = newParagraph;
                        onChange(path, newVal);
                      }} 
                      className="flex-1 bg-black border border-zinc-700 rounded text-sm px-3 py-2 outline-none focus:border-cyan-500 min-h-[40px] resize-y custom-scrollbar" 
                      style={fragment.type === 'highlight' ? {
                        color: fragment.color || "#F1D95D",
                        fontFamily: fragment.serif ? "serif" : "inherit",
                        fontStyle: fragment.italic ? "italic" : "normal",
                        fontWeight: fragment.bold ? "bold" : "normal"
                      } : { color: "white" }}
                      placeholder="Conteúdo do fragmento..."
                      rows={2}
                    />
                    
                    {fragment.type === 'highlight' && (
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <div className="w-8 h-8 rounded border border-zinc-700 relative overflow-hidden shrink-0" title="Cor do Destaque">
                           <input type="color" value={fragment.color || "#F1D95D"} onChange={e => {
                             const newParagraph = [...paragraphArray];
                             newParagraph[fIdx] = { ...newParagraph[fIdx], color: e.target.value };
                             const newVal = [...value];
                             newVal[pIdx] = newParagraph;
                             onChange(path, newVal);
                           }} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer" />
                        </div>
                        
                        <div className="flex flex-wrap gap-1 w-[120px] justify-center">
                          <button onClick={() => {
                               const newParagraph = [...paragraphArray];
                               newParagraph[fIdx] = { ...newParagraph[fIdx], bold: !newParagraph[fIdx].bold };
                               const newVal = [...value];
                               newVal[pIdx] = newParagraph;
                               onChange(path, newVal);
                          }} className={`text-[10px] font-bold px-2 py-1 rounded border flex-1 ${fragment.bold ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-transparent text-zinc-500 border-zinc-700'}`}>Bold</button>

                          <button onClick={() => {
                               const newParagraph = [...paragraphArray];
                               newParagraph[fIdx] = { ...newParagraph[fIdx], italic: !newParagraph[fIdx].italic };
                               const newVal = [...value];
                               newVal[pIdx] = newParagraph;
                               onChange(path, newVal);
                          }} className={`text-[10px] font-bold px-2 py-1 rounded border flex-1 ${fragment.italic ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-transparent text-zinc-500 border-zinc-700'} italic`}>Italic</button>

                          <button onClick={() => {
                               const newParagraph = [...paragraphArray];
                               newParagraph[fIdx] = { ...newParagraph[fIdx], serif: !newParagraph[fIdx].serif };
                               const newVal = [...value];
                               newVal[pIdx] = newParagraph;
                               onChange(path, newVal);
                          }} className={`text-[10px] font-bold px-2 py-1 rounded border w-full ${fragment.serif ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-transparent text-zinc-500 border-zinc-700'}`}>Serif</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="flex gap-2 pt-2 border-t border-zinc-800/50 mt-4">
                <button onClick={() => {
                  const newParagraph = [...(Array.isArray(paragraphArray) ? paragraphArray : []), { type: 'text', value: 'Novo texto normal' }];
                  const newVal = [...value];
                  newVal[pIdx] = newParagraph;
                  onChange(path, newVal);
                }} className="text-[10px] font-bold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded transition-colors w-full">+ Texto Normal</button>
                
                <button onClick={() => {
                  const newParagraph = [...(Array.isArray(paragraphArray) ? paragraphArray : []), { type: 'highlight', value: 'Palavra Chave', color: '#F1D95D', serif: false, italic: false, bold: true }];
                  const newVal = [...value];
                  newVal[pIdx] = newParagraph;
                  onChange(path, newVal);
                }} className="text-[10px] font-bold text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-2 rounded transition-colors w-full">+ Palavra Destacada</button>
              </div>
            </div>
          </div>
        ))}
        
        <button onClick={() => {
          const newParagraphArray = [{ type: 'text', value: 'Escreva seu parágrafo aqui...' }];
          const newVal = [...(value || []), newParagraphArray];
          onChange(path, newVal);
        }} className="w-full py-3 bg-indigo-500/10 border border-dashed border-indigo-500/30 text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-500/20 transition-colors uppercase tracking-wider">
          + Criar Novo Parágrafo
        </button>
      </div>
    );
  }

  // --- LÓGICA ESPECIAL PARA O COMPONENTE CTA / FORMS ---
  if (value && typeof value === 'object' && !Array.isArray(value) && (lKey.includes("cta") || lKey.includes("button") || lKey.includes("botao"))) {
    const ctaVal = { 
      text: value.text || "", 
      icon: value.icon || "", 
      use_form: value.use_form || false, 
      form_id: value.form_id || "", 
      href: value.href || "" 
    };
    
    return (
      <div className="col-span-full p-5 border border-zinc-800 bg-black/40 rounded-xl space-y-4 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/50">
           <div>
              <label className="text-[11px] font-bold text-cyan-400 uppercase flex items-center gap-2">
                <LayoutTemplate size={14} /> {label} (Ação do Botão)
              </label>
              <p className="text-[10px] text-zinc-500 mt-1">Configure a ação deste botão. Ative a chave abaixo para abrir um formulário na tela.</p>
           </div>
           <div className="flex items-center gap-3 bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800 shadow-inner shrink-0">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Abrir Formulário?</span>
              <Switch checked={ctaVal.use_form} onCheckedChange={(val) => onChange(path, { ...ctaVal, use_form: val })} />
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Texto do Botão</label>
             <Input value={ctaVal.text} onChange={(e) => onChange(path, { ...ctaVal, text: e.target.value })} placeholder="Ex: Saiba mais" className="bg-black border-zinc-800 rounded text-xs py-1.5 mt-1" />
           </div>
           <div>
             <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Ícone do Botão</label>
             <IconSelector value={ctaVal.icon} onChange={(val) => onChange(path, { ...ctaVal, icon: val })} placeholder="Ex: lucide:arrow-right" />
           </div>
           
           <div className="col-span-full pt-2">
             {ctaVal.use_form ? (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-cyan-950/20 border border-cyan-900/50 p-4 rounded-lg space-y-3">
                   <div>
                     <label className="block text-[10px] font-bold text-cyan-500 uppercase flex items-center gap-2 mb-1">
                       <LayoutTemplate size={14} /> Selecione o Formulário Vinculado
                     </label>
                     <p className="text-[10px] text-zinc-500 mb-2">Este formulário abrirá num modal flutuante na tela (Popup).</p>
                   </div>
                   
                   <select 
                     value={ctaVal.form_id || ""} 
                     onChange={(e) => onChange(path, { ...ctaVal, form_id: e.target.value })} 
                     className="w-full bg-black border border-cyan-500/30 text-white rounded-lg text-xs py-2.5 px-3 outline-none focus:border-cyan-500 transition-colors"
                   >
                      <option value="">-- Selecione um formulário --</option>
                      {formsList?.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                   </select>

                   {(!formsList || formsList.length === 0) && (
                     <p className="text-[10px] text-red-400 mt-2">Nenhum formulário cadastrado no sistema.</p>
                   )}
                </motion.div>
             ) : (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg space-y-3">
                   <div>
                     <label className="block text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2 mb-1">
                       <LinkIcon size={14} /> Link de Destino (URL)
                     </label>
                     <p className="text-[10px] text-zinc-500 mb-2">O botão vai redirecionar o usuário para esta página ou link.</p>
                   </div>
                   
                   <Input value={ctaVal.href} onChange={(e) => onChange(path, { ...ctaVal, href: e.target.value })} placeholder="Ex: /contato ou https://wa.me/..." className="bg-black border-zinc-800 rounded text-xs py-1.5" />
                </motion.div>
             )}
           </div>
        </div>
      </div>
    );
  }

  // --- RESTANTE DOS CAMPOS ---
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
        <Input type="number" value={value} onChange={(e) => onChange(path, Number(e.target.value))} className="bg-black border-zinc-800 rounded text-xs mt-1 py-1" />
      </div>
    );
  }

  if (typeof value === "string") {
    // LINKS/URLS (Prioridade máxima para evitar que vire Imagem ou Cor)
    if (lKey.includes("link") || lKey.includes("url") || lKey.includes("href") || lKey.includes("destino")) {
      return (
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">{label}</label>
          <Input value={value} onChange={(e) => onChange(path, e.target.value)} className="bg-black border-zinc-800 rounded text-xs mt-1 py-1 text-cyan-400" placeholder="Ex: /contato ou https://..." />
        </div>
      );
    }
    
    // CORES
    if (lKey.includes("color") || (value.startsWith("#") && value.length <= 9 && !value.includes(" "))) {
      return (
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">{label}</label>
          <ColorPicker color={value} onChange={(c) => onChange(path, c)} />
        </div>
      );
    }
    
    // VÍDEO
    if (lKey.includes("video") || value.endsWith(".mp4") || value.endsWith(".webm")) {
      return (
        <div className="col-span-full">
          <VideoUpload label={label} currentVideo={value} onChange={(url) => onChange(path, url)} />
        </div>
      );
    }
    
    // IMAGEM (Agora reconhece "src" e não cai se a string for uma URL externa qualquer que seja Link)
    if (lKey.includes("image") || lKey.includes("logo") || lKey.includes("src") || lKey.includes("img") || lKey.includes("bg") || lKey.includes("background") || value.endsWith(".png") || value.endsWith(".jpg") || value.endsWith(".jpeg") || value.endsWith(".svg") || value.endsWith(".webp") || value.endsWith(".avif")) {
      return (
        <div className="col-span-full">
          <ImageUpload label={label} currentImage={value} onChange={(url) => onChange(path, url)} />
        </div>
      );
    }
    
    // ÍCONES
    if (lKey.includes("icon")) {
      return (
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">{label}</label>
          <div className="mt-1">
             <IconSelector value={value} onChange={(val) => onChange(path, val)} placeholder="Ex: lucide:home" />
          </div>
        </div>
      );
    }
    
    // TEXTAREA DE MANIFESTO OU TEXTO LONGO
    if (value.length > 50 || lKey.includes("desc") || lKey.includes("text") || lKey.includes("manifesto")) {
      return (
        <div className="col-span-full">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">{label}</label>
          <textarea value={value} onChange={(e) => onChange(path, e.target.value)} className="w-full p-2 mt-1 border border-zinc-800 rounded bg-black text-xs text-white outline-none focus:border-cyan-500 min-h-[80px]" />
        </div>
      );
    }
    
    // FALLBACK PADRÃO
    return (
      <div>
        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">{label}</label>
        <Input value={value} onChange={(e) => onChange(path, e.target.value)} className="bg-black border-zinc-800 rounded text-xs mt-1 py-1" />
      </div>
    );
  }

  // --- LISTAS GENÉRICAS (ARRAYS) ---
  if (Array.isArray(value)) {
    return (
      <div className="col-span-full border-2 border-indigo-500/10 bg-indigo-500/5 rounded-xl p-4 space-y-4">
        <h5 className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-2"><List size={14} /> {label} (Lista Dinâmica)</h5>
        {value.map((item, idx) => (
          <div key={idx} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg relative pt-10">
            <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-800/50 flex items-center px-3 justify-between rounded-t-lg">
               <span className="text-[10px] font-bold text-zinc-500">ITEM #{idx + 1}</span>
               <button onClick={() => { const newVal = value.filter((_, i) => i !== idx); onChange(path, newVal); }} className="text-red-500 hover:text-red-400"><Trash2 size={12}/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(item).map(([k, v]) => (
                <DynamicFieldRenderer key={k} dataKey={k} value={v} path={`${path}.${idx}.${k}`} onChange={onChange} formsList={formsList} />
              ))}
            </div>
          </div>
        ))}
        <button onClick={() => { const newItem = value.length > 0 ? JSON.parse(JSON.stringify(value[0])) : { titulo: "Novo Item" }; onChange(path, [...value, newItem]); }} className="w-full py-2 border border-dashed border-indigo-500/30 text-indigo-500 text-xs font-bold rounded-lg hover:bg-indigo-500/10 transition-colors">
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
  { name: "Lista / Array", icon: <List size={14}/>, category: "complex", key: "lista", data: [{ titulo: "Texto", icon: "lucide:check" }] },
  { name: "Parágrafos (Destaque)", icon: <Paintbrush size={14}/>, category: "complex", key: "paragraphs", data: [[{ type: "text", value: "Exemplo de "}, { type: "highlight", value: "destaque", color: "#F1D95D", serif: false, italic: false, bold: true }]] },
  { name: "Botão CTA (Form/Link)", icon: <LayoutTemplate size={14}/>, category: "complex", key: "cta", data: { text: "Saiba Mais", icon: "lucide:arrow-right", href: "/", use_form: false, form_id: "" } }, 
  { name: "Cor", icon: <Palette size={14}/>, category: "simple", key: "cor", data: "#E61A4A" },
  { name: "Texto", icon: <TypeIcon size={14}/>, category: "simple", key: "texto", data: "Escreva algo..." },
  { name: "Imagem", icon: <ImageIcon size={14}/>, category: "simple", key: "imagem", data: "" },
  { name: "Vídeo", icon: <VideoIcon size={14}/>, category: "simple", key: "video", data: "" }, 
];

// ==========================================
// 3. COMPONENTE PRINCIPAL
// ==========================================
export interface AdvancedJsonEditorProps {
  data: any;
  structure?: any;
  readOnlyStructure?: boolean;
  basePath?: string;
  onChange: (path: string, value: any) => void;
  onReplaceData?: (newData: any) => void;
  previewUrl?: string;
  pageTitle?: string;    
  pageSubtitle?: string; 
  pageIcon?: string;     
}

export default function AdvancedJsonEditor({ 
  data, structure, readOnlyStructure = false, basePath = "data", onChange, onReplaceData, previewUrl = "/",
  pageTitle, pageSubtitle, pageIcon
}: AdvancedJsonEditorProps) {
  
  const [localData, setLocalData] = useState<any>({});

  useEffect(() => {
    let parsed = data;
    if (typeof data === 'string') {
      try { parsed = JSON.parse(data); } catch { parsed = {}; }
    }
    if (!parsed || parsed === "null") parsed = {};
    setLocalData(parsed);
  }, [data]);

  const displaySchema = useMemo(() => structure || localData, [structure, localData]);
  const dynamicKeys = Object.keys(displaySchema);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isDevMode, setIsDevMode] = useState(false);
  const [rawJson, setRawJson] = useState("");
  const [targetSection, setTargetSection] = useState("ROOT");
  const [tab, setTab] = useState<"manage" | "add">("manage");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [formsList, setFormsList] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await fetch("/api/components");
        const json = await res.json();
        if (json.success) setFormsList(json.components);
      } catch (error) { console.error("Erro ao buscar formulários:", error); }
    };
    fetchForms();
  }, []);

  useEffect(() => {
    if (isDevMode) setRawJson(JSON.stringify(localData, null, 2));
  }, [localData, isDevMode]);

  const toggleSection = (s: string) => setExpanded(prev => ({ ...prev, [s]: !prev[s] }));
  
  const isApiRoute = previewUrl?.includes("/api/") || previewUrl?.includes("json");
  const reloadPreview = () => { if(iframeRef.current && !isApiRoute) iframeRef.current.src = `${previewUrl}?t=${Date.now()}`; };

  const handleJsonApply = () => {
    try {
      const parsed = JSON.parse(rawJson);
      setLocalData(parsed);
      if (onReplaceData) onReplaceData(parsed);
      reloadPreview();
    } catch (e) { alert("JSON Inválido"); }
  };

  const handleInjectTemplate = (temp: any) => {
    setLocalData((prev: any) => {
      const current = JSON.parse(JSON.stringify(prev));
      const key = `${temp.key}_${Math.random().toString(36).substr(2, 4)}`;
      if (temp.category === "complex" || targetSection === "ROOT") current[key] = temp.data;
      else if (current[targetSection]) current[targetSection][key] = temp.data;
      
      setTimeout(() => { if (onReplaceData) onReplaceData(current); }, 0);
      return current;
    });
  };

  const handleFieldChange = useCallback((path: string, val: any) => {
    setLocalData((prev: any) => {
      const keys = path.split('.');
      const newData = JSON.parse(JSON.stringify(prev)); 
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined) {
          current[keys[i]] = isNaN(Number(keys[i+1])) ? {} : [];
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = val;
      
      setTimeout(() => {
        if (onReplaceData) onReplaceData(newData);
      }, 0);
      
      return newData;
    });
  }, [onReplaceData]);

  const manageAction = (type: "up" | "down" | "del", key: string) => {
    setLocalData((prev: any) => {
      const keys = Object.keys(prev);
      const idx = keys.indexOf(key);
      
      if (type === "del") {
         if(!confirm("Excluir seção?")) return prev;
         const next = { ...prev }; delete next[key];
         setTimeout(() => { if (onReplaceData) onReplaceData(next); }, 0);
         return next;
      } else {
         if (type === "up" && idx > 0) [keys[idx-1], keys[idx]] = [keys[idx], keys[idx-1]];
         if (type === "down" && idx < keys.length-1) [keys[idx], keys[idx+1]] = [keys[idx+1], keys[idx]];
         const next: any = {}; keys.forEach(k => next[k] = prev[k]);
         setTimeout(() => { if (onReplaceData) onReplaceData(next); }, 0);
         return next;
      }
    });
  };

  const jsonPreviewHtml = `
    <html style="background: #09090b; margin: 0; padding: 20px; font-family: monospace; color: #10b981;">
      <body>
        <pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 13px;">${JSON.stringify(localData, null, 2)}</pre>
      </body>
    </html>
  `;

  const HeaderIconLegacy = (Icons as any)[pageIcon || ""] || LayoutTemplate;

  return (
    <div className="flex flex-col h-full min-h-[700px] overflow-hidden bg-zinc-950 border border-zinc-800 rounded-2xl">
      <div className="flex flex-1 overflow-hidden divide-x divide-zinc-800">
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-black/40 relative">
           
           <div className="mb-8 pb-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center gap-5">
             <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)] shrink-0">
               {pageIcon?.includes(':') ? (
                 <Icon icon={pageIcon} className="w-8 h-8" />
               ) : (
                 <HeaderIconLegacy size={32} />
               )}
             </div>
             <div>
               <h1 className="text-2xl font-bold text-white tracking-tight">{pageTitle || "Nova Página Dinâmica"}</h1>
               <p className="text-sm text-zinc-400 mt-1">{pageSubtitle || "Adicione e edite os campos JSON para estruturar os dados desta página."}</p>
             </div>
           </div>

           {dynamicKeys.length === 0 ? (
             <div className="h-64 flex flex-col items-center justify-center text-zinc-600 opacity-50">
                <Layers size={48} className="mb-4" />
                <p className="text-sm font-medium">Nenhum campo definido ainda.</p>
             </div>
           ) : (
             dynamicKeys.map(key => (
               <div key={key} className="space-y-3">
                  {!key.toLowerCase().includes("cta") && !key.toLowerCase().includes("paragraph") && !key.toLowerCase().includes("paragrafo") && !Array.isArray(localData[key]) && (
                    <SectionHeader title={humanizeKey(key)} expanded={expanded[key]} onToggle={() => toggleSection(key)} />
                  )}
                  
                  <AnimatePresence>
                    {(expanded[key] || key.toLowerCase().includes("cta") || key.toLowerCase().includes("paragraph") || key.toLowerCase().includes("paragrafo") || Array.isArray(localData[key])) && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        
                        {key.toLowerCase().includes("cta") || key.toLowerCase().includes("paragraph") || key.toLowerCase().includes("paragrafo") || Array.isArray(localData[key]) ? (
                          <DynamicFieldRenderer 
                             key={key} dataKey={key} 
                             value={localData[key]} 
                             path={key} onChange={handleFieldChange} formsList={formsList}
                           />
                        ) : (
                          <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6">
                             {Object.entries(displaySchema[key]).map(([subK, subV]: [string, any]) => (
                               <DynamicFieldRenderer 
                                 key={subK} dataKey={subK} 
                                 value={localData[key]?.[subK] !== undefined ? localData[key][subK] : subV} 
                                 path={`${key}.${subK}`} onChange={handleFieldChange} formsList={formsList}
                               />
                             ))}
                          </div>
                        )}
                        
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
             ))
           )}
        </div>

        {!readOnlyStructure && previewUrl !== "/" && previewUrl !== "" && (
           <div className="hidden lg:flex w-[400px] flex-col bg-zinc-950 relative">
              <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-black/20 shrink-0">
                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                   {isApiRoute ? "Visualização API (Em Tempo Real)" : "Visualização da Página"}
                 </span>
                 {!isApiRoute && <button onClick={reloadPreview} className="text-zinc-500 hover:text-white"><RefreshCw size={14}/></button>}
              </div>
              {isApiRoute ? (
                <iframe srcDoc={jsonPreviewHtml} className="flex-1 w-full bg-zinc-950 border-none" title="JSON Preview" />
              ) : (
                <iframe ref={iframeRef} src={previewUrl} className="flex-1 w-full bg-white border-none" title="Page Preview" />
              )}
           </div>
        )}
      </div>

      {!readOnlyStructure && (
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center shrink-0">
           <p className="text-[10px] text-zinc-500 font-medium">Use o modo construtor para definir a estrutura da página.</p>
           <button onClick={() => setIsDevMode(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">
              <Settings2 size={14} /> Gerenciar Estrutura
           </button>
        </div>
      )}

      <AnimatePresence>
        {isDevMode && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm" onClick={() => setIsDevMode(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed inset-y-0 right-0 w-[500px] z-[1001] bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl">
               <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                  <h2 className="text-white font-bold flex items-center gap-2"><Code size={20} className="text-indigo-500" /> Editor de Layout</h2>
                  <div className="flex gap-2">
                     <Button onClick={handleJsonApply} className="bg-green-600 h-8 text-xs">Aplicar Alterações</Button>
                     <button onClick={() => setIsDevMode(false)} className="p-1.5 bg-zinc-800 rounded-md text-zinc-400 hover:text-white"><X size={16}/></button>
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