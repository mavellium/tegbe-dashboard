/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import { 
  BarChart3, 
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Search,
  Layers,
  Target,
  Type,
  Percent,
  Info
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import IconSelector from "@/components/IconSelector";
import ColorPicker from "@/components/ColorPicker";
import { normalizeHexColor, extractHexFromTailwind } from "@/lib/colors";
import Loading from "@/components/Loading";

interface MetricItem {
  id?: string;
  icon: string;
  color: string; // Armazenado como hex
  label: string;
  value: string;
  suffix: string;
  description: string;
}

interface StatsData {
  id?: string;
  header: {
    badge: string;
    title: string;
    titleHighlight: string;
    updatedAt: string;
  };
  footer: {
    info: string;
    precision: string;
    source: string;
  };
  metrics: MetricItem[];
}

const defaultStatsData: StatsData = {
  header: {
    badge: "Auditoria de Resultados",
    title: "Números que superam",
    titleHighlight: "qualquer argumento.",
    updatedAt: "Janeiro 2026"
  },
  footer: {
    info: "Dados auditados internamente via GA4 e Dashboards.",
    precision: "Precisão: 99.8%",
    source: "Fonte: Base Tegbe"
  },
  metrics: [
    {
      id: "metricas-0",
      icon: "mdi:cash",
      color: "#16A34A", // text-green-600 em hex
      label: "Faturamento Gerado",
      value: "45",
      suffix: "Mi",
      description: "Receita direta atribuída às nossas campanhas nos últimos 12 meses."
    },
    {
      id: "metricas-1",
      icon: "mdi:chart-line",
      color: "#F59E0B", // text-amber-500 em hex
      label: "Média de Crescimento",
      value: "120",
      suffix: "%",
      description: "Aumento médio de receita dos clientes no primeiro trimestre."
    }
  ]
};

const mergeWithDefaults = (apiData: any, defaultData: StatsData): StatsData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id,
    header: {
      badge: apiData.header?.badge || defaultData.header.badge,
      title: apiData.header?.title || defaultData.header.title,
      titleHighlight: apiData.header?.titleHighlight || defaultData.header.titleHighlight,
      updatedAt: apiData.header?.updatedAt || defaultData.header.updatedAt,
    },
    footer: {
      info: apiData.footer?.info || defaultData.footer.info,
      precision: apiData.footer?.precision || defaultData.footer.precision,
      source: apiData.footer?.source || defaultData.footer.source,
    },
    metrics: apiData.metrics?.map((metric: any, index: number) => ({
      id: metric.id || `metricas-${index}`,
      icon: metric.icon || "",
      color: extractHexFromTailwind(metric.color || defaultData.metrics[0].color),
      label: metric.label || `Métrica ${index + 1}`,
      value: metric.value || "",
      suffix: metric.suffix || "",
      description: metric.description || "",
    })) || defaultData.metrics
  };
};

