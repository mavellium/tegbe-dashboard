/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Switch } from "@/components/Switch";
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
import { SectionHeader } from "@/components/SectionHeader";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { hexToTailwindBgClass, tailwindToHex } from "@/lib/colors";

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
    backgroundColor: "bg-gray-900",
    textColor: "text-white",
    badgeBg: "bg-yellow-500/5",
    badgeBorder: "border-yellow-500/20",
    badgeText: "text-yellow-500",
    accentColor: "bg-yellow-500"
  }
};

const mergeWithDefaults = (apiData: any, defaultData: BehindScenesData): BehindScenesData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id,
    content: {
      badge: apiData.content?.badge || defaultData.content.badge,
      title: apiData.content?.title || defaultData.content.title,
      videoSrc: apiData.content?.videoSrc || defaultData.content.videoSrc,
    },
    style: {
      backgroundColor: apiData.style?.backgroundColor || defaultData.style.backgroundColor,
      textColor: apiData.style?.textColor || defaultData.style.textColor,
      badgeBg: apiData.style?.badgeBg || defaultData.style.badgeBg,
      badgeBorder: apiData.style?.badgeBorder || defaultData.style.badgeBorder,
      badgeText: apiData.style?.badgeText || defaultData.style.badgeText,
      accentColor: apiData.style?.accentColor || defaultData.style.accentColor,
    },
  };
};

// Helper function to extract Tailwind class from style properties
const getTailwindClass = (value: string, defaultClass: string): string => {
  if (!value) return defaultClass;
  
  // If it's already a Tailwind class, return it
  if (value.includes('-')) return value;
  
  // If it's a hex color, convert to Tailwind
  if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('rgba')) {
    const tailwindClass = hexToTailwindBgClass(value);
    return tailwindClass.replace('bg-', '');
  }
  
  return defaultClass;
};

