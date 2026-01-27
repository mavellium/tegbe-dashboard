/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback, useId, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListManagement } from "@/hooks/useListManagement";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { 
  BookOpen, 
  GripVertical, 
  ArrowUpDown, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Trash2,
  XCircle,
  Search,
  Link
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

interface CursoItem {
  id?: string;
  name: string;
  image: string;
  url: string;
  file?: File | null;
}

function SortableCursoItem({
  curso,
  index,
  originalIndex,
  isLastInOriginalList,
  isLastAndEmpty,
  showValidation,
  cursoList,
  handleChange,
  handleFileChange,
  openDeleteSingleModal,
  getImageUrl,
  setNewItemRef,
}: {
  curso: CursoItem;
  index: number;
  originalIndex: number;
  isLastInOriginalList: boolean;
  isLastAndEmpty: boolean;
  showValidation: boolean;
  cursoList: CursoItem[];
  handleChange: (index: number, field: keyof CursoItem, value: any) => void;
  handleFileChange: (index: number, file: File | null) => void;
  openDeleteSingleModal: (index: number, name: string) => void;
  getImageUrl: (curso: CursoItem) => string;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
}) {
  const stableId = useId();
  const sortableId = curso.id || `curso-${index}-${stableId}`;

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

  const hasName = curso.name.trim() !== "";
  const hasImage = Boolean(curso.image?.trim() !== "" || curso.file);
  const hasUrl = curso.url.trim() !== "";
  const imageUrl = getImageUrl(curso);

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
                      {curso.name}
                    </h4>
                  ) : (
                    <h4 className="font-medium text-[var(--color-secondary)]/50">
                      Curso sem nome
                    </h4>
                  )}
                  {hasName && hasImage && hasUrl ? (
                    <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                      Completo
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                      Incompleto
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              type="button"
              onClick={() => openDeleteSingleModal(originalIndex, curso.name)}
              variant="danger"
              className="whitespace-nowrap bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 border-none flex items-center gap-2"
              disabled={cursoList.length <= 1}
            >
              <Trash2 className="w-4 h-4" />
              Remover
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Logo do Curso
                </label>
                <ImageUpload
                  label="Logo do Curso"
                  description="Formatos suportados: PNG (transparente), SVG, JPG. Use arquivos de alta qualidade."
                  currentImage={curso.image || ""}
                  selectedFile={curso.file || null}
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
                  Nome do Curso/Plataforma *
                </label>
                <Input
                  type="text"
                  placeholder="Ex: React JS, Node.js, TypeScript"
                  value={curso.name}
                  onChange={(e: any) => handleChange(originalIndex, "name", e.target.value)}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  URL do Curso/Plataforma *
                </label>
                <Input
                  type="url"
                  placeholder="https://exemplo.com/curso"
                  value={curso.url}
                  onChange={(e: any) => handleChange(originalIndex, "url", e.target.value)}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                  Link para a página do curso ou plataforma
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  URL da Imagem (opcional)
                </label>
                <Input
                  type="text"
                  placeholder="https://exemplo.com/imagem.png"
                  value={curso.image || ""}
                  onChange={(e: any) => handleChange(originalIndex, "image", e.target.value)}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                  Se não fizer upload, insira a URL da imagem aqui
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function CursosPage({ 
  type = "logos-curso", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  const defaultCurso = useMemo(() => ({ 
    name: "", 
    image: "",
    url: "",
    file: null,
  }), []);

  const [localCursos, setLocalCursos] = useState<CursoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const apiBase = `/api/${subtype}/form`;

  const {
    list: cursoList,
    setList: setCursoList,
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
  } = useListManagement<CursoItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem: defaultCurso,
    validationFields: ["name", "image", "url"]
  });

  // Sincroniza cursos locais
  useEffect(() => {
    setLocalCursos(cursoList);
  }, [cursoList]);

  const newCursoRef = useRef<HTMLDivElement>(null);

  const setNewItemRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      newCursoRef.current = node;
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
      const oldIndex = localCursos.findIndex((item) => 
        item.id === active.id || item.id?.includes(active.id as string)
      );
      const newIndex = localCursos.findIndex((item) => 
        item.id === over.id || item.id?.includes(over.id as string)
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(localCursos, oldIndex, newIndex);
        setLocalCursos(newList);
        setCursoList(newList);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      // Filtra apenas cursos que têm nome, URL e (imagem OU arquivo)
      const filteredList = localCursos.filter(
        curso => curso.name.trim() !== "" && 
                curso.url.trim() !== "" && 
                (curso.image?.trim() !== "" || curso.file)
      );

      if (!filteredList.length) {
        setErrorMsg("Adicione ao menos um curso completo com nome, URL e imagem.");
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

      filteredList.forEach((curso, i) => {
        if (curso.file) {
          fd.append(`file${i}`, curso.file);
        }
      });

      const method = exists ? "PUT" : "POST";

      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar cursos");
      }

      const saved = await res.json();

      const normalized = saved.values.map((v: any, i: number) => ({
        ...v,
        id: v.id || `curso-${Date.now()}-${i}`,
        file: null,
      }));

      setLocalCursos(normalized);
      setCursoList(normalized);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof CursoItem, value: any) => {
    const newList = [...localCursos];
    newList[index] = { ...newList[index], [field]: value };
    
    // Se estiver alterando a URL da imagem, remove o arquivo selecionado
    if (field === "image" && value.trim() !== "") {
      newList[index].file = null;
    }
    
    setLocalCursos(newList);
    setCursoList(newList);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newList = [...localCursos];
    
    if (file) {
      // Se está fazendo upload de arquivo, limpa a URL da imagem
      newList[index] = { 
        ...newList[index], 
        file, 
        image: "" 
      };
    } else {
      // Se está removendo o arquivo, mantém a URL da imagem
      newList[index] = { 
        ...newList[index], 
        file: null 
      };
    }
    
    setLocalCursos(newList);
    setCursoList(newList);
  };

  const getImageUrl = (curso: CursoItem): string => {
    if (curso.file) {
      return URL.createObjectURL(curso.file);
    }
    if (curso.image) {
      if (curso.image.startsWith('http') || curso.image.startsWith('//')) {
        return curso.image;
      } else {
        return `https://mavellium.com.br${curso.image.startsWith('/') ? '' : '/'}${curso.image}`;
      }
    }
    return "";
  };

  const updateCursos = async (list: CursoItem[]) => {
    if (!exists) return;

    const filteredList = list.filter(
      curso => curso.name.trim() || curso.image?.trim() || curso.url.trim() || curso.file
    );

    const fd = new FormData();
    
    fd.append("id", exists.id);
    
    filteredList.forEach((curso, i) => {
      fd.append(`values[${i}][name]`, curso.name);
      fd.append(`values[${i}][image]`, curso.image || "");
      fd.append(`values[${i}][url]`, curso.url);
      
      if (curso.file) {
        fd.append(`file${i}`, curso.file);
      }
      
      if (curso.id) {
        fd.append(`values[${i}][id]`, curso.id);
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

  const handleAddCurso = () => {
    if (localCursos.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: CursoItem = {
      name: '',
      image: '',
      url: '',
      file: null,
    };
    
    const updated = [...localCursos, newItem];
    setLocalCursos(updated);
    setCursoList(updated);
    
    setTimeout(() => {
      newCursoRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const filteredCursos = useMemo(() => {
    let filtered = [...localCursos];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(curso => 
        curso.name.toLowerCase().includes(term) ||
        curso.url.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [localCursos, searchTerm]);

  const isCursosLimitReached = localCursos.length >= currentPlanLimit;
  const canAddNewCurso = !isCursosLimitReached;
  const cursosCompleteCount = localCursos.filter(curso => 
    curso.name.trim() !== '' && 
    curso.url.trim() !== '' && 
    (curso.image?.trim() !== '' || curso.file)
  ).length;
  const cursosTotalCount = localCursos.length;

  const cursosValidationError = isCursosLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Cursos (cada curso tem 3 campos obrigatórios)
    total += localCursos.length * 3;
    localCursos.forEach(curso => {
      if (curso.name.trim()) completed++;
      if (curso.url.trim()) completed++;
      if (curso.image?.trim() || curso.file) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  const stableIds = useMemo(
    () => localCursos.map((item, index) => item.id ?? `curso-${index}`),
    [localCursos]
  );

  return (
    <ManageLayout
      headerIcon={BookOpen}
      title="Cursos & Plataformas"
      description="Gerencie os cursos e plataformas de ensino parceiras"
      exists={!!exists}
      itemName="Cursos"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Cabeçalho de Controle */}
        <Card className="p-6 bg-[var(--color-background)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                Gerenciamento de Cursos
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span className="text-sm text-[var(--color-secondary)]/70">
                    {cursosCompleteCount} de {cursosTotalCount} completos
                  </span>
                </div>
                <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                <span className="text-sm text-[var(--color-secondary)]/70">
                  Limite: {currentPlanType === 'pro' ? '20' : '10'} itens
                </span>
              </div>
            </div>
          </div>

          {/* Barra de busca */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--color-secondary)]">
              Buscar Cursos
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]/70" />
              <Input
                type="text"
                placeholder="Buscar cursos por nome ou URL..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Mensagem de erro */}
        {cursosValidationError && (
          <div className={`p-3 rounded-lg ${isCursosLimitReached 
            ? 'bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30' 
            : 'bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30'}`}>
            <div className="flex items-start gap-2">
              {isCursosLimitReached ? (
                <XCircle className="w-5 h-5 text-[var(--color-danger)] flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${isCursosLimitReached 
                ? 'text-[var(--color-danger)]' 
                : 'text-[var(--color-warning)]'}`}>
                {cursosValidationError}
              </p>
            </div>
          </div>
        )}

        {/* Lista de Cursos */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredCursos.length === 0 ? (
              <Card className="p-8 bg-[var(--color-background)]">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                    Nenhum curso encontrado
                  </h3>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    {searchTerm ? 'Tente ajustar sua busca ou limpe o filtro' : 'Adicione seu primeiro curso usando o botão abaixo'}
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
                  {filteredCursos.map((curso, index) => {
                    const originalIndex = localCursos.findIndex(l => l.id === curso.id) || index;
                    const hasName = curso.name.trim() !== "";
                    const hasImage = Boolean(curso.image?.trim() !== "" || curso.file);
                    const hasUrl = curso.url.trim() !== "";
                    const isLastInOriginalList = originalIndex === localCursos.length - 1;
                    const isLastAndEmpty = isLastInOriginalList && !hasName && !hasImage && !hasUrl;

                    return (
                      <SortableCursoItem
                        key={stableIds[index]}
                        curso={curso}
                        index={index}
                        originalIndex={originalIndex}
                        isLastInOriginalList={isLastInOriginalList}
                        isLastAndEmpty={isLastAndEmpty}
                        showValidation={showValidation}
                        cursoList={localCursos}
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
          onAddNew={handleAddCurso}
          isAddDisabled={!canAddNewCurso}
          isSaving={loading}
          exists={!!exists}
          totalCount={completion.total}
          itemName="Curso"
          icon={BookOpen}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateCursos)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={localCursos.length}
        itemName="Curso"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}