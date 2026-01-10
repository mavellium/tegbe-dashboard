/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
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

export default function AboutRefinedSectionPage() {
  const { currentSite } = useSite();
  const currentPlanType = currentSite.planType;
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

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
  
  // Estado para drag & drop
  const [draggingStat, setDraggingStat] = useState<number | null>(null);

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

  // Referência para o último item adicionado
  const newStatRef = useRef<HTMLDivElement>(null);

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

  // Funções para manipular a lista de stats
  const addStat = () => {
    const currentStats = [...aboutData.stats];
    
    if (currentStats.length >= currentPlanLimit) {
      return false;
    }
    
    const newStat: StatItem = {
      label: "",
      value: "",
    };
    
    updateNested('stats', [...currentStats, newStat]);
    
    // Scroll para o novo item
    setTimeout(() => {
      newStatRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updateStat = (index: number, updates: Partial<StatItem>) => {
    const currentStats = [...aboutData.stats];
    
    if (index >= 0 && index < currentStats.length) {
      currentStats[index] = { ...currentStats[index], ...updates };
      updateNested('stats', currentStats);
    }
  };

  const removeStat = (index: number) => {
    const currentStats = [...aboutData.stats];
    
    if (currentStats.length <= 1) {
      // Mantém pelo menos um item vazio
      updateNested('stats', [{ label: "", value: "" }]);
    } else {
      currentStats.splice(index, 1);
      updateNested('stats', currentStats);
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
    
    const currentStats = [...aboutData.stats];
    const draggedStat = currentStats[draggingStat];
    
    // Remove o item arrastado
    currentStats.splice(draggingStat, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingStat ? index : index;
    currentStats.splice(newIndex, 0, draggedStat);
    
    updateNested('stats', currentStats);
    setDraggingStat(index);
  };

  const handleStatDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingStat(null);
  };

  const handleAddStat = () => {
    const success = addStat();
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
  const handleColorChange = (colorKey: keyof ThemeData, hexColor: string) => {
    updateNested(`theme.${colorKey}`, hexColor);
  };

  // Cálculos de validação
  const isStatValid = (stat: StatItem): boolean => {
    return stat.label.trim() !== '' && stat.value.trim() !== '';
  };

  const stats = aboutData.stats;
  const isLimitReached = stats.length >= currentPlanLimit;
  const canAddNewItem = !isLimitReached;
  const completeCount = stats.filter(isStatValid).length;
  const totalCount = stats.length;
  const validationError = isLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

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
    total += stats.length * 2;
    stats.forEach(stat => {
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
      title="Seção Sobre "
      description="Gerencie a seção sobre com design refinado"
      exists={!!exists}
      itemName="Seção Sobre"
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
                          {completeCount} de {totalCount} completos
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        Limite: {currentPlanLimit} stats
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddStat}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                      disabled={!canAddNewItem}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Estatística
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

              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <div 
                    key={index}
                    ref={index === stats.length - 1 ? newStatRef : undefined}
                    draggable
                    onDragStart={(e) => handleStatDragStart(e, index)}
                    onDragOver={(e) => handleStatDragOver(e, index)}
                    onDragEnd={handleStatDragEnd}
                    className={`flex items-center gap-4 p-4 border border-[var(--color-border)] rounded-lg transition-all duration-200 ${
                      draggingStat === index 
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
                        onChange={(e) => updateStat(index, { label: e.target.value })}
                        placeholder="Ex: Anos de Escala"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                      <Input
                        label="Value"
                        value={stat.value}
                        onChange={(e) => updateStat(index, { value: e.target.value })}
                        placeholder="Ex: 8+"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeStat(index)}
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