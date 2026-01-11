/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { 
  PlayCircle, 
  Layers, 
  Timer, 
  Palette,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Text,
  Zap,
  Target,
  Truck,
  TrendingUp,
  MessageCircle
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { extractHexFromTailwind, hexToTailwindClass } from "@/lib/colorUtils";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";

interface StepItem {
  title: string;
  label: string;
  description: string;
}

interface AnimationTiming {
  attraction: number;
  interest: number;
  conversion: number;
  logistics: number;
  scale: number;
  pauses: number;
}

interface CTAData {
  text: string;
  link: string;
}

interface StyleData {
  primaryColor: string;
  secondaryColor: string;
  successColor: string;
  backgroundColor: string;
  textColor: string;
}

interface Metadata {
  version: string;
  lastUpdated: string;
  componentName: string;
}

type SalesEngineVisualData = {
  id?: string;
  title: {
    badge: string;
    main: string;
    highlighted: string;
  };
  subtitle: string;
  steps: StepItem[];
  cta: CTAData;
  animationTiming: AnimationTiming;
  style: StyleData;
  metadata: Metadata;
};

const defaultSalesEngineVisualData: SalesEngineVisualData = {
  title: {
    badge: "Engenharia de Conversão Tegbe",
    main: "NÃO É SORTE.",
    highlighted: "É MÉTODO."
  },
  subtitle: "Aplicamos um processo validado que resolve sua operação de ponta a ponta e escala seu faturamento com previsibilidade.",
  steps: [
    {
      title: "Atração",
      label: "Anúncios Magnéticos",
      description: "Criamos anúncios que capturam atenção imediata e geram desejo."
    },
    {
      title: "Interesse",
      label: "Desejo Imediato",
      description: "Gatilhos visuais e psicológicos que convertem olhares em cliques."
    },
    {
      title: "Conversão",
      label: "Vendas Reais",
      description: "Checkout otimizado e processos que transformam interesse em vendas."
    },
    {
      title: "Logística",
      label: "Entrega Ágil",
      description: "Sistema integrado que garante entrega rápida e experiência perfeita."
    },
    {
      title: "Escala",
      label: "Lucro Máximo",
      description: "Multiplicação de resultados com automação e análise de dados."
    }
  ],
  cta: {
    text: "Quero Vender Assim",
    link: "https://api.whatsapp.com/send?phone=5514991779502&text=Vi%20a%20metodologia%20da%20Tegbe%20e%20quero%20vender%20exatamente%20desse%20jeito.%20Podemos%20conversar?"
  },
  animationTiming: {
    attraction: 1.2,
    interest: 0.8,
    conversion: 1.0,
    logistics: 1.5,
    scale: 2.0,
    pauses: 0.5
  },
  style: {
    primaryColor: "bg-[#3483FA]",
    secondaryColor: "bg-[#0071E3]",
    successColor: "bg-[#00E676]",
    backgroundColor: "bg-[#F4F4F4]",
    textColor: "text-[#000000]"
  },
  metadata: {
    version: "1.0.0",
    lastUpdated: "2024-01-15",
    componentName: "SalesEngineVisual"
  }
};

const mergeWithDefaults = (apiData: any, defaultData: SalesEngineVisualData): SalesEngineVisualData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id,
    title: {
      badge: apiData.title?.badge || defaultData.title.badge,
      main: apiData.title?.main || defaultData.title.main,
      highlighted: apiData.title?.highlighted || defaultData.title.highlighted,
    },
    subtitle: apiData.subtitle || defaultData.subtitle,
    steps: apiData.steps || defaultData.steps,
    cta: {
      text: apiData.cta?.text || defaultData.cta.text,
      link: apiData.cta?.link || defaultData.cta.link,
    },
    animationTiming: {
      attraction: apiData.animationTiming?.attraction || defaultData.animationTiming.attraction,
      interest: apiData.animationTiming?.interest || defaultData.animationTiming.interest,
      conversion: apiData.animationTiming?.conversion || defaultData.animationTiming.conversion,
      logistics: apiData.animationTiming?.logistics || defaultData.animationTiming.logistics,
      scale: apiData.animationTiming?.scale || defaultData.animationTiming.scale,
      pauses: apiData.animationTiming?.pauses || defaultData.animationTiming.pauses,
    },
    style: {
      primaryColor: apiData.style?.primaryColor || defaultData.style.primaryColor,
      secondaryColor: apiData.style?.secondaryColor || defaultData.style.secondaryColor,
      successColor: apiData.style?.successColor || defaultData.style.successColor,
      backgroundColor: apiData.style?.backgroundColor || defaultData.style.backgroundColor,
      textColor: apiData.style?.textColor || defaultData.style.textColor,
    },
    metadata: {
      version: apiData.metadata?.version || defaultData.metadata.version,
      lastUpdated: apiData.metadata?.lastUpdated || defaultData.metadata.lastUpdated,
      componentName: apiData.metadata?.componentName || defaultData.metadata.componentName,
    }
  };
};

