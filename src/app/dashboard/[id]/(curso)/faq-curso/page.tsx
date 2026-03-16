/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import { 
  HelpCircle,
  MessageCircleQuestion,
  List,
  Plus,
  Trash2,
  FileText,
  Settings,
  Type,
  CheckCircle2,
  AlertCircle,
  XCircle,
  GripVertical,
  Sparkles
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";

interface QuestionItem {
  question: string;
  answer: string;
}

interface HeaderData {
  title: string;
  subtitle: string;
}

interface FAQData {
  id?: string;
  type: string;
  subtype: string;
  header: HeaderData;
  questions: QuestionItem[];
}

const defaultFAQData: FAQData = {
  type: "faq",
  subtype: "curso",
  header: {
    title: "Perguntas Frequentes",
    subtitle: "Tudo o que você precisa saber antes de entrar."
  },
  questions: [
    {
      question: "O curso serve para quem está começando do zero?",
      answer: "Sim. O Módulo 01 (Fundação) foi desenhado especificamente para quem nunca vendeu online. Ensinamos desde a criação do CNPJ até a configuração das ferramentas."
    },
    {
      question: "Preciso ter muito dinheiro para investir em tráfego?",
      answer: "Não. Ensinamos a estratégia de 'Validação Barata'. Você começa com orçamentos mínimos (R$ 20-30/dia) para validar a oferta antes de escalar."
    },
    {
      question: "Tenho acesso ao suporte para tirar dúvidas?",
      answer: "Com certeza. Alunos do plano Black têm acesso à nossa comunidade exclusiva e encontros mensais ao vivo para análise de campanhas."
    },
    {
      question: "Por quanto tempo tenho acesso ao conteúdo?",
      answer: "O plano Start garante 1 ano de acesso. O plano TegPro Black garante acesso vitalício a todas as atualizações futuras."
    }
  ]
};

const mergeWithDefaults = (apiData: any, defaultData: FAQData): FAQData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id || defaultData.id,
    type: apiData.type || defaultData.type,
    subtype: apiData.subtype || defaultData.subtype,
    header: apiData.header || defaultData.header,
    questions: apiData.questions || defaultData.questions,
  };
};

// Componente para editar cada pergunta
interface QuestionEditorProps {
  questionItem: QuestionItem;
  index: number;
  onChange: (question: QuestionItem) => void;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  draggingItem: number | null;
  dragEnter: (e: React.DragEvent) => void;
  dragLeave: (e: React.DragEvent) => void;
  drop: (e: React.DragEvent) => void;
  isLastItem?: boolean;
}

