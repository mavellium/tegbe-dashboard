/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback, useId, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListManagement } from "@/hooks/useListManagement";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { 
  Image as ImageIcon, 
  GripVertical, 
  ArrowUpDown, 
  AlertCircle, 
  CheckCircle2, 
  Trash2,
  XCircle,
  Search,
  X
} from "lucide-react";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { ImageUpload } from "@/components/ImageUpload";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface GalleryItem {
  id?: string;
  image: string;
  alt: string;
  span: string;
  file?: File | null;
}

function SortableGalleryItem({
  item,
  index,
  originalIndex,
  isLastInOriginalList,
  isLastAndEmpty,
  showValidation,
  itemList,
  handleChange,
  handleFileChange,
  openDeleteSingleModal,
  getImageUrl,
  setExpandedImage,
  setNewItemRef,
}: {
  item: GalleryItem;
  index: number;
  originalIndex: number;
  isLastInOriginalList: boolean;
  isLastAndEmpty: boolean;
  showValidation: boolean;
  itemList: GalleryItem[];
  handleChange: (index: number, field: keyof GalleryItem, value: any) => void;
  handleFileChange: (index: number, file: File | null) => void;
  openDeleteSingleModal: (index: number, title: string) => void;
  getImageUrl: (item: GalleryItem) => string;
  setExpandedImage: (image: string | null) => void;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
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

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      
      if (isLastAndEmpty && setNewItemRef) {
        setNewItemRef(node);
      }
    },
    [setNodeRef, isLastAndEmpty, setNewItemRef]
  );

  const imageUrl = getImageUrl(item);

  return (
    <div
      ref={setRefs}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
        isLastInOriginalList && showValidation && (!hasAlt || !hasImage) 
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
                    <span className="px-2 py-1 text-xs bg-[var(--color-warning)]/20 text-red rounded-full border border-[var(--color-warning)]/30">
                      Incompleto
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              type="button"
              onClick={() => openDeleteSingleModal(originalIndex, item.alt || "Imagem sem descrição")}
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
                  label="Imagem da Galeria"
                  description="Formatos suportados: JPG, PNG, WEBP. Tamanho recomendado: 1000x500px."
                  currentImage={item.image || ""}
                  selectedFile={item.file || null}
                  onFileChange={(file) => handleFileChange(originalIndex, file)}
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
                    URL da Imagem (image) <span className="text-xs text-[var(--color-secondary)]/50">- Opcional se fizer upload</span>
                  </label>
                  <Input
                    type="text"
                    value={item.image}
                    onChange={(e: any) => handleChange(originalIndex, "image", e.target.value)}
                    placeholder="Ex: https://images.unsplash.com/photo-..."
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-[var(--color-secondary)]/50">
                    URL da imagem. Deixe em branco se fizer upload de arquivo.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Texto Alternativo (alt) <span className="text-xs text-[var(--color-danger)]">*</span>
                  </label>
                  <Input
                    type="text"
                    value={item.alt}
                    onChange={(e: any) => handleChange(originalIndex, "alt", e.target.value)}
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
                    onChange={(e: any) => handleChange(originalIndex, "span", e.target.value)}
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

export default function GalleryPage({ 
  type = "gallery", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  const defaultGalleryItem = useMemo(() => ({ 
    image: "", 
    alt: "", 
    span: "row-span-1",
    file: null
  }), []);

  const [localGallery, setLocalGallery] = useState<GalleryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const apiBase = `/api/${subtype}/form`;

  const {
    list: galleryList,
    setList: setGalleryList,
    exists,
    loading,
    setLoading,
    success,
    setSuccess,
    errorMsg,
    setErrorMsg,
    showValidation,
    deleteModal,
    currentPlanLimit,
    currentPlanType,
    openDeleteSingleModal,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
  } = useListManagement<GalleryItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem: defaultGalleryItem,
    validationFields: ["alt"]
  });

  // Sincroniza galeria local
  useEffect(() => {
    setLocalGallery(galleryList);
  }, [galleryList]);

  const newGalleryRef = useRef<HTMLDivElement>(null);

  const setNewItemRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      newGalleryRef.current = node;
    }
  }, []);

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

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = localGallery.findIndex((item) => 
        item.id === active.id || item.id?.includes(active.id as string)
      );
      const newIndex = localGallery.findIndex((item) => 
        item.id === over.id || item.id?.includes(over.id as string)
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(localGallery, oldIndex, newIndex);
        setLocalGallery(newList);
        setGalleryList(newList);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const filteredList = localGallery.filter(
        item => item.alt.trim() && (item.image.trim() || item.file)
      );

      if (!filteredList.length) {
        setErrorMsg("Adicione ao menos uma imagem completa com descrição e imagem.");
        return;
      }

      const fd = new FormData();

      if (exists) fd.append("id", exists.id);

      fd.append(
        "values",
        JSON.stringify(
          filteredList.map(({ file, ...rest }) => rest)
        )
      );

      filteredList.forEach((item, i) => {
        if (item.file) {
          fd.append(`file${i}`, item.file);
        }
      });

      const method = exists ? "PUT" : "POST";

      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar galeria");
      }

      const saved = await res.json();

      const normalized = saved.values.map((v: any, i: number) => ({
        ...v,
        id: v.id || `gallery-${Date.now()}-${i}`,
        file: null,
      }));

      setLocalGallery(normalized);
      setGalleryList(normalized);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof GalleryItem, value: any) => {
    const newList = [...localGallery];
    newList[index] = { ...newList[index], [field]: value };
    setLocalGallery(newList);
    setGalleryList(newList);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newList = [...localGallery];
    newList[index] = { ...newList[index], file };
    setLocalGallery(newList);
    setGalleryList(newList);
  };

  const getImageUrl = (item: GalleryItem): string => {
    if (item.file) {
      return URL.createObjectURL(item.file);
    }
    if (item.image) {
      if (item.image.startsWith('http') || item.image.startsWith('//')) {
        return item.image;
      } else {
        return `https://mavellium.com.br${item.image.startsWith('/') ? '' : '/'}${item.image}`;
      }
    }
    return "";
  };

  const updateGallery = async (list: GalleryItem[]) => {
    if (!exists) return;

    const filteredList = list.filter(
      item => item.image.trim() || item.alt.trim() || item.file || item.span
    );

    const fd = new FormData();
    
    fd.append("id", exists.id);
    
    filteredList.forEach((item, i) => {
      fd.append(`values[${i}][image]`, item.image || "");
      fd.append(`values[${i}][alt]`, item.alt || "");
      fd.append(`values[${i}][span]`, item.span || "row-span-1");
      
      if (item.file) {
        fd.append(`file${i}`, item.file);
      }
      
      if (item.id) {
        fd.append(`values[${i}][id]`, item.id);
      }
    });

    const res = await fetch(`${apiBase}/${type}`, {
      method: "PUT",
      body: fd,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Falha ao atualizar dados");
    }

    const updated = await res.json();
    return updated;
  };

  const handleAddGalleryItem = () => {
    if (localGallery.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: GalleryItem = {
      image: '',
      alt: '',
      span: 'row-span-1',
      file: null
    };
    
    const updated = [...localGallery, newItem];
    setLocalGallery(updated);
    setGalleryList(updated);
    
    setTimeout(() => {
      newGalleryRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const filteredGalleryItems = useMemo(() => {
    let filtered = [...localGallery];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.alt.toLowerCase().includes(term) ||
        item.image.toLowerCase().includes(term) ||
        item.span.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [localGallery, searchTerm]);

  const isGalleryLimitReached = localGallery.length >= currentPlanLimit;
  const canAddNewItem = !isGalleryLimitReached;
  const galleryCompleteCount = localGallery.filter(item => 
    item.alt.trim() !== '' && 
    (item.image.trim() !== '' || item.file)
  ).length;
  const galleryTotalCount = localGallery.length;

  const galleryValidationError = isGalleryLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Cada item tem 3 campos (alt, image, span)
    total += localGallery.length * 3;
    localGallery.forEach(item => {
      if (item.alt.trim()) completed++;
      if (item.image.trim() || item.file) completed++;
      if (item.span.trim()) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  const stableIds = useMemo(
    () => localGallery.map((item, index) => item.id ?? `gallery-${index}`),
    [localGallery]
  );

  return (
    <ManageLayout
      headerIcon={ImageIcon}
      title="Galeria de Imagens"
      description="Gerencie a galeria de imagens para exibição em grid"
      exists={!!exists}
      itemName="Galeria"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Cabeçalho de Controle */}
        <Card className="p-6 bg-[var(--color-background)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                Gerenciamento da Galeria
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span className="text-sm text-[var(--color-secondary)]/70">
                    {galleryCompleteCount} de {galleryTotalCount} completos
                  </span>
                </div>
                <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                <span className="text-sm text-[var(--color-secondary)]/70">
                  Limite: {currentPlanType === 'pro' ? '10' : '5'} itens
                </span>
              </div>
            </div>
          </div>

          {/* Barra de busca */}
          <div className="space-y-2">
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
            </div>
          </div>
        </Card>

        {/* Mensagem de erro */}
        {galleryValidationError && (
          <div className={`p-3 rounded-lg ${isGalleryLimitReached 
            ? 'bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30' 
            : 'bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30'}`}>
            <div className="flex items-start gap-2">
              {isGalleryLimitReached ? (
                <XCircle className="w-5 h-5 text-[var(--color-danger)] flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${isGalleryLimitReached 
                ? 'text-[var(--color-danger)]' 
                : 'text-[var(--color-warning)]'}`}>
                {galleryValidationError}
              </p>
            </div>
          </div>
        )}

        {/* Lista da Galeria */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredGalleryItems.length === 0 ? (
              <Card className="p-8 bg-[var(--color-background)]">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                    Nenhuma imagem encontrada
                  </h3>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    {searchTerm ? 'Tente ajustar sua busca ou limpe o filtro' : 'Adicione sua primeira imagem usando o botão abaixo'}
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
                  items={stableIds}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredGalleryItems.map((item, index) => {
                    const originalIndex = localGallery.findIndex(i => i.id === item.id) || index;
                    const hasAlt = item.alt.trim() !== "";
                    const hasImage = Boolean(item.image?.trim() !== "" || item.file);
                    const isLastInOriginalList = originalIndex === localGallery.length - 1;
                    const isLastAndEmpty = isLastInOriginalList && !hasAlt && !hasImage;

                    return (
                      <SortableGalleryItem
                        key={stableIds[index]}
                        item={item}
                        index={index}
                        originalIndex={originalIndex}
                        isLastInOriginalList={isLastInOriginalList}
                        isLastAndEmpty={isLastAndEmpty}
                        showValidation={showValidation}
                        itemList={localGallery}
                        handleChange={handleChange}
                        handleFileChange={handleFileChange}
                        openDeleteSingleModal={openDeleteSingleModal}
                        getImageUrl={getImageUrl}
                        setExpandedImage={setExpandedImage}
                        setNewItemRef={isLastAndEmpty ? setNewItemRef : undefined}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            )}
          </AnimatePresence>
        </div>

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          onAddNew={handleAddGalleryItem}
          isAddDisabled={!canAddNewItem}
          isSaving={loading}
          exists={!!exists}
          totalCount={completion.total}
          itemName="Imagem"
          icon={ImageIcon}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateGallery)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={localGallery.length}
        itemName="Galeria"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />

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
                onError={(e) => {
                  console.error('Erro ao carregar imagem expandida:', expandedImage);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ManageLayout>
  );
}