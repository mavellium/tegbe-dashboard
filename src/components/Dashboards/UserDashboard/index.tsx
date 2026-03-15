/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Card } from "@/components/Card";
import { Building2, ArrowRight, BarChart3, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface UserDashboardProps {
  user: any;
  company: any;
  subCompanies: any[];
}

export default function UserDashboard({ user, company, subCompanies }: UserDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2 pt-4">
          <h1 className="text-3xl font-black text-white">Olá, {user.name.split(" ")[0]}!</h1>
          <p className="text-zinc-400 font-medium flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-500" />
            {company.name} — Selecione uma unidade para gerenciar
          </p>
        </div>

        {/* Lista de Unidades/SubCompanies */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subCompanies.map((sub) => (
            <Link href={`/dashboard/${sub.id}`} key={sub.id} className="group">
              <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-indigo-500 transition-all duration-300 h-full flex flex-col justify-between group-hover:shadow-2xl group-hover:shadow-indigo-500/10">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="relative w-12 h-12 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700">
                      {sub.logo_img ? (
                        <Image src={sub.logo_img} alt={sub.name} fill className="object-contain p-2" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500"><Globe size={20}/></div>
                      )}
                    </div>
                    <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-indigo-400 transition-colors">
                      <BarChart3 size={20} />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{sub.name}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-2 mb-6">
                    {sub.description || "Nenhuma descrição configurada para esta unidade."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 group-hover:text-indigo-400">Acessar Analytics</span>
                  <ArrowRight size={18} className="text-zinc-600 group-hover:translate-x-1 transition-transform group-hover:text-indigo-400" />
                </div>
              </Card>
            </Link>
          ))}

          {subCompanies.length === 0 && (
            <div className="col-span-full py-20 text-center bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800">
              <p className="text-zinc-500">Nenhuma filial cadastrada para sua empresa ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}