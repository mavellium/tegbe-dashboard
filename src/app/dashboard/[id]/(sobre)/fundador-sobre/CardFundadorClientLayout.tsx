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
  UserCircle, 
  Share2, 
  Palette,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Check,
  Building2,
  Link as LinkIcon,
  Users,
  Type,
  ImageIcon,
  Target
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ImageUpload } from "@/components/ImageUpload";
import IconSelector from "@/components/IconSelector";
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
interface SocialLink { icon: string; link: string; }
interface CompanyItem { logo: string; name: string; }

interface FullPageData {
  cardFundador: {
    data: { name: string; role: string; image: string; socials: SocialLink[]; companies: CompanyItem[]; };
    appearance: { nameColor: string; glowColor: string; socialBgColor: string; };
  };
  quemSomos: {
    section: { backgroundColor: string; textureOverlay: { enabled: boolean; image: string; opacity: number; blendMode: string; }; };
    content: {
      title: { text: string; color: string; highlightedWord: { text: string; color: string; fontStyle: string; fontFamily: string; } };
      button: { label: string; link: string; backgroundColor: string; hoverBackgroundColor: string; textColor: string; };
    };
    animations: { enabled: boolean; };
    // Preservando campos não editáveis para não quebrar o layout
    _raw: any; 
  };
}

const defaultData: FullPageData = {
  cardFundador: {
    data: { name: "", role: "", image: "", socials: [], companies: [] },
    appearance: { nameColor: "#F1D95D", glowColor: "#C9A646", socialBgColor: "#DDC62F" }
  },
  quemSomos: {
    section: { backgroundColor: "#FAFAF8", textureOverlay: { enabled: true, image: "/textura.svg", opacity: 0.03, blendMode: "normal" } },
    content: {
      title: { text: "", color: "#0A0A0A", highlightedWord: { text: "", color: "#FFC72C", fontStyle: "italic", fontFamily: "serif" } },
      button: { label: "", link: "#", backgroundColor: "#FFC72C", hoverBackgroundColor: "#F2CB5E", textColor: "#0A0A0A" }
    },
    animations: { enabled: true },
    _raw: {}
  }
};

