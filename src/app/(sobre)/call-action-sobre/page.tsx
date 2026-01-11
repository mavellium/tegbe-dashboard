/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Switch } from "@/components/Switch";
import { Button } from "@/components/Button";
import IconSelector from "@/components/IconSelector";
import { 
  Layers,
  Tag,
  Type,
  Zap,
  Eye,
  Layout,
  Settings,
  ChevronDown,
  ChevronUp,
  Palette,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { hexToTailwindBgClass, tailwindToHex } from "@/lib/colors";

interface BadgeData {
  text?: string;
  icon?: string | null;
  link?: string;
}

interface ButtonData {
  text?: string;
  icon?: string;
  link?: string;
}

interface FooterData {
  text?: string;
  icon?: string | null;
  stats?: string | null | Array<{ label: string; sublabel: string }>;
}

interface HeroPageData {
  badge?: BadgeData;
  title?: string;
  subtitle?: string;
  button?: ButtonData;
  footer?: FooterData;
  layout?: "simple" | "complex" | "refined";
  theme?: {
    primary_color?: string;
    secondary_color?: string;
    text_color?: string;
    background_color?: string;
    accent_color?: string;
  };
}

interface HeroData {
  ecommerce?: HeroPageData;
  marketing?: HeroPageData;
  sobre?: HeroPageData;
}

const defaultHeroPageData: HeroPageData = {
  badge: {
    text: "",
    icon: "",
    link: ""
  },
  title: "",
  subtitle: "",
  button: {
    text: "",
    icon: "",
    link: ""
  },
  footer: {
    text: "",
    icon: "",
    stats: ""
  },
  layout: "simple",
  theme: {
    primary_color: "blue-600",
    secondary_color: "gray-700",
    text_color: "gray-900",
    background_color: "white",
    accent_color: "amber-500"
  }
};

const defaultHeroData: HeroData = {
  ecommerce: {
    badge: {
      text: "O próximo passo para sua escala",
      icon: "",
      link: ""
    },
    title: "O próximo case de sucesso <br /><span class='text-yellow-500'>será o seu.</span>",
    subtitle: "Trabalhamos com um <span class='text-white'>plano de guerra</span> desenhado para sua marca dominar o mercado e vender mais junto com a Tegbe.",
    button: {
      text: "SOLICITAR MEU DIAGNÓSTICO",
      icon: "ph:arrow-right-bold",
      link: "/contato"
    },
    footer: {
      text: "Vagas limitadas para este mês",
      icon: "mdi:check-decagram",
      stats: ""
    },
    layout: "simple",
    theme: {
      primary_color: "blue-600",
      secondary_color: "gray-700",
      text_color: "gray-900",
      background_color: "white",
      accent_color: "amber-500"
    }
  },
  marketing: {
    badge: {
      text: "Próximo Passo Lógico",
      icon: "mdi:lightning-bolt",
      link: ""
    },
    title: "Sua empresa tem um teto de crescimento. <br class='hidden md:block' /> <span class='text-transparent bg-clip-text bg-gradient-to-r from-[#FF0F43] to-[#E31B63] drop-shadow-[0_0_20px_rgba(227,27,99,0.3)]'>Nós vamos quebrá-lo.</span>",
    subtitle: "Não entregamos 'tentativas'. Entregamos um <strong class='text-white'>plano de engenharia comercial</strong> desenhado para dominar seu nicho e gerar previsibilidade de caixa.",
    button: {
      text: "CONSTRUIR MINHA MÁQUINA DE VENDAS",
      icon: "lucide:arrow-right",
      link: "/contato"
    },
    footer: {
      text: "Empresas escaladas este ano",
      icon: "",
      stats: "+40"
    },
    layout: "complex",
    theme: {
      primary_color: "pink-600",
      secondary_color: "gray-800",
      text_color: "gray-100",
      background_color: "gray-900",
      accent_color: "rose-500"
    }
  },
  sobre: {
    badge: {
      text: "Agenda Q1/2026: <span class='text-[#1d1d1f] font-bold'>Últimas Vagas</span>",
      icon: "",
      link: ""
    },
    title: "Sua operação está pronta <br /> para o <span class='text-transparent bg-clip-text bg-gradient-to-r from-[#0071E3] to-blue-600'>próximo nível?</span>",
    subtitle: "Não procuramos clientes, procuramos parceiros de crescimento. Se você tem produto validado e ambição de escala, <span class='text-[#1d1d1f] font-bold'> nós temos a engenharia.</span>",
    button: {
      text: "AGENDAR SESSÃO ESTRATÉGICA",
      icon: "ph:arrow-right-bold",
      link: "/contato"
    },
    footer: {
      text: "",
      icon: "",
      stats: [
        { label: "30 Min", sublabel: "Duração da Sessão" },
        { label: "Senior", sublabel: "Especialista Real" }
      ]
    },
    layout: "refined",
    theme: {
      primary_color: "blue-700",
      secondary_color: "slate-800",
      text_color: "slate-900",
      background_color: "slate-50",
      accent_color: "blue-500"
    }
  }
};

const mergeWithDefaults = (apiData: any, defaultData: HeroData): HeroData => {
  if (!apiData) return defaultData;
  
  const mergedData: HeroData = { ...defaultData };
  
  // Mesclar cada tema individualmente
  (Object.keys(defaultData) as Array<keyof HeroData>).forEach((themeKey) => {
    if (apiData[themeKey]) {
      mergedData[themeKey] = {
        badge: {
          text: apiData[themeKey].badge?.text || defaultData[themeKey]!.badge!.text,
          icon: apiData[themeKey].badge?.icon ?? defaultData[themeKey]!.badge!.icon,
          link: apiData[themeKey].badge?.link || defaultData[themeKey]!.badge!.link,
        },
        title: apiData[themeKey].title || defaultData[themeKey]!.title,
        subtitle: apiData[themeKey].subtitle || defaultData[themeKey]!.subtitle,
        button: {
          text: apiData[themeKey].button?.text || defaultData[themeKey]!.button!.text,
          icon: apiData[themeKey].button?.icon || defaultData[themeKey]!.button!.icon,
          link: apiData[themeKey].button?.link || defaultData[themeKey]!.button!.link,
        },
        footer: {
          text: apiData[themeKey].footer?.text || defaultData[themeKey]!.footer!.text,
          icon: apiData[themeKey].footer?.icon ?? defaultData[themeKey]!.footer!.icon,
          stats: apiData[themeKey].footer?.stats ?? defaultData[themeKey]!.footer!.stats,
        },
        layout: apiData[themeKey].layout || defaultData[themeKey]!.layout,
        theme: apiData[themeKey].theme || defaultData[themeKey]!.theme,
      };
    }
  });

  return mergedData;
};

export default function HeroPage() {
  const [activeTheme, setActiveTheme] = useState<keyof HeroData>("sobre");
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    content: false,
    theme: false,
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
  } = useJsonManagement<HeroData>({
    apiPath: "/api/tegbe-institucional/json/call-to-action",
    defaultData: defaultHeroData,
    mergeFunction: mergeWithDefaults,
  });

  const getCurrentThemeData = (): HeroPageData => {
    const themeData = heroData?.[activeTheme];
    return themeData || defaultHeroPageData;
  };

  const currentThemeData = getCurrentThemeData();

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleThemeChange = (path: string, value: any) => {
    updateNested(`${activeTheme}.${path}`, value);
  };

  const handleStatsChange = (index: number, field: 'label' | 'sublabel', value: string) => {
    const stats = currentThemeData.footer?.stats;
    
    if (Array.isArray(stats)) {
      const newStats = [...stats];
      if (newStats[index]) {
        newStats[index] = { ...newStats[index], [field]: value };
        handleThemeChange('footer.stats', newStats);
      }
    }
  };

  const addStatItem = () => {
    const stats = currentThemeData.footer?.stats;
    
    if (Array.isArray(stats)) {
      handleThemeChange('footer.stats', [...stats, { label: "", sublabel: "" }]);
    } else {
      handleThemeChange('footer.stats', [{ label: "", sublabel: "" }]);
    }
  };

  const removeStatItem = (index: number) => {
    const stats = currentThemeData.footer?.stats;
    
    if (Array.isArray(stats)) {
      const newStats = stats.filter((_, i) => i !== index);
      handleThemeChange('footer.stats', newStats);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await save();
  };

  const handleThemeColorChange = (property: keyof NonNullable<HeroPageData['theme']>, hexColor: string) => {
    const tailwindClass = hexToTailwindBgClass(hexColor);
    const colorValue = tailwindClass.replace('bg-', '');
    handleThemeChange(`theme.${property}`, colorValue);
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Badge
    total += 3; // Aumentado para 3 para incluir o link
    if (currentThemeData.badge?.text?.trim()) completed++;
    if (currentThemeData.badge?.icon !== undefined) completed++;
    if (currentThemeData.badge?.link?.trim()) completed++;

    // Title
    total += 1;
    if (currentThemeData.title?.trim()) completed++;

    // Subtitle
    total += 1;
    if (currentThemeData.subtitle?.trim()) completed++;

    // Button
    total += 3;
    if (currentThemeData.button?.text?.trim()) completed++;
    if (currentThemeData.button?.icon?.trim()) completed++;
    if (currentThemeData.button?.link?.trim()) completed++;

    // Footer
    total += 2;
    if (currentThemeData.footer?.text?.trim()) completed++;
    if (currentThemeData.footer?.icon !== undefined) completed++;

    // Layout
    total += 1;
    if (currentThemeData.layout?.trim()) completed++;

    // Theme colors
    if (currentThemeData.theme) {
      total += 5;
      Object.values(currentThemeData.theme).forEach(color => {
        if (color?.trim()) completed++;
      });
    }

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Layers}
      title="Hero Sections"
      description="Configure as seções hero para diferentes páginas (E-commerce, Marketing, Sobre)"
      exists={!!exists}
      itemName="Hero Section"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Tabs de Temas */}
        <Card className="p-6 bg-[var(--color-background)]">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[var(--color-secondary)]">Selecione o Tema</h3>
            <p className="text-sm text-[var(--color-secondary)]/70">
              Configure diferentes versões para cada tipo de página
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(['ecommerce', 'marketing', 'sobre'] as Array<keyof HeroData>).map((themeKey) => (
              <button
                key={themeKey}
                type="button"
                onClick={() => setActiveTheme(themeKey)}
                className={`px-4 py-2 font-medium rounded-lg transition-all ${
                  activeTheme === themeKey
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-background-body)] text-[var(--color-secondary)] hover:bg-[var(--color-border)]"
                }`}
              >
                {themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}
              </button>
            ))}
          </div>
        </Card>

        {/* Seção Básica */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações Básicas"
            section="basic"
            icon={Settings}
            isExpanded={expandedSections.basic}
            onToggle={() => toggleSection("basic")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.basic ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-8">
              {/* Badge */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Badge
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <IconSelector
                      value={currentThemeData.badge?.icon || ""}
                      onChange={(value) => handleThemeChange('badge.icon', value)}
                      label="Ícone do Badge"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                      Deixe vazio para não mostrar ícone
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <LinkIcon className="w-4 h-4 text-[var(--color-secondary)]" />
                      <label className="text-sm font-medium text-[var(--color-secondary)]">
                        Link do Badge
                      </label>
                    </div>
                    <Input
                      type="text"
                      value={currentThemeData.badge?.link || ""}
                      onChange={(e) => handleThemeChange('badge.link', e.target.value)}
                      placeholder="/categoria ou https://exemplo.com"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                      Link opcional para o badge
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <TextArea
                      label="Texto do Badge (HTML permitido)"
                      value={currentThemeData.badge?.text || ""}
                      onChange={(e) => handleThemeChange('badge.text', e.target.value)}
                      placeholder="Próximo Passo Lógico"
                      rows={2}
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                      Use tags HTML como &lt;span&gt; para estilização personalizada
                    </p>
                  </div>
                </div>
              </div>

              {/* Layout */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Layout
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['simple', 'complex', 'refined'] as const).map((layout) => (
                    <button
                      key={layout}
                      type="button"
                      onClick={() => handleThemeChange('layout', layout)}
                      className={`p-4 rounded-lg border transition-all ${
                        currentThemeData.layout === layout
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                          : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-medium text-[var(--color-secondary)] capitalize mb-1">
                          {layout}
                        </div>
                        <p className="text-xs text-[var(--color-secondary)]/70">
                          {layout === 'simple' && 'Layout limpo e direto'}
                          {layout === 'complex' && 'Layout com efeitos visuais'}
                          {layout === 'refined' && 'Layout refinado e sofisticado'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Conteúdo */}
        <div className="space-y-4">
          <SectionHeader
            title="Conteúdo da Hero Section"
            section="content"
            icon={Type}
            isExpanded={expandedSections.content}
            onToggle={() => toggleSection("content")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.content ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-8">
              {/* Título */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)]">
                  Título Principal
                </h4>
                <TextArea
                  label="Texto do Título (HTML permitido)"
                  value={currentThemeData.title || ""}
                  onChange={(e) => handleThemeChange('title', e.target.value)}
                  placeholder="Sua empresa tem um teto de crescimento..."
                  rows={4}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <p className="text-xs text-[var(--color-secondary)]/70">
                  Use &lt;br/&gt; para quebras de linha e &lt;span&gt; com classes para estilização
                </p>
              </div>

              {/* Subtítulo */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)]">
                  Subtítulo
                </h4>
                <TextArea
                  label="Texto do Subtítulo (HTML permitido)"
                  value={currentThemeData.subtitle || ""}
                  onChange={(e) => handleThemeChange('subtitle', e.target.value)}
                  placeholder="Não entregamos 'tentativas'..."
                  rows={4}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <p className="text-xs text-[var(--color-secondary)]/70">
                  Use tags HTML como &lt;strong&gt; e &lt;span&gt; para destaque
                </p>
              </div>

              {/* Botão */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Botão de Ação
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Texto do Botão"
                      value={currentThemeData.button?.text || ""}
                      onChange={(e) => handleThemeChange('button.text', e.target.value)}
                      placeholder="SOLICITAR MEU DIAGNÓSTICO"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div>
                    <IconSelector
                      value={currentThemeData.button?.icon || ""}
                      onChange={(value) => handleThemeChange('button.icon', value)}
                      label="Ícone do Botão"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <LinkIcon className="w-4 h-4 text-[var(--color-secondary)]" />
                      <label className="text-sm font-medium text-[var(--color-secondary)]">
                        Link do Botão
                      </label>
                    </div>
                    <Input
                      type="text"
                      value={currentThemeData.button?.link || ""}
                      onChange={(e) => handleThemeChange('button.link', e.target.value)}
                      placeholder="/contato ou https://exemplo.com"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                      Use caminhos relativos (/contato) ou URLs completas
                    </p>
                  </div>
                </div>
              </div>

              {/* Rodapé */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Rodapé
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Texto do Rodapé"
                    value={currentThemeData.footer?.text || ""}
                    onChange={(e) => handleThemeChange('footer.text', e.target.value)}
                    placeholder="Vagas limitadas para este mês"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <div>
                    <IconSelector
                      value={currentThemeData.footer?.icon || ""}
                      onChange={(value) => handleThemeChange('footer.icon', value)}
                      label="Ícone do Rodapé"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                      Deixe vazio para não mostrar ícone
                    </p>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-[var(--color-secondary)] mb-1">Estatísticas</h5>
                      <p className="text-sm text-[var(--color-secondary)]/70">
                        Configure estatísticas para mostrar no rodapé
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={addStatItem}
                      variant="primary"
                      className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                    >
                      + Adicionar Item
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {currentThemeData.footer?.stats === null || 
                     currentThemeData.footer?.stats === undefined || 
                     (typeof currentThemeData.footer?.stats === 'string' && !currentThemeData.footer?.stats) ? (
                      <p className="text-sm text-[var(--color-secondary)]/70">
                        Nenhuma estatística configurada
                      </p>
                    ) : typeof currentThemeData.footer?.stats === 'string' ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={currentThemeData.footer.stats}
                          onChange={(e) => handleThemeChange('footer.stats', e.target.value)}
                          placeholder="+40"
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                        />
                        <Button
                          type="button"
                          onClick={() => handleThemeChange('footer.stats', null)}
                          variant="danger"
                          className="bg-red-600 hover:bg-red-700 border-none"
                        >
                          Limpar
                        </Button>
                      </div>
                    ) : Array.isArray(currentThemeData.footer?.stats) && currentThemeData.footer.stats.length > 0 ? (
                      currentThemeData.footer.stats.map((stat, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-[var(--color-secondary)]/70 mb-1">Label</label>
                              <Input
                                type="text"
                                value={stat.label || ""}
                                onChange={(e) => handleStatsChange(index, 'label', e.target.value)}
                                placeholder="30 Min"
                                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-[var(--color-secondary)]/70 mb-1">Sublabel</label>
                              <Input
                                type="text"
                                value={stat.sublabel || ""}
                                onChange={(e) => handleStatsChange(index, 'sublabel', e.target.value)}
                                placeholder="Duração da Sessão"
                                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeStatItem(index)}
                            variant="danger"
                            className="bg-red-600 hover:bg-red-700 border-none"
                          >
                            Remover
                          </Button>
                        </div>
                      ))
                    ) : null}
                  </div>
                  <p className="text-xs text-[var(--color-secondary)]/70">
                    Pode ser uma string simples (ex: &quot;+40&quot;) ou um array de objetos com label/sublabel
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Tema */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações do Tema"
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
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Personalize o tema do Hero
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Configure as cores principais para esta versão do Hero
                </p>
              </div>

              {currentThemeData.theme && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ThemePropertyInput
                    property="bg"
                    label="Cor Primária"
                    description="Cor principal para destaques"
                    currentHex={tailwindToHex(`bg-${currentThemeData.theme.primary_color || 'blue-600'}`)}
                    tailwindClass={`bg-${currentThemeData.theme.primary_color || 'blue-600'}`}
                    onThemeChange={(_, hex) => handleThemeColorChange('primary_color', hex)}
                  />

                  <ThemePropertyInput
                    property="bg"
                    label="Cor Secundária"
                    description="Cor para elementos secundários"
                    currentHex={tailwindToHex(`bg-${currentThemeData.theme.secondary_color || 'gray-700'}`)}
                    tailwindClass={`bg-${currentThemeData.theme.secondary_color || 'gray-700'}`}
                    onThemeChange={(_, hex) => handleThemeColorChange('secondary_color', hex)}
                  />

                  <ThemePropertyInput
                    property="text"
                    label="Cor do Texto"
                    description="Cor principal para textos"
                    currentHex={tailwindToHex(`text-${currentThemeData.theme.text_color || 'gray-900'}`)}
                    tailwindClass={`text-${currentThemeData.theme.text_color || 'gray-900'}`}
                    onThemeChange={(_, hex) => handleThemeColorChange('text_color', hex)}
                  />

                  <ThemePropertyInput
                    property="bg"
                    label="Cor de Fundo"
                    description="Cor de fundo principal"
                    currentHex={tailwindToHex(`bg-${currentThemeData.theme.background_color || 'white'}`)}
                    tailwindClass={`bg-${currentThemeData.theme.background_color || 'white'}`}
                    onThemeChange={(_, hex) => handleThemeColorChange('background_color', hex)}
                  />

                  <ThemePropertyInput
                    property="bg"
                    label="Cor de Destaque"
                    description="Cor para elementos de destaque"
                    currentHex={tailwindToHex(`bg-${currentThemeData.theme.accent_color || 'amber-500'}`)}
                    tailwindClass={`bg-${currentThemeData.theme.accent_color || 'amber-500'}`}
                    onThemeChange={(_, hex) => handleThemeColorChange('accent_color', hex)}
                  />
                </div>
              )}
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
          itemName="Hero Section"
          icon={Layers}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={3}
        itemName="Hero Section"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}