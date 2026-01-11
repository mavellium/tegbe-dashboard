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
  GraduationCap,
  Award,
  Type,
  Settings,
  CheckCircle,
  Sparkles,
  Bold,
  Highlighter,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ListChecks,
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
import { useSite } from "@/context/site-context";

interface Headline {
  prefix: string;
  highlight: string;
  suffix: string;
}

interface Paragraph {
  text: string;
  bold?: string;
  highlight?: string;
}

interface Description {
  paragraph1: Paragraph;
  paragraph2: Paragraph;
}

interface Feature {
  id: string;
  label: string;
  icon: string;
}

interface WhyLearnData {
  badge: string;
  headline: Headline;
  description: Description;
  features: Feature[];
}

const defaultWhyLearnData: WhyLearnData = {
  badge: "Vivência de Campo",
  headline: {
    prefix: "Por que aprender com a",
    highlight: "Tegbe",
    suffix: "e não com um \"guru\"?"
  },
  description: {
    paragraph1: {
      text: "O mercado está cheio de professores que nunca venderam nada. A Tegbe é, antes de tudo, uma",
      bold: "operação de vendas ativa"
    },
    paragraph2: {
      text: "Não ensinamos teorias de livros antigos. Nós abrimos a caixa-preta das estratégias que geram milhões todos os meses para nossos clientes de assessoria.",
      highlight: "Você aprende o que nós aplicamos hoje."
    }
  },
  features: [
    { id: "feature-01", label: "Método Validado", icon: "ph:check-circle-fill" },
    { id: "feature-02", label: "Foco em ROI", icon: "ph:chart-line-up-bold" },
    { id: "feature-03", label: "Comunidade Ativa", icon: "ph:users-three-fill" }
  ]
};

const mergeWithDefaults = (apiData: any, defaultData: WhyLearnData): WhyLearnData => {
  if (!apiData) return defaultData;
  
  return {
    badge: apiData.badge || defaultData.badge,
    headline: apiData.headline || defaultData.headline,
    description: apiData.description || defaultData.description,
    features: apiData.features || defaultData.features,
  };
};