const mergeWithDefaults = (apiData: any, defaultValues: FullPageData): FullPageData => {
  if (!apiData) return defaultValues;
  
  const cardData = apiData.cardFundador?.data || apiData.cardFundador?.defaultData || {};
  const cardApp = apiData.cardFundador?.appearance || {};
  
  const qs = apiData.quemSomos || {};
  const qsSection = qs.section || {};
  const qsContent = qs.content || {};
  
  return {
    cardFundador: {
      data: {
        name: cardData.name || defaultValues.cardFundador.data.name,
        role: cardData.role || defaultValues.cardFundador.data.role,
        image: cardData.image || defaultValues.cardFundador.data.image,
        socials: cardData.socials || defaultValues.cardFundador.data.socials,
        companies: cardData.companies || defaultValues.cardFundador.data.companies,
      },
      appearance: {
        nameColor: cardApp.nameColor || defaultValues.cardFundador.appearance.nameColor,
        glowColor: cardApp.glowColor || defaultValues.cardFundador.appearance.glowColor,
        socialBgColor: cardApp.socialBgColor || defaultValues.cardFundador.appearance.socialBgColor,
      }
    },
    quemSomos: {
      section: {
        backgroundColor: qsSection.backgroundColor || defaultValues.quemSomos.section.backgroundColor,
        textureOverlay: { ...defaultValues.quemSomos.section.textureOverlay, ...qsSection.textureOverlay }
      },
      content: {
        title: {
          text: qsContent.title?.text || defaultValues.quemSomos.content.title.text,
          color: qsContent.title?.color || defaultValues.quemSomos.content.title.color,
          highlightedWord: { ...defaultValues.quemSomos.content.title.highlightedWord, ...qsContent.title?.highlightedWord }
        },
        button: {
          label: qsContent.button?.label || defaultValues.quemSomos.content.button.label,
          link: qsContent.button?.link || defaultValues.quemSomos.content.button.link,
          backgroundColor: qsContent.button?.backgroundColor || defaultValues.quemSomos.content.button.backgroundColor,
          hoverBackgroundColor: qsContent.button?.hoverBackgroundColor || defaultValues.quemSomos.content.button.hoverBackgroundColor,
          textColor: qsContent.button?.textColor || defaultValues.quemSomos.content.button.textColor
        }
      },
      animations: {
        enabled: qs.animations?.enabled ?? defaultValues.quemSomos.animations.enabled
      },
      _raw: qs // Guarda o resto do JSON original (grids, tipografias padrão, api endpoints)
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
export default function CardFundadorClientLayout({ initialData }: { initialData: any }) {
  const [activeTab, setActiveTab] = useState<"quemsomos" | "fundador">("quemsomos");
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    qs_section: true,
    qs_title: false,
    qs_button: false,
    profile: true,
    companies: false,
    socials: false,
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
  } = useJsonManagement<FullPageData>({
    apiPath: "/api/tegbe-institucional/json/quem-somos-fundador",
    defaultData: initialData ? mergeWithDefaults(initialData, defaultData) : defaultData,
    mergeFunction: mergeWithDefaults,
  });

  const toggleSection = (section: string) => setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  const handleChange = (path: string, value: any) => updateNested(path, value);

  // --- Funções do Card Fundador ---
  const addCompany = () => handleChange("cardFundador.data.companies", [...pageData.cardFundador.data.companies, { logo: "", name: "" }]);
  const removeCompany = (index: number) => {
    const newCompanies = [...pageData.cardFundador.data.companies];
    newCompanies.splice(index, 1);
    handleChange("cardFundador.data.companies", newCompanies);
  };
  const updateCompany = (index: number, field: keyof CompanyItem, value: string) => {
    const newCompanies = [...pageData.cardFundador.data.companies];
    newCompanies[index][field] = value;
    handleChange("cardFundador.data.companies", newCompanies);
  };

  const addSocial = () => handleChange("cardFundador.data.socials", [...pageData.cardFundador.data.socials, { icon: "", link: "" }]);
  const removeSocial = (index: number) => {
    const newSocials = [...pageData.cardFundador.data.socials];
    newSocials.splice(index, 1);
    handleChange("cardFundador.data.socials", newSocials);
  };
  const updateSocial = (index: number, field: keyof SocialLink, value: string) => {
    const newSocials = [...pageData.cardFundador.data.socials];
    newSocials[index][field] = value;
    handleChange("cardFundador.data.socials", newSocials);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Remonta o JSON original injetando as edições (para manter paddings e estruturas visuais salvas no _raw)
    const payloadToSave = {
      cardFundador: {
        defaultData: pageData.cardFundador.data,
        appearance: pageData.cardFundador.appearance,
        structure: initialData?.cardFundador?.structure || {} // Mantém a estrutura caso exista no BD
      },
      quemSomos: {
        ...pageData.quemSomos._raw,
        section: {
          ...(pageData.quemSomos._raw.section || {}),
          backgroundColor: pageData.quemSomos.section.backgroundColor,
          textureOverlay: pageData.quemSomos.section.textureOverlay
        },
        content: {
          ...(pageData.quemSomos._raw.content || {}),
          title: {
            ...(pageData.quemSomos._raw.content?.title || {}),
            text: pageData.quemSomos.content.title.text,
            color: pageData.quemSomos.content.title.color,
            highlightedWord: pageData.quemSomos.content.title.highlightedWord
          },
          button: {
            ...(pageData.quemSomos._raw.content?.button || {}),
            label: pageData.quemSomos.content.button.label,
            link: pageData.quemSomos.content.button.link,
            backgroundColor: pageData.quemSomos.content.button.backgroundColor,
            hoverBackgroundColor: pageData.quemSomos.content.button.hoverBackgroundColor,
            textColor: pageData.quemSomos.content.button.textColor
          }
        },
        animations: {
          ...(pageData.quemSomos._raw.animations || {}),
          enabled: pageData.quemSomos.animations.enabled
        }
      }
    };
    
    try {
      const res = await fetch("/api/tegbe-institucional/json/quem-somos-fundador", {
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
    
    if (pageData.cardFundador.data.name) completed++;
    if (pageData.cardFundador.data.role) completed++;
    if (pageData.cardFundador.data.image) completed++;
    if (pageData.quemSomos.content.title.text) completed++;
    if (pageData.quemSomos.content.button.label) completed++;

    return { completed, total: 5 };
  };

  const completion = calculateCompletion();

  if (loading && !exists && !initialData) {
    return <Loading layout={Users} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Users}
      title="Quem Somos & Fundador"
      description="Gerencie a seção 'Quem Somos' e o cartão de apresentação do Fundador."
      exists={!!exists || !!initialData}
      itemName="Configurações"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        
        {/* TAB SWITCHER */}
        <Card className="p-2 bg-[var(--color-background)] border-[var(--color-border)]">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("quemsomos")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === "quemsomos" 
                  ? "bg-[var(--color-primary)] text-white shadow-md" 
                  : "bg-transparent text-[var(--color-secondary)] hover:bg-[var(--color-background-body)]"
              }`}
            >
              <Building2 className="w-4 h-4" /> Seção Quem Somos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fundador")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === "fundador" 
                  ? "bg-[var(--color-primary)] text-white shadow-md" 
                  : "bg-transparent text-[var(--color-secondary)] hover:bg-[var(--color-background-body)]"
              }`}
            >
              <UserCircle className="w-4 h-4" /> Card do Fundador
            </button>
          </div>
        </Card>

        {/* ======================================================== */}
        {/* ABA: QUEM SOMOS */}
        {/* ======================================================== */}
        {activeTab === "quemsomos" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* FUNDO E TEXTURA */}
            <div className="space-y-4">
              <SectionHeader title="Fundo da Seção" section="qs_section" icon={Palette} isExpanded={expandedSections.qs_section} onToggle={toggleSection} />
              <motion.div initial={false} animate={{ height: expandedSections.qs_section ? "auto" : 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Cor de Fundo</label>
                      <ColorPicker color={pageData.quemSomos.section.backgroundColor} onChange={(val) => handleChange("quemSomos.section.backgroundColor", val)} />
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-[var(--color-secondary)]">Textura Sobreposta</label>
                        <Switch checked={pageData.quemSomos.section.textureOverlay.enabled} onCheckedChange={(val) => handleChange("quemSomos.section.textureOverlay.enabled", val)} />
                      </div>
                      {pageData.quemSomos.section.textureOverlay.enabled && (
                        <ImageUpload 
                          label="Imagem da Textura (SVG)" 
                          currentImage={pageData.quemSomos.section.textureOverlay.image} 
                          onChange={(url) => handleChange("quemSomos.section.textureOverlay.image", url)} 
                        />
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* TÍTULO E TEXTOS */}
            <div className="space-y-4">
              <SectionHeader title="Título Principal" section="qs_title" icon={Type} isExpanded={expandedSections.qs_title} onToggle={toggleSection} />
              <motion.div initial={false} animate={{ height: expandedSections.qs_title ? "auto" : 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">Texto do Título</label>
                      <Input value={pageData.quemSomos.content.title.text} onChange={(e) => handleChange("quemSomos.content.title.text", e.target.value)} placeholder="Ex: Onde a parceria constrói resultado" className="bg-[var(--color-background-body)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Cor do Título</label>
                      <ColorPicker color={pageData.quemSomos.content.title.color} onChange={(val) => handleChange("quemSomos.content.title.color", val)} />
                    </div>
                    <div className="md:col-span-2 pt-4 border-t border-[var(--color-border)]">
                      <h4 className="text-sm font-semibold text-[var(--color-secondary)] mb-4">Palavra em Destaque</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Qual palavra destacar?</label>
                          <Input value={pageData.quemSomos.content.title.highlightedWord.text} onChange={(e) => handleChange("quemSomos.content.title.highlightedWord.text", e.target.value)} placeholder="Ex: resultado" className="bg-[var(--color-background-body)]" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[var(--color-secondary)] mb-2">Cor do Destaque</label>
                          <ColorPicker color={pageData.quemSomos.content.title.highlightedWord.color} onChange={(val) => handleChange("quemSomos.content.title.highlightedWord.color", val)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* BOTÃO */}
            <div className="space-y-4">
              <SectionHeader title="Botão de Ação" section="qs_button" icon={Target} isExpanded={expandedSections.qs_button} onToggle={toggleSection} />
              <motion.div initial={false} animate={{ height: expandedSections.qs_button ? "auto" : 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">Texto do Botão</label>
                      <Input value={pageData.quemSomos.content.button.label} onChange={(e) => handleChange("quemSomos.content.button.label", e.target.value)} placeholder="Conhecer o Método" className="bg-[var(--color-background-body)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1 flex items-center gap-1"><LinkIcon className="w-4 h-4"/> URL do Link</label>
                      <Input value={pageData.quemSomos.content.button.link} onChange={(e) => handleChange("quemSomos.content.button.link", e.target.value)} placeholder="#" className="bg-[var(--color-background-body)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Cor de Fundo</label>
                      <ColorPicker color={pageData.quemSomos.content.button.backgroundColor} onChange={(val) => handleChange("quemSomos.content.button.backgroundColor", val)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Cor de Fundo (Hover)</label>
                      <ColorPicker color={pageData.quemSomos.content.button.hoverBackgroundColor} onChange={(val) => handleChange("quemSomos.content.button.hoverBackgroundColor", val)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Cor do Texto</label>
                      <ColorPicker color={pageData.quemSomos.content.button.textColor} onChange={(val) => handleChange("quemSomos.content.button.textColor", val)} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* ABA: CARD FUNDADOR */}
        {/* ======================================================== */}
        {activeTab === "fundador" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* 1. PERFIL */}
            <div className="space-y-4">
              <SectionHeader title="Perfil Principal" section="profile" icon={UserCircle} isExpanded={expandedSections.profile} onToggle={toggleSection} />
              <motion.div initial={false} animate={{ height: expandedSections.profile ? "auto" : 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <ImageUpload 
                        label="Foto do Fundador" 
                        description="Recomendado: Imagem em PNG transparente"
                        currentImage={pageData.cardFundador.data.image} 
                        onChange={(url) => handleChange("cardFundador.data.image", url)} 
                        aspectRatio="aspect-[3/4]"
                        previewWidth={200}
                        previewHeight={260}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">Nome</label>
                      <Input value={pageData.cardFundador.data.name} onChange={(e) => handleChange("cardFundador.data.name", e.target.value)} placeholder="Ex: Donizete Caetano" className="bg-[var(--color-background-body)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">Cargo / Descrição</label>
                      <Input value={pageData.cardFundador.data.role} onChange={(e) => handleChange("cardFundador.data.role", e.target.value)} placeholder="Ex: Especialista em Escala" className="bg-[var(--color-background-body)]" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* 2. EMPRESAS PARCEIRAS */}
            <div className="space-y-4">
              <SectionHeader title="Logos de Empresas" section="companies" icon={Building2} isExpanded={expandedSections.companies} onToggle={toggleSection} badgeCount={pageData.cardFundador.data.companies.length} />
              <motion.div initial={false} animate={{ height: expandedSections.companies ? "auto" : 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-[var(--color-secondary)]/70">Adicione os logos das empresas parceiras ou cases.</p>
                    <Button type="button" onClick={addCompany} className="bg-[var(--color-primary)] text-white border-none flex items-center gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
                  </div>
                  {pageData.cardFundador.data.companies.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                      <Building2 className="w-8 h-8 text-[var(--color-secondary)]/30 mx-auto mb-2" />
                      <p className="text-sm text-[var(--color-secondary)]/50">Nenhuma empresa adicionada.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pageData.cardFundador.data.companies.map((company, idx) => (
                        <div key={`company-${idx}`} className="flex items-start gap-4 p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background-body)]">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Ícone da Empresa</label>
                              <IconSelector value={company.logo} onChange={(val) => updateCompany(idx, "logo", val)} placeholder="simple-icons:mercadopago" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Nome de Referência</label>
                              <Input value={company.name} onChange={(e) => updateCompany(idx, "name", e.target.value)} placeholder="Ex: Mercado Livre" className="bg-[var(--color-background)]" />
                            </div>
                          </div>
                          <button type="button" onClick={() => removeCompany(idx)} className="mt-6 p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>

            {/* 3. REDES SOCIAIS */}
            <div className="space-y-4">
              <SectionHeader title="Redes Sociais" section="socials" icon={Share2} isExpanded={expandedSections.socials} onToggle={toggleSection} badgeCount={pageData.cardFundador.data.socials.length} />
              <motion.div initial={false} animate={{ height: expandedSections.socials ? "auto" : 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-[var(--color-secondary)]/70">Links para Instagram, LinkedIn, etc.</p>
                    <Button type="button" onClick={addSocial} className="bg-[var(--color-primary)] text-white border-none flex items-center gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
                  </div>
                  {pageData.cardFundador.data.socials.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                      <Share2 className="w-8 h-8 text-[var(--color-secondary)]/30 mx-auto mb-2" />
                      <p className="text-sm text-[var(--color-secondary)]/50">Nenhuma rede social adicionada.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pageData.cardFundador.data.socials.map((social, idx) => (
                        <div key={`social-${idx}`} className="flex items-start gap-4 p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background-body)]">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Ícone</label>
                              <IconSelector value={social.icon} onChange={(val) => updateSocial(idx, "icon", val)} placeholder="ph:instagram-logo" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> URL do Link</label>
                              <Input value={social.link} onChange={(e) => updateSocial(idx, "link", e.target.value)} placeholder="Ex: https://..." className="bg-[var(--color-background)]" />
                            </div>
                          </div>
                          <button type="button" onClick={() => removeSocial(idx)} className="mt-6 p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>

            {/* 4. APARÊNCIA E CORES */}
            <div className="space-y-4">
              <SectionHeader title="Aparência e Cores do Card" section="appearance" icon={Palette} isExpanded={expandedSections.appearance} onToggle={toggleSection} />
              <motion.div initial={false} animate={{ height: expandedSections.appearance ? "auto" : 0 }} className="overflow-hidden">
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Cor do Nome</label>
                      <ColorPicker color={pageData.cardFundador.appearance.nameColor} onChange={(color) => handleChange("cardFundador.appearance.nameColor", color)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Brilho de Fundo (Glow)</label>
                      <ColorPicker color={pageData.cardFundador.appearance.glowColor} onChange={(color) => handleChange("cardFundador.appearance.glowColor", color)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Fundo das Redes Sociais</label>
                      <ColorPicker color={pageData.cardFundador.appearance.socialBgColor} onChange={(color) => handleChange("cardFundador.appearance.socialBgColor", color)} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

          </div>
        )}

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          isAddDisabled={true}
          isSaving={loading}
          exists={!!exists || !!initialData}
          completeCount={completion.completed}
          totalCount={completion.total}
          itemName="Configurações"
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
        itemName="Dados da Página"
      />
      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}