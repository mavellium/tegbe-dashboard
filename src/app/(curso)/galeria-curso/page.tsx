/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListManagement } from "@/hooks/useListManagement";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Image as ImageIcon, X, GripVertical, ArrowUpDown } from "lucide-react";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { SearchSortBar } from "@/components/Manage/SearchSortBar";
import { ItemHeader } from "@/components/Manage/ItemHeader";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { ImageUpload } from "@/components/Manage/ImageUpload";
import Image from "next/image";
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
import ClientOnly from "@/components/ClientOnly";

interface GalleryItem {
  id?: string;
  image: string;
  alt: string;
  span: string;
  file?: File | null;
}

const ImagePreviewComponent = ({ imageUrl, alt = "Preview" }: { imageUrl: string, alt?: string }) => {
  const isBlobUrl = imageUrl.startsWith('blob:');
  
  if (isBlobUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className="h-40 w-40 object-cover rounded-xl border-2 border-zinc-300 dark:border-zinc-600 group-hover:border-blue-500 transition-all duration-200"
        onError={(e) => {
          console.error('Erro ao carregar imagem:', imageUrl);
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  } else {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        width={160}
        height={160}
        className="h-40 w-40 object-cover rounded-xl border-2 border-zinc-300 dark:border-zinc-600 group-hover:border-blue-500 transition-all duration-200"
        onError={(e) => {
          console.error('Erro ao carregar imagem:', imageUrl);
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
};

interface SortableGalleryItemProps {
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
  setExpandedImage: (image: string | null) => void;
  getImageUrl: (item: GalleryItem) => string;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
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
  setExpandedImage,
  getImageUrl,
  setNewItemRef,
}: SortableGalleryItemProps) {
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
  const imageUrl = getImageUrl(item);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      
      if (isLastAndEmpty && setNewItemRef) {
        setNewItemRef(node);
      }
    },
    [setNodeRef, isLastAndEmpty, setNewItemRef]
  );

  return (
    <div
      ref={setRefs}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
        isLastInOriginalList && showValidation && (!hasAlt || !hasImage) ? 'ring-2 ring-red-500' : ''
      } ${isDragging ? 'shadow-lg scale-105' : ''}`}>
        <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="cursor-move text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <ArrowUpDown className="w-4 h-4" />
                <span>Posição: {index + 1}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ItemHeader
                index={originalIndex}
                fields={[
                  { label: 'Imagem', hasValue: hasImage },
                  { label: 'Descrição', hasValue: hasAlt },
                  { label: 'Tamanho', hasValue: !!item.span }
                ]}
                showValidation={showValidation}
                isLast={isLastInOriginalList}
                onDelete={() => openDeleteSingleModal(originalIndex, item.alt || "Imagem sem descrição")}
                showDelete={itemList.length > 1}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Imagem da Galeria
                </label>

                <ImageUpload
                  imageUrl={imageUrl}
                  hasImage={hasImage}
                  file={item.file || null}
                  onFileChange={(file) => handleFileChange(originalIndex, file)}
                  onExpand={setExpandedImage}
                  label="Imagem da Galeria"
                  altText="Preview da imagem"
                  imageInfo={hasImage && !item.file
                    ? "Imagem atual do servidor. Selecione um novo arquivo para substituir."
                    : "Formatos suportados: JPG, PNG, WEBP. Tamanho recomendado: 1000x500px"}
                  customPreview={imageUrl ? <ImagePreviewComponent imageUrl={imageUrl} alt={item.alt} /> : undefined}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  URL da Imagem (image) <span className="text-xs text-zinc-500">- Opcional se fizer upload</span>
                </label>
                <Input
                  type="text"
                  placeholder="Ex: https://images.unsplash.com/photo-..."
                  value={item.image}
                  onChange={(e: any) => handleChange(originalIndex, "image", e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  URL da imagem. Deixe em branco se fizer upload de arquivo.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Texto Alternativo (alt) <span className="text-xs text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Evento Presencial Tegbe"
                  value={item.alt}
                  onChange={(e: any) => handleChange(originalIndex, "alt", e.target.value)}
                  className="font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Tamanho no Grid (span)
                </label>
                <select
                  value={item.span}
                  onChange={(e: any) => handleChange(originalIndex, "span", e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="row-span-1">Pequena (1 linha)</option>
                  <option value="row-span-2">Média (2 linhas)</option>
                  <option value="row-span-3">Grande (3 linhas)</option>
                </select>
                <p className="mt-1 text-xs text-zinc-500">
                  Define a altura da imagem no grid da galeria.
                </p>
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
    search,
    setSearch,
    sortOrder,
    setSortOrder,
    showValidation,
    filteredItems: filteredGalleryItems,
    deleteModal,
    newItemRef,
    canAddNewItem,
    completeCount,
    isLimitReached,
    currentPlanLimit,
    currentPlanType,
    addItem,
    openDeleteSingleModal,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
    clearFilters,
  } = useListManagement<GalleryItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem: defaultGalleryItem,
    validationFields: ["alt"] // Apenas alt é obrigatório, imagem pode ser por URL ou upload
  });

  const remainingSlots = Math.max(0, currentPlanLimit - galleryList.length);

  const setNewItemRef = useCallback((node: HTMLDivElement | null) => {
    if (newItemRef && node) {
      (newItemRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [newItemRef]);

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
      const oldIndex = galleryList.findIndex((item) => 
        item.id === active.id || item.id?.includes(active.id as string)
      );
      const newIndex = galleryList.findIndex((item) => 
        item.id === over.id || item.id?.includes(over.id as string)
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(galleryList, oldIndex, newIndex);
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
      const filteredList = galleryList.filter(
        item => {
          const hasAlt = item.alt.trim() !== "";
          const hasImage = item.image.trim() !== "" || item.file;
          return hasAlt && hasImage;
        }
      );

      if (!filteredList.length) {
        setErrorMsg("Adicione ao menos uma imagem completa (com descrição e imagem).");
        return;
      }

      const fd = new FormData();

      if (exists) fd.append("id", exists.id);

      fd.append(
        "values",
        JSON.stringify(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        throw new Error(err.error || "Erro ao salvar");
      }

      const saved = await res.json();

      const normalized = saved.values.map((v: any, i: number) => ({
        ...v,
        id: v.id || `gallery-${Date.now()}-${i}`,
        file: null,
      }));

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
    const newList = [...galleryList];
    newList[index] = { ...newList[index], [field]: value };
    setGalleryList(newList);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newList = [...galleryList];
    newList[index] = { ...newList[index], file };
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
      fd.append(`values[${i}][alt]`, item.alt);
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

  const handleSubmitWrapper = () => {
    handleSubmit();
  };

  const stableIds = useMemo(
    () => galleryList.map((item, index) => item.id ?? `gallery-${index}`),
    [galleryList]
  );

  return (
    <ManageLayout
      headerIcon={ImageIcon}
      title="Galeria de Imagens"
      description="Gerencie a galeria de imagens para exibição em grid"
      exists={!!exists}
      itemName="Imagem"
    >
      <div className="mb-6 space-y-4">
        <SearchSortBar
          search={search}
          setSearch={setSearch}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onClearFilters={clearFilters}
          searchPlaceholder="Buscar imagens..."
          total={galleryList.length}
          showing={filteredGalleryItems.length}
          searchActiveText="ⓘ Busca ativa - não é possível adicionar nova imagem"
          currentPlanType={currentPlanType}
          currentPlanLimit={currentPlanLimit}
          remainingSlots={remainingSlots}
          isLimitReached={isLimitReached}
        />
      </div>

      <div className="space-y-4 pb-32">
        <form onSubmit={handleSubmit}>
          <AnimatePresence>
            {search ? (
              filteredGalleryItems.map((item: any) => {
                const originalIndex = galleryList.findIndex(i => i.id === item.id);
                const hasAlt = item.alt.trim() !== "";
                const hasImage = Boolean(item.image?.trim() !== "" || item.file);
                const isLastInOriginalList = originalIndex === galleryList.length - 1;
                const isLastAndEmpty = isLastInOriginalList && !hasAlt && !hasImage;
                const imageUrl = getImageUrl(item);

                return (
                  <div
                    key={item.id || `gallery-${originalIndex}`}
                    ref={isLastAndEmpty ? setNewItemRef : null}
                  >
                    <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
                      isLastInOriginalList && showValidation && (!hasAlt || !hasImage) ? 'ring-2 ring-red-500' : ''
                    }`}>
                      <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
                        <ItemHeader
                          index={originalIndex}
                          fields={[
                            { label: 'Imagem', hasValue: hasImage },
                            { label: 'Descrição', hasValue: hasAlt },
                            { label: 'Tamanho', hasValue: !!item.span }
                          ]}
                          showValidation={showValidation}
                          isLast={isLastInOriginalList}
                          onDelete={() => openDeleteSingleModal(originalIndex, item.alt || "Imagem sem descrição")}
                          showDelete={galleryList.length > 1}
                        />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Imagem da Galeria
                              </label>

                              <ImageUpload
                                imageUrl={imageUrl}
                                hasImage={hasImage}
                                file={item.file || null}
                                onFileChange={(file) => handleFileChange(originalIndex, file)}
                                onExpand={setExpandedImage}
                                label="Imagem da Galeria"
                                altText="Preview da imagem"
                                imageInfo={hasImage && !item.file
                                  ? "Imagem atual do servidor. Selecione um novo arquivo para substituir."
                                  : "Formatos suportados: JPG, PNG, WEBP. Tamanho recomendado: 1000x500px"}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                URL da Imagem (image) <span className="text-xs text-zinc-500">- Opcional se fizer upload</span>
                              </label>
                              <Input
                                type="text"
                                placeholder="Ex: https://images.unsplash.com/photo-..."
                                value={item.image}
                                onChange={(e: any) => handleChange(originalIndex, "image", e.target.value)}
                                className="font-mono text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Texto Alternativo (alt) <span className="text-xs text-red-500">*</span>
                              </label>
                              <Input
                                type="text"
                                placeholder="Ex: Evento Presencial Tegbe"
                                value={item.alt}
                                onChange={(e: any) => handleChange(originalIndex, "alt", e.target.value)}
                                className="font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Tamanho no Grid (span)
                              </label>
                              <select
                                value={item.span}
                                onChange={(e: any) => handleChange(originalIndex, "span", e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                              >
                                <option value="row-span-1">Pequena (1 linha)</option>
                                <option value="row-span-2">Média (2 linhas)</option>
                                <option value="row-span-3">Grande (3 linhas)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <ClientOnly>
                  <SortableContext
                    items={stableIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {galleryList.map((item, index) => {
                      const originalIndex = index;
                      const hasAlt = item.alt.trim() !== "";
                      const hasImage = Boolean(item.image?.trim() !== "" || item.file);
                      const isLastInOriginalList = index === galleryList.length - 1;
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
                          itemList={galleryList}
                          handleChange={handleChange}
                          handleFileChange={handleFileChange}
                          openDeleteSingleModal={openDeleteSingleModal}
                          setExpandedImage={setExpandedImage}
                          getImageUrl={getImageUrl}
                          setNewItemRef={isLastAndEmpty ? setNewItemRef : undefined}
                        />
                      );
                    })}
                  </SortableContext>
                </ClientOnly>
              </DndContext>
            )}
          </AnimatePresence>
        </form>
      </div>

      <FixedActionBar
        onDeleteAll={openDeleteAllModal}
        onAddNew={() => addItem()}
        onSubmit={handleSubmitWrapper}
        isAddDisabled={!canAddNewItem || isLimitReached}
        isSaving={loading}
        exists={!!exists}
        completeCount={completeCount}
        totalCount={galleryList.length}
        itemName="Imagem"
        icon={ImageIcon}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateGallery)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={galleryList.length}
        itemName="Imagem"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />

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
              {expandedImage.startsWith('blob:') ? (
                <img
                  src={expandedImage}
                  alt="Preview expandido"
                  className="max-w-full max-h-[80vh] object-contain rounded-2xl"
                  onError={(e) => {
                    console.error('Erro ao carregar imagem expandida:', expandedImage);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <Image
                  src={expandedImage}
                  alt="Preview expandido"
                  width={1200}
                  height={800}
                  className="max-w-full max-h-[80vh] object-contain rounded-2xl"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ManageLayout>
  );
}