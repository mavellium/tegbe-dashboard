// app/cases-venda-mais/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListManagement } from "@/hooks/useListManagement";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { TrendingUp, X, GripVertical, ArrowUpDown, Bold, DollarSign, Target } from "lucide-react";
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

interface CaseItem {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  file?: File | null;
}

const ImagePreviewComponent = ({ imageUrl, alt = "Preview" }: { imageUrl: string, alt?: string }) => {
  const isBlobUrl = imageUrl.startsWith('blob:');
  
  if (isBlobUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className="h-48 w-full object-cover rounded-xl border-2 border-zinc-300 dark:border-zinc-600 group-hover:border-green-500 transition-all duration-200"
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
        width={400}
        height={192}
        className="h-48 w-full object-cover rounded-xl border-2 border-zinc-300 dark:border-zinc-600 group-hover:border-green-500 transition-all duration-200"
        onError={(e) => {
          console.error('Erro ao carregar imagem:', imageUrl);
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
};

interface SortableCaseItemProps {
  item: CaseItem;
  index: number;
  originalIndex: number;
  isLastInOriginalList: boolean;
  isLastAndEmpty: boolean;
  showValidation: boolean;
  itemList: CaseItem[];
  handleChange: (index: number, field: keyof CaseItem, value: any) => void;
  handleFileChange: (index: number, file: File | null) => void;
  openDeleteSingleModal: (index: number, title: string) => void;
  setExpandedImage: (image: string | null) => void;
  getImageUrl: (item: CaseItem) => string;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
}

function SortableCaseItem({
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
}: SortableCaseItemProps) {
  const stableId = useId();
  const sortableId = item.id || `case-${index}-${stableId}`;

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

  const hasTitle = item.title.trim() !== "";
  const hasSubtitle = item.subtitle.trim() !== "";
  const hasDescription = item.description.trim() !== "";
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
      <Card className={`mb-6 overflow-hidden transition-all duration-300 ${
        isLastInOriginalList && showValidation && (!hasTitle || !hasDescription || !hasImage) ? 'ring-2 ring-red-500' : ''
      } ${isDragging ? 'shadow-lg scale-105' : ''} border-l-4 border-green-500`}>
        <div className="p-6 bg-white dark:bg-zinc-900">
          <div className="flex items-start justify-between mb-6">
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
              <div className="flex items-center gap-2 ml-4">
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>Case Venda+</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ItemHeader
                index={originalIndex}
                fields={[
                  { label: 'Título', hasValue: hasTitle },
                  { label: 'Descrição', hasValue: hasDescription },
                  { label: 'Imagem', hasValue: hasImage }
                ]}
                showValidation={showValidation}
                isLast={isLastInOriginalList}
                onDelete={() => openDeleteSingleModal(originalIndex, item.title)}
                showDelete={itemList.length > 1}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna 1: Imagem */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Imagem do Case
                </label>

                <ImageUpload
                  imageUrl={imageUrl}
                  hasImage={hasImage}
                  file={item.file || null}
                  onFileChange={(file) => handleFileChange(originalIndex, file)}
                  onExpand={setExpandedImage}
                  label="Imagem de Destaque"
                  altText="Preview do case"
                  imageInfo={hasImage && !item.file
                    ? "Imagem atual do servidor. Selecione um novo arquivo para substituir."
                    : "Formatos suportados: JPG, PNG, WEBP. Tamanho recomendado: 800x400px."}
                  customPreview={imageUrl ? (
                    <div className="relative">
                      <ImagePreviewComponent imageUrl={imageUrl} alt={item.title} />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-xl">
                        <div className="text-white text-sm font-medium truncate">
                          {item.title || "Case sem título"}
                        </div>
                      </div>
                    </div>
                  ) : undefined}
                />
              </div>
            </div>

            {/* Coluna 2 e 3: Conteúdo */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                    Título do Case
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                      <Bold className="w-3 h-3" />
                      Use **texto** para negrito
                    </span>
                  </label>
                  <Input
                    type="text"
                    value={item.title}
                    onChange={(e: any) => handleChange(originalIndex, "title", e.target.value)}
                    placeholder="Ex: Case 40k - R$40.000,00 de faturamento em 90 dias"
                    className="text-lg font-semibold border-green-200 dark:border-green-800 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Subtítulo/Resultado
                  </label>
                  <Input
                    type="text"
                    value={item.subtitle}
                    onChange={(e: any) => handleChange(originalIndex, "subtitle", e.target.value)}
                    placeholder="Ex: R$40.000,00 de faturamento em 90 dias"
                    className="border-green-200 dark:border-green-800 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Destaque o resultado principal do case de forma impactante
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Descrição Detalhada
                </label>
                <textarea
                  value={item.description}
                  onChange={(e: any) => handleChange(originalIndex, "description", e.target.value)}
                  rows={6}
                  placeholder="Ex: Em apenas 90 dias, estruturamos uma operação que saltou para R$ 40.000,00 de faturamento e mais de 650 vendas. Escala real para quem busca resultados sólidos."
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function CasesVendaMaisPage({ 
  type = "venda-mais-ecommerce", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  const defaultItem = useMemo(() => ({ 
    title: "", 
    subtitle: "",
    description: "",
    image: "",
    file: null, 
  }), []);

  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const apiBase = `/api/${subtype}/form`;

  const {
    list: itemList,
    setList: setItemList,
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
    filteredItems: filteredItems,
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
  } = useListManagement<CaseItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem,
    validationFields: ["title", "description", "image"]
  });

  const remainingSlots = Math.max(0, currentPlanLimit - itemList.length);

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
      const oldIndex = itemList.findIndex((item) => 
        item.id === active.id || item.id?.includes(active.id as string)
      );
      const newIndex = itemList.findIndex((item) => 
        item.id === over.id || item.id?.includes(over.id as string)
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(itemList, oldIndex, newIndex);
        setItemList(newList);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const filteredList = itemList.filter(
        item => item.title.trim() && item.description.trim() && (item.image.trim() || item.file)
      );

      if (!filteredList.length) {
        setErrorMsg("Adicione ao menos um case completo com título, descrição e imagem.");
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
        throw new Error(err.error || "Erro ao salvar cases");
      }

      const saved = await res.json();

      const normalized = saved.values.map((v: any, i: number) => ({
        ...v,
        id: v.id || `case-${Date.now()}-${i}`,
        file: null,
      }));

      setItemList(normalized);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof CaseItem, value: any) => {
    const newList = [...itemList];
    newList[index] = { ...newList[index], [field]: value };
    setItemList(newList);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newList = [...itemList];
    newList[index] = { ...newList[index], file };
    setItemList(newList);
  };

  const getImageUrl = (item: CaseItem): string => {
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

  const updateItems = async (list: CaseItem[]) => {
    if (!exists) return;

    const filteredList = list.filter(
      item => item.title.trim() || item.description.trim() || item.file || item.image
    );

    const fd = new FormData();
    
    fd.append("id", exists.id);
    
    filteredList.forEach((item, i) => {
      fd.append(`values[${i}][title]`, item.title || "");
      fd.append(`values[${i}][subtitle]`, item.subtitle || "");
      fd.append(`values[${i}][description]`, item.description || "");
      fd.append(`values[${i}][image]`, item.image || "");
      
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
    () => itemList.map((item, index) => item.id ?? `case-${index}`),
    [itemList]
  );

  return (
    <ManageLayout
      headerIcon={TrendingUp}
      title="Cases de Venda+"
      description="Gerencie os cases de sucesso que mostram resultados reais de vendas"
      exists={!!exists}
      itemName="Case de Venda"
    >
      <div className="mb-6 space-y-4">
        <SearchSortBar
          search={search}
          setSearch={setSearch}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onClearFilters={clearFilters}
          searchPlaceholder="Buscar cases por título ou descrição..."
          total={itemList.length}
          showing={filteredItems.length}
          searchActiveText="ⓘ Busca ativa - não é possível adicionar novo case"
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
              filteredItems.map((item: any) => {
                const originalIndex = itemList.findIndex(i => i.id === item.id);
                const hasTitle = item.title.trim() !== "";
                const hasDescription = item.description.trim() !== "";
                const hasImage = Boolean(item.image?.trim() !== "" || item.file);
                const isLastInOriginalList = originalIndex === itemList.length - 1;
                const isLastAndEmpty = isLastInOriginalList && !hasTitle && !hasDescription && !hasImage;
                const imageUrl = getImageUrl(item);

                return (
                  <div
                    key={item.id || `case-${originalIndex}`}
                    ref={isLastAndEmpty ? setNewItemRef : null}
                  >
                    <Card className={`mb-6 overflow-hidden transition-all duration-300 ${
                      isLastInOriginalList && showValidation && (!hasTitle || !hasDescription || !hasImage) ? 'ring-2 ring-red-500' : ''
                    } border-l-4 border-green-500`}>
                      <div className="p-6 bg-white dark:bg-zinc-900">
                        <ItemHeader
                          index={originalIndex}
                          fields={[
                            { label: 'Título', hasValue: hasTitle },
                            { label: 'Descrição', hasValue: hasDescription },
                            { label: 'Imagem', hasValue: hasImage }
                          ]}
                          showValidation={showValidation}
                          isLast={isLastInOriginalList}
                          onDelete={() => openDeleteSingleModal(originalIndex, item.title)}
                          showDelete={itemList.length > 1}
                        />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Imagem do Case
                              </label>

                              <ImageUpload
                                imageUrl={imageUrl}
                                hasImage={hasImage}
                                file={item.file || null}
                                onFileChange={(file) => handleFileChange(originalIndex, file)}
                                onExpand={setExpandedImage}
                                label="Imagem de Destaque"
                                altText="Preview do case"
                                imageInfo={hasImage && !item.file
                                  ? "Imagem atual do servidor. Selecione um novo arquivo para substituir."
                                  : "Formatos suportados: JPG, PNG, WEBP. Tamanho recomendado: 800x400px."}
                              />
                            </div>
                          </div>

                          <div className="lg:col-span-2 space-y-6">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                                  Título do Case
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                    <Bold className="w-3 h-3" />
                                    Use **texto** para negrito
                                  </span>
                                </label>
                                <Input
                                  type="text"
                                  value={item.title}
                                  onChange={(e: any) => handleChange(originalIndex, "title", e.target.value)}
                                  placeholder="Ex: Case 40k - R$40.000,00 de faturamento em 90 dias"
                                  className="text-lg font-semibold border-green-200 dark:border-green-800 focus:ring-green-500 focus:border-green-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                  Subtítulo/Resultado
                                </label>
                                <Input
                                  type="text"
                                  value={item.subtitle}
                                  onChange={(e: any) => handleChange(originalIndex, "subtitle", e.target.value)}
                                  placeholder="Ex: R$40.000,00 de faturamento em 90 dias"
                                  className="border-green-200 dark:border-green-800 focus:ring-green-500 focus:border-green-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Descrição Detalhada
                              </label>
                              <textarea
                                value={item.description}
                                onChange={(e: any) => handleChange(originalIndex, "description", e.target.value)}
                                rows={6}
                                placeholder="Ex: Em apenas 90 dias, estruturamos uma operação que saltou para R$ 40.000,00 de faturamento e mais de 650 vendas. Escala real para quem busca resultados sólidos."
                                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                              />
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
                    {itemList.map((item, index) => {
                      const originalIndex = index;
                      const hasTitle = item.title.trim() !== "";
                      const hasDescription = item.description.trim() !== "";
                      const hasImage = Boolean(item.image?.trim() !== "" || item.file);
                      const isLastInOriginalList = index === itemList.length - 1;
                      const isLastAndEmpty = isLastInOriginalList && !hasTitle && !hasDescription && !hasImage;

                      return (
                        <SortableCaseItem
                          key={stableIds[index]}
                          item={item}
                          index={index}
                          originalIndex={originalIndex}
                          isLastInOriginalList={isLastInOriginalList}
                          isLastAndEmpty={isLastAndEmpty}
                          showValidation={showValidation}
                          itemList={itemList}
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
        totalCount={itemList.length}
        itemName="Case de Venda"
        icon={TrendingUp}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateItems)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={itemList.length}
        itemName="Case de Venda"
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
              className="relative max-w-4xl max-h-full"
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
                  width={800}
                  height={600}
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