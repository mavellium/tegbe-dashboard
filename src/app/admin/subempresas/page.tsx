/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import {
  Network, Plus, Edit2, Trash2, Loader2, X, Upload, BookOpen, Settings, Palette,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MenuBuilderInline } from "@/components/Admin/MenuBuilder";
import { Switch } from "@/components/Switch";

export default function SubEmpresasCRUD() {
  const [subCompanies, setSubCompanies] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isColorsModalOpen, setIsColorsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", companyId: "", description: "", ga_id: "", logo_img: null as File | string | null,
    theme: "", menuItems: "", blogEnabled: false
  });
  
  const [previewLogo, setPreviewLogo] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);
  const [savingColors, setSavingColors] = useState(false);

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

    setSaving(true);
    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("companyId", formData.companyId);
      if (formData.description) formPayload.append("description", formData.description);
      if (formData.ga_id) formPayload.append("ga_id", formData.ga_id);
      
      formPayload.append("blogEnabled", String(formData.blogEnabled));
      
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

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSavingMenu(true);
    try {
      const formPayload = new FormData();
      
      // Send menu items, required fields, and logo to prevent data loss
      formPayload.append("name", formData.name);
      formPayload.append("companyId", formData.companyId);
      if (formData.menuItems) formPayload.append("menuItems", formData.menuItems);
      
      // Preserve logo to prevent data loss
      if (formData.logo_img) {
        if (formData.logo_img instanceof File) {
          formPayload.append("file:logo_img", formData.logo_img);
        } else if (typeof formData.logo_img === "string") {
          formPayload.append("logo_img", formData.logo_img);
        }
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/sub-companies/${editingId}` : "/api/sub-companies";
      
      const res = await fetch(url, { method, body: formPayload });
      
      if (res.ok) {
        setIsMenuModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao salvar menu");
      }
    } finally {
      setSavingMenu(false);
    }
  };

  const handleColorsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.theme && formData.theme.trim() !== "") {
      try { JSON.parse(formData.theme); } 
      catch (err) { alert("⚠️ O JSON do Tema possui erros de sintaxe."); return; }
    }

    setSavingColors(true);
    try {
      const formPayload = new FormData();
      
      // Send theme colors, required fields, and logo to prevent data loss
      formPayload.append("name", formData.name);
      formPayload.append("companyId", formData.companyId);
      if (formData.theme) formPayload.append("theme", formData.theme);
      
      // Preserve logo to prevent data loss
      if (formData.logo_img) {
        if (formData.logo_img instanceof File) {
          formPayload.append("file:logo_img", formData.logo_img);
        } else if (typeof formData.logo_img === "string") {
          formPayload.append("logo_img", formData.logo_img);
        }
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/sub-companies/${editingId}` : "/api/sub-companies";
      
      const res = await fetch(url, { method, body: formPayload });
      
      if (res.ok) {
        setIsColorsModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao salvar cores");
      }
    } finally {
      setSavingColors(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta filial? As páginas atreladas a ela perderão o vínculo.")) return;
    try { await fetch(`/api/sub-companies/${id}`, { method: "DELETE" }); fetchData(); } catch (e) { console.error(e); }
  };

  const openNew = () => {
    setFormData({ name: "", companyId: companies[0]?.id || "", description: "", ga_id: "", logo_img: null, theme: "", menuItems: "[]", blogEnabled: false });
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
      theme: formatJson(sub.theme), menuItems: formatJson(sub.menuItems),
      blogEnabled: sub.blogEnabled ?? false
    });
    setPreviewLogo(sub.logo_img || ""); 
    setEditingId(sub.id); 
    setIsModalOpen(true);
  };

  const openMenuEdit = (sub: any) => {
    const formatJson = (obj: any) => {
      if (!obj) return "";
      if (typeof obj === 'string') return obj;
      return JSON.stringify(obj, null, 2);
    };

    setFormData({
      name: sub.name, companyId: sub.companyId, description: sub.description || "",
      ga_id: sub.ga_id || "", logo_img: sub.logo_img || null,
      theme: formatJson(sub.theme), menuItems: formatJson(sub.menuItems),
      blogEnabled: sub.blogEnabled ?? false
    });
    setPreviewLogo(sub.logo_img || ""); 
    setEditingId(sub.id); 
    setIsMenuModalOpen(true);
  };

  const openColorsEdit = (sub: any) => {
    const formatJson = (obj: any) => {
      if (!obj) return "";
      if (typeof obj === 'string') return obj;
      return JSON.stringify(obj, null, 2);
    };

    setFormData({
      name: sub.name, companyId: sub.companyId, description: sub.description || "",
      ga_id: sub.ga_id || "", logo_img: sub.logo_img || null,
      theme: formatJson(sub.theme), menuItems: formatJson(sub.menuItems),
      blogEnabled: sub.blogEnabled ?? false
    });
    setPreviewLogo(sub.logo_img || ""); 
    setEditingId(sub.id); 
    setIsColorsModalOpen(true);
  };

  const checkBlogLinkExists = () => {
    try {
      const menuItems = JSON.parse(formData.menuItems || "[]");
      const checkItems = (items: any[]): boolean => {
        return items.some(item => {
          if (item.href && item.href.includes("/blog")) {
            return true;
          }
          if (item.children) {
            return checkItems(item.children);
          }
          return false;
        });
      };
      return checkItems(menuItems);
    } catch {
      return false;
    }
  };

  const addBlogLink = () => {
    try {
      const menuItems = JSON.parse(formData.menuItems || "[]");
      const blogLink = {
        type: "item",
        name: "Blog",
        href: `/dashboard/${editingId}/blog`,
        icon: "lucide:book-open",
        isActive: true
      };
      
      const newMenuItems = [...menuItems, blogLink];
      setFormData(prev => ({ ...prev, menuItems: JSON.stringify(newMenuItems, null, 2) }));
    } catch (e) {
      console.error("Error adding blog link:", e);
    }
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
                    <th className="px-6 py-4 text-center">Blog</th>
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
                      <td className="px-6 py-4 text-center">
                        {sub.blogEnabled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <BookOpen size={10} /> Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-800 text-zinc-500 border border-zinc-700">
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => openEdit(sub)} className="p-2 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors" title="Editar Dados"><Edit2 size={16} /></button>
                        <button onClick={() => openMenuEdit(sub)} className="p-2 text-zinc-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors" title="Editar Menu"><Settings size={16} /></button>
                        <button onClick={() => openColorsEdit(sub)} className="p-2 text-zinc-400 hover:text-orange-400 hover:bg-orange-400/10 rounded-lg transition-colors" title="Editar Cores"><Palette size={16} /></button>
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-cyan-500" />
                        <label className="text-xs font-semibold text-zinc-400 uppercase">Habilitar Blog</label>
                      </div>
                      <Switch
                        checked={formData.blogEnabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, blogEnabled: checked }))}
                      />
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-1">Ativa o módulo de blog para esta filial.</p>
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

        <AnimatePresence>
          {isMenuModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-zinc-800 shrink-0">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Settings className="text-purple-500" /> Editar Menu da Filial
                  </h3>
                  <button onClick={() => setIsMenuModalOpen(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleMenuSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                  <div className="text-center mb-4">
                    <p className="text-zinc-400 text-sm">Filial: <span className="text-white font-semibold">{formData.name}</span></p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Construtor de Navegação (Menu da Sidebar)</label>
                    
                    {formData.blogEnabled && (
                      <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                              <BookOpen size={16} />
                              Blog está habilitado para esta filial
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              {checkBlogLinkExists() 
                                ? "O link para o blog já está adicionado ao menu" 
                                : "Adicione o link do blog ao menu para que os usuários possam acessar"
                              }
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={addBlogLink}
                            disabled={checkBlogLinkExists()}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                              checkBlogLinkExists()
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                            }`}
                          >
                            <BookOpen size={14} />
                            {checkBlogLinkExists() ? 'Blog Adicionado' : 'Adicionar Blog ao Menu'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <MenuBuilderInline 
                      value={formData.menuItems} 
                      onChange={(val) => setFormData(prev => ({ ...prev, menuItems: val }))} 
                      availablePages={pages.filter(p => p.subCompanyId === editingId)}
                      editingId={editingId}
                    />
                    
                    <details className="mt-2">
                      <summary className="text-[10px] text-zinc-600 cursor-pointer hover:text-purple-500 font-bold uppercase">Ver Código JSON Gerado (Avançado)</summary>
                      <textarea 
                        value={formData.menuItems} 
                        onChange={(e) => setFormData({...formData, menuItems: e.target.value})} 
                        className="mt-2 w-full p-3 bg-black/50 border border-zinc-800 rounded-lg text-indigo-400 font-mono text-xs outline-none focus:border-purple-500 resize-none h-32 custom-scrollbar" 
                      />
                    </details>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
                    <Button type="button" onClick={() => setIsMenuModalOpen(false)} className="bg-transparent hover:bg-zinc-800 text-zinc-300">Cancelar</Button>
                    <Button type="submit" loading={savingMenu} className="bg-purple-600 hover:bg-purple-700 text-white">Salvar Menu</Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isColorsModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-zinc-800 shrink-0">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Palette className="text-orange-500" /> Editar Cores do Tema
                  </h3>
                  <button onClick={() => setIsColorsModalOpen(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleColorsSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                  <div className="text-center mb-4">
                    <p className="text-zinc-400 text-sm">Filial: <span className="text-white font-semibold">{formData.name}</span></p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Cores do Tema (JSON)</label>
                    <textarea 
                      value={formData.theme} 
                      onChange={(e) => setFormData({...formData, theme: e.target.value})} 
                      className="w-full p-3 bg-black/50 border border-zinc-800 rounded-lg text-emerald-400 font-mono text-xs outline-none focus:border-orange-500 resize-none h-40 custom-scrollbar" 
                      placeholder='{\n  "mainColor": "#e61a4a",\n  "backgroundColor": "#111"\n}' 
                    />
                    <p className="text-[11px] text-zinc-600 mt-2">Defina as cores personalizadas para esta filial em formato JSON.</p>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
                    <Button type="button" onClick={() => setIsColorsModalOpen(false)} className="bg-transparent hover:bg-zinc-800 text-zinc-300">Cancelar</Button>
                    <Button type="submit" loading={savingColors} className="bg-orange-600 hover:bg-orange-700 text-white">Salvar Cores</Button>
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
