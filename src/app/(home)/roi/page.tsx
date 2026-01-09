/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { 
  ShoppingBag,
  Plus,
  Settings,
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { SectionHeader } from "@/components/SectionHeader";
import { GeralSection } from "@/components/GeralSection";
import { CardsSection } from "@/components/CardsSection";

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

  const [processedData, setProcessedData] = useState<RoiData>(defaultRoiData);

  useEffect(() => {
    if (roiData) {
      const dataCopy = { ...roiData };
      
      const cardRegex = /cards\[(\d+)\]/;
      
      Object.keys(dataCopy).forEach(key => {
        const match = key.match(cardRegex);
        if (match && Array.isArray(dataCopy.cards)) {
          const index = parseInt(match[1]);
          
          if (dataCopy.cards[index]) {
            dataCopy.cards[index] = {
              ...dataCopy.cards[index],
              ...dataCopy[key]
            };
          }
          
          delete dataCopy[key];
        }
      });
      
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

  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    if (!processedData) return 0;
    
    if (
      processedData.id.trim() !== "" &&
      processedData.title.trim() !== "" &&
      processedData.subtitle.trim() !== "" &&
      processedData.backgroundColor.trim() !== ""
    ) {
      count++;
    }
    
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
  const totalCount = 2;

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
    
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[cardId];
      return newFiles;
    });
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    
    fd.append("values", JSON.stringify(processedData));

    Object.entries(files).forEach(([cardId, cardFiles]) => {
      if (cardFiles.backgroundImage) {
        fd.append(`file:cards[${parseInt(cardId)-1}].backgroundImage`, cardFiles.backgroundImage, cardFiles.backgroundImage.name);
      }
      if (cardFiles.phoneImage) {
        fd.append(`file:cards[${parseInt(cardId)-1}].phoneImage`, cardFiles.phoneImage, cardFiles.phoneImage.name);
      }
    });

    try {
      await save();
      await reload();
      
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
                  <GeralSection
                    data={{
                      id: processedData.id,
                      title: processedData.title,
                      subtitle: processedData.subtitle,
                      backgroundColor: processedData.backgroundColor,
                    }}
                    onChange={(field: string, value: any) => handleChange(field, value)}
                  />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
                  <CardsSection
                    cards={processedData.cards}
                    expandedCards={expandedCards}
                    onToggleCard={toggleCard}
                    onAddCard={addCard}
                    onCardChange={handleCardChange}
                    onRemoveCard={removeCard}
                    files={files}
                    onFileChange={handleCardFileChange}
                  />
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