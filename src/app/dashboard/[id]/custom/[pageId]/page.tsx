/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";
import * as Icons from "lucide-react";
import AdvancedJsonEditor from "@/components/AdvancedJsonEditor";

export default function DynamicPageRenderer() {
  const params = useParams();
  const subCompanyId = params.id;
  const pageId = params.pageId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageMould, setPageMould] = useState<any>(null);
  const [userValues, setUserValues] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const fetchData = useCallback(async () => {
    if (!pageId || !subCompanyId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Busca o MOLDE (A estrutura que o Admin criou)
      const mouldRes = await fetch(`/api/pages/${pageId}`);
      if (!mouldRes.ok) throw new Error("Estrutura da página não encontrada.");
      const mouldData = await mouldRes.json();
      setPageMould(mouldData);

      // 2. Busca as RESPOSTAS (O que o usuário já preencheu)
      const dataRes = await fetch(`${mouldData.endpoint}?subCompanyId=${subCompanyId}`);
      if (dataRes.ok) {
        const dataJson = await dataRes.json();
        setUserValues(dataJson || {});
      }
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
      form.append("subCompanyId", subCompanyId as string);
      form.append("values", JSON.stringify(userValues));

      const res = await fetch(pageMould.endpoint, {
        method: "POST",
        body: form
      });

      if (res.ok) {
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch (e) {
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-zinc-950 gap-3">
      <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
      <span className="text-zinc-400">Construindo interface...</span>
    </div>
  );

  const PageIcon = (Icons as any)[pageMould?.icon] || Icons.FileText;

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <PageIcon className="text-indigo-500 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{pageMould.title}</h1>
              <p className="text-zinc-400 text-sm">{pageMould.subtitle}</p>
            </div>
          </div>
          
          <Button onClick={handleSave} loading={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 px-8 h-12 rounded-xl">
            {successMsg ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {successMsg ? "Alterações Salvas!" : "Salvar Configurações"}
          </Button>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 p-0 overflow-hidden">
           {/* PASSAMOS A ESTRUTURA (mould) E OS DADOS (userValues).
             readOnlyStructure={true} garante que o usuário não delete campos.
           */}
           <AdvancedJsonEditor 
             structure={pageMould.formData} 
             data={userValues} 
             readOnlyStructure={true} 
             onChange={(path: string, val: any) => {
               setUserValues((prev: any) => {
                 const copy = { ...prev };
                 const keys = path.split('.');
                 let cur = copy;
                 keys.forEach((k, i) => {
                    if (i === keys.length - 1) cur[k] = val;
                    else { cur[k] = { ...cur[k] }; cur = cur[k]; }
                 });
                 return copy;
               });
             }}
           />
        </Card>
      </div>
    </div>
  );
}