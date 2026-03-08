/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Type, Palette, List, Settings, GripVertical, Trash2, 
  LayoutTemplate, Phone, Mail, AlignLeft, ChevronDown, 
  X, PanelLeftClose, PanelLeftOpen, AlignCenter, AlignRight, 
  Save, Loader2, MousePointerSquareDashed, Layers, Heading, ArrowLeft
} from "lucide-react";

type FieldType = "header" | "text" | "email" | "tel" | "textarea" | "select" | "button";
type FieldWidth = "100%" | "75%" | "50%" | "33.33%" | "25%" | "auto";

interface TextStyle { color?: string; fontSize?: string; textAlign?: "left" | "center" | "right"; }
interface FieldStyle { bgColor?: string; textColor?: string; borderColor?: string; borderRadius?: string; }

interface FormField {
  id: string; 
  type: FieldType; 
  label: string; 
  nameAttr?: string; 
  placeholder: string; 
  required: boolean; 
  options?: string; 
  style?: FieldStyle; 
  width?: FieldWidth; 
  buttonAction?: "submit" | "reset" | "button"; 
}

interface FormDesign {
  primaryColor: string; bgColor: string; textColor: string; fontFamily: string; buttonRadius: string; inputBgColor: string; inputBorderColor: string; formWidthType: "full" | "manual"; formWidthPx: string; formPadding: string; 
}

interface FormContent {
  titleStyle?: TextStyle; 
  subtitleStyle?: TextStyle; 
  actionType: "whatsapp" | "database"; 
  whatsappNumber: string; 
  whatsappMessage: string; 
}

interface VisualFormConfig { design: FormDesign; content: FormContent; fields: FormField[]; }

const defaultConfig: VisualFormConfig = {
  design: { primaryColor: "#3B82F6", bgColor: "#ffffff", textColor: "#1f2937", fontFamily: "font-sans", buttonRadius: "0.5rem", inputBgColor: "#ffffff", inputBorderColor: "#d1d5db", formWidthType: "manual", formWidthPx: "600", formPadding: "32" },
  content: { 
    titleStyle: { fontSize: "30px", textAlign: "center", color: "#111827" }, 
    subtitleStyle: { fontSize: "14px", textAlign: "center", color: "#6b7280" }, 
    actionType: "database", 
    whatsappNumber: "5511999999999",
    whatsappMessage: "Olá! Gostaria de mais informações.\n\n{dados_formulario}"
  },
  fields: [
    { id: "header-1", type: "header", label: "Novo Formulário", placeholder: "Edite os campos como quiser.", required: false, width: "100%" },
    { id: "btn1", type: "button", label: "Enviar", placeholder: "", required: false, width: "100%", buttonAction: "submit" }
  ]
};

interface VisualFormBuilderLayoutProps {
  initialId?: string | null;
  initialConfig?: any;
  initialName?: string; 
}

