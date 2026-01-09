/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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
  Trash2
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { useListState } from "@/hooks/useListState";
import { Button } from "@/components/Button";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { extractHexFromTailwind } from "@/lib/colorUtils";

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
        title: "O Sócio Oculto",
        stat: "-40% de Verba",
        description: "Tráfego sem conversão não é investimento. É doação para o Zuckerberg."
      },
      {
        id: "02",
        icon: "solar:cart-large-minimalistic-bold-duotone",
        title: "Vitrine Fantasma",
        stat: "Sem Vendas",
        description: "Sua loja é bonita, mas se não vende em 3s, é apenas um catálogo caro."
      }
    ],
    right: {
      id: "03",
      icon: "solar:user-hand-up-bold-duotone",
      title: "Gargalo Operacional",
      stat: "CEO Operacional",
      description: "Faz tráfego e embala pedido? Você é o funcionário mais caro da empresa."
    }
  },
  warning_words: [
    {
      text: "MARGEM BAIXA",
      color: "text-amber-600"
    },
    {
      text: "ROI NEGATIVO",
      color: "text-red-600"
    },
    {
      text: "CUSTO ALTO",
      color: "text-orange-600"
    },
    {
      text: "SEM CAIXA",
      color: "text-gray-600"
    }
  ],
  config: {
    rotation_duration_seconds: 3,
    section_theme: "Light/Premium",
    primary_color: "amber-500"
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

const hexToTailwindTextClass = (hex: string): string => {
  const cleanHex = hex.replace("#", "");
  
  // Mapeamento de cores comuns
  const colorMap: Record<string, string> = {
    "000000": "text-black",
    "FFFFFF": "text-white",
    "EF4444": "text-red-500",
    "F97316": "text-orange-500",
    "F59E0B": "text-amber-500",
    "EAB308": "text-yellow-500",
    "84CC16": "text-lime-500",
    "22C55E": "text-green-500",
    "10B981": "text-emerald-500",
    "14B8A6": "text-teal-500",
    "06B6D4": "text-cyan-500",
    "0EA5E9": "text-sky-500",
    "3B82F6": "text-blue-500",
    "6366F1": "text-indigo-500",
    "8B5CF6": "text-violet-500",
    "A855F7": "text-purple-500",
    "D946EF": "text-fuchsia-500",
    "EC4899": "text-pink-500",
    "F43F5E": "text-rose-500",
    "6B7280": "text-gray-500",
  };

  return colorMap[cleanHex] || `text-[#${cleanHex}]`;
};

const hexToTailwindBgClass = (hex: string): string => {
  const cleanHex = hex.replace("#", "");
  
  // Mapeamento de cores comuns
  const colorMap: Record<string, string> = {
    "000000": "bg-black",
    "FFFFFF": "bg-white",
    "EF4444": "bg-red-500",
    "F97316": "bg-orange-500",
    "F59E0B": "bg-amber-500",
    "EAB308": "bg-yellow-500",
    "84CC16": "bg-lime-500",
    "22C55E": "bg-green-500",
    "10B981": "bg-emerald-500",
    "14B8A6": "bg-teal-500",
    "06B6D4": "bg-cyan-500",
    "0EA5E9": "bg-sky-500",
    "3B82F6": "bg-blue-500",
    "6366F1": "bg-indigo-500",
    "8B5CF6": "bg-violet-500",
    "A855F7": "bg-purple-500",
    "D946EF": "bg-fuchsia-500",
    "EC4899": "bg-pink-500",
    "F43F5E": "bg-rose-500",
    "6B7280": "bg-gray-500",
  };

  return colorMap[cleanHex] || `bg-[#${cleanHex}]`;
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
    apiPath: "/api/tegbe-institucional/json/headline-home",
    defaultData: defaultPainPointsData,
    mergeFunction: mergeWithDefaults,
  });

  const painPointsLeftList = useListState<PainPoint>({
    initialItems: pageData.pain_points.left,
    defaultItem: {
      id: '',
      icon: 'solar:question-circle-bold-duotone',
      title: '',
      stat: '',
      description: ''
    },
    validationFields: ['title', 'description', 'icon', 'stat'],
    enableDragDrop: true
  });

  const warningWordsList = useListState<WarningWord>({
    initialItems: pageData.warning_words,
    defaultItem: {
      text: '',
      color: 'text-gray-500'
    },
    validationFields: ['text', 'color'],
    enableDragDrop: true
  });

  const [expandedSections, setExpandedSections] = useState({
    painPoints: true,
    warningWords: false,
    config: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddPainPoint = () => {
    const success = painPointsLeftList.addItem();
    if (!success) {
      console.warn(painPointsLeftList.validationError);
    }
  };

  const handleAddWarningWord = () => {
    const success = warningWordsList.addItem();
    if (!success) {
      console.warn(warningWordsList.validationError);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    updateNested('pain_points.left', painPointsLeftList.items);
    updateNested('warning_words', warningWordsList.items);
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  const handlePainPointDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    painPointsLeftList.startDrag(index);
  };

  const handlePainPointDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    painPointsLeftList.handleDragOver(index);
  };

  const handlePainPointDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    painPointsLeftList.endDrag();
  };

  const handleWarningWordDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    warningWordsList.startDrag(index);
  };

  const handleWarningWordDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    warningWordsList.handleDragOver(index);
  };

  const handleWarningWordDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    warningWordsList.endDrag();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleWarningWordColorChange = (index: number, hexColor: string) => {
    const tailwindClass = hexToTailwindTextClass(hexColor);
    warningWordsList.updateItem(index, { color: tailwindClass });
  };

  const handlePrimaryColorChange = (hexColor: string) => {
    const tailwindClass = hexToTailwindBgClass(hexColor);
    const colorValue = tailwindClass.replace('bg-', '');
    updateNested('config.primary_color', colorValue);
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    total += painPointsLeftList.items.length * 4;
    painPointsLeftList.items.forEach(item => {
      if (item.icon.trim()) completed++;
      if (item.title.trim()) completed++;
      if (item.stat.trim()) completed++;
      if (item.description.trim()) completed++;
    });

    total += 4;
    if (pageData.pain_points.right.icon.trim()) completed++;
    if (pageData.pain_points.right.title.trim()) completed++;
    if (pageData.pain_points.right.stat.trim()) completed++;
    if (pageData.pain_points.right.description.trim()) completed++;

    total += warningWordsList.items.length * 2;
    warningWordsList.items.forEach(word => {
      if (word.text.trim()) completed++;
      if (word.color.trim()) completed++;
    });

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
      title="Gerenciar Pontos da Headline"
      description="Configure os pontos da headline"
      exists={!!exists}
      itemName="Pontos da Headline"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
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
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">Lado Esquerdo</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-[var(--color-secondary)]/70">
                            {painPointsLeftList.completeCount} de {painPointsLeftList.totalCount} completos
                          </span>
                        </div>
                        <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          Limite: {painPointsLeftList.currentPlanType === 'pro' ? '10' : '5'} itens
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        type="button"
                        onClick={handleAddPainPoint}
                        variant="primary"
                        className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                        disabled={!painPointsLeftList.canAddNewItem}
                      >
                        + Adicionar Ponto de Dor
                      </Button>
                      {painPointsLeftList.isLimitReached && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Limite do plano atingido
                        </p>
                      )}
                    </div>
                  </div>

                  {painPointsLeftList.validationError && (
                    <div className={`p-3 rounded-lg ${painPointsLeftList.isLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                      <div className="flex items-start gap-2">
                        {painPointsLeftList.isLimitReached ? (
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={`text-sm ${painPointsLeftList.isLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                          {painPointsLeftList.validationError}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {painPointsLeftList.filteredItems.map((item, index) => (
                      <div 
                        key={`pain-point-left-${index}`}
                        ref={index === painPointsLeftList.filteredItems.length - 1 ? painPointsLeftList.newItemRef : undefined}
                        draggable
                        onDragStart={(e) => handlePainPointDragStart(e, index)}
                        onDragOver={(e) => handlePainPointDragOver(e, index)}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragEnd={handlePainPointDragEnd}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                          painPointsLeftList.draggingItem === index 
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                            : 'hover:border-[var(--color-primary)]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div 
                              className="cursor-grab active:cursor-grabbing p-2 hover:bg-[var(--color-background)]/50 rounded transition-colors"
                              draggable
                              onDragStart={(e) => handlePainPointDragStart(e, index)}
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
                                      onChange={(value) => painPointsLeftList.updateItem(index, { icon: value })}
                                      placeholder="solar:wallet-money-bold-duotone"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Título</label>
                                    <Input
                                      value={item.title}
                                      onChange={(e) => painPointsLeftList.updateItem(index, { title: e.target.value })}
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
                                      onChange={(e) => painPointsLeftList.updateItem(index, { stat: e.target.value })}
                                      placeholder="Ex: -40% de Verba"
                                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Descrição</label>
                                    <TextArea
                                      value={item.description}
                                      onChange={(e) => painPointsLeftList.updateItem(index, { description: e.target.value })}
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
                              onClick={() => painPointsLeftList.removeItem(index)}
                              variant="danger"
                              className="whitespace-nowrap bg-red-600 hover:bg-red-700 border-none"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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
                          {warningWordsList.completeCount} de {warningWordsList.totalCount} completos
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        Limite: {warningWordsList.currentPlanType === 'pro' ? '10' : '5'} itens
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddWarningWord}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                      disabled={!warningWordsList.canAddNewItem}
                    >
                      + Adicionar Palavra
                    </Button>
                    {warningWordsList.isLimitReached && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Limite do plano atingido
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Cada palavra deve ter um texto e uma cor (classe Tailwind CSS).
                </p>
              </div>

              {warningWordsList.validationError && (
                <div className={`p-3 rounded-lg ${warningWordsList.isLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                  <div className="flex items-start gap-2">
                    {warningWordsList.isLimitReached ? (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${warningWordsList.isLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                      {warningWordsList.validationError}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {warningWordsList.filteredItems.map((word, index) => (
                  <div 
                    key={`warning-word-${index}`}
                    ref={index === warningWordsList.filteredItems.length - 1 ? warningWordsList.newItemRef : undefined}
                    draggable
                    onDragStart={(e) => handleWarningWordDragStart(e, index)}
                    onDragOver={(e) => handleWarningWordDragOver(e, index)}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleWarningWordDragEnd}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`p-4 border border-[var(--color-border)] rounded-lg space-y-4 transition-all duration-200 ${
                      warningWordsList.draggingItem === index 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                        : 'hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div 
                          className="cursor-grab active:cursor-grabbing p-2 hover:bg-[var(--color-background)]/50 rounded transition-colors"
                          draggable
                          onDragStart={(e) => handleWarningWordDragStart(e, index)}
                        >
                          <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                        </div>
                        
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
                                onChange={(e) => warningWordsList.updateItem(index, { text: e.target.value })}
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
                          onClick={() => warningWordsList.removeItem(index)}
                          variant="danger"
                          className="whitespace-nowrap bg-red-600 hover:bg-red-700 border-none"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

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