/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { 
  BarChart,
  TrendingUp,
  Tag,
  Type,
  Plus,
  Trash2,
  Settings,
  CheckCircle2,
  GripVertical,
  AlertCircle,
  XCircle,
  Target,
  Shield,
  Zap,
  Users,
  RefreshCw,
  Columns as ColumnsIcon,
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";

interface Feature {
  label: string;
  competitor: string;
  us: string;
}

interface Columns {
  competitor: string;
  us: string;
}

interface Header {
  badge: string;
  title: string;
  subtitle: string;
}

interface BenchmarkData {
  id: string;
  type: string;
  subtitle: string;
  header: Header;
  columns: Columns;
  features: Feature[];
}

const defaultBenchmarkData: BenchmarkData = {
  id: "benchmark-comparison",
  type: "",
  subtitle: "",
  header: {
    badge: "Benchmarking de Mercado",
    title: "A diferença é óbvia.",
    subtitle: "Compare a profundidade da entrega. Não é sobre quantidade de aulas, é sobre a utilidade do que é ensinado."
  },
  columns: {
    competitor: "Cursos Tradicionais",
    us: "Ecossistema TegPro"
  },
  features: [
    {
      label: "Origem do Método",
      competitor: "Teoria e Livros",
      us: "Campo de Batalha (R$ 45M+ Gerados)"
    },
    {
      label: "Foco do Conteúdo",
      competitor: "Gatilhos Mentais Genéricos",
      us: "Processos Operacionais de Escala"
    },
    {
      label: "Ferramentas Entregues",
      competitor: "Nenhuma (Apenas PDF)",
      us: "Templates de CRM, Scripts e Dashboards"
    },
    {
      label: "Suporte",
      competitor: "E-mail ou Ticket",
      us: "Comunidade Ativa no WhatsApp"
    },
    {
      label: "Atualização",
      competitor: "Anual (Se houver)",
      us: "Mensal (Baseado no que validamos na agência)"
    }
  ]
};

const mergeWithDefaults = (apiData: any, defaultData: BenchmarkData): BenchmarkData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id || defaultData.id,
    type: apiData.type || defaultData.type,
    subtitle: apiData.subtitle || defaultData.subtitle,
    header: apiData.header || defaultData.header,
    columns: apiData.columns || defaultData.columns,
    features: apiData.features || defaultData.features,
  };
};

const getFeatureIcon = (index: number) => {
  switch (index % 5) {
    case 0: return Target;     // Origem do Método
    case 1: return Zap;        // Foco do Conteúdo
    case 2: return Shield;     // Ferramentas Entregues
    case 3: return Users;      // Suporte
    case 4: return RefreshCw;  // Atualização
    default: return TrendingUp;
  }
};