const QuestionEditor = ({ 
  questionItem, 
  index, 
  onChange, 
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  draggingItem,
  dragEnter,
  dragLeave,
  drop,
  isLastItem = false
}: QuestionEditorProps) => {
  const updateField = (field: keyof QuestionItem, value: string) => {
    onChange({ ...questionItem, [field]: value });
  };

  const isQuestionValid = (): boolean => {
    return questionItem.question.trim() !== '' && questionItem.answer.trim() !== '';
  };

  return (
    <div 
      key={`question-${index}`}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnter={dragEnter}
      onDragLeave={dragLeave}
      onDragEnd={onDragEnd}
      onDrop={drop}
      className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
        draggingItem === index 
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
          : 'hover:border-[var(--color-primary)]/50'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {/* Handle para drag & drop */}
          <div 
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-[var(--color-background)]/50 rounded transition-colors"
            draggable
            onDragStart={(e) => onDragStart(e, index)}
          >
            <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
          </div>
          
          {/* Indicador de posição */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-[var(--color-secondary)]/70">
              {index + 1}
            </span>
            <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <MessageCircleQuestion className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-[var(--color-secondary)]">
                  Pergunta #{index + 1}
                </h4>
              </div>
              {isQuestionValid() ? (
                <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                  Completa
                </span>
              ) : (
                <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                  Incompleta
                </span>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Pergunta
                </label>
                <Input
                  value={questionItem.question}
                  onChange={(e) => updateField("question", e.target.value)}
                  placeholder="Digite a pergunta"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Resposta
                </label>
                <TextArea
                  value={questionItem.answer}
                  onChange={(e) => updateField("answer", e.target.value)}
                  placeholder="Digite a resposta detalhada"
                  rows={4}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            onClick={onRemove}
            variant="danger"
            className="whitespace-nowrap bg-red-600 hover:bg-red-700 border-none flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Remover
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function FAQPage() {
  const {
    data: pageData,
    exists,
    loading,
    success,
    errorMsg,
    deleteModal,
    updateNested,
    save,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
  } = useJsonManagement<FAQData>({
    apiPath: "/api/tegbe-institucional/json/faq-curso",
    defaultData: defaultFAQData,
    mergeFunction: mergeWithDefaults,
  });

  // Estados para drag & drop
  const [draggingItem, setDraggingItem] = useState<number | null>(null);
  const newQuestionRef = useRef<HTMLDivElement>(null);

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    header: true,
    questions: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Funções para gerenciar a lista de perguntas
  const handleAddQuestion = () => {
    const questions = pageData.questions;
    const newQuestion: QuestionItem = {
      question: "Nova pergunta frequente?",
      answer: "Resposta para a nova pergunta frequente."
    };
    
    const updated = [...questions, newQuestion];
    updateNested("questions", updated);
    
    // Scroll para a nova pergunta
    setTimeout(() => {
      newQuestionRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
  };

  const handleUpdateQuestion = (index: number, updates: Partial<QuestionItem>) => {
    const questions = pageData.questions;
    const updated = [...questions];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      updateNested("questions", updated);
    }
  };

  const handleRemoveQuestion = (index: number) => {
    const questions = pageData.questions;
    
    if (questions.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyItem: QuestionItem = {
        question: "",
        answer: ""
      };
      updateNested("questions", [emptyItem]);
    } else {
      const updated = questions.filter((_, i) => i !== index);
      updateNested("questions", updated);
    }
  };

  // Funções de drag & drop
  const handleQuestionDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingItem(index);
  };

  const handleQuestionDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingItem === null || draggingItem === index) return;
    
    const questions = pageData.questions;
    const updated = [...questions];
    const draggedItem = updated[draggingItem];
    
    // Remove o item arrastado
    updated.splice(draggingItem, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingItem ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    updateNested('questions', updated);
    setDraggingItem(index);
  };

  const handleQuestionDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingItem(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  // Validações
  const isQuestionValid = (item: QuestionItem): boolean => {
    return item.question.trim() !== '' && item.answer.trim() !== '';
  };

  const questions = pageData.questions;
  const questionsCompleteCount = questions.filter(isQuestionValid).length;
  const questionsTotalCount = questions.length;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Informações básicas
    total += 2;
    if (pageData.type.trim()) completed++;
    if (pageData.subtype.trim()) completed++;

    // Header
    total += 2;
    if (pageData.header.title.trim()) completed++;
    if (pageData.header.subtitle.trim()) completed++;

    // Questions (cada pergunta tem 2 campos: question e answer)
    total += questions.length * 2;
    questions.forEach(item => {
      if (item.question.trim()) completed++;
      if (item.answer.trim()) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={HelpCircle} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={HelpCircle}
      title="FAQ - Perguntas Frequentes"
      description="Gerencie as perguntas frequentes e respostas da TegPro"
      exists={!!exists}
      itemName="FAQ"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Básica */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações da Seção"
            section="basic"
            icon={Settings}
            isExpanded={expandedSections.basic}
            onToggle={() => toggleSection("basic")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.basic ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Tipo de Conteúdo"
                    value={pageData.type}
                    onChange={(e) => updateNested('type', e.target.value)}
                    placeholder="faq"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Subtipo/Categoria"
                    value={pageData.subtype}
                    onChange={(e) => updateNested('subtype', e.target.value)}
                    placeholder="curso"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho"
            section="header"
            icon={Type}
            isExpanded={expandedSections.header}
            onToggle={() => toggleSection("header")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.header ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Título Principal
                    </label>
                    <Input
                      value={pageData.header.title}
                      onChange={(e) => updateNested('header.title', e.target.value)}
                      placeholder="Perguntas Frequentes"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Subtítulo
                    </label>
                    <Input
                      value={pageData.header.subtitle}
                      onChange={(e) => updateNested('header.subtitle', e.target.value)}
                      placeholder="Tudo o que você precisa saber antes de entrar."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Perguntas */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <SectionHeader
              title={`Perguntas (${questions.length} disponíveis)`}
              section="questions"
              icon={MessageCircleQuestion}
              isExpanded={expandedSections.questions}
              onToggle={() => toggleSection("questions")}
            />
            <div className="flex flex-col items-end gap-2">
              <Button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Pergunta
              </Button>
            </div>
          </div>

          <motion.div
            initial={false}
            animate={{ height: expandedSections.questions ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Configure as Perguntas Frequentes
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {questionsCompleteCount} de {questionsTotalCount} completas
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Arraste e solte para reordenar as perguntas. Cada pergunta deve ter texto e resposta.
                </p>
              </div>

              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircleQuestion className="w-16 h-16 text-[var(--color-secondary)]/40 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                      Nenhuma pergunta adicionada
                    </h4>
                    <p className="text-[var(--color-secondary)]/70 mb-6 max-w-md mx-auto">
                      Adicione perguntas frequentes para ajudar seus clientes
                    </p>
                    <Button
                      type="button"
                      onClick={handleAddQuestion}
                      className="flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Primeira Pergunta
                    </Button>
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <div
                      key={index}
                      ref={index === questions.length - 1 ? newQuestionRef : undefined}
                    >
                      <QuestionEditor
                        questionItem={question}
                        index={index}
                        onChange={(updatedQuestion) => {
                          handleUpdateQuestion(index, updatedQuestion);
                        }}
                        onRemove={() => handleRemoveQuestion(index)}
                        onDragStart={handleQuestionDragStart}
                        onDragOver={handleQuestionDragOver}
                        onDragEnd={handleQuestionDragEnd}
                        draggingItem={draggingItem}
                        dragEnter={handleDragEnter}
                        dragLeave={handleDragLeave}
                        drop={handleDrop}
                        isLastItem={index === questions.length - 1}
                      />
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          isAddDisabled={false}
          isSaving={loading}
          exists={!!exists}
          completeCount={completion.completed}
          totalCount={completion.total}
          itemName="FAQ"
          icon={HelpCircle}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={questions.length}
        itemName="Pergunta"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}