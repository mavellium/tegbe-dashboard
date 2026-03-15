/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { 
  Network, Plus, Edit2, Trash2, Loader2, X, Upload, 
  ChevronDown, FolderPlus, Link as LinkIcon, LayoutTemplate,
  GripVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

function MenuBuilder({ 
  value, 
  onChange, 
  availablePages, 
  editingId 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  availablePages: any[]; 
  editingId: string | null; 
}) {
  const [items, setItems] = useState<any[]>([]);

  // Refs para gerenciar o estado do arrastar (Drag & Drop)
  const dragItem = useRef<{ idx: number; parentIdx?: number } | null>(null);
  const dragOverItem = useRef<{ idx: number; parentIdx?: number } | null>(null);
  const [draggingPos, setDraggingPos] = useState<{ idx: number; parentIdx?: number } | null>(null);

  useEffect(() => {
    try {
      if (value) setItems(JSON.parse(value));
    } catch (e) {
      setItems([]);
    }
  }, [value]);

  const syncParent = (newItems: any[]) => {
    setItems(newItems);
    onChange(JSON.stringify(newItems, null, 2));
  };

  const addGroup = () => {
    syncParent([...items, { type: "group", title: "Novo Grupo", icon: "Folder", children: [] }]);
  };

  const addLink = (parentIndex?: number) => {
    const newLink = { name: "Link Manual", href: "/", icon: "Link" };
    if (parentIndex !== undefined) {
      const copy = [...items];
      if (!copy[parentIndex].children) copy[parentIndex].children = [];
      copy[parentIndex].children.push(newLink);
      syncParent(copy);
    } else {
      syncParent([...items, { type: "item", ...newLink }]);
    }
  };

  const addPage = (parentIndex: number | undefined, pageId: string) => {
    const page = availablePages.find(p => p.id === pageId);
    if (!page) return;

    const newLink = { 
      name: page.title, 
      href: `/dashboard/${editingId}/custom/${page.id}`, 
      icon: page.icon || "FileText" 
    };
    
    if (parentIndex !== undefined) {
      const copy = [...items];
      if (!copy[parentIndex].children) copy[parentIndex].children = [];
      copy[parentIndex].children.push(newLink);
      syncParent(copy);
    } else {
      syncParent([...items, { type: "item", ...newLink }]);
    }
  };

  const removeItem = (idx: number, parentIdx?: number) => {
    const copy = [...items];
    if (parentIdx !== undefined) {
      copy[parentIdx].children.splice(idx, 1);
    } else {
      copy.splice(idx, 1);
    }
    syncParent(copy);
  };

  const updateItem = (val: any, field: string, idx: number, parentIdx?: number) => {
    const copy = [...items];
    if (parentIdx !== undefined) {
      copy[parentIdx].children[idx][field] = val;
    } else {
      copy[idx][field] = val;
    }
    syncParent(copy);
  };

  // --- Funções de Drag & Drop ---
  const handleDragStart = (e: React.DragEvent, idx: number, parentIdx?: number) => {
    dragItem.current = { idx, parentIdx };
    setDraggingPos({ idx, parentIdx });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e: React.DragEvent, idx: number, parentIdx?: number) => {
    dragOverItem.current = { idx, parentIdx };
  };

  const handleDragEnd = () => {
    if (dragItem.current && dragOverItem.current) {
      const { idx: dragIdx, parentIdx: dragParent } = dragItem.current;
      const { idx: overIdx, parentIdx: overParent } = dragOverItem.current;

      // Reordena apenas se estiverem no mesmo nível (ex: raiz com raiz, dentro do mesmo grupo)
      if (dragParent === overParent && dragIdx !== overIdx) {
        const copy = [...items];
        if (dragParent !== undefined) {
          const children = [...copy[dragParent].children];
          const [dragged] = children.splice(dragIdx, 1);
          children.splice(overIdx, 0, dragged);
          copy[dragParent].children = children;
        } else {
          const [dragged] = copy.splice(dragIdx, 1);
          copy.splice(overIdx, 0, dragged);
        }
        syncParent(copy);
      }
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingPos(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessário para permitir o drop
  };

  return (
    <div className="space-y-4 bg-black/30 p-4 rounded-xl border border-zinc-800">
      <div className="flex flex-wrap gap-2 pb-4 border-b border-zinc-800">
        <button type="button" onClick={addGroup} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded-lg transition-colors">
          <FolderPlus size={14} /> Novo Grupo (Pasta)
        </button>
        <button type="button" onClick={() => addLink()} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded-lg transition-colors">
          <LinkIcon size={14} /> Novo Link Manual
        </button>

        {editingId && availablePages.length > 0 ? (
          <div className="relative group">
            <select 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => { addPage(undefined, e.target.value); e.target.value = ""; }}
              defaultValue=""
            >
              <option value="" disabled>Selecionar Página</option>
              {availablePages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/30 text-xs font-bold rounded-lg transition-colors">
              <LayoutTemplate size={14} /> Vincular Página Criada
            </button>
          </div>
        ) : editingId ? (
          <span className="flex items-center text-[10px] text-zinc-500 px-2">Nenhuma página criada nesta filial.</span>
        ) : (
          <span className="flex items-center text-[10px] text-zinc-500 px-2">Salve a filial para vincular páginas.</span>
        )}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
        {items.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4">Nenhum item no menu. Comece adicionando um acima.</p>
        ) : (
          items.map((item, idx) => {
            const isDragging = draggingPos?.idx === idx && draggingPos?.parentIdx === undefined;
            return (
              <div 
                key={idx} 
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragEnter={(e) => handleDragEnter(e, idx)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                className={`bg-zinc-900 border ${isDragging ? 'border-indigo-500/50 opacity-50 shadow-lg shadow-indigo-500/10' : 'border-zinc-800'} rounded-lg p-3 space-y-3 transition-all`}
              >
                
                <div className="flex items-start gap-3">
                  <div className="mt-2 cursor-grab active:cursor-grabbing text-zinc-600 hover:text-white transition-colors" title="Arraste para reordenar">
                    <GripVertical size={18} />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-12 gap-3">
                    <div className="col-span-4">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">{item.type === 'group' ? 'Nome do Grupo' : 'Nome do Link'}</label>
                      <input type="text" value={item.title || item.name} onChange={e => updateItem(e.target.value, item.type === 'group' ? 'title' : 'name', idx)} className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-white outline-none mt-1" />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Ícone (Lucide)</label>
                      <input type="text" value={item.icon} onChange={e => updateItem(e.target.value, 'icon', idx)} className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-white outline-none mt-1" placeholder="Ex: FileText" />
                    </div>
                    {item.type === 'item' && (
                      <div className="col-span-5">
                        <label className="text-[10px] uppercase font-bold text-zinc-500">URL Destino</label>
                        <input type="text" value={item.href} onChange={e => updateItem(e.target.value, 'href', idx)} className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-white outline-none mt-1" placeholder="/dashboard/..." />
                      </div>
                    )}
                  </div>

                  <button type="button" onClick={() => removeItem(idx)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded mt-5"><Trash2 size={14}/></button>
                </div>

                {item.type === 'group' && (
                  <div className="ml-8 pl-4 border-l border-zinc-800 space-y-2 pt-2">
                    {(item.children || []).map((child: any, cIdx: number) => {
                      const isChildDragging = draggingPos?.idx === cIdx && draggingPos?.parentIdx === idx;
                      return (
                        <div 
                          key={cIdx} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, cIdx, idx)}
                          onDragEnter={(e) => handleDragEnter(e, cIdx, idx)}
                          onDragEnd={handleDragEnd}
                          onDragOver={handleDragOver}
                          className={`flex items-center gap-2 bg-black/40 p-2 rounded border transition-all ${isChildDragging ? 'border-cyan-500/50 opacity-50' : 'border-zinc-800/50'}`}
                        >
                          <div className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-white" title="Arraste para reordenar filho">
                            <GripVertical size={14} />
                          </div>
                          <input type="text" value={child.name} onChange={e => updateItem(e.target.value, 'name', cIdx, idx)} className="w-1/3 bg-transparent border-b border-zinc-800 text-xs text-white outline-none focus:border-cyan-500 px-1" placeholder="Nome" />
                          <input type="text" value={child.icon} onChange={e => updateItem(e.target.value, 'icon', cIdx, idx)} className="w-1/4 bg-transparent border-b border-zinc-800 text-xs text-zinc-400 outline-none focus:border-cyan-500 px-1" placeholder="Ícone" />
                          <input type="text" value={child.href} onChange={e => updateItem(e.target.value, 'href', cIdx, idx)} className="flex-1 bg-transparent border-b border-zinc-800 text-xs text-indigo-400 outline-none focus:border-cyan-500 px-1" placeholder="/url" />
                          <button type="button" onClick={() => removeItem(cIdx, idx)} className="text-red-500 hover:text-red-400 p-1"><X size={14}/></button>
                        </div>
                      );
                    })}
                    
                    <div className="flex items-center gap-4 mt-2">
                      <button type="button" onClick={() => addLink(idx)} className="text-[10px] font-bold text-cyan-500 uppercase hover:underline inline-block">
                        + Link Manual
                      </button>
                      
                      {editingId && availablePages.length > 0 && (
                        <div className="relative inline-block">
                          <select 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => { addPage(idx, e.target.value); e.target.value = ""; }}
                            defaultValue=""
                          >
                            <option value="" disabled>Selecionar Página</option>
                            {availablePages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                          </select>
                          <span className="text-[10px] font-bold text-indigo-400 uppercase hover:underline inline-block">
                            + Vincular Página Criada
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function SubEmpresasCRUD() {
  const [subCompanies, setSubCompanies] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    name: "", companyId: "", description: "", ga_id: "", logo_img: null as File | string | null,
    theme: "", menuItems: ""
  });
  
  const [previewLogo, setPreviewLogo] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, compRes, pagesRes] = await Promise.all([ 
        fetch("/api/sub-companies"), 
        fetch("/api/companies"),
        fetch("/api/pages").catch(() => null) 
      ]);
      
      setSubCompanies(await subRes.json());
      setCompanies(await compRes.json());
      
      if (pagesRes && pagesRes.ok) setPages(await pagesRes.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo_img: file }));
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.theme && formData.theme.trim() !== "") {
      try { JSON.parse(formData.theme); } 
      catch (err) { alert("⚠️ O JSON do Tema possui erros de sintaxe."); return; }
    }

    setSaving(true);
    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("companyId", formData.companyId);
      if (formData.description) formPayload.append("description", formData.description);
      if (formData.ga_id) formPayload.append("ga_id", formData.ga_id);
      
      if (formData.theme) formPayload.append("theme", formData.theme);
      if (formData.menuItems) formPayload.append("menuItems", formData.menuItems);
      
      if (formData.logo_img instanceof File) {
        formPayload.append("file:logo_img", formData.logo_img);
      } else if (typeof formData.logo_img === "string") {
        formPayload.append("logo_img", formData.logo_img);
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/sub-companies/${editingId}` : "/api/sub-companies";
      
      const res = await fetch(url, { method, body: formPayload });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao salvar");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta filial? As páginas atreladas a ela perderão o vínculo.")) return;
    try { await fetch(`/api/sub-companies/${id}`, { method: "DELETE" }); fetchData(); } catch (e) { console.error(e); }
  };

  const openNew = () => {
    setFormData({ name: "", companyId: companies[0]?.id || "", description: "", ga_id: "", logo_img: null, theme: "", menuItems: "[]" });
    setPreviewLogo(""); setEditingId(null); setIsModalOpen(true);
  };

  const openEdit = (sub: any) => {
    const formatJson = (obj: any) => {
      if (!obj) return "";
      if (typeof obj === 'string') return obj;
      return JSON.stringify(obj, null, 2);
    };

    setFormData({ 
      name: sub.name, companyId: sub.companyId, description: sub.description || "", 
      ga_id: sub.ga_id || "", logo_img: sub.logo_img || null,
      theme: formatJson(sub.theme), menuItems: formatJson(sub.menuItems)
    });
    setPreviewLogo(sub.logo_img || ""); 
    setEditingId(sub.id); 
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 text-zinc-100">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Network className="text-cyan-500" /> Filiais (Sub-Empresas)
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Gerencie as divisões de cada empresa, temas e menus.</p>
          </div>
          <Button onClick={openNew} className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2">
            <Plus size={18} /> Nova Filial
          </Button>
        </div>

        <Card className="bg-zinc-900/80 border-zinc-800 overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-cyan-500 w-8 h-8" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-950/50 text-zinc-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Logo</th>
                    <th className="px-6 py-4">Nome da Filial</th>
                    <th className="px-6 py-4">Empresa Matriz</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {subCompanies.map(sub => (
                    <tr key={sub.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        {sub.logo_img ? (
                          <div className="relative w-10 h-10 bg-white/5 rounded-md p-1 border border-white/10"><Image src={sub.logo_img} alt="Logo" fill className="object-contain" /></div>
                        ) : (<div className="w-10 h-10 bg-zinc-800 rounded-md flex items-center justify-center text-xs text-zinc-500">S/L</div>)}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{sub.name}</td>
                      <td className="px-6 py-4 text-cyan-400 font-medium">{sub.company?.name || "Sem Matriz"}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => openEdit(sub)} className="p-2 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(sub.id)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-zinc-800 shrink-0">
                  <h3 className="text-lg font-bold text-white">{editingId ? "Editar Filial" : "Nova Filial"}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                  
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Logo da Filial (AVIF Automático)</label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center overflow-hidden">
                        {previewLogo ? <Image src={previewLogo} alt="Preview" fill className="object-contain p-1" /> : <span className="text-[10px] text-zinc-600">Vazio</span>}
                      </div>
                      <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors border border-zinc-700">
                        <Upload size={16} /> Selecionar Imagem
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Nome da Filial</label>
                      <Input required value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} className="bg-black/50 border-zinc-800 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Empresa (Matriz)</label>
                      <select required value={formData.companyId} onChange={(e) => setFormData({...formData, companyId: e.target.value})} className="w-full p-3 bg-black/50 border border-zinc-800 rounded-lg text-white outline-none focus:border-cyan-500">
                        <option value="" disabled>Selecione uma empresa</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Descrição / Slogan</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-black/50 border border-zinc-800 rounded-lg text-white outline-none focus:border-cyan-500 resize-none min-h-[80px]" placeholder="Breve descrição desta filial..." />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Google Tag Manager ID (Apenas Números)</label>
                    <Input value={formData.ga_id} onChange={(e: any) => setFormData({...formData, ga_id: e.target.value})} placeholder="Ex: 517619880" className="bg-black/50 border-zinc-800 text-white" />
                  </div>

                  <div className="border-t border-zinc-800 pt-4">
                    <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Cores do Tema (JSON)</label>
                    <textarea 
                      value={formData.theme} 
                      onChange={(e) => setFormData({...formData, theme: e.target.value})} 
                      className="w-full p-3 bg-black/50 border border-zinc-800 rounded-lg text-emerald-400 font-mono text-xs outline-none focus:border-cyan-500 resize-none h-28 custom-scrollbar" 
                      placeholder='{\n  "mainColor": "#e61a4a",\n  "backgroundColor": "#111"\n}' 
                    />
                  </div>

                  {/* UI DE CONSTRUÇÃO DO MENU */}
                  <div className="border-t border-zinc-800 pt-4">
                    <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Construtor de Navegação (Menu da Sidebar)</label>
                    
                    <MenuBuilder 
                      value={formData.menuItems} 
                      onChange={(val) => setFormData(prev => ({ ...prev, menuItems: val }))} 
                      availablePages={pages.filter(p => p.subCompanyId === editingId)}
                      editingId={editingId}
                    />
                    
                    <details className="mt-2">
                      <summary className="text-[10px] text-zinc-600 cursor-pointer hover:text-cyan-500 font-bold uppercase">Ver Código JSON Gerado (Avançado)</summary>
                      <textarea 
                        value={formData.menuItems} 
                        onChange={(e) => setFormData({...formData, menuItems: e.target.value})} 
                        className="mt-2 w-full p-3 bg-black/50 border border-zinc-800 rounded-lg text-indigo-400 font-mono text-xs outline-none focus:border-cyan-500 resize-none h-32 custom-scrollbar" 
                      />
                    </details>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
                    <Button type="button" onClick={() => setIsModalOpen(false)} className="bg-transparent hover:bg-zinc-800 text-zinc-300">Cancelar</Button>
                    <Button type="submit" loading={saving} className="bg-cyan-600 hover:bg-cyan-700 text-white">Salvar Filial</Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}