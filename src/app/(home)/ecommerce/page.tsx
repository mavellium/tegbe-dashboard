/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { 
  ClipboardCheck,
  Image as ImageIcon,
  Type,
  ChevronDown, 
  ChevronUp,
  Plus,
  Trash2,
  Upload,
  Settings,
  Palette,
  Grid3x3,
  Layers,
  Zap,
  Eye,
  EyeOff,
  LucideIcon,
  Hash,
  Target
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import Image from "next/image";

interface TextoConfig {
  texto: string;
  visivel: boolean;
  classes: string;
}

interface ImagemConfig {
  src: string;
  alt: string;
  visivel: boolean;
  classes: string;
  tamanhos: {
    mobile: string;
    desktop: string;
  };
  qualidade: number;
  dimensoes: {
    maxLargura: string;
    mobileAltura: string;
    tabletAltura: string;
    desktopAltura: string;
  };
}

interface CardConfig {
  id: number;
  numero: string;
  titulo: string;
  descricao: string;
  visivel: boolean;
  classes: string;
}

interface AnimacaoConfig {
  habilitada: boolean;
  duracao: number;
  ease: string;
  scrollTrigger: {
    start: string;
    end: string;
    toggleActions: string;
  };
  sequencia: {
    titulo: { delay: number };
    heading: { delay: number };
    subtitulo: { delay: number };
    imagem: { delay: number; duracao: number; ease: string };
    cards: {
      card1: { delay: number };
      card2: { delay: number };
      card3: { delay: number };
    };
  };
  hover: {
    escala: number;
    duracao: number;
  };
}

interface LayoutConfig {
  grid: string;
  gap: string;
  container: string;
}

interface EspacamentoConfig {
  secao: string;
  texto: string;
  imagem: string;
}

interface CoresConfig {
  fundo: string;
  texto: string;
  destaque: string;
  textoSecundario: string;
  card: {
    fundo: string;
    numero: {
      normal: string;
      hover: string;
    };
    circulo: {
      normal: string;
      hover: string;
    };
  };
}

interface ConfiguracoesConfig {
  animacao: AnimacaoConfig;
  layout: LayoutConfig;
  espacamento: EspacamentoConfig;
  cores: CoresConfig;
}

interface DiagnosticoData {
  id: string;
  titulo: TextoConfig;
  heading: {
    texto: string;
    destaque: string;
    visivel: boolean;
    classes: string;
  };
  subtitulo: TextoConfig;
  imagem: ImagemConfig;
  cards: CardConfig[];
  configuracoes: ConfiguracoesConfig;
}

interface ImagemFile {
  file: File | null;
}

const defaultDiagnosticoData: DiagnosticoData = {
  id: "diagnostico-section",
  titulo: {
    texto: "Diagnóstico",
    visivel: true,
    classes: "tracking-wide text-lg sm:text-xl mb-2 font-medium"
  },
  heading: {
    texto: "Onde sua operação",
    destaque: "aperta?",
    visivel: true,
    classes: "font-bold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight max-w-4xl"
  },
  subtitulo: {
    texto: "Seja para quem está dando o primeiro passo ou para quem já domina os canais de venda, a complexidade não deve ser um freio. Se identifique abaixo e veja como a Tegbe é o motor que faltava.",
    visivel: true,
    classes: "text-base sm:text-lg text-gray-600 font-medium leading-relaxed max-w-3xl"
  },
  imagem: {
    src: "/ipad.png",
    alt: "Dashboard Tegbe no iPad",
    visivel: true,
    classes: "object-contain pointer-events-none drop-shadow-2xl",
    tamanhos: {
      mobile: "303px",
      desktop: "470px"
    },
    qualidade: 75,
    dimensoes: {
      maxLargura: "520px",
      mobileAltura: "420px",
      tabletAltura: "520px",
      desktopAltura: "650px"
    }
  },
  cards: [],
  configuracoes: {
    animacao: {
      habilitada: true,
      duracao: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        start: "top 75%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      },
      sequencia: {
        titulo: { delay: 0 },
        heading: { delay: -0.3 },
        subtitulo: { delay: -0.3 },
        imagem: { delay: -0.2, duracao: 0.7, ease: "back.out(1.3)" },
        cards: {
          card1: { delay: -0.1 },
          card2: { delay: -0.4 },
          card3: { delay: -0.4 }
        }
      },
      hover: {
        escala: 1.03,
        duracao: 0.3
      }
    },
    layout: {
      grid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      gap: "gap-8",
      container: "max-w-6xl"
    },
    espacamento: {
      secao: "my-12 md:my-20",
      texto: "mb-12",
      imagem: "mb-16"
    },
    cores: {
      fundo: "bg-[#F4F4F4]",
      texto: "text-black",
      destaque: "#FFCC00",
      textoSecundario: "text-gray-600",
      card: {
        fundo: "bg-white",
        numero: {
          normal: "text-gray-400",
          hover: "text-[#FFCC00]"
        },
        circulo: {
          normal: "bg-gray-100",
          hover: "bg-[#FFCC00]/20"
        }
      }
    }
  }
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
    </div>
    {isExpanded ? (
      <ChevronUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
    ) : (
      <ChevronDown className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
    )}
  </button>
);

// Componente ImageUpload
interface ImageUploadProps {
  currentImage: string;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
}

const ImageUpload = ({ currentImage, selectedFile, onFileChange }: ImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const getPreviewUrl = () => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    } else if (currentImage && currentImage.trim() !== "") {
      return currentImage;
    }
    return "";
  };

  const previewUrlValue = getPreviewUrl();

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Imagem Principal
      </label>
      
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {previewUrlValue ? (
          <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
            <Image
              src={previewUrlValue}
              alt="Imagem preview"
              fill
              className="object-contain p-4"
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
          <div className="w-48 h-48 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600">
            <ImageIcon className="w-12 h-12 text-zinc-400" />
          </div>
        )}
        
        <div className="flex-1 space-y-4">
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-6">
            <div className="flex flex-col items-center justify-center">
              {previewUrlValue ? (
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
                    Upload recomendado: PNG transparente<br/>
                    Tamanho ideal: Imagem de iPad
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

// Componente CardEditor
interface CardEditorProps {
  card: CardConfig;
  index: number;
  onCardChange: (index: number, field: keyof CardConfig, value: any) => void;
  onRemove: (index: number) => void;
}

const CardEditor = ({ card, index, onCardChange, onRemove }: CardEditorProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Hash className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Card {index + 1}: {card.titulo || "Sem título"}
            </h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Número: {card.numero}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <span className="text-sm text-zinc-600 dark:text-zinc-400 mr-2">Visível:</span>
            <button
              type="button"
              onClick={() => onCardChange(index, "visivel", !card.visivel)}
              className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${
                card.visivel ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                card.visivel ? "translate-x-5" : ""
              }`} />
            </button>
          </div>
          <Button
            type="button"
            variant="danger"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Número do Card
            </label>
            <Input
              type="text"
              value={card.numero}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onCardChange(index, "numero", e.target.value)
              }
              placeholder="Ex: 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Título
            </label>
            <Input
              type="text"
              value={card.titulo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onCardChange(index, "titulo", e.target.value)
              }
              placeholder="Ex: Deseja começar do zero?"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Descrição
          </label>
          <textarea
            value={card.descricao}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onCardChange(index, "descricao", e.target.value)
            }
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[100px]"
            rows={3}
            placeholder="Descrição detalhada do card..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Classes CSS
          </label>
          <textarea
            value={card.classes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onCardChange(index, "classes", e.target.value)
            }
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[60px]"
            rows={2}
            placeholder="Classes CSS para estilização..."
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Use classes Tailwind CSS para customizar a aparência
          </p>
        </div>
      </div>
    </Card>
  );
};

export default function DiagnosticoPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const {
    data: diagnosticoData,
    setData: setDiagnosticoData,
    updateNested,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload
  } = useJsonManagement<DiagnosticoData>({
    apiPath: "/api/tegbe-institucional/json/ecommerce",
    defaultData: defaultDiagnosticoData,
  });

  const [expandedSections, setExpandedSections] = useState({
    texto: true,
    imagem: false,
    cards: false,
    configuracoes: false
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });

  // Calcular campos completos
  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    if (!diagnosticoData) return 0;
    
    // Verificar textos
    if (
      diagnosticoData.titulo.texto.trim() !== "" &&
      diagnosticoData.heading.texto.trim() !== "" &&
      diagnosticoData.heading.destaque.trim() !== "" &&
      diagnosticoData.subtitulo.texto.trim() !== ""
    ) {
      count++;
    }
    
    // Verificar imagem
    if (diagnosticoData.imagem.src.trim() !== "" && diagnosticoData.imagem.alt.trim() !== "") {
      count++;
    }
    
    // Verificar cards
    if (diagnosticoData.cards.length >= 3) {
      const hasValidCards = diagnosticoData.cards.every(card => 
        card.titulo.trim() !== "" && card.descricao.trim() !== ""
      );
      if (hasValidCards) count++;
    }
    
    // Verificar configurações básicas
    if (
      diagnosticoData.configuracoes.layout.grid.trim() !== "" &&
      diagnosticoData.configuracoes.cores.fundo.trim() !== "" &&
      diagnosticoData.configuracoes.cores.destaque.trim() !== ""
    ) {
      count++;
    }
    
    return count;
  }, [diagnosticoData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 4; // texto, imagem, cards, configurações

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    updateNested(path, value);
  };

  const handleCardChange = (index: number, field: keyof CardConfig, value: any) => {
    updateNested(`cards.${index}.${field}`, value);
  };

  const addCard = () => {
    const currentCards = [...diagnosticoData.cards];
    const newCard: CardConfig = {
      id: currentCards.length + 1,
      numero: (currentCards.length + 1).toString(),
      titulo: "",
      descricao: "",
      visivel: true,
      classes: "bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-[#FFCC00] transition-colors duration-300 opacity-0 group cursor-default"
    };

    handleChange("cards", [...currentCards, newCard]);
  };

  const removeCard = (index: number) => {
    const currentCards = [...diagnosticoData.cards];
    currentCards.splice(index, 1);
    handleChange("cards", currentCards);
  };

  const handleFileChange = (file: File | null) => {
    setImageFile(file);
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    
    // Adicionar os dados JSON
    fd.append("values", JSON.stringify(diagnosticoData));

    // Processar arquivo de imagem
    if (imageFile) {
      fd.append("file:imagem.src", imageFile, imageFile.name);
    }

    try {
      // Enviar tudo para o mesmo endpoint
      await save();
      await reload();
      
      // Limpar o arquivo local após o envio
      setImageFile(null);
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
      title: "SEÇÃO DE DIAGNÓSTICO COMPLETA"
    });
  };

  const confirmDelete = async () => {
    await fetch("/api/tegbe-institucional/json/diagnostico", {
      method: "DELETE",
    });

    setDiagnosticoData(defaultDiagnosticoData);
    setImageFile(null);
    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: "all", 
      title: "" 
    });
  };

  const renderTextoSection = () => {
    const data = diagnosticoData;

    return (
      <div className="space-y-6">
        {/* ID da Seção */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            ID da Seção
          </label>
          <Input
            type="text"
            value={data.id}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("id", e.target.value)
            }
            placeholder="diagnostico-section"
          />
        </div>

        {/* Título */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <Type className="w-5 h-5" />
              Título
            </h4>
            <div className="flex items-center">
              <span className="text-sm text-zinc-600 dark:text-zinc-400 mr-2">Visível:</span>
              <button
                type="button"
                onClick={() => handleChange("titulo.visivel", !data.titulo.visivel)}
                className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${
                  data.titulo.visivel ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                  data.titulo.visivel ? "translate-x-5" : ""
                }`} />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Texto
              </label>
              <Input
                type="text"
                value={data.titulo.texto}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("titulo.texto", e.target.value)
                }
                placeholder="Ex: Diagnóstico"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Classes CSS
              </label>
              <Input
                type="text"
                value={data.titulo.classes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("titulo.classes", e.target.value)
                }
                placeholder="tracking-wide text-lg sm:text-xl mb-2 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <Type className="w-5 h-5" />
              Heading Principal
            </h4>
            <div className="flex items-center">
              <span className="text-sm text-zinc-600 dark:text-zinc-400 mr-2">Visível:</span>
              <button
                type="button"
                onClick={() => handleChange("heading.visivel", !data.heading.visivel)}
                className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${
                  data.heading.visivel ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                  data.heading.visivel ? "translate-x-5" : ""
                }`} />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Texto Principal
              </label>
              <Input
                type="text"
                value={data.heading.texto}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("heading.texto", e.target.value)
                }
                placeholder="Ex: Onde sua operação"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Texto Destacado
              </label>
              <Input
                type="text"
                value={data.heading.destaque}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("heading.destaque", e.target.value)
                }
                placeholder="Ex: aperta?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Classes CSS
              </label>
              <Input
                type="text"
                value={data.heading.classes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("heading.classes", e.target.value)
                }
                placeholder="font-bold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight max-w-4xl"
              />
            </div>
          </div>
        </div>

        {/* Subtítulo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <Type className="w-5 h-5" />
              Subtítulo
            </h4>
            <div className="flex items-center">
              <span className="text-sm text-zinc-600 dark:text-zinc-400 mr-2">Visível:</span>
              <button
                type="button"
                onClick={() => handleChange("subtitulo.visivel", !data.subtitulo.visivel)}
                className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${
                  data.subtitulo.visivel ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                  data.subtitulo.visivel ? "translate-x-5" : ""
                }`} />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Texto
              </label>
              <textarea
                value={data.subtitulo.texto}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleChange("subtitulo.texto", e.target.value)
                }
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[100px]"
                rows={3}
                placeholder="Descrição detalhada..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Classes CSS
              </label>
              <Input
                type="text"
                value={data.subtitulo.classes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("subtitulo.classes", e.target.value)
                }
                placeholder="text-base sm:text-lg text-gray-600 font-medium leading-relaxed max-w-3xl"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderImagemSection = () => {
    const data = diagnosticoData.imagem;

    return (
      <div className="space-y-6">
        {/* Upload de Imagem */}
        <ImageUpload
          currentImage={data.src}
          selectedFile={imageFile}
          onFileChange={handleFileChange}
        />

        {/* Configurações da Imagem */}
        <div className="space-y-6">
          <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">
            Configurações da Imagem
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Texto Alt
              </label>
              <Input
                type="text"
                value={data.alt}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("imagem.alt", e.target.value)
                }
                placeholder="Dashboard Tegbe no iPad"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Classes CSS
              </label>
              <Input
                type="text"
                value={data.classes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("imagem.classes", e.target.value)
                }
                placeholder="object-contain pointer-events-none drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Tamanhos */}
          <div className="space-y-4">
            <h5 className="font-medium text-zinc-800 dark:text-zinc-200">Tamanhos</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Mobile
                </label>
                <Input
                  type="text"
                  value={data.tamanhos.mobile}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("imagem.tamanhos.mobile", e.target.value)
                  }
                  placeholder="303px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Desktop
                </label>
                <Input
                  type="text"
                  value={data.tamanhos.desktop}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("imagem.tamanhos.desktop", e.target.value)
                  }
                  placeholder="470px"
                />
              </div>
            </div>
          </div>

          {/* Dimensões */}
          <div className="space-y-4">
            <h5 className="font-medium text-zinc-800 dark:text-zinc-200">Dimensões</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Largura Máxima
                </label>
                <Input
                  type="text"
                  value={data.dimensoes.maxLargura}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("imagem.dimensoes.maxLargura", e.target.value)
                  }
                  placeholder="520px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Qualidade
                </label>
                <Input
                  type="number"
                  value={data.qualidade.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("imagem.qualidade", parseInt(e.target.value))
                  }
                  placeholder="75"
                  min="1"
                  max="100"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Altura Mobile
                </label>
                <Input
                  type="text"
                  value={data.dimensoes.mobileAltura}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("imagem.dimensoes.mobileAltura", e.target.value)
                  }
                  placeholder="420px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Altura Tablet
                </label>
                <Input
                  type="text"
                  value={data.dimensoes.tabletAltura}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("imagem.dimensoes.tabletAltura", e.target.value)
                  }
                  placeholder="520px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Altura Desktop
                </label>
                <Input
                  type="text"
                  value={data.dimensoes.desktopAltura}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("imagem.dimensoes.desktopAltura", e.target.value)
                  }
                  placeholder="650px"
                />
              </div>
            </div>
          </div>

          {/* Visibilidade */}
          <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
              <div>
                <h5 className="font-medium text-zinc-800 dark:text-zinc-200">Visibilidade da Imagem</h5>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Mostrar ou esconder a imagem na seção
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleChange("imagem.visivel", !data.visivel)}
              className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                data.visivel ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                data.visivel ? "translate-x-6" : ""
              }`} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCardsSection = () => {
    const cards = diagnosticoData.cards;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Cards ({cards.length})
          </h4>
          <Button
            type="button"
            onClick={addCard}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Card
          </Button>
        </div>

        {cards.length === 0 ? (
          <Card className="p-8 text-center">
            <ClipboardCheck className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Nenhum card adicionado
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Adicione cards para esta seção
            </p>
            <Button
              type="button"
              onClick={addCard}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Adicionar Primeiro Card
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {cards.map((card, index) => (
              <CardEditor
                key={card.id}
                card={card}
                index={index}
                onCardChange={handleCardChange}
                onRemove={removeCard}
              />
            ))}
          </div>
        )}

        {cards.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <span className="font-semibold">Recomendação:</span> Mantenha 3 cards para melhor
              visualização e performance da seção.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderConfiguracoesSection = () => {
    const config = diagnosticoData.configuracoes;

    return (
      <div className="space-y-8">
        {/* Layout */}
        <div className="space-y-4">
          <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <Grid3x3 className="w-5 h-5" />
            Layout
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Grid Classes
              </label>
              <Input
                type="text"
                value={config.layout.grid}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("configuracoes.layout.grid", e.target.value)
                }
                placeholder="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Gap
              </label>
              <Input
                type="text"
                value={config.layout.gap}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("configuracoes.layout.gap", e.target.value)
                }
                placeholder="gap-8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Container
              </label>
              <Input
                type="text"
                value={config.layout.container}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("configuracoes.layout.container", e.target.value)
                }
                placeholder="max-w-6xl"
              />
            </div>
          </div>
        </div>

        {/* Espaçamento */}
        <div className="space-y-4">
          <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Espaçamento
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Seção
              </label>
              <Input
                type="text"
                value={config.espacamento.secao}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("configuracoes.espacamento.secao", e.target.value)
                }
                placeholder="my-12 md:my-20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Texto
              </label>
              <Input
                type="text"
                value={config.espacamento.texto}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("configuracoes.espacamento.texto", e.target.value)
                }
                placeholder="mb-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Imagem
              </label>
              <Input
                type="text"
                value={config.espacamento.imagem}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("configuracoes.espacamento.imagem", e.target.value)
                }
                placeholder="mb-16"
              />
            </div>
          </div>
        </div>

        {/* Cores */}
        <div className="space-y-4">
          <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Cores
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Fundo
              </label>
              <Input
                type="text"
                value={config.cores.fundo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("configuracoes.cores.fundo", e.target.value)
                }
                placeholder="bg-[#F4F4F4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Texto
              </label>
              <Input
                type="text"
                value={config.cores.texto}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("configuracoes.cores.texto", e.target.value)
                }
                placeholder="text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Destaque
              </label>
              <Input
                type="text"
                value={config.cores.destaque}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("configuracoes.cores.destaque", e.target.value)
                }
                placeholder="#FFCC00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Texto Secundário
              </label>
              <Input
                type="text"
                value={config.cores.textoSecundario}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("configuracoes.cores.textoSecundario", e.target.value)
                }
                placeholder="text-gray-600"
              />
            </div>
          </div>

          {/* Cores do Card */}
          <div className="space-y-4 p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
            <h5 className="font-medium text-zinc-800 dark:text-zinc-200">Cores dos Cards</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Fundo do Card
                </label>
                <Input
                  type="text"
                  value={config.cores.card.fundo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("configuracoes.cores.card.fundo", e.target.value)
                  }
                  placeholder="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Círculo Normal
                </label>
                <Input
                  type="text"
                  value={config.cores.card.circulo.normal}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("configuracoes.cores.card.circulo.normal", e.target.value)
                  }
                  placeholder="bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Círculo Hover
                </label>
                <Input
                  type="text"
                  value={config.cores.card.circulo.hover}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("configuracoes.cores.card.circulo.hover", e.target.value)
                  }
                  placeholder="bg-[#FFCC00]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Número Hover
                </label>
                <Input
                  type="text"
                  value={config.cores.card.numero.hover}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("configuracoes.cores.card.numero.hover", e.target.value)
                  }
                  placeholder="text-[#FFCC00]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Animação */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Configurações de Animação
            </h4>
            <div className="flex items-center">
              <span className="text-sm text-zinc-600 dark:text-zinc-400 mr-2">Habilitada:</span>
              <button
                type="button"
                onClick={() => handleChange("configuracoes.animacao.habilitada", !config.animacao.habilitada)}
                className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${
                  config.animacao.habilitada ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                  config.animacao.habilitada ? "translate-x-5" : ""
                }`} />
              </button>
            </div>
          </div>
          
          {config.animacao.habilitada && (
            <div className="space-y-4 p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Duração (segundos)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.animacao.duracao.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("configuracoes.animacao.duracao", parseFloat(e.target.value))
                    }
                    placeholder="0.6"
                    min="0.1"
                    max="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Easing Function
                  </label>
                  <Input
                    type="text"
                    value={config.animacao.ease}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange("configuracoes.animacao.ease", e.target.value)
                    }
                    placeholder="power2.out"
                  />
                </div>
              </div>

              {/* ScrollTrigger */}
              <div className="space-y-3">
                <h5 className="font-medium text-zinc-800 dark:text-zinc-200">Scroll Trigger</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Start
                    </label>
                    <Input
                      type="text"
                      value={config.animacao.scrollTrigger.start}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange("configuracoes.animacao.scrollTrigger.start", e.target.value)
                      }
                      placeholder="top 75%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      End
                    </label>
                    <Input
                      type="text"
                      value={config.animacao.scrollTrigger.end}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange("configuracoes.animacao.scrollTrigger.end", e.target.value)
                      }
                      placeholder="bottom 20%"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Toggle Actions
                    </label>
                    <Input
                      type="text"
                      value={config.animacao.scrollTrigger.toggleActions}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange("configuracoes.animacao.scrollTrigger.toggleActions", e.target.value)
                      }
                      placeholder="play none none reverse"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={ClipboardCheck}
      title="Seção de Diagnóstico"
      description="Gerencie a seção de diagnóstico com textos, imagem, cards e configurações"
      exists={!!exists}
      itemName="Diagnóstico"
    >
      <form onSubmit={handleSubmitWrapper} className="space-y-6 pb-32">
        {/* Seção Texto */}
        <div className="space-y-4">
          <SectionHeader
            title="Texto e Títulos"
            section="texto"
            icon={Type}
            isExpanded={expandedSections.texto}
            onToggle={toggleSection}
          />

          <AnimatePresence>
            {expandedSections.texto && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderTextoSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção Imagem */}
        <div className="space-y-4">
          <SectionHeader
            title="Imagem Principal"
            section="imagem"
            icon={ImageIcon}
            isExpanded={expandedSections.imagem}
            onToggle={toggleSection}
          />

          <AnimatePresence>
            {expandedSections.imagem && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderImagemSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção Cards */}
        <div className="space-y-4">
          <SectionHeader
            title="Cards de Opções"
            section="cards"
            icon={ClipboardCheck}
            isExpanded={expandedSections.cards}
            onToggle={toggleSection}
          />

          <AnimatePresence>
            {expandedSections.cards && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderCardsSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção Configurações */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações Avançadas"
            section="configuracoes"
            icon={Settings}
            isExpanded={expandedSections.configuracoes}
            onToggle={toggleSection}
          />

          <AnimatePresence>
            {expandedSections.configuracoes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderConfiguracoesSection()}
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
          itemName="Diagnóstico"
          icon={ClipboardCheck}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={4}
        itemName="Configuração"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}