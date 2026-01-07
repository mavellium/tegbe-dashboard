/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { ImageUpload } from "@/components/ImageUpload";
import { Palette, Layout, Settings, Link as LinkIcon, Mail, FileText, BarChart, Trophy } from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { extractHexFromTailwind, hexToTailwindClass } from "@/lib/colorUtils";
import Loading from "@/components/Loading";

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

interface StatsItem {
  val: string;
  label: string;
}

interface FooterConfig {
  badgeImage: string;
  badgeTitle: string;
  badgeDesc: string;
  stats1: StatsItem;
  stats2: StatsItem;
  columnTitle: string;
  links: string[];
  email: string;
  desc: string;
}

interface FooterData {
  id?: string;
  theme: ThemeColors;
  configs: FooterConfig;
}

const defaultFooterData: FooterData = {
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
    badgeImage: "",
    badgeTitle: "Consultoria Certificada",
    badgeDesc: "Selo oficial de qualidade e segurança Mercado Livre.",
    stats1: { val: "+100M", label: "Gerenciados" },
    stats2: { val: "Top 1%", label: "Performance" },
    columnTitle: "Expertise",
    links: ["Gestão Full Commerce", "Consultoria Oficial", "Ads & Performance", "Design & Branding"],
    email: "contato@tegbe.com.br",
    desc: "Aceleradora de E-commerce. Transformamos operação técnica em lucro real através de dados e estratégia."
  }
};

const mergeWithDefaults = (apiData: any): FooterData => {
  if (!apiData) return defaultFooterData;
  
  return {
    id: apiData.id,
    theme: {
      primary: apiData.theme?.primary || defaultFooterData.theme.primary,
      hoverBg: apiData.theme?.hoverBg || defaultFooterData.theme.hoverBg,
      textOnPrimary: apiData.theme?.textOnPrimary || defaultFooterData.theme.textOnPrimary,
      accentText: apiData.theme?.accentText || defaultFooterData.theme.accentText,
      hoverText: apiData.theme?.hoverText || defaultFooterData.theme.hoverText,
      border: apiData.theme?.border || defaultFooterData.theme.border,
      glow: apiData.theme?.glow || defaultFooterData.theme.glow,
      underline: apiData.theme?.underline || defaultFooterData.theme.underline,
    },
    configs: {
      badgeImage: apiData.configs?.badgeImage || defaultFooterData.configs.badgeImage,
      badgeTitle: apiData.configs?.badgeTitle || defaultFooterData.configs.badgeTitle,
      badgeDesc: apiData.configs?.badgeDesc || defaultFooterData.configs.badgeDesc,
      stats1: {
        val: apiData.configs?.stats1?.val || defaultFooterData.configs.stats1.val,
        label: apiData.configs?.stats1?.label || defaultFooterData.configs.stats1.label,
      },
      stats2: {
        val: apiData.configs?.stats2?.val || defaultFooterData.configs.stats2.val,
        label: apiData.configs?.stats2?.label || defaultFooterData.configs.stats2.label,
      },
      columnTitle: apiData.configs?.columnTitle || defaultFooterData.configs.columnTitle,
      links: apiData.configs?.links || defaultFooterData.configs.links,
      email: apiData.configs?.email || defaultFooterData.configs.email,
      desc: apiData.configs?.desc || defaultFooterData.configs.desc,
    }
  };
};

