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
  Settings, 
  GripVertical, 
  ArrowUpDown, 
  AlertCircle, 
  CheckCircle2, 
  Trash2,
  XCircle,
  Search,
  Target,
  Tag,
  Type,
  Sparkles,
  Palette
} from "lucide-react";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { ImageUpload } from "@/components/ImageUpload";
import IconSelector from "@/components/IconSelector";
import ColorPicker from "@/components/ColorPicker";
import { extractHexFromTailwind } from "@/lib/colorUtils";
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

interface ServiceItem {
  id?: string;
  title: string;
  subtitle: string; // Novo campo: subtítulo/título secundário
  badge: string; // Novo campo: badge/etiqueta
  description: string;
  file?: File | null;
  image?: string;
  icon: string;
  color: string; // Nova: cor personalizada
  badgeColor: string; // Nova: cor do badge
  effect: "none" | "glow" | "pulse" | "shadow" | "gradient"; // Nova: efeito visual
}


const CustomCard = ({ style, children, className, ...props }: any) => {
  return (
    <div style={style} className={className}>
      <Card {...props}>{children}</Card>
    </div>
  );
};

const effectOptions = [
  { value: "none", label: "Sem Efeito" },
  { value: "glow", label: "Brilho Suave" },
  { value: "pulse", label: "Pulsação Leve" },
  { value: "shadow", label: "Sombra Elevada" },
  { value: "gradient", label: "Gradiente" },
];

