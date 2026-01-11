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
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { tailwindToHex, hexToTailwindTextClass } from "@/lib/colors";

interface Value {
  title: string;
  description: string;
  icon: string;
  color: string; // Mantém como string para compatibilidade, mas agora usamos ThemePropertyInput
}

interface Header {
  preTitle: string;
  title: string;
  subtitle: string;
}

interface SociosPageData {
  header: Header;
  content: string | null;
  values: Value[];
  layout: "grid" | "list" | "carousel";
}

const defaultSociosData: SociosPageData = {
  header: {
    preTitle: "Nossa Essência",
    title: "Não fundamos uma agência.<br /><span class='text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-400 to-white'>Criamos um padrão de excelência.</span>",
    subtitle: "A Tegbe nasceu de uma inquietação: o mercado aceitava o 'bom' como suficiente. Nós não. Somos um time de mentes analíticas obcecadas por elevar a barra do que é possível em performance digital."
  },
  content: null,
  values: [
    {
      title: "Inteligência Estratégica",
      description: "Antes de apertar qualquer botão, nós pensamos. Nossa cultura valoriza o planejamento profundo e a visão de longo prazo em detrimento de hacks imediatistas.",
      icon: "ph:brain-bold",
      color: "blue-500" // Atualizado para formato Tailwind completo
    },
    {
      title: "Mentes de Dono",
      description: "Aqui dentro, ninguém é apenas funcionário. Atuamos com 'Skin in the Game'. Sentimos a dor e a vitória do cliente como se fosse nossa própria operação.",
      icon: "ph:users-three-bold",
      color: "blue-500" // Atualizado para formato Tailwind completo
    },
    {
      title: "Rigor Técnico",
      description: "Rejeitamos o amadorismo. Nossos processos são auditáveis, nossa tecnologia é de ponta e nossa busca por precisão é inegociável.",
      icon: "ph:diamond-bold",
      color: "blue-500" // Atualizado para formato Tailwind completo
    }
  ],
  layout: "grid"
};

