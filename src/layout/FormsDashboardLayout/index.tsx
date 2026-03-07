"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { 
  Plus, Edit3, Trash2, LayoutTemplate, Loader2, 
  Check, X, Search, Calendar, FileText
} from "lucide-react";

interface FormItem {
  id: string;
  name: string;
  updatedAt: string;
}

interface FormsDashboardLayoutProps {
  initialForms: FormItem[];
}

export default function FormsDashboardLayout({ initialForms }: FormsDashboardLayoutProps) {
  const router = useRouter();
  
  const [forms, setForms] = useState<FormItem[]>(initialForms);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const triggerFeedback = (isSuccess: boolean, msg: string = "") => {
    if (isSuccess) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 4000);
    }
  };

  const filteredForms = forms.filter(form => 
    form.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setNewFormName("Novo Formulário");
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setNewFormName("");
  };

  const handleCreateNew = async () => {
    if (!newFormName.trim()) return;
    setIsCreating(true);
    
    const initialConfig = {
      design: { primaryColor: "#3B82F6", bgColor: "#ffffff", textColor: "#1f2937", fontFamily: "font-sans", buttonRadius: "0.5rem", inputBgColor: "#ffffff", inputBorderColor: "#d1d5db", formWidthType: "manual", formWidthPx: "600", formPadding: "32" },
      content: { titleStyle: { fontSize: "30px", textAlign: "center", color: "#111827" }, subtitleStyle: { fontSize: "14px", textAlign: "center", color: "#6b7280" }, actionType: "database", whatsappNumber: "5511999999999" },
      fields: [
        { id: "header-1", type: "header", label: newFormName, placeholder: "Preencha os dados abaixo para continuar.", required: false, width: "100%" },
        { id: "f1", type: "text", label: "Nome", placeholder: "Seu nome completo", required: true, width: "100%" },
        { id: "f2", type: "email", label: "E-mail", placeholder: "seu@email.com", required: true, width: "100%" },
        { id: "btn1", type: "button", label: "Enviar Formulário", placeholder: "", required: false, width: "100%", buttonAction: "submit" }
      ]
    };

    try {
      const res = await fetch("/api/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFormName, html: "", config: initialConfig })
      });
      const data = await res.json();
      if (data.success && data.component) {
        triggerFeedback(true);
        router.refresh();
        router.push(`formularios-acoes/${data.component.id}`);
      } else {
        triggerFeedback(false, "Não conseguimos criar o formulário. Verifique sua conexão.");
        setIsCreating(false);
      }
    } catch (error) {
      console.error(error);
      triggerFeedback(false, "Ocorreu um erro interno. Tente novamente mais tarde.");
      setIsCreating(false);
    }
  };

  const handleEdit = (id: string) => router.push(`formularios-acoes/${id}`);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este formulário? Essa ação é permanente.")) return;
    try {
      const res = await fetch(`/api/components/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setForms(forms.filter(f => f.id !== id));
        triggerFeedback(true); 
        router.refresh();
      } else {
        triggerFeedback(false, "Não foi possível excluir o formulário.");
      }
    } catch (error) { 
      console.error(error);
      triggerFeedback(false, "Falha de conexão ao excluir.");
    }
  };

  const startRename = (id: string, currentName: string) => { setEditingId(id); setEditName(currentName); };
  const cancelRename = () => { setEditingId(null); setEditName(""); };

  const saveRename = async (id: string) => {
    try {
      const res = await fetch(`/api/components/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName })
      });
      const data = await res.json();
      if (data.success) {
        setForms(forms.map(f => f.id === id ? { ...f, name: editName } : f));
        setEditingId(null);
        triggerFeedback(true);
        router.refresh();
      } else {
        triggerFeedback(false, "Erro ao atualizar o nome do formulário.");
      }
    } catch (error) { 
      console.error(error);
      triggerFeedback(false, "Conexão perdida ao renomear.");
    }
  };

  const getSafeDate = (isoString: string) => {
    if (!isoString) return "";
    return isoString.split('T')[0].split('-').reverse().join('/');
  };

  return (
    <ManageLayout
      headerIcon={LayoutTemplate}
      title="Meus Formulários"
      description="Crie formulários de alta conversão, gerencie as etapas e acompanhe seus leads."
      exists={true}
      itemName="Formulários"
    >
      <div className="space-y-6 pb-24">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-background)] p-4 md:p-6 rounded-xl border border-[var(--color-border)]">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)] opacity-50" />
            <input 
              type="text" 
              placeholder="Pesquisar pelo nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-background-body)] border border-[var(--color-border)] rounded-lg text-[var(--color-secondary)] outline-none focus:ring-2 transition-shadow"
              style={{ '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
            />
          </div>
          <Button 
            variant="primary" 
            onClick={openCreateModal}
            className="w-full md:w-auto"
          >
            <Plus className="w-5 h-5" /> Criar Formulário
          </Button>
        </div>

        {forms.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center py-20 bg-[var(--color-background)] border-dashed border-2 border-[var(--color-border)] rounded-xl">
              <div className="w-16 h-16 bg-[var(--color-background-body)] rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-[var(--color-primary)] opacity-80" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-secondary)]">Nenhum formulário ainda</h3>
              <p className="text-[var(--color-secondary)] opacity-70 mt-2 mb-6 max-w-md mx-auto">
                Você ainda não possui formulários criados. Comece a capturar leads agora mesmo criando o seu primeiro.
              </p>
              <Button variant="primary" onClick={openCreateModal}>
                <Plus className="w-4 h-4" /> Criar Meu Primeiro Form
              </Button>
            </div>
          </motion.div>
        ) : filteredForms.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-secondary)] opacity-60">
            Nenhum resultado encontrado para &quot;{searchTerm}&quot;.
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredForms.map(form => (
              <Card 
                key={form.id} 
                className="p-6 flex flex-col justify-between min-h-[180px] bg-[var(--color-background)] border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-300 group shadow-[0_4px_20px_var(--color-shadow)]"
              >
                <div>
                  {editingId === form.id ? (
                    <div className="flex items-center gap-2 mb-3">
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        className="w-full px-2 py-1.5 bg-[var(--color-background-body)] border border-[var(--color-border)] rounded outline-none focus:border-[var(--color-primary)] text-[var(--color-secondary)] font-semibold"
                        autoFocus 
                      />
                      <button onClick={() => saveRename(form.id)} className="p-2 bg-green-500/10 text-green-600 rounded hover:bg-green-500/20 transition-colors" aria-label="Salvar nome">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={cancelRename} className="p-2 bg-red-500/10 text-red-600 rounded hover:bg-red-500/20 transition-colors" aria-label="Cancelar">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-lg font-bold text-[var(--color-secondary)] truncate" title={form.name}>
                        {form.name}
                      </h3>
                      <button onClick={() => startRename(form.id, form.name)} className="text-[var(--color-secondary)] opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity p-1" aria-label="Renomear">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-[var(--color-secondary)] opacity-60 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    Editado em {getSafeDate(form.updatedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[var(--color-border)]">
                  <Button 
                    variant="secondary" 
                    onClick={() => handleEdit(form.id)} 
                    className="flex-1 bg-[var(--color-background-body)] border-transparent hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] text-[var(--color-secondary)]"
                  >
                    Editor Visual
                  </Button>
                  <button 
                    onClick={() => handleDelete(form.id)} 
                    className="p-2 text-[var(--color-secondary)] opacity-40 hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    aria-label="Excluir formulário"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md"
            >
              <div className="bg-[var(--color-background)] rounded-xl shadow-2xl overflow-hidden border border-[var(--color-border)]">
                <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-background-body)] flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[var(--color-secondary)]">Detalhes do Formulário</h3>
                  <button onClick={closeCreateModal} className="text-[var(--color-secondary)] opacity-50 hover:opacity-100 p-1 rounded-md transition-opacity">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-secondary)] mb-2">
                      Dê um nome para identificar
                    </label>
                    <Input
                      type="text"
                      value={newFormName}
                      onChange={(e) => setNewFormName(e.target.value)}
                      placeholder="Ex: Captura de Leads Natal"
                      className="w-full"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateNew();
                        if (e.key === 'Escape') closeCreateModal();
                      }}
                    />
                    <p className="text-xs text-[var(--color-secondary)] opacity-60 mt-2">
                      Este nome é interno e não será exibido para os seus clientes.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-[var(--color-background-body)] border-t border-[var(--color-border)] flex gap-3 justify-end">
                  <Button variant="secondary" onClick={closeCreateModal} disabled={isCreating}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={handleCreateNew} disabled={isCreating || !newFormName.trim()} loading={isCreating}>
                    Criar Formulário
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />

    </ManageLayout>
  );
}