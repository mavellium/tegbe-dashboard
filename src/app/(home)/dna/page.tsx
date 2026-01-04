// app/dna/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Switch } from "@/components/Switch";
import { TextArea } from "@/components/TextArea";
import { 
  Dna, 
  Settings, 
  Type, 
  Image as ImageIcon, 
  Sliders, 
  PlayCircle,
  PauseCircle,
  ChevronDown, 
  ChevronUp,
  Grid3x3,
  Palette,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Upload,
  X
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import ColorPicker from "@/components/ColorPicker";
import IconSelector from "@/components/IconSelector";
import Image from "next/image";

interface SwiperConfig {
  direcao: string;
  autoplay: {
    delay: number;
    habilitado: boolean;
  };
  dimensoes: {
    mobile: string;
    sm: string;
    md: string;
    lg: string;
  };
}

interface LayoutConfig {
  classes: string;
  container: string;
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
}

interface ConfiguracoesData {
  layout: LayoutConfig;
  animacao: AnimacaoConfig;
  swiper: SwiperConfig;
}

interface BadgeData {
  texto: string;
  visivel: boolean;
  classes: string;
  corTexto: string;
  classesTexto: string;
}

interface TituloData {
  texto: string;
  destaque: string;
  visivel: boolean;
  classes: string;
  gradiente: string;
}

interface SubtituloData {
  texto: string;
  visivel: boolean;
  classes: string;
}

interface ParagrafoFinalData {
  texto: string;
  visivel: boolean;
  classes: string;
}

interface BotaoData {
  texto: string;
  link: string;
  icone: string;
  visivel: boolean;
  ariaLabel: string;
  classes: {
    container: string;
    glow: string;
    botao: string;
  };
}

interface ControlesPlayPause {
  iconePlay: string;
  iconePause: string;
  classesBotao: string;
  classesIcone: string;
}

interface ControlesDots {
  classesContainer: string;
  cores: {
    ativo: string;
    inativo: string;
  };
  dimensoes: {
    mobile: {
      ativo: string;
      inativo: string;
    };
    desktop: {
      ativo: string;
      inativo: string;
    };
  };
}

interface ControlesData {
  playPause: ControlesPlayPause;
  dots: ControlesDots;
}

interface CardItem {
  id: number;
  image: string;
  alt: string;
  file?: File | null;
  preview?: string;
}

interface EfeitosData {
  glow: {
    visivel: boolean;
    classes: string;
  };
  gradienteImagem: {
    classes: string;
  };
}

interface DnaData {
  id?: string;
  configuracoes: ConfiguracoesData;
  badge: BadgeData;
  titulo: TituloData;
  subtitulo: SubtituloData;
  paragrafoFinal: ParagrafoFinalData;
  botao: BotaoData;
  controles: ControlesData;
  cards: CardItem[];
  efeitos: EfeitosData;
}

// JSON inicial vazio
const emptyDnaData: DnaData = {
  configuracoes: {
    layout: {
      classes: "py-24 w-full flex flex-col justify-center items-center bg-[#050505] px-5 relative overflow-hidden",
      container: "container flex flex-col justify-center relative z-10"
    },
    animacao: {
      habilitada: true,
      duracao: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        start: "top 70%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    },
    swiper: {
      direcao: "vertical",
      autoplay: {
        delay: 5000,
        habilitado: true
      },
      dimensoes: {
        mobile: "h-[400px]",
        sm: "sm:h-[450px]",
        md: "md:h-[500px]",
        lg: "lg:h-[600px]"
      }
    }
  },
  badge: {
    texto: "",
    visivel: false,
    classes: "mb-4 px-3 py-1 rounded-full border border-gray-800 bg-gray-900/50 backdrop-blur-sm",
    corTexto: "text-[#FFCC00]",
    classesTexto: "text-xs font-semibold tracking-wider uppercase"
  },
  titulo: {
    texto: "",
    destaque: "",
    visivel: false,
    classes: "font-bold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight max-w-4xl text-white",
    gradiente: "bg-gradient-to-r from-[#FFCC00] to-yellow-600"
  },
  subtitulo: {
    texto: "",
    visivel: true,
    classes: "text-base sm:text-lg text-gray-400 font-light leading-relaxed max-w-3xl"
  },
  paragrafoFinal: {
    texto: "",
    visivel: true,
    classes: "text-base sm:text-lg font-light leading-relaxed"
  },
  botao: {
    texto: "",
    link: "",
    icone: "lucide:arrow-right",
    visivel: true,
    ariaLabel: "",
    classes: {
      container: "group relative",
      glow: "absolute -inset-1 bg-yellow-500 rounded-full opacity-20 blur group-hover:opacity-40 transition duration-200",
      botao: "relative shadow-xl bg-[#FFCC00] text-black font-bold hover:bg-[#E6B800] text-base sm:text-lg transition-all duration-300 h-14 px-8 rounded-full flex items-center gap-2"
    }
  },
  controles: {
    playPause: {
      iconePlay: "solar:play-bold",
      iconePause: "solar:pause-bold",
      classesBotao: "flex items-center justify-center bg-[#1A1A1A] border border-white/10 text-white hover:bg-[#FFCC00] hover:text-black hover:border-[#FFCC00] rounded-full p-0 h-12 w-12 shadow-lg transition-all duration-300 group",
      classesIcone: "w-5 h-5"
    },
    dots: {
      classesContainer: "flex gap-3 bg-[#1A1A1A] border border-white/5 px-4 py-4 lg:px-4 lg:py-4 rounded-full justify-center items-center shadow-lg",
      cores: {
        ativo: "bg-[#FFCC00] shadow-[0_0_10px_#FFCC00]",
        inativo: "bg-gray-600 hover:bg-gray-400"
      },
      dimensoes: {
        mobile: {
          ativo: "32px",
          inativo: "10px"
        },
        desktop: {
          ativo: "32px",
          inativo: "10px"
        }
      }
    }
  },
  cards: [],
  efeitos: {
    glow: {
      visivel: true,
      classes: "absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"
    },
    gradienteImagem: {
      classes: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500"
    }
  }
};

// Valores padrão para referência
const defaultValues = {
  configuracoes: {
    layout: {
      classes: "py-24 w-full flex flex-col justify-center items-center bg-[#050505] px-5 relative overflow-hidden",
      container: "container flex flex-col justify-center relative z-10"
    },
    animacao: {
      habilitada: true,
      duracao: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        start: "top 70%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    },
    swiper: {
      direcao: "vertical",
      autoplay: {
        delay: 5000,
        habilitado: true
      },
      dimensoes: {
        mobile: "h-[400px]",
        sm: "sm:h-[450px]",
        md: "md:h-[500px]",
        lg: "lg:h-[600px]"
      }
    }
  },
  badge: {
    texto: "DNA DE PERFORMANCE",
    visivel: true,
    classes: "mb-4 px-3 py-1 rounded-full border border-gray-800 bg-gray-900/50 backdrop-blur-sm",
    corTexto: "text-[#FFCC00]",
    classesTexto: "text-xs font-semibold tracking-wider uppercase"
  },
  titulo: {
    texto: "Sua operação guiada por quem entende o",
    destaque: "DNA do Mercado Livre.",
    visivel: true,
    classes: "font-bold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight max-w-4xl text-white",
    gradiente: "bg-gradient-to-r from-[#FFCC00] to-yellow-600"
  },
  subtitulo: {
    texto: "Esqueça os 'hacks' temporários. Ser liderado por um <strong class='text-white font-medium'>Consultor Oficial Certificado</strong> significa estratégia baseada em dados diretos da fonte. Nós jogamos com o manual de regras debaixo do braço para garantir a segurança e a escala da sua conta.",
    visivel: true,
    classes: "text-base sm:text-lg text-gray-400 font-light leading-relaxed max-w-3xl"
  },
  paragrafoFinal: {
    texto: "Mas estratégia sem braço não gera lucro. Por isso, Doni formou uma <strong class='text-white font-medium'>Tropa de Elite Operacional.</strong> Cada membro é especialista em um pilar vital: Tráfego, Design, Copy e Logística. Você não contrata apenas um consultor; você pluga seu negócio a um ecossistema que respira vendas 24h.",
    visivel: true,
    classes: "text-base sm:text-lg font-light leading-relaxed"
  },
  botao: {
    texto: "CONTRATAR MEU TIME",
    link: "https://api.whatsapp.com/send?phone=5514991779502",
    icone: "lucide:arrow-right",
    visivel: true,
    ariaLabel: "Contratar meu time",
    classes: {
      container: "group relative",
      glow: "absolute -inset-1 bg-yellow-500 rounded-full opacity-20 blur group-hover:opacity-40 transition duration-200",
      botao: "relative shadow-xl bg-[#FFCC00] text-black font-bold hover:bg-[#E6B800] text-base sm:text-lg transition-all duration-300 h-14 px-8 rounded-full flex items-center gap-2"
    }
  },
  controles: {
    playPause: {
      iconePlay: "solar:play-bold",
      iconePause: "solar:pause-bold",
      classesBotao: "flex items-center justify-center bg-[#1A1A1A] border border-white/10 text-white hover:bg-[#FFCC00] hover:text-black hover:border-[#FFCC00] rounded-full p-0 h-12 w-12 shadow-lg transition-all duration-300 group",
      classesIcone: "w-5 h-5"
    },
    dots: {
      classesContainer: "flex gap-3 bg-[#1A1A1A] border border-white/5 px-4 py-4 lg:px-4 lg:py-4 rounded-full justify-center items-center shadow-lg",
      cores: {
        ativo: "bg-[#FFCC00] shadow-[0_0_10px_#FFCC00]",
        inativo: "bg-gray-600 hover:bg-gray-400"
      },
      dimensoes: {
        mobile: {
          ativo: "32px",
          inativo: "10px"
        },
        desktop: {
          ativo: "32px",
          inativo: "10px"
        }
      }
    }
  },
  efeitos: {
    glow: {
      visivel: true,
      classes: "absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"
    },
    gradienteImagem: {
      classes: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500"
    }
  }
};

// Lista de etapas/fields para validação
const stepList = [
  { id: 'badge', label: 'Badge', fields: ['badge.texto'] },
  { id: 'titulo', label: 'Título', fields: ['titulo.texto', 'titulo.destaque'] },
  { id: 'subtitulo', label: 'Subtítulo', fields: ['subtitulo.texto'] },
  { id: 'paragrafoFinal', label: 'Parágrafo Final', fields: ['paragrafoFinal.texto'] },
  { id: 'botao', label: 'Botão', fields: ['botao.texto', 'botao.link'] },
  { id: 'cards', label: 'Cards', fields: ['cards'] }
];

export default function DnaPage({ 
  type = "dna", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  const [dnaData, setDnaData] = useState<DnaData>(emptyDnaData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    configuracoes: true,
    badge: true,
    titulo: true,
    subtitulo: true,
    paragrafoFinal: true,
    botao: true,
    controles: false,
    cards: false,
    efeitos: false
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: 'single' as 'single' | 'all',
    title: '',
    cardIndex: -1
  });
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const apiBase = `/api/${subtype}/form`;

  // Calcular campos completos
  const completeCount = useMemo(() => {
    let count = 0;
    
    stepList.forEach(step => {
      const allFieldsFilled = step.fields.every(field => {
        const keys = field.split('.');
        let value: any = dnaData;
        
        for (const key of keys) {
          if (value && typeof value === 'object' && key in value) {
            value = value[key];
          } else {
            return false;
          }
        }
        
        if (field === 'cards') {
          return Array.isArray(value) && value.length > 0;
        }
        
        return value !== undefined && value !== null && value !== '';
      });
      
      if (allFieldsFilled) count++;
    });
    
    return count;
  }, [dnaData]);

  const exists = !!dnaData.id;
  const canAddNewItem = dnaData.cards.length < 10;
  const isLimitReached = dnaData.cards.length >= 10;

  const fetchExistingData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/${type}`);
      
      if (res.ok) {
        const data = await res.json();
        if (data && data.values && data.values[0]) {
          setDnaData({
            ...data.values[0],
            id: data.id
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setErrorMsg("Erro ao carregar dados do servidor");
    } finally {
      setLoading(false);
    }
  }, [apiBase, type]);

  useEffect(() => {
    fetchExistingData();
  }, [fetchExistingData]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (path: string, value: any) => {
    const keys = path.split('.');
    setDnaData(prev => {
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
    const keys = childPath.split('.');
    setDnaData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      
      // Navegar até o objeto pai
      const parentKeys = parentPath.split('.');
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
      id: dnaData.cards.length + 1,
      image: "",
      alt: `Imagem ${dnaData.cards.length + 1}`
    };
    
    setDnaData(prev => ({
      ...prev,
      cards: [...prev.cards, newCard]
    }));
  };

  const removeCard = (index: number) => {
    // Liberar URL do preview se existir
    const card = dnaData.cards[index];
    if (card.preview) {
      URL.revokeObjectURL(card.preview);
    }
    
    setDnaData(prev => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index).map((card, i) => ({
        ...card,
        id: i + 1
      }))
    }));
  };

  const moveCard = (index: number, direction: 'up' | 'down') => {
    const newCards = [...dnaData.cards];
    
    if (direction === 'up' && index > 0) {
      [newCards[index], newCards[index - 1]] = [newCards[index - 1], newCards[index]];
    } else if (direction === 'down' && index < newCards.length - 1) {
      [newCards[index], newCards[index + 1]] = [newCards[index + 1], newCards[index]];
    }
    
    const reorderedCards = newCards.map((card, i) => ({
      ...card,
      id: i + 1
    }));
    
    setDnaData(prev => ({
      ...prev,
      cards: reorderedCards
    }));
  };

  const handleCardChange = (index: number, field: keyof CardItem, value: string | File | null) => {
    const newCards = [...dnaData.cards];
    
    if (field === 'file' && value instanceof File) {
      // Liberar URL anterior se existir
      if (newCards[index].preview) {
        URL.revokeObjectURL(newCards[index].preview!);
      }
      
      // Criar nova preview
      const preview = URL.createObjectURL(value);
      newCards[index] = { 
        ...newCards[index], 
        file: value,
        preview: preview,
        image: value.name // Temporário, será substituído pelo servidor
      };
    } else if (field === 'file' && value === null) {
      // Liberar URL se existir
      if (newCards[index].preview) {
        URL.revokeObjectURL(newCards[index].preview!);
      }
      
      newCards[index] = { 
        ...newCards[index], 
        file: null,
        preview: undefined,
        image: "" // Limpar imagem
      };
    } else {
      newCards[index] = { ...newCards[index], [field]: value };
    }
    
    setDnaData(prev => ({ ...prev, cards: newCards }));
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar tipo de arquivo
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrorMsg("Formato de arquivo inválido. Use JPG, PNG, WEBP ou GIF.");
        return;
      }
      
      // Verificar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Arquivo muito grande. Tamanho máximo: 5MB.");
        return;
      }
      
      handleCardChange(index, 'file', file);
      setErrorMsg(""); // Limpar erro se sucesso
    }
  };

  const clearFile = (index: number) => {
    handleCardChange(index, 'file', null);
  };

  const getImageUrl = (card: CardItem): string => {
    if (card.preview) {
      return card.preview;
    }
    if (card.image) {
      if (card.image.startsWith('http') || card.image.startsWith('//') || card.image.startsWith('blob:')) {
        return card.image;
      } else {
        return `https://mavellium.com.br${card.image.startsWith('/') ? '' : '/'}${card.image}`;
      }
    }
    return "";
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      // Validar campos obrigatórios
      if (!dnaData.titulo.texto.trim()) {
        throw new Error("Título é obrigatório");
      }
      if (!dnaData.titulo.destaque.trim()) {
        throw new Error("Destaque do título é obrigatório");
      }
      if (dnaData.cards.length === 0) {
        throw new Error("Adicione pelo menos um card com imagem");
      }

      // Verificar se todos os cards têm imagem
      for (const card of dnaData.cards) {
        if (!card.file && !card.image) {
          throw new Error(`Card ${card.id} não tem imagem. Faça upload de uma imagem.`);
        }
      }

      const fd = new FormData();

      fd.append("type", type);
      fd.append("subtype", subtype);
      
      // Preparar dados sem os arquivos para o JSON
      const dataToSend = {
        ...dnaData,
        cards: dnaData.cards.map(card => ({
          id: card.id,
          image: card.file ? `card-${card.id}.${card.file.name.split('.').pop()}` : card.image,
          alt: card.alt
        }))
      };

      fd.append("values", JSON.stringify([dataToSend]));

      if (dnaData.id) {
        fd.append("id", dnaData.id);
      }

      // Adicionar arquivos dos cards
      dnaData.cards.forEach((card, index) => {
        if (card.file) {
          fd.append(`cardImage${index}`, card.file);
        }
      });

      const method = dnaData.id ? "PUT" : "POST";

      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao salvar seção DNA");
      }

      const saved = await res.json();

      if (saved?.values?.[0]) {
        // Limpar previews após salvar
        const updatedData = {
          ...saved.values[0],
          id: saved.id,
          cards: saved.values[0].cards.map((card: any, index: number) => ({
            ...card,
            file: null,
            preview: undefined
          }))
        };
        setDnaData(updatedData);
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
      type: 'all',
      title: 'TODOS OS DADOS',
      cardIndex: -1
    });
  };

  const openDeleteCardModal = (index: number) => {
    const card = dnaData.cards[index];
    setDeleteModal({
      isOpen: true,
      type: 'single',
      title: `Card ${card.id}: ${card.alt || "Sem título"}`,
      cardIndex: index
    });
  };

  const confirmDelete = async () => {
    if (deleteModal.type === 'all' && dnaData.id) {
      try {
        const res = await fetch(`${apiBase}/${type}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: dnaData.id })
        });

        if (res.ok) {
          setDnaData(emptyDnaData);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        } else {
          throw new Error('Erro ao deletar');
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Erro ao deletar");
      }
    } else if (deleteModal.type === 'single' && deleteModal.cardIndex >= 0) {
      removeCard(deleteModal.cardIndex);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
    
    setDeleteModal({ 
      isOpen: false, 
      type: 'single', 
      title: '', 
      cardIndex: -1 
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: 'single', 
      title: '', 
      cardIndex: -1 
    });
  };

  const loadDefaultValues = () => {
    if (window.confirm("Isso irá substituir todos os valores atuais pelos padrões. Deseja continuar?")) {
      setDnaData({
        ...defaultValues,
        cards: [] // Cards começam vazios
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const SectionHeader = ({ 
    title, 
    section, 
    icon: Icon 
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
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      ) : (
        <ChevronDown className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      )}
    </button>
  );

  const renderConfiguracoesSection = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200 border-b pb-2">
            Layout
          </h4>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Classes CSS
              </label>
              <Input
                type="text"
                value={dnaData.configuracoes.layout.classes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleNestedChange("configuracoes.layout", "classes", e.target.value)
                }
                placeholder={defaultValues.configuracoes.layout.classes}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Container
              </label>
              <Input
                type="text"
                value={dnaData.configuracoes.layout.container}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleNestedChange("configuracoes.layout", "container", e.target.value)
                }
                placeholder={defaultValues.configuracoes.layout.container}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200 border-b pb-2">
              Animação
            </h4>
            <div className="flex items-center gap-2">
              <Switch
                checked={dnaData.configuracoes.animacao.habilitada}
                onCheckedChange={(checked: boolean) => 
                  handleNestedChange("configuracoes.animacao", "habilitada", checked)
                }
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {dnaData.configuracoes.animacao.habilitada ? "Habilitada" : "Desabilitada"}
              </span>
            </div>
          </div>
          
          {dnaData.configuracoes.animacao.habilitada && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Duração (segundos)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={dnaData.configuracoes.animacao.duracao.toString() || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      handleNestedChange("configuracoes.animacao", "duracao", value);
                    }
                  }}
                  placeholder={defaultValues.configuracoes.animacao.duracao.toString()}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Easing
                </label>
                <Input
                  type="text"
                  value={dnaData.configuracoes.animacao.ease}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleNestedChange("configuracoes.animacao", "ease", e.target.value)
                  }
                  placeholder={defaultValues.configuracoes.animacao.ease}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Scroll Trigger (start)
                </label>
                <Input
                  type="text"
                  value={dnaData.configuracoes.animacao.scrollTrigger.start}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleNestedChange("configuracoes.animacao.scrollTrigger", "start", e.target.value)
                  }
                  placeholder={defaultValues.configuracoes.animacao.scrollTrigger.start}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Scroll Trigger (end)
                </label>
                <Input
                  type="text"
                  value={dnaData.configuracoes.animacao.scrollTrigger.end}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleNestedChange("configuracoes.animacao.scrollTrigger", "end", e.target.value)
                  }
                  placeholder={defaultValues.configuracoes.animacao.scrollTrigger.end}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Toggle Actions
                </label>
                <Input
                  type="text"
                  value={dnaData.configuracoes.animacao.scrollTrigger.toggleActions}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleNestedChange("configuracoes.animacao.scrollTrigger", "toggleActions", e.target.value)
                  }
                  placeholder={defaultValues.configuracoes.animacao.scrollTrigger.toggleActions}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200 border-b pb-2">
              Swiper (Carrossel)
            </h4>
            <div className="flex items-center gap-2">
              <Switch
                checked={dnaData.configuracoes.swiper.autoplay.habilitado}
                onCheckedChange={(checked: boolean) => 
                  handleNestedChange("configuracoes.swiper.autoplay", "habilitado", checked)
                }
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {dnaData.configuracoes.swiper.autoplay.habilitado ? "Autoplay" : "Manual"}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Direção
              </label>
              <select
                value={dnaData.configuracoes.swiper.direcao}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  handleNestedChange("configuracoes.swiper", "direcao", e.target.value)
                }
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                <option value="">Selecione uma direção</option>
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Delay do Autoplay (ms)
              </label>
              <Input
                type="number"
                min="1000"
                step="1000"
                value={dnaData.configuracoes.swiper.autoplay.delay.toString() || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) {
                    handleNestedChange("configuracoes.swiper.autoplay", "delay", value);
                  }
                }}
                placeholder={defaultValues.configuracoes.swiper.autoplay.delay.toString()}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Altura Mobile
              </label>
              <Input
                type="text"
                value={dnaData.configuracoes.swiper.dimensoes.mobile}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleNestedChange("configuracoes.swiper.dimensoes", "mobile", e.target.value)
                }
                placeholder={defaultValues.configuracoes.swiper.dimensoes.mobile}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Altura SM
              </label>
              <Input
                type="text"
                value={dnaData.configuracoes.swiper.dimensoes.sm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleNestedChange("configuracoes.swiper.dimensoes", "sm", e.target.value)
                }
                placeholder={defaultValues.configuracoes.swiper.dimensoes.sm}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Altura MD
              </label>
              <Input
                type="text"
                value={dnaData.configuracoes.swiper.dimensoes.md}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleNestedChange("configuracoes.swiper.dimensoes", "md", e.target.value)
                }
                placeholder={defaultValues.configuracoes.swiper.dimensoes.md}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Altura LG
              </label>
              <Input
                type="text"
                value={dnaData.configuracoes.swiper.dimensoes.lg}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleNestedChange("configuracoes.swiper.dimensoes", "lg", e.target.value)
                }
                placeholder={defaultValues.configuracoes.swiper.dimensoes.lg}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBadgeSection = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
            Badge
          </h4>
          <div className="flex items-center gap-2">
            <Switch
              checked={dnaData.badge.visivel}
              onCheckedChange={(checked: boolean) => handleChange("badge.visivel", checked)}
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {dnaData.badge.visivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Texto
            </label>
            <Input
              type="text"
              value={dnaData.badge.texto}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("badge.texto", e.target.value)}
              placeholder={defaultValues.badge.texto}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Classes CSS
            </label>
            <Input
              type="text"
              value={dnaData.badge.classes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("badge.classes", e.target.value)}
              placeholder={defaultValues.badge.classes}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Cor do Texto (Tailwind)
            </label>
            <Input
              type="text"
              value={dnaData.badge.corTexto}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("badge.corTexto", e.target.value)}
              placeholder={defaultValues.badge.corTexto}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Classes do Texto
            </label>
            <Input
              type="text"
              value={dnaData.badge.classesTexto}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("badge.classesTexto", e.target.value)}
              placeholder={defaultValues.badge.classesTexto}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderTituloSection = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
            Título
          </h4>
          <div className="flex items-center gap-2">
            <Switch
              checked={dnaData.titulo.visivel}
              onCheckedChange={(checked: boolean) => handleChange("titulo.visivel", checked)}
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {dnaData.titulo.visivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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
              value={dnaData.titulo.texto}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("titulo.texto", e.target.value)}
              placeholder={defaultValues.titulo.texto}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Texto em Destaque
            </label>
            <Input
              type="text"
              value={dnaData.titulo.destaque}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("titulo.destaque", e.target.value)}
              placeholder={defaultValues.titulo.destaque}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Classes CSS
            </label>
            <Input
              type="text"
              value={dnaData.titulo.classes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("titulo.classes", e.target.value)}
              placeholder={defaultValues.titulo.classes}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Gradiente (Tailwind)
            </label>
            <Input
              type="text"
              value={dnaData.titulo.gradiente}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("titulo.gradiente", e.target.value)}
              placeholder={defaultValues.titulo.gradiente}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderSubtituloSection = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
            Subtítulo
          </h4>
          <div className="flex items-center gap-2">
            <Switch
              checked={dnaData.subtitulo.visivel}
              onCheckedChange={(checked: boolean) => handleChange("subtitulo.visivel", checked)}
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {dnaData.subtitulo.visivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Texto (HTML permitido)
            </label>
            <TextArea
              value={dnaData.subtitulo.texto}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange("subtitulo.texto", e.target.value)}
              placeholder={defaultValues.subtitulo.texto}
              rows={4}
            />
            <p className="text-xs text-zinc-500 mt-1">
              Use tags HTML como &lt;strong&gt; para destaque
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Classes CSS
            </label>
            <Input
              type="text"
              value={dnaData.subtitulo.classes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("subtitulo.classes", e.target.value)}
              placeholder={defaultValues.subtitulo.classes}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderParagrafoFinalSection = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
            Parágrafo Final
          </h4>
          <div className="flex items-center gap-2">
            <Switch
              checked={dnaData.paragrafoFinal.visivel}
              onCheckedChange={(checked: boolean) => handleChange("paragrafoFinal.visivel", checked)}
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {dnaData.paragrafoFinal.visivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Texto (HTML permitido)
            </label>
            <TextArea
              value={dnaData.paragrafoFinal.texto}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange("paragrafoFinal.texto", e.target.value)}
              placeholder={defaultValues.paragrafoFinal.texto}
              rows={4}
            />
            <p className="text-xs text-zinc-500 mt-1">
              Use tags HTML como &lt;strong&gt; para destaque
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Classes CSS
            </label>
            <Input
              type="text"
              value={dnaData.paragrafoFinal.classes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("paragrafoFinal.classes", e.target.value)}
              placeholder={defaultValues.paragrafoFinal.classes}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderBotaoSection = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
            Botão de Ação
          </h4>
          <div className="flex items-center gap-2">
            <Switch
              checked={dnaData.botao.visivel}
              onCheckedChange={(checked: boolean) => handleChange("botao.visivel", checked)}
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {dnaData.botao.visivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Texto
            </label>
            <Input
              type="text"
              value={dnaData.botao.texto}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("botao.texto", e.target.value)}
              placeholder={defaultValues.botao.texto}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Link
            </label>
            <Input
              type="text"
              value={dnaData.botao.link}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("botao.link", e.target.value)}
              placeholder={defaultValues.botao.link}
            />
          </div>
          
          <div className="md:col-span-2">
            <IconSelector
              value={dnaData.botao.icone}
              onChange={(value) => handleChange("botao.icone", value)}
              label="Ícone do Botão"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Aria Label
            </label>
            <Input
              type="text"
              value={dnaData.botao.ariaLabel}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("botao.ariaLabel", e.target.value)}
              placeholder={defaultValues.botao.ariaLabel}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Classes do Container
            </label>
            <Input
              type="text"
              value={dnaData.botao.classes.container}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleNestedChange("botao.classes", "container", e.target.value)
              }
              placeholder={defaultValues.botao.classes.container}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Classes do Glow
            </label>
            <Input
              type="text"
              value={dnaData.botao.classes.glow}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleNestedChange("botao.classes", "glow", e.target.value)
              }
              placeholder={defaultValues.botao.classes.glow}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Classes do Botão
            </label>
            <Input
              type="text"
              value={dnaData.botao.classes.botao}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleNestedChange("botao.classes", "botao", e.target.value)
              }
              placeholder={defaultValues.botao.classes.botao}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderControlesSection = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200 border-b pb-2">
            Play/Pause
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Ícone Play
              </label>
              <IconSelector
                value={dnaData.controles.playPause.iconePlay}
                onChange={(value) => 
                  handleNestedChange("controles.playPause", "iconePlay", value)
                }
                label=""
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Ícone Pause
              </label>
              <IconSelector
                value={dnaData.controles.playPause.iconePause}
                onChange={(value) => 
                  handleNestedChange("controles.playPause", "iconePause", value)
                }
                label=""
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Classes do Botão
              </label>
              <Input
                type="text"
                value={dnaData.controles.playPause.classesBotao}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleNestedChange("controles.playPause", "classesBotao", e.target.value)
                }
                placeholder={defaultValues.controles.playPause.classesBotao}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Classes do Ícone
              </label>
              <Input
                type="text"
                value={dnaData.controles.playPause.classesIcone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleNestedChange("controles.playPause", "classesIcone", e.target.value)
                }
                placeholder={defaultValues.controles.playPause.classesIcone}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200 border-b pb-2">
            Dots (Indicadores)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Classes do Container
              </label>
              <Input
                type="text"
                value={dnaData.controles.dots.classesContainer}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleNestedChange("controles.dots", "classesContainer", e.target.value)
                }
                placeholder={defaultValues.controles.dots.classesContainer}
              />
            </div>
            
            <div className="md:col-span-2">
              <h5 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                Cores
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Dot Ativo
                  </label>
                  <Input
                    type="text"
                    value={dnaData.controles.dots.cores.ativo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleNestedChange("controles.dots.cores", "ativo", e.target.value)
                    }
                    placeholder={defaultValues.controles.dots.cores.ativo}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Dot Inativo
                  </label>
                  <Input
                    type="text"
                    value={dnaData.controles.dots.cores.inativo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleNestedChange("controles.dots.cores", "inativo", e.target.value)
                    }
                    placeholder={defaultValues.controles.dots.cores.inativo}
                  />
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h5 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                Dimensões Mobile
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Dot Ativo
                  </label>
                  <Input
                    type="text"
                    value={dnaData.controles.dots.dimensoes.mobile.ativo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleNestedChange("controles.dots.dimensoes.mobile", "ativo", e.target.value)
                    }
                    placeholder={defaultValues.controles.dots.dimensoes.mobile.ativo}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Dot Inativo
                  </label>
                  <Input
                    type="text"
                    value={dnaData.controles.dots.dimensoes.mobile.inativo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleNestedChange("controles.dots.dimensoes.mobile", "inativo", e.target.value)
                    }
                    placeholder={defaultValues.controles.dots.dimensoes.mobile.inativo}
                  />
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h5 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                Dimensões Desktop
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Dot Ativo
                  </label>
                  <Input
                    type="text"
                    value={dnaData.controles.dots.dimensoes.desktop.ativo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleNestedChange("controles.dots.dimensoes.desktop", "ativo", e.target.value)
                    }
                    placeholder={defaultValues.controles.dots.dimensoes.desktop.ativo}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Dot Inativo
                  </label>
                  <Input
                    type="text"
                    value={dnaData.controles.dots.dimensoes.desktop.inativo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleNestedChange("controles.dots.dimensoes.desktop", "inativo", e.target.value)
                    }
                    placeholder={defaultValues.controles.dots.dimensoes.desktop.inativo}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCardItem = (card: CardItem, index: number) => {
    const imageUrl = getImageUrl(card);
    
    return (
      <Card key={index} className="mb-4 overflow-hidden border border-zinc-200 dark:border-zinc-700">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveCard(index, 'up')}
                  disabled={index === 0}
                  className="p-1 disabled:opacity-30 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveCard(index, 'down')}
                  disabled={index === dnaData.cards.length - 1}
                  className="p-1 disabled:opacity-30 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
              </div>
              <span className="text-lg font-bold text-zinc-700 dark:text-zinc-300">
                Card {card.id}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  ID
                </label>
                <Input
                  type="number"
                  value={card.id.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleCardChange(index, 'id', parseInt(e.target.value).toString())
                  }
                  disabled
                  className="bg-zinc-100 dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Texto Alternativo (Alt)
                </label>
                <Input
                  type="text"
                  value={card.alt}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleCardChange(index, 'alt', e.target.value)
                  }
                  placeholder="Ex: Equipe Tegbe 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Upload de Imagem
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex-1">
                      <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors">
                        <Upload className="w-5 h-5" />
                        <span className="font-medium">Selecionar Imagem</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(index, e)}
                        className="hidden"
                      />
                    </label>
                    
                    {imageUrl && (
                      <Button
                        type="button"
                        onClick={() => setExpandedImage(imageUrl)}
                        className="flex items-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Visualizar
                      </Button>
                    )}
                    
                    {(card.file || card.image) && (
                      <Button
                        type="button"
                        onClick={() => clearFile(index)}
                        variant="danger"
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Remover
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-xs text-zinc-500">
                    Formatos suportados: JPG, PNG, WEBP, GIF. Tamanho máximo: 5MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Preview da Imagem
                </label>
                
                <div className="border border-zinc-300 dark:border-zinc-600 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-800/50">
                  {imageUrl ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                      <img
                        src={imageUrl}
                        alt={card.alt || "Preview"}
                        className="w-full h-full object-contain"
                        onClick={() => setExpandedImage(imageUrl)}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors cursor-pointer">
                        <span className="opacity-0 hover:opacity-100 text-white bg-black/50 px-3 py-1 rounded text-sm">
                          Clique para expandir
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400">
                      <ImageIcon className="w-12 h-12 mb-2" />
                      <p className="text-sm">Nenhuma imagem selecionada</p>
                      <p className="text-xs mt-1">Faça upload de uma imagem</p>
                    </div>
                  )}
                  
                  {(card.file || card.image) && (
                    <div className="mt-3 text-xs text-zinc-500">
                      {card.file ? (
                        <>
                          <p><strong>Arquivo:</strong> {card.file.name}</p>
                          <p><strong>Tamanho:</strong> {(card.file.size / 1024 / 1024).toFixed(2)} MB</p>
                          <p><strong>Tipo:</strong> {card.file.type}</p>
                        </>
                      ) : (
                        <p><strong>Imagem atual:</strong> {card.image}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
          <div>
            <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
              Cards ({dnaData.cards.length})
            </h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Imagens que serão exibidas no carrossel da seção DNA
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {isLimitReached && (
              <span className="text-sm text-red-600 dark:text-red-400">
                Limite máximo atingido (10 cards)
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

        {dnaData.cards.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
            <Grid3x3 className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Nenhum card cadastrado. Adicione cards com imagens para o carrossel.
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
            {dnaData.cards.map((card, index) => 
              renderCardItem(card, index)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderEfeitosSection = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
              Efeito Glow
            </h4>
            <div className="flex items-center gap-2">
              <Switch
                checked={dnaData.efeitos.glow.visivel}
                onCheckedChange={(checked: boolean) => 
                  handleNestedChange("efeitos.glow", "visivel", checked)
                }
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {dnaData.efeitos.glow.visivel ? "Visível" : "Oculto"}
              </span>
            </div>
          </div>
          
          {dnaData.efeitos.glow.visivel && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Classes CSS
              </label>
              <Input
                type="text"
                value={dnaData.efeitos.glow.classes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleNestedChange("efeitos.glow", "classes", e.target.value)
                }
                placeholder={defaultValues.efeitos.glow.classes}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200">
            Gradiente da Imagem
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Classes CSS
            </label>
            <Input
              type="text"
              value={dnaData.efeitos.gradienteImagem.classes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                handleNestedChange("efeitos.gradienteImagem", "classes", e.target.value)
              }
              placeholder={defaultValues.efeitos.gradienteImagem.classes}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={Dna}
      title="Seção DNA"
      description="Configure a seção DNA com carrossel de imagens e conteúdo de alta performance"
      exists={exists}
      itemName="DNA"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Configure a seção DNA com carrossel vertical de imagens
            </p>
          </div>
          <Button
            type="button"
            onClick={loadDefaultValues}
            className="flex items-center gap-2"
          >
            Carregar Valores Padrão
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Configurações Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações Gerais"
            section="configuracoes"
            icon={Settings}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.configuracoes ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderConfiguracoesSection()}
            </Card>
          </motion.div>
        </div>

        {/* Badge Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Badge"
            section="badge"
            icon={Type}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.badge ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderBadgeSection()}
            </Card>
          </motion.div>
        </div>

        {/* Título Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Título"
            section="titulo"
            icon={Type}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.titulo ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderTituloSection()}
            </Card>
          </motion.div>
        </div>

        {/* Subtítulo Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Subtítulo"
            section="subtitulo"
            icon={Type}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.subtitulo ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderSubtituloSection()}
            </Card>
          </motion.div>
        </div>

        {/* Parágrafo Final Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Parágrafo Final"
            section="paragrafoFinal"
            icon={Type}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.paragrafoFinal ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderParagrafoFinalSection()}
            </Card>
          </motion.div>
        </div>

        {/* Botão Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Botão de Ação"
            section="botao"
            icon={Sliders}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.botao ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderBotaoSection()}
            </Card>
          </motion.div>
        </div>

        {/* Controles Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Controles do Carrossel"
            section="controles"
            icon={PlayCircle}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.controles ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderControlesSection()}
            </Card>
          </motion.div>
        </div>

        {/* Cards Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Cards do Carrossel"
            section="cards"
            icon={Grid3x3}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.cards ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderCardsSection()}
            </Card>
          </motion.div>
        </div>

        {/* Efeitos Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Efeitos Visuais"
            section="efeitos"
            icon={Settings}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.efeitos ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderEfeitosSection()}
            </Card>
          </motion.div>
        </div>

        {/* Fixed Action Bar */}
        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmitWrapper}
          isAddDisabled={!canAddNewItem || isLimitReached}
          isSaving={loading}
          exists={exists}
          completeCount={completeCount}
          totalCount={stepList.length}
          itemName="Seção DNA"
          icon={Dna}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={deleteModal.type === 'single' ? 1 : dnaData.cards.length}
        itemName={deleteModal.type === 'single' ? 'Card' : 'DNA'}
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />

      {/* Modal para visualização expandida da imagem */}
      {expandedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-12 right-0 !p-3 !rounded-full bg-red-500 hover:bg-red-600 z-10"
            >
              <X className="w-5 h-5" />
            </Button>
            <img
              src={expandedImage}
              alt="Preview expandido"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onError={(e) => {
                console.error('Erro ao carregar imagem expandida:', expandedImage);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </ManageLayout>
  );
}