export default function BenchmarkPage() {
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
  } = useJsonManagement<BenchmarkData>({
    apiPath: "/api/tegbe-institucional/json/concorrentes",
    defaultData: defaultBenchmarkData,
    mergeFunction: mergeWithDefaults,
  });

  // Estados para drag & drop
  const [draggingItem, setDraggingItem] = useState<number | null>(null);

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    header: false,
    columns: false,
    features: false
  });

  // Referência para novo item
  const newFeatureRef = useRef<HTMLDivElement>(null);

  // Controle de planos
  const currentPlanType = 'pro';
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para features
  const handleAddFeature = () => {
    const features = pageData.features;
    if (features.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: Feature = {
      label: "",
      competitor: "",
      us: ""
    };
    
    const updated = [...features, newItem];
    updateNested('features', updated);
    
    setTimeout(() => {
      newFeatureRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const handleUpdateFeature = (index: number, updates: Partial<Feature>) => {
    const features = pageData.features;
    const updated = [...features];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      updateNested('features', updated);
    }
  };

  const handleRemoveFeature = (index: number) => {
    const features = pageData.features;
    
    if (features.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyItem: Feature = {
        label: "",
        competitor: "",
        us: ""
      };
      updateNested('features', [emptyItem]);
    } else {
      const updated = features.filter((_, i) => i !== index);
      updateNested('features', updated);
    }
  };

  // Funções de drag & drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingItem === null || draggingItem === index) return;
    
    const features = pageData.features;
    const updated = [...features];
    const draggedItem = updated[draggingItem];
    
    // Remove o item arrastado
    updated.splice(draggingItem, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingItem ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    updateNested('features', updated);
    setDraggingItem(index);
  };

  const handleDragEnd = (e: React.DragEvent) => {
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

  // Função para mover item para cima/baixo
  const moveItem = (fromIndex: number, toIndex: number) => {
    const features = [...pageData.features];
    const [item] = features.splice(fromIndex, 1);
    features.splice(toIndex, 0, item);
    updateNested('features', features);
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
  const isFeatureValid = (item: Feature): boolean => {
    return item.label.trim() !== '' && 
           item.competitor.trim() !== '' && 
           item.us.trim() !== '';
  };

  const features = pageData.features;
  
  const isFeaturesLimitReached = features.length >= currentPlanLimit;
  const canAddNewFeature = !isFeaturesLimitReached;
  const featuresCompleteCount = features.filter(isFeatureValid).length;
  const featuresTotalCount = features.length;

  const featuresValidationError = isFeaturesLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Informações básicas
    total += 2; // type e subtitle
    if (pageData.type.trim()) completed++;
    if (pageData.subtitle.trim()) completed++;

    // Header
    total += 3;
    if (pageData.header.badge.trim()) completed++;
    if (pageData.header.title.trim()) completed++;
    if (pageData.header.subtitle.trim()) completed++;

    // Columns
    total += 2;
    if (pageData.columns.competitor.trim()) completed++;
    if (pageData.columns.us.trim()) completed++;

    // Features
    total += features.length * 3;
    features.forEach(item => {
      if (item.label.trim()) completed++;
      if (item.competitor.trim()) completed++;
      if (item.us.trim()) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={BarChart} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={BarChart}
      title="Benchmarking de Mercado"
      description="Gerencie a tabela de comparação entre a TegPro e cursos tradicionais"
      exists={!!exists}
      itemName="Benchmark"
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
                    placeholder="Tipo de conteúdo"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Subtítulo Geral"
                    value={pageData.subtitle}
                    onChange={(e) => updateNested('subtitle', e.target.value)}
                    placeholder="Subtítulo geral da seção"
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
            icon={Tag}
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
                      Badge
                    </label>
                    <Input
                      value={pageData.header.badge}
                      onChange={(e) => updateNested('header.badge', e.target.value)}
                      placeholder="Benchmarking de Mercado"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Título
                    </label>
                    <Input
                      value={pageData.header.title}
                      onChange={(e) => updateNested('header.title', e.target.value)}
                      placeholder="A diferença é óbvia."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Subtítulo
                  </label>
                  <TextArea
                    value={pageData.header.subtitle}
                    onChange={(e) => updateNested('header.subtitle', e.target.value)}
                    placeholder="Compare a profundidade da entrega. Não é sobre quantidade de aulas, é sobre a utilidade do que é ensinado."
                    rows={3}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Colunas */}
        <div className="space-y-4">
          <SectionHeader
            title="Colunas da Comparação"
            section="columns"
            icon={ColumnsIcon}
            isExpanded={expandedSections.columns}
            onToggle={() => toggleSection("columns")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.columns ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Título da Coluna Concorrente
                    </label>
                    <Input
                      value={pageData.columns.competitor}
                      onChange={(e) => updateNested('columns.competitor', e.target.value)}
                      placeholder="Cursos Tradicionais"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70">
                      Título da coluna da esquerda (geralmente negativo)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Título da Coluna TegPro
                    </label>
                    <Input
                      value={pageData.columns.us}
                      onChange={(e) => updateNested('columns.us', e.target.value)}
                      placeholder="Ecossistema TegPro"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70">
                      Título da coluna da direita (geralmente positivo)
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Features */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <SectionHeader
              title={`Características de Comparação (${features.length} itens)`}
              section="features"
              icon={TrendingUp}
              isExpanded={expandedSections.features}
              onToggle={() => toggleSection("features")}
            />
            <Button
              type="button"
              onClick={handleAddFeature}
              variant="primary"
              className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
              disabled={!canAddNewFeature}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Item
            </Button>
          </div>

          <motion.div
            initial={false}
            animate={{ height: expandedSections.features ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Itens de Comparação
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {featuresCompleteCount} de {featuresTotalCount} completos
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        Limite: {currentPlanType === 'pro' ? '10' : '5'} itens
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[var(--color-secondary)]/70 mt-2">
                  Configure os pontos de comparação entre a TegPro e a concorrência
                </p>
              </div>

              {/* Mensagem de erro de validação */}
              {featuresValidationError && (
                <div className={`p-3 rounded-lg mb-4 ${
                  isFeaturesLimitReached 
                    ? 'bg-red-900/20 border border-red-800' 
                    : 'bg-yellow-900/20 border border-yellow-800'
                }`}>
                  <div className="flex items-start gap-2">
                    {isFeaturesLimitReached ? (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${
                      isFeaturesLimitReached ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {featuresValidationError}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {features.map((feature, index) => {
                  const FeatureIcon = getFeatureIcon(index);
                  const isDragging = draggingItem === index;
                  const itemId = `feature-${index}`;
                  
                  return (
                    <div 
                      key={itemId}
                      ref={index === features.length - 1 ? newFeatureRef : undefined}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragEnd={handleDragEnd}
                      onDrop={handleDrop}
                      className={`p-6 border rounded-lg space-y-6 transition-all duration-200 ${
                        isDragging
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 opacity-70' 
                          : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Handle para drag & drop */}
                          <div 
                            className="cursor-grab active:cursor-grabbing p-2 hover:bg-[var(--color-background)]/50 rounded transition-colors flex flex-col items-center"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                          >
                            <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                            
                            {/* Controles de ordenação */}
                            <div className="flex flex-col gap-1 mt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (index > 0) {
                                    moveItem(index, index - 1);
                                  }
                                }}
                                disabled={index === 0}
                                className={`p-1 rounded ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--color-border)]'}`}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (index < features.length - 1) {
                                    moveItem(index, index + 1);
                                  }
                                }}
                                disabled={index === features.length - 1}
                                className={`p-1 rounded ${index === features.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--color-border)]'}`}
                              >
                                ↓
                              </button>
                            </div>
                          </div>
                          
                          {/* Indicador de posição */}
                          <div className="flex flex-col items-center">
                            <div className="p-2 rounded bg-[var(--color-primary)]/10">
                              <FeatureIcon className="w-5 h-5 text-[var(--color-primary)]" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <h4 className="font-medium text-[var(--color-secondary)]">
                                {feature.label || "Novo Item de Comparação"}
                              </h4>
                              {isFeatureValid(feature) ? (
                                <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                  Completo
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                  Incompleto
                                </span>
                              )}
                              <span className="px-2 py-1 text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full">
                                Posição {index + 1} de {features.length}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Coluna 1: Rótulo */}
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Rótulo da Característica
                                  </label>
                                  <Input
                                    value={feature.label}
                                    onChange={(e) => handleUpdateFeature(index, { label: e.target.value })}
                                    placeholder="Ex: Origem do Método"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                              </div>
                              
                              {/* Coluna 2: Competidor */}
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    {pageData.columns.competitor}
                                  </label>
                                  <TextArea
                                    value={feature.competitor}
                                    onChange={(e) => handleUpdateFeature(index, { competitor: e.target.value })}
                                    placeholder="Ex: Teoria e Livros"
                                    rows={4}
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] border-red-300 focus:border-red-500"
                                  />
                                </div>
                              </div>
                              
                              {/* Coluna 3: TegPro */}
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    {pageData.columns.us}
                                  </label>
                                  <TextArea
                                    value={feature.us}
                                    onChange={(e) => handleUpdateFeature(index, { us: e.target.value })}
                                    placeholder="Ex: Campo de Batalha (R$ 45M+ Gerados)"
                                    rows={4}
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] border-green-300 focus:border-green-500"
                                  />
                                </div>
                                
                                <div className="pt-4">
                                  <Button
                                    type="button"
                                    onClick={() => handleRemoveFeature(index)}
                                    variant="danger"
                                    className="w-full bg-red-600 hover:bg-red-700 border-none flex items-center justify-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Remover Item
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {features.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-background-body)] mb-4">
                    <TrendingUp className="w-8 h-8 text-[var(--color-secondary)]/50" />
                  </div>
                  <h4 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                    Nenhum item de comparação definido
                  </h4>
                  <p className="text-sm text-[var(--color-secondary)]/70 mb-6">
                    Comece adicionando características para comparar a TegPro com a concorrência
                  </p>
                  <Button
                    type="button"
                    onClick={handleAddFeature}
                    variant="primary"
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Primeiro Item
                  </Button>
                </div>
              )}
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
          itemName="Benchmark"
          icon={BarChart}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Benchmark"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}