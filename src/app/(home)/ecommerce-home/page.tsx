/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import { 
  Palette,
  Tag,
  Settings,
  Star,
  Image as ImageIcon,
  Layout,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Grid3X3,
  ShoppingCart,
  Rocket,
  Package,
  Zap,
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { hexToTailwindBgClass } from "@/lib/colors";
import { ImageUpload } from "@/components/ImageUpload";
import IconSelector from "@/components/IconSelector";
import { useSite } from "@/context/site-context";

interface ThemeData {
  bg_section: string;
  bg_card: string;
  text_primary: string;
  text_secondary: string;
  accent: string;
}

interface HeaderData {
  tag: string;
  title: string;
  subtitle: string;
}

interface BentoCard {
  id: string;
  colSpan: string;
  type: "hero" | "stat" | "action";
  title: string;
  description: string;
  image?: string;
  badge?: string;
  icon?: string;
  stat?: string;
  ctaText?: string;
  href?: string;
}

interface EcommerceSectionData {
  theme: ThemeData;
  header: HeaderData;
  bento_cards: BentoCard[];
}

const defaultEcommerceSectionData: EcommerceSectionData = {
  theme: {
    bg_section: "#F5F5F7",
    bg_card: "#FFFFFF",
    text_primary: "#1D1D1F",
    text_secondary: "#86868B",
    accent: "#0071E3",
  },
  header: {
    tag: "Marketplace Solutions",
    title: "Sua loja. Em todo lugar.",
    subtitle: "A integração nativa com os maiores canais de venda do país. Transformamos sua operação em uma potência onipresente no Mercado Livre e Shopee."
  },
  bento_cards: [
    {
      id: "card_main",
      colSpan: "md:col-span-2",
      type: "hero",
      title: "Reputação Blindada.",
      description: "Não buscamos apenas vendas. Buscamos a medalha Platinum. Gestão estratégica para conquistar e manter o BuyBox.",
      image: "",
      badge: "Conta Platinum"
    },
    {
      id: "card_ads",
      colSpan: "md:col-span-1",
      type: "stat",
      title: "Ads Nativo.",
      description: "Algoritmos proprietários para dominar a primeira página.",
      icon: "solar:rocket-bold-duotone",
      stat: "+35% ROAS"
    },
    {
      id: "card_logistics",
      colSpan: "md:col-span-1",
      type: "stat",
      title: "Logística Full.",
      description: "Integração completa com centros de distribuição.",
      icon: "solar:box-minimalistic-bold-duotone",
      stat: "24h Entrega"
    },
    {
      id: "card_cta",
      colSpan: "md:col-span-2",
      type: "action",
      title: "4 Planos de Aceleração.",
      description: "Do setup inicial à escala agressiva. Escolha a velocidade do seu crescimento.",
      ctaText: "Ver Comparativo de Planos",
      href: "/ecommerce"
    }
  ]
};

const mergeWithDefaults = (apiData: any, defaultData: EcommerceSectionData): EcommerceSectionData => {
  if (!apiData) return defaultData;
  
  return {
    theme: apiData.theme || defaultData.theme,
    header: apiData.header || defaultData.header,
    bento_cards: apiData.bento_cards || defaultData.bento_cards,
  };
};

// Hook personalizado para gerenciar bento cards
function useBentoCardsList(initialCards: BentoCard[], planType: 'basic' | 'pro') {
  const [cards, setCards] = useState<BentoCard[]>(initialCards);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const newItemRef = useRef<HTMLDivElement>(null);

  const currentPlanLimit = planType === 'pro' ? 10 : 6;
  const isLimitReached = cards.length >= currentPlanLimit;

  const completeCount = useMemo(() => {
    return cards.filter(card => {
      const baseComplete = card.title.trim() && card.description.trim();
      
      switch(card.type) {
        case 'hero':
          return baseComplete && card.image?.trim() && card.badge?.trim();
        case 'stat':
          return baseComplete && card.icon?.trim() && card.stat?.trim();
        case 'action':
          return baseComplete && card.ctaText?.trim() && card.href?.trim();
        default:
          return baseComplete;
      }
    }).length;
  }, [cards]);

  const canAddNewItem = !isLimitReached;

  const addCard = useCallback((type: BentoCard['type'] = 'stat') => {
    if (!canAddNewItem) {
      setValidationError("Limite do plano atingido");
      return false;
    }

    const getDefaultCard = (type: BentoCard['type']): BentoCard => {
      const baseCard = {
        id: `card_${Date.now()}`,
        colSpan: "md:col-span-1",
        type,
        title: "",
        description: "",
      };

      switch(type) {
        case 'hero':
          return {
            ...baseCard,
            colSpan: "md:col-span-2",
            image: "",
            badge: "",
          };
        case 'stat':
          return {
            ...baseCard,
            icon: "solar:rocket-bold-duotone",
            stat: "",
          };
        case 'action':
          return {
            ...baseCard,
            colSpan: "md:col-span-2",
            ctaText: "",
            href: "#",
          };
        default:
          return baseCard;
      }
    };

    setCards(prev => [...prev, getDefaultCard(type)]);
    setValidationError(null);

    setTimeout(() => {
      newItemRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    return true;
  }, [canAddNewItem]);

  const updateCard = useCallback((index: number, updates: Partial<BentoCard>) => {
    setCards(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  }, []);

  const removeCard = useCallback((index: number) => {
    setCards(prev => {
      if (prev.length === 1) {
        return [{
          id: `card_${Date.now()}`,
          colSpan: "md:col-span-1",
          type: "stat",
          title: "",
          description: "",
          icon: "solar:rocket-bold-duotone",
          stat: "",
        }];
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Drag & drop
  const startDrag = useCallback((index: number) => {
    setDraggingIndex(index);
  }, []);

  const handleDragOver = useCallback((index: number) => {
    if (draggingIndex === null || draggingIndex === index) return;

    setCards(prev => {
      const newCards = [...prev];
      const draggedCard = newCards[draggingIndex];
      newCards.splice(draggingIndex, 1);
      newCards.splice(index, 0, draggedCard);
      setDraggingIndex(index);
      return newCards;
    });
  }, [draggingIndex]);

  const endDrag = useCallback(() => {
    setDraggingIndex(null);
  }, []);

  // Atualizar cards quando initialCards mudar
  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  return {
    cards,
    filteredItems: cards,
    draggingItem: draggingIndex,
    validationError,
    newItemRef,
    completeCount,
    totalCount: cards.length,
    currentPlanLimit,
    isLimitReached,
    canAddNewItem,
    currentPlanType: planType,
    addCard,
    updateCard,
    removeCard,
    startDrag,
    handleDragOver,
    endDrag,
  };
}

export default function EcommerceSectionPage() {
  const { currentSite } = useSite();
  const currentPlanType = currentSite.planType;

  const {
    data: ecommerceData,
    exists,
    loading,
    success,
    errorMsg,
    deleteModal,
    updateNested,
    setFileState,
    save,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
  } = useJsonManagement<EcommerceSectionData>({
    apiPath: "/api/tegbe-institucional/json/ecommerce-home",
    defaultData: defaultEcommerceSectionData,
    mergeFunction: mergeWithDefaults,
  });

  // Estado local para URLs temporárias de preview
  const [tempImageUrls, setTempImageUrls] = useState<Record<string, string>>({});

  // Hook personalizado para gerenciar bento cards
  const cardsList = useBentoCardsList(ecommerceData.bento_cards, currentPlanType);

  const [expandedSections, setExpandedSections] = useState({
    header: true,
    bento_cards: false,
    theme: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Função para lidar com upload de imagem de cards
  const handleCardImageChange = (cardIndex: number, file: File | null) => {
    const card = cardsList.cards[cardIndex];
    const path = `bento_cards.${cardIndex}.image`;
    
    setFileState(path, file);
    
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setTempImageUrls(prev => ({
        ...prev,
        [`card_${cardIndex}`]: objectUrl
      }));
      
      cardsList.updateCard(cardIndex, { image: objectUrl });
    } else {
      cardsList.updateCard(cardIndex, { image: "" });
    }
  };

  // Funções para adicionar cards
  const handleAddCard = (type: BentoCard['type']) => {
    const success = cardsList.addCard(type);
    if (!success) {
      console.warn(cardsList.validationError);
    }
  };

  // Limpar URLs temporárias ao desmontar
  useEffect(() => {
    return () => {
      Object.values(tempImageUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [tempImageUrls]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      // Atualizar os bento_cards no ecommerceData
      updateNested('bento_cards', cardsList.cards);
      
      // Salvar no banco de dados
      await save();
      
      // Após salvar, limpar as URLs temporárias
      Object.values(tempImageUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
      setTempImageUrls({});
      
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Funções de drag & drop para cards
  const handleCardDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    cardsList.startDrag(index);
  };

  const handleCardDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    cardsList.handleDragOver(index);
  };

  const handleCardDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    cardsList.endDrag();
  };

  // Funções para atualizar cores
  const handleColorChange = (colorKey: keyof ThemeData, hexColor: string) => {
    updateNested(`theme.${colorKey}`, hexColor);
  };

  // Opções para colSpan
  const colSpanOptions = [
    { value: "md:col-span-1", label: "1 coluna" },
    { value: "md:col-span-2", label: "2 colunas" },
    { value: "md:col-span-3", label: "3 colunas" },
  ];

  // Opções para tipo de card
  const cardTypeOptions = [
    { value: "hero", label: "Card Hero (com imagem)" },
    { value: "stat", label: "Card Estatística (com ícone)" },
    { value: "action", label: "Card de Ação (com CTA)" },
  ];

  // Renderizar campos específicos baseados no tipo do card
  const renderCardFields = (card: BentoCard, index: number) => {
    switch(card.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                Imagem do Card
              </label>
              <ImageUpload
                label=""
                currentImage={card.image || ""}
                selectedFile={null}
                onFileChange={(file) => handleCardImageChange(index, file)}
                aspectRatio="aspect-video"
                previewWidth={300}
                previewHeight={200}
                description="Imagem para o card hero (recomendado: 800x600px)"
              />
            </div>
            <Input
              label="Badge"
              value={card.badge || ""}
              onChange={(e) => cardsList.updateCard(index, { badge: e.target.value })}
              placeholder="Ex: Conta Platinum"
              className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
            />
          </div>
        );
      
      case 'stat':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                Ícone
              </label>
              <IconSelector
                value={card.icon || "solar:rocket-bold-duotone"}
                onChange={(value) => cardsList.updateCard(index, { icon: value })}
                placeholder="solar:rocket-bold-duotone"
              />
            </div>
            <Input
              label="Estatística"
              value={card.stat || ""}
              onChange={(e) => cardsList.updateCard(index, { stat: e.target.value })}
              placeholder="Ex: +35% ROAS"
              className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
            />
          </div>
        );
      
      case 'action':
        return (
          <div className="space-y-4">
            <Input
              label="Texto do CTA"
              value={card.ctaText || ""}
              onChange={(e) => cardsList.updateCard(index, { ctaText: e.target.value })}
              placeholder="Ex: Ver Comparativo de Planos"
              className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
            />
            <Input
              label="Link do CTA"
              value={card.href || ""}
              onChange={(e) => cardsList.updateCard(index, { href: e.target.value })}
              placeholder="/ecommerce"
              className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  // Cálculo de preenchimento
  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Header
    total += 3;
    if (ecommerceData.header.tag.trim()) completed++;
    if (ecommerceData.header.title.trim()) completed++;
    if (ecommerceData.header.subtitle.trim()) completed++;

    // Bento Cards
    total += cardsList.cards.length * 5; // Base: id, colSpan, type, title, description
    cardsList.cards.forEach(card => {
      if (card.id.trim()) completed++;
      if (card.colSpan.trim()) completed++;
      if (card.type.trim()) completed++;
      if (card.title.trim()) completed++;
      if (card.description.trim()) completed++;
      
      // Campos específicos por tipo
      switch(card.type) {
        case 'hero':
          total += 2;
          if (card.image?.trim()) completed++;
          if (card.badge?.trim()) completed++;
          break;
        case 'stat':
          total += 2;
          if (card.icon?.trim()) completed++;
          if (card.stat?.trim()) completed++;
          break;
        case 'action':
          total += 2;
          if (card.ctaText?.trim()) completed++;
          if (card.href?.trim()) completed++;
          break;
      }
    });

    // Tema
    total += 5;
    if (ecommerceData.theme.bg_section) completed++;
    if (ecommerceData.theme.bg_card) completed++;
    if (ecommerceData.theme.text_primary) completed++;
    if (ecommerceData.theme.text_secondary) completed++;
    if (ecommerceData.theme.accent) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={ShoppingCart}
      title="Seção E-commerce"
      description="Gerencie a seção de e-commerce com Bento Cards"
      exists={!!exists}
      itemName="Seção E-commerce"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção de Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho"
            section="header"
            icon={Settings}
            isExpanded={expandedSections.header}
            onToggle={() => toggleSection("header")}
          />
          <motion.div
            initial={false}
            animate={{ height: expandedSections.header ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <Input
                  label="Tag"
                  value={ecommerceData.header.tag}
                  onChange={(e) => updateNested('header.tag', e.target.value)}
                  placeholder="Ex: Marketplace Solutions"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <Input
                  label="Título"
                  value={ecommerceData.header.title}
                  onChange={(e) => updateNested('header.title', e.target.value)}
                  placeholder="Ex: Sua loja. Em todo lugar."
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <TextArea
                  label="Subtítulo"
                  value={ecommerceData.header.subtitle}
                  onChange={(e) => updateNested('header.subtitle', e.target.value)}
                  placeholder="Descrição da seção"
                  rows={3}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção de Bento Cards */}
        <div className="space-y-4">
          <SectionHeader
            title="Bento Cards"
            section="bento_cards"
            icon={Grid3X3}
            isExpanded={expandedSections.bento_cards}
            onToggle={() => toggleSection("bento_cards")}
          />
          <motion.div
            initial={false}
            animate={{ height: expandedSections.bento_cards ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Grid3X3 className="w-5 h-5" />
                      Cards do Layout Bento
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {cardsList.completeCount} de {cardsList.totalCount} completos
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        Limite: {cardsList.currentPlanLimit} cards
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="button"
                        onClick={() => handleAddCard('hero')}
                        variant="primary"
                        className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                        disabled={!cardsList.canAddNewItem}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Card Hero
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleAddCard('stat')}
                        variant="primary"
                        className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                        disabled={!cardsList.canAddNewItem}
                      >
                        <Rocket className="w-4 h-4 mr-1" />
                        Card Estatística
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleAddCard('action')}
                        variant="primary"
                        className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                        disabled={!cardsList.canAddNewItem}
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Card de Ação
                      </Button>
                    </div>
                    {cardsList.isLimitReached && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Limite do plano atingido
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mensagem de erro */}
              {cardsList.validationError && (
                <div className={`p-3 rounded-lg ${cardsList.isLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'}`}>
                  <div className="flex items-start gap-2">
                    {cardsList.isLimitReached ? (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${cardsList.isLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                      {cardsList.validationError}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {cardsList.cards.map((card, index) => (
                  <div 
                    key={card.id}
                    ref={index === cardsList.cards.length - 1 ? cardsList.newItemRef : undefined}
                    draggable
                    onDragStart={(e) => handleCardDragStart(e, index)}
                    onDragOver={(e) => handleCardDragOver(e, index)}
                    onDragEnd={handleCardDragEnd}
                    className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                      cardsList.draggingItem === index 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                        : 'hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Handle para drag & drop */}
                        <div 
                          className="cursor-grab active:cursor-grabbing p-2 hover:bg-[var(--color-background)]/50 rounded transition-colors"
                          draggable
                          onDragStart={(e) => handleCardDragStart(e, index)}
                        >
                          <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                        </div>
                        
                        {/* Indicador de posição */}
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-medium text-[var(--color-secondary)]/70">
                            {index + 1}
                          </span>
                          <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-2">
                              {card.type === 'hero' && <ImageIcon className="w-4 h-4 text-blue-500" />}
                              {card.type === 'stat' && <Rocket className="w-4 h-4 text-green-500" />}
                              {card.type === 'action' && <Zap className="w-4 h-4 text-yellow-500" />}
                              <h4 className="font-medium text-[var(--color-secondary)]">
                                {card.title || `Card ${index + 1} (${card.type})`}
                              </h4>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              card.type === 'hero' ? 'bg-blue-900/30 text-blue-300' :
                              card.type === 'stat' ? 'bg-green-900/30 text-green-300' :
                              'bg-yellow-900/30 text-yellow-300'
                            }`}>
                              {card.type}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                                    Tipo do Card
                                  </label>
                                  <select
                                    value={card.type}
                                    onChange={(e) => cardsList.updateCard(index, { type: e.target.value as BentoCard['type'] })}
                                    className="w-full bg-[var(--color-background-body)] border border-[var(--color-border)] text-[var(--color-secondary)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                  >
                                    {cardTypeOptions.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                                    Largura
                                  </label>
                                  <select
                                    value={card.colSpan}
                                    onChange={(e) => cardsList.updateCard(index, { colSpan: e.target.value })}
                                    className="w-full bg-[var(--color-background-body)] border border-[var(--color-border)] text-[var(--color-secondary)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                  >
                                    {colSpanOptions.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              
                              <Input
                                label="Título"
                                value={card.title}
                                onChange={(e) => cardsList.updateCard(index, { title: e.target.value })}
                                placeholder="Título do card"
                                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                              />
                              
                              <TextArea
                                label="Descrição"
                                value={card.description}
                                onChange={(e) => cardsList.updateCard(index, { description: e.target.value })}
                                placeholder="Descrição do card"
                                rows={3}
                                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                              />
                            </div>
                            
                            <div className="space-y-4">
                              <div className="p-4 bg-[var(--color-background-body)] border border-[var(--color-border)] rounded-lg">
                                <h5 className="font-medium text-[var(--color-secondary)] mb-3">
                                  Configurações Específicas
                                </h5>
                                {renderCardFields(card, index)}
                              </div>
                              
                              <div className="text-sm text-[var(--color-secondary)]/70 space-y-1">
                                <p><strong>ID:</strong> {card.id}</p>
                                <p><strong>Classes:</strong> {card.colSpan}</p>
                                <p><strong>Tipo:</strong> {card.type}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          onClick={() => cardsList.removeCard(index)}
                          variant="danger"
                          className="whitespace-nowrap bg-red-600 hover:bg-red-700 border-none"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção de Tema */}
        <div className="space-y-4">
          <SectionHeader
            title="Tema"
            section="theme"
            icon={Palette}
            isExpanded={expandedSections.theme}
            onToggle={() => toggleSection("theme")}
          />
          <motion.div
            initial={false}
            animate={{ height: expandedSections.theme ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ThemePropertyInput
                  property="bg"
                  label="Fundo da Seção"
                  currentHex={ecommerceData.theme.bg_section}
                  tailwindClass={hexToTailwindBgClass(ecommerceData.theme.bg_section)}
                  onThemeChange={(_, hex) => handleColorChange('bg_section', hex)}
                />
                <ThemePropertyInput
                  property="bg"
                  label="Fundo dos Cards"
                  currentHex={ecommerceData.theme.bg_card}
                  tailwindClass={hexToTailwindBgClass(ecommerceData.theme.bg_card)}
                  onThemeChange={(_, hex) => handleColorChange('bg_card', hex)}
                />
                <ThemePropertyInput
                  property="text"
                  label="Texto Primário"
                  currentHex={ecommerceData.theme.text_primary}
                  tailwindClass={hexToTailwindBgClass(ecommerceData.theme.text_primary)}
                  onThemeChange={(_, hex) => handleColorChange('text_primary', hex)}
                />
                <ThemePropertyInput
                  property="text"
                  label="Texto Secundário"
                  currentHex={ecommerceData.theme.text_secondary}
                  tailwindClass={hexToTailwindBgClass(ecommerceData.theme.text_secondary)}
                  onThemeChange={(_, hex) => handleColorChange('text_secondary', hex)}
                />
                <ThemePropertyInput
                  property="bg"
                  label="Cor de Destaque"
                  currentHex={ecommerceData.theme.accent}
                  tailwindClass={hexToTailwindBgClass(ecommerceData.theme.accent)}
                  onThemeChange={(_, hex) => handleColorChange('accent', hex)}
                />
              </div>
            </Card>
          </motion.div>
        </div>

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          isAddDisabled={false}
          isSaving={loading}
          exists={!!exists}
          completeCount={completion.completed}
          totalCount={completion.total}
          itemName="Seção E-commerce"
          icon={ShoppingCart}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Seção E-commerce"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}