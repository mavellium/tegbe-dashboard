// app/admin/(manage)/[subtype]/[type]/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListManagement } from "@/hooks/useListManagement";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Layers, X, GripVertical, ArrowUpDown } from "lucide-react";
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

interface StepItem {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  file?: File | null;
  image?: string;
}

const ImagePreviewComponent = ({ imageUrl, alt = "Preview" }: { imageUrl: string, alt?: string }) => {
  const isBlobUrl = imageUrl.startsWith('blob:');
  
  if (isBlobUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className="h-32 w-32 object-cover rounded-xl border-2 border-zinc-300 dark:border-zinc-600 group-hover:border-blue-500 transition-all duration-200"
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
        width={128}
        height={128}
        className="h-32 w-32 object-cover rounded-xl border-2 border-zinc-300 dark:border-zinc-600 group-hover:border-blue-500 transition-all duration-200"
        onError={(e) => {
          console.error('Erro ao carregar imagem:', imageUrl);
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
};

interface SortableStepItemProps {
  step: StepItem;
  index: number;
  originalIndex: number;
  isLastInOriginalList: boolean;
  isLastAndEmpty: boolean;
  showValidation: boolean;
  stepList: StepItem[];
  handleChange: (index: number, field: keyof StepItem, value: any) => void;
  handleFileChange: (index: number, file: File | null) => void;
  openDeleteSingleModal: (index: number, title: string) => void;
  setExpandedImage: (image: string | null) => void;
  getImageUrl: (step: StepItem) => string;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
}

function SortableStepItem({
  step,
  index,
  originalIndex,
  isLastInOriginalList,
  isLastAndEmpty,
  showValidation,
  stepList,
  handleChange,
  handleFileChange,
  openDeleteSingleModal,
  setExpandedImage,
  getImageUrl,
  setNewItemRef,
}: SortableStepItemProps) {
  const stableId = useId();
  const sortableId = step.id || `step-${index}-${stableId}`;

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

  const hasTitle = step.title.trim() !== "";
  const hasSubtitle = step.subtitle.trim() !== "";
  const hasDescription = step.description.trim() !== "";
  const hasImage = Boolean(step.image?.trim() !== "" || step.file);
  const imageUrl = getImageUrl(step);

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
        isLastInOriginalList && showValidation && !hasTitle ? 'ring-2 ring-red-500' : ''
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
                  { label: 'Título', hasValue: hasTitle },
                  { label: 'Subtítulo', hasValue: hasSubtitle },
                  { label: 'Descrição', hasValue: hasDescription },
                  { label: 'Imagem', hasValue: hasImage }
                ]}
                showValidation={showValidation}
                isLast={isLastInOriginalList}
                onDelete={() => openDeleteSingleModal(originalIndex, step.title)}
                showDelete={stepList.length > 1}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Imagem
                </label>

                <ImageUpload
                  imageUrl={imageUrl}
                  hasImage={hasImage}
                  file={step.file || null}
                  onFileChange={(file) => handleFileChange(originalIndex, file)}
                  onExpand={setExpandedImage}
                  label="Imagem da Etapa"
                  altText="Preview da etapa"
                  imageInfo={hasImage && !step.file
                    ? "Imagem atual do servidor. Selecione um novo arquivo para substituir."
                    : "Formatos suportados: JPG, PNG, WEBP."}
                  customPreview={imageUrl ? <ImagePreviewComponent imageUrl={imageUrl} /> : undefined}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Título
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Aprender"
                  value={step.title}
                  onChange={(e: any) => handleChange(originalIndex, "title", e.target.value)}
                  className="font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Subtítulo
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Do zero ao primeiro faturamento."
                  value={step.subtitle}
                  onChange={(e: any) => handleChange(originalIndex, "subtitle", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Descrição
                </label>
                <textarea
                  placeholder="Validamos seu nicho e construímos sua base. Ideal para quem busca segurança no primeiro passo."
                  value={step.description}
                  onChange={(e: any) => handleChange(originalIndex, "description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function StepsPage({ 
  type = "steps", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  const defaultStep = useMemo(() => ({ 
    title: "", 
    subtitle: "", 
    description: "",
    file: null, 
    image: "" 
  }), []);

  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Construa a base da API dinamicamente com subtype
  const apiBase = `/api/${subtype}/form`;

  const {
    list: stepList,
    setList: setStepList,
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
    filteredItems: filteredSteps,
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
  } = useListManagement<StepItem>({
    type,
    apiPath: `${apiBase}/${type}`, // Caminho dinâmico com subtype
    defaultItem: defaultStep,
    validationFields: ["title", "subtitle", "description"]
  });

  const remainingSlots = Math.max(0, currentPlanLimit - stepList.length);

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
      const oldIndex = stepList.findIndex((item) => 
        item.id === active.id || item.id?.includes(active.id as string)
      );
      const newIndex = stepList.findIndex((item) => 
        item.id === over.id || item.id?.includes(over.id as string)
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(stepList, oldIndex, newIndex);
        setStepList(newList);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const filteredList = stepList.filter(
        s => s.title.trim() && s.subtitle.trim() && s.description.trim()
      );

      if (!filteredList.length) {
        setErrorMsg("Adicione ao menos uma etapa completa (com título, subtítulo e descrição).");
        setLoading(false);
        return;
      }

      const fd = new FormData();
      
      if (exists) fd.append("id", exists.id);
      
      filteredList.forEach((s, i) => {
        fd.append(`values[${i}][title]`, s.title);
        fd.append(`values[${i}][subtitle]`, s.subtitle);
        fd.append(`values[${i}][description]`, s.description);
        fd.append(`values[${i}][image]`, s.image || "");
        
        if (s.file) {
          fd.append(`file${i}`, s.file);
        }
        
        if (s.id) {
          fd.append(`values[${i}][id]`, s.id);
        }
      });

      const method = exists ? "PUT" : "POST";
      
      // Use a URL dinâmica com subtype
      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Falha ao salvar dados");
      }

      const savedData = await res.json();
      const normalizedSteps = savedData.values.map((v: any, index: number) => ({ 
        ...v, 
        id: v.id || `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
        file: null 
      }));
      
      setStepList(normalizedSteps);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Erro no submit:', err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof StepItem, value: any) => {
    const newList = [...stepList];
    newList[index] = { ...newList[index], [field]: value };
    setStepList(newList);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newList = [...stepList];
    newList[index] = { ...newList[index], file };
    setStepList(newList);
  };

  const getImageUrl = (step: StepItem): string => {
    if (step.file) {
      return URL.createObjectURL(step.file);
    }
    if (step.image) {
      if (step.image.startsWith('http') || step.image.startsWith('//')) {
        return step.image;
      } else {
        return `https://mavellium.com.br${step.image.startsWith('/') ? '' : '/'}${step.image}`;
      }
    }
    return "";
  };

  const updateSteps = async (list: StepItem[]) => {
    if (!exists) return;

    const filteredList = list.filter(
      s => s.title.trim() || s.subtitle.trim() || s.description.trim() || s.file || s.image
    );

    const fd = new FormData();
    
    fd.append("id", exists.id);
    
    filteredList.forEach((s, i) => {
      fd.append(`values[${i}][title]`, s.title);
      fd.append(`values[${i}][subtitle]`, s.subtitle);
      fd.append(`values[${i}][description]`, s.description);
      fd.append(`values[${i}][image]`, s.image || "");
      
      if (s.file) {
        fd.append(`file${i}`, s.file);
      }
      
      if (s.id) {
        fd.append(`values[${i}][id]`, s.id);
      }
    });

    // Use a URL dinâmica com subtype
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

  const stableIds = useMemo(() => 
    stepList.map((item, index) => item.id || `step-${index}-${Math.random().toString(36).substr(2, 9)}`),
    [stepList]
  );

  return (
    <ManageLayout
      headerIcon={Layers}
      title="Etapas"
      description="Gerencie as etapas do processo de e-commerce"
      exists={!!exists}
      itemName="Etapa"
    >
      <div className="mb-6 space-y-4">
        <SearchSortBar
          search={search}
          setSearch={setSearch}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onClearFilters={clearFilters}
          searchPlaceholder="Buscar etapas..."
          total={stepList.length}
          showing={filteredSteps.length}
          searchActiveText="ⓘ Busca ativa - não é possível adicionar nova etapa"
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
              filteredSteps.map((step: any) => {
                const originalIndex = stepList.findIndex(s => s.id === step.id);
                const hasTitle = step.title.trim() !== "";
                const hasSubtitle = step.subtitle.trim() !== "";
                const hasDescription = step.description.trim() !== "";
                const hasImage = Boolean(step.image?.trim() !== "" || step.file);
                const isLastInOriginalList = originalIndex === stepList.length - 1;
                const isLastAndEmpty = isLastInOriginalList && !hasTitle && !hasSubtitle && !hasDescription;
                const imageUrl = getImageUrl(step);

                return (
                  <div
                    key={step.id || `step-${originalIndex}`}
                    ref={isLastAndEmpty ? setNewItemRef : null}
                  >
                    <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
                      isLastInOriginalList && showValidation && !hasTitle ? 'ring-2 ring-red-500' : ''
                    }`}>
                      <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
                        <ItemHeader
                          index={originalIndex}
                          fields={[
                            { label: 'Título', hasValue: hasTitle },
                            { label: 'Subtítulo', hasValue: hasSubtitle },
                            { label: 'Descrição', hasValue: hasDescription },
                            { label: 'Imagem', hasValue: hasImage }
                          ]}
                          showValidation={showValidation}
                          isLast={isLastInOriginalList}
                          onDelete={() => openDeleteSingleModal(originalIndex, step.title)}
                          showDelete={stepList.length > 1}
                        />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Imagem
                              </label>

                              <ImageUpload
                                imageUrl={imageUrl}
                                hasImage={hasImage}
                                file={step.file || null}
                                onFileChange={(file) => handleFileChange(originalIndex, file)}
                                onExpand={setExpandedImage}
                                label="Imagem da Etapa"
                                altText="Preview da etapa"
                                imageInfo={hasImage && !step.file
                                  ? "Imagem atual do servidor. Selecione um novo arquivo para substituir."
                                  : "Formatos suportados: JPG, PNG, WEBP."}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Título
                              </label>
                              <Input
                                type="text"
                                placeholder="Ex: Aprender"
                                value={step.title}
                                onChange={(e: any) => handleChange(originalIndex, "title", e.target.value)}
                                className="font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Subtítulo
                              </label>
                              <Input
                                type="text"
                                placeholder="Ex: Do zero ao primeiro faturamento."
                                value={step.subtitle}
                                onChange={(e: any) => handleChange(originalIndex, "subtitle", e.target.value)}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Descrição
                              </label>
                              <textarea
                                placeholder="Validamos seu nicho e construímos sua base. Ideal para quem busca segurança no primeiro passo."
                                value={step.description}
                                onChange={(e: any) => handleChange(originalIndex, "description", e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
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
                <SortableContext
                  items={stableIds}
                  strategy={verticalListSortingStrategy}
                >
                  {stepList.map((step, index) => {
                    const originalIndex = index;
                    const hasTitle = step.title.trim() !== "";
                    const hasSubtitle = step.subtitle.trim() !== "";
                    const hasDescription = step.description.trim() !== "";
                    const isLastInOriginalList = index === stepList.length - 1;
                    const isLastAndEmpty = isLastInOriginalList && !hasTitle && !hasSubtitle && !hasDescription;

                    return (
                      <SortableStepItem
                        key={stableIds[index]}
                        step={step}
                        index={index}
                        originalIndex={originalIndex}
                        isLastInOriginalList={isLastInOriginalList}
                        isLastAndEmpty={isLastAndEmpty}
                        showValidation={showValidation}
                        stepList={stepList}
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
        totalCount={stepList.length}
        itemName="Etapa"
        icon={Layers}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateSteps)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={stepList.length}
        itemName="Etapa"
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