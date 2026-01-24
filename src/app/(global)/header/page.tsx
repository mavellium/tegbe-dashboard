/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { ImageUpload } from "@/components/ImageUpload";
import IconSelector from "@/components/IconSelector";
import { 
  Layout, 
  Settings, 
  Image as ImageIcon, 
  Tag, 
  Link as LinkIcon,
  Palette,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Megaphone,
  Clock,
  ArrowUpToLine,
  ArrowDownToLine,
  Maximize2,
  Eye,
  EyeOff
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { extractHexFromTailwind, hexToTailwindClass } from "@/lib/colorUtils";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";

interface LinkItem {
  name: string;
  href: string;
}

interface VariantTheme {
  primary: string;
  hoverBg: string;
  textOnPrimary: string;
  accentText: string;
  hoverText: string;
  border: string;
  glow: string;
  underline: string;
}

interface AnnouncementBar {
  content: {
    text: string;
    linkText: string;
    linkUrl: string;
    icon: string;
    showIcon: boolean;
  };
  styles: {
    variant: string;
    customBackgroundColor: string | null;
    customTextColor: string | null;
    position: string;
    fullWidth: boolean;
    className: string;
  };
  behavior: {
    autoClose: number;
    persistent: boolean;
  };
}

type HeaderData = {
  id?: string;
  general: {
    logo: string;
    logoAlt: string;
    consultantBadge: string;
    ctaLink: string;
    ctaText: string;
  };
  links: LinkItem[];
  variants: {
    ecommerce: VariantTheme;
    marketing: VariantTheme;
    sobre: VariantTheme;
    cursos: VariantTheme;
  };
  announcementBar: AnnouncementBar;
};

const defaultHeaderData: HeaderData = {
  general: {
    logo: "",
    logoAlt: "",
    consultantBadge: "",
    ctaLink: "",
    ctaText: ""
  },
  links: [
    { name: "Home", href: "/" },
  ],
  variants: {
    ecommerce: {
      primary: "bg-[#FFCC00]",
      hoverBg: "hover:bg-[#FFDB15]",
      textOnPrimary: "text-black",
      accentText: "text-[#FFCC00]",
      hoverText: "group-hover:text-[#FFCC00]",
      border: "border-yellow-500/30",
      glow: "shadow-[0_0_20px_rgba(255,204,0,0.4)]",
      underline: "bg-[#FFCC00]"
    },
    marketing: {
      primary: "bg-[#E31B63]",
      hoverBg: "hover:bg-[#FF1758]",
      textOnPrimary: "text-white",
      accentText: "text-[#E31B63]",
      hoverText: "group-hover:text-[#E31B63]",
      border: "border-rose-500/30",
      glow: "shadow-[0_0_20px_rgba(227,27,99,0.4)]",
      underline: "bg-[#E31B63]"
    },
    sobre: {
      primary: "bg-[#0071E3]",
      hoverBg: "hover:bg-[#2B8CFF]",
      textOnPrimary: "text-white",
      accentText: "text-[#0071E3]",
      hoverText: "group-hover:text-[#0071E3]",
      border: "border-blue-500/30",
      glow: "shadow-[0_0_20px_rgba(0,113,227,0.4)]",
      underline: "bg-[#0071E3]"
    },
    cursos: {
      primary: "bg-[#FFD700]",
      hoverBg: "hover:bg-[#E5C100]",
      textOnPrimary: "text-black",
      accentText: "text-[#FFD700]",
      hoverText: "group-hover:text-[#FFD700]",
      border: "border-[#FFD700]/30",
      glow: "shadow-[0_0_25px_rgba(255,215,0,0.3)]",
      underline: "bg-[#FFD700]"
    }
  },
  announcementBar: {
    content: {
      text: "",
      linkText: "",
      linkUrl: "#",
      icon: "ph:megaphone-simple-fill",
      showIcon: true
    },
    styles: {
      variant: "warning",
      customBackgroundColor: null,
      customTextColor: null,
      position: "top",
      fullWidth: true,
      className: ""
    },
    behavior: {
      autoClose: 0,
      persistent: false
    }
  }
};

const mergeWithDefaults = (apiData: any, defaultData: HeaderData): HeaderData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id,
    general: {
      logo: apiData.general?.logo || defaultData.general.logo,
      logoAlt: apiData.general?.logoAlt || defaultData.general.logoAlt,
      consultantBadge: apiData.general?.consultantBadge || defaultData.general.consultantBadge,
      ctaLink: apiData.general?.ctaLink || defaultData.general.ctaLink,
      ctaText: apiData.general?.ctaText || defaultData.general.ctaText,
    },
    links: apiData.links || defaultData.links,
    variants: {
      ecommerce: {
        primary: apiData.variants?.ecommerce?.primary || defaultData.variants.ecommerce.primary,
        hoverBg: apiData.variants?.ecommerce?.hoverBg || defaultData.variants.ecommerce.hoverBg,
        textOnPrimary: apiData.variants?.ecommerce?.textOnPrimary || defaultData.variants.ecommerce.textOnPrimary,
        accentText: apiData.variants?.ecommerce?.accentText || defaultData.variants.ecommerce.accentText,
        hoverText: apiData.variants?.ecommerce?.hoverText || defaultData.variants.ecommerce.hoverText,
        border: apiData.variants?.ecommerce?.border || defaultData.variants.ecommerce.border,
        glow: apiData.variants?.ecommerce?.glow || defaultData.variants.ecommerce.glow,
        underline: apiData.variants?.ecommerce?.underline || defaultData.variants.ecommerce.underline,
      },
      marketing: {
        primary: apiData.variants?.marketing?.primary || defaultData.variants.marketing.primary,
        hoverBg: apiData.variants?.marketing?.hoverBg || defaultData.variants.marketing.hoverBg,
        textOnPrimary: apiData.variants?.marketing?.textOnPrimary || defaultData.variants.marketing.textOnPrimary,
        accentText: apiData.variants?.marketing?.accentText || defaultData.variants.marketing.accentText,
        hoverText: apiData.variants?.marketing?.hoverText || defaultData.variants.marketing.hoverText,
        border: apiData.variants?.marketing?.border || defaultData.variants.marketing.border,
        glow: apiData.variants?.marketing?.glow || defaultData.variants.marketing.glow,
        underline: apiData.variants?.marketing?.underline || defaultData.variants.marketing.underline,
      },
      sobre: {
        primary: apiData.variants?.sobre?.primary || defaultData.variants.sobre.primary,
        hoverBg: apiData.variants?.sobre?.hoverBg || defaultData.variants.sobre.hoverBg,
        textOnPrimary: apiData.variants?.sobre?.textOnPrimary || defaultData.variants.sobre.textOnPrimary,
        accentText: apiData.variants?.sobre?.accentText || defaultData.variants.sobre.accentText,
        hoverText: apiData.variants?.sobre?.hoverText || defaultData.variants.sobre.hoverText,
        border: apiData.variants?.sobre?.border || defaultData.variants.sobre.border,
        glow: apiData.variants?.sobre?.glow || defaultData.variants.sobre.glow,
        underline: apiData.variants?.sobre?.underline || defaultData.variants.sobre.underline,
      },
      cursos: {
        primary: apiData.variants?.cursos?.primary || defaultData.variants.cursos.primary,
        hoverBg: apiData.variants?.cursos?.hoverBg || defaultData.variants.cursos.hoverBg,
        textOnPrimary: apiData.variants?.cursos?.textOnPrimary || defaultData.variants.cursos.textOnPrimary,
        accentText: apiData.variants?.cursos?.accentText || defaultData.variants.cursos.accentText,
        hoverText: apiData.variants?.cursos?.hoverText || defaultData.variants.cursos.hoverText,
        border: apiData.variants?.cursos?.border || defaultData.variants.cursos.border,
        glow: apiData.variants?.cursos?.glow || defaultData.variants.cursos.glow,
        underline: apiData.variants?.cursos?.underline || defaultData.variants.cursos.underline,
      }
    },
    announcementBar: apiData.announcementBar || defaultData.announcementBar,
  };
};

