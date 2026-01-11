/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import IconSelector from "@/components/IconSelector";
import { 
  TrendingUp,
  Palette,
  Type,
  Settings,
  Layers,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Zap,
  CheckCircle2,
  School,
  Target,
  Star,
  Link as LinkIcon
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { hexToTailwindTextClass, tailwindToHex } from "@/lib/colors";
import { ImageUpload } from "@/components/ImageUpload";

interface ThemeData {
  accentColor: string;
  secondaryColor: string;
  buttonTextColor: string;
  buttonIconColor: string;
}

interface HeaderData {
  badgeIcon: string;
  badgeText: string;
  titleLine1: string;
  titleHighlight: string;
}

interface FloatingCardData {
  icon: string;
  title: string;
  subtitle: string;
}

interface VisualData {
  imageSrc: string;
  imageAlt: string;
  floatingCard: FloatingCardData;
}

interface ContentData {
  paragraph1: string;
  paragraph2: string;
}

interface CTAData {
  text: string;
  link: string;
}

interface SectionData {
  theme: ThemeData;
  header: HeaderData;
  visual: VisualData;
  content: ContentData;
  cta: CTAData;
}

interface ShowcaseData {
  marketing: SectionData;
  cursos: SectionData;
}

const defaultData: ShowcaseData = {
  marketing: {
    theme: {
      accentColor: "#FF0F43",
      secondaryColor: "#E31B63",
      buttonTextColor: "#FFFFFF",
      buttonIconColor: "#FFFFFF"
    },
    header: {
      badgeIcon: "mdi:ChartLineVariant",
      badgeText: "Engenharia de Vendas",
      titleLine1: "Design de Elite focado em",
      titleHighlight: "Alta Conversão"
    },
    visual: {
      imageSrc: "",
      imageAlt: "Marketing de Performance",
      floatingCard: {
        icon: "mdi:trending-up",
        title: "ROI Exponencial",
        subtitle: "Data-Driven"
      }
    },
    content: {
      paragraph1: "Transformamos tráfego frio em <strong>lucro real</strong> através de ecossistemas que rodam 24/7.",
      paragraph2: "Seu negócio merece uma estrutura que evoque <strong>autoridade e desejo</strong> imediato."
    },
    cta: {
      text: "Escalar meu faturamento",
      link: "#contato"
    }
  },
  cursos: {
    theme: {
      accentColor: "#FFD700",
      secondaryColor: "#B8860B",
      buttonTextColor: "#000000",
      buttonIconColor: "#000000"
    },
    header: {
      badgeIcon: "mdi:school",
      badgeText: "Ecossistema de Infoprodutos",
      titleLine1: "Experiência de Aprendizado de",
      titleHighlight: "Alto Valor Percebido"
    },
    visual: {
      imageSrc: "",
      imageAlt: "Plataforma de Alunos",
      floatingCard: {
        icon: "mdi:star",
        title: "LTV Máximo",
        subtitle: "Retenção de Alunos"
      }
    },
    content: {
      paragraph1: "Criamos LPs de lançamento e áreas de membros que transformam conhecimento em um <strong>ativo de luxo</strong>.",
      paragraph2: "O mercado de cursos está saturado de amadorismo. Nós entregamos o <strong>Padrão Rolls-Royce</strong> para o seu infoproduto."
    },
    cta: {
      text: "Profissionalizar meu curso",
      link: "#contato"
    }
  }
};

const mergeWithDefaults = (apiData: any, defaultData: ShowcaseData): ShowcaseData => {
  if (!apiData) return defaultData;
  
  const mergeSection = (apiSection: any, defaultSection: SectionData): SectionData => {
    if (!apiSection) return defaultSection;
    
    return {
      theme: {
        accentColor: apiSection.theme?.accentColor || defaultSection.theme.accentColor,
        secondaryColor: apiSection.theme?.secondaryColor || defaultSection.theme.secondaryColor,
        buttonTextColor: apiSection.theme?.buttonTextColor || defaultSection.theme.buttonTextColor,
        buttonIconColor: apiSection.theme?.buttonIconColor || defaultSection.theme.buttonIconColor
      },
      header: {
        badgeIcon: apiSection.header?.badgeIcon || defaultSection.header.badgeIcon,
        badgeText: apiSection.header?.badgeText || defaultSection.header.badgeText,
        titleLine1: apiSection.header?.titleLine1 || defaultSection.header.titleLine1,
        titleHighlight: apiSection.header?.titleHighlight || defaultSection.header.titleHighlight
      },
      visual: {
        imageSrc: apiSection.visual?.imageSrc || defaultSection.visual.imageSrc,
        imageAlt: apiSection.visual?.imageAlt || defaultSection.visual.imageAlt,
        floatingCard: {
          icon: apiSection.visual?.floatingCard?.icon || defaultSection.visual.floatingCard.icon,
          title: apiSection.visual?.floatingCard?.title || defaultSection.visual.floatingCard.title,
          subtitle: apiSection.visual?.floatingCard?.subtitle || defaultSection.visual.floatingCard.subtitle
        }
      },
      content: {
        paragraph1: apiSection.content?.paragraph1 || defaultSection.content.paragraph1,
        paragraph2: apiSection.content?.paragraph2 || defaultSection.content.paragraph2
      },
      cta: {
        text: apiSection.cta?.text || defaultSection.cta.text,
        link: apiSection.cta?.link || defaultSection.cta.link
      }
    };
  };
  
  return {
    marketing: mergeSection(apiData.marketing, defaultData.marketing),
    cursos: mergeSection(apiData.cursos, defaultData.cursos)
  };
};

export default function DualShowcasePage() {
  const [activeSection, setActiveSection] = useState<"marketing" | "cursos">("marketing");
  const [expandedSections, setExpandedSections] = useState({
    theme: true,
    header: false,
    visual: false,
    content: false,
    cta: false
  });

  const {
    data: componentData,
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
  } = useJsonManagement<ShowcaseData>({
    apiPath: "/api/tegbe-institucional/json/expertise",
    defaultData: defaultData,
    mergeFunction: mergeWithDefaults,
  });

  const currentData = componentData || defaultData;
  const currentSectionData = currentData[activeSection];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    updateNested(`${activeSection}.${path}`, value);
  };

  // Função auxiliar para obter File do fileStates
  const getFileFromState = (key: string): File | null => {
    const value = fileStates[key];
    return value instanceof File ? value : null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await save();
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Função para contar completude de uma seção
    const countSection = (section: SectionData) => {
      // Theme
      total += 4;
      Object.values(section.theme).forEach(color => {
        if (color?.trim()) completed++;
      });

      // Header
      total += 4;
      Object.values(section.header).forEach(value => {
        if (value?.trim()) completed++;
      });

      // Visual
      total += 2;
      if (section.visual.imageSrc?.trim()) completed++;
      if (section.visual.imageAlt?.trim()) completed++;
      
      // Floating Card
      total += 3;
      Object.values(section.visual.floatingCard).forEach(value => {
        if (value?.trim()) completed++;
      });

      // Content
      total += 2;
      if (section.content.paragraph1?.trim()) completed++;
      if (section.content.paragraph2?.trim()) completed++;

      // CTA
      total += 2;
      if (section.cta.text?.trim()) completed++;
      if (section.cta.link?.trim()) completed++;
    };

    // Contar ambas as seções
    countSection(currentData.marketing);
    countSection(currentData.cursos);

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layers} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={TrendingUp}
      title="Dual Showcase"
      description="Configure as seções de showcase para Marketing e Cursos"
      exists={!!exists}
      itemName="Dual Showcase"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Tabs de Seções */}
        <Card className="p-6 bg-[var(--color-background)]">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[var(--color-secondary)]">Selecione a Seção</h3>
            <p className="text-sm text-[var(--color-secondary)]/70">
              Configure diferentes versões para Marketing e Cursos
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveSection("marketing")}
              className={`px-4 py-2 font-medium rounded-lg transition-all flex items-center gap-2 ${
                activeSection === "marketing"
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-background-body)] text-[var(--color-secondary)] hover:bg-[var(--color-border)]"
              }`}
            >
              <Target className="w-4 h-4" />
              Marketing
            </button>
            
            <button
              type="button"
              onClick={() => setActiveSection("cursos")}
              className={`px-4 py-2 font-medium rounded-lg transition-all flex items-center gap-2 ${
                activeSection === "cursos"
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-background-body)] text-[var(--color-secondary)] hover:bg-[var(--color-border)]"
              }`}
            >
              <School className="w-4 h-4" />
              Cursos
            </button>
          </div>
        </Card>

        {/* Seção Tema */}
        <div className="space-y-4">
          <SectionHeader
            title="Tema de Cores"
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
                  Paleta de Cores da Seção
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Configure as cores específicas para esta seção do showcase
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ThemePropertyInput
                  property="bg"
                  label="Cor de Destaque"
                  description="Cor principal para elementos em destaque"
                  currentHex={currentSectionData.theme.accentColor}
                  tailwindClass={`bg-[${currentSectionData.theme.accentColor}]`}
                  onThemeChange={(_, hex) => handleChange('theme.accentColor', hex)}
                />

                <ThemePropertyInput
                  property="bg"
                  label="Cor Secundária"
                  description="Cor para elementos secundários e gradientes"
                  currentHex={currentSectionData.theme.secondaryColor}
                  tailwindClass={`bg-[${currentSectionData.theme.secondaryColor}]`}
                  onThemeChange={(_, hex) => handleChange('theme.secondaryColor', hex)}
                />

                <ThemePropertyInput
                  property="text"
                  label="Cor do Texto do Botão"
                  description="Cor do texto dentro dos botões"
                  currentHex={currentSectionData.theme.buttonTextColor}
                  tailwindClass={`text-[${currentSectionData.theme.buttonTextColor}]`}
                  onThemeChange={(_, hex) => handleChange('theme.buttonTextColor', hex)}
                />

                <ThemePropertyInput
                  property="text"
                  label="Cor do Ícone do Botão"
                  description="Cor dos ícones dentro dos botões"
                  currentHex={currentSectionData.theme.buttonIconColor}
                  tailwindClass={`text-[${currentSectionData.theme.buttonIconColor}]`}
                  onThemeChange={(_, hex) => handleChange('theme.buttonIconColor', hex)}
                />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho"
            section="header"
            icon={Zap}
            isExpanded={expandedSections.header}
            onToggle={() => toggleSection("header")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.header ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <IconSelector
                    value={currentSectionData.header.badgeIcon}
                    onChange={(value) => handleChange('header.badgeIcon', value)}
                    label="Ícone do Badge"
                    placeholder="mdi:ChartLineVariant"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Ícone que aparece no badge
                  </p>
                </div>

                <div>
                  <Input
                    label="Texto do Badge"
                    value={currentSectionData.header.badgeText}
                    onChange={(e) => handleChange('header.badgeText', e.target.value)}
                    placeholder="Engenharia de Vendas"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Texto pequeno acima do título
                  </p>
                </div>

                <div>
                  <Input
                    label="Linha 1 do Título"
                    value={currentSectionData.header.titleLine1}
                    onChange={(e) => handleChange('header.titleLine1', e.target.value)}
                    placeholder="Design de Elite focado em"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Primeira parte do título
                  </p>
                </div>

                <div>
                  <Input
                    label="Texto em Destaque"
                    value={currentSectionData.header.titleHighlight}
                    onChange={(e) => handleChange('header.titleHighlight', e.target.value)}
                    placeholder="Alta Conversão"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Parte do título que será destacada
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Visual */}
        <div className="space-y-4">
          <SectionHeader
            title="Elementos Visuais"
            section="visual"
            icon={ImageIcon}
            isExpanded={expandedSections.visual}
            onToggle={() => toggleSection("visual")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.visual ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-8">
              {/* Upload de Imagem */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Imagem Principal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <ImageUpload
                      label="Imagem do Showcase"
                      currentImage={currentSectionData.visual.imageSrc}
                      selectedFile={getFileFromState(`${activeSection}.visual.imageSrc`)}
                      onFileChange={(file) => setFileState(`${activeSection}.visual.imageSrc`, file)}
                      aspectRatio="aspect-video"
                      previewWidth={800}
                      previewHeight={450}
                      description="Imagem de destaque para a seção"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Input
                        label="Texto Alternativo (Alt)"
                        value={currentSectionData.visual.imageAlt}
                        onChange={(e) => handleChange('visual.imageAlt', e.target.value)}
                        placeholder="Marketing de Performance"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                      <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                        Descrição da imagem para acessibilidade
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Card Flutuante
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <IconSelector
                      value={currentSectionData.visual.floatingCard.icon}
                      onChange={(value) => handleChange('visual.floatingCard.icon', value)}
                      label="Ícone do Card"
                      placeholder="mdi:trending-up"
                    />
                  </div>

                  <div>
                    <Input
                      label="Título do Card"
                      value={currentSectionData.visual.floatingCard.title}
                      onChange={(e) => handleChange('visual.floatingCard.title', e.target.value)}
                      placeholder="ROI Exponencial"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div>
                    <Input
                      label="Subtítulo do Card"
                      value={currentSectionData.visual.floatingCard.subtitle}
                      onChange={(e) => handleChange('visual.floatingCard.subtitle', e.target.value)}
                      placeholder="Data-Driven"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Conteúdo */}
        <div className="space-y-4">
          <SectionHeader
            title="Conteúdo"
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
            <Card className="p-6 bg-[var(--color-background)] space-y-6">
              <div className="space-y-6">
                <div>
                  <TextArea
                    label="Parágrafo 1 (HTML permitido)"
                    value={currentSectionData.content.paragraph1}
                    onChange={(e) => handleChange('content.paragraph1', e.target.value)}
                    placeholder="Transformamos tráfego frio em <strong>lucro real</strong>..."
                    rows={3}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Use &lt;strong&gt; para destacar palavras importantes
                  </p>
                </div>

                <div>
                  <TextArea
                    label="Parágrafo 2 (HTML permitido)"
                    value={currentSectionData.content.paragraph2}
                    onChange={(e) => handleChange('content.paragraph2', e.target.value)}
                    placeholder="Seu negócio merece uma estrutura que evoque <strong>autoridade e desejo</strong>..."
                    rows={3}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Texto complementar com chamada emocional
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção CTA */}
        <div className="space-y-4">
          <SectionHeader
            title="Call to Action"
            section="cta"
            icon={TrendingUp}
            isExpanded={expandedSections.cta}
            onToggle={() => toggleSection("cta")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.cta ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Texto do Botão"
                    value={currentSectionData.cta.text}
                    onChange={(e) => handleChange('cta.text', e.target.value)}
                    placeholder="Escalar meu faturamento"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Texto persuasivo para ação
                  </p>
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
                    value={currentSectionData.cta.link}
                    onChange={(e) => handleChange('cta.link', e.target.value)}
                    placeholder="#contato ou /contato"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Use âncoras (#) ou caminhos relativos
                  </p>
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
          itemName="Dual Showcase"
          icon={TrendingUp}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={2}
        itemName="Dual Showcase"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}