"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export default function PreviewFormPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formId) return;

    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/components/${formId}`);
        const data = await res.json();

        if (data.success && data.component) {
          const finalHtml = data.component.html.replace(/{{COMPONENT_ID}}/g, formId);
          setHtml(finalHtml);
        } else {
          setError("Formulário não encontrado.");
        }
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar o formulário. Verifique a conexão.");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f5f9]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Carregando pré-visualização...</p>
      </div>
    );
  }

  if (error || !html) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f5f9]">
        <AlertCircle className="w-14 h-14 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
        <p className="text-gray-600 mb-6">{error || "Conteúdo indisponível"}</p>
        <button
          onClick={() => window.close()}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Fechar aba
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans">
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md z-50">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-semibold tracking-wide text-slate-200">
            MODO PRÉ-VISUALIZAÇÃO
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 hidden sm:block">
            Teste os campos, cores e o envio do formulário.
          </span>
          <button
            onClick={() => window.close()}
            className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Editor
          </button>
        </div>
      </div>

      <div className="flex-1 w-full p-4 md:p-10 flex justify-center items-start overflow-y-auto relative">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>

        <div
          className="w-full relative z-10 my-8"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}