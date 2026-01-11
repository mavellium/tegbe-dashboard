/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { 
  Crown,
  Target,
  ImageIcon,
  Type,
  Tag,
  Palette,
  Sparkles,
  ArrowRight,
  Layers,
  FileText,
  Settings,
  CheckCircle2
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";
import { ImageUpload } from "@/components/ImageUpload";
import ColorPicker from "@/components/ColorPicker";
import IconSelector from "@/components/IconSelector";

interface ThemeData {
  accentColor: string;
  secondaryColor: string;
}

interface HeaderData {
  badgeIcon: string;
  badgeText: string;
  titleLine1: string;
  titleHighlight: string;
}

interface FloatingCard {
  icon: string;
  title: string;
  subtitle: string;
}

interface VisualData {
  imageSrc: string;
  imageAlt: string;
  floatingCard: FloatingCard;
}

interface ContentData {
  paragraph1: string;
  paragraph2: string;
}

interface CTAData {
  text: string;
  link: string;
}

interface MethodData {
  id: string;
  type: string;
  subtype: string;
  theme: ThemeData;
  header: HeaderData;
  visual: VisualData;
  content: ContentData;
  cta: CTAData;
}

const defaultMethodData: MethodData = {
  id: "metodo-tegpro",
  type: "",
  subtype: "",
  theme: {
    accentColor: "#FFD700",
    secondaryColor: "#B8860B"
  },
  header: {
    badgeIcon: "ph:strategy-bold",
    badgeText: "Método Proprietário",
    titleLine1: "Não é sorte. É engenharia.",
    titleHighlight: "Processos que replicam sucesso."
  },
  visual: {
    imageSrc: "",
    imageAlt: "Dashboards de Alunos TegPro",
    floatingCard: {
      icon: "ph:crown-simple-fill",
      title: "Protocolo Validado",
      subtitle: "Aplicado em +1.200 negócios"
    }
  },
  content: {
    paragraph1: "Você acabou de ver os resultados acima. Nenhum deles aconteceu por acaso. Eles aconteceram porque instalaram o <strong>Sistema Operacional TegPro</strong>.",
    paragraph2: "Não vendemos 'hacks' que param de funcionar na próxima atualização. Ensinamos <strong>fundamentos de negócios</strong>: aquisição de clientes, processos comerciais e gestão financeira. É assim que transformamos autônomos em <strong style='border-bottom: 1px solid #FFD700'>empresários de escala.</strong>"
  },
  cta: {
    text: "Acessar o Protocolo",
    link: "#planos"
  }
};

const mergeWithDefaults = (apiData: any, defaultData: MethodData): MethodData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id || defaultData.id,
    type: apiData.type || defaultData.type,
    subtype: apiData.subtype || defaultData.subtype,
    theme: apiData.theme || defaultData.theme,
    header: apiData.header || defaultData.header,
    visual: apiData.visual || defaultData.visual,
    content: apiData.content || defaultData.content,
    cta: apiData.cta || defaultData.cta,
  };
};

