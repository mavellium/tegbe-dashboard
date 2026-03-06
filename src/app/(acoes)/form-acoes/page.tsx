/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Type, Palette, List, Settings, GripVertical, Trash2, 
  LayoutTemplate, Phone, Mail, AlignLeft, ChevronDown, 
  Menu, X, PanelLeftClose, PanelLeftOpen, AlignCenter, AlignRight, Save, Loader2
} from "lucide-react";

// --- TIPAGENS ---
type FieldType = "text" | "email" | "tel" | "textarea" | "select";

interface TextStyle { color?: string; fontSize?: string; textAlign?: "left" | "center" | "right"; }
interface FieldStyle { bgColor?: string; textColor?: string; borderColor?: string; borderRadius?: string; }

interface FormField {
  id: string; type: FieldType; label: string; placeholder: string; required: boolean; options?: string; style?: FieldStyle;
}

interface FormDesign {
  primaryColor: string; bgColor: string; textColor: string; fontFamily: string; buttonRadius: string; inputBgColor: string; inputBorderColor: string;
  formWidthType: "full" | "manual";
  formWidthPx: string;
}

interface FormContent {
  title: string; titleStyle?: TextStyle;
  subtitle: string; subtitleStyle?: TextStyle;
  submitText: string;
  actionType: "whatsapp" | "database"; 
  whatsappNumber: string; 
}

interface VisualFormConfig { design: FormDesign; content: FormContent; fields: FormField[]; }

// --- ESTADO INICIAL PADRÃO ---
const initialConfig: VisualFormConfig = {
  design: { 
    primaryColor: "#3B82F6", bgColor: "#ffffff", textColor: "#1f2937", fontFamily: "font-sans", buttonRadius: "0.5rem", inputBgColor: "#ffffff", inputBorderColor: "#d1d5db",
    formWidthType: "manual", formWidthPx: "600"
  },
  content: { 
    title: "Entre em Contato", titleStyle: { fontSize: "30px", textAlign: "center", color: "#111827" }, 
    subtitle: "Preencha os dados e falaremos com você em breve.", subtitleStyle: { fontSize: "14px", textAlign: "center", color: "#6b7280" }, 
    submitText: "Enviar Mensagem", actionType: "database", whatsappNumber: "5511999999999" 
  },
  fields: [
    { id: "f1", type: "text", label: "Nome Completo", placeholder: "Seu nome", required: true },
    { id: "f2", type: "email", label: "E-mail", placeholder: "seu@email.com", required: true },
  ]
};

