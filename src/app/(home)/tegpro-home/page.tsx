/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Switch } from "@/components/Switch";
import IconSelector from "@/components/IconSelector";
import { 
  Layout, 
  TextIcon,
  ListIcon,
  Zap,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Palette,
  Tag,
  Settings,
  Crown,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Target
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { useListState } from "@/hooks/useListState";
import { Button } from "@/components/Button";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { hexToTailwindBgClass, tailwindToHex } from "@/lib/colors";

interface Track {
  id: string;
  title: string;
  desc: string;
  icon: string;
  enabled: boolean;
  order: number;
}

interface TegProRefinedData {
  tegpro_refined: {
    theme: {
      bg_section: string;
      accent_gold: string;
      gold_gradient: string;
      style: string;
    };
    header: {
      tag: string;
      title: string;
      subtitle: string;
    };
    hero_card: {
      id: string;
      title: string;
      subtitle: string;
      description: string;
      badge: string;
      cta: string;
      href: string;
      enabled: boolean;
    };
    tracks: Track[];
    visual_metadata: {
      grain_opacity: string;
      glow_radius: string;
      border_style: string;
    };
  };
}

const defaultTegProData: TegProRefinedData = {
  tegpro_refined: {
    theme: {
      bg_section: "#050505",
      accent_gold: "#C5A059",
      gold_gradient: "linear-gradient(135deg, #C5A059 0%, #8E7037 100%)",
      style: "Cinematic Dark / Higher Management"
    },
    header: {
      tag: "Higher Management",
      title: "TegPro Academy",
      subtitle: "A ciência por trás da gestão de e-commerces que escalam com previsibilidade e lucro real."
    },
    hero_card: {
      id: "management_method",
      title: "Gestão de E-commerce.",
      subtitle: "O Método TegPro.",
      description: "Abra a caixa preta da operação. Domine CMV, squads e engenharia logística com quem dita o ritmo do mercado.",
      badge: "Formação de Elite",
      cta: "Conhecer Metodologia",
      href: "/cursos",
      enabled: true
    },
    tracks: [
      {
        id: "track_operation",
        title: "Operação Implacável",
        desc: "Do setup à medalha Platinum.",
        icon: "solar:settings-minimalistic-linear",
        enabled: true,
        order: 0
      },
      {
        id: "track_finance",
        title: "Finanças & Margem",
        desc: "O código do lucro real.",
        icon: "solar:wad-of-money-linear",
        enabled: true,
        order: 1
      },
      {
        id: "track_squads",
        title: "Liderança de Squads",
        desc: "Gestão de times A-Players.",
        icon: "solar:users-group-two-rounded-linear",
        enabled: true,
        order: 2
      }
    ],
    visual_metadata: {
      grain_opacity: "0.03",
      glow_radius: "1000px",
      border_style: "Surface Design (Subtle Border)"
    }
  }
};

const mergeWithDefaults = (apiData: any, defaultData: TegProRefinedData): TegProRefinedData => {
  if (!apiData) return defaultData;
  
  // Se a API retornou diretamente o objeto tegpro_refined
  const data = apiData.tegpro_refined || apiData;
  
  return {
    tegpro_refined: {
      theme: {
        bg_section: data.theme?.bg_section || defaultData.tegpro_refined.theme.bg_section,
        accent_gold: data.theme?.accent_gold || defaultData.tegpro_refined.theme.accent_gold,
        gold_gradient: data.theme?.gold_gradient || defaultData.tegpro_refined.theme.gold_gradient,
        style: data.theme?.style || defaultData.tegpro_refined.theme.style
      },
      header: {
        tag: data.header?.tag || defaultData.tegpro_refined.header.tag,
        title: data.header?.title || defaultData.tegpro_refined.header.title,
        subtitle: data.header?.subtitle || defaultData.tegpro_refined.header.subtitle
      },
      hero_card: {
        id: data.hero_card?.id || defaultData.tegpro_refined.hero_card.id,
        title: data.hero_card?.title || defaultData.tegpro_refined.hero_card.title,
        subtitle: data.hero_card?.subtitle || defaultData.tegpro_refined.hero_card.subtitle,
        description: data.hero_card?.description || defaultData.tegpro_refined.hero_card.description,
        badge: data.hero_card?.badge || defaultData.tegpro_refined.hero_card.badge,
        cta: data.hero_card?.cta || defaultData.tegpro_refined.hero_card.cta,
        href: data.hero_card?.href || defaultData.tegpro_refined.hero_card.href,
        enabled: data.hero_card?.enabled !== undefined ? data.hero_card.enabled : defaultData.tegpro_refined.hero_card.enabled
      },
      tracks: data.tracks?.map((track: any, index: number) => ({
        id: track.id || `track_${index}`,
        title: track.title || `Track ${index + 1}`,
        desc: track.desc || "",
        icon: track.icon || "solar:star-linear",
        enabled: track.enabled !== undefined ? track.enabled : true,
        order: track.order !== undefined ? track.order : index
      })) || defaultData.tegpro_refined.tracks,
      visual_metadata: {
        grain_opacity: data.visual_metadata?.grain_opacity || defaultData.tegpro_refined.visual_metadata.grain_opacity,
        glow_radius: data.visual_metadata?.glow_radius || defaultData.tegpro_refined.visual_metadata.glow_radius,
        border_style: data.visual_metadata?.border_style || defaultData.tegpro_refined.visual_metadata.border_style
      }
    }
  };
};

// Helper para acessar os dados internos
const getInnerData = (data: TegProRefinedData) => data.tegpro_refined;

export default function TegProPage() {
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
  } = useJsonManagement<TegProRefinedData>({
    apiPath: "/api/tegpro-academy/json/tegpro-home",
    defaultData: defaultTegProData,
    mergeFunction: mergeWithDefaults,
  });

  // Hook para gerenciar tracks com drag & drop
  const tracksList = useListState<Track>({
    initialItems: getInnerData(pageData).tracks,
    defaultItem: {
      id: '',
      title: '',
      desc: '',
      icon: 'solar:star-linear',
      enabled: true,
      order: 0
    },
    validationFields: ['title', 'desc', 'icon'],
    enableDragDrop: true
  });

  const [expandedSections, setExpandedSections] = useState({
    header: true,
    hero: false,
    tracks: false,
    theme: false,
    visual: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para adicionar itens
  const handleAddTrack = () => {
    const success = tracksList.addItem();
    if (!success) {
      console.warn(tracksList.validationError);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Atualiza os arrays no pageData antes de salvar
    updateNested('tegpro_refined.tracks', tracksList.items);
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Funções de drag & drop
  const handleTrackDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    tracksList.startDrag(index);
  };

  const handleTrackDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    tracksList.handleDragOver(index);
  };

  const handleTrackDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    tracksList.endDrag();
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

  const calculateCompletion = () => {
    const innerData = getInnerData(pageData);
    let completed = 0;
    let total = 0;

    // Header section
    total += 3;
    if (innerData.header.tag.trim()) completed++;
    if (innerData.header.title.trim()) completed++;
    if (innerData.header.subtitle.trim()) completed++;

    // Hero card
    total += 7;
    if (innerData.hero_card.id.trim()) completed++;
    if (innerData.hero_card.title.trim()) completed++;
    if (innerData.hero_card.subtitle.trim()) completed++;
    if (innerData.hero_card.description.trim()) completed++;
    if (innerData.hero_card.badge.trim()) completed++;
    if (innerData.hero_card.cta.trim()) completed++;
    if (innerData.hero_card.href.trim()) completed++;

    // Tracks
    total += tracksList.items.length * 4;
    tracksList.items.forEach(track => {
      if (track.title.trim()) completed++;
      if (track.desc.trim()) completed++;
      if (track.icon.trim()) completed++;
      if (track.id.trim()) completed++;
    });

    // Theme
    total += 4;
    if (innerData.theme.bg_section.trim()) completed++;
    if (innerData.theme.accent_gold.trim()) completed++;
    if (innerData.theme.gold_gradient.trim()) completed++;
    if (innerData.theme.style.trim()) completed++;

    // Visual metadata
    total += 3;
    if (innerData.visual_metadata.grain_opacity.trim()) completed++;
    if (innerData.visual_metadata.glow_radius.trim()) completed++;
    if (innerData.visual_metadata.border_style.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  const getTrackIcon = (trackId: string) => {
    switch (trackId) {
      case 'track_operation':
        return Package;
      case 'track_finance':
        return DollarSign;
      case 'track_squads':
        return Users;
      default:
        return Target;
    }
  };

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  const innerData = getInnerData(pageData);

  return (
    <ManageLayout
      headerIcon={Crown}
      title="TegPro Academy - Configuração"
      description="Gestão da página da TegPro Academy - Higher Management"
      exists={!!exists}
      itemName="TegPro Academy"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho da Página"
            section="header"
            icon={TextIcon}
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
                  label="Tag do Cabeçalho"
                  value={innerData.header.tag}
                  onChange={(e) => updateNested('tegpro_refined.header.tag', e.target.value)}
                  placeholder="Ex: Higher Management"
                  required
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <Input
                  label="Título Principal"
                  value={innerData.header.title}
                  onChange={(e) => updateNested('tegpro_refined.header.title', e.target.value)}
                  placeholder="Ex: TegPro Academy"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <div className="md:col-span-2">
                  <TextArea
                    label="Subtítulo"
                    value={innerData.header.subtitle}
                    onChange={(e) => updateNested('tegpro_refined.header.subtitle', e.target.value)}
                    placeholder="A ciência por trás da gestão de e-commerces..."
                    rows={2}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Hero Card */}
        <div className="space-y-4">
          <SectionHeader
            title="Cartão de Destaque (Hero)"
            section="hero"
            icon={Crown}
            isExpanded={expandedSections.hero}
            onToggle={() => toggleSection("hero")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.hero ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label="ID do Cartão"
                    value={innerData.hero_card.id}
                    onChange={(e) => updateNested('tegpro_refined.hero_card.id', e.target.value)}
                    placeholder="Ex: management_method"
                    required
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Título Principal"
                    value={innerData.hero_card.title}
                    onChange={(e) => updateNested('tegpro_refined.hero_card.title', e.target.value)}
                    placeholder="Ex: Gestão de E-commerce."
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Subtítulo"
                    value={innerData.hero_card.subtitle}
                    onChange={(e) => updateNested('tegpro_refined.hero_card.subtitle', e.target.value)}
                    placeholder="Ex: O Método TegPro."
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="space-y-4">
                  <TextArea
                    label="Descrição"
                    value={innerData.hero_card.description}
                    onChange={(e) => updateNested('tegpro_refined.hero_card.description', e.target.value)}
                    placeholder="Descrição detalhada do método..."
                    rows={3}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Badge/Etiqueta"
                    value={innerData.hero_card.badge}
                    onChange={(e) => updateNested('tegpro_refined.hero_card.badge', e.target.value)}
                    placeholder="Ex: Formação de Elite"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Texto do CTA"
                    value={innerData.hero_card.cta}
                    onChange={(e) => updateNested('tegpro_refined.hero_card.cta', e.target.value)}
                    placeholder="Ex: Conhecer Metodologia"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Link do CTA"
                    value={innerData.hero_card.href}
                    onChange={(e) => updateNested('tegpro_refined.hero_card.href', e.target.value)}
                    placeholder="Ex: /cursos"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background-body)]">
                  <div>
                    <h4 className="font-medium text-[var(--color-secondary)]">Status do Cartão</h4>
                    <p className="text-sm text-[var(--color-secondary)]/70">
                      {innerData.hero_card.enabled ? "Ativo e visível" : "Oculto"}
                    </p>
                  </div>
                  <Switch
                    checked={innerData.hero_card.enabled}
                    onCheckedChange={(checked) => updateNested('tegpro_refined.hero_card.enabled', checked)}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Tracks */}
        <div className="space-y-4">
          <SectionHeader
            title="Trilhas/Áreas de Conhecimento"
            section="tracks"
            icon={TrendingUp}
            isExpanded={expandedSections.tracks}
            onToggle={() => toggleSection("tracks")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.tracks ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-secondary)]">
                    Trilhas da Academia
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {tracksList.completeCount} de {tracksList.totalCount} completos
                      </span>
                    </div>
                    <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                    <span className="text-sm text-[var(--color-secondary)]/70">
                      Limite: {tracksList.currentPlanType === 'pro' ? '10' : '5'} trilhas
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button
                    type="button"
                    onClick={handleAddTrack}
                    variant="primary"
                    className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                    disabled={!tracksList.canAddNewItem}
                  >
                    + Nova Trilha
                  </Button>
                  {tracksList.isLimitReached && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Limite do plano atingido
                    </p>
                  )}
                </div>
              </div>

              {/* Mensagem de erro */}
              {tracksList.validationError && (
                <div className={`p-3 rounded-lg ${tracksList.isLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'}`}>
                  <div className="flex items-start gap-2">
                    {tracksList.isLimitReached ? (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${tracksList.isLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                      {tracksList.validationError}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {tracksList.filteredItems.map((track, index) => {
                  const TrackIcon = getTrackIcon(track.id);
                  return (
                    <div 
                      key={track.id}
                      ref={index === tracksList.filteredItems.length - 1 ? tracksList.newItemRef : undefined}
                      draggable
                      onDragStart={(e) => handleTrackDragStart(e, index)}
                      onDragOver={(e) => handleTrackDragOver(e, index)}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragEnd={handleTrackDragEnd}
                      onDrop={handleDrop}
                      className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                        tracksList.draggingItem === index 
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
                            onDragStart={(e) => handleTrackDragStart(e, index)}
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
                          
                          {/* Ícone visual */}
                          <div className="p-3 rounded-lg bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/10">
                            <TrackIcon className="w-6 h-6 text-[var(--color-primary)]" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-[var(--color-secondary)]">
                                {track.title || "Sem título"}
                              </h4>
                              {track.title && track.desc && track.icon ? (
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
                                    ID da Trilha
                                  </label>
                                  <Input
                                    value={track.id}
                                    onChange={(e) => tracksList.updateItem(index, { id: e.target.value })}
                                    placeholder="Ex: track_operation"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Ícone
                                  </label>
                                  <IconSelector
                                    value={track.icon}
                                    onChange={(value) => tracksList.updateItem(index, { icon: value })}
                                    placeholder="solar:settings-minimalistic-linear"
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Título
                                  </label>
                                  <Input
                                    value={track.title}
                                    onChange={(e) => tracksList.updateItem(index, { title: e.target.value })}
                                    placeholder="Ex: Operação Implacável"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Descrição
                                  </label>
                                  <Input
                                    value={track.desc}
                                    onChange={(e) => tracksList.updateItem(index, { desc: e.target.value })}
                                    placeholder="Ex: Do setup à medalha Platinum."
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-[var(--color-secondary)]/70">
                              Ativo
                            </div>
                            <Switch
                              checked={track.enabled}
                              onCheckedChange={(checked) => tracksList.updateItem(index, { enabled: checked })}
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => tracksList.removeItem(index)}
                            variant="danger"
                            className="whitespace-nowrap bg-red-600 hover:bg-red-700 border-none"
                          >
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

        {/* Seção Tema */}
        <div className="space-y-4">
          <SectionHeader
            title="Tema Visual"
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
                  Paleta de Cores - Estilo Cinematográfico
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Configure as cores do tema Higher Management
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ThemePropertyInput
                  property="bg"
                  label="Cor de Fundo (BG Section)"
                  description="Cor de fundo principal das seções"
                  currentHex={innerData.theme.bg_section}
                  tailwindClass={`bg-[${innerData.theme.bg_section}]`}
                  onThemeChange={(_, hex) => updateNested('tegpro_refined.theme.bg_section', hex)}
                />

                <ThemePropertyInput
                  property="bg"
                  label="Cor Dourada (Accent)"
                  description="Cor dourada para destaques e elementos principais"
                  currentHex={innerData.theme.accent_gold}
                  tailwindClass={`bg-[${innerData.theme.accent_gold}]`}
                  onThemeChange={(_, hex) => updateNested('tegpro_refined.theme.accent_gold', hex)}
                />

                <div className="md:col-span-2">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Gradiente Dourado (CSS)
                    </label>
                    <TextArea
                      value={innerData.theme.gold_gradient}
                      onChange={(e) => updateNested('tegpro_refined.theme.gold_gradient', e.target.value)}
                      placeholder="linear-gradient(135deg, #C5A059 0%, #8E7037 100%)"
                      rows={2}
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono text-sm"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70">
                      Código CSS do gradiente utilizado em elementos especiais
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Estilo/Descrição do Tema"
                    value={innerData.theme.style}
                    onChange={(e) => updateNested('tegpro_refined.theme.style', e.target.value)}
                    placeholder="Ex: Cinematic Dark / Higher Management"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Metadados Visuais */}
        <div className="space-y-4">
          <SectionHeader
            title="Metadados Visuais"
            section="visual"
            icon={Settings}
            isExpanded={expandedSections.visual}
            onToggle={() => toggleSection("visual")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.visual ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Opacidade do Grão/Textura
                  </label>
                  <Input
                    type="text"
                    value={innerData.visual_metadata.grain_opacity}
                    onChange={(e) => updateNested('tegpro_refined.visual_metadata.grain_opacity', e.target.value)}
                    placeholder="Ex: 0.03"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70">
                    Opacidade do efeito de grão/textura (0 a 1)
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Raio do Glow/Glow Radius
                  </label>
                  <Input
                    type="text"
                    value={innerData.visual_metadata.glow_radius}
                    onChange={(e) => updateNested('tegpro_refined.visual_metadata.glow_radius', e.target.value)}
                    placeholder="Ex: 1000px"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70">
                    Tamanho do efeito de brilho/glow
                  </p>
                </div>

                <div className="md:col-span-2">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Estilo das Bordas
                    </label>
                    <Input
                      value={innerData.visual_metadata.border_style}
                      onChange={(e) => updateNested('tegpro_refined.visual_metadata.border_style', e.target.value)}
                      placeholder="Ex: Surface Design (Subtle Border)"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70">
                      Descrição do estilo das bordas e superfícies
                    </p>
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
          itemName="TegPro Academy"
          icon={Crown}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="TegPro Academy"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}