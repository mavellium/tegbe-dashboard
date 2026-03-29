/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ImageUpload";
import { Button } from "@/components/Button";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { ArrowLeft, Save, Globe, Settings, FileText, Loader2, Check } from "lucide-react";

interface Category { id: string; name: string; }
interface Tag { id: string; name: string; }
interface BlogPost {
  id?: string; title: string; subtitle: string; body: string; excerpt: string;
  image: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; featured: boolean;
  categoryId: string; seoTitle: string; seoDescription: string; seoKeywords: string;
}

interface PostEditorProps {
  subCompanyId: string;
  initialData?: BlogPost;
  categories: Category[];
  tags: Tag[];
  initialTagIds?: string[];
}

export default function PostEditor({ subCompanyId, initialData, categories = [], tags = [], initialTagIds = [] }: PostEditorProps) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");
  const [formData, setFormData] = useState<BlogPost>(initialData || {
    title: "", subtitle: "", body: "", excerpt: "", image: "", status: "DRAFT", featured: false, categoryId: "", seoTitle: "", seoDescription: "", seoKeywords: ""
  });
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTagIds);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, success: false, msg: "" });

  const showFeedback = (success: boolean, msg: string) => {
    setFeedback({ show: true, success, msg });
    setTimeout(() => setFeedback(prev => ({ ...prev, show: false })), 4000);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.body || !formData.categoryId) {
      showFeedback(false, "Título, corpo e categoria são obrigatórios.");
      return;
    }
    
    setIsSaving(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) data.append(key, value.toString());
    });
    data.append("subCompanyId", subCompanyId);
    data.append("tagIds", JSON.stringify(selectedTags));

    // CORRIGIDO: Inserindo o subCompanyId na URL da API
    const url = isEditing ? `/api/${subCompanyId}/blog/posts/${initialData.id}` : `/api/${subCompanyId}/blog/posts`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: data });
      if (res.ok) {
        showFeedback(true, "Post salvo com sucesso!");
        router.refresh();
        if (!isEditing) router.push(`/dashboard/${subCompanyId}/blog`);
      } else {
        const err = await res.json();
        showFeedback(false, err.error || "Erro ao salvar.");
      }
    } catch (e) {
      showFeedback(false, "Erro de conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  };

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 space-y-8 text-zinc-100">
      {/* Header Fixo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/80 p-5 rounded-2xl border border-white/10 shadow-xl sticky top-4 z-30 backdrop-blur-md">
        <div className="flex items-center gap-5">
          <button onClick={() => router.back()} className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 transition-all border border-white/5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              {isEditing ? 'Editar Publicação' : 'Criar Nova Publicação'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${formData.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <p className="text-sm text-zinc-400 font-medium">
                {formData.status === 'PUBLISHED' ? 'Publicado e visível no site' : 'Salvo localmente como rascunho'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value as any})} 
            className="px-4 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-sm font-semibold text-zinc-100 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] cursor-pointer transition-all"
          >
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="ARCHIVED">Arquivado</option>
          </select>
          <Button variant="primary" onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-[var(--color-primary)]/20">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />} 
            {isEditing ? 'Atualizar Post' : 'Publicar Post'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* COLUNA PRINCIPAL - CONTEÚDO */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex bg-zinc-900/50 p-1 border border-white/5 rounded-xl w-max shadow-lg backdrop-blur-md">
            <button onClick={() => setActiveTab("content")} className={`px-6 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all duration-300 ${activeTab === "content" ? "bg-[var(--color-primary)] text-white shadow-md" : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"}`}>
              <FileText className="w-4 h-4" /> Conteúdo Principal
            </button>
            <button onClick={() => setActiveTab("seo")} className={`px-6 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all duration-300 ${activeTab === "seo" ? "bg-[var(--color-primary)] text-white shadow-md" : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"}`}>
              <Globe className="w-4 h-4" /> SEO e Descoberta
            </button>
          </div>

          {activeTab === "content" ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-zinc-900/90 p-8 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Título da Publicação <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    placeholder="Digite um título chamativo..." 
                    className="w-full px-5 py-4 bg-zinc-950 border border-white/10 rounded-xl text-2xl font-bold text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all shadow-inner" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Subtítulo (Opcional)</label>
                  <input 
                    type="text" 
                    value={formData.subtitle} 
                    onChange={e => setFormData({...formData, subtitle: e.target.value})} 
                    placeholder="Complemente o título com uma linha de apoio..." 
                    className="w-full px-5 py-3 bg-zinc-950 border border-white/10 rounded-xl text-lg text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all shadow-inner" 
                  />
                </div>
              </div>

              <div className="bg-zinc-900/90 p-8 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md space-y-4">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Corpo do Artigo <span className="text-rose-500">*</span></label>
                
                {/* Aqui você vai plugar o seu Rich Text Editor futuramente */}
                <textarea 
                  value={formData.body} 
                  onChange={e => setFormData({...formData, body: e.target.value})} 
                  className="w-full px-6 py-5 bg-zinc-950 border border-white/10 rounded-xl min-h-[500px] text-base leading-relaxed text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all resize-y custom-scrollbar shadow-inner"
                  placeholder="Comece a escrever sua história épica aqui..."
                />
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/90 p-8 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md space-y-8 animate-in fade-in duration-300">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2"><Globe className="w-5 h-5 text-[var(--color-primary)]"/> Otimização para Motores de Busca</h2>
                <p className="text-sm text-zinc-400 mt-1">Configure como seu post aparecerá no Google e redes sociais.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex justify-between">
                    SEO Title
                    <span className="text-xs font-normal normal-case text-zinc-500">{formData.seoTitle?.length || 0}/60</span>
                  </label>
                  <input type="text" value={formData.seoTitle} onChange={e => setFormData({...formData, seoTitle: e.target.value})} placeholder="Título alternativo focado em SEO..." className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all shadow-inner" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex justify-between">
                    Meta Description
                    <span className="text-xs font-normal normal-case text-zinc-500">{formData.seoDescription?.length || 0}/160</span>
                  </label>
                  <textarea value={formData.seoDescription} onChange={e => setFormData({...formData, seoDescription: e.target.value})} className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all h-28 resize-none shadow-inner" placeholder="Descrição curta que aparece nos resultados de pesquisa..." />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Palavras-chave (Keywords)</label>
                  <input type="text" value={formData.seoKeywords} onChange={e => setFormData({...formData, seoKeywords: e.target.value})} placeholder="Ex: e-commerce, tecnologia, dicas (separado por vírgulas)" className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all shadow-inner" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLUNA LATERAL - CONFIGURAÇÕES E MÍDIA */}
        <div className="space-y-6">
          <div className="bg-zinc-900/90 p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md space-y-6">
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2 border-b border-white/10 pb-4">
              <Settings className="w-5 h-5 text-[var(--color-primary)]"/> Organização
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Categoria <span className="text-rose-500">*</span></label>
              <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-sm font-medium text-zinc-100 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all cursor-pointer shadow-inner">
                <option value="" disabled>Selecione uma categoria...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Tags de Marcação</label>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 border border-white/10 bg-zinc-950 rounded-xl custom-scrollbar shadow-inner">
                {tags.length === 0 ? (
                  <p className="text-xs text-zinc-500 w-full text-center py-2 font-medium">Nenhuma tag criada.</p>
                ) : (
                  tags.map(t => (
                    <button 
                      key={t.id} 
                      type="button"
                      onClick={() => toggleTag(t.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all border flex items-center gap-1.5 ${selectedTags.includes(t.id) ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md' : 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-[var(--color-primary)]/50 hover:text-white'}`}
                    >
                      {selectedTags.includes(t.id) && <Check className="w-3 h-3" />} {t.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex justify-between">
                Resumo (Excerpt)
              </label>
              <textarea value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-zinc-100 placeholder:text-zinc-600 text-sm h-28 resize-none outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all shadow-inner" placeholder="Pequeno texto que aparecerá nos cards de listagem do blog..." />
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-4 border border-white/10 rounded-xl bg-zinc-950 hover:border-[var(--color-primary)]/50 transition-all group shadow-inner">
              <div className="relative flex items-center justify-center w-5 h-5">
                <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} className="peer appearance-none w-5 h-5 border-2 border-zinc-600 rounded flex-shrink-0 checked:bg-[var(--color-primary)] checked:border-transparent transition-colors cursor-pointer" />
                <Check className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <div>
                <span className="text-sm font-bold text-zinc-100 block">Destacar na Home</span>
                <span className="text-xs text-zinc-500 font-medium">Marca este post como conteúdo principal.</span>
              </div>
            </label>
          </div>

          <div className="bg-zinc-900/90 p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-lg font-bold text-zinc-100 border-b border-white/10 pb-4 flex items-center gap-2">
              Imagem de Capa
            </h3>
            <div className="bg-zinc-950 p-4 rounded-xl border border-white/10 shadow-inner">
              <ImageUpload 
                label="" 
                currentImage={formData.image || ""} 
                onChange={url => setFormData({...formData, image: url})} 
                aspectRatio="aspect-video"
                description="Resolução recomendada: 1200x630px (16:9)"
                showRemoveButton
              />
            </div>
          </div>
        </div>
      </div>

      {feedback.show && <FeedbackMessages success={feedback.success} errorMsg={feedback.msg} />}
    </div>
  );
}