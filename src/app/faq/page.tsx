/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useCallback } from "react";
import { useListManagement } from "@/hooks/useListManagement";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { HelpCircle, GripVertical, ArrowUpDown } from "lucide-react";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { SearchSortBar } from "@/components/Manage/SearchSortBar";
import { ItemHeader } from "@/components/Manage/ItemHeader";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
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

interface FAQ {
  id?: string;
  question: string;
  answer: string;
}

interface SortableFAQItemProps {
  faq: FAQ;
  index: number;
  originalIndex: number;
  isLastInOriginalList: boolean;
  isLastAndEmpty: boolean;
  showValidation: boolean;
  faqList: FAQ[];
  handleChange: (index: number, field: keyof FAQ, value: string) => void;
  openDeleteSingleModal: (index: number, title: string) => void;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
}

function SortableFAQItem({
  faq,
  index,
  originalIndex,
  isLastInOriginalList,
  isLastAndEmpty,
  showValidation,
  faqList,
  handleChange,
  openDeleteSingleModal,
  setNewItemRef,
}: SortableFAQItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: faq.id || `faq-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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
        isLastInOriginalList && showValidation && !faq.question ? 'ring-2 ring-red-500' : ''
      } ${isDragging ? 'shadow-lg scale-105' : ''}`}>
        <div className="p-4 bg-[var(--color-background)] border-b border-[var(--color-border)]">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="cursor-move text-[var(--color-secondary)]/50 hover:text-[var(--color-secondary)] transition-colors p-1 rounded-lg hover:bg-[var(--color-primary)]/10"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-sm text-[var(--color-secondary)]/70">
                <ArrowUpDown className="w-4 h-4" />
                <span>Posição: {index + 1}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ItemHeader
                index={originalIndex}
                fields={[
                  { label: 'Pergunta', hasValue: faq.question.trim() !== "" },
                  { label: 'Resposta', hasValue: faq.answer.trim() !== "" }
                ]}
                showValidation={showValidation}
                isLast={isLastInOriginalList}
                onDelete={() => openDeleteSingleModal(originalIndex, faq.question)}
                showDelete={faqList.length > 1}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                Pergunta
              </label>
              <Input
                type="text"
                placeholder="Digite a pergunta..."
                value={faq.question}
                onChange={(e: any) => handleChange(originalIndex, "question", e.target.value)}
                className="font-medium"
                autoFocus={isLastAndEmpty}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                Resposta
              </label>
              <TextArea
                placeholder="Digite a resposta..."
                value={faq.answer}
                onChange={(e: any) => handleChange(originalIndex, "answer", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function CreateFAQ() {
  const defaultFAQ = useMemo(() => ({ question: "", answer: "" }), []);

  const {
    list: faqList,
    setList: setFaqList,
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
    filteredItems: filteredFaqs,
    deleteModal,
    newItemRef,
    canAddNewItem,
    completeCount,
    addItem,
    openDeleteSingleModal,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
    clearFilters,
  } = useListManagement<FAQ>({
    type: "faq",
    apiPath: "/api/form/faq",
    defaultItem: defaultFAQ,
    validationFields: ["question", "answer"]
  });

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
      const oldIndex = faqList.findIndex((item) => 
        item.id === active.id || `faq-${faqList.findIndex(f => f === item)}` === active.id
      );
      const newIndex = faqList.findIndex((item) => 
        item.id === over.id || `faq-${faqList.findIndex(f => f === item)}` === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(faqList, oldIndex, newIndex);
        setFaqList(newList);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    const filtered = faqList.filter(
      f => f.question.trim() && f.answer.trim()
    );

    if (!filtered.length) {
      setErrorMsg("Adicione ao menos uma FAQ completa.");
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      filtered.forEach((f, i) => {
        fd.append(`values[${i}][question]`, f.question);
        fd.append(`values[${i}][answer]`, f.answer);
        if (f.id) {
          fd.append(`values[${i}][id]`, f.id);
        }
      });

      if (exists) fd.append("id", exists.id);

      const res = await fetch("/api/form/faq", {
        method: exists ? "PUT" : "POST",
        body: fd
      });

      if (!res.ok) throw new Error("Erro ao salvar FAQ");

      const updated = await res.json();

      const safeValues = updated.values.map((f: any, index: number) => ({
        id: f.id || `faq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
        question: f.question ?? "",
        answer: f.answer ?? ""
      }));

      setFaqList(safeValues);
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof FAQ, value: string) => {
    const newList = [...faqList];
    newList[index][field] = value;
    setFaqList(newList);
  };

  const handleSubmitWrapper = () => {
    handleSubmit();
  };

  const updateFAQs = async (newList: FAQ[]) => {
    const filtered = newList.filter(f => f.question.trim() && f.answer.trim());
    
    if (filtered.length === 0 && exists) {
      try {
        await fetch(`/api/form/faq?id=${exists.id}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.error("Erro ao deletar:", err);
      }
      return;
    }

    if (!exists) return;

    try {
      const fd = new FormData();
      filtered.forEach((f, i) => {
        fd.append(`values[${i}][question]`, f.question);
        fd.append(`values[${i}][answer]`, f.answer);
        if (f.id) {
          fd.append(`values[${i}][id]`, f.id);
        }
      });
      fd.append("id", exists.id);

      const res = await fetch("/api/form/faq", {
        method: "PUT",
        body: fd
      });

      if (!res.ok) throw new Error("Erro ao atualizar FAQ");
    } catch (err) {
      console.error("Erro ao atualizar:", err);
    }
  };

  return (
    <ManageLayout
      headerIcon={HelpCircle}
      title="FAQ"
      description="Crie e gerencie suas perguntas frequentes"
      exists={!!exists}
      itemName="FAQ"
    >
      <div className="mb-6 space-y-4">
        <SearchSortBar
          search={search}
          setSearch={setSearch}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onClearFilters={clearFilters}
          searchPlaceholder="Buscar FAQs..."
          total={faqList.length}
          showing={filteredFaqs.length}
          searchActiveText="ⓘ Busca ativa - não é possível adicionar nova FAQ"
        />
      </div>

      <div className="space-y-4 pb-32">
        <form onSubmit={handleSubmit}>
          {search ? (
            // Modo busca - sem drag and drop
            filteredFaqs.map((faq: any) => {
              const originalIndex = faqList.findIndex(f => f.id === faq.id);
              const isLastInOriginalList = originalIndex === faqList.length - 1;
              const isLastAndEmpty = isLastInOriginalList && !faq.question && !faq.answer;

              return (
                <div 
                  key={faq.id || originalIndex} 
                  ref={isLastAndEmpty ? setNewItemRef : null}
                >
                  <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
                    isLastInOriginalList && showValidation && !faq.question ? 'ring-2 ring-red-500' : ''
                  }`}>
                    <div className="p-4 bg-[var(--color-background)] border-b border-[var(--color-border)]">
                      <ItemHeader
                        index={originalIndex}
                        fields={[
                          { label: 'Pergunta', hasValue: faq.question.trim() !== "" },
                          { label: 'Resposta', hasValue: faq.answer.trim() !== "" }
                        ]}
                        showValidation={showValidation}
                        isLast={isLastInOriginalList}
                        onDelete={() => openDeleteSingleModal(originalIndex, faq.question)}
                        showDelete={faqList.length > 1}
                      />
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                            Pergunta
                          </label>
                          <Input
                            type="text"
                            placeholder="Digite a pergunta..."
                            value={faq.question}
                            onChange={(e: any) => handleChange(originalIndex, "question", e.target.value)}
                            className="font-medium"
                            autoFocus={isLastAndEmpty}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                            Resposta
                          </label>
                          <TextArea
                            placeholder="Digite a resposta..."
                            value={faq.answer}
                            onChange={(e: any) => handleChange(originalIndex, "answer", e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })
          ) : (
            // Modo normal - com drag and drop usando lista filtrada
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredFaqs.map((item: any) => item.id || `faq-${filteredFaqs.indexOf(item)}`)}
                strategy={verticalListSortingStrategy}
              >
                {filteredFaqs.map((faq: any, index: number) => {
                  const originalIndex = faqList.findIndex(f => f.id === faq.id);
                  const isLastInOriginalList = originalIndex === faqList.length - 1;
                  const isLastAndEmpty = isLastInOriginalList && !faq.question && !faq.answer;

                  return (
                    <SortableFAQItem
                      key={faq.id || `faq-${index}`}
                      faq={faq}
                      index={index}
                      originalIndex={originalIndex}
                      isLastInOriginalList={isLastInOriginalList}
                      isLastAndEmpty={isLastAndEmpty}
                      showValidation={showValidation}
                      faqList={faqList}
                      handleChange={handleChange}
                      openDeleteSingleModal={openDeleteSingleModal}
                      setNewItemRef={isLastAndEmpty ? setNewItemRef : undefined}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>
          )}
        </form>
      </div>

      <FixedActionBar
        onDeleteAll={openDeleteAllModal}
        onAddNew={() => addItem()}
        onSubmit={handleSubmitWrapper}
        isAddDisabled={!canAddNewItem}
        isSaving={loading}
        exists={!!exists}
        completeCount={completeCount}
        totalCount={faqList.length}
        itemName="FAQ"
        icon={HelpCircle}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateFAQs)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={faqList.length}
        itemName="FAQ"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}