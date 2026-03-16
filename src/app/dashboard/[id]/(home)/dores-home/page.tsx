/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import IconSelector from "@/components/IconSelector";
import { 
  Layout, 
  Zap,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingDown,
  AlertTriangle,
  Tag,
  Sparkles,
  Trash2,
  Plus,
  Heading,
  Palette
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { tailwindToHex, hexToTailwindTextClass } from "@/lib/colors";

interface PainPoint {
  id: string;
  icon: string;
  stat: string;
  description: string;
}

interface SectionTitle {
  badge?: string;
  title_normal: string;
  title_effect?: string;
  color?: string; // Cor específica para o título
}

interface WarningWord {
  text: string;
  color: string;
}

interface Config {
  rotation_duration_seconds: number;
  section_theme: string;
  primary_color: string;
}

interface PainPointsPageData {
  section_title: SectionTitle; // NOVA SEÇÃO
  pain_points: {
    left: PainPoint[];
    right: PainPoint;
  };
  warning_words: WarningWord[];
  config: Config;
}

const defaultPainPointsData: PainPointsPageData = {
  section_title: { // NOVA SEÇÃO
    badge: "Alerta",
    title_normal: "Identificamos os Pontos",
    title_effect: "Críticos",
    color: "red-500"
  },
  pain_points: {
    left: [
      {
        id: "01",
        icon: "solar:wallet-money-bold-duotone",
        stat: "",
        description: ""
      },
    ],
    right: {
      id: "03",
      icon: "solar:user-hand-up-bold-duotone",
      stat: "",
      description: ""
    }
  },
  warning_words: [
    {
      text: "",
      color: "text-gray-500"
    }
  ],
  config: {
    rotation_duration_seconds: 3,
    section_theme: "Light/Premium",
    primary_color: "blue-600"
  }
};

const mergeWithDefaults = (apiData: any, defaultData: PainPointsPageData): PainPointsPageData => {
  if (!apiData) return defaultData;
  
  // Migração: se não tiver section_title, cria com valores padrão ou migra dos dados antigos
  let section_title = defaultData.section_title;
  
  if (apiData.section_title) {
    // Se já tem a nova estrutura
    section_title = {
      badge: apiData.section_title.badge || defaultData.section_title.badge,
      title_normal: apiData.section_title.title_normal || defaultData.section_title.title_normal,
      title_effect: apiData.section_title.title_effect || defaultData.section_title.title_effect,
      color: apiData.section_title.color || defaultData.section_title.color,
    };
  } else {
    // Tenta migrar de dados antigos se existirem
    const firstLeftPoint = apiData.pain_points?.left?.[0];
    if (firstLeftPoint) {
      section_title = {
        badge: firstLeftPoint.badge || defaultData.section_title.badge,
        title_normal: firstLeftPoint.title_normal || defaultData.section_title.title_normal,
        title_effect: firstLeftPoint.title_effect || defaultData.section_title.title_effect,
        color: defaultData.section_title.color,
      };
    }
  }
  
  // Migrar pain points left (removendo campos que agora estão no section_title)
  const oldLeftPoints = apiData.pain_points?.left || [];
  const migratedLeft = oldLeftPoints.map((point: any) => ({
    id: point.id || `item-${Date.now()}`,
    icon: point.icon || "solar:question-circle-bold-duotone",
    stat: point.stat || "",
    description: point.description || "",
  }));
  
  // Migrar pain point right
  const oldRightPoint = apiData.pain_points?.right || defaultData.pain_points.right;
  const migratedRight = {
    id: oldRightPoint.id || "03",
    icon: oldRightPoint.icon || "solar:user-hand-up-bold-duotone",
    stat: oldRightPoint.stat || "",
    description: oldRightPoint.description || "",
  };
  
  return {
    section_title,
    pain_points: {
      left: migratedLeft,
      right: migratedRight,
    },
    warning_words: apiData.warning_words || defaultData.warning_words,
    config: {
      rotation_duration_seconds: apiData.config?.rotation_duration_seconds || defaultData.config.rotation_duration_seconds,
      section_theme: apiData.config?.section_theme || defaultData.config.section_theme,
      primary_color: apiData.config?.primary_color || defaultData.config.primary_color,
    },
  };
};

export default function Page() {
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
  } = useJsonManagement<PainPointsPageData>({
    apiPath: "/api/tegbe-institucional/json/pain-points",
    defaultData: defaultPainPointsData,
    mergeFunction: mergeWithDefaults,
  });

  // Estados para drag & drop
  const [draggingItem, setDraggingItem] = useState<number | null>(null);
  const [draggingWarningWord, setDraggingWarningWord] = useState<number | null>(null);

  const [expandedSections, setExpandedSections] = useState({
    sectionTitle: true, // NOVA SEÇÃO
    painPoints: false,
    warningWords: false,
    config: false,
  });

  // Referências para novos itens
  const newPainPointRef = useRef<HTMLDivElement>(null);
  const newWarningWordRef = useRef<HTMLDivElement>(null);

  // Controle de planos
  const currentPlanType = 'pro';
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para atualizar o título da seção
  const handleUpdateSectionTitle = (updates: Partial<SectionTitle>) => {
    const current = pageData.section_title;
    updateNested('section_title', { ...current, ...updates });
  };

  const handleSectionTitleColorChange = (hexColor: string) => {
    const tailwindClass = hexToTailwindTextClass(hexColor);
    const colorValue = tailwindClass.replace('text-', '');
    handleUpdateSectionTitle({ color: colorValue });
  };

  // Funções para pain points left
  const handleAddPainPoint = () => {
    const painPointsLeft = pageData.pain_points.left;
    if (painPointsLeft.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: PainPoint = {
      id: `item-${Date.now()}`,
      icon: 'solar:question-circle-bold-duotone',
      stat: '',
      description: ''
    };
    
    const updated = [...painPointsLeft, newItem];
    updateNested('pain_points.left', updated);
    
    setTimeout(() => {
      newPainPointRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const handleUpdatePainPoint = (index: number, updates: Partial<PainPoint>) => {
    const painPointsLeft = pageData.pain_points.left;
    const updated = [...painPointsLeft];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      updateNested('pain_points.left', updated);
    }
  };

  const handleRemovePainPoint = (index: number) => {
    const painPointsLeft = pageData.pain_points.left;
    
    if (painPointsLeft.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyItem: PainPoint = {
        id: `item-${Date.now()}`,
        icon: 'solar:question-circle-bold-duotone',
        stat: '',
        description: ''
      };
      updateNested('pain_points.left', [emptyItem]);
    } else {
      const updated = painPointsLeft.filter((_, i) => i !== index);
      updateNested('pain_points.left', updated);
    }
  };

  // Funções para warning words
  const handleAddWarningWord = () => {
    const warningWords = pageData.warning_words;
    if (warningWords.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: WarningWord = {
      text: '',
      color: 'text-gray-500'
    };
    
    const updated = [...warningWords, newItem];
    updateNested('warning_words', updated);
    
    setTimeout(() => {
      newWarningWordRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const handleUpdateWarningWord = (index: number, updates: Partial<WarningWord>) => {
    const warningWords = pageData.warning_words;
    const updated = [...warningWords];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      updateNested('warning_words', updated);
    }
  };

  const handleRemoveWarningWord = (index: number) => {
    const warningWords = pageData.warning_words;
    
    if (warningWords.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyItem: WarningWord = {
        text: '',
        color: 'text-gray-500'
      };
      updateNested('warning_words', [emptyItem]);
    } else {
      const updated = warningWords.filter((_, i) => i !== index);
      updateNested('warning_words', updated);
    }
  };

  // Funções de drag & drop para painPointsLeft
  const handlePainPointDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingItem(index);
  };

  const handlePainPointDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingItem === null || draggingItem === index) return;
    
    const painPointsLeft = pageData.pain_points.left;
    const updated = [...painPointsLeft];
    const draggedItem = updated[draggingItem];
    
    // Remove o item arrastado
    updated.splice(draggingItem, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingItem ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    updateNested('pain_points.left', updated);
    setDraggingItem(index);
  };

  const handlePainPointDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingItem(null);
  };

  // Funções de drag & drop para warningWords
  const handleWarningWordDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingWarningWord(index);
  };

  const handleWarningWordDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingWarningWord === null || draggingWarningWord === index) return;
    
    const warningWords = pageData.warning_words;
    const updated = [...warningWords];
    const draggedItem = updated[draggingWarningWord];
    
    // Remove o item arrastado
    updated.splice(draggingWarningWord, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingWarningWord ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    updateNested('warning_words', updated);
    setDraggingWarningWord(index);
  };

  const handleWarningWordDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingWarningWord(null);
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

  // Função para atualizar cor de warning word
  const handleWarningWordColorChange = (index: number, hexColor: string) => {
    const tailwindClass = hexToTailwindTextClass(hexColor);
    handleUpdateWarningWord(index, { color: tailwindClass });
  };

  // Função para atualizar cor primária
  const handlePrimaryColorChange = (hexColor: string) => {
    const tailwindClass = hexToTailwindTextClass(hexColor);
    const colorValue = tailwindClass.replace('text-', '');
    updateNested('config.primary_color', colorValue);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Validações
  const isPainPointValid = (item: PainPoint): boolean => {
    return item.icon.trim() !== '' && 
           item.stat.trim() !== '' && 
           item.description.trim() !== '';
  };

  const isWarningWordValid = (item: WarningWord): boolean => {
    return item.text.trim() !== '' && item.color.trim() !== '';
  };

  const painPointsLeft = pageData.pain_points.left;
  const warningWords = pageData.warning_words;
  
  const isPainPointsLimitReached = painPointsLeft.length >= currentPlanLimit;
  const canAddNewPainPoint = !isPainPointsLimitReached;
  const painPointsCompleteCount = painPointsLeft.filter(isPainPointValid).length;
  const painPointsTotalCount = painPointsLeft.length;

  const isWarningWordsLimitReached = warningWords.length >= currentPlanLimit;
  const canAddNewWarningWord = !isWarningWordsLimitReached;
  const warningWordsCompleteCount = warningWords.filter(isWarningWordValid).length;
  const warningWordsTotalCount = warningWords.length;

  const painPointsValidationError = isPainPointsLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const warningWordsValidationError = isWarningWordsLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Section Title (4 campos)
    total += 4;
    if (pageData.section_title.badge?.trim()) completed++;
    if (pageData.section_title.title_normal.trim()) completed++;
    if (pageData.section_title.title_effect?.trim()) completed++;
    if (pageData.section_title.color?.trim()) completed++;

    // Pain Points Left
    total += painPointsLeft.length * 3; // 3 campos: icon, stat, description
    painPointsLeft.forEach(item => {
      if (item.icon.trim()) completed++;
      if (item.stat.trim()) completed++;
      if (item.description.trim()) completed++;
    });

    // Pain Points Right (1 item com 3 campos)
    total += 3;
    if (pageData.pain_points.right.icon.trim()) completed++;
    if (pageData.pain_points.right.stat.trim()) completed++;
    if (pageData.pain_points.right.description.trim()) completed++;

    // Warning Words
    total += warningWords.length * 2;
    warningWords.forEach(word => {
      if (word.text.trim()) completed++;
      if (word.color.trim()) completed++;
    });

    // Config (3 campos)
    total += 3;
    if (pageData.config.rotation_duration_seconds) completed++;
    if (pageData.config.section_theme.trim()) completed++;
    if (pageData.config.primary_color.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={TrendingDown}
      title="Gerenciar Pontos de Dor"
      description="Configure os pontos de dor e palavras de alerta para a seção"
      exists={!!exists}
      itemName="Pontos de Dor"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* NOVA SEÇÃO: Título da Seção */}
        <div className="space-y-4">
          <SectionHeader
            title="Título da Seção"
            section="sectionTitle"
            icon={Heading}
            isExpanded={expandedSections.sectionTitle}
            onToggle={() => toggleSection("sectionTitle")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.sectionTitle ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Badge (Opcional)
                    </label>
                    <Input
                      value={pageData.section_title.badge || ''}
                      onChange={(e) => handleUpdateSectionTitle({ badge: e.target.value })}
                      placeholder="Ex: Alerta, Atenção, Crítico"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Título Normal</label>
                    <Input
                      value={pageData.section_title.title_normal}
                      onChange={(e) => handleUpdateSectionTitle({ title_normal: e.target.value })}
                      placeholder="Ex: Identificamos os Pontos"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Título com Efeito (Opcional)
                    </label>
                    <Input
                      value={pageData.section_title.title_effect || ''}
                      onChange={(e) => handleUpdateSectionTitle({ title_effect: e.target.value })}
                      placeholder="Ex: Críticos, Prioritários, Urgentes"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/50">
                      Parte do título que terá efeito especial/destaque
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Cor do Título
                    </label>
                    <ThemePropertyInput
                      property="text"
                      label=""
                      description=""
                      currentHex={tailwindToHex(`text-${pageData.section_title.color || 'red-500'}`)}
                      tailwindClass={`text-${pageData.section_title.color || 'red-500'}`}
                      onThemeChange={(_, hex) => handleSectionTitleColorChange(hex)}
                    />
                    <p className="text-xs text-[var(--color-secondary)]/50">
                      Cor específica para o título e efeitos
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Pain Points */}
        <div className="space-y-4">
          <SectionHeader
            title="Pontos de Dor"
            section="painPoints"
            icon={TrendingDown}
            isExpanded={expandedSections.painPoints}
            onToggle={() => toggleSection("painPoints")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.painPoints ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-8">
                {/* Pain Points Left */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">Lado Esquerdo</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-[var(--color-secondary)]/70">
                            {painPointsCompleteCount} de {painPointsTotalCount} completos
                          </span>
                        </div>
                        <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          Limite: {currentPlanType === 'pro' ? '10' : '5'} itens
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        type="button"
                        onClick={handleAddPainPoint}
                        variant="primary"
                        className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                        disabled={!canAddNewPainPoint}
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Ponto de Dor
                      </Button>
                      {isPainPointsLimitReached && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Limite do plano atingido
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mensagem de erro */}
                  {painPointsValidationError && (
                    <div className={`p-3 rounded-lg ${isPainPointsLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                      <div className="flex items-start gap-2">
                        {isPainPointsLimitReached ? (
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={`text-sm ${isPainPointsLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                          {painPointsValidationError}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {painPointsLeft.map((item, index) => (
                      <div 
                        key={`pain-point-left-${item.id}-${index}`}
                        ref={index === painPointsLeft.length - 1 ? newPainPointRef : undefined}
                        draggable
                        onDragStart={(e) => handlePainPointDragStart(e, index)}
                        onDragOver={(e) => handlePainPointDragOver(e, index)}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragEnd={handlePainPointDragEnd}
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
                              onDragStart={(e) => handlePainPointDragStart(e, index)}
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
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-[var(--color-secondary)]">
                                  Ponto de Dor #{index + 1}
                                </h4>
                                {isPainPointValid(item) ? (
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
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Ícone</label>
                                    <IconSelector
                                      value={item.icon}
                                      onChange={(value) => handleUpdatePainPoint(index, { icon: value })}
                                      placeholder="solar:wallet-money-bold-duotone"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Estatística</label>
                                    <Input
                                      value={item.stat}
                                      onChange={(e) => handleUpdatePainPoint(index, { stat: e.target.value })}
                                      placeholder="Ex: -40% de Verba"
                                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Descrição</label>
                                    <TextArea
                                      value={item.description}
                                      onChange={(e) => handleUpdatePainPoint(index, { description: e.target.value })}
                                      placeholder="Descrição impactante do ponto de dor"
                                      rows={3}
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
                              onClick={() => handleRemovePainPoint(index)}
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
                </div>

                {/* Pain Points Right */}
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-4">Lado Direito</h3>
                  <div className="p-6 border border-[var(--color-border)] rounded-lg bg-[var(--color-background-body)]">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-[var(--color-secondary)]">Item Principal</h4>
                        </div>
                        <span className="text-xs text-[var(--color-secondary)]/70">ID: {pageData.pain_points.right.id}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-[var(--color-secondary)]">Ícone</label>
                            <IconSelector
                              value={pageData.pain_points.right.icon}
                              onChange={(value) => updateNested(`pain_points.right.icon`, value)}
                              placeholder="solar:user-hand-up-bold-duotone"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-[var(--color-secondary)]">Estatística</label>
                            <Input
                              value={pageData.pain_points.right.stat}
                              onChange={(e) => updateNested(`pain_points.right.stat`, e.target.value)}
                              placeholder="Ex: CEO Operacional"
                              className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-[var(--color-secondary)]">Descrição</label>
                            <TextArea
                              value={pageData.pain_points.right.description}
                              onChange={(e) => updateNested(`pain_points.right.description`, e.target.value)}
                              placeholder="Descrição impactante do ponto de dor principal"
                              rows={3}
                              className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Warning Words */}
        <div className="space-y-4">
          <SectionHeader
            title="Palavras de Alerta"
            section="warningWords"
            icon={AlertTriangle}
            isExpanded={expandedSections.warningWords}
            onToggle={() => toggleSection("warningWords")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.warningWords ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Configure as palavras de alerta
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {warningWordsCompleteCount} de {warningWordsTotalCount} completos
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        Limite: {currentPlanType === 'pro' ? '10' : '5'} itens
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddWarningWord}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                      disabled={!canAddNewWarningWord}
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Palavra
                    </Button>
                    {isWarningWordsLimitReached && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Limite do plano atingido
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Cada palavra deve ter um texto e uma cor.
                </p>
              </div>

              {/* Mensagem de erro */}
              {warningWordsValidationError && (
                <div className={`p-3 rounded-lg ${isWarningWordsLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                  <div className="flex items-start gap-2">
                    {isWarningWordsLimitReached ? (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${isWarningWordsLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                      {warningWordsValidationError}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {warningWords.map((word, index) => (
                  <div 
                    key={`warning-word-${index}`}
                    ref={index === warningWords.length - 1 ? newWarningWordRef : undefined}
                    draggable
                    onDragStart={(e) => handleWarningWordDragStart(e, index)}
                    onDragOver={(e) => handleWarningWordDragOver(e, index)}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleWarningWordDragEnd}
                    onDrop={handleDrop}
                    className={`p-4 border border-[var(--color-border)] rounded-lg space-y-4 transition-all duration-200 ${
                      draggingWarningWord === index 
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
                          onDragStart={(e) => handleWarningWordDragStart(e, index)}
                        >
                          <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                        </div>
                        
                        {/* Indicador de posição */}
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-medium text-[var(--color-secondary)]/70">
                            {index + 1}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-[var(--color-secondary)]">
                              {word.text || "Sem texto"}
                            </h4>
                            {word.text && word.color ? (
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
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                Texto
                              </label>
                              <Input
                                value={word.text}
                                onChange={(e) => handleUpdateWarningWord(index, { text: e.target.value })}
                                placeholder="Ex: MARGEM BAIXA"
                                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                Cor
                              </label>
                              <ThemePropertyInput
                                property="text"
                                label=""
                                description=""
                                currentHex={tailwindToHex(word.color)}
                                tailwindClass={word.color}
                                onThemeChange={(_, hex) => handleWarningWordColorChange(index, hex)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          onClick={() => handleRemoveWarningWord(index)}
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
            </Card>
          </motion.div>
        </div>

        {/* Seção Config */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações Gerais"
            section="config"
            icon={Zap}
            isExpanded={expandedSections.config}
            onToggle={() => toggleSection("config")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.config ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Duração da Rotação (segundos)
                  </label>
                  <Input
                    type="number"
                    value={pageData.config.rotation_duration_seconds}
                    onChange={(e) => updateNested('config.rotation_duration_seconds', parseInt(e.target.value) || 3)}
                    placeholder="Ex: 3"
                    min="1"
                    max="10"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Tema da Seção
                  </label>
                  <Input
                    value={pageData.config.section_theme}
                    onChange={(e) => updateNested('config.section_theme', e.target.value)}
                    placeholder="Ex: Light/Premium"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="md:col-span-2">
                  <ThemePropertyInput
                    property="text"
                    label="Cor Primária Geral"
                    description="Cor principal para elementos gerais da seção"
                    currentHex={tailwindToHex(`text-${pageData.config.primary_color}`)}
                    tailwindClass={`text-${pageData.config.primary_color}`}
                    onThemeChange={(_, hex) => handlePrimaryColorChange(hex)}
                  />
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
          itemName="Pontos de Dor"
          icon={TrendingDown}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração de Pontos de Dor"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}