const mergeWithDefaults = (apiData: any, defaultData: SociosPageData): SociosPageData => {
  if (!apiData) return defaultData;
  
  // Migração: converter cores antigas para formato Tailwind completo
  const migrateColor = (color: string) => {
    if (!color) return "blue-500";
    if (color.includes('-')) return color; // Já está no formato correto
    return `${color}-500`; // Adiciona o tom padrão
  };
  
  return {
    header: {
      preTitle: apiData.header?.preTitle || defaultData.header.preTitle,
      title: apiData.header?.title || defaultData.header.title,
      subtitle: apiData.header?.subtitle || defaultData.header.subtitle,
    },
    content: apiData.content || defaultData.content,
    values: apiData.values?.length 
      ? apiData.values.map((value: any, index: number) => ({
          title: value.title || defaultData.values[index]?.title || `Valor ${index + 1}`,
          description: value.description || defaultData.values[index]?.description || "",
          icon: value.icon || defaultData.values[index]?.icon || "ph:star-bold",
          color: migrateColor(value.color || defaultData.values[index]?.color)
        }))
      : defaultData.values,
    layout: apiData.layout || defaultData.layout
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
  } = useJsonManagement<SociosPageData>({
    apiPath: "/api/tegbe-institucional/json/socios",
    defaultData: defaultSociosData,
    mergeFunction: mergeWithDefaults,
  });

  const [expandedSections, setExpandedSections] = useState({
    header: true,
    values: false,
    layout: false,
    content: false,
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
    const values = pageData.values;
    if (values.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: Value = {
      title: `Valor ${values.length + 1}`,
      description: "",
      icon: "ph:star-bold",
      color: "blue-500"
    };
    
    const updated = [...values, newItem];
    updateNested('values', updated);
    
    return true;
  };

  const handleUpdateValue = (index: number, updates: Partial<Value>) => {
    const values = pageData.values;
    const updated = [...values];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      updateNested('values', updated);
    }
  };

  const handleRemoveValue = (index: number) => {
    const values = pageData.values;
    
    if (values.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyItem: Value = {
        title: "Valor",
        description: "",
        icon: "ph:star-bold",
        color: "blue-500"
      };
      updateNested('values', [emptyItem]);
    } else {
      const updated = values.filter((_, i) => i !== index);
      updateNested('values', updated);
    }
  };

  // Função para atualizar cor de valor
  const handleValueColorChange = (index: number, hexColor: string) => {
    const tailwindClass = hexToTailwindTextClass(hexColor);
    const colorValue = tailwindClass.replace('text-', '');
    handleUpdateValue(index, { color: colorValue });
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
    
    const values = pageData.values;
    const updated = [...values];
    const draggedItem = updated[draggingValue];
    
    // Remove o item arrastado
    updated.splice(draggingValue, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingValue ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    updateNested('values', updated);
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
           item.color.trim() !== '';
  };

  const values = pageData.values;
  
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
    if (pageData.header.preTitle?.trim()) completed++;
    if (pageData.header.title?.trim()) completed++;
    if (pageData.header.subtitle?.trim()) completed++;

    // Content (1 campo)
    total += 1;
    if (pageData.content?.trim()) completed++;

    // Values (cada um com 4 campos)
    total += values.length * 4;
    values.forEach(item => {
      if (item.title.trim()) completed++;
      if (item.description.trim()) completed++;
      if (item.icon.trim()) completed++;
      if (item.color.trim()) completed++;
    });

    // Layout (1 campo)
    total += 1;
    if (pageData.layout.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Users}
      title="Gerenciar Sócios e Valores"
      description="Configure o conteúdo da seção sobre sócios e valores da empresa"
      exists={!!exists}
      itemName="Sócios"
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
                      value={pageData.header.preTitle}
                      onChange={(e) => updateNested('header.preTitle', e.target.value)}
                      placeholder="Ex: Nossa Essência"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Subtítulo</label>
                    <Input
                      value={pageData.header.subtitle}
                      onChange={(e) => updateNested('header.subtitle', e.target.value)}
                      placeholder="Ex: A Tegbe nasceu de uma inquietação..."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Título Principal</label>
                  <TextArea
                    value={pageData.header.title}
                    onChange={(e) => updateNested('header.title', e.target.value)}
                    placeholder="Pode conter HTML, ex: &lt;span class='...'&gt;texto&lt;/span&gt;"
                    rows={3}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono text-sm"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/50">
                    Pode incluir HTML para estilização. Use classes Tailwind para gradientes.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Content */}
        <div className="space-y-4">
          <SectionHeader
            title="Conteúdo Principal"
            section="content"
            icon={Sparkles}
            isExpanded={expandedSections.content}
            onToggle={() => toggleSection("content")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.content ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Conteúdo Adicional (Opcional)
                  </label>
                  <TextArea
                    value={pageData.content || ''}
                    onChange={(e) => updateNested('content', e.target.value)}
                    placeholder="Texto adicional sobre os sócios e cultura da empresa..."
                    rows={4}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/50">
                    Deixe vazio para não exibir conteúdo adicional.
                  </p>
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
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Descrição</label>
                                  <TextArea
                                    value={value.description}
                                    onChange={(e) => handleUpdateValue(index, { description: e.target.value })}
                                    placeholder="Descrição detalhada do valor..."
                                    rows={4}
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                                    <Palette className="w-4 h-4" />
                                    Cor do Valor
                                  </label>
                                  <ThemePropertyInput
                                    property="text"
                                    label=""
                                    description=""
                                    currentHex={tailwindToHex(`text-${value.color}`)}
                                    tailwindClass={`text-${value.color}`}
                                    onThemeChange={(_, hex) => handleValueColorChange(index, hex)}
                                  />
                                  <p className="text-xs text-[var(--color-secondary)]/50 mt-2">
                                    Cor associada a este valor específico
                                  </p>
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

        {/* Seção Layout */}
        <div className="space-y-4">
          <SectionHeader
            title="Layout"
            section="layout"
            icon={Layout}
            isExpanded={expandedSections.layout}
            onToggle={() => toggleSection("layout")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.layout ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Tipo de Layout
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: "grid", label: "Grid", icon: Layout, description: "Exibição em grade responsiva" },
                      { value: "list", label: "Lista", icon: Users, description: "Exibição em lista vertical" },
                      { value: "carousel", label: "Carrossel", icon: Sparkles, description: "Exibição em carrossel interativo" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateNested('layout', option.value)}
                        className={`p-4 border rounded-lg text-left transition-all duration-200 ${
                          pageData.layout === option.value
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                            : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded ${
                            pageData.layout === option.value
                              ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                              : 'bg-[var(--color-background-body)] text-[var(--color-secondary)]'
                          }`}>
                            <option.icon className="w-5 h-5" />
                          </div>
                          <span className="font-medium text-[var(--color-secondary)]">
                            {option.label}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--color-secondary)]/70">
                          {option.description}
                        </p>
                      </button>
                    ))}
                  </div>
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
          itemName="Sócios"
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
        itemName="Configuração de Sócios"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}