/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import { 
  Palette,
  Tag,
  ListIcon,
  Type,
  FileText,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Sparkles,
  Zap,
  GraduationCap
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import ColorPicker from "@/components/ColorPicker";
import IconSelector from "@/components/IconSelector";

interface Feature {
  icon: string;
  label: string;
}

interface Paragraph {
  text: string;
  bold?: string;
  highlight?: string;
}

interface Description {
  paragraph1: Paragraph;
  paragraph2: Paragraph;
}

interface Headline {
  prefix: string;
  highlight: string;
  suffix: string;
}

interface Theme {
  accentColor: string;
  secondaryColor: string;
}

interface CursosData {
  theme: Theme;
  badge: string;
  features: Feature[];
  headline: Headline;
  description: Description;
}

interface PageData {
  cursos: CursosData;
}

const defaultCursosData: CursosData = {
  theme: {
    accentColor: "#FFD700",
    secondaryColor: "#B8860B"
  },
  badge: "Vivência de Campo",
  features: [
    {
      icon: "mdi:currency-usd",
      label: "Liberdade Financeira"
    },
    {
      icon: "mdi:clock-fast",
      label: "Resultado Prático"
    }
  ],
  headline: {
    prefix: "Por que aprender com a ",
    highlight: "Tegbe",
    suffix: " e não com um \"guru\"?"
  },
  description: {
    paragraph1: {
      text: "O mercado está cheio de professores que nunca venderam nada. A Tegbe é, antes de tudo, uma ",
      bold: "operação de vendas ativa."
    },
    paragraph2: {
      text: "Não ensinamos teorias de livros antigos. Nós abrimos a caixa-preta das estratégias que geram milhões todos os meses.",
      highlight: "Você aprende o que nós aplicamos hoje."
    }
  }
};

const defaultPageData: PageData = {
  cursos: defaultCursosData
};

// Função de merge para garantir que todos os campos estejam definidos
const mergeWithDefaults = (apiData: any, defaultData: PageData): PageData => {
  if (!apiData) return defaultData;
  
  const apiCursos = apiData.cursos || {};
  
  return {
    cursos: {
      theme: {
        accentColor: apiCursos.theme?.accentColor || defaultData.cursos.theme.accentColor,
        secondaryColor: apiCursos.theme?.secondaryColor || defaultData.cursos.theme.secondaryColor,
      },
      badge: apiCursos.badge || defaultData.cursos.badge,
      features: apiCursos.features || defaultData.cursos.features,
      headline: {
        prefix: apiCursos.headline?.prefix || defaultData.cursos.headline.prefix,
        highlight: apiCursos.headline?.highlight || defaultData.cursos.headline.highlight,
        suffix: apiCursos.headline?.suffix || defaultData.cursos.headline.suffix,
      },
      description: {
        paragraph1: {
          text: apiCursos.description?.paragraph1?.text || defaultData.cursos.description.paragraph1.text,
          bold: apiCursos.description?.paragraph1?.bold || defaultData.cursos.description.paragraph1.bold,
        },
        paragraph2: {
          text: apiCursos.description?.paragraph2?.text || defaultData.cursos.description.paragraph2.text,
          highlight: apiCursos.description?.paragraph2?.highlight || defaultData.cursos.description.paragraph2.highlight,
        }
      }
    }
  };
};

export default function CursosPage() {
  const {
    data: pageData,
    loading,
    success,
    errorMsg,
    deleteModal,
    exists,
    updateNested,
    save,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
  } = useJsonManagement<PageData>({
    apiPath: "/api/tegbe-institucional/json/aprender",
    defaultData: defaultPageData,
    mergeFunction: mergeWithDefaults,
  });

  const [expandedSections, setExpandedSections] = useState({
    theme: true,
    badge: false,
    features: false,
    headline: false,
    description: false,
  });

  const [draggingFeature, setDraggingFeature] = useState<number | null>(null);

  // Referência para novo feature
  const newFeatureRef = useRef<HTMLDivElement>(null);

  // Controle de planos
  const currentPlanType = 'pro';
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Helper para obter dados da seção cursos
  const getCursosData = (): CursosData => {
    return pageData?.cursos || defaultCursosData;
  };

  const handleUpdate = useCallback((path: string, value: any) => {
    updateNested(`cursos.${path}`, value);
  }, [updateNested]);

  const handleColorChange = (path: string, color: string) => {
    const cleanColor = color.startsWith('#') ? color : `#${color}`;
    handleUpdate(path, cleanColor);
  };

  // Funções para features
  const handleAddFeature = () => {
    const features = getCursosData().features;
    if (features.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: Feature = {
      icon: "mdi:star",
      label: ""
    };
    
    const updated = [...features, newItem];
    handleUpdate('features', updated);
    
    setTimeout(() => {
      newFeatureRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const handleUpdateFeature = (index: number, updates: Partial<Feature>) => {
    const features = getCursosData().features;
    const updated = [...features];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      handleUpdate('features', updated);
    }
  };

  const handleRemoveFeature = (index: number) => {
    const features = getCursosData().features;
    
    if (features.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyFeature: Feature = {
        icon: "mdi:star",
        label: ""
      };
      handleUpdate('features', [emptyFeature]);
    } else {
      const updated = features.filter((_, i) => i !== index);
      handleUpdate('features', updated);
    }
  };

  // Funções de drag & drop para features
  const handleFeatureDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingFeature(index);
  };

  const handleFeatureDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingFeature === null || draggingFeature === index) return;
    
    const features = getCursosData().features;
    const updated = [...features];
    const draggedItem = updated[draggingFeature];
    
    updated.splice(draggingFeature, 1);
    updated.splice(index, 0, draggedItem);
    
    handleUpdate('features', updated);
    setDraggingFeature(index);
  };

  const handleFeatureDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingFeature(null);
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
  const isFeatureValid = (feature: Feature): boolean => {
    return feature.icon.trim() !== '' && feature.label.trim() !== '';
  };

  const features = getCursosData().features;
  const isFeaturesLimitReached = features.length >= currentPlanLimit;
  const canAddNewFeature = !isFeaturesLimitReached;
  const featuresCompleteCount = features.filter(isFeatureValid).length;
  const featuresTotalCount = features.length;

  const featuresValidationError = isFeaturesLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;
    const data = getCursosData();

    // Tema (2 campos) - USANDO VALIDAÇÃO SEGURA
    total += 2;
    if (data.theme?.accentColor?.trim()) completed++;
    if (data.theme?.secondaryColor?.trim()) completed++;

    // Badge (1 campo)
    total += 1;
    if (data.badge?.trim()) completed++;

    // Features (2 campos cada)
    total += features.length * 2;
    features.forEach(feature => {
      if (feature.icon?.trim()) completed++;
      if (feature.label?.trim()) completed++;
    });

    // Headline (3 campos)
    total += 3;
    if (data.headline?.prefix?.trim()) completed++;
    if (data.headline?.highlight?.trim()) completed++;
    if (data.headline?.suffix?.trim()) completed++;

    // Description (4 campos - 2 parágrafos, cada um com texto e destaque)
    total += 4;
    if (data.description?.paragraph1?.text?.trim()) completed++;
    if (data.description?.paragraph1?.bold?.trim()) completed++;
    if (data.description?.paragraph2?.text?.trim()) completed++;
    if (data.description?.paragraph2?.highlight?.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  // Renderizar seção de tema
  const renderThemeSection = () => {
    const themeData = getCursosData().theme;
    
    return (
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
          animate={{ height: expandedSections.theme ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6 bg-[var(--color-background)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Cor de Destaque (Primária)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="#FFD700"
                    value={themeData?.accentColor || "#FFD700"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleUpdate('theme.accentColor', e.target.value)
                    }
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono flex-1"
                  />
                  <ColorPicker
                    color={themeData?.accentColor || "#FFD700"}
                    onChange={(color: string) => handleColorChange('theme.accentColor', color)}
                  />
                </div>
                <p className="text-xs text-[var(--color-secondary)]/70">
                  Cor dourada para elementos principais
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Cor Secundária
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="#B8860B"
                    value={themeData?.secondaryColor || "#B8860B"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleUpdate('theme.secondaryColor', e.target.value)
                    }
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono flex-1"
                  />
                  <ColorPicker
                    color={themeData?.secondaryColor || "#B8860B"}
                    onChange={(color: string) => handleColorChange('theme.secondaryColor', color)}
                  />
                </div>
                <p className="text-xs text-[var(--color-secondary)]/70">
                  Cor bronze para elementos secundários
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  // Renderizar seção de badge
  const renderBadgeSection = () => {
    const badge = getCursosData().badge;
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Badge" 
          section="badge" 
          icon={Tag}
          isExpanded={expandedSections.badge}
          onToggle={() => toggleSection("badge")}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.badge ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6 bg-[var(--color-background)]">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-secondary)]">
                Texto do Badge
              </label>
              <Input
                type="text"
                placeholder="Vivência de Campo"
                value={badge || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleUpdate('badge', e.target.value)
                }
                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
              />
              <p className="text-xs text-[var(--color-secondary)]/70">
                Texto que aparece no badge da seção
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  // Renderizar seção de features
  const renderFeaturesSection = () => {
    const features = getCursosData().features;
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Features" 
          section="features" 
          icon={ListIcon}
          isExpanded={expandedSections.features}
          onToggle={() => toggleSection("features")}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.features ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6 bg-[var(--color-background)]">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                    Lista de Features
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {featuresCompleteCount} de {featuresTotalCount} completos
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
                    onClick={handleAddFeature}
                    variant="primary"
                    className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                    disabled={!canAddNewFeature}
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Feature
                  </Button>
                  {isFeaturesLimitReached && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Limite do plano atingido
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-[var(--color-secondary)]/70">
                Cada feature deve ter um ícone e um rótulo.
              </p>
            </div>

            {/* Mensagem de erro */}
            {featuresValidationError && (
              <div className={`p-3 rounded-lg ${isFeaturesLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                <div className="flex items-start gap-2">
                  {isFeaturesLimitReached ? (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={`text-sm ${isFeaturesLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                    {featuresValidationError}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  ref={index === features.length - 1 ? newFeatureRef : undefined}
                  draggable
                  onDragStart={(e) => handleFeatureDragStart(e, index)}
                  onDragOver={(e) => handleFeatureDragOver(e, index)}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragEnd={handleFeatureDragEnd}
                  onDrop={handleDrop}
                  className={`p-4 border border-[var(--color-border)] rounded-lg space-y-4 transition-all duration-200 ${
                    draggingFeature === index 
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
                        onDragStart={(e) => handleFeatureDragStart(e, index)}
                      >
                        <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-medium text-[var(--color-secondary)]/70">
                          {index + 1}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h5 className="font-medium text-[var(--color-secondary)]">
                            {feature?.label || "Feature sem nome"}
                          </h5>
                          {isFeatureValid(feature) ? (
                            <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                              Completo
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                              Incompleto
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-[var(--color-secondary)]">
                              Ícone
                            </label>
                            <IconSelector
                              value={feature?.icon || ""}
                              onChange={(value) => handleUpdateFeature(index, { icon: value })}
                              placeholder="mdi:currency-usd"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-[var(--color-secondary)]">
                              Rótulo
                            </label>
                            <Input
                              value={feature?.label || ""}
                              onChange={(e) => handleUpdateFeature(index, { label: e.target.value })}
                              placeholder="Liberdade Financeira"
                              className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        variant="danger"
                        className="bg-red-600 hover:bg-red-700 border-none flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
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
    );
  };

  // Renderizar seção de headline
  const renderHeadlineSection = () => {
    const headlineData = getCursosData().headline;
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Headline" 
          section="headline" 
          icon={Type}
          isExpanded={expandedSections.headline}
          onToggle={() => toggleSection("headline")}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.headline ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6 bg-[var(--color-background)]">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Prefixo
                </label>
                <Input
                  type="text"
                  placeholder="Por que aprender com a "
                  value={headlineData?.prefix || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleUpdate('headline.prefix', e.target.value)
                  }
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <p className="text-xs text-[var(--color-secondary)]/70">
                  Texto antes da palavra destacada
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Palavra em Destaque
                </label>
                <Input
                  type="text"
                  placeholder="Tegbe"
                  value={headlineData?.highlight || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleUpdate('headline.highlight', e.target.value)
                  }
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <p className="text-xs text-[var(--color-secondary)]/70">
                  Parte do headline que será destacada
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Sufixo
                </label>
                <Input
                  type="text"
                  placeholder=' e não com um "guru"?'
                  value={headlineData?.suffix || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleUpdate('headline.suffix', e.target.value)
                  }
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <p className="text-xs text-[var(--color-secondary)]/70">
                  Texto após a palavra destacada
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  // Renderizar seção de description
  const renderDescriptionSection = () => {
    const descriptionData = getCursosData().description;
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Descrição" 
          section="description" 
          icon={FileText}
          isExpanded={expandedSections.description}
          onToggle={() => toggleSection("description")}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.description ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6 bg-[var(--color-background)]">
            <div className="space-y-8">
              {/* Parágrafo 1 */}
              <div className="space-y-4">
                <h4 className="font-medium text-[var(--color-secondary)]">Parágrafo 1</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Texto
                    </label>
                    <TextArea
                      value={descriptionData?.paragraph1?.text || ""}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                        handleUpdate('description.paragraph1.text', e.target.value)
                      }
                      placeholder="O mercado está cheio de professores que nunca venderam nada. A Tegbe é, antes de tudo, uma "
                      rows={3}
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Texto em Negrito
                    </label>
                    <Input
                      type="text"
                      placeholder="operação de vendas ativa."
                      value={descriptionData?.paragraph1?.bold || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleUpdate('description.paragraph1.bold', e.target.value)
                      }
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70">
                      Parte do texto que aparecerá em negrito (opcional)
                    </p>
                  </div>
                </div>
              </div>

              {/* Parágrafo 2 */}
              <div className="space-y-4">
                <h4 className="font-medium text-[var(--color-secondary)]">Parágrafo 2</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Texto
                    </label>
                    <TextArea
                      value={descriptionData?.paragraph2?.text || ""}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                        handleUpdate('description.paragraph2.text', e.target.value)
                      }
                      placeholder="Não ensinamos teorias de livros antigos. Nós abrimos a caixa-preta das estratégias que geram milhões todos os meses."
                      rows={3}
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Texto em Destaque
                    </label>
                    <Input
                      type="text"
                      placeholder="Você aprende o que nós aplicamos hoje."
                      value={descriptionData?.paragraph2?.highlight || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleUpdate('description.paragraph2.highlight', e.target.value)
                      }
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70">
                      Parte do texto que aparecerá destacada (opcional)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  if (loading && !exists) {
    return <Loading layout={GraduationCap} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={GraduationCap}
      title="Conteúdo de Cursos"
      description="Configure o conteúdo da seção de diferenciais dos cursos"
      exists={!!exists}
      itemName="Cursos"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seções */}
        <div className="space-y-6">
          {renderThemeSection()}
          {renderBadgeSection()}
          {renderFeaturesSection()}
          {renderHeadlineSection()}
          {renderDescriptionSection()}
        </div>

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          isAddDisabled={false}
          isSaving={loading}
          exists={!!exists}
          completeCount={completion.completed}
          totalCount={completion.total}
          itemName="Cursos"
          icon={GraduationCap}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração de Cursos"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}