/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { History, Loader2, X, ArrowLeft, Eye, RotateCcw, ChevronRight } from "lucide-react";
import * as Icons from "lucide-react";
import { Icon } from "@iconify/react";
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

export default function HistoricoCRUD() {
  const [pages, setPages] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"pages" | "versions">("pages");
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<any>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/history/pages");
      setPages(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async (pageId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/history/pages/${pageId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setVersions(data);
      } else {
        setVersions([]);
      }
    } catch (e) {
      console.error(e);
      setVersions([]);
    } finally {
      setLoading(false);
    }
  };

  const viewSnapshot = async (historyId: string) => {
    try {
      const res = await fetch(`/api/history/${historyId}`);
      const data = await res.json();
      setSelectedSnapshot(data);
      setIsSnapshotModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestore = async (historyId: string) => {
    if (!confirm("Deseja restaurar esta versão? A página será atualizada com os dados desta versão.")) return;
    setRestoring(historyId);
    try {
      const res = await fetch(`/api/history/restore/${historyId}`, { method: "POST" });
      if (res.ok) {
        alert("Versão restaurada com sucesso!");
        if (selectedPage) {
          fetchVersions(selectedPage.originalPageId);
        }
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao restaurar versão.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro de comunicação com a API.");
    } finally {
      setRestoring(null);
    }
  };

  const openVersions = (page: any) => {
    setSelectedPage(page);
    setViewMode("versions");
    fetchVersions(page.originalPageId);
  };

  const backToPages = () => {
    setViewMode("pages");
    setSelectedPage(null);
    setVersions([]);
    fetchPages();
  };

  useEffect(() => {
    fetchPages();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 text-zinc-100">
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {viewMode === "versions" && (
              <button onClick={backToPages} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <History className="text-amber-500" />
                {viewMode === "pages" ? "Histórico de Páginas" : `Versões: ${selectedPage?.title}`}
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                {viewMode === "pages"
                  ? "Visualize e restaure versões anteriores das páginas do CMS."
                  : `${versions.length} versão(ões) encontrada(s) para esta página.`}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="bg-zinc-900/80 border-zinc-800 overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
            </div>
          ) : viewMode === "pages" ? (
            /* === TELA 1: Lista de Pages com Histórico === */
            pages.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">Nenhum histórico registrado ainda.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-950/50 text-zinc-400 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Página</th>
                      <th className="px-6 py-4">Endpoint</th>
                      <th className="px-6 py-4 text-center">Versões</th>
                      <th className="px-6 py-4">Última Modificação</th>
                      <th className="px-6 py-4">Última Ação</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {pages.map((page: any) => {
                      const PageIconLegacy = (Icons as any)[page.icon] || Icons.FileText;
                      const action = actionLabels[page.lastAction] || actionLabels.UPDATED;
                      return (
                        <tr key={page.originalPageId} className="hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                            {page.icon?.includes(":") ? (
                              <Icon icon={page.icon} className="text-zinc-500 w-[18px] h-[18px]" />
                            ) : (
                              <PageIconLegacy size={18} className="text-zinc-500" />
                            )}
                            <span>{page.title}</span>
                          </td>
                          <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{page.endpoint}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 font-bold text-sm">
                              {page.versionCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-zinc-400 text-xs">{formatDate(page.lastModified)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${action.color}`}>
                              {action.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => openVersions(page)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-lg transition-colors"
                            >
                              Ver Versões <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* === TELA 2: Versões de uma Page === */
            versions.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">Nenhuma versão encontrada.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-950/50 text-zinc-400 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Versão</th>
                      <th className="px-6 py-4">Data / Hora</th>
                      <th className="px-6 py-4">Ação</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {versions.map((v: any) => {
                      const action = actionLabels[v.action] || actionLabels.UPDATED;
                      return (
                        <tr key={v.id} className="hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-800 text-white font-bold text-sm border border-zinc-700">
                              v{v.version}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-zinc-400 text-sm">{formatDate(v.createdAt)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${action.color}`}>
                              {action.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => viewSnapshot(v.id)}
                              className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
                              title="Visualizar snapshot"
                            >
                              <Eye size={16} />
                            </button>
                            <Button
                              onClick={() => handleRestore(v.id)}
                              loading={restoring === v.id}
                              className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-3 py-1.5 flex items-center gap-1"
                            >
                              <RotateCcw size={14} /> Restaurar
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </Card>

        {/* Modal: Visualizar Snapshot */}
        <AnimatePresence>
          {isSnapshotModalOpen && selectedSnapshot && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
              >
                <div className="p-4 border-b border-zinc-800 bg-zinc-950 shrink-0 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Snapshot — v{selectedSnapshot.version}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {actionLabels[selectedSnapshot.action]?.label} em {formatDate(selectedSnapshot.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSnapshotModalOpen(false)}
                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                  {/* Campos principais */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Título</label>
                      <p className="text-white text-sm bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                        {(selectedSnapshot.snapshot as any)?.title || "—"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Subtítulo</label>
                      <p className="text-white text-sm bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                        {(selectedSnapshot.snapshot as any)?.subtitle || "—"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Ícone</label>
                      <p className="text-white text-sm bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                        {(selectedSnapshot.snapshot as any)?.icon || "—"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">Endpoint</label>
                      <p className="text-white text-sm font-mono bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                        {(selectedSnapshot.snapshot as any)?.endpoint || "—"}
                      </p>
                    </div>
                  </div>

                  {/* formData como JSON */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1">formData (JSON)</label>
                    <pre className="text-xs text-zinc-300 bg-black/40 rounded-lg p-4 border border-zinc-700/50 overflow-x-auto max-h-80 custom-scrollbar font-mono leading-relaxed">
                      {JSON.stringify((selectedSnapshot.snapshot as any)?.formData, null, 2) || "{}"}
                    </pre>
                  </div>

                  {/* Metadados */}
                  <div className="grid grid-cols-2 gap-4 text-xs text-zinc-500">
                    <div>
                      <span className="font-semibold uppercase">Page ID:</span>{" "}
                      <span className="font-mono">{(selectedSnapshot.snapshot as any)?.id || "—"}</span>
                    </div>
                    <div>
                      <span className="font-semibold uppercase">SubCompany ID:</span>{" "}
                      <span className="font-mono">{(selectedSnapshot.snapshot as any)?.subCompanyId || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-zinc-800 bg-zinc-950 shrink-0 flex justify-end gap-3">
                  <Button
                    onClick={() => handleRestore(selectedSnapshot.id)}
                    loading={restoring === selectedSnapshot.id}
                    className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
                  >
                    <RotateCcw size={16} /> Restaurar esta versão
                  </Button>
                  <button
                    onClick={() => setIsSnapshotModalOpen(false)}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
