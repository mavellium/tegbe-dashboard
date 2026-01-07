/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { ImageUpload } from "@/components/ImageUpload";
import { Palette, Layout, Settings, Globe, Image as ImageIcon, FileText, Tag } from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { extractHexFromTailwind, hexToTailwindClass } from "@/lib/colorUtils";
import Loading from "@/components/Loading";

// Tipos
interface ThemeColors {
  primary: string;
  hoverBg: string;
  textOnPrimary: string;
  accentText: string;
  hoverText: string;
  border: string;
  glow: string;
  underline: string;
}

interface Configs {
  logo: string;
  favicon: string;
  siteTitle: string;
  siteDescription: string;
}

interface HeaderData {
  id?: string;
  theme: ThemeColors;
  configs: Configs;
}

const defaultHeaderData: HeaderData = {
  theme: {
    primary: "bg-[#FFCC00]",
    hoverBg: "hover:bg-[#FFDB15]",
    textOnPrimary: "text-black",
    accentText: "text-[#FFCC00]",
    hoverText: "group-hover:text-[#FFCC00]",
    border: "border-yellow-500/30",
    glow: "shadow-[0_0_20px_rgba(255,204,0,0.4)]",
    underline: "bg-[#FFCC00]"
  },
  configs: {
    logo: "",
    favicon: "",
    siteTitle: "Tegbe - Aceleradora de E-commerce",
    siteDescription: "Transformamos operação técnica em lucro real através de dados e estratégia."
  }
};

// Função para mesclar dados com padrão
const mergeWithDefaults = (apiData: any): HeaderData => {
  if (!apiData) return defaultHeaderData;
  
  return {
    id: apiData.id,
    theme: {
      primary: apiData.theme?.primary || defaultHeaderData.theme.primary,
      hoverBg: apiData.theme?.hoverBg || defaultHeaderData.theme.hoverBg,
      textOnPrimary: apiData.theme?.textOnPrimary || defaultHeaderData.theme.textOnPrimary,
      accentText: apiData.theme?.accentText || defaultHeaderData.theme.accentText,
      hoverText: apiData.theme?.hoverText || defaultHeaderData.theme.hoverText,
      border: apiData.theme?.border || defaultHeaderData.theme.border,
      glow: apiData.theme?.glow || defaultHeaderData.theme.glow,
      underline: apiData.theme?.underline || defaultHeaderData.theme.underline,
    },
    configs: {
      logo: apiData.configs?.logo || defaultHeaderData.configs.logo,
      favicon: apiData.configs?.favicon || defaultHeaderData.configs.favicon,
      siteTitle: apiData.configs?.siteTitle || defaultHeaderData.configs.siteTitle,
      siteDescription: apiData.configs?.siteDescription || defaultHeaderData.configs.siteDescription,
    }
  };
};

