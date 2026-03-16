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
  Users,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  UserStar,
  Trash2,
  Plus,
  Heading,
  Palette,
  Sparkles
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";
import { ImageUpload } from "@/components/ImageUpload"; // ADICIONADO

interface Value {
  image: string;
  icon: string;
  title: string;
  description: string;
}

interface Header {
  preTitle: string;
  title: string;
  subtitle: string;
}

interface SobreData {
  sobre: {
    header: Header;
    values: Value[];
  };
}

const defaultSobreData: SobreData = {
  sobre: {
    header: {
      title: 'Crescimento <span class="text-[#FFD700]">estratégico</span> para sócios',
      preTitle: "DIFERENCIAL",
      subtitle: "Construímos máquinas de vendas baseadas em fundamentos econômicos que sustentam o crescimento por anos."
    },
    values: [
      {
        image: "/icone1.png",
        icon: "solar:chart-2-bold",
        title: "Auditoria de Margem",
        description: "Analisamos CMV, impostos e margem de contribuição para garantir que cada venda seja lucrativa antes mesmo de acontecer."
      },
      {
        image: "/icone2.png",
        icon: "solar:graph-up-bold",
        title: "Engenharia de Conversão",
        description: "Otimizamos a taxa de conversão (CRO) para que o tráfego não seja desperdiçado em um site que não vende."
      },
      {
        image: "/icone3.png",
        icon: "solar:rocket-bold",
        title: "Escala com Dados",
        description: "Ativamos tráfego de alta intenção e CRM, transformando o crescimento em um processo previsível e escalável."
      }
    ]
  }
};

const mergeWithDefaults = (apiData: any, defaultData: SobreData): SobreData => {
  if (!apiData) return defaultData;
  
  // Se a API retornar dados no formato antigo, converte para o novo formato
  const apiSobreData = apiData.sobre || apiData;
  
  return {
    sobre: {
      header: {
        preTitle: apiSobreData.header?.preTitle || defaultData.sobre.header.preTitle,
        title: apiSobreData.header?.title || defaultData.sobre.header.title,
        subtitle: apiSobreData.header?.subtitle || defaultData.sobre.header.subtitle,
      },
      values: apiSobreData.values?.length 
        ? apiSobreData.values.map((value: any, index: number) => ({
            image: value.image || defaultData.sobre.values[index]?.image || "",
            icon: value.icon || defaultData.sobre.values[index]?.icon || "solar:star-bold",
            title: value.title || defaultData.sobre.values[index]?.title || `Valor ${index + 1}`,
            description: value.description || defaultData.sobre.values[index]?.description || "",
          }))
        : defaultData.sobre.values
    }
  };
};