function SortableServiceItem({
  service,
  index,
  originalIndex,
  isLastInOriginalList,
  isLastAndEmpty,
  showValidation,
  serviceList,
  handleChange,
  handleFileChange,
  openDeleteSingleModal,
  getImageUrl,
  setNewItemRef,
}: {
  service: ServiceItem;
  index: number;
  originalIndex: number;
  isLastInOriginalList: boolean;
  isLastAndEmpty: boolean;
  showValidation: boolean;
  serviceList: ServiceItem[];
  handleChange: (index: number, field: keyof ServiceItem, value: any) => void;
  handleFileChange: (index: number, file: File | null) => void;
  openDeleteSingleModal: (index: number, title: string) => void;
  getImageUrl: (service: ServiceItem) => string;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
}) {
  const stableId = useId();
  const sortableId = service.id || `service-${index}-${stableId}`;

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

  const hasTitle = service.title.trim() !== "";
  const hasSubtitle = service.subtitle.trim() !== "";
  const hasBadge = service.badge.trim() !== "";
  const hasDescription = service.description.trim() !== "";
  const hasIcon = service.icon.trim() !== "";
  const hasImage = Boolean(service.image?.trim() !== "" || service.file);
  const hasColor = service.color.trim() !== "";
  const hasBadgeColor = service.badgeColor.trim() !== "";
  
  const colorHex = extractHexFromTailwind(service.color);
  const badgeColorHex = extractHexFromTailwind(service.badgeColor);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      
      if (isLastAndEmpty && setNewItemRef) {
        setNewItemRef(node);
      }
    },
    [setNodeRef, isLastAndEmpty, setNewItemRef]
  );

  const handleColorChange = (hexColor: string, type: "main" | "badge") => {
    const field = type === "main" ? "color" : "badgeColor";
    handleChange(originalIndex, field, hexColor);
  };

  const getEffectClasses = (effect: string) => {
    switch (effect) {
      case "glow":
        return "shadow-lg shadow-current/20";
      case "pulse":
        return "animate-pulse";
      case "shadow":
        return "shadow-2xl";
      case "gradient":
        return "bg-gradient-to-r from-current to-transparent";
      default:
        return "";
    }
  };

  return (
    <div
      ref={setRefs}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <CustomCard
        style={{ borderLeftColor: colorHex || '#3B82F6' }}
        className={`mb-4 overflow-hidden transition-all duration-300 border-l-4 ${
          isLastInOriginalList && showValidation && (!hasTitle || !hasDescription || !hasIcon) 
            ? 'ring-2 ring-[var(--color-danger)]' 
            : ''
        } ${isDragging ? 'shadow-lg scale-105' : ''} bg-[var(--color-background)]`}
      >
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
                      {service.title}
                    </h4>
                  ) : (
                    <h4 className="font-medium text-[var(--color-secondary)]/50">
                      Serviço sem título
                    </h4>
                  )}
                  {hasTitle && hasDescription && hasIcon && hasImage ? (
                    <span className="px-2 py-1 text-xs bg-[var(--color-success)]/20 text-[var(--color-success)] rounded-full border border-[var(--color-success)]/30">
                      Completo
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-[var(--color-warning)]/20 text-[var(--color-warning)] rounded-full border border-[var(--color-warning)]/30">
                      Incompleto
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              type="button"
              onClick={() => openDeleteSingleModal(originalIndex, service.title || "Serviço sem título")}
              variant="danger"
              className="whitespace-nowrap bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 border-none flex items-center gap-2"
              disabled={serviceList.length <= 1}
            >
              <Trash2 className="w-4 h-4" />
              Remover
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Imagem do Serviço
                </label>
                <ImageUpload
                  label="Imagem de Destaque"
                  description="Formatos suportados: JPG, PNG, WEBP. Tamanho recomendado: 800x400px."
                  currentImage={service.image || ""}
                  selectedFile={service.file || null}
                  onFileChange={(file) => handleFileChange(originalIndex, file)}
                  aspectRatio="aspect-video"
                  previewWidth={300}
                  previewHeight={150}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                  Ícone do Serviço
                </label>
                <IconSelector
                  value={service.icon}
                  onChange={(value: string) => handleChange(originalIndex, "icon", value)}
                  label="Selecione um ícone para o serviço"
                />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Título do Serviço
                  </label>
                  <Input
                    type="text"
                    value={service.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(originalIndex, "title", e.target.value)}
                    placeholder="Ex: Aquisição Cirúrgica"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] text-lg font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Subtítulo
                  </label>
                  <Input
                    type="text"
                    value={service.subtitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(originalIndex, "subtitle", e.target.value)}
                    placeholder="Ex: Tráfego pago de alta conversão"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Badge/Etiqueta
                  </label>
                  <Input
                    type="text"
                    value={service.badge}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(originalIndex, "badge", e.target.value)}
                    placeholder="Ex: Popular, Novo, Destaque"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Efeito Visual
                  </label>
                  <select
                    value={service.effect}
                    onChange={(e) => handleChange(originalIndex, "effect", e.target.value)}
                    className="w-full p-2 rounded-lg bg-[var(--color-background-body)] border border-[var(--color-border)] text-[var(--color-secondary)]"
                  >
                    {effectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Cor Principal
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={service.color}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange(originalIndex, "color", e.target.value);
                      }}
                      placeholder="Ex: #3B82F6"
                      className="flex-1 font-mono bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <ColorPicker
                      color={colorHex}
                      onChange={(hex: string) => handleColorChange(hex, "main")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Cor do Badge
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="Ex: #EF4444"
                      value={service.badgeColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(originalIndex, "badgeColor", e.target.value)}
                      className="flex-1 font-mono bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <ColorPicker
                      color={badgeColorHex}
                      onChange={(hex: string) => handleColorChange(hex, "badge")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <TextArea
                  label="Descrição do Serviço"
                  placeholder="Ex: Tráfego pago focado em ICPs (Perfis de Cliente Ideal). Ignoramos curiosos e atraímos decisores com Google e Meta Ads de alta intenção."
                  value={service.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    handleChange(originalIndex, "description", e.target.value)
                  }
                  rows={4}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>
            </div>
          </div>
        </div>
      </CustomCard>
    </div>
  );
}

