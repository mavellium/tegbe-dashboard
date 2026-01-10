/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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
  Shield
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { useListState } from "@/hooks/useListState";
import { Button } from "@/components/Button";

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
        { "id": "", "alt": "", "src": "" },
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
  } = useJsonManagement<AuthoritySectionData>({
    apiPath: "/api/tegbe-institucional/json/metricas",
    defaultData: defaultAuthoritySectionData,
    mergeFunction: mergeWithDefaults,
  });

  // Hook para gerenciar stats_bento como lista dinâmica
  const statsBentoList = useListState<StatBento>({
    initialItems: pageData.authority_section.stats_bento,
    defaultItem: {
      id: '',
      type: 'standard',
      value: 0,
      prefix: '',
      suffix: '',
      label: '',
      theme: 'light'
    },
    validationFields: ['label', 'value'],
    enableDragDrop: true
  });

  // Hook para gerenciar partners como lista dinâmica
  const partnersList = useListState<Partner>({
    initialItems: pageData.authority_section.infrastructure.partners,
    defaultItem: {
      id: '',
      alt: '',
      src: ''
    },
    validationFields: ['alt', 'src'],
    enableDragDrop: true
  });

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

  // Função para adicionar estatística
  const handleAddStat = () => {
    const success = statsBentoList.addItem();
    
    if (success) {
      // Gera ID automático
      const lastIndex = statsBentoList.items.length - 1;
      const newId = `stat_${Date.now()}_${lastIndex}`;
      
      statsBentoList.updateItem(lastIndex, { 
        id: newId
      });
    } else {
      console.warn(statsBentoList.validationError);
    }
  };

  // Função para adicionar parceiro
  const handleAddPartner = () => {
    const success = partnersList.addItem();
    
    if (success) {
      // Gera ID automático
      const lastIndex = partnersList.items.length - 1;
      const newId = `partner_${Date.now()}_${lastIndex}`;
      
      partnersList.updateItem(lastIndex, { 
        id: newId
      });
    } else {
      console.warn(partnersList.validationError);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Atualiza os arrays no pageData antes de salvar
    updateNested('authority_section.stats_bento', statsBentoList.items);
    updateNested('authority_section.infrastructure.partners', partnersList.items);
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Funções de drag & drop para stats
  const handleStatDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    statsBentoList.startDrag(index);
  };

  const handleStatDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    statsBentoList.handleDragOver(index);
  };

  const handleStatDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    statsBentoList.endDrag();
  };

  // Funções de drag & drop para partners
  const handlePartnerDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    partnersList.startDrag(index);
  };

  const handlePartnerDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    partnersList.handleDragOver(index);
  };

  const handlePartnerDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    partnersList.endDrag();
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

  // Função para remover estatística
  const handleRemoveStat = (index: number) => {
    statsBentoList.removeItem(index);
  };

  // Função para remover parceiro
  const handleRemovePartner = (index: number) => {
    partnersList.removeItem(index);
  };

  // Função para lidar com upload de imagem do parceiro
  const handlePartnerImageUpload = (index: number, file: File | null) => {
    if (file) {
      // Em uma implementação real, aqui você faria upload para um CDN/S3
      const objectUrl = URL.createObjectURL(file);
      partnersList.updateItem(index, { src: objectUrl });
    } else {
      partnersList.updateItem(index, { src: '' });
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

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Header (4 campos)
    total += 4;
    if (pageData.authority_section.header.label.trim()) completed++;
    if (pageData.authority_section.header.title_main.trim()) completed++;
    if (pageData.authority_section.header.title_sub.trim()) completed++;
    if (pageData.authority_section.header.live_data_label.trim()) completed++;

    // Stats Bento (lista dinâmica - cada stat tem 7 campos)
    total += statsBentoList.items.length * 7;
    statsBentoList.items.forEach(stat => {
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

    // Partners (lista dinâmica - cada partner tem 3 campos)
    total += partnersList.items.length * 3;
    partnersList.items.forEach(partner => {
      if (partner.alt.trim()) completed++;
      if (partner.src.trim()) completed++;
      // ID é automático
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

        {/* Seção Stats Bento - COM LISTA DINÂMICA */}
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
                          {statsBentoList.completeCount} de {statsBentoList.totalCount} completos
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        Limite: {statsBentoList.currentPlanType === 'pro' ? '10' : '5'} itens
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddStat}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                      disabled={!statsBentoList.canAddNewItem}
                    >
                      + Adicionar Estatística
                    </Button>
                    {statsBentoList.isLimitReached && (
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
              {statsBentoList.validationError && (
                <div className={`p-3 rounded-lg ${statsBentoList.isLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                  <div className="flex items-start gap-2">
                    {statsBentoList.isLimitReached ? (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${statsBentoList.isLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                      {statsBentoList.validationError}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {statsBentoList.filteredItems.map((stat, index) => {
                  const StatIcon = getStatTypeIcon(stat.type);
                  return (
                    <div 
                      key={`stat-${stat.id || index}`}
                      ref={index === statsBentoList.filteredItems.length - 1 ? statsBentoList.newItemRef : undefined}
                      draggable
                      onDragStart={(e) => handleStatDragStart(e, index)}
                      onDragOver={(e) => handleStatDragOver(e, index)}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragEnd={handleStatDragEnd}
                      onDrop={handleDrop}
                      className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                        statsBentoList.draggingItem === index 
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
                              {stat.label && stat.value ? (
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
                                      onChange={(e) => statsBentoList.updateItem(index, { type: e.target.value as 'hero' | 'standard' | 'mini' })}
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
                                      onChange={(e) => statsBentoList.updateItem(index, { theme: e.target.value as 'dark' | 'light' | 'accent' })}
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
                                      onChange={(e) => statsBentoList.updateItem(index, { value: parseFloat(e.target.value) || 0 })}
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
                                        onChange={(e) => statsBentoList.updateItem(index, { prefix: e.target.value })}
                                        placeholder="Ex: +"
                                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <label className="block text-sm font-medium text-[var(--color-secondary)]">Sufixo</label>
                                      <Input
                                        value={stat.suffix}
                                        onChange={(e) => statsBentoList.updateItem(index, { suffix: e.target.value })}
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
                                      onChange={(e) => statsBentoList.updateItem(index, { label: e.target.value })}
                                      placeholder="Ex: GMV (Faturamento) Gerenciado"
                                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                    />
                                  </div>
                                  
                                  {stat.type === 'hero' && (
                                    <div className="space-y-2">
                                      <label className="block text-sm font-medium text-[var(--color-secondary)]">Badge</label>
                                      <Input
                                        value={stat.badge || ''}
                                        onChange={(e) => statsBentoList.updateItem(index, { badge: e.target.value })}
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
                                    onChange={(value) => statsBentoList.updateItem(index, { icon: value })}
                                    placeholder="solar:wad-of-money-bold-duotone"
                                  />
                                  <p className="text-xs text-[var(--color-secondary)]/50">
                                    Ícones recomendados para tipos hero e mini
                                  </p>
                                </div>
                                x
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            onClick={() => handleRemoveStat(index)}
                            variant="danger"
                            className="whitespace-nowrap bg-red-600 hover:bg-red-700 border-none"
                          >
                            <Trash2 className="w-4 h-4" />
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
                          {partnersList.completeCount} de {partnersList.totalCount} completos
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        Limite: {partnersList.currentPlanType === 'pro' ? '20' : '10'} itens
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddPartner}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                      disabled={!partnersList.canAddNewItem}
                    >
                      + Adicionar Parceiro
                    </Button>
                    {partnersList.isLimitReached && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Limite do plano atingido
                      </p>
                    )}
                  </div>
                </div>

                {/* Mensagem de erro */}
                {partnersList.validationError && (
                  <div className={`p-3 rounded-lg ${partnersList.isLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                    <div className="flex items-start gap-2">
                      {partnersList.isLimitReached ? (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm ${partnersList.isLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                        {partnersList.validationError}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {partnersList.filteredItems.map((partner, index) => (
                    <div 
                      key={`partner-${partner.id || index}`}
                      ref={index === partnersList.filteredItems.length - 1 ? partnersList.newItemRef : undefined}
                      draggable
                      onDragStart={(e) => handlePartnerDragStart(e, index)}
                      onDragOver={(e) => handlePartnerDragOver(e, index)}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragEnd={handlePartnerDragEnd}
                      onDrop={handleDrop}
                      className={`p-4 border border-[var(--color-border)] rounded-lg space-y-4 transition-all duration-200 ${
                        partnersList.draggingItem === index 
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
                              {partner.alt && partner.src ? (
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
                                    onChange={(e) => partnersList.updateItem(index, { alt: e.target.value })}
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
                                    onChange={(e) => partnersList.updateItem(index, { src: e.target.value })}
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
                            onClick={() => handleRemovePartner(index)}
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
          itemName="Seção de Autoridade"
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
        itemName="Configuração da Seção de Autoridade"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}