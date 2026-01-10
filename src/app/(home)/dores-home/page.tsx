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
  Layout, 
  Zap,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingDown,
  AlertTriangle,
  Trash2,
  Plus
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { extractHexFromTailwind, hexToTailwindBgClass, hexToTailwindTextClass } from "@/lib/colors";

interface PainPoint {
  id: string;
  icon: string;
  title: string;
  stat: string;
  description: string;
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
  pain_points: {
    left: PainPoint[];
    right: PainPoint;
  };
  warning_words: WarningWord[];
  config: Config;
}

const defaultPainPointsData: PainPointsPageData = {
  pain_points: {
    left: [
      {
        id: "01",
        icon: "solar:wallet-money-bold-duotone",
        title: "",
        stat: "",
        description: ""
      },
    ],
    right: {
      id: "03",
      icon: "solar:user-hand-up-bold-duotone",
      title: "",
      stat: "",
      description: ""
    }
  },
  warning_words: [
    {
      text: "",
      color: ""
    }
  ],
  config: {
    rotation_duration_seconds: 3,
    section_theme: "Light/Premium",
    primary_color: ""
  }
};

const mergeWithDefaults = (apiData: any, defaultData: PainPointsPageData): PainPointsPageData => {
  if (!apiData) return defaultData;
  
  return {
    pain_points: {
      left: apiData.pain_points?.left || defaultData.pain_points.left,
      right: apiData.pain_points?.right || defaultData.pain_points.right,
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

  // Estado local para gerenciar as listas
  const [localPainPointsLeft, setLocalPainPointsLeft] = useState<PainPoint[]>([]);
  const [localWarningWords, setLocalWarningWords] = useState<WarningWord[]>([]);
  const [draggingItem, setDraggingItem] = useState<number | null>(null);
  const [draggingWarningWord, setDraggingWarningWord] = useState<number | null>(null);

  const [expandedSections, setExpandedSections] = useState({
    painPoints: true,
    warningWords: false,
    config: false,
  });

  // Referências para novos itens
  const newPainPointRef = useRef<HTMLDivElement>(null);
  const newWarningWordRef = useRef<HTMLDivElement>(null);

  // Controle de planos
  const currentPlanType = 'pro'; // Altere conforme sua lógica de planos
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  // Sincroniza os dados quando carregam do banco
  useEffect(() => {
    if (pageData.pain_points.left) {
      setLocalPainPointsLeft(pageData.pain_points.left);
    }
  }, [pageData.pain_points.left]);

  useEffect(() => {
    if (pageData.warning_words) {
      setLocalWarningWords(pageData.warning_words);
    }
  }, [pageData.warning_words]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para pain points left
  const handleAddPainPoint = () => {
    if (localPainPointsLeft.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: PainPoint = {
      id: `item-${Date.now()}`,
      icon: 'solar:question-circle-bold-duotone',
      title: '',
      stat: '',
      description: ''
    };
    
    const updated = [...localPainPointsLeft, newItem];
    setLocalPainPointsLeft(updated);
    updateNested('pain_points.left', updated);
    
    setTimeout(() => {
      newPainPointRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updatePainPoint = (index: number, updates: Partial<PainPoint>) => {
    const updated = [...localPainPointsLeft];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      setLocalPainPointsLeft(updated);
      updateNested('pain_points.left', updated);
    }
  };

  const removePainPoint = (index: number) => {
    const updated = [...localPainPointsLeft];
    
    if (updated.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyItem: PainPoint = {
        id: `item-${Date.now()}`,
        icon: 'solar:question-circle-bold-duotone',
        title: '',
        stat: '',
        description: ''
      };
      setLocalPainPointsLeft([emptyItem]);
      updateNested('pain_points.left', [emptyItem]);
    } else {
      updated.splice(index, 1);
      setLocalPainPointsLeft(updated);
      updateNested('pain_points.left', updated);
    }
  };

  // Funções para warning words
  const handleAddWarningWord = () => {
    if (localWarningWords.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: WarningWord = {
      text: '',
      color: 'text-gray-500'
    };
    
    const updated = [...localWarningWords, newItem];
    setLocalWarningWords(updated);
    updateNested('warning_words', updated);
    
    setTimeout(() => {
      newWarningWordRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updateWarningWord = (index: number, updates: Partial<WarningWord>) => {
    const updated = [...localWarningWords];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      setLocalWarningWords(updated);
      updateNested('warning_words', updated);
    }
  };

  const removeWarningWord = (index: number) => {
    const updated = [...localWarningWords];
    
    if (updated.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyItem: WarningWord = {
        text: '',
        color: 'text-gray-500'
      };
      setLocalWarningWords([emptyItem]);
      updateNested('warning_words', [emptyItem]);
    } else {
      updated.splice(index, 1);
      setLocalWarningWords(updated);
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
    
    const updated = [...localPainPointsLeft];
    const draggedItem = updated[draggingItem];
    
    // Remove o item arrastado
    updated.splice(draggingItem, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingItem ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    setLocalPainPointsLeft(updated);
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
    
    const updated = [...localWarningWords];
    const draggedItem = updated[draggingWarningWord];
    
    // Remove o item arrastado
    updated.splice(draggingWarningWord, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingWarningWord ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    setLocalWarningWords(updated);
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
    updateWarningWord(index, { color: tailwindClass });
  };

  // Função para atualizar cor primária
  const handlePrimaryColorChange = (hexColor: string) => {
    const tailwindClass = hexToTailwindBgClass(hexColor);
    // Remove o prefixo 'bg-' se existir
    const colorValue = tailwindClass.replace('bg-', '');
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
    return item.icon.trim() !== '' && item.title.trim() !== '' && 
           item.stat.trim() !== '' && item.description.trim() !== '';
  };

  const isWarningWordValid = (item: WarningWord): boolean => {
    return item.text.trim() !== '' && item.color.trim() !== '';
  };

  const isPainPointsLimitReached = localPainPointsLeft.length >= currentPlanLimit;
  const canAddNewPainPoint = !isPainPointsLimitReached;
  const painPointsCompleteCount = localPainPointsLeft.filter(isPainPointValid).length;
  const painPointsTotalCount = localPainPointsLeft.length;

  const isWarningWordsLimitReached = localWarningWords.length >= currentPlanLimit;
  const canAddNewWarningWord = !isWarningWordsLimitReached;
  const warningWordsCompleteCount = localWarningWords.filter(isWarningWordValid).length;
  const warningWordsTotalCount = localWarningWords.length;

  const painPointsValidationError = isPainPointsLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const warningWordsValidationError = isWarningWordsLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Pain Points Left
    total += localPainPointsLeft.length * 4;
    localPainPointsLeft.forEach(item => {
      if (item.icon.trim()) completed++;
      if (item.title.trim()) completed++;
      if (item.stat.trim()) completed++;
      if (item.description.trim()) completed++;
    });

    // Pain Points Right (1 item com 4 campos)
    total += 4;
    if (pageData.pain_points.right.icon.trim()) completed++;
    if (pageData.pain_points.right.title.trim()) completed++;
    if (pageData.pain_points.right.stat.trim()) completed++;
    if (pageData.pain_points.right.description.trim()) completed++;

    // Warning Words
    total += localWarningWords.length * 2;
    localWarningWords.forEach(word => {
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
                    {localPainPointsLeft.map((item, index) => (
                      <div 
                        key={`pain-point-left-${index}`}
                        ref={index === localPainPointsLeft.length - 1 ? newPainPointRef : undefined}
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
                                  {item.title || "Sem título"}
                                </h4>
                                {item.title && item.description && item.icon && item.stat ? (
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
                                      onChange={(value) => updatePainPoint(index, { icon: value })}
                                      placeholder="solar:wallet-money-bold-duotone"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Título</label>
                                    <Input
                                      value={item.title}
                                      onChange={(e) => updatePainPoint(index, { title: e.target.value })}
                                      placeholder="Título do ponto de dor"
                                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Estatística</label>
                                    <Input
                                      value={item.stat}
                                      onChange={(e) => updatePainPoint(index, { stat: e.target.value })}
                                      placeholder="Ex: -40% de Verba"
                                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Descrição</label>
                                    <TextArea
                                      value={item.description}
                                      onChange={(e) => updatePainPoint(index, { description: e.target.value })}
                                      placeholder="Descrição impactante"
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
                              onClick={() => removePainPoint(index)}
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
                  <div className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background-body)]">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-[var(--color-secondary)]">Item Principal</h4>
                        <span className="text-xs text-[var(--color-secondary)]/70">ID: {pageData.pain_points.right.id}</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[var(--color-secondary)]">Ícone</label>
                          <IconSelector
                            value={pageData.pain_points.right.icon}
                            onChange={(value) => updateNested(`pain_points.right.icon`, value)}
                            placeholder="solar:user-hand-up-bold-duotone"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-[var(--color-secondary)]">Título</label>
                            <Input
                              value={pageData.pain_points.right.title}
                              onChange={(e) => updateNested(`pain_points.right.title`, e.target.value)}
                              placeholder="Título do ponto de dor"
                              className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
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
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[var(--color-secondary)]">Descrição</label>
                          <TextArea
                            value={pageData.pain_points.right.description}
                            onChange={(e) => updateNested(`pain_points.right.description`, e.target.value)}
                            placeholder="Descrição impactante"
                            rows={3}
                            className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                          />
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
                {localWarningWords.map((word, index) => (
                  <div 
                    key={`warning-word-${index}`}
                    ref={index === localWarningWords.length - 1 ? newWarningWordRef : undefined}
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
                                onChange={(e) => updateWarningWord(index, { text: e.target.value })}
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
                                currentHex={extractHexFromTailwind(word.color)}
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
                          onClick={() => removeWarningWord(index)}
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
                    property="bg"
                    label="Cor Primária"
                    description="Cor principal da seção"
                    currentHex={extractHexFromTailwind(`bg-${pageData.config.primary_color}`)}
                    tailwindClass={`bg-${pageData.config.primary_color}`}
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