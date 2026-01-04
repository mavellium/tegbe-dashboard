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
  ShoppingBag,
  Image as ImageIcon,
  ChevronDown, 
  ChevronUp,
  Plus,
  Trash2,
  Upload,
  Settings,
  Phone,
  Link as LinkIcon,
  MessageCircle,
  Check,
  LucideIcon,
  Target,
  Sparkles
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import Image from "next/image";
import IconSelector from "@/components/IconSelector";

interface Feature {
  text: string;
  icon: string;
}

interface CTA {
  text: string;
  action: "whatsapp" | "link" | "email" | "phone";
  value: string;
}

interface CardData {
  id: number;
  title: string;
  highlightedText: string;
  description: string;
  icon: string;
  iconBgColor: string;
  backgroundColor: string;
  primaryColor: string;
  backgroundImage: string;
  features: Feature[];
  cta: CTA;
  hasPhoneImage?: boolean;
  phoneImage?: string;
  phoneImageSize?: {
    width: number;
    height: number;
  };
}

interface RoiData {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  cards: CardData[];
  // Para tratar propriedades como cards[0], cards[1], etc.
  [key: string]: any;
}

interface CardFiles {
  [cardId: number]: {
    backgroundImage: File | null;
    phoneImage: File | null;
  };
}

const defaultRoiData: RoiData = {
  id: "roi-section",
  title: "Nossas Soluções",
  subtitle: "Estratégias personalizadas para cada marketplace",
  backgroundColor: "#F4F4F4",
  cards: []
};

// Componente SectionHeader
interface SectionHeaderProps {
  title: string;
  section: any;
  icon: LucideIcon;
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
}

const ColorPropertyInput = ({ 
  label, 
  value, 
  onChange, 
  description 
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
          placeholder="#000000"
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

// Componente ImageUpload
interface ImageUploadProps {
  label: string;
  currentImage: string;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  aspectRatio?: string;
}

const ImageUpload = ({ label, currentImage, selectedFile, onFileChange, aspectRatio = "aspect-video" }: ImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    // Se houver um arquivo selecionado, criar uma URL temporária
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(objectUrl);
      
      // Limpar a URL quando o componente for desmontado
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else if (currentImage) {
      // Se não houver arquivo mas houver uma imagem salva, usar ela
      setPreviewUrl(currentImage);
    } else {
      // Se não houver nada, limpar a preview
      setPreviewUrl("");
    }
  }, [selectedFile, currentImage]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {previewUrl ? (
          <div className={`relative w-full ${aspectRatio} rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900`}>
            <Image
              src={previewUrl}
              alt="Image preview"
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                      <svg class="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  `;
                }
              }}
            />
          </div>
        ) : (
          <div className={`w-full ${aspectRatio} flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600`}>
            <ImageIcon className="w-12 h-12 text-zinc-400" />
          </div>
        )}
        
        <div className="w-full md:w-auto space-y-4">
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4">
            <div className="flex flex-col items-center justify-center">
              {previewUrl ? (
                <>
                  <div className="flex gap-3 mb-3">
                    <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Trocar Imagem
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          onFileChange(file);
                        }}
                      />
                    </label>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => onFileChange(null)}
                    >
                      Remover
                    </Button>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Clique em &quot;Trocar Imagem&quot; para substituir
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 text-center">
                    Upload recomendado: JPG, PNG ou WebP<br/>
                    Tamanho ideal: 800x600px
                  </p>
                  <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Selecionar Imagem
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        onFileChange(file);
                      }}
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente FeaturesEditor
interface FeaturesEditorProps {
  features: Feature[];
  onChange: (features: Feature[]) => void;
}

