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
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Cpu,
  Trash2,
  ArrowRight
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { useListState } from "@/hooks/useListState";
import { Button } from "@/components/Button";

interface Step {
  id: string;
  label: string;
  title: string;
  icon: string;
  desc: string;
}

interface SectionHeaderData {
  title_main: string;
  title_highlight: string;
  manifesto: string;
}

interface CtaData {
  text: string;
  icon: string;
}

interface MethodologyData {
  methodology: {
    section_header: SectionHeaderData;
    steps: Step[];
    cta: CtaData;
  };
}

const defaultMethodologyData: MethodologyData = {
  methodology: {
    section_header: {
      title_main: "",
      title_highlight: "",
      manifesto: ""
    },
    steps: [
      {
        id: "01",
        label: "",
        title: "",
        icon: "solar:bill-check-bold-duotone",
        desc: ""
      },
    ],
    cta: {
      text: "",
      icon: "solar:arrow-right-linear"
    }
  }
};

const mergeWithDefaults = (apiData: any, defaultData: MethodologyData): MethodologyData => {
  if (!apiData) return defaultData;
  
  return {
    methodology: {
      section_header: apiData.methodology?.section_header || defaultData.methodology.section_header,
      steps: apiData.methodology?.steps || defaultData.methodology.steps,
      cta: apiData.methodology?.cta || defaultData.methodology.cta,
    },
  };
};

const generateSequentialId = (items: Step[]): string => {
  const numericIds = items
    .map(step => {
      const num = parseInt(step.id);
      return isNaN(num) ? 0 : num;
    })
    .filter(num => num > 0);
  
  // Encontra o maior ID
  const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
  
  return (maxId + 1).toString().padStart(2, '0');
};

