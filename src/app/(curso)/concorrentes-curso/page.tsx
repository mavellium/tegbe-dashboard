/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useId } from "react";
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
  GripVertical, 
  ArrowUpDown, 
  CheckCircle2, 
  Trash2,
  Search,
  Target,
  BarChart3,
  Zap,
  Layers,
  Scale,
  ArrowRight,
  Check,
  X as XIcon,
  Columns
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";

interface Feature {
  id: string;
  label: string;
  competitor: string;
  us: string;
}

interface ComparisonData {
  header: {
    badge: string;
    title: string;
    subtitle: string;
  };
  columns: {
    competitor: string;
    us: string;
  };
  features: Feature[];
  cta: {
    text: string;
    url: string;
    variant: "gradient" | "primary" | "secondary" | "danger";
    icon: string;
    target: "_self" | "_blank";
  };
}

const defaultData: ComparisonData = {
  header: {
    badge: "Comparação Justa",
    title: "Por que a TegPro é superior",
    subtitle: "Veja a diferença entre nossa solução e a concorrência"
  },
  columns: {
    competitor: "Concorrência",
    us: "TegPro"
  },
  features: [
    {
      id: "feature-1",
      label: "Suporte Personalizado",
      competitor: "Email apenas",
      us: "WhatsApp + Videochamadas"
    },
    {
      id: "feature-2",
      label: "Atualizações",
      competitor: "Semestral",
      us: "Mensal"
    },
    {
      id: "feature-3",
      label: "Preço",
      competitor: "R$ 497/mês",
      us: "R$ 297/mês"
    }
  ],
  cta: {
    text: "Começar Agora",
    url: "/checkout",
    variant: "gradient",
    icon: "ph:arrow-right-bold",
    target: "_self"
  }
};

// Função para mesclar com dados padrão
const mergeWithDefaults = (apiData: any, defaultData: ComparisonData): ComparisonData => {
  if (!apiData) return defaultData;
  
  return {
    header: {
      badge: apiData.header?.badge || defaultData.header.badge,
      title: apiData.header?.title || defaultData.header.title,
      subtitle: apiData.header?.subtitle || defaultData.header.subtitle
    },
    columns: {
      competitor: apiData.columns?.competitor || defaultData.columns.competitor,
      us: apiData.columns?.us || defaultData.columns.us
    },
    features: apiData.features?.map((feature: any, index: number) => ({
      id: feature.id || `feature-${Date.now()}-${index}`,
      label: feature.label || "",
      competitor: feature.competitor || "",
      us: feature.us || ""
    })) || defaultData.features,
    cta: {
      text: apiData.cta?.text || defaultData.cta.text,
      url: apiData.cta?.url || defaultData.cta.url,
      variant: apiData.cta?.variant || defaultData.cta.variant,
      icon: apiData.cta?.icon || defaultData.cta.icon,
      target: apiData.cta?.target || defaultData.cta.target
    }
  };
};

