/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";

export default function ForcePasswordModal() {
  const { user, login } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Só renderiza se o usuário estiver logado e precisar trocar a senha
  if (!user || !user.forcePasswordChange) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return setError("A senha deve ter no mínimo 6 caracteres.");
    if (password !== confirmPassword) return setError("As senhas não coincidem.");

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/change-password-first-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, newPassword: password }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar senha.");

      setSuccess(true);
      
      // Atualiza o estado global do usuário localmente para fechar o modal
      setTimeout(() => {
        login({ ...user, forcePasswordChange: false });
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="text-amber-500 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Segurança Necessária</h2>
          <p className="text-zinc-400 text-sm mt-2">
            Este é seu primeiro acesso ou sua senha foi resetada. Por favor, escolha uma nova senha.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center py-6 animate-pulse">
            <CheckCircle2 className="text-emerald-500 w-12 h-12 mb-2" />
            <p className="text-emerald-500 font-bold">Senha alterada com sucesso!</p>
            <p className="text-zinc-500 text-xs mt-1">Redirecionando...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
                <Input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-black/40 border-zinc-800"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
                <Input
                  type={showPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e: any) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-black/40 border-zinc-800"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

            <Button type="submit" loading={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold">
              Atualizar e Acessar Painel
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}