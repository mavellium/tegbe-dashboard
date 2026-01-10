/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback, useId, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListManagement } from "@/hooks/useListManagement";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import { 
  Image as ImageIcon, 
  X, 
  GripVertical, 
  ArrowUpDown, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Trash2,
  XCircle,
  Search,
  Target
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

interface LogoItem {
  id?: string;
  name: string;
  description: string;
  file?: File | null;
  image?: string;
  category?: string;
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
  getImageUrl,
  setNewItemRef,
}: {
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
  getImageUrl: (logo: LogoItem) => string;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
}) {
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
        isLastInOriginalList && showValidation && !hasName ? 'ring-2 ring-[var(--color-danger)]' : ''
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
                  {hasName ? (
                    <h4 className="font-medium text-[var(--color-secondary)]">
                      {logo.name}
                    </h4>
                  ) : (
                    <h4 className="font-medium text-[var(--color-secondary)]/50">
                      Logo sem nome
                    </h4>
                  )}
                  {hasName && hasDescription && hasImage ? (
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
              onClick={() => openDeleteSingleModal(originalIndex, logo.name)}
              variant="danger"
              className="whitespace-nowrap bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 border-none flex items-center gap-2"
              disabled={logoList.length <= 1}
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
                  Imagem do Logo
                </label>
                <ImageUpload
                  label="Imagem do Logo"
                  description="Formatos suportados: PNG (transparente), SVG, JPG. Use arquivos de alta qualidade."
                  currentImage={logo.image || ""}
                  selectedFile={logo.file || null}
                  onFileChange={(file) => handleFileChange(originalIndex, file)}
                  aspectRatio="aspect-square"
                  previewWidth={200}
                  previewHeight={200}
                />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Nome da Empresa/Marca
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Google, Apple, Microsoft"
                  value={logo.name}
                  onChange={(e: any) => handleChange(originalIndex, "name", e.target.value)}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Categoria
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Tecnologia, Parceiros, Clientes"
                  value={logo.category || ""}
                  onChange={(e: any) => handleChange(originalIndex, "category", e.target.value)}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                  Use para organizar os logos em grupos (opcional)
                </p>
              </div>

              <div className="space-y-2">
                <TextArea
                  label="Descrição"
                  placeholder="Descrição sobre a empresa, parceria ou contexto do logo"
                  value={logo.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    handleChange(originalIndex, "description", e.target.value)
                  }
                  rows={3}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
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

  const [localLogos, setLocalLogos] = useState<LogoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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
    showValidation,
    deleteModal,
    currentPlanLimit,
    currentPlanType,
    openDeleteSingleModal,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
  } = useListManagement<LogoItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem: defaultLogo,
    validationFields: ["name", "description", "image"]
  });

  // Sincroniza logos locais
  useEffect(() => {
    setLocalLogos(logoList);
  }, [logoList]);

  const newLogoRef = useRef<HTMLDivElement>(null);

  const setNewItemRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      newLogoRef.current = node;
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
      const oldIndex = localLogos.findIndex((item) => 
        item.id === active.id || item.id?.includes(active.id as string)
      );
      const newIndex = localLogos.findIndex((item) => 
        item.id === over.id || item.id?.includes(over.id as string)
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(localLogos, oldIndex, newIndex);
        setLocalLogos(newList);
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
      const filteredList = localLogos.filter(
        logo => logo.name.trim() && logo.description.trim() && (logo.image?.trim() || logo.file)
      );

      if (!filteredList.length) {
        setErrorMsg("Adicione ao menos um logo completo com nome, descrição e imagem.");
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
        throw new Error(err.error || "Erro ao salvar logos");
      }

      const saved = await res.json();

      const normalized = saved.values.map((v: any, i: number) => ({
        ...v,
        id: v.id || `logo-${Date.now()}-${i}`,
        file: null,
      }));

      setLocalLogos(normalized);
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
    const newList = [...localLogos];
    newList[index] = { ...newList[index], [field]: value };
    setLocalLogos(newList);
    setLogoList(newList);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newList = [...localLogos];
    newList[index] = { ...newList[index], file };
    setLocalLogos(newList);
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

  const handleAddLogo = () => {
    if (localLogos.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: LogoItem = {
      name: '',
      description: '',
      category: '',
      file: null,
      image: ''
    };
    
    const updated = [...localLogos, newItem];
    setLocalLogos(updated);
    setLogoList(updated);
    
    setTimeout(() => {
      newLogoRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const filteredLogos = useMemo(() => {
    let filtered = [...localLogos];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(logo => 
        logo.name.toLowerCase().includes(term) ||
        logo.description.toLowerCase().includes(term) ||
        (logo.category && logo.category.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }, [localLogos, searchTerm]);

  const isLogosLimitReached = localLogos.length >= currentPlanLimit;
  const canAddNewLogo = !isLogosLimitReached;
  const logosCompleteCount = localLogos.filter(logo => 
    logo.name.trim() !== '' && 
    logo.description.trim() !== '' && 
    (logo.image?.trim() !== '' || logo.file)
  ).length;
  const logosTotalCount = localLogos.length;

  const logosValidationError = isLogosLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Cada logo tem 4 campos (nome, descrição, categoria, imagem)
    total += localLogos.length * 4;
    localLogos.forEach(logo => {
      if (logo.name.trim()) completed++;
      if (logo.description.trim()) completed++;
      if (logo.category?.trim()) completed++;
      if (logo.image?.trim() || logo.file) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  const stableIds = useMemo(
    () => localLogos.map((item, index) => item.id ?? `logo-${index}`),
    [localLogos]
  );

  return (
    <ManageLayout
      headerIcon={ImageIcon}
      title="Logos"
      description="Gerencie os logos de parceiros, clientes e marcas associadas"
      exists={!!exists}
      itemName="Logos"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Cabeçalho de Controle */}
        <Card className="p-6 bg-[var(--color-background)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                Gerenciamento de Logos
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span className="text-sm text-[var(--color-secondary)]/70">
                    {logosCompleteCount} de {logosTotalCount} completos
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
              Buscar Logos
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]/70" />
              <Input
                type="text"
                placeholder="Buscar logos por nome, descrição ou categoria..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Mensagem de erro */}
        {logosValidationError && (
          <div className={`p-3 rounded-lg ${isLogosLimitReached 
            ? 'bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30' 
            : 'bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30'}`}>
            <div className="flex items-start gap-2">
              {isLogosLimitReached ? (
                <XCircle className="w-5 h-5 text-[var(--color-danger)] flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${isLogosLimitReached 
                ? 'text-[var(--color-danger)]' 
                : 'text-[var(--color-warning)]'}`}>
                {logosValidationError}
              </p>
            </div>
          </div>
        )}

        {/* Lista de Logos */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredLogos.length === 0 ? (
              <Card className="p-8 bg-[var(--color-background)]">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                    Nenhum logo encontrado
                  </h3>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    {searchTerm ? 'Tente ajustar sua busca ou limpe o filtro' : 'Adicione seu primeiro logo usando o botão abaixo'}
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
                  {filteredLogos.map((logo, index) => {
                    const originalIndex = localLogos.findIndex(l => l.id === logo.id) || index;
                    const hasName = logo.name.trim() !== "";
                    const hasDescription = logo.description.trim() !== "";
                    const hasImage = Boolean(logo.image?.trim() !== "" || logo.file);
                    const isLastInOriginalList = originalIndex === localLogos.length - 1;
                    const isLastAndEmpty = isLastInOriginalList && !hasName && !hasDescription && !hasImage;

                    return (
                      <SortableLogoItem
                        key={stableIds[index]}
                        logo={logo}
                        index={index}
                        originalIndex={originalIndex}
                        isLastInOriginalList={isLastInOriginalList}
                        isLastAndEmpty={isLastAndEmpty}
                        showValidation={showValidation}
                        logoList={localLogos}
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
          onAddNew={handleAddLogo}
          isAddDisabled={!canAddNewLogo}
          isSaving={loading}
          exists={!!exists}
          totalCount={completion.total}
          itemName="Logo"
          icon={ImageIcon}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateLogos)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={localLogos.length}
        itemName="Logo"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}