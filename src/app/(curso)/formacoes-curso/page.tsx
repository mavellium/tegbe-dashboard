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
  Layers,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Tag,
  Sparkles,
  Palette,
  Trash2,
  Plus,
  Heading,
  Zap,
  Link as LinkIcon
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { tailwindToHex, hexToTailwindTextClass, hexToTailwindBgClass } from "@/lib/colors";

interface ThemeColors {
  accentColor: string; // formato hex
  secondaryColor: string; // formato hex
}

interface HeaderData {
  badge: string;
  title: string;
  subtitle: string;
}

interface Module {
  id: string;
  phase: string;
  title: string;
  description: string;
  tags: string[];
  icon: string;
}

interface CTA {
  text: string;
  link: string;
}

interface TegProProtocolData {
  theme: ThemeColors;
  header: HeaderData;
  modules: Module[];
  cta: CTA;
}

const defaultTegProProtocolData: TegProProtocolData = {
  theme: {
    accentColor: "#FFD700",
    secondaryColor: "#C59D1F"
  },
  header: {
    badge: "O Protocolo TegPro",
    title: "Engenharia Reversa da Venda",
    subtitle: "Não é um curso. É a instalação do nosso sistema operacional dividido em 4 fases."
  },
  modules: [
    {
      id: "01",
      phase: "FASE DE FUNDAÇÃO",
      title: "Setup da Máquina",
      description: "Antes de acelerar, blindamos o chassi. Configuramos seu Business Manager e estruturamos o CRM.",
      tags: ["Setup Técnico", "Governança"],
      icon: "ph:wrench-bold"
    },
    {
      id: "02",
      phase: "FASE DE TRAÇÃO",
      title: "Tráfego de Alta Intenção",
      description: "Campanhas que buscam o 'lead comprador'. Estratégias validadas com milhões em verba.",
      tags: ["Google Ads", "Meta Ads"],
      icon: "ph:target-bold"
    },
    {
      id: "03",
      phase: "FASE DE CONVERSÃO",
      title: "Comercial & Scripts",
      description: "O tráfego traz o lead, o processo traz o dinheiro. Scripts de vendas e playbooks de objeções.",
      tags: ["Playbook", "Spin Selling"],
      icon: "ph:users-three-bold"
    },
    {
      id: "04",
      phase: "FASE DE ESCALA",
      title: "Automação & LTV",
      description: "Implementação de automações de follow-up, recuperação de vendas e estratégias de upsell.",
      tags: ["Automação", "Z-API"],
      icon: "ph:robot-bold"
    }
  ],
  cta: {
    text: "Ver Grade Detalhada",
    link: "#grade"
  }
};

