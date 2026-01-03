/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Switch } from "@/components/Switch";
import { TextArea } from "@/components/TextArea";
import { 
  Layout, 
  Settings,
  Image as ImageIcon,
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  MoveUp,
  MoveDown,
  Type,
  Grid3x3,
  Palette,
  Eye,
  EyeOff
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import ColorPicker from "@/components/ColorPicker";

interface CardItem {
  id: number;
  numero: string;
  titulo: string;
  descricao: string;
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

interface Configuracoes {
  animacao: AnimacaoConfig;
  layout: LayoutConfig;
  espacamento: EspacamentoConfig;
  cores: CoresConfig;
}

interface DiagnosticoData {
  id?: string;
  titulo: {
    texto: string;
    visivel: boolean;
    classes: string;
  };
  heading: {
    texto: string;
    destaque: string;
    visivel: boolean;
    classes: string;
  };
  subtitulo: {
    texto: string;
    visivel: boolean;
    classes: string;
  };
  imagem: ImagemConfig;
  cards: CardItem[];
  configuracoes: Configuracoes;
}

const initialEmptyData: DiagnosticoData = {
  titulo: {
    texto: "",
    visivel: true,
    classes: "tracking-wide text-lg sm:text-xl mb-2 font-medium"
  },
  heading: {
    texto: "",
    destaque: "",
    visivel: true,
    classes: "font-bold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight max-w-4xl"
  },
  subtitulo: {
    texto: "",
    visivel: true,
    classes: "text-base sm:text-lg text-gray-600 font-medium leading-relaxed max-w-3xl"
  },
  imagem: {
    src: "",
    alt: "",
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

export default function DiagnosticoPage() {
  const [data, setData] = useState<DiagnosticoData>(initialEmptyData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    cabecalho: true,
    imagem: false,
    cards: false,
    configuracoes: false
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "single" as "single" | "all",
    title: "",
    cardIndex: -1
  });

  const apiBase = "/api/tegbe-institucional/form";
  const type = "ecommerce";

  // Calcular campos completos
  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    if (data.titulo.texto.trim() !== "") count++;
    if (data.heading.texto.trim() !== "") count++;
    if (data.heading.destaque.trim() !== "") count++;
    if (data.subtitulo.texto.trim() !== "") count++;
    if (data.imagem.src.trim() !== "") count++;
    
    return count;
  }, [data]);

  const completeCount = calculateCompleteCount();
  const totalCount = 5;
  const exists = !!data.id;
  const canAddNewItem = data.cards.length < 6;
  const isLimitReached = data.cards.length >= 6;

  const fetchExistingData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/${type}`);

      if (res.ok) {
        const fetchedData = await res.json();
        if (fetchedData && fetchedData.values && fetchedData.values[0]) {
          setData(fetchedData.values[0]);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setErrorMsg("Erro ao carregar dados do servidor");
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchExistingData();
  }, [fetchExistingData]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    const keys = path.split(".");
    setData((prev) => {
      const newData = { ...prev };
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleNestedChange = (parentPath: string, childPath: string, value: any) => {
    const keys = childPath.split(".");
    setData((prev) => {
      const newData = { ...prev };
      let current: any = newData;
      
      // Navegar até o objeto pai
      const parentKeys = parentPath.split(".");
      for (const key of parentKeys) {
        if (!current[key]) current[key] = {};
        current = current[key];
      }
      
      // Navegar até o campo filho
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addCard = () => {
    if (!canAddNewItem) return;
    
    const newCard: CardItem = {
      id: data.cards.length + 1,
      numero: (data.cards.length + 1).toString(),
      titulo: "",
      descricao: "",
      visivel: true,
      classes: "bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-[#FFCC00] transition-colors duration-300 opacity-0 group cursor-default"
    };
    
    setData((prev) => ({
      ...prev,
      cards: [...prev.cards, newCard]
    }));
  };

  const removeCard = (index: number) => {
    setData((prev) => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index).map((card, i) => ({
        ...card,
        id: i + 1,
        numero: (i + 1).toString()
      }))
    }));
  };

  const moveCard = (index: number, direction: "up" | "down") => {
    const newCards = [...data.cards];
    
    if (direction === "up" && index > 0) {
      [newCards[index], newCards[index - 1]] = [newCards[index - 1], newCards[index]];
    } else if (direction === "down" && index < newCards.length - 1) {
      [newCards[index], newCards[index + 1]] = [newCards[index + 1], newCards[index]];
    }
    
    // Reordenar números
    const reorderedCards = newCards.map((card, i) => ({
      ...card,
      id: i + 1,
      numero: (i + 1).toString()
    }));
    
    setData((prev) => ({
      ...prev,
      cards: reorderedCards
    }));
  };

  const handleCardChange = (index: number, field: keyof CardItem, value: any) => {
    const newCards = [...data.cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setData((prev) => ({ ...prev, cards: newCards }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const fd = new FormData();

      fd.append("type", type);
      fd.append("subtype", "tegbe-institucional");
      fd.append("values", JSON.stringify([data]));

      if (data.id) {
        fd.append("id", data.id);
      }

      const method = data.id ? "PUT" : "POST";

      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || "Erro ao salvar configurações"
        );
      }

      const saved = await res.json();

      if (saved?.values?.[0]) {
        setData(prev => ({
          ...saved.values[0],
          id: saved.id
        }));
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWrapper = () => {
    handleSubmit();
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODAS AS CONFIGURAÇÕES",
      cardIndex: -1
    });
  };

  const openDeleteCardModal = (index: number) => {
    const card = data.cards[index];
    setDeleteModal({
      isOpen: true,
      type: "single",
      title: `Card ${card.numero}: ${card.titulo || "Sem título"}`,
      cardIndex: index
    });
  };

  const confirmDelete = async () => {
    if (deleteModal.type === "all" && data.id) {
      try {
        const res = await fetch(`${apiBase}/${type}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: data.id }),
        });

        if (res.ok) {
          setData(initialEmptyData);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        } else {
          throw new Error("Erro ao deletar");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Erro ao deletar");
      }
    } else if (deleteModal.type === "single" && deleteModal.cardIndex >= 0) {
      removeCard(deleteModal.cardIndex);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
    
    setDeleteModal({ 
      isOpen: false, 
      type: "single", 
      title: "", 
      cardIndex: -1 
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: "single", 
      title: "", 
      cardIndex: -1 
    });
  };

  const SectionHeader = ({
    title,
    section,
    icon: Icon,
  }: {
    title: string;
    section: keyof typeof expandedSections;
    icon: any;
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          {title}
        </h3>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      ) : (
        <ChevronDown className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      )}
    </button>
  );

  const renderCabecalhoSection = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Título */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
                Título
              </h4>
              <div className="flex items-center gap-2">
                <Switch
                  checked={data.titulo.visivel}
                  onCheckedChange={(checked: boolean) =>
                    handleChange("titulo.visivel", checked)
                  }
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {data.titulo.visivel ? "Visível" : "Oculto"}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
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
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Classes CSS
                </label>
                <Input
                  type="text"
                  value={data.titulo.classes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("titulo.classes", e.target.value)
                  }
                  placeholder="Classes do tailwind"
                />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
                Heading Principal
              </h4>
              <div className="flex items-center gap-2">
                <Switch
                  checked={data.heading.visivel}
                  onCheckedChange={(checked: boolean) =>
                    handleChange("heading.visivel", checked)
                  }
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {data.heading.visivel ? "Visível" : "Oculto"}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
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
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Texto em Destaque
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
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Classes CSS
                </label>
                <Input
                  type="text"
                  value={data.heading.classes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("heading.classes", e.target.value)
                  }
                  placeholder="Classes do tailwind"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subtítulo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
              Subtítulo
            </h4>
            <div className="flex items-center gap-2">
              <Switch
                checked={data.subtitulo.visivel}
                onCheckedChange={(checked: boolean) =>
                  handleChange("subtitulo.visivel", checked)
                }
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {data.subtitulo.visivel ? "Visível" : "Oculto"}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Texto
              </label>
              <TextArea
                value={data.subtitulo.texto}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleChange("subtitulo.texto", e.target.value)
                }
                placeholder="Ex: Seja para quem está dando o primeiro passo ou para quem já domina os canais de venda..."
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Classes CSS
              </label>
              <Input
                type="text"
                value={data.subtitulo.classes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("subtitulo.classes", e.target.value)
                }
                placeholder="Classes do tailwind"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderImagemSection = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
                Configurações da Imagem
              </h4>
              <div className="flex items-center gap-2">
                <Switch
                  checked={data.imagem.visivel}
                  onCheckedChange={(checked: boolean) =>
                    handleChange("imagem.visivel", checked)
                  }
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {data.imagem.visivel ? "Visível" : "Oculto"}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Caminho da Imagem
                </label>
                <Input
                  type="text"
                  value={data.imagem.src}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("imagem.src", e.target.value)
                  }
                  placeholder="Ex: /ipad.png"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Texto Alternativo
                </label>
                <Input
                  type="text"
                  value={data.imagem.alt}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("imagem.alt", e.target.value)
                  }
                  placeholder="Ex: Dashboard Tegbe no iPad"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Classes CSS
                </label>
                <Input
                  type="text"
                  value={data.imagem.classes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("imagem.classes", e.target.value)
                  }
                  placeholder="Classes do tailwind"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Qualidade (1-100)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={data.imagem.qualidade.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("imagem.qualidade", parseInt(e.target.value) || 75)
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
                Tamanhos
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Mobile
                  </label>
                  <Input
                    type="text"
                    value={data.imagem.tamanhos.mobile}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleNestedChange("imagem.tamanhos", "mobile", e.target.value)
                    }
                    placeholder="Ex: 303px"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Desktop
                  </label>
                  <Input
                    type="text"
                    value={data.imagem.tamanhos.desktop}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleNestedChange("imagem.tamanhos", "desktop", e.target.value)
                    }
                    placeholder="Ex: 470px"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
                Dimensões
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Largura Máxima
                  </label>
                  <Input
                    type="text"
                    value={data.imagem.dimensoes.maxLargura}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleNestedChange("imagem.dimensoes", "maxLargura", e.target.value)
                    }
                    placeholder="Ex: 520px"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Altura Mobile
                    </label>
                    <Input
                      type="text"
                      value={data.imagem.dimensoes.mobileAltura}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleNestedChange("imagem.dimensoes", "mobileAltura", e.target.value)
                      }
                      placeholder="Ex: 420px"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Altura Tablet
                    </label>
                    <Input
                      type="text"
                      value={data.imagem.dimensoes.tabletAltura}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleNestedChange("imagem.dimensoes", "tabletAltura", e.target.value)
                      }
                      placeholder="Ex: 520px"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Altura Desktop
                    </label>
                    <Input
                      type="text"
                      value={data.imagem.dimensoes.desktopAltura}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleNestedChange("imagem.dimensoes", "desktopAltura", e.target.value)
                      }
                      placeholder="Ex: 650px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCardItem = (card: CardItem, index: number) => {
    return (
      <Card key={index} className="mb-4 overflow-hidden border border-zinc-200 dark:border-zinc-700">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveCard(index, "up")}
                  disabled={index === 0}
                  className="p-1 disabled:opacity-30 text-zinc-600 dark:text-zinc-400"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveCard(index, "down")}
                  disabled={index === data.cards.length - 1}
                  className="p-1 disabled:opacity-30 text-zinc-600 dark:text-zinc-400"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
              </div>
              <span className="text-lg font-bold text-zinc-700 dark:text-zinc-300">
                Card {card.numero}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={card.visivel}
                  onCheckedChange={(checked: boolean) =>
                    handleCardChange(index, "visivel", checked)
                  }
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {card.visivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </span>
              </div>
              
              <Button
                type="button"
                onClick={() => openDeleteCardModal(index)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                variant="danger"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Número
                </label>
                <Input
                  type="text"
                  value={card.numero}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleCardChange(index, "numero", e.target.value)
                  }
                  placeholder="Ex: 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  ID
                </label>
                <Input
                  type="number"
                  value={card.id.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleCardChange(index, "id", parseInt(e.target.value) || 1)
                  }
                  disabled
                  className="bg-zinc-100 dark:bg-zinc-800"
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
                placeholder="Ex: Deseja começar do zero?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Descrição
              </label>
              <TextArea
                value={card.descricao}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleCardChange(index, "descricao", e.target.value)
                }
                placeholder="Descrição do card..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Classes CSS
              </label>
              <Input
                type="text"
                value={card.classes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleCardChange(index, "classes", e.target.value)
                }
                placeholder="Classes do tailwind"
              />
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderCardsSection = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
            Cards ({data.cards.length})
          </h4>
          
          <div className="flex items-center gap-4">
            {isLimitReached && (
              <span className="text-sm text-red-600 dark:text-red-400">
                Limite máximo atingido (6 cards)
              </span>
            )}
            <Button
              type="button"
              onClick={addCard}
              disabled={!canAddNewItem || isLimitReached}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Card
            </Button>
          </div>
        </div>

        {data.cards.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
            <Grid3x3 className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Nenhum card cadastrado
            </p>
            <Button
              type="button"
              onClick={addCard}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Primeiro Card
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.cards.map((card, index) => 
              renderCardItem(card, index)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderConfiguracoesSection = () => {
    return (
      <div className="space-y-8">
        {/* Configurações de Animação */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
              Animação
            </h4>
            <div className="flex items-center gap-2">
              <Switch
                checked={data.configuracoes.animacao.habilitada}
                onCheckedChange={(checked: boolean) =>
                  handleNestedChange("configuracoes.animacao", "habilitada", checked)
                }
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {data.configuracoes.animacao.habilitada ? "Habilitada" : "Desabilitada"}
              </span>
            </div>
          </div>

          {data.configuracoes.animacao.habilitada && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Duração (segundos)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={data.configuracoes.animacao.duracao.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleNestedChange("configuracoes.animacao", "duracao", parseFloat(e.target.value) || 0.6)
                    }
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Easing
                  </label>
                  <Input
                    type="text"
                    value={data.configuracoes.animacao.ease}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleNestedChange("configuracoes.animacao", "ease", e.target.value)
                    }
                    placeholder="Ex: power2.out"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Scroll Trigger
                </h5>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Start
                    </label>
                    <Input
                      type="text"
                      value={data.configuracoes.animacao.scrollTrigger.start}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleNestedChange("configuracoes.animacao.scrollTrigger", "start", e.target.value)
                      }
                      placeholder="Ex: top 75%"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      End
                    </label>
                    <Input
                      type="text"
                      value={data.configuracoes.animacao.scrollTrigger.end}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleNestedChange("configuracoes.animacao.scrollTrigger", "end", e.target.value)
                      }
                      placeholder="Ex: bottom 20%"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Toggle Actions
                  </label>
                  <Input
                    type="text"
                    value={data.configuracoes.animacao.scrollTrigger.toggleActions}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleNestedChange("configuracoes.animacao.scrollTrigger", "toggleActions", e.target.value)
                    }
                    placeholder="Ex: play none none reverse"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Configurações de Layout */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
            <Grid3x3 className="w-5 h-5 inline mr-2" />
            Layout
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Grid
              </label>
              <Input
                type="text"
                value={data.configuracoes.layout.grid}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleNestedChange("configuracoes.layout", "grid", e.target.value)
                }
                placeholder="Ex: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Gap
              </label>
              <Input
                type="text"
                value={data.configuracoes.layout.gap}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleNestedChange("configuracoes.layout", "gap", e.target.value)
                }
                placeholder="Ex: gap-8"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Container
              </label>
              <Input
                type="text"
                value={data.configuracoes.layout.container}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleNestedChange("configuracoes.layout", "container", e.target.value)
                }
                placeholder="Ex: max-w-6xl"
              />
            </div>
          </div>
        </div>

        {/* Configurações de Espaçamento */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
            Espaçamento
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Seção
              </label>
              <Input
                type="text"
                value={data.configuracoes.espacamento.secao}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleNestedChange("configuracoes.espacamento", "secao", e.target.value)
                }
                placeholder="Ex: my-12 md:my-20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Texto
              </label>
              <Input
                type="text"
                value={data.configuracoes.espacamento.texto}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleNestedChange("configuracoes.espacamento", "texto", e.target.value)
                }
                placeholder="Ex: mb-12"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Imagem
              </label>
              <Input
                type="text"
                value={data.configuracoes.espacamento.imagem}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleNestedChange("configuracoes.espacamento", "imagem", e.target.value)
                }
                placeholder="Ex: mb-16"
              />
            </div>
          </div>
        </div>

        {/* Configurações de Cores */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
            <Palette className="w-5 h-5 inline mr-2" />
            Cores
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Fundo
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={data.configuracoes.cores.fundo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleNestedChange("configuracoes.cores", "fundo", e.target.value)
                  }
                  placeholder="Ex: bg-[#F4F4F4]"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Texto Principal
              </label>
              <Input
                type="text"
                value={data.configuracoes.cores.texto}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleNestedChange("configuracoes.cores", "texto", e.target.value)
                }
                placeholder="Ex: text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Cor de Destaque
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={data.configuracoes.cores.destaque}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleNestedChange("configuracoes.cores", "destaque", e.target.value)
                  }
                  placeholder="Ex: #FFCC00"
                  className="font-mono"
                />
                <ColorPicker
                  color={data.configuracoes.cores.destaque}
                  onChange={(color: string) =>
                    handleNestedChange("configuracoes.cores", "destaque", color)
                  }
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Texto Secundário
              </label>
              <Input
                type="text"
                value={data.configuracoes.cores.textoSecundario}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleNestedChange("configuracoes.cores", "textoSecundario", e.target.value)
                }
                placeholder="Ex: text-gray-600"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={Layout}
      title="Seção Ecommerce"
      description="Configure a seção de ecommerce com cards interativos"
      exists={exists}
      itemName="Ecommerce"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Cabeçalho Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho"
            section="cabecalho"
            icon={Type}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.cabecalho ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderCabecalhoSection()}
            </Card>
          </motion.div>
        </div>

        {/* Imagem Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Imagem"
            section="imagem"
            icon={ImageIcon}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.imagem ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderImagemSection()}
            </Card>
          </motion.div>
        </div>

        {/* Cards Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Cards"
            section="cards"
            icon={Grid3x3}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.cards ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderCardsSection()}
            </Card>
          </motion.div>
        </div>

        {/* Configurações Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações Avançadas"
            section="configuracoes"
            icon={Settings}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.configuracoes ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderConfiguracoesSection()}
            </Card>
          </motion.div>
        </div>

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmitWrapper}
          isAddDisabled={!canAddNewItem || isLimitReached}
          isSaving={loading}
          exists={exists}
          completeCount={completeCount}
          totalCount={totalCount}
          itemName="Configuração"
          icon={Layout}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={deleteModal.type === "single" ? 1 : data.cards.length}
        itemName={deleteModal.type === "single" ? "Card" : "Diagnóstico"}
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}