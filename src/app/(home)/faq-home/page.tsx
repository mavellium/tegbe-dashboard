/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import IconSelector from "@/components/IconSelector";
import { 
  HelpCircle,
  MessageSquare,
  Settings,
  Tag as TagIcon,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Layout,
  Plus,
  Trash2
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

interface FaqHeader {
  tag: string;
  tag_icon: string;
  title: string;
  subtitle: string;
}

interface FaqConfig {
  theme: string;
  animation: string;
  interaction: string;
}

interface FaqSectionData {
  faq_section: {
    header: FaqHeader;
    questions_and_answers: FaqItem[];
    config: FaqConfig;
  };
}

const defaultFaqData: FaqSectionData = {
  faq_section: {
    header: {
      tag: "",
      tag_icon: "solar:question-circle-linear",
      title: "",
      subtitle: ""
    },
    questions_and_answers: [
      {
        id: 1,
        question: "",
        answer: ""
      }
    ],
    config: {
      theme: "Minimalist White",
      animation: "Framer Motion AnimatePresence",
      interaction: "Accordion Solo (One open at a time)"
    }
  }
};

const mergeWithDefaults = (apiData: any, defaultData: FaqSectionData): FaqSectionData => {
  if (!apiData) return defaultData;
  
  return {
    faq_section: {
      header: {
        tag: apiData.faq_section?.header?.tag || defaultData.faq_section.header.tag,
        tag_icon: apiData.faq_section?.header?.tag_icon || defaultData.faq_section.header.tag_icon,
        title: apiData.faq_section?.header?.title || defaultData.faq_section.header.title,
        subtitle: apiData.faq_section?.header?.subtitle || defaultData.faq_section.header.subtitle,
      },
      questions_and_answers: apiData.faq_section?.questions_and_answers || defaultData.faq_section.questions_and_answers,
      config: {
        theme: apiData.faq_section?.config?.theme || defaultData.faq_section.config.theme,
        animation: apiData.faq_section?.config?.animation || defaultData.faq_section.config.animation,
        interaction: apiData.faq_section?.config?.interaction || defaultData.faq_section.config.interaction,
      }
    }
  };
};

// Opções para os dropdowns
const themeOptions = [
  "Minimalist White",
  "Dark Professional", 
  "Brand Colors",
  "Gradient Accent",
  "Card Based"
];

const animationOptions = [
  "Framer Motion AnimatePresence",
  "CSS Transitions",
  "Spring Physics",
  "No Animation",
  "Custom Keyframes"
];

const interactionOptions = [
  "Accordion Solo (One open at a time)",
  "Accordion Multiple",
  "Show All",
  "Tab Based",
  "Search Filter"
];

export default function FaqManagePage() {
  const {
    data: faqData,
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
  } = useJsonManagement<FaqSectionData>({
    apiPath: "/api/tegbe-institucional/json/faq-home",
    defaultData: defaultFaqData,
    mergeFunction: mergeWithDefaults,
  });

  // Estado local para gerenciar o arrastar e soltar
  const [draggingItem, setDraggingItem] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    header: true,
    questions: false,
    config: false,
  });

  // Referência para o último item adicionado
  const newItemRef = useRef<HTMLDivElement>(null);

  // Controle de planos (simplificado - você pode ajustar conforme seu sistema)
  const currentPlanType = 'pro'; // Altere conforme sua lógica de planos
  const currentPlanLimit = currentPlanType === 'pro' ? 20 : 10;

  // Funções para manipular a lista de FAQs
  const addFaqItem = () => {
    const currentItems = [...faqData.faq_section.questions_and_answers];
    
    // Verificar limite do plano
    if (currentItems.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: FaqItem = {
      id: Date.now(),
      question: "",
      answer: ""
    };
    
    updateNested('faq_section.questions_and_answers', [...currentItems, newItem]);
    
    // Scroll para o novo item
    setTimeout(() => {
      newItemRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updateFaqItem = (index: number, updates: Partial<FaqItem>) => {
    const currentItems = [...faqData.faq_section.questions_and_answers];
    
    if (index >= 0 && index < currentItems.length) {
      currentItems[index] = { ...currentItems[index], ...updates };
      updateNested('faq_section.questions_and_answers', currentItems);
    }
  };

  const removeFaqItem = (index: number) => {
    const currentItems = [...faqData.faq_section.questions_and_answers];
    
    if (currentItems.length <= 1) {
      // Mantém pelo menos um item vazio
      updateNested('faq_section.questions_and_answers', [{
        id: Date.now(),
        question: "",
        answer: ""
      }]);
    } else {
      currentItems.splice(index, 1);
      updateNested('faq_section.questions_and_answers', currentItems);
    }
  };

  // Funções de drag & drop
  const handleFaqDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingItem(index);
  };

  const handleFaqDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingItem === null || draggingItem === index) return;
    
    const currentItems = [...faqData.faq_section.questions_and_answers];
    const draggedItem = currentItems[draggingItem];
    
    // Remove o item arrastado
    currentItems.splice(draggingItem, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingItem ? index : index;
    currentItems.splice(newIndex, 0, draggedItem);
    
    updateNested('faq_section.questions_and_answers', currentItems);
    setDraggingItem(index);
  };

  const handleFaqDragEnd = (e: React.DragEvent) => {
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
  const isItemValid = (item: FaqItem): boolean => {
    return item.question.trim() !== '' && item.answer.trim() !== '';
  };

  const isLimitReached = faqData.faq_section.questions_and_answers.length >= currentPlanLimit;
  const canAddNewItem = !isLimitReached;
  const completeCount = faqData.faq_section.questions_and_answers.filter(isItemValid).length;
  const totalCount = faqData.faq_section.questions_and_answers.length;

  const validationError = isLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddFaq = () => {
    const success = addFaqItem();
    if (!success) {
      console.warn(validationError);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Header
    total += 4;
    if (faqData.faq_section.header.tag.trim()) completed++;
    if (faqData.faq_section.header.tag_icon.trim()) completed++;
    if (faqData.faq_section.header.title.trim()) completed++;
    if (faqData.faq_section.header.subtitle.trim()) completed++;

    // FAQs
    total += faqData.faq_section.questions_and_answers.length * 2;
    faqData.faq_section.questions_and_answers.forEach(faq => {
      if (faq.question.trim()) completed++;
      if (faq.answer.trim()) completed++;
    });

    // Config
    total += 3;
    if (faqData.faq_section.config.theme.trim()) completed++;
    if (faqData.faq_section.config.animation.trim()) completed++;
    if (faqData.faq_section.config.interaction.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={HelpCircle}
      title="Seção de FAQ - Perguntas Frequentes"
      description="Gerencie as perguntas frequentes e respostas para a página institucional"
      exists={!!exists}
      itemName="Seção FAQ"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Cabeçalho */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho da Seção"
            section="header"
            icon={TagIcon}
            isExpanded={expandedSections.header}
            onToggle={() => toggleSection("header")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.header ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Configure o cabeçalho da seção de FAQ
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Defina o texto e ícone que aparecem no topo da seção
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Tag/Etiqueta"
                  value={faqData.faq_section.header.tag}
                  onChange={(e) => updateNested('faq_section.header.tag', e.target.value)}
                  placeholder="Ex: Clarificação Estratégica"
                  required
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Ícone da Tag
                  </label>
                  <IconSelector
                    value={faqData.faq_section.header.tag_icon}
                    onChange={(value: string) => updateNested('faq_section.header.tag_icon', value)}
                    placeholder="solar:question-circle-linear"
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Título Principal"
                    value={faqData.faq_section.header.title}
                    onChange={(e) => updateNested('faq_section.header.title', e.target.value)}
                    placeholder="Ex: Dúvidas de quem joga sério."
                    required
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="md:col-span-2">
                  <TextArea
                    label="Subtítulo"
                    value={faqData.faq_section.header.subtitle}
                    onChange={(e) => updateNested('faq_section.header.subtitle', e.target.value)}
                    placeholder="Ex: Sem letras miúdas. Transparência radical antes do aperto de mão."
                    rows={2}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Perguntas e Respostas */}
        <div className="space-y-4">
          <SectionHeader
            title="Perguntas e Respostas"
            section="questions"
            icon={MessageSquare}
            isExpanded={expandedSections.questions}
            onToggle={() => toggleSection("questions")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.questions ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Gerencie as perguntas frequentes
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {completeCount} de {totalCount} completos
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        Limite: {currentPlanType === 'pro' ? '20' : '10'} itens
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddFaq}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                      disabled={!canAddNewItem}
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar FAQ
                    </Button>
                    {isLimitReached && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Limite do plano atingido
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-[var(--color-secondary)]/70 mt-2">
                  Arraste e solte para reordenar as perguntas
                </p>
              </div>

              {/* Mensagem de erro */}
              {validationError && (
                <div className={`p-3 rounded-lg mb-4 ${isLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'}`}>
                  <div className="flex items-start gap-2">
                    {isLimitReached ? (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${isLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                      {validationError}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {faqData.faq_section.questions_and_answers.map((faq, index) => (
                  <div 
                    key={faq.id}
                    ref={index === faqData.faq_section.questions_and_answers.length - 1 ? newItemRef : undefined}
                    draggable
                    onDragStart={(e) => handleFaqDragStart(e, index)}
                    onDragOver={(e) => handleFaqDragOver(e, index)}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleFaqDragEnd}
                    onDrop={handleDrop}
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
                          onDragStart={(e) => handleFaqDragStart(e, index)}
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
                            <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                              <HelpCircle className="w-5 h-5 text-[var(--color-primary)]" />
                            </div>
                            <h4 className="font-medium text-[var(--color-secondary)]">
                              Pergunta #{faq.id}
                            </h4>
                            {faq.question && faq.answer ? (
                              <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                Completo
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                Incompleto
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Pergunta
                                </label>
                                <Input
                                  value={faq.question}
                                  onChange={(e) => updateFaqItem(index, { question: e.target.value })}
                                  placeholder="Ex: Preciso ter um faturamento mínimo para contratar?"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Resposta
                                </label>
                                <TextArea
                                  value={faq.answer}
                                  onChange={(e) => updateFaqItem(index, { answer: e.target.value })}
                                  placeholder="Ex: Trabalhamos com escalas diferentes. Para a Consultoria e Agência..."
                                  rows={4}
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          onClick={() => removeFaqItem(index)}
                          variant="danger"
                          className="whitespace-nowrap bg-red-600 hover:bg-red-700 border-none flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {faqData.faq_section.questions_and_answers.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                  <HelpCircle className="w-12 h-12 text-[var(--color-secondary)]/30 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                    Nenhuma pergunta adicionada
                  </h4>
                  <p className="text-sm text-[var(--color-secondary)]/70 mb-4">
                    Adicione sua primeira pergunta frequente clicando no botão acima
                  </p>
                  <Button
                    type="button"
                    onClick={handleAddFaq}
                    variant="primary"
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeira Pergunta
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Seção Configurações */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações da Seção"
            section="config"
            icon={Settings}
            isExpanded={expandedSections.config}
            onToggle={() => toggleSection("config")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.config ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Personalize o comportamento e aparência
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Configure como a seção de FAQ será exibida e interagida
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Tema Visual
                  </label>
                  <select
                    value={faqData.faq_section.config.theme}
                    onChange={(e) => updateNested('faq_section.config.theme', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none transition-colors"
                  >
                    <option value="">Selecione um tema</option>
                    {themeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === "Minimalist White" ? "Branco Minimalista" :
                         option === "Dark Professional" ? "Profissional Escuro" :
                         option === "Brand Colors" ? "Cores da Marca" :
                         option === "Gradient Accent" ? "Gradiente com Destaque" :
                         "Baseado em Cards"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Animação
                  </label>
                  <select
                    value={faqData.faq_section.config.animation}
                    onChange={(e) => updateNested('faq_section.config.animation', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none transition-colors"
                  >
                    <option value="">Selecione uma animação</option>
                    {animationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === "Framer Motion AnimatePresence" ? "Framer Motion (AnimatePresence)" :
                         option === "CSS Transitions" ? "Transições CSS" :
                         option === "Spring Physics" ? "Física Spring" :
                         option === "No Animation" ? "Sem Animação" :
                         "Keyframes Customizados"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Tipo de Interação
                  </label>
                  <select
                    value={faqData.faq_section.config.interaction}
                    onChange={(e) => updateNested('faq_section.config.interaction', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none transition-colors"
                  >
                    <option value="">Selecione o tipo de interação</option>
                    {interactionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option === "Accordion Solo (One open at a time)" ? "Acordeão Solo (Um aberto por vez)" :
                         option === "Accordion Multiple" ? "Acordeão Múltiplo (Vários abertos)" :
                         option === "Show All" ? "Mostrar Todos" :
                         option === "Tab Based" ? "Baseado em Tabs" :
                         "Com Filtro de Busca"}
                      </option>
                    ))}
                  </select>
                </div>
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
          itemName="Seção FAQ"
          icon={HelpCircle}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Seção de FAQ"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}