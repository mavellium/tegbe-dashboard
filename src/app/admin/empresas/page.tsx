/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Building, Plus, Edit2, Trash2, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EmpresasCRUD() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [saving, setSaving] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();
      setCompanies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/companies/${editingId}` : "/api/companies";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: "" });
        setEditingId(null);
        fetchCompanies();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta empresa apagará todas as filiais e usuários vinculados a ela. Continuar?")) return;
    try {
      await fetch(`/api/companies/${id}`, { method: "DELETE" });
      fetchCompanies();
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = (company: any) => {
    setFormData({ name: company.name });
    setEditingId(company.id);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 text-zinc-100">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Building className="text-indigo-500" /> Empresas (Matrizes)
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Gerencie as empresas clientes do sistema.</p>
          </div>
          <Button onClick={() => { setFormData({ name: "" }); setEditingId(null); setIsModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
            <Plus size={18} /> Nova Empresa
          </Button>
        </div>

        <Card className="bg-zinc-900/80 border-zinc-800 overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-950/50 text-zinc-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Nome da Empresa</th>
                    <th className="px-6 py-4 text-center">Filiais</th>
                    <th className="px-6 py-4 text-center">Usuários</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {companies.map(c => (
                    <tr key={c.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-zinc-800 text-zinc-300 py-1 px-3 rounded-full text-xs">{c.subCompanies?.length || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-zinc-800 text-zinc-300 py-1 px-3 rounded-full text-xs">{c._count?.users || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => openEdit(c)} className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {companies.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Nenhuma empresa cadastrada.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-zinc-800">
                  <h3 className="text-lg font-bold text-white">{editingId ? "Editar Empresa" : "Nova Empresa"}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Nome da Empresa</label>
                    <Input required value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} placeholder="Ex: Tegbe Group" className="bg-black/50 border-zinc-800 text-white" />
                  </div>
                  <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" onClick={() => setIsModalOpen(false)} className="bg-transparent hover:bg-zinc-800 text-zinc-300">Cancelar</Button>
                    <Button type="submit" loading={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">Salvar</Button>
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