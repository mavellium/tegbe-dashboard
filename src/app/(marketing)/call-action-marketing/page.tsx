/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Switch } from "@/components/Switch";
import { 
  Tag, 
  Palette, 
  Type, 
  Zap, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  Layout,
  LucideIcon
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import ColorPicker from "@/components/ColorPicker";
import IconSelector from "@/components/IconSelector";
import { useJsonManagement } from "@/hooks/useJsonManagement";

interface BadgeData {
  text?: string;
  icon?: string | null;
}

interface ButtonData {
  text?: string;
  icon?: string;
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
}

interface HeroData {
  ecommerce?: HeroPageData;
  marketing?: HeroPageData;
  sobre?: HeroPageData;
}

const defaultHeroPageData: HeroPageData = {
  badge: {
    text: "",
    icon: ""
  },
  title: "",
  subtitle: "",
  button: {
    text: "",
    icon: ""
  },
  footer: {
    text: "",
    icon: "",
    stats: ""
  },
  layout: "simple"
};

const defaultHeroData: HeroData = {
  ecommerce: {
    badge: {
      text: "O próximo passo para sua escala",
      icon: ""
    },
    title: "O próximo case de sucesso <br /><span class='text-yellow-500'>será o seu.</span>",
    subtitle: "Trabalhamos com um <span class='text-white'>plano de guerra</span> desenhado para sua marca dominar o mercado e vender mais junto com a Tegbe.",
    button: {
      text: "SOLICITAR MEU DIAGNÓSTICO",
      icon: "ph:arrow-right-bold"
    },
    footer: {
      text: "Vagas limitadas para este mês",
      icon: "mdi:check-decagram",
      stats: ""
    },
    layout: "simple"
  },
  marketing: {
    badge: {
      text: "Próximo Passo Lógico",
      icon: "mdi:lightning-bolt"
    },
    title: "Sua empresa tem um teto de crescimento. <br class='hidden md:block' /> <span class='text-transparent bg-clip-text bg-gradient-to-r from-[#FF0F43] to-[#E31B63] drop-shadow-[0_0_20px_rgba(227,27,99,0.3)]'>Nós vamos quebrá-lo.</span>",
    subtitle: "Não entregamos 'tentativas'. Entregamos um <strong class='text-white'>plano de engenharia comercial</strong> desenhado para dominar seu nicho e gerar previsibilidade de caixa.",
    button: {
      text: "CONSTRUIR MINHA MÁQUINA DE VENDAS",
      icon: "lucide:arrow-right"
    },
    footer: {
      text: "Empresas escaladas este ano",
      icon: "",
      stats: "+40"
    },
    layout: "complex"
  },
  sobre: {
    badge: {
      text: "Agenda Q1/2026: <span class='text-[#1d1d1f] font-bold'>Últimas Vagas</span>",
      icon: ""
    },
    title: "Sua operação está pronta <br /> para o <span class='text-transparent bg-clip-text bg-gradient-to-r from-[#0071E3] to-blue-600'>próximo nível?</span>",
    subtitle: "Não procuramos clientes, procuramos parceiros de crescimento. Se você tem produto validado e ambição de escala, <span class='text-[#1d1d1f] font-bold'> nós temos a engenharia.</span>",
    button: {
      text: "AGENDAR SESSÃO ESTRATÉGICA",
      icon: "ph:arrow-right-bold"
    },
    footer: {
      text: "",
      icon: "",
      stats: [
        { label: "30 Min", sublabel: "Duração da Sessão" },
        { label: "Senior", sublabel: "Especialista Real" }
      ]
    },
    layout: "refined"
  }
};

const expandedSectionsDefault = {
  badge: true,
  title: true,
  subtitle: true,
  button: true,
  footer: true,
  layout: false
};

interface SectionHeaderProps {
  title: string;
  section: keyof typeof expandedSectionsDefault;
  icon: LucideIcon;
  isExpanded: boolean;
  onToggle: (section: keyof typeof expandedSectionsDefault) => void;
}

const SectionHeader = ({
  title,
  section,
  icon: Icon,
  isExpanded,
  onToggle
}: SectionHeaderProps) => (
  <button
    type="button"
    onClick={() => onToggle(section)}
    className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        {title}
      </h3>
    </div>
    {isExpanded ? (
      <ChevronUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
    ) : (
      <ChevronDown className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
    )}
  </button>
);

interface ThemeTabProps {
  themeKey: keyof HeroData;
  label: string;
  isActive: boolean;
  onClick: (theme: keyof HeroData) => void;
}

const ThemeTab = ({ themeKey, label, isActive, onClick }: ThemeTabProps) => (
  <button
    type="button"
    onClick={() => onClick(themeKey)}
    className={`px-4 py-2 font-medium rounded-lg transition-colors ${
      isActive
        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
    }`}
  >
    {label}
  </button>
);

const getSafeData = <T,>(data: T | undefined | null, defaultValue: T): T => {
  if (!data) return defaultValue;
  return data;
};

export default function HeroPage() {
  const [activeTheme, setActiveTheme] = useState<keyof HeroData>("marketing");
  const [expandedSections, setExpandedSections] = useState(expandedSectionsDefault);
  
  const {
    data: heroData,
    setData: setHeroData,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload,
    updateNested
  } = useJsonManagement<HeroData>({
    apiPath: "/api/tegbe-institucional/json/call-to-action",
    defaultData: defaultHeroData,
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });

  const getCurrentThemeData = useCallback((): HeroPageData => {
    const themeData = heroData?.[activeTheme];
    return getSafeData(themeData, defaultHeroPageData);
  }, [heroData, activeTheme]);

  const calculateCompleteCount = useCallback(() => {
    const currentThemeData = getCurrentThemeData();
    let count = 0;
    
    if (currentThemeData.badge?.text?.trim() !== "") count++;
    if (currentThemeData.title?.trim() !== "") count++;
    if (currentThemeData.subtitle?.trim() !== "") count++;
    if (currentThemeData.button?.text?.trim() !== "") count++;
    if (currentThemeData.footer?.text?.trim() !== "") count++;
    if (currentThemeData.layout?.trim() !== "") count++;
    
    return count;
  }, [getCurrentThemeData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 6;
  const canAddNewItem = false;
  const isLimitReached = false;

  const toggleSection = (section: keyof typeof expandedSectionsDefault) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleThemeChange = useCallback((path: string, value: any) => {
    updateNested(`${activeTheme}.${path}`, value);
  }, [activeTheme, updateNested]);

  const handleStatsChange = (index: number, field: 'label' | 'sublabel', value: string) => {
    const currentThemeData = getCurrentThemeData();
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
    const currentThemeData = getCurrentThemeData();
    const stats = currentThemeData.footer?.stats;
    
    if (Array.isArray(stats)) {
      handleThemeChange('footer.stats', [...stats, { label: "", sublabel: "" }]);
    } else {
      handleThemeChange('footer.stats', [{ label: "", sublabel: "" }]);
    }
  };

  const removeStatItem = (index: number) => {
    const currentThemeData = getCurrentThemeData();
    const stats = currentThemeData.footer?.stats;
    
    if (Array.isArray(stats)) {
      const newStats = stats.filter((_, i) => i !== index);
      handleThemeChange('footer.stats', newStats);
    }
  };

  const handleSubmitWrapper = () => {
    const fd = new FormData();
    fd.append("values", JSON.stringify(heroData));
    save(fd);
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODAS AS CONFIGURAÇÕES HERO"
    });
  };

  const confirmDelete = async () => {
    try {
      await fetch("/api/tegbe-institucional/json/hero", {
        method: "DELETE",
      });
      
      setHeroData(defaultHeroData);
      closeDeleteModal();
      await reload();
    } catch (err: any) {
      console.error("Erro ao deletar:", err);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: "all", 
      title: "" 
    });
  };

  const renderBadgeSection = () => {
    const currentThemeData = getCurrentThemeData();
    const badgeData = currentThemeData.badge || {};
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Badge" 
          section="badge" 
          icon={Tag}
          isExpanded={expandedSections.badge}
          onToggle={toggleSection}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.badge ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <IconSelector
                  value={badgeData.icon || ""}
                  onChange={(value) => handleThemeChange('badge.icon', value)}
                  label="Ícone do Badge"
                />
                <p className="text-xs text-zinc-500 mt-1">Deixe vazio para não mostrar ícone</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Texto do Badge (HTML permitido)
                </label>
                <Input
                  type="text"
                  placeholder="Próximo Passo Lógico"
                  value={badgeData.text || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('badge.text', e.target.value)
                  }
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Use tags HTML como &lt;span&gt; para estilização personalizada
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderTitleSection = () => {
    const currentThemeData = getCurrentThemeData();
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Título" 
          section="title" 
          icon={Type}
          isExpanded={expandedSections.title}
          onToggle={toggleSection}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.title ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Texto do Título (HTML permitido)
              </label>
              <textarea
                placeholder="Sua empresa tem um teto de crescimento..."
                value={currentThemeData.title || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  handleThemeChange('title', e.target.value)
                }
                rows={4}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Use &lt;br/&gt; para quebras de linha e &lt;span&gt; com classes para estilização
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderSubtitleSection = () => {
    const currentThemeData = getCurrentThemeData();
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Subtítulo" 
          section="subtitle" 
          icon={Type}
          isExpanded={expandedSections.subtitle}
          onToggle={toggleSection}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.subtitle ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Texto do Subtítulo (HTML permitido)
              </label>
              <textarea
                placeholder="Não entregamos 'tentativas'..."
                value={currentThemeData.subtitle || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  handleThemeChange('subtitle', e.target.value)
                }
                rows={4}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Use tags HTML como &lt;strong&gt; e &lt;span&gt; para destaque
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderButtonSection = () => {
    const currentThemeData = getCurrentThemeData();
    const buttonData = currentThemeData.button || {};
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Botão" 
          section="button" 
          icon={Zap}
          isExpanded={expandedSections.button}
          onToggle={toggleSection}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.button ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Texto do Botão
                </label>
                <Input
                  type="text"
                  placeholder="SOLICITAR MEU DIAGNÓSTICO"
                  value={buttonData.text || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('button.text', e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-2">
                <IconSelector
                  value={buttonData.icon || ""}
                  onChange={(value) => handleThemeChange('button.icon', value)}
                  label="Ícone do Botão"
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderFooterSection = () => {
    const currentThemeData = getCurrentThemeData();
    const footerData = currentThemeData.footer || {};
    const stats = footerData.stats;
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Rodapé" 
          section="footer" 
          icon={Eye}
          isExpanded={expandedSections.footer}
          onToggle={toggleSection}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.footer ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Texto do Rodapé
                </label>
                <Input
                  type="text"
                  placeholder="Vagas limitadas para este mês"
                  value={footerData.text || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('footer.text', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Ícone do Rodapé
                </label>
                <IconSelector
                  value={footerData.icon || ""}
                  onChange={(value) => handleThemeChange('footer.icon', value)}
                  label="Ícone"
                />
                <p className="text-xs text-zinc-500 mt-1">Deixe vazio para não mostrar ícone</p>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Estatísticas
                  </label>
                  <Button
                    type="button"
                    onClick={addStatItem}
                    className="text-sm"
                  >
                    + Adicionar Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {stats === null || stats === undefined ? (
                    <p className="text-sm text-zinc-500">Nenhuma estatística configurada</p>
                  ) : typeof stats === 'string' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={stats}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleThemeChange('footer.stats', e.target.value)
                        }
                        placeholder="+40"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => handleThemeChange('footer.stats', null)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Limpar
                      </Button>
                    </div>
                  ) : Array.isArray(stats) && stats.length > 0 ? (
                    stats.map((stat, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-zinc-500 mb-1">Label</label>
                            <Input
                              type="text"
                              value={stat.label || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleStatsChange(index, 'label', e.target.value)
                              }
                              placeholder="30 Min"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-500 mb-1">Sublabel</label>
                            <Input
                              type="text"
                              value={stat.sublabel || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                handleStatsChange(index, 'sublabel', e.target.value)
                              }
                              placeholder="Duração da Sessão"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeStatItem(index)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          variant="danger"
                        >
                          Remover
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500">Nenhum item adicionado</p>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-3">
                  Pode ser uma string simples (ex: &quot;+40&quot;) ou um array de objetos com label/sublabel
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderLayoutSection = () => {
    const currentThemeData = getCurrentThemeData();
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Layout" 
          section="layout" 
          icon={Layout}
          isExpanded={expandedSections.layout}
          onToggle={toggleSection}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.layout ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Tipo de Layout
              </label>
              <select
                value={currentThemeData.layout || "simple"}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  handleThemeChange('layout', e.target.value)
                }
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                <option value="simple">Simple</option>
                <option value="complex">Complex</option>
                <option value="refined">Refined</option>
              </select>
              <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <p><strong>Simple:</strong> Layout limpo e direto</p>
                <p><strong>Complex:</strong> Layout com mais elementos visuais e efeitos</p>
                <p><strong>Refined:</strong> Layout refinado com gradientes e detalhes sofisticados</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={Layers}
      title="Hero Sections"
      description="Configure as seções hero para diferentes páginas (E-commerce, Marketing, Sobre)"
      exists={!!exists}
      itemName="Hero Section"
    >
      <div className="space-y-6 pb-32">
        {/* Tabs de Temas */}
        <Card className="p-6">
          <div className="flex flex-wrap gap-2">
            <ThemeTab 
              themeKey="ecommerce" 
              label="E-commerce" 
              isActive={activeTheme === "ecommerce"} 
              onClick={setActiveTheme} 
            />
            <ThemeTab 
              themeKey="marketing" 
              label="Marketing" 
              isActive={activeTheme === "marketing"} 
              onClick={setActiveTheme} 
            />
            <ThemeTab 
              themeKey="sobre" 
              label="Sobre" 
              isActive={activeTheme === "sobre"} 
              onClick={setActiveTheme} 
            />
          </div>
        </Card>

        {/* Seções do Hero */}
        <div className="space-y-6">
          {renderBadgeSection()}
          {renderTitleSection()}
          {renderSubtitleSection()}
          {renderButtonSection()}
          {renderFooterSection()}
          {renderLayoutSection()}

          {/* Fixed Action Bar */}
          <FixedActionBar
            onDeleteAll={openDeleteAllModal}
            onSubmit={handleSubmitWrapper}
            isAddDisabled={!canAddNewItem || isLimitReached}
            isSaving={loading}
            exists={!!exists}
            completeCount={completeCount}
            totalCount={totalCount}
            itemName="Hero Section"
            icon={Layers}
          />
        </div>

        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          type={deleteModal.type}
          itemTitle={deleteModal.title}
          totalItems={3}
          itemName="Hero Section"
        />

        <FeedbackMessages success={success} errorMsg={errorMsg} />
      </div>
    </ManageLayout>
  );
}