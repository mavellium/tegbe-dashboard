/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { 
  ShoppingBag, 
  Megaphone,
  Move,
  Layout,
  Image as ImageIcon
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ImageUpload } from "@/components/ImageUpload";
import { SectionHeader } from "@/components/SectionHeader";

// ========== TIPOS E INTERFACES ==========
interface HeroImageData {
  image: {
    ecommerce: string;
    marketing: string;
  };
  alt: {
    ecommerce: string;
    marketing: string;
  };
  objectPosition: {
    ecommerce: string;
    marketing: string;
  };
}

// ========== DADOS PADRÃO ==========
const defaultHeroData: HeroImageData = {
  image: {
    ecommerce: "",
    marketing: ""
  },
  alt: {
    ecommerce: "",
    marketing: ""
  },
  objectPosition: {
    ecommerce: "object-center",
    marketing: "object-center"
  }
};

// ========== OPÇÕES DE POSICIONAMENTO ==========
const positionOptions = [
  { value: "object-center", label: "Centro" },
  { value: "object-top", label: "Topo" },
  { value: "object-bottom", label: "Base" },
  { value: "object-left", label: "Esquerda" },
  { value: "object-right", label: "Direita" },
  { value: "object-top-left", label: "Topo Esquerda" },
  { value: "object-top-right", label: "Topo Direita" },
  { value: "object-bottom-left", label: "Base Esquerda" },
  { value: "object-bottom-right", label: "Base Direita" }
];

const responsivePositionOptions = [
  { 
    value: "object-right sm:object-top md:object-center", 
    label: "Responsivo: Direita → Topo → Centro" 
  },
  { 
    value: "object-left sm:object-center", 
    label: "Responsivo: Esquerda → Centro" 
  },
  { 
    value: "object-top md:object-center", 
    label: "Responsivo: Topo → Centro" 
  },
  { 
    value: "object-bottom md:object-center", 
    label: "Responsivo: Base → Centro" 
  }
];

// ========== COMPONENTES ==========
interface PositionPreviewProps {
  value: string;
}

const PositionPreview = ({ value }: PositionPreviewProps) => {
  return (
    <div className="relative h-32 bg-[var(--color-background-body)] rounded-lg border border-[var(--color-border)] overflow-hidden">
      <div className="absolute inset-4 bg-[var(--color-background)] rounded shadow-inner">
        <div className={`absolute inset-4 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded ${value || 'object-center'}`}>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center shadow-lg">
              <Move className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 left-2 right-2">
        <div className="text-center">
          <p className="text-xs font-medium text-[var(--color-secondary)] bg-black/80 px-2 py-1 rounded inline-block">
            {value || 'object-center'}
          </p>
        </div>
      </div>
    </div>
  );
};

