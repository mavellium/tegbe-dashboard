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
  BarChart3, 
  GripVertical, 
  ArrowUpDown, 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  Handshake,
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
import { extractHexFromTailwind } from "@/lib/colorUtils";
import IconSelector from "@/components/IconSelector";
import ColorPicker from "@/components/ColorPicker";
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

interface StatsItem {
  id?: string;
  value: string;
  suffix: string;
  label: string;
  description: string;
  icon: string;
  color: string; // Armazena como hex (#0071E3)
}

const iconMap: Record<string, any> = {
  "ph:currency-dollar-bold": DollarSign,
  "ph:chart-line-up-bold": TrendingUp,
  "ph:wallet-bold": Wallet,
  "ph:handshake-bold": Handshake,
};

const IconDisplay = ({ icon, className = "w-5 h-5" }: { icon: string, className?: string }) => {
  const LucideIcon = iconMap[icon];
  
  if (LucideIcon) {
    return <LucideIcon className={className} />;
  }
  
  return (
    <div className={`${className} flex items-center justify-center`}>
      <span className="text-xs">Ícone</span>
    </div>
  );
};

function SortableStatsItem({
  stats,
  index,
  originalIndex,
  isLastInOriginalList,
  isLastAndEmpty,
  showValidation,
  statsList,
  handleChange,
  openDeleteSingleModal,
  setNewItemRef,
}: {
  stats: StatsItem;
  index: number;
  originalIndex: number;
  isLastInOriginalList: boolean;
  isLastAndEmpty: boolean;
  showValidation: boolean;
  statsList: StatsItem[];
  handleChange: (index: number, field: keyof StatsItem, value: any) => void;
  openDeleteSingleModal: (index: number, label: string) => void;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
}) {
  const stableId = useId();
  const sortableId = stats.id || `stats-${index}-${stableId}`;

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

  const hasValue = stats.value.trim() !== "";
  const hasSuffix = stats.suffix.trim() !== "";
  const hasLabel = stats.label.trim() !== "";
  const hasDescription = stats.description.trim() !== "";
  const hasIcon = stats.icon.trim() !== "";
  const hasColor = stats.color.trim() !== "";
  
  // Extrair hex para exibição
  const colorHex = extractHexFromTailwind(stats.color);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      
      if (isLastAndEmpty && setNewItemRef) {
        setNewItemRef(node);
      }
    },
    [setNodeRef, isLastAndEmpty, setNewItemRef]
  );

  const handleColorChange = (hexColor: string) => {
    handleChange(originalIndex, "color", hexColor);
  };

  return (
    <div
      ref={setRefs}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
        isLastInOriginalList && showValidation && !hasLabel ? 'ring-2 ring-[var(--color-danger)]' : ''
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
                  {hasLabel ? (
                    <h4 className="font-medium text-[var(--color-secondary)]">
                      {stats.label}
                    </h4>
                  ) : (
                    <h4 className="font-medium text-[var(--color-secondary)]/50">
                      Estatística sem título
                    </h4>
                  )}
                  {hasValue && hasSuffix && hasLabel && hasDescription && hasIcon && hasColor ? (
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
              onClick={() => openDeleteSingleModal(originalIndex, stats.label || "Estatística sem título")}
              variant="danger"
              className="whitespace-nowrap bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 border-none flex items-center gap-2"
              disabled={statsList.length <= 1}
            >
              <Trash2 className="w-4 h-4" />
              Remover
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                  Ícone
                </label>
                <IconSelector
                  value={stats.icon}
                  onChange={(value) => handleChange(originalIndex, "icon", value)}
                  label="Selecione um ícone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                  Cor Personalizada
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={stats.color}
                      onChange={(e: any) => {
                        handleChange(originalIndex, "color", e.target.value);
                      }}
                      placeholder="Ex: #0071E3 ou text-[#0071E3]"
                      className="flex-1 font-mono bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <ColorPicker
                      color={colorHex}
                      onChange={handleColorChange}
                    />
                  </div>
                  <p className="text-xs text-[var(--color-secondary)]/70">
                    Use código HEX (#0071E3) ou classes Tailwind (text-[#HEX])
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Valor Numérico
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: 45, 120, 15.5, 98.7"
                    value={stats.value}
                    onChange={(e: any) => handleChange(originalIndex, "value", e.target.value)}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Use números com ou sem decimais
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Sufixo
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: M+, %, Mi"
                    value={stats.suffix}
                    onChange={(e: any) => handleChange(originalIndex, "suffix", e.target.value)}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Ex: M+ (milhões), % (porcentagem), Mi (milhões)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Título da Estatística
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Faturamento Gerado, Média de Crescimento"
                  value={stats.label}
                  onChange={(e: any) => handleChange(originalIndex, "label", e.target.value)}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Descrição Detalhada
                </label>
                <TextArea
                  label="Descrição"
                  placeholder="Receita direta atribuída às nossas campanhas nos últimos 12 meses."
                  value={stats.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    handleChange(originalIndex, "description", e.target.value)
                  }
                  rows={4}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                  Explique o significado e contexto da estatística
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function StatsPage({ 
  type = "metricas", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  const defaultStats = useMemo(() => ({ 
    value: "", 
    suffix: "",
    label: "",
    description: "",
    icon: "",
    color: "#0071E3" // Armazena como hex
  }), []);

  const [localStats, setLocalStats] = useState<StatsItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const apiBase = `/api/${subtype}/form`;

  const {
    list: statsList,
    setList: setStatsList,
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
  } = useListManagement<StatsItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem: defaultStats,
    validationFields: ["value", "suffix", "label", "description", "icon", "color"]
  });

  // Sincroniza stats locais
  useEffect(() => {
    setLocalStats(statsList);
  }, [statsList]);

  const newStatsRef = useRef<HTMLDivElement>(null);

  const setNewItemRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      newStatsRef.current = node;
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
      const oldIndex = localStats.findIndex((item) => 
        item.id === active.id || item.id?.includes(active.id as string)
      );
      const newIndex = localStats.findIndex((item) => 
        item.id === over.id || item.id?.includes(over.id as string)
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(localStats, oldIndex, newIndex);
        setLocalStats(newList);
        setStatsList(newList);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const filteredList = localStats.filter(
        stats => stats.value.trim() && stats.suffix.trim() && stats.label.trim() && 
                stats.description.trim() && stats.icon.trim() && stats.color.trim()
      );

      if (!filteredList.length) {
        setErrorMsg("Adicione ao menos uma estatística completa com todos os campos preenchidos.");
        return;
      }

      const fd = new FormData();

      if (exists) fd.append("id", exists.id);

      fd.append(
        "values",
        JSON.stringify(filteredList)
      );

      const method = exists ? "PUT" : "POST";

      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar Métricas");
      }

      const saved = await res.json();

      const normalized = saved.values.map((v: any, i: number) => ({
        ...v,
        id: v.id || `stats-${Date.now()}-${i}`,
      }));

      setLocalStats(normalized);
      setStatsList(normalized);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof StatsItem, value: any) => {
    const newList = [...localStats];
    newList[index] = { ...newList[index], [field]: value };
    setLocalStats(newList);
    setStatsList(newList);
  };

  const updateStats = async (list: StatsItem[]) => {
    if (!exists) return;

    const filteredList = list.filter(
      stats => stats.value.trim() || stats.suffix.trim() || stats.label.trim() || 
               stats.description.trim() || stats.icon.trim() || stats.color.trim()
    );

    const fd = new FormData();
    
    fd.append("id", exists.id);
    
    filteredList.forEach((stats, i) => {
      fd.append(`values[${i}][value]`, stats.value);
      fd.append(`values[${i}][suffix]`, stats.suffix);
      fd.append(`values[${i}][label]`, stats.label);
      fd.append(`values[${i}][description]`, stats.description);
      fd.append(`values[${i}][icon]`, stats.icon);
      fd.append(`values[${i}][color]`, stats.color);
      
      if (stats.id) {
        fd.append(`values[${i}][id]`, stats.id);
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

  const handleAddStats = () => {
    if (localStats.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: StatsItem = {
      value: '',
      suffix: '',
      label: '',
      description: '',
      icon: '',
      color: '#0071E3'
    };
    
    const updated = [...localStats, newItem];
    setLocalStats(updated);
    setStatsList(updated);
    
    setTimeout(() => {
      newStatsRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const filteredStats = useMemo(() => {
    let filtered = [...localStats];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(stats => 
        stats.label.toLowerCase().includes(term) ||
        stats.description.toLowerCase().includes(term) ||
        stats.value.toLowerCase().includes(term) ||
        stats.suffix.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [localStats, searchTerm]);

  const isStatsLimitReached = localStats.length >= currentPlanLimit;
  const canAddNewStats = !isStatsLimitReached;
  const statsCompleteCount = localStats.filter(stats => 
    stats.value.trim() !== '' && 
    stats.suffix.trim() !== '' && 
    stats.label.trim() !== '' && 
    stats.description.trim() !== '' &&
    stats.icon.trim() !== '' &&
    stats.color.trim() !== ''
  ).length;
  const statsTotalCount = localStats.length;

  const statsValidationError = isStatsLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Cada estatística tem 6 campos
    total += localStats.length * 6;
    localStats.forEach(stats => {
      if (stats.value.trim()) completed++;
      if (stats.suffix.trim()) completed++;
      if (stats.label.trim()) completed++;
      if (stats.description.trim()) completed++;
      if (stats.icon.trim()) completed++;
      if (stats.color.trim()) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  const stableIds = useMemo(
    () => localStats.map((item, index) => item.id ?? `stats-${index}`),
    [localStats]
  );

  return (
    <ManageLayout
      headerIcon={BarChart3}
      title="Métricas"
      description="Gerencie as Métricas e números que mostram o impacto da sua empresa"
      exists={!!exists}
      itemName="Métricas"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Cabeçalho de Controle */}
        <Card className="p-6 bg-[var(--color-background)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                Gerenciamento de Métricas
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span className="text-sm text-[var(--color-secondary)]/70">
                    {statsCompleteCount} de {statsTotalCount} completos
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
              Buscar Métricas
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]/70" />
              <Input
                type="text"
                placeholder="Buscar métricas por título, valor ou descrição..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Mensagem de erro */}
        {statsValidationError && (
          <div className={`p-3 rounded-lg ${isStatsLimitReached 
            ? 'bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30' 
            : 'bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30'}`}>
            <div className="flex items-start gap-2">
              {isStatsLimitReached ? (
                <XCircle className="w-5 h-5 text-[var(--color-danger)] flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${isStatsLimitReached 
                ? 'text-[var(--color-danger)]' 
                : 'text-[var(--color-warning)]'}`}>
                {statsValidationError}
              </p>
            </div>
          </div>
        )}

        {/* Lista de Métricas */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredStats.length === 0 ? (
              <Card className="p-8 bg-[var(--color-background)]">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                    Nenhuma métrica encontrada
                  </h3>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    {searchTerm ? 'Tente ajustar sua busca ou limpe o filtro' : 'Adicione sua primeira métrica usando o botão abaixo'}
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
                  {filteredStats.map((stats, index) => {
                    const originalIndex = localStats.findIndex(s => s.id === stats.id) || index;
                    const hasValue = stats.value.trim() !== "";
                    const hasSuffix = stats.suffix.trim() !== "";
                    const hasLabel = stats.label.trim() !== "";
                    const hasDescription = stats.description.trim() !== "";
                    const hasIcon = stats.icon.trim() !== "";
                    const hasColor = stats.color.trim() !== "";
                    const isLastInOriginalList = originalIndex === localStats.length - 1;
                    const isLastAndEmpty = isLastInOriginalList && !hasValue && !hasSuffix && !hasLabel && !hasDescription && !hasIcon && !hasColor;

                    return (
                      <SortableStatsItem
                        key={stableIds[index]}
                        stats={stats}
                        index={index}
                        originalIndex={originalIndex}
                        isLastInOriginalList={isLastInOriginalList}
                        isLastAndEmpty={isLastAndEmpty}
                        showValidation={showValidation}
                        statsList={localStats}
                        handleChange={handleChange}
                        openDeleteSingleModal={openDeleteSingleModal}
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
          onAddNew={handleAddStats}
          isAddDisabled={!canAddNewStats}
          isSaving={loading}
          exists={!!exists}
          totalCount={completion.total}
          itemName="Métrica"
          icon={BarChart3}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateStats)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={localStats.length}
        itemName="Métrica"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}