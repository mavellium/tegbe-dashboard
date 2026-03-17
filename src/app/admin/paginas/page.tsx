/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { LayoutTemplate, Plus, Edit2, Trash2, Loader2, X } from "lucide-react";
import * as Icons from "lucide-react"; 
import { Icon } from "@iconify/react"; 
import { motion, AnimatePresence } from "framer-motion";
import AdvancedJsonEditor from "@/components/AdvancedJsonEditor"; 
import AdminIconSelector from "@/components/Admin/AdminIconSelector";

export default function PagesCRUD() {
  const [pages, setPages] = useState<any[]>([]);
  const [subCompanies, setSubCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "", subtitle: "", icon: "lucide:file-text", endpoint: "", subCompanyId: "", formData: {} as any
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pagesRes, subRes] = await Promise.all([fetch("/api/pages"), fetch("/api/sub-companies")]);
      setPages(await pagesRes.json());
      setSubCompanies(await subRes.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/pages/${editingId}` : "/api/pages";
      
      // 1. Salva a configuração da página na tabela 'Page'
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          formData: typeof formData.formData === 'string' ? JSON.parse(formData.formData) : formData.formData
        })
      });
      
      if (res.ok) {
        
        // 2. FORÇA A CRIAÇÃO DO JSON NA API DINÂMICA
        // Envia os dados no formato FormData esperado pela rota [subtype]/json/[type]
        if (formData.endpoint) {
          const payload = typeof formData.formData === 'string' ? JSON.parse(formData.formData) : formData.formData;
          const finalPayload = Object.keys(payload || {}).length > 0 ? payload : { _init: true };
          
          const apiFormData = new FormData();
          apiFormData.append("values", JSON.stringify(finalPayload));

          await fetch(formData.endpoint, {
            method: "POST",
            // Não passamos Content-Type aqui para que o navegador configure o boundary multipart do FormData
            body: apiFormData
          }).catch(err => console.error("Aviso: Falha ao injetar JSON no endpoint.", err));
        }

        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao salvar página.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de comunicação com a API.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta página definitivamente?")) return;
    try { await fetch(`/api/pages/${id}`, { method: "DELETE" }); fetchData(); } catch (e) { console.error(e); }
  };

  const openNew = () => {
    setFormData({ title: "", subtitle: "", icon: "lucide:file-text", endpoint: "", subCompanyId: subCompanies[0]?.id || "", formData: {} });
    setEditingId(null); setIsModalOpen(true);
  };

  const openEdit = (page: any) => {
    let parsedData = page.formData;
    if (typeof parsedData === "string") {
      try { parsedData = JSON.parse(parsedData); } catch { parsedData = {}; }
    }
    if (!parsedData || parsedData === "null") parsedData = {};

    setFormData({ 
      title: page.title || "", 
      subtitle: page.subtitle || "", 
      icon: page.icon || "lucide:file-text", 
      endpoint: page.endpoint || "", 
      subCompanyId: page.subCompanyId || "", 
      formData: parsedData 
    });
    setEditingId(page.id); setIsModalOpen(true);
  };

  const autoGenerateEndpoint = (subId: string, titleText: string) => {
    const sub = subCompanies.find(c => c.id === subId);
    const subSlug = sub ? sub.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") : "filial";
    const titleSlug = titleText ? titleText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") : "pagina";
    return `/api/${subSlug}/json/${titleSlug}`;
  };

  const handleTitleChange = (val: string) => {
    setFormData(prev => {
      const next = { ...prev, title: val };
      if (!editingId) next.endpoint = autoGenerateEndpoint(prev.subCompanyId, val);
      return next;
    });
  };

  const handleSubCompanyChange = (val: string) => {
    setFormData(prev => {
      const next = { ...prev, subCompanyId: val };
      if (!editingId) next.endpoint = autoGenerateEndpoint(val, prev.title);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 text-zinc-100">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <LayoutTemplate className="text-cyan-500" /> Construtor de Páginas
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Crie páginas dinâmicas vinculadas às filiais e gerencie os formulários JSON.</p>
          </div>
          <Button onClick={openNew} className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2">
            <Plus size={18} /> Nova Página
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
                    <th className="px-6 py-4">Página</th>
                    <th className="px-6 py-4">Filial</th>
                    <th className="px-6 py-4">Endpoint</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {pages.map(page => {
                    const PageIconLegacy = (Icons as any)[page.icon] || Icons.FileText;
                    return (
                      <tr key={page.id} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                          {page.icon?.includes(':') ? (
                            <Icon icon={page.icon} className="text-zinc-500 w-[18px] h-[18px]" />
                          ) : (
                            <PageIconLegacy size={18} className="text-zinc-500" />
                          )}
                          <div>
                            <p>{page.title}</p>
                            <p className="text-xs text-zinc-500 font-normal">{page.subtitle}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-cyan-400 font-medium">{page.subCompany?.name}</td>
                        <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{page.endpoint}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => openEdit(page)} className="p-2 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(page.id)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-6xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col h-[95vh] overflow-hidden">
                
                <div className="p-4 border-b border-zinc-800 bg-zinc-950 shrink-0 flex items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-white">{editingId ? "Editar Página" : "Nova Página"}</h3>
                  <div className="flex items-center gap-3">
                     <Button type="button" onClick={handleSubmit} loading={saving} className="bg-cyan-600 hover:bg-cyan-700 text-white h-9 px-4">Salvar Alterações</Button>
                     <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"><X size={20} /></button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-6 space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 bg-black/20 p-4 rounded-xl border border-zinc-800/50">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Título da Página</label>
                      <Input required value={formData.title} onChange={(e: any) => handleTitleChange(e.target.value)} className="bg-black/50 border-zinc-800 text-white mt-1" placeholder="Ex: Configurações do Header" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Vincular à Filial</label>
                      <select required value={formData.subCompanyId} onChange={(e) => handleSubCompanyChange(e.target.value)} className="w-full p-2.5 mt-1 bg-black/50 border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-cyan-500">
                        <option value="" disabled>Selecione...</option>
                        {subCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-1 md:col-span-1">
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Ícone da Página</label>
                      <AdminIconSelector
                        value={formData.icon}
                        onChange={(val) => setFormData(prev => ({...prev, icon: val}))}
                        placeholder="Ex: lucide:layout-template"
                        variant="default"
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-1">
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Subtítulo</label>
                      <Input value={formData.subtitle} onChange={(e: any) => setFormData(prev => ({...prev, subtitle: e.target.value}))} className="bg-black/50 border-zinc-800 text-white mt-1" placeholder="Breve descrição" />
                    </div>
                    <div className="col-span-1 md:col-span-1">
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Endpoint (API)</label>
                      <Input required value={formData.endpoint} onChange={(e: any) => setFormData(prev => ({...prev, endpoint: e.target.value}))} className="bg-black/50 border-zinc-800 text-white font-mono text-sm mt-1" placeholder="/api/[filial]/json/[pagina]" />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col relative">
                    <AdvancedJsonEditor 
                      data={formData.formData} 
                      onChange={() => {}} 
                      onReplaceData={(newJson: any) => setFormData(prev => ({...prev, formData: newJson}))} 
                      previewUrl={formData.endpoint} 
                      pageTitle={formData.title}      
                      pageSubtitle={formData.subtitle} 
                      pageIcon={formData.icon}         
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}