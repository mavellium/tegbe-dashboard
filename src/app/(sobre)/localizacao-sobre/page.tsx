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
  MapPin, 
  X, 
  GripVertical, 
  ArrowUpDown, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Trash2,
  XCircle,
  Search,
  Target,
  Image as ImageIcon
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

interface LocationItem {
  id?: string;
  title: string;
  description: string;
  alt: string;
  file?: File | null;
  image?: string;
}

function SortableLocationItem({
  location,
  index,
  originalIndex,
  isLastInOriginalList,
  isLastAndEmpty,
  showValidation,
  locationList,
  handleChange,
  handleFileChange,
  openDeleteSingleModal,
  getImageUrl,
  setNewItemRef,
}: {
  location: LocationItem;
  index: number;
  originalIndex: number;
  isLastInOriginalList: boolean;
  isLastAndEmpty: boolean;
  showValidation: boolean;
  locationList: LocationItem[];
  handleChange: (index: number, field: keyof LocationItem, value: any) => void;
  handleFileChange: (index: number, file: File | null) => void;
  openDeleteSingleModal: (index: number, title: string) => void;
  getImageUrl: (location: LocationItem) => string;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
}) {
  const stableId = useId();
  const sortableId = location.id || `location-${index}-${stableId}`;

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

  const hasTitle = location.title.trim() !== "";
  const hasDescription = location.description.trim() !== "";
  const hasAlt = location.alt.trim() !== "";
  const hasImage = Boolean(location.image?.trim() !== "" || location.file);
  const imageUrl = getImageUrl(location);

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
        isLastInOriginalList && showValidation && !hasTitle ? 'ring-2 ring-[var(--color-danger)]' : ''
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
                      {location.title}
                    </h4>
                  ) : (
                    <h4 className="font-medium text-[var(--color-secondary)]/50">
                      Local sem nome
                    </h4>
                  )}
                  {hasTitle && hasDescription && hasAlt && hasImage ? (
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
              onClick={() => openDeleteSingleModal(originalIndex, location.title)}
              variant="danger"
              className="whitespace-nowrap bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 border-none flex items-center gap-2"
              disabled={locationList.length <= 1}
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
                  Imagem do Local
                </label>
                <ImageUpload
                  label="Imagem da Localização"
                  description="Formatos suportados: JPG, PNG, WEBP. Tamanho recomendado: 800x400px."
                  currentImage={location.image || ""}
                  selectedFile={location.file || null}
                  onFileChange={(file) => handleFileChange(originalIndex, file)}
                  aspectRatio="aspect-video"
                  previewWidth={400}
                  previewHeight={200}
                />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Título do Local
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Sede Principal, Escritório Centro, Filial Zona Sul"
                  value={location.title}
                  onChange={(e: any) => handleChange(originalIndex, "title", e.target.value)}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Descrição do Local
                </label>
                <TextArea
                  label="Descrição"
                  placeholder="Descreva o local, endereço, características ou informações relevantes"
                  value={location.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    handleChange(originalIndex, "description", e.target.value)
                  }
                  rows={3}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                  Descrição detalhada do local ou filial
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Texto Alternativo (Alt)
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Fotografia do nosso escritório principal com vista para o parque"
                  value={location.alt}
                  onChange={(e: any) => handleChange(originalIndex, "alt", e.target.value)}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                  Texto descritivo para acessibilidade (leitura por screen readers)
                </p>
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
  const defaultLocation = useMemo(() => ({ 
    title: "", 
    description: "",
    alt: "",
    file: null, 
    image: "" 
  }), []);

  const [localLocations, setLocalLocations] = useState<LocationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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
    showValidation,
    deleteModal,
    currentPlanLimit,
    currentPlanType,
    openDeleteSingleModal,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
  } = useListManagement<LocationItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem: defaultLocation,
    validationFields: ["title", "description", "alt", "image"]
  });

  // Sincroniza localizações locais
  useEffect(() => {
    setLocalLocations(locationList);
  }, [locationList]);

  const newLocationRef = useRef<HTMLDivElement>(null);

  const setNewItemRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      newLocationRef.current = node;
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
      const oldIndex = localLocations.findIndex((item) => 
        item.id === active.id || item.id?.includes(active.id as string)
      );
      const newIndex = localLocations.findIndex((item) => 
        item.id === over.id || item.id?.includes(over.id as string)
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(localLocations, oldIndex, newIndex);
        setLocalLocations(newList);
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
      const filteredList = localLocations.filter(
        location => location.title.trim() && location.description.trim() && location.alt.trim() && (location.image?.trim() || location.file)
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

      filteredList.forEach((location, i) => {
        if (location.file) {
          fd.append(`file${i}`, location.file);
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

      setLocalLocations(normalized);
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
    const newList = [...localLocations];
    newList[index] = { ...newList[index], [field]: value };
    setLocalLocations(newList);
    setLocationList(newList);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newList = [...localLocations];
    newList[index] = { ...newList[index], file };
    setLocalLocations(newList);
    setLocationList(newList);
  };

  const getImageUrl = (location: LocationItem): string => {
    if (location.file) {
      return URL.createObjectURL(location.file);
    }
    if (location.image) {
      if (location.image.startsWith('http') || location.image.startsWith('//')) {
        return location.image;
      } else {
        return `https://mavellium.com.br${location.image.startsWith('/') ? '' : '/'}${location.image}`;
      }
    }
    return "";
  };

  const updateLocations = async (list: LocationItem[]) => {
    if (!exists) return;

    const filteredList = list.filter(
      location => location.title.trim() || location.description.trim() || location.alt.trim() || location.file || location.image
    );

    const fd = new FormData();
    
    fd.append("id", exists.id);
    
    filteredList.forEach((location, i) => {
      fd.append(`values[${i}][title]`, location.title);
      fd.append(`values[${i}][description]`, location.description);
      fd.append(`values[${i}][alt]`, location.alt);
      fd.append(`values[${i}][image]`, location.image || "");
      
      if (location.file) {
        fd.append(`file${i}`, location.file);
      }
      
      if (location.id) {
        fd.append(`values[${i}][id]`, location.id);
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

  const handleAddLocation = () => {
    if (localLocations.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: LocationItem = {
      title: '',
      description: '',
      alt: '',
      file: null,
      image: ''
    };
    
    const updated = [...localLocations, newItem];
    setLocalLocations(updated);
    setLocationList(updated);
    
    setTimeout(() => {
      newLocationRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const filteredLocations = useMemo(() => {
    let filtered = [...localLocations];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(location => 
        location.title.toLowerCase().includes(term) ||
        location.description.toLowerCase().includes(term) ||
        location.alt.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [localLocations, searchTerm]);

  const isLocationsLimitReached = localLocations.length >= currentPlanLimit;
  const canAddNewLocation = !isLocationsLimitReached;
  const locationsCompleteCount = localLocations.filter(location => 
    location.title.trim() !== '' && 
    location.description.trim() !== '' && 
    location.alt.trim() !== '' && 
    (location.image?.trim() !== '' || location.file)
  ).length;
  const locationsTotalCount = localLocations.length;

  const locationsValidationError = isLocationsLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Cada localização tem 4 campos (título, descrição, alt, imagem)
    total += localLocations.length * 4;
    localLocations.forEach(location => {
      if (location.title.trim()) completed++;
      if (location.description.trim()) completed++;
      if (location.alt.trim()) completed++;
      if (location.image?.trim() || location.file) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  const stableIds = useMemo(
    () => localLocations.map((item, index) => item.id ?? `location-${index}`),
    [localLocations]
  );

  return (
    <ManageLayout
      headerIcon={MapPin}
      title="Localizações"
      description="Gerencie as imagens e informações das localizações da empresa"
      exists={!!exists}
      itemName="Localizações"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Cabeçalho de Controle */}
        <Card className="p-6 bg-[var(--color-background)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                Gerenciamento de Localizações
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span className="text-sm text-[var(--color-secondary)]/70">
                    {locationsCompleteCount} de {locationsTotalCount} completos
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
              Buscar Localizações
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]/70" />
              <Input
                type="text"
                placeholder="Buscar localizações por título, descrição ou texto alt..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Mensagem de erro */}
        {locationsValidationError && (
          <div className={`p-3 rounded-lg ${isLocationsLimitReached 
            ? 'bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30' 
            : 'bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30'}`}>
            <div className="flex items-start gap-2">
              {isLocationsLimitReached ? (
                <XCircle className="w-5 h-5 text-[var(--color-danger)] flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${isLocationsLimitReached 
                ? 'text-[var(--color-danger)]' 
                : 'text-[var(--color-warning)]'}`}>
                {locationsValidationError}
              </p>
            </div>
          </div>
        )}

        {/* Lista de Localizações */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredLocations.length === 0 ? (
              <Card className="p-8 bg-[var(--color-background)]">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                    Nenhuma localização encontrada
                  </h3>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    {searchTerm ? 'Tente ajustar sua busca ou limpe o filtro' : 'Adicione sua primeira localização usando o botão abaixo'}
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
                  {filteredLocations.map((location, index) => {
                    const originalIndex = localLocations.findIndex(l => l.id === location.id) || index;
                    const hasTitle = location.title.trim() !== "";
                    const hasDescription = location.description.trim() !== "";
                    const hasAlt = location.alt.trim() !== "";
                    const hasImage = Boolean(location.image?.trim() !== "" || location.file);
                    const isLastInOriginalList = originalIndex === localLocations.length - 1;
                    const isLastAndEmpty = isLastInOriginalList && !hasTitle && !hasDescription && !hasAlt && !hasImage;

                    return (
                      <SortableLocationItem
                        key={stableIds[index]}
                        location={location}
                        index={index}
                        originalIndex={originalIndex}
                        isLastInOriginalList={isLastInOriginalList}
                        isLastAndEmpty={isLastAndEmpty}
                        showValidation={showValidation}
                        locationList={localLocations}
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
          onAddNew={handleAddLocation}
          isAddDisabled={!canAddNewLocation}
          isSaving={loading}
          exists={!!exists}
          totalCount={completion.total}
          itemName="Localização"
          icon={MapPin}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateLocations)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={localLocations.length}
        itemName="Localização"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}