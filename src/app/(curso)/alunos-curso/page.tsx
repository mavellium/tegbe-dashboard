/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback, useId } from "react";
import { motion } from "framer-motion";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Switch } from "@/components/Switch";
import { Button } from "@/components/Button";
import IconSelector from "@/components/IconSelector";
import { 
  MessageCircle,
  Video,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Settings,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Zap,
  Tag,
  Users,
  TrendingUp,
  BarChart3,
  GripVertical,
  ArrowUpDown,
  Star,
  Text,
  Palette,
  Sparkles,
  Heading
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import ColorPicker from "@/components/ColorPicker";
import { ImageUpload } from "@/components/ImageUpload";
import { VideoUpload } from "@/components/VideoUpload";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { tailwindToHex, hexToTailwindTextClass } from "@/lib/colors";

interface FooterStat {
  id?: string;
  value: string;
  label: string;
  icon?: string;
  color?: string;
}

interface Testimonial {
  id: string;
  type: "video" | "image" | "text"; // Adicionado tipo "text"
  clientName: string;
  clientRole: string;
  description: string;
  src?: string;
  poster?: string;
  stats?: {
    value: string;
    label: string;
  };
}

interface TestimonialsData {
  badge?: string; // NOVO CAMPO
  titulo: string;
  subtitulo: string;
  showStats: boolean;
  textColor?: string; // NOVO CAMPO
  backgroundColor?: string; // NOVO CAMPO
  footerStats: FooterStat[];
  testimonials: Testimonial[];
}

const defaultData: TestimonialsData = {
  badge: "DEPOIMENTOS",
  titulo: "Cases de Sucesso",
  subtitulo: "Transformação Digital",
  showStats: true,
  textColor: "#FFFFFF",
  backgroundColor: "#020202",
  footerStats: [
    {
      id: "1",
      value: "",
      label: "",
      icon: "ph:graduation-cap-fill",
      color: ""
    },
  ],
  testimonials: []
};

const mergeWithDefaults = (apiData: any, defaultData: TestimonialsData): TestimonialsData => {
  if (!apiData) return defaultData;
  
  return {
    badge: apiData.badge || defaultData.badge,
    titulo: apiData.titulo || defaultData.titulo,
    subtitulo: apiData.subtitulo || defaultData.subtitulo,
    showStats: apiData.showStats ?? defaultData.showStats,
    textColor: apiData.textColor || defaultData.textColor,
    backgroundColor: apiData.backgroundColor || defaultData.backgroundColor,
    footerStats: apiData.footerStats?.map((stat: any, index: number) => ({
      id: stat.id || `stat-${index}`,
      value: stat.value || "",
      label: stat.label || "",
      icon: stat.icon || "",
      color: stat.color || ""
    })) || defaultData.footerStats,
    testimonials: apiData.testimonials?.map((testimonial: any, index: number) => ({
      id: testimonial.id || `testimonial-${index}`,
      type: testimonial.type || "video",
      clientName: testimonial.clientName || "",
      clientRole: testimonial.clientRole || "",
      description: testimonial.description || "",
      src: testimonial.src || "",
      poster: testimonial.poster || "",
      stats: testimonial.stats || undefined
    })) || defaultData.testimonials,
  };
};

// Componente Sortable para footerStats
function SortableFooterStatItem({
  item,
  index,
  handleChange,
  openDeleteSingleModal,
}: {
  item: FooterStat;
  index: number;
  handleChange: (index: number, field: keyof FooterStat, value: any) => void;
  openDeleteSingleModal: (index: number, title: string) => void;
}) {
  const stableId = useId();
  const sortableId = item.id || `footerstat-${index}-${stableId}`;

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

  const hasValue = item.value.trim() !== "";
  const hasLabel = item.label.trim() !== "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
        isDragging ? 'shadow-lg scale-105' : ''
      } bg-[var(--color-background)] border-l-4 border-[var(--color-primary)]`}>
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
                      {item.label}
                    </h4>
                  ) : (
                    <h4 className="font-medium text-[var(--color-secondary)]/50">
                      Estatística sem título
                    </h4>
                  )}
                  {hasValue && hasLabel ? (
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
              onClick={() => openDeleteSingleModal(index, item.label || "Estatística sem título")}
              variant="danger"
              className="whitespace-nowrap bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 border-none flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Remover
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Valor da Estatística
                </label>
                <Input
                  type="text"
                  value={item.value}
                  onChange={(e: any) => handleChange(index, "value", e.target.value)}
                  placeholder="Ex: 2.5k+, R$ 78M+, 98%"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-bold text-lg"
                />
                <p className="mt-1 text-xs text-[var(--color-secondary)]/50">
                  Valor numérico da estatística (pode incluir símbolos como +, %, R$)
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Rótulo da Estatística
                  </label>
                  <Input
                    type="text"
                    value={item.label}
                    onChange={(e: any) => handleChange(index, "label", e.target.value)}
                    placeholder="Ex: Alunos Certificados"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div>
                  <IconSelector
                    value={item.icon || ""}
                    onChange={(value) => handleChange(index, "icon", value)}
                    label="Ícone"
                    placeholder="ph:graduation-cap-fill"
                  />
                  <p className="mt-1 text-xs text-[var(--color-secondary)]/50">
                    Ícone opcional para a estatística
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Cor do Ícone
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={item.color || ""}
                      onChange={(e: any) => handleChange(index, "color", e.target.value)}
                      placeholder="#FFD700"
                      className="flex-1 font-mono bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <ColorPicker
                      color={item.color || "#FFD700"}
                      onChange={(color) => handleChange(index, "color", color)}
                    />
                    <div 
                      className="w-10 h-10 rounded-lg border border-[var(--color-border)]"
                      style={{ backgroundColor: item.color || "#FFD700" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Componente para renderizar um depoimento
const TestimonialItem = ({
  testimonial,
  index,
  isExpanded,
  onToggle,
  onUpdate,
  onRemove,
  onMove,
  onFileChange,
  getFileFromState,
}: {
  testimonial: Testimonial;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<Testimonial>) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
  onFileChange: (field: string, file: File | null) => void;
  getFileFromState: (key: string) => File | null;
}) => {
  const TypeIcon = testimonial.type === "video" ? Video : 
                   testimonial.type === "image" ? ImageIcon : 
                   Text;

  return (
    <div className="space-y-4">
      <div
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-[var(--color-background-body)] rounded-lg hover:bg-[var(--color-background-body)]/80 transition-colors cursor-pointer border border-[var(--color-border)]"
      >
        <div className="flex items-center gap-3">
          <TypeIcon className="w-5 h-5 text-[var(--color-secondary)]" />
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                testimonial.type === "video" 
                  ? "bg-blue-500/10 text-blue-500" 
                  : testimonial.type === "image"
                  ? "bg-purple-500/10 text-purple-500"
                  : "bg-green-500/10 text-green-500"
              }`}>
                {testimonial.type.toUpperCase()}
              </span>
              {testimonial.stats && (
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/10 text-yellow-500">
                  COM ESTATÍSTICA
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-secondary)] mt-1">
              {testimonial.clientName || "Cliente sem nome"}
            </h3>
            <p className="text-sm text-[var(--color-secondary)]/70 line-clamp-1">
              {testimonial.description || "Sem descrição"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onMove("up");
              }}
              disabled={index === 0}
              className="bg-[var(--color-background-body)] hover:bg-[var(--color-background-body)]/80 border-[var(--color-border)]"
            >
              <ArrowUp className="w-3 h-3" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onMove("down");
              }}
              disabled={index === 0} // Este limite precisa ser ajustado conforme o contexto
              className="bg-[var(--color-background-body)] hover:bg-[var(--color-background-body)]/80 border-[var(--color-border)]"
            >
              <ArrowDown className="w-3 h-3" />
            </Button>
          </div>
          <Button
            type="button"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="bg-red-600 hover:bg-red-700 border-none"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[var(--color-secondary)]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[var(--color-secondary)]" />
          )}
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : 0 }}
        className="overflow-hidden"
      >
        <Card className="p-6 bg-[var(--color-background)] space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna 1: Informações básicas */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                  Tipo de Depoimento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["video", "image", "text"] as const).map((type) => {
                    const Icon = type === "video" ? Video : 
                                type === "image" ? ImageIcon : 
                                Text;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => onUpdate({ type })}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                          testimonial.type === type
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                            : "border-[var(--color-border)] hover:bg-[var(--color-background-body)]"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${
                          testimonial.type === type
                            ? "text-[var(--color-primary)]"
                            : "text-[var(--color-secondary)]/70"
                        }`} />
                        <span className={`text-xs font-medium capitalize ${
                          testimonial.type === type
                            ? "text-[var(--color-primary)]"
                            : "text-[var(--color-secondary)]/70"
                        }`}>
                          {type === "video" ? "vídeo" : type === "image" ? "imagem" : "texto"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Nome do Cliente
                  </label>
                  <Input
                    type="text"
                    value={testimonial.clientName}
                    onChange={(e: any) => onUpdate({ clientName: e.target.value })}
                    placeholder="Ex: Lucas Martins"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Cargo/Função
                  </label>
                  <Input
                    type="text"
                    value={testimonial.clientRole}
                    onChange={(e: any) => onUpdate({ clientRole: e.target.value })}
                    placeholder="Ex: Aluno - Dropshipping"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                  Depoimento
                </label>
                <TextArea
                  value={testimonial.description}
                  onChange={(e: any) => onUpdate({ description: e.target.value })}
                  placeholder="Digite o depoimento do cliente..."
                  rows={4}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>

              {/* Estatísticas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-lg">
                  <div>
                    <h4 className="font-medium text-[var(--color-secondary)]">Estatística do Resultado</h4>
                    <p className="text-sm text-[var(--color-secondary)]/70">
                      Mostra um número chave do resultado
                    </p>
                  </div>
                  <Switch
                    checked={!!testimonial.stats}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onUpdate({ stats: { value: "", label: "" } });
                      } else {
                        onUpdate({ stats: undefined });
                      }
                    }}
                  />
                </div>

                {testimonial.stats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                        Valor
                      </label>
                      <Input
                        type="text"
                        value={testimonial.stats.value}
                        onChange={(e: any) => onUpdate({
                          stats: { ...testimonial.stats!, value: e.target.value }
                        })}
                        placeholder="Ex: R$ 15k, +20%, -50%"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                        Rótulo
                      </label>
                      <Input
                        type="text"
                        value={testimonial.stats.label}
                        onChange={(e: any) => onUpdate({
                          stats: { ...testimonial.stats!, label: e.target.value }
                        })}
                        placeholder="Ex: Em 48h, Recuperação, CAC"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Coluna 2: Mídia */}
            <div className="space-y-6">
              {testimonial.type === "video" ? (
                <>
                  <VideoUpload
                    label="Vídeo do Depoimento"
                    currentVideo={testimonial.src || ''}
                    selectedFile={getFileFromState(`testimonials.${index}.src`)}
                    onFileChange={(file) => onFileChange(`testimonials.${index}.src`, file)}
                    aspectRatio="aspect-video"
                    previewWidth={800}
                    previewHeight={450}
                    description="Vídeo do depoimento do cliente"
                  />
                  
                  <ImageUpload
                    label="Thumbnail do Vídeo (Poster)"
                    currentImage={testimonial.poster || ''}
                    selectedFile={getFileFromState(`testimonials.${index}.poster`)}
                    onFileChange={(file) => onFileChange(`testimonials.${index}.poster`, file)}
                    aspectRatio="aspect-video"
                    previewWidth={800}
                    previewHeight={450}
                    description="Imagem de capa para o vídeo (opcional)"
                  />
                </>
              ) : testimonial.type === "image" ? (
                <ImageUpload
                  label="Imagem do Depoimento"
                  currentImage={testimonial.src || ''}
                  selectedFile={getFileFromState(`testimonials.${index}.src`)}
                  onFileChange={(file) => onFileChange(`testimonials.${index}.src`, file)}
                  aspectRatio="aspect-video"
                  previewWidth={800}
                  previewHeight={450}
                  description="Imagem do depoimento do cliente"
                />
              ) : (
                <div className="p-6 border border-dashed border-[var(--color-border)] rounded-lg text-center">
                  <Text className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-3" />
                  <h4 className="font-medium text-[var(--color-secondary)] mb-2">
                    Depoimento em Texto
                  </h4>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    Este depoimento não requer upload de mídia. O conteúdo será exibido como texto.
                  </p>
                </div>
              )}

              <div className="text-xs text-[var(--color-secondary)]/50 space-y-1">
                {testimonial.type === "video" && (
                  <>
                    <p>• Para vídeos: envie o arquivo .mp4 ou .webm</p>
                    <p>• A thumbnail será gerada automaticamente ou você pode enviar uma imagem personalizada</p>
                  </>
                )}
                {testimonial.type === "image" && (
                  <p>• Para imagens: JPG, PNG ou WebP (recomendado 800x600px)</p>
                )}
                {testimonial.type === "text" && (
                  <p>• Depoimento em texto: apenas conteúdo textual, sem mídia</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default function TestimonialsPage() {
  const [expandedSections, setExpandedSections] = useState({
    geral: true,
    footerStats: false,
    testimonials: true
  });

  const [expandedTestimonials, setExpandedTestimonials] = useState<string[]>([]);

  const {
    data: componentData,
    exists,
    loading,
    success,
    errorMsg,
    deleteModal,
    updateNested,
    save,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
    fileStates,
    setFileState,
  } = useJsonManagement<TestimonialsData>({
    apiPath: "/api/tegbe-institucional/json/alunos",
    defaultData: defaultData,
    mergeFunction: mergeWithDefaults,
  });

  const currentData = componentData || defaultData;
  const footerStats = currentData.footerStats;
  const testimonials = currentData.testimonials;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleTestimonial = (testimonialId: string) => {
    setExpandedTestimonials(prev => 
      prev.includes(testimonialId) 
        ? prev.filter(id => id !== testimonialId)
        : [...prev, testimonialId]
    );
  };

  // FooterStats
  const handleFooterStatChange = (index: number, field: keyof FooterStat, value: any) => {
    const newStats = [...footerStats];
    newStats[index] = { ...newStats[index], [field]: value };
    updateNested(`footerStats`, newStats);
  };

  const handleAddFooterStat = () => {
    const newStat: FooterStat = {
      id: `stat-${Date.now()}-${footerStats.length}`,
      value: '',
      label: '',
      icon: '',
      color: ''
    };
    updateNested(`footerStats`, [...footerStats, newStat]);
  };

  const openDeleteFooterStatModal = (index: number, title: string) => {
    console.log("Abrir modal para deletar estatística:", index, title);
  };

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

  const handleFooterStatsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = footerStats.findIndex((item) => item.id === active.id);
    const newIndex = footerStats.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newStats = arrayMove(footerStats, oldIndex, newIndex);
      updateNested(`footerStats`, newStats);
    }
  };

  // Testimonials
  const handleAddTestimonial = () => {
    const newId = `testimonial-${Date.now()}-${testimonials.length}`;
    const newTestimonial: Testimonial = {
      id: newId,
      type: "video",
      clientName: "",
      clientRole: "",
      description: "",
      src: "",
      poster: ""
    };
    const updatedTestimonials = [...testimonials, newTestimonial];
    updateNested('testimonials', updatedTestimonials);
    setExpandedTestimonials(prev => [...prev, newId]);
  };

  const handleUpdateTestimonial = (index: number, updates: Partial<Testimonial>) => {
    const updatedTestimonials = [...testimonials];
    updatedTestimonials[index] = { ...updatedTestimonials[index], ...updates };
    updateNested('testimonials', updatedTestimonials);
  };

  const handleRemoveTestimonial = (index: number) => {
    const updatedTestimonials = testimonials.filter((_, i) => i !== index);
    updateNested('testimonials', updatedTestimonials);
    setExpandedTestimonials(prev => prev.filter(id => id !== testimonials[index].id));
  };

  const moveTestimonial = (index: number, direction: "up" | "down") => {
    const currentTestimonials = [...testimonials];
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === currentTestimonials.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const [movedTestimonial] = currentTestimonials.splice(index, 1);
    currentTestimonials.splice(newIndex, 0, movedTestimonial);
    
    updateNested('testimonials', currentTestimonials);
  };

  const handleFileChange = (key: string, file: File | null) => {
    setFileState(key, file);
  };

  const getFileFromState = useCallback((key: string): File | null => {
    const value = fileStates[key];
    return value instanceof File ? value : null;
  }, [fileStates]);

  // Funções para cores
  const handleTextColorChange = (hexColor: string) => {
    updateNested('textColor', hexColor);
  };

  const handleBackgroundColorChange = (hexColor: string) => {
    updateNested('backgroundColor', hexColor);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await save();
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Configurações gerais (agora com mais campos)
    total += 6; // badge, titulo, subtitulo, showStats, textColor, backgroundColor
    if (currentData.badge?.trim()) completed++;
    if (currentData.titulo.trim()) completed++;
    if (currentData.subtitulo.trim()) completed++;
    total++; // showStats é booleano, sempre considerado como completo
    completed++;
    if (currentData.textColor?.trim()) completed++;
    if (currentData.backgroundColor?.trim()) completed++;

    // FooterStats
    total += footerStats.length * 4; // value, label, icon, color
    footerStats.forEach(stat => {
      if (stat.value.trim()) completed++;
      if (stat.label.trim()) completed++;
      if (stat.icon?.trim()) completed++;
      if (stat.color?.trim()) completed++;
    });

    // Testimonials
    total += testimonials.length * 4; // clientName, clientRole, description, type
    testimonials.forEach(testimonial => {
      if (testimonial.clientName.trim()) completed++;
      if (testimonial.clientRole.trim()) completed++;
      if (testimonial.description.trim()) completed++;
      if (testimonial.type) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();
  const testimonialsCompletos = testimonials.filter(t => 
    t.clientName.trim() && t.description.trim()
  ).length;
  const footerStatsCompletos = footerStats.filter(s => 
    s.value.trim() && s.label.trim()
  ).length;

  if (loading && !exists) {
    return <Loading layout={MessageCircle} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Star}
      title="Cases de Sucesso"
      description="Gerencie cases de sucesso, estatísticas e depoimentos"
      exists={!!exists}
      itemName="Cases de Sucesso"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Configurações Gerais - ATUALIZADA */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações Gerais"
            section="geral"
            icon={Settings}
            isExpanded={expandedSections.geral}
            onToggle={() => toggleSection("geral")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.geral ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Badge
                  </label>
                  <Input
                    value={currentData.badge || ''}
                    onChange={(e) => updateNested('badge', e.target.value)}
                    placeholder="Ex: DEPOIMENTOS"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="mt-1 text-xs text-[var(--color-secondary)]/50">
                    Texto do badge exibido acima do título
                  </p>
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Título Principal"
                    value={currentData.titulo}
                    onChange={(e) => updateNested('titulo', e.target.value)}
                    placeholder="Ex: Cases de Sucesso"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="md:col-span-2">
                  <TextArea
                    label="Subtítulo"
                    value={currentData.subtitulo}
                    onChange={(e) => updateNested('subtitulo', e.target.value)}
                    placeholder="Ex: Transformação Digital"
                    rows={2}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Cor do Texto
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={currentData.textColor || "#FFFFFF"}
                      onChange={(e) => updateNested('textColor', e.target.value)}
                      placeholder="#FFFFFF"
                      className="flex-1 font-mono bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <ColorPicker
                      color={currentData.textColor || "#FFFFFF"}
                      onChange={handleTextColorChange}
                    />
                    <div 
                      className="w-10 h-10 rounded-lg border border-[var(--color-border)]"
                      style={{ backgroundColor: currentData.textColor || "#FFFFFF" }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Cor de Fundo
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={currentData.backgroundColor || "#020202"}
                      onChange={(e) => updateNested('backgroundColor', e.target.value)}
                      placeholder="#020202"
                      className="flex-1 font-mono bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <ColorPicker
                      color={currentData.backgroundColor || "#020202"}
                      onChange={handleBackgroundColorChange}
                    />
                    <div 
                      className="w-10 h-10 rounded-lg border border-[var(--color-border)]"
                      style={{ backgroundColor: currentData.backgroundColor || "#020202" }}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background-body)]">
                    <div>
                      <h4 className="font-medium text-[var(--color-secondary)]">Exibir Estatísticas do Rodapé</h4>
                      <p className="text-sm text-[var(--color-secondary)]/70">
                        Mostrar as estatísticas gerais abaixo dos cases
                      </p>
                    </div>
                    <Switch
                      checked={currentData.showStats}
                      onCheckedChange={(checked) => updateNested('showStats', checked)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Estatísticas do Rodapé */}
        <div className="space-y-4">
          <SectionHeader
            title={`Estatísticas do Rodapé (${footerStats.length})`}
            section="footerStats"
            icon={BarChart3}
            isExpanded={expandedSections.footerStats}
            onToggle={() => toggleSection("footerStats")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.footerStats ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Gerenciamento de Estatísticas
                    </h4>
                    <p className="text-sm text-[var(--color-secondary)]/70">
                      Arraste e solte para reordenar as estatísticas no rodapé
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-300" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {footerStatsCompletos} de {footerStats.length} completas
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddFooterStat}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Estatística
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {footerStats.length === 0 ? (
                  <Card className="p-8 bg-[var(--color-background)]">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                        Nenhuma estatística adicionada
                      </h3>
                      <p className="text-sm text-[var(--color-secondary)]/70">
                        Adicione estatísticas gerais que serão exibidas no rodapé
                      </p>
                    </div>
                  </Card>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleFooterStatsDragEnd}
                  >
                    <SortableContext
                      items={footerStats.map(f => f.id || '')}
                      strategy={verticalListSortingStrategy}
                    >
                      {footerStats.map((item, index) => (
                        <SortableFooterStatItem
                          key={item.id || `footerstat-${index}`}
                          item={item}
                          index={index}
                          handleChange={handleFooterStatChange}
                          openDeleteSingleModal={openDeleteFooterStatModal}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Cases de Sucesso */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <SectionHeader
              title={`Cases de Sucesso (${testimonials.length})`}
              section="testimonials"
              icon={MessageCircle}
              isExpanded={expandedSections.testimonials}
              onToggle={() => toggleSection("testimonials")}
            />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-[var(--color-secondary)]/70">
                  {testimonialsCompletos} de {testimonials.length} completos
                </span>
              </div>
              <Button
                type="button"
                onClick={handleAddTestimonial}
                variant="primary"
                className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Case
              </Button>
            </div>
          </div>

          <motion.div
            initial={false}
            animate={{ height: expandedSections.testimonials ? "auto" : 0 }}
            className="overflow-hidden"
          >
            {testimonials.length === 0 ? (
              <Card className="p-6 bg-[var(--color-background)]">
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-[var(--color-secondary)]/30 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                    Nenhum caso de sucesso adicionado
                  </h4>
                  <p className="text-[var(--color-secondary)]/70 mb-6 max-w-md mx-auto">
                    Comece adicionando depoimentos em vídeo, imagem ou texto dos seus clientes
                  </p>
                  <Button
                    type="button"
                    onClick={handleAddTestimonial}
                    variant="primary"
                    className="mx-auto bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Case
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {testimonials.map((testimonial, index) => (
                  <TestimonialItem
                    key={testimonial.id}
                    testimonial={testimonial}
                    index={index}
                    isExpanded={expandedTestimonials.includes(testimonial.id)}
                    onToggle={() => toggleTestimonial(testimonial.id)}
                    onUpdate={(updates) => handleUpdateTestimonial(index, updates)}
                    onRemove={() => handleRemoveTestimonial(index)}
                    onMove={(direction) => moveTestimonial(index, direction)}
                    onFileChange={handleFileChange}
                    getFileFromState={getFileFromState}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          isAddDisabled={false}
          isSaving={loading}
          exists={!!exists}
          completeCount={completion.completed}
          totalCount={completion.total}
          itemName="Cases de Sucesso"
          icon={Star}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={testimonials.length + footerStats.length}
        itemName="Cases de Sucesso"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}