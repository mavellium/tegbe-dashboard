/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { ImageUpload } from "@/components/ImageUpload";
import { 
  Plus, Edit3, Trash2, BookOpen, Loader2, 
  Search, FileText, Tag, FolderTree, X, Check, Globe, ImageIcon
} from "lucide-react";

type TabType = "posts" | "categories" | "tags";

interface BlogPost { id: string; title: string; status: string; categoryName: string; updatedAt: string; image: string | null; }
interface Taxon { 
  id: string; 
  name: string; 
  description: string | null; 
  image: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
}

interface Props {
  subCompanyId: string;
  initialPosts: BlogPost[];
  initialCategories: Taxon[];
  initialTags: Taxon[];
}

export default function BlogDashboardLayout({ subCompanyId, initialPosts, initialCategories, initialTags }: Props) {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [categories, setCategories] = useState<Taxon[]>(initialCategories);
  const [tags, setTags] = useState<Taxon[]>(initialTags);

  const [searchTerm, setSearchTerm] = useState("");

  const [quickEditPost, setQuickEditPost] = useState<string | null>(null);
  const [quickEditData, setQuickEditData] = useState({ title: "", status: "DRAFT" });

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Taxon | null>(null);
  const [formData, setFormData] = useState({ 
    name: "", description: "", image: "", seoTitle: "", seoDescription: "", seoKeywords: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const triggerFeedback = (isSuccess: boolean, msg: string = "") => {
    if (isSuccess) { setSuccess(true); setTimeout(() => setSuccess(false), 3000); } 
    else { setErrorMsg(msg); setTimeout(() => setErrorMsg(""), 4000); }
  };

  const handleNewPost = () => router.push(`/dashboard/${subCompanyId}/blog/post/new`);
  const handleEditPost = (id: string) => router.push(`/dashboard/${subCompanyId}/blog/post/${id}`);
  
  const startQuickEdit = (post: BlogPost) => {
    setQuickEditPost(post.id);
    setQuickEditData({ title: post.title, status: post.status });
  };

  const saveQuickEdit = async (id: string) => {
    try {
      const data = new FormData();
      data.append("title", quickEditData.title);
      data.append("status", quickEditData.status);
      data.append("subCompanyId", subCompanyId);

      // ATUALIZADO: Adicionado /api/${subCompanyId}/...
      const res = await fetch(`/api/${subCompanyId}/blog/posts/${id}`, { method: "PUT", body: data });
      
      if (res.ok) {
        setPosts(posts.map(p => p.id === id ? { ...p, title: quickEditData.title, status: quickEditData.status } : p));
        setQuickEditPost(null);
        triggerFeedback(true);
        router.refresh();
      } else {
        triggerFeedback(false, "Erro ao atualizar post.");
      }
    } catch {
      triggerFeedback(false, "Erro de conexão.");
    }
  };
  
  const handleDeletePost = async (id: string) => {
    if (!confirm("Excluir post permanentemente?")) return;
    try {
      // ATUALIZADO: Adicionado /api/${subCompanyId}/...
      const res = await fetch(`/api/${subCompanyId}/blog/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== id));
        triggerFeedback(true);
        router.refresh();
      } else throw new Error();
    } catch {
      triggerFeedback(false, "Erro ao excluir o post.");
    }
  };

  const openEditor = (item: Taxon | null = null) => {
    setEditingItem(item);
    setFormData({ 
      name: item?.name || "", 
      description: item?.description || "", 
      image: item?.image || "",
      seoTitle: item?.seoTitle || "",
      seoDescription: item?.seoDescription || "",
      seoKeywords: item?.seoKeywords || ""
    });
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setEditingItem(null);
    setFormData({ name: "", description: "", image: "", seoTitle: "", seoDescription: "", seoKeywords: "" });
    setIsEditorOpen(false);
  };

  const handleSaveTaxonomy = async () => {
    if (!formData.name.trim()) return;
    setIsSaving(true);

    const isCategory = activeTab === "categories";
    // ATUALIZADO: Adicionado /api/${subCompanyId}/...
    const endpoint = isCategory ? `/api/${subCompanyId}/blog/categories` : `/api/${subCompanyId}/blog/tags`;
    const url = editingItem ? `${endpoint}/${editingItem.id}` : endpoint;
    const method = editingItem ? "PUT" : "POST";

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("image", formData.image || ""); 
    data.append("seoTitle", formData.seoTitle);
    data.append("seoDescription", formData.seoDescription);
    data.append("seoKeywords", formData.seoKeywords);

    try {
      const res = await fetch(url, { method, body: data });
      const savedItem = await res.json();

      if (res.ok) {
        if (isCategory) {
          if (editingItem) setCategories(categories.map(c => c.id === savedItem.id ? savedItem : c));
          else setCategories([savedItem, ...categories]);
        } else {
          if (editingItem) setTags(tags.map(t => t.id === savedItem.id ? savedItem : t));
          else setTags([savedItem, ...tags]);
        }
        triggerFeedback(true);
        closeEditor();
        router.refresh();
      } else {
        triggerFeedback(false, savedItem.error || "Erro ao salvar.");
      }
    } catch (e) {
      triggerFeedback(false, "Erro de conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTaxonomy = async (id: string) => {
    const isCategory = activeTab === "categories";
    if (!confirm(`Excluir ${isCategory ? "categoria" : "tag"} permanentemente?`)) return;
    
    // ATUALIZADO: Adicionado /api/${subCompanyId}/...
    const endpoint = isCategory ? `/api/${subCompanyId}/blog/categories/${id}` : `/api/${subCompanyId}/blog/tags/${id}`;
    
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        if (isCategory) setCategories(categories.filter(c => c.id !== id));
        else setTags(tags.filter(t => t.id !== id));
        if (editingItem?.id === id) closeEditor();
        triggerFeedback(true);
      } else throw new Error();
    } catch {
      triggerFeedback(false, "Erro ao excluir.");
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchTerm("");
    closeEditor();
  };

  const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredTags = tags.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const currentItems = activeTab === "categories" ? filteredCategories : filteredTags;
  const isTaxonomyTab = activeTab === "categories" || activeTab === "tags";

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Rascunho';
      case 'PUBLISHED': return 'Publicado';
      case 'ARCHIVED': return 'Arquivado';
      default: return status;
    }
  };

  return (
    <ManageLayout headerIcon={BookOpen} title="Gestão do Blog" description="Gerencie seus posts, categorias e tags do blog." exists={true} itemName="Blog">
      <div className="space-y-8 pb-24 max-w-[1400px] mx-auto text-zinc-100">
        
        {/* TAB NAVIGATION */}
        <div className="flex bg-zinc-900/50 p-1 border border-white/5 rounded-xl w-max shadow-lg backdrop-blur-md">
          <button onClick={() => handleTabChange("posts")} className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === "posts" ? "bg-[var(--color-primary)] text-white shadow-md" : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"}`}>
            Publicações
          </button>
          <button onClick={() => handleTabChange("categories")} className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === "categories" ? "bg-[var(--color-primary)] text-white shadow-md" : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"}`}>
            Categorias
          </button>
          <button onClick={() => handleTabChange("tags")} className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === "tags" ? "bg-[var(--color-primary)] text-white shadow-md" : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"}`}>
            Tags
          </button>
        </div>

        {/* ABA: POSTS */}
        {activeTab === "posts" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/80 p-5 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Pesquisar publicações..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full pl-12 pr-4 py-3 bg-zinc-950/50 border border-white/5 rounded-xl text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all" 
                />
              </div>
              <Button variant="primary" onClick={handleNewPost} className="py-3 px-6 shadow-lg shadow-[var(--color-primary)]/20 font-bold">
                <Plus className="w-5 h-5 mr-2" /> Novo Post
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <Card key={post.id} className="flex flex-col bg-zinc-900 border-white/10 hover:border-[var(--color-primary)]/50 hover:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.15)] transition-all duration-300 relative group overflow-hidden">
                  
                  {/* IMAGEM DO POST */}
                  <div className="relative w-full h-44 bg-zinc-950 border-b border-white/5 shrink-0 overflow-hidden">
                    {post.image ? (
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 bg-zinc-900/50">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs font-medium">Sem Capa</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${post.status === 'PUBLISHED' ? 'bg-emerald-500/80 text-white border-emerald-400' : 'bg-amber-500/80 text-white border-amber-400'}`}>
                        {getStatusText(post.status)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    {quickEditPost === post.id ? (
                      <div className="space-y-4 relative z-10">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Edição Rápida</label>
                          <input 
                            value={quickEditData.title} 
                            onChange={(e) => setQuickEditData({...quickEditData, title: e.target.value})} 
                            autoFocus 
                            placeholder="Título do post" 
                            className="w-full px-3 py-2.5 bg-zinc-950 border border-white/10 rounded-lg text-sm text-zinc-100 outline-none focus:border-[var(--color-primary)]" 
                          />
                        </div>
                        <select 
                          value={quickEditData.status} 
                          onChange={(e) => setQuickEditData({...quickEditData, status: e.target.value})} 
                          className="w-full px-3 py-2.5 bg-zinc-950 border border-white/10 rounded-lg text-sm text-zinc-100 outline-none focus:border-[var(--color-primary)]"
                        >
                          <option value="DRAFT">Rascunho</option>
                          <option value="PUBLISHED">Publicado</option>
                          <option value="ARCHIVED">Arquivado</option>
                        </select>
                        <div className="flex gap-3 pt-2">
                          <Button variant="primary" onClick={() => saveQuickEdit(post.id)} className="flex-1 text-xs py-2"><Check className="w-4 h-4 mr-1.5" /> Salvar</Button>
                          <Button variant="secondary" onClick={() => setQuickEditPost(null)} className="flex-1 text-xs py-2 bg-zinc-800 border-white/10 hover:bg-zinc-700 text-zinc-300"><X className="w-4 h-4 mr-1.5" /> Cancelar</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full justify-between">
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-3 gap-3">
                            <h3 className="text-lg font-bold text-zinc-100 leading-snug line-clamp-2">{post.title}</h3>
                            <button onClick={() => startQuickEdit(post)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 shadow-sm shrink-0">
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs font-semibold mb-4">
                            <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 border border-white/5 rounded-md">{post.categoryName}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5 relative z-10">
                          <Button variant="secondary" onClick={() => handleEditPost(post.id)} className="flex-1 mr-3 text-xs bg-zinc-800 hover:bg-zinc-700 border-white/5 text-zinc-200">
                            <Edit3 className="w-4 h-4 mr-2" /> Editor Completo
                          </Button>
                          <button onClick={() => handleDeletePost(post.id)} className="p-2.5 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-all border border-rose-500/10 hover:border-rose-500/30">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* ABAS: CATEGORIAS OU TAGS */}
        {isTaxonomyTab && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Coluna 1: Lista (4 Colunas) */}
            <Card className="lg:col-span-4 flex flex-col h-[750px] bg-zinc-900/90 border-white/10 shadow-xl backdrop-blur-md">
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
                <h3 className="font-bold text-zinc-100 flex items-center gap-2.5">
                  {activeTab === "categories" ? <FolderTree className="w-5 h-5 text-[var(--color-primary)]"/> : <Tag className="w-5 h-5 text-[var(--color-primary)]"/>} 
                  {activeTab === "categories" ? 'Categorias' : 'Tags'}
                </h3>
                <button onClick={() => openEditor(null)} className="text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 p-2 rounded-lg transition-colors"><Plus className="w-5 h-5" /></button>
              </div>
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-950/50 border border-white/5 rounded-lg outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-zinc-200 placeholder:text-zinc-600" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                {currentItems.map(item => (
                  <div key={item.id} onClick={() => openEditor(item)} className={`group flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${editingItem?.id === item.id ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]' : 'bg-transparent border-transparent hover:bg-zinc-800/80 hover:border-white/5 text-zinc-300 hover:text-white'}`}>
                    <span className="font-medium text-sm">{item.name}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); openEditor(item); }} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteTaxonomy(item.id); }} className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Coluna 2: Editor (8 Colunas) */}
            <div className="lg:col-span-8 h-[750px]">
              <AnimatePresence mode="wait">
                {isEditorOpen ? (
                  <motion.div key="editor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                    <Card className="flex flex-col h-full bg-zinc-900 border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5">
                      <div className="px-6 py-5 border-b border-white/10 bg-zinc-900/80 flex justify-between items-center backdrop-blur-md">
                        <h3 className="text-lg font-bold text-[var(--color-primary)] tracking-tight flex items-center gap-2">
                          {editingItem ? <Edit3 className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
                          {editingItem ? 'Editar' : 'Nova'} {activeTab === "categories" ? 'Categoria' : 'Tag'}
                        </h3>
                        <button onClick={closeEditor} className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 p-2 rounded-lg transition-all">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                          
                          <div className="space-y-6">
                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" /> Informações Básicas
                            </h4>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-zinc-300">Nome *</label>
                              <input 
                                type="text" 
                                value={formData.name} 
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                placeholder={`Ex: ${activeTab === "categories" ? 'Tecnologia' : 'ReactJS'}`} 
                                className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all shadow-inner"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-zinc-300">Descrição</label>
                              <textarea 
                                value={formData.description} 
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                                placeholder="Breve descrição interna ou para exibição..." 
                                className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all resize-none min-h-[120px] shadow-inner" 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-zinc-300">Capa da {activeTab === "categories" ? 'Categoria' : 'Tag'}</label>
                              <div className="bg-zinc-950 p-5 rounded-xl border border-white/10 shadow-inner flex justify-center">
                                <ImageUpload 
                                  label="" 
                                  currentImage={formData.image || ""} 
                                  onChange={(url) => setFormData({ ...formData, image: url })}
                                  aspectRatio="aspect-video"
                                  previewHeight={140}
                                  previewWidth={250}
                                  description="Recomendado: 800x600px"
                                  showRemoveButton
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
                              <Globe className="w-4 h-4" /> SEO & Descoberta
                            </h4>

                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-zinc-300 flex justify-between">
                                Título SEO
                                <span className="text-xs text-zinc-500 font-normal">{formData.seoTitle.length}/60</span>
                              </label>
                              <input 
                                type="text" 
                                value={formData.seoTitle} 
                                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })} 
                                placeholder="Título para o Google..." 
                                className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all shadow-inner"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-zinc-300 flex justify-between">
                                Descrição SEO
                                <span className="text-xs text-zinc-500 font-normal">{formData.seoDescription.length}/160</span>
                              </label>
                              <textarea 
                                value={formData.seoDescription} 
                                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })} 
                                placeholder="Meta description para resultados de busca..." 
                                className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all resize-none min-h-[120px] shadow-inner" 
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-zinc-300">Palavras-chave</label>
                              <input 
                                type="text" 
                                value={formData.seoKeywords} 
                                onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })} 
                                placeholder="Ex: dicas, tutoriais, blog (separadas por vírgula)" 
                                className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all shadow-inner"
                              />
                            </div>
                          </div>

                        </div>
                      </div>

                      <div className="px-6 py-5 bg-zinc-900/80 border-t border-white/10 flex justify-end gap-3 backdrop-blur-md">
                        <button type="button" onClick={closeEditor} disabled={isSaving} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/5 text-zinc-200 rounded-lg transition-colors">Cancelar</button>
                        <Button variant="primary" onClick={handleSaveTaxonomy} disabled={isSaving || !formData.name} className="px-8 font-bold shadow-lg shadow-[var(--color-primary)]/20">
                          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Informações'}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex items-center justify-center bg-zinc-900/30 border-2 border-dashed border-white/10 rounded-2xl opacity-70">
                    <div className="text-center space-y-3">
                      <div className="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-500 shadow-inner">
                        {activeTab === "categories" ? <FolderTree className="w-6 h-6" /> : <Tag className="w-6 h-6" />}
                      </div>
                      <p className="text-base font-medium text-zinc-300">Selecione na lista ao lado ou</p>
                      <Button variant="secondary" onClick={() => openEditor(null)} className="mt-2 bg-zinc-800 hover:bg-zinc-700 border-white/10 text-zinc-200">
                        <Plus className="w-4 h-4 mr-2" /> Criar nova {activeTab === "categories" ? 'Categoria' : 'Tag'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}