export default function Page() {
  const {
    data: headerData,
    exists,
    loading,
    success,
    errorMsg,
    deleteModal,
    fileStates,
    updateNested,
    setFileState,
    save,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
  } = useJsonManagement<HeaderData>({
    apiPath: "/api/tegbe-institucional/json/header",
    defaultData: defaultHeaderData,
    mergeFunction: mergeWithDefaults,
  });

  // Estado local para gerenciar os links
  const [localLinks, setLocalLinks] = useState<LinkItem[]>([]);
  const [draggingLink, setDraggingLink] = useState<number | null>(null);

  const [expandedSections, setExpandedSections] = useState({
    announcement: true,
    general: false,
    links: false,
    colors: false,
  });

  // Referências para novos itens
  const newLinkRef = useRef<HTMLDivElement>(null);

  // Controle de planos
  const currentPlanType = 'pro'; // Altere conforme sua lógica de planos
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  // Sincroniza os dados quando carregam do banco
  useEffect(() => {
    if (headerData.links) {
      setLocalLinks(headerData.links);
    }
  }, [headerData.links]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para links
  const handleAddLink = () => {
    if (localLinks.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: LinkItem = {
      name: '',
      href: ''
    };
    
    const updated = [...localLinks, newItem];
    setLocalLinks(updated);
    updateNested('links', updated);
    
    setTimeout(() => {
      newLinkRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updateLink = (index: number, updates: Partial<LinkItem>) => {
    const updated = [...localLinks];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      setLocalLinks(updated);
      updateNested('links', updated);
    }
  };

  const removeLink = (index: number) => {
    const updated = [...localLinks];
    
    if (updated.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyItem: LinkItem = {
        name: '',
        href: ''
      };
      setLocalLinks([emptyItem]);
      updateNested('links', [emptyItem]);
    } else {
      updated.splice(index, 1);
      setLocalLinks(updated);
      updateNested('links', updated);
    }
  };

  // Funções de drag & drop para links
  const handleLinkDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingLink(index);
  };

  const handleLinkDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingLink === null || draggingLink === index) return;
    
    const updated = [...localLinks];
    const draggedItem = updated[draggingLink];
    
    // Remove o item arrastado
    updated.splice(draggingLink, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingLink ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    setLocalLinks(updated);
    updateNested('links', updated);
    setDraggingLink(index);
  };

  const handleLinkDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingLink(null);
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

  // Função para atualizar cores
  const handleColorsChange = (property: keyof VariantTheme, hexColor: string) => {
    const tailwindClass = hexToTailwindClass(property as any, hexColor);
    
    const updatedVariants = { ...headerData.variants };
    
    (Object.keys(updatedVariants) as Array<keyof typeof updatedVariants>).forEach((variant) => {
      updatedVariants[variant] = {
        ...updatedVariants[variant],
        [property]: tailwindClass
      };
    });

    updateNested('variants', updatedVariants);
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
  const isLinkValid = (item: LinkItem): boolean => {
    return item.name.trim() !== '' && item.href.trim() !== '';
  };

  const isLinksLimitReached = localLinks.length >= currentPlanLimit;
  const canAddNewLink = !isLinksLimitReached;
  const linksCompleteCount = localLinks.filter(isLinkValid).length;
  const linksTotalCount = localLinks.length;

  const isGeneralValid = (): boolean => {
    return headerData.general.logo.trim() !== '' && 
           headerData.general.logoAlt.trim() !== '' &&
           headerData.general.ctaLink.trim() !== '' &&
           headerData.general.ctaText.trim() !== '';
  };

  const generalCompleteCount = [
    headerData.general.logo.trim() !== '',
    headerData.general.logoAlt.trim() !== '',
    headerData.general.consultantBadge.trim() !== '',
    headerData.general.ctaLink.trim() !== '',
    headerData.general.ctaText.trim() !== ''
  ].filter(Boolean).length;

  const linksValidationError = isLinksLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Announcement Bar (8 campos)
    const ab = headerData.announcementBar;
    total += 8;
    if (ab.content.text.trim()) completed++;
    if (ab.content.linkText.trim()) completed++;
    if (ab.content.linkUrl.trim()) completed++;
    if (ab.content.icon.trim()) completed++;
    completed++; // showIcon é boolean
    if (ab.styles.variant.trim()) completed++;
    completed++; // fullWidth é boolean
    completed++; // persistent é boolean

    // Geral (5 campos)
    total += 5;
    completed += generalCompleteCount;

    // Links (2 campos cada)
    total += localLinks.length * 2;
    localLinks.forEach(link => {
      if (link.name.trim()) completed++;
      if (link.href.trim()) completed++;
    });

    // Cores (8 propriedades * 4 variantes = 32 campos)
    total += 32;
    const variantKeys: (keyof VariantTheme)[] = ['primary', 'hoverBg', 'textOnPrimary', 'accentText', 'hoverText', 'border', 'glow', 'underline'];
    
    Object.values(headerData.variants).forEach(variant => {
      variantKeys.forEach(key => {
        if (variant[key]?.trim()) completed++;
      });
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Layout}
      title="Personalização do Header"
      description="Configure o header do site incluindo logo, links e cores"
      exists={!!exists}
      itemName="Header"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Announcement Bar */}
        <div className="space-y-4">
          <SectionHeader
            title="Barra de Anúncio"
            section="announcement"
            icon={Megaphone}
            isExpanded={expandedSections.announcement}
            onToggle={() => toggleSection("announcement")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.announcement ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                {/* Conteúdo */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                    <Megaphone className="w-5 h-5" />
                    Conteúdo
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Texto do Anúncio
                    </label>
                    <Input
                      value={headerData.announcementBar.content.text}
                      onChange={(e) => updateNested('announcementBar.content.text', e.target.value)}
                      placeholder="🚀 Promoção especial: 50% de desconto em todos os cursos!"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Texto do Link
                      </label>
                      <Input
                        value={headerData.announcementBar.content.linkText}
                        onChange={(e) => updateNested('announcementBar.content.linkText', e.target.value)}
                        placeholder="Saiba mais"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        URL do Link
                      </label>
                      <Input
                        value={headerData.announcementBar.content.linkUrl}
                        onChange={(e) => updateNested('announcementBar.content.linkUrl', e.target.value)}
                        placeholder="#"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Ícone
                      </label>
                      <IconSelector
                        value={headerData.announcementBar.content.icon}
                        onChange={(value) => updateNested('announcementBar.content.icon', value)}
                        placeholder="ph:megaphone-simple-fill"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[var(--color-background-body)] rounded-lg border border-[var(--color-border)]">
                      <div className="flex items-center gap-3">
                        {headerData.announcementBar.content.showIcon ? (
                          <Eye className="w-5 h-5 text-green-500" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-gray-500" />
                        )}
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-secondary)]">
                            Mostrar Ícone
                          </label>
                          <p className="text-sm text-[var(--color-secondary)]/70">
                            Exibir ícone ao lado do texto
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateNested('announcementBar.content.showIcon', !headerData.announcementBar.content.showIcon)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          headerData.announcementBar.content.showIcon 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            headerData.announcementBar.content.showIcon 
                              ? 'translate-x-6' 
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Estilos */}
                <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
                  <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Estilos
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Variante
                      </label>
                      <select
                        value={headerData.announcementBar.styles.variant}
                        onChange={(e) => updateNested('announcementBar.styles.variant', e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-background-body)] border border-[var(--color-border)] rounded text-[var(--color-secondary)]"
                      >
                        <option value="info">Info (Azul)</option>
                        <option value="warning">Warning (Amarelo)</option>
                        <option value="success">Success (Verde)</option>
                        <option value="error">Error (Vermelho)</option>
                        <option value="custom">Customizado</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Posição
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateNested('announcementBar.styles.position', 'top')}
                          className={`flex-1 flex items-center justify-center gap-2 p-2 rounded border ${
                            headerData.announcementBar.styles.position === 'top'
                              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                              : 'bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]'
                          }`}
                        >
                          <ArrowUpToLine className="w-4 h-4" />
                          Topo
                        </button>
                        <button
                          type="button"
                          onClick={() => updateNested('announcementBar.styles.position', 'bottom')}
                          className={`flex-1 flex items-center justify-center gap-2 p-2 rounded border ${
                            headerData.announcementBar.styles.position === 'bottom'
                              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                              : 'bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]'
                          }`}
                        >
                          <ArrowDownToLine className="w-4 h-4" />
                          Rodapé
                        </button>
                      </div>
                    </div>
                  </div>

                  {headerData.announcementBar.styles.variant === 'custom' && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-[var(--color-secondary)]">Cores Personalizadas</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ThemePropertyInput
                          property="customBackgroundColor"
                          label="Cor de Fundo"
                          description="Cor de fundo da barra de anúncio"
                          currentHex={headerData.announcementBar.styles.customBackgroundColor || '#FFCC00'}
                          tailwindClass=""
                          onThemeChange={(prop, hex) => updateNested('announcementBar.styles.customBackgroundColor', hex)}
                        />

                        <ThemePropertyInput
                          property="customTextColor"
                          label="Cor do Texto"
                          description="Cor do texto da barra de anúncio"
                          currentHex={headerData.announcementBar.styles.customTextColor || '#000000'}
                          tailwindClass=""
                          onThemeChange={(prop, hex) => updateNested('announcementBar.styles.customTextColor', hex)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-[var(--color-background-body)] rounded-lg border border-[var(--color-border)]">
                      <div className="flex items-center gap-3">
                        {headerData.announcementBar.styles.fullWidth ? (
                          <Maximize2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Maximize2 className="w-5 h-5 text-gray-500" />
                        )}
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-secondary)]">
                            Largura Total
                          </label>
                          <p className="text-sm text-[var(--color-secondary)]/70">
                            Ocupar toda a largura da tela
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateNested('announcementBar.styles.fullWidth', !headerData.announcementBar.styles.fullWidth)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          headerData.announcementBar.styles.fullWidth 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            headerData.announcementBar.styles.fullWidth 
                              ? 'translate-x-6' 
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Classe CSS Personalizada
                      </label>
                      <Input
                        value={headerData.announcementBar.styles.className}
                        onChange={(e) => updateNested('announcementBar.styles.className', e.target.value)}
                        placeholder="minha-classe-personalizada"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Comportamento */}
                <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
                  <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Comportamento
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Fechar Automaticamente (segundos)
                      </label>
                      <Input
                        type="number"
                        value={headerData.announcementBar.behavior.autoClose}
                        onChange={(e) => updateNested('announcementBar.behavior.autoClose', parseInt(e.target.value) || 0)}
                        placeholder="0 (não fecha automaticamente)"
                        min="0"
                        max="3600"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                      <p className="text-xs text-[var(--color-secondary)]/50">
                        0 = não fecha automaticamente
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[var(--color-background-body)] rounded-lg border border-[var(--color-border)]">
                      <div className="flex items-center gap-3">
                        {headerData.announcementBar.behavior.persistent ? (
                          <Eye className="w-5 h-5 text-green-500" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-gray-500" />
                        )}
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-secondary)]">
                            Persistente
                          </label>
                          <p className="text-sm text-[var(--color-secondary)]/70">
                            Manter visível após fechar
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateNested('announcementBar.behavior.persistent', !headerData.announcementBar.behavior.persistent)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          headerData.announcementBar.behavior.persistent 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            headerData.announcementBar.behavior.persistent 
                              ? 'translate-x-6' 
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Geral */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações Gerais"
            section="general"
            icon={Settings}
            isExpanded={expandedSections.general}
            onToggle={() => toggleSection("general")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.general ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Logos
                    </h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {generalCompleteCount} de 5 campos preenchidos
                      </span>
                    </div>
                  </div>
                  
                  <ImageUpload
                    label="Logo do Site"
                    description="Imagem principal do site (recomendado: PNG transparente)"
                    currentImage={headerData.general.logo}
                    selectedFile={fileStates['general.logo'] || null}
                    onFileChange={(file) => setFileState('general.logo', file)}
                    aspectRatio="aspect-[4/1]"
                    previewWidth={200}
                    previewHeight={200}
                  />

                  <Input
                    label="Texto Alternativo do Logo"
                    value={headerData.general.logoAlt}
                    onChange={(e) => updateNested('general.logoAlt', e.target.value)}
                    placeholder="Ex: Tegbe Logo"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <ImageUpload
                    label="Badge de Consultor"
                    description="Selo de consultoria certificada"
                    currentImage={headerData.general.consultantBadge}
                    selectedFile={fileStates['general.consultantBadge'] || null}
                    onFileChange={(file) => setFileState('general.consultantBadge', file)}
                    aspectRatio="aspect-square"
                    previewWidth={100}
                    previewHeight={100}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Call to Action (CTA)
                  </h3>
                  
                  <Input
                    label="Link do CTA"
                    value={headerData.general.ctaLink}
                    onChange={(e) => updateNested('general.ctaLink', e.target.value)}
                    placeholder="Ex: https://api.whatsapp.com/send?phone=5514991779502"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Texto do CTA"
                    value={headerData.general.ctaText}
                    onChange={(e) => updateNested('general.ctaText', e.target.value)}
                    placeholder="Ex: Agendar agora"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Links */}
        <div className="space-y-4">
          <SectionHeader
            title="Links de Navegação"
            section="links"
            icon={LinkIcon}
            isExpanded={expandedSections.links}
            onToggle={() => toggleSection("links")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.links ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                        Menu de Navegação
                      </h4>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {linksCompleteCount} de {linksTotalCount} completos
                        </span>
                        <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          Limite: {currentPlanType === 'pro' ? '10' : '5'} itens
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        type="button"
                        onClick={handleAddLink}
                        variant="primary"
                        className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                        disabled={!canAddNewLink}
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Link
                      </Button>
                      {isLinksLimitReached && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Limite do plano atingido
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    Configure os links do menu principal. Cada link deve ter um nome e uma URL.
                  </p>
                </div>

                {/* Mensagem de erro */}
                {linksValidationError && (
                  <div className={`p-3 rounded-lg ${isLinksLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                    <div className="flex items-start gap-2">
                      {isLinksLimitReached ? (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm ${isLinksLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                        {linksValidationError}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {localLinks.map((link, index) => (
                    <div 
                      key={`link-${index}`}
                      ref={index === localLinks.length - 1 ? newLinkRef : undefined}
                      draggable
                      onDragStart={(e) => handleLinkDragStart(e, index)}
                      onDragOver={(e) => handleLinkDragOver(e, index)}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragEnd={handleLinkDragEnd}
                      onDrop={handleDrop}
                      className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                        draggingLink === index 
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
                            onDragStart={(e) => handleLinkDragStart(e, index)}
                          >
                            <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                          </div>
                          
                          {/* Indicador de posição */}
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-medium text-[var(--color-secondary)]/70">
                              {index + 1}
                            </span>
                            <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <h4 className="font-medium text-[var(--color-secondary)]">
                                {link.name || "Link sem nome"}
                              </h4>
                              {link.name && link.href ? (
                                <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                  Completo
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                  Incompleto
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Nome do Link
                                </label>
                                <Input
                                  value={link.name}
                                  onChange={(e) => updateLink(index, { name: e.target.value })}
                                  placeholder="Ex: Home"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  URL do Link
                                </label>
                                <Input
                                  value={link.href}
                                  onChange={(e) => updateLink(index, { href: e.target.value })}
                                  placeholder="Ex: /"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            onClick={() => removeLink(index)}
                            variant="danger"
                            className="whitespace-nowrap bg-red-600 hover:bg-red-700 border-none flex items-center gap-2"
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

        {/* Seção Cores */}
        <div className="space-y-4">
          <SectionHeader
            title="Cores do Tema (Aplicadas a todas as páginas)"
            section="colors"
            icon={Palette}
            isExpanded={expandedSections.colors}
            onToggle={() => toggleSection("colors")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.colors ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                    Configuração das Cores
                  </h4>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    As cores configuradas aqui serão aplicadas a todas as páginas (E-commerce, Marketing, Sobre, Cursos).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ThemePropertyInput
                    property="primary"
                    label="Cor Primária (Background)"
                    description="Cor de fundo principal para botões e elementos destacados"
                    currentHex={extractHexFromTailwind(headerData.variants.ecommerce.primary)}
                    tailwindClass={headerData.variants.ecommerce.primary}
                    onThemeChange={(prop, hex) => handleColorsChange(prop as any, hex)}
                  />

                  <ThemePropertyInput
                    property="hoverBg"
                    label="Background no Hover"
                    description="Cor de fundo quando o usuário passa o mouse"
                    currentHex={extractHexFromTailwind(headerData.variants.ecommerce.hoverBg)}
                    tailwindClass={headerData.variants.ecommerce.hoverBg}
                    onThemeChange={(prop, hex) => handleColorsChange(prop as any, hex)}
                  />

                  <ThemePropertyInput
                    property="textOnPrimary"
                    label="Texto sobre Cor Primária"
                    description="Cor do texto quando sobre fundo primário"
                    currentHex={extractHexFromTailwind(headerData.variants.ecommerce.textOnPrimary)}
                    tailwindClass={headerData.variants.ecommerce.textOnPrimary}
                    onThemeChange={(prop, hex) => handleColorsChange(prop as any, hex)}
                  />

                  <ThemePropertyInput
                    property="accentText"
                    label="Texto de Destaque"
                    description="Cor para texto destacado e links"
                    currentHex={extractHexFromTailwind(headerData.variants.ecommerce.accentText)}
                    tailwindClass={headerData.variants.ecommerce.accentText}
                    onThemeChange={(prop, hex) => handleColorsChange(prop as any, hex)}
                  />

                  <ThemePropertyInput
                    property="hoverText"
                    label="Texto no Hover"
                    description="Cor do texto quando o usuário passa o mouse"
                    currentHex={extractHexFromTailwind(headerData.variants.ecommerce.hoverText)}
                    tailwindClass={headerData.variants.ecommerce.hoverText}
                    onThemeChange={(prop, hex) => handleColorsChange(prop as any, hex)}
                  />

                  <ThemePropertyInput
                    property="border"
                    label="Cor da Borda"
                    description="Cor para bordas e separadores"
                    currentHex={extractHexFromTailwind(headerData.variants.ecommerce.border)}
                    tailwindClass={headerData.variants.ecommerce.border}
                    onThemeChange={(prop, hex) => handleColorsChange(prop as any, hex)}
                  />

                  <ThemePropertyInput
                    property="glow"
                    label="Efeito Glow (Sombra)"
                    description="Cor da sombra para efeitos de destaque"
                    currentHex={extractHexFromTailwind(headerData.variants.ecommerce.glow)}
                    tailwindClass={headerData.variants.ecommerce.glow}
                    onThemeChange={(prop, hex) => handleColorsChange(prop as any, hex)}
                  />

                  <ThemePropertyInput
                    property="underline"
                    label="Sublinhado"
                    description="Cor para sublinhados e destaques lineares"
                    currentHex={extractHexFromTailwind(headerData.variants.ecommerce.underline)}
                    tailwindClass={headerData.variants.ecommerce.underline}
                    onThemeChange={(prop, hex) => handleColorsChange(prop as any, hex)}
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
          itemName="Header"
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
        itemName="Configuração do Header"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}