const stepIcons = [Zap, Target, MessageCircle, Truck, TrendingUp];

export default function Page() {
  const {
    data: animationData,
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
  } = useJsonManagement<SalesEngineVisualData>({
    apiPath: "/api/tegbe-institucional/json/animacao",
    defaultData: defaultSalesEngineVisualData,
    mergeFunction: mergeWithDefaults,
  });

  // Estado local para gerenciar os passos
  const [localSteps, setLocalSteps] = useState<StepItem[]>([]);
  const [draggingStep, setDraggingStep] = useState<number | null>(null);

  const [expandedSections, setExpandedSections] = useState({
    title: true,
    steps: false,
    cta: false,
    timing: false,
    colors: false,
  });

  // Referências para novos itens
  const newStepRef = useRef<HTMLDivElement>(null);

  // Controle de planos
  const currentPlanType = 'pro'; // Altere conforme sua lógica de planos
  const currentPlanLimit = currentPlanType === 'pro' ? 8 : 5;

  // Sincroniza os dados quando carregam do banco
  useEffect(() => {
    if (animationData.steps) {
      setLocalSteps(animationData.steps);
    }
  }, [animationData.steps]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para steps
  const handleAddStep = () => {
    if (localSteps.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: StepItem = {
      title: '',
      label: '',
      description: ''
    };
    
    const updated = [...localSteps, newItem];
    setLocalSteps(updated);
    updateNested('steps', updated);
    
    setTimeout(() => {
      newStepRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updateStep = (index: number, updates: Partial<StepItem>) => {
    const updated = [...localSteps];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      setLocalSteps(updated);
      updateNested('steps', updated);
    }
  };

  const removeStep = (index: number) => {
    const updated = [...localSteps];
    
    if (updated.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyItem: StepItem = {
        title: '',
        label: '',
        description: ''
      };
      setLocalSteps([emptyItem]);
      updateNested('steps', [emptyItem]);
    } else {
      updated.splice(index, 1);
      setLocalSteps(updated);
      updateNested('steps', updated);
    }
  };

  // Funções de drag & drop para steps
  const handleStepDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingStep(index);
  };

  const handleStepDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingStep === null || draggingStep === index) return;
    
    const updated = [...localSteps];
    const draggedItem = updated[draggingStep];
    
    // Remove o item arrastado
    updated.splice(draggingStep, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingStep ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    setLocalSteps(updated);
    updateNested('steps', updated);
    setDraggingStep(index);
  };

  const handleStepDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingStep(null);
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

  // Função para atualizar timing
  const handleTimingChange = (property: keyof AnimationTiming, value: number) => {
    const updatedTiming = { ...animationData.animationTiming, [property]: value };
    updateNested('animationTiming', updatedTiming);
  };

  // Função para atualizar cores (igual ao header)
  const handleColorChange = (property: keyof StyleData, hexColor: string) => {
    const tailwindClass = hexToTailwindClass(property as any, hexColor);
    const updatedStyle = { ...animationData.style, [property]: tailwindClass };
    updateNested('style', updatedStyle);
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
  const isStepValid = (item: StepItem): boolean => {
    return item.title.trim() !== '' && item.label.trim() !== '' && item.description.trim() !== '';
  };

  const isStepsLimitReached = localSteps.length >= currentPlanLimit;
  const canAddNewStep = !isStepsLimitReached;
  const stepsCompleteCount = localSteps.filter(isStepValid).length;
  const stepsTotalCount = localSteps.length;

  const titleCompleteCount = [
    animationData.title.badge.trim() !== '',
    animationData.title.main.trim() !== '',
    animationData.title.highlighted.trim() !== '',
    animationData.subtitle.trim() !== ''
  ].filter(Boolean).length;

  const stepsValidationError = isStepsLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Título (4 campos)
    total += 4;
    completed += titleCompleteCount;

    // Steps (3 campos cada)
    total += localSteps.length * 3;
    localSteps.forEach(step => {
      if (step.title.trim()) completed++;
      if (step.label.trim()) completed++;
      if (step.description.trim()) completed++;
    });

    // CTA (2 campos)
    total += 2;
    if (animationData.cta.text.trim()) completed++;
    if (animationData.cta.link.trim()) completed++;

    // Timing (6 campos)
    total += 6;
    Object.values(animationData.animationTiming).forEach(value => {
      if (value !== undefined && value !== null) completed++;
    });

    // Cores (5 campos)
    total += 5;
    Object.values(animationData.style).forEach(value => {
      if (value?.trim()) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={PlayCircle} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={PlayCircle}
      title="Animação de Engenharia de Conversão"
      description="Configure a animação visual do processo de vendas"
      exists={!!exists}
      itemName="Animação"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Título */}
        <div className="space-y-4">
          <SectionHeader
            title="Texto Principal"
            section="title"
            icon={Text}
            isExpanded={expandedSections.title}
            onToggle={() => toggleSection("title")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.title ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Text className="w-5 h-5" />
                      Cabeçalho da Animação
                    </h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {titleCompleteCount} de 4 campos preenchidos
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Badge (Categoria)"
                      value={animationData.title.badge}
                      onChange={(e) => updateNested('title.badge', e.target.value)}
                      placeholder="Ex: Engenharia de Conversão Tegbe"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />

                    <Input
                      label="Texto Principal"
                      value={animationData.title.main}
                      onChange={(e) => updateNested('title.main', e.target.value)}
                      placeholder="Ex: NÃO É SORTE."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />

                    <div className="md:col-span-2">
                      <Input
                        label="Texto Destacado"
                        value={animationData.title.highlighted}
                        onChange={(e) => updateNested('title.highlighted', e.target.value)}
                        placeholder="Ex: É MÉTODO."
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Input
                        label="Subtítulo"
                        value={animationData.subtitle}
                        onChange={(e) => updateNested('subtitle', e.target.value)}
                        placeholder="Ex: Aplicamos um processo validado que resolve sua operação de ponta a ponta..."
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Passos */}
        <div className="space-y-4">
          <SectionHeader
            title="Passos do Processo"
            section="steps"
            icon={Layers}
            isExpanded={expandedSections.steps}
            onToggle={() => toggleSection("steps")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.steps ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                        Etapas da Animação
                      </h4>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {stepsCompleteCount} de {stepsTotalCount} completos
                        </span>
                        <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          Limite: {currentPlanType === 'pro' ? '8' : '5'} etapas
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        type="button"
                        onClick={handleAddStep}
                        variant="primary"
                        className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                        disabled={!canAddNewStep}
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Etapa
                      </Button>
                      {isStepsLimitReached && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Limite do plano atingido
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    Configure as etapas do processo de conversão que serão animadas.
                  </p>
                </div>

                {/* Mensagem de erro */}
                {stepsValidationError && (
                  <div className={`p-3 rounded-lg ${isStepsLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                    <div className="flex items-start gap-2">
                      {isStepsLimitReached ? (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm ${isStepsLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                        {stepsValidationError}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {localSteps.map((step, index) => {
                    const IconComponent = stepIcons[index % stepIcons.length];
                    return (
                      <div 
                        key={`step-${index}`}
                        ref={index === localSteps.length - 1 ? newStepRef : undefined}
                        draggable
                        onDragStart={(e) => handleStepDragStart(e, index)}
                        onDragOver={(e) => handleStepDragOver(e, index)}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragEnd={handleStepDragEnd}
                        onDrop={handleDrop}
                        className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                          draggingStep === index 
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
                              onDragStart={(e) => handleStepDragStart(e, index)}
                            >
                              <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                            </div>
                            
                            {/* Ícone da etapa */}
                            <div className="flex flex-col items-center">
                              <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                                {IconComponent && <IconComponent className="w-6 h-6 text-[var(--color-primary)]" />}
                              </div>
                              <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-4">
                                <h4 className="font-medium text-[var(--color-secondary)]">
                                  {step.title || "Etapa sem título"}
                                </h4>
                                {step.title && step.label && step.description ? (
                                  <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                    Completo
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                    Incompleto
                                  </span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Título da Etapa
                                  </label>
                                  <Input
                                    value={step.title}
                                    onChange={(e) => updateStep(index, { title: e.target.value })}
                                    placeholder="Ex: Atração"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Rótulo
                                  </label>
                                  <Input
                                    value={step.label}
                                    onChange={(e) => updateStep(index, { label: e.target.value })}
                                    placeholder="Ex: Anúncios Magnéticos"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>

                                <div className="lg:col-span-2 space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Descrição
                                  </label>
                                  <textarea
                                    value={step.description}
                                    onChange={(e) => updateStep(index, { description: e.target.value })}
                                    placeholder="Ex: Criamos anúncios que capturam atenção imediata e geram desejo."
                                    className="w-full min-h-[80px] p-3 bg-[var(--color-background-body)] border border-[var(--color-border)] rounded-md text-[var(--color-secondary)] placeholder:text-[var(--color-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button
                              type="button"
                              onClick={() => removeStep(index)}
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
                  })}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção CTA */}
        <div className="space-y-4">
          <SectionHeader
            title="Call to Action"
            section="cta"
            icon={MessageCircle}
            isExpanded={expandedSections.cta}
            onToggle={() => toggleSection("cta")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.cta ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                    Botão de Ação
                  </h4>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    Configure o botão final da animação que leva para o WhatsApp.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Texto do Botão"
                    value={animationData.cta.text}
                    onChange={(e) => updateNested('cta.text', e.target.value)}
                    placeholder="Ex: Quero Vender Assim"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Link do WhatsApp"
                    value={animationData.cta.link}
                    onChange={(e) => updateNested('cta.link', e.target.value)}
                    placeholder="Ex: https://api.whatsapp.com/send?phone=..."
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Timing */}
        <div className="space-y-4">
          <SectionHeader
            title="Timing da Animação"
            section="timing"
            icon={Timer}
            isExpanded={expandedSections.timing}
            onToggle={() => toggleSection("timing")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.timing ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                    Duração das Animações
                  </h4>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    Configure a duração de cada fase da animação em segundos.
                  </p>
                </div>

                <div className="space-y-8">
                  {Object.entries(animationData.animationTiming).map(([key, value]) => (
                    <div key={key} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-[var(--color-secondary)] capitalize">
                          {key === 'attraction' && 'Atração'}
                          {key === 'interest' && 'Interesse'}
                          {key === 'conversion' && 'Conversão'}
                          {key === 'logistics' && 'Logística'}
                          {key === 'scale' && 'Escala'}
                          {key === 'pauses' && 'Pausas'}
                        </label>
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {value}s
                        </span>
                      </div>
                      <div className="relative pt-1">
                        <input
                          type="range"
                          value={value}
                          onChange={(e) => handleTimingChange(key as keyof AnimationTiming, parseFloat(e.target.value))}
                          min="0.1"
                          max="5"
                          step="0.1"
                          className="w-full h-2 bg-[var(--color-background-body)] rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Cores */}
        <div className="space-y-4">
          <SectionHeader
            title="Cores da Animação"
            section="colors"
            icon={Palette}
            isExpanded={expandedSections.colors}
            onToggle={() => toggleSection("colors")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.colors ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                    Paleta de Cores
                  </h4>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    Defina as cores que serão usadas na animação.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ThemePropertyInput
                    property="primaryColor"
                    label="Cor Primária"
                    description="Cor principal para elementos destacados"
                    currentHex={extractHexFromTailwind(animationData.style.primaryColor)}
                    tailwindClass={animationData.style.primaryColor}
                    onThemeChange={(prop, hex) => handleColorChange(prop as keyof StyleData, hex)}
                  />

                  <ThemePropertyInput
                    property="secondaryColor"
                    label="Cor Secundária"
                    description="Cor para elementos secundários"
                    currentHex={extractHexFromTailwind(animationData.style.secondaryColor)}
                    tailwindClass={animationData.style.secondaryColor}
                    onThemeChange={(prop, hex) => handleColorChange(prop as keyof StyleData, hex)}
                  />

                  <ThemePropertyInput
                    property="successColor"
                    label="Cor de Sucesso"
                    description="Cor para indicar sucesso e progresso"
                    currentHex={extractHexFromTailwind(animationData.style.successColor)}
                    tailwindClass={animationData.style.successColor}
                    onThemeChange={(prop, hex) => handleColorChange(prop as keyof StyleData, hex)}
                  />

                  <ThemePropertyInput
                    property="backgroundColor"
                    label="Cor de Fundo"
                    description="Cor de fundo da animação"
                    currentHex={extractHexFromTailwind(animationData.style.backgroundColor)}
                    tailwindClass={animationData.style.backgroundColor}
                    onThemeChange={(prop, hex) => handleColorChange(prop as keyof StyleData, hex)}
                  />

                  <ThemePropertyInput
                    property="textColor"
                    label="Cor do Texto"
                    description="Cor principal para textos"
                    currentHex={extractHexFromTailwind(animationData.style.textColor)}
                    tailwindClass={animationData.style.textColor}
                    onThemeChange={(prop, hex) => handleColorChange(prop as keyof StyleData, hex)}
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
          itemName="Animação"
          icon={PlayCircle}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração da Animação"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}