export default function StatsPage() {
  const {
    data: statsData,
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
  } = useJsonManagement<StatsData>({
    apiPath: "/api/tegbe-institucional/json/metricas-sobre",
    defaultData: defaultStatsData,
    mergeFunction: mergeWithDefaults,
  });

  // Estado local para gerenciar as métricas
  const [localMetrics, setLocalMetrics] = useState<MetricItem[]>([]);
  const [draggingMetric, setDraggingMetric] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    header: true,
    metrics: false,
    footer: false,
  });

  // Referências para novos itens
  const newMetricRef = useRef<HTMLDivElement>(null);

  // Controle de planos
  const currentPlanType = 'pro'; // Altere conforme sua lógica de planos
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  // Sincroniza os dados quando carregam do banco
  useEffect(() => {
    if (statsData.metrics) {
      setLocalMetrics(statsData.metrics);
    }
  }, [statsData.metrics]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para métricas
  const handleAddMetric = () => {
    if (localMetrics.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: MetricItem = {
      id: `metricas-${Date.now()}`,
      icon: '',
      color: '#0071E3',
      label: '',
      value: '',
      suffix: '',
      description: ''
    };
    
    const updated = [...localMetrics, newItem];
    setLocalMetrics(updated);
    updateNested('metrics', updated);
    
    setTimeout(() => {
      newMetricRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updateMetric = (index: number, updates: Partial<MetricItem>) => {
    const updated = [...localMetrics];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      setLocalMetrics(updated);
      updateNested('metrics', updated);
    }
  };

  const removeMetric = (index: number) => {
    const updated = [...localMetrics];
    
    if (updated.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyItem: MetricItem = {
        id: `metricas-${Date.now()}`,
        icon: '',
        color: '#0071E3',
        label: '',
        value: '',
        suffix: '',
        description: ''
      };
      setLocalMetrics([emptyItem]);
      updateNested('metrics', [emptyItem]);
    } else {
      updated.splice(index, 1);
      setLocalMetrics(updated);
      updateNested('metrics', updated);
    }
  };

  // Funções de drag & drop para métricas
  const handleMetricDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingMetric(index);
  };

  const handleMetricDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingMetric === null || draggingMetric === index) return;
    
    const updated = [...localMetrics];
    const draggedItem = updated[draggingMetric];
    
    // Remove o item arrastado
    updated.splice(draggingMetric, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingMetric ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    setLocalMetrics(updated);
    updateNested('metrics', updated);
    setDraggingMetric(index);
  };

  const handleMetricDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingMetric(null);
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

  // Função para atualizar cores das métricas
  const handleMetricColorChange = (index: number, hexColor: string) => {
    const normalizedHex = normalizeHexColor(hexColor);
    updateMetric(index, { color: normalizedHex });
  };

  // Função para salvar
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      // Converte cores hex para Tailwind antes de salvar
      const metricsWithTailwind = localMetrics.map(metric => ({
        ...metric,
        color: `text-[${metric.color.replace('#', '')}]`
      }));
      
      // Atualiza temporariamente os dados com Tailwind
      updateNested('metrics', metricsWithTailwind);
      
      await save();
      
      // Reverte para hex após salvar (para continuar mostrando hex na UI)
      const metricsWithHex = localMetrics.map(metric => ({
        ...metric,
        color: normalizeHexColor(metric.color)
      }));
      
      updateNested('metrics', metricsWithHex);
      
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Validações
  const isMetricValid = (item: MetricItem): boolean => {
    return item.value.trim() !== '' && 
           item.suffix.trim() !== '' && 
           item.label.trim() !== '' && 
           item.description.trim() !== '' &&
           item.icon.trim() !== '' &&
           item.color.trim() !== '';
  };

  const isMetricsLimitReached = localMetrics.length >= currentPlanLimit;
  const canAddNewMetric = !isMetricsLimitReached;
  const metricsCompleteCount = localMetrics.filter(isMetricValid).length;
  const metricsTotalCount = localMetrics.length;

  const headerCompleteCount = [
    statsData.header.badge.trim() !== '',
    statsData.header.title.trim() !== '',
    statsData.header.titleHighlight.trim() !== '',
    statsData.header.updatedAt.trim() !== ''
  ].filter(Boolean).length;

  const footerCompleteCount = [
    statsData.footer.info.trim() !== '',
    statsData.footer.precision.trim() !== '',
    statsData.footer.source.trim() !== ''
  ].filter(Boolean).length;

  const metricsValidationError = isMetricsLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  // Filtro de busca
  const filteredMetrics = useMemo(() => {
    if (!searchTerm.trim()) return localMetrics;
    
    const term = searchTerm.toLowerCase();
    return localMetrics.filter(metric => 
      metric.label.toLowerCase().includes(term) ||
      metric.description.toLowerCase().includes(term) ||
      metric.value.toLowerCase().includes(term) ||
      metric.suffix.toLowerCase().includes(term) ||
      metric.icon.toLowerCase().includes(term)
    );
  }, [localMetrics, searchTerm]);

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Header (4 campos)
    total += 4;
    completed += headerCompleteCount;

    // Footer (3 campos)
    total += 3;
    completed += footerCompleteCount;

    // Metrics (6 campos cada)
    total += localMetrics.length * 6;
    localMetrics.forEach(metric => {
      if (metric.icon.trim()) completed++;
      if (metric.color.trim()) completed++;
      if (metric.label.trim()) completed++;
      if (metric.value.trim()) completed++;
      if (metric.suffix.trim()) completed++;
      if (metric.description.trim()) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={BarChart3} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={BarChart3}
      title="Métricas"
      description="Gerencie as métricas e números que mostram o impacto da sua empresa"
      exists={!!exists}
      itemName="Métricas"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho da Seção"
            section="header"
            icon={Layers}
            isExpanded={expandedSections.header}
            onToggle={() => toggleSection("header")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.header ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      Informações do Cabeçalho
                    </h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {headerCompleteCount} de 4 campos preenchidos
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Badge"
                      value={statsData.header.badge}
                      onChange={(e) => updateNested('header.badge', e.target.value)}
                      placeholder="Ex: Auditoria de Resultados"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />

                    <Input
                      label="Título Principal"
                      value={statsData.header.title}
                      onChange={(e) => updateNested('header.title', e.target.value)}
                      placeholder="Ex: Números que superam"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] text-lg font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Título em Destaque"
                      value={statsData.header.titleHighlight}
                      onChange={(e) => updateNested('header.titleHighlight', e.target.value)}
                      placeholder="Ex: qualquer argumento."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />

                    <Input
                      label="Data de Atualização"
                      value={statsData.header.updatedAt}
                      onChange={(e) => updateNested('header.updatedAt', e.target.value)}
                      placeholder="Ex: Janeiro 2026"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Métricas */}
        <div className="space-y-4">
          <SectionHeader
            title="Lista de Métricas"
            section="metrics"
            icon={BarChart3}
            isExpanded={expandedSections.metrics}
            onToggle={() => toggleSection("metrics")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.metrics ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                        Métricas de Resultados
                      </h4>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {metricsCompleteCount} de {metricsTotalCount} completos
                        </span>
                        <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          Limite: {currentPlanType === 'pro' ? '10' : '5'} métricas
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        type="button"
                        onClick={handleAddMetric}
                        variant="primary"
                        className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                        disabled={!canAddNewMetric}
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Métrica
                      </Button>
                      {isMetricsLimitReached && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Limite do plano atingido
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Barra de busca */}
                  <div className="mt-4 space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Buscar Métricas
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]/70" />
                      <Input
                        type="text"
                        placeholder="Buscar métricas por título, valor, descrição ou ícone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Mensagem de erro */}
                {metricsValidationError && (
                  <div className={`p-3 rounded-lg ${isMetricsLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                    <div className="flex items-start gap-2">
                      {isMetricsLimitReached ? (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm ${isMetricsLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                        {metricsValidationError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Lista de Métricas */}
                {filteredMetrics.length === 0 ? (
                  <Card className="p-8 bg-[var(--color-background)]">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                        {searchTerm ? 'Nenhuma métrica encontrada' : 'Nenhuma métrica adicionada'}
                      </h3>
                      <p className="text-sm text-[var(--color-secondary)]/70">
                        {searchTerm ? 'Tente ajustar sua busca ou limpe o filtro' : 'Adicione sua primeira métrica usando o botão acima'}
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredMetrics.map((metric, index) => {
                      const normalizedColor = normalizeHexColor(metric.color);
                      
                      return (
                        <div 
                          key={metric.id || index}
                          ref={index === localMetrics.length - 1 && metric.label === '' && metric.value === '' ? newMetricRef : undefined}
                          draggable
                          onDragStart={(e) => handleMetricDragStart(e, index)}
                          onDragOver={(e) => handleMetricDragOver(e, index)}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragEnd={handleMetricDragEnd}
                          onDrop={handleDrop}
                          className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                            draggingMetric === index 
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                              : 'hover:border-[var(--color-primary)]/50'
                          }`}
                          style={{ borderLeftColor: normalizedColor || '#0071E3', borderLeftWidth: '4px' }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              {/* Handle para drag & drop */}
                              <div 
                                className="cursor-grab active:cursor-grabbing p-2 hover:bg-[var(--color-background)]/50 rounded transition-colors"
                                draggable
                                onDragStart={(e) => handleMetricDragStart(e, index)}
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
                                  <h4 className="font-medium text-[var(--color-secondary)]">
                                    {metric.label || "Métrica sem título"}
                                  </h4>
                                  {metric.value && metric.suffix && metric.label && metric.description && metric.icon && metric.color ? (
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
                                  <div className="space-y-6">
                                    <div>
                                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                                        <Target className="w-4 h-4" />
                                        Ícone da Métrica
                                      </label>
                                      <IconSelector
                                        value={metric.icon}
                                        onChange={(value: string) => updateMetric(index, { icon: value })}
                                        label="Selecione um ícone para a métrica"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                                        Cor da Métrica
                                      </label>
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                          <Input
                                            type="text"
                                            value={metric.color}
                                            onChange={(e) => {
                                              const hex = normalizeHexColor(e.target.value);
                                              updateMetric(index, { color: hex });
                                            }}
                                            placeholder="Ex: #0071E3"
                                            className="flex-1 font-mono bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                          />
                                          <ColorPicker
                                            color={normalizedColor}
                                            onChange={(hex: string) => handleMetricColorChange(index, hex)}
                                          />
                                        </div>
                                        <p className="text-xs text-[var(--color-secondary)]/70">
                                          Use código HEX (#0071E3)
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="lg:col-span-2 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-2">
                                        <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                          Valor Numérico
                                        </label>
                                        <Input
                                          type="text"
                                          value={metric.value}
                                          onChange={(e) => updateMetric(index, { value: e.target.value })}
                                          placeholder="Ex: 45, 120, 15.5, 98.7"
                                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                        />
                                        <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                                          Use números com ou sem decimais
                                        </p>
                                      </div>

                                      <div className="space-y-2">
                                        <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                                          <Percent className="w-4 h-4" />
                                          Sufixo
                                        </label>
                                        <Input
                                          type="text"
                                          value={metric.suffix}
                                          onChange={(e) => updateMetric(index, { suffix: e.target.value })}
                                          placeholder="Ex: M+, %, Mi"
                                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                        />
                                        <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                                          Ex: M+ (milhões), % (porcentagem), Mi (milhões)
                                        </p>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                                        <Type className="w-4 h-4" />
                                        Título da Métrica
                                      </label>
                                      <Input
                                        type="text"
                                        value={metric.label}
                                        onChange={(e) => updateMetric(index, { label: e.target.value })}
                                        placeholder="Ex: Faturamento Gerado, Média de Crescimento"
                                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <TextArea
                                        label="Descrição Detalhada"
                                        placeholder="Ex: Receita direta atribuída às nossas campanhas nos últimos 12 meses."
                                        value={metric.description}
                                        onChange={(e) => updateMetric(index, { description: e.target.value })}
                                        rows={4}
                                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                      />
                                      <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                                        Explique o significado e contexto da métrica
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <Button
                                type="button"
                                onClick={() => removeMetric(index)}
                                variant="danger"
                                className="whitespace-nowrap bg-red-600 hover:bg-red-700 border-none flex items-center gap-2"
                                disabled={localMetrics.length <= 1}
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
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Footer */}
        <div className="space-y-4">
          <SectionHeader
            title="Rodapé da Seção"
            section="footer"
            icon={Layers}
            isExpanded={expandedSections.footer}
            onToggle={() => toggleSection("footer")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.footer ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      Informações do Rodapé
                    </h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {footerCompleteCount} de 3 campos preenchidos
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Informação de Auditoria
                      </label>
                      <Input
                        value={statsData.footer.info}
                        onChange={(e) => updateNested('footer.info', e.target.value)}
                        placeholder="Ex: Dados auditados internamente via GA4 e Dashboards."
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Precisão"
                        value={statsData.footer.precision}
                        onChange={(e) => updateNested('footer.precision', e.target.value)}
                        placeholder="Ex: Precisão: 99.8%"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />

                      <Input
                        label="Fonte dos Dados"
                        value={statsData.footer.source}
                        onChange={(e) => updateNested('footer.source', e.target.value)}
                        placeholder="Ex: Fonte: Base Tegbe"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          onAddNew={handleAddMetric}
          isAddDisabled={!canAddNewMetric}
          isSaving={loading}
          exists={!!exists}
          totalCount={completion.total}
          itemName="Métricas"
          icon={BarChart3}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração das Métricas"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}