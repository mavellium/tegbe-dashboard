/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Switch } from "@/components/Switch";
import IconSelector from "@/components/IconSelector";
import { 
  Layout, 
  ListIcon,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Palette,
  Tag,
  Settings,
  Star,
  TrendingUp,
  Globe,
  Target
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { hexToTailwindBgClass } from "@/lib/colors";
import { ImageUpload } from "@/components/ImageUpload";
import { useSite } from "@/context/site-context";

interface CaseItem {
  id: number;
  logo: string;
  name: string;
  description: string;
  result: string;
  tags: string[];
  icon_decoration: string;
}

interface HeaderData {
  tag: string;
  title_main: string;
  title_highlight: string;
  live_status: string;
}

interface ConfigData {
  theme: string;
  colors: {
    primary_gold: string;
    bg_dark: string;
    card_bg: string;
  };
  behavior: {
    infinite_loop: boolean;
    snap_type: string;
    responsivity: string;
  };
}

interface SuccessCasesCarouselData {
  id?: string;
  componentName: string;
  description: string;
  enabled: boolean;
  header: HeaderData;
  cases: CaseItem[];
  config: ConfigData;
  metadata: {
    author: string;
    version: string;
    lastModified: string;
    tags: string[];
    category?: string;
  };
}

const defaultSuccessCasesCarouselData: SuccessCasesCarouselData = {
  componentName: "",
  description: "",
  enabled: true,
  header: {
    tag: "",
    title_main: "",
    title_highlight: "",
    live_status: ""
  },
  cases: [
    {
      id: 1,
      logo: "",
      name: "",
      description: "",
      result: "",
      tags: [""],
      icon_decoration: "TrendingUp"
    }
  ],
  config: {
    theme: "Dark/Gold",
    colors: {
      primary_gold: "#FFC400",
      bg_dark: "#020202",
      card_bg: "#0A0A0A"
    },
    behavior: {
      infinite_loop: false,
      snap_type: "spring",
      responsivity: "Multi-Device Optimized"
    }
  },
  metadata: {
    author: "",
    version: "1.0.0",
    lastModified: new Date().toISOString(),
    tags: [""],
    category: "testimonials"
  },
};

const mergeWithDefaults = (apiData: any, defaultData: SuccessCasesCarouselData): SuccessCasesCarouselData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id,
    componentName: apiData.componentName || defaultData.componentName,
    description: apiData.description || defaultData.description,
    enabled: apiData.enabled ? defaultData.enabled : true,
    header: apiData.header || defaultData.header,
    cases: apiData.cases || defaultData.cases,
    config: apiData.config || defaultData.config,
    metadata: {
      author: apiData.metadata?.author || defaultData.metadata.author,
      version: apiData.metadata?.version || defaultData.metadata.version,
      lastModified: apiData.metadata?.lastModified || defaultData.metadata.lastModified,
      tags: apiData.metadata?.tags || defaultData.metadata.tags,
      category: apiData.metadata?.category || defaultData.metadata.category,
    },
  };
};

