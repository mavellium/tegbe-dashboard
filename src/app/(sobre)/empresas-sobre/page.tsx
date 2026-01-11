/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { TextArea } from "@/components/TextArea";
import IconSelector from "@/components/IconSelector";
import { 
  ShieldCheck,
  Crown,
  Plus,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  Settings
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ImageUpload } from "@/components/ImageUpload";

interface LogoItem {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface LogoRow {
  row1: LogoItem[];
  row2: LogoItem[];
}

interface Badge {
  text: string;
  icon: string;
}

interface Stats {
  label: string;
  description: string;
  icon: string;
}

interface Footer {
  label: string;
  linkText: string;
}

interface MarketingData {
  badge: Badge;
  title: string;
  footer: string;
  layout: "marquee" | "grid" | "carousel";
  logos: LogoRow;
}

interface SobreData {
  badge: Badge;
  title: string;
  subtitle: string;
  layout: "bento-grid" | "grid" | "carousel";
  stats: Stats;
  footer: Footer;
}

interface EcosystemData {
  marketing: MarketingData;
  sobre: SobreData;
}

const defaultEcosystemData: EcosystemData = {
  marketing: {
    badge: {
      text: "Ecossistema Validado",
      icon: "mdi:shield-check"
    },
    title: "Não testamos com o seu dinheiro. <br/><span class='text-transparent bg-clip-text bg-gradient-to-r from-[#FF0F43] to-[#E31B63]'>Validamos com o deles.</span>",
    footer: "Empresas que escalaram acima de 7 dígitos/ano",
    layout: "marquee",
    logos: {
      row1: [],
      row2: []
    }
  },
  sobre: {
    badge: {
      text: "Hall de Clientes",
      icon: "ph:crown-simple-bold"
    },
    title: "Onde os gigantes <br/>escolhem escalar.",
    subtitle: "Não colecionamos logos. Colecionamos cases de expansão de market share.",
    layout: "bento-grid",
    stats: {
      label: "Volume Tracionado",
      description: "Soma do faturamento gerado sob nossa gestão direta nos últimos 12 meses.",
      icon: "ph:trend-up-bold"
    },
    footer: {
      label: "Ecossistema Validado",
      linkText: "Ver todos os cases"
    }
  }
};

const layoutOptions = [
  { value: "marquee", label: "Marquee (Rolagem)" },
  { value: "grid", label: "Grid (Grade)" },
  { value: "carousel", label: "Carrossel" },
  { value: "bento-grid", label: "Bento Grid" }
];

const mergeWithDefaults = (apiData: any, defaultData: EcosystemData): EcosystemData => {
  if (!apiData) return defaultData;
  
  return {
    marketing: {
      badge: {
        text: apiData.marketing?.badge?.text || defaultData.marketing.badge.text,
        icon: apiData.marketing?.badge?.icon || defaultData.marketing.badge.icon
      },
      title: apiData.marketing?.title || defaultData.marketing.title,
      footer: apiData.marketing?.footer || defaultData.marketing.footer,
      layout: apiData.marketing?.layout || defaultData.marketing.layout,
      logos: {
        row1: apiData.marketing?.logos?.row1 || defaultData.marketing.logos.row1,
        row2: apiData.marketing?.logos?.row2 || defaultData.marketing.logos.row2
      }
    },
    sobre: {
      badge: {
        text: apiData.sobre?.badge?.text || defaultData.sobre.badge.text,
        icon: apiData.sobre?.badge?.icon || defaultData.sobre.badge.icon
      },
      title: apiData.sobre?.title || defaultData.sobre.title,
      subtitle: apiData.sobre?.subtitle || defaultData.sobre.subtitle,
      layout: apiData.sobre?.layout || defaultData.sobre.layout,
      stats: {
        label: apiData.sobre?.stats?.label || defaultData.sobre.stats.label,
        description: apiData.sobre?.stats?.description || defaultData.sobre.stats.description,
        icon: apiData.sobre?.stats?.icon || defaultData.sobre.stats.icon
      },
      footer: {
        label: apiData.sobre?.footer?.label || defaultData.sobre.footer.label,
        linkText: apiData.sobre?.footer?.linkText || defaultData.sobre.footer.linkText
      }
    }
  };
};

export default function EcosystemPage() {
  const {
    data: ecosystemData,
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
    fileStates,
    setFileState,
  } = useJsonManagement<EcosystemData>({
    apiPath: "/api/tegbe-institucional/json/empresas",
    defaultData: defaultEcosystemData,
    mergeFunction: mergeWithDefaults,
  });

  const [expandedSections, setExpandedSections] = useState({
    marketing: false,
    sobre: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSectionChange = (section: "marketing" | "sobre", path: string, value: any) => {
    updateNested(`${section}.${path}`, value);
  };

  const handleLogoChange = (
    section: "marketing",
    row: "row1" | "row2",
    index: number,
    field: keyof LogoItem,
    value: any
  ) => {
    updateNested(`${section}.logos.${row}.${index}.${field}`, value);
  };

  const addLogo = (section: "marketing", row: "row1" | "row2") => {
    const currentLogos = [...ecosystemData[section].logos[row]];
    const newLogo: LogoItem = {
      src: "",
      alt: `Cliente ${currentLogos.length + 1}`,
      width: 120,
      height: 40
    };

    updateNested(`${section}.logos.${row}`, [...currentLogos, newLogo]);
  };

  const removeLogo = (section: "marketing", row: "row1" | "row2", index: number) => {
    const currentLogos = [...ecosystemData[section].logos[row]];
    currentLogos.splice(index, 1);
    updateNested(`${section}.logos.${row}`, currentLogos);
    
    // Limpar arquivo do estado
    const fileKey = `${section}.logos.${row}.${index}.src`;
    if (fileStates[fileKey]) {
      setFileState(fileKey, null);
    }
  };

  const getFileFromState = (key: string): File | null => {
    const value = fileStates[key];
    return value instanceof File ? value : null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Seção Marketing
    const marketing = ecosystemData.marketing;
    total += 4; // badge.text, badge.icon, title, footer
    if (marketing.badge.text.trim()) completed++;
    if (marketing.badge.icon.trim()) completed++;
    if (marketing.title.trim()) completed++;
    if (marketing.footer.trim()) completed++;

    // Logos Marketing - Row 1
    total += marketing.logos.row1.length * 3; // src, alt, width/height
    marketing.logos.row1.forEach(logo => {
      if (logo.src.trim()) completed++;
      if (logo.alt.trim()) completed++;
      if (logo.width && logo.height) completed++;
    });

    // Logos Marketing - Row 2
    total += marketing.logos.row2.length * 3;
    marketing.logos.row2.forEach(logo => {
      if (logo.src.trim()) completed++;
      if (logo.alt.trim()) completed++;
      if (logo.width && logo.height) completed++;
    });

    // Seção Sobre
    const sobre = ecosystemData.sobre;
    total += 8; // badge.text, badge.icon, title, subtitle, layout, stats.label, stats.icon, footer.label, footer.linkText
    if (sobre.badge.text.trim()) completed++;
    if (sobre.badge.icon.trim()) completed++;
    if (sobre.title.trim()) completed++;
    if (sobre.subtitle.trim()) completed++;
    if (sobre.layout) completed++;
    if (sobre.stats.label.trim()) completed++;
    if (sobre.stats.icon.trim()) completed++;
    if (sobre.footer.label.trim()) completed++;
    if (sobre.footer.linkText.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Settings} exists={!!exists} />;
  }

  const renderLogoItemEditor = (logo: LogoItem, index: number, row: "row1" | "row2", section: "marketing") => {
    const fileKey = `${section}.logos.${row}.${index}.src`;
    const selectedFile = getFileFromState(fileKey);

    return (
      <Card className="p-4 border border-[var(--color-border)]" key={index}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-12 flex items-center justify-center bg-[var(--color-background-body)] rounded border border-[var(--color-border)]">
              {logo.src || selectedFile ? (
                <div className="w-full h-full flex items-center justify-center bg-[var(--color-background-body)]">
                  <div className="text-xs text-[var(--color-secondary)]/50 text-center">
                    Logo {index + 1}
                  </div>
                </div>
              ) : (
                <ImageIcon className="w-6 h-6 text-[var(--color-secondary)]/50" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-[var(--color-secondary)]">
                Logo {index + 1}
              </h4>
              <p className="text-sm text-[var(--color-secondary)]/70">
                {logo.alt || "Sem descrição"}
              </p>
            </div>
          </div>
          
          <Button
            type="button"
            variant="danger"
            onClick={() => removeLogo(section, row, index)}
            className="bg-red-600 hover:bg-red-700 border-none"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Upload da Logo */}
          <div className="md:col-span-1">
            <ImageUpload
              label="Imagem da Logo"
              currentImage={logo.src}
              selectedFile={selectedFile}
              onFileChange={(file) => setFileState(fileKey, file)}
              aspectRatio="aspect-[3/2]"
              previewWidth={120}
              previewHeight={80}
              description="Faça upload da logo do cliente"
            />
          </div>

          {/* Campos da Logo */}
          <div className="md:col-span-2 space-y-4">
            <Input
              label="Texto Alt (acessibilidade)"
              value={logo.alt}
              onChange={(e) => handleLogoChange(section, row, index, "alt", e.target.value)}
              placeholder="Ex: Nome da Empresa"
              className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Largura (px)"
                type="number"
                value={logo.width.toString()}
                onChange={(e) => handleLogoChange(section, row, index, "width", parseInt(e.target.value) || 120)}
                placeholder="120"
                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
              />

              <Input
                label="Altura (px)"
                type="number"
                value={logo.height.toString()}
                onChange={(e) => handleLogoChange(section, row, index, "height", parseInt(e.target.value) || 40)}
                placeholder="40"
                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
              />
            </div>

            <Input
              label="URL da Logo (alternativa)"
              value={logo.src}
              onChange={(e) => handleLogoChange(section, row, index, "src", e.target.value)}
              placeholder="/logos/logo1.svg"
              className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
            />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <ManageLayout
      headerIcon={ShieldCheck}
      title="Ecossistema Validado"
      description="Gerencie os logos de clientes e configurações das seções Marketing e Sobre"
      exists={!!exists}
      itemName="Configuração de Ecossistema"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Marketing */}
        <div className="space-y-4">
          <SectionHeader
            title="Ecossistema Validado - Marketing"
            section="marketing"
            icon={ShieldCheck}
            isExpanded={expandedSections.marketing}
            onToggle={() => toggleSection("marketing")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.marketing ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-6">
              {/* Badge e Título */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Texto do Badge"
                  value={ecosystemData.marketing.badge.text}
                  onChange={(e) => handleSectionChange("marketing", "badge.text", e.target.value)}
                  placeholder="Ex: Ecossistema Validado"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Ícone do Badge
                  </label>
                  <IconSelector
                    value={ecosystemData.marketing.badge.icon}
                    onChange={(value) => handleSectionChange("marketing", "badge.icon", value)}
                    placeholder="Selecione um ícone"
                  />
                </div>
              </div>

              {/* Título com HTML */}
              <div>
                <TextArea
                  label="Título (HTML permitido)"
                  value={ecosystemData.marketing.title}
                  onChange={(e) => handleSectionChange("marketing", "title", e.target.value)}
                  placeholder="Não testamos com o seu dinheiro. <br/><span class='text-transparent bg-clip-text bg-gradient-to-r from-[#FF0F43] to-[#E31B63]'>Validamos com o deles.</span>"
                  rows={3}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <p className="text-xs text-[var(--color-secondary)]/50 mt-1">
                  Use HTML para estilização, como spans com classes de gradiente
                </p>
              </div>

              {/* Footer e Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Texto do Footer"
                  value={ecosystemData.marketing.footer}
                  onChange={(e) => handleSectionChange("marketing", "footer", e.target.value)}
                  placeholder="Ex: Empresas que escalaram acima de 7 dígitos/ano"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Layout de Exibição
                  </label>
                  <select
                    value={ecosystemData.marketing.layout}
                    onChange={(e) => handleSectionChange("marketing", "layout", e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--color-background-body)] text-[var(--color-secondary)]"
                  >
                    {layoutOptions.filter(opt => opt.value !== "bento-grid").map((layout) => (
                      <option key={layout.value} value={layout.value}>
                        {layout.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Logos - Row 1 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      Logos - Linha 1
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {ecosystemData.marketing.logos.row1.filter(logo => logo.src && logo.alt).length} de {ecosystemData.marketing.logos.row1.length} completos
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => addLogo("marketing", "row1")}
                    variant="primary"
                    className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Logo
                  </Button>
                </div>

                {ecosystemData.marketing.logos.row1.length === 0 ? (
                  <Card className="p-8 text-center border border-[var(--color-border)]">
                    <ImageIcon className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                      Nenhum logo adicionado
                    </h4>
                    <p className="text-[var(--color-secondary)]/70 mb-4">
                      Comece adicionando os primeiros logos de clientes
                    </p>
                    <Button
                      type="button"
                      onClick={() => addLogo("marketing", "row1")}
                      variant="primary"
                      className="flex items-center gap-2 mx-auto bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Primeiro Logo
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {ecosystemData.marketing.logos.row1.map((logo, index) => 
                      renderLogoItemEditor(logo, index, "row1", "marketing")
                    )}
                  </div>
                )}
              </div>

              {/* Logos - Row 2 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      Logos - Linha 2
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {ecosystemData.marketing.logos.row2.filter(logo => logo.src && logo.alt).length} de {ecosystemData.marketing.logos.row2.length} completos
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => addLogo("marketing", "row2")}
                    variant="primary"
                    className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Logo
                  </Button>
                </div>

                {ecosystemData.marketing.logos.row2.length === 0 ? (
                  <Card className="p-8 text-center border border-[var(--color-border)]">
                    <ImageIcon className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                      Nenhum logo adicionado
                    </h4>
                    <p className="text-[var(--color-secondary)]/70 mb-4">
                      Adicione logos para a segunda linha
                    </p>
                    <Button
                      type="button"
                      onClick={() => addLogo("marketing", "row2")}
                      variant="primary"
                      className="flex items-center gap-2 mx-auto bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Primeiro Logo
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {ecosystemData.marketing.logos.row2.map((logo, index) => 
                      renderLogoItemEditor(logo, index, "row2", "marketing")
                    )}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Sobre */}
        <div className="space-y-4">
          <SectionHeader
            title="Hall de Clientes - Sobre"
            section="sobre"
            icon={Crown}
            isExpanded={expandedSections.sobre}
            onToggle={() => toggleSection("sobre")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.sobre ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-6">
              {/* Badge e Título */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Texto do Badge"
                  value={ecosystemData.sobre.badge.text}
                  onChange={(e) => handleSectionChange("sobre", "badge.text", e.target.value)}
                  placeholder="Ex: Hall de Clientes"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Ícone do Badge
                  </label>
                  <IconSelector
                    value={ecosystemData.sobre.badge.icon}
                    onChange={(value) => handleSectionChange("sobre", "badge.icon", value)}
                    placeholder="Selecione um ícone"
                  />
                </div>
              </div>

              {/* Título e Subtítulo */}
              <div className="space-y-4">
                <TextArea
                  label="Título (HTML permitido)"
                  value={ecosystemData.sobre.title}
                  onChange={(e) => handleSectionChange("sobre", "title", e.target.value)}
                  placeholder="Onde os gigantes <br/>escolhem escalar."
                  rows={2}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <Input
                  label="Subtítulo"
                  value={ecosystemData.sobre.subtitle}
                  onChange={(e) => handleSectionChange("sobre", "subtitle", e.target.value)}
                  placeholder="Não colecionamos logos. Colecionamos cases de expansão de market share."
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>

              {/* Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Layout de Exibição
                  </label>
                  <select
                    value={ecosystemData.sobre.layout}
                    onChange={(e) => handleSectionChange("sobre", "layout", e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--color-background-body)] text-[var(--color-secondary)]"
                  >
                    {layoutOptions.map((layout) => (
                      <option key={layout.value} value={layout.value}>
                        {layout.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="space-y-4 p-4 border border-[var(--color-border)] rounded-lg">
                <h4 className="font-medium text-[var(--color-secondary)]">
                  Estatísticas
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Rótulo"
                    value={ecosystemData.sobre.stats.label}
                    onChange={(e) => handleSectionChange("sobre", "stats.label", e.target.value)}
                    placeholder="Ex: Volume Tracionado"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                      Ícone da Estatística
                    </label>
                    <IconSelector
                      value={ecosystemData.sobre.stats.icon}
                      onChange={(value) => handleSectionChange("sobre", "stats.icon", value)}
                      placeholder="ph:trend-up-bold"
                    />
                  </div>
                </div>

                <TextArea
                  label="Descrição"
                  value={ecosystemData.sobre.stats.description}
                  onChange={(e) => handleSectionChange("sobre", "stats.description", e.target.value)}
                  rows={2}
                  placeholder="Soma do faturamento gerado sob nossa gestão direta nos últimos 12 meses."
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>

              {/* Footer */}
              <div className="space-y-4 p-4 border border-[var(--color-border)] rounded-lg">
                <h4 className="font-medium text-[var(--color-secondary)]">
                  Rodapé
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Rótulo"
                    value={ecosystemData.sobre.footer.label}
                    onChange={(e) => handleSectionChange("sobre", "footer.label", e.target.value)}
                    placeholder="Ex: Ecossistema Validado"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Texto do Link"
                    value={ecosystemData.sobre.footer.linkText}
                    onChange={(e) => handleSectionChange("sobre", "footer.linkText", e.target.value)}
                    placeholder="Ex: Ver todos os cases"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
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
          itemName="Seção"
          icon={ShieldCheck}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={2}
        itemName="Configuração de Ecossistema"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}