export default function MethodologyPage() {
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
  } = useJsonManagement<MethodologyData>({
    apiPath: "/api/tegbe-institucional/json/como-fazemos",
    defaultData: defaultMethodologyData,
    mergeFunction: mergeWithDefaults,
  });

  const stepsList = useListState<Step>({
    initialItems: pageData.methodology.steps,
    defaultItem: {
      id: '',
      label: '',
      title: '',
      icon: 'solar:question-circle-bold-duotone',
      desc: ''
    },
    validationFields: ['label', 'title', 'desc', 'icon'],
    enableDragDrop: true
  });

  const [expandedSections, setExpandedSections] = useState({
    header: true,
    steps: true,
    cta: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Função para adicionar passo com ID automático
  const handleAddStep = () => {
    // Primeiro adiciona o item com ID vazio
    const success = stepsList.addItem();
    
    if (success) {
      // Após adicionar, gera ID sequencial para o novo item
      const newId = generateSequentialId(stepsList.items);
      
      // Encontra o índice do último item (o recém-adicionado)
      const lastIndex = stepsList.items.length - 1;
      
      // Atualiza o item com o ID gerado
      stepsList.updateItem(lastIndex, { id: newId });
    } else {
      console.warn(stepsList.validationError);
    }
  };

  // Função para garantir IDs sequenciais após reordenação ou remoção
  const revalidateSequentialIds = (items: Step[]): Step[] => {
    return items.map((item, index) => ({
      ...item,
      id: (index + 1).toString().padStart(2, '0')
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Garante IDs sequenciais antes de salvar
    const stepsWithSequentialIds = revalidateSequentialIds(stepsList.items);
    
    // Atualiza os steps no pageData antes de salvar
    updateNested('methodology.steps', stepsWithSequentialIds);
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Funções de drag & drop para steps
  const handleStepDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    stepsList.startDrag(index);
  };

  const handleStepDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    stepsList.handleDragOver(index);
  };

  const handleStepDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    stepsList.endDrag();
    
    // Após reordenação, garante IDs sequenciais
    const reorderedItems = revalidateSequentialIds(stepsList.items);
    
    // Atualiza todos os itens com novos IDs
    reorderedItems.forEach((item, index) => {
      stepsList.updateItem(index, { id: item.id });
    });
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

  // Função para remover item e reajustar IDs
  const handleRemoveStep = (index: number) => {
    stepsList.removeItem(index);
    
    // Após remover, revalida IDs sequenciais
    const remainingItems = stepsList.items;
    const revalidatedItems = revalidateSequentialIds(remainingItems);
    
    // Atualiza todos os itens com novos IDs
    revalidatedItems.forEach((item, idx) => {
      stepsList.updateItem(idx, { id: item.id });
    });
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Section Header (3 campos)
    total += 3;
    if (pageData.methodology.section_header.title_main.trim()) completed++;
    if (pageData.methodology.section_header.title_highlight.trim()) completed++;
    if (pageData.methodology.section_header.manifesto.trim()) completed++;

    // Steps (lista dinâmica - cada passo tem 3 campos)
    total += stepsList.items.length * 3; // label, title, desc (icon é opcional)
    stepsList.items.forEach(step => {
      if (step.label.trim()) completed++;
      if (step.title.trim()) completed++;
      if (step.desc.trim()) completed++;
      // icon não é obrigatório para completude
    });

    // CTA (2 campos)
    total += 2;
    if (pageData.methodology.cta.text.trim()) completed++;
    if (pageData.methodology.cta.icon.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Cpu}
      title="Gerenciar Metodologia"
      description="Configure o conteúdo da seção de metodologia"
      exists={!!exists}
      itemName="Metodologia"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho da Seção"
            section="header"
            icon={Cpu}
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
                      value={pageData.methodology.section_header.title_main}
                      onChange={(e) => updateNested('methodology.section_header.title_main', e.target.value)}
                      placeholder="Ex: Não fazemos mágica."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Título Destacado
                    </label>
                    <Input
                      value={pageData.methodology.section_header.title_highlight}
                      onChange={(e) => updateNested('methodology.section_header.title_highlight', e.target.value)}
                      placeholder="Ex: Fazemos Engenharia."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Manifesto
                  </label>
                  <TextArea
                    value={pageData.methodology.section_header.manifesto}
                    onChange={(e) => updateNested('methodology.section_header.manifesto', e.target.value)}
                    placeholder="Descrição da metodologia"
                    rows={4}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Steps - COM LISTA DINÂMICA */}
        <div className="space-y-4">
          <SectionHeader
            title="Passos da Metodologia"
            section="steps"
            icon={Cpu}
            isExpanded={expandedSections.steps}
            onToggle={() => toggleSection("steps")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.steps ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Configure os passos da metodologia
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {stepsList.completeCount} de {stepsList.totalCount} completos
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        Limite: {stepsList.currentPlanType === 'pro' ? '10' : '5'} itens
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddStep}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                      disabled={!stepsList.canAddNewItem}
                    >
                      + Adicionar Passo
                    </Button>
                    {stepsList.isLimitReached && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Limite do plano atingido
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Cada passo representa uma etapa da sua metodologia. <strong>Os IDs são gerados automaticamente e mantidos sequenciais.</strong>
                </p>
              </div>

              {/* Mensagem de erro */}
              {stepsList.validationError && (
                <div className={`p-3 rounded-lg ${stepsList.isLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                  <div className="flex items-start gap-2">
                    {stepsList.isLimitReached ? (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${stepsList.isLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                      {stepsList.validationError}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {stepsList.filteredItems.map((step, index) => (
                  <div 
                    key={`step-${step.id || index}`}
                    ref={index === stepsList.filteredItems.length - 1 ? stepsList.newItemRef : undefined}
                    draggable
                    onDragStart={(e) => handleStepDragStart(e, index)}
                    onDragOver={(e) => handleStepDragOver(e, index)}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleStepDragEnd}
                    onDrop={handleDrop}
                    className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                      stepsList.draggingItem === index 
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
                        
                        {/* Número do passo (apenas visual) */}
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
                              {step.title || "Sem título"}
                            </h4>
                            {step.label && step.title && step.icon && step.desc ? (
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
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">Label</label>
                                <Input
                                  value={step.label}
                                  onChange={(e) => stepsList.updateItem(index, { label: e.target.value })}
                                  placeholder="Ex: Fundação"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">Título</label>
                                <Input
                                  value={step.title}
                                  onChange={(e) => stepsList.updateItem(index, { title: e.target.value })}
                                  placeholder="Ex: Auditoria de Margem"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">Ícone</label>
                                <IconSelector
                                  value={step.icon}
                                  onChange={(value) => stepsList.updateItem(index, { icon: value })}
                                  placeholder="solar:bill-check-bold-duotone"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            <label className="block text-sm font-medium text-[var(--color-secondary)]">Descrição</label>
                            <TextArea
                              value={step.desc}
                              onChange={(e) => stepsList.updateItem(index, { desc: e.target.value })}
                              placeholder="Descrição detalhada do passo"
                              rows={3}
                              className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          onClick={() => handleRemoveStep(index)}
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

        {/* Seção CTA */}
        <div className="space-y-4">
          <SectionHeader
            title="Call to Action"
            section="cta"
            icon={ArrowRight}
            isExpanded={expandedSections.cta}
            onToggle={() => toggleSection("cta")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.cta ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Texto do Botão
                  </label>
                  <Input
                    value={pageData.methodology.cta.text}
                    onChange={(e) => updateNested('methodology.cta.text', e.target.value)}
                    placeholder="Ex: Ver Planos de Execução"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Ícone do Botão
                  </label>
                  <IconSelector
                    value={pageData.methodology.cta.icon}
                    onChange={(value) => updateNested('methodology.cta.icon', value)}
                    placeholder="solar:arrow-right-linear"
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
          itemName="Metodologia"
          icon={Cpu}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração de Metodologia"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}