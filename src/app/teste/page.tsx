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
  XCircle
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { useListState } from "@/hooks/useListState";
import { Button } from "@/components/Button";

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  order: number;
}

interface TestPageData {
  id?: string;
  pageName: string;
  description: string;
  slug: string;
  templateType: string;
  components: {
    header: boolean;
    footer: boolean;
    sidebar: boolean;
    hero: boolean;
    features: boolean;
    testimonials: boolean;
    cta: boolean;
    gallery: boolean;
    video: boolean;
    pricing: boolean;
    contactForm: boolean;
  };
  content: {
    heroTitle: string;
    heroSubtitle: string;
    features: Feature[];
    ctaText: string;
    ctaButtonText: string;
    ctaButtonLink: string;
  };
  metadata: {
    author: string;
    version: string;
    lastModified: string;
    tags: string[];
  };
}

const defaultTestPageData: TestPageData = {
  pageName: "Página de Teste - Template Base",
  description: "Template base para criação de novas páginas por IAs",
  slug: "test-page-template",
  templateType: "landing-page",
  components: {
    header: true,
    footer: true,
    sidebar: false,
    hero: true,
    features: true,
    testimonials: true,
    cta: true,
    gallery: false,
    video: false,
    pricing: false,
    contactForm: false,
  },
  content: {
    heroTitle: "Bem-vindo à Página de Teste",
    heroSubtitle: "Este é um template base para IAs criarem novas páginas com componentes reutilizáveis",
    features: [
      {
        id: "feat-001",
        icon: "mdi:rocket-launch",
        title: "Rápido e Eficiente",
        description: "Carregamento otimizado para melhor performance com lazy loading",
        enabled: true,
        order: 0
      },
      {
        id: "feat-002",
        icon: "mdi:shield-check",
        title: "Seguro e Confiável",
        description: "Protegido com as melhores práticas de segurança e validação",
        enabled: true,
        order: 1
      },
      {
        id: "feat-003",
        icon: "mdi:cog",
        title: "Fácil de Customizar",
        description: "Interface intuitiva para personalização sem código",
        enabled: true,
        order: 2
      }
    ],
    ctaText: "Pronto para começar? Crie sua próxima página em minutos!",
    ctaButtonText: "Iniciar Agora",
    ctaButtonLink: "#start",
  },
  metadata: {
    author: "Sistema IA",
    version: "1.0.0",
    lastModified: new Date().toISOString(),
    tags: ["template", "ia", "base", "reutilizável"],
  },
};

