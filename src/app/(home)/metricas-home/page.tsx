/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import IconSelector from "@/components/IconSelector";
import { ImageUpload } from "@/components/ImageUpload";
import { 
  Layout, 
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trophy,
  Trash2,
  TrendingUp,
  Users,
  Settings,
  Shield,
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

interface StatBento {
  id: string;
  type: 'hero' | 'standard' | 'mini';
  value: number;
  prefix: string;
  suffix: string;
  label: string;
  badge?: string;
  icon?: string;
  theme: 'dark' | 'light' | 'accent';
}

interface Partner {
  id: string;
  alt: string;
  src: string;
}

interface HeaderData {
  label: string;
  title_main: string;
  title_sub: string;
  live_data_label: string;
}

interface InfrastructureData {
  label: string;
  partners: Partner[];
}

interface AuthoritySectionData {
  authority_section: {
    header: HeaderData;
    stats_bento: StatBento[];
    infrastructure: InfrastructureData;
  };
}

const defaultAuthoritySectionData: AuthoritySectionData = {
  authority_section: {
    header: {
      label: "",
      title_main: "",
      title_sub: "",
      live_data_label: ""
    },
    stats_bento: [
      {
        id: "gmv_managed",
        type: "hero",
        value: 0,
        prefix: "",
        suffix: "",
        label: "",
        badge: "",
        icon: "solar:wad-of-money-bold-duotone",
        theme: "dark"
      }
    ],
    infrastructure: {
      label: "",
      partners: [
        { id: "", alt: "", src: "" },
      ]
    }
  }
};

const mergeWithDefaults = (apiData: any, defaultData: AuthoritySectionData): AuthoritySectionData => {
  if (!apiData) return defaultData;
  
  return {
    authority_section: {
      header: apiData.authority_section?.header || defaultData.authority_section.header,
      stats_bento: apiData.authority_section?.stats_bento || defaultData.authority_section.stats_bento,
      infrastructure: apiData.authority_section?.infrastructure || defaultData.authority_section.infrastructure,
    },
  };
};

export default function AuthoritySectionPage() {
  const { currentSite } = useSite();
  const currentPlanType = currentSite.planType;
  const currentStatPlanLimit = currentPlanType === 'pro' ? 10 : 5;
  const currentPartnerPlanLimit = currentPlanType === 'pro' ? 20 : 10;

  const {
    data: pageData,
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
  } = useJsonManagement<AuthoritySectionData>({
    apiPath: "/api/tegbe-institucional/json/metricas",
    defaultData: defaultAuthoritySectionData,
    mergeFunction: mergeWithDefaults,
  });

  // Estados para drag & drop
  const [draggingStat, setDraggingStat] = useState<number | null>(null);
  const [draggingPartner, setDraggingPartner] = useState<number | null>(null);
  
  // Referências para novos itens
  const newStatRef = useRef<HTMLDivElement>(null);
  const newPartnerRef = useRef<HTMLDivElement>(null);

  const [expandedSections, setExpandedSections] = useState({
    header: true,
    stats: true,
    partners: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para manipular a lista de stats
  const addStat = () => {
    const currentStats = [...pageData.authority_section.stats_bento];
    
    if (currentStats.length >= currentStatPlanLimit) {
      return false;
    }
    
    const newStat: StatBento = {
      id: `stat_${Date.now()}`,
      type: 'standard',
      value: 0,
      prefix: '',
      suffix: '',
      label: '',
      theme: 'light'
    };
    
    updateNested('authority_section.stats_bento', [...currentStats, newStat]);
    
    // Scroll para o novo item
    setTimeout(() => {
      newStatRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updateStat = (index: number, updates: Partial<StatBento>) => {
    const currentStats = [...pageData.authority_section.stats_bento];
    
    if (index >= 0 && index < currentStats.length) {
      currentStats[index] = { ...currentStats[index], ...updates };
      updateNested('authority_section.stats_bento', currentStats);
    }
  };

  const removeStat = (index: number) => {
    const currentStats = [...pageData.authority_section.stats_bento];
    
    if (currentStats.length <= 1) {
      // Mantém pelo menos um stat vazio
      updateNested('authority_section.stats_bento', [{
        id: `stat_${Date.now()}`,
        type: 'standard',
        value: 0,
        prefix: '',
        suffix: '',
        label: '',
        theme: 'light'
      }]);
    } else {
      currentStats.splice(index, 1);
      updateNested('authority_section.stats_bento', currentStats);
    }
  };

  // Funções para manipular a lista de partners
  const addPartner = () => {
    const currentPartners = [...pageData.authority_section.infrastructure.partners];
    
    if (currentPartners.length >= currentPartnerPlanLimit) {
      return false;
    }
    
    const newPartner: Partner = {
      id: `partner_${Date.now()}`,
      alt: "",
      src: ""
    };
    
    updateNested('authority_section.infrastructure.partners', [...currentPartners, newPartner]);
    
    // Scroll para o novo item
    setTimeout(() => {
      newPartnerRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updatePartner = (index: number, updates: Partial<Partner>) => {
    const currentPartners = [...pageData.authority_section.infrastructure.partners];
    
    if (index >= 0 && index < currentPartners.length) {
      currentPartners[index] = { ...currentPartners[index], ...updates };
      updateNested('authority_section.infrastructure.partners', currentPartners);
    }
  };

  const removePartner = (index: number) => {
    const currentPartners = [...pageData.authority_section.infrastructure.partners];
    
    if (currentPartners.length <= 1) {
      // Mantém pelo menos um partner vazio
      updateNested('authority_section.infrastructure.partners', [{
        id: `partner_${Date.now()}`,
        alt: "",
        src: ""
      }]);
    } else {
      currentPartners.splice(index, 1);
      updateNested('authority_section.infrastructure.partners', currentPartners);
    }
  };

  // Funções de drag & drop para stats
  const handleStatDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingStat(index);
  };

  const handleStatDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingStat === null || draggingStat === index) return;
    
    const currentStats = [...pageData.authority_section.stats_bento];
    const draggedStat = currentStats[draggingStat];
    
    // Remove o item arrastado
    currentStats.splice(draggingStat, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingStat ? index : index;
    currentStats.splice(newIndex, 0, draggedStat);
    
    updateNested('authority_section.stats_bento', currentStats);
    setDraggingStat(index);
  };

  const handleStatDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingStat(null);
  };

  // Funções de drag & drop para partners
  const handlePartnerDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingPartner(index);
  };

  const handlePartnerDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingPartner === null || draggingPartner === index) return;
    
    const currentPartners = [...pageData.authority_section.infrastructure.partners];
    const draggedPartner = currentPartners[draggingPartner];
    
    // Remove o item arrastado
    currentPartners.splice(draggingPartner, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingPartner ? index : index;
    currentPartners.splice(newIndex, 0, draggedPartner);
    
    updateNested('authority_section.infrastructure.partners', currentPartners);
    setDraggingPartner(index);
  };

  const handlePartnerDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingPartner(null);
  };

  const handleAddStat = () => {
    const success = addStat();
    if (!success) {
      console.warn(`Limite do plano ${currentPlanType} atingido (${currentStatPlanLimit} estatísticas)`);
    }
  };

  const handleAddPartner = () => {
    const success = addPartner();
    if (!success) {
      console.warn(`Limite do plano ${currentPlanType} atingido (${currentPartnerPlanLimit} parceiros)`);
    }
  };

  // Função para lidar com upload de imagem do parceiro
  const handlePartnerImageUpload = (index: number, file: File | null) => {
    const path = `authority_section.infrastructure.partners.${index}.src`;
    
    setFileState(path, file);
    
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      updatePartner(index, { src: objectUrl });
    } else {
      updatePartner(index, { src: '' });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Função para obter ícone baseado no tipo de stat
  const getStatTypeIcon = (type: string) => {
    switch (type) {
      case 'hero': return Trophy;
      case 'standard': return TrendingUp;
      case 'mini': return Shield;
      default: return TrendingUp;
    }
  };

  // Função para obter cor baseado no tema
  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'dark': return 'bg-gray-900 text-white';
      case 'light': return 'bg-white text-gray-900 border border-gray-200';
      case 'accent': return 'bg-blue-50 text-blue-900 border border-blue-200';
      default: return 'bg-white text-gray-900';
    }
  };

  // Cálculos de validação
  const isStatValid = (stat: StatBento): boolean => {
    return stat.label.trim() !== '' && stat.value !== undefined && stat.value !== null;
  };

  const isPartnerValid = (partner: Partner): boolean => {
    return partner.alt.trim() !== '' && partner.src.trim() !== '';
  };

  const stats = pageData.authority_section.stats_bento;
  const partners = pageData.authority_section.infrastructure.partners;
  
  const isStatLimitReached = stats.length >= currentStatPlanLimit;
  const isPartnerLimitReached = partners.length >= currentPartnerPlanLimit;
  
  const canAddNewStat = !isStatLimitReached;
  const canAddNewPartner = !isPartnerLimitReached;
  
  const completeStatCount = stats.filter(isStatValid).length;
  const completePartnerCount = partners.filter(isPartnerValid).length;
  
  const totalStatCount = stats.length;
  const totalPartnerCount = partners.length;
  
  const statValidationError = isStatLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentStatPlanLimit} estatísticas).`
    : null;
    
  const partnerValidationError = isPartnerLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPartnerPlanLimit} parceiros).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Header (4 campos)
    total += 4;
    if (pageData.authority_section.header.label.trim()) completed++;
    if (pageData.authority_section.header.title_main.trim()) completed++;
    if (pageData.authority_section.header.title_sub.trim()) completed++;
    if (pageData.authority_section.header.live_data_label.trim()) completed++;

    // Stats Bento
    total += stats.length * 7;
    stats.forEach(stat => {
      if (stat.label.trim()) completed++;
      if (stat.value !== undefined && stat.value !== null) completed++;
      if (stat.type.trim()) completed++;
      if (stat.theme.trim()) completed++;
      if (stat.prefix !== undefined) completed++;
      if (stat.suffix !== undefined) completed++;
      // badge e icon são opcionais
    });

    // Infrastructure Label (1 campo)
    total += 1;
    if (pageData.authority_section.infrastructure.label.trim()) completed++;

    // Partners
    total += partners.length * 2; // alt e src
    partners.forEach(partner => {
      if (partner.alt.trim()) completed++;
      if (partner.src.trim()) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Trophy}
      title="Gerenciar Seção de Métricas"
      description="Configure estatísticas, parceiros e conteúdo da seção de métricas"
      exists={!!exists}
      itemName="Seção de Métricas"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho da Seção"
            section="header"
            icon={Trophy}
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
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Label
                  </label>
                  <Input
                    value={pageData.authority_section.header.label}
                    onChange={(e) => updateNested('authority_section.header.label', e.target.value)}
                    placeholder="Ex: Performance Auditada"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Título Principal
                  </label>
                  <Input
                    value={pageData.authority_section.header.title_main}
                    onChange={(e) => updateNested('authority_section.header.title_main', e.target.value)}
                    placeholder="Ex: Não prometemos."
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Título Secundário
                  </label>
                  <Input
                    value={pageData.authority_section.header.title_sub}
                    onChange={(e) => updateNested('authority_section.header.title_sub', e.target.value)}
                    placeholder="Ex: Nós provamos."
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Label dos Dados em Tempo Real
                  </label>
                  <Input
                    value={pageData.authority_section.header.live_data_label}
                    onChange={(e) => updateNested('authority_section.header.live_data_label', e.target.value)}
                    placeholder="Ex: Live Data 2026"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Stats Bento */}
        <div className="space-y-4">
          <SectionHeader
            title="Estatísticas (Bento Grid)"
            section="stats"
            icon={TrendingUp}
            isExpanded={expandedSections.stats}
            onToggle={() => toggleSection("stats")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.stats ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Configure as estatísticas do grid
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {completeStatCount} de {totalStatCount} completos
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        Limite: {currentStatPlanLimit} estatísticas
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddStat}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                      disabled={!canAddNewStat}
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Estatística
                    </Button>
                    {isStatLimitReached && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Limite do plano atingido
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Configure as estatísticas que aparecem no grid. Diferentes tipos (hero, standard, mini) criam diferentes layouts.
                </p>
              </div>

              {/* Mensagem de erro */}
              {statValidationError && (
                <div className={`p-3 rounded-lg mb-4 ${isStatLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'}`}>
                  <div className="flex items-start gap-2">
                    {isStatLimitReached ? (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${isStatLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                      {statValidationError}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {stats.map((stat, index) => {
                  const StatIcon = getStatTypeIcon(stat.type);
                  return (
                    <div 
                      key={stat.id}
                      ref={index === stats.length - 1 ? newStatRef : undefined}
                      draggable
                      onDragStart={(e) => handleStatDragStart(e, index)}
                      onDragOver={(e) => handleStatDragOver(e, index)}
                      onDragEnd={handleStatDragEnd}
                      className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                        draggingStat === index 
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
                            onDragStart={(e) => handleStatDragStart(e, index)}
                          >
                            <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                          </div>
                          
                          {/* Indicador de tipo */}
                          <div className="flex flex-col items-center">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getThemeColor(stat.theme)}`}>
                              <StatIcon className="w-5 h-5" />
                            </div>
                            <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  stat.type === 'hero' ? 'bg-purple-900/20 text-purple-700' :
                                  stat.type === 'standard' ? 'bg-blue-900/20 text-blue-700' :
                                  'bg-green-900/20 text-green-700'
                                }`}>
                                  {stat.type}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  stat.theme === 'dark' ? 'bg-gray-900 text-white' :
                                  stat.theme === 'light' ? 'bg-gray-100 text-gray-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {stat.theme}
                                </span>
                              </div>
                              {isStatValid(stat) ? (
                                <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                  Completo
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                  Incompleto
                                </span>
                              )}
                            </div>
                            
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                      Tipo
                                    </label>
                                    <select
                                      value={stat.type}
                                      onChange={(e) => updateStat(index, { type: e.target.value as 'hero' | 'standard' | 'mini' })}
                                      className="w-full px-3 py-2 bg-[var(--color-background-body)] border border-[var(--color-border)] rounded text-[var(--color-secondary)]"
                                    >
                                      <option value="hero">Hero (Grande)</option>
                                      <option value="standard">Standard (Médio)</option>
                                      <option value="mini">Mini (Pequeno)</option>
                                    </select>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Tema</label>
                                    <select
                                      value={stat.theme}
                                      onChange={(e) => updateStat(index, { theme: e.target.value as 'dark' | 'light' | 'accent' })}
                                      className="w-full px-3 py-2 bg-[var(--color-background-body)] border border-[var(--color-border)] rounded text-[var(--color-secondary)]"
                                    >
                                      <option value="dark">Dark (Escuro)</option>
                                      <option value="light">Light (Claro)</option>
                                      <option value="accent">Accent (Acentuado)</option>
                                    </select>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Valor</label>
                                    <Input
                                      type="number"
                                      value={stat.value}
                                      onChange={(e) => updateStat(index, { value: parseFloat(e.target.value) || 0 })}
                                      placeholder="Ex: 100"
                                      step="0.1"
                                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <label className="block text-sm font-medium text-[var(--color-secondary)]">Prefixo</label>
                                      <Input
                                        value={stat.prefix}
                                        onChange={(e) => updateStat(index, { prefix: e.target.value })}
                                        placeholder="Ex: +"
                                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <label className="block text-sm font-medium text-[var(--color-secondary)]">Sufixo</label>
                                      <Input
                                        value={stat.suffix}
                                        onChange={(e) => updateStat(index, { suffix: e.target.value })}
                                        placeholder="Ex: M, k, x"
                                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Label</label>
                                    <Input
                                      value={stat.label}
                                      onChange={(e) => updateStat(index, { label: e.target.value })}
                                      placeholder="Ex: GMV (Faturamento) Gerenciado"
                                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                    />
                                  </div>
                                  
                                  {stat.type === 'hero' && (
                                    <div className="space-y-2">
                                      <label className="block text-sm font-medium text-[var(--color-secondary)]">Badge</label>
                                      <Input
                                        value={stat.badge || ''}
                                        onChange={(e) => updateStat(index, { badge: e.target.value })}
                                        placeholder="Ex: Recorde Anual"
                                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Ícone (opcional para alguns tipos) */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Ícone (Opcional)
                                  </label>
                                  <IconSelector
                                    value={stat.icon || ''}
                                    onChange={(value) => updateStat(index, { icon: value })}
                                    placeholder="solar:wad-of-money-bold-duotone"
                                  />
                                  <p className="text-xs text-[var(--color-secondary)]/50">
                                    Ícones recomendados para tipos hero e mini
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            onClick={() => removeStat(index)}
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
            </Card>
          </motion.div>
        </div>

        {/* Seção Infraestrutura e Parceiros */}
        <div className="space-y-4">
          <SectionHeader
            title="Infraestrutura e Parceiros"
            section="partners"
            icon={Settings}
            isExpanded={expandedSections.partners}
            onToggle={() => toggleSection("partners")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.partners ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              {/* Label da Infraestrutura */}
              <div className="mb-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Label da Infraestrutura
                  </label>
                  <Input
                    value={pageData.authority_section.infrastructure.label}
                    onChange={(e) => updateNested('authority_section.infrastructure.label', e.target.value)}
                    placeholder="Ex: Infraestrutura Certificada"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>

              {/* Lista de Parceiros */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Parceiros
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {completePartnerCount} de {totalPartnerCount} completos
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        Limite: {currentPartnerPlanLimit} parceiros
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddPartner}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                      disabled={!canAddNewPartner}
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Parceiro
                    </Button>
                    {isPartnerLimitReached && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Limite do plano atingido
                      </p>
                    )}
                  </div>
                </div>

                {/* Mensagem de erro */}
                {partnerValidationError && (
                  <div className={`p-3 rounded-lg mb-4 ${isPartnerLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'}`}>
                    <div className="flex items-start gap-2">
                      {isPartnerLimitReached ? (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm ${isPartnerLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                        {partnerValidationError}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {partners.map((partner, index) => (
                    <div 
                      key={partner.id}
                      ref={index === partners.length - 1 ? newPartnerRef : undefined}
                      draggable
                      onDragStart={(e) => handlePartnerDragStart(e, index)}
                      onDragOver={(e) => handlePartnerDragOver(e, index)}
                      onDragEnd={handlePartnerDragEnd}
                      className={`p-4 border border-[var(--color-border)] rounded-lg space-y-4 transition-all duration-200 ${
                        draggingPartner === index 
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
                            onDragStart={(e) => handlePartnerDragStart(e, index)}
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
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <h4 className="font-medium text-[var(--color-secondary)]">
                                {partner.alt || "Parceiro sem nome"}
                              </h4>
                              {isPartnerValid(partner) ? (
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
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Nome do Parceiro
                                  </label>
                                  <Input
                                    value={partner.alt}
                                    onChange={(e) => updatePartner(index, { alt: e.target.value })}
                                    placeholder="Ex: Mercado Livre"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    URL da Imagem
                                  </label>
                                  <Input
                                    value={partner.src}
                                    onChange={(e) => updatePartner(index, { src: e.target.value })}
                                    placeholder="https://exemplo.com/logo.svg"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                              </div>
                              
                              <div className="lg:col-span-2">
                                <ImageUpload
                                  label="Logo do Parceiro"
                                  currentImage={partner.src}
                                  selectedFile={null}
                                  onFileChange={(file) => handlePartnerImageUpload(index, file)}
                                  description="Faça upload ou cole a URL do logo do parceiro"
                                  aspectRatio="aspect-square"
                                  previewWidth={150}
                                  previewHeight={150}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            onClick={() => removePartner(index)}
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
          itemName="Seção de Métricas"
          icon={Trophy}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração da Seção de Métricas"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}