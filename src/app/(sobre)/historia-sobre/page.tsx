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
  History, 
  X, 
  GripVertical, 
  ArrowUpDown, 
  Calendar, 
  Target, 
  BookOpen,
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

interface TimelineItem {
  id?: string;
  step: string;
  title: string;
  description: string;
  file?: File | null;
  image?: string;
}

function SortableTimelineItem({
  timeline,
  index,
  originalIndex,
  isLastInOriginalList,
  isLastAndEmpty,
  showValidation,
  timelineList,
  handleChange,
  handleFileChange,
  openDeleteSingleModal,
  getImageUrl,
  setNewItemRef,
}: {
  timeline: TimelineItem;
  index: number;
  originalIndex: number;
  isLastInOriginalList: boolean;
  isLastAndEmpty: boolean;
  showValidation: boolean;
  timelineList: TimelineItem[];
  handleChange: (index: number, field: keyof TimelineItem, value: any) => void;
  handleFileChange: (index: number, file: File | null) => void;
  openDeleteSingleModal: (index: number, title: string) => void;
  getImageUrl: (timeline: TimelineItem) => string;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
}) {
  const stableId = useId();
  const sortableId = timeline.id || `timeline-${index}-${stableId}`;

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

  const hasStep = timeline.step.trim() !== "";
  const hasTitle = timeline.title.trim() !== "";
  const hasDescription = timeline.description.trim() !== "";
  const hasImage = Boolean(timeline.image?.trim() !== "" || timeline.file);
  const imageUrl = getImageUrl(timeline);

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
        isLastInOriginalList && showValidation && !hasStep ? 'ring-2 ring-[var(--color-danger)]' : ''
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
                  {hasStep && hasTitle ? (
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-full text-sm font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{timeline.step}</span>
                      </div>
                      <h4 className="font-medium text-[var(--color-secondary)]">
                        {timeline.title}
                      </h4>
                    </div>
                  ) : (
                    <h4 className="font-medium text-[var(--color-secondary)]/50">
                      Marco sem título
                    </h4>
                  )}
                  {hasStep && hasTitle && hasDescription && hasImage ? (
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
              onClick={() => openDeleteSingleModal(originalIndex, timeline.title || "Marco sem título")}
              variant="danger"
              className="whitespace-nowrap bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 border-none flex items-center gap-2"
              disabled={timelineList.length <= 1}
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
                  Imagem do Marco
                </label>
                <ImageUpload
                  label="Imagem do Marco Histórico"
                  description="Formatos suportados: JPG, PNG, WEBP. Tamanho recomendado: 800x400px."
                  currentImage={timeline.image || ""}
                  selectedFile={timeline.file || null}
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
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Ano/Etapa
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: 2022, 2023, Futuro"
                    value={timeline.step}
                    onChange={(e: any) => handleChange(originalIndex, "step", e.target.value)}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Use anos (2022, 2023) ou conceitos (Futuro, Próxima Fase)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Título do Marco
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: O Inconformismo"
                    value={timeline.title}
                    onChange={(e: any) => handleChange(originalIndex, "title", e.target.value)}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Descrição Detalhada
                  </label>
                  <TextArea
                    label="Descrição"
                    placeholder="Nascemos da frustração. Vimos o mercado queimando verba em 'hacks' que não funcionavam. Decidimos que a Tegbe seria guiada por uma única bússola: o ROI do cliente."
                    value={timeline.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                      handleChange(originalIndex, "description", e.target.value)
                    }
                    rows={5}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Descreva o momento histórico da empresa, os desafios e conquistas
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

export default function TimelinePage({ 
  type = "historia", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  const defaultTimeline = useMemo(() => ({ 
    step: "", 
    title: "",
    description: "",
    file: null, 
    image: "" 
  }), []);

  const [localTimeline, setLocalTimeline] = useState<TimelineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const apiBase = `/api/${subtype}/form`;

  const {
    list: timelineList,
    setList: setTimelineList,
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
  } = useListManagement<TimelineItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem: defaultTimeline,
    validationFields: ["step", "title", "description", "image"]
  });

  // Sincroniza timeline local
  useEffect(() => {
    setLocalTimeline(timelineList);
  }, [timelineList]);

  const newTimelineRef = useRef<HTMLDivElement>(null);

  const setNewItemRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      newTimelineRef.current = node;
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
      const oldIndex = localTimeline.findIndex((item) => 
        item.id === active.id || item.id?.includes(active.id as string)
      );
      const newIndex = localTimeline.findIndex((item) => 
        item.id === over.id || item.id?.includes(over.id as string)
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(localTimeline, oldIndex, newIndex);
        setLocalTimeline(newList);
        setTimelineList(newList);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const filteredList = localTimeline.filter(
        timeline => timeline.step.trim() && timeline.title.trim() && timeline.description.trim() && (timeline.image?.trim() || timeline.file)
      );

      if (!filteredList.length) {
        setErrorMsg("Adicione ao menos um marco completo com ano, título, descrição e imagem.");
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

      filteredList.forEach((timeline, i) => {
        if (timeline.file) {
          fd.append(`file${i}`, timeline.file);
        }
      });

      const method = exists ? "PUT" : "POST";

      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar timeline");
      }

      const saved = await res.json();

      const normalized = saved.values.map((v: any, i: number) => ({
        ...v,
        id: v.id || `timeline-${Date.now()}-${i}`,
        file: null,
      }));

      setLocalTimeline(normalized);
      setTimelineList(normalized);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof TimelineItem, value: any) => {
    const newList = [...localTimeline];
    newList[index] = { ...newList[index], [field]: value };
    setLocalTimeline(newList);
    setTimelineList(newList);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newList = [...localTimeline];
    newList[index] = { ...newList[index], file };
    setLocalTimeline(newList);
    setTimelineList(newList);
  };

  const getImageUrl = (timeline: TimelineItem): string => {
    if (timeline.file) {
      return URL.createObjectURL(timeline.file);
    }
    if (timeline.image) {
      if (timeline.image.startsWith('http') || timeline.image.startsWith('//')) {
        return timeline.image;
      } else {
        return `https://mavellium.com.br${timeline.image.startsWith('/') ? '' : '/'}${timeline.image}`;
      }
    }
    return "";
  };

  const updateTimeline = async (list: TimelineItem[]) => {
    if (!exists) return;

    const filteredList = list.filter(
      timeline => timeline.step.trim() || timeline.title.trim() || timeline.description.trim() || timeline.file || timeline.image
    );

    const fd = new FormData();
    
    fd.append("id", exists.id);
    
    filteredList.forEach((timeline, i) => {
      fd.append(`values[${i}][step]`, timeline.step);
      fd.append(`values[${i}][title]`, timeline.title);
      fd.append(`values[${i}][description]`, timeline.description);
      fd.append(`values[${i}][image]`, timeline.image || "");
      
      if (timeline.file) {
        fd.append(`file${i}`, timeline.file);
      }
      
      if (timeline.id) {
        fd.append(`values[${i}][id]`, timeline.id);
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

  const handleAddTimeline = () => {
    if (localTimeline.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: TimelineItem = {
      step: '',
      title: '',
      description: '',
      image: '',
      file: null
    };
    
    const updated = [...localTimeline, newItem];
    setLocalTimeline(updated);
    setTimelineList(updated);
    
    setTimeout(() => {
      newTimelineRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const filteredTimeline = useMemo(() => {
    let filtered = [...localTimeline];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(timeline => 
        timeline.step.toLowerCase().includes(term) ||
        timeline.title.toLowerCase().includes(term) ||
        timeline.description.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [localTimeline, searchTerm]);

  const isTimelineLimitReached = localTimeline.length >= currentPlanLimit;
  const canAddNewTimeline = !isTimelineLimitReached;
  const timelineCompleteCount = localTimeline.filter(timeline => 
    timeline.step.trim() !== '' && 
    timeline.title.trim() !== '' && 
    timeline.description.trim() !== '' &&
    (timeline.image?.trim() !== '' || timeline.file)
  ).length;
  const timelineTotalCount = localTimeline.length;

  const timelineValidationError = isTimelineLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Cada marco tem 4 campos (step, title, description, image)
    total += localTimeline.length * 4;
    localTimeline.forEach(timeline => {
      if (timeline.step.trim()) completed++;
      if (timeline.title.trim()) completed++;
      if (timeline.description.trim()) completed++;
      if (timeline.image?.trim() || timeline.file) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  const stableIds = useMemo(
    () => localTimeline.map((item, index) => item.id ?? `timeline-${index}`),
    [localTimeline]
  );

  return (
    <ManageLayout
      headerIcon={History}
      title="Timeline - Nossa História"
      description="Gerencie a linha do tempo da empresa, mostrando os principais marcos e conquistas"
      exists={!!exists}
      itemName="Timeline"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Cabeçalho de Controle */}
        <Card className="p-6 bg-[var(--color-background)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                Gerenciamento da Timeline
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span className="text-sm text-[var(--color-secondary)]/70">
                    {timelineCompleteCount} de {timelineTotalCount} completos
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
              Buscar Marcos
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]/70" />
              <Input
                type="text"
                placeholder="Buscar marcos por ano, título ou descrição..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Mensagem de erro */}
        {timelineValidationError && (
          <div className={`p-3 rounded-lg ${isTimelineLimitReached 
            ? 'bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30' 
            : 'bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30'}`}>
            <div className="flex items-start gap-2">
              {isTimelineLimitReached ? (
                <XCircle className="w-5 h-5 text-[var(--color-danger)] flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${isTimelineLimitReached 
                ? 'text-[var(--color-danger)]' 
                : 'text-[var(--color-warning)]'}`}>
                {timelineValidationError}
              </p>
            </div>
          </div>
        )}

        {/* Lista da Timeline */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredTimeline.length === 0 ? (
              <Card className="p-8 bg-[var(--color-background)]">
                <div className="text-center">
                  <History className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                    Nenhum marco encontrado
                  </h3>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    {searchTerm ? 'Tente ajustar sua busca ou limpe o filtro' : 'Adicione seu primeiro marco usando o botão abaixo'}
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
                  {filteredTimeline.map((timeline, index) => {
                    const originalIndex = localTimeline.findIndex(t => t.id === timeline.id) || index;
                    const hasStep = timeline.step.trim() !== "";
                    const hasTitle = timeline.title.trim() !== "";
                    const hasDescription = timeline.description.trim() !== "";
                    const hasImage = Boolean(timeline.image?.trim() !== "" || timeline.file);
                    const isLastInOriginalList = originalIndex === localTimeline.length - 1;
                    const isLastAndEmpty = isLastInOriginalList && !hasStep && !hasTitle && !hasDescription && !hasImage;

                    return (
                      <SortableTimelineItem
                        key={stableIds[index]}
                        timeline={timeline}
                        index={index}
                        originalIndex={originalIndex}
                        isLastInOriginalList={isLastInOriginalList}
                        isLastAndEmpty={isLastAndEmpty}
                        showValidation={showValidation}
                        timelineList={localTimeline}
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
          onAddNew={handleAddTimeline}
          isAddDisabled={!canAddNewTimeline}
          isSaving={loading}
          exists={!!exists}
          totalCount={completion.total}
          itemName="Marco Histórico"
          icon={History}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateTimeline)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={localTimeline.length}
        itemName="Marco Histórico"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />

      {/* Modal de imagem expandida */}
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
                className="absolute -top-4 -right-4 !p-3 !rounded-full bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 z-10 border-none"
              >
                <X className="w-5 h-5" />
              </Button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={expandedImage}
                alt="Preview expandido"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl"
                onError={(e) => {
                  console.error('Erro ao carregar imagem expandida:', expandedImage);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ManageLayout>
  );
}