export default function SuccessCasesCarouselPage() {
  const { currentSite } = useSite();
  const currentPlanType = currentSite.planType;
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  const {
    data: carouselData,
    exists,
    loading,
    success,
    errorMsg,
    deleteModal,
    updateNested,
    setFileState,
    save,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
  } = useJsonManagement<SuccessCasesCarouselData>({
    apiPath: "/api/tegbe-institucional/json/resultado",
    defaultData: defaultSuccessCasesCarouselData,
    mergeFunction: mergeWithDefaults,
  });

  // Estado local para URLs temporárias de preview
  const [tempImageUrls, setTempImageUrls] = useState<Record<number, string>>({});
  
  // Estado para drag & drop
  const [draggingCase, setDraggingCase] = useState<number | null>(null);
  
  // Estado para tags em edição
  const [editingCaseTags, setEditingCaseTags] = useState<{ [key: number]: string }>({});

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    header: false,
    cases: false,
    config: false,
    metadata: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Referência para o último case adicionado
  const newCaseRef = useRef<HTMLDivElement>(null);

  // Funções para manipular a lista de cases
  const addCase = () => {
    const currentCases = [...carouselData.cases];
    
    if (currentCases.length >= currentPlanLimit) {
      return false;
    }
    
    const newCase: CaseItem = {
      id: Date.now(),
      logo: "",
      name: "",
      description: "",
      result: "",
      tags: [],
      icon_decoration: "TrendingUp"
    };
    
    updateNested('cases', [...currentCases, newCase]);
    
    // Scroll para o novo item
    setTimeout(() => {
      newCaseRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updateCase = (index: number, updates: Partial<CaseItem>) => {
    const currentCases = [...carouselData.cases];
    
    if (index >= 0 && index < currentCases.length) {
      currentCases[index] = { ...currentCases[index], ...updates };
      updateNested('cases', currentCases);
    }
  };

  const removeCase = (index: number) => {
    const currentCases = [...carouselData.cases];
    
    if (currentCases.length <= 1) {
      // Mantém pelo menos um case vazio
      updateNested('cases', [{
        id: Date.now(),
        logo: "",
        name: "",
        description: "",
        result: "",
        tags: [],
        icon_decoration: "TrendingUp"
      }]);
    } else {
      currentCases.splice(index, 1);
      updateNested('cases', currentCases);
    }
  };

  // Função para lidar com upload de imagem do case
  const handleCaseImageChange = (caseIndex: number, file: File | null) => {
    const caseItem = carouselData.cases[caseIndex];
    const path = `cases.${caseIndex}.logo`;
    
    setFileState(path, file);
    
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setTempImageUrls(prev => ({
        ...prev,
        [caseItem?.id]: objectUrl
      }));
      
      updateCase(caseIndex, { logo: objectUrl });
    } else {
      // Limpar URL temporária se existir
      if (tempImageUrls[caseItem?.id]) {
        URL.revokeObjectURL(tempImageUrls[caseItem?.id]);
        setTempImageUrls(prev => {
          const newUrls = { ...prev };
          delete newUrls[caseItem?.id];
          return newUrls;
        });
      }
      
      updateCase(caseIndex, { logo: "" });
    }
  };

  // Funções para tags
  const handleAddTagToCase = (caseIndex: number, tag: string) => {
    if (!tag.trim()) return;
    
    const currentCase = carouselData.cases[caseIndex];
    const updatedTags = [...currentCase.tags, tag.trim()];
    updateCase(caseIndex, { tags: updatedTags });
    
    // Limpa o campo de edição
    setEditingCaseTags(prev => ({
      ...prev,
      [caseIndex]: ''
    }));
  };

  const handleRemoveTagFromCase = (caseIndex: number, tagIndex: number) => {
    const currentCase = carouselData.cases[caseIndex];
    const updatedTags = currentCase.tags.filter((_, i) => i !== tagIndex);
    updateCase(caseIndex, { tags: updatedTags });
  };

  // Funções de drag & drop
  const handleCaseDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingCase(index);
  };

  const handleCaseDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingCase === null || draggingCase === index) return;
    
    const currentCases = [...carouselData.cases];
    const draggedCase = currentCases[draggingCase];
    
    // Remove o item arrastado
    currentCases.splice(draggingCase, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingCase ? index : index;
    currentCases.splice(newIndex, 0, draggedCase);
    
    updateNested('cases', currentCases);
    setDraggingCase(index);
  };

  const handleCaseDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingCase(null);
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

  const handleAddCase = () => {
    const success = addCase();
    if (!success) {
      console.warn(`Limite do plano ${currentPlanType} atingido (${currentPlanLimit} itens)`);
    }
  };

  // Limpar URLs temporárias ao desmontar
  useEffect(() => {
    return () => {
      Object.values(tempImageUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [tempImageUrls]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      // Atualizar data da última modificação
      updateNested('metadata.lastModified', new Date().toISOString());
      
      // Salvar no banco de dados
      await save();
      
      // Após salvar, limpar as URLs temporárias
      Object.values(tempImageUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
      setTempImageUrls({});
      
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Funções para atualizar cores
  const handleColorChange = (colorKey: keyof ConfigData['colors'], hexColor: string) => {
    updateNested(`config.colors.${colorKey}`, hexColor);
  };

  // Cálculos de validação
  const isCaseValid = (caseItem?: CaseItem): boolean => {
    return caseItem?.name?.trim() !== '' && 
           caseItem?.description?.trim() !== '' && 
           caseItem?.result?.trim() !== '';
  };

  const cases = carouselData.cases;
  const isLimitReached = cases.length >= currentPlanLimit;
  const canAddNewItem = !isLimitReached;
  const completeCount = cases.filter(isCaseValid).length;
  const totalCount = cases.length;
  const validationError = isLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  // Cálculo de preenchimento
  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Informações básicas
    total += 3;
    if (carouselData.componentName.trim()) completed++;
    if (carouselData.description.trim()) completed++;
    total++; // enabled sempre tem valor

    // Header
    total += 4;
    if (carouselData.header.tag.trim()) completed++;
    if (carouselData.header.title_main.trim()) completed++;
    if (carouselData.header.title_highlight.trim()) completed++;
    if (carouselData.header.live_status.trim()) completed++;

    // Cases
    total += cases.length * 6;
    cases.forEach(caseItem => {
      if (caseItem?.name?.trim()) completed++;
      if (caseItem?.description?.trim()) completed++;
      if (caseItem?.result?.trim()) completed++;
      if (caseItem?.logo.trim()) completed++;
      if (caseItem?.icon_decoration?.trim()) completed++;
      if (caseItem?.tags?.length > 0) completed++;
    });

    // Config
    total += 6;
    if (carouselData.config.theme.trim()) completed++;
    if (carouselData.config.colors.primary_gold) completed++;
    if (carouselData.config.colors.bg_dark) completed++;
    if (carouselData.config.colors.card_bg) completed++;
    if (carouselData.config.behavior.snap_type.trim()) completed++;
    if (carouselData.config.behavior.responsivity.trim()) completed++;

    // Metadata
    total += 4;
    if (carouselData.metadata.author.trim()) completed++;
    if (carouselData.metadata.version.trim()) completed++;
    if (carouselData.metadata.category?.trim()) completed++;
    if (carouselData.metadata.tags.length > 0) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Target}
      title="Carrossel de Cases de Sucesso"
      description="Gerencie o carrossel de cases com resultados mensuráveis"
      exists={!!exists}
      itemName="Resultados"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Básica */}
        <div className="space-y-4">
          <SectionHeader
            title="Informações Básicas"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nome do Componente"
                  value={carouselData.componentName}
                  onChange={(e) => updateNested('componentName', e.target.value)}
                  placeholder="Ex: Carrossel de Cases de Sucesso"
                  required
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background-body)]">
                  <div>
                    <h4 className="font-medium text-[var(--color-secondary)]">Status do Componente</h4>
                    <p className="text-sm text-[var(--color-secondary)]/70">
                      {carouselData.enabled ? "Ativo e visível" : "Desativado"}
                    </p>
                  </div>
                  <Switch
                    checked={carouselData.enabled}
                    onCheckedChange={(checked) => updateNested('enabled', checked)}
                  />
                </div>

                <div className="md:col-span-2">
                  <TextArea
                    label="Descrição"
                    value={carouselData.description}
                    onChange={(e) => updateNested('description', e.target.value)}
                    placeholder="Descreva o propósito deste carrossel de cases"
                    rows={3}
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
            title="Cabeçalho do Carrossel"
            section="header"
            icon={Layout}
            isExpanded={expandedSections.header}
            onToggle={() => toggleSection("header")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.header ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Tag / Categoria"
                  value={carouselData.header.tag}
                  onChange={(e) => updateNested('header.tag', e.target.value)}
                  placeholder="Ex: Track Record Validado"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <Input
                  label="Status em Tempo Real"
                  value={carouselData.header.live_status}
                  onChange={(e) => updateNested('header.live_status', e.target.value)}
                  placeholder="Ex: Atualizado em tempo real"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <Input
                  label="Título Principal"
                  value={carouselData.header.title_main}
                  onChange={(e) => updateNested('header.title_main', e.target.value)}
                  placeholder="Ex: Resultados que"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <Input
                  label="Título em Destaque"
                  value={carouselData.header.title_highlight}
                  onChange={(e) => updateNested('header.title_highlight', e.target.value)}
                  placeholder="Ex: falam por si."
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Cases */}
        <div className="space-y-4">
          <SectionHeader
            title="Cases de Sucesso"
            section="cases"
            icon={ListIcon}
            isExpanded={expandedSections.cases}
            onToggle={() => toggleSection("cases")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.cases ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Cases Cadastrados
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {completeCount} de {totalCount} completos
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        Limite: {currentPlanLimit} cases
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddCase}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                      disabled={!canAddNewItem}
                    >
                      + Adicionar Case
                    </Button>
                    {isLimitReached && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Limite do plano atingido
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mensagem de erro */}
              {validationError && (
                <div className={`p-3 rounded-lg mb-4 ${isLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'}`}>
                  <div className="flex items-start gap-2">
                    {isLimitReached ? (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${isLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                      {validationError}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {cases.map((caseItem, index) => (
                  <div 
                    key={index}
                    ref={index === cases.length - 1 ? newCaseRef : undefined}
                    draggable
                    onDragStart={(e) => handleCaseDragStart(e, index)}
                    onDragOver={(e) => handleCaseDragOver(e, index)}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleCaseDragEnd}
                    onDrop={handleDrop}
                    className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                      draggingCase === index 
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
                          onDragStart={(e) => handleCaseDragStart(e, index)}
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
                              {caseItem?.name || "Case sem nome"}
                            </h4>
                            {caseItem?.name && caseItem?.description && caseItem?.result ? (
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
                                  Nome da Empresa
                                </label>
                                <Input
                                  value={caseItem?.name}
                                  onChange={(e) => updateCase(index, { name: e.target.value })}
                                  placeholder="Ex: Decora Fest"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Logo da Empresa
                                </label>
                                <ImageUpload
                                  label="Logo"
                                  currentImage={caseItem?.logo ?? ''}
                                  selectedFile={null}
                                  onFileChange={(file) => handleCaseImageChange(index, file)}
                                  aspectRatio="aspect-square"
                                  previewWidth={120}
                                  previewHeight={120}
                                  description="Logo da empresa (recomendado: 400x400px)"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                                  <Globe className="w-4 h-4" />
                                  Descrição
                                </label>
                                <Input
                                  value={caseItem?.description}
                                  onChange={(e) => updateCase(index, { description: e.target.value })}
                                  placeholder="E-commerce • Nacional"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4" />
                                  Resultado
                                </label>
                                <Input
                                  value={caseItem?.result}
                                  onChange={(e) => updateCase(index, { result: e.target.value })}
                                  placeholder="Faturamento +215%"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Ícone de Decoração
                                </label>
                                <IconSelector
                                  value={caseItem?.icon_decoration ?? ''}
                                  onChange={(value) => updateCase(index, { icon_decoration: value })}
                                  placeholder="TrendingUp"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Tags
                                </label>
                                <div className="space-y-2">
                                  <div className="flex gap-2">
                                    <Input
                                      value={editingCaseTags[index] || ''}
                                      onChange={(e) => setEditingCaseTags(prev => ({
                                        ...prev,
                                        [index]: e.target.value
                                      }))}
                                      placeholder="Nova tag"
                                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleAddTagToCase(index, editingCaseTags[index] || '');
                                        }
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      onClick={() => handleAddTagToCase(index, editingCaseTags[index] || '')}
                                      variant="primary"
                                      className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                                    >
                                      Adicionar
                                    </Button>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-2">
                                    {caseItem?.tags?.map((tag, tagIndex) => (
                                      <div
                                        key={tagIndex}
                                        className="flex items-center gap-1 px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-full"
                                      >
                                        <span className="text-sm">{tag}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveTagFromCase(index, tagIndex)}
                                          className="ml-1 text-[var(--color-primary)] hover:text-red-500"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          onClick={() => removeCase(index)}
                          variant="danger"
                          className="whitespace-nowrap bg-red-600 hover:bg-red-700 border-none"
                        >
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

        {/* Seção Configurações */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações do Carrossel"
            section="config"
            icon={Palette}
            isExpanded={expandedSections.config}
            onToggle={() => toggleSection("config")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.config ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-8">
                {/* Tema */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--color-secondary)]">
                    Configurações de Tema
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Tema"
                      value={carouselData.config.theme}
                      onChange={(e) => updateNested('config.theme', e.target.value)}
                      placeholder="Ex: Dark/Gold"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>

                {/* Cores */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--color-secondary)]">
                    Paleta de Cores
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ThemePropertyInput
                      property="bg"
                      label="Ouro Primário"
                      description="Cor de destaque principal"
                      currentHex={carouselData.config.colors.primary_gold}
                      tailwindClass={hexToTailwindBgClass(carouselData.config.colors.primary_gold)}
                      onThemeChange={(_, hex) => handleColorChange('primary_gold', hex)}
                    />

                    <ThemePropertyInput
                      property="bg"
                      label="Fundo Escuro"
                      description="Cor de fundo principal"
                      currentHex={carouselData.config.colors.bg_dark}
                      tailwindClass={hexToTailwindBgClass(carouselData.config.colors.bg_dark)}
                      onThemeChange={(_, hex) => handleColorChange('bg_dark', hex)}
                    />

                    <ThemePropertyInput
                      property="bg"
                      label="Fundo do Card"
                      description="Cor de fundo dos cards"
                      currentHex={carouselData.config.colors.card_bg}
                      tailwindClass={hexToTailwindBgClass(carouselData.config.colors.card_bg)}
                      onThemeChange={(_, hex) => handleColorChange('card_bg', hex)}
                    />
                  </div>
                </div>

                {/* Comportamento */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--color-secondary)]">
                    Comportamento do Carrossel
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background-body)]">
                      <div>
                        <h4 className="font-medium text-[var(--color-secondary)]">Loop Infinito</h4>
                        <p className="text-sm text-[var(--color-secondary)]/70">
                          {carouselData.config.behavior.infinite_loop ? "Ativado" : "Desativado"}
                        </p>
                      </div>
                      <Switch
                        checked={carouselData.config.behavior.infinite_loop}
                        onCheckedChange={(checked) => updateNested('config.behavior.infinite_loop', checked)}
                      />
                    </div>

                    <Input
                      label="Tipo de Snap"
                      value={carouselData.config.behavior.snap_type}
                      onChange={(e) => updateNested('config.behavior.snap_type', e.target.value)}
                      placeholder="Ex: spring, inertia, none"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />

                    <Input
                      label="Responsividade"
                      value={carouselData.config.behavior.responsivity}
                      onChange={(e) => updateNested('config.behavior.responsivity', e.target.value)}
                      placeholder="Ex: Multi-Device Optimized"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] md:col-span-2"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Metadados */}
        <div className="space-y-4">
          <SectionHeader
            title="Metadados"
            section="metadata"
            icon={Tag}
            isExpanded={expandedSections.metadata}
            onToggle={() => toggleSection("metadata")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.metadata ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Autor"
                    value={carouselData.metadata.author}
                    onChange={(e) => updateNested('metadata.author', e.target.value)}
                    placeholder="Ex: Sistema IA"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Versão"
                    value={carouselData.metadata.version}
                    onChange={(e) => updateNested('metadata.version', e.target.value)}
                    placeholder="Ex: 1.0.0"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Categoria"
                    value={carouselData.metadata.category || ''}
                    onChange={(e) => updateNested('metadata.category', e.target.value)}
                    placeholder="Ex: testimonials, portfolio, results"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                {/* Tags do componente */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-[var(--color-secondary)] mb-1">Tags do Componente</h4>
                    <p className="text-sm text-[var(--color-secondary)]/70">
                      Tags para organização e filtro
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {carouselData.metadata.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-full"
                      >
                        <span className="text-sm">{tag}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newTags = [...carouselData.metadata.tags];
                            newTags.splice(index, 1);
                            updateNested('metadata.tags', newTags);
                          }}
                          className="ml-1 text-[var(--color-primary)] hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nova tag"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            const newTags = [...carouselData.metadata.tags, input.value.trim()];
                            updateNested('metadata.tags', newTags);
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Nova tag"]') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          const newTags = [...carouselData.metadata.tags, input.value.trim()];
                          updateNested('metadata.tags', newTags);
                          input.value = '';
                        }
                      }}
                      variant="primary"
                      className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                    >
                      Adicionar Tag
                    </Button>
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
          itemName="Carrossel"
          icon={Target}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Carrossel de Cases"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}