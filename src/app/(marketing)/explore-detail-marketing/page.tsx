/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListManagement } from "@/hooks/useListManagement";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Settings, X, GripVertical, ArrowUpDown } from "lucide-react";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { SearchSortBar } from "@/components/Manage/SearchSortBar";
import { ItemHeader } from "@/components/Manage/ItemHeader";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { ImageUpload } from "@/components/Manage/ImageUpload";
import IconSelector from "@/components/IconSelector"; // Importar o IconSelector
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

interface ServiceItem {
  id?: string;
  title: string;
  description: string;
  file?: File | null;
  image?: string;
  icon: string;
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

interface SortableServiceItemProps {
  service: ServiceItem;
  index: number;
  originalIndex: number;
  isLastInOriginalList: boolean;
  isLastAndEmpty: boolean;
  showValidation: boolean;
  serviceList: ServiceItem[];
  handleChange: (index: number, field: keyof ServiceItem, value: any) => void;
  handleFileChange: (index: number, file: File | null) => void;
  openDeleteSingleModal: (index: number, title: string) => void;
  setExpandedImage: (image: string | null) => void;
  getImageUrl: (service: ServiceItem) => string;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
}

function SortableServiceItem({
  service,
  index,
  originalIndex,
  isLastInOriginalList,
  isLastAndEmpty,
  showValidation,
  serviceList,
  handleChange,
  handleFileChange,
  openDeleteSingleModal,
  setExpandedImage,
  getImageUrl,
  setNewItemRef,
}: SortableServiceItemProps) {
  const stableId = useId();
  const sortableId = service.id || `service-${index}-${stableId}`;

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

  const hasTitle = service.title.trim() !== "";
  const hasDescription = service.description.trim() !== "";
  const hasIcon = service.icon.trim() !== "";
  const hasImage = Boolean(service.image?.trim() !== "" || service.file);
  const imageUrl = getImageUrl(service);

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
                  { label: 'Descrição', hasValue: hasDescription },
                  { label: 'Ícone', hasValue: hasIcon },
                  { label: 'Imagem', hasValue: hasImage }
                ]}
                showValidation={showValidation}
                isLast={isLastInOriginalList}
                onDelete={() => openDeleteSingleModal(originalIndex, service.title)}
                showDelete={serviceList.length > 1}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Imagem do Serviço
                </label>

                <ImageUpload
                  imageUrl={imageUrl}
                  hasImage={hasImage}
                  file={service.file || null}
                  onFileChange={(file) => handleFileChange(originalIndex, file)}
                  onExpand={setExpandedImage}
                  label="Imagem do Serviço"
                  altText="Preview do serviço"
                  imageInfo={hasImage && !service.file
                    ? "Imagem atual do servidor. Selecione um novo arquivo para substituir."
                    : "Formatos suportados: JPG, PNG, WEBP. Use imagens de alta qualidade (1920x1080 recomendado)."}
                  customPreview={imageUrl ? <ImagePreviewComponent imageUrl={imageUrl} /> : undefined}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Título do Serviço
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Aquisição Cirúrgica"
                  value={service.title}
                  onChange={(e: any) => handleChange(originalIndex, "title", e.target.value)}
                  className="font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Ícone do Serviço
                </label>
                <IconSelector
                  value={service.icon}
                  onChange={(value) => handleChange(originalIndex, "icon", value)}
                  label="Ícone do Serviço"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Descrição do Serviço
                </label>
                <textarea
                  placeholder="Tráfego pago focado em ICPs (Perfis de Cliente Ideal). Ignoramos curiosos e atraímos decisores com Google e Meta Ads de alta intenção."
                  value={service.description}
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

