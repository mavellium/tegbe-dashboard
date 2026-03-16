/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Switch } from "@/components/Switch";
import { 
  Target, 
  Palette,
  ChevronDown,
  ChevronUp,
  Type,
  Check,
  TrendingUp,
  Image as ImageIcon,
  MessageSquare
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
  "#F0FDF4", "#FEF3C7", "#C9A646", "#F1D95D", "#DDC62F", "#0A0A0A", "#FFC72C", "#FAFAF8"
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
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
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
      if (next) requestAnimationFrame(applyPickerPosition);
      return next;
    });
  };

  const applyColor = (newColor: string) => {
    const normalized = newColor.startsWith("#") ? newColor : `#${newColor}`;
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
    const value = inputColor.startsWith("#") ? inputColor : `#${inputColor}`;
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
        <div className="w-6 h-6 rounded border border-[var(--color-border)] shadow-inner" style={{ backgroundColor: normalizedColor }} />
      </button>

      {showPicker && (
        <>
          <div className="fixed inset-0 bg-black/10 z-40" />
          <div ref={pickerRef} className="fixed z-50 p-4 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg shadow-xl w-68 space-y-4">
            <input type="color" value={selectedColor} onChange={(e) => applyColor(e.target.value)} className="w-full h-10 rounded cursor-pointer" />
            <input type="text" value={inputColor} onChange={handleInputChange} onBlur={handleInputBlur} className="w-full px-3 py-2 border border-[var(--color-border)] rounded font-mono bg-[var(--color-background-body)] text-[var(--color-secondary)] uppercase outline-none focus:border-[var(--color-primary)]" />
            <div className="grid grid-cols-8 gap-1.5">
              {presetColors.map((c) => (
                <button key={c} type="button" onClick={() => { applyColor(c); setShowPicker(false); }} className="w-6 h-6 rounded border border-[var(--color-border)] relative shadow-sm hover:scale-110 transition-transform" style={{ backgroundColor: c }}>
                  {selectedColor.toUpperCase() === c.toUpperCase() && <Check className="absolute inset-0 m-auto w-3 h-3 text-white drop-shadow-md" />}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setShowPicker(false)} className="w-full py-2 text-sm bg-[var(--color-background-body)] hover:bg-[var(--color-border)] rounded text-[var(--color-secondary)] font-medium transition-colors">Fechar</button>
          </div>
        </>
      )}
    </div>
  );
}

// ========== INTERFACES DOS DADOS ==========
interface MetaAlunosData {
  metaAlunos: {
    section: {
      backgroundColor: string;
      textureOverlay: { enabled: boolean; image: string; opacity: number; blendMode: string };
    };
    content: {
      header: {
        title: { text: string; color: string; highlightedWord: { text: string; color: string; fontStyle: string; fontFamily: string } };
        subtitle: { text: string; color: string; highlightedPart: { text: string } };
      };
      progressCard: {
        progressBar: { thumb: { logo: { src: string; alt: string } } };
      };
      footer: { text: string; color: string; highlightedPart: { text: string } };
    };
    data: {
      targetValue: number;
      maxValue: number;
      countUp: { to: number; duration: number };
    };
    // Mantém as propriedades de estilo intocáveis do JSON original (grid, animações, padding etc)
    _raw: any;
  }
}

const defaultData: MetaAlunosData = {
  metaAlunos: {
    section: {
      backgroundColor: "#FAFAF8",
      textureOverlay: { enabled: true, image: "", opacity: 0.03, blendMode: "normal" }
    },
    content: {
      header: {
        title: { text: "", color: "#0A0A0A", highlightedWord: { text: "", color: "#FFC72C", fontStyle: "italic", fontFamily: "serif" } },
        subtitle: { text: "", color: "#0A0A0A", highlightedPart: { text: "" } }
      },
      progressCard: {
        progressBar: { thumb: { logo: { src: "", alt: "Tegbe" } } }
      },
      footer: { text: "", color: "#0A0A0A", highlightedPart: { text: "" } }
    },
    data: { targetValue: 1500, maxValue: 5000, countUp: { to: 1500, duration: 2.2 } },
    _raw: {}
  }
};

const mergeWithDefaults = (apiData: any, defaultValues: MetaAlunosData): MetaAlunosData => {
  if (!apiData || !apiData.metaAlunos) return defaultValues;
  
  const meta = apiData.metaAlunos;
  const section = meta.section || {};
  const content = meta.content || {};
  const header = content.header || {};
  const dataBlock = meta.data || {};
  
  return {
    metaAlunos: {
      section: {
        backgroundColor: section.backgroundColor || defaultValues.metaAlunos.section.backgroundColor,
        textureOverlay: { ...defaultValues.metaAlunos.section.textureOverlay, ...section.textureOverlay }
      },
      content: {
        header: {
          title: {
            text: header.title?.text || defaultValues.metaAlunos.content.header.title.text,
            color: header.title?.color || defaultValues.metaAlunos.content.header.title.color,
            highlightedWord: { ...defaultValues.metaAlunos.content.header.title.highlightedWord, ...header.title?.highlightedWord }
          },
          subtitle: {
            text: header.subtitle?.text || defaultValues.metaAlunos.content.header.subtitle.text,
            color: header.subtitle?.color || defaultValues.metaAlunos.content.header.subtitle.color,
            highlightedPart: { ...defaultValues.metaAlunos.content.header.subtitle.highlightedPart, ...header.subtitle?.highlightedPart }
          }
        },
        progressCard: {
          progressBar: {
            thumb: {
              logo: { ...defaultValues.metaAlunos.content.progressCard.progressBar.thumb.logo, ...content.progressCard?.progressBar?.thumb?.logo }
            }
          }
        },
        footer: {
          text: content.footer?.text || defaultValues.metaAlunos.content.footer.text,
          color: content.footer?.color || defaultValues.metaAlunos.content.footer.color,
          highlightedPart: { ...defaultValues.metaAlunos.content.footer.highlightedPart, ...content.footer?.highlightedPart }
        }
      },
      data: {
        targetValue: dataBlock.targetValue ?? defaultValues.metaAlunos.data.targetValue,
        maxValue: dataBlock.maxValue ?? defaultValues.metaAlunos.data.maxValue,
        countUp: { ...defaultValues.metaAlunos.data.countUp, ...dataBlock.countUp }
      },
      _raw: meta 
    }
  };
};

// ========== COMPONENTE DE CABEÇALHO DA SEÇÃO ==========
const SectionHeader = ({ title, section, icon: Icon, isExpanded, onToggle }: any) => (
  <button
    type="button"
    onClick={() => onToggle(section)}
    className="w-full flex items-center justify-between p-4 bg-[var(--color-background)] rounded-lg hover:bg-[var(--color-background-body)] transition-colors border border-[var(--color-border)] shadow-sm"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 rounded bg-[var(--color-primary)]/10">
        <Icon className="w-5 h-5 text-[var(--color-primary)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-secondary)]">{title}</h3>
    </div>
    {isExpanded ? <ChevronUp className="w-5 h-5 text-[var(--color-secondary)]" /> : <ChevronDown className="w-5 h-5 text-[var(--color-secondary)]" />}
  </button>
);

// ========== COMPONENTE PRINCIPAL ==========
export default function MetaAlunosClientLayout({ initialData }: { initialData: any }) {
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    section: true,
    header: false,
    progress: false,
    footer: false
  });

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
  } = useJsonManagement<MetaAlunosData>({
    apiPath: "/api/tegbe-institucional/json/meta-alunos",
    defaultData: initialData ? mergeWithDefaults(initialData, defaultData) : defaultData,
    mergeFunction: mergeWithDefaults,
  });

  const meta = pageData.metaAlunos;

  const toggleSection = (section: string) => setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  const handleChange = (path: string, value: any) => updateNested(`metaAlunos.${path}`, value);

  // Helper para atualizar o valor alvo e a animação do contador ao mesmo tempo
  const handleTargetValueChange = (val: string) => {
    const num = parseInt(val) || 0;
    handleChange("data.targetValue", num);
    handleChange("data.countUp.to", num);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Remonta o JSON completo antes de salvar para preservar o `_raw` (estilos e animações)
    const payloadToSave = {
      metaAlunos: {
        ...meta._raw,
        section: {
          ...(meta._raw?.section || {}),
          backgroundColor: meta.section.backgroundColor,
          textureOverlay: meta.section.textureOverlay
        },
        content: {
          ...(meta._raw?.content || {}),
          header: {
            ...(meta._raw?.content?.header || {}),
            title: {
              ...(meta._raw?.content?.header?.title || {}),
              text: meta.content.header.title.text,
              color: meta.content.header.title.color,
              highlightedWord: meta.content.header.title.highlightedWord
            },
            subtitle: {
              ...(meta._raw?.content?.header?.subtitle || {}),
              text: meta.content.header.subtitle.text,
              color: meta.content.header.subtitle.color,
              highlightedPart: meta.content.header.subtitle.highlightedPart
            }
          },
          progressCard: {
            ...(meta._raw?.content?.progressCard || {}),
            progressBar: {
              ...(meta._raw?.content?.progressCard?.progressBar || {}),
              thumb: {
                ...(meta._raw?.content?.progressCard?.progressBar?.thumb || {}),
                logo: meta.content.progressCard.progressBar.thumb.logo
              }
            }
          },
          footer: {
            ...(meta._raw?.content?.footer || {}),
            text: meta.content.footer.text,
            color: meta.content.footer.color,
            highlightedPart: meta.content.footer.highlightedPart
          }
        },
        data: {
          ...(meta._raw?.data || {}),
          targetValue: meta.data.targetValue,
          maxValue: meta.data.maxValue,
          countUp: meta.data.countUp
        }
      }
    };
    
    try {
      const res = await fetch("/api/tegbe-institucional/json/meta-alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSave),
      });
      if (!res.ok) throw new Error("Erro ao salvar.");
      await save(); 
    } catch (err) {
      console.error(err);
    }
  };

  const calculateCompletion = () => {
    let completed = 0;
    const total = 6; 

    if (meta.content.header.title.text) completed++;
    if (meta.content.header.subtitle.text) completed++;
    if (meta.data.targetValue) completed++;
    if (meta.data.maxValue) completed++;
    if (meta.content.progressCard.progressBar.thumb.logo.src) completed++;
    if (meta.content.footer.text) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists && !initialData) {
    return <Loading layout={Target} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Target}
      title="Meta de Alunos"
      description="Gerencie a seção da Meta Global com barra de progresso, contador e textos."
      exists={!!exists || !!initialData}
      itemName="Configurações da Meta"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        
        {/* 1. FUNDO DA SEÇÃO */}
        <div className="space-y-4">
          <SectionHeader title="Fundo da Seção" section="section" icon={Palette} isExpanded={expandedSections.section} onToggle={toggleSection} />
          <AnimatePresence>
            {expandedSections.section && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Cor de Fundo Principal</label>
                      <ColorPicker color={meta.section.backgroundColor} onChange={(val) => handleChange("section.backgroundColor", val)} />
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-[var(--color-secondary)]">Textura Sobreposta</label>
                        <Switch checked={meta.section.textureOverlay.enabled} onCheckedChange={(val) => handleChange("section.textureOverlay.enabled", val)} />
                      </div>
                      {meta.section.textureOverlay.enabled && (
                        <ImageUpload 
                          label="Imagem da Textura (SVG ou PNG)" 
                          currentImage={meta.section.textureOverlay.image} 
                          onChange={(url) => handleChange("section.textureOverlay.image", url)} 
                        />
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. CABEÇALHO E TEXTOS */}
        <div className="space-y-4">
          <SectionHeader title="Textos Principais" section="header" icon={Type} isExpanded={expandedSections.header} onToggle={toggleSection} />
          <AnimatePresence>
            {expandedSections.header && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)] space-y-8">
                  {/* Título */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[var(--color-secondary)] uppercase tracking-wider">Título Principal</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">Texto Completo</label>
                        <Input value={meta.content.header.title.text} onChange={(e) => handleChange("content.header.title.text", e.target.value)} placeholder="Ex: Qual é a principal meta da Tegbe?" className="bg-[var(--color-background-body)]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Cor do Título</label>
                        <ColorPicker color={meta.content.header.title.color} onChange={(val) => handleChange("content.header.title.color", val)} />
                      </div>
                      <div className="md:col-span-2 pt-4 border-t border-[var(--color-border)]">
                        <h4 className="text-sm font-semibold text-[var(--color-secondary)] mb-4">Palavra em Destaque</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Qual palavra destacar?</label>
                            <Input value={meta.content.header.title.highlightedWord.text} onChange={(e) => handleChange("content.header.title.highlightedWord.text", e.target.value)} placeholder="Ex: meta" className="bg-[var(--color-background-body)]" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[var(--color-secondary)] mb-2">Cor do Destaque</label>
                            <ColorPicker color={meta.content.header.title.highlightedWord.color} onChange={(val) => handleChange("content.header.title.highlightedWord.color", val)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subtítulo */}
                  <div className="space-y-4 pt-6 border-t border-[var(--color-border)]">
                    <h4 className="text-sm font-bold text-[var(--color-secondary)] uppercase tracking-wider">Subtítulo</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">Texto Completo</label>
                        <Input value={meta.content.header.subtitle.text} onChange={(e) => handleChange("content.header.subtitle.text", e.target.value)} placeholder="Ex: Gerar R$ 100 milhões em novas receitas..." className="bg-[var(--color-background-body)]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Cor do Subtítulo</label>
                        <ColorPicker color={meta.content.header.subtitle.color} onChange={(val) => handleChange("content.header.subtitle.color", val)} />
                      </div>
                      <div className="md:col-span-2 pt-4 border-t border-[var(--color-border)]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Trecho em Destaque (Negrito)</label>
                            <Input value={meta.content.header.subtitle.highlightedPart.text} onChange={(e) => handleChange("content.header.subtitle.highlightedPart.text", e.target.value)} placeholder="Ex: R$ 100 milhões em novas receitas" className="bg-[var(--color-background-body)]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. BARRA DE PROGRESSO & DADOS */}
        <div className="space-y-4">
          <SectionHeader title="Dados da Meta & Barra de Progresso" section="progress" icon={TrendingUp} isExpanded={expandedSections.progress} onToggle={toggleSection} />
          <AnimatePresence>
            {expandedSections.progress && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-[var(--color-background-body)] border border-[var(--color-border)] rounded-lg">
                      <label className="block text-sm font-bold text-[var(--color-secondary)] mb-1">Valor Atual (Alcançado)</label>
                      <p className="text-xs text-[var(--color-secondary)]/70 mb-3">Valor que o contador irá exibir (ex: 1500).</p>
                      <Input type="number" value={meta.data.targetValue} onChange={(e) => handleTargetValueChange(e.target.value)} className="bg-[var(--color-background)] font-mono text-lg" />
                    </div>

                    <div className="p-4 bg-[var(--color-background-body)] border border-[var(--color-border)] rounded-lg">
                      <label className="block text-sm font-bold text-[var(--color-secondary)] mb-1">Valor Máximo (Meta Final)</label>
                      <p className="text-xs text-[var(--color-secondary)]/70 mb-3">Valor final para calcular a porcentagem da barra (ex: 5000).</p>
                      <Input type="number" value={meta.data.maxValue} onChange={(e) => handleChange("data.maxValue", parseInt(e.target.value) || 0)} className="bg-[var(--color-background)] font-mono text-lg" />
                    </div>

                    <div className="md:col-span-2 pt-6 border-t border-[var(--color-border)]">
                      <h4 className="text-sm font-bold text-[var(--color-secondary)] mb-4">Logo do Indicador (Thumb)</h4>
                      <ImageUpload 
                        label="Ícone da Barra" 
                        description="Pequeno ícone que fica na ponta da barra de progresso."
                        currentImage={meta.content.progressCard.progressBar.thumb.logo.src} 
                        onChange={(url) => handleChange("content.progressCard.progressBar.thumb.logo.src", url)} 
                        aspectRatio="aspect-square"
                        previewWidth={60}
                        previewHeight={60}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. RODAPÉ */}
        <div className="space-y-4">
          <SectionHeader title="Rodapé da Seção" section="footer" icon={MessageSquare} isExpanded={expandedSections.footer} onToggle={toggleSection} />
          <AnimatePresence>
            {expandedSections.footer && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">Texto do Rodapé</label>
                      <Input value={meta.content.footer.text} onChange={(e) => handleChange("content.footer.text", e.target.value)} placeholder="Ex: resultados gerados até agora pela #geraçãotegbe" className="bg-[var(--color-background-body)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Cor do Texto</label>
                      <ColorPicker color={meta.content.footer.color} onChange={(val) => handleChange("content.footer.color", val)} />
                    </div>
                    <div className="md:col-span-2 pt-4 border-t border-[var(--color-border)]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Trecho em Destaque</label>
                          <Input value={meta.content.footer.highlightedPart.text} onChange={(e) => handleChange("content.footer.highlightedPart.text", e.target.value)} placeholder="Ex: #geraçãotegbe" className="bg-[var(--color-background-body)]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          isAddDisabled={true}
          isSaving={loading}
          exists={!!exists || !!initialData}
          completeCount={completion.completed}
          totalCount={completion.total}
          itemName="Meta de Alunos"
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
        itemName="Configuração da Meta"
      />
      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}