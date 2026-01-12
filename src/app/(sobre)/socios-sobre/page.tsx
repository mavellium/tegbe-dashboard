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
  Users,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Brain,
  Diamond,
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

interface Value {
  title: string;
  description: string;
  icon: string;
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
      preTitle: "Nossa Essência",
      title: "Não fundamos uma agência.<br /><span class='text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#F5C400] to-white'>Criamos um padrão de excelência.</span>",
      subtitle: "A Tegbe nasceu de uma inquietação: o mercado aceitava o 'bom' como suficiente. Nós não. Somos um time de mentes analíticas obcecadas por elevar a barra do que é possível em performance digital."
    },
    values: [
      {
        title: "Inteligência Estratégica",
        description: "Antes de apertar qualquer botão, nós pensamos. Nossa cultura valoriza o planejamento profundo e a visão de longo prazo em detrimento de hacks imediatistas.",
        icon: "ph:brain-bold"
      },
      {
        title: "Mentes de Dono",
        description: "Aqui dentro, ninguém é apenas funcionário. Atuamos com 'Skin in the Game'. Sentimos a dor e a vitória do cliente como se fosse nossa própria operação.",
        icon: "ph:users-three-bold"
      },
      {
        title: "Rigor Técnico",
        description: "Rejeitamos o amadorismo. Nossos processos são auditáveis, nossa tecnologia é de ponta e nossa busca por precisão é inegociável.",
        icon: "ph:diamond-bold"
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
            title: value.title || defaultData.sobre.values[index]?.title || `Valor ${index + 1}`,
            description: value.description || defaultData.sobre.values[index]?.description || "",
            icon: value.icon || defaultData.sobre.values[index]?.icon || "ph:star-bold",
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
      title: `Valor ${values.length + 1}`,
      description: "",
      icon: "ph:star-bold",
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
        title: "Valor",
        description: "",
        icon: "ph:star-bold",
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
           item.icon.trim() !== '';
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

    // Values (cada um com 3 campos)
    total += values.length * 3;
    values.forEach(item => {
      if (item.title.trim()) completed++;
      if (item.description.trim()) completed++;
      if (item.icon.trim()) completed++;
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
                      placeholder="Ex: A Tegbe nasceu de uma inquietação..."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Título Principal</label>
                  <TextArea
                    value={pageData.sobre.header.title}
                    onChange={(e) => updateNested('sobre.header.title', e.target.value)}
                    placeholder="Pode conter HTML, ex: &lt;span class='text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#F5C400] to-white'&gt;texto&lt;/span&gt;"
                    rows={3}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono text-sm"
                  />
                  <div className="text-xs text-[var(--color-secondary)]/50 space-y-1">
                    <p>Pode incluir HTML para estilização.</p>
                    <p className="flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      Sugestão de gradiente: 
                      <code className="ml-1 px-1 py-0.5 bg-[var(--color-background-body)] rounded">
                        from-[#FFD700] via-[#F5C400] to-white
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
            title="Valores da Empresa"
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
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-[var(--color-secondary)]">
                                Valor #{index + 1}
                              </h4>
                              {isValueValid(value) ? (
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
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Título</label>
                                  <Input
                                    value={value.title}
                                    onChange={(e) => handleUpdateValue(index, { title: e.target.value })}
                                    placeholder="Ex: Inteligência Estratégica"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Ícone</label>
                                  <IconSelector
                                    value={value.icon}
                                    onChange={(value) => handleUpdateValue(index, { icon: value })}
                                    placeholder="ph:brain-bold"
                                  />
                                  <p className="text-xs text-[var(--color-secondary)]/50">
                                    Use ícones do Phosphor (ex: ph:brain-bold)
                                  </p>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Descrição</label>
                                  <TextArea
                                    value={value.description}
                                    onChange={(e) => handleUpdateValue(index, { description: e.target.value })}
                                    placeholder="Descrição detalhada do valor..."
                                    rows={6}
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