export default function ServicesPage({ 
  type = "services", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  const defaultService = useMemo(() => ({ 
    title: "", 
    description: "",
    icon: "",
    file: null, 
    image: "" 
  }), []);

  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const apiBase = `/api/${subtype}/form`;

  const {
    list: serviceList,
    setList: setServiceList,
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
    filteredItems: filteredServices,
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
  } = useListManagement<ServiceItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem: defaultService,
    validationFields: ["title", "description", "icon"]
  });

  const remainingSlots = Math.max(0, currentPlanLimit - serviceList.length);

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
      const oldIndex = serviceList.findIndex((item) => 
        item.id === active.id || item.id?.includes(active.id as string)
      );
      const newIndex = serviceList.findIndex((item) => 
        item.id === over.id || item.id?.includes(over.id as string)
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(serviceList, oldIndex, newIndex);
        setServiceList(newList);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const filteredList = serviceList.filter(
        s => s.title.trim() && s.description.trim() && s.icon.trim()
      );

      if (!filteredList.length) {
        setErrorMsg("Adicione ao menos um serviço completo.");
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

      filteredList.forEach((s, i) => {
        if (s.file) {
          fd.append(`file${i}`, s.file);
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
        id: v.id || `service-${Date.now()}-${i}`,
        file: null,
      }));

      setServiceList(normalized);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof ServiceItem, value: any) => {
    const newList = [...serviceList];
    newList[index] = { ...newList[index], [field]: value };
    setServiceList(newList);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newList = [...serviceList];
    newList[index] = { ...newList[index], file };
    setServiceList(newList);
  };

  const getImageUrl = (service: ServiceItem): string => {
    if (service.file) {
      return URL.createObjectURL(service.file);
    }
    if (service.image) {
      if (service.image.startsWith('http') || service.image.startsWith('//')) {
        return service.image;
      } else {
        return `https://mavellium.com.br${service.image.startsWith('/') ? '' : '/'}${service.image}`;
      }
    }
    return "";
  };

  const updateServices = async (list: ServiceItem[]) => {
    if (!exists) return;

    const filteredList = list.filter(
      s => s.title.trim() || s.description.trim() || s.icon.trim() || s.file || s.image
    );

    const fd = new FormData();
    
    fd.append("id", exists.id);
    
    filteredList.forEach((s, i) => {
      fd.append(`values[${i}][title]`, s.title);
      fd.append(`values[${i}][description]`, s.description);
      fd.append(`values[${i}][icon]`, s.icon);
      fd.append(`values[${i}][image]`, s.image || "");
      
      if (s.file) {
        fd.append(`file${i}`, s.file);
      }
      
      if (s.id) {
        fd.append(`values[${i}][id]`, s.id);
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
    () => serviceList.map((item, index) => item.id ?? `service-${index}`),
    [serviceList]
  );

  return (
    <ManageLayout
      headerIcon={Settings}
      title="Serviços"
      description="Gerencie os serviços oferecidos pela sua empresa"
      exists={!!exists}
      itemName="Serviço"
    >
      <div className="mb-6 space-y-4">
        <SearchSortBar
          search={search}
          setSearch={setSearch}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onClearFilters={clearFilters}
          searchPlaceholder="Buscar serviços..."
          total={serviceList.length}
          showing={filteredServices.length}
          searchActiveText="ⓘ Busca ativa - não é possível adicionar novo serviço"
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
              filteredServices.map((service: any) => {
                const originalIndex = serviceList.findIndex(s => s.id === service.id);
                const hasTitle = service.title.trim() !== "";
                const hasDescription = service.description.trim() !== "";
                const hasIcon = service.icon.trim() !== "";
                const hasImage = Boolean(service.image?.trim() !== "" || service.file);
                const isLastInOriginalList = originalIndex === serviceList.length - 1;
                const isLastAndEmpty = isLastInOriginalList && !hasTitle && !hasDescription && !hasIcon;
                const imageUrl = getImageUrl(service);

                return (
                  <div
                    key={service.id || `service-${originalIndex}`}
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
                            { label: 'Descrição', hasValue: hasDescription },
                            { label: 'Ícone', hasValue: hasIcon },
                            { label: 'Imagem', hasValue: hasImage }
                          ]}
                          showValidation={showValidation}
                          isLast={isLastInOriginalList}
                          onDelete={() => openDeleteSingleModal(originalIndex, service.title)}
                          showDelete={serviceList.length > 1}
                        />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Imagem do Serviço
                              </label>

                              <ImageUpload
                                imageUrl={imageUrl}
                                hasImage={hasImage}
                                file={service.file || null}
                                onFileChange={(file) => handleFileChange(originalIndex, file)}
                                onExpand={setExpandedImage}
                                label="Imagem do Serviço"
                                altText="Preview do serviço"
                                imageInfo={hasImage && !service.file
                                  ? "Imagem atual do servidor. Selecione um novo arquivo para substituir."
                                  : "Formatos suportados: JPG, PNG, WEBP. Use imagens de alta qualidade (1920x1080 recomendado)."}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Título do Serviço
                              </label>
                              <Input
                                type="text"
                                placeholder="Ex: Aquisição Cirúrgica"
                                value={service.title}
                                onChange={(e: any) => handleChange(originalIndex, "title", e.target.value)}
                                className="font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Ícone do Serviço
                              </label>
                              <IconSelector
                                value={service.icon}
                                onChange={(value) => handleChange(originalIndex, "icon", value)}
                                label="Ícone do Serviço"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Descrição do Serviço
                              </label>
                              <textarea
                                placeholder="Tráfego pago focado em ICPs (Perfis de Cliente Ideal). Ignoramos curiosos e atraímos decisores com Google e Meta Ads de alta intenção."
                                value={service.description}
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
                <ClientOnly>
                  <SortableContext
                    items={stableIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {serviceList.map((service, index) => {
                      const originalIndex = index;
                      const hasTitle = service.title.trim() !== "";
                      const hasDescription = service.description.trim() !== "";
                      const hasIcon = service.icon.trim() !== "";
                      const isLastInOriginalList = index === serviceList.length - 1;
                      const isLastAndEmpty = isLastInOriginalList && !hasTitle && !hasDescription && !hasIcon;

                      return (
                        <SortableServiceItem
                          key={stableIds[index]}
                          service={service}
                          index={index}
                          originalIndex={originalIndex}
                          isLastInOriginalList={isLastInOriginalList}
                          isLastAndEmpty={isLastAndEmpty}
                          showValidation={showValidation}
                          serviceList={serviceList}
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
        totalCount={serviceList.length}
        itemName="Serviço"
        icon={Settings}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateServices)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={serviceList.length}
        itemName="Serviço"
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