const mergeWithDefaults = (apiData: any, defaultData: TegProProtocolData): TegProProtocolData => {
  if (!apiData) return defaultData;
  
  return {
    theme: {
      accentColor: apiData.theme?.accentColor || defaultData.theme.accentColor,
      secondaryColor: apiData.theme?.secondaryColor || defaultData.theme.secondaryColor,
    },
    header: {
      badge: apiData.header?.badge || defaultData.header.badge,
      title: apiData.header?.title || defaultData.header.title,
      subtitle: apiData.header?.subtitle || defaultData.header.subtitle,
    },
    modules: apiData.modules || defaultData.modules,
    cta: {
      text: apiData.cta?.text || defaultData.cta.text,
      link: apiData.cta?.link || defaultData.cta.link,
    },
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
  } = useJsonManagement<TegProProtocolData>({
    apiPath: "/api/tegbe-institucional/json/cursos-curso",
    defaultData: defaultTegProProtocolData,
    mergeFunction: mergeWithDefaults,
  });

  // Estados para drag & drop
  const [draggingModule, setDraggingModule] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    theme: true,
    header: true,
    modules: false,
    cta: false,
  });

  // Referência para novo item
  const newModuleRef = useRef<HTMLDivElement>(null);

  // Controle de planos
  const currentPlanType = 'pro';
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para módulos
  const handleAddModule = () => {
    const modules = pageData.modules;
    if (modules.length >= currentPlanLimit) {
      return false;
    }
    
    const newModule: Module = {
      id: `0${modules.length + 1}`,
      phase: "",
      title: "",
      description: "",
      tags: [""],
      icon: "ph:star-bold"
    };
    
    const updated = [...modules, newModule];
    updateNested('modules', updated);
    
    setTimeout(() => {
      newModuleRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const handleUpdateModule = (index: number, updates: Partial<Module>) => {
    const modules = pageData.modules;
    const updated = [...modules];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      updateNested('modules', updated);
    }
  };

  const handleUpdateModuleTag = (moduleIndex: number, tagIndex: number, value: string) => {
    const modules = pageData.modules;
    const updated = [...modules];
    if (moduleIndex >= 0 && moduleIndex < updated.length) {
      const updatedTags = [...updated[moduleIndex].tags];
      updatedTags[tagIndex] = value;
      updated[moduleIndex] = { ...updated[moduleIndex], tags: updatedTags };
      updateNested('modules', updated);
    }
  };

  const handleAddModuleTag = (moduleIndex: number) => {
    const modules = pageData.modules;
    const updated = [...modules];
    if (moduleIndex >= 0 && moduleIndex < updated.length) {
      const updatedTags = [...updated[moduleIndex].tags, ""];
      updated[moduleIndex] = { ...updated[moduleIndex], tags: updatedTags };
      updateNested('modules', updated);
    }
  };

  const handleRemoveModuleTag = (moduleIndex: number, tagIndex: number) => {
    const modules = pageData.modules;
    const updated = [...modules];
    if (moduleIndex >= 0 && moduleIndex < updated.length) {
      const updatedTags = updated[moduleIndex].tags.filter((_, i) => i !== tagIndex);
      if (updatedTags.length === 0) updatedTags.push(""); // Mantém pelo menos um vazio
      updated[moduleIndex] = { ...updated[moduleIndex], tags: updatedTags };
      updateNested('modules', updated);
    }
  };

  const handleRemoveModule = (index: number) => {
    const modules = pageData.modules;
    
    if (modules.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyModule: Module = {
        id: "01",
        phase: "",
        title: "",
        description: "",
        tags: [""],
        icon: "ph:star-bold"
      };
      updateNested('modules', [emptyModule]);
    } else {
      const updated = modules.filter((_, i) => i !== index);
      // Atualiza IDs sequenciais
      const renumbered = updated.map((module, i) => ({
        ...module,
        id: `0${i + 1}`
      }));
      updateNested('modules', renumbered);
    }
  };

  // Funções de drag & drop para módulos
  const handleModuleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingModule(index);
  };

  const handleModuleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingModule === null || draggingModule === index) return;
    
    const modules = pageData.modules;
    const updated = [...modules];
    const draggedItem = updated[draggingModule];
    
    // Remove o item arrastado
    updated.splice(draggingModule, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingModule ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    // Renumber IDs
    const renumbered = updated.map((module, i) => ({
      ...module,
      id: `0${i + 1}`
    }));
    
    updateNested('modules', renumbered);
    setDraggingModule(index);
  };

  const handleModuleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingModule(null);
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

  // Funções para atualizar cores do tema
  const handleAccentColorChange = (hexColor: string) => {
    updateNested('theme.accentColor', hexColor);
  };

  const handleSecondaryColorChange = (hexColor: string) => {
    updateNested('theme.secondaryColor', hexColor);
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
  const isModuleValid = (module: Module): boolean => {
    return module.phase.trim() !== '' && 
           module.title.trim() !== '' && 
           module.description.trim() !== '' &&
           module.icon.trim() !== '' &&
           module.tags.some(tag => tag.trim() !== '');
  };

  const modules = pageData.modules;
  const isModulesLimitReached = modules.length >= currentPlanLimit;
  const canAddNewModule = !isModulesLimitReached;
  const modulesCompleteCount = modules.filter(isModuleValid).length;
  const modulesTotalCount = modules.length;

  const modulesValidationError = isModulesLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} módulos).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Theme (2 campos)
    total += 2;
    if (pageData.theme.accentColor?.trim()) completed++;
    if (pageData.theme.secondaryColor?.trim()) completed++;

    // Header (3 campos)
    total += 3;
    if (pageData.header.badge.trim()) completed++;
    if (pageData.header.title.trim()) completed++;
    if (pageData.header.subtitle.trim()) completed++;

    // Modules
    modules.forEach(module => {
      // 4 campos principais: phase, title, description, icon
      total += 4;
      if (module.phase.trim()) completed++;
      if (module.title.trim()) completed++;
      if (module.description.trim()) completed++;
      if (module.icon.trim()) completed++;
      
      // Tags (pelo menos uma tag válida)
      total += 1;
      if (module.tags.some(tag => tag.trim())) completed++;
    });

    // CTA (2 campos)
    total += 2;
    if (pageData.cta.text.trim()) completed++;
    if (pageData.cta.link.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Layers}
      title="Gerenciar Protocolo TegPro"
      description="Configure o protocolo TegPro com suas fases e módulos"
      exists={!!exists}
      itemName="Protocolo TegPro"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Tema */}
        <div className="space-y-4">
          <SectionHeader
            title="Cores do Tema"
            section="theme"
            icon={Palette}
            isExpanded={expandedSections.theme}
            onToggle={() => toggleSection("theme")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.theme ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Configure as cores do protocolo
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  As cores serão usadas em toda a seção do protocolo
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ThemePropertyInput
                  property="bg"
                  label="Cor de Destaque (Accent)"
                  description="Cor principal para elementos de destaque"
                  currentHex={pageData.theme.accentColor}
                  tailwindClass={hexToTailwindBgClass(pageData.theme.accentColor)}
                  onThemeChange={(_, hex) => handleAccentColorChange(hex)}
                />

                <ThemePropertyInput
                  property="bg"
                  label="Cor Secundária"
                  description="Cor para elementos secundários"
                  currentHex={pageData.theme.secondaryColor}
                  tailwindClass={hexToTailwindBgClass(pageData.theme.secondaryColor)}
                  onThemeChange={(_, hex) => handleSecondaryColorChange(hex)}
                />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Cabeçalho */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho do Protocolo"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Badge
                    </label>
                    <Input
                      value={pageData.header.badge}
                      onChange={(e) => updateNested('header.badge', e.target.value)}
                      placeholder="Ex: O Protocolo TegPro"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Título Principal</label>
                    <Input
                      value={pageData.header.title}
                      onChange={(e) => updateNested('header.title', e.target.value)}
                      placeholder="Ex: Engenharia Reversa da Venda"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Subtítulo
                    </label>
                    <TextArea
                      value={pageData.header.subtitle}
                      onChange={(e) => updateNested('header.subtitle', e.target.value)}
                      placeholder="Ex: Não é um curso. É a instalação do nosso sistema operacional..."
                      rows={3}
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Módulos */}
        <div className="space-y-4">
          <SectionHeader
            title="Módulos do Protocolo"
            section="modules"
            icon={Layers}
            isExpanded={expandedSections.modules}
            onToggle={() => toggleSection("modules")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.modules ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-8">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">Fases e Módulos</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-[var(--color-secondary)]/70">
                            {modulesCompleteCount} de {modulesTotalCount} completos
                          </span>
                        </div>
                        <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          Limite: {currentPlanType === 'pro' ? '10' : '5'} módulos
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        type="button"
                        onClick={handleAddModule}
                        variant="primary"
                        className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                        disabled={!canAddNewModule}
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Módulo
                      </Button>
                      {isModulesLimitReached && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Limite do plano atingido
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mensagem de erro */}
                  {modulesValidationError && (
                    <div className={`p-3 rounded-lg ${isModulesLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                      <div className="flex items-start gap-2">
                        {isModulesLimitReached ? (
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={`text-sm ${isModulesLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                          {modulesValidationError}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {modules.map((module, index) => (
                      <div 
                        key={`module-${module.id}-${index}`}
                        ref={index === modules.length - 1 ? newModuleRef : undefined}
                        draggable
                        onDragStart={(e) => handleModuleDragStart(e, index)}
                        onDragOver={(e) => handleModuleDragOver(e, index)}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragEnd={handleModuleDragEnd}
                        onDrop={handleDrop}
                        className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                          draggingModule === index 
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
                              onDragStart={(e) => handleModuleDragStart(e, index)}
                            >
                              <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                            </div>
                            
                            {/* Indicador de posição */}
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-medium text-[var(--color-secondary)]/70">
                                {module.id}
                              </span>
                              <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-[var(--color-secondary)]">
                                  Módulo {module.id} - {module.title || "Sem título"}
                                </h4>
                                {isModuleValid(module) ? (
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
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Fase</label>
                                    <Input
                                      value={module.phase}
                                      onChange={(e) => handleUpdateModule(index, { phase: e.target.value })}
                                      placeholder="Ex: FASE DE FUNDAÇÃO"
                                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Título do Módulo</label>
                                    <Input
                                      value={module.title}
                                      onChange={(e) => handleUpdateModule(index, { title: e.target.value })}
                                      placeholder="Ex: Setup da Máquina"
                                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Ícone</label>
                                    <IconSelector
                                      value={module.icon}
                                      onChange={(value) => handleUpdateModule(index, { icon: value })}
                                      placeholder="ph:wrench-bold"
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Descrição</label>
                                    <TextArea
                                      value={module.description}
                                      onChange={(e) => handleUpdateModule(index, { description: e.target.value })}
                                      placeholder="Descrição detalhada do módulo"
                                      rows={3}
                                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <label className="block text-sm font-medium text-[var(--color-secondary)]">Tags</label>
                                      <Button
                                        type="button"
                                        onClick={() => handleAddModuleTag(index)}
                                        variant="secondary"
                                        className="text-xs h-6 px-2"
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Adicionar Tag
                                      </Button>
                                    </div>
                                    <div className="space-y-2">
                                      {module.tags.map((tag, tagIndex) => (
                                        <div key={tagIndex} className="flex items-center gap-2">
                                          <Input
                                            value={tag}
                                            onChange={(e) => handleUpdateModuleTag(index, tagIndex, e.target.value)}
                                            placeholder="Ex: Setup Técnico"
                                            className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                          />
                                          {module.tags.length > 1 && (
                                            <Button
                                              type="button"
                                              onClick={() => handleRemoveModuleTag(index, tagIndex)}
                                              variant="danger"
                                              className="h-9 w-9 p-0 flex items-center justify-center"
                                            >
                                              <Trash2 className="w-4 h-4" color="white" fill="white" />
                                            </Button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                    <p className="text-xs text-[var(--color-secondary)]/50">
                                      Adicione tags para categorizar o módulo
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button
                              type="button"
                              onClick={() => handleRemoveModule(index)}
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
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção CTA */}
        <div className="space-y-4">
          <SectionHeader
            title="Call to Action"
            section="cta"
            icon={LinkIcon}
            isExpanded={expandedSections.cta}
            onToggle={() => toggleSection("cta")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.cta ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Configuração da Ação Final
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Configure o botão de call to action que aparece no final da seção
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Texto do Botão
                  </label>
                  <Input
                    value={pageData.cta.text}
                    onChange={(e) => updateNested('cta.text', e.target.value)}
                    placeholder="Ex: Ver Grade Detalhada"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Link do Botão
                  </label>
                  <Input
                    value={pageData.cta.link}
                    onChange={(e) => updateNested('cta.link', e.target.value)}
                    placeholder="Ex: #grade, /protocolo-completo"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/50">
                    Pode ser um link interno (#seção) ou externo (/página)
                  </p>
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
          itemName="Protocolo TegPro"
          icon={Layers}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração do Protocolo TegPro"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}