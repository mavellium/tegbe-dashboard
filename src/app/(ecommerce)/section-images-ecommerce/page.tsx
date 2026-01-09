/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { 
  Image as ImageIcon, 
  Home, 
  ShoppingBag, 
  Megaphone,
  ChevronDown, 
  ChevronUp,
  Upload,
  X,
  LucideIcon
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import Image from "next/image";

interface HeroImageData {
  image: {
    home: string;
    ecommerce: string;
    marketing: string;
  };
  alt: {
    home: string;
    ecommerce: string;
    marketing: string;
  };
  objectPosition: {
    home: string;
    ecommerce: string;
    marketing: string;
  };
}

interface HeroFiles {
  home: File | null;
  ecommerce: File | null;
  marketing: File | null;
}

const defaultHeroData: HeroImageData = {
  image: {
    home: "",
    ecommerce: "",
    marketing: ""
  },
  alt: {
    home: "",
    ecommerce: "",
    marketing: ""
  },
  objectPosition: {
    home: "",
    ecommerce: "",
    marketing: ""
  }
};

// Valores de exemplo para referência
const exampleData = {
  image: {
    home: "/Imagem.png",
    ecommerce: "/Imagem.png",
    marketing: "/Imagem.png",
  },
  alt: {
    home: "Background - Consultoria Oficial Mercado Livre",
    ecommerce: "Background - Gestão de E-commerce e Vendas Online",
    marketing: "Background - Marketing, CRM e Automação",
  },
  objectPosition: {
    home: "object-right sm:object-top md:object-center lg:object-center",
    ecommerce: "object-center",
    marketing: "object-left sm:object-center",
  }
};

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
    value: "object-right sm:object-top md:object-center lg:object-center", 
    label: "Responsivo: Direita → Topo → Centro" 
  },
  { 
    value: "object-left sm:object-center", 
    label: "Responsivo: Esquerda → Centro" 
  },
  { 
    value: "object-center", 
    label: "Sempre Centralizado" 
  },
  { 
    value: "object-top md:object-center", 
    label: "Responsivo: Topo → Centro" 
  },
];

