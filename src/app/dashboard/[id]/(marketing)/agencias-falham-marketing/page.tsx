/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import { 
  Zap,
  Palette,
  Type,
  Layers,
  Sparkles,
  Target,
  Code,
  Eye,
  Cpu,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Plus,
  GripVertical,
  PaintBucket
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { hexToTailwindBgClass, tailwindToHex } from "@/lib/colors";

interface AmbientLight {
  position: string;
  color: string;
  opacity: string;
  blur: string;
}

interface StylingData {
  background: {
    hex: string;
    texture: string;
    border_top: string;
  };
  ambient_lights: AmbientLight[];
  gradient_brand: string;
}

interface BadgeData {
  label: string;
  icon_pulse: string;
  text_style: string;
}

interface HeadlineData {
  static_text_prefix: string;
  highlight_text: string;
  static_text_suffix: string;
}

interface CopyData {
  paragraph: string;
  strong_points: string[];
}

interface ContentData {
  badge: BadgeData;
  headline: HeadlineData;
  copy: CopyData;
}

interface GSAPAnimation {
  selector: string;
  from: {
    y: number;
    opacity: number;
    stagger: number;
    ease: string;
  };
  trigger_start: string;
}

interface TechnicalConfigData {
  gsap_animations: GSAPAnimation;
}

interface MetadataData {
  category: string;
  specialty: string;
  inspiration: string;
  animation_engine: string;
}

interface WhyTegbeMarketingData {
  metadata: MetadataData;
  styling: StylingData;
  content: ContentData;
  technical_config: TechnicalConfigData;
}

const defaultData: WhyTegbeMarketingData = {
  metadata: {
    category: "Section - Conversion Engineering",
    specialty: "Direct Response & Performance Copywriting",
    inspiration: "Minimalismo Apple / Potência Ferrari",
    animation_engine: "GSAP + ScrollTrigger"
  },
  styling: {
    background: {
      hex: "#020202",
      texture: "Grainy Noise (Opacity 10%)",
      border_top: "white/5"
    },
    ambient_lights: [
      {
        position: "top-right",
        color: "#E31B63",
        opacity: "10%",
        blur: "120px"
      },
      {
        position: "bottom-left",
        color: "#FF0F43",
        opacity: "5%",
        blur: "100px"
      }
    ],
    gradient_brand: "linear-gradient(to right, #FF0F43, #E31B63)"
  },
  content: {
    badge: {
      label: "Engenharia de Vendas",
      icon_pulse: "rose-500",
      text_style: "uppercase tracking-[0.2em]"
    },
    headline: {
      static_text_prefix: "Por que contratar a",
      highlight_text: "Tegbe",
      static_text_suffix: "e não uma agência comum?"
    },
    copy: {
      paragraph: "Agências comuns entregam 'posts criativos' e esperam que você venda. Nós instalamos um Ecossistema de Receita (Tráfego + CRM + IA) para eliminar a dependência da sorte.",
      strong_points: ["Ecossistema de Receita", "Tráfego + CRM + IA"]
    }
  },
  technical_config: {
    gsap_animations: {
      selector: ".reveal-text",
      from: {
        y: 30,
        opacity: 0,
        stagger: 0.2,
        ease: "power3.out"
      },
      trigger_start: "top 80%"
    }
  }
};

const mergeWithDefaults = (apiData: any, defaultData: WhyTegbeMarketingData): WhyTegbeMarketingData => {
  if (!apiData) return defaultData;
  
  return {
    metadata: {
      category: apiData.metadata?.category || defaultData.metadata.category,
      specialty: apiData.metadata?.specialty || defaultData.metadata.specialty,
      inspiration: apiData.metadata?.inspiration || defaultData.metadata.inspiration,
      animation_engine: apiData.metadata?.animation_engine || defaultData.metadata.animation_engine
    },
    styling: {
      background: {
        hex: apiData.styling?.background?.hex || defaultData.styling.background.hex,
        texture: apiData.styling?.background?.texture || defaultData.styling.background.texture,
        border_top: apiData.styling?.background?.border_top || defaultData.styling.background.border_top
      },
      ambient_lights: apiData.styling?.ambient_lights || defaultData.styling.ambient_lights,
      gradient_brand: apiData.styling?.gradient_brand || defaultData.styling.gradient_brand
    },
    content: {
      badge: {
        label: apiData.content?.badge?.label || defaultData.content.badge.label,
        icon_pulse: apiData.content?.badge?.icon_pulse || defaultData.content.badge.icon_pulse,
        text_style: apiData.content?.badge?.text_style || defaultData.content.badge.text_style
      },
      headline: {
        static_text_prefix: apiData.content?.headline?.static_text_prefix || defaultData.content.headline.static_text_prefix,
        highlight_text: apiData.content?.headline?.highlight_text || defaultData.content.headline.highlight_text,
        static_text_suffix: apiData.content?.headline?.static_text_suffix || defaultData.content.headline.static_text_suffix
      },
      copy: {
        paragraph: apiData.content?.copy?.paragraph || defaultData.content.copy.paragraph,
        strong_points: apiData.content?.copy?.strong_points || defaultData.content.copy.strong_points
      }
    },
    technical_config: {
      gsap_animations: {
        selector: apiData.technical_config?.gsap_animations?.selector || defaultData.technical_config.gsap_animations.selector,
        from: {
          y: apiData.technical_config?.gsap_animations?.from?.y || defaultData.technical_config.gsap_animations.from.y,
          opacity: apiData.technical_config?.gsap_animations?.from?.opacity || defaultData.technical_config.gsap_animations.from.opacity,
          stagger: apiData.technical_config?.gsap_animations?.from?.stagger || defaultData.technical_config.gsap_animations.from.stagger,
          ease: apiData.technical_config?.gsap_animations?.from?.ease || defaultData.technical_config.gsap_animations.from.ease
        },
        trigger_start: apiData.technical_config?.gsap_animations?.trigger_start || defaultData.technical_config.gsap_animations.trigger_start
      }
    }
  };
};

export default function WhyTegbeMarketingPage() {
  const [expandedSections, setExpandedSections] = useState({
    metadata: true,
    styling: false,
    content: false,
    technical: false
  });

  const [draggingAmbientLight, setDraggingAmbientLight] = useState<number | null>(null);
  const [draggingStrongPoint, setDraggingStrongPoint] = useState<number | null>(null);

  const newAmbientLightRef = useRef<HTMLDivElement>(null);
  const newStrongPointRef = useRef<HTMLDivElement>(null);

  const {
    data: componentData,
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
  } = useJsonManagement<WhyTegbeMarketingData>({
    apiPath: "/api/tegbe-institucional/json/agencias-falham",
    defaultData: defaultData,
    mergeFunction: mergeWithDefaults,
  });

  const currentData = componentData || defaultData;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    updateNested(path, value);
  };

  // Funções para Ambient Lights
  const handleAmbientLightChange = (index: number, field: keyof AmbientLight, value: string) => {
    const lights = [...currentData.styling.ambient_lights];
    lights[index] = { ...lights[index], [field]: value };
    handleChange('styling.ambient_lights', lights);
  };

  const addAmbientLight = () => {
    const newLight: AmbientLight = {
      position: "center",
      color: "#FFFFFF",
      opacity: "10%",
      blur: "100px"
    };
    const updated = [...currentData.styling.ambient_lights, newLight];
    handleChange('styling.ambient_lights', updated);
    
    setTimeout(() => {
      newAmbientLightRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
  };

  const removeAmbientLight = (index: number) => {
    const lights = currentData.styling.ambient_lights.filter((_, i) => i !== index);
    handleChange('styling.ambient_lights', lights);
  };

  // Funções para Strong Points
  const handleStrongPointChange = (index: number, value: string) => {
    const strongPoints = [...currentData.content.copy.strong_points];
    strongPoints[index] = value;
    handleChange('content.copy.strong_points', strongPoints);
  };

  const addStrongPoint = () => {
    const updated = [...currentData.content.copy.strong_points, ""];
    handleChange('content.copy.strong_points', updated);
    
    setTimeout(() => {
      newStrongPointRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
  };

  const removeStrongPoint = (index: number) => {
    const strongPoints = currentData.content.copy.strong_points.filter((_, i) => i !== index);
    handleChange('content.copy.strong_points', strongPoints);
  };

  // Funções de drag & drop para Ambient Lights
  const handleAmbientLightDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingAmbientLight(index);
  };

  const handleAmbientLightDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingAmbientLight === null || draggingAmbientLight === index) return;
    
    const lights = currentData.styling.ambient_lights;
    const updated = [...lights];
    const draggedItem = updated[draggingAmbientLight];
    
    updated.splice(draggingAmbientLight, 1);
    updated.splice(index, 0, draggedItem);
    
    handleChange('styling.ambient_lights', updated);
    setDraggingAmbientLight(index);
  };

  const handleAmbientLightDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingAmbientLight(null);
  };

  // Funções de drag & drop para Strong Points
  const handleStrongPointDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingStrongPoint(index);
  };

  const handleStrongPointDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingStrongPoint === null || draggingStrongPoint === index) return;
    
    const strongPoints = currentData.content.copy.strong_points;
    const updated = [...strongPoints];
    const draggedItem = updated[draggingStrongPoint];
    
    updated.splice(draggingStrongPoint, 1);
    updated.splice(index, 0, draggedItem);
    
    handleChange('content.copy.strong_points', updated);
    setDraggingStrongPoint(index);
  };

  const handleStrongPointDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingStrongPoint(null);
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

  // Validações
  const isAmbientLightValid = (light: AmbientLight): boolean => {
    return light.position.trim() !== '' && 
           light.color.trim() !== '' && 
           light.opacity.trim() !== '' && 
           light.blur.trim() !== '';
  };

  const isStrongPointValid = (point: string): boolean => {
    return point.trim() !== '';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await save();
  };

  // Cálculo de completude
  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Metadata
    total += 4;
    Object.values(currentData.metadata).forEach(value => {
      if (value?.trim()) completed++;
    });

    // Styling - Background
    total += 3;
    Object.values(currentData.styling.background).forEach(value => {
      if (value?.trim()) completed++;
    });

    // Styling - Ambient Lights
    currentData.styling.ambient_lights.forEach(light => {
      total += 4;
      Object.values(light).forEach(value => {
        if (value?.trim()) completed++;
      });
    });

    // Styling - Gradient
    total += 1;
    if (currentData.styling.gradient_brand?.trim()) completed++;

    // Content - Badge
    total += 3;
    Object.values(currentData.content.badge).forEach(value => {
      if (value?.trim()) completed++;
    });

    // Content - Headline
    total += 3;
    Object.values(currentData.content.headline).forEach(value => {
      if (value?.trim()) completed++;
    });

    // Content - Copy
    total += 1;
    if (currentData.content.copy.paragraph?.trim()) completed++;
    
    total += currentData.content.copy.strong_points.length;
    currentData.content.copy.strong_points.forEach(point => {
      if (point?.trim()) completed++;
    });

    // Technical Config
    total += 1;
    if (currentData.technical_config.gsap_animations.selector?.trim()) completed++;
    
    total += 4;
    Object.values(currentData.technical_config.gsap_animations.from).forEach(value => {
      if (value !== undefined) completed++;
    });
    
    total += 1;
    if (currentData.technical_config.gsap_animations.trigger_start?.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layers} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={TrendingUp}
      title="Why Tegbe Marketing"
      description="Configure a seção de engenharia de conversão e diferenciais da Tegbe"
      exists={!!exists}
      itemName="Why Tegbe Marketing"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Metadata */}
        <div className="space-y-4">
          <SectionHeader
            title="Metadados do Componente"
            section="metadata"
            icon={Cpu}
            isExpanded={expandedSections.metadata}
            onToggle={() => toggleSection("metadata")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.metadata ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Categoria"
                    value={currentData.metadata.category}
                    onChange={(e) => handleChange('metadata.category', e.target.value)}
                    placeholder="Section - Conversion Engineering"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div>
                  <Input
                    label="Especialidade"
                    value={currentData.metadata.specialty}
                    onChange={(e) => handleChange('metadata.specialty', e.target.value)}
                    placeholder="Direct Response & Performance Copywriting"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Inspiração"
                    value={currentData.metadata.inspiration}
                    onChange={(e) => handleChange('metadata.inspiration', e.target.value)}
                    placeholder="Minimalismo Apple / Potência Ferrari"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Motor de Animação"
                    value={currentData.metadata.animation_engine}
                    onChange={(e) => handleChange('metadata.animation_engine', e.target.value)}
                    placeholder="GSAP + ScrollTrigger"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Estilo */}
        <div className="space-y-4">
          <SectionHeader
            title="Estilo Visual"
            section="styling"
            icon={Palette}
            isExpanded={expandedSections.styling}
            onToggle={() => toggleSection("styling")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.styling ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-8">
              {/* Background */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                  <PaintBucket className="w-5 h-5" />
                  Configurações de Fundo
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ThemePropertyInput
                    property="bg"
                    label="Cor de Fundo (Hex)"
                    description="Cor principal do fundo"
                    currentHex={currentData.styling.background.hex}
                    tailwindClass={`bg-[${currentData.styling.background.hex}]`}
                    onThemeChange={(_, hex) => handleChange('styling.background.hex', hex)}
                  />

                  <div>
                    <Input
                      label="Textura"
                      value={currentData.styling.background.texture}
                      onChange={(e) => handleChange('styling.background.texture', e.target.value)}
                      placeholder="Grainy Noise (Opacity 10%)"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                      Descrição da textura aplicada
                    </p>
                  </div>

                  <div>
                    <Input
                      label="Borda Superior"
                      value={currentData.styling.background.border_top}
                      onChange={(e) => handleChange('styling.background.border_top', e.target.value)}
                      placeholder="white/5"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                      Cor e opacidade da borda superior
                    </p>
                  </div>
                </div>
              </div>

              {/* Gradient Brand */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Gradiente da Marca
                </h4>
                <div className="space-y-4">
                  <Input
                    label="Gradiente CSS"
                    value={currentData.styling.gradient_brand}
                    onChange={(e) => handleChange('styling.gradient_brand', e.target.value)}
                    placeholder="linear-gradient(to right, #FF0F43, #E31B63)"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-full h-8 rounded-lg"
                      style={{ background: currentData.styling.gradient_brand }}
                    />
                  </div>
                  <p className="text-xs text-[var(--color-secondary)]/70">
                    Utilize a sintaxe CSS para gradientes lineares
                  </p>
                </div>
              </div>

              {/* Ambient Lights */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Luzes Ambiente
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {currentData.styling.ambient_lights.filter(isAmbientLightValid).length} de {currentData.styling.ambient_lights.length} completos
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={addAmbientLight}
                    variant="primary"
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Luz
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {currentData.styling.ambient_lights.map((light, index) => (
                    <div 
                      key={index}
                      ref={index === currentData.styling.ambient_lights.length - 1 ? newAmbientLightRef : undefined}
                      draggable
                      onDragStart={(e) => handleAmbientLightDragStart(e, index)}
                      onDragOver={(e) => handleAmbientLightDragOver(e, index)}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragEnd={handleAmbientLightDragEnd}
                      onDrop={handleDrop}
                      className={`p-4 border border-[var(--color-border)] rounded-lg space-y-4 transition-all duration-200 ${
                        draggingAmbientLight === index 
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
                            onDragStart={(e) => handleAmbientLightDragStart(e, index)}
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
                              <h4 className="font-medium text-[var(--color-secondary)]">
                                Luz Ambiente #{index + 1}
                              </h4>
                              {isAmbientLightValid(light) ? (
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
                              <div>
                                <Input
                                  label="Posição"
                                  value={light.position}
                                  onChange={(e) => handleAmbientLightChange(index, 'position', e.target.value)}
                                  placeholder="top-right, center, etc."
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                              
                              <div>
                                <ThemePropertyInput
                                  property="bg"
                                  label="Cor da Luz"
                                  description="Cor da luz ambiente"
                                  currentHex={light.color}
                                  tailwindClass={`bg-[${light.color}]`}
                                  onThemeChange={(_, hex) => handleAmbientLightChange(index, 'color', hex)}
                                />
                              </div>
                              
                              <div>
                                <Input
                                  label="Opacidade"
                                  value={light.opacity}
                                  onChange={(e) => handleAmbientLightChange(index, 'opacity', e.target.value)}
                                  placeholder="10%, 5%, etc."
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                              
                              <div>
                                <Input
                                  label="Desfoque (Blur)"
                                  value={light.blur}
                                  onChange={(e) => handleAmbientLightChange(index, 'blur', e.target.value)}
                                  placeholder="120px, 100px, etc."
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            onClick={() => removeAmbientLight(index)}
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
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Conteúdo */}
        <div className="space-y-4">
          <SectionHeader
            title="Conteúdo"
            section="content"
            icon={Type}
            isExpanded={expandedSections.content}
            onToggle={() => toggleSection("content")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.content ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-8">
              {/* Badge */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Badge de Destaque
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Input
                      label="Texto do Badge"
                      value={currentData.content.badge.label}
                      onChange={(e) => handleChange('content.badge.label', e.target.value)}
                      placeholder="Engenharia de Vendas"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div>
                    <ThemePropertyInput
                      property="bg"
                      label="Cor do Ícone Pulsante"
                      description="Cor do efeito pulsante"
                      currentHex={tailwindToHex(`bg-${currentData.content.badge.icon_pulse || 'rose-500'}`)}
                      tailwindClass={`bg-${currentData.content.badge.icon_pulse || 'rose-500'}`}
                      onThemeChange={(_, hex) => {
                        const tailwindClass = hexToTailwindBgClass(hex);
                        const colorValue = tailwindClass.replace('bg-', '');
                        handleChange('content.badge.icon_pulse', colorValue);
                      }}
                    />
                  </div>

                  <div>
                    <Input
                      label="Estilo do Texto"
                      value={currentData.content.badge.text_style}
                      onChange={(e) => handleChange('content.badge.text_style', e.target.value)}
                      placeholder="uppercase tracking-[0.2em]"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                      Classes Tailwind para estilização
                    </p>
                  </div>
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Headline Principal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Input
                      label="Texto Prefixo"
                      value={currentData.content.headline.static_text_prefix}
                      onChange={(e) => handleChange('content.headline.static_text_prefix', e.target.value)}
                      placeholder="Por que contratar a"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div>
                    <Input
                      label="Texto Destacado"
                      value={currentData.content.headline.highlight_text}
                      onChange={(e) => handleChange('content.headline.highlight_text', e.target.value)}
                      placeholder="Tegbe"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div>
                    <Input
                      label="Texto Sufixo"
                      value={currentData.content.headline.static_text_suffix}
                      onChange={(e) => handleChange('content.headline.static_text_suffix', e.target.value)}
                      placeholder="e não uma agência comum?"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Copy */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Conteúdo de Vendas
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {currentData.content.copy.strong_points.filter(isStrongPointValid).length} de {currentData.content.copy.strong_points.length} completos
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={addStrongPoint}
                    variant="primary"
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Ponto
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <TextArea
                    label="Parágrafo Principal"
                    value={currentData.content.copy.paragraph}
                    onChange={(e) => handleChange('content.copy.paragraph', e.target.value)}
                    placeholder="Agências comuns entregam 'posts criativos'..."
                    rows={4}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70">
                    Texto de alto impacto que destaca os diferenciais
                  </p>
                </div>

                <div className="space-y-4">
                  <h5 className="font-medium text-[var(--color-secondary)] mb-2">Pontos Fortes</h5>

                  <div className="space-y-3">
                    {currentData.content.copy.strong_points.map((point, index) => (
                      <div 
                        key={index}
                        ref={index === currentData.content.copy.strong_points.length - 1 ? newStrongPointRef : undefined}
                        draggable
                        onDragStart={(e) => handleStrongPointDragStart(e, index)}
                        onDragOver={(e) => handleStrongPointDragOver(e, index)}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragEnd={handleStrongPointDragEnd}
                        onDrop={handleDrop}
                        className={`p-4 border border-[var(--color-border)] rounded-lg transition-all duration-200 ${
                          draggingStrongPoint === index 
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
                              onDragStart={(e) => handleStrongPointDragStart(e, index)}
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
                                  Ponto Forte #{index + 1}
                                </h5>
                                {isStrongPointValid(point) ? (
                                  <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                    Completo
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                    Incompleto
                                  </span>
                                )}
                              </div>
                              <Input
                                type="text"
                                value={point}
                                onChange={(e) => handleStrongPointChange(index, e.target.value)}
                                placeholder="Ecossistema de Receita"
                                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                              />
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button
                              type="button"
                              onClick={() => removeStrongPoint(index)}
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
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Técnica */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações Técnicas"
            section="technical"
            icon={Code}
            isExpanded={expandedSections.technical}
            onToggle={() => toggleSection("technical")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.technical ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-6">
              <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-4">
                Animações GSAP
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Seletor CSS"
                    value={currentData.technical_config.gsap_animations.selector}
                    onChange={(e) => handleChange('technical_config.gsap_animations.selector', e.target.value)}
                    placeholder=".reveal-text"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div>
                  <Input
                    label="Início do Trigger"
                    value={currentData.technical_config.gsap_animations.trigger_start}
                    onChange={(e) => handleChange('technical_config.gsap_animations.trigger_start', e.target.value)}
                    placeholder="top 80%"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium text-[var(--color-secondary)]">Configurações &quot;From&quot;</h5>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Input
                      label="Posição Y (px)"
                      type="number"
                      value={currentData.technical_config.gsap_animations.from.y}
                      onChange={(e) => handleChange('technical_config.gsap_animations.from.y', parseInt(e.target.value) || 0)}
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div>
                    <Input
                      label="Opacidade Inicial"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={currentData.technical_config.gsap_animations.from.opacity}
                      onChange={(e) => handleChange('technical_config.gsap_animations.from.opacity', parseFloat(e.target.value) || 0)}
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div>
                    <Input
                      label="Stagger (segundos)"
                      type="number"
                      step="0.1"
                      value={currentData.technical_config.gsap_animations.from.stagger}
                      onChange={(e) => handleChange('technical_config.gsap_animations.from.stagger', parseFloat(e.target.value) || 0)}
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div>
                    <Input
                      label="Easing Function"
                      value={currentData.technical_config.gsap_animations.from.ease}
                      onChange={(e) => handleChange('technical_config.gsap_animations.from.ease', e.target.value)}
                      placeholder="power3.out"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
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
          itemName="Why Tegbe Marketing"
          icon={TrendingUp}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Why Tegbe Marketing"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}