export default function ServicesPage({ 
  type = "services", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  const defaultService = useMemo(() => ({ 
    title: "", 
    subtitle: "",
    badge: "",
    description: "",
    icon: "",
    color: "#3B82F6",
    badgeColor: "#EF4444",
    effect: "none" as const,
    file: null, 
    image: ""
  }), []);

  const [localServices, setLocalServices] = useState<ServiceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const apiBase = `/api/${subtype}/form`;

  const {
    list: serviceList,
    setList: setServiceList,
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
  } = useListManagement<ServiceItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem: defaultService,
    validationFields: ["title", "description", "icon", "image"]
  });

  // Sincroniza serviços locais
  useEffect(() => {
    setLocalServices(serviceList);
  }, [serviceList]);

  const newServiceRef = useRef<HTMLDivElement>(null);

  const setNewItemRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      newServiceRef.current = node;
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
      const oldIndex = localServices.findIndex((item) => 
        item.id === active.id || item.id?.includes(active.id as string)
      );
      const newIndex = localServices.findIndex((item) => 
        item.id === over.id || item.id?.includes(over.id as string)
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(localServices, oldIndex, newIndex);
        setLocalServices(newList);
        setServiceList(newList);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const filteredList = localServices.filter(
        service => service.title.trim() && service.description.trim() && service.icon.trim() && (service.image?.trim() || service.file)
      );

      if (!filteredList.length) {
        setErrorMsg("Adicione ao menos um serviço completo com título, descrição, ícone e imagem.");
        return;
      }

      const fd = new FormData();

      if (exists) fd.append("id", exists.id);

      fd.append(
        "values",
        JSON.stringify(
          filteredList.map(service => ({
            ...service,
            subtitle: service.subtitle || "",
            badge: service.badge || "",
            color: service.color || "#3B82F6",
            badgeColor: service.badgeColor || "#EF4444",
            effect: service.effect || "none",
            file: undefined
          }))
        )
      );

      filteredList.forEach((service, i) => {
        if (service.file) {
          fd.append(`file${i}`, service.file);
        }
      });

      const method = exists ? "PUT" : "POST";

      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar serviços");
      }

      const saved = await res.json();

      const normalized = saved.values.map((v: any, i: number) => ({
        ...v,
        subtitle: v.subtitle || "",
        badge: v.badge || "",
        color: v.color || "#3B82F6",
        badgeColor: v.badgeColor || "#EF4444",
        effect: v.effect || "none",
        id: v.id || `service-${Date.now()}-${i}`,
        file: null,
      }));

      setLocalServices(normalized);
      setServiceList(normalized);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof ServiceItem, value: any) => {
    const newList = [...localServices];
    newList[index] = { ...newList[index], [field]: value };
    setLocalServices(newList);
    setServiceList(newList);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newList = [...localServices];
    newList[index] = { ...newList[index], file };
    setLocalServices(newList);
    setServiceList(newList);
  };

  const getImageUrl = (service: ServiceItem): string => {
    if (service.file) {
      return URL.createObjectURL(service.file);
    }
    if (service.image) {
      if (service.image.startsWith('http') || service.image.startsWith('//')) {
        return service.image;
      } else {
        return `https://mavellium.com.br${service.image.startsWith('/') ? '' : '/'}${service.image}`;
      }
    }
    return "";
  };

  const updateServices = async (list: ServiceItem[]) => {
    if (!exists) return;

    const filteredList = list.filter(
      service => service.title.trim() || service.description.trim() || service.icon.trim() || service.file || service.image
    );

    const fd = new FormData();
    
    fd.append("id", exists.id);
    
    filteredList.forEach((service, i) => {
      fd.append(`values[${i}][title]`, service.title || "");
      fd.append(`values[${i}][subtitle]`, service.subtitle || "");
      fd.append(`values[${i}][badge]`, service.badge || "");
      fd.append(`values[${i}][description]`, service.description || "");
      fd.append(`values[${i}][icon]`, service.icon || "");
      fd.append(`values[${i}][color]`, service.color || "#3B82F6");
      fd.append(`values[${i}][badgeColor]`, service.badgeColor || "#EF4444");
      fd.append(`values[${i}][effect]`, service.effect || "none");
      fd.append(`values[${i}][image]`, service.image || "");
      
      if (service.file) {
        fd.append(`file${i}`, service.file);
      }
      
      if (service.id) {
        fd.append(`values[${i}][id]`, service.id);
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

  const handleAddService = () => {
    if (localServices.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: ServiceItem = {
      title: '',
      subtitle: '',
      badge: '',
      description: '',
      icon: '',
      color: '#3B82F6',
      badgeColor: '#EF4444',
      effect: 'none',
      file: null,
      image: ''
    };
    
    const updated = [...localServices, newItem];
    setLocalServices(updated);
    setServiceList(updated);
    
    setTimeout(() => {
      newServiceRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const filteredServices = useMemo(() => {
    let filtered = [...localServices];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(term) ||
        service.subtitle.toLowerCase().includes(term) ||
        service.badge.toLowerCase().includes(term) ||
        service.description.toLowerCase().includes(term) ||
        service.icon.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [localServices, searchTerm]);

  const isServicesLimitReached = localServices.length >= currentPlanLimit;
  const canAddNewService = !isServicesLimitReached;
  const servicesCompleteCount = localServices.filter(service => 
    service.title.trim() !== '' && 
    service.description.trim() !== '' && 
    service.icon.trim() !== '' &&
    (service.image?.trim() !== '' || service.file)
  ).length;
  const servicesTotalCount = localServices.length;

  const servicesValidationError = isServicesLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Cada serviço tem 9 campos (incluindo os novos)
    total += localServices.length * 9;
    localServices.forEach(service => {
      if (service.title.trim()) completed++;
      if (service.subtitle.trim()) completed++;
      if (service.badge.trim()) completed++;
      if (service.description.trim()) completed++;
      if (service.icon.trim()) completed++;
      if (service.color.trim()) completed++;
      if (service.badgeColor.trim()) completed++;
      if (service.effect.trim()) completed++;
      if (service.image?.trim() || service.file) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  const stableIds = useMemo(
    () => localServices.map((item, index) => item.id ?? `service-${index}`),
    [localServices]
  );

  return (
    <ManageLayout
      headerIcon={Settings}
      title="Serviços"
      description="Gerencie os serviços oferecidos pela sua empresa"
      exists={!!exists}
      itemName="Serviços"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Cabeçalho de Controle */}
        <Card className="p-6 bg-[var(--color-background)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                Gerenciamento de Serviços
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span className="text-sm text-[var(--color-secondary)]/70">
                    {servicesCompleteCount} de {servicesTotalCount} completos
                  </span>
                </div>
                <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                <span className="text-sm text-[var(--color-secondary)]/70">
                  Campos: {completion.completed}/{completion.total}
                </span>
                <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                <span className="text-sm text-[var(--color-secondary)]/70">
                  Limite: {currentPlanLimit} itens
                </span>
              </div>
            </div>
          </div>

          {/* Barra de busca */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--color-secondary)]">
              Buscar Serviços
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]/70" />
              <Input
                type="text"
                placeholder="Buscar serviços por título, subtítulo, badge, descrição ou ícone..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Mensagem de erro */}
        {servicesValidationError && (
          <div className={`p-3 rounded-lg ${isServicesLimitReached 
            ? 'bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30' 
            : 'bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30'}`}>
            <div className="flex items-start gap-2">
              {isServicesLimitReached ? (
                <XCircle className="w-5 h-5 text-[var(--color-danger)] flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${isServicesLimitReached 
                ? 'text-[var(--color-danger)]' 
                : 'text-[var(--color-warning)]'}`}>
                {servicesValidationError}
              </p>
            </div>
          </div>
        )}

        {/* Lista de Serviços */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredServices.length === 0 ? (
              <Card className="p-8 bg-[var(--color-background)]">
                <div className="text-center">
                  <Settings className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                    Nenhum serviço encontrado
                  </h3>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    {searchTerm ? 'Tente ajustar sua busca ou limpe o filtro' : 'Adicione seu primeiro serviço usando o botão abaixo'}
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
                  {filteredServices.map((service, index) => {
                    const originalIndex = localServices.findIndex(s => s.id === service.id) || index;
                    const hasTitle = service.title.trim() !== "";
                    const hasSubtitle = service.subtitle.trim() !== "";
                    const hasBadge = service.badge.trim() !== "";
                    const hasDescription = service.description.trim() !== "";
                    const hasIcon = service.icon.trim() !== "";
                    const hasImage = Boolean(service.image?.trim() !== "" || service.file);
                    const hasColor = service.color.trim() !== "";
                    const hasBadgeColor = service.badgeColor.trim() !== "";
                    const isLastInOriginalList = originalIndex === localServices.length - 1;
                    const isLastAndEmpty = isLastInOriginalList && !hasTitle && !hasSubtitle && !hasBadge && !hasDescription && !hasIcon && !hasImage && !hasColor && !hasBadgeColor;

                    return (
                      <SortableServiceItem
                        key={stableIds[index]}
                        service={service}
                        index={index}
                        originalIndex={originalIndex}
                        isLastInOriginalList={isLastInOriginalList}
                        isLastAndEmpty={isLastAndEmpty}
                        showValidation={showValidation}
                        serviceList={localServices}
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
          onAddNew={handleAddService}
          isAddDisabled={!canAddNewService}
          isSaving={loading}
          exists={!!exists}
          totalCount={completion.total}
          itemName="Serviço"
          icon={Settings}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateServices)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={localServices.length}
        itemName="Serviço"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}