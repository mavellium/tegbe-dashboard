/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import IconSelector from "@/components/IconSelector";
import { 
  XCircle,
  Filter,
  Type,
  Settings,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Trash2,
  Plus,
  GripVertical,
  Eye,
  Target,
  AlertCircle
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";

interface MetadataData {
  component: string;
  strategy: string;
  theme: string;
}

interface HeaderData {
  badge: string;
  title_main: string;
  title_highlight: string;
  title_suffix: string;
  description: string;
}

interface RejectionCard {
  id: number;
  icon: string;
  title: string;
  description: string;
  highlight_terms: string[];
  status_label: string;
}

interface MarketingAntiHeroData {
  metadata: MetadataData;
  header: HeaderData;
  rejection_cards: RejectionCard[];
}

const defaultData: MarketingAntiHeroData = {
  metadata: {
    component: "MarketingAntiHero",
    strategy: "Reverse Psychology Qualification",
    theme: "Dark Crimson / Alert Mode"
  },
  header: {
    badge: "Filtro de Qualificação",
    title_main: "A Tegbe",
    title_highlight: "NÃO",
    title_suffix: "é para você se...",
    description: "Buscamos parceiros de crescimento, não aventuras. Se sua empresa se encaixa nos perfis abaixo, nossa engenharia não vai funcionar."
  },
  rejection_cards: [
    {
      id: 1,
      icon: "mdi:camera-off",
      title: "Busca Marketing de Vaidade",
      description: "Você quer apenas 'postar no Instagram' para ganhar likes e inflar o ego, sem se preocupar com o Lucro Real que sobra no caixa da empresa no final do mês.",
      highlight_terms: ["Lucro Real"],
      status_label: "Incompatível"
    },
    {
      id: 2,
      icon: "mdi:chart-line-variant",
      title: "Resiste aos Dados",
      description: "Você prefere seguir sua intuição ou fazer 'o que todo mundo faz' ao invés de aceitar estratégias baseadas em números frios e testes A/B validados.",
      highlight_terms: ["números frios"],
      status_label: "Incompatível"
    },
    {
      id: 3,
      icon: "ph:armchair-bold",
      title: "Ama a Zona de Conforto",
      description: "Seu negócio não tem estrutura, equipe ou vontade real de escalar o atendimento quando o volume de leads qualificados triplicar.",
      highlight_terms: ["vontade real de escalar"],
      status_label: "Incompatível"
    }
  ]
};

const mergeWithDefaults = (apiData: any, defaultData: MarketingAntiHeroData): MarketingAntiHeroData => {
  if (!apiData) return defaultData;
  
  return {
    metadata: {
      component: apiData.metadata?.component || defaultData.metadata.component,
      strategy: apiData.metadata?.strategy || defaultData.metadata.strategy,
      theme: apiData.metadata?.theme || defaultData.metadata.theme
    },
    header: {
      badge: apiData.header?.badge || defaultData.header.badge,
      title_main: apiData.header?.title_main || defaultData.header.title_main,
      title_highlight: apiData.header?.title_highlight || defaultData.header.title_highlight,
      title_suffix: apiData.header?.title_suffix || defaultData.header.title_suffix,
      description: apiData.header?.description || defaultData.header.description
    },
    rejection_cards: apiData.rejection_cards || defaultData.rejection_cards
  };
};

export default function MarketingAntiHeroPage() {
  const [expandedSections, setExpandedSections] = useState({
    metadata: true,
    header: false,
    rejectionCards: false
  });

  const [draggingCard, setDraggingCard] = useState<number | null>(null);
  const newCardRef = useRef<HTMLDivElement>(null);

  const {
    data: componentData,
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
  } = useJsonManagement<MarketingAntiHeroData>({
    apiPath: "/api/tegbe-institucional/json/nao-para-voce",
    defaultData: defaultData,
    mergeFunction: mergeWithDefaults,
  });

  const currentData = componentData || defaultData;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    updateNested(path, value);
  };

  // Funções para Rejection Cards
  const handleAddRejectionCard = () => {
    const newCard: RejectionCard = {
      id: Date.now(),
      icon: "mdi:alert-circle",
      title: "",
      description: "",
      highlight_terms: [],
      status_label: "Incompatível"
    };
    const updated = [...currentData.rejection_cards, newCard];
    handleChange('rejection_cards', updated);
    
    setTimeout(() => {
      newCardRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
  };

  const handleUpdateCard = (index: number, updates: Partial<RejectionCard>) => {
    const cards = [...currentData.rejection_cards];
    cards[index] = { ...cards[index], ...updates };
    handleChange('rejection_cards', cards);
  };

  const handleRemoveCard = (index: number) => {
    const cards = currentData.rejection_cards.filter((_, i) => i !== index);
    handleChange('rejection_cards', cards);
  };

  // Funções para Highlight Terms
  const handleAddHighlightTerm = (cardIndex: number) => {
    const cards = [...currentData.rejection_cards];
    const card = { ...cards[cardIndex] };
    card.highlight_terms = [...card.highlight_terms, ""];
    cards[cardIndex] = card;
    handleChange('rejection_cards', cards);
  };

  const handleUpdateHighlightTerm = (cardIndex: number, termIndex: number, value: string) => {
    const cards = [...currentData.rejection_cards];
    const card = { ...cards[cardIndex] };
    const terms = [...card.highlight_terms];
    terms[termIndex] = value;
    card.highlight_terms = terms;
    cards[cardIndex] = card;
    handleChange('rejection_cards', cards);
  };

  const handleRemoveHighlightTerm = (cardIndex: number, termIndex: number) => {
    const cards = [...currentData.rejection_cards];
    const card = { ...cards[cardIndex] };
    card.highlight_terms = card.highlight_terms.filter((_, i) => i !== termIndex);
    cards[cardIndex] = card;
    handleChange('rejection_cards', cards);
  };

  // Funções de drag & drop
  const handleCardDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingCard(index);
  };

  const handleCardDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingCard === null || draggingCard === index) return;
    
    const cards = currentData.rejection_cards;
    const updated = [...cards];
    const draggedItem = updated[draggingCard];
    
    updated.splice(draggingCard, 1);
    updated.splice(index, 0, draggedItem);
    
    handleChange('rejection_cards', updated);
    setDraggingCard(index);
  };

  const handleCardDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingCard(null);
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
  const isCardValid = (card: RejectionCard): boolean => {
    return card.icon.trim() !== '' && 
           card.title.trim() !== '' && 
           card.description.trim() !== '' && 
           card.status_label.trim() !== '';
  };

  const isHighlightTermValid = (term: string): boolean => {
    return term.trim() !== '';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await save();
  };

  // Cálculo de completude
  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Metadata
    total += 3;
    Object.values(currentData.metadata).forEach(value => {
      if (value?.trim()) completed++;
    });

    // Header
    total += 5;
    Object.values(currentData.header).forEach(value => {
      if (value?.trim()) completed++;
    });

    // Rejection Cards
    currentData.rejection_cards.forEach(card => {
      total += 4; // icon, title, description, status_label
      if (card.icon.trim()) completed++;
      if (card.title.trim()) completed++;
      if (card.description.trim()) completed++;
      if (card.status_label.trim()) completed++;
      
      total += card.highlight_terms.length;
      card.highlight_terms.forEach(term => {
        if (term.trim()) completed++;
      });
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layers} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={XCircle}
      title="Marketing Anti Hero"
      description="Configure a seção de psicologia reversa e filtro de qualificação"
      exists={!!exists}
      itemName="Marketing Anti Hero"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Metadata */}
        <div className="space-y-4">
          <SectionHeader
            title="Metadados do Componente"
            section="metadata"
            icon={Settings}
            isExpanded={expandedSections.metadata}
            onToggle={() => toggleSection("metadata")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.metadata ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Nome do Componente"
                    value={currentData.metadata.component}
                    onChange={(e) => handleChange('metadata.component', e.target.value)}
                    placeholder="MarketingAntiHero"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div>
                  <Input
                    label="Estratégia"
                    value={currentData.metadata.strategy}
                    onChange={(e) => handleChange('metadata.strategy', e.target.value)}
                    placeholder="Reverse Psychology Qualification"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div>
                  <Input
                    label="Tema Visual"
                    value={currentData.metadata.theme}
                    onChange={(e) => handleChange('metadata.theme', e.target.value)}
                    placeholder="Dark Crimson / Alert Mode"
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
            icon={Filter}
            isExpanded={expandedSections.header}
            onToggle={() => toggleSection("header")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.header ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Badge"
                    value={currentData.header.badge}
                    onChange={(e) => handleChange('header.badge', e.target.value)}
                    placeholder="Filtro de Qualificação"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Texto pequeno acima do título
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Input
                        label="Título (Parte 1)"
                        value={currentData.header.title_main}
                        onChange={(e) => handleChange('header.title_main', e.target.value)}
                        placeholder="A Tegbe"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>

                    <div>
                      <Input
                        label="Título (Destaque)"
                        value={currentData.header.title_highlight}
                        onChange={(e) => handleChange('header.title_highlight', e.target.value)}
                        placeholder="NÃO"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>

                    <div>
                      <Input
                        label="Título (Final)"
                        value={currentData.header.title_suffix}
                        onChange={(e) => handleChange('header.title_suffix', e.target.value)}
                        placeholder="é para você se..."
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-[var(--color-secondary)]/70">
                    Título completo será: &quot;{currentData.header.title_main} {currentData.header.title_highlight} {currentData.header.title_suffix}&quot;
                  </p>
                </div>

                <div className="md:col-span-2">
                  <TextArea
                    label="Descrição"
                    value={currentData.header.description}
                    onChange={(e) => handleChange('header.description', e.target.value)}
                    placeholder="Buscamos parceiros de crescimento, não aventuras..."
                    rows={3}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Texto explicativo abaixo do título
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Rejection Cards */}
        <div className="space-y-4">
          <SectionHeader
            title="Cartões de Rejeição"
            section="rejectionCards"
            icon={AlertTriangle}
            isExpanded={expandedSections.rejectionCards}
            onToggle={() => toggleSection("rejectionCards")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.rejectionCards ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Cartões de Psicologia Reversa
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {currentData.rejection_cards.filter(isCardValid).length} de {currentData.rejection_cards.length} completos
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddRejectionCard}
                    variant="primary"
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Cartão
                  </Button>
                </div>
                <p className="text-sm text-[var(--color-secondary)]/70 mt-2">
                  Lista de perfis que não são compatíveis com a metodologia da Tegbe
                </p>
              </div>

              <div className="space-y-6">
                {currentData.rejection_cards.map((card, index) => (
                  <div 
                    key={card.id}
                    ref={index === currentData.rejection_cards.length - 1 ? newCardRef : undefined}
                    draggable
                    onDragStart={(e) => handleCardDragStart(e, index)}
                    onDragOver={(e) => handleCardDragOver(e, index)}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleCardDragEnd}
                    onDrop={handleDrop}
                    className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                      draggingCard === index 
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
                          onDragStart={(e) => handleCardDragStart(e, index)}
                        >
                          <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-medium text-[var(--color-secondary)]/70">
                            {index + 1}
                          </span>
                          <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-[var(--color-secondary)]">
                              {card.title || "Sem título"}
                            </h4>
                            {isCardValid(card) ? (
                              <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                Completo
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                Incompleto
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Ícone
                                  </label>
                                  <IconSelector
                                    value={card.icon}
                                    onChange={(value) => handleUpdateCard(index, { icon: value })}
                                    placeholder="mdi:camera-off"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Título
                                  </label>
                                  <Input
                                    value={card.title}
                                    onChange={(e) => handleUpdateCard(index, { title: e.target.value })}
                                    placeholder="Busca Marketing de Vaidade"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Label de Status
                                  </label>
                                  <Input
                                    value={card.status_label}
                                    onChange={(e) => handleUpdateCard(index, { status_label: e.target.value })}
                                    placeholder="Incompatível"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Descrição
                                  </label>
                                  <TextArea
                                    value={card.description}
                                    onChange={(e) => handleUpdateCard(index, { description: e.target.value })}
                                    placeholder="Descrição detalhada do perfil incompatível..."
                                    rows={5}
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* Highlight Terms */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-medium text-[var(--color-secondary)] mb-1 flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Termos Destacados
                                  </h5>
                                  <p className="text-sm text-[var(--color-secondary)]/70">
                                    Palavras ou frases que serão destacadas na descrição
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => handleAddHighlightTerm(index)}
                                  variant="secondary"
                                  className="bg-[var(--color-background-body)] hover:bg-[var(--color-border)] text-[var(--color-secondary)] border-[var(--color-border)] flex items-center gap-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  Adicionar Termo
                                </Button>
                              </div>
                              
                              <div className="space-y-2">
                                {card.highlight_terms.map((term, termIndex) => (
                                  <div key={termIndex} className="flex items-center gap-2">
                                    <Input
                                      value={term}
                                      onChange={(e) => handleUpdateHighlightTerm(index, termIndex, e.target.value)}
                                      placeholder="Ex: Lucro Real, números frios..."
                                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                    />
                                    <Button
                                      type="button"
                                      onClick={() => handleRemoveHighlightTerm(index, termIndex)}
                                      variant="danger"
                                      className="bg-red-600 hover:bg-red-700 border-none flex-shrink-0"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          onClick={() => handleRemoveCard(index)}
                          variant="danger"
                          className="bg-red-600 hover:bg-red-700 border-none flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
          itemName="Marketing Anti Hero"
          icon={XCircle}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Marketing Anti Hero"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}