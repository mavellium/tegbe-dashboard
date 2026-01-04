// app/casos-sucesso/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListManagement } from "@/hooks/useListManagement";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Tag, X, GripVertical, ArrowUpDown, Users, Trophy, Hash } from "lucide-react";
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

interface ClienteItem {
  id?: string;
  logo: string;
  name: string;
  description: string;
  result: string;
  tags: string[];
  file?: File | null;
}

const ImagePreviewComponent = ({ imageUrl, alt = "Preview" }: { imageUrl: string; alt?: string }) => {
  const isBlobUrl = imageUrl.startsWith('blob:');
  
  if (isBlobUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className="h-32 w-32 object-contain rounded-xl border-2 border-zinc-300 dark:border-zinc-600 group-hover:border-blue-500 transition-all duration-200 bg-white p-2"
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
        className="h-32 w-32 object-contain rounded-xl border-2 border-zinc-300 dark:border-zinc-600 group-hover:border-blue-500 transition-all duration-200 bg-white p-2"
        onError={(e) => {
          console.error('Erro ao carregar imagem:', imageUrl);
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
};

interface SortableClienteItemProps {
  cliente: ClienteItem;
  index: number;
  originalIndex: number;
  isLastInOriginalList: boolean;
  isLastAndEmpty: boolean;
  showValidation: boolean;
  clienteList: ClienteItem[];
  handleChange: (index: number, field: keyof ClienteItem, value: any) => void;
  handleFileChange: (index: number, file: File | null) => void;
  openDeleteSingleModal: (index: number, title: string) => void;
  setExpandedImage: (image: string | null) => void;
  getImageUrl: (cliente: ClienteItem) => string;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
}

function SortableClienteItem({
  cliente,
  index,
  originalIndex,
  isLastInOriginalList,
  isLastAndEmpty,
  showValidation,
  clienteList,
  handleChange,
  handleFileChange,
  openDeleteSingleModal,
  setExpandedImage,
  getImageUrl,
  setNewItemRef,
}: SortableClienteItemProps) {
  const stableId = useId();
  const sortableId = cliente.id || `cliente-${index}-${stableId}`;

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

  const hasName = cliente.name.trim() !== "";
  const hasDescription = cliente.description.trim() !== "";
  const hasResult = cliente.result.trim() !== "";
  const hasTags = cliente.tags.length > 0 && cliente.tags.some(tag => tag.trim() !== "");
  const hasLogo = Boolean(cliente.logo?.trim() !== "" || cliente.file);
  const imageUrl = getImageUrl(cliente);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      
      if (isLastAndEmpty && setNewItemRef) {
        setNewItemRef(node);
      }
    },
    [setNodeRef, isLastAndEmpty, setNewItemRef]
  );

  const handleTagsChange = (tagsString: string) => {
    // Converte string separada por vírgulas em array
    const tagsArray = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== "");
    
    handleChange(originalIndex, "tags", tagsArray);
  };

  const tagsString = cliente.tags.join(', ');

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
                  { label: 'Resultado', hasValue: hasResult },
                  { label: 'Tags', hasValue: hasTags },
                  { label: 'Logo', hasValue: hasLogo }
                ]}
                showValidation={showValidation}
                isLast={isLastInOriginalList}
                onDelete={() => openDeleteSingleModal(originalIndex, cliente.name)}
                showDelete={clienteList.length > 1}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Logo da Empresa
                </label>

                <ImageUpload
                  imageUrl={imageUrl}
                  hasImage={hasLogo}
                  file={cliente.file || null}
                  onFileChange={(file) => handleFileChange(originalIndex, file)}
                  onExpand={setExpandedImage}
                  label="Logo do cliente"
                  altText="Logo da empresa"
                  imageInfo={hasLogo && !cliente.file
                    ? "Logo atual do servidor. Selecione um novo arquivo para substituir."
                    : "Formatos suportados: JPG, PNG, WEBP. Tamanho ideal: 128x128px."}
                  customPreview={imageUrl ? <ImagePreviewComponent imageUrl={imageUrl} /> : undefined}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Resultado Alcançado
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Aumento de 30% nas Vendas"
                  value={cliente.result}
                  onChange={(e: any) => handleChange(originalIndex, "result", e.target.value)}
                  className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Tags (separadas por vírgula)
                </label>
                <Input
                  type="text"
                  placeholder="Ex: E-commerce, Gestão, Marketing Digital"
                  value={tagsString}
                  onChange={(e: any) => handleTagsChange(e.target.value)}
                />
                
                {cliente.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {cliente.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        <Hash className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Título
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Decora Fest"
                  value={cliente.name}
                  onChange={(e: any) => handleChange(originalIndex, "name", e.target.value)}
                  className="font-medium text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Descrição/Ramo
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Loja de Decorações • Garça/SP"
                  value={cliente.description}
                  onChange={(e: any) => handleChange(originalIndex, "description", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function CasosSucessoPage({ 
  type = "casos-sucesso", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  const defaultCliente = useMemo(() => ({ 
    logo: "", 
    name: "", 
    description: "", 
    result: "", 
    tags: [],
    file: null
  }), []);

  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const apiBase = `/api/${subtype}/form`;

  const {
    list: clienteList,
    setList: setClienteList,
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
    filteredItems: filteredClientes,
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
  } = useListManagement<ClienteItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem: defaultCliente,
    validationFields: ["name", "description", "result"]
  });

  const remainingSlots = Math.max(0, currentPlanLimit - clienteList.length);

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
      const oldIndex = clienteList.findIndex((item) => 
        item.id === active.id || item.id?.includes(active.id as string)
      );
      const newIndex = clienteList.findIndex((item) => 
        item.id === over.id || item.id?.includes(over.id as string)
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(clienteList, oldIndex, newIndex);
        setClienteList(newList);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const filteredList = clienteList.filter(
        c => c.name.trim() && c.description.trim() && c.result.trim()
      );

      if (!filteredList.length) {
        setErrorMsg("Adicione ao menos um caso de sucesso completo.");
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

      filteredList.forEach((c, i) => {
        if (c.file) {
          fd.append(`file${i}`, c.file);
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
        id: v.id || `cliente-${Date.now()}-${i}`,
        file: null,
        tags: v.tags || []
      }));

      setClienteList(normalized);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof ClienteItem, value: any) => {
    const newList = [...clienteList];
    newList[index] = { ...newList[index], [field]: value };
    setClienteList(newList);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newList = [...clienteList];
    newList[index] = { ...newList[index], file };
    setClienteList(newList);
  };

  const getImageUrl = (cliente: ClienteItem): string => {
    if (cliente.file) {
      return URL.createObjectURL(cliente.file);
    }
    if (cliente.logo) {
      if (cliente.logo.startsWith('http') || cliente.logo.startsWith('//')) {
        return cliente.logo;
      } else {
        return `https://mavellium.com.br${cliente.logo.startsWith('/') ? '' : '/'}${cliente.logo}`;
      }
    }
    return "";
  };

  const updateClientes = async (list: ClienteItem[]) => {
    if (!exists) return;

    const filteredList = list.filter(
      c => c.name.trim() || c.description.trim() || c.result.trim() || c.file || c.logo
    );

    const fd = new FormData();
    
    fd.append("id", exists.id);
    
    filteredList.forEach((c, i) => {
      fd.append(`values[${i}][logo]`, c.logo || "");
      fd.append(`values[${i}][name]`, c.name);
      fd.append(`values[${i}][description]`, c.description);
      fd.append(`values[${i}][result]`, c.result);
      fd.append(`values[${i}][tags]`, JSON.stringify(c.tags || []));
      
      if (c.file) {
        fd.append(`file${i}`, c.file);
      }
      
      if (c.id) {
        fd.append(`values[${i}][id]`, c.id);
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
    () => clienteList.map((item, index) => item.id ?? `cliente-${index}`),
    [clienteList]
  );

  return (
    <ManageLayout
      headerIcon={Users}
      title="Casos de Sucesso"
      description="Gerencie as notícias"
      exists={!!exists}
      itemName="Notícias"
    >
      <div className="mb-6 space-y-4">
        <SearchSortBar
          search={search}
          setSearch={setSearch}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onClearFilters={clearFilters}
          searchPlaceholder="Buscar clientes por nome, resultado ou tags..."
          total={clienteList.length}
          showing={filteredClientes.length}
          searchActiveText="ⓘ Busca ativa - não é possível adicionar novo cliente"
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
              filteredClientes.map((cliente: any) => {
                const originalIndex = clienteList.findIndex(c => c.id === cliente.id);
                const hasName = cliente.name.trim() !== "";
                const hasDescription = cliente.description.trim() !== "";
                const hasResult = cliente.result.trim() !== "";
                const hasTags = cliente.tags && cliente.tags.length > 0;
                const hasLogo = Boolean(cliente.logo?.trim() !== "" || cliente.file);
                const isLastInOriginalList = originalIndex === clienteList.length - 1;
                const isLastAndEmpty = isLastInOriginalList && !hasName && !hasDescription && !hasResult;
                const imageUrl = getImageUrl(cliente);

                return (
                  <div
                    key={cliente.id || `cliente-${originalIndex}`}
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
                            { label: 'Resultado', hasValue: hasResult },
                            { label: 'Tags', hasValue: hasTags },
                            { label: 'Logo', hasValue: hasLogo }
                          ]}
                          showValidation={showValidation}
                          isLast={isLastInOriginalList}
                          onDelete={() => openDeleteSingleModal(originalIndex, cliente.name)}
                          showDelete={clienteList.length > 1}
                        />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Logo da Empresa
                              </label>

                              <ImageUpload
                                imageUrl={imageUrl}
                                hasImage={hasLogo}
                                file={cliente.file || null}
                                onFileChange={(file) => handleFileChange(originalIndex, file)}
                                onExpand={setExpandedImage}
                                label="Logo do cliente"
                                altText="Logo da empresa"
                                imageInfo={hasLogo && !cliente.file
                                  ? "Logo atual do servidor. Selecione um novo arquivo para substituir."
                                  : "Formatos suportados: JPG, PNG, WEBP. Tamanho ideal: 128x128px."}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Resultado Alcançado
                              </label>
                              <div className="flex items-center gap-2 mb-2">
                                <Trophy className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                  Métrica de sucesso
                                </span>
                              </div>
                              <Input
                                type="text"
                                placeholder="Ex: Aumento de 30% nas Vendas"
                                value={cliente.result}
                                onChange={(e: any) => handleChange(originalIndex, "result", e.target.value)}
                                className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Tags (separadas por vírgula)
                              </label>
                              <div className="flex items-center gap-2 mb-2">
                                <Tag className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                  Categorias do cliente
                                </span>
                              </div>
                              <Input
                                type="text"
                                placeholder="Ex: E-commerce, Gestão, Marketing Digital"
                                value={Array.isArray(cliente.tags) ? cliente.tags.join(', ') : cliente.tags}
                                onChange={(e: any) => {
                                  const tagsArray = e.target.value
                                    .split(',')
                                    .map((tag: string) => tag.trim())
                                    .filter((tag: string) => tag !== "");
                                  handleChange(originalIndex, "tags", tagsArray);
                                }}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Nome da Empresa
                              </label>
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-zinc-500" />
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                  Nome completo
                                </span>
                              </div>
                              <Input
                                type="text"
                                placeholder="Ex: Decora Fest"
                                value={cliente.name}
                                onChange={(e: any) => handleChange(originalIndex, "name", e.target.value)}
                                className="font-medium text-lg"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Descrição/Ramo
                              </label>
                              <Input
                                type="text"
                                placeholder="Ex: Loja de Decorações • Garça/SP"
                                value={cliente.description}
                                onChange={(e: any) => handleChange(originalIndex, "description", e.target.value)}
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
                    {clienteList.map((cliente, index) => {
                      const originalIndex = index;
                      const hasName = cliente.name.trim() !== "";
                      const hasDescription = cliente.description.trim() !== "";
                      const hasResult = cliente.result.trim() !== "";
                      const isLastInOriginalList = index === clienteList.length - 1;
                      const isLastAndEmpty = isLastInOriginalList && !hasName && !hasDescription && !hasResult;

                      return (
                        <SortableClienteItem
                          key={stableIds[index]}
                          cliente={cliente}
                          index={index}
                          originalIndex={originalIndex}
                          isLastInOriginalList={isLastInOriginalList}
                          isLastAndEmpty={isLastAndEmpty}
                          showValidation={showValidation}
                          clienteList={clienteList}
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
        totalCount={clienteList.length}
        itemName="Cliente"
        icon={Users}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateClientes)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={clienteList.length}
        itemName="Cliente"
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
                  className="max-w-full max-h-[80vh] object-contain rounded-2xl bg-white p-8"
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