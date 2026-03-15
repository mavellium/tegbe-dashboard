/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Switch } from "@/components/Switch";
import { 
  Layout, 
  Image as ImageIcon, 
  Type, 
  Droplet,
  Layers,
  Palette,
  Grid,
  Sun,
  MonitorDown,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Check
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ImageUpload } from "@/components/ImageUpload";
import Loading from "@/components/Loading";

// ==========================================
// COMPONENTE COLOR PICKER CUSTOMIZADO
// ==========================================
interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const presetColors = [
  "#EF4444", "#22C55E", "#3B82F6",
  "#EC4899", "#06B6D4", "#F59E0B", "#84CC16",
  "#111827", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#F3F4F6",
  "#F0FDF4", "#FEF3C7",
];

function ColorPicker({ color, onChange }: ColorPickerProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [showPicker, setShowPicker] = useState(false);

  const normalizedColor = useMemo(() => {
    if (!color) return "#000000";
    const normalized = color.startsWith("#") ? color : `#${color}`;
    return normalized;
  }, [color]);

  const [selectedColor, setSelectedColor] = useState(normalizedColor);
  const [inputColor, setInputColor] = useState(normalizedColor);

  useEffect(() => {
    const normalized = color?.startsWith("#") ? color : `#${color}` || "#000000";
    setSelectedColor(normalized);
    setInputColor(normalized);
  }, [color]);

  useEffect(() => {
    if (!showPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  const applyPickerPosition = () => {
    const button = buttonRef.current;
    const picker = pickerRef.current;

    if (!button || !picker) return;

    const rect = button.getBoundingClientRect();
    const pickerWidth = 272;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = rect.left + rect.width / 2 - pickerWidth / 2;
    let top = rect.bottom + 8;

    if (left + pickerWidth > viewportWidth - 16) {
      left = viewportWidth - pickerWidth - 16;
    }

    if (left < 16) {
      left = 16;
    }

    if (top + 320 > viewportHeight) {
      top = rect.top - 320;
    }

    picker.style.left = `${left}px`;
    picker.style.top = `${top}px`;
  };

  const togglePicker = () => {
    setShowPicker((open) => {
      const next = !open;
      if (next) {
        requestAnimationFrame(applyPickerPosition);
      }
      return next;
    });
  };

  const applyColor = (newColor: string) => {
    const normalized = newColor.startsWith("#")
      ? newColor
      : `#${newColor}`;

    setSelectedColor(normalized);
    setInputColor(normalized);
    onChange(normalized);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputColor(value);

    if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
      applyColor(value);
    }
  };

  const handleInputBlur = () => {
    const value = inputColor.startsWith("#")
      ? inputColor
      : `#${inputColor}`;

    if (!/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
      setInputColor(selectedColor);
    } else {
      applyColor(value);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={togglePicker}
        className="h-10 px-3 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background-body)] hover:border-[var(--color-primary)] transition-colors flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-[var(--color-secondary)] opacity-70" />
          <span className="text-sm font-mono text-[var(--color-secondary)] uppercase">
            {normalizedColor}
          </span>
        </div>
        <div
          className="w-6 h-6 rounded border border-[var(--color-border)] shadow-inner"
          style={{ backgroundColor: normalizedColor }}
        />
      </button>

      {showPicker && (
        <>
          <div className="fixed inset-0 bg-black/10 z-40" />

          <div
            ref={pickerRef}
            className="fixed z-50 p-4 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg shadow-xl w-68 space-y-4"
          >
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => applyColor(e.target.value)}
              className="w-full h-10 rounded cursor-pointer"
            />

            <input
              type="text"
              value={inputColor}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded font-mono bg-[var(--color-background-body)] text-[var(--color-secondary)] uppercase outline-none focus:border-[var(--color-primary)]"
            />

            <div className="grid grid-cols-8 gap-1.5">
              {presetColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    applyColor(c);
                    setShowPicker(false);
                  }}
                  className="w-6 h-6 rounded border border-[var(--color-border)] relative shadow-sm hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                >
                  {selectedColor.toUpperCase() === c.toUpperCase() && (
                    <Check className="absolute inset-0 m-auto w-3 h-3 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="w-full py-2 text-sm bg-[var(--color-background-body)] hover:bg-[var(--color-border)] rounded text-[var(--color-secondary)] font-medium transition-colors"
            >
              Fechar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ========== INTERFACES DA PÁGINA ==========
interface HeroSettingsData {
  hero: {
    section: {
      backgroundColor: string;
      minHeight: string;
      padding: string;
    };
    background: {
      radialGlow: {
        enabled: boolean;
        color: string;
        opacity: number;
        blur: string;
        size: string;
        position: { top: string };
      };
      grid: {
        enabled: boolean;
        opacity: number;
        lineColor: string;
        cellSize: string;
      };
      textureOverlay: {
        enabled: boolean;
        image: string;
        opacity: number;
        blendMode: string;
      };
      fadeBottom: {
        enabled: boolean;
        height: string;
        gradient: string;
      };
    };
    content: {
      logo: {
        src: string;
        alt: string;
        width: number;
        height: number;
        priority: boolean;
        dropShadow: string;
      };
      tagline: {
        text: string;
        position: string;
        color: string;
        fontSize: { mobile: string; desktop: string };
        fontStyle: string;
        fontFamily: string;
      };
    };
    watermark: {
      enabled: boolean;
      text: string;
      position: { right: string; bottom: string };
      opacity: number;
      color: string;
      fontSize: string;
      fontWeight: string;
      letterSpacing: string;
    };
  };
}

const defaultHeroData: HeroSettingsData = {
  hero: {
    section: { backgroundColor: "", minHeight: "", padding: "" },
    background: {
      radialGlow: { enabled: false, color: "", opacity: 0, blur: "", size: "", position: { top: "" } },
      grid: { enabled: false, opacity: 0, lineColor: "", cellSize: "" },
      textureOverlay: { enabled: false, image: "", opacity: 0, blendMode: "" },
      fadeBottom: { enabled: false, height: "", gradient: "" }
    },
    content: {
      logo: { src: "", alt: "", width: 0, height: 0, priority: false, dropShadow: "" },
      tagline: { text: "", position: "", color: "", fontSize: { mobile: "", desktop: "" }, fontStyle: "", fontFamily: "" }
    },
    watermark: { enabled: false, text: "", position: { right: "", bottom: "" }, opacity: 0, color: "", fontSize: "", fontWeight: "", letterSpacing: "" }
  }
};

const mergeWithDefaults = (apiData: any, defaultData: HeroSettingsData): HeroSettingsData => {
  if (!apiData || !apiData.hero) return defaultData;
  const apiHero = apiData.hero;
  
  return {
    hero: {
      section: { ...defaultData.hero.section, ...apiHero.section },
      background: {
        radialGlow: { ...defaultData.hero.background.radialGlow, ...apiHero.background?.radialGlow, position: { ...defaultData.hero.background.radialGlow.position, ...apiHero.background?.radialGlow?.position } },
        grid: { ...defaultData.hero.background.grid, ...apiHero.background?.grid },
        textureOverlay: { ...defaultData.hero.background.textureOverlay, ...apiHero.background?.textureOverlay },
        fadeBottom: { ...defaultData.hero.background.fadeBottom, ...apiHero.background?.fadeBottom }
      },
      content: {
        logo: { ...defaultData.hero.content.logo, ...apiHero.content?.logo },
        tagline: { ...defaultData.hero.content.tagline, ...apiHero.content?.tagline, fontSize: { ...defaultData.hero.content.tagline.fontSize, ...apiHero.content?.tagline?.fontSize } }
      },
      watermark: {
        ...defaultData.hero.watermark,
        ...apiHero.watermark,
        position: { ...defaultData.hero.watermark.position, ...apiHero.watermark?.position }
      }
    }
  };
};

// ========== COMPONENTE DE CABEÇALHO ==========
interface SectionHeaderProps {
  title: string;
  section: string;
  icon: React.ElementType;
  isExpanded: boolean;
  onToggle: (section: string) => void;
}

const SectionHeader = ({ title, section, icon: Icon, isExpanded, onToggle }: SectionHeaderProps) => (
  <button
    type="button"
    onClick={() => onToggle(section)}
    className="w-full flex items-center justify-between p-4 bg-[var(--color-background)] rounded-lg hover:bg-[var(--color-background-body)] transition-colors border border-[var(--color-border)] shadow-sm"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 rounded bg-[var(--color-primary)]/10">
        <Icon className="w-5 h-5 text-[var(--color-primary)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-secondary)]">
        {title}
      </h3>
    </div>
    {isExpanded ? (
      <ChevronUp className="w-5 h-5 text-[var(--color-secondary)]" />
    ) : (
      <ChevronDown className="w-5 h-5 text-[var(--color-secondary)]" />
    )}
  </button>
);

export default function HeroSettingsClientLayout({ initialData }: { initialData: any }) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    section: true,
    background: false,
    content: false,
    watermark: false
  });

  const {
    data: heroData,
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
  } = useJsonManagement<HeroSettingsData>({
    apiPath: "/api/tegbe-institucional/json/hero-settings",
    defaultData: initialData ? mergeWithDefaults(initialData, defaultHeroData) : defaultHeroData,
    mergeFunction: mergeWithDefaults,
  });

  const hero = heroData.hero;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (path: string, value: any) => {
    updateNested(`hero.${path}`, value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await save();
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    total += 3;
    if (hero.section.backgroundColor) completed++;
    if (hero.section.minHeight) completed++;
    if (hero.section.padding) completed++;

    total += 5;
    if (hero.content.logo.src) completed++;
    if (hero.content.logo.alt) completed++;
    if (hero.content.tagline.text) completed++;
    if (hero.content.tagline.color) completed++;
    if (hero.content.tagline.fontFamily) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists && !initialData) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Layout}
      title="Configurações do Hero Principal"
      description="Gerencie cores, background, logo e marca d'água da seção de entrada do site."
      exists={!!exists || !!initialData}
      itemName="Configurações do Hero"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        
        {/* 1. ESTRUTURA GERAL (SECTION) */}
        <div className="space-y-4">
          <SectionHeader
            title="Estrutura e Fundo da Seção"
            section="section"
            icon={Layers}
            isExpanded={expandedSections.section}
            onToggle={toggleSection}
          />
          <motion.div initial={false} animate={{ height: expandedSections.section ? "auto" : 0 }} className="overflow-hidden">
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">Estrutura Principal</h4>
                <p className="text-sm text-[var(--color-secondary)]/70">Ajuste o comportamento do bloco inteiro.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Cor de Fundo</label>
                  <ColorPicker 
                    color={hero.section.backgroundColor} 
                    onChange={(color) => handleChange("section.backgroundColor", color)} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Altura Mínima</label>
                  <Input 
                    value={hero.section.minHeight} 
                    onChange={(e) => handleChange("section.minHeight", e.target.value)} 
                    placeholder="Ex: 592px ou 100vh" 
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Espaçamento Interno (Padding)</label>
                  <Input 
                    value={hero.section.padding} 
                    onChange={(e) => handleChange("section.padding", e.target.value)} 
                    placeholder="Ex: px-6 py-12" 
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* 2. EFEITOS DE FUNDO (BACKGROUND) */}
        <div className="space-y-4">
          <SectionHeader
            title="Efeitos de Fundo"
            section="background"
            icon={Palette}
            isExpanded={expandedSections.background}
            onToggle={toggleSection}
          />
          <motion.div initial={false} animate={{ height: expandedSections.background ? "auto" : 0 }} className="overflow-hidden">
            <div className="space-y-6">
              
              {/* Radial Glow */}
              <Card className="p-6 bg-[var(--color-background)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Sun className="w-5 h-5 text-yellow-500" /> Brilho Radial (Glow)
                    </h4>
                    <p className="text-sm text-[var(--color-secondary)]/70 mt-1">Cria um efeito de iluminação suave no fundo.</p>
                  </div>
                  <Switch checked={hero.background.radialGlow.enabled} onCheckedChange={(val) => handleChange("background.radialGlow.enabled", val)} />
                </div>
                
                {hero.background.radialGlow.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-[var(--color-border)] items-end">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Cor</label>
                      <ColorPicker 
                        color={hero.background.radialGlow.color} 
                        onChange={(color) => handleChange("background.radialGlow.color", color)} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Opacidade (0 a 1)</label>
                      <Input type="number" step="0.05" min="0" max="1" value={hero.background.radialGlow.opacity} onChange={(e) => handleChange("background.radialGlow.opacity", parseFloat(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Desfoque (Blur)</label>
                      <Input value={hero.background.radialGlow.blur} onChange={(e) => handleChange("background.radialGlow.blur", e.target.value)} placeholder="200px" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Tamanho</label>
                      <Input value={hero.background.radialGlow.size} onChange={(e) => handleChange("background.radialGlow.size", e.target.value)} placeholder="900px" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Posição Top</label>
                      <Input value={hero.background.radialGlow.position.top} onChange={(e) => handleChange("background.radialGlow.position.top", e.target.value)} placeholder="-250px" />
                    </div>
                  </div>
                )}
              </Card>

              {/* Grid */}
              <Card className="p-6 bg-[var(--color-background)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Grid className="w-5 h-5 text-blue-500" /> Grade (Grid Lines)
                    </h4>
                    <p className="text-sm text-[var(--color-secondary)]/70 mt-1">Adiciona linhas de grade tecnológicas no fundo.</p>
                  </div>
                  <Switch checked={hero.background.grid.enabled} onCheckedChange={(val) => handleChange("background.grid.enabled", val)} />
                </div>
                {hero.background.grid.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[var(--color-border)]">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Cor da Linha (RGBA/Hex)</label>
                      <Input value={hero.background.grid.lineColor} onChange={(e) => handleChange("background.grid.lineColor", e.target.value)} placeholder="rgba(255,255,255,0.05)" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Opacidade (0 a 1)</label>
                      <Input type="number" step="0.05" min="0" max="1" value={hero.background.grid.opacity} onChange={(e) => handleChange("background.grid.opacity", parseFloat(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Tamanho da Célula</label>
                      <Input value={hero.background.grid.cellSize} onChange={(e) => handleChange("background.grid.cellSize", e.target.value)} placeholder="90px" />
                    </div>
                  </div>
                )}
              </Card>

              {/* Texture Overlay */}
              <Card className="p-6 bg-[var(--color-background)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-purple-500" /> Textura (Overlay)
                    </h4>
                    <p className="text-sm text-[var(--color-secondary)]/70 mt-1">Insere uma imagem repetida de ruído ou textura.</p>
                  </div>
                  <Switch checked={hero.background.textureOverlay.enabled} onCheckedChange={(val) => handleChange("background.textureOverlay.enabled", val)} />
                </div>
                {hero.background.textureOverlay.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border)]">
                    <div className="md:col-span-2">
                      <ImageUpload 
                        label="Imagem da Textura (SVG ou PNG)" 
                        currentImage={hero.background.textureOverlay.image} 
                        onChange={(url) => handleChange("background.textureOverlay.image", url)} 
                        description="Ex: /textura.svg" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Opacidade (0 a 1)</label>
                      <Input type="number" step="0.05" min="0" max="1" value={hero.background.textureOverlay.opacity} onChange={(e) => handleChange("background.textureOverlay.opacity", parseFloat(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Blend Mode</label>
                      <Input value={hero.background.textureOverlay.blendMode} onChange={(e) => handleChange("background.textureOverlay.blendMode", e.target.value)} placeholder="Ex: overlay, multiply" />
                    </div>
                  </div>
                )}
              </Card>

              {/* Fade Bottom */}
              <Card className="p-6 bg-[var(--color-background)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Droplet className="w-5 h-5 text-gray-500" /> Esmaecer Base (Fade Bottom)
                    </h4>
                    <p className="text-sm text-[var(--color-secondary)]/70 mt-1">Transição suave entre o Hero e a próxima seção.</p>
                  </div>
                  <Switch checked={hero.background.fadeBottom.enabled} onCheckedChange={(val) => handleChange("background.fadeBottom.enabled", val)} />
                </div>
                {hero.background.fadeBottom.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border)]">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Altura do Esmaecimento</label>
                      <Input value={hero.background.fadeBottom.height} onChange={(e) => handleChange("background.fadeBottom.height", e.target.value)} placeholder="Ex: 120px" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Classes do Gradiente</label>
                      <Input value={hero.background.fadeBottom.gradient} onChange={(e) => handleChange("background.fadeBottom.gradient", e.target.value)} placeholder="Ex: from-[#0A0A0A] to-transparent" />
                    </div>
                  </div>
                )}
              </Card>

            </div>
          </motion.div>
        </div>

        {/* 3. CONTEÚDO (CONTENT) */}
        <div className="space-y-4">
          <SectionHeader
            title="Logotipo e Tagline"
            section="content"
            icon={Type}
            isExpanded={expandedSections.content}
            onToggle={toggleSection}
          />
          <motion.div initial={false} animate={{ height: expandedSections.content ? "auto" : 0 }} className="overflow-hidden">
            <div className="space-y-6">
              
              {/* Logo */}
              <Card className="p-6 bg-[var(--color-background)]">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">Logotipo Central</h4>
                  <p className="text-sm text-[var(--color-secondary)]/70">O logo principal em destaque no Hero.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <ImageUpload 
                      label="Arquivo do Logo" 
                      currentImage={hero.content.logo.src} 
                      onChange={(url) => handleChange("content.logo.src", url)} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Texto Alternativo (Alt)</label>
                    <Input value={hero.content.logo.alt} onChange={(e) => handleChange("content.logo.alt", e.target.value)} placeholder="Ex: Logo da Marca" className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Sombra (Drop Shadow CSS)</label>
                    <Input value={hero.content.logo.dropShadow} onChange={(e) => handleChange("content.logo.dropShadow", e.target.value)} placeholder="Ex: 0 10px 30px rgba(0,0,0,0.6)" className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Largura Máx. (px)</label>
                      <Input type="number" value={hero.content.logo.width} onChange={(e) => handleChange("content.logo.width", parseInt(e.target.value))} className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Altura Máx. (px)</label>
                      <Input type="number" value={hero.content.logo.height} onChange={(e) => handleChange("content.logo.height", parseInt(e.target.value))} className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[var(--color-background-body)] border border-[var(--color-border)] rounded-lg">
                    <div>
                      <span className="font-medium text-sm text-[var(--color-secondary)]">Prioridade LCP</span>
                      <p className="text-xs text-[var(--color-secondary)]/70">Carregar logo imediatamente (SEO).</p>
                    </div>
                    <Switch checked={hero.content.logo.priority} onCheckedChange={(val) => handleChange("content.logo.priority", val)} />
                  </div>
                </div>
              </Card>

              {/* Tagline */}
              <Card className="p-6 bg-[var(--color-background)]">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">Tagline (Frase de Efeito)</h4>
                  <p className="text-sm text-[var(--color-secondary)]/70">Texto charmoso que geralmente acompanha o logo.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Texto da Tagline</label>
                    <Input value={hero.content.tagline.text} onChange={(e) => handleChange("content.tagline.text", e.target.value)} placeholder="Ex: para quem quer mais." className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-secondary)] mb-2">Cor do Texto</label>
                    <ColorPicker 
                      color={hero.content.tagline.color} 
                      onChange={(color) => handleChange("content.tagline.color", color)} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Posicionamento (Classes Tailwind)</label>
                    <Input value={hero.content.tagline.position} onChange={(e) => handleChange("content.tagline.position", e.target.value)} placeholder="Ex: bottom-10 right-0" className="bg-[var(--color-background-body)] border-[var(--color-border)] mt-[4px]" />
                  </div>
                  
                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1 flex items-center gap-2"><Smartphone className="w-4 h-4"/> Fonte Mobile</label>
                      <Input value={hero.content.tagline.fontSize.mobile} onChange={(e) => handleChange("content.tagline.fontSize.mobile", e.target.value)} placeholder="Ex: text-3xl" className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1 flex items-center gap-2"><MonitorDown className="w-4 h-4"/> Fonte Desktop</label>
                      <Input value={hero.content.tagline.fontSize.desktop} onChange={(e) => handleChange("content.tagline.fontSize.desktop", e.target.value)} placeholder="Ex: md:text-4xl" className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Estilo (Font Style)</label>
                    <Input value={hero.content.tagline.fontStyle} onChange={(e) => handleChange("content.tagline.fontStyle", e.target.value)} placeholder="Ex: italic, normal" className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Família da Fonte</label>
                    <Input value={hero.content.tagline.fontFamily} onChange={(e) => handleChange("content.tagline.fontFamily", e.target.value)} placeholder="Ex: serif, sans" className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                  </div>
                </div>
              </Card>

            </div>
          </motion.div>
        </div>

        {/* 4. MARCA D'ÁGUA (WATERMARK) */}
        <div className="space-y-4">
          <SectionHeader
            title="Marca D'água"
            section="watermark"
            icon={Layers}
            isExpanded={expandedSections.watermark}
            onToggle={toggleSection}
          />
          <motion.div initial={false} animate={{ height: expandedSections.watermark ? "auto" : 0 }} className="overflow-hidden">
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-border)]">
                <div>
                  <h4 className="text-lg font-semibold text-[var(--color-secondary)]">Texto de Fundo Gigante</h4>
                  <p className="text-sm text-[var(--color-secondary)]/70 mt-1">Um texto gigante quase transparente atrás do conteúdo.</p>
                </div>
                <Switch checked={hero.watermark.enabled} onCheckedChange={(val) => handleChange("watermark.enabled", val)} />
              </div>

              {hero.watermark.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Texto da Marca D&apos;água</label>
                    <Input value={hero.watermark.text} onChange={(e) => handleChange("watermark.text", e.target.value)} placeholder="Ex: QUER MAIS" className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-secondary)] mb-2">Cor do Texto</label>
                    <ColorPicker 
                      color={hero.watermark.color} 
                      onChange={(color) => handleChange("watermark.color", color)} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Opacidade (0 a 1)</label>
                    <Input type="number" step="0.01" min="0" max="1" value={hero.watermark.opacity} onChange={(e) => handleChange("watermark.opacity", parseFloat(e.target.value))} className="bg-[var(--color-background-body)] border-[var(--color-border)] mt-[4px]" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Tamanho da Fonte</label>
                    <Input value={hero.watermark.fontSize} onChange={(e) => handleChange("watermark.fontSize", e.target.value)} placeholder="Ex: 260px" className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Peso da Fonte (Font Weight)</label>
                    <Input value={hero.watermark.fontWeight} onChange={(e) => handleChange("watermark.fontWeight", e.target.value)} placeholder="Ex: medium, bold, 900" className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Espaçamento de Letras (Letter Spacing)</label>
                    <Input value={hero.watermark.letterSpacing} onChange={(e) => handleChange("watermark.letterSpacing", e.target.value)} placeholder="Ex: -0.04em" className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:col-span-2">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Posição Direita (Right)</label>
                      <Input value={hero.watermark.position.right} onChange={(e) => handleChange("watermark.position.right", e.target.value)} placeholder="Ex: -30px" className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Posição Inferior (Bottom)</label>
                      <Input value={hero.watermark.position.bottom} onChange={(e) => handleChange("watermark.position.bottom", e.target.value)} placeholder="Ex: -130px" className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          isAddDisabled={true}
          isSaving={loading}
          exists={!!exists || !!initialData}
          completeCount={completion.completed}
          totalCount={completion.total}
          itemName="Configurações do Hero"
          icon={Layout}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Hero Settings"
      />
      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}