const FeaturesEditor = ({ features, onChange }: FeaturesEditorProps) => {
  const addFeature = () => {
    onChange([...features, { text: "", icon: "mdi:check" }]);
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onChange(newFeatures);
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    onChange(newFeatures);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <Check className="w-5 h-5" />
          Benefícios ({features.length})
        </h4>
        <Button
          type="button"
          onClick={addFeature}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Benefício
        </Button>
      </div>

      {features.length === 0 ? (
        <Card className="p-8 text-center">
          <Check className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Nenhum benefício adicionado
          </h4>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Adicione os benefícios desta solução
          </p>
          <Button
            type="button"
            onClick={addFeature}
            className="flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Adicionar Primeiro Benefício
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {features.map((feature, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={feature.text}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateFeature(index, "text", e.target.value)
                    }
                    placeholder="Ex: Análise completa do marketplace"
                  />
                </div>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => removeFeature(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default function RoiPage() {
  const [files, setFiles] = useState<CardFiles>({});
  
  const {
    data: roiData,
    setData: setRoiData,
    updateNested,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload
  } = useJsonManagement<RoiData>({
    apiPath: "/api/tegbe-institucional/json/roi",
    defaultData: defaultRoiData,
  });

  // Processar os dados para mesclar propriedades como cards[0], cards[1] com o array cards
  const [processedData, setProcessedData] = useState<RoiData>(defaultRoiData);

  useEffect(() => {
    if (roiData) {
      // Criar uma cópia dos dados
      const dataCopy = { ...roiData };
      
      // Verificar se há propriedades como cards[0], cards[1], etc.
      const cardRegex = /cards\[(\d+)\]/;
      
      // Percorrer todas as propriedades do objeto
      Object.keys(dataCopy).forEach(key => {
        const match = key.match(cardRegex);
        if (match && Array.isArray(dataCopy.cards)) {
          const index = parseInt(match[1]);
          
          // Se o índice existe no array de cards
          if (dataCopy.cards[index]) {
            // Mesclar as propriedades do cards[index] com o card correspondente
            dataCopy.cards[index] = {
              ...dataCopy.cards[index],
              ...dataCopy[key]
            };
          }
          
          // Remover a propriedade separada
          delete dataCopy[key];
        }
      });
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProcessedData(dataCopy);
    }
  }, [roiData]);

  const [expandedSections, setExpandedSections] = useState({
    geral: true,
    cards: true
  });

  const [expandedCards, setExpandedCards] = useState<number[]>([]);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });

  // Calcular campos completos usando os dados processados
  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    if (!processedData) return 0;
    
    // Verificar seção geral
    if (
      processedData.id.trim() !== "" &&
      processedData.title.trim() !== "" &&
      processedData.subtitle.trim() !== "" &&
      processedData.backgroundColor.trim() !== ""
    ) {
      count++;
    }
    
    // Verificar cards
    if (processedData.cards.length > 0) {
      const hasValidCards = processedData.cards.some(card => 
        card.title.trim() !== "" && 
        card.highlightedText.trim() !== "" &&
        card.description.trim() !== "" &&
        card.icon.trim() !== "" &&
        card.cta.text.trim() !== "" &&
        card.cta.value.trim() !== ""
      );
      if (hasValidCards) count++;
    }
    
    return count;
  }, [processedData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 2; // geral, cards

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleCard = (cardId: number) => {
    setExpandedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleChange = (path: string, value: any) => {
    updateNested(path, value);
  };

  const handleCardChange = (cardIndex: number, path: string, value: any) => {
    updateNested(`cards.${cardIndex}.${path}`, value);
  };

  const handleCardFileChange = (cardId: number, type: "backgroundImage" | "phoneImage", file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        [type]: file
      }
    }));
  };

  const addCard = () => {
    const currentCards = [...processedData.cards];
    const newCard: CardData = {
      id: currentCards.length > 0 ? Math.max(...currentCards.map(c => c.id)) + 1 : 1,
      title: "",
      highlightedText: "",
      description: "",
      icon: "mdi:rocket",
      iconBgColor: "#0071E3",
      backgroundColor: "#0A0A0A",
      primaryColor: "#0071E3",
      backgroundImage: "",
      features: [],
      cta: {
        text: "Saiba mais",
        action: "link",
        value: ""
      }
    };

    handleChange("cards", [...currentCards, newCard]);
    setExpandedCards(prev => [...prev, newCard.id]);
  };

  const removeCard = (cardIndex: number) => {
    const currentCards = [...processedData.cards];
    const cardId = currentCards[cardIndex].id;
    currentCards.splice(cardIndex, 1);
    handleChange("cards", currentCards);
    
    // Limpar arquivos se existir
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[cardId];
      return newFiles;
    });
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    
    // Adicionar os dados JSON (usando os dados processados)
    fd.append("values", JSON.stringify(processedData));

    // Processar arquivos de imagem para cada card
    Object.entries(files).forEach(([cardId, cardFiles]) => {
      if (cardFiles.backgroundImage) {
        fd.append(`file:cards[${parseInt(cardId)-1}].backgroundImage`, cardFiles.backgroundImage, cardFiles.backgroundImage.name);
      }
      if (cardFiles.phoneImage) {
        fd.append(`file:cards[${parseInt(cardId)-1}].phoneImage`, cardFiles.phoneImage, cardFiles.phoneImage.name);
      }
    });

    try {
      // Enviar tudo para o mesmo endpoint
      await save(fd);
      await reload();
      
      // Limpar os arquivos locais após o envio
      setFiles({});
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
    }
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODAS AS SOLUÇÕES"
    });
  };

  const confirmDelete = async () => {
    await fetch("/api/tegbe-institucional/json/roi", {
      method: "DELETE",
    });

    setRoiData(defaultRoiData);
    setProcessedData(defaultRoiData);
    setFiles({});
    setExpandedCards([]);

    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: "all", 
      title: "" 
    });
  };

  const renderGeralSection = () => {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            ID da Seção
          </label>
          <Input
            type="text"
            value={processedData.id}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("id", e.target.value)
            }
            placeholder="roi-section"
          />
        </div>

        {/* Título e Subtítulo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Título
            </label>
            <Input
              type="text"
              value={processedData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("title", e.target.value)
              }
              placeholder="Nossas Soluções"
            />
          </div>

          <div>
            <ColorPropertyInput
              label="Cor de Fundo da Seção"
              value={processedData.backgroundColor}
              onChange={(color) => handleChange("backgroundColor", color)}
              description="Cor de fundo da seção completa"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Subtítulo
          </label>
          <Input
            type="text"
            value={processedData.subtitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("subtitle", e.target.value)
            }
            placeholder="Estratégias personalizadas para cada marketplace"
          />
        </div>
      </div>
    );
  };

  const renderCard = (card: CardData, index: number) => {
    const cardFiles = files[card.id] || { backgroundImage: null, phoneImage: null };
    const isExpanded = expandedCards.includes(card.id);

    return (
      <div key={card.id} className="space-y-4">
        <div
          onClick={() => toggleCard(card.id)}
          className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            <div>
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                Card {index + 1}: {card.title || "Sem título"}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {card.highlightedText ? `Destaque: ${card.highlightedText}` : "Sem destaque"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                removeCard(index);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Card className="p-6 space-y-8">
                {/* Conteúdo do Card */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Coluna 1: Informações básicas */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Título
                        </label>
                        <Input
                          type="text"
                          value={card.title}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleCardChange(index, "title", e.target.value)
                          }
                          placeholder="Ex: Consultoria Oficial"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Texto Destacado
                        </label>
                        <Input
                          type="text"
                          value={card.highlightedText}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleCardChange(index, "highlightedText", e.target.value)
                          }
                          placeholder="Ex: Mercado Livre"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Descrição
                      </label>
                      <textarea
                        value={card.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          handleCardChange(index, "description", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[100px]"
                        rows={3}
                        placeholder="Descrição detalhada do serviço..."
                      />
                    </div>

                    {/* Ícone e cores */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Ícone
                        </label>
                        <IconSelector
                          value={card.icon}
                          onChange={(value) => handleCardChange(index, "icon", value)}
                          label="Selecione um ícone"
                        />
                      </div>

                      <div>
                        <ColorPropertyInput
                          label="Cor do Ícone"
                          value={card.iconBgColor}
                          onChange={(color) => handleCardChange(index, "iconBgColor", color)}
                          description="Cor de fundo do ícone"
                        />
                      </div>

                      <div>
                        <ColorPropertyInput
                          label="Cor Primária"
                          value={card.primaryColor}
                          onChange={(color) => handleCardChange(index, "primaryColor", color)}
                          description="Cor principal para textos e bordas"
                        />
                      </div>
                    </div>

                    <div>
                      <ColorPropertyInput
                        label="Cor de Fundo do Card"
                        value={card.backgroundColor}
                        onChange={(color) => handleCardChange(index, "backgroundColor", color)}
                        description="Cor de fundo do card completo"
                      />
                    </div>
                  </div>

                  {/* Coluna 2: Imagens e CTA */}
                  <div className="space-y-6">
                    {/* Imagem de Fundo */}
                    <ImageUpload
                      label="Imagem de Fundo do Card"
                      currentImage={card.backgroundImage || ""}
                      selectedFile={cardFiles.backgroundImage}
                      onFileChange={(file) => handleCardFileChange(card.id, "backgroundImage", file)}
                      aspectRatio="aspect-video"
                    />

                    {/* Phone Image */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                          <Phone className="w-5 h-5" />
                          Imagem de Telefone
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">Ativar:</span>
                          <div
                            onClick={() => handleCardChange(index, "hasPhoneImage", !card.hasPhoneImage)}
                            className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors cursor-pointer ${
                              card.hasPhoneImage ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                            }`}
                          >
                            <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                              card.hasPhoneImage ? "translate-x-5" : ""
                            }`} />
                          </div>
                        </div>
                      </div>

                      {card.hasPhoneImage && (
                        <div className="space-y-4">
                          <ImageUpload
                            label="Imagem do Telefone"
                            currentImage={card.phoneImage || ""}
                            selectedFile={cardFiles.phoneImage}
                            onFileChange={(file) => handleCardFileChange(card.id, "phoneImage", file)}
                            aspectRatio="aspect-[2/3]"
                          />

                          {card.phoneImageSize && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                  Largura (px)
                                </label>
                                <Input
                                  type="number"
                                  value={card.phoneImageSize.width.toString()}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleCardChange(index, "phoneImageSize", {
                                      ...card.phoneImageSize,
                                      width: parseInt(e.target.value)
                                    })
                                  }
                                  placeholder="400"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                  Altura (px)
                                </label>
                                <Input
                                  type="number"
                                  value={card.phoneImageSize.height.toString()}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleCardChange(index, "phoneImageSize", {
                                      ...card.phoneImageSize,
                                      height: parseInt(e.target.value)
                                    })
                                  }
                                  placeholder="600"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Benefícios */}
                <div className="space-y-6">
                  <FeaturesEditor
                    features={card.features}
                    onChange={(features) => handleCardChange(index, "features", features)}
                  />
                </div>

                {/* CTA */}
                <div className="space-y-6 p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                  <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Call to Action (CTA)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Texto do Botão
                      </label>
                      <Input
                        type="text"
                        value={card.cta.text}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleCardChange(index, "cta.text", e.target.value)
                        }
                        placeholder="Ex: Contratar"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Ação
                      </label>
                      <select
                        value={card.cta.action}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          handleCardChange(index, "cta.action", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="link">Link</option>
                        <option value="email">Email</option>
                        <option value="phone">Telefone</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Valor
                      </label>
                      <Input
                        type="text"
                        value={card.cta.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleCardChange(index, "cta.value", e.target.value)
                        }
                        placeholder={card.cta.action === "whatsapp" ? "https://wa.me/5514991779502" : "/casos-de-sucesso"}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {card.cta.action === "whatsapp" && <MessageCircle className="w-4 h-4" />}
                    {card.cta.action === "link" && <LinkIcon className="w-4 h-4" />}
                    {card.cta.action === "email" && <span>@</span>}
                    {card.cta.action === "phone" && <Phone className="w-4 h-4" />}
                    <span>
                      Ação: {card.cta.action === "whatsapp" ? "Abrir WhatsApp" : 
                            card.cta.action === "link" ? "Navegar para URL" :
                            card.cta.action === "email" ? "Enviar Email" : "Ligar"}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={ShoppingBag}
      title="Soluções & ROI"
      description="Gerencie as soluções e cards de ROI com imagens, benefícios e CTAs"
      exists={!!exists}
      itemName="Soluções"
    >
      <form onSubmit={handleSubmitWrapper} className="space-y-6 pb-32">
        {/* Seção Geral */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações Gerais"
            section="geral"
            icon={Settings}
            isExpanded={expandedSections.geral}
            onToggle={() => toggleSection("geral")}
          />

          <AnimatePresence>
            {expandedSections.geral && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderGeralSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader
              title={`Cards de Soluções (${processedData.cards.length})`}
              section="cards"
              icon={ShoppingBag}
              isExpanded={expandedSections.cards}
              onToggle={() => toggleSection("cards")}
            />
            <Button
              type="button"
              onClick={addCard}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Card
            </Button>
          </div>

          <AnimatePresence>
            {expandedSections.cards && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {processedData.cards.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Nenhum card de solução adicionado
                      </h4>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                        Comece adicionando cards para mostrar suas soluções e casos de ROI
                      </p>
                      <Button
                        type="button"
                        onClick={addCard}
                        className="flex items-center gap-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Primeiro Card
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {processedData.cards.map((card, index) => renderCard(card, index))}
                    </div>
                  )}
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
          itemName="Soluções"
          icon={ShoppingBag}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={processedData.cards.length}
        itemName="Solução"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}