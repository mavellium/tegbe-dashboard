/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo, useCallback, useId, useRef } from "react";
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
import { Switch } from "@/components/Switch";
import { 
  ImageIcon,
  GripVertical,
  ArrowUpDown,
  CheckCircle2,
  Trash2,
  Search,
  Link,
  ExternalLink,
  Settings,
  ChevronDown,
  ChevronUp,
  Zap,
  Layers,
  School,
  Plus,
  Grid3x3,
  X,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ImageUpload } from "@/components/ImageUpload";

interface LogoData {
  id: number;
  src: string;
  alt: string;
  width: number;
  height: number;
  url: string;
}

interface LogosCursoPageData {
  variant: string;
  data: LogoData[];
  showBadge: boolean;
  badgeText: string;
  badgeIcon: string;
}

const defaultData: LogosCursoPageData = {
  variant: "cursos",
  data: [
    {
      id: 1,
      src: "",
      alt: "",
      width: 120,
      height: 80,
      url: ""
    }
  ],
  showBadge: true,
  badgeText: "Plataformas de Cursos",
  badgeIcon: "ph:graduation-cap-fill"
};

// Função para mesclar com dados padrão
const mergeWithDefaults = (apiData: any, defaultData: LogosCursoPageData): LogosCursoPageData => {
  if (!apiData) return defaultData;
  
  return {
    variant: apiData.variant || defaultData.variant,
    data: apiData.data?.map((logo: any, index: number) => ({
      id: logo.id || index + 1,
      src: logo.src || "",
      alt: logo.alt || "",
      width: logo.width || 120,
      height: logo.height || 80,
      url: logo.url || "",
    })) || defaultData.data,
    showBadge: apiData.showBadge ?? defaultData.showBadge,
    badgeText: apiData.badgeText || defaultData.badgeText,
    badgeIcon: apiData.badgeIcon || defaultData.badgeIcon
  };
};

