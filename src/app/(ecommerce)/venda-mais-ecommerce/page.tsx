/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback, useId, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useListManagement } from "@/hooks/useListManagement";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import { 
  TrendingUp, 
  GripVertical, 
  ArrowUpDown, 
  Bold, 
  DollarSign, 
  Target,
  AlertCircle,
  CheckCircle2,
  Trash2,
  XCircle,
  Search
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

interface CaseItem {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  file?: File | null;
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
  getImageUrl,
  setNewItemRef,
}: {
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
  getImageUrl: (item: CaseItem) => string;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
}) {
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
  const hasDescription = item.description.trim() !== "";
  const hasImage = Boolean(item.image?.trim() !== "" || item.file);

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
        isLastInOriginalList && showValidation && (!hasTitle || !hasDescription || !hasImage) 
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
                  {hasTitle ? (
                    <h4 className="font-medium text-[var(--color-secondary)]">
                      {item.title}
                    </h4>
                  ) : (
                    <h4 className="font-medium text-[var(--color-secondary)]/50">
                      Case sem título
                    </h4>
                  )}
                  {hasTitle && hasDescription && hasImage ? (
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
              onClick={() => openDeleteSingleModal(originalIndex, item.title)}
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
                  <Target className="w-4 h-4" />
                  Imagem do Case
                </label>

                <ImageUpload
                  label="Imagem de Destaque"
                  description="Formatos suportados: JPG, PNG, WEBP. Tamanho recomendado: 800x400px."
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
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                    Título do Case
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-[var(--color-success)]/10 text-white rounded">
                      <Bold className="w-3 h-3" />
                      Use **texto** para negrito
                    </span>
                  </label>
                  <Input
                    type="text"
                    value={item.title}
                    onChange={(e: any) => handleChange(originalIndex, "title", e.target.value)}
                    placeholder="Ex: Case 40k - R$40.000,00 de faturamento em 90 dias"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] text-lg font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Subtítulo/Resultado
                  </label>
                  <Input
                    type="text"
                    value={item.subtitle}
                    onChange={(e: any) => handleChange(originalIndex, "subtitle", e.target.value)}
                    placeholder="Ex: R$40.000,00 de faturamento em 90 dias"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Destaque o resultado principal do case de forma impactante
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <TextArea
                  label="Descrição Detalhada"
                  placeholder="Ex: Em apenas 90 dias, estruturamos uma operação que saltou para R$ 40.000,00 de faturamento e mais de 650 vendas. Escala real para quem busca resultados sólidos."
                  value={item.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    handleChange(originalIndex, "description", e.target.value)
                  }
                  rows={6}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
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

  const [localItems, setLocalItems] = useState<CaseItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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
    showValidation,
    deleteModal,
    currentPlanLimit,
    currentPlanType,
    openDeleteSingleModal,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
  } = useListManagement<CaseItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem,
    validationFields: ["title", "description", "image"]
  });

  // Sincroniza itens locais
  useEffect(() => {
    setLocalItems(itemList);
  }, [itemList]);

  const newCaseRef = useRef<HTMLDivElement>(null);

  const setNewItemRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      newCaseRef.current = node;
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
      const oldIndex = localItems.findIndex((item) => 
        item.id === active.id || item.id?.includes(active.id as string)
      );
      const newIndex = localItems.findIndex((item) => 
        item.id === over.id || item.id?.includes(over.id as string)
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(localItems, oldIndex, newIndex);
        setLocalItems(newList);
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
      const filteredList = localItems.filter(
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

      setLocalItems(normalized);
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
    const newList = [...localItems];
    newList[index] = { ...newList[index], [field]: value };
    setLocalItems(newList);
    setItemList(newList);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newList = [...localItems];
    newList[index] = { ...newList[index], file };
    setLocalItems(newList);
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

  const handleAddCase = () => {
    if (localItems.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: CaseItem = {
      title: '',
      subtitle: '',
      description: '',
      image: '',
      file: null
    };
    
    const updated = [...localItems, newItem];
    setLocalItems(updated);
    setItemList(updated);
    
    setTimeout(() => {
      newCaseRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const filteredItems = useMemo(() => {
    let filtered = [...localItems];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.subtitle.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [localItems, searchTerm]);

  const isItemsLimitReached = localItems.length >= currentPlanLimit;
  const canAddNewItemLocal = !isItemsLimitReached;
  const itemsCompleteCount = localItems.filter(item => 
    item.title.trim() !== '' && 
    item.description.trim() !== '' && 
    (item.image?.trim() !== '' || item.file)
  ).length;
  const itemsTotalCount = localItems.length;

  const itemsValidationError = isItemsLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Cada case tem 4 campos (título, subtítulo, descrição, imagem)
    total += localItems.length * 4;
    localItems.forEach(item => {
      if (item.title.trim()) completed++;
      if (item.subtitle.trim()) completed++;
      if (item.description.trim()) completed++;
      if (item.image?.trim() || item.file) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  const stableIds = useMemo(
    () => localItems.map((item, index) => item.id ?? `case-${index}`),
    [localItems]
  );

  return (
    <ManageLayout
      headerIcon={TrendingUp}
      title="Cases de Venda+"
      description="Gerencie os cases de sucesso que mostram resultados reais de vendas"
      exists={!!exists}
      itemName="Cases de Venda"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Cabeçalho de Controle */}
        <Card className="p-6 bg-[var(--color-background)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                Cases de Venda+
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span className="text-sm text-[var(--color-secondary)]/70">
                    {itemsCompleteCount} de {itemsTotalCount} completos
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
              Buscar Cases
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]/70" />
              <Input
                type="text"
                placeholder="Buscar cases por título, subtítulo ou descrição..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Mensagem de erro */}
        {itemsValidationError && (
          <div className={`p-3 rounded-lg ${isItemsLimitReached 
            ? 'bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30' 
            : 'bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30'}`}>
            <div className="flex items-start gap-2">
              {isItemsLimitReached ? (
                <XCircle className="w-5 h-5 text-[var(--color-danger)] flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${isItemsLimitReached 
                ? 'text-[var(--color-danger)]' 
                : 'text-[var(--color-warning)]'}`}>
                {itemsValidationError}
              </p>
            </div>
          </div>
        )}

        {/* Lista de Cases */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredItems.length === 0 ? (
              <Card className="p-8 bg-[var(--color-background)]">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                    Nenhum case encontrado
                  </h3>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    {searchTerm ? 'Tente ajustar sua busca ou limpe o filtro' : 'Adicione seu primeiro case usando o botão abaixo'}
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
                  {filteredItems.map((item, index) => {
                    const originalIndex = localItems.findIndex(i => i.id === item.id) || index;
                    const hasTitle = item.title.trim() !== "";
                    const hasDescription = item.description.trim() !== "";
                    const hasImage = Boolean(item.image?.trim() !== "" || item.file);
                    const isLastInOriginalList = originalIndex === localItems.length - 1;
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
                        itemList={localItems}
                        handleChange={handleChange}
                        handleFileChange={handleFileChange}
                        openDeleteSingleModal={openDeleteSingleModal}
                        getImageUrl={getImageUrl}
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
          onAddNew={handleAddCase}
          isAddDisabled={!canAddNewItemLocal}
          isSaving={loading}
          exists={!!exists}
          totalCount={completion.total}
          itemName="Case de Venda"
          icon={TrendingUp}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateItems)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={localItems.length}
        itemName="Case de Venda"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}