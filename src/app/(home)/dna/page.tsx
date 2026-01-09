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
  Users,
  Target,
  Eye,
  Heart,
  ChevronDown, 
  ChevronUp,
  Plus,
  Trash2,
  Upload,
  Settings,
  Sparkles,
  Link as LinkIcon,
  MessageCircle,
  Check,
  LucideIcon,
  Globe,
  Award,
  Zap,
  Shield,
  Star
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import Image from "next/image";
import IconSelector from "@/components/IconSelector";

interface DnaCard {
  id: number;
  tipo: "valor" | "missao" | "visao" | "diferencial";
  titulo: string;
  descricao: string;
  icone: string;
  corIcone: string;
  corFundo: string;
  imagem: string;
  ordem: number;
  destaque: boolean;
  fraseDestaque?: string;
}

interface DnaData {
  id: string;
  titulo: string;
  subtitulo: string;
  backgroundColor: string;
  textoIntroducao: string;
  cards: DnaCard[];
  // Para tratar propriedades como cards[0], cards[1], etc.
  [key: string]: any;
}

interface CardFiles {
  [cardId: number]: {
    imagem: File | null;
  };
}

const defaultDnaData: DnaData = {
  id: "dna-section",
  titulo: "Nosso DNA",
  subtitulo: "Os valores que nos guiam e a missão que nos move",
  backgroundColor: "#FFFFFF",
  textoIntroducao: "Somos impulsionados por valores sólidos e uma visão clara do futuro. Conheça os princípios que norteiam cada decisão e ação em nossa empresa.",
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

const ImageUpload = ({ label, currentImage, selectedFile, onFileChange, aspectRatio = "aspect-square" }: ImageUploadProps) => {
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
            <Sparkles className="w-12 h-12 text-zinc-400" />
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
                    <Sparkles className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 text-center">
                    Upload recomendado: JPG, PNG ou WebP<br/>
                    Tamanho ideal: 400x400px
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

// Função para obter ícone padrão baseado no tipo
const getDefaultIconByType = (tipo: DnaCard["tipo"]): string => {
  const iconMap: Record<DnaCard["tipo"], string> = {
    valor: "mdi:heart",
    missao: "mdi:target",
    visao: "mdi:eye",
    diferencial: "mdi:star"
  };
  return iconMap[tipo];
};

// Função para obter cor padrão baseado no tipo
const getDefaultColorByType = (tipo: DnaCard["tipo"]): string => {
  const colorMap: Record<DnaCard["tipo"], string> = {
    valor: "#EF4444",
    missao: "#3B82F6",
    visao: "#8B5CF6",
    diferencial: "#10B981"
  };
  return colorMap[tipo];
};

export default function DnaPage() {
  const [files, setFiles] = useState<CardFiles>({});
  
  const {
    data: dnaData,
    setData: setDnaData,
    updateNested,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload
  } = useJsonManagement<DnaData>({
    apiPath: "/api/tegbe-institucional/json/dna",
    defaultData: defaultDnaData,
  });

  // Processar os dados para mesclar propriedades como cards[0], cards[1] com o array cards
  const [processedData, setProcessedData] = useState<DnaData>(defaultDnaData);

  useEffect(() => {
    if (dnaData) {
      // Criar uma cópia dos dados
      const dataCopy = { ...dnaData };
      
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
  }, [dnaData]);

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
      processedData.titulo.trim() !== "" &&
      processedData.subtitulo.trim() !== "" &&
      processedData.backgroundColor.trim() !== "" &&
      processedData.textoIntroducao.trim() !== ""
    ) {
      count++;
    }
    
    // Verificar cards
    if (processedData.cards.length > 0) {
      const hasValidCards = processedData.cards.some(card => 
        card.titulo.trim() !== "" && 
        card.descricao.trim() !== "" &&
        card.icone.trim() !== ""
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

  const handleCardFileChange = (cardId: number, file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        imagem: file
      }
    }));
  };

  const addCard = () => {
    const currentCards = [...processedData.cards];
    const newCard: DnaCard = {
      id: currentCards.length > 0 ? Math.max(...currentCards.map(c => c.id)) + 1 : 1,
      tipo: "valor",
      titulo: "",
      descricao: "",
      icone: "mdi:heart",
      corIcone: "#EF4444",
      corFundo: "#FEF2F2",
      imagem: "",
      ordem: currentCards.length + 1,
      destaque: false
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

  const moveCard = (index: number, direction: "up" | "down") => {
    const currentCards = [...processedData.cards];
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === currentCards.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const cardToMove = currentCards[index];
    
    // Atualizar ordens
    cardToMove.ordem = direction === "up" ? index : index + 2;
    currentCards[newIndex].ordem = direction === "up" ? index + 1 : index + 1;
    
    // Reordenar array
    const [movedCard] = currentCards.splice(index, 1);
    currentCards.splice(newIndex, 0, movedCard);
    
    handleChange("cards", currentCards);
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    
    // Adicionar os dados JSON (usando os dados processados)
    fd.append("values", JSON.stringify(processedData));

    // Processar arquivos de imagem para cada card
    Object.entries(files).forEach(([cardId, cardFiles]) => {
      if (cardFiles.imagem) {
        fd.append(`file:cards[${parseInt(cardId)-1}].imagem`, cardFiles.imagem, cardFiles.imagem.name);
      }
    });

    try {
      // Enviar tudo para o mesmo endpoint
      await save();
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
      title: "TODOS OS VALORES"
    });
  };

  const confirmDelete = async () => {
    await fetch("/api/tegbe-institucional/json/dna", {
      method: "DELETE",
    });

    setDnaData(defaultDnaData);
    setProcessedData(defaultDnaData);
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

  const getIconByType = (tipo: DnaCard["tipo"]) => {
    switch (tipo) {
      case "valor": return Heart;
      case "missao": return Target;
      case "visao": return Eye;
      case "diferencial": return Star;
      default: return Heart;
    }
  };

  const getTypeColor = (tipo: DnaCard["tipo"]) => {
    switch (tipo) {
      case "valor": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "missao": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "visao": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "diferencial": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
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
            placeholder="dna-section"
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
              value={processedData.titulo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("titulo", e.target.value)
              }
              placeholder="Nosso DNA"
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
            value={processedData.subtitulo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("subtitulo", e.target.value)
            }
            placeholder="Os valores que nos guiam e a missão que nos move"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Texto de Introdução
          </label>
          <textarea
            value={processedData.textoIntroducao}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleChange("textoIntroducao", e.target.value)
            }
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[100px]"
            rows={3}
            placeholder="Texto introdutório sobre os valores da empresa..."
          />
          <p className="text-xs text-zinc-500 mt-1">
            Este texto aparecerá no início da seção, antes dos cards
          </p>
        </div>
      </div>
    );
  };

  const renderCard = (card: DnaCard, index: number) => {
    const cardFiles = files[card.id] || { imagem: null };
    const isExpanded = expandedCards.includes(card.id);
    const TypeIcon = getIconByType(card.tipo);

    return (
      <div key={card.id} className="space-y-4">
        <div
          onClick={() => toggleCard(card.id)}
          className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <TypeIcon className="w-5 h-5" />
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(card.tipo)}`}>
                  {card.tipo.toUpperCase()}
                </span>
                {card.destaque && (
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    DESTAQUE
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                {card.titulo || "Sem título"}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">
                {card.descricao || "Sem descrição"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  moveCard(index, "up");
                }}
                disabled={index === 0}
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  moveCard(index, "down");
                }}
                disabled={index === processedData.cards.length - 1}
              >
                ↓
              </Button>
            </div>
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
                          Tipo
                        </label>
                        <select
                          value={card.tipo}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const newType = e.target.value as DnaCard["tipo"];
                            handleCardChange(index, "tipo", newType);
                            handleCardChange(index, "icone", getDefaultIconByType(newType));
                            handleCardChange(index, "corIcone", getDefaultColorByType(newType));
                          }}
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        >
                          <option value="valor">Valor</option>
                          <option value="missao">Missão</option>
                          <option value="visao">Visão</option>
                          <option value="diferencial">Diferencial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Ordem
                        </label>
                        <Input
                          type="number"
                          value={card.ordem.toString()}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleCardChange(index, "ordem", parseInt(e.target.value))
                          }
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Título
                      </label>
                      <Input
                        type="text"
                        value={card.titulo}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleCardChange(index, "titulo", e.target.value)
                        }
                        placeholder="Ex: Transparência"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Descrição
                      </label>
                      <textarea
                        value={card.descricao}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          handleCardChange(index, "descricao", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[120px]"
                        rows={4}
                        placeholder="Descreva este valor, missão ou visão..."
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-zinc-800 dark:text-zinc-200">
                          Destaque
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">Destacar:</span>
                          <div
                            onClick={() => handleCardChange(index, "destaque", !card.destaque)}
                            className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors cursor-pointer ${
                              card.destaque ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-700"
                            }`}
                          >
                            <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                              card.destaque ? "translate-x-5" : ""
                            }`} />
                          </div>
                        </div>
                      </div>

                      {card.destaque && (
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Frase de Destaque
                          </label>
                          <Input
                            type="text"
                            value={card.fraseDestaque || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleCardChange(index, "fraseDestaque", e.target.value)
                            }
                            placeholder="Frase curta e impactante para destacar"
                          />
                          <p className="text-xs text-zinc-500 mt-1">
                            Esta frase aparecerá de forma destacada no card
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Coluna 2: Design e Imagem */}
                  <div className="space-y-6">
                    {/* Ícone e cores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Ícone
                        </label>
                        <IconSelector
                          value={card.icone}
                          onChange={(value) => handleCardChange(index, "icone", value)}
                          label="Selecione um ícone"
                        />
                      </div>

                      <div>
                        <ColorPropertyInput
                          label="Cor do Ícone"
                          value={card.corIcone}
                          onChange={(color) => handleCardChange(index, "corIcone", color)}
                          description="Cor principal do ícone"
                        />
                      </div>
                    </div>

                    <div>
                      <ColorPropertyInput
                        label="Cor de Fundo do Card"
                        value={card.corFundo}
                        onChange={(color) => handleCardChange(index, "corFundo", color)}
                        description="Cor de fundo do card"
                      />
                    </div>

                    {/* Imagem */}
                    <ImageUpload
                      label="Imagem do Card (Opcional)"
                      currentImage={card.imagem || ""}
                      selectedFile={cardFiles.imagem}
                      onFileChange={(file) => handleCardFileChange(card.id, file)}
                      aspectRatio="aspect-square"
                    />
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
      headerIcon={Users}
      title="DNA da Empresa"
      description="Gerencie os valores, missão, visão e diferenciais da empresa"
      exists={!!exists}
      itemName="DNA"
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
              title={`Elementos do DNA (${processedData.cards.length})`}
              section="cards"
              icon={Heart}
              isExpanded={expandedSections.cards}
              onToggle={() => toggleSection("cards")}
            />
            <Button
              type="button"
              onClick={addCard}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Elemento
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
                      <Users className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Nenhum elemento do DNA adicionado
                      </h4>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                        Comece adicionando valores, missão, visão e diferenciais da empresa
                      </p>
                      <Button
                        type="button"
                        onClick={addCard}
                        className="flex items-center gap-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Primeiro Elemento
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {processedData.cards
                        .sort((a, b) => a.ordem - b.ordem)
                        .map((card, index) => renderCard(card, index))}
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
          itemName="DNA"
          icon={Users}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={processedData.cards.length}
        itemName="Elemento"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}