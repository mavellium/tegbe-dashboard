/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";
import AdvancedJsonEditor from "@/components/AdvancedJsonEditor";

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

        <Card className="bg-zinc-900 border-zinc-800 p-0 overflow-hidden shadow-2xl">
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
        </Card>
      </div>
    </div>
  );
}