const mergeWithDefaults = (apiData: any, defaultData: TestPageData): TestPageData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id,
    pageName: apiData.pageName || defaultData.pageName,
    description: apiData.description || defaultData.description,
    slug: apiData.slug || defaultData.slug,
    templateType: apiData.templateType || defaultData.templateType,
    components: {
      header: apiData.components?.header ?? defaultData.components.header,
      footer: apiData.components?.footer ?? defaultData.components.footer,
      sidebar: apiData.components?.sidebar ?? defaultData.components.sidebar,
      hero: apiData.components?.hero ?? defaultData.components.hero,
      features: apiData.components?.features ?? defaultData.components.features,
      testimonials: apiData.components?.testimonials ?? defaultData.components.testimonials,
      cta: apiData.components?.cta ?? defaultData.components.cta,
      gallery: apiData.components?.gallery ?? defaultData.components.gallery,
      video: apiData.components?.video ?? defaultData.components.video,
      pricing: apiData.components?.pricing ?? defaultData.components.pricing,
      contactForm: apiData.components?.contactForm ?? defaultData.components.contactForm,
    },
    content: {
      heroTitle: apiData.content?.heroTitle || defaultData.content.heroTitle,
      heroSubtitle: apiData.content?.heroSubtitle || defaultData.content.heroSubtitle,
      features: apiData.content?.features || defaultData.content.features,
      ctaText: apiData.content?.ctaText || defaultData.content.ctaText,
      ctaButtonText: apiData.content?.ctaButtonText || defaultData.content.ctaButtonText,
      ctaButtonLink: apiData.content?.ctaButtonLink || defaultData.content.ctaButtonLink,
    },
    metadata: {
      author: apiData.metadata?.author || defaultData.metadata.author,
      version: apiData.metadata?.version || defaultData.metadata.version,
      lastModified: apiData.metadata?.lastModified || defaultData.metadata.lastModified,
      tags: apiData.metadata?.tags || defaultData.metadata.tags,
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
  } = useJsonManagement<TestPageData>({
    apiPath: "/api/tegbe-institucional/json/test-page-template",
    defaultData: defaultTestPageData,
    mergeFunction: mergeWithDefaults,
  });

  // Estado local para erro das features
  const [featuresError, setFeaturesError] = useState<string | null>(null);

  // Hook para gerenciar features com drag & drop
  const featuresList = useListState<Feature>({
    initialItems: pageData.content.features,
    defaultItem: {
      id: '',
      icon: 'mdi:star',
      title: '',
      description: '',
      enabled: true,
      order: 0
    },
    validationFields: ['title', 'description', 'icon'],
    enableDragDrop: true
  });

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    components: false,
    content: false,
    metadata: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Função para adicionar feature com tratamento de erro
  const handleAddFeature = () => {
    const success = featuresList.addItem();
    if (!success) {
      setFeaturesError(featuresList.validationError);
    } else {
      setFeaturesError(null);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Verifica se há erro de validação nas features
    if (featuresList.validationError) {
      setFeaturesError(featuresList.validationError);
      return;
    }
    
    try {
      // Atualiza features no pageData antes de salvar
      updateNested('content.features', featuresList.items);
      updateNested('metadata.lastModified', new Date().toISOString());
      
      setTimeout(async () => {
        await save();
        setFeaturesError(null); // Limpa erro após salvar com sucesso
      }, 100);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setFeaturesError("Erro ao salvar as alterações.");
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    featuresList.startDrag(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    featuresList.handleDragOver(index);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    featuresList.endDrag();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    featuresList.endDrag();
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    total += 3;
    if (pageData.pageName.trim()) completed++;
    if (pageData.description.trim()) completed++;
    if (pageData.slug.trim()) completed++;

    total += Object.keys(pageData.components).length;
    completed += Object.values(pageData.components).filter(v => v === true).length;

    // Content
    total += 3;
    if (pageData.content.heroTitle.trim()) completed++;
    if (pageData.content.heroSubtitle.trim()) completed++;
    if (pageData.content.ctaText.trim()) completed++;

    // Features (do hook interno)
    total += featuresList.items.length * 3;
    featuresList.items.forEach(feature => {
      if (feature.title.trim()) completed++;
      if (feature.description.trim()) completed++;
      if (feature.icon.trim()) completed++;
    });

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
      description="Configure templates base para inteligências artificiais criarem novas páginas"
      exists={!!exists}
      itemName="Template"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Básica */}
        <div className="space-y-4">
          <SectionHeader
            title="Informações Básicas do Template"
            section="basic"
            icon={Layout}
            isExpanded={expandedSections.basic}
            onToggle={() => toggleSection("basic")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.basic ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nome da Página/Template"
                  value={pageData.pageName}
                  onChange={(e) => updateNested('pageName', e.target.value)}
                  placeholder="Ex: Landing Page Marketing Premium"
                  required
                />

                <Input
                  label="Slug Identificador"
                  value={pageData.slug}
                  onChange={(e) => updateNested('slug', e.target.value)}
                  placeholder="Ex: marketing-landing-page"
                />

                <div className="md:col-span-2">
                  <TextArea
                    label="Descrição do Template"
                    value={pageData.description}
                    onChange={(e) => updateNested('description', e.target.value)}
                    placeholder="Descreva o propósito e uso deste template"
                    rows={3}
                  />
                </div>

                <Input
                  label="Tipo de Template"
                  value={pageData.templateType}
                  onChange={(e) => updateNested('templateType', e.target.value)}
                  placeholder="Ex: landing-page, blog-post, product-page"
                />
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
            <Card className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-200 mb-2">
                  Selecione os componentes que estarão disponíveis
                </h4>
                <p className="text-sm text-gray-400">
                  Cada componente ativo será incluído no template
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(pageData.components).map(([key, value]) => {
                  const labelMap: Record<string, string> = {
                    header: 'Cabeçalho',
                    footer: 'Rodapé',
                    sidebar: 'Barra Lateral',
                    hero: 'Seção Hero',
                    features: 'Recursos/Destaques',
                    testimonials: 'Depoimentos',
                    cta: 'Call to Action',
                    gallery: 'Galeria',
                    video: 'Player de Vídeo',
                    pricing: 'Tabela de Preços',
                    contactForm: 'Formulário de Contato'
                  };

                  return (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${value ? 'bg-green-900/30' : 'bg-gray-700'}`}>
                          <span className="text-sm">
                            {value ? '✓' : '✗'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-200">
                            {labelMap[key] || key}
                          </h4>
                          <p className="text-xs text-gray-400 capitalize">
                            {key}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => 
                          updateNested(`components.${key}`, checked)
                        }
                      />
                    </div>
                  );
                })}
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
            <Card className="p-6 space-y-8">
              {/* Hero Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-200">
                  Seção Hero (Destaque Principal)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Título Principal"
                    value={pageData.content.heroTitle}
                    onChange={(e) => updateNested('content.heroTitle', e.target.value)}
                    placeholder="Título impactante da página"
                    required
                  />

                  <div>
                    <TextArea
                      label="Subtítulo"
                      value={pageData.content.heroSubtitle}
                      onChange={(e) => updateNested('content.heroSubtitle', e.target.value)}
                      placeholder="Subtítulo descritivo e convidativo"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Features usando hook com drag & drop */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                      <ListIcon className="w-5 h-5" />
                      Recursos/Features
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-400">
                          {featuresList.completeCount} de {featuresList.totalCount} completos
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-400">
                        Limite: {featuresList.currentPlanType === 'pro' ? '10' : '5'} itens
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddFeature}
                      variant="primary"
                      className="whitespace-nowrap"
                      disabled={!featuresList.canAddNewItem}
                    >
                      + Adicionar Recurso
                    </Button>
                    {featuresList.isLimitReached && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Limite do plano atingido
                      </p>
                    )}
                  </div>
                </div>

                {/* Mensagem de erro */}
                {featuresError && (
                  <div className={`p-3 rounded-lg ${featuresList.isLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'}`}>
                    <div className="flex items-start gap-2">
                      {featuresList.isLimitReached ? (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm ${featuresList.isLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                        {featuresError}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {featuresList.filteredItems.map((feature, index) => (
                    <div 
                      key={feature.id}
                      ref={index === featuresList.filteredItems.length - 1 ? featuresList.newItemRef : undefined}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`p-6 bg-gray-800 rounded-lg space-y-6 border-2 transition-all duration-200 ${
                        featuresList.draggingItem === index 
                          ? 'border-blue-500 bg-blue-900/20' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Handle para drag & drop */}
                          <div 
                            className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-700 rounded transition-colors"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                          >
                            <GripVertical className="w-5 h-5 text-gray-400" />
                          </div>
                          
                          {/* Indicador de posição */}
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-medium text-gray-400">
                              {index + 1}
                            </span>
                            <div className="w-px h-4 bg-gray-700 mt-1"></div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-200">
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
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                  Ícone
                                </label>
                                <IconSelector
                                  value={feature.icon}
                                  onChange={(value) => featuresList.updateItem(index, { icon: value })}
                                  placeholder="mdi:star"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                  Título
                                </label>
                                <Input
                                  value={feature.title}
                                  onChange={(e) => featuresList.updateItem(index, { title: e.target.value })}
                                  placeholder="Título do recurso"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                  Descrição
                                </label>
                                <TextArea
                                  value={feature.description}
                                  onChange={(e) => featuresList.updateItem(index, { description: e.target.value })}
                                  placeholder="Descrição detalhada do recurso"
                                  rows={3}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            onClick={() => featuresList.removeItem(index)}
                            variant="danger"
                            className="whitespace-nowrap"
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-200">
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
                    />
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Texto do Botão"
                      value={pageData.content.ctaButtonText}
                      onChange={(e) => updateNested('content.ctaButtonText', e.target.value)}
                      placeholder="Ex: Começar Agora, Saiba Mais"
                    />

                    <Input
                      label="Link do Botão"
                      value={pageData.content.ctaButtonLink}
                      onChange={(e) => updateNested('content.ctaButtonLink', e.target.value)}
                      placeholder="Ex: /contato, #formulario, https://..."
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
            icon={Layout}
            isExpanded={expandedSections.metadata}
            onToggle={() => toggleSection("metadata")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.metadata ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Autor do Template"
                    value={pageData.metadata.author}
                    onChange={(e) => updateNested('metadata.author', e.target.value)}
                    placeholder="Ex: Sistema IA, João Silva"
                  />

                  <Input
                    label="Versão"
                    value={pageData.metadata.version}
                    onChange={(e) => updateNested('metadata.version', e.target.value)}
                    placeholder="Ex: 1.0.0"
                  />
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
        errorMsg={errorMsg || featuresError} 
      />
    </ManageLayout>
  );
}