export default function MethodPage() {
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
    fileStates,
    setFileState,
  } = useJsonManagement<MethodData>({
    apiPath: "/api/tegbe-institucional/json/expertise-curso",
    defaultData: defaultMethodData,
    mergeFunction: mergeWithDefaults,
  });

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    theme: false,
    header: false,
    visual: false,
    content: false,
    cta: false
  });

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

  // Função auxiliar para obter File do fileStates
  const getFileFromState = (key: string): File | null => {
    const value = fileStates[key];
    return value instanceof File ? value : null;
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Informações básicas
    total += 2; // type e subtype
    if (pageData.type.trim()) completed++;
    if (pageData.subtype.trim()) completed++;

    // Tema
    total += 2;
    if (pageData.theme.accentColor.trim()) completed++;
    if (pageData.theme.secondaryColor.trim()) completed++;

    // Header
    total += 4;
    if (pageData.header.badgeIcon.trim()) completed++;
    if (pageData.header.badgeText.trim()) completed++;
    if (pageData.header.titleLine1.trim()) completed++;
    if (pageData.header.titleHighlight.trim()) completed++;

    // Visual
    total += 5;
    if (pageData.visual.imageSrc.trim()) completed++;
    if (pageData.visual.imageAlt.trim()) completed++;
    if (pageData.visual.floatingCard.icon.trim()) completed++;
    if (pageData.visual.floatingCard.title.trim()) completed++;
    if (pageData.visual.floatingCard.subtitle.trim()) completed++;

    // Content
    total += 2;
    if (pageData.content.paragraph1.trim()) completed++;
    if (pageData.content.paragraph2.trim()) completed++;

    // CTA
    total += 2;
    if (pageData.cta.text.trim()) completed++;
    if (pageData.cta.link.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layers} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Layers}
      title="Método Proprietário TegPro"
      description="Gerencie o conteúdo e visual da seção que apresenta o método proprietário"
      exists={!!exists}
      itemName="Método"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Básica */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações da Seção"
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
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Tipo de Conteúdo"
                    value={pageData.type}
                    onChange={(e) => updateNested('type', e.target.value)}
                    placeholder="Tipo de conteúdo"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Subtipo/Categoria"
                    value={pageData.subtype}
                    onChange={(e) => updateNested('subtype', e.target.value)}
                    placeholder="Subtipo/categoria"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Tema */}
        <div className="space-y-4">
          <SectionHeader
            title="Tema e Cores"
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Cor de Destaque (Acentuação)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={pageData.theme.accentColor}
                        onChange={(e) => updateNested('theme.accentColor', e.target.value)}
                        placeholder="#FFD700"
                        className="flex-1 bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono"
                      />
                      <ColorPicker
                        color={pageData.theme.accentColor}
                        onChange={(color) => updateNested('theme.accentColor', color)}
                      />
                    </div>
                    <p className="text-xs text-[var(--color-secondary)]/70">
                      Cor principal para destaques e elementos importantes
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Cor Secundária
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={pageData.theme.secondaryColor}
                        onChange={(e) => updateNested('theme.secondaryColor', e.target.value)}
                        placeholder="#B8860B"
                        className="flex-1 bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono"
                      />
                      <ColorPicker
                        color={pageData.theme.secondaryColor}
                        onChange={(color) => updateNested('theme.secondaryColor', color)}
                      />
                    </div>
                    <p className="text-xs text-[var(--color-secondary)]/70">
                      Cor de apoio e elementos complementares
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho"
            section="header"
            icon={Type}
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
                      Ícone do Badge
                    </label>
                    <IconSelector
                      value={pageData.header.badgeIcon}
                      onChange={(value) => updateNested('header.badgeIcon', value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Texto do Badge
                    </label>
                    <Input
                      value={pageData.header.badgeText}
                      onChange={(e) => updateNested('header.badgeText', e.target.value)}
                      placeholder="Método Proprietário"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Linha 1 do Título
                    </label>
                    <Input
                      value={pageData.header.titleLine1}
                      onChange={(e) => updateNested('header.titleLine1', e.target.value)}
                      placeholder="Não é sorte. É engenharia."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Destaque do Título
                    </label>
                    <Input
                      value={pageData.header.titleHighlight}
                      onChange={(e) => updateNested('header.titleHighlight', e.target.value)}
                      placeholder="Processos que replicam sucesso."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-semibold"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Visual */}
        <div className="space-y-4">
          <SectionHeader
            title="Visual e Imagem"
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
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Imagem Principal
                  </label>
                  <ImageUpload
                    label=""
                    currentImage={pageData.visual.imageSrc || ''}
                    selectedFile={getFileFromState('visual.imageSrc')}
                    onFileChange={(file) => setFileState('visual.imageSrc', file)}
                    aspectRatio="aspect-video"
                    previewWidth={600}
                    previewHeight={400}
                    description="Imagem principal da seção (formato recomendado: 3:2)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Texto Alternativo da Imagem
                  </label>
                  <Input
                    value={pageData.visual.imageAlt}
                    onChange={(e) => updateNested('visual.imageAlt', e.target.value)}
                    placeholder="Dashboards de Alunos TegPro"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70">
                    Descrição da imagem para acessibilidade e SEO
                  </p>
                </div>

                {/* Floating Card */}
                <div className="border border-[var(--color-border)] rounded-lg p-6">
                  <h4 className="font-medium text-[var(--color-secondary)] mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Card Flutuante
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Ícone do Card
                      </label>
                      <IconSelector
                        value={pageData.visual.floatingCard.icon}
                        onChange={(value) => updateNested('visual.floatingCard.icon', value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Título do Card
                      </label>
                      <Input
                        value={pageData.visual.floatingCard.title}
                        onChange={(e) => updateNested('visual.floatingCard.title', e.target.value)}
                        placeholder="Protocolo Validado"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Subtítulo do Card
                      </label>
                      <Input
                        value={pageData.visual.floatingCard.subtitle}
                        onChange={(e) => updateNested('visual.floatingCard.subtitle', e.target.value)}
                        placeholder="Aplicado em +1.200 negócios"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
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
            icon={FileText}
            isExpanded={expandedSections.content}
            onToggle={() => toggleSection("content")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.content ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Parágrafo 1 (HTML permitido)
                  </label>
                  <TextArea
                    value={pageData.content.paragraph1}
                    onChange={(e) => updateNested('content.paragraph1', e.target.value)}
                    placeholder="Você acabou de ver os resultados acima. Nenhum deles aconteceu por acaso..."
                    rows={4}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70">
                    Use tags HTML como &lt;strong&gt; para texto em negrito
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Parágrafo 2 (HTML permitido)
                  </label>
                  <TextArea
                    value={pageData.content.paragraph2}
                    onChange={(e) => updateNested('content.paragraph2', e.target.value)}
                    placeholder="Não vendemos 'hacks' que param de funcionar na próxima atualização..."
                    rows={4}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono"
                  />
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
            icon={ArrowRight}
            isExpanded={expandedSections.cta}
            onToggle={() => toggleSection("cta")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.cta ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Texto do CTA
                    </label>
                    <Input
                      value={pageData.cta.text}
                      onChange={(e) => updateNested('cta.text', e.target.value)}
                      placeholder="Acessar o Protocolo"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Link do CTA
                    </label>
                    <Input
                      value={pageData.cta.link}
                      onChange={(e) => updateNested('cta.link', e.target.value)}
                      placeholder="#planos"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
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
          itemName="Método"
          icon={Layers}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Método"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}