// Componente Sortable para features
function SortableFeatureItem({
  item,
  index,
  showValidation,
  itemList,
  handleChange,
  openDeleteSingleModal,
}: {
  item: Feature;
  index: number;
  showValidation: boolean;
  itemList: Feature[];
  handleChange: (index: number, field: keyof Feature, value: any) => void;
  openDeleteSingleModal: (index: number, title: string) => void;
}) {
  const stableId = useId();
  const sortableId = item.id || `feature-${index}-${stableId}`;

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

  const hasLabel = item.label.trim() !== "";
  const hasCompetitor = item.competitor.trim() !== "";
  const hasUs = item.us.trim() !== "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
        showValidation && (!hasLabel || !hasCompetitor || !hasUs) 
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
                  {hasLabel ? (
                    <h4 className="font-medium text-[var(--color-secondary)]">
                      {item.label}
                    </h4>
                  ) : (
                    <h4 className="font-medium text-[var(--color-secondary)]/50">
                      Recurso sem título
                    </h4>
                  )}
                  {hasLabel && hasCompetitor && hasUs ? (
                    <span className="px-2 py-1 text-xs bg-[var(--color-success)]/20 text-green-300 rounded-full border border-[var(--color-success)]/30">
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
              onClick={() => openDeleteSingleModal(index, item.label || "Recurso sem título")}
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
                  <Target className="w-4 h-4" />
                  Título do Recurso
                </label>
                <Input
                  type="text"
                  value={item.label}
                  onChange={(e: any) => handleChange(index, "label", e.target.value)}
                  placeholder="Ex: Suporte Personalizado"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <p className="mt-1 text-xs text-[var(--color-secondary)]/50">
                  Nome do recurso que será comparado
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                    <XIcon className="w-4 h-4 text-[var(--color-danger)]" />
                    Valor da Concorrência
                  </label>
                  <Input
                    type="text"
                    value={item.competitor}
                    onChange={(e: any) => handleChange(index, "competitor", e.target.value)}
                    placeholder="Ex: Email apenas"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="mt-1 text-xs text-[var(--color-secondary)]/50">
                    O que a concorrência oferece (pode usar R$ para preços)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-[var(--color-success)]" />
                    Nossa Solução
                  </label>
                  <Input
                    type="text"
                    value={item.us}
                    onChange={(e: any) => handleChange(index, "us", e.target.value)}
                    placeholder="Ex: WhatsApp + Videochamadas"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="mt-1 text-xs text-[var(--color-secondary)]/50">
                    O que a TegPro oferece (destacar vantagem)
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

export default function ComparisonPage() {
  const [expandedSections, setExpandedSections] = useState({
    header: true,
    columns: false,
    features: true,
    cta: false
  });

  const [searchTerm, setSearchTerm] = useState("");
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
  } = useJsonManagement<ComparisonData>({
    apiPath: "/api/tegbe-institucional/json/comparison",
    defaultData: defaultData,
    mergeFunction: mergeWithDefaults,
  });

  const currentData = componentData || defaultData;
  const features = currentData.features;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    updateNested(path, value);
  };

  const handleFeatureChange = (index: number, field: keyof Feature, value: any) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    updateNested(`features`, newFeatures);
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

    const oldIndex = features.findIndex((item) => item.id === active.id);
    const newIndex = features.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newFeatures = arrayMove(features, oldIndex, newIndex);
      updateNested(`features`, newFeatures);
    }
  };

  const handleAddFeature = () => {
    const newFeature: Feature = {
      id: `feature-${Date.now()}-${features.length}`,
      label: '',
      competitor: '',
      us: ''
    };
    updateNested(`features`, [...features, newFeature]);
  };

  const openDeleteSingleModal = (index: number, title: string) => {
    // Implementação da abertura do modal de deleção individual
    console.log("Abrir modal para deletar feature:", index, title);
  };

  const filteredFeatures = useMemo(() => {
    if (!searchTerm) return features;
    const term = searchTerm.toLowerCase();
    return features.filter(item => 
      item.label.toLowerCase().includes(term) ||
      item.competitor.toLowerCase().includes(term) ||
      item.us.toLowerCase().includes(term)
    );
  }, [features, searchTerm]);

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Header
    total += 3;
    if (currentData.header.badge.trim()) completed++;
    if (currentData.header.title.trim()) completed++;
    if (currentData.header.subtitle.trim()) completed++;

    // Columns
    total += 2;
    if (currentData.columns.competitor.trim()) completed++;
    if (currentData.columns.us.trim()) completed++;

    // Features
    total += features.length * 3; // label, competitor, us para cada feature
    features.forEach(feature => {
      if (feature.label.trim()) completed++;
      if (feature.competitor.trim()) completed++;
      if (feature.us.trim()) completed++;
    });

    // CTA
    total += 5;
    if (currentData.cta.text.trim()) completed++;
    if (currentData.cta.url.trim()) completed++;
    if (currentData.cta.variant.trim()) completed++;
    if (currentData.cta.icon.trim()) completed++;
    if (currentData.cta.target.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();
  const featuresCompletas = features.filter(f => 
    f.label.trim() && f.competitor.trim() && f.us.trim()
  ).length;

  if (loading && !exists) {
    return <Loading layout={Layers} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Scale}
      title="Página de Comparação"
      description="Configure a tabela comparativa entre TegPro e concorrência"
      exists={!!exists}
      itemName="Comparação"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho"
            section="header"
            icon={Zap}
            isExpanded={expandedSections.header}
            onToggle={() => toggleSection("header")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.header ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Configurações do Cabeçalho
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Configure os textos principais da seção de comparação
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Badge"
                    value={currentData.header.badge}
                    onChange={(e) => handleChange('header.badge', e.target.value)}
                    placeholder="Ex: Comparação Justa"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Texto do badge acima do título
                  </p>
                </div>

                <div>
                  <Input
                    label="Título Principal"
                    value={currentData.header.title}
                    onChange={(e) => handleChange('header.title', e.target.value)}
                    placeholder="Ex: Por que a TegPro é superior"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Título principal da comparação
                  </p>
                </div>

                <div className="md:col-span-2">
                  <TextArea
                    label="Subtítulo"
                    value={currentData.header.subtitle}
                    onChange={(e) => handleChange('header.subtitle', e.target.value)}
                    placeholder="Ex: Veja a diferença entre nossa solução e a concorrência"
                    rows={2}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Texto explicativo abaixo do título
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Colunas */}
        <div className="space-y-4">
          <SectionHeader
            title="Nomes das Colunas"
            section="columns"
            icon={Columns}
            isExpanded={expandedSections.columns}
            onToggle={() => toggleSection("columns")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.columns ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Nomes das Colunas da Tabela
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Defina os nomes que aparecerão no cabeçalho da tabela comparativa
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Nome da Concorrência"
                    value={currentData.columns.competitor}
                    onChange={(e) => handleChange('columns.competitor', e.target.value)}
                    placeholder="Ex: Concorrência"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Nome da coluna da concorrência
                  </p>
                </div>

                <div>
                  <Input
                    label="Nosso Nome"
                    value={currentData.columns.us}
                    onChange={(e) => handleChange('columns.us', e.target.value)}
                    placeholder="Ex: TegPro"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Nome da nossa coluna (sua marca)
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Recursos de Comparação */}
        <div className="space-y-4">
          <SectionHeader
            title="Recursos de Comparação"
            section="features"
            icon={Target}
            isExpanded={expandedSections.features}
            onToggle={() => toggleSection("features")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.features ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Gerenciamento de Recursos
                    </h4>
                    <p className="text-sm text-[var(--color-secondary)]/70">
                      Arraste e solte para reordenar os recursos na tabela comparativa
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-300" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {featuresCompletas} de {features.length} completos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barra de busca */}
                <div className="space-y-2 mb-6">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Buscar Recursos
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]/70" />
                    <Input
                      type="text"
                      placeholder="Buscar recursos por título, concorrência ou nossa solução..."
                      value={searchTerm}
                      onChange={(e: any) => setSearchTerm(e.target.value)}
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {filteredFeatures.length === 0 ? (
                    <Card className="p-8 bg-[var(--color-background)]">
                      <div className="text-center">
                        <Target className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                          Nenhum recurso encontrado
                        </h3>
                        <p className="text-sm text-[var(--color-secondary)]/70">
                          {searchTerm ? 'Tente ajustar sua busca ou limpe o filtro' : 'Adicione seu primeiro recurso de comparação'}
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
                        items={features.map(f => f.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {filteredFeatures.map((item, index) => (
                          <SortableFeatureItem
                            key={item.id}
                            item={item}
                            index={index}
                            showValidation={showValidation}
                            itemList={features}
                            handleChange={handleFeatureChange}
                            openDeleteSingleModal={openDeleteSingleModal}
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

        {/* Seção Call to Action */}
        <div className="space-y-4">
          <SectionHeader
            title="Call to Action"
            section="cta"
            icon={ArrowRight}
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
                  Configurações do Botão de Ação
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Configure o botão que aparecerá abaixo da tabela comparativa
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Texto do Botão"
                    value={currentData.cta.text}
                    onChange={(e) => handleChange('cta.text', e.target.value)}
                    placeholder="Ex: Começar Agora"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Texto que aparecerá no botão
                  </p>
                </div>

                <div>
                  <Input
                    label="URL do Botão"
                    value={currentData.cta.url}
                    onChange={(e) => handleChange('cta.url', e.target.value)}
                    placeholder="Ex: /checkout"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Para onde o botão levará (use / para páginas internas)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Variante do Botão
                  </label>
                  <select
                    value={currentData.cta.variant}
                    onChange={(e) => handleChange('cta.variant', e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-background-body)] text-[var(--color-secondary)]"
                  >
                    <option value="gradient">Gradiente</option>
                    <option value="primary">Primário</option>
                    <option value="secondary">Secundário</option>
                    <option value="danger">Perigo</option>
                  </select>
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Estilo visual do botão
                  </p>
                </div>

                <div>
                  <IconSelector
                    value={currentData.cta.icon}
                    onChange={(value) => handleChange('cta.icon', value)}
                    label="Ícone do Botão"
                    placeholder="ph:arrow-right-bold"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Ícone que aparecerá no botão (opcional)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Alvo do Link
                  </label>
                  <select
                    value={currentData.cta.target}
                    onChange={(e) => handleChange('cta.target', e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-background-body)] text-[var(--color-secondary)]"
                  >
                    <option value="_self">Mesma aba</option>
                    <option value="_blank">Nova aba</option>
                  </select>
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Onde o link será aberto
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          onAddNew={handleAddFeature}
          isAddDisabled={false}
          isSaving={loading}
          exists={!!exists}
          completeCount={completion.completed}
          totalCount={completion.total}
          itemName="Comparação"
          icon={Scale}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={features.length}
        itemName="Comparação"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}