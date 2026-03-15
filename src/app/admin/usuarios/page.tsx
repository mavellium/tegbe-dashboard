/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Switch } from "@/components/Switch";
import { Users, Plus, Edit2, Trash2, Loader2, X, ShieldAlert, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UsuariosCRUD() {
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 1. ADICIONADO forcePasswordChange no estado inicial
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "USER", companyId: "", isActive: true, forcePasswordChange: false
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, compRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/companies")
      ]);
      setUsers(await usersRes.json());
      setCompanies(await compRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/users/${editingId}` : "/api/users";
      
      const payload = { ...formData };
      if (editingId && !payload.password) delete (payload as any).password;
      if (payload.role === "ADMIN") payload.companyId = ""; 
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao salvar");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário definitivamente?")) return;
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const openNew = () => {
    setFormData({ name: "", email: "", password: "", role: "USER", companyId: "", isActive: true, forcePasswordChange: false });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = (user: any) => {
    setFormData({ 
      name: user.name, email: user.email, password: "", 
      role: user.role, companyId: user.companyId || "", isActive: user.isActive,
      // 2. RECUPERA O ESTADO DO BANCO NA EDIÇÃO
      forcePasswordChange: user.forcePasswordChange || false
    });
    setEditingId(user.id);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 text-zinc-100">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="text-emerald-500" /> Usuários do Sistema
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Gerencie acessos de administradores e clientes.</p>
          </div>
          <Button onClick={openNew} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
            <Plus size={18} /> Novo Usuário
          </Button>
        </div>

        <Card className="bg-zinc-900/80 border-zinc-800 overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-emerald-500 w-8 h-8" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-950/50 text-zinc-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Usuário</th>
                    <th className="px-6 py-4">Acesso / Empresa</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-white flex items-center gap-2">
                          {u.name} 
                          {u.forcePasswordChange && <KeyRound size={12} className="text-amber-500" />}
                        </p>
                        <p className="text-xs text-zinc-500">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        {u.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                            <ShieldAlert size={12} /> Root Admin
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-emerald-400">
                            {u.company?.name || "Nenhuma Empresa Vinculada"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${u.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                          {u.isActive ? "Ativo" : "Bloqueado"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => openEdit(u)} className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(u.id)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
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
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-zinc-800 shrink-0">
                  <h3 className="text-lg font-bold text-white">{editingId ? "Editar Usuário" : "Novo Usuário"}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Nome Completo</label>
                      <Input required value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} className="bg-black/50 border-zinc-800 text-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">E-mail (Login)</label>
                      <Input required type="email" value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} className="bg-black/50 border-zinc-800 text-white" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Senha {editingId && <span className="text-zinc-600 normal-case">(Deixe em branco para manter a atual)</span>}</label>
                    <Input type="password" required={!editingId} value={formData.password} onChange={(e: any) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" className="bg-black/50 border-zinc-800 text-white" />
                  </div>

                  {/* 3. SWITCH DE TROCA DE SENHA OBRIGATÓRIA */}
                  <div className="flex items-center justify-between p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
                    <div>
                      <p className="text-sm font-semibold text-amber-500 flex items-center gap-2"><KeyRound size={16} /> Exigir Troca de Senha</p>
                      <p className="text-xs text-zinc-400">O usuário será obrigado a trocar a senha no próximo login.</p>
                    </div>
                    <Switch checked={formData.forcePasswordChange} onCheckedChange={(val) => setFormData({...formData, forcePasswordChange: val})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Nível de Acesso</label>
                      <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full p-3 bg-black/50 border border-zinc-800 rounded-lg text-white outline-none focus:border-emerald-500">
                        <option value="USER">Usuário Padrão (Cliente)</option>
                        <option value="ADMIN">Administrador Root</option>
                      </select>
                    </div>
                    
                    {formData.role === "USER" && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Empresa do Cliente</label>
                        <select required={formData.role === "USER"} value={formData.companyId} onChange={(e) => setFormData({...formData, companyId: e.target.value})} className="w-full p-3 bg-black/50 border border-zinc-800 rounded-lg text-white outline-none focus:border-emerald-500">
                          <option value="" disabled>Vincular a uma empresa...</option>
                          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </motion.div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                    <div>
                      <p className="text-sm font-semibold text-white">Status da Conta</p>
                      <p className="text-xs text-zinc-500">Contas inativas não conseguem fazer login.</p>
                    </div>
                    <Switch checked={formData.isActive} onCheckedChange={(val) => setFormData({...formData, isActive: val})} />
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
                    <Button type="button" onClick={() => setIsModalOpen(false)} className="bg-transparent hover:bg-zinc-800 text-zinc-300">Cancelar</Button>
                    <Button type="submit" loading={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">Salvar Usuário</Button>
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