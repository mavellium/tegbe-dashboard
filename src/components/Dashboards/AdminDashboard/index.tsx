/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Card } from "@/components/Card";
import { Users, Building, Activity, ShieldCheck, Network } from "lucide-react";
import Link from "next/link";

interface AdminDashboardProps {
  user: any;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 text-zinc-100">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <div className="flex flex-col gap-2 pt-4">
          <h1 className="text-3xl font-black text-white">
            Bem-vindo, {user?.name?.split(" ")[0] || "Admin"}!
          </h1>
          <p className="text-zinc-400 font-medium flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            Acesso de Administrador Root
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="p-6 border-l-4 border-indigo-500 bg-zinc-900 border-zinc-800 flex flex-col justify-between hover:shadow-lg hover:border-indigo-400 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Empresas Matrizes</p>
                <h2 className="text-2xl font-black text-white mt-1">Clientes</h2>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-xl">
                <Building className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <Link href="/admin/empresas" className="text-sm text-indigo-400 font-bold hover:text-indigo-300 hover:underline flex items-center justify-between">
              Gerenciar Matrizes <span>&rarr;</span>
            </Link>
          </Card>

          <Card className="p-6 border-l-4 border-cyan-500 bg-zinc-900 border-zinc-800 flex flex-col justify-between hover:shadow-lg hover:border-cyan-400 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Sub-Empresas</p>
                <h2 className="text-2xl font-black text-white mt-1">Filiais</h2>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-xl">
                <Network className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <Link href="/admin/subempresas" className="text-sm text-cyan-400 font-bold hover:text-cyan-300 hover:underline flex items-center justify-between">
              Gerenciar Filiais <span>&rarr;</span>
            </Link>
          </Card>

          <Card className="p-6 border-l-4 border-emerald-500 bg-zinc-900 border-zinc-800 flex flex-col justify-between hover:shadow-lg hover:border-emerald-400 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Pessoas & Acessos</p>
                <h2 className="text-2xl font-black text-white mt-1">Usuários</h2>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <Link href="/admin/usuarios" className="text-sm text-emerald-400 font-bold hover:text-emerald-300 hover:underline flex items-center justify-between">
              Controle de Acessos <span>&rarr;</span>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}