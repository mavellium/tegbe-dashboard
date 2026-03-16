/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { 
  MapPin, 
  Palette,
  ChevronDown,
  ChevronUp,
  Type,
  Check,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ImageIcon,
  Target,
  Link as LinkIcon
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ImageUpload } from "@/components/ImageUpload";
import Loading from "@/components/Loading";
import { Button } from "@/components/Button";

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
  "#F0FDF4", "#FEF3C7", "#C5A47E", "#F1D95D", "#0A0A0A", "#FFC72C"
];

function ColorPicker({ color, onChange }: ColorPickerProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [showPicker, setShowPicker] = useState(false);

  // Limpa classes tailwind (ex: bg-[#000] vira #000) se vierem no JSON
  const extractHex = (val: string) => {
    if (!val) return "#000000";
    if (val.includes("bg-black") || val.includes("text-black")) return "#000000";
    if (val.includes("bg-white") || val.includes("text-white")) return "#FFFFFF";
    const match = val.match(/\[(#[0-9A-Fa-f]{3,6})\]/);
    return match ? match[1] : val;
  };

  const normalizedColor = useMemo(() => {
    const hex = extractHex(color);
    return hex.startsWith("#") ? hex : `#${hex}`;
  }, [color]);

  const [selectedColor, setSelectedColor] = useState(normalizedColor);
  const [inputColor, setInputColor] = useState(normalizedColor);

  useEffect(() => {
    const hex = extractHex(color);
    const normalized = hex.startsWith("#") ? hex : `#${hex}`;
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

    if (left + pickerWidth > viewportWidth - 16) left = viewportWidth - pickerWidth - 16;
    if (left < 16) left = 16;
    if (top + 320 > viewportHeight) top = rect.top - 320;

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
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(value)) setInputColor(selectedColor);
    else applyColor(value);
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
          <span className="text-sm font-mono text-[var(--color-secondary)] uppercase">{normalizedColor}</span>
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
interface GalleryImage {
  id: string;
  image: string;
  alt: string;
  title: string;
  description: string;
}

interface LocalizacaoData {
  localizacao: {
    data: GalleryImage[];
    section: { backgroundColor: string };
    content: {
      textSection: {
        button: {
          label: string;
          link: string;
          backgroundColor: string;
          hoverBackgroundColor: string;
          textColor: string;
        }
      }
    };
    _raw: any; // Para preservar dados complexos (animações, containers)
  };
}

const defaultData: LocalizacaoData = {
  localizacao: {
    data: [
      { id: "1", image: "", alt: "", title: "", description: "" }
    ],
    section: { backgroundColor: "#000000" },
    content: {
      textSection: {
        button: { label: "", link: "", backgroundColor: "#FFC72C", hoverBackgroundColor: "#F2CB5E", textColor: "#0A0A0A" }
      }
    },
    _raw: {}
  }
};

const mergeWithDefaults = (apiData: any, defaultValues: LocalizacaoData): LocalizacaoData => {
  if (!apiData || !apiData.localizacao) return defaultValues;
  const loc = apiData.localizacao;
  
  return {
    localizacao: {
      data: loc.data?.length ? loc.data : defaultValues.localizacao.data,
      section: { backgroundColor: loc.section?.backgroundColor || defaultValues.localizacao.section.backgroundColor },
      content: {
        textSection: {
          button: {
            label: loc.content?.textSection?.button?.label || defaultValues.localizacao.content.textSection.button.label,
            link: loc.content?.textSection?.button?.link || defaultValues.localizacao.content.textSection.button.link,
            backgroundColor: loc.content?.textSection?.button?.backgroundColor || defaultValues.localizacao.content.textSection.button.backgroundColor,
            hoverBackgroundColor: loc.content?.textSection?.button?.hoverBackgroundColor || defaultValues.localizacao.content.textSection.button.hoverBackgroundColor,
            textColor: loc.content?.textSection?.button?.textColor || defaultValues.localizacao.content.textSection.button.textColor,
          }
        }
      },
      _raw: loc
    }
  };
};

// ========== COMPONENTE DE CABEÇALHO DA SEÇÃO ==========
const SectionHeader = ({ title, section, icon: Icon, isExpanded, onToggle, badgeCount }: any) => (
  <button
    type="button"
    onClick={() => onToggle(section)}
    className="w-full flex items-center justify-between p-4 bg-[var(--color-background)] rounded-lg hover:bg-[var(--color-background-body)] transition-colors border border-[var(--color-border)] shadow-sm"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 rounded bg-[var(--color-primary)]/10">
        <Icon className="w-5 h-5 text-[var(--color-primary)]" />
      </div>
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-[var(--color-secondary)]">{title}</h3>
        {badgeCount !== undefined && (
          <span className="px-2 py-0.5 text-xs font-medium bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-full">
            {badgeCount}
          </span>
        )}
      </div>
    </div>
    {isExpanded ? <ChevronUp className="w-5 h-5 text-[var(--color-secondary)]" /> : <ChevronDown className="w-5 h-5 text-[var(--color-secondary)]" />}
  </button>
);

// ========== COMPONENTE PRINCIPAL ==========
export default function LocalizacaoClientLayout({ initialData }: { initialData: any }) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    texts: true,
    button: false,
    gallery: false,
    appearance: false
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
  } = useJsonManagement<LocalizacaoData>({
    apiPath: "/api/tegbe-institucional/json/localizacao", // Substitua pelo endpoint correto do seu sistema
    defaultData: initialData ? mergeWithDefaults(initialData, defaultData) : defaultData,
    mergeFunction: mergeWithDefaults,
  });

  const loc = pageData.localizacao;

  const toggleSection = (section: string) => setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  const handleChange = (path: string, value: any) => updateNested(`localizacao.${path}`, value);

  // --- Funções da Galeria ---
  const addImage = () => {
    // Se for o primeiro item, cria vazio. Se já tiver, copia os textos do primeiro (pois eles governam a seção).
    const title = loc.data.length > 0 ? loc.data[0].title : "";
    const description = loc.data.length > 0 ? loc.data[0].description : "";
    
    handleChange("data", [...loc.data, { id: Date.now().toString(), image: "", alt: "", title, description }]);
  };

  const removeImage = (index: number) => {
    const newData = [...loc.data];
    newData.splice(index, 1);
    handleChange("data", newData);
  };

  const updateImage = (index: number, field: keyof GalleryImage, value: string) => {
    const newData = [...loc.data];
    newData[index][field] = value;

    // Sincronizar título e descrição para TODOS os itens (já que o JSON aponta para data[0])
    if (field === 'title' || field === 'description') {
      newData.forEach(item => {
        item[field] = value;
      });
    }

    handleChange("data", newData);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newData = [...loc.data];
    if (direction === 'up' && index > 0) {
      const temp = newData[index];
      newData[index] = newData[index - 1];
      newData[index - 1] = temp;
    } else if (direction === 'down' && index < newData.length - 1) {
      const temp = newData[index];
      newData[index] = newData[index + 1];
      newData[index + 1] = temp;
    }
    handleChange("data", newData);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Remonta o JSON preservando as configurações técnicas
    const payloadToSave = {
      localizacao: {
        ...loc._raw,
        data: loc.data,
        section: {
          ...(loc._raw?.section || {}),
          // Converte o Hex de volta para classe Tailwind (ou salva direto, o front deve suportar)
          backgroundColor: loc.section.backgroundColor.startsWith('#') 
            ? `bg-[${loc.section.backgroundColor}]` 
            : loc.section.backgroundColor
        },
        content: {
          ...(loc._raw?.content || {}),
          textSection: {
            ...(loc._raw?.content?.textSection || {}),
            button: {
              ...(loc._raw?.content?.textSection?.button || {}),
              label: loc.content.textSection.button.label,
              link: loc.content.textSection.button.link,
              backgroundColor: loc.content.textSection.button.backgroundColor,
              hoverBackgroundColor: loc.content.textSection.button.hoverBackgroundColor,
              textColor: loc.content.textSection.button.textColor
            }
          }
        }
      }
    };
    
    try {
      const res = await fetch("/api/tegbe-institucional/json/localizacao", {
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
    const total = 4; // Título, Descrição, Botão Label, Pelo menos 1 foto

    if (loc.data[0]?.title) completed++;
    if (loc.data[0]?.description) completed++;
    if (loc.content.textSection.button.label) completed++;
    if (loc.data.length > 0 && loc.data[0]?.image) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists && !initialData) {
    return <Loading layout={MapPin} exists={!!exists} />;
  }

  // Prevenção de erro caso o array esteja vazio
  const mainTitle = loc.data.length > 0 ? loc.data[0].title : "";
  const mainDesc = loc.data.length > 0 ? loc.data[0].description : "";

  return (
    <ManageLayout
      headerIcon={MapPin}
      title="Seção de Localização"
      description="Gerencie os textos, o carrossel de fotos da sede e o botão de endereço."
      exists={!!exists || !!initialData}
      itemName="Configuração de Localização"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">

        {/* 1. TEXTOS PRINCIPAIS */}
        <div className="space-y-4">
          <SectionHeader title="Textos Principais" section="texts" icon={Type} isExpanded={expandedSections.texts} onToggle={toggleSection} />
          <AnimatePresence>
            {expandedSections.texts && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">Título da Seção</label>
                      <Input 
                        value={mainTitle} 
                        onChange={(e) => {
                          if(loc.data.length === 0) addImage();
                          updateImage(0, "title", e.target.value);
                        }} 
                        placeholder="Ex: Onde a magia acontece" 
                        className="bg-[var(--color-background-body)]" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">Descrição</label>
                      <textarea 
                        value={mainDesc} 
                        onChange={(e) => {
                          if(loc.data.length === 0) addImage();
                          updateImage(0, "description", e.target.value);
                        }} 
                        placeholder="Ex: Venha nos visitar para um café..." 
                        className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-background-body)] text-sm text-[var(--color-secondary)] outline-none focus:border-[var(--color-primary)] resize-y min-h-[100px]"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. BOTÃO DE AÇÃO */}
        <div className="space-y-4">
          <SectionHeader title="Botão de Ação (Google Maps)" section="button" icon={Target} isExpanded={expandedSections.button} onToggle={toggleSection} />
          <AnimatePresence>
            {expandedSections.button && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">Rótulo do Botão</label>
                      <Input value={loc.content.textSection.button.label} onChange={(e) => handleChange("content.textSection.button.label", e.target.value)} placeholder="Ex: Ver sede no Google Maps" className="bg-[var(--color-background-body)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1 flex items-center gap-1"><LinkIcon className="w-4 h-4"/> Link (URL do Maps)</label>
                      <Input value={loc.content.textSection.button.link} onChange={(e) => handleChange("content.textSection.button.link", e.target.value)} placeholder="Ex: https://maps.google.com/..." className="bg-[var(--color-background-body)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Cor de Fundo</label>
                      <ColorPicker color={loc.content.textSection.button.backgroundColor} onChange={(val) => handleChange("content.textSection.button.backgroundColor", val)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Cor de Fundo (Hover)</label>
                      <ColorPicker color={loc.content.textSection.button.hoverBackgroundColor} onChange={(val) => handleChange("content.textSection.button.hoverBackgroundColor", val)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Cor do Texto</label>
                      <ColorPicker color={loc.content.textSection.button.textColor} onChange={(val) => handleChange("content.textSection.button.textColor", val)} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. GALERIA DE FOTOS */}
        <div className="space-y-4">
          <SectionHeader title="Galeria de Fotos (Carrossel)" section="gallery" icon={ImageIcon} isExpanded={expandedSections.gallery} onToggle={toggleSection} badgeCount={loc.data.length} />
          <AnimatePresence>
            {expandedSections.gallery && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-[var(--color-secondary)]/70">Adicione as fotos da sede que irão passar no carrossel dinâmico.</p>
                    <Button type="button" onClick={addImage} className="bg-[var(--color-primary)] text-white border-none flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Adicionar Foto
                    </Button>
                  </div>

                  {loc.data.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                      <ImageIcon className="w-10 h-10 text-[var(--color-secondary)]/30 mx-auto mb-3" />
                      <p className="text-sm text-[var(--color-secondary)]/50">Nenhuma imagem adicionada.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {loc.data.map((item, idx) => (
                        <div key={item.id} className="flex flex-col md:flex-row items-start gap-6 p-5 border border-[var(--color-border)] rounded-xl bg-[var(--color-background-body)] relative group">
                          
                          {/* Controles de Ordem */}
                          <div className="flex flex-row md:flex-col items-center gap-1 absolute top-4 right-4 md:static md:mt-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => moveImage(idx, 'up')} disabled={idx === 0} className="p-1 text-[var(--color-secondary)]/60 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded disabled:opacity-20"><ArrowUp className="w-4 h-4" /></button>
                            <span className="text-[10px] font-bold text-[var(--color-secondary)]/40">{idx + 1}</span>
                            <button type="button" onClick={() => moveImage(idx, 'down')} disabled={idx === loc.data.length - 1} className="p-1 text-[var(--color-secondary)]/60 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded disabled:opacity-20"><ArrowDown className="w-4 h-4" /></button>
                          </div>

                          <div className="w-full md:w-[250px] shrink-0">
                            <ImageUpload 
                              label="Imagem" 
                              currentImage={item.image} 
                              onChange={(url) => updateImage(idx, "image", url)} 
                              aspectRatio="aspect-video"
                              previewWidth={250}
                              previewHeight={140}
                            />
                          </div>
                          
                          <div className="flex-1 grid grid-cols-1 gap-4 w-full">
                            <div>
                              <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Texto Alternativo (Alt)</label>
                              <Input value={item.alt} onChange={(e) => updateImage(idx, "alt", e.target.value)} placeholder="Ex: Fachada da Sede" className="bg-[var(--color-background)]" />
                            </div>
                          </div>
                          
                          <div className="md:mt-4 md:ml-2 absolute top-4 right-14 md:static">
                            <button type="button" onClick={() => removeImage(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Remover Imagem">
                              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. APARÊNCIA */}
        <div className="space-y-4">
          <SectionHeader title="Aparência da Seção" section="appearance" icon={Palette} isExpanded={expandedSections.appearance} onToggle={toggleSection} />
          <AnimatePresence>
            {expandedSections.appearance && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Cor de Fundo da Seção</label>
                      <ColorPicker color={loc.section.backgroundColor} onChange={(val) => handleChange("section.backgroundColor", val)} />
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
          itemName="Localização"
          icon={MapPin}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração de Localização"
      />
      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}