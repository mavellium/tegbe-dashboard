/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { 
  Type, 
  Tag, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  LucideIcon
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import IconSelector from "@/components/IconSelector";
import { useJsonManagement } from "@/hooks/useJsonManagement";

interface BadgeData {
  text?: string;
}

interface TitleData {
  part1?: string;
  part2?: string;
  highlight?: string;
  gradient?: string;
}

interface SubtitleData {
  text?: string;
  highlight?: string;
  strong1?: string;
  strong2?: string;
}

interface CtaData {
  text?: string;
  icon?: string;
  href?: string;
}

interface CtaSubtitleData {
  text?: string;
}

interface HeroPageData {
  badge?: BadgeData;
  title?: TitleData;
  subtitle?: SubtitleData;
  cta?: CtaData;
  ctaSubtitle?: string | CtaSubtitleData;
}

interface HeroTextsData {
  ecommerce?: HeroPageData;
  marketing?: HeroPageData;
}

// Função para criar dados padrão de forma independente
const createDefaultHeroPageData = (): HeroPageData => ({
  badge: { text: "" },
  title: { part1: "", part2: "", highlight: "", gradient: "" },
  subtitle: { text: "", highlight: "", strong1: "", strong2: "" },
  cta: { text: "", icon: "", href: "" },
  ctaSubtitle: ""
});

const defaultHeroTextsData: HeroTextsData = {
  ecommerce: createDefaultHeroPageData(),
  marketing: createDefaultHeroPageData()
};

// Valores de exemplo para referência
const exampleData = {
  ecommerce: {
    badge: {
      text: "Método Validado Tegbe"
    },
    title: {
      part1: "Por que vender com a ",
      part2: "Tegbe",
      highlight: "e não sozinho?"
    },
    subtitle: {
      text: "Vender sozinho é tentar a sorte. Com a Tegbe, você aplica o método que ",
      highlight: "destrava o faturamento"
    },
    cta: {
      text: "FALAR COM UM ESPECIALISTA",
      icon: "ph:chart-line-up-bold"
    },
    ctaSubtitle: "Plano de guerra para vender mais"
  },
  marketing: {
    badge: {
      text: "Engenharia de Vendas"
    },
    title: {
      part1: "Por que contratar a ",
      part2: "Tegbe",
      gradient: "e não uma agência comum?"
    },
    subtitle: {
      text: "Agências comuns vendem 'posts criativos' e esperam um milagre. Nós instalamos um ",
      strong1: "Ecossistema de Receita",
      strong2: "(Tráfego + CRM + IA) que elimina a sorte e transforma dados em ",
      highlight: "lucro líquido."
    },
    cta: {
      text: "AGENDAR DIAGNÓSTICO",
      icon: "lucide:arrow-right",
      href: "#diagnostico"
    },
    ctaSubtitle: {
      text: "Agenda de Consultoria Liberada"
    }
  }
} as const;

const expandedSectionsDefault = {
  badge: true,
  title: true,
  subtitle: true,
  cta: true,
  ctaSubtitle: true
};

// Componente SectionHeader
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

// Componente ThemeTab
interface ThemeTabProps {
  themeKey: "ecommerce" | "marketing";
  label: string;
  isActive: boolean;
  onClick: (theme: "ecommerce" | "marketing") => void;
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

// Helper para obter valores de exemplo com type safety
const getExampleValue = (theme: "ecommerce" | "marketing", path: string): string => {
  const keys = path.split('.');
  let value: any = exampleData[theme];
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return '';
    }
  }
  
  return value || '';
};

