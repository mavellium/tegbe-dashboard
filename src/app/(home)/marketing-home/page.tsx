/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import IconSelector from "@/components/IconSelector";
import { 
  Layout, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Palette,
  Megaphone,
  Users,
  Brush,
  BarChart3
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";

interface ThemeData {
  bg_section: string;
  card_dark_bg: string;
  card_dark_text: string;
  card_light_bg: string;
  card_light_text: string;
  accent_pink: string;
  accent_gradient: string;
}

interface HeaderData {
  tag: string;
  title: string;
  subtitle: string;
}

interface MainTowerCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  cta: string;
  href: string;
  icon: string;
}

interface StackCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  stat: string;
}

interface CardsData {
  main_tower: MainTowerCard;
  creative_stack: StackCard;
  crm_stack: StackCard;
}

interface MarketingSectionData {
  marketing_section: {
    theme: ThemeData;
    header: HeaderData;
    cards: CardsData;
  };
}

const defaultMarketingSectionData: MarketingSectionData = {
  marketing_section: {
    theme: {
      bg_section: "#FFFFFF",
      card_dark_bg: "#101010",
      card_dark_text: "#FFFFFF",
      card_light_bg: "#F5F5F7",
      card_light_text: "#1D1D1F",
      accent_pink: "#FF2D55",
      accent_gradient: "linear-gradient(135deg, #FF2D55 0%, #FF375F 100%)"
    },
    header: {
      tag: "",
      title: "",
      subtitle: ""
    },
    cards: {
      main_tower: {
        id: "",
        title: "",
        subtitle: "",
        description: "",
        tags: [""],
        cta: "",
        href: "",
        icon: "solar:graph-new-up-bold"
      },
      creative_stack: {
        id: "",
        title: "",
        description: "",
        icon: "",
        stat: ""
      },
      crm_stack: {
        id: "",
        title: "",
        description: "",
        icon: "solar:users-group-two-rounded-bold-duotone",
        stat: ""
      }
    }
  }
};

const mergeWithDefaults = (apiData: any, defaultData: MarketingSectionData): MarketingSectionData => {
  if (!apiData) return defaultData;
  
  return {
    marketing_section: {
      theme: apiData.marketing_section?.theme || defaultData.marketing_section.theme,
      header: apiData.marketing_section?.header || defaultData.marketing_section.header,
      cards: apiData.marketing_section?.cards || defaultData.marketing_section.cards,
    },
  };
};

