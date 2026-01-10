/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
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
  ImageIcon,
  VideoIcon
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { hexToTailwindBgClass, tailwindToHex } from "@/lib/colors";

// Importar componentes de upload
import { ImageUpload } from "@/components/ImageUpload";
import { VideoUpload } from "@/components/VideoUpload";

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  order: number;
  color?: string;
  imageUrl?: string;
  videoUrl?: string;
}

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  description?: string;
  order: number;
  enabled: boolean;
}

interface ComponentConfig {
  name: string;
  enabled: boolean;
  color?: string;
}

interface PageTheme {
  primary_color: string;
  secondary_color: string;
  text_color: string;
  background_color: string;
  accent_color: string;
}

interface TagItem {
  id: string;
  text: string;
}

interface TestPageData {
  id?: string;
  pageName: string;
  description: string;
  slug: string;
  templateType: string;
  enabled: boolean;
  components: Record<string, ComponentConfig>;
  content: {
    heroTitle: string;
    heroSubtitle: string;
    heroImage?: string;
    heroVideo?: string;
    features: Feature[];
    gallery: GalleryItem[];
    ctaText: string;
    ctaButtonText: string;
    ctaButtonLink: string;
    ctaButtonColor?: string;
  };
  theme: PageTheme;
  metadata: {
    author: string;
    version: string;
    lastModified: string;
    tags: TagItem[];
    category?: string;
  };
}

const defaultTestPageData: TestPageData = {
  pageName: "Página de Teste - Template Base",
  description: "Template base para criação de novas páginas por IAs",
  slug: "test-page-template",
  templateType: "landing-page",
  enabled: true,
  components: {
    header: { name: "Cabeçalho", enabled: true, color: "blue-500" },
    footer: { name: "Rodapé", enabled: true, color: "gray-500" },
    sidebar: { name: "Barra Lateral", enabled: false, color: "gray-300" },
    hero: { name: "Seção Hero", enabled: true, color: "indigo-600" },
    features: { name: "Recursos/Destaques", enabled: true, color: "green-500" },
    testimonials: { name: "Depoimentos", enabled: true, color: "amber-500" },
    cta: { name: "Call to Action", enabled: true, color: "red-500" },
    gallery: { name: "Galeria", enabled: false, color: "purple-500" },
    video: { name: "Player de Vídeo", enabled: false, color: "pink-500" },
    pricing: { name: "Tabela de Preços", enabled: false, color: "teal-500" },
    contactForm: { name: "Formulário de Contato", enabled: false, color: "cyan-500" }
  },
  content: {
    heroTitle: "Bem-vindo à Página de Teste",
    heroSubtitle: "Este é um template base para IAs criarem novas páginas com componentes reutilizáveis",
    heroImage: "",
    heroVideo: "",
    features: [
      {
        id: "feat-001",
        icon: "mdi:rocket-launch",
        title: "Rápido e Eficiente",
        description: "Carregamento otimizado para melhor performance com lazy loading",
        enabled: true,
        order: 0,
        color: "blue-500",
        imageUrl: ""
      },
      {
        id: "feat-002",
        icon: "mdi:shield-check",
        title: "Seguro e Confiável",
        description: "Protegido com as melhores práticas de segurança e validação",
        enabled: true,
        order: 1,
        color: "green-500",
        videoUrl: ""
      },
      {
        id: "feat-003",
        icon: "mdi:cog",
        title: "Fácil de Customizar",
        description: "Interface intuitiva para personalização sem código",
        enabled: true,
        order: 2,
        color: "amber-500"
      }
    ],
    gallery: [
      {
        id: "gallery-001",
        type: "image" as const,
        url: "",
        title: "Interface Moderna",
        description: "Design limpo e intuitivo",
        order: 0,
        enabled: true
      },
      {
        id: "gallery-002",
        type: "video" as const,
        url: "",
        title: "Demonstração do Produto",
        description: "Veja o produto em ação",
        order: 1,
        enabled: true
      }
    ],
    ctaText: "Pronto para começar? Crie sua próxima página em minutos!",
    ctaButtonText: "Iniciar Agora",
    ctaButtonLink: "#start",
    ctaButtonColor: "bg-red-500"
  },
  theme: {
    primary_color: "blue-600",
    secondary_color: "gray-700",
    text_color: "gray-900",
    background_color: "white",
    accent_color: "amber-500"
  },
  metadata: {
    author: "Sistema IA",
    version: "1.0.0",
    lastModified: new Date().toISOString(),
    tags: [
      { id: "tag-1", text: "template" },
      { id: "tag-2", text: "ia" },
      { id: "tag-3", text: "base" },
      { id: "tag-4", text: "reutilizável" }
    ],
    category: "landing-page"
  },
};

