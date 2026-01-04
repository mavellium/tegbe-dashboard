/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import ColorPicker from "@/components/ColorPicker";
import { 
  Video,
  PlayCircle,
  Palette,
  Type,
  Tag,
  ChevronDown, 
  ChevronUp,
  Settings,
  Sparkles,
  Film,
  Layout
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";

interface ContentData {
  badge: string;
  title: string;
  videoSrc: string;
}

interface StyleData {
  backgroundColor: string;
  textColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  accentColor: string;
}

interface BehindScenesData {
  id?: string;
  content: ContentData;
  style: StyleData;
  [key: string]: any;
}

const defaultBehindScenesData: BehindScenesData = {
  content: {
    badge: "Bastidores da Operação",
    title: "A Rotina de Quem Escala",
    videoSrc: "https://www.youtube.com/watch?v=hfJMWlZ0GhY&t=3s"
  },
  style: {
    backgroundColor: "#020202",
    textColor: "#FFFFFF",
    badgeBg: "rgba(255, 215, 0, 0.05)",
    badgeBorder: "rgba(255, 215, 0, 0.2)",
    badgeText: "#FFD700",
    accentColor: "#FFD700"
  }
};

// Componente SectionHeader
interface SectionHeaderProps {
  title: string;
  section: any;
  icon: any;
  isExpanded: boolean;
  onToggle: (section: any) => void;
}

const SectionHeader = ({
  title,
  section,
  icon: Icon,
  isExpanded,
  onToggle
}: SectionHeaderProps) => (
  <div
    onClick={() => onToggle(section)}
    className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
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
  </div>
);

// Componente ColorPropertyInput para campos de cor
interface ColorPropertyInputProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
  isRgba?: boolean;
}

const ColorPropertyInput = ({ 
  label, 
  value, 
  onChange, 
  description,
  isRgba = false 
}: ColorPropertyInputProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      </div>
      {description && (
        <p className="text-xs text-zinc-500">{description}</p>
      )}
      <div className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          placeholder={isRgba ? "rgba(255, 215, 0, 0.05)" : "#FFD700"}
          className="flex-1 font-mono"
        />
        <ColorPicker
          color={value}
          onChange={onChange}
        />
        <div 
          className="w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-600"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );
};

export default function BehindScenesPage() {
  const {
    data: behindScenesData,
    setData: setBehindScenesData,
    updateNested,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload
  } = useJsonManagement<BehindScenesData>({
    apiPath: "/api/tegbe-institucional/json/video-curso",
    defaultData: defaultBehindScenesData,
  });

  const [expandedSections, setExpandedSections] = useState({
    content: true,
    style: true
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });

  // Processar os dados para mesclar propriedades
  const [processedData, setProcessedData] = useState<BehindScenesData>(defaultBehindScenesData);

  useEffect(() => {
    if (behindScenesData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProcessedData(behindScenesData);
    }
  }, [behindScenesData]);

  // Calcular campos completos
  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    if (!processedData) return 0;
    
    // Verificar conteúdo
    if (
      processedData.content.badge.trim() !== "" &&
      processedData.content.title.trim() !== "" &&
      processedData.content.videoSrc.trim() !== ""
    ) {
      count++;
    }
    
    // Verificar estilo
    if (
      processedData.style.backgroundColor.trim() !== "" &&
      processedData.style.textColor.trim() !== "" &&
      processedData.style.badgeBg.trim() !== "" &&
      processedData.style.badgeBorder.trim() !== "" &&
      processedData.style.badgeText.trim() !== "" &&
      processedData.style.accentColor.trim() !== ""
    ) {
      count++;
    }
    
    return count;
  }, [processedData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 2; // content, style

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    updateNested(path, value);
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      const fd = new FormData();
      fd.append("values", JSON.stringify(processedData));
      save(fd);
      await reload();
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
    }
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODOS OS CONTEÚDOS"
    });
  };

  const confirmDelete = async () => {
    await fetch("/api/tegbe-institucional/json/video-curso", {
      method: "DELETE",
    });

    setBehindScenesData(defaultBehindScenesData);
    setProcessedData(defaultBehindScenesData);
    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: "all", 
      title: "" 
    });
  };

  const renderContentSection = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Badge
            </label>
            <Input
              type="text"
              value={processedData.content.badge}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("content.badge", e.target.value)
              }
              placeholder="Bastidores da Operação"
            />
            <p className="text-xs text-zinc-500 mt-2">
              Texto do selo/badge acima do título
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Título
            </label>
            <Input
              type="text"
              value={processedData.content.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("content.title", e.target.value)
              }
              placeholder="A Rotina de Quem Escala"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            URL do Vídeo (YouTube)
          </label>
          <Input
            type="text"
            value={processedData.content.videoSrc}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("content.videoSrc", e.target.value)
            }
            placeholder="https://www.youtube.com/watch?v=hfJMWlZ0GhY&t=3s"
          />
          <p className="text-xs text-zinc-500 mt-2">
            Cole a URL completa do vídeo do YouTube
          </p>
        </div>
      </div>
    );
  };

  const renderStyleSection = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ColorPropertyInput
            label="Cor de Fundo"
            value={processedData.style.backgroundColor}
            onChange={(color) => handleChange("style.backgroundColor", color)}
            description="Cor de fundo da seção completa"
          />

          <ColorPropertyInput
            label="Cor do Texto"
            value={processedData.style.textColor}
            onChange={(color) => handleChange("style.textColor", color)}
            description="Cor principal do texto"
          />

          <ColorPropertyInput
            label="Fundo do Badge"
            value={processedData.style.badgeBg}
            onChange={(color) => handleChange("style.badgeBg", color)}
            description="Cor de fundo do badge (recomendado usar RGBA com transparência)"
            isRgba={true}
          />

          <ColorPropertyInput
            label="Borda do Badge"
            value={processedData.style.badgeBorder}
            onChange={(color) => handleChange("style.badgeBorder", color)}
            description="Cor da borda do badge (recomendado usar RGBA com transparência)"
            isRgba={true}
          />

          <ColorPropertyInput
            label="Texto do Badge"
            value={processedData.style.badgeText}
            onChange={(color) => handleChange("style.badgeText", color)}
            description="Cor do texto do badge"
          />

          <ColorPropertyInput
            label="Cor de Destaque"
            value={processedData.style.accentColor}
            onChange={(color) => handleChange("style.accentColor", color)}
            description="Cor para elementos de destaque (ícones, botões, etc.)"
          />
        </div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={Video}
      title="Bastidores da Operação"
      description="Gerencie o conteúdo e estilo da seção de vídeo dos bastidores"
      exists={!!exists}
      itemName="Bastidores"
    >
      <form onSubmit={handleSubmitWrapper} className="space-y-6 pb-32">
        {/* Seção Conteúdo */}
        <div className="space-y-4">
          <SectionHeader
            title="Conteúdo"
            section="content"
            icon={Film}
            isExpanded={expandedSections.content}
            onToggle={() => toggleSection("content")}
          />

          <AnimatePresence>
            {expandedSections.content && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderContentSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção Estilo */}
        <div className="space-y-4">
          <SectionHeader
            title="Estilo e Cores"
            section="style"
            icon={Palette}
            isExpanded={expandedSections.style}
            onToggle={() => toggleSection("style")}
          />

          <AnimatePresence>
            {expandedSections.style && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderStyleSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Action Bar */}
        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          isAddDisabled={false}
          isSaving={loading}
          exists={!!exists}
          completeCount={completeCount}
          totalCount={totalCount}
          itemName="Bastidores"
          icon={Video}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Bastidores"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}