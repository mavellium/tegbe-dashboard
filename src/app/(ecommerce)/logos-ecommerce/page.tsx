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

interface LogoItem {
  id?: string;
  name: string;
  description: string;
  file?: File | null;
  image?: string;
  category?: string;
}

const ImagePreviewComponent = ({ imageUrl, alt = "Preview" }: { imageUrl: string, alt?: string }) => {
  const isBlobUrl = imageUrl.startsWith('blob:');
  
  if (isBlobUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className="h-32 w-32 object-contain rounded-lg border-2 border-zinc-300 dark:border-zinc-600 group-hover:border-blue-500 transition-all duration-200 bg-white p-2"
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
        className="h-32 w-32 object-contain rounded-lg border-2 border-zinc-300 dark:border-zinc-600 group-hover:border-blue-500 transition-all duration-200 bg-white p-2"
        onError={(e) => {
          console.error('Erro ao carregar imagem:', imageUrl);
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
};

interface SortableLogoItemProps {
  logo: LogoItem;
  index: number;
  originalIndex: number;
  isLastInOriginalList: boolean;
  isLastAndEmpty: boolean;
  showValidation: boolean;
  logoList: LogoItem[];
  handleChange: (index: number, field: keyof LogoItem, value: any) => void;
  handleFileChange: (index: number, file: File | null) => void;
  openDeleteSingleModal: (index: number, name: string) => void;
  setExpandedImage: (image: string | null) => void;
  getImageUrl: (logo: LogoItem) => string;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
}

function SortableLogoItem({
  logo,
  index,
  originalIndex,
  isLastInOriginalList,
  isLastAndEmpty,
  showValidation,
  logoList,
  handleChange,
  handleFileChange,
  openDeleteSingleModal,
  setExpandedImage,
  getImageUrl,
  setNewItemRef,
}: SortableLogoItemProps) {
  const stableId = useId();
  const sortableId = logo.id || `logo-${index}-${stableId}`;

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

  const hasName = logo.name.trim() !== "";
  const hasDescription = logo.description.trim() !== "";
  const hasCategory = logo.category?.trim() !== "";
  const hasImage = Boolean(logo.image?.trim() !== "" || logo.file);
  const imageUrl = getImageUrl(logo);

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
        isLastInOriginalList && showValidation && !hasName ? 'ring-2 ring-red-500' : ''
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
                  { label: 'Nome', hasValue: hasName },
                  { label: 'Descrição', hasValue: hasDescription },
                  { label: 'Categoria', hasValue: hasCategory },
                  { label: 'Logo', hasValue: hasImage }
                ]}
                showValidation={showValidation}
                isLast={isLastInOriginalList}
                onDelete={() => openDeleteSingleModal(originalIndex, logo.name)}
                showDelete={logoList.length > 1}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Logo
                </label>

                <ImageUpload
                  imageUrl={imageUrl}
                  hasImage={hasImage}
                  file={logo.file || null}
                  onFileChange={(file) => handleFileChange(originalIndex, file)}
                  onExpand={setExpandedImage}
                  label="Imagem do Logo"
                  altText="Preview do logo"
                  imageInfo={hasImage && !logo.file
                    ? "Logo atual do servidor. Selecione um novo arquivo para substituir."
                    : "Formatos suportados: PNG (transparente), SVG, JPG. Use arquivos de alta qualidade."}
                  customPreview={imageUrl ? <ImagePreviewComponent imageUrl={imageUrl} /> : undefined}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Nome da Empresa/Marca
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Google, Apple, Microsoft"
                  value={logo.name}
                  onChange={(e: any) => handleChange(originalIndex, "name", e.target.value)}
                  className="font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Categoria
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Tecnologia, Parceiros, Clientes"
                  value={logo.category || ""}
                  onChange={(e: any) => handleChange(originalIndex, "category", e.target.value)}
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Use para organizar os logos em grupos (opcional)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Descrição
                </label>
                <textarea
                  placeholder="Descrição sobre a empresa, parceria ou contexto do logo"
                  value={logo.description}
                  onChange={(e: any) => handleChange(originalIndex, "description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Use para descrever a relação com a empresa ou informações adicionais
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function LogosPage({ 
  type = "logos-ecommerce", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  const defaultLogo = useMemo(() => ({ 
    name: "", 
    description: "",
    category: "",
    file: null, 
    image: "" 
  }), []);

  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const apiBase = `/api/${subtype}/form`;

  const {
    list: logoList,
    setList: setLogoList,
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
    filteredItems: filteredLogos,
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
  } = useListManagement<LogoItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem: defaultLogo,
    validationFields: ["name", "description"]
  });

  const remainingSlots = Math.max(0, currentPlanLimit - logoList.length);

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
      const oldIndex = logoList.findIndex((item) => 
        item.id === active.id || item.id?.includes(active.id as string)
      );
      const newIndex = logoList.findIndex((item) => 
        item.id === over.id || item.id?.includes(over.id as string)
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(logoList, oldIndex, newIndex);
        setLogoList(newList);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const filteredList = logoList.filter(
        logo => logo.name.trim() && logo.description.trim()
      );

      if (!filteredList.length) {
        setErrorMsg("Adicione ao menos um logo completo.");
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

      filteredList.forEach((logo, i) => {
        if (logo.file) {
          fd.append(`file${i}`, logo.file);
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
        id: v.id || `logo-${Date.now()}-${i}`,
        file: null,
      }));

      setLogoList(normalized);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof LogoItem, value: any) => {
    const newList = [...logoList];
    newList[index] = { ...newList[index], [field]: value };
    setLogoList(newList);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newList = [...logoList];
    newList[index] = { ...newList[index], file };
    setLogoList(newList);
  };

  const getImageUrl = (logo: LogoItem): string => {
    if (logo.file) {
      return URL.createObjectURL(logo.file);
    }
    if (logo.image) {
      if (logo.image.startsWith('http') || logo.image.startsWith('//')) {
        return logo.image;
      } else {
        return `https://mavellium.com.br${logo.image.startsWith('/') ? '' : '/'}${logo.image}`;
      }
    }
    return "";
  };

  const updateLogos = async (list: LogoItem[]) => {
    if (!exists) return;

    const filteredList = list.filter(
      logo => logo.name.trim() || logo.description.trim() || logo.category?.trim() || logo.file || logo.image
    );

    const fd = new FormData();
    
    fd.append("id", exists.id);
    
    filteredList.forEach((logo, i) => {
      fd.append(`values[${i}][name]`, logo.name);
      fd.append(`values[${i}][description]`, logo.description);
      fd.append(`values[${i}][category]`, logo.category || "");
      fd.append(`values[${i}][image]`, logo.image || "");
      
      if (logo.file) {
        fd.append(`file${i}`, logo.file);
      }
      
      if (logo.id) {
        fd.append(`values[${i}][id]`, logo.id);
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
    () => logoList.map((item, index) => item.id ?? `logo-${index}`),
    [logoList]
  );

  return (
    <ManageLayout
      headerIcon={ImageIcon}
      title="Logos"
      description="Gerencie os logos de parceiros, clientes e marcas associadas"
      exists={!!exists}
      itemName="Logo"
    >
      <div className="mb-6 space-y-4">
        <SearchSortBar
          search={search}
          setSearch={setSearch}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onClearFilters={clearFilters}
          searchPlaceholder="Buscar logos por nome ou categoria..."
          total={logoList.length}
          showing={filteredLogos.length}
          searchActiveText="ⓘ Busca ativa - não é possível adicionar novo logo"
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
              filteredLogos.map((logo: any) => {
                const originalIndex = logoList.findIndex(l => l.id === logo.id);
                const hasName = logo.name.trim() !== "";
                const hasDescription = logo.description.trim() !== "";
                const hasCategory = logo.category?.trim() !== "";
                const hasImage = Boolean(logo.image?.trim() !== "" || logo.file);
                const isLastInOriginalList = originalIndex === logoList.length - 1;
                const isLastAndEmpty = isLastInOriginalList && !hasName && !hasDescription && !hasCategory;
                const imageUrl = getImageUrl(logo);

                return (
                  <div
                    key={logo.id || `logo-${originalIndex}`}
                    ref={isLastAndEmpty ? setNewItemRef : null}
                  >
                    <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
                      isLastInOriginalList && showValidation && !hasName ? 'ring-2 ring-red-500' : ''
                    }`}>
                      <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
                        <ItemHeader
                          index={originalIndex}
                          fields={[
                            { label: 'Nome', hasValue: hasName },
                            { label: 'Descrição', hasValue: hasDescription },
                            { label: 'Categoria', hasValue: hasCategory },
                            { label: 'Logo', hasValue: hasImage }
                          ]}
                          showValidation={showValidation}
                          isLast={isLastInOriginalList}
                          onDelete={() => openDeleteSingleModal(originalIndex, logo.name)}
                          showDelete={logoList.length > 1}
                        />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Logo
                              </label>

                              <ImageUpload
                                imageUrl={imageUrl}
                                hasImage={hasImage}
                                file={logo.file || null}
                                onFileChange={(file) => handleFileChange(originalIndex, file)}
                                onExpand={setExpandedImage}
                                label="Imagem do Logo"
                                altText="Preview do logo"
                                imageInfo={hasImage && !logo.file
                                  ? "Logo atual do servidor. Selecione um novo arquivo para substituir."
                                  : "Formatos suportados: PNG (transparente), SVG, JPG. Use arquivos de alta qualidade."}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Nome da Empresa/Marca
                              </label>
                              <Input
                                type="text"
                                placeholder="Ex: Google, Apple, Microsoft"
                                value={logo.name}
                                onChange={(e: any) => handleChange(originalIndex, "name", e.target.value)}
                                className="font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Categoria
                              </label>
                              <Input
                                type="text"
                                placeholder="Ex: Tecnologia, Parceiros, Clientes"
                                value={logo.category || ""}
                                onChange={(e: any) => handleChange(originalIndex, "category", e.target.value)}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Descrição
                              </label>
                              <textarea
                                placeholder="Descrição sobre a empresa, parceria ou contexto do logo"
                                value={logo.description}
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
                    {logoList.map((logo, index) => {
                      const originalIndex = index;
                      const hasName = logo.name.trim() !== "";
                      const hasDescription = logo.description.trim() !== "";
                      const hasCategory = logo.category?.trim() !== "";
                      const isLastInOriginalList = index === logoList.length - 1;
                      const isLastAndEmpty = isLastInOriginalList && !hasName && !hasDescription && !hasCategory;

                      return (
                        <SortableLogoItem
                          key={stableIds[index]}
                          logo={logo}
                          index={index}
                          originalIndex={originalIndex}
                          isLastInOriginalList={isLastInOriginalList}
                          isLastAndEmpty={isLastAndEmpty}
                          showValidation={showValidation}
                          logoList={logoList}
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
        totalCount={logoList.length}
        itemName="Logo"
        icon={ImageIcon}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateLogos)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={logoList.length}
        itemName="Logo"
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
                  alt="Logo expandido"
                  className="max-w-full max-h-[80vh] object-contain rounded-2xl bg-white p-8"
                  onError={(e) => {
                    console.error('Erro ao carregar logo expandido:', expandedImage);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <Image
                  src={expandedImage}
                  alt="Logo expandido"
                  width={800}
                  height={600}
                  className="max-w-full max-h-[80vh] object-contain rounded-2xl bg-white p-8"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ManageLayout>
  );
}