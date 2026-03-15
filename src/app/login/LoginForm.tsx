/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Lock, Mail, Eye, EyeOff, Shield } from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Falha no login");

      login(data.user); 
      
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <Card className="p-8 shadow-2xl border-zinc-800 bg-zinc-900/80 backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/20 rounded-2xl mb-4 border border-indigo-500/30">
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Mavellium CMS</h1>
            <p className="text-zinc-400 text-sm mt-2">Acesse seu painel de controle</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <Input type="email" placeholder="seu@email.com" value={email} onChange={(e: any) => setEmail(e.target.value)} className="pl-10 bg-black/40 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-indigo-500" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e: any) => setPassword(e.target.value)} className="pl-10 pr-10 bg-black/40 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-indigo-500" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wide py-3">
              Autenticar
            </Button>
          </form>

          <FeedbackMessages errorMsg={errorMsg} />
        </Card>
      </motion.div>
    </div>
  );
}