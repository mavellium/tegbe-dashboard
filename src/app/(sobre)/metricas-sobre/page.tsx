/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useCallback, useId } from "react";
import { AnimatePresence } from "framer-motion";
import { useListManagement } from "@/hooks/useListManagement";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { BarChart3, GripVertical, ArrowUpDown, DollarSign, TrendingUp, Wallet, Handshake } from "lucide-react";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { SearchSortBar } from "@/components/Manage/SearchSortBar";
import { ItemHeader } from "@/components/Manage/ItemHeader";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
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
import ClientOnly from "@/components/ClientOnly";

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

// Função para extrair hex de Tailwind
const extractHexFromTailwind = (tailwindClass: string): string => {
  if (!tailwindClass) return "#0071E3";

  // Se já for hexadecimal
  if (tailwindClass.startsWith('#')) {
    return tailwindClass;
  }

  // Extrair hex de formatos bg-[#HEX], text-[#HEX], etc.
  const hexMatch = tailwindClass.match(/#([0-9A-Fa-f]{6})/);
  if (hexMatch) {
    return `#${hexMatch[1]}`;
  }

  // Extrair RGB de shadow
  const shadowMatch = tailwindClass.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
  if (shadowMatch) {
    const r = shadowMatch[1];
    const g = shadowMatch[2];
    const b = shadowMatch[3];
    return `#${parseInt(r).toString(16).padStart(2, "0")}${parseInt(g)
      .toString(16)
      .padStart(2, "0")}${parseInt(b).toString(16).padStart(2, "0")}`;
  }

  // Mapear cores básicas do Tailwind
  const tailwindColors: Record<string, string> = {
    'text-red-500': '#EF4444',
    'text-red-600': '#DC2626',
    'text-green-500': '#10B981',
    'text-green-600': '#059669',
    'text-blue-500': '#3B82F6',
    'text-blue-600': '#2563EB',
    'text-yellow-500': '#F59E0B',
    'text-yellow-600': '#D97706',
    'text-purple-500': '#8B5CF6',
    'text-purple-600': '#7C3AED',
    'text-pink-500': '#EC4899',
    'text-pink-600': '#DB2777',
    'text-indigo-500': '#6366F1',
    'text-indigo-600': '#4F46E5',
    'text-teal-500': '#14B8A6',
    'text-teal-600': '#0D9488',
    'text-orange-500': '#F97316',
    'text-orange-600': '#EA580C',
    'text-cyan-500': '#06B6D4',
    'text-cyan-600': '#0891B2',
    'text-lime-500': '#84CC16',
    'text-lime-600': '#65A30D',
    'text-rose-500': '#F43F5E',
    'text-rose-600': '#E11D48',
    'text-fuchsia-500': '#D946EF',
    'text-fuchsia-600': '#C026D3',
    'text-violet-500': '#8B5CF6',
    'text-violet-600': '#7C3AED',
    'text-amber-500': '#F59E0B',
    'text-amber-600': '#D97706',
    'text-sky-500': '#0EA5E9',
    'text-sky-600': '#0284C7',
    'text-gray-500': '#6B7280',
    'text-gray-600': '#4B5563',
    'text-slate-500': '#64748B',
    'text-slate-600': '#475569',
    'text-neutral-500': '#737373',
    'text-neutral-600': '#525252',
    'text-stone-500': '#78716C',
    'text-stone-600': '#57534E',
    'text-zinc-500': '#71717A',
    'text-zinc-600': '#52525B',
    'text-black': '#000000',
    'text-white': '#FFFFFF',
  };

  // Verificar se é uma classe Tailwind
  if (tailwindClass.startsWith('text-') && tailwindColors[tailwindClass]) {
    return tailwindColors[tailwindClass];
  }

  return "#0071E3";
};

// Função para converter hex para Tailwind text
const convertHexToTailwindText = (hex: string): string => {
  if (!hex.startsWith('#')) {
    return hex; // Já é uma classe Tailwind
  }

  // Mapear hex para classes Tailwind conhecidas
  const hexToTailwind: Record<string, string> = {
    '#EF4444': 'text-red-500',
    '#DC2626': 'text-red-600',
    '#10B981': 'text-green-500',
    '#059669': 'text-green-600',
    '#3B82F6': 'text-blue-500',
    '#2563EB': 'text-blue-600',

    '#F59E0B': 'text-amber-500',
    '#D97706': 'text-amber-600',

    '#8B5CF6': 'text-violet-500',
    '#7C3AED': 'text-violet-600',

    '#EC4899': 'text-pink-500',
    '#DB2777': 'text-pink-600',
    '#6366F1': 'text-indigo-500',
    '#4F46E5': 'text-indigo-600',
    '#14B8A6': 'text-teal-500',
    '#0D9488': 'text-teal-600',
    '#F97316': 'text-orange-500',
    '#EA580C': 'text-orange-600',
    '#06B6D4': 'text-cyan-500',
    '#0891B2': 'text-cyan-600',
    '#84CC16': 'text-lime-500',
    '#65A30D': 'text-lime-600',
    '#F43F5E': 'text-rose-500',
    '#E11D48': 'text-rose-600',
    '#D946EF': 'text-fuchsia-500',
    '#C026D3': 'text-fuchsia-600',
    '#0EA5E9': 'text-sky-500',
    '#0284C7': 'text-sky-600',
    '#6B7280': 'text-gray-500',
    '#4B5563': 'text-gray-600',
    '#64748B': 'text-slate-500',
    '#475569': 'text-slate-600',
    '#737373': 'text-neutral-500',
    '#525252': 'text-neutral-600',
    '#78716C': 'text-stone-500',
    '#57534E': 'text-stone-600',
    '#71717A': 'text-zinc-500',
    '#52525B': 'text-zinc-600',
    '#000000': 'text-black',
    '#FFFFFF': 'text-white',
    '#0071E3': 'text-[#0071E3]',
    '#1d1d1f': 'text-[#1d1d1f]',
  };

  return hexToTailwind[hex] || `text-[${hex}]`;
};

interface SortableStatsItemProps {
  statsItem: StatsItem;
  index: number;
  originalIndex: number;
  isLastInOriginalList: boolean;
  isLastAndEmpty: boolean;
  showValidation: boolean;
  statsList: StatsItem[];
  handleChange: (index: number, field: keyof StatsItem, value: any) => void;
  openDeleteSingleModal: (index: number, label: string) => void;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
}

function SortableStatsItem({
  statsItem,
  index,
  originalIndex,
  isLastInOriginalList,
  isLastAndEmpty,
  showValidation,
  statsList,
  handleChange,
  openDeleteSingleModal,
  setNewItemRef,
}: SortableStatsItemProps) {
  const stableId = useId();
  const sortableId = statsItem.id || `stats-${index}-${stableId}`;

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

  const hasValue = statsItem.value.trim() !== "";
  const hasSuffix = statsItem.suffix.trim() !== "";
  const hasLabel = statsItem.label.trim() !== "";
  const hasDescription = statsItem.description.trim() !== "";
  const hasIcon = statsItem.icon.trim() !== "";
  const hasColor = statsItem.color.trim() !== "";
  
  // Extrair hex para o ColorPicker
  const colorHex = extractHexFromTailwind(statsItem.color);
  const colorTailwind = convertHexToTailwindText(colorHex);

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
      <Card className={`mb-6 overflow-hidden transition-all duration-300 ${
        isLastInOriginalList && showValidation && !hasLabel ? 'ring-2 ring-red-500' : ''
      } ${isDragging ? 'shadow-lg scale-105' : ''} border-l-4`}>
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
                <div className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${colorHex}20`, color: colorHex }}>
                  <div className="flex items-center gap-1">
                    <IconDisplay icon={statsItem.icon} className="w-3 h-3" />
                    <span>{statsItem.label || "Estatística"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ItemHeader
                index={originalIndex}
                fields={[
                  { label: 'Valor', hasValue: hasValue },
                  { label: 'Sufixo', hasValue: hasSuffix },
                  { label: 'Título', hasValue: hasLabel },
                  { label: 'Descrição', hasValue: hasDescription },
                  { label: 'Ícone', hasValue: hasIcon },
                  { label: 'Cor', hasValue: hasColor }
                ]}
                showValidation={showValidation}
                isLast={isLastInOriginalList}
                onDelete={() => openDeleteSingleModal(originalIndex, statsItem.label)}
                showDelete={statsList.length > 1}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna 1: Dados principais */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Valor Numérico
                  </label>
                  <Input
                    type="text"
                    value={statsItem.value}
                    onChange={(e: any) => handleChange(originalIndex, "value", e.target.value)}
                    placeholder="Ex: 45, 120, 15, 98"
                    className="text-2xl font-bold text-center"
                  />
                  <p className="text-xs text-zinc-500 mt-1 text-center">
                    Use apenas números (ex: 45, 120.5, 98.7)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Sufixo
                  </label>
                  <Input
                    type="text"
                    value={statsItem.suffix}
                    onChange={(e: any) => handleChange(originalIndex, "suffix", e.target.value)}
                    placeholder="Ex: M+, %, Mi"
                    className="font-medium text-center"
                  />
                  <p className="text-xs text-zinc-500 mt-1 text-center">
                    Ex: M+ (milhões), % (porcentagem), Mi (milhões)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Título da Estatística
                </label>
                <Input
                  type="text"
                  value={statsItem.label}
                  onChange={(e: any) => handleChange(originalIndex, "label", e.target.value)}
                  placeholder="Ex: Faturamento Gerado, Média de Crescimento"
                  className="font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={statsItem.description}
                  onChange={(e: any) => handleChange(originalIndex, "description", e.target.value)}
                  rows={3}
                  placeholder="Receita direta atribuída às nossas campanhas nos últimos 12 meses."
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Coluna 2: Aparência */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Ícone
                </label>
                <IconSelector
                  value={statsItem.icon}
                  onChange={(value) => handleChange(originalIndex, "icon", value)}
                  label="Selecione um ícone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Cor Personalizada
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={colorTailwind}
                      onChange={(e: any) => {
                        const newValue = e.target.value;
                        handleChange(originalIndex, "color", newValue);
                      }}
                      placeholder="Ex: text-[#0071E3] ou text-green-600"
                      className="flex-1 font-mono"
                    />
                    <div 
                      className="w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-600 flex items-center justify-center"
                      style={{ backgroundColor: colorHex }}
                    />
                    <ColorPicker
                      color={colorHex}
                      onChange={handleColorChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { name: "Azul", value: "#0071E3", class: "text-[#0071E3]" },
                      { name: "Verde", value: "#22C55E", class: "text-green-600" },
                      { name: "Preto", value: "#1d1d1f", class: "text-[#1d1d1f]" },
                      { name: "Vermelho", value: "#EF4444", class: "text-red-600" },
                      { name: "Roxo", value: "#8B5CF6", class: "text-purple-600" },
                      { name: "Amarelo", value: "#F59E0B", class: "text-yellow-600" },
                      { name: "Rosa", value: "#EC4899", class: "text-pink-600" },
                      { name: "Ciano", value: "#06B6D4", class: "text-cyan-600" },
                      { name: "Laranja", value: "#F97316", class: "text-orange-600" },
                      { name: "Cinza", value: "#6B7280", class: "text-gray-600" },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleChange(originalIndex, "color", color.class)}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <div 
                          className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-600"
                          style={{ backgroundColor: color.value }}
                        />
                        <span className="text-xs text-zinc-600 dark:text-zinc-400">{color.name}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500">
                    Use código HEX (#0071E3) ou classes Tailwind (text-green-600). 
                    Para cores personalizadas, use text-[#HEX].
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

export default function StatsPage({ 
  type = "metricas", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  const defaultStatsItem = useMemo(() => ({ 
    value: "", 
    suffix: "",
    label: "",
    description: "",
    icon: "",
    color: "#0071E3" // Agora armazenamos como hex
  }), []);

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
    search,
    setSearch,
    sortOrder,
    setSortOrder,
    showValidation,
    filteredItems: filteredStats,
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
  } = useListManagement<StatsItem>({
    type,
    apiPath: `/api/${subtype}/form/${type}`,
    defaultItem: defaultStatsItem,
    validationFields: ["value", "suffix", "label", "description", "icon", "color"]
  });

  const remainingSlots = Math.max(0, currentPlanLimit - statsList.length);

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
      const oldIndex = statsList.findIndex((item) => 
        item.id === active.id || item.id?.includes(active.id as string)
      );
      const newIndex = statsList.findIndex((item) => 
        item.id === over.id || item.id?.includes(over.id as string)
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(statsList, oldIndex, newIndex);
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
      const filteredList = statsList.filter(
        item => item.value.trim() && item.suffix.trim() && item.label.trim() && item.description.trim() && item.icon.trim() && item.color.trim()
      );

      if (!filteredList.length) {
        setErrorMsg("Adicione ao menos uma estatística completa.");
        return;
      }

      const fd = new FormData();

      if (exists) fd.append("id", exists.id);

      // Converter cores hex para Tailwind antes de salvar
      const itemsToSave = filteredList.map(item => ({
        ...item,
        color: convertHexToTailwindText(item.color)
      }));

      fd.append(
        "values",
        JSON.stringify(itemsToSave)
      );

      const method = exists ? "PUT" : "POST";

      const res = await fetch(`/api/${subtype}/form/${type}`, {
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
        color: extractHexFromTailwind(v.color) // Converter de volta para hex
      }));

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
    const newList = [...statsList];
    newList[index] = { ...newList[index], [field]: value };
    setStatsList(newList);
  };

  const updateStats = async (list: StatsItem[]) => {
    if (!exists) return;

    const filteredList = list.filter(
      item => item.value.trim() || item.suffix.trim() || item.label.trim() || item.description.trim() || item.icon.trim() || item.color.trim()
    );

    const fd = new FormData();
    
    fd.append("id", exists.id);
    
    filteredList.forEach((item, i) => {
      fd.append(`values[${i}][value]`, item.value || "");
      fd.append(`values[${i}][suffix]`, item.suffix || "");
      fd.append(`values[${i}][label]`, item.label || "");
      fd.append(`values[${i}][description]`, item.description || "");
      fd.append(`values[${i}][icon]`, item.icon || "");
      fd.append(`values[${i}][color]`, convertHexToTailwindText(item.color) || "");
      
      if (item.id) {
        fd.append(`values[${i}][id]`, item.id);
      }
    });

    const res = await fetch(`/api/${subtype}/form/${type}`, {
      method: "PUT",
      body: fd,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Falha ao atualizar dados");
    }

    const updated = await res.json();
    
    // Converter de volta para hex
    const convertedItems = updated.values.map((item: any) => ({
      ...item,
      color: extractHexFromTailwind(item.color)
    }));

    return { ...updated, values: convertedItems };
  };

  const handleSubmitWrapper = () => {
    handleSubmit();
  };

  const stableIds = useMemo(
    () => statsList.map((item, index) => item.id ?? `stats-${index}`),
    [statsList]
  );

  return (
    <ManageLayout
      headerIcon={BarChart3}
      title="Métricas"
      description="Gerencie as Métricas e números que mostram o impacto da sua empresa"
      exists={!!exists}
      itemName="Métricas"
    >
      <div className="mb-6 space-y-4">

        <SearchSortBar
          search={search}
          setSearch={setSearch}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onClearFilters={clearFilters}
          searchPlaceholder="Buscar Métricas por título ou descrição..."
          total={statsList.length}
          showing={filteredStats.length}
          searchActiveText="ⓘ Busca ativa - não é possível adicionar nova estatística"
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
              filteredStats.map((item: any) => {
                const originalIndex = statsList.findIndex(s => s.id === item.id);
                const hasValue = item.value.trim() !== "";
                const hasSuffix = item.suffix.trim() !== "";
                const hasLabel = item.label.trim() !== "";
                const hasDescription = item.description.trim() !== "";
                const hasIcon = item.icon.trim() !== "";
                const hasColor = item.color.trim() !== "";
                const isLastInOriginalList = originalIndex === statsList.length - 1;
                const isLastAndEmpty = isLastInOriginalList && !hasValue && !hasSuffix && !hasLabel && !hasDescription && !hasIcon && !hasColor;
                const colorHex = extractHexFromTailwind(item.color);
                const colorTailwind = convertHexToTailwindText(colorHex);

                return (
                  <div
                    key={item.id || `stats-${originalIndex}`}
                    ref={isLastAndEmpty ? setNewItemRef : null}
                  >
                    <Card className={`mb-6 overflow-hidden transition-all duration-300 ${
                      isLastInOriginalList && showValidation && !hasLabel ? 'ring-2 ring-red-500' : ''
                    } border-l-4`}>
                      <div className="p-6 bg-white dark:bg-zinc-900">
                        <ItemHeader
                          index={originalIndex}
                          fields={[
                            { label: 'Valor', hasValue: hasValue },
                            { label: 'Sufixo', hasValue: hasSuffix },
                            { label: 'Título', hasValue: hasLabel },
                            { label: 'Descrição', hasValue: hasDescription },
                            { label: 'Ícone', hasValue: hasIcon },
                            { label: 'Cor', hasValue: hasColor }
                          ]}
                          showValidation={showValidation}
                          isLast={isLastInOriginalList}
                          onDelete={() => openDeleteSingleModal(originalIndex, item.label)}
                          showDelete={statsList.length > 1}
                        />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                  Valor Numérico
                                </label>
                                <Input
                                  type="text"
                                  value={item.value}
                                  onChange={(e: any) => handleChange(originalIndex, "value", e.target.value)}
                                  placeholder="Ex: 45, 120, 15, 98"
                                  className="text-2xl font-bold text-center"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                  Sufixo
                                </label>
                                <Input
                                  type="text"
                                  value={item.suffix}
                                  onChange={(e: any) => handleChange(originalIndex, "suffix", e.target.value)}
                                  placeholder="Ex: M+, %, Mi"
                                  className="font-medium text-center"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Título da Estatística
                              </label>
                              <Input
                                type="text"
                                value={item.label}
                                onChange={(e: any) => handleChange(originalIndex, "label", e.target.value)}
                                placeholder="Ex: Faturamento Gerado, Média de Crescimento"
                                className="font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Descrição
                              </label>
                              <textarea
                                value={item.description}
                                onChange={(e: any) => handleChange(originalIndex, "description", e.target.value)}
                                rows={3}
                                placeholder="Receita direta atribuída às nossas campanhas nos últimos 12 meses."
                                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                              />
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Ícone
                              </label>
                              <IconSelector
                                value={item.icon}
                                onChange={(value) => handleChange(originalIndex, "icon", value)}
                                label="Selecione um ícone"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Cor Personalizada
                              </label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="text"
                                  value={colorTailwind}
                                  onChange={(e: any) => {
                                    const newValue = e.target.value;
                                    handleChange(originalIndex, "color", newValue);
                                  }}
                                  placeholder="Ex: text-[#0071E3] ou text-green-600"
                                  className="flex-1 font-mono"
                                />
                                <div 
                                  className="w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-600 flex items-center justify-center"
                                  style={{ backgroundColor: colorHex }}
                                />
                                <ColorPicker
                                  color={colorHex}
                                  onChange={(hexColor) => handleChange(originalIndex, "color", hexColor)}
                                />
                              </div>
                            </div>

                            {/* Preview da estatística */}
                            <div className="mt-4 p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800/50 dark:to-zinc-900/50">
                              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Preview</h4>
                              <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
                                <div className="p-3 rounded-lg" style={{ backgroundColor: `${colorHex}15` }}>
                                  <IconDisplay icon={item.icon} className="w-8 h-8" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold" style={{ color: colorHex }}>
                                      {item.value || "45"}
                                    </span>
                                    <span className="text-xl font-semibold" style={{ color: colorHex }}>
                                      {item.suffix || "M+"}
                                    </span>
                                  </div>
                                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                                    {item.label || "Faturamento Gerado"}
                                  </h3>
                                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                    {item.description || "Receita direta atribuída às nossas campanhas nos últimos 12 meses."}
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
                    {statsList.map((item, index) => {
                      const originalIndex = index;
                      const hasValue = item.value.trim() !== "";
                      const hasSuffix = item.suffix.trim() !== "";
                      const hasLabel = item.label.trim() !== "";
                      const hasDescription = item.description.trim() !== "";
                      const hasIcon = item.icon.trim() !== "";
                      const hasColor = item.color.trim() !== "";
                      const isLastInOriginalList = index === statsList.length - 1;
                      const isLastAndEmpty = isLastInOriginalList && !hasValue && !hasSuffix && !hasLabel && !hasDescription && !hasIcon && !hasColor;

                      return (
                        <SortableStatsItem
                          key={stableIds[index]}
                          statsItem={item}
                          index={index}
                          originalIndex={originalIndex}
                          isLastInOriginalList={isLastInOriginalList}
                          isLastAndEmpty={isLastAndEmpty}
                          showValidation={showValidation}
                          statsList={statsList}
                          handleChange={handleChange}
                          openDeleteSingleModal={openDeleteSingleModal}
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
        totalCount={statsList.length}
        itemName="Estatística"
        icon={BarChart3}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateStats)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={statsList.length}
        itemName="Estatística"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}