// Componente de preview de imagem simplificado
const ImagePreviewComponent = ({ imageUrl, alt = "Preview" }: { imageUrl: string, alt?: string }) => {
  if (!imageUrl || imageUrl.trim() === "") {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg border-2 border-zinc-300 dark:border-zinc-600">
        <div className="text-center">
          <ImageIcon className="w-12 h-12 text-zinc-400 mx-auto mb-2" />
          <p className="text-sm text-zinc-500">Nenhuma imagem</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-48 relative rounded-lg border-2 border-zinc-300 dark:border-zinc-600 overflow-hidden">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={(e) => {
          console.error('Erro ao carregar imagem:', imageUrl);
          const target = e.currentTarget;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="w-full h-48 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                <div class="text-center">
                  <svg class="w-12 h-12 text-zinc-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm text-zinc-500">Erro ao carregar imagem</p>
                </div>
              </div>
            `;
          }
        }}
      />
    </div>
  );
};

// Componente SectionHeader movido para fora
interface SectionHeaderProps {
  title: string;
  section: "home" | "ecommerce" | "marketing";
  icon: LucideIcon;
  isExpanded: boolean;
  onToggle: (section: "home" | "ecommerce" | "marketing") => void;
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
      <span className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded">
        {section === "home" ? "Home" : section === "ecommerce" ? "E-commerce" : "Marketing"}
      </span>
    </div>
    {isExpanded ? (
      <ChevronUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
    ) : (
      <ChevronDown className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
    )}
  </button>
);

export default function HeroImagesPage() {
  const [heroFiles, setHeroFiles] = useState<HeroFiles>({
    home: null,
    ecommerce: null,
    marketing: null
  });
  const {
    data: heroData,
    setData: setHeroData,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload
  } = useJsonManagement<HeroImageData>({
    apiPath: "/api/tegbe-institucional/json/hero-images",
    defaultData: defaultHeroData,
  });
  const [expandedSections, setExpandedSections] = useState({
    home: false,
    ecommerce: true,
    marketing: false
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });
  const [expandedImage, setExpandedImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);

  // Calcular campos completos
  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    // Verificar se cada seção tem conteúdo básico
    if (heroData.image.home !== "" && heroData.alt.home !== "") count++;
    if (heroData.image.ecommerce !== "" && heroData.alt.ecommerce !== "") count++;
    if (heroData.image.marketing !== "" && heroData.alt.marketing !== "") count++;
    
    return count;
  }, [heroData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 3; // home, ecommerce, marketing
  const canAddNewItem = false;
  const isLimitReached = false;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (section: "home" | "ecommerce" | "marketing", field: "image" | "alt" | "objectPosition", value: string) => {
    setHeroData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [section]: value
      }
    }));
  };

  const handleFileChange = (section: "home" | "ecommerce" | "marketing", file: File | null) => {
    setHeroFiles((prev) => ({
      ...prev,
      [section]: file
    }));
  };

  const getImageUrl = (section: "home" | "ecommerce" | "marketing"): string => {
    // Primeiro verificar se há arquivo selecionado
    if (heroFiles[section]) {
      return URL.createObjectURL(heroFiles[section]!);
    }
    
    // Verificar se há URL no estado
    const image = heroData.image[section];
    
    if (image && typeof image === 'string' && image.trim() !== "") {
      // Se já for uma URL completa, retornar como está
      if (image.startsWith('http') || image.startsWith('//') || image.startsWith('blob:')) {
        return image;
      }
      // Se for uma URL relativa, adicionar o domínio
      return `https://mavellium.com.br${image.startsWith('/') ? '' : '/'}${image}`;
    }
    
    return "";
  };

  const handleSubmit = async () => {
    const fd = new FormData();

    if (heroFiles.home) {
      fd.append("file:image.home", heroFiles.home);
    }

    if (heroFiles.ecommerce) {
      fd.append("file:image.ecommerce", heroFiles.ecommerce);
    }

    if (heroFiles.marketing) {
      fd.append("file:image.marketing", heroFiles.marketing);
    }

    await save();
    await reload();
    setHeroFiles({
      home: null,
      ecommerce: null,
      marketing: null,
    });
  };

  const handleSubmitWrapper = () => {
    handleSubmit();
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODAS AS IMAGENS DE FUNDO"
    });
  };

  const confirmDelete = async () => {
    await fetch("/api/tegbe-institucional/json/hero-images", {
      method: "DELETE",
    });

    setHeroData(defaultHeroData);
    setHeroFiles({
      home: null,
      ecommerce: null,
      marketing: null,
    });

    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: "all", 
      title: "" 
    });
  };

  const renderImageSection = (section: "home" | "ecommerce" | "marketing") => {
    const imageUrl = getImageUrl(section);
    const hasImage = imageUrl !== "";
    const altText = typeof heroData.alt[section] === 'string' ? heroData.alt[section] : "";
    const imageValue = typeof heroData.image[section] === 'string' ? heroData.image[section] : "";
    const positionValue = typeof heroData.objectPosition[section] === 'string' ? heroData.objectPosition[section] : "";
    
    return (
      <div className="space-y-6">
        <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200 border-b pb-2">
          Imagem de Fundo - {section === "home" ? "Home" : section === "ecommerce" ? "E-commerce" : "Marketing"}
        </h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload de Imagem */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Upload da Imagem
              </label>
              
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-6">
                <div className="flex flex-col items-center justify-center text-center">
                  {hasImage ? (
                    <>
                      <div className="mb-4 relative w-full">
                        <ImagePreviewComponent 
                          imageUrl={imageUrl} 
                          alt={`Preview ${section}`} 
                        />
                        <Button
                          type="button"
                          onClick={() => setExpandedImage({ 
                            url: imageUrl, 
                            alt: altText || `Imagem ${section}` 
                          })}
                          className="mt-2 w-full"
                        >
                          Visualizar
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <Upload className="w-4 h-4 inline mr-2" />
                          Trocar Imagem
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleFileChange(section, file);
                            }}
                          />
                        </label>
                        <Button
                          type="button"
                          onClick={() => {
                            handleFileChange(section, null);
                            handleChange(section, "image", "");
                          }}
                          className="text-red-600 hover:text-red-700"
                          variant="danger"
                        >
                          Remover
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                        <ImageIcon className="w-8 h-8 text-zinc-400" />
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                        Arraste uma imagem ou clique para selecionar
                      </p>
                      <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Upload className="w-4 h-4 inline mr-2" />
                        Selecionar Imagem
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileChange(section, file);
                          }}
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-zinc-500 mt-2">
                Formatos suportados: JPG, PNG, WEBP. Tamanho recomendado: 1920x1080px (Full HD)
              </p>
            </div>

            {/* URL da Imagem (para referência) */}
            {imageValue && !heroFiles[section] && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  URL da Imagem Atual
                </label>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <code className="text-sm break-all text-zinc-700 dark:text-zinc-300">
                    {imageValue}
                  </code>
                  <p className="text-xs text-zinc-500 mt-1">
                    Esta imagem está armazenada no servidor. Faça upload de uma nova para substituir.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Configurações */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Texto Alternativo (Alt)
              </label>
              <Input
                type="text"
                value={altText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange(section, "alt", e.target.value)
                }
                placeholder={`Ex: ${exampleData.alt[section]}`}
              />
              <p className="text-xs text-zinc-500 mt-1">
                Texto importante para acessibilidade e SEO
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Posicionamento da Imagem
              </label>
              <select
                value={positionValue}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleChange(section, "objectPosition", e.target.value)
                }
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                <option value="">Selecione uma opção...</option>
                <optgroup label="Posições Responsivas">
                  {responsivePositionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Posições Fixas">
                  {positionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
                <option value="custom">Personalizado...</option>
              </select>
              
              {positionValue === "custom" && (
                <Input
                  type="text"
                  value={positionValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(section, "objectPosition", e.target.value)
                  }
                  placeholder="Ex: object-right sm:object-top md:object-center"
                  className="mt-2"
                />
              )}
              
              <p className="text-xs text-zinc-500 mt-1">
                Controla como a imagem é posicionada dentro do contêiner
              </p>
            </div>

            {/* Preview do Position */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Preview do Posicionamento
              </label>
              <div className="relative h-32 bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 overflow-hidden">
                <div 
                  className={`absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 ${positionValue || 'object-center'}`} 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-xs text-zinc-700 dark:text-zinc-300 bg-white/80 dark:bg-black/80 px-2 py-1 rounded">
                    {positionValue || 'object-center'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={ImageIcon}
      title="Imagens de Fundo (Hero)"
      description="Gerencie as imagens de fundo das páginas Home, E-commerce e Marketing"
      exists={!!exists} // Corrigido: Convertendo para boolean
      itemName="Configuração de Imagens"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Home Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Imagem de Fundo - Home"
            section="home"
            icon={Home}
            isExpanded={expandedSections.home}
            onToggle={toggleSection}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.home ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderImageSection("home")}
            </Card>
          </motion.div>
        </div>

        {/* E-commerce Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Imagem de Fundo - E-commerce"
            section="ecommerce"
            icon={ShoppingBag}
            isExpanded={expandedSections.ecommerce}
            onToggle={toggleSection}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.ecommerce ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderImageSection("ecommerce")}
            </Card>
          </motion.div>
        </div>

        {/* Marketing Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Imagem de Fundo - Marketing"
            section="marketing"
            icon={Megaphone}
            isExpanded={expandedSections.marketing}
            onToggle={toggleSection}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.marketing ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderImageSection("marketing")}
            </Card>
          </motion.div>
        </div>

        {/* Fixed Action Bar */}
        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmitWrapper}
          isAddDisabled={!canAddNewItem || isLimitReached}
          isSaving={loading}
          exists={!!exists} // Corrigido: Convertendo para boolean
          completeCount={completeCount}
          totalCount={totalCount}
          itemName="Imagem"
          icon={ImageIcon}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={3}
        itemName="Imagem de Fundo"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />

      {/* Modal de Imagem Expandida */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setExpandedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-6xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={() => setExpandedImage(null)}
                className="absolute -top-4 -right-4 !p-3 !rounded-full bg-red-500 hover:bg-red-600 z-10"
              >
                <X className="w-5 h-5" />
              </Button>
              
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Visualização Expandida
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {expandedImage.alt}
                  </p>
                </div>
                
                {expandedImage.url && (
                  <div className="relative w-full h-[70vh]">
                    <Image
                      src={expandedImage.url}
                      alt={expandedImage.alt}
                      fill
                      className="object-contain rounded-lg"
                      sizes="100vw"
                      onError={(e) => {
                        console.error('Erro ao carregar imagem expandida:', expandedImage.url);
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex items-center justify-center h-64">
                              <p class="text-zinc-500">Erro ao carregar imagem</p>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ManageLayout>
  );
}