export default function BehindScenesPage() {
  const {
    data: behindScenesData,
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
  } = useJsonManagement<BehindScenesData>({
    apiPath: "/api/tegbe-institucional/json/video-curso",
    defaultData: defaultBehindScenesData,
    mergeFunction: mergeWithDefaults,
  });

  const [expandedSections, setExpandedSections] = useState({
    content: true,
    style: true
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

  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    if (!behindScenesData) return 0;
    
    // Verificar conteúdo
    if (
      behindScenesData.content.badge.trim() !== "" &&
      behindScenesData.content.title.trim() !== "" &&
      behindScenesData.content.videoSrc.trim() !== ""
    ) {
      count++;
    }
    
    // Verificar estilo
    if (
      behindScenesData.style.backgroundColor.trim() !== "" &&
      behindScenesData.style.textColor.trim() !== "" &&
      behindScenesData.style.badgeBg.trim() !== "" &&
      behindScenesData.style.badgeBorder.trim() !== "" &&
      behindScenesData.style.badgeText.trim() !== "" &&
      behindScenesData.style.accentColor.trim() !== ""
    ) {
      count++;
    }
    
    return count;
  }, [behindScenesData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 2; // content, style

  // Helper function to handle color changes
  const handleColorChange = (path: string, hexColor: string) => {
    const tailwindClass = hexToTailwindBgClass(hexColor);
    // Remove the prefix based on the property type
    let finalValue = tailwindClass;
    if (path.includes('backgroundColor') || path.includes('badgeBg') || path.includes('accentColor')) {
      finalValue = tailwindClass.replace('bg-', '');
    } else if (path.includes('textColor') || path.includes('badgeText')) {
      finalValue = tailwindClass.replace('text-', '');
    } else if (path.includes('badgeBorder')) {
      finalValue = tailwindClass.replace('border-', '');
    }
    updateNested(path, finalValue);
  };

  return (
    <ManageLayout
      headerIcon={Video}
      title="Bastidores da Operação"
      description="Gerencie o conteúdo e estilo da seção de vídeo dos bastidores"
      exists={!!exists}
      itemName="Bastidores"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
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
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Badge"
                        value={behindScenesData.content.badge}
                        onChange={(e) => updateNested('content.badge', e.target.value)}
                        placeholder="Bastidores da Operação"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />

                      <Input
                        label="Título"
                        value={behindScenesData.content.title}
                        onChange={(e) => updateNested('content.title', e.target.value)}
                        placeholder="A Rotina de Quem Escala"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>

                    <div>
                      <Input
                        label="URL do Vídeo (YouTube)"
                        value={behindScenesData.content.videoSrc}
                        onChange={(e) => updateNested('content.videoSrc', e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=hfJMWlZ0GhY&t=3s"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                      <p className="text-xs text-[var(--color-secondary)]/70 mt-2">
                        Cole a URL completa do vídeo do YouTube
                      </p>
                    </div>
                  </div>
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
                <Card className="p-6 bg-[var(--color-background)]">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ThemePropertyInput
                        property="bg"
                        label="Cor de Fundo"
                        description="Cor de fundo da seção completa"
                        currentHex={tailwindToHex(`bg-${getTailwindClass(behindScenesData.style.backgroundColor, 'gray-900')}`)}
                        tailwindClass={`bg-${getTailwindClass(behindScenesData.style.backgroundColor, 'gray-900')}`}
                        onThemeChange={(_, hex) => handleColorChange('style.backgroundColor', hex)}
                      />

                      <ThemePropertyInput
                        property="text"
                        label="Cor do Texto"
                        description="Cor principal do texto"
                        currentHex={tailwindToHex(`text-${getTailwindClass(behindScenesData.style.textColor, 'white')}`)}
                        tailwindClass={`text-${getTailwindClass(behindScenesData.style.textColor, 'white')}`}
                        onThemeChange={(_, hex) => handleColorChange('style.textColor', hex)}
                      />

                      <ThemePropertyInput
                        property="bg"
                        label="Fundo do Badge"
                        description="Cor de fundo do badge"
                        currentHex={tailwindToHex(`bg-${getTailwindClass(behindScenesData.style.badgeBg, 'yellow-500/5')}`)}
                        tailwindClass={`bg-${getTailwindClass(behindScenesData.style.badgeBg, 'yellow-500/5')}`}
                        onThemeChange={(_, hex) => handleColorChange('style.badgeBg', hex)}
                      />

                      <ThemePropertyInput
                        property="border"
                        label="Borda do Badge"
                        description="Cor da borda do badge"
                        currentHex={tailwindToHex(`border-${getTailwindClass(behindScenesData.style.badgeBorder, 'yellow-500/20')}`)}
                        tailwindClass={`border-${getTailwindClass(behindScenesData.style.badgeBorder, 'yellow-500/20')}`}
                        onThemeChange={(_, hex) => handleColorChange('style.badgeBorder', hex)}
                      />

                      <ThemePropertyInput
                        property="text"
                        label="Texto do Badge"
                        description="Cor do texto do badge"
                        currentHex={tailwindToHex(`text-${getTailwindClass(behindScenesData.style.badgeText, 'yellow-500')}`)}
                        tailwindClass={`text-${getTailwindClass(behindScenesData.style.badgeText, 'yellow-500')}`}
                        onThemeChange={(_, hex) => handleColorChange('style.badgeText', hex)}
                      />

                      <ThemePropertyInput
                        property="bg"
                        label="Cor de Destaque"
                        description="Cor para elementos de destaque (ícones, botões, etc.)"
                        currentHex={tailwindToHex(`bg-${getTailwindClass(behindScenesData.style.accentColor, 'yellow-500')}`)}
                        tailwindClass={`bg-${getTailwindClass(behindScenesData.style.accentColor, 'yellow-500')}`}
                        onThemeChange={(_, hex) => handleColorChange('style.accentColor', hex)}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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