/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { ImageUpload } from "@/components/ImageUpload";
import { Palette, Layout, Settings, Image as ImageIcon, Tag, Link as LinkIcon } from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { extractHexFromTailwind, hexToTailwindClass } from "@/lib/colorUtils";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";

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
    }
  };
};

export const HeaderThemePageComponent: React.FC = () => {
  const {
    data: headerData,
    setData: setHeaderData,
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

  const [expandedSections, setExpandedSections] = useState({
    general: true,
    links: false,
    colors: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const completeCount = 5 + headerData.links.length * 2 + 8;
  const totalCount = 5 + 10 * 2 + 8;
  const canAddNewItem = true;
  const isLimitReached = false;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await save();
    } catch (err) {
      // Erro já tratado no hook
    }
  };

  // Função para alterar uma propriedade de cor em TODAS as variantes
  const handleColorsChange = (property: keyof VariantTheme, hexColor: string) => {
    const tailwindClass = hexToTailwindClass(property as any, hexColor);
    
    // Atualizar todas as variantes com a mesma cor
    const updatedVariants = { ...headerData.variants };
    
    (Object.keys(updatedVariants) as Array<keyof typeof updatedVariants>).forEach((variant) => {
      updatedVariants[variant] = {
        ...updatedVariants[variant],
        [property]: tailwindClass
      };
    });

    // Atualizar o estado
    updateNested('variants', updatedVariants);
  };

  // Funções para gerenciar links
  const handleLinkChange = (index: number, field: 'name' | 'href', value: string) => {
    const newLinks = [...headerData.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    updateNested('links', newLinks);
  };

  const handleAddLink = () => {
    const newLinks = [...headerData.links, { name: "", href: "" }];
    updateNested('links', newLinks);
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = headerData.links.filter((_, i) => i !== index);
    updateNested('links', newLinks);
  };

  if (loading && !exists) {
    return (
      <Loading layout={Layout} exists={!!exists}></Loading>
    );
  }

  return (
    <ManageLayout
      headerIcon={Layout}
      title="Personalização do Header"
      description="Configure o header do site incluindo logo, links e cores"
      exists={!!exists}
      itemName="Header"
    >
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6 pb-32">
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
            <Card className="p-6">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Logos
                  </h3>
                  
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
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Call to Action (CTA)
                  </h3>
                  
                  <Input
                    label="Link do CTA"
                    value={headerData.general.ctaLink}
                    onChange={(e) => updateNested('general.ctaLink', e.target.value)}
                    placeholder="Ex: https://api.whatsapp.com/send?phone=5514991779502"
                  />

                  <Input
                    label="Texto do CTA"
                    value={headerData.general.ctaText}
                    onChange={(e) => updateNested('general.ctaText', e.target.value)}
                    placeholder="Ex: Agendar agora"
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
            <Card className="p-6">
              <div className="space-y-6">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                    Menu de Navegação
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Configure os links do menu principal. Cada link deve ter um nome e uma URL.
                  </p>
                </div>

                <div className="space-y-4">
                  {headerData.links.map((link, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                      <div className="flex-1 space-y-3">
                        <Input
                          label="Nome do Link"
                          value={link.name}
                          onChange={(e) => handleLinkChange(index, 'name', e.target.value)}
                          placeholder="Ex: Home"
                        />
                        <Input
                          label="URL do Link"
                          value={link.href}
                          onChange={(e) => handleLinkChange(index, 'href', e.target.value)}
                          placeholder="Ex: /"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(index)}
                        className="mt-6 px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors h-fit"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="w-full py-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                  >
                    + Adicionar Novo Link
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Cores Única */}
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
            <Card className="p-6">
              <div className="space-y-6">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                    Configuração das Cores
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
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
          isAddDisabled={!canAddNewItem || isLimitReached}
          isSaving={loading}
          exists={!!exists}
          completeCount={completeCount}
          totalCount={totalCount}
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
        itemName="Header"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
};