export const HeaderThemePageComponent: React.FC = () => {
  const [headerData, setHeaderData] = useState<HeaderData>(defaultHeaderData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    siteConfig: true,
    theme: false,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "single" as "single" | "all",
    title: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  const apiBase = "/api/tegbe-institucional/json";
  const type = "header";

  const completeCount = 12; 
  const totalCount = 12;
  const exists = !!headerData.id;
  const canAddNewItem = true;
  const isLimitReached = false;

  const fetchExistingData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/${type}`);

      if (res.ok) {
        const data = await res.json();
        console.log("Dados recebidos da API (header):", data);
        
        if (data) {
          const mergedData = mergeWithDefaults(data);
          setHeaderData(mergedData);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados do header:", error);
      setErrorMsg("Erro ao carregar dados do servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingData();
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleThemeChange = (property: keyof ThemeColors, hexColor: string) => {
    const tailwindClass = hexToTailwindClass(property, hexColor);
    setHeaderData(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [property]: tailwindClass
      }
    }));
  };

  const handleConfigChange = (path: string, value: any) => {
    const keys = path.split('.');
    setHeaderData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const dataToSend = { ...headerData };
      const fd = new FormData();

      fd.append("values", JSON.stringify(dataToSend));

      // Adicionar arquivos de logo e favicon se existirem
      if (logoFile) {
        fd.append('file:configs.logo', logoFile);
      }

      if (faviconFile) {
        fd.append('file:configs.favicon', faviconFile);
      }

      const method = dataToSend.id ? "PUT" : "POST";

      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao salvar configurações do header");
      }

      const saved = await res.json();
      console.log("Dados salvos (header):", saved);
      
      if (saved) {
        const mergedData = mergeWithDefaults(saved);
        setHeaderData(mergedData);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erro ao salvar");
    } finally {
      setLoading(false);
      setLogoFile(null);
      setFaviconFile(null);
    }
  };

  const handleSubmitWrapper = () => {
    handleSubmit();
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODAS AS CONFIGURAÇÕES DO HEADER",
    });
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`${apiBase}/${type}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setHeaderData(defaultHeaderData);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error("Erro ao deletar");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao deletar");
    } finally {
      closeDeleteModal();
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: "single", title: "" });
  };

  if (loading && !exists) {
    return (
      <Loading layout={Layout} exists={exists}></Loading>
    );
  }

  return (
    <ManageLayout
      headerIcon={Layout}
      title="Personalização do Header"
      description="Configure o tema e configurações do cabeçalho do site"
      exists={exists}
      itemName="Header Theme"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        <div className="space-y-4">
          <SectionHeader
            title="Tema do Header"
            section="theme"
            icon={Palette}
            isExpanded={expandedSections.theme}
            onToggle={() => toggleSection("theme")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.theme ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6">
              <div className="space-y-6">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                    Cores do Header
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Selecione as cores em formato hexadecimal. O sistema converterá automaticamente para classes Tailwind.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ThemePropertyInput
                    property="primary"
                    label="Cor Primária (Background)"
                    description="Cor de fundo principal para botões e elementos destacados"
                    currentHex={extractHexFromTailwind(headerData.theme.primary)}
                    tailwindClass={headerData.theme.primary}
                    onThemeChange={(prop, hex) => handleThemeChange(prop, hex)}
                  />

                  <ThemePropertyInput
                    property="hoverBg"
                    label="Background no Hover"
                    description="Cor de fundo quando o usuário passa o mouse"
                    currentHex={extractHexFromTailwind(headerData.theme.hoverBg)}
                    tailwindClass={headerData.theme.hoverBg}
                    onThemeChange={(prop, hex) => handleThemeChange(prop, hex)}
                  />

                  <ThemePropertyInput
                    property="textOnPrimary"
                    label="Texto sobre Cor Primária"
                    description="Cor do texto quando sobre fundo primário"
                    currentHex={extractHexFromTailwind(headerData.theme.textOnPrimary)}
                    tailwindClass={headerData.theme.textOnPrimary}
                    onThemeChange={(prop, hex) => handleThemeChange(prop, hex)}
                  />

                  <ThemePropertyInput
                    property="accentText"
                    label="Texto de Destaque"
                    description="Cor para texto destacado e links"
                    currentHex={extractHexFromTailwind(headerData.theme.accentText)}
                    tailwindClass={headerData.theme.accentText}
                    onThemeChange={(prop, hex) => handleThemeChange(prop, hex)}
                  />

                  <ThemePropertyInput
                    property="hoverText"
                    label="Texto no Hover"
                    description="Cor do texto quando o usuário passa o mouse"
                    currentHex={extractHexFromTailwind(headerData.theme.hoverText)}
                    tailwindClass={headerData.theme.hoverText}
                    onThemeChange={(prop, hex) => handleThemeChange(prop, hex)}
                  />

                  <ThemePropertyInput
                    property="border"
                    label="Cor da Borda"
                    description="Cor para bordas e separadores"
                    currentHex={extractHexFromTailwind(headerData.theme.border)}
                    tailwindClass={headerData.theme.border}
                    onThemeChange={(prop, hex) => handleThemeChange(prop, hex)}
                  />

                  <ThemePropertyInput
                    property="glow"
                    label="Efeito Glow (Sombra)"
                    description="Cor da sombra para efeitos de destaque"
                    currentHex={extractHexFromTailwind(headerData.theme.glow)}
                    tailwindClass={headerData.theme.glow}
                    onThemeChange={(prop, hex) => handleThemeChange(prop, hex)}
                  />

                  <ThemePropertyInput
                    property="underline"
                    label="Sublinhado"
                    description="Cor para sublinhados e destaques lineares"
                    currentHex={extractHexFromTailwind(headerData.theme.underline)}
                    tailwindClass={headerData.theme.underline}
                    onThemeChange={(prop, hex) => handleThemeChange(prop, hex)}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-4">
          <SectionHeader
            title="Configurações do Site"
            section="siteConfig"
            icon={Settings}
            isExpanded={expandedSections.siteConfig}
            onToggle={() => toggleSection("siteConfig")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.siteConfig ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6">
              <div className="space-y-8">
                {/* Logo do Site */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Logo do Site
                  </h3>
                  
                  <ImageUpload
                    label="Logo Principal"
                    currentImage={headerData.configs.logo}
                    selectedFile={logoFile}
                    onFileChange={setLogoFile}
                    aspectRatio="aspect-[4/1]"
                  />
                </div>

                {/* Favicon */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Favicon
                  </h3>
                  
                  <ImageUpload
                    label="Favicon"
                    currentImage={headerData.configs.favicon}
                    selectedFile={faviconFile}
                    onFileChange={setFaviconFile}
                    aspectRatio="aspect-square"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Informações do Site
                  </h3>
                  
                  <Input
                    label="Título do Site"
                    value={headerData.configs.siteTitle}
                    onChange={(e) => handleConfigChange('configs.siteTitle', e.target.value)}
                    placeholder="Ex: Tegbe - Aceleradora de E-commerce"
                  />

                  <TextArea
                    label="Descrição do Site"
                    value={headerData.configs.siteDescription}
                    onChange={(e) => handleConfigChange('configs.siteDescription', e.target.value)}
                    placeholder="Ex: Transformamos operação técnica em lucro real através de dados e estratégia."
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Fixed Action Bar */}
        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmitWrapper}
          isAddDisabled={!canAddNewItem || isLimitReached}
          isSaving={loading}
          exists={exists}
          completeCount={completeCount}
          totalCount={totalCount}
          itemName="Header Theme"
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
        itemName="Header Theme"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
};