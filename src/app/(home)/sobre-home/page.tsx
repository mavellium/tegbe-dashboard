/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import { 
  Palette,
  Tag,
  Settings,
  Star,
  TrendingUp,
  Image as ImageIcon,
  Globe,
  MapPin,
  Target,
  Layout,
  ListIcon,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Hash,
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { hexToTailwindBgClass } from "@/lib/colors";
import { ImageUpload } from "@/components/ImageUpload";
import IconSelector from "@/components/IconSelector";
import { useSite } from "@/context/site-context";

interface ThemeData {
  bg_section: string;
  text_primary: string;
  text_secondary: string;
  accent_yellow: string;
  bg_accent: string;
}

interface ContentData {
  tag: string;
  title: string;
  description: string;
  long_text: string;
  cta: string;
  href: string;
  image_bg: string;
}

interface StatItem {
  label: string;
  value: string;
}

interface LocationBadge {
  icon: string;
  label: string;
  city: string;
}

interface VisualMetadata {
  central_badge_icon: string;
  location_badge: LocationBadge;
  image_effects: string;
}

interface AboutRefinedSectionData {
  theme: ThemeData;
  content: ContentData;
  stats: StatItem[];
  visual_metadata: VisualMetadata;
}

const defaultAboutRefinedSectionData: AboutRefinedSectionData = {
  theme: {
    bg_section: "#FFFFFF",
    text_primary: "#1D1D1F",
    text_secondary: "#86868B",
    accent_yellow: "#EAB308",
    bg_accent: "#F5F5F7",
  },
  content: {
    tag: "",
    title: "",
    description: "",
    long_text: "",
    cta: "",
    href: "",
    image_bg: "",
  },
  stats: [
    { label: "", value: "" },
  ],
  visual_metadata: {
    central_badge_icon: "solar:crown-star-bold",
    location_badge: {
      icon: "solar:map-point-bold",
      label: "Sede Estratégica",
      city: "",
    },
    image_effects: "Grayscale 40%, Opacity 0.4, Hover Scale 1.05",
  },
};

const mergeWithDefaults = (apiData: any, defaultData: AboutRefinedSectionData): AboutRefinedSectionData => {
  if (!apiData) return defaultData;
  
  return {
    theme: apiData.theme || defaultData.theme,
    content: apiData.content || defaultData.content,
    stats: apiData.stats || defaultData.stats,
    visual_metadata: apiData.visual_metadata || defaultData.visual_metadata,
  };
};

// Hook personalizado para gerenciar stats
function useStatsList(initialStats: StatItem[], planType: 'basic' | 'pro') {
  const [stats, setStats] = useState<StatItem[]>(initialStats);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const newItemRef = useRef<HTMLDivElement>(null);

  const currentPlanLimit = planType === 'pro' ? 10 : 5;
  const isLimitReached = stats.length >= currentPlanLimit;

  const completeCount = useMemo(() => {
    return stats.filter(stat => stat.label.trim() && stat.value.trim()).length;
  }, [stats]);

  const canAddNewItem = !isLimitReached;

  const addStat = useCallback(() => {
    if (!canAddNewItem) {
      setValidationError("Limite do plano atingido");
      return false;
    }

    const newStat: StatItem = {
      label: "",
      value: "",
    };

    setStats(prev => [...prev, newStat]);
    setValidationError(null);

    setTimeout(() => {
      newItemRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    return true;
  }, [canAddNewItem]);

  const updateStat = useCallback((index: number, updates: Partial<StatItem>) => {
    setStats(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  }, []);

  const removeStat = useCallback((index: number) => {
    setStats(prev => {
      if (prev.length === 1) {
        return [{ label: "", value: "" }];
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Drag & drop
  const startDrag = useCallback((index: number) => {
    setDraggingIndex(index);
  }, []);

  const handleDragOver = useCallback((index: number) => {
    if (draggingIndex === null || draggingIndex === index) return;

    setStats(prev => {
      const newStats = [...prev];
      const draggedStat = newStats[draggingIndex];
      newStats.splice(draggingIndex, 1);
      newStats.splice(index, 0, draggedStat);
      setDraggingIndex(index);
      return newStats;
    });
  }, [draggingIndex]);

  const endDrag = useCallback(() => {
    setDraggingIndex(null);
  }, []);

  // Atualizar stats quando initialStats mudar
  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  return {
    stats,
    filteredItems: stats,
    draggingItem: draggingIndex,
    validationError,
    newItemRef,
    completeCount,
    totalCount: stats.length,
    currentPlanLimit,
    isLimitReached,
    canAddNewItem,
    currentPlanType: planType,
    addStat,
    updateStat,
    removeStat,
    startDrag,
    handleDragOver,
    endDrag,
  };
}

export default function AboutRefinedSectionPage() {
  const { currentSite } = useSite();
  const currentPlanType = currentSite.planType;

  const {
    data: aboutData,
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
  } = useJsonManagement<AboutRefinedSectionData>({
    apiPath: "/api/tegbe-institucional/json/sobre-home",
    defaultData: defaultAboutRefinedSectionData,
    mergeFunction: mergeWithDefaults,
  });

  // Estado local para URLs temporárias de preview
  const [tempImageUrls, setTempImageUrls] = useState<Record<string, string>>({});

  // Hook personalizado para gerenciar stats
  const statsList = useStatsList(aboutData.stats, currentPlanType);

  const [expandedSections, setExpandedSections] = useState({
    content: true,
    stats: false,
    theme: false,
    visual_metadata: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Função para lidar com upload de imagem de fundo
  const handleBgImageChange = (file: File | null) => {
    const path = `content.image_bg`;
    
    setFileState(path, file);
    
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setTempImageUrls(prev => ({
        ...prev,
        [path]: objectUrl
      }));
      
      updateNested(path, objectUrl);
    } else {
      updateNested(path, "/ads-bg.png");
    }
  };

  // Funções para adicionar stat
  const handleAddStat = () => {
    const success = statsList.addStat();
    if (!success) {
      console.warn(statsList.validationError);
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
      // Atualizar os stats no aboutData
      updateNested('stats', statsList.stats);
      
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

  // Funções de drag & drop para stats
  const handleStatDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    statsList.startDrag(index);
  };

  const handleStatDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    statsList.handleDragOver(index);
  };

  const handleStatDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    statsList.endDrag();
  };

  // Funções para atualizar cores
  const handleColorChange = (colorKey: keyof ThemeData, hexColor: string) => {
    updateNested(`theme.${colorKey}`, hexColor);
  };

  // Cálculo de preenchimento
  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Conteúdo
    total += 7;
    if (aboutData.content.tag.trim()) completed++;
    if (aboutData.content.title.trim()) completed++;
    if (aboutData.content.description.trim()) completed++;
    if (aboutData.content.long_text.trim()) completed++;
    if (aboutData.content.cta.trim()) completed++;
    if (aboutData.content.href.trim()) completed++;
    if (aboutData.content.image_bg.trim()) completed++;

    // Stats
    total += statsList.stats.length * 2;
    statsList.stats.forEach(stat => {
      if (stat.label.trim()) completed++;
      if (stat.value.trim()) completed++;
    });

    // Tema (todas as cores são obrigatórias)
    total += 5;
    if (aboutData.theme.bg_section) completed++;
    if (aboutData.theme.text_primary) completed++;
    if (aboutData.theme.text_secondary) completed++;
    if (aboutData.theme.accent_yellow) completed++;
    if (aboutData.theme.bg_accent) completed++;

    // Metadados visuais
    total += 5;
    if (aboutData.visual_metadata.central_badge_icon.trim()) completed++;
    if (aboutData.visual_metadata.location_badge.icon.trim()) completed++;
    if (aboutData.visual_metadata.location_badge.label.trim()) completed++;
    if (aboutData.visual_metadata.location_badge.city.trim()) completed++;
    if (aboutData.visual_metadata.image_effects.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Target}
      title="Seção About Refined"
      description="Gerencie a seção sobre com design refinado"
      exists={!!exists}
      itemName="Seção About"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção de Conteúdo */}
        <div className="space-y-4">
          <SectionHeader
            title="Conteúdo"
            section="content"
            icon={Settings}
            isExpanded={expandedSections.content}
            onToggle={() => toggleSection("content")}
          />
          <motion.div
            initial={false}
            animate={{ height: expandedSections.content ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <Input
                  label="Tag"
                  value={aboutData.content.tag}
                  onChange={(e) => updateNested('content.tag', e.target.value)}
                  placeholder="Ex: Digital Architecture"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <Input
                  label="Título"
                  value={aboutData.content.title}
                  onChange={(e) => updateNested('content.title', e.target.value)}
                  placeholder="Ex: Engenharia por trás do faturamento."
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <TextArea
                  label="Descrição"
                  value={aboutData.content.description}
                  onChange={(e) => updateNested('content.description', e.target.value)}
                  placeholder="Descrição curta"
                  rows={3}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <TextArea
                  label="Texto Longo"
                  value={aboutData.content.long_text}
                  onChange={(e) => updateNested('content.long_text', e.target.value)}
                  placeholder="Texto longo"
                  rows={4}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Texto do CTA"
                    value={aboutData.content.cta}
                    onChange={(e) => updateNested('content.cta', e.target.value)}
                    placeholder="Ex: Nossa Metodologia"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <Input
                    label="Link do CTA"
                    value={aboutData.content.href}
                    onChange={(e) => updateNested('content.href', e.target.value)}
                    placeholder="/sobre"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Imagem de Fundo
                  </label>
                  <ImageUpload
                    label=""
                    currentImage={aboutData.content.image_bg}
                    selectedFile={null}
                    onFileChange={handleBgImageChange}
                    aspectRatio="aspect-video"
                    previewWidth={400}
                    previewHeight={225}
                    description="Imagem de fundo da seção (recomendado: 1920x1080px)"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção de Estatísticas */}
        <div className="space-y-4">
          <SectionHeader
            title="Estatísticas"
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Hash className="w-5 h-5" />
                      Estatísticas
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {statsList.completeCount} de {statsList.totalCount} completos
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        Limite: {statsList.currentPlanLimit} stats
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddStat}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                      disabled={!statsList.canAddNewItem}
                    >
                      + Adicionar Estatística
                    </Button>
                    {statsList.isLimitReached && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Limite do plano atingido
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mensagem de erro */}
              {statsList.validationError && (
                <div className={`p-3 rounded-lg ${statsList.isLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'}`}>
                  <div className="flex items-start gap-2">
                    {statsList.isLimitReached ? (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${statsList.isLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                      {statsList.validationError}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {statsList.stats.map((stat, index) => (
                  <div 
                    key={index}
                    ref={index === statsList.stats.length - 1 ? statsList.newItemRef : undefined}
                    draggable
                    onDragStart={(e) => handleStatDragStart(e, index)}
                    onDragOver={(e) => handleStatDragOver(e, index)}
                    onDragEnd={handleStatDragEnd}
                    className={`flex items-center gap-4 p-4 border border-[var(--color-border)] rounded-lg transition-all duration-200 ${
                      statsList.draggingItem === index 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                        : 'hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    <div className="cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Label"
                        value={stat.label}
                        onChange={(e) => statsList.updateStat(index, { label: e.target.value })}
                        placeholder="Ex: Anos de Escala"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                      <Input
                        label="Value"
                        value={stat.value}
                        onChange={(e) => statsList.updateStat(index, { value: e.target.value })}
                        placeholder="Ex: 8+"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => statsList.removeStat(index)}
                      variant="danger"
                      className="shrink-0 bg-red-600 hover:bg-red-700 border-none"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção de Tema */}
        <div className="space-y-4">
          <SectionHeader
            title="Tema"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ThemePropertyInput
                  property="bg"
                  label="Fundo da Seção"
                  currentHex={aboutData.theme.bg_section}
                  tailwindClass={hexToTailwindBgClass(aboutData.theme.bg_section)}
                  onThemeChange={(_, hex) => handleColorChange('bg_section', hex)}
                />
                <ThemePropertyInput
                  property="text"
                  label="Texto Primário"
                  currentHex={aboutData.theme.text_primary}
                  tailwindClass={hexToTailwindBgClass(aboutData.theme.text_primary)}
                  onThemeChange={(_, hex) => handleColorChange('text_primary', hex)}
                />
                <ThemePropertyInput
                  property="text"
                  label="Texto Secundário"
                  currentHex={aboutData.theme.text_secondary}
                  tailwindClass={hexToTailwindBgClass(aboutData.theme.text_secondary)}
                  onThemeChange={(_, hex) => handleColorChange('text_secondary', hex)}
                />
                <ThemePropertyInput
                  property="bg"
                  label="Amarelo de Destaque"
                  currentHex={aboutData.theme.accent_yellow}
                  tailwindClass={hexToTailwindBgClass(aboutData.theme.accent_yellow)}
                  onThemeChange={(_, hex) => handleColorChange('accent_yellow', hex)}
                />
                <ThemePropertyInput
                  property="bg"
                  label="Fundo de Destaque"
                  currentHex={aboutData.theme.bg_accent}
                  tailwindClass={hexToTailwindBgClass(aboutData.theme.bg_accent)}
                  onThemeChange={(_, hex) => handleColorChange('bg_accent', hex)}
                />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção de Metadados Visuais */}
        <div className="space-y-4">
          <SectionHeader
            title="Metadados Visuais"
            section="visual_metadata"
            icon={ImageIcon}
            isExpanded={expandedSections.visual_metadata}
            onToggle={() => toggleSection("visual_metadata")}
          />
          <motion.div
            initial={false}
            animate={{ height: expandedSections.visual_metadata ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Ícone do Badge Central
                  </label>
                  <IconSelector
                    value={aboutData.visual_metadata.central_badge_icon}
                    onChange={(value) => updateNested('visual_metadata.central_badge_icon', value)}
                    placeholder="solar:crown-star-bold"
                  />
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-[var(--color-secondary)]">Badge de Localização</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                        Ícone
                      </label>
                      <IconSelector
                        value={aboutData.visual_metadata.location_badge.icon}
                        onChange={(value) => updateNested('visual_metadata.location_badge.icon', value)}
                        placeholder="solar:map-point-bold"
                      />
                    </div>
                    <Input
                      label="Label"
                      value={aboutData.visual_metadata.location_badge.label}
                      onChange={(e) => updateNested('visual_metadata.location_badge.label', e.target.value)}
                      placeholder="Ex: Sede Estratégica"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <Input
                      label="Cidade"
                      value={aboutData.visual_metadata.location_badge.city}
                      onChange={(e) => updateNested('visual_metadata.location_badge.city', e.target.value)}
                      placeholder="Ex: Garça, São Paulo"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>
                <Input
                  label="Efeitos de Imagem"
                  value={aboutData.visual_metadata.image_effects}
                  onChange={(e) => updateNested('visual_metadata.image_effects', e.target.value)}
                  placeholder="Ex: Grayscale 40%, Opacity 0.4, Hover Scale 1.05"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
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
          itemName="Seção About"
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
        itemName="Seção About"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}