/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback, useId, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import IconSelector from "@/components/IconSelector";
import { 
  ImageIcon, 
  GripVertical, 
  ArrowUpDown, 
  AlertCircle, 
  CheckCircle2, 
  Trash2,
  XCircle,
  Search,
  X,
  Users,
  Type,
  MessageSquare,
  Instagram,
  ChevronDown,
  ChevronUp,
  Zap,
  Palette,
  Layers,
  Grid3x3,
  Crown,
  Image as ImageLucide,
  Text,
  Badge,
  Hash,
  Tag
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import { ImageUpload } from "@/components/ImageUpload";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";

interface GalleryImage {
  id: string;
  alt: string;
  image: string;
  span: string;
  file?: File | null;
}

interface BadgeContent {
  text: string;
  icon: string;
}

interface TitleContent {
  line1: string;
  line2: string;
  highlightWords: string;
}

interface GalleryData {
  data: GalleryImage[];
  textContent: {
    badge: BadgeContent;
    title: TitleContent;
    description?: string;
    cta?: {
      button: string;
      cardTitle?: string;
      cardDescription?: string;
    };
    // Adicione outros campos conforme necessário
  };
}

const defaultData: GalleryData = {
  data: [
    {
      id: "1",
      alt: "",
      image: "",
      span: "row-span-2"
    }
  ],
  textContent: {
    badge: {
      text: "Comunidade VIP",
      icon: "ph:crown"
    },
    title: {
      line1: "Faça parte da",
      line2: "elite do mercado",
      highlightWords: "elite do mercado"
    },
    description: "",
    cta: {
      button: "",
      cardTitle: "",
      cardDescription: ""
    }
  }
};

// Função para mesclar com dados padrão
const mergeWithDefaults = (apiData: any, defaultData: GalleryData): GalleryData => {
  if (!apiData) return defaultData;
  
  return {
    data: apiData.data?.map((item: any, index: number) => ({
      id: item.id || `image-${Date.now()}-${index}`,
      alt: item.alt || "",
      image: item.image || "",
      span: item.span || "row-span-1",
      file: null
    })) || defaultData.data,
    textContent: {
      badge: {
        text: apiData.textContent?.badge?.text || defaultData.textContent.badge.text,
        icon: apiData.textContent?.badge?.icon || defaultData.textContent.badge.icon
      },
      title: {
        line1: apiData.textContent?.title?.line1 || defaultData.textContent.title.line1,
        line2: apiData.textContent?.title?.line2 || defaultData.textContent.title.line2,
        highlightWords: apiData.textContent?.title?.highlightWords || defaultData.textContent.title.highlightWords
      },
      description: apiData.textContent?.description || defaultData.textContent.description,
      cta: {
        button: apiData.textContent?.cta?.button || defaultData?.textContent?.cta?.button,
        cardTitle: apiData.textContent?.cta?.cardTitle || defaultData?.textContent?.cta?.cardTitle,
        cardDescription: apiData.textContent?.cta?.cardDescription || defaultData?.textContent?.cta?.cardDescription
      }
    }
  };
};

// Componente Sortable para imagens
function SortableGalleryItem({
  item,
  index,
  showValidation,
  itemList,
  handleChange,
  handleFileChange,
  openDeleteSingleModal,
  getImageUrl,
}: {
  item: GalleryImage;
  index: number;
  showValidation: boolean;
  itemList: GalleryImage[];
  handleChange: (index: number, field: keyof GalleryImage, value: any) => void;
  handleFileChange: (index: number, file: File | null) => void;
  openDeleteSingleModal: (index: number, title: string) => void;
  getImageUrl: (item: GalleryImage) => string;
}) {
  const stableId = useId();
  const sortableId = item.id || `gallery-${index}-${stableId}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasAlt = item.alt.trim() !== "";
  const hasImage = Boolean(item.image?.trim() !== "" || item.file);
  const hasSpan = Boolean(item.span.trim() !== "");

  const imageUrl = getImageUrl(item);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
        showValidation && (!hasAlt || !hasImage) 
          ? 'ring-2 ring-[var(--color-danger)]' 
          : ''
      } ${isDragging ? 'shadow-lg scale-105' : ''} bg-[var(--color-background)] border-l-4 border-[var(--color-primary)]`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="cursor-grab active:cursor-grabbing text-[var(--color-secondary)]/70 hover:text-[var(--color-primary)] transition-colors p-2 rounded-lg hover:bg-[var(--color-background)]/50"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-sm text-[var(--color-secondary)]/70">
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Posição: {index + 1}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {hasAlt ? (
                    <h4 className="font-medium text-[var(--color-secondary)]">
                      {item.alt}
                    </h4>
                  ) : (
                    <h4 className="font-medium text-[var(--color-secondary)]/50">
                      Imagem sem descrição
                    </h4>
                  )}
                  {hasAlt && hasImage && hasSpan ? (
                    <span className="px-2 py-1 text-xs bg-[var(--color-success)]/20 text-green-300 rounded-full border border-[var(--color-success)]/30">
                      Completo
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                      Incompleto
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              type="button"
              onClick={() => openDeleteSingleModal(index, item.alt || "Imagem sem descrição")}
              variant="danger"
              className="whitespace-nowrap bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 border-none flex items-center gap-2"
              disabled={itemList.length <= 1}
            >
              <Trash2 className="w-4 h-4" />
              Remover
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Imagem da Galeria
                </label>
                <ImageUpload
                  label=""
                  description="Formatos suportados: JPG, PNG, WEBP. Tamanho recomendado: 1000x500px."
                  currentImage={item.image || ""}
                  selectedFile={item.file || null}
                  onFileChange={(file) => handleFileChange(index, file)}
                  aspectRatio="aspect-video"
                  previewWidth={300}
                  previewHeight={150}
                />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    URL da Imagem <span className="text-xs text-[var(--color-secondary)]/50">- Opcional se fizer upload</span>
                  </label>
                  <Input
                    type="text"
                    value={item.image}
                    onChange={(e: any) => handleChange(index, "image", e.target.value)}
                    placeholder="Ex: https://images.unsplash.com/photo-..."
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Texto Alternativo (alt) <span className="text-xs text-[var(--color-danger)]">*</span>
                  </label>
                  <Input
                    type="text"
                    value={item.alt}
                    onChange={(e: any) => handleChange(index, "alt", e.target.value)}
                    placeholder="Ex: Evento Presencial Tegbe"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Tamanho no Grid (span)
                  </label>
                  <select
                    value={item.span}
                    onChange={(e: any) => handleChange(index, "span", e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-background-body)] text-[var(--color-secondary)]"
                  >
                    <option value="row-span-1">Pequena (1 linha)</option>
                    <option value="row-span-2">Média (2 linhas)</option>
                    <option value="row-span-3">Grande (3 linhas)</option>
                  </select>
                  <p className="mt-1 text-xs text-[var(--color-secondary)]/50">
                    Define a altura da imagem no grid da galeria.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function GalleryPage() {
  const [expandedSections, setExpandedSections] = useState({
    textContent: true,
    images: true
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [deleteImageIndex, setDeleteImageIndex] = useState<number | null>(null);
  const [deleteImageTitle, setDeleteImageTitle] = useState<string>("");

  const {
    data: componentData,
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
    fileStates,
    setFileState,
  } = useJsonManagement<GalleryData>({
    apiPath: "/api/tegbe-institucional/json/gallery",
    defaultData: defaultData,
    mergeFunction: mergeWithDefaults,
  });

  const currentData = componentData || defaultData;
  const images = currentData.data;
  const textContent = currentData.textContent;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleTextContentChange = (path: string, value: any) => {
    updateNested(`textContent.${path}`, value);
  };

  const handleImageChange = (index: number, field: keyof GalleryImage, value: any) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    updateNested(`data`, newImages);
  };

  const handleImageFileChange = (index: number, file: File | null) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], file };
    updateNested(`data`, newImages);
  };

  const getFileFromState = (key: string): File | null => {
    const value = fileStates[key];
    return value instanceof File ? value : null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowValidation(true);
    await save();
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((item) => item.id === active.id);
    const newIndex = images.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newImages = arrayMove(images, oldIndex, newIndex);
      updateNested(`data`, newImages);
    }
  };

  const getImageUrl = (item: GalleryImage): string => {
    if (item.file) return URL.createObjectURL(item.file);
    if (item.image) {
      return item.image.startsWith('http') ? item.image : `https://mavellium.com.br${item.image.startsWith('/') ? '' : '/'}${item.image}`;
    }
    return "";
  };

  const handleAddImage = () => {
    const newImage: GalleryImage = {
      id: `image-${Date.now()}-${images.length}`,
      alt: '',
      image: '',
      span: 'row-span-1',
      file: null
    };
    updateNested(`data`, [...images, newImage]);
  };

  const openDeleteSingleModal = (index: number, title: string) => {
    setDeleteImageIndex(index);
    setDeleteImageTitle(title);
  };

  const handleDeleteImage = () => {
    if (deleteImageIndex !== null) {
      const newImages = images.filter((_, i) => i !== deleteImageIndex);
      updateNested(`data`, newImages);
      setDeleteImageIndex(null);
      setDeleteImageTitle("");
    }
  };

  const filteredImages = useMemo(() => {
    if (!searchTerm) return images;
    const term = searchTerm.toLowerCase();
    return images.filter(item => 
      item.alt.toLowerCase().includes(term) ||
      item.image.toLowerCase().includes(term) ||
      item.span.toLowerCase().includes(term)
    );
  }, [images, searchTerm]);

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Contar campos do textContent
    total += 3; // badge.text, badge.icon, title.line1, title.line2, title.highlightWords
    if (textContent.badge.text.trim()) completed++;
    if (textContent.badge.icon.trim()) completed++;
    if (textContent.title.line1.trim()) completed++;
    if (textContent.title.line2.trim()) completed++;
    if (textContent.title.highlightWords.trim()) completed++;

    // Campos opcionais
    if (textContent.description) total += 1;
    if (textContent.description?.trim()) completed++;
    
    if (textContent.cta?.button) total += 1;
    if (textContent.cta?.button?.trim()) completed++;
    
    if (textContent.cta?.cardTitle) total += 1;
    if (textContent.cta?.cardTitle?.trim()) completed++;
    
    if (textContent.cta?.cardDescription) total += 1;
    if (textContent.cta?.cardDescription?.trim()) completed++;

    // Contar campos das imagens
    total += images.length * 3; // alt, image, span para cada imagem
    images.forEach(image => {
      if (image.alt.trim()) completed++;
      if (image.image.trim() || image.file) completed++;
      if (image.span.trim()) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();
  const imagesComplete = images.filter(image => image.alt.trim() && (image.image.trim() || image.file)).length;

  if (loading && !exists) {
    return <Loading layout={Layers} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={ImageIcon}
      title="Galeria"
      description="Configure a galeria de imagens e conteúdo de texto"
      exists={!!exists}
      itemName="Galeria"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Text Content */}
        <div className="space-y-4">
          <SectionHeader
            title="Conteúdo de Texto"
            section="textContent"
            icon={Text}
            isExpanded={expandedSections.textContent}
            onToggle={() => toggleSection("textContent")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.textContent ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-8">
                {/* Badge */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="w-5 h-5 text-[var(--color-secondary)]" />
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)]">
                      Badge
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <IconSelector
                        value={textContent.badge.icon}
                        onChange={(value) => handleTextContentChange('badge.icon', value)}
                        label="Ícone do Badge"
                        placeholder="ph:crown"
                      />
                      <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                        Ícone que aparece no badge
                      </p>
                    </div>

                    <div>
                      <Input
                        label="Texto do Badge"
                        value={textContent.badge.text}
                        onChange={(e) => handleTextContentChange('badge.text', e.target.value)}
                        placeholder="Comunidade VIP"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                      <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                        Texto pequeno acima do título principal
                      </p>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-4 pt-6 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-2 mb-4">
                    <Type className="w-5 h-5 text-[var(--color-secondary)]" />
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)]">
                      Título
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Linha 1"
                        value={textContent.title.line1}
                        onChange={(e) => handleTextContentChange('title.line1', e.target.value)}
                        placeholder="Faça parte da"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                      <Input
                        label="Linha 2"
                        value={textContent.title.line2}
                        onChange={(e) => handleTextContentChange('title.line2', e.target.value)}
                        placeholder="elite do mercado"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                    
                    <Input
                      label="Palavras em Destaque"
                      value={textContent.title.highlightWords}
                      onChange={(e) => handleTextContentChange('title.highlightWords', e.target.value)}
                      placeholder="elite do mercado"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/70">
                      Palavras que serão destacadas no título (separadas por vírgula se necessário)
                    </p>
                  </div>
                </div>

                {/* Descrição Opcional */}
                <div className="space-y-4 pt-6 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-[var(--color-secondary)]" />
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)]">
                      Descrição (Opcional)
                    </h3>
                  </div>
                  
                  <TextArea
                    label="Descrição"
                    value={textContent.description || ""}
                    onChange={(e) => handleTextContentChange('description', e.target.value)}
                    placeholder="Entre para o ecossistema onde networking não é troca de cartão, é troca de estratégia de escala."
                    rows={3}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                {/* CTA Opcional */}
                <div className="space-y-4 pt-6 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-2 mb-4">
                    <Instagram className="w-5 h-5 text-[var(--color-secondary)]" />
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)]">
                      Call to Action (Opcional)
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <Input
                      label="Texto do Botão"
                      value={textContent.cta?.button || ""}
                      onChange={(e) => handleTextContentChange('cta.button', e.target.value)}
                      placeholder="Ver Galeria Completa no Instagram"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Título do Card"
                        value={textContent.cta?.cardTitle || ""}
                        onChange={(e) => handleTextContentChange('cta.cardTitle', e.target.value)}
                        placeholder="Sua foto aqui"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                      <Input
                        label="Descrição do Card"
                        value={textContent.cta?.cardDescription || ""}
                        onChange={(e) => handleTextContentChange('cta.cardDescription', e.target.value)}
                        placeholder="Junte-se aos próximos cases de sucesso da Tegbe."
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Imagens */}
        <div className="space-y-4">
          <SectionHeader
            title="Imagens da Galeria"
            section="images"
            icon={ImageLucide}
            isExpanded={expandedSections.images}
            onToggle={() => toggleSection("images")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.images ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Gerenciamento de Imagens
                    </h4>
                    <p className="text-sm text-[var(--color-secondary)]/70">
                      Arraste e solte para reordenar as imagens da galeria
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-300" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {imagesComplete} de {images.length} completas
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      onClick={handleAddImage}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Adicionar Imagem
                    </Button>
                  </div>
                </div>

                {/* Barra de busca */}
                <div className="space-y-2 mb-6">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Buscar Imagens
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]/70" />
                    <Input
                      type="text"
                      placeholder="Buscar imagens por descrição, URL ou tamanho..."
                      value={searchTerm}
                      onChange={(e: any) => setSearchTerm(e.target.value)}
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-secondary)]/70 hover:text-[var(--color-secondary)]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {filteredImages.length === 0 ? (
                    <Card className="p-8 bg-[var(--color-background)]">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                          Nenhuma imagem encontrada
                        </h3>
                        <p className="text-sm text-[var(--color-secondary)]/70">
                          {searchTerm ? 'Tente ajustar sua busca ou limpe o filtro' : 'Adicione sua primeira imagem'}
                        </p>
                      </div>
                    </Card>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={images.map(f => f.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {filteredImages.map((item, index) => (
                          <SortableGalleryItem
                            key={item.id}
                            item={item}
                            index={index}
                            showValidation={showValidation}
                            itemList={images}
                            handleChange={handleImageChange}
                            handleFileChange={handleImageFileChange}
                            openDeleteSingleModal={openDeleteSingleModal}
                            getImageUrl={getImageUrl}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </div>

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          onAddNew={handleAddImage}
          isAddDisabled={false}
          isSaving={loading}
          exists={!!exists}
          completeCount={completion.completed}
          totalCount={completion.total}
          itemName="Galeria"
          icon={ImageIcon}
        />
      </form>

      {/* Modal de confirmação de exclusão de imagem */}
      <AnimatePresence>
        {deleteImageIndex !== null && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[var(--color-background)] rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  <h3 className="text-xl font-semibold text-[var(--color-secondary)]">
                    Confirmar Exclusão
                  </h3>
                </div>
                <p className="text-[var(--color-secondary)]/80 mb-6">
                  Tem certeza que deseja excluir a imagem <strong>&quot;{deleteImageTitle}&quot;</strong>?
                  Esta ação não pode ser desfeita.
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setDeleteImageIndex(null);
                      setDeleteImageTitle("");
                    }}
                    className="border-[var(--color-border)]"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleDeleteImage}
                    className="bg-red-600 hover:bg-red-700 border-none"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={images.length}
        itemName="Galeria"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />

      {/* Modal de imagem expandida */}
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
                className="absolute -top-4 -right-4 !p-3 !rounded-full bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 z-10 border-none"
              >
                <X className="w-5 h-5" />
              </Button>
              <img
                src={expandedImage}
                alt="Preview expandido"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ManageLayout>
  );
}