export default function WhyLearnPage() {
  const { currentSite } = useSite();
  const currentPlanType = currentSite.planType;
  const currentFeatureLimit = currentPlanType === 'pro' ? 10 : 5;

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
  } = useJsonManagement<WhyLearnData>({
    apiPath: "/api/tegbe-institucional/json/porque-aprender",
    defaultData: defaultWhyLearnData,
    mergeFunction: mergeWithDefaults,
  });

  // Estados para drag & drop
  const [draggingFeature, setDraggingFeature] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    badge: true,
    headline: false,
    description: false,
    features: false,
  });

  // Referência para novo item
  const newFeatureRef = useRef<HTMLDivElement>(null);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para manipular a lista de features
  const handleAddFeature = () => {
    const features = pageData.features;
    if (features.length >= currentFeatureLimit) {
      return false;
    }
    
    const newId = `feature-${Date.now()}`;
    const newFeature: Feature = {
      id: newId,
      label: "",
      icon: "ph:check-circle-fill"
    };
    
    const updated = [...features, newFeature];
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
      // Mantém pelo menos um feature vazio
      const emptyFeature: Feature = {
        id: "feature-01",
        label: "",
        icon: "ph:check-circle-fill"
      };
      updateNested('features', [emptyFeature]);
    } else {
      const updated = features.filter((_, i) => i !== index);
      updateNested('features', updated);
    }
  };

  // Funções de drag & drop para features
  const handleFeatureDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingFeature(index);
  };

  const handleFeatureDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingFeature === null || draggingFeature === index) return;
    
    const features = pageData.features;
    const updated = [...features];
    const draggedFeature = updated[draggingFeature];
    
    // Remove o item arrastado
    updated.splice(draggingFeature, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingFeature ? index : index;
    updated.splice(newIndex, 0, draggedFeature);
    
    updateNested('features', updated);
    setDraggingFeature(index);
  };

  const handleFeatureDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingFeature(null);
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Validações
  const isFeatureValid = (feature: Feature): boolean => {
    return feature.label.trim() !== '' && feature.icon.trim() !== '';
  };

  const isFeatureLimitReached = pageData.features.length >= currentFeatureLimit;
  const canAddNewFeature = !isFeatureLimitReached;
  const featuresCompleteCount = pageData.features.filter(isFeatureValid).length;
  const featuresTotalCount = pageData.features.length;

  const featuresValidationError = isFeatureLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentFeatureLimit} diferenciais).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Badge (1 campo)
    total += 1;
    if (pageData.badge.trim()) completed++;

    // Headline (3 campos)
    total += 3;
    if (pageData.headline.prefix.trim()) completed++;
    if (pageData.headline.highlight.trim()) completed++;
    if (pageData.headline.suffix.trim()) completed++;

    // Description (parágrafo 1 - 2 campos, parágrafo 2 - 2 campos)
    total += 4;
    if (pageData.description.paragraph1.text.trim()) completed++;
    if (pageData.description.paragraph1.bold?.trim()) completed++;
    if (pageData.description.paragraph2.text.trim()) completed++;
    if (pageData.description.paragraph2.highlight?.trim()) completed++;

    // Features (2 campos por feature)
    total += pageData.features.length * 2;
    pageData.features.forEach(feature => {
      if (feature.label.trim()) completed++;
      if (feature.icon.trim()) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={GraduationCap}
      title="Por que Aprender com a Tegbe"
      description="Gerencie o conteúdo da seção que explica os diferenciais"
      exists={!!exists}
      itemName="Por que Aprender"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Badge */}
        <div className="space-y-4">
          <SectionHeader
            title="Badge"
            section="badge"
            icon={Award}
            isExpanded={expandedSections.badge}
            onToggle={() => toggleSection("badge")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.badge ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Badge
                  </label>
                  <Input
                    value={pageData.badge}
                    onChange={(e) => updateNested('badge', e.target.value)}
                    placeholder="Ex: Vivência de Campo"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/50 mt-2">
                    Texto curto que aparece como um selo ou destaque acima do título
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Headline */}
        <div className="space-y-4">
          <SectionHeader
            title="Headline (Título Principal)"
            section="headline"
            icon={Type}
            isExpanded={expandedSections.headline}
            onToggle={() => toggleSection("headline")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.headline ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Prefixo
                    </label>
                    <Input
                      value={pageData.headline.prefix}
                      onChange={(e) => updateNested('headline.prefix', e.target.value)}
                      placeholder="Por que aprender com a"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Destaque
                    </label>
                    <Input
                      value={pageData.headline.highlight}
                      onChange={(e) => updateNested('headline.highlight', e.target.value)}
                      placeholder="Tegbe"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Sufixo
                    </label>
                    <Input
                      value={pageData.headline.suffix}
                      onChange={(e) => updateNested('headline.suffix', e.target.value)}
                      placeholder='e não com um "guru"?'
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Description */}
        <div className="space-y-4">
          <SectionHeader
            title="Descrição"
            section="description"
            icon={Settings}
            isExpanded={expandedSections.description}
            onToggle={() => toggleSection("description")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.description ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-[var(--color-secondary)] flex items-center gap-2">
                      <Bold className="w-5 h-5" />
                      Parágrafo 1
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--color-secondary)]">
                          Texto
                        </label>
                        <TextArea
                          value={pageData.description.paragraph1.text}
                          onChange={(e) => updateNested('description.paragraph1.text', e.target.value)}
                          placeholder="O mercado está cheio de professores que nunca venderam nada. A Tegbe é, antes de tudo, uma"
                          rows={3}
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                          <Bold className="w-4 h-4" />
                          Texto em Negrito (Opcional)
                        </label>
                        <Input
                          value={pageData.description.paragraph1.bold || ''}
                          onChange={(e) => updateNested('description.paragraph1.bold', e.target.value)}
                          placeholder="operação de vendas ativa"
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-[var(--color-secondary)] flex items-center gap-2">
                      <Highlighter className="w-5 h-5" />
                      Parágrafo 2
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--color-secondary)]">
                          Texto
                        </label>
                        <TextArea
                          value={pageData.description.paragraph2.text}
                          onChange={(e) => updateNested('description.paragraph2.text', e.target.value)}
                          placeholder="Não ensinamos teorias de livros antigos. Nós abrimos a caixa-preta das estratégias que geram milhões todos os meses para nossos clientes de assessoria."
                          rows={3}
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Texto Destacado (Opcional)
                        </label>
                        <Input
                          value={pageData.description.paragraph2.highlight || ''}
                          onChange={(e) => updateNested('description.paragraph2.highlight', e.target.value)}
                          placeholder="Você aprende o que nós aplicamos hoje."
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] bg-yellow-500/10 border-yellow-500/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Features */}
        <div className="space-y-4">
          <SectionHeader
            title="Diferenciais"
            section="features"
            icon={CheckCircle}
            isExpanded={expandedSections.features}
            onToggle={() => toggleSection("features")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.features ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                      <ListChecks className="w-5 h-5" />
                      Diferenciais
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
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
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddFeature}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                      disabled={!canAddNewFeature}
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Diferencial
                    </Button>
                    {isFeatureLimitReached && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Limite do plano atingido
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Adicione os diferenciais que tornam a Tegbe única.
                </p>
              </div>

              {/* Mensagem de erro */}
              {featuresValidationError && (
                <div className={`p-3 rounded-lg ${isFeatureLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                  <div className="flex items-start gap-2">
                    {isFeatureLimitReached ? (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${isFeatureLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                      {featuresValidationError}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {pageData.features.map((feature, index) => (
                  <div 
                    key={index}
                    ref={index === pageData.features.length - 1 ? newFeatureRef : undefined}
                    draggable
                    onDragStart={(e) => handleFeatureDragStart(e, index)}
                    onDragOver={(e) => handleFeatureDragOver(e, index)}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleFeatureDragEnd}
                    onDrop={handleDrop}
                    className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                      draggingFeature === index 
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
                          onDragStart={(e) => handleFeatureDragStart(e, index)}
                        >
                          <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                        </div>
                        
                        {/* Indicador de posição */}
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30">
                            <span className="text-sm font-bold text-[var(--color-primary)]">
                              {index + 1}
                            </span>
                          </div>
                          <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-[var(--color-secondary)]">
                              {feature.label || "Sem título"}
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
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Texto do Diferencial
                                </label>
                                <Input
                                  value={feature.label}
                                  onChange={(e) => handleUpdateFeature(index, { label: e.target.value })}
                                  placeholder="Ex: Método Validado"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Ícone
                                </label>
                                <IconSelector
                                  value={feature.icon}
                                  onChange={(value) => handleUpdateFeature(index, { icon: value })}
                                  placeholder="ph:check-circle-fill"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
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

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          isAddDisabled={false}
          isSaving={loading}
          exists={!!exists}
          completeCount={completion.completed}
          totalCount={completion.total}
          itemName="Por que Aprender"
          icon={GraduationCap}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Conteúdo da Seção"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}