// ========== PÁGINA PRINCIPAL ==========
export default function HeroImagesPage() {
  // ========== ESTADOS ==========
  const [expandedSections, setExpandedSections] = useState({
    ecommerce: false,
    marketing: true
  });

  // ========== HOOK DE GERENCIAMENTO ==========
  const {
    data: heroData,
    loading,
    success,
    errorMsg,
    deleteModal,
    updateNested,
    save,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
  } = useJsonManagement<HeroImageData>({
    apiPath: "/api/tegbe-institucional/json/hero-images",
    defaultData: defaultHeroData,
  });

  // ========== FUNÇÕES AUXILIARES ==========
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // ========== CALCULAR COMPLETUDE ==========
  const calculateCompleteCount = () => {
    let count = 0;
    
    if (heroData.image.ecommerce !== "" && heroData.alt.ecommerce !== "") count++;
    if (heroData.image.marketing !== "" && heroData.alt.marketing !== "") count++;
    
    return count;
  };

  const completeCount = calculateCompleteCount();
  const totalCount = 2;

  // ========== RENDERIZAR SEÇÃO DE IMAGEM ==========
  const renderImageSection = (section: "ecommerce" | "marketing") => {
    const altText = typeof heroData.alt[section] === 'string' ? heroData.alt[section] : "";
    const imageValue = typeof heroData.image[section] === 'string' ? heroData.image[section] : "";
    const positionValue = typeof heroData.objectPosition[section] === 'string' ? heroData.objectPosition[section] : "";
    const sectionName = section === "ecommerce" ? "E-commerce" : "Marketing";
    const SectionIcon = section === "ecommerce" ? ShoppingBag : Megaphone;

    return (
      <div className="space-y-6">
        {/* Header da Seção */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded bg-[var(--color-primary)]/10">
            <SectionIcon className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-secondary)]">
              {sectionName}
            </h3>
            <p className="text-sm text-[var(--color-secondary)]/70">
              Configure a imagem hero para a página de {sectionName.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna 1: Upload e Visualização */}
          <div className="space-y-6">
            <ImageUpload
              label="Imagem de Fundo"
              currentImage={imageValue}
              onChange={(url) => updateNested(`image.${section}`, url)}
              aspectRatio="aspect-video"
              previewWidth={400}
              previewHeight={300}
              description="Imagem de fundo principal da página. Tamanho recomendado: 1920×1080px"
              showRemoveButton={true}
            />
          </div>

          {/* Coluna 2: Configurações */}
          <div className="space-y-6">
            {/* Texto Alternativo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-secondary)]">
                Texto Alternativo (Alt)
              </label>
              <Input
                type="text"
                value={altText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateNested(`alt.${section}`, e.target.value)
                }
                placeholder={`Ex: Background - ${sectionName}`}
                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
              />
              <p className="text-xs text-[var(--color-secondary)]/70">
                Descreva a imagem para acessibilidade e SEO.
              </p>
            </div>

            {/* Posicionamento */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-secondary)] mb-3">
                  Posicionamento da Imagem
                </label>
                
                {/* Preview do Posicionamento */}
                <div className="mb-4">
                  <PositionPreview value={positionValue} />
                </div>

                {/* Seletores de Posição */}
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                      <Layout className="w-4 h-4" />
                      Posições Responsivas
                    </h5>
                    <div className="grid grid-cols-1 gap-2">
                      {responsivePositionOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateNested(`objectPosition.${section}`, option.value)}
                          className={`p-3 text-left rounded-lg border transition-colors ${
                            positionValue === option.value
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                              : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                          }`}
                        >
                          <div className="font-medium text-[var(--color-secondary)]">
                            {option.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-[var(--color-secondary)] mb-2">
                      Posições Fixas
                    </h5>
                    <div className="grid grid-cols-3 gap-2">
                      {positionOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateNested(`objectPosition.${section}`, option.value)}
                          className={`p-2 rounded-lg border transition-colors text-center ${
                            positionValue === option.value
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                              : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                          }`}
                        >
                          <span className="text-sm font-medium text-[var(--color-secondary)]">
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Input Personalizado */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Ou digite uma classe personalizada:
                  </label>
                  <Input
                    type="text"
                    value={positionValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateNested(`objectPosition.${section}`, e.target.value)
                    }
                    placeholder="Ex: object-right sm:object-top md:object-center"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== RENDERIZAÇÃO PRINCIPAL ==========
  return (
    <ManageLayout
      headerIcon={ImageIcon}
      title="Imagens Hero - E-commerce & Marketing"
      description="Configure as imagens de fundo principais para as páginas de E-commerce e Marketing"
      exists={!!heroData}
      itemName="Imagem Hero"
    >
      <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-6 pb-32">
        {/* Seção E-commerce */}
        <div className="space-y-4">
          <SectionHeader
            title="E-commerce"
            section="ecommerce"
            icon={ShoppingBag}
            isExpanded={expandedSections.ecommerce}
            onToggle={() => toggleSection("ecommerce")}
          />

          <motion.div
            initial={false}
            animate={{ 
              height: expandedSections.ecommerce ? "auto" : 0
            }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              {renderImageSection("ecommerce")}
            </Card>
          </motion.div>
        </div>

        {/* Seção Marketing */}
        <div className="space-y-4">
          <SectionHeader
            title="Marketing"
            section="marketing"
            icon={Megaphone}
            isExpanded={expandedSections.marketing}
            onToggle={() => toggleSection("marketing")}
          />

          <motion.div
            initial={false}
            animate={{ 
              height: expandedSections.marketing ? "auto" : 0
            }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              {renderImageSection("marketing")}
            </Card>
          </motion.div>
        </div>

        {/* Barra de Ações Fixa */}
        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={save}
          isAddDisabled={true}
          isSaving={loading}
          exists={!!heroData}
          completeCount={completeCount}
          totalCount={totalCount}
          itemName="Imagem Hero"
          icon={ImageIcon}
        />
      </form>

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={2}
        itemName="Imagem Hero"
      />

      {/* Feedback Messages */}
      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}