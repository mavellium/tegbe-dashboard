/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { 
  Video,
  Palette,
  Type,
  Eye,
  Film,
  Info,
  GraduationCap,
  CheckCircle2,
  Sparkles,
  Tag,
  PaintBucket,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import ColorPicker from "@/components/ColorPicker";
import { VideoUpload } from "@/components/VideoUpload";

interface VideoContent {
  badge?: string;
  title?: string;
  videoSrc?: string;
}

interface VideoStyle {
  backgroundColor?: string;
  textColor?: string;
  badgeBg?: string;
  badgeBorder?: string;
  badgeText?: string;
  accentColor?: string;
}

interface VideoPageData {
  content?: VideoContent;
  style?: VideoStyle;
}

interface VideoSectionsData {
  sobre?: VideoPageData;
  cursos?: VideoPageData;
  defaultSection?: "sobre" | "cursos";
}

const defaultVideoPageData: VideoPageData = {
  content: {
    badge: "",
    title: "",
    videoSrc: ""
  },
  style: {
    backgroundColor: "#FFFFFF",
    textColor: "#020202",
    badgeBg: "rgba(255, 215, 0, 0.1)",
    badgeBorder: "rgba(255, 215, 0, 0.3)",
    badgeText: "#B8860B",
    accentColor: "#FFD700"
  }
};

const defaultVideoSectionsData: VideoSectionsData = {
  sobre: { ...defaultVideoPageData },
  cursos: { 
    content: {
      badge: "",
      title: "",
      videoSrc: ""
    },
    style: {
      backgroundColor: "#020202",
      textColor: "#FFFFFF",
      badgeBg: "rgba(255, 215, 0, 0.05)",
      badgeBorder: "rgba(255, 215, 0, 0.2)",
      badgeText: "#FFD700",
      accentColor: "#FFD700"
    }
  },
  defaultSection: "sobre"
};

// Componente SectionTab
interface SectionTabProps {
  sectionKey: "sobre" | "cursos";
  label: string;
  isActive: boolean;
  onClick: (section: "sobre" | "cursos") => void;
  icon: React.ReactNode;
}

const SectionTab = ({ sectionKey, label, isActive, onClick, icon }: SectionTabProps) => (
  <Button
    type="button"
    onClick={() => onClick(sectionKey)}
    variant={isActive ? "primary" : "secondary"}
    className={`px-4 py-2 font-medium rounded-lg transition-all flex items-center gap-2 ${
      isActive
        ? "bg-[var(--color-primary)] text-white shadow-md"
        : "bg-[var(--color-background)] text-[var(--color-secondary)] hover:bg-[var(--color-background)]/80 border border-[var(--color-border)]"
    }`}
  >
    {icon}
    <span>{label}</span>
  </Button>
);

export default function VideoSectionsPage() {
  const [activeSection, setActiveSection] = useState<"sobre" | "cursos">("cursos");
  const [expandedSections, setExpandedSections] = useState({
    content: true,
    style: false,
  });

  const {
    data: videoData,
    loading,
    success,
    errorMsg,
    deleteModal,
    exists,
    updateNested,
    save,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
    fileStates,
    setFileState,
  } = useJsonManagement<VideoSectionsData>({
    apiPath: "/api/tegbe-institucional/json/video-sections",
    defaultData: defaultVideoSectionsData,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Helper para obter dados da seção atual de forma segura
  const getCurrentSectionData = (): VideoPageData => {
    const sectionData = videoData?.[activeSection];
    if (!sectionData) {
      return activeSection === "cursos" 
        ? defaultVideoSectionsData.cursos! 
        : defaultVideoSectionsData.sobre!;
    }
    return sectionData;
  };

  const handleSectionChange = useCallback((path: string, value: any) => {
    updateNested(`${activeSection}.${path}`, value);
  }, [activeSection, updateNested]);

  const handleColorChange = (path: string, color: string) => {
    const cleanColor = color.startsWith('#') ? color : `#${color}`;
    handleSectionChange(path, cleanColor);
  };

  // Função auxiliar para obter File do fileStates
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

  // Calcular completude
  const calculateCompletion = () => {
    const currentSectionData = getCurrentSectionData();
    let completed = 0;
    let total = 0;

    // Conteúdo (3 campos)
    total += 3;
    if (currentSectionData.content?.badge?.trim()) completed++;
    if (currentSectionData.content?.title?.trim()) completed++;
    if (currentSectionData.content?.videoSrc?.trim()) completed++;

    // Estilo (6 campos)
    total += 6;
    if (currentSectionData.style?.backgroundColor?.trim()) completed++;
    if (currentSectionData.style?.textColor?.trim()) completed++;
    if (currentSectionData.style?.badgeBg?.trim()) completed++;
    if (currentSectionData.style?.badgeBorder?.trim()) completed++;
    if (currentSectionData.style?.badgeText?.trim()) completed++;
    if (currentSectionData.style?.accentColor?.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  // Renderizar seção de conteúdo
  const renderContentSection = () => {
    const currentSectionData = getCurrentSectionData();
    const contentData = currentSectionData.content || {};
    
    // Chave para o fileState do vídeo
    const videoFileKey = `${activeSection}.content.videoSrc`;
    
    return (
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
          animate={{ height: expandedSections.content ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6 bg-[var(--color-background)]">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Badge
                  </label>
                  <Input
                    type="text"
                    placeholder={activeSection === "sobre" ? "Nossa História" : "Metodologia TegPro"}
                    value={contentData.badge || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleSectionChange('content.badge', e.target.value)
                    }
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70">
                    Texto do badge que aparece acima do título
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Título Principal
                  </label>
                  <Input
                    type="text"
                    placeholder={activeSection === "sobre" ? "A excelência como único padrão" : "A caixa-preta finalmente aberta"}
                    value={contentData.title || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleSectionChange('content.title', e.target.value)
                    }
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70">
                    Título principal da seção de vídeo
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  Vídeo
                </label>
                <VideoUpload
                  label=""
                  currentVideo={contentData.videoSrc || ''}
                  selectedFile={getFileFromState(videoFileKey)}
                  onFileChange={(file) => setFileState(videoFileKey, file)}
                  aspectRatio="aspect-video"
                  previewWidth={800}
                  previewHeight={450}
                  description="Vídeo de destaque da seção"
                />
                <p className="text-xs text-[var(--color-secondary)]/70">
                  Faça upload de um vídeo ou cole a URL. Formatos suportados: MP4, WebM, OGG.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  // Renderizar seção de estilo
  const renderStyleSection = () => {
    const currentSectionData = getCurrentSectionData();
    const styleData = currentSectionData.style || {};
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Estilo" 
          section="style" 
          icon={Palette}
          isExpanded={expandedSections.style}
          onToggle={() => toggleSection("style")}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.style ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6 bg-[var(--color-background)]">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cores Principais */}
                <div className="space-y-4">
                  <h4 className="font-medium text-[var(--color-secondary)] flex items-center gap-2">
                    <PaintBucket className="w-4 h-4" />
                    Cores Principais
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Cor de Fundo
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="#FFFFFF"
                          value={styleData.backgroundColor || "#FFFFFF"}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            handleSectionChange('style.backgroundColor', e.target.value)
                          }
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono flex-1"
                        />
                        <ColorPicker
                          color={styleData.backgroundColor || "#FFFFFF"}
                          onChange={(color: string) => handleColorChange('style.backgroundColor', color)}
                        />
                      </div>
                      <p className="text-xs text-[var(--color-secondary)]/70">
                        Cor de fundo da seção
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Cor do Texto
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="#020202"
                          value={styleData.textColor || "#020202"}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            handleSectionChange('style.textColor', e.target.value)
                          }
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono flex-1"
                        />
                        <ColorPicker
                          color={styleData.textColor || "#020202"}
                          onChange={(color: string) => handleColorChange('style.textColor', color)}
                        />
                      </div>
                      <p className="text-xs text-[var(--color-secondary)]/70">
                        Cor do texto principal
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Cor de Destaque
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="#FFD700"
                          value={styleData.accentColor || "#FFD700"}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            handleSectionChange('style.accentColor', e.target.value)
                          }
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono flex-1"
                        />
                        <ColorPicker
                          color={styleData.accentColor || "#FFD700"}
                          onChange={(color: string) => handleColorChange('style.accentColor', color)}
                        />
                      </div>
                      <p className="text-xs text-[var(--color-secondary)]/70">
                        Cor para elementos de destaque
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estilos do Badge */}
                <div className="space-y-4">
                  <h4 className="font-medium text-[var(--color-secondary)] flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Estilos do Badge
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Cor do Texto do Badge
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="#B8860B"
                          value={styleData.badgeText || "#B8860B"}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            handleSectionChange('style.badgeText', e.target.value)
                          }
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono flex-1"
                        />
                        <ColorPicker
                          color={styleData.badgeText || "#B8860B"}
                          onChange={(color: string) => handleColorChange('style.badgeText', color)}
                        />
                      </div>
                      <p className="text-xs text-[var(--color-secondary)]/70">
                        Cor do texto dentro do badge
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Fundo do Badge (RGBA)
                      </label>
                      <Input
                        type="text"
                        placeholder="rgba(255, 215, 0, 0.1)"
                        value={styleData.badgeBg || "rgba(255, 215, 0, 0.1)"}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleSectionChange('style.badgeBg', e.target.value)
                        }
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono"
                      />
                      <p className="text-xs text-[var(--color-secondary)]/70">
                        Cor de fundo com transparência (RGBA)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Borda do Badge (RGBA)
                      </label>
                      <Input
                        type="text"
                        placeholder="rgba(255, 215, 0, 0.3)"
                        value={styleData.badgeBorder || "rgba(255, 215, 0, 0.3)"}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handleSectionChange('style.badgeBorder', e.target.value)
                        }
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono"
                      />
                      <p className="text-xs text-[var(--color-secondary)]/70">
                        Cor da borda com transparência (RGBA)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  if (loading && !exists) {
    return <Loading layout={Video} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Video}
      title="Seções de Vídeo"
      description="Configure o conteúdo e estilo das seções de vídeo para diferentes páginas"
      exists={!!exists}
      itemName="Seções de Vídeo"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Tabs de Seções */}
        <Card className="p-6 bg-[var(--color-background)]">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[var(--color-secondary)]">Selecione a Seção</h3>
            <p className="text-sm text-[var(--color-secondary)]/70">
              Configure diferentes versões para cada tipo de página
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <SectionTab 
              sectionKey="sobre" 
              label="Sobre" 
              isActive={activeSection === "sobre"} 
              onClick={setActiveSection}
              icon={<Info className="w-4 h-4" />}
            />
            <SectionTab 
              sectionKey="cursos" 
              label="Cursos" 
              isActive={activeSection === "cursos"} 
              onClick={setActiveSection}
              icon={<GraduationCap className="w-4 h-4" />}
            />
          </div>
          
          {/* Indicador visual da seção ativa */}
          <div className="mt-4 p-3 rounded-lg bg-[var(--color-background-body)] border border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeSection === "sobre" && <Info className="w-5 h-5 text-blue-500" />}
                {activeSection === "cursos" && <GraduationCap className="w-5 h-5 text-amber-500" />}
                <span className="font-medium text-[var(--color-secondary)]">
                  Configurando: {activeSection === "sobre" ? "Página Sobre" : "Página de Cursos"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-[var(--color-secondary)]/70">
                  {completion.completed} de {completion.total} campos preenchidos
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
              {activeSection === "sobre" 
                ? "Seção de vídeo para a página 'Sobre' - foco institucional" 
                : "Seção de vídeo para a página 'Cursos' - foco em infoprodutos"}
            </p>
          </div>
        </Card>

        {/* Seções de Conteúdo e Estilo */}
        <div className="space-y-6">
          {renderContentSection()}
          {renderStyleSection()}
        </div>

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          isAddDisabled={false}
          isSaving={loading}
          exists={!!exists}
          completeCount={completion.completed}
          totalCount={completion.total}
          itemName="Seções de Vídeo"
          icon={Video}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={2}
        itemName="Configuração das Seções de Vídeo"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}