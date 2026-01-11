/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import { 
  VideoIcon,
  ImageIcon,
  Type,
  Settings,
  Layers,
  ChevronDown,
  ChevronUp,
  Headphones,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Eye
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { VideoUpload } from "@/components/VideoUpload";
import { ImageUpload } from "@/components/ImageUpload";

interface AssetsData {
  video_url: string;
  noise_texture: string;
}

interface MetadataData {
  component: string;
  vision: string;
  assets: AssetsData;
}

interface HeadlineLine2 {
  prefix: string;
  highlight: string;
  suffix: string;
}

interface HeadlineData {
  line_1: string;
  line_2: HeadlineLine2;
  subline: string;
}

interface LabelsData {
  loading: string;
  error: string;
}

interface ContentData {
  headline: HeadlineData;
  labels: LabelsData;
}

interface ShowcaseData {
  metadata: MetadataData;
  content: ContentData;
}

const defaultData: ShowcaseData = {
  metadata: {
    component: "Showcase",
    vision: "Performance e Emoção Ferrari",
    assets: {
      video_url: "",
      noise_texture: ""
    }
  },
  content: {
    headline: {
      line_1: "SE NÃO FOR",
      line_2: {
        prefix: "PARA",
        highlight: "GANHAR",
        suffix: ","
      },
      subline: "NEM COMEÇA."
    },
    labels: {
      loading: "Carregando Experiência...",
      error: "Vídeo indisponível no momento."
    }
  }
};

const mergeWithDefaults = (apiData: any, defaultData: ShowcaseData): ShowcaseData => {
  if (!apiData) return defaultData;
  
  return {
    metadata: {
      component: apiData.metadata?.component || defaultData.metadata.component,
      vision: apiData.metadata?.vision || defaultData.metadata.vision,
      assets: {
        video_url: apiData.metadata?.assets?.video_url || defaultData.metadata.assets.video_url,
        noise_texture: apiData.metadata?.assets?.noise_texture || defaultData.metadata.assets.noise_texture
      }
    },
    content: {
      headline: {
        line_1: apiData.content?.headline?.line_1 || defaultData.content.headline.line_1,
        line_2: {
          prefix: apiData.content?.headline?.line_2?.prefix || defaultData.content.headline.line_2.prefix,
          highlight: apiData.content?.headline?.line_2?.highlight || defaultData.content.headline.line_2.highlight,
          suffix: apiData.content?.headline?.line_2?.suffix || defaultData.content.headline.line_2.suffix
        },
        subline: apiData.content?.headline?.subline || defaultData.content.headline.subline
      },
      labels: {
        loading: apiData.content?.labels?.loading || defaultData.content.labels.loading,
        error: apiData.content?.labels?.error || defaultData.content.labels.error
      }
    }
  };
};

export default function ShowcasePage() {
  const [expandedSections, setExpandedSections] = useState({
    metadata: true,
    content: false
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
    apiPath: "/api/tegbe-institucional/json/video-marketing",
    defaultData: defaultData,
    mergeFunction: mergeWithDefaults,
  });

  const currentData = componentData || defaultData;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    updateNested(path, value);
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

    // Metadata
    total += 2;
    if (currentData.metadata.component?.trim()) completed++;
    if (currentData.metadata.vision?.trim()) completed++;

    // Assets
    total += 2;
    if (currentData.metadata.assets.video_url?.trim()) completed++;
    if (currentData.metadata.assets.noise_texture?.trim()) completed++;

    // Headline
    total += 1;
    if (currentData.content.headline.line_1?.trim()) completed++;
    
    total += 3;
    if (currentData.content.headline.line_2.prefix?.trim()) completed++;
    if (currentData.content.headline.line_2.highlight?.trim()) completed++;
    if (currentData.content.headline.line_2.suffix?.trim()) completed++;
    
    total += 1;
    if (currentData.content.headline.subline?.trim()) completed++;

    // Labels
    total += 2;
    if (currentData.content.labels.loading?.trim()) completed++;
    if (currentData.content.labels.error?.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layers} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={VideoIcon}
      title="Showcase"
      description="Configure a seção de showcase com vídeo de alta performance"
      exists={!!exists}
      itemName="Showcase"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Metadata */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações do Componente"
            section="metadata"
            icon={Settings}
            isExpanded={expandedSections.metadata}
            onToggle={() => toggleSection("metadata")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.metadata ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Nome do Componente"
                    value={currentData.metadata.component}
                    onChange={(e) => handleChange('metadata.component', e.target.value)}
                    placeholder="Ex: Showcase"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div>
                  <Input
                    label="Visão/Inspiração"
                    value={currentData.metadata.vision}
                    onChange={(e) => handleChange('metadata.vision', e.target.value)}
                    placeholder="Ex: Performance e Emoção Ferrari"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>

              {/* Assets - Upload de Vídeo */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                  <VideoIcon className="w-5 h-5" />
                  Vídeo do Showcase
                </h4>
                <VideoUpload
                  label="Vídeo Principal"
                  currentVideo={currentData.metadata.assets.video_url}
                  selectedFile={getFileFromState('metadata.assets.video_url')}
                  onFileChange={(file) => setFileState('metadata.assets.video_url', file)}
                  aspectRatio="aspect-video"
                  previewWidth={800}
                  previewHeight={450}
                  description="Vídeo de alta qualidade para o showcase (recomendado: .webm ou .mp4)"
                />
              </div>

              {/* Assets - Upload de Textura */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Textura de Ruído
                </h4>
                <ImageUpload
                  label="Textura de Ruído (SVG)"
                  currentImage={currentData.metadata.assets.noise_texture}
                  selectedFile={getFileFromState('metadata.assets.noise_texture')}
                  onFileChange={(file) => setFileState('metadata.assets.noise_texture', file)}
                  aspectRatio="aspect-square"
                  previewWidth={200}
                  previewHeight={200}
                  description="Textura SVG de ruído granular para efeitos visuais"
                />
                <div className="text-xs text-[var(--color-secondary)]/70 mt-2">
                  <p>Recomendações:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>Formato: SVG para escalabilidade</li>
                    <li>Dimensões: 512x512 ou 1024x1024</li>
                    <li>Transparência: Recomendado fundo transparente</li>
                    <li>Uso: Efeito de ruído granular sobreposto ao vídeo</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Conteúdo */}
        <div className="space-y-4">
          <SectionHeader
            title="Conteúdo do Showcase"
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
              {/* Headline */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Headline Impactante
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <Input
                      label="Linha 1"
                      value={currentData.content.headline.line_1}
                      onChange={(e) => handleChange('content.headline.line_1', e.target.value)}
                      placeholder="Ex: SE NÃO FOR"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                      Primeira linha do headline, geralmente em caixa alta
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Input
                        label="Prefixo da Linha 2"
                        value={currentData.content.headline.line_2.prefix}
                        onChange={(e) => handleChange('content.headline.line_2.prefix', e.target.value)}
                        placeholder="Ex: PARA"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>

                    <div>
                      <Input
                        label="Destaque da Linha 2"
                        value={currentData.content.headline.line_2.highlight}
                        onChange={(e) => handleChange('content.headline.line_2.highlight', e.target.value)}
                        placeholder="Ex: GANHAR"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                      <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                        Palavra que será destacada visualmente
                      </p>
                    </div>

                    <div>
                      <Input
                        label="Sufixo da Linha 2"
                        value={currentData.content.headline.line_2.suffix}
                        onChange={(e) => handleChange('content.headline.line_2.suffix', e.target.value)}
                        placeholder="Ex: ,"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Subline"
                      value={currentData.content.headline.subline}
                      onChange={(e) => handleChange('content.headline.subline', e.target.value)}
                      placeholder="Ex: NEM COMEÇA."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                      Frase de impacto abaixo do headline principal
                    </p>
                  </div>
                </div>
              </div>

              {/* Labels */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Labels e Mensagens
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      label="Mensagem de Carregamento"
                      value={currentData.content.labels.loading}
                      onChange={(e) => handleChange('content.labels.loading', e.target.value)}
                      placeholder="Ex: Carregando Experiência..."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                      Exibida enquanto o vídeo está carregando
                    </p>
                  </div>

                  <div>
                    <Input
                      label="Mensagem de Erro"
                      value={currentData.content.labels.error}
                      onChange={(e) => handleChange('content.labels.error', e.target.value)}
                      placeholder="Ex: Vídeo indisponível no momento."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                      Exibida caso o vídeo não possa ser carregado
                    </p>
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
          itemName="Showcase"
          icon={VideoIcon}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Showcase"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}