const mergeWithDefaults = (apiData: any, defaultData: TestPageData): TestPageData => {
  if (!apiData) return defaultData;
  
  const mergedComponents: Record<string, ComponentConfig> = { ...defaultData.components };
  Object.keys(defaultData.components).forEach(key => {
    if (apiData.components?.[key]) {
      mergedComponents[key] = {
        name: apiData.components[key].name || defaultData.components[key].name,
        enabled: apiData.components[key].enabled ?? defaultData.components[key].enabled,
        color: apiData.components[key].color || defaultData.components[key].color
      };
    }
  });
  
  return {
    id: apiData.id,
    pageName: apiData.pageName || defaultData.pageName,
    description: apiData.description || defaultData.description,
    slug: apiData.slug || defaultData.slug,
    templateType: apiData.templateType || defaultData.templateType,
    enabled: apiData.enabled ?? defaultData.enabled,
    components: mergedComponents,
    content: {
      heroTitle: apiData.content?.heroTitle || defaultData.content.heroTitle,
      heroSubtitle: apiData.content?.heroSubtitle || defaultData.content.heroSubtitle,
      heroImage: apiData.content?.heroImage || defaultData.content.heroImage,
      heroVideo: apiData.content?.heroVideo || defaultData.content.heroVideo,
      features: apiData.content?.features || defaultData.content.features,
      gallery: apiData.content?.gallery || defaultData.content.gallery,
      ctaText: apiData.content?.ctaText || defaultData.content.ctaText,
      ctaButtonText: apiData.content?.ctaButtonText || defaultData.content.ctaButtonText,
      ctaButtonLink: apiData.content?.ctaButtonLink || defaultData.content.ctaButtonLink,
      ctaButtonColor: apiData.content?.ctaButtonColor || defaultData.content.ctaButtonColor,
    },
    theme: apiData.theme || defaultData.theme,
    metadata: {
      author: apiData.metadata?.author || defaultData.metadata.author,
      version: apiData.metadata?.version || defaultData.metadata.version,
      lastModified: apiData.metadata?.lastModified || defaultData.metadata.lastModified,
      tags: apiData.metadata?.tags || defaultData.metadata.tags,
      category: apiData.metadata?.category || defaultData.metadata.category,
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
    fileStates,
    setFileState,
  } = useJsonManagement<TestPageData>({
    apiPath: "/api/tegbe-institucional/json/test-page-template",
    defaultData: defaultTestPageData,
    mergeFunction: mergeWithDefaults,
  });

  // Estados para listas
  const [features, setFeatures] = useState<Feature[]>(pageData.content.features);
  const [gallery, setGallery] = useState<GalleryItem[]>(pageData.content.gallery);
  const [tags, setTags] = useState<TagItem[]>(pageData.metadata.tags);

  // Estados para arquivos das features
  const [featureImageFiles, setFeatureImageFiles] = useState<Record<string, File | null>>({});
  const [featureVideoFiles, setFeatureVideoFiles] = useState<Record<string, File | null>>({});
  
  // Estado para arquivos da galeria
  const [galleryFiles, setGalleryFiles] = useState<Record<string, File | null>>({});

  // Sincronizar com pageData quando ele mudar
  useEffect(() => {
    setFeatures(pageData.content.features);
  }, [pageData.content.features]);

  useEffect(() => {
    setGallery(pageData.content.gallery);
  }, [pageData.content.gallery]);

  useEffect(() => {
    setTags(pageData.metadata.tags);
  }, [pageData.metadata.tags]);

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    components: false,
    content: false,
    theme: false,
    metadata: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para gerenciar features
  const handleAddFeature = () => {
    const newFeature: Feature = {
      id: `feat-${Date.now()}`,
      icon: 'mdi:star',
      title: '',
      description: '',
      enabled: true,
      order: features.length,
      color: 'blue-500'
    };
    setFeatures([...features, newFeature]);
  };

  const handleUpdateFeature = (index: number, updates: Partial<Feature>) => {
    const updatedFeatures = [...features];
    updatedFeatures[index] = { ...updatedFeatures[index], ...updates };
    setFeatures(updatedFeatures);
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = features.filter((_, i) => i !== index);
    setFeatures(updatedFeatures);
  };

  // Funções para gerenciar gallery
  const handleAddGalleryItem = () => {
    const newItem: GalleryItem = {
      id: `gallery-${Date.now()}`,
      type: 'image',
      url: '',
      title: '',
      description: '',
      order: gallery.length,
      enabled: true
    };
    setGallery([...gallery, newItem]);
  };

  const handleUpdateGalleryItem = (index: number, updates: Partial<GalleryItem>) => {
    const updatedGallery = [...gallery];
    updatedGallery[index] = { ...updatedGallery[index], ...updates };
    setGallery(updatedGallery);
  };

  const handleRemoveGalleryItem = (index: number) => {
    const updatedGallery = gallery.filter((_, i) => i !== index);
    setGallery(updatedGallery);
  };

  // Funções para gerenciar tags
  const handleAddTag = () => {
    const newTag: TagItem = {
      id: `tag-${Date.now()}`,
      text: ''
    };
    setTags([...tags, newTag]);
  };

  const handleUpdateTag = (index: number, text: string) => {
    const updatedTags = [...tags];
    updatedTags[index] = { ...updatedTags[index], text };
    setTags(updatedTags);
  };

  const handleRemoveTag = (index: number) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      // Atualizar os arrays no pageData antes de salvar
      updateNested('content.features', features);
      updateNested('content.gallery', gallery);
      updateNested('metadata.tags', tags);
      updateNested('metadata.lastModified', new Date().toISOString());
      
      // Configurar arquivos das features para upload
      Object.entries(featureImageFiles).forEach(([featureId, file]) => {
        if (file) {
          const featureIndex = features.findIndex(f => f.id === featureId);
          if (featureIndex !== -1) {
            setFileState(`content.features.${featureIndex}.imageUrl`, file);
          }
        }
      });
      
      Object.entries(featureVideoFiles).forEach(([featureId, file]) => {
        if (file) {
          const featureIndex = features.findIndex(f => f.id === featureId);
          if (featureIndex !== -1) {
            setFileState(`content.features.${featureIndex}.videoUrl`, file);
          }
        }
      });
      
      // Configurar arquivos da galeria para upload
      Object.entries(galleryFiles).forEach(([galleryItemId, file]) => {
        if (file) {
          const galleryIndex = gallery.findIndex(g => g.id === galleryItemId);
          if (galleryIndex !== -1) {
            setFileState(`content.gallery.${galleryIndex}.url`, file);
          }
        }
      });
      
      await save();
      
      // Limpar estados de arquivos após envio bem-sucedido
      setFeatureImageFiles({});
      setFeatureVideoFiles({});
      setGalleryFiles({});
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Funções para atualizar cores
  const handleFeatureColorChange = (index: number, hexColor: string) => {
    const tailwindClass = hexToTailwindBgClass(hexColor);
    const colorValue = tailwindClass.replace('bg-', '');
    handleUpdateFeature(index, { color: colorValue });
  };

  const handleComponentColorChange = (componentKey: string, hexColor: string) => {
    const tailwindClass = hexToTailwindBgClass(hexColor);
    const colorValue = tailwindClass.replace('bg-', '');
    updateNested(`components.${componentKey}.color`, colorValue);
  };

  const handleThemeColorChange = (property: keyof PageTheme, hexColor: string) => {
    const tailwindClass = hexToTailwindBgClass(hexColor);
    const colorValue = tailwindClass.replace('bg-', '');
    updateNested(`theme.${property}`, colorValue);
  };

  // Funções para lidar com uploads de arquivos nas features
  const handleFeatureImageUpload = (featureId: string, file: File | null) => {
    setFeatureImageFiles(prev => ({
      ...prev,
      [featureId]: file
    }));
    
    // Atualizar URL temporária para preview
    if (file) {
      const featureIndex = features.findIndex(f => f.id === featureId);
      if (featureIndex !== -1) {
        const updatedFeatures = [...features];
        updatedFeatures[featureIndex] = { 
          ...updatedFeatures[featureIndex], 
          imageUrl: URL.createObjectURL(file) 
        };
        setFeatures(updatedFeatures);
      }
    }
  };

  const handleFeatureVideoUpload = (featureId: string, file: File | null) => {
    setFeatureVideoFiles(prev => ({
      ...prev,
      [featureId]: file
    }));
    
    // Atualizar URL temporária para preview
    if (file) {
      const featureIndex = features.findIndex(f => f.id === featureId);
      if (featureIndex !== -1) {
        const updatedFeatures = [...features];
        updatedFeatures[featureIndex] = { 
          ...updatedFeatures[featureIndex], 
          videoUrl: URL.createObjectURL(file) 
        };
        setFeatures(updatedFeatures);
      }
    }
  };

  // Função para lidar com uploads de arquivos na galeria
  const handleGalleryFileUpload = (galleryItemId: string, file: File | null) => {
    setGalleryFiles(prev => ({
      ...prev,
      [galleryItemId]: file
    }));
    
    // Atualizar URL temporária para preview
    if (file) {
      const galleryIndex = gallery.findIndex(g => g.id === galleryItemId);
      if (galleryIndex !== -1) {
        const updatedGallery = [...gallery];
        updatedGallery[galleryIndex] = { 
          ...updatedGallery[galleryIndex], 
          url: URL.createObjectURL(file) 
        };
        setGallery(updatedGallery);
      }
    }
  };

  // Função auxiliar para obter File do fileStates
  const getFileFromState = (key: string): File | null => {
    const value = fileStates[key];
    return value instanceof File ? value : null;
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Informações básicas
    total += 4;
    if (pageData.pageName.trim()) completed++;
    if (pageData.description.trim()) completed++;
    if (pageData.slug.trim()) completed++;
    if (pageData.templateType.trim()) completed++;

    // Components
    total += Object.keys(pageData.components).length * 2;
    Object.values(pageData.components).forEach(component => {
      if (component.name.trim()) completed++;
      if (component.enabled !== undefined) completed++;
    });

    // Content
    total += 5;
    if (pageData.content.heroTitle.trim()) completed++;
    if (pageData.content.heroSubtitle.trim()) completed++;
    if (pageData.content.ctaText.trim()) completed++;
    if (pageData.content.ctaButtonText.trim()) completed++;
    if (pageData.content.ctaButtonLink.trim()) completed++;

    // Features
    total += features.length * 4;
    features.forEach(feature => {
      if (feature.title.trim()) completed++;
      if (feature.description.trim()) completed++;
      if (feature.icon.trim()) completed++;
      if (feature.color?.trim()) completed++;
    });

    // Gallery
    total += gallery.length * 3;
    gallery.forEach(item => {
      if (item.title.trim()) completed++;
      if (item.url.trim()) completed++;
      if (item.type) completed++;
    });

    // Theme
    total += 5;
    if (pageData.theme.primary_color.trim()) completed++;
    if (pageData.theme.secondary_color.trim()) completed++;
    if (pageData.theme.text_color.trim()) completed++;
    if (pageData.theme.background_color.trim()) completed++;
    if (pageData.theme.accent_color.trim()) completed++;

    // Metadata
    total += 4;
    if (pageData.metadata.author.trim()) completed++;
    if (pageData.metadata.version.trim()) completed++;
    if (pageData.metadata.category?.trim()) completed++;
    completed += tags.filter(tag => tag.text.trim()).length;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Zap}
      title="Página de Teste - Template Base"
      description="Template avançado para criação de novas páginas por IAs"
      exists={!!exists}
      itemName="Template"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Básica */}
        <div className="space-y-4">
          <SectionHeader
            title="Informações Básicas do Template"
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
                  label="Nome da Página/Template"
                  value={pageData.pageName}
                  onChange={(e) => updateNested('pageName', e.target.value)}
                  placeholder="Ex: Landing Page Marketing Premium"
                  required
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <Input
                  label="Slug Identificador"
                  value={pageData.slug}
                  onChange={(e) => updateNested('slug', e.target.value)}
                  placeholder="Ex: marketing-landing-page"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <div className="md:col-span-2">
                  <TextArea
                    label="Descrição do Template"
                    value={pageData.description}
                    onChange={(e) => updateNested('description', e.target.value)}
                    placeholder="Descreva o propósito e uso deste template"
                    rows={3}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <Input
                  label="Tipo de Template"
                  value={pageData.templateType}
                  onChange={(e) => updateNested('templateType', e.target.value)}
                  placeholder="Ex: landing-page, blog-post, product-page"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background-body)]">
                  <div>
                    <h4 className="font-medium text-[var(--color-secondary)]">Status do Template</h4>
                    <p className="text-sm text-[var(--color-secondary)]/70">
                      {pageData.enabled ? "Ativo e disponível para uso" : "Desativado"}
                    </p>
                  </div>
                  <Switch
                    checked={pageData.enabled}
                    onCheckedChange={(checked) => updateNested('enabled', checked)}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Componentes */}
        <div className="space-y-4">
          <SectionHeader
            title="Componentes Ativos"
            section="components"
            icon={Layout}
            isExpanded={expandedSections.components}
            onToggle={() => toggleSection("components")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.components ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Configure os componentes do template
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Cada componente pode ser ativado/desativado e personalizado
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(pageData.components).map(([key, config]) => (
                  <div 
                    key={key} 
                    className={`p-4 rounded-lg transition-all duration-200 border ${
                      config.enabled 
                        ? 'border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5' 
                        : 'border-[var(--color-border)] bg-[var(--color-background-body)]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${config.enabled ? 'bg-[var(--color-primary)]/20' : 'bg-[var(--color-border)]'}`}>
                          <span className={`text-sm ${config.enabled ? 'text-[var(--color-primary)]' : 'text-[var(--color-secondary)]/50'}`}>
                            {config.enabled ? '✓' : '✗'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-[var(--color-secondary)]">
                            {config.name}
                          </h4>
                          <p className="text-xs text-[var(--color-secondary)]/50 capitalize">
                            {key}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(checked) => 
                          updateNested(`components.${key}.enabled`, checked)
                        }
                      />
                    </div>

                    {/* Seletor de cor para o componente */}
                    {config.enabled && (
                      <div className="mt-3 space-y-2">
                        <label className="block text-sm font-medium text-[var(--color-secondary)]/80">
                          Cor do componente
                        </label>
                        <ThemePropertyInput
                          property="bg"
                          label=""
                          description=""
                          currentHex={tailwindToHex(`bg-${config.color || 'blue-500'}`)}
                          tailwindClass={`bg-${config.color || 'blue-500'}`}
                          onThemeChange={(_, hex) => handleComponentColorChange(key, hex)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Conteúdo */}
        <div className="space-y-4">
          <SectionHeader
            title="Conteúdo da Página"
            section="content"
            icon={TextIcon}
            isExpanded={expandedSections.content}
            onToggle={() => toggleSection("content")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.content ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-8">
              {/* Hero Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[var(--color-secondary)]">
                  Seção Hero (Destaque Principal)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Título Principal"
                    value={pageData.content.heroTitle}
                    onChange={(e) => updateNested('content.heroTitle', e.target.value)}
                    placeholder="Título impactante da página"
                    required
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <div>
                    <TextArea
                      label="Subtítulo"
                      value={pageData.content.heroSubtitle}
                      onChange={(e) => updateNested('content.heroSubtitle', e.target.value)}
                      placeholder="Subtítulo descritivo e convidativo"
                      rows={2}
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  {/* Upload de Imagem do Hero */}
                  <div className="md:col-span-2">
                    <ImageUpload
                      label="Imagem do Hero"
                      currentImage={pageData.content.heroImage || ''}
                      selectedFile={getFileFromState('content.heroImage')}
                      onFileChange={(file) => setFileState('content.heroImage', file)}
                      aspectRatio="aspect-video"
                      previewWidth={800}
                      previewHeight={450}
                      description="Imagem de destaque da seção hero"
                    />
                  </div>

                  {/* Upload de Vídeo do Hero */}
                  <div className="md:col-span-2">
                    <VideoUpload
                      label="Vídeo do Hero"
                      currentVideo={pageData.content.heroVideo || ''}
                      selectedFile={getFileFromState('content.heroVideo')}
                      onFileChange={(file) => setFileState('content.heroVideo', file)}
                      aspectRatio="aspect-video"
                      previewWidth={800}
                      previewHeight={450}
                      description="Vídeo de destaque da seção hero (opcional)"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <ListIcon className="w-5 h-5" />
                      Recursos/Features
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {features.filter(f => f.title && f.description && f.icon).length} de {features.length} completos
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddFeature}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                    >
                      + Adicionar Recurso
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div 
                      key={feature.id}
                      className="p-6 border border-[var(--color-border)] rounded-lg space-y-6 hover:border-[var(--color-primary)]/50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
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
                                {feature.title || "Sem título"}
                              </h4>
                              {feature.title && feature.description && feature.icon ? (
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
                                    Ícone
                                  </label>
                                  <IconSelector
                                    value={feature.icon}
                                    onChange={(value) => handleUpdateFeature(index, { icon: value })}
                                    placeholder="mdi:star"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Título
                                  </label>
                                  <Input
                                    value={feature.title}
                                    onChange={(e) => handleUpdateFeature(index, { title: e.target.value })}
                                    placeholder="Título do recurso"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Descrição
                                  </label>
                                  <TextArea
                                    value={feature.description}
                                    onChange={(e) => handleUpdateFeature(index, { description: e.target.value })}
                                    placeholder="Descrição detalhada do recurso"
                                    rows={3}
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Cor do ícone
                                  </label>
                                  <ThemePropertyInput
                                    property="bg"
                                    label=""
                                    description=""
                                    currentHex={tailwindToHex(`bg-${feature.color || 'blue-500'}`)}
                                    tailwindClass={`bg-${feature.color || 'blue-500'}`}
                                    onThemeChange={(_, hex) => handleFeatureColorChange(index, hex)}
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Imagem do Recurso
                                  </label>
                                  <ImageUpload
                                    label=""
                                    currentImage={feature.imageUrl || ''}
                                    selectedFile={featureImageFiles[feature.id]}
                                    onFileChange={(file) => handleFeatureImageUpload(feature.id, file)}
                                    aspectRatio="aspect-square"
                                    previewWidth={200}
                                    previewHeight={200}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Vídeo do Recurso
                                  </label>
                                  <VideoUpload
                                    label=""
                                    currentVideo={feature.videoUrl || ''}
                                    selectedFile={featureVideoFiles[feature.id]}
                                    onFileChange={(file) => handleFeatureVideoUpload(feature.id, file)}
                                    aspectRatio="aspect-square"
                                    previewWidth={200}
                                    previewHeight={200}
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
                              checked={feature.enabled}
                              onCheckedChange={(checked) => handleUpdateFeature(index, { enabled: checked })}
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => handleRemoveFeature(index)}
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
              </div>

              {/* Galeria de Imagens e Vídeos */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Galeria de Mídia
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {gallery.filter(item => item.title && item.url).length} de {gallery.length} completos
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddGalleryItem}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                    >
                      + Adicionar Item
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {gallery.map((item, index) => (
                    <div 
                      key={item.id}
                      className="p-6 border border-[var(--color-border)] rounded-lg space-y-6 hover:border-[var(--color-primary)]/50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Indicador de posição e tipo */}
                          <div className="flex flex-col items-center">
                            <div className={`p-1 rounded ${item.type === 'image' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                              {item.type === 'image' ? (
                                <ImageIcon className="w-4 h-4 text-blue-500" />
                              ) : (
                                <VideoIcon className="w-4 h-4 text-purple-500" />
                              )}
                            </div>
                            <span className="text-xs font-medium text-[var(--color-secondary)]/70 mt-1">
                              {index + 1}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Tipo de Mídia
                                  </label>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant={item.type === 'image' ? 'primary' : 'secondary'}
                                      onClick={() => handleUpdateGalleryItem(index, { type: 'image' })}
                                      className={`${item.type === 'image' ? 'bg-blue-600' : 'bg-[var(--color-background-body)]'} border-none`}
                                    >
                                      <ImageIcon className="w-4 h-4 mr-2" />
                                      Imagem
                                    </Button>
                                    <Button
                                      type="button"
                                      variant={item.type === 'video' ? 'primary' : 'secondary'}
                                      onClick={() => handleUpdateGalleryItem(index, { type: 'video' })}
                                      className={`${item.type === 'video' ? 'bg-purple-600' : 'bg-[var(--color-background-body)]'} border-none`}
                                    >
                                      <VideoIcon className="w-4 h-4 mr-2" />
                                      Vídeo
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Título
                                  </label>
                                  <Input
                                    value={item.title}
                                    onChange={(e) => handleUpdateGalleryItem(index, { title: e.target.value })}
                                    placeholder="Título do item"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    {item.type === 'image' ? 'Imagem' : 'Vídeo'}
                                  </label>
                                  {item.type === 'image' ? (
                                    <ImageUpload
                                      label=""
                                      currentImage={item.url || ''}
                                      selectedFile={galleryFiles[item.id]}
                                      onFileChange={(file) => handleGalleryFileUpload(item.id, file)}
                                      aspectRatio="aspect-video"
                                      previewWidth={300}
                                      previewHeight={200}
                                    />
                                  ) : (
                                    <VideoUpload
                                      label=""
                                      currentVideo={item.url || ''}
                                      selectedFile={galleryFiles[item.id]}
                                      onFileChange={(file) => handleGalleryFileUpload(item.id, file)}
                                      aspectRatio="aspect-video"
                                      previewWidth={300}
                                      previewHeight={200}
                                    />
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Descrição
                                  </label>
                                  <TextArea
                                    value={item.description || ''}
                                    onChange={(e) => handleUpdateGalleryItem(index, { description: e.target.value })}
                                    placeholder="Descrição do item"
                                    rows={3}
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                                
                                <div className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-lg">
                                  <div>
                                    <h4 className="font-medium text-[var(--color-secondary)]">Status</h4>
                                    <p className="text-sm text-[var(--color-secondary)]/70">
                                      {item.enabled ? "Visível" : "Oculto"}
                                    </p>
                                  </div>
                                  <Switch
                                    checked={item.enabled}
                                    onCheckedChange={(checked) => handleUpdateGalleryItem(index, { enabled: checked })}
                                  />
                                </div>
                                
                                <Button
                                  type="button"
                                  onClick={() => handleRemoveGalleryItem(index)}
                                  variant="danger"
                                  className="w-full bg-red-600 hover:bg-red-700 border-none"
                                >
                                  Remover Item
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[var(--color-secondary)]">
                  Call to Action (Chamada para Ação)
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <TextArea
                      label="Texto do CTA"
                      value={pageData.content.ctaText}
                      onChange={(e) => updateNested('content.ctaText', e.target.value)}
                      placeholder="Texto persuasivo para ação do usuário"
                      rows={3}
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Texto do Botão"
                      value={pageData.content.ctaButtonText}
                      onChange={(e) => updateNested('content.ctaButtonText', e.target.value)}
                      placeholder="Ex: Começar Agora, Saiba Mais"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />

                    <Input
                      label="Link do Botão"
                      value={pageData.content.ctaButtonLink}
                      onChange={(e) => updateNested('content.ctaButtonLink', e.target.value)}
                      placeholder="Ex: /contato, #formulario, https://..."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />

                    <ThemePropertyInput
                      property="bg"
                      label="Cor do Botão CTA"
                      description="Cor de fundo do botão principal"
                      currentHex={tailwindToHex(pageData.content.ctaButtonColor || 'bg-red-500')}
                      tailwindClass={pageData.content.ctaButtonColor || 'bg-red-500'}
                      onThemeChange={(_, hex) => {
                        const tailwindClass = hexToTailwindBgClass(hex);
                        updateNested('content.ctaButtonColor', tailwindClass);
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Tema */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações do Tema"
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
                  Personalize o tema do template
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Configure as cores principais que serão usadas em todo o template
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ThemePropertyInput
                  property="bg"
                  label="Cor Primária"
                  description="Cor principal para botões e destaques"
                  currentHex={tailwindToHex(`bg-${pageData.theme.primary_color}`)}
                  tailwindClass={`bg-${pageData.theme.primary_color}`}
                  onThemeChange={(_, hex) => handleThemeColorChange('primary_color', hex)}
                />

                <ThemePropertyInput
                  property="bg"
                  label="Cor Secundária"
                  description="Cor para elementos secundários"
                  currentHex={tailwindToHex(`bg-${pageData.theme.secondary_color}`)}
                  tailwindClass={`bg-${pageData.theme.secondary_color}`}
                  onThemeChange={(_, hex) => handleThemeColorChange('secondary_color', hex)}
                />

                <ThemePropertyInput
                  property="text"
                  label="Cor do Texto"
                  description="Cor principal para textos"
                  currentHex={tailwindToHex(`text-${pageData.theme.text_color}`)}
                  tailwindClass={`text-${pageData.theme.text_color}`}
                  onThemeChange={(_, hex) => handleThemeColorChange('text_color', hex)}
                />

                <ThemePropertyInput
                  property="bg"
                  label="Cor de Fundo"
                  description="Cor de fundo principal"
                  currentHex={tailwindToHex(`bg-${pageData.theme.background_color}`)}
                  tailwindClass={`bg-${pageData.theme.background_color}`}
                  onThemeChange={(_, hex) => handleThemeColorChange('background_color', hex)}
                />

                <ThemePropertyInput
                  property="bg"
                  label="Cor de Destaque"
                  description="Cor para elementos de destaque"
                  currentHex={tailwindToHex(`bg-${pageData.theme.accent_color}`)}
                  tailwindClass={`bg-${pageData.theme.accent_color}`}
                  onThemeChange={(_, hex) => handleThemeColorChange('accent_color', hex)}
                />
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
                    label="Autor do Template"
                    value={pageData.metadata.author}
                    onChange={(e) => updateNested('metadata.author', e.target.value)}
                    placeholder="Ex: Sistema IA, João Silva"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Versão"
                    value={pageData.metadata.version}
                    onChange={(e) => updateNested('metadata.version', e.target.value)}
                    placeholder="Ex: 1.0.0"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Categoria"
                    value={pageData.metadata.category || ''}
                    onChange={(e) => updateNested('metadata.category', e.target.value)}
                    placeholder="Ex: landing-page, blog, ecommerce"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                {/* Tags como lista dinâmica */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[var(--color-secondary)] mb-1">Tags</h4>
                      <p className="text-sm text-[var(--color-secondary)]/70">
                        Adicione tags para organizar e filtrar templates
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                    >
                      + Adicionar Tag
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {tags.map((tag, index) => (
                      <div key={tag.id} className="flex items-center gap-2 p-2 border border-[var(--color-border)] rounded-lg">
                        <Input
                          value={tag.text}
                          onChange={(e) => handleUpdateTag(index, e.target.value)}
                          placeholder="Ex: template, ia, base"
                          className="bg-transparent border-none text-[var(--color-secondary)]"
                        />
                        <Button
                          type="button"
                          onClick={() => handleRemoveTag(index)}
                          variant="danger"
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 border-none"
                        >
                          Remover
                        </Button>
                      </div>
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
          itemName="Template"
          icon={Zap}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Template de Página"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}