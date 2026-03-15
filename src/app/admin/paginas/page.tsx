/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { LayoutTemplate, Plus, Edit2, Trash2, Loader2, X } from "lucide-react";
import * as Icons from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";
import AdvancedJsonEditor from "@/components/AdvancedJsonEditor"; 

export default function PagesCRUD() {
  const [pages, setPages] = useState<any[]>([]);
  const [subCompanies, setSubCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "", subtitle: "", icon: "FileText", endpoint: "", subCompanyId: "", formData: {} as any
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
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao salvar página.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta página definitivamente?")) return;
    try { await fetch(`/api/pages/${id}`, { method: "DELETE" }); fetchData(); } catch (e) { console.error(e); }
  };

  const openNew = () => {
    setFormData({ title: "", subtitle: "", icon: "FileText", endpoint: "/api/sua-rota/json/tipo", subCompanyId: subCompanies[0]?.id || "", formData: {} });
    setEditingId(null); setIsModalOpen(true);
  };

  const openEdit = (page: any) => {
    setFormData({ 
      title: page.title, subtitle: page.subtitle || "", icon: page.icon, endpoint: page.endpoint, 
      subCompanyId: page.subCompanyId, formData: page.formData || {} 
    });
    setEditingId(page.id); setIsModalOpen(true);
  };

  const IconPreview = (Icons as any)[formData.icon] || Icons.FileText;

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
                    const PageIcon = (Icons as any)[page.icon] || Icons.FileText;
                    return (
                      <tr key={page.id} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                          <PageIcon size={18} className="text-zinc-500" />
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
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-zinc-800 shrink-0">
                  <h3 className="text-lg font-bold text-white">{editingId ? "Editar Página" : "Nova Página"}</h3>
                  <div className="flex gap-3">
                     <Button type="button" onClick={handleSubmit} loading={saving} className="bg-cyan-600 hover:bg-cyan-700 text-white h-8">Salvar Página</Button>
                     <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Título da Página</label>
                      <Input required value={formData.title} onChange={(e: any) => setFormData({...formData, title: e.target.value})} className="bg-black/50 border-zinc-800 text-white" placeholder="Ex: Configurações do Header" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Vincular à Filial</label>
                      <select required value={formData.subCompanyId} onChange={(e) => setFormData({...formData, subCompanyId: e.target.value})} className="w-full p-3 bg-black/50 border border-zinc-800 rounded-lg text-white outline-none focus:border-cyan-500">
                        <option value="" disabled>Selecione...</option>
                        {subCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Subtítulo</label>
                      <Input value={formData.subtitle} onChange={(e: any) => setFormData({...formData, subtitle: e.target.value})} className="bg-black/50 border-zinc-800 text-white" placeholder="Breve descrição visível ao usuário" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Endpoint de Salvamento (API)</label>
                      <Input required value={formData.endpoint} onChange={(e: any) => setFormData({...formData, endpoint: e.target.value})} className="bg-black/50 border-zinc-800 text-white font-mono text-sm" placeholder="/api/[subtype]/json/[type]" />
                    </div>
                  </div>

                  <div className="shrink-0">
                    <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Ícone (Nome em Inglês - Lucide React)</label>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center">
                        <IconPreview className="text-cyan-500" />
                      </div>
                      <Input value={formData.icon} onChange={(e: any) => setFormData({...formData, icon: e.target.value})} className="bg-black/50 border-zinc-800 text-white flex-1" placeholder="Ex: Home, FileText, Settings, Image..." />
                    </div>
                  </div>

                  <div className="border-t border-zinc-800 pt-6 flex-1 flex flex-col min-h-[500px]">
                    <label className="block text-xs font-semibold text-cyan-400 uppercase mb-4 flex items-center gap-2 shrink-0">
                      <LayoutTemplate size={16} /> Estrutura de Dados (FormData JSON)
                    </label>
                    <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex-1 relative flex flex-col">
                      <AdvancedJsonEditor 
                        data={formData.formData} 
                        onChange={(path: string, val: any) => {}} // Dummy, usamos onReplaceData
                        onReplaceData={(newJson: any) => setFormData({...formData, formData: newJson})} 
                        previewUrl={formData.endpoint} // Usa o endpoint como preview se quiser
                      />
                    </div>
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