export default function VisualFormBuilder() {
  const [config, setConfig] = useState<VisualFormConfig>(initialConfig);
  const [componentId, setComponentId] = useState<string | null>(null); 
  
  const [activeTab, setActiveTab] = useState<"fields" | "design" | "settings">("fields");
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [activeFieldIndex, setActiveFieldIndex] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Estados e Refs para o Redimensionamento do Formulário (Arrastar bordas)
  const [isResizing, setIsResizing] = useState(false);
  const resizeData = useRef({ startX: 0, startWidth: 0, direction: 1 });

  // --- CARREGAR DADOS DO BANCO ---
  useEffect(() => {
    const fetchComponent = async () => {
      try {
        const res = await fetch("/api/components");
        const data = await res.json();
        
        if (data.success && data.component) {
          setComponentId(data.component.id);
          setConfig(data.component.config as VisualFormConfig);
        }
      } catch (error) {
        console.error("Erro ao buscar o formulário:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComponent();
  }, []);

  // --- LÓGICA DE REDIMENSIONAMENTO AO ARRASTAR AS BORDAS ---
  const startResize = (e: React.MouseEvent, direction: 1 | -1) => {
    e.preventDefault();
    setIsResizing(true);
    resizeData.current = {
      startX: e.clientX,
      startWidth: parseInt(config.design.formWidthPx) || 600,
      direction // 1 para borda direita, -1 para borda esquerda
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      // Calcula quanto o mouse moveu. Multiplica pela direção para saber se está expandindo ou encolhendo.
      const deltaX = (e.clientX - resizeData.current.startX) * resizeData.current.direction;
      // Multiplica por 2 porque o container é centralizado (margin 0 auto) e cresce para os dois lados
      const newWidth = Math.max(320, resizeData.current.startWidth + deltaX * 2);
      
      setConfig(prev => ({
        ...prev,
        design: { ...prev.design, formWidthType: 'manual', formWidthPx: Math.round(newWidth).toString() }
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Evita selecionar texto acidentalmente ao arrastar
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // --- HANDLERS DE ESTADO ---
  const updateDesign = (key: keyof FormDesign, value: string) => setConfig(prev => ({ ...prev, design: { ...prev.design, [key]: value } }));
  const updateContent = (key: keyof FormContent, value: any) => setConfig(prev => ({ ...prev, content: { ...prev.content, [key]: value } }));
  const updateTitleStyle = (key: keyof TextStyle, value: string) => updateContent("titleStyle", { ...(config.content.titleStyle || {}), [key]: value });
  const updateSubtitleStyle = (key: keyof TextStyle, value: string) => updateContent("subtitleStyle", { ...(config.content.subtitleStyle || {}), [key]: value });

  const addField = (type: FieldType) => {
    const newField: FormField = { id: `field-${Date.now()}`, type, label: type === 'email' ? 'E-mail' : type === 'tel' ? 'Telefone' : 'Novo Campo', placeholder: '', required: false };
    setConfig(prev => ({ ...prev, fields: [...prev.fields, newField] }));
    setActiveFieldIndex(config.fields.length);
    if (!isSidebarOpen && window.innerWidth < 768) setIsSidebarOpen(true);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...config.fields];
    newFields[index] = { ...newFields[index], ...updates };
    setConfig(prev => ({ ...prev, fields: newFields }));
  };

  const updateFieldStyle = (index: number, key: keyof FieldStyle, value: string) => updateField(index, { style: { ...(config.fields[index].style || {}), [key]: value } });

  const removeField = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFields = [...config.fields];
    newFields.splice(index, 1);
    setConfig(prev => ({ ...prev, fields: newFields }));
    setActiveFieldIndex(null);
  };

  // --- DRAG AND DROP DOS CAMPOS ---
  const handleDragStart = (e: React.DragEvent, index: number) => { setDraggingIndex(index); e.dataTransfer.effectAllowed = "move"; setTimeout(() => { (e.target as HTMLElement).style.opacity = "0.4"; }, 0); };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;
    const newFields = [...config.fields];
    const draggedItem = newFields[draggingIndex];
    newFields.splice(draggingIndex, 1);
    newFields.splice(index, 0, draggedItem);
    setConfig(prev => ({ ...prev, fields: newFields }));
    setDraggingIndex(index);
  };
  const handleDragEnd = (e: React.DragEvent) => { (e.target as HTMLElement).style.opacity = "1"; setDraggingIndex(null); };

  // --- GERAÇÃO DE HTML E SALVAMENTO ---
  const generateHTML = (conf: VisualFormConfig) => {
    const scopedClass = `form-{{COMPONENT_ID}}`;
    const formMaxWidth = conf.design.formWidthType === 'full' ? '100%' : `${conf.design.formWidthPx}px`;

    const fieldsHtml = conf.fields.map(f => {
      const inlineStyle = [];
      if (f.style?.bgColor) inlineStyle.push(`background-color: ${f.style.bgColor}`);
      if (f.style?.borderColor) inlineStyle.push(`border-color: ${f.style.borderColor}`);
      if (f.style?.textColor) inlineStyle.push(`color: ${f.style.textColor}`);
      if (f.style?.borderRadius) inlineStyle.push(`border-radius: ${f.style.borderRadius}`);
      
      const styleStr = inlineStyle.length > 0 ? `style="${inlineStyle.join('; ')}"` : '';
      const inputName = f.label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || f.id;

      const labelHtml = `<label for="${inputName}">${f.label} ${f.required ? '<span class="req">*</span>' : ''}</label>`;
      
      let inputHtml = "";
      if (f.type === 'textarea') {
        inputHtml = `<textarea id="${inputName}" name="${inputName}" placeholder="${f.placeholder}" ${f.required ? 'required' : ''} ${styleStr} rows="3"></textarea>`;
      } else if (f.type === 'select') {
        const opts = (f.options || "").split(',').map(o => `<option value="${o.trim()}">${o.trim()}</option>`).join('');
        inputHtml = `<select id="${inputName}" name="${inputName}" ${f.required ? 'required' : ''} ${styleStr}><option value="">${f.placeholder}</option>${opts}</select>`;
      } else {
        inputHtml = `<input id="${inputName}" type="${f.type}" name="${inputName}" placeholder="${f.placeholder}" ${f.required ? 'required' : ''} ${styleStr} />`;
      }

      return `<div class="field-group">${labelHtml}${inputHtml}</div>`;
    }).join('');

    const formAction = conf.content.actionType === 'whatsapp' 
      ? `onsubmit="event.preventDefault(); window.open('https://api.whatsapp.com/send?phone=${conf.content.whatsappNumber}&text=Olá! Preenchi o formulário no site.', '_blank');"`
      : `method="POST" action="/api/components/submit"`;
      
    const hiddenInput = conf.content.actionType === 'database' 
      ? `<input type="hidden" name="componentId" value="{{COMPONENT_ID}}" />` 
      : '';

    return `
      <style>
        .${scopedClass} {
          background-color: ${conf.design.bgColor};
          font-family: ${conf.design.fontFamily}, system-ui, sans-serif;
          padding: 2rem;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          box-sizing: border-box;
          width: 100%;
          max-width: ${formMaxWidth};
          margin: 0 auto;
        }
        .${scopedClass} * { box-sizing: border-box; }
        .${scopedClass} h2 {
          color: ${conf.content.titleStyle?.color || conf.design.textColor};
          font-size: ${conf.content.titleStyle?.fontSize || '30px'};
          text-align: ${conf.content.titleStyle?.textAlign || 'center'};
          margin: 0 0 0.5rem 0;
          font-weight: bold;
        }
        .${scopedClass} p.subtitle {
          color: ${conf.content.subtitleStyle?.color || conf.design.textColor};
          font-size: ${conf.content.subtitleStyle?.fontSize || '14px'};
          text-align: ${conf.content.subtitleStyle?.textAlign || 'center'};
          margin: 0 0 1.5rem 0;
        }
        .${scopedClass} .field-group { margin-bottom: 1rem; }
        .${scopedClass} label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.35rem; color: ${conf.design.textColor}; }
        .${scopedClass} label .req { color: #ef4444; }
        .${scopedClass} input, .${scopedClass} select, .${scopedClass} textarea {
          width: 100%; padding: 0.75rem; border: 1px solid ${conf.design.inputBorderColor};
          background-color: ${conf.design.inputBgColor}; color: ${conf.design.textColor};
          border-radius: 0.375rem; font-family: inherit; transition: all 0.2s;
        }
        .${scopedClass} input:focus, .${scopedClass} select:focus, .${scopedClass} textarea:focus {
          outline: none; border-color: ${conf.design.primaryColor}; box-shadow: 0 0 0 3px ${conf.design.primaryColor}30;
        }
        .${scopedClass} button.submit-btn {
          background-color: ${conf.design.primaryColor}; color: #ffffff; border-radius: ${conf.design.buttonRadius};
          padding: 0.875rem; width: 100%; border: none; font-weight: 600; cursor: pointer; margin-top: 0.5rem; transition: background-color 0.2s, transform 0.1s;
        }
        .${scopedClass} button.submit-btn:hover { filter: brightness(0.9); }
        .${scopedClass} button.submit-btn:active { transform: scale(0.98); }
      </style>
      <div class="${scopedClass}">
        <h2>${conf.content.title}</h2>
        <p class="subtitle">${conf.content.subtitle}</p>
        <form ${formAction}>
          ${hiddenInput}
          ${fieldsHtml}
          <button type="submit" class="submit-btn">${conf.content.submitText}</button>
        </form>
      </div>
    `.replace(/\s+/g, ' ').trim(); 
  };

  const handleSave = async () => {
    setIsSaving(true);
    const generatedHtml = generateHTML(config);
    
    const payload = {
      id: componentId,
      name: config.content.title || "Formulário Novo",
      config: config,
      html: generatedHtml,
    };

    try {
      const res = await fetch("/api/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setComponentId(data.component.id); 
        alert("Salvo com sucesso!");
      } else {
        alert("Erro ao salvar o componente.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDERIZADORES DA SIDEBAR ---
  const renderSidebarTabs = () => (
    <div className="flex border-b border-gray-200 shrink-0">
      <button onClick={() => setActiveTab("fields")} className={`flex-1 py-3 text-xs md:text-sm font-medium flex items-center justify-center gap-1 md:gap-2 ${activeTab === "fields" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}><LayoutTemplate className="w-4 h-4" /> Campos</button>
      <button onClick={() => setActiveTab("design")} className={`flex-1 py-3 text-xs md:text-sm font-medium flex items-center justify-center gap-1 md:gap-2 ${activeTab === "design" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}><Palette className="w-4 h-4" /> Estilo</button>
      <button onClick={() => setActiveTab("settings")} className={`flex-1 py-3 text-xs md:text-sm font-medium flex items-center justify-center gap-1 md:gap-2 ${activeTab === "settings" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}><Settings className="w-4 h-4" /> Config</button>
    </div>
  );

  const renderFieldsTab = () => (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h4 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider">Adicionar Elementos</h4>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => addField("text")} className="flex items-center gap-2 p-2.5 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 text-xs md:text-sm text-gray-700"><Type className="w-4 h-4 text-blue-500 shrink-0" /> Texto Curto</button>
          <button onClick={() => addField("email")} className="flex items-center gap-2 p-2.5 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 text-xs md:text-sm text-gray-700"><Mail className="w-4 h-4 text-blue-500 shrink-0" /> E-mail</button>
          <button onClick={() => addField("tel")} className="flex items-center gap-2 p-2.5 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 text-xs md:text-sm text-gray-700"><Phone className="w-4 h-4 text-blue-500 shrink-0" /> WhatsApp</button>
          <button onClick={() => addField("textarea")} className="flex items-center gap-2 p-2.5 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 text-xs md:text-sm text-gray-700"><AlignLeft className="w-4 h-4 text-blue-500 shrink-0" /> Texto Longo</button>
          <button onClick={() => addField("select")} className="flex items-center justify-center gap-2 p-2.5 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 text-xs md:text-sm text-gray-700 col-span-2"><List className="w-4 h-4 text-blue-500 shrink-0" /> Seleção</button>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider">Editor de Campo</h4>
        {activeFieldIndex !== null && config.fields[activeFieldIndex] ? (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4 relative">
            <h5 className="font-medium text-sm text-gray-900 flex items-center justify-between">Propriedades <button onClick={() => setActiveFieldIndex(null)} className="text-xs text-blue-500 hover:underline">Fechar</button></h5>
            <div className="space-y-3">
              <div><label className="text-xs text-gray-600 font-medium">Label</label><input type="text" value={config.fields[activeFieldIndex].label} onChange={(e) => updateField(activeFieldIndex, { label: e.target.value })} className="w-full mt-1 p-2 text-sm border border-gray-300 rounded outline-none" /></div>
              <div><label className="text-xs text-gray-600 font-medium">Placeholder</label><input type="text" value={config.fields[activeFieldIndex].placeholder} onChange={(e) => updateField(activeFieldIndex, { placeholder: e.target.value })} className="w-full mt-1 p-2 text-sm border border-gray-300 rounded outline-none" /></div>
              {config.fields[activeFieldIndex].type === 'select' && (
                <div><label className="text-xs text-gray-600 font-medium">Opções (separadas por vírgula)</label><input type="text" value={config.fields[activeFieldIndex].options || ""} onChange={(e) => updateField(activeFieldIndex, { options: e.target.value })} className="w-full mt-1 p-2 text-sm border border-gray-300 rounded outline-none" /></div>
              )}
              <div className="flex items-center gap-2 pt-1 pb-2">
                <input type="checkbox" id="req" checked={config.fields[activeFieldIndex].required} onChange={(e) => updateField(activeFieldIndex, { required: e.target.checked })} className="rounded text-blue-500" />
                <label htmlFor="req" className="text-sm text-gray-700 cursor-pointer">Obrigatório</label>
              </div>
              <div className="pt-3 border-t border-gray-200 space-y-3">
                <h6 className="text-xs font-semibold text-gray-900 uppercase">Estilo Individual</h6>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-gray-600">Fundo <input type="color" value={config.fields[activeFieldIndex].style?.bgColor || config.design.inputBgColor} onChange={(e) => updateFieldStyle(activeFieldIndex, 'bgColor', e.target.value)} className="w-full h-8 mt-1 p-0 border-0 rounded cursor-pointer" /></label>
                  <label className="text-xs text-gray-600">Borda <input type="color" value={config.fields[activeFieldIndex].style?.borderColor || config.design.inputBorderColor} onChange={(e) => updateFieldStyle(activeFieldIndex, 'borderColor', e.target.value)} className="w-full h-8 mt-1 p-0 border-0 rounded cursor-pointer" /></label>
                  <label className="text-xs text-gray-600">Texto <input type="color" value={config.fields[activeFieldIndex].style?.textColor || config.design.textColor} onChange={(e) => updateFieldStyle(activeFieldIndex, 'textColor', e.target.value)} className="w-full h-8 mt-1 p-0 border-0 rounded cursor-pointer" /></label>
                  <label className="text-xs text-gray-600">Raio <select value={config.fields[activeFieldIndex].style?.borderRadius || "0.375rem"} onChange={(e) => updateFieldStyle(activeFieldIndex, 'borderRadius', e.target.value)} className="w-full mt-1 p-1.5 border border-gray-300 rounded text-xs outline-none"><option value="0px">Quadrado</option><option value="0.375rem">Suave</option><option value="1rem">Largo</option></select></label>
                </div>
              </div>
            </div>
          </div>
        ) : (<div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-xs md:text-sm">Clique em um campo no Preview para editar.</div>)}
      </div>
    </div>
  );

  const renderDesignTab = () => (
    <div className="p-4 md:p-6 space-y-6">
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">Global</h4>
        <label className="flex items-center justify-between text-sm text-gray-700">Cor Principal (Botões) <input type="color" value={config.design.primaryColor} onChange={(e) => updateDesign('primaryColor', e.target.value)} className="w-6 h-6 rounded border-0 p-0 cursor-pointer" /></label>
        <label className="flex items-center justify-between text-sm text-gray-700">Cor de Fundo <input type="color" value={config.design.bgColor} onChange={(e) => updateDesign('bgColor', e.target.value)} className="w-6 h-6 rounded border-0 p-0 cursor-pointer" /></label>
        <label className="flex items-center justify-between text-sm text-gray-700">Cor do Texto <input type="color" value={config.design.textColor} onChange={(e) => updateDesign('textColor', e.target.value)} className="w-6 h-6 rounded border-0 p-0 cursor-pointer" /></label>
      </div>

      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">Dimensões do Formulário</h4>
        <div className="flex flex-col gap-2 mb-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="radio" name="widthType" className="cursor-pointer text-blue-600" checked={config.design.formWidthType === 'full'} onChange={() => updateDesign('formWidthType', 'full')} /> Total (100% da tela)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="radio" name="widthType" className="cursor-pointer text-blue-600" checked={config.design.formWidthType === 'manual'} onChange={() => updateDesign('formWidthType', 'manual')} /> Manual (px)
          </label>
        </div>
        {config.design.formWidthType === 'manual' && (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
            <input type="number" value={config.design.formWidthPx} onChange={(e) => updateDesign('formWidthPx', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
            <span className="text-sm text-gray-500">px</span>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">Cabeçalho</h4>
        <div className="space-y-2 p-3 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Título Principal</p>
          <div className="flex gap-2">
            <input type="color" value={config.content.titleStyle?.color || config.design.textColor} onChange={(e) => updateTitleStyle('color', e.target.value)} className="w-8 h-8 rounded border-0 p-0 shrink-0 cursor-pointer" />
            <select value={config.content.titleStyle?.fontSize || "30px"} onChange={(e) => updateTitleStyle('fontSize', e.target.value)} className="flex-1 p-1 border border-gray-300 rounded text-xs outline-none"><option value="20px">20px</option><option value="30px">30px</option><option value="36px">36px</option></select>
            <div className="flex border border-gray-300 rounded bg-white overflow-hidden shrink-0"><button onClick={() => updateTitleStyle('textAlign', 'left')} className="p-1.5 hover:bg-gray-100"><AlignLeft className="w-4 h-4 text-gray-600"/></button><button onClick={() => updateTitleStyle('textAlign', 'center')} className="p-1.5 hover:bg-gray-100"><AlignCenter className="w-4 h-4 text-gray-600"/></button><button onClick={() => updateTitleStyle('textAlign', 'right')} className="p-1.5 hover:bg-gray-100"><AlignRight className="w-4 h-4 text-gray-600"/></button></div>
          </div>
        </div>
        <div className="space-y-2 p-3 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Subtítulo</p>
          <div className="flex gap-2">
            <input type="color" value={config.content.subtitleStyle?.color || config.design.textColor} onChange={(e) => updateSubtitleStyle('color', e.target.value)} className="w-8 h-8 rounded border-0 p-0 shrink-0 cursor-pointer" />
            <select value={config.content.subtitleStyle?.fontSize || "14px"} onChange={(e) => updateSubtitleStyle('fontSize', e.target.value)} className="flex-1 p-1 border border-gray-300 rounded text-xs outline-none"><option value="12px">12px</option><option value="14px">14px</option><option value="18px">18px</option></select>
            <div className="flex border border-gray-300 rounded bg-white overflow-hidden shrink-0"><button onClick={() => updateSubtitleStyle('textAlign', 'left')} className="p-1.5 hover:bg-gray-100"><AlignLeft className="w-4 h-4 text-gray-600"/></button><button onClick={() => updateSubtitleStyle('textAlign', 'center')} className="p-1.5 hover:bg-gray-100"><AlignCenter className="w-4 h-4 text-gray-600"/></button><button onClick={() => updateSubtitleStyle('textAlign', 'right')} className="p-1.5 hover:bg-gray-100"><AlignRight className="w-4 h-4 text-gray-600"/></button></div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">Botão</h4>
        <label className="block text-sm text-gray-700 mb-1">Arredondamento</label>
        <select value={config.design.buttonRadius} onChange={(e) => updateDesign('buttonRadius', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm outline-none">
          <option value="0px">Quadrado (0px)</option>
          <option value="0.375rem">Suave (6px)</option>
          <option value="9999px">Pílula</option>
        </select>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="p-4 md:p-6 space-y-6">
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Ação do Formulário</h4>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={config.content.actionType === 'whatsapp'} onChange={(e) => updateContent('actionType', e.target.checked ? 'whatsapp' : 'database')} className="w-4 h-4 text-blue-600 rounded cursor-pointer" />
          <span className="text-sm font-medium text-gray-800">Abrir WhatsApp no Envio</span>
        </label>

        {config.content.actionType === 'whatsapp' ? (
          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Número Destino</label>
            <input type="text" value={config.content.whatsappNumber} onChange={(e) => updateContent('whatsappNumber', e.target.value)} placeholder="Ex: 5511999999999" className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
          </div>
        ) : (
          <div className="pt-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            Os dados serão salvos internamente no Banco de Dados (Tabela <code>ComponentData</code>).
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-2">Texto do Botão de Envio</label>
          <input type="text" value={config.content.submitText} onChange={(e) => updateContent('submitText', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Carregando Editor...</p>
      </div>
    );
  }

  const previewMaxWidth = config.design.formWidthType === 'full' ? '100%' : `${config.design.formWidthPx}px`;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans relative w-full">
      
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`absolute top-4 z-40 p-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition-all duration-300 ${isSidebarOpen ? 'left-[396px] hidden md:flex' : 'left-4 flex'}`}>
        {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
      </button>

      {!isSidebarOpen && (
        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-xl"><Settings className="w-6 h-6" /></button>
      )}

      <aside className={`fixed md:relative top-0 left-0 z-50 h-full w-[85%] sm:w-[380px] md:w-[380px] bg-white border-r border-gray-200 shadow-2xl md:shadow-xl flex flex-col shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0 md:ml-0" : "-translate-x-full md:translate-x-0 md:-ml-[380px]"}`}>
        <div className="p-4 border-b border-gray-200 bg-gray-900 text-white flex items-center justify-between shrink-0">
          <h2 className="font-semibold text-sm flex items-center gap-2"><Settings className="w-4 h-4" /> Editor</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50">
              {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Salvar
            </button>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 bg-white/10 rounded"><X className="w-5 h-5" /></button>
          </div>
        </div>
        {renderSidebarTabs()}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {activeTab === "fields" && renderFieldsTab()}
          {activeTab === "design" && renderDesignTab()}
          {activeTab === "settings" && renderSettingsTab()}
        </div>
      </aside>

      {isSidebarOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsSidebarOpen(false)} />}

      <main className="flex-1 h-full overflow-y-auto p-4 md:p-12 flex flex-col items-center justify-center relative custom-canvas-bg">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {/* WRAPPER COM ALÇAS (HANDLES) PARA REDIMENSIONAR */}
        {/* Se estiver redimensionando (isResizing), removemos a transição suave para evitar lag e o efeito elástico */}
        <div className={`w-full relative z-10 py-10 group/formwrapper ${isResizing ? '' : 'transition-all duration-300 ease-in-out'}`} style={{ fontFamily: `var(--${config.design.fontFamily})`, maxWidth: previewMaxWidth }}>
          
          {/* ALÇA ESQUERDA */}
          <div 
            onMouseDown={(e) => startResize(e, -1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 w-4 h-12 bg-white border border-gray-300 shadow hover:border-blue-500 cursor-ew-resize rounded-full opacity-0 group-hover/formwrapper:opacity-100 transition-all z-20 flex items-center justify-center"
          >
            <div className="w-0.5 h-6 bg-gray-400 rounded-full"></div>
          </div>

          {/* ALÇA DIREITA */}
          <div 
            onMouseDown={(e) => startResize(e, 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 w-4 h-12 bg-white border border-gray-300 shadow hover:border-blue-500 cursor-ew-resize rounded-full opacity-0 group-hover/formwrapper:opacity-100 transition-all z-20 flex items-center justify-center"
          >
            <div className="w-0.5 h-6 bg-gray-400 rounded-full"></div>
          </div>

          <div className="rounded-xl shadow-2xl overflow-hidden border border-gray-100 relative h-full w-full" style={{ backgroundColor: config.design.bgColor }}>
            
            <div className="px-6 py-8 md:p-8 md:pb-4 space-y-3">
              <input type="text" value={config.content.title} onChange={(e) => updateContent('title', e.target.value)} style={{ color: config.content.titleStyle?.color || config.design.textColor, fontSize: config.content.titleStyle?.fontSize || '30px', textAlign: config.content.titleStyle?.textAlign || 'center', fontWeight: 'bold' }} className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500/20 rounded hover:bg-gray-500/5 placeholder-gray-300" />
              <textarea value={config.content.subtitle} onChange={(e) => updateContent('subtitle', e.target.value)} style={{ color: config.content.subtitleStyle?.color || config.design.textColor, fontSize: config.content.subtitleStyle?.fontSize || '14px', textAlign: config.content.subtitleStyle?.textAlign || 'center' }} className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500/20 rounded resize-none hover:bg-gray-500/5 placeholder-gray-300" rows={2} />
            </div>

            <div className="px-6 pb-8 md:p-8 md:pt-2 space-y-4 min-h-[150px]">
              {config.fields.map((field, index) => {
                const fBgColor = field.style?.bgColor || config.design.inputBgColor;
                const fBorderColor = field.style?.borderColor || config.design.inputBorderColor;
                const fTextColor = field.style?.textColor || config.design.textColor;
                const fBorderRadius = field.style?.borderRadius || "0.375rem";

                return (
                  <div key={field.id} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} onDragEnd={handleDragEnd} onClick={() => { setActiveTab('fields'); setActiveFieldIndex(index); if (window.innerWidth < 768) setIsSidebarOpen(true); }} className={`relative group cursor-pointer transition-all duration-200 border-2 rounded-lg p-3 ${activeFieldIndex === index ? 'border-blue-500 bg-blue-50/20 shadow-sm' : 'border-transparent hover:border-dashed hover:border-gray-300'}`}>
                    <div className={`absolute -left-4 md:-left-10 top-1/2 -translate-y-1/2 flex-col gap-1 z-20 ${activeFieldIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 hidden md:flex'}`}>
                      <div className="p-1.5 md:p-2 bg-white rounded shadow border border-gray-100 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-700"><GripVertical className="w-4 h-4" /></div>
                    </div>
                    <button onClick={(e) => removeField(index, e)} className={`absolute right-2 top-2 p-1.5 bg-red-100 text-red-600 rounded opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-200 z-10 ${activeFieldIndex === index ? 'md:opacity-100' : ''}`}><Trash2 className="w-4 h-4" /></button>

                    <div className="space-y-1.5 pointer-events-none">
                      <label style={{ color: config.design.textColor }} className="block text-sm font-medium">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                      {field.type === 'textarea' ? <textarea placeholder={field.placeholder} disabled style={{ backgroundColor: fBgColor, borderColor: fBorderColor, color: fTextColor, borderRadius: fBorderRadius }} className="w-full p-3 border text-sm resize-none" rows={3} />
                      : field.type === 'select' ? <select disabled style={{ backgroundColor: fBgColor, borderColor: fBorderColor, color: fTextColor, borderRadius: fBorderRadius }} className="w-full p-3 border text-sm appearance-none"><option>{field.placeholder || "Selecione..."}</option></select>
                      : <input type={field.type} placeholder={field.placeholder} disabled style={{ backgroundColor: fBgColor, borderColor: fBorderColor, color: fTextColor, borderRadius: fBorderRadius }} className="w-full p-3 border text-sm" />}
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-4">
                <button type="button" style={{ backgroundColor: config.design.primaryColor, borderRadius: config.design.buttonRadius }} className="w-full py-3.5 text-white font-medium text-sm transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-lg">
                  {config.content.submitText}
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-canvas-bg { background-color: #f1f5f9; }
      `}} />
    </div>
  );
}