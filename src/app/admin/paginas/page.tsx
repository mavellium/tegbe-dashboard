/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { LayoutTemplate, Plus, Edit2, Trash2, Loader2, X, ExternalLink, History, Eye, RotateCcw, ArrowLeft } from "lucide-react";
import * as Icons from "lucide-react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import AdvancedJsonEditor from "@/components/AdvancedJsonEditor";
import AdminIconSelector from "@/components/Admin/AdminIconSelector";

const actionLabels: Record<string, { label: string; color: string }> = {
  CREATED: { label: "Criado", color: "bg-emerald-500/20 text-emerald-400" },
  UPDATED: { label: "Atualizado", color: "bg-blue-500/20 text-blue-400" },
  DELETED: { label: "Excluído", color: "bg-red-500/20 text-red-400" },
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

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

  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [snapshotView, setSnapshotView] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pagesRes, subRes] = await Promise.all([fetch("/api/pages"), fetch("/api/sub-companies")]);
      setPages(await pagesRes.json());
      setSubCompanies(await subRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fetchVersions = async (pageId: string) => {
    setLoadingVersions(true);
    try {
      const res = await fetch(`/api/history/pages/${pageId}`);
      const data = await res.json();
      setVersions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/pages/${editingId}` : "/api/pages";

      const payloadObj = typeof formData.formData === 'string' ? JSON.parse(formData.formData) : formData.formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, formData: payloadObj })
      });

      if (res.ok) {
        if (formData.endpoint) {
          let finalPayload = payloadObj;
          const isArray = Array.isArray(payloadObj);

          if (!payloadObj || (isArray && payloadObj.length === 0) || (!isArray && Object.keys(payloadObj).length === 0)) {
            finalPayload = isArray ? [] : { _init: true };
          }

          const apiFormData = new FormData();
          apiFormData.append("values", JSON.stringify(finalPayload));

          const endpointRes = await fetch(formData.endpoint, {
            method: "POST",
            body: apiFormData
          });

          if (!endpointRes.ok) {
            console.error(await endpointRes.text());
          }

          try {
            const pageSlug = formData.endpoint.split('/').pop() || "hero-carrossel-home";
            
            const webhookRes = await fetch("/api/webhook", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ slug: pageSlug })
            });

            if (!webhookRes.ok) {
              console.error(webhookRes.status);
            }
          } catch (webhookError) {
            console.error(webhookError);
          }
        }

        setIsModalOpen(false);
        setShowHistory(false);
        setSnapshotView(null);
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
    try { 
      await fetch(`/api/pages/${id}`, { method: "DELETE" }); 
      fetchData(); 
    } catch (e) { 
      console.error(e); 
    }
  };

  const openNew = () => {
    setFormData({ title: "", subtitle: "", icon: "lucide:file-text", endpoint: "", subCompanyId: subCompanies[0]?.id || "", formData: {} });
    setEditingId(null);
    setShowHistory(false);
    setSnapshotView(null);
    setVersions([]);
    setIsModalOpen(true);
  };

  const openEdit = async (page: any) => {
    setLoading(true);

    let parsedData = page.formData;
    if (typeof parsedData === "string") {
      try { parsedData = JSON.parse(parsedData); } catch { parsedData = {}; }
    }
    if (!parsedData || parsedData === "null") parsedData = {};

    let userValues = null;
    if (page.endpoint) {
      try {
        const res = await fetch(page.endpoint);
        if (res.ok) {
          const data = await res.json();
          const isArr = Array.isArray(data);
          if (data && ((isArr && data.length > 0) || (!isArr && Object.keys(data).length > 0))) {
             userValues = data;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    const mergeData = (mould: any, user: any): any => {
      if (!mould) return user || (Array.isArray(mould) ? [] : {});
      if (!user || (typeof user === 'object' && Object.keys(user).length === 0)) return mould;

      const isMouldArray = Array.isArray(mould);
      const isUserArray = Array.isArray(user);

      if (isMouldArray && isUserArray) {
        const maxLength = Math.max(mould.length, user.length);
        const result = [];
        for (let i = 0; i < maxLength; i++) {
          const mouldItem = mould[i] !== undefined ? mould[i] : mould[0];
          if (user[i] !== undefined) {
            result.push(typeof user[i] === "object" && user[i] !== null ? mergeData(mouldItem, user[i]) : user[i]);
          } else {
            result.push(mouldItem);
          }
        }
        return result;
      }

      if (isMouldArray && !isUserArray && typeof user === 'object') {
        return [ mergeData(mould[0] || {}, user) ];
      }

      if (!isMouldArray && isUserArray && typeof mould === 'object') {
        return mergeData(mould, user[0] || {});
      }

      if (typeof mould === "object" && mould !== null) {
        const result = { ...mould };
        Object.keys(user).forEach(key => {
          if (typeof user[key] === "object" && user[key] !== null && !Array.isArray(user[key])) {
            result[key] = mergeData(mould[key] || {}, user[key]);
          } else {
            result[key] = user[key];
          }
        });
        return result;
      }

      return user;
    };

    const finalMergedData = mergeData(parsedData, userValues);

    setFormData({
      title: page.title || "",
      subtitle: page.subtitle || "",
      icon: page.icon || "lucide:file-text",
      endpoint: page.endpoint || "",
      subCompanyId: page.subCompanyId || page.subCompany?.id || "",
      formData: finalMergedData
    });

    setEditingId(page.id);
    setShowHistory(false);
    setSnapshotView(null);
    setVersions([]);
    setLoading(false);
    setIsModalOpen(true);
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

  const openHistoryPanel = () => {
    if (!editingId) return;
    setShowHistory(true);
    setSnapshotView(null);
    fetchVersions(editingId);
  };

  const handleRestore = async (historyId: string) => {
    if (!confirm("Deseja restaurar esta versão? O conteúdo da página será substituído.")) return;
    setRestoringId(historyId);
    try {
      const res = await fetch(`/api/history/restore/${historyId}`, { method: "POST" });
      if (res.ok) {
        const restoredPage = await res.json();

        setFormData(prev => ({
          ...prev,
          title: restoredPage.title || prev.title,
          subtitle: restoredPage.subtitle || "",
          icon: restoredPage.icon || prev.icon,
          endpoint: restoredPage.endpoint || prev.endpoint,
          formData: restoredPage.formData ?? {},
        }));

        if (editingId) {
          fetchVersions(editingId);
        }

        setSnapshotView(null);
        alert("Versão restaurada com sucesso!");
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao restaurar versão.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro de comunicação com a API.");
    } finally {
      setRestoringId(null);
    }
  };

  const handleDeleteVersion = async (historyId: string) => {
    if (!confirm("Excluir esta versão do histórico permanentemente?")) return;
    setDeletingId(historyId);
    try {
      const res = await fetch(`/api/history/${historyId}`, { method: "DELETE" });
      if (res.ok) {
        setVersions(prev => prev.filter(v => v.id !== historyId));
        if (snapshotView?.id === historyId) setSnapshotView(null);
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao excluir versão.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const viewSnapshot = async (historyId: string) => {
    try {
      const res = await fetch(`/api/history/${historyId}`);
      const data = await res.json();
      setSnapshotView(data);
    } catch (e) {
      console.error(e);
    }
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
                     {editingId && (
                       <>
                         <button
                           onClick={openHistoryPanel}
                           className="flex items-center justify-center gap-2 px-4 h-9 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 hover:text-amber-300 rounded-lg text-sm font-bold transition-all border border-amber-600/30 hover:border-amber-500/50 shadow-sm"
                         >
                           <History size={16} /> Histórico
                         </button>
                         <a
                           href={`/dashboard/${formData.subCompanyId}/custom/${editingId}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center justify-center gap-2 px-4 h-9 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-sm font-bold transition-all border border-zinc-700 hover:border-zinc-500 shadow-sm"
                         >
                           <ExternalLink size={16} /> Visualizar
                         </a>
                       </>
                     )}
                     <Button type="button" onClick={handleSubmit} loading={saving} className="bg-cyan-600 hover:bg-cyan-700 text-white h-9 px-4">Salvar Alterações</Button>
                     <button onClick={() => { setIsModalOpen(false); setShowHistory(false); setSnapshotView(null); }} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"><X size={20} /></button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden flex">
                  <div className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col p-6 space-y-6 transition-all ${showHistory ? "w-[60%]" : "w-full"}`}>

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

                  <AnimatePresence>
                    {showHistory && (
                      <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "40%", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-l border-zinc-800 bg-zinc-950/80 flex flex-col overflow-hidden"
                      >
                        <div className="p-4 border-b border-zinc-800 shrink-0 flex items-center justify-between">
                          {snapshotView ? (
                            <button onClick={() => setSnapshotView(null)} className="flex items-center gap-2 text-sm font-bold text-zinc-300 hover:text-white transition-colors">
                              <ArrowLeft size={16} /> Voltar às versões
                            </button>
                          ) : (
                            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                              <History size={16} /> Histórico de Versões
                            </h4>
                          )}
                          <button onClick={() => { setShowHistory(false); setSnapshotView(null); }} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
                            <X size={16} />
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                          {snapshotView ? (
                            <div className="p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-white font-bold text-sm">Snapshot — v{snapshotView.version}</p>
                                  <p className="text-zinc-500 text-xs mt-0.5">
                                    {actionLabels[snapshotView.action]?.label} em {formatDate(snapshotView.createdAt)}
                                  </p>
                                </div>
                                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${actionLabels[snapshotView.action]?.color || ""}`}>
                                  {actionLabels[snapshotView.action]?.label}
                                </span>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Título</label>
                                  <p className="text-white text-xs bg-zinc-800/50 rounded-lg p-2.5 border border-zinc-700/50">{snapshotView.snapshot?.title || "—"}</p>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Subtítulo</label>
                                  <p className="text-white text-xs bg-zinc-800/50 rounded-lg p-2.5 border border-zinc-700/50">{snapshotView.snapshot?.subtitle || "—"}</p>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Endpoint</label>
                                  <p className="text-white text-xs font-mono bg-zinc-800/50 rounded-lg p-2.5 border border-zinc-700/50">{snapshotView.snapshot?.endpoint || "—"}</p>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">formData (JSON)</label>
                                  <pre className="text-[10px] text-zinc-300 bg-black/40 rounded-lg p-3 border border-zinc-700/50 overflow-x-auto max-h-60 custom-scrollbar font-mono leading-relaxed">
                                    {JSON.stringify(snapshotView.snapshot?.formData, null, 2) || "{}"}
                                  </pre>
                                </div>
                              </div>

                              <Button
                                onClick={() => handleRestore(snapshotView.id)}
                                loading={restoringId === snapshotView.id}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2 mt-4"
                              >
                                <RotateCcw size={14} /> Restaurar esta versão
                              </Button>
                            </div>
                          ) : loadingVersions ? (
                            <div className="p-8 flex justify-center">
                              <Loader2 className="animate-spin text-amber-500 w-6 h-6" />
                            </div>
                          ) : versions.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500 text-sm">
                              Nenhum histórico registrado para esta página.
                            </div>
                          ) : (
                            <div className="divide-y divide-zinc-800/50">
                              {versions.map((v: any) => {
                                const action = actionLabels[v.action] || actionLabels.UPDATED;
                                return (
                                  <div key={v.id} className="p-3 hover:bg-zinc-800/30 transition-colors">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-800 text-white font-bold text-xs border border-zinc-700">
                                          v{v.version}
                                        </span>
                                        <div>
                                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${action.color}`}>
                                            {action.label}
                                          </span>
                                          <p className="text-zinc-500 text-[10px] mt-0.5">{formatDate(v.createdAt)}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => viewSnapshot(v.id)}
                                          className="p-1.5 text-zinc-500 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
                                          title="Visualizar"
                                        >
                                          <Eye size={14} />
                                        </button>
                                        <button
                                          onClick={() => handleRestore(v.id)}
                                          disabled={restoringId === v.id}
                                          className="p-1.5 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors disabled:opacity-50"
                                          title="Restaurar"
                                        >
                                          {restoringId === v.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                                        </button>
                                        <button
                                          onClick={() => handleDeleteVersion(v.id)}
                                          disabled={deletingId === v.id}
                                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                                          title="Excluir versão"
                                        >
                                          {deletingId === v.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}