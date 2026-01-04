/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListManagement } from "@/hooks/useListManagement";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { MapPin, X, GripVertical, ArrowUpDown, Image as ImageIcon } from "lucide-react";
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

interface LocationItem {
  id?: string;
  title: string;
  description: string;
  alt: string;
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
        className="h-48 w-full object-cover rounded-xl border-2 border-zinc-300 dark:border-zinc-600 group-hover:border-blue-500 transition-all duration-200"
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
        className="h-48 w-full object-cover rounded-xl border-2 border-zinc-300 dark:border-zinc-600 group-hover:border-blue-500 transition-all duration-200"
        onError={(e) => {
          console.error('Erro ao carregar imagem:', imageUrl);
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
};

interface SortableLocationItemProps {
  locationItem: LocationItem;
  index: number;
  originalIndex: number;
  isLastInOriginalList: boolean;
  isLastAndEmpty: boolean;
  showValidation: boolean;
  locationList: LocationItem[];
  handleChange: (index: number, field: keyof LocationItem, value: any) => void;
  handleFileChange: (index: number, file: File | null) => void;
  openDeleteSingleModal: (index: number, title: string) => void;
  setExpandedImage: (image: string | null) => void;
  getImageUrl: (locationItem: LocationItem) => string;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
}

function SortableLocationItem({
  locationItem,
  index,
  originalIndex,
  isLastInOriginalList,
  isLastAndEmpty,
  showValidation,
  locationList,
  handleChange,
  handleFileChange,
  openDeleteSingleModal,
  setExpandedImage,
  getImageUrl,
  setNewItemRef,
}: SortableLocationItemProps) {
  const stableId = useId();
  const sortableId = locationItem.id || `location-${index}-${stableId}`;

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

  const hasTitle = locationItem.title.trim() !== "";
  const hasDescription = locationItem.description.trim() !== "";
  const hasAlt = locationItem.alt.trim() !== "";
  const hasImage = Boolean(locationItem.image?.trim() !== "" || locationItem.file);
  const imageUrl = getImageUrl(locationItem);

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
        isLastInOriginalList && showValidation && !hasTitle ? 'ring-2 ring-red-500' : ''
      } ${isDragging ? 'shadow-lg scale-105' : ''} border-blue-500`}>
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
                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{locationItem.title || "Localização"}</span>
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
                  { label: 'Texto Alt', hasValue: hasAlt },
                  { label: 'Imagem', hasValue: hasImage }
                ]}
                showValidation={showValidation}
                isLast={isLastInOriginalList}
                onDelete={() => openDeleteSingleModal(originalIndex, locationItem.title)}
                showDelete={locationList.length > 1}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna 1: Imagem */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Imagem do Local
                </label>

                <ImageUpload
                  imageUrl={imageUrl}
                  hasImage={hasImage}
                  file={locationItem.file || null}
                  onFileChange={(file) => handleFileChange(originalIndex, file)}
                  onExpand={setExpandedImage}
                  label="Imagem da Localização"
                  altText="Preview da localização"
                  imageInfo={hasImage && !locationItem.file
                    ? "Imagem atual do servidor. Selecione um novo arquivo para substituir."
                    : "Formatos suportados: JPG, PNG, WEBP. Tamanho recomendado: 800x400px."}
                  customPreview={imageUrl ? (
                    <div className="relative">
                      <ImagePreviewComponent imageUrl={imageUrl} alt={locationItem.alt || locationItem.title} />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-xl">
                        <div className="text-white text-sm font-medium truncate">
                          {locationItem.title || "Local sem título"}
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
                    Título do Local
                  </label>
                  <Input
                    type="text"
                    value={locationItem.title}
                    onChange={(e: any) => handleChange(originalIndex, "title", e.target.value)}
                    placeholder="Ex: Sede Principal, Escritório Centro, Filial Zona Sul"
                    className="text-lg font-semibold border-blue-200 dark:border-blue-800 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Descrição do Local
                  </label>
                  <textarea
                    value={locationItem.description}
                    onChange={(e: any) => handleChange(originalIndex, "description", e.target.value)}
                    rows={2}
                    placeholder="Descreva o local, endereço, características ou informações relevantes."
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Texto Alternativo (Alt)
                  </label>
                  <Input
                    type="text"
                    value={locationItem.alt}
                    onChange={(e: any) => handleChange(originalIndex, "alt", e.target.value)}
                    placeholder="Ex: Fotografia do nosso escritório principal com vista para o parque"
                    className="border-blue-200 dark:border-blue-800 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Texto descritivo para acessibilidade (leitura por screen readers)
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

export default function LocationPage({ 
  type = "localizacao", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  const defaultLocationItem = useMemo(() => ({ 
    title: "", 
    description: "",
    alt: "",
    image: "",
    file: null, 
  }), []);

  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const apiBase = `/api/${subtype}/form`;

  const {
    list: locationList,
    setList: setLocationList,
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
    filteredItems: filteredLocations,
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
  } = useListManagement<LocationItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem: defaultLocationItem,
    validationFields: ["title", "description", "alt", "image"]
  });

  const remainingSlots = Math.max(0, currentPlanLimit - locationList.length);

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
      const oldIndex = locationList.findIndex((item) => 
        item.id === active.id || item.id?.includes(active.id as string)
      );
      const newIndex = locationList.findIndex((item) => 
        item.id === over.id || item.id?.includes(over.id as string)
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(locationList, oldIndex, newIndex);
        setLocationList(newList);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const filteredList = locationList.filter(
        item => item.title.trim() && item.description.trim() && item.alt.trim() && (item.image?.trim() || item.file)
      );

      if (!filteredList.length) {
        setErrorMsg("Adicione ao menos uma localização completa com título, descrição, alt e imagem.");
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
        throw new Error(err.error || "Erro ao salvar localizações");
      }

      const saved = await res.json();

      const normalized = saved.values.map((v: any, i: number) => ({
        ...v,
        id: v.id || `location-${Date.now()}-${i}`,
        file: null,
      }));

      setLocationList(normalized);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof LocationItem, value: any) => {
    const newList = [...locationList];
    newList[index] = { ...newList[index], [field]: value };
    setLocationList(newList);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newList = [...locationList];
    newList[index] = { ...newList[index], file };
    setLocationList(newList);
  };

  const getImageUrl = (item: LocationItem): string => {
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

  const updateLocations = async (list: LocationItem[]) => {
    if (!exists) return;

    const filteredList = list.filter(
      item => item.title.trim() || item.description.trim() || item.alt.trim() || item.file || item.image
    );

    const fd = new FormData();
    
    fd.append("id", exists.id);
    
    filteredList.forEach((item, i) => {
      fd.append(`values[${i}][title]`, item.title || "");
      fd.append(`values[${i}][description]`, item.description || "");
      fd.append(`values[${i}][alt]`, item.alt || "");
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
    () => locationList.map((item, index) => item.id ?? `location-${index}`),
    [locationList]
  );

  // Dados iniciais baseados no JSON fornecido
  const initialData = useMemo(() => [
    {
      id: "1",
      title: "Sede Principal",
      description: "Nosso escritório principal com vista para o centro da cidade.",
      alt: "Fotografia da sede principal da empresa com arquitetura moderna",
      image: "/images/office-1.jpg"
    },
    {
      id: "2",
      title: "Escritório Centro",
      description: "Localizado no coração financeiro da cidade, próximo a transportes.",
      alt: "Interior do escritório no centro com estações de trabalho modernas",
      image: "/images/office-2.jpg"
    },
    {
      id: "3",
      title: "Filial Zona Sul",
      description: "Ambiente tranquilo e inspirador para reuniões criativas.",
      alt: "Vista externa da filial na zona sul com jardim bem cuidado",
      image: "/images/office-3.jpg"
    }
  ], []);

  return (
    <ManageLayout
      headerIcon={MapPin}
      title="Localização"
      description="Gerencie as imagens e informações das localizações da empresa"
      exists={!!exists}
      itemName="Localização"
    >
      <div className="mb-6 space-y-4">
        <SearchSortBar
          search={search}
          setSearch={setSearch}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onClearFilters={clearFilters}
          searchPlaceholder="Buscar localizações por título ou descrição..."
          total={locationList.length}
          showing={filteredLocations.length}
          searchActiveText="ⓘ Busca ativa - não é possível adicionar nova localização"
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
              filteredLocations.map((item: any) => {
                const originalIndex = locationList.findIndex(l => l.id === item.id);
                const hasTitle = item.title.trim() !== "";
                const hasDescription = item.description.trim() !== "";
                const hasAlt = item.alt.trim() !== "";
                const hasImage = Boolean(item.image?.trim() !== "" || item.file);
                const isLastInOriginalList = originalIndex === locationList.length - 1;
                const isLastAndEmpty = isLastInOriginalList && !hasTitle && !hasDescription && !hasAlt;
                const imageUrl = getImageUrl(item);

                return (
                  <div
                    key={item.id || `location-${originalIndex}`}
                    ref={isLastAndEmpty ? setNewItemRef : null}
                  >
                    <Card className={`mb-6 overflow-hidden transition-all duration-300 ${
                      isLastInOriginalList && showValidation && (!hasTitle || !hasDescription || !hasAlt || !hasImage) ? 'ring-2 ring-red-500' : ''
                    } border-blue-500`}>
                      <div className="p-6 bg-white dark:bg-zinc-900">
                        <ItemHeader
                          index={originalIndex}
                          fields={[
                            { label: 'Título', hasValue: hasTitle },
                            { label: 'Descrição', hasValue: hasDescription },
                            { label: 'Texto Alt', hasValue: hasAlt },
                            { label: 'Imagem', hasValue: hasImage }
                          ]}
                          showValidation={showValidation}
                          isLast={isLastInOriginalList}
                          onDelete={() => openDeleteSingleModal(originalIndex, item.title)}
                          showDelete={locationList.length > 1}
                        />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Imagem do Local
                              </label>

                              <ImageUpload
                                imageUrl={imageUrl}
                                hasImage={hasImage}
                                file={item.file || null}
                                onFileChange={(file) => handleFileChange(originalIndex, file)}
                                onExpand={setExpandedImage}
                                label="Imagem da Localização"
                                altText="Preview da localização"
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
                                  Título do Local
                                </label>
                                <Input
                                  type="text"
                                  value={item.title}
                                  onChange={(e: any) => handleChange(originalIndex, "title", e.target.value)}
                                  placeholder="Ex: Sede Principal, Escritório Centro, Filial Zona Sul"
                                  className="text-lg font-semibold border-blue-200 dark:border-blue-800 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                  Descrição do Local
                                </label>
                                <textarea
                                  value={item.description}
                                  onChange={(e: any) => handleChange(originalIndex, "description", e.target.value)}
                                  rows={2}
                                  placeholder="Descreva o local, endereço, características ou informações relevantes."
                                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                  Texto Alternativo (Alt)
                                </label>
                                <Input
                                  type="text"
                                  value={item.alt}
                                  onChange={(e: any) => handleChange(originalIndex, "alt", e.target.value)}
                                  placeholder="Ex: Fotografia do nosso escritório principal com vista para o parque"
                                  className="border-blue-200 dark:border-blue-800 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>

                            <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Preview do Card</h4>
                              <div className="flex items-start gap-4">
                                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-600">
                                  {imageUrl ? (
                                    <img 
                                      src={imageUrl} 
                                      alt={item.alt || item.title} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                                      <ImageIcon className="w-6 h-6 text-zinc-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {item.title || "Título do Local"}
                                  </h3>
                                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                    {item.description || "Descrição do local aparecerá aqui."}
                                  </p>
                                  <p className="text-xs text-zinc-500 mt-2">
                                    Alt: {item.alt || "Texto alternativo da imagem"}
                                  </p>
                                </div>
                              </div>
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
                    {locationList.map((item, index) => {
                      const originalIndex = index;
                      const hasTitle = item.title.trim() !== "";
                      const hasDescription = item.description.trim() !== "";
                      const hasAlt = item.alt.trim() !== "";
                      const hasImage = Boolean(item.image?.trim() !== "" || item.file);
                      const isLastInOriginalList = index === locationList.length - 1;
                      const isLastAndEmpty = isLastInOriginalList && !hasTitle && !hasDescription && !hasAlt && !hasImage;

                      return (
                        <SortableLocationItem
                          key={stableIds[index]}
                          locationItem={item}
                          index={index}
                          originalIndex={originalIndex}
                          isLastInOriginalList={isLastInOriginalList}
                          isLastAndEmpty={isLastAndEmpty}
                          showValidation={showValidation}
                          locationList={locationList}
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
        totalCount={locationList.length}
        itemName="Localização"
        icon={MapPin}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateLocations)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={locationList.length}
        itemName="Localização"
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