/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback, useId, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import IconSelector from "@/components/IconSelector";
import { 
  ImageIcon, 
  GripVertical, 
  ArrowUpDown, 
  AlertCircle, 
  CheckCircle2, 
  Trash2,
  XCircle,
  Search,
  X,
  Users,
  Type,
  MessageSquare,
  Instagram,
  ChevronDown,
  ChevronUp,
  Zap,
  Palette,
  Layers,
  Grid3x3
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import { ImageUpload } from "@/components/ImageUpload";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";

interface GaleriaFoto {
  id: string;
  alt: string;
  image: string;
  span: string;
  file?: File | null;
}

interface TitulosData {
  badge: {
    texto: string;
    icone: string;
  };
  tituloPrincipal: {
    linha1: string;
    linha2: string;
    palavrasDestaque: string;
  };
  descricao: string;
  cta: {
    botao: string;
    cardTitulo: string;
    cardDescricao: string;
  };
}

interface GaleriaData {
  galeria: {
    fotos: GaleriaFoto[];
    titulos: TitulosData;
  };
}

const defaultData: GaleriaData = {
  galeria: {
    fotos: [
      {
        id: "1",
        alt: "",
        image: "",
        span: "row-span-2"
      }
    ],
    titulos: {
      badge: {
        texto: "",
        icone: "ph:users-three-fill"
      },
      tituloPrincipal: {
        linha1: "",
        linha2: "",
        palavrasDestaque: ""
      },
      descricao: "",
      cta: {
        botao: "",
        cardTitulo: "",
        cardDescricao: ""
      }
    }
  }
};

// Função para mesclar com dados padrão
const mergeWithDefaults = (apiData: any, defaultData: GaleriaData): GaleriaData => {
  if (!apiData) return defaultData;
  
  return {
    galeria: {
      fotos: apiData.galeria?.fotos?.map((foto: any, index: number) => ({
        id: foto.id || `foto-${Date.now()}-${index}`,
        alt: foto.alt || "",
        image: foto.image || "",
        span: foto.span || "row-span-1",
        file: null
      })) || defaultData.galeria.fotos,
      titulos: {
        badge: {
          texto: apiData.galeria?.titulos?.badge?.texto || defaultData.galeria.titulos.badge.texto,
          icone: apiData.galeria?.titulos?.badge?.icone || defaultData.galeria.titulos.badge.icone
        },
        tituloPrincipal: {
          linha1: apiData.galeria?.titulos?.tituloPrincipal?.linha1 || defaultData.galeria.titulos.tituloPrincipal.linha1,
          linha2: apiData.galeria?.titulos?.tituloPrincipal?.linha2 || defaultData.galeria.titulos.tituloPrincipal.linha2,
          palavrasDestaque: apiData.galeria?.titulos?.tituloPrincipal?.palavrasDestaque || defaultData.galeria.titulos.tituloPrincipal.palavrasDestaque
        },
        descricao: apiData.galeria?.titulos?.descricao || defaultData.galeria.titulos.descricao,
        cta: {
          botao: apiData.galeria?.titulos?.cta?.botao || defaultData.galeria.titulos.cta.botao,
          cardTitulo: apiData.galeria?.titulos?.cta?.cardTitulo || defaultData.galeria.titulos.cta.cardTitulo,
          cardDescricao: apiData.galeria?.titulos?.cta?.cardDescricao || defaultData.galeria.titulos.cta.cardDescricao
        }
      }
    }
  };
};

// Componente Sortable para fotos
function SortableGaleriaItem({
  item,
  index,
  showValidation,
  itemList,
  handleChange,
  handleFileChange,
  openDeleteSingleModal,
  getImageUrl,
}: {
  item: GaleriaFoto;
  index: number;
  showValidation: boolean;
  itemList: GaleriaFoto[];
  handleChange: (index: number, field: keyof GaleriaFoto, value: any) => void;
  handleFileChange: (index: number, file: File | null) => void;
  openDeleteSingleModal: (index: number, title: string) => void;
  getImageUrl: (item: GaleriaFoto) => string;
}) {
  const stableId = useId();
  const sortableId = item.id || `galeria-${index}-${stableId}`;

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

  const hasAlt = item.alt.trim() !== "";
  const hasImage = Boolean(item.image?.trim() !== "" || item.file);
  const hasSpan = Boolean(item.span.trim() !== "");

  const imageUrl = getImageUrl(item);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
        showValidation && (!hasAlt || !hasImage) 
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
                  {hasAlt ? (
                    <h4 className="font-medium text-[var(--color-secondary)]">
                      {item.alt}
                    </h4>
                  ) : (
                    <h4 className="font-medium text-[var(--color-secondary)]/50">
                      Imagem sem descrição
                    </h4>
                  )}
                  {hasAlt && hasImage && hasSpan ? (
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
              onClick={() => openDeleteSingleModal(index, item.alt || "Imagem sem descrição")}
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
                  <ImageIcon className="w-4 h-4" />
                  Imagem da Galeria
                </label>
                <ImageUpload
                  label="Imagem da Galeria"
                  description="Formatos suportados: JPG, PNG, WEBP. Tamanho recomendado: 1000x500px."
                  currentImage={item.image || ""}
                  selectedFile={item.file || null}
                  onFileChange={(file) => handleFileChange(index, file)}
                  aspectRatio="aspect-video"
                  previewWidth={300}
                  previewHeight={150}
                />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    URL da Imagem <span className="text-xs text-[var(--color-secondary)]/50">- Opcional se fizer upload</span>
                  </label>
                  <Input
                    type="text"
                    value={item.image}
                    onChange={(e: any) => handleChange(index, "image", e.target.value)}
                    placeholder="Ex: https://images.unsplash.com/photo-..."
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Texto Alternativo (alt) <span className="text-xs text-[var(--color-danger)]">*</span>
                  </label>
                  <Input
                    type="text"
                    value={item.alt}
                    onChange={(e: any) => handleChange(index, "alt", e.target.value)}
                    placeholder="Ex: Evento Presencial Tegbe"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Tamanho no Grid (span)
                  </label>
                  <select
                    value={item.span}
                    onChange={(e: any) => handleChange(index, "span", e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-background-body)] text-[var(--color-secondary)]"
                  >
                    <option value="row-span-1">Pequena (1 linha)</option>
                    <option value="row-span-2">Média (2 linhas)</option>
                    <option value="row-span-3">Grande (3 linhas)</option>
                  </select>
                  <p className="mt-1 text-xs text-[var(--color-secondary)]/50">
                    Define a altura da imagem no grid da galeria.
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

export default function GaleriaPage() {
  const [expandedSections, setExpandedSections] = useState({
    badge: true,
    tituloPrincipal: false,
    descricao: false,
    cta: false,
    fotos: true
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);

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
  } = useJsonManagement<GaleriaData>({
    apiPath: "/api/tegbe-institucional/json/gallery",
    defaultData: defaultData,
    mergeFunction: mergeWithDefaults,
  });

  const currentData = componentData || defaultData;
  const fotos = currentData.galeria.fotos;
  const titulos = currentData.galeria.titulos;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleTitulosChange = (path: string, value: any) => {
    updateNested(`galeria.titulos.${path}`, value);
  };

  const handleFotoChange = (index: number, field: keyof GaleriaFoto, value: any) => {
    const newFotos = [...fotos];
    newFotos[index] = { ...newFotos[index], [field]: value };
    updateNested(`galeria.fotos`, newFotos);
  };

  const handleFotoFileChange = (index: number, file: File | null) => {
    const newFotos = [...fotos];
    newFotos[index] = { ...newFotos[index], file };
    updateNested(`galeria.fotos`, newFotos);
  };

  const getFileFromState = (key: string): File | null => {
    const value = fileStates[key];
    return value instanceof File ? value : null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowValidation(true);
    await save();
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fotos.findIndex((item) => item.id === active.id);
    const newIndex = fotos.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newFotos = arrayMove(fotos, oldIndex, newIndex);
      updateNested(`galeria.fotos`, newFotos);
    }
  };

  const getImageUrl = (item: GaleriaFoto): string => {
    if (item.file) return URL.createObjectURL(item.file);
    if (item.image) {
      return item.image.startsWith('http') ? item.image : `https://mavellium.com.br${item.image.startsWith('/') ? '' : '/'}${item.image}`;
    }
    return "";
  };

  const handleAddFoto = () => {
    const newFoto: GaleriaFoto = {
      id: `foto-${Date.now()}-${fotos.length}`,
      alt: '',
      image: '',
      span: 'row-span-1',
      file: null
    };
    updateNested(`galeria.fotos`, [...fotos, newFoto]);
  };

  const openDeleteSingleModal = (index: number, title: string) => {
    // Implementação da abertura do modal de deleção individual
    console.log("Abrir modal para deletar foto:", index, title);
  };

  const filteredFotos = useMemo(() => {
    if (!searchTerm) return fotos;
    const term = searchTerm.toLowerCase();
    return fotos.filter(item => 
      item.alt.toLowerCase().includes(term) ||
      item.image.toLowerCase().includes(term) ||
      item.span.toLowerCase().includes(term)
    );
  }, [fotos, searchTerm]);

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Contar campos dos títulos
    total += 7; // badge.texto, badge.icone, tituloPrincipal.linha1, tituloPrincipal.linha2, tituloPrincipal.palavrasDestaque, descricao, cta.botao
    if (titulos.badge.texto.trim()) completed++;
    if (titulos.badge.icone.trim()) completed++;
    if (titulos.tituloPrincipal.linha1.trim()) completed++;
    if (titulos.tituloPrincipal.linha2.trim()) completed++;
    if (titulos.tituloPrincipal.palavrasDestaque.trim()) completed++;
    if (titulos.descricao.trim()) completed++;
    if (titulos.cta.botao.trim()) completed++;

    // Contar campos das fotos
    total += fotos.length * 3; // alt, image, span para cada foto
    fotos.forEach(foto => {
      if (foto.alt.trim()) completed++;
      if (foto.image.trim() || foto.file) completed++;
      if (foto.span.trim()) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();
  const fotosCompletas = fotos.filter(foto => foto.alt.trim() && (foto.image.trim() || foto.file)).length;

  if (loading && !exists) {
    return <Loading layout={Layers} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={ImageIcon}
      title="Galeria"
      description="Configure a galeria de imagens com textos e fotos"
      exists={!!exists}
      itemName="Galeria"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Badge */}
        <div className="space-y-4">
          <SectionHeader
            title="Badge"
            section="badge"
            icon={Zap}
            isExpanded={expandedSections.badge}
            onToggle={() => toggleSection("badge")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.badge ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Configurações do Badge
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Configure o badge que aparece acima do título principal
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <IconSelector
                    value={titulos.badge.icone}
                    onChange={(value) => handleTitulosChange('badge.icone', value)}
                    label="Ícone do Badge"
                    placeholder="ph:users-three-fill"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Ícone que aparece no badge
                  </p>
                </div>

                <div>
                  <Input
                    label="Texto do Badge"
                    value={titulos.badge.texto}
                    onChange={(e) => handleTitulosChange('badge.texto', e.target.value)}
                    placeholder="Comunidade Elite"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Texto pequeno acima do título principal
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Título Principal */}
        <div className="space-y-4">
          <SectionHeader
            title="Título Principal"
            section="tituloPrincipal"
            icon={Type}
            isExpanded={expandedSections.tituloPrincipal}
            onToggle={() => toggleSection("tituloPrincipal")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.tituloPrincipal ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Título da Galeria
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Configure o título principal da seção de galeria
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Linha 1"
                    value={titulos.tituloPrincipal.linha1}
                    onChange={(e) => handleTitulosChange('tituloPrincipal.linha1', e.target.value)}
                    placeholder="Você nunca vai"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div>
                  <Input
                    label="Linha 2"
                    value={titulos.tituloPrincipal.linha2}
                    onChange={(e) => handleTitulosChange('tituloPrincipal.linha2', e.target.value)}
                    placeholder="jogar sozinho."
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div>
                  <Input
                    label="Palavras em Destaque"
                    value={titulos.tituloPrincipal.palavrasDestaque}
                    onChange={(e) => handleTitulosChange('tituloPrincipal.palavrasDestaque', e.target.value)}
                    placeholder="jogar sozinho"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Palavras que serão destacadas no título
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Descrição */}
        <div className="space-y-4">
          <SectionHeader
            title="Descrição"
            section="descricao"
            icon={MessageSquare}
            isExpanded={expandedSections.descricao}
            onToggle={() => toggleSection("descricao")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.descricao ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Descrição da Galeria
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Texto descritivo abaixo do título principal
                </p>
              </div>

              <TextArea
                label="Descrição"
                value={titulos.descricao}
                onChange={(e) => handleTitulosChange('descricao', e.target.value)}
                placeholder="Entre para o ecossistema onde networking não é troca de cartão, é troca de estratégia de escala."
                rows={3}
                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
              />
            </Card>
          </motion.div>
        </div>

        {/* Seção CTA */}
        <div className="space-y-4">
          <SectionHeader
            title="Call to Action"
            section="cta"
            icon={Instagram}
            isExpanded={expandedSections.cta}
            onToggle={() => toggleSection("cta")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.cta ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Configurações do Call to Action
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Configure o botão de ação e elementos relacionados
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Texto do Botão"
                    value={titulos.cta.botao}
                    onChange={(e) => handleTitulosChange('cta.botao', e.target.value)}
                    placeholder="Ver Galeria Completa no Instagram"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Texto do botão principal
                  </p>
                </div>

                <div>
                  <Input
                    label="Título do Card"
                    value={titulos.cta.cardTitulo}
                    onChange={(e) => handleTitulosChange('cta.cardTitulo', e.target.value)}
                    placeholder="Sua foto aqui"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Título do card flutuante
                  </p>
                </div>

                <div>
                  <Input
                    label="Descrição do Card"
                    value={titulos.cta.cardDescricao}
                    onChange={(e) => handleTitulosChange('cta.cardDescricao', e.target.value)}
                    placeholder="Junte-se aos próximos cases de sucesso da Tegbe."
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Descrição do card flutuante
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Fotos da Galeria */}
        <div className="space-y-4">
          <SectionHeader
            title="Fotos da Galeria"
            section="fotos"
            icon={ImageIcon}
            isExpanded={expandedSections.fotos}
            onToggle={() => toggleSection("fotos")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.fotos ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Gerenciamento de Fotos
                    </h4>
                    <p className="text-sm text-[var(--color-secondary)]/70">
                      Arraste e solte para reordenar as fotos da galeria
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-300" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {fotosCompletas} de {fotos.length} completas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barra de busca */}
                <div className="space-y-2 mb-6">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Buscar Fotos
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]/70" />
                    <Input
                      type="text"
                      placeholder="Buscar fotos por descrição, URL ou tamanho..."
                      value={searchTerm}
                      onChange={(e: any) => setSearchTerm(e.target.value)}
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {filteredFotos.length === 0 ? (
                    <Card className="p-8 bg-[var(--color-background)]">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                          Nenhuma foto encontrada
                        </h3>
                        <p className="text-sm text-[var(--color-secondary)]/70">
                          {searchTerm ? 'Tente ajustar sua busca ou limpe o filtro' : 'Adicione sua primeira foto'}
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
                        items={fotos.map(f => f.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {filteredFotos.map((item, index) => (
                          <SortableGaleriaItem
                            key={item.id}
                            item={item}
                            index={index}
                            showValidation={showValidation}
                            itemList={fotos}
                            handleChange={handleFotoChange}
                            handleFileChange={handleFotoFileChange}
                            openDeleteSingleModal={openDeleteSingleModal}
                            getImageUrl={getImageUrl}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </div>

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          onAddNew={handleAddFoto}
          isAddDisabled={false}
          isSaving={loading}
          exists={!!exists}
          completeCount={completion.completed}
          totalCount={completion.total}
          itemName="Galeria"
          icon={ImageIcon}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={fotos.length}
        itemName="Galeria"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />

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
              <img
                src={expandedImage}
                alt="Preview expandido"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ManageLayout>
  );
}