export default function MarketingSectionPage() {
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
  } = useJsonManagement<MarketingSectionData>({
    apiPath: "/api/tegbe-institucional/json/marketing",
    defaultData: defaultMarketingSectionData,
    mergeFunction: mergeWithDefaults,
  });

  const [expandedSections, setExpandedSections] = useState({
    theme: true,
    header: true,
    mainTower: true,
    creativeStack: true,
    crmStack: true,
  });

  const [tagInput, setTagInput] = useState("");

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Funções para manipular tags do main_tower
  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = [...pageData.marketing_section.cards.main_tower.tags];
      if (!currentTags.includes(tagInput.trim())) {
        currentTags.push(tagInput.trim());
        updateNested('marketing_section.cards.main_tower.tags', currentTags);
      }
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    const currentTags = [...pageData.marketing_section.cards.main_tower.tags];
    currentTags.splice(index, 1);
    updateNested('marketing_section.cards.main_tower.tags', currentTags);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Theme (7 campos)
    total += 7;
    if (pageData.marketing_section.theme.bg_section.trim()) completed++;
    if (pageData.marketing_section.theme.card_dark_bg.trim()) completed++;
    if (pageData.marketing_section.theme.card_dark_text.trim()) completed++;
    if (pageData.marketing_section.theme.card_light_bg.trim()) completed++;
    if (pageData.marketing_section.theme.card_light_text.trim()) completed++;
    if (pageData.marketing_section.theme.accent_pink.trim()) completed++;
    if (pageData.marketing_section.theme.accent_gradient.trim()) completed++;

    // Header (3 campos)
    total += 3;
    if (pageData.marketing_section.header.tag.trim()) completed++;
    if (pageData.marketing_section.header.title.trim()) completed++;
    if (pageData.marketing_section.header.subtitle.trim()) completed++;

    // Main Tower Card (7 campos + tags)
    const mainTower = pageData.marketing_section.cards.main_tower;
    total += 7 + mainTower.tags.length;
    if (mainTower.title.trim()) completed++;
    if (mainTower.subtitle.trim()) completed++;
    if (mainTower.description.trim()) completed++;
    if (mainTower.cta.trim()) completed++;
    if (mainTower.href.trim()) completed++;
    if (mainTower.icon.trim()) completed++;
    if (mainTower.id.trim()) completed++;
    mainTower.tags.forEach(tag => {
      if (tag.trim()) completed++;
    });

    // Creative Stack Card (4 campos)
    const creativeStack = pageData.marketing_section.cards.creative_stack;
    total += 4;
    if (creativeStack.title.trim()) completed++;
    if (creativeStack.description.trim()) completed++;
    if (creativeStack.icon.trim()) completed++;
    if (creativeStack.stat.trim()) completed++;

    // CRM Stack Card (4 campos)
    const crmStack = pageData.marketing_section.cards.crm_stack;
    total += 4;
    if (crmStack.title.trim()) completed++;
    if (crmStack.description.trim()) completed++;
    if (crmStack.icon.trim()) completed++;
    if (crmStack.stat.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={TrendingUp}
      title="Gerenciar Seção de Marketing"
      description="Configure o tema, cabeçalho e cards da seção de marketing"
      exists={!!exists}
      itemName="Seção de Marketing"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Tema */}
        <div className="space-y-4">
          <SectionHeader
            title="Tema (Cores)"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ThemePropertyInput
                  property="bg_section"
                  label="Fundo da Seção"
                  description=""
                  currentHex={pageData.marketing_section.theme.bg_section}
                  tailwindClass={`bg-[${pageData.marketing_section.theme.bg_section}]`}
                  onThemeChange={(_, hex) => updateNested('marketing_section.theme.bg_section', hex)}
                />
                
                <ThemePropertyInput
                  property="card_dark_bg"
                  label="Fundo Card Escuro"
                  description=""
                  currentHex={pageData.marketing_section.theme.card_dark_bg}
                  tailwindClass={`bg-[${pageData.marketing_section.theme.card_dark_bg}]`}
                  onThemeChange={(_, hex) => updateNested('marketing_section.theme.card_dark_bg', hex)}
                />
                
                <ThemePropertyInput
                  property="card_dark_text"
                  label="Texto Card Escuro"
                  description=""
                  currentHex={pageData.marketing_section.theme.card_dark_text}
                  tailwindClass={`text-[${pageData.marketing_section.theme.card_dark_text}]`}
                  onThemeChange={(_, hex) => updateNested('marketing_section.theme.card_dark_text', hex)}
                />
                
                <ThemePropertyInput
                  property="card_light_bg"
                  label="Fundo Card Claro"
                  description=""
                  currentHex={pageData.marketing_section.theme.card_light_bg}
                  tailwindClass={`bg-[${pageData.marketing_section.theme.card_light_bg}]`}
                  onThemeChange={(_, hex) => updateNested('marketing_section.theme.card_light_bg', hex)}
                />
                
                <ThemePropertyInput
                  property="card_light_text"
                  label="Texto Card Claro"
                  description=""
                  currentHex={pageData.marketing_section.theme.card_light_text}
                  tailwindClass={`text-[${pageData.marketing_section.theme.card_light_text}]`}
                  onThemeChange={(_, hex) => updateNested('marketing_section.theme.card_light_text', hex)}
                />
                
                <ThemePropertyInput
                  property="accent_pink"
                  label="Rosa de Destaque"
                  description=""
                  currentHex={pageData.marketing_section.theme.accent_pink}
                  tailwindClass={`bg-[${pageData.marketing_section.theme.accent_pink}]`}
                  onThemeChange={(_, hex) => updateNested('marketing_section.theme.accent_pink', hex)}
                />
              </div>
              
              <div className="mt-6 space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Gradiente de Destaque
                </label>
                <div className="flex gap-2">
                  <Input
                    value={pageData.marketing_section.theme.accent_gradient}
                    onChange={(e) => updateNested('marketing_section.theme.accent_gradient', e.target.value)}
                    placeholder="linear-gradient(135deg, #FF2D55 0%, #FF375F 100%)"
                    className="flex-1 bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <div 
                    className="w-12 h-12 rounded border"
                    style={{ background: pageData.marketing_section.theme.accent_gradient }}
                  />
                </div>
                <p className="text-xs text-[var(--color-secondary)]/50">
                  Use o formato CSS para gradiente linear
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Cabeçalho */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho"
            section="header"
            icon={Megaphone}
            isExpanded={expandedSections.header}
            onToggle={() => toggleSection("header")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.header ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Tag
                    </label>
                    <Input
                      value={pageData.marketing_section.header.tag}
                      onChange={(e) => updateNested('marketing_section.header.tag', e.target.value)}
                      placeholder="Ex: Growth Ecosystem"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Título
                    </label>
                    <Input
                      value={pageData.marketing_section.header.title}
                      onChange={(e) => updateNested('marketing_section.header.title', e.target.value)}
                      placeholder="Ex: O motor de vendas."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Subtítulo
                  </label>
                  <TextArea
                    value={pageData.marketing_section.header.subtitle}
                    onChange={(e) => updateNested('marketing_section.header.subtitle', e.target.value)}
                    placeholder="Descrição da seção de marketing"
                    rows={3}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Card Principal - Main Tower */}
        <div className="space-y-4">
          <SectionHeader
            title="Card Principal (Growth Full-Stack)"
            section="mainTower"
            icon={BarChart3}
            isExpanded={expandedSections.mainTower}
            onToggle={() => toggleSection("mainTower")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.mainTower ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <h3 className="font-medium text-[var(--color-secondary)]">
                  Card principal (ocupa mais espaço no layout)
                </h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Título
                      </label>
                      <Input
                        value={pageData.marketing_section.cards.main_tower.title}
                        onChange={(e) => updateNested('marketing_section.cards.main_tower.title', e.target.value)}
                        placeholder="Ex: Growth Full-Stack."
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Subtítulo
                      </label>
                      <Input
                        value={pageData.marketing_section.cards.main_tower.subtitle}
                        onChange={(e) => updateNested('marketing_section.cards.main_tower.subtitle', e.target.value)}
                        placeholder="Ex: Dominamos toda a jornada."
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Ícone
                      </label>
                      <IconSelector
                        value={pageData.marketing_section.cards.main_tower.icon}
                        onChange={(value) => updateNested('marketing_section.cards.main_tower.icon', value)}
                        placeholder="solar:graph-new-up-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Texto do Botão
                      </label>
                      <Input
                        value={pageData.marketing_section.cards.main_tower.cta}
                        onChange={(e) => updateNested('marketing_section.cards.main_tower.cta', e.target.value)}
                        placeholder="Ex: Ver Estratégia Growth"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Link (href)
                      </label>
                      <Input
                        value={pageData.marketing_section.cards.main_tower.href}
                        onChange={(e) => updateNested('marketing_section.cards.main_tower.href', e.target.value)}
                        placeholder="Ex: /marketing"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Descrição
                  </label>
                  <TextArea
                    value={pageData.marketing_section.cards.main_tower.description}
                    onChange={(e) => updateNested('marketing_section.cards.main_tower.description', e.target.value)}
                    placeholder="Descrição detalhada do card"
                    rows={3}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Tags (até 5 tags)
                    </label>
                    <span className="text-xs text-[var(--color-secondary)]/70">
                      {pageData.marketing_section.cards.main_tower.tags.length}/5 tags
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Digite uma tag e pressione Enter"
                      className="flex-1 bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      disabled={pageData.marketing_section.cards.main_tower.tags.length >= 5}
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      variant="secondary"
                      className="whitespace-nowrap"
                      disabled={pageData.marketing_section.cards.main_tower.tags.length >= 5 || !tagInput.trim()}
                    >
                      Adicionar
                    </Button>
                  </div>
                  
                  {pageData.marketing_section.cards.main_tower.tags.length >= 5 && (
                    <p className="text-xs text-amber-600">
                      Limite de 5 tags atingido. Remova uma tag para adicionar outra.
                    </p>
                  )}
                  
                  {/* Lista de tags */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {pageData.marketing_section.cards.main_tower.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full"
                      >
                        <span className="text-sm">{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="text-[var(--color-primary)] hover:text-red-500"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Card Creative Stack */}
        <div className="space-y-4">
          <SectionHeader
            title="Card Creative Studio"
            section="creativeStack"
            icon={Brush}
            isExpanded={expandedSections.creativeStack}
            onToggle={() => toggleSection("creativeStack")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.creativeStack ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                <h3 className="font-medium text-[var(--color-secondary)]">
                  Card secundário (Creative Studio)
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Título
                    </label>
                    <Input
                      value={pageData.marketing_section.cards.creative_stack.title}
                      onChange={(e) => updateNested('marketing_section.cards.creative_stack.title', e.target.value)}
                      placeholder="Ex: Creative Studio."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Ícone
                    </label>
                    <IconSelector
                      value={pageData.marketing_section.cards.creative_stack.icon}
                      onChange={(value) => updateNested('marketing_section.cards.creative_stack.icon', value)}
                      placeholder="solar:palette-round-bold-duotone"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Estatística
                    </label>
                    <Input
                      value={pageData.marketing_section.cards.creative_stack.stat}
                      onChange={(e) => updateNested('marketing_section.cards.creative_stack.stat', e.target.value)}
                      placeholder="Ex: +40% CTR"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Descrição
                  </label>
                  <TextArea
                    value={pageData.marketing_section.cards.creative_stack.description}
                    onChange={(e) => updateNested('marketing_section.cards.creative_stack.description', e.target.value)}
                    placeholder="Descrição do creative studio"
                    rows={2}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Card CRM Stack */}
        <div className="space-y-4">
          <SectionHeader
            title="Card CRM & LTV"
            section="crmStack"
            icon={Users}
            isExpanded={expandedSections.crmStack}
            onToggle={() => toggleSection("crmStack")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.crmStack ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <h3 className="font-medium text-[var(--color-secondary)]">
                  Card secundário (CRM & LTV)
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Título
                    </label>
                    <Input
                      value={pageData.marketing_section.cards.crm_stack.title}
                      onChange={(e) => updateNested('marketing_section.cards.crm_stack.title', e.target.value)}
                      placeholder="Ex: CRM & LTV."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Ícone
                    </label>
                    <IconSelector
                      value={pageData.marketing_section.cards.crm_stack.icon}
                      onChange={(value) => updateNested('marketing_section.cards.crm_stack.icon', value)}
                      placeholder="solar:users-group-two-rounded-bold-duotone"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Estatística
                    </label>
                    <Input
                      value={pageData.marketing_section.cards.crm_stack.stat}
                      onChange={(e) => updateNested('marketing_section.cards.crm_stack.stat', e.target.value)}
                      placeholder="Ex: Retenção Ativa"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Descrição
                  </label>
                  <TextArea
                    value={pageData.marketing_section.cards.crm_stack.description}
                    onChange={(e) => updateNested('marketing_section.cards.crm_stack.description', e.target.value)}
                    placeholder="Descrição do CRM & LTV"
                    rows={2}
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
          totalCount={completion.total}
          itemName="Seção de Marketing"
          icon={TrendingUp}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração da Seção de Marketing"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}