export default function VisualFormBuilderLayout({ initialId, initialConfig, initialName }: VisualFormBuilderLayoutProps) {
  
  const [config, setConfig] = useState<VisualFormConfig>(() => {
    if (!initialConfig) return defaultConfig;
    const loadedConfig = { ...initialConfig };
    
    if (!loadedConfig.content.whatsappMessage) {
      loadedConfig.content.whatsappMessage = defaultConfig.content.whatsappMessage;
    }

    const newFields = [...(loadedConfig.fields || [])];
    if (!newFields.some((f: FormField) => f.type === 'header')) newFields.unshift({ id: 'header-migrated', type: 'header', label: "Formulário", placeholder: "", required: false, width: '100%' });
    if (!newFields.some((f: FormField) => f.type === 'button')) newFields.push({ id: 'btn-migrated', type: 'button', label: "Enviar", placeholder: "", required: false, width: "100%", buttonAction: "submit" });
    loadedConfig.fields = newFields;
    return loadedConfig as VisualFormConfig;
  });

  const [componentId, setComponentId] = useState<string | null>(initialId || null); 
  const [formName, setFormName] = useState<string>(initialName || "Novo Formulário");

  const [activeTab, setActiveTab] = useState<"fields" | "design" | "settings">("fields");
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [activeFieldIndex, setActiveFieldIndex] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isResizing, setIsResizing] = useState(false);
  const resizeData = useRef({ startX: 0, startWidth: 0, direction: 1 });

  useEffect(() => {
    if (initialName) setFormName(initialName);
    if (initialId) setComponentId(initialId);
    if (initialConfig) {
      const loadedConfig = { ...initialConfig };
      
      if (!loadedConfig.content.whatsappMessage) {
        loadedConfig.content.whatsappMessage = defaultConfig.content.whatsappMessage;
      }

      const newFields = [...(loadedConfig.fields || [])];
      if (!newFields.some((f: FormField) => f.type === 'header')) newFields.unshift({ id: 'header-migrated', type: 'header', label: "Formulário", placeholder: "", required: false, width: '100%' });
      if (!newFields.some((f: FormField) => f.type === 'button')) newFields.push({ id: 'btn-migrated', type: 'button', label: "Enviar", placeholder: "", required: false, width: "100%", buttonAction: "submit" });
      loadedConfig.fields = newFields;
      setConfig(loadedConfig as VisualFormConfig);
    }
  }, [initialName, initialId, initialConfig]);

  const startResize = (e: React.MouseEvent, direction: 1 | -1) => {
    e.preventDefault(); setIsResizing(true);
    resizeData.current = { startX: e.clientX, startWidth: parseInt(config.design.formWidthPx) || 600, direction };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const deltaX = (e.clientX - resizeData.current.startX) * resizeData.current.direction;
      const newWidth = Math.max(320, resizeData.current.startWidth + deltaX * 2);
      setConfig(prev => ({ ...prev, design: { ...prev.design, formWidthType: 'manual', formWidthPx: Math.round(newWidth).toString() } }));
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); document.body.style.userSelect = 'none'; } 
    else { document.body.style.userSelect = ''; }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); document.body.style.userSelect = ''; };
  }, [isResizing]);

  const updateDesign = (key: keyof FormDesign, value: string) => setConfig(prev => ({ ...prev, design: { ...prev.design, [key]: value } }));
  const updateContent = (key: keyof FormContent, value: any) => setConfig(prev => ({ ...prev, content: { ...prev.content, [key]: value } }));
  
  // Helper para padronizar o nome das variáveis e input names
  const getFieldName = (f: FormField) => f.nameAttr?.trim() || f.label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || f.id;

  const addField = (type: FieldType) => {
    const baseName = type === 'email' ? 'email' : type === 'tel' ? 'telefone' : type === 'button' ? 'botao' : type === 'header' ? 'titulo' : 'campo';
    const newField: FormField = { 
      id: `field-${Date.now()}`, 
      type, 
      label: type === 'email' ? 'E-mail' : type === 'tel' ? 'Telefone' : type === 'button' ? 'Botão' : type === 'header' ? 'Título' : 'Novo Campo', 
      nameAttr: `${baseName}_${Date.now().toString().slice(-4)}`, 
      placeholder: type === 'header' ? 'Digite uma descrição breve.' : '', 
      required: false, 
      width: "100%", 
      buttonAction: type === 'button' ? 'submit' : undefined 
    };
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
  const removeField = (index: number, e?: React.MouseEvent) => { if(e) e.stopPropagation(); const newFields = [...config.fields]; newFields.splice(index, 1); setConfig(prev => ({ ...prev, fields: newFields })); setActiveFieldIndex(null); };

  const handleDragStart = (e: React.DragEvent, index: number) => { setDraggingIndex(index); e.dataTransfer.effectAllowed = "move"; setTimeout(() => { (e.target as HTMLElement).style.opacity = "0.4"; }, 0); };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); if (draggingIndex === null || draggingIndex === index) return;
    const newFields = [...config.fields]; const draggedItem = newFields[draggingIndex];
    newFields.splice(draggingIndex, 1); newFields.splice(index, 0, draggedItem);
    setConfig(prev => ({ ...prev, fields: newFields })); setDraggingIndex(index);
  };
  const handleDragEnd = (e: React.DragEvent) => { (e.target as HTMLElement).style.opacity = "1"; setDraggingIndex(null); };

  const generateHTML = (conf: VisualFormConfig, finalFormName: string) => {
    const scopedClass = `form-{{COMPONENT_ID}}`;
    const formId = `fid-{{COMPONENT_ID}}`;
    const formMaxWidth = conf.design.formWidthType === 'full' ? '100%' : `${conf.design.formWidthPx}px`;

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    const fieldsHtml = conf.fields.map(f => {
      const isButton = f.type === 'button';
      const isHeader = f.type === 'header';
      const inlineStyle = [];
      
      if (!isHeader) {
        if (f.style?.bgColor) inlineStyle.push(`background-color: ${f.style.bgColor}`); else if (isButton) inlineStyle.push(`background-color: ${f.buttonAction === 'reset' ? 'transparent' : conf.design.primaryColor}`); else inlineStyle.push(`background-color: ${conf.design.inputBgColor}`);
        if (f.style?.borderColor) inlineStyle.push(`border-color: ${f.style.borderColor}`); else if (isButton) inlineStyle.push(`border-color: ${f.buttonAction === 'reset' ? conf.design.primaryColor : 'transparent'}`); else inlineStyle.push(`border-color: ${conf.design.inputBorderColor}`);
        if (f.style?.textColor) inlineStyle.push(`color: ${f.style.textColor}`); else if (isButton) inlineStyle.push(`color: ${f.buttonAction === 'reset' ? conf.design.primaryColor : '#ffffff'}`); else inlineStyle.push(`color: ${conf.design.textColor}`);
        if (f.style?.borderRadius) inlineStyle.push(`border-radius: ${f.style.borderRadius}`); else if (isButton) inlineStyle.push(`border-radius: ${conf.design.buttonRadius}`); else inlineStyle.push(`border-radius: 0.375rem`);
      }
      
      const styleStr = inlineStyle.length > 0 ? `style="${inlineStyle.join('; ')}${isButton && f.buttonAction === 'reset' ? '; border-width: 1px; border-style: solid;' : ''}"` : '';
      
      const inputName = getFieldName(f);
      const widthStyle = f.width === 'auto' ? 'width: auto; flex: 0 0 auto;' : `width: ${f.width || '100%'}; flex: 0 0 ${f.width || '100%'};`;

      let contentHtml = "";
      if (isHeader) {
        const titleStyleStr = `color: ${conf.content.titleStyle?.color || conf.design.textColor}; font-size: ${conf.content.titleStyle?.fontSize || '30px'}; text-align: ${conf.content.titleStyle?.textAlign || 'center'}; margin: 0 0 0.5rem 0; font-weight: bold; line-height: 1.2;`;
        const subtitleStyleStr = `color: ${conf.content.subtitleStyle?.color || conf.design.textColor}; font-size: ${conf.content.subtitleStyle?.fontSize || '14px'}; text-align: ${conf.content.subtitleStyle?.textAlign || 'center'}; margin: 0 0 1.5rem 0; line-height: 1.4;`;
        contentHtml = `<div style="width: 100%; padding-bottom: 1rem;"><h2 style="${titleStyleStr}">${f.label}</h2>${f.placeholder ? `<p style="${subtitleStyleStr}">${f.placeholder}</p>` : ''}</div>`;
      } else if (isButton) {
        contentHtml = `<button type="${f.buttonAction || 'submit'}" class="form-btn" ${styleStr} name="${inputName}">${f.label}</button>`;
      } else {
        const labelHtml = `<label for="${inputName}">${f.label} ${f.required ? '<span class="req">*</span>' : ''}</label>`;
        let inputHtml = "";
        if (f.type === 'textarea') inputHtml = `<textarea id="${inputName}" name="${inputName}" placeholder="${f.placeholder}" ${f.required ? 'required' : ''} ${styleStr} rows="3"></textarea>`;
        else if (f.type === 'select') {
          const opts = (f.options || "").split(',').map(o => `<option value="${o.trim()}">${o.trim()}</option>`).join('');
          inputHtml = `<select id="${inputName}" name="${inputName}" ${f.required ? 'required' : ''} ${styleStr}><option value="">${f.placeholder}</option>${opts}</select>`;
        } else inputHtml = `<input id="${inputName}" type="${f.type}" name="${inputName}" placeholder="${f.placeholder}" ${f.required ? 'required' : ''} ${styleStr} />`;
        contentHtml = labelHtml + inputHtml;
      }

      return `<div class="field-col" style="${widthStyle}">${contentHtml}</div>`;
    }).join('');

    const hiddenInputs = `
      <input type="hidden" name="componentId" value="{{COMPONENT_ID}}" />
      <input type="hidden" name="componentName" value="${finalFormName}" />
    `;

    let successAction = `alert('Enviado com sucesso!'); form.reset();`;
    
    if (conf.content.actionType === 'whatsapp') {
      const templateBase = (conf.content.whatsappMessage || "Olá! Seguem meus dados:\\n\\n{dados_formulario}").replace(/`/g, '\\`');
      
      successAction = `
        const formDataObj = new FormData(form);
        let finalMessage = \`${templateBase}\`;
        let formValuesText = '';
        
        for (let [key, value] of formDataObj.entries()) {
          if (key !== 'componentId' && key !== 'componentName' && value.trim() !== '') {
            // Substituição de variáveis especificas (ex: {nome})
            const regex = new RegExp('\\\\{' + key + '\\\\}', 'g');
            if(finalMessage.match(regex)) {
              finalMessage = finalMessage.replace(regex, value);
            } else {
              // Se não estiver especificado no texto, adiciona no {dados_formulario}
              formValuesText += key + ': ' + value + '\\n';
            }
          }
        }
        
        // Substitui a tag geral pelo restante dos campos
        finalMessage = finalMessage.replace('{dados_formulario}', formValuesText);
        
        let encodedMessage = encodeURIComponent(finalMessage);
        window.open('https://api.whatsapp.com/send?phone=${conf.content.whatsappNumber}&text=' + encodedMessage, '_blank');
        form.reset();
      `;
    }

    const onSubmitJs = `
      event.preventDefault(); 
      var form=this; 
      var btn=form.querySelector('button[type=submit]'); 
      if(btn){
        var orig=btn.innerHTML; 
        btn.innerHTML='Enviando...'; 
        btn.disabled=true;
      } 
      fetch('${baseUrl}/api/components/submit', {method:'POST', body: new FormData(form)})
        .finally(() => { 
          if(btn){btn.innerHTML=orig; btn.disabled=false;} 
          ${successAction} 
        });
    `;

    return `
      <style>
        .${scopedClass} { background-color: ${conf.design.bgColor}; font-family: ${conf.design.fontFamily}, system-ui, sans-serif; padding: ${conf.design.formPadding}px; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); box-sizing: border-box; width: 100%; max-width: ${formMaxWidth}; margin: 0 auto; }
        .${scopedClass} * { box-sizing: border-box; }
        .${scopedClass} .form-row { display: flex; flex-wrap: wrap; margin-left: -0.5rem; margin-right: -0.5rem; row-gap: 0.5rem; align-items: flex-end; }
        .${scopedClass} .field-col { padding-left: 0.5rem; padding-right: 0.5rem; margin-bottom: 0.5rem; }
        .${scopedClass} label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.35rem; color: ${conf.design.textColor}; }
        .${scopedClass} label .req { color: #ef4444; }
        .${scopedClass} input, .${scopedClass} select, .${scopedClass} textarea { width: 100%; padding: 0.75rem; border-width: 1px; border-style: solid; font-family: inherit; transition: all 0.2s; }
        .${scopedClass} input:focus, .${scopedClass} select:focus, .${scopedClass} textarea:focus { outline: none; border-color: ${conf.design.primaryColor} !important; box-shadow: 0 0 0 3px ${conf.design.primaryColor}30; }
        .${scopedClass} button.form-btn { width: 100%; padding: 0.875rem 1.5rem; border: none; font-weight: 600; cursor: pointer; transition: filter 0.2s, transform 0.1s; display: flex; justify-content: center; align-items: center; }
        .${scopedClass} button.form-btn:hover { filter: brightness(0.9); }
        .${scopedClass} button.form-btn:active { transform: scale(0.98); }
        .${scopedClass} button.form-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        @media (max-width: 640px) { .${scopedClass} .field-col { width: 100% !important; flex: 0 0 100% !important; } }
      </style>
      <div class="${scopedClass}">
        <form id="${formId}" onsubmit="${onSubmitJs}">
          ${hiddenInputs}
          <div class="form-row">${fieldsHtml}</div>
        </form>
      </div>
    `.replace(/\s+/g, ' ').trim(); 
  };

  const handleSave = async () => {
    setIsSaving(true);
    const finalFormName = formName || "Formulário Sem Nome";
    const generatedHtml = generateHTML(config, finalFormName);
    
    const payload = { id: componentId, name: finalFormName, config: config, html: generatedHtml };
    try {
      const res = await fetch("/api/components", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) { 
        setComponentId(data.component.id); 
        if (!componentId) window.history.replaceState(null, '', `/formularios-acoes/${data.component.id}`);
        alert("Salvo com sucesso!"); 
      } else alert("Erro ao salvar.");
    } catch (error) { console.error(error); alert("Erro de conexão ao salvar."); } 
    finally { setIsSaving(false); }
  };

  const renderSidebarTabs = () => (
    <div className="flex border-b border-gray-200 shrink-0">
      <button onClick={() => setActiveTab("fields")} className={`flex-1 py-3 text-xs md:text-sm font-medium flex items-center justify-center gap-1 md:gap-2 ${activeTab === "fields" ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50/50" : "text-gray-500 hover:bg-gray-50"}`}><LayoutTemplate className="w-4 h-4" /> Estrutura</button>
      <button onClick={() => setActiveTab("design")} className={`flex-1 py-3 text-xs md:text-sm font-medium flex items-center justify-center gap-1 md:gap-2 ${activeTab === "design" ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50/50" : "text-gray-500 hover:bg-gray-50"}`}><Palette className="w-4 h-4" /> Estilo</button>
      <button onClick={() => setActiveTab("settings")} className={`flex-1 py-3 text-xs md:text-sm font-medium flex items-center justify-center gap-1 md:gap-2 ${activeTab === "settings" ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50/50" : "text-gray-500 hover:bg-gray-50"}`}><Settings className="w-4 h-4" /> Ações</button>
    </div>
  );

  const renderFieldsTab = () => (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h4 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider">Adicionar Bloco</h4>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => addField("header")} className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 text-xs md:text-sm text-gray-700"><Heading className="w-4 h-4 text-blue-500" /> Títulos</button>
          <button onClick={() => addField("text")} className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 text-xs md:text-sm text-gray-700"><Type className="w-4 h-4 text-blue-500" /> Texto</button>
          <button onClick={() => addField("email")} className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 text-xs md:text-sm text-gray-700"><Mail className="w-4 h-4 text-blue-500" /> E-mail</button>
          <button onClick={() => addField("tel")} className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 text-xs md:text-sm text-gray-700"><Phone className="w-4 h-4 text-blue-500" /> WhatsApp</button>
          <button onClick={() => addField("select")} className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 text-xs md:text-sm text-gray-700"><List className="w-4 h-4 text-blue-500" /> Dropdown</button>
          <button onClick={() => addField("textarea")} className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 text-xs md:text-sm text-gray-700"><AlignLeft className="w-4 h-4 text-blue-500" /> T. Longo</button>
          <button onClick={() => addField("button")} className="col-span-2 flex justify-center items-center gap-2 p-2 border border-gray-200 bg-gray-900 text-white rounded hover:bg-gray-800 text-xs md:text-sm"><MousePointerSquareDashed className="w-4 h-4 text-white" /> Botão de Ação</button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-5">
        <h4 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2"><Layers className="w-4 h-4 text-blue-500" /> Estrutura do Form</h4>
        <div className="space-y-1.5">
          {config.fields.map((f, i) => (
            <div key={f.id} draggable onDragStart={(e) => handleDragStart(e, i)} onDragOver={(e) => handleDragOver(e, i)} onDragEnd={handleDragEnd} onClick={() => setActiveFieldIndex(i)} className={`p-2 flex justify-between items-center border rounded text-xs cursor-grab active:cursor-grabbing transition-colors ${activeFieldIndex === i ? 'bg-blue-50 border-blue-400 text-blue-800' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
              <div className="flex items-center gap-2 truncate"><GripVertical className="w-3.5 h-3.5 text-gray-400 shrink-0" /><span className="truncate font-medium">{f.label || (f.type === 'header' ? 'Cabeçalho' : f.type === 'button' ? 'Botão' : 'Sem Nome')} <span className="text-[10px] text-gray-400 font-normal ml-1">({f.type})</span></span></div>
              <button onClick={(e) => removeField(i, e)} className="text-gray-400 hover:text-red-500 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-5">
        <h4 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider">Editor de Propriedades</h4>
        {activeFieldIndex !== null && config.fields[activeFieldIndex] ? (
          <div className="p-4 bg-blue-50/30 rounded-lg border border-blue-200 space-y-4 relative">
            <h5 className="font-medium text-sm text-gray-900 flex items-center justify-between">{config.fields[activeFieldIndex].type === 'button' ? 'Botão' : config.fields[activeFieldIndex].type === 'header' ? 'Cabeçalho' : 'Campo'} <button onClick={() => setActiveFieldIndex(null)} className="text-xs text-blue-600 hover:underline">Fechar</button></h5>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 font-medium">Largura (Lado a Lado)</label>
                <select value={config.fields[activeFieldIndex].width || "100%"} onChange={(e) => updateField(activeFieldIndex, { width: e.target.value as FieldWidth })} className="w-full mt-1 p-2 text-sm border border-gray-300 rounded outline-none focus:border-blue-500"><option value="100%">Linha Inteira (100%)</option><option value="75%">Grande (75%)</option><option value="50%">Metade (50%)</option><option value="33.33%">Terço (33%)</option><option value="25%">Quarto (25%)</option><option value="auto">Automático (Tamanho do Conteúdo)</option></select>
              </div>

              {config.fields[activeFieldIndex].type === 'button' ? (
                <>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Nome de Identificação (Name)</label>
                    <input type="text" value={config.fields[activeFieldIndex].nameAttr || ""} onChange={(e) => updateField(activeFieldIndex, { nameAttr: e.target.value })} placeholder="Ex: botao_enviar" className="w-full mt-1 p-2 text-sm border border-gray-300 rounded outline-none font-mono" />
                  </div>
                  <div><label className="text-xs text-gray-600 font-medium">Texto do Botão</label><input type="text" value={config.fields[activeFieldIndex].label} onChange={(e) => updateField(activeFieldIndex, { label: e.target.value })} className="w-full mt-1 p-2 text-sm border border-gray-300 rounded outline-none" /></div>
                  <div><label className="text-xs text-gray-600 font-medium">Ação</label><select value={config.fields[activeFieldIndex].buttonAction || "submit"} onChange={(e) => updateField(activeFieldIndex, { buttonAction: e.target.value as any })} className="w-full mt-1 p-2 text-sm border border-gray-300 rounded outline-none"><option value="submit">Enviar Formulário (Salvar)</option><option value="reset">Limpar Formulário (Reset)</option><option value="button">Apenas Visual / Decorativo</option></select></div>
                </>
              ) : config.fields[activeFieldIndex].type === 'header' ? (
                <>
                  <div><label className="text-xs text-gray-600 font-medium">Título Principal</label><input type="text" value={config.fields[activeFieldIndex].label} onChange={(e) => updateField(activeFieldIndex, { label: e.target.value })} className="w-full mt-1 p-2 text-sm border border-gray-300 rounded outline-none" /></div>
                  <div><label className="text-xs text-gray-600 font-medium">Subtítulo (Opcional)</label><textarea value={config.fields[activeFieldIndex].placeholder} onChange={(e) => updateField(activeFieldIndex, { placeholder: e.target.value })} className="w-full mt-1 p-2 text-sm border border-gray-300 rounded outline-none resize-none" rows={3} /></div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs text-gray-600 font-medium">Nome de Identificação (Variavel para uso)</label>
                    <input type="text" value={config.fields[activeFieldIndex].nameAttr || ""} onChange={(e) => updateField(activeFieldIndex, { nameAttr: e.target.value })} placeholder="Ex: nome_cliente" className="w-full mt-1 p-2 text-sm border border-gray-300 rounded outline-none font-mono" />
                  </div>
                  <div><label className="text-xs text-gray-600 font-medium">Label (Rótulo)</label><input type="text" value={config.fields[activeFieldIndex].label} onChange={(e) => updateField(activeFieldIndex, { label: e.target.value })} className="w-full mt-1 p-2 text-sm border border-gray-300 rounded outline-none" /></div>
                  <div><label className="text-xs text-gray-600 font-medium">Placeholder</label><input type="text" value={config.fields[activeFieldIndex].placeholder} onChange={(e) => updateField(activeFieldIndex, { placeholder: e.target.value })} className="w-full mt-1 p-2 text-sm border border-gray-300 rounded outline-none" /></div>
                  {config.fields[activeFieldIndex].type === 'select' && (<div><label className="text-xs text-gray-600 font-medium">Opções (separadas por vírgula)</label><input type="text" value={config.fields[activeFieldIndex].options || ""} onChange={(e) => updateField(activeFieldIndex, { options: e.target.value })} className="w-full mt-1 p-2 text-sm border border-gray-300 rounded outline-none" /></div>)}
                  <div className="flex items-center gap-2 pt-1 pb-2"><input type="checkbox" id="req" checked={config.fields[activeFieldIndex].required} onChange={(e) => updateField(activeFieldIndex, { required: e.target.checked })} className="rounded text-blue-500 cursor-pointer" /><label htmlFor="req" className="text-sm text-gray-700 cursor-pointer">Obrigatório</label></div>
                </>
              )}

              {config.fields[activeFieldIndex].type !== 'header' && (
                <div className="pt-3 border-t border-gray-200 space-y-3">
                  <h6 className="text-xs font-semibold text-gray-900 uppercase">Estilo Exclusivo</h6>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs text-gray-600">Fundo <input type="color" value={config.fields[activeFieldIndex].style?.bgColor || (config.fields[activeFieldIndex].type === 'button' ? (config.fields[activeFieldIndex].buttonAction === 'reset' ? '#ffffff' : config.design.primaryColor) : config.design.inputBgColor)} onChange={(e) => updateFieldStyle(activeFieldIndex, 'bgColor', e.target.value)} className="w-full h-8 mt-1 p-0 border-0 rounded cursor-pointer" /></label>
                    <label className="text-xs text-gray-600">Borda <input type="color" value={config.fields[activeFieldIndex].style?.borderColor || (config.fields[activeFieldIndex].type === 'button' ? (config.fields[activeFieldIndex].buttonAction === 'reset' ? config.design.primaryColor : 'transparent') : config.design.inputBorderColor)} onChange={(e) => updateFieldStyle(activeFieldIndex, 'borderColor', e.target.value)} className="w-full h-8 mt-1 p-0 border-0 rounded cursor-pointer" /></label>
                    <label className="text-xs text-gray-600">Texto <input type="color" value={config.fields[activeFieldIndex].style?.textColor || (config.fields[activeFieldIndex].type === 'button' ? (config.fields[activeFieldIndex].buttonAction === 'reset' ? config.design.primaryColor : '#ffffff') : config.design.textColor)} onChange={(e) => updateFieldStyle(activeFieldIndex, 'textColor', e.target.value)} className="w-full h-8 mt-1 p-0 border-0 rounded cursor-pointer" /></label>
                    <label className="text-xs text-gray-600">Raio <select value={config.fields[activeFieldIndex].style?.borderRadius || (config.fields[activeFieldIndex].type==='button' ? config.design.buttonRadius : "0.375rem")} onChange={(e) => updateFieldStyle(activeFieldIndex, 'borderRadius', e.target.value)} className="w-full mt-1 p-1.5 border border-gray-300 rounded text-xs outline-none"><option value="0px">Quadrado</option><option value="0.375rem">Suave</option><option value="1rem">Largo</option><option value="9999px">Pílula</option></select></label>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (<div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-xs md:text-sm">Selecione um item na estrutura ou no preview.</div>)}
      </div>
    </div>
  );

  const renderDesignTab = () => (
    <div className="p-4 md:p-6 space-y-6">
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">Global</h4>
        <label className="flex items-center justify-between text-sm text-gray-700">Cor Principal (Botões) <input type="color" value={config.design.primaryColor} onChange={(e) => updateDesign('primaryColor', e.target.value)} className="w-6 h-6 rounded border-0 p-0 cursor-pointer shadow-sm" /></label>
        <label className="flex items-center justify-between text-sm text-gray-700">Cor Fundo Form <input type="color" value={config.design.bgColor} onChange={(e) => updateDesign('bgColor', e.target.value)} className="w-6 h-6 rounded border-0 p-0 cursor-pointer shadow-sm" /></label>
        <label className="flex items-center justify-between text-sm text-gray-700">Cor Texto Base <input type="color" value={config.design.textColor} onChange={(e) => updateDesign('textColor', e.target.value)} className="w-6 h-6 rounded border-0 p-0 cursor-pointer shadow-sm" /></label>
        <label className="flex items-center justify-between text-sm text-gray-700">Fundo Inputs <input type="color" value={config.design.inputBgColor} onChange={(e) => updateDesign('inputBgColor', e.target.value)} className="w-6 h-6 rounded border-0 p-0 cursor-pointer shadow-sm" /></label>
        <label className="flex items-center justify-between text-sm text-gray-700">Borda Inputs <input type="color" value={config.design.inputBorderColor} onChange={(e) => updateDesign('inputBorderColor', e.target.value)} className="w-6 h-6 rounded border-0 p-0 cursor-pointer shadow-sm" /></label>
      </div>

      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">Dimensões e Espaçamento</h4>
        <div className="flex flex-col gap-2 mb-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="radio" name="widthType" className="cursor-pointer text-blue-600" checked={config.design.formWidthType === 'full'} onChange={() => updateDesign('formWidthType', 'full')} /> Largura Total (100%)</label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="radio" name="widthType" className="cursor-pointer text-blue-600" checked={config.design.formWidthType === 'manual'} onChange={() => updateDesign('formWidthType', 'manual')} /> Definir Manual (px)</label>
        </div>
        {config.design.formWidthType === 'manual' && (<div className="flex items-center gap-2"><input type="number" value={config.design.formWidthPx} onChange={(e) => updateDesign('formWidthPx', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" /><span className="text-sm text-gray-500">px</span></div>)}
        <div className="pt-2"><label className="flex justify-between text-sm text-gray-700 mb-2"><span>Padding (Respiro Interno)</span> <span className="text-gray-500 font-mono">{config.design.formPadding}px</span></label><input type="range" min="0" max="100" value={config.design.formPadding} onChange={(e) => updateDesign('formPadding', e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" /></div>
      </div>
      
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">Forma Global</h4>
        <label className="block text-sm text-gray-700 mb-1">Arredondamento Padrão de Botões</label>
        <select value={config.design.buttonRadius} onChange={(e) => updateDesign('buttonRadius', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm outline-none"><option value="0px">Quadrado (0px)</option><option value="0.375rem">Suave (6px)</option><option value="1rem">Largo</option><option value="9999px">Pílula</option></select>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="p-4 md:p-6 space-y-6">
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Destino de Envio</h4>
        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={config.content.actionType === 'whatsapp'} onChange={(e) => updateContent('actionType', e.target.checked ? 'whatsapp' : 'database')} className="w-4 h-4 text-blue-600 rounded cursor-pointer" /><span className="text-sm font-medium text-gray-800">Direcionar para WhatsApp</span></label>
        
        {config.content.actionType === 'whatsapp' ? (
          <div className="pt-2 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Número Destino</label>
              <input type="text" value={config.content.whatsappNumber} onChange={(e) => updateContent('whatsappNumber', e.target.value)} placeholder="Ex: 5511999999999" className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mensagem de Redirecionamento</label>
              <textarea 
                value={config.content.whatsappMessage} 
                onChange={(e) => updateContent('whatsappMessage', e.target.value)} 
                placeholder="Ex: Olá! Seguem meus dados:\n\n{dados_formulario}" 
                rows={4}
                className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 resize-y" 
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Variáveis disponíveis: <strong className="text-blue-600">{`{dados_formulario}`}</strong> (para todos os dados), 
                {config.fields.filter(f => !['header', 'button'].includes(f.type)).map(f => (
                  <span key={f.id} className="text-blue-600 font-mono ml-1">{`{${getFieldName(f)}}`}</span>
                ))}
              </p>
            </div>
          </div>
        ) : (
          <div className="pt-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            Os dados serão capturados e salvos no Banco de Dados.
          </div>
        )}
        <p className="text-[11px] text-gray-500 border-t border-gray-200 pt-2 mt-2">Independente da escolha acima, todos os formulários são salvos no painel do sistema para registro (leads).</p>
      </div>
    </div>
  );

  const previewMaxWidth = config.design.formWidthType === 'full' ? '100%' : `${config.design.formWidthPx}px`;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans relative w-full">
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`absolute top-4 z-40 p-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition-all duration-300 ${isSidebarOpen ? 'left-[396px] hidden md:flex' : 'left-4 flex'}`}><PanelLeftOpen className="w-5 h-5" /></button>
      {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-xl"><Settings className="w-6 h-6" /></button>}

      <aside className={`fixed md:relative top-0 left-0 z-50 h-full w-[85%] sm:w-[380px] md:w-[380px] bg-white border-r border-gray-200 shadow-2xl md:shadow-xl flex flex-col shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0 md:ml-0" : "-translate-x-full md:translate-x-0 md:-ml-[380px]"}`}>
        
        <div className="p-4 border-b border-gray-200 bg-gray-900 text-white shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <Link href="/formularios-acoes" className="text-gray-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Voltar</Link>
            <div className="flex items-center gap-2">
              <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50">
                {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Salvar
              </button>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 bg-white/10 rounded hover:bg-white/20"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 text-gray-400"><Settings className="w-3.5 h-3.5" /><span className="text-[11px] font-semibold uppercase tracking-wider">Editor Visual</span></div>
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded px-2.5 py-1.5 text-sm font-medium text-white outline-none transition-colors" placeholder="Nome interno do formulário" title="Nome do formulário no banco de dados" />
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
        
        <div className={`w-full relative z-10 py-10 group/formwrapper ${isResizing ? '' : 'transition-all duration-300 ease-in-out'}`} style={{ fontFamily: `var(--${config.design.fontFamily})`, maxWidth: previewMaxWidth }}>
          <div onMouseDown={(e) => startResize(e, -1)} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 w-4 h-12 bg-white border border-gray-300 shadow hover:border-blue-500 cursor-ew-resize rounded-full opacity-0 group-hover/formwrapper:opacity-100 transition-all z-20 flex items-center justify-center"><div className="w-0.5 h-6 bg-gray-400 rounded-full"></div></div>
          <div onMouseDown={(e) => startResize(e, 1)} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 w-4 h-12 bg-white border border-gray-300 shadow hover:border-blue-500 cursor-ew-resize rounded-full opacity-0 group-hover/formwrapper:opacity-100 transition-all z-20 flex items-center justify-center"><div className="w-0.5 h-6 bg-gray-400 rounded-full"></div></div>

          <div className="rounded-xl shadow-2xl overflow-hidden border border-gray-100 relative h-full w-full transition-all" style={{ backgroundColor: config.design.bgColor, padding: `${config.design.formPadding}px` }}>
            
            <div className="flex flex-wrap -mx-2 row-gap-2">
              {config.fields.map((field, index) => {
                const isButton = field.type === 'button';
                const isHeader = field.type === 'header';
                
                const defaultBtnBg = field.buttonAction === 'reset' ? 'transparent' : config.design.primaryColor;
                const defaultBtnText = field.buttonAction === 'reset' ? config.design.primaryColor : '#ffffff';
                const defaultBtnBorder = field.buttonAction === 'reset' ? config.design.primaryColor : 'transparent';

                const fBgColor = field.style?.bgColor || (isButton ? defaultBtnBg : config.design.inputBgColor);
                const fBorderColor = field.style?.borderColor || (isButton ? defaultBtnBorder : config.design.inputBorderColor);
                const fTextColor = field.style?.textColor || (isButton ? defaultBtnText : config.design.textColor);
                const fBorderRadius = field.style?.borderRadius || (isButton ? config.design.buttonRadius : "0.375rem");
                const colStyle = field.width === 'auto' ? { flex: '0 0 auto', width: 'auto' } : { width: field.width || "100%" };

                return (
                  <div key={field.id} className="px-2 mb-4 transition-all duration-300" style={colStyle}>
                    <div draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} onDragEnd={handleDragEnd} onClick={() => { setActiveTab('fields'); setActiveFieldIndex(index); if (window.innerWidth < 768) setIsSidebarOpen(true); }} className={`relative group cursor-pointer transition-all duration-200 border-2 rounded-lg p-2 h-full flex flex-col justify-end ${activeFieldIndex === index ? 'border-blue-500 bg-blue-50/30 shadow-sm' : 'border-transparent hover:border-dashed hover:border-gray-300'}`}>
                      <div className={`absolute -left-4 md:-left-8 top-1/2 -translate-y-1/2 flex-col gap-1 z-20 ${activeFieldIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 hidden md:flex'}`}><div className="p-1 md:p-1.5 bg-white rounded shadow border border-gray-100 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-700"><GripVertical className="w-4 h-4" /></div></div>
                      <button onClick={(e) => removeField(index, e)} className={`absolute right-0 top-0 -mt-2 -mr-2 p-1 bg-red-100 text-red-600 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-200 z-10 shadow ${activeFieldIndex === index ? 'md:opacity-100' : ''}`}><X className="w-3 h-3" /></button>

                      <div className="pointer-events-none h-full flex flex-col justify-end w-full">
                        {isHeader ? (
                          <div className="pointer-events-auto w-full text-center">
                            <input type="text" value={field.label} onChange={(e) => updateField(index, {label: e.target.value})} style={{ color: config.content.titleStyle?.color || config.design.textColor, fontSize: config.content.titleStyle?.fontSize || '30px', textAlign: config.content.titleStyle?.textAlign || 'center', fontWeight: 'bold' }} className="w-full bg-transparent border-2 border-transparent outline-none focus:border-blue-500/30 rounded placeholder-gray-300 p-1" placeholder="Título Principal" />
                            <textarea value={field.placeholder} onChange={(e) => updateField(index, {placeholder: e.target.value})} style={{ color: config.content.subtitleStyle?.color || config.design.textColor, fontSize: config.content.subtitleStyle?.fontSize || '14px', textAlign: config.content.subtitleStyle?.textAlign || 'center' }} className="w-full bg-transparent border-2 border-transparent outline-none focus:border-blue-500/30 rounded resize-none placeholder-gray-300 p-1 overflow-hidden" rows={2} onInput={(e) => { e.currentTarget.style.height = 'auto'; e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; }} placeholder="Subtítulo..." />
                          </div>
                        ) : (
                          <>
                            {!isButton && <label style={{ color: config.design.textColor }} className="block text-sm font-medium mb-1.5">{field.label} {field.required && <span className="text-red-500">*</span>}</label>}
                            {field.type === 'textarea' ? <textarea placeholder={field.placeholder} disabled style={{ backgroundColor: fBgColor, borderColor: fBorderColor, color: fTextColor, borderRadius: fBorderRadius }} className="w-full p-3 border text-sm resize-none" rows={3} />
                            : field.type === 'select' ? <select disabled style={{ backgroundColor: fBgColor, borderColor: fBorderColor, color: fTextColor, borderRadius: fBorderRadius }} className="w-full p-3 border text-sm appearance-none"><option>{field.placeholder || "Selecione..."}</option></select>
                            : field.type === 'button' ? <button disabled style={{ backgroundColor: fBgColor, color: fTextColor, borderRadius: fBorderRadius, borderColor: fBorderColor, borderWidth: field.buttonAction === 'reset' ? '1px' : '0px' }} className="w-full py-3 px-6 border border-solid font-medium text-sm transition-transform shadow-sm whitespace-nowrap">{field.label}</button>
                            : <input type={field.type} placeholder={field.placeholder} disabled style={{ backgroundColor: fBgColor, borderColor: fBorderColor, color: fTextColor, borderRadius: fBorderRadius }} className="w-full p-3 border text-sm" />}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {config.fields.length === 0 && <div className="w-full text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400"><p className="text-sm">O formulário está vazio.</p></div>}
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { width: 5px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; } .custom-canvas-bg { background-color: #f1f5f9; }`}} />
    </div>
  );
}