export default function HeroTextsPage() {
  const [activeTheme, setActiveTheme] = useState<"ecommerce" | "marketing">("ecommerce");
  const [expandedSections, setExpandedSections] = useState(expandedSectionsDefault);
  
  const {
    data: heroTextsData,
    setData: setHeroTextsData,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload,
    updateNested
  } = useJsonManagement<HeroTextsData>({
    apiPath: "/api/tegbe-institucional/json/equipe",
    defaultData: defaultHeroTextsData,
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });

  // Estado local para os dados do tema atual
  const [currentThemeData, setCurrentThemeData] = useState<HeroPageData>(createDefaultHeroPageData());

  // Atualizar dados do tema atual quando activeTheme ou heroTextsData mudar
  useEffect(() => {
    if (heroTextsData && heroTextsData[activeTheme]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentThemeData({
        ...createDefaultHeroPageData(),
        ...heroTextsData[activeTheme]
      });
    } else {
      setCurrentThemeData(createDefaultHeroPageData());
    }
  }, [activeTheme, heroTextsData]);

  // Calcular campos completos
  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    // Verificar campos básicos com encadeamento opcional
    if (currentThemeData.badge?.text?.trim() !== "") count++;
    if (currentThemeData.title?.part1?.trim() !== "" || currentThemeData.title?.part2?.trim() !== "") count++;
    if (currentThemeData.subtitle?.text?.trim() !== "") count++;
    if (currentThemeData.cta?.text?.trim() !== "") count++;
    
    // Verificar ctaSubtitle (pode ser string ou objeto)
    if (typeof currentThemeData.ctaSubtitle === 'string') {
      if (currentThemeData.ctaSubtitle.trim() !== "") count++;
    } else if (currentThemeData.ctaSubtitle?.text?.trim() !== "") {
      count++;
    }
    
    return count;
  }, [currentThemeData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 5; // badge, title, subtitle, cta, ctaSubtitle
  const canAddNewItem = false;
  const isLimitReached = false;

  const toggleSection = (section: keyof typeof expandedSectionsDefault) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleThemeChange = useCallback((path: string, value: any) => {
    // Atualizar dados locais
    setCurrentThemeData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });

    // Atualizar dados no estado global
    updateNested(`${activeTheme}.${path}`, value);
  }, [activeTheme, updateNested]);

  const handleSubmitWrapper = async () => {
    try {
      // Primeiro atualizar o estado global com os dados atuais
      const updatedData = {
        ...heroTextsData,
        [activeTheme]: currentThemeData
      };
      
      setHeroTextsData(updatedData);
      
      // Depois salvar
      const fd = new FormData();
      fd.append("values", JSON.stringify(updatedData));
      await save(fd);
      
      // Recarregar dados da API
      await reload();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODOS OS TEXTO Equipe"
    });
  };

  const confirmDelete = async () => {
    try {
      await fetch("/api/tegbe-institucional/json/equipe", {
        method: "DELETE",
      });
      
      setHeroTextsData(defaultHeroTextsData);
      setCurrentThemeData(createDefaultHeroPageData());
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

  const getCtaSubtitlePlaceholder = () => {
    if (activeTheme === "ecommerce") {
      return typeof exampleData.ecommerce.ctaSubtitle === 'string' 
        ? exampleData.ecommerce.ctaSubtitle 
        : "";
    } else {
      return typeof exampleData.marketing.ctaSubtitle === 'object' 
        ? exampleData.marketing.ctaSubtitle.text 
        : "";
    }
  };

  const renderBadgeSection = () => {
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
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Texto do Badge
              </label>
              <Input
                type="text"
                placeholder={getExampleValue(activeTheme, 'badge.text')}
                value={badgeData.text || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleThemeChange('badge.text', e.target.value)
                }
              />
              <p className="text-xs text-zinc-500 mt-1">
                Texto curto e impactante que aparece no topo da seção
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderTitleSection = () => {
    const titleData = currentThemeData.title || {};
    
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
          <Card className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Primeira Parte do Título
              </label>
              <Input
                type="text"
                placeholder={getExampleValue(activeTheme, 'title.part1')}
                value={titleData.part1 || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleThemeChange('title.part1', e.target.value)
                }
              />
              <p className="text-xs text-zinc-500 mt-1">
                Texto antes do destaque
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Segunda Parte do Título (Destaque)
              </label>
              <Input
                type="text"
                placeholder={getExampleValue(activeTheme, 'title.part2')}
                value={titleData.part2 || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleThemeChange('title.part2', e.target.value)
                }
              />
              <p className="text-xs text-zinc-500 mt-1">
                Parte destacada do título
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Texto em Destaque (Highlight)
              </label>
              <Input
                type="text"
                placeholder={getExampleValue(activeTheme, 'title.highlight') || ""}
                value={titleData.highlight || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleThemeChange('title.highlight', e.target.value)
                }
              />
              <p className="text-xs text-zinc-500 mt-1">
                Texto que aparece com destaque especial (E-commerce)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Texto com Gradiente
              </label>
              <Input
                type="text"
                placeholder={getExampleValue(activeTheme, 'title.gradient') || ""}
                value={titleData.gradient || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleThemeChange('title.gradient', e.target.value)
                }
              />
              <p className="text-xs text-zinc-500 mt-1">
                Texto que aparece com efeito gradiente (Marketing)
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderSubtitleSection = () => {
    const subtitleData = currentThemeData.subtitle || {};
    
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
          <Card className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Texto do Subtítulo
              </label>
              <textarea
                placeholder={getExampleValue(activeTheme, 'subtitle.text')}
                value={subtitleData.text || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  handleThemeChange('subtitle.text', e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Texto principal do subtítulo
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Texto em Destaque (Highlight)
              </label>
              <Input
                type="text"
                placeholder={getExampleValue(activeTheme, 'subtitle.highlight') || ""}
                value={subtitleData.highlight || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleThemeChange('subtitle.highlight', e.target.value)
                }
              />
              <p className="text-xs text-zinc-500 mt-1">
                Palavras ou frase em destaque
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Texto Forte 1
              </label>
              <Input
                type="text"
                placeholder={getExampleValue(activeTheme, 'subtitle.strong1') || ""}
                value={subtitleData.strong1 || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleThemeChange('subtitle.strong1', e.target.value)
                }
              />
              <p className="text-xs text-zinc-500 mt-1">
                Primeira parte em negrito (Marketing)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Texto Forte 2
              </label>
              <Input
                type="text"
                placeholder={getExampleValue(activeTheme, 'subtitle.strong2') || ""}
                value={subtitleData.strong2 || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleThemeChange('subtitle.strong2', e.target.value)
                }
              />
              <p className="text-xs text-zinc-500 mt-1">
                Segunda parte em negrito (Marketing)
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderCtaSection = () => {
    const ctaData = currentThemeData.cta || {};
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Botão de Ação (CTA)" 
          section="cta" 
          icon={Zap}
          isExpanded={expandedSections.cta}
          onToggle={toggleSection}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.cta ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <IconSelector
                  value={ctaData.icon || ""}
                  onChange={(value) => handleThemeChange('cta.icon', value)}
                  label="Ícone do Botão"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Texto do Botão
                </label>
                <Input
                  type="text"
                  placeholder={getExampleValue(activeTheme, 'cta.text')}
                  value={ctaData.text || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('cta.text', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Link (URL)
                </label>
                <Input
                  type="text"
                  placeholder={getExampleValue(activeTheme, 'cta.href') || "#"}
                  value={ctaData.href || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('cta.href', e.target.value)
                  }
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Use # para âncora ou URL completa
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderCtaSubtitleSection = () => {
    const ctaSubtitle = currentThemeData.ctaSubtitle;
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Subtítulo do CTA" 
          section="ctaSubtitle" 
          icon={Type}
          isExpanded={expandedSections.ctaSubtitle}
          onToggle={toggleSection}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.ctaSubtitle ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Texto do Subtítulo do CTA
              </label>
              {activeTheme === "ecommerce" ? (
                <Input
                  type="text"
                  placeholder={getCtaSubtitlePlaceholder()}
                  value={typeof ctaSubtitle === 'string' ? ctaSubtitle : ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('ctaSubtitle', e.target.value)
                  }
                />
              ) : (
                <Input
                  type="text"
                  placeholder={getCtaSubtitlePlaceholder()}
                  value={typeof ctaSubtitle === 'object' ? ctaSubtitle?.text || "" : ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('ctaSubtitle.text', e.target.value)
                  }
                />
              )}
              <p className="text-xs text-zinc-500 mt-1">
                {activeTheme === "ecommerce" 
                  ? "Texto abaixo do botão principal (E-commerce)" 
                  : "Texto abaixo do botão principal (Marketing)"}
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={Type}
      title="Textos Equipe - E-commerce & Marketing"
      description="Configure os textos da seção hero das páginas E-commerce e Marketing"
      exists={!!exists}
      itemName="Textos Equipe"
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
          </div>
        </Card>

        {/* Seções dos Textos Equipe */}
        <div className="space-y-6">
          {renderBadgeSection()}
          {renderTitleSection()}
          {renderSubtitleSection()}
          {renderCtaSection()}
          {renderCtaSubtitleSection()}

          {/* Fixed Action Bar */}
          <FixedActionBar
            onDeleteAll={openDeleteAllModal}
            onSubmit={handleSubmitWrapper}
            isAddDisabled={!canAddNewItem || isLimitReached}
            isSaving={loading}
            exists={!!exists}
            completeCount={completeCount}
            totalCount={totalCount}
            itemName="Textos Equipe"
            icon={Type}
          />
        </div>

        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          type={deleteModal.type}
          itemTitle={deleteModal.title}
          totalItems={2}
          itemName="Textos Equipe"
        />

        <FeedbackMessages success={success} errorMsg={errorMsg} />
      </div>
    </ManageLayout>
  );
}