// Componente Sortable para logos de cursos
function SortableLogoItem({
  item,
  index,
  showValidation,
  itemList,
  handleChange,
  selectedFile,
  onFileChange,
  openDeleteSingleModal,
}: {
  item: LogoData;
  index: number;
  showValidation: boolean;
  itemList: LogoData[];
  handleChange: (index: number, field: keyof LogoData, value: any) => void;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  openDeleteSingleModal: (index: number, title: string) => void;
}) {
  const stableId = useId();
  const sortableId = `logo-curso-${item.id}-${stableId}`;

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

  const hasSrc = item.src.trim() !== "" || selectedFile;
  const hasAlt = item.alt.trim() !== "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
        showValidation && (!hasSrc || !hasAlt) 
          ? 'ring-2 ring-[var(--color-danger)]' 
          : ''
      } ${isDragging ? 'shadow-lg scale-105' : ''} bg-[var(--color-background)] border-l-4 border-[var(--color-accent)]`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="cursor-grab active:cursor-grabbing text-[var(--color-secondary)]/70 hover:text-[var(--color-accent)] transition-colors p-2 rounded-lg hover:bg-[var(--color-background)]/50"
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
                      Logo sem nome
                    </h4>
                  )}
                  {hasSrc && hasAlt ? (
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
              onClick={() => openDeleteSingleModal(index, item.alt || "Logo sem nome")}
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
                  <ImageIcon className="w-4 h-4" />
                  Logo da Plataforma
                </label>
                <ImageUpload
                  label="Logo"
                  description="Formatos suportados: SVG, PNG, JPG. Tamanho recomendado: 240x160px."
                  currentImage={item.src || ""}
                  selectedFile={selectedFile || null}
                  onFileChange={onFileChange}
                  aspectRatio="aspect-video"
                  previewWidth={150}
                  previewHeight={100}
                />
              </div>
              
              <div className="bg-[var(--color-background-body)] p-4 rounded-lg border border-[var(--color-border)]">
                <h4 className="text-sm font-medium text-[var(--color-secondary)] mb-2">Preview do Link</h4>
                {item.url ? (
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-[var(--color-accent)]" />
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--color-accent)] hover:underline truncate"
                    >
                      {item.url.length > 30 ? `${item.url.substring(0, 30)}...` : item.url}
                    </a>
                    <ExternalLink className="w-3 h-3 text-[var(--color-secondary)]/70" />
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-secondary)]/50">Nenhum link configurado</p>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    URL da Imagem (src)
                  </label>
                  <Input
                    type="text"
                    value={item.src}
                    onChange={(e: any) => handleChange(index, "src", e.target.value)}
                    placeholder="Ex: https://exemplo.com/logo.svg"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-[var(--color-secondary)]/50">
                    URL da imagem do logo. Deixe em branco se fizer upload de arquivo.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                      Nome da Plataforma (alt) <span className="text-xs text-[var(--color-danger)]">*</span>
                    </label>
                    <Input
                      type="text"
                      value={item.alt}
                      onChange={(e: any) => handleChange(index, "alt", e.target.value)}
                      placeholder="Ex: Alura, Udemy, Coursera"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="mt-1 text-xs text-[var(--color-secondary)]/50">
                      Nome da plataforma de cursos
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                      URL da Plataforma
                    </label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-secondary)]/70" />
                      <Input
                        type="text"
                        value={item.url}
                        onChange={(e: any) => handleChange(index, "url", e.target.value)}
                        placeholder="Ex: https://www.alura.com.br/"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
                      />
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-secondary)]/50">
                      Link para a plataforma de cursos
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                      Largura (px)
                    </label>
                    <Input
                      type="number"
                      value={item.width}
                      onChange={(e: any) => handleChange(index, "width", parseInt(e.target.value) || 120)}
                      placeholder="120"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="mt-1 text-xs text-[var(--color-secondary)]/50">
                      Largura da imagem em pixels
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                      Altura (px)
                    </label>
                    <Input
                      type="number"
                      value={item.height}
                      onChange={(e: any) => handleChange(index, "height", parseInt(e.target.value) || 80)}
                      placeholder="80"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="mt-1 text-xs text-[var(--color-secondary)]/50">
                      Altura da imagem em pixels
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
}

export default function LogosCursoPage() {
  const [expandedSections, setExpandedSections] = useState({
    config: true,
    logos: true
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [deleteSingleModal, setDeleteSingleModal] = useState({
    isOpen: false,
    index: -1,
    title: ""
  });

  // Estado local para gerenciar os logos
  const [localLogos, setLocalLogos] = useState<LogoData[]>([]);
  const [lastAddedId, setLastAddedId] = useState<number | null>(null);

  const {
    data: componentData,
    exists,
    loading,
    success,
    errorMsg,
    deleteModal,
    fileStates,
    updateNested,
    setFileState,
    save,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
  } = useJsonManagement<LogosCursoPageData>({
    apiPath: "/api/tegbe-institucional/json/logos-curso",
    defaultData: defaultData,
    mergeFunction: mergeWithDefaults,
  });

  const currentData = componentData || defaultData;

  // Sincroniza os dados quando carregam do banco
  useEffect(() => {
    if (currentData.data) {
      setLocalLogos(currentData.data);
    }
  }, [currentData.data]);

  // Efeito para fazer scroll até o último item adicionado
  useEffect(() => {
    if (lastAddedId) {
      setTimeout(() => {
        const element = document.querySelector(`[data-logo-id="${lastAddedId}"]`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'nearest'
          });
          setLastAddedId(null); // Reseta após o scroll
        }
      }, 100);
    }
  }, [lastAddedId]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    updateNested(path, value);
  };

  const handleLogoChange = (index: number, field: keyof LogoData, value: any) => {
    const updated = [...localLogos];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], [field]: value };
      setLocalLogos(updated);
      updateNested('data', updated);
    }
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

    const oldIndex = localLogos.findIndex((item) => `logo-curso-${item.id}` === active.id);
    const newIndex = localLogos.findIndex((item) => `logo-curso-${item.id}` === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const updated = arrayMove(localLogos, oldIndex, newIndex);
      setLocalLogos(updated);
      updateNested('data', updated);
    }
  };

  const generateNewId = () => {
    const existingIds = localLogos.map(logo => logo.id);
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    return maxId + 1;
  };

  const handleAddLogo = () => {
    const newId = generateNewId();
    const newLogo: LogoData = {
      id: newId,
      src: '',
      alt: '',
      width: 120,
      height: 80,
      url: ''
    };
    
    // CORREÇÃO: Adiciona o novo item no FINAL da lista
    const updated = [...localLogos, newLogo];
    setLocalLogos(updated);
    updateNested('data', updated);
    setLastAddedId(newId); // Define o ID do último item adicionado
  };

  const removeLogo = (index: number) => {
    if (localLogos.length <= 1) {
      // Se só tem um item, não remove, apenas limpa
      const updated = [{
        id: 1,
        src: '',
        alt: '',
        width: 120,
        height: 80,
        url: ''
      }];
      setLocalLogos(updated);
      updateNested('data', updated);
      
      // Remove o arquivo correspondente do estado de arquivos
      setFileState(`data.1.src`, null);
    } else {
      const updated = [...localLogos];
      const deletedLogo = updated[index];
      updated.splice(index, 1);
      
      setLocalLogos(updated);
      updateNested('data', updated);
      
      // Remove o arquivo correspondente do estado de arquivos
      if (deletedLogo) {
        setFileState(`data.${deletedLogo.id}.src`, null);
      }
    }
  };

  const openDeleteSingleModal = (index: number, title: string) => {
    setDeleteSingleModal({
      isOpen: true,
      index,
      title
    });
  };

  const closeDeleteSingleModal = () => {
    setDeleteSingleModal({
      isOpen: false,
      index: -1,
      title: ""
    });
  };

  const confirmDeleteSingle = () => {
    if (deleteSingleModal.index >= 0 && deleteSingleModal.index < localLogos.length) {
      removeLogo(deleteSingleModal.index);
      closeDeleteSingleModal();
    }
  };

  const filteredLogos = useMemo(() => {
    if (!searchTerm) return localLogos;
    const term = searchTerm.toLowerCase();
    return localLogos.filter(logo => 
      logo.alt.toLowerCase().includes(term) ||
      logo.src.toLowerCase().includes(term) ||
      logo.url.toLowerCase().includes(term)
    );
  }, [localLogos, searchTerm]);

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Configurações gerais
    total += 4;
    if (currentData.variant.trim()) completed++;
    if (currentData.badgeText.trim()) completed++;
    if (currentData.badgeIcon.trim()) completed++;
    total++; // showBadge é booleano, sempre considerado como completo
    completed++;

    // Logos
    total += localLogos.length * 6; // src, alt, width, height, url, id para cada logo
    localLogos.forEach(logo => {
      if (logo.src.trim() || getFileFromState(`data.${logo.id}.src`)) completed++;
      if (logo.alt.trim()) completed++;
      if (logo.width > 0) completed++;
      if (logo.height > 0) completed++;
      if (logo.url.trim()) completed++;
      if (logo.id) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();
  const logosCompletos = localLogos.filter(logo => 
    (logo.src.trim() || getFileFromState(`data.${logo.id}.src`)) && logo.alt.trim()
  ).length;

  const getImageUrl = (logo: LogoData): string => {
    const file = getFileFromState(`data.${logo.id}.src`);
    if (file) return URL.createObjectURL(file);
    if (logo.src) {
      return logo.src.startsWith('http') ? logo.src : `https://mavellium.com.br${logo.src.startsWith('/') ? '' : '/'}${logo.src}`;
    }
    return "";
  };

  if (loading && !exists) {
    return <Loading layout={Layers} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={GraduationCap}
      title="Logos de Plataformas de Cursos"
      description="Gerencie os logos das plataformas de cursos parceiras"
      exists={!!exists}
      itemName="Logos de Cursos"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Configurações Gerais */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações Gerais"
            section="config"
            icon={Settings}
            isExpanded={expandedSections.config}
            onToggle={() => toggleSection("config")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.config ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Configurações da Seção de Logos de Cursos
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Configure as opções gerais da seção de logos de plataformas de cursos
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background-body)] w-full">
                  <div>
                    <h4 className="font-medium text-[var(--color-secondary)]">Mostrar Badge</h4>
                    <p className="text-sm text-[var(--color-secondary)]/70">
                      Exibir o badge acima dos logos das plataformas
                    </p>
                  </div>
                  <Switch
                    checked={currentData.showBadge}
                    onCheckedChange={(checked) => handleChange('showBadge', checked)}
                  />
                </div>

                {currentData.showBadge && (
                  <>
                    <div>
                      <IconSelector
                        value={currentData.badgeIcon}
                        onChange={(value) => handleChange('badgeIcon', value)}
                        label="Ícone do Badge"
                        placeholder="ph:graduation-cap-fill"
                      />
                      <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                        Ícone que aparece no badge acima dos logos
                      </p>
                    </div>

                    <div>
                      <Input
                        label="Texto do Badge"
                        value={currentData.badgeText}
                        onChange={(e) => handleChange('badgeText', e.target.value)}
                        placeholder="Ex: Plataformas de Cursos Parceiras"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                      <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                        Texto que aparece no badge acima dos logos
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Logos */}
        <div className="space-y-4">
          <SectionHeader
            title="Logos das Plataformas de Cursos"
            section="logos"
            icon={BookOpen}
            isExpanded={expandedSections.logos}
            onToggle={() => toggleSection("logos")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.logos ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Gerenciamento de Logos
                    </h4>
                    <p className="text-sm text-[var(--color-secondary)]/70">
                      Arraste e solte para reordenar os logos das plataformas
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-300" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {logosCompletos} de {localLogos.length} completos
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddLogo}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white border-none flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Logo
                    </Button>
                  </div>
                </div>

                {/* Barra de busca */}
                <div className="space-y-2 mb-6">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Buscar Plataformas
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]/70" />
                    <Input
                      type="text"
                      placeholder="Buscar por nome da plataforma, URL ou link..."
                      value={searchTerm}
                      onChange={(e: any) => setSearchTerm(e.target.value)}
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {filteredLogos.length === 0 ? (
                    <Card className="p-8 bg-[var(--color-background)]">
                      <div className="text-center">
                        <BookOpen className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                          Nenhuma plataforma encontrada
                        </h3>
                        <p className="text-sm text-[var(--color-secondary)]/70">
                          {searchTerm ? 'Tente ajustar sua busca ou limpe o filtro' : 'Adicione sua primeira plataforma de cursos'}
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
                        items={localLogos.map(logo => `logo-curso-${logo.id}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        {filteredLogos.map((item, index) => (
                          <div
                            key={`logo-curso-${item.id}`}
                            data-logo-id={item.id}
                          >
                            <SortableLogoItem
                              item={item}
                              index={index}
                              showValidation={showValidation}
                              itemList={localLogos}
                              handleChange={handleLogoChange}
                              selectedFile={getFileFromState(`data.${item.id}.src`)}
                              onFileChange={(file) => setFileState(`data.${item.id}.src`, file)}
                              openDeleteSingleModal={openDeleteSingleModal}
                            />
                          </div>
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
          onAddNew={handleAddLogo}
          isAddDisabled={false}
          isSaving={loading}
          exists={!!exists}
          completeCount={completion.completed}
          totalCount={completion.total}
          itemName="Logo de Curso"
          icon={BookOpen}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete()}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={localLogos.length}
        itemName="Logo de Curso"
      />

      {/* Modal de confirmação para deletar logo individual */}
      <DeleteConfirmationModal
        isOpen={deleteSingleModal.isOpen}
        onClose={closeDeleteSingleModal}
        onConfirm={confirmDeleteSingle}
        type="single"
        itemTitle={deleteSingleModal.title}
        totalItems={1}
        itemName="Logo de Curso"
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