export default function SobrePage() {
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
  } = useJsonManagement<SobreData>({
    apiPath: "/api/tegbe-institucional/json/socios",
    defaultData: defaultSobreData,
    mergeFunction: mergeWithDefaults,
  });

  const [expandedSections, setExpandedSections] = useState({
    header: true,
    values: false,
  });

  // Controle de planos
  const currentPlanType = 'pro';
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para valores
  const handleAddValue = () => {
    const values = pageData.sobre.values;
    if (values.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: Value = {
      image: "",
      icon: "solar:star-bold",
      title: `Valor ${values.length + 1}`,
      description: "",
    };
    
    const updated = [...values, newItem];
    updateNested('sobre.values', updated);
    
    return true;
  };

  const handleUpdateValue = (index: number, updates: Partial<Value>) => {
    const values = pageData.sobre.values;
    const updated = [...values];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      updateNested('sobre.values', updated);
    }
  };

  const handleRemoveValue = (index: number) => {
    const values = pageData.sobre.values;
    
    if (values.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyItem: Value = {
        image: "",
        icon: "solar:star-bold",
        title: "Valor",
        description: "",
      };
      updateNested('sobre.values', [emptyItem]);
    } else {
      const updated = values.filter((_, i) => i !== index);
      updateNested('sobre.values', updated);
    }
  };

  // Funções de drag & drop para valores
  const [draggingValue, setDraggingValue] = useState<number | null>(null);

  const handleValueDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingValue(index);
  };

  const handleValueDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingValue === null || draggingValue === index) return;
    
    const values = pageData.sobre.values;
    const updated = [...values];
    const draggedItem = updated[draggingValue];
    
    // Remove o item arrastado
    updated.splice(draggingValue, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingValue ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    updateNested('sobre.values', updated);
    setDraggingValue(index);
  };

  const handleValueDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingValue(null);
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
  const isValueValid = (item: Value): boolean => {
    return item.title.trim() !== '' && 
           item.description.trim() !== '' && 
           item.icon.trim() !== '' &&
           item.image.trim() !== '';
  };

  const values = pageData.sobre.values;
  
  const isValuesLimitReached = values.length >= currentPlanLimit;
  const canAddNewValue = !isValuesLimitReached;
  const valuesCompleteCount = values.filter(isValueValid).length;
  const valuesTotalCount = values.length;

  const valuesValidationError = isValuesLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Header (3 campos)
    total += 3;
    if (pageData.sobre.header.preTitle?.trim()) completed++;
    if (pageData.sobre.header.title?.trim()) completed++;
    if (pageData.sobre.header.subtitle?.trim()) completed++;

    // Values (cada um com 4 campos)
    total += values.length * 4;
    values.forEach(item => {
      if (item.title.trim()) completed++;
      if (item.description.trim()) completed++;
      if (item.icon.trim()) completed++;
      if (item.image.trim()) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Users}
      title="Gerenciar Sobre"
      description="Configure o conteúdo da página sobre a empresa"
      exists={!!exists}
      itemName="Sobre"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho"
            section="header"
            icon={Heading}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Pré-título
                    </label>
                    <Input
                      value={pageData.sobre.header.preTitle}
                      onChange={(e) => updateNested('sobre.header.preTitle', e.target.value)}
                      placeholder="Ex: Nossa Essência"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Subtítulo</label>
                    <Input
                      value={pageData.sobre.header.subtitle}
                      onChange={(e) => updateNested('sobre.header.subtitle', e.target.value)}
                      placeholder="Ex: Construímos máquinas de vendas baseadas em fundamentos..."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Título Principal</label>
                  <TextArea
                    value={pageData.sobre.header.title}
                    onChange={(e) => updateNested('sobre.header.title', e.target.value)}
                    placeholder="Pode conter HTML, ex: &lt;span class='text-[#FFD700]'&gt;texto&lt;/span&gt;"
                    rows={3}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono text-sm"
                  />
                  <div className="text-xs text-[var(--color-secondary)]/50 space-y-1">
                    <p>Pode incluir HTML para estilização.</p>
                    <p className="flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      Exemplo de cor no texto: 
                      <code className="ml-1 px-1 py-0.5 bg-[var(--color-background-body)] rounded">
                        &lt;span class=&quot;text-[#FFD700]&quot;&gt;estratégico&lt;/span&gt;
                      </code>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Valores */}
        <div className="space-y-4">
          <SectionHeader
            title="Diferenciais / Valores da Empresa"
            section="values"
            icon={UserStar}
            isExpanded={expandedSections.values}
            onToggle={() => toggleSection("values")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.values ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Valores e Princípios
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {valuesCompleteCount} de {valuesTotalCount} completos
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
                      onClick={handleAddValue}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                      disabled={!canAddNewValue}
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Valor
                    </Button>
                    {isValuesLimitReached && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Limite do plano atingido
                      </p>
                    )}
                  </div>
                </div>

                {/* Mensagem de erro */}
                {valuesValidationError && (
                  <div className={`p-3 rounded-lg ${isValuesLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                    <div className="flex items-start gap-2">
                      {isValuesLimitReached ? (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm ${isValuesLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                        {valuesValidationError}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {values.map((value, index) => (
                    <div 
                      key={`value-${index}`}
                      draggable
                      onDragStart={(e) => handleValueDragStart(e, index)}
                      onDragOver={(e) => handleValueDragOver(e, index)}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragEnd={handleValueDragEnd}
                      onDrop={handleDrop}
                      className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                        draggingValue === index 
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
                            onDragStart={(e) => handleValueDragStart(e, index)}
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
                            <div className="flex items-center gap-3 mb-6">
                              <h4 className="font-medium text-[var(--color-secondary)]">
                                Valor #{index + 1}
                              </h4>
                              {isValueValid(value) ? (
                                <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full border border-green-500/20">
                                  Completo
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full border border-yellow-500/20">
                                  Incompleto
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Coluna 1: Imagens e Ícones */}
                              <div className="space-y-6">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Imagem</label>
                                  <ImageUpload
                                    label=""
                                    currentImage={value.image}
                                    onChange={(url) => handleUpdateValue(index, { image: url })}
                                    aspectRatio="aspect-square"
                                    previewWidth={120}
                                    previewHeight={120}
                                    description="Imagem/ícone ilustrativo (ex: /icone1.png)"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Ícone Vector</label>
                                  <IconSelector
                                    value={value.icon}
                                    onChange={(val) => handleUpdateValue(index, { icon: val })}
                                    placeholder="solar:star-bold"
                                  />
                                </div>
                              </div>
                              
                              {/* Coluna 2 e 3: Textos */}
                              <div className="lg:col-span-2 space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Título</label>
                                  <Input
                                    value={value.title}
                                    onChange={(e) => handleUpdateValue(index, { title: e.target.value })}
                                    placeholder="Ex: Auditoria de Margem"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Descrição</label>
                                  <TextArea
                                    value={value.description}
                                    onChange={(e) => handleUpdateValue(index, { description: e.target.value })}
                                    placeholder="Descrição detalhada do diferencial..."
                                    rows={5}
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
                            onClick={() => handleRemoveValue(index)}
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
          itemName="Sobre"
          icon={Users}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração de Sobre"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}