/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Loader2, Save, CheckCircle2, AlertCircle, History, RotateCcw, X, Eye, ArrowLeft } from "lucide-react";
import AdvancedJsonEditor from "@/components/AdvancedJsonEditor";
import { motion, AnimatePresence } from "framer-motion";

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

export default function DynamicPageRenderer() {
  const params = useParams();
  const subCompanyId = params.id as string;
  const pageId = params.pageId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageMould, setPageMould] = useState<any>(null);
  const [userValues, setUserValues] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  // Estados do histórico
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [snapshotView, setSnapshotView] = useState<any>(null);

  const fetchData = useCallback(async () => {
    if (!pageId || !subCompanyId) return;
    setLoading(true);
    setError(null);
    try {
      const mouldRes = await fetch(`/api/pages/${pageId}`);
      if (!mouldRes.ok) throw new Error("Estrutura da página não encontrada.");
      const mouldData = await mouldRes.json();
      
      if (typeof mouldData.formData === 'string') {
        try { mouldData.formData = JSON.parse(mouldData.formData); } 
        catch { mouldData.formData = {}; }
      }
      setPageMould(mouldData);

      let userValuesData = null;
      const dataRes = await fetch(mouldData.endpoint);
      if (dataRes.ok) {
        const dataJson = await dataRes.json();
        const isArr = Array.isArray(dataJson);
        if (dataJson && ((isArr && dataJson.length > 0) || (!isArr && Object.keys(dataJson).length > 0))) {
          userValuesData = dataJson;
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

      setUserValues(mergeData(mouldData.formData || {}, userValuesData));

    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [pageId, subCompanyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const form = new FormData();
      form.append("values", JSON.stringify(userValues));

      const res = await fetch(pageMould.endpoint, {
        method: "POST",
        body: form
      });

      if (res.ok) {
        try {
          const pageSlug = pageMould.endpoint.split('/').pop() || "hero-carrossel-home";
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

        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      } else {
        throw new Error("Falha na API ao salvar");
      }
    } catch (e) {
      alert("Erro ao salvar. Verifique o console.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = useCallback((path: string, val: any) => {
    setUserValues((prev: any) => {
      const newData = prev ? structuredClone(prev) : {}; 
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (current[key] === undefined || current[key] === null) {
          current[key] = isNaN(Number(keys[i + 1])) ? {} : [];
        }
        current = current[key];
      }
      
      current[keys[keys.length - 1]] = val;
      return newData;
    });
  }, []);

  const fetchVersions = async () => {
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

  const openHistoryPanel = () => {
    setShowHistory(true);
    setSnapshotView(null);
    fetchVersions();
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

  const handleRestore = async (historyId: string) => {
    if (!confirm("Deseja restaurar esta versão? O conteúdo da página será substituído permanentemente pela versão do backup.")) return;
    setRestoringId(historyId);
    try {
      const res = await fetch(`/api/history/restore/${historyId}`, { method: "POST" });
      if (res.ok) {
        alert("Versão restaurada com sucesso!");
        setSnapshotView(null);
        await fetchData(); // Recarrega os dados atuais para o editor
        fetchVersions();   // Recarrega o último histórico
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

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950 gap-3">
      <Loader2 className="animate-spin text-cyan-500 w-8 h-8" />
      <span className="text-zinc-400 font-medium">Construindo interface...</span>
    </div>
  );

  if (error) return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 gap-4">
      <AlertCircle className="text-red-500 w-12 h-12" />
      <span className="text-red-400 font-medium">{error}</span>
      <Button onClick={() => window.location.reload()} className="mt-4 bg-zinc-800 text-white">Tentar Novamente</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Gerenciar: {pageMould?.title}</h1>
            <p className="text-zinc-400 text-sm mt-1">Preencha os campos abaixo para atualizar o conteúdo desta página.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={openHistoryPanel}
              className="flex items-center justify-center gap-2 px-4 h-11 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 hover:text-amber-300 rounded-xl text-sm font-bold transition-all border border-amber-600/30 hover:border-amber-500/50 shadow-sm"
            >
              <History size={18} /> Histórico
            </button>
            <Button 
              onClick={handleSave} 
              loading={saving} 
              className={`flex items-center gap-2 px-8 h-11 rounded-xl font-bold transition-all duration-300 ${
                successMsg 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-[0_0_20px_rgba(22,163,74,0.3)]' 
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]'
              }`}
            >
              {successMsg ? <CheckCircle2 size={18} /> : <Save size={18} />}
              {successMsg ? "Alterações Salvas!" : "Salvar Configurações"}
            </Button>
          </div>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 flex flex-col md:flex-row overflow-hidden shadow-2xl min-h-[700px] p-0">
           <div className={`transition-all duration-300 flex-1 ${showHistory ? "hidden md:block w-[60%]" : "w-full"}`}>
             <AdvancedJsonEditor 
               structure={pageMould?.formData} 
               data={userValues} 
               readOnlyStructure={true} 
               onChange={handleFieldChange}
               onReplaceData={(newJson: any) => setUserValues(newJson)}
               previewUrl={pageMould?.endpoint}
               pageTitle={pageMould?.title}
               pageSubtitle={pageMould?.subtitle}
               pageIcon={pageMould?.icon}
             />
           </div>

           {/* Painel lateral de Histórico */}
           <AnimatePresence>
             {showHistory && (
               <motion.div
                 initial={{ width: 0, opacity: 0 }}
                 animate={{ width: "40%", opacity: 1 }}
                 exit={{ width: 0, opacity: 0 }}
                 transition={{ duration: 0.2 }}
                 className="border-l border-zinc-800 bg-zinc-950/80 flex flex-col overflow-hidden min-w-[320px]"
               >
                 {/* Header do painel */}
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

                 {/* Conteúdo do painel */}
                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                   {snapshotView ? (
                     /* Visualização do Snapshot */
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
                           <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Conteúdo Preservado (JSON)</label>
                           <pre className="text-[10px] text-zinc-300 bg-black/40 rounded-lg p-3 border border-zinc-700/50 overflow-x-auto max-h-[400px] custom-scrollbar font-mono leading-relaxed">
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
                     /* Lista de Versões */
                     <div className="divide-y divide-zinc-800/50">
                       {versions.map((v: any) => {
                         const action = actionLabels[v.action] || actionLabels.UPDATED;
                         return (
                           <div key={v.id} className="p-4 hover:bg-zinc-800/30 transition-colors">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                 <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-800 text-white font-bold text-sm border border-zinc-700">
                                   v{v.version}
                                 </span>
                                 <div>
                                   <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${action.color}`}>
                                     {action.label}
                                   </span>
                                   <p className="text-zinc-500 text-[10px] mt-1">{formatDate(v.createdAt)}</p>
                                 </div>
                               </div>
                               <div className="flex items-center gap-1">
                                 <button
                                   onClick={() => viewSnapshot(v.id)}
                                   className="p-2 text-zinc-500 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
                                   title="Visualizar"
                                 >
                                   <Eye size={16} />
                                 </button>
                                 <button
                                   onClick={() => handleRestore(v.id)}
                                   disabled={restoringId === v.id}
                                   className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors disabled:opacity-50"
                                   title="Restaurar"
                                 >
                                   {restoringId === v.id ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
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
        </Card>
      </div>
    </div>
  );
}