export const FooterPageComponent: React.FC = () => {
  const [footerData, setFooterData] = useState<FooterData>(defaultFooterData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    theme: true,
    configs: false,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "single" as "single" | "all",
    title: "",
  });
  const [badgeImageFile, setBadgeImageFile] = useState<File | null>(null);

  const apiBase = "/api/tegbe-institucional/json";
  const type = "footer";

  const completeCount = 8;
  const totalCount = 8;
  const exists = !!footerData.id;
  const canAddNewItem = true;
  const isLimitReached = false;

  const fetchExistingData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/${type}`);

      if (res.ok) {
        const data = await res.json();
        console.log("Dados recebidos da API:", data);
        
        if (data) {
          const mergedData = mergeWithDefaults(data);
          setFooterData(mergedData);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
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
    setFooterData(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [property]: tailwindClass
      }
    }));
  };

  const handleConfigChange = (path: string, value: any) => {
    const keys = path.split('.');
    setFooterData(prev => {
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

  const handleLinksChange = (index: number, value: string) => {
    const newLinks = [...footerData.configs.links];
    newLinks[index] = value;
    handleConfigChange('configs.links', newLinks);
  };

  const handleAddLink = () => {
    const newLinks = [...footerData.configs.links, ""];
    handleConfigChange('configs.links', newLinks);
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = footerData.configs.links.filter((_, i) => i !== index);
    handleConfigChange('configs.links', newLinks);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const dataToSend = { ...footerData };
      const fd = new FormData();

      fd.append("values", JSON.stringify(dataToSend));

      if (badgeImageFile) {
        fd.append('file:configs.badgeImage', badgeImageFile);
      }

      const method = dataToSend.id ? "PUT" : "POST";

      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao salvar configurações do footer");
      }

      const saved = await res.json();
      console.log("Dados salvos:", saved);
      
      if (saved) {
        const mergedData = mergeWithDefaults(saved);
        setFooterData(mergedData);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erro ao salvar");
    } finally {
      setLoading(false);
      setBadgeImageFile(null);
    }
  };

  const handleSubmitWrapper = () => {
    handleSubmit();
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODAS AS CONFIGURAÇÕES DO FOOTER",
    });
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`${apiBase}/${type}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFooterData(defaultFooterData);
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
      title="Personalização do Footer"
      description="Configure o tema, cores e conteúdo do rodapé do site"
      exists={exists}
      itemName="Footer Theme"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        <div className="space-y-4">
          <SectionHeader
            title="Tema Principal do Footer"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ThemePropertyInput
                    property="primary"
                    label="Cor Primária (Background)"
                    description="Cor de fundo principal para botões e elementos destacados"
                    currentHex={extractHexFromTailwind(footerData.theme.primary)}
                    tailwindClass={footerData.theme.primary}
                    onThemeChange={(prop, hex) => handleThemeChange(prop, hex)}
                  />

                  <ThemePropertyInput
                    property="hoverBg"
                    label="Background no Hover"
                    description="Cor de fundo quando o usuário passa o mouse"
                    currentHex={extractHexFromTailwind(footerData.theme.hoverBg)}
                    tailwindClass={footerData.theme.hoverBg}
                    onThemeChange={(prop, hex) => handleThemeChange(prop, hex)}
                  />

                  <ThemePropertyInput
                    property="textOnPrimary"
                    label="Texto sobre Cor Primária"
                    description="Cor do texto quando sobre fundo primário"
                    currentHex={extractHexFromTailwind(footerData.theme.textOnPrimary)}
                    tailwindClass={footerData.theme.textOnPrimary}
                    onThemeChange={(prop, hex) => handleThemeChange(prop, hex)}
                  />

                  <ThemePropertyInput
                    property="accentText"
                    label="Texto de Destaque"
                    description="Cor para texto destacado e links"
                    currentHex={extractHexFromTailwind(footerData.theme.accentText)}
                    tailwindClass={footerData.theme.accentText}
                    onThemeChange={(prop, hex) => handleThemeChange(prop, hex)}
                  />

                  <ThemePropertyInput
                    property="hoverText"
                    label="Texto no Hover"
                    description="Cor do texto quando o usuário passa o mouse"
                    currentHex={extractHexFromTailwind(footerData.theme.hoverText)}
                    tailwindClass={footerData.theme.hoverText}
                    onThemeChange={(prop, hex) => handleThemeChange(prop, hex)}
                  />

                  <ThemePropertyInput
                    property="border"
                    label="Cor da Borda"
                    description="Cor para bordas e separadores"
                    currentHex={extractHexFromTailwind(footerData.theme.border)}
                    tailwindClass={footerData.theme.border}
                    onThemeChange={(prop, hex) => handleThemeChange(prop, hex)}
                  />

                  <ThemePropertyInput
                    property="glow"
                    label="Efeito Glow (Sombra)"
                    description="Cor da sombra para efeitos de destaque"
                    currentHex={extractHexFromTailwind(footerData.theme.glow)}
                    tailwindClass={footerData.theme.glow}
                    onThemeChange={(prop, hex) => handleThemeChange(prop, hex)}
                  />

                  <ThemePropertyInput
                    property="underline"
                    label="Sublinhado"
                    description="Cor para sublinhados e destaques lineares"
                    currentHex={extractHexFromTailwind(footerData.theme.underline)}
                    tailwindClass={footerData.theme.underline}
                    onThemeChange={(prop, hex) => handleThemeChange(prop, hex)}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-4">
          <SectionHeader
            title="Configurações de Conteúdo"
            section="configs"
            icon={Settings}
            isExpanded={expandedSections.configs}
            onToggle={() => toggleSection("configs")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.configs ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Badge de Consultoria
                  </h3>
                  
                  <ImageUpload
                    label="Imagem do Badge"
                    currentImage={footerData.configs.badgeImage}
                    selectedFile={badgeImageFile}
                    onFileChange={setBadgeImageFile}
                    aspectRatio="aspect-square"
                  />

                  <Input
                    label="Título do Badge"
                    value={footerData.configs.badgeTitle}
                    onChange={(e) => handleConfigChange('configs.badgeTitle', e.target.value)}
                    placeholder="Ex: Consultoria Certificada"
                  />

                  <TextArea
                    label="Descrição do Badge"
                    value={footerData.configs.badgeDesc}
                    onChange={(e) => handleConfigChange('configs.badgeDesc', e.target.value)}
                    placeholder="Ex: Selo oficial de qualidade e segurança Mercado Livre."
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <BarChart className="w-5 h-5" />
                    Estatísticas
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Estatística 1
                      </label>
                      <Input
                        label="Valor"
                        value={footerData.configs.stats1.val}
                        onChange={(e) => handleConfigChange('configs.stats1.val', e.target.value)}
                        placeholder="Ex: +100M"
                      />
                      <Input
                        label="Rótulo"
                        value={footerData.configs.stats1.label}
                        onChange={(e) => handleConfigChange('configs.stats1.label', e.target.value)}
                        placeholder="Ex: Gerenciados"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Estatística 2
                      </label>
                      <Input
                        label="Valor"
                        value={footerData.configs.stats2.val}
                        onChange={(e) => handleConfigChange('configs.stats2.val', e.target.value)}
                        placeholder="Ex: Top 1%"
                      />
                      <Input
                        label="Rótulo"
                        value={footerData.configs.stats2.label}
                        onChange={(e) => handleConfigChange('configs.stats2.label', e.target.value)}
                        placeholder="Ex: Performance"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Coluna de Expertise
                  </h3>
                  
                  <Input
                    label="Título da Coluna"
                    value={footerData.configs.columnTitle}
                    onChange={(e) => handleConfigChange('configs.columnTitle', e.target.value)}
                    placeholder="Ex: Expertise"
                  />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Links da Coluna
                      </label>
                      <button
                        type="button"
                        onClick={handleAddLink}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Adicionar Link
                      </button>
                    </div>
                    
                    {footerData.configs.links.map((link, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <LinkIcon className="w-4 h-4 text-zinc-500" />
                        <Input
                          value={link}
                          onChange={(e) => handleLinksChange(index, e.target.value)}
                          placeholder="Ex: Gestão Full Commerce"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(index)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Informações de Contato
                  </h3>
                  
                  <Input
                    label="Email de Contato"
                    type="email"
                    value={footerData.configs.email}
                    onChange={(e) => handleConfigChange('configs.email', e.target.value)}
                    placeholder="Ex: contato@tegbe.com.br"
                  />

                  <TextArea
                    label="Descrição da Empresa"
                    value={footerData.configs.desc}
                    onChange={(e) => handleConfigChange('configs.desc', e.target.value)}
                    placeholder="Ex: Aceleradora de E-commerce. Transformamos operação técnica em lucro real através de dados e estratégia."
                    rows={4}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmitWrapper}
          isAddDisabled={!canAddNewItem || isLimitReached}
          isSaving={loading}
          exists={exists}
          completeCount={completeCount}
          totalCount={totalCount}
          itemName="Footer Theme"
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
        itemName="Footer Theme"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
};