/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { 
  Users, 
  Palette,
  ChevronDown,
  ChevronUp,
  Type,
  Check,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layout
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
  "#F0FDF4", "#FEF3C7", "#C5A47E", "#F1D95D", "#0A0A0A"
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
interface Especialista {
  nome: string;
  sobrenome: string;
  cargo: string;
  imagem: string;
}

interface CarrosselEspecialistasData {
  carrosselEspecialistas: {
    section: { backgroundColor: string };
    title: {
      text: string;
      color: string;
      highlightedWord: { text: string; color: string; };
    };
    customStyles: {
      paginationBulletActive: { background: string };
    };
    cards: {
      data: Especialista[];
    };
    _raw: any; // Para preservar dados complexos não editáveis
  };
}

const defaultData: CarrosselEspecialistasData = {
  carrosselEspecialistas: {
    section: { backgroundColor: "#0A0A0A" },
    title: {
      text: "",
      color: "text-white",
      highlightedWord: { text: "", color: "#F1D95D" }
    },
    customStyles: {
      paginationBulletActive: { background: "#C5A47E" }
    },
    cards: {
      data: [
        { nome: "", sobrenome: "", cargo: "", imagem: "" }
      ]
    },
    _raw: {}
  }
};

const mergeWithDefaults = (apiData: any, defaultValues: CarrosselEspecialistasData): CarrosselEspecialistasData => {
  if (!apiData || !apiData.carrosselEspecialistas) return defaultValues;
  const c = apiData.carrosselEspecialistas;
  
  return {
    carrosselEspecialistas: {
      section: { backgroundColor: c.section?.backgroundColor || defaultValues.carrosselEspecialistas.section.backgroundColor },
      title: {
        text: c.title?.text || defaultValues.carrosselEspecialistas.title.text,
        color: c.title?.color || defaultValues.carrosselEspecialistas.title.color,
        highlightedWord: { 
          text: c.title?.highlightedWord?.text || defaultValues.carrosselEspecialistas.title.highlightedWord.text,
          color: c.title?.highlightedWord?.color || defaultValues.carrosselEspecialistas.title.highlightedWord.color
        }
      },
      customStyles: {
        paginationBulletActive: {
          background: c.customStyles?.paginationBulletActive?.background || defaultValues.carrosselEspecialistas.customStyles.paginationBulletActive.background
        }
      },
      cards: {
        data: c.cards?.data || defaultValues.carrosselEspecialistas.cards.data
      },
      _raw: c
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
export default function CarrosselEspecialistasClientLayout({ initialData }: { initialData: any }) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    section: true,
    title: false,
    carousel: false,
    specialists: true
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
  } = useJsonManagement<CarrosselEspecialistasData>({
    apiPath: "/api/tegbe-institucional/json/carrossel-especialistas",
    defaultData: initialData ? mergeWithDefaults(initialData, defaultData) : defaultData,
    mergeFunction: mergeWithDefaults,
  });

  const ce = pageData.carrosselEspecialistas;

  const toggleSection = (section: string) => setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  const handleChange = (path: string, value: any) => updateNested(`carrosselEspecialistas.${path}`, value);

  // --- Funções dos Especialistas ---
  const addSpecialist = () => {
    handleChange("cards.data", [...ce.cards.data, { nome: "", sobrenome: "", cargo: "", imagem: "" }]);
  };

  const removeSpecialist = (index: number) => {
    const newData = [...ce.cards.data];
    newData.splice(index, 1);
    handleChange("cards.data", newData);
  };

  const updateSpecialist = (index: number, field: keyof Especialista, value: string) => {
    const newData = [...ce.cards.data];
    newData[index][field] = value;
    handleChange("cards.data", newData);
  };

  const moveSpecialist = (index: number, direction: 'up' | 'down') => {
    const newData = [...ce.cards.data];
    if (direction === 'up' && index > 0) {
      const temp = newData[index];
      newData[index] = newData[index - 1];
      newData[index - 1] = temp;
    } else if (direction === 'down' && index < newData.length - 1) {
      const temp = newData[index];
      newData[index] = newData[index + 1];
      newData[index + 1] = temp;
    }
    handleChange("cards.data", newData);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Remonta o JSON preservando o _raw (que contém responsividade, breakpoints, etc)
    const payloadToSave = {
      carrosselEspecialistas: {
        ...ce._raw,
        section: {
          ...(ce._raw?.section || {}),
          backgroundColor: ce.section.backgroundColor
        },
        title: {
          ...(ce._raw?.title || {}),
          text: ce.title.text,
          // Convertendo o Hex de volta para classe Tailwind (se aplicável ao seu sistema) ou enviando o Hex direto
          color: ce.title.color, 
          highlightedWord: {
            ...(ce._raw?.title?.highlightedWord || {}),
            text: ce.title.highlightedWord.text,
            color: ce.title.highlightedWord.color
          }
        },
        customStyles: {
          ...(ce._raw?.customStyles || {}),
          paginationBulletActive: {
            ...(ce._raw?.customStyles?.paginationBulletActive || {}),
            background: ce.customStyles.paginationBulletActive.background
          }
        },
        cards: {
          ...(ce._raw?.cards || {}),
          data: ce.cards.data
        }
      }
    };
    
    try {
      const res = await fetch("/api/tegbe-institucional/json/carrossel-especialistas", {
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
    const total = 3; 

    if (ce.title.text) completed++;
    if (ce.title.highlightedWord.text) completed++;
    if (ce.cards.data.length > 0) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists && !initialData) {
    return <Loading layout={Users} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Users}
      title="Carrossel de Especialistas"
      description="Gerencie os cards de especialistas e as cores da seção do carrossel."
      exists={!!exists || !!initialData}
      itemName="Configurações do Carrossel"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">

        {/* 1. FUNDO DA SEÇÃO */}
        <div className="space-y-4">
          <SectionHeader title="Aparência da Seção" section="section" icon={Palette} isExpanded={expandedSections.section} onToggle={toggleSection} />
          <AnimatePresence>
            {expandedSections.section && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Cor de Fundo da Seção</label>
                      <ColorPicker color={ce.section.backgroundColor} onChange={(val) => handleChange("section.backgroundColor", val)} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. TÍTULO */}
        <div className="space-y-4">
          <SectionHeader title="Título Principal" section="title" icon={Type} isExpanded={expandedSections.title} onToggle={toggleSection} />
          <AnimatePresence>
            {expandedSections.title && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">Texto do Título</label>
                      <Input value={ce.title.text} onChange={(e) => handleChange("title.text", e.target.value)} placeholder="Ex: E nesse processo reunimos vários especialistas" className="bg-[var(--color-background-body)]" />
                    </div>
                    
                    <div className="md:col-span-2 pt-4 border-t border-[var(--color-border)]">
                      <h4 className="text-sm font-semibold text-[var(--color-secondary)] mb-4">Palavra em Destaque</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Qual palavra destacar?</label>
                          <Input value={ce.title.highlightedWord.text} onChange={(e) => handleChange("title.highlightedWord.text", e.target.value)} placeholder="Ex: especialistas" className="bg-[var(--color-background-body)]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[var(--color-secondary)] mb-2">Cor do Destaque</label>
                          <ColorPicker color={ce.title.highlightedWord.color} onChange={(val) => handleChange("title.highlightedWord.color", val)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. CORES DO CARROSSEL */}
        <div className="space-y-4">
          <SectionHeader title="Cores do Carrossel" section="carousel" icon={Layout} isExpanded={expandedSections.carousel} onToggle={toggleSection} />
          <AnimatePresence>
            {expandedSections.carousel && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Cor da Bolinha Ativa / Setas</label>
                      <ColorPicker color={ce.customStyles.paginationBulletActive.background} onChange={(val) => handleChange("customStyles.paginationBulletActive.background", val)} />
                      <p className="text-xs text-[var(--color-secondary)]/60 mt-2">Usado no indicador de qual slide está visível.</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. LISTA DE ESPECIALISTAS */}
        <div className="space-y-4">
          <SectionHeader title="Cards de Especialistas" section="specialists" icon={Users} isExpanded={expandedSections.specialists} onToggle={toggleSection} badgeCount={ce.cards.data.length} />
          <AnimatePresence>
            {expandedSections.specialists && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-[var(--color-secondary)]/70">Adicione ou edite os profissionais que aparecem no carrossel.</p>
                    <Button type="button" onClick={addSpecialist} className="bg-[var(--color-primary)] text-white border-none flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Adicionar
                    </Button>
                  </div>

                  {ce.cards.data.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                      <Users className="w-10 h-10 text-[var(--color-secondary)]/30 mx-auto mb-3" />
                      <p className="text-sm text-[var(--color-secondary)]/50">Nenhum especialista cadastrado.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {ce.cards.data.map((spec, idx) => (
                        <div key={`spec-${idx}`} className="flex flex-col md:flex-row items-start gap-6 p-5 border border-[var(--color-border)] rounded-xl bg-[var(--color-background-body)] relative group">
                          
                          {/* Controles de Ordem */}
                          <div className="flex flex-row md:flex-col items-center gap-1 absolute top-4 right-4 md:static md:mt-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => moveSpecialist(idx, 'up')} disabled={idx === 0} className="p-1 text-[var(--color-secondary)]/60 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded disabled:opacity-20"><ArrowUp className="w-4 h-4" /></button>
                            <span className="text-[10px] font-bold text-[var(--color-secondary)]/40">{idx + 1}</span>
                            <button type="button" onClick={() => moveSpecialist(idx, 'down')} disabled={idx === ce.cards.data.length - 1} className="p-1 text-[var(--color-secondary)]/60 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded disabled:opacity-20"><ArrowDown className="w-4 h-4" /></button>
                          </div>

                          <div className="w-full md:w-[150px] shrink-0">
                            <ImageUpload 
                              label="Foto" 
                              currentImage={spec.imagem} 
                              onChange={(url) => updateSpecialist(idx, "imagem", url)} 
                              aspectRatio="aspect-[4/5]"
                              previewWidth={150}
                              previewHeight={180}
                            />
                          </div>
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <div>
                              <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Nome</label>
                              <Input value={spec.nome} onChange={(e) => updateSpecialist(idx, "nome", e.target.value)} placeholder="Ex: Rafael" className="bg-[var(--color-background)]" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Sobrenome</label>
                              <Input value={spec.sobrenome} onChange={(e) => updateSpecialist(idx, "sobrenome", e.target.value)} placeholder="Ex: Milagre" className="bg-[var(--color-background)]" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Cargo / Biografia</label>
                              <textarea 
                                value={spec.cargo} 
                                onChange={(e) => updateSpecialist(idx, "cargo", e.target.value)} 
                                placeholder="Fundador da Viver de AI..." 
                                className="w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] text-sm text-[var(--color-secondary)] outline-none focus:border-[var(--color-primary)] resize-y min-h-[80px]"
                              />
                            </div>
                          </div>
                          
                          <div className="md:mt-4 md:ml-2 absolute top-4 right-14 md:static">
                            <button type="button" onClick={() => removeSpecialist(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Remover">
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

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          isAddDisabled={true}
          isSaving={loading}
          exists={!!exists || !!initialData}
          completeCount={completion.completed}
          totalCount={completion.total}
          itemName="Carrossel de Especialistas"
          icon={Users}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração do Carrossel"
      />
      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}