/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import { 
  History, 
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Search,
  Layers,
  Calendar,
  Target,
  BookOpen,
  Image,
  Badge,
  Type,
  ArrowUpDown
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import { ImageUpload } from "@/components/ImageUpload";
import { normalizeHexColor, extractHexFromTailwind } from "@/lib/colors";
import Loading from "@/components/Loading";

interface TimelineItem {
  id?: string;
  step: string;
  title: string;
  description: string;
  file?: File | null;
  image?: string;
}

interface TimelineData {
  id?: string;
  header: {
    badge: string;
    title: string;
    subtitle: string;
  };
  timeline: TimelineItem[];
}

const defaultTimelineData: TimelineData = {
  header: {
    badge: "Nossa Jornada",
    title: "Linha do Tempo",
    subtitle: "Uma trajetória marcada por inovação e resultados"
  },
  timeline: [
    {
      id: "timeline-1",
      step: "2022",
      title: "O Inconformismo",
      description: "Nascemos da frustração. Vimos o mercado queimando verba em 'hacks' que não funcionavam. Decidimos que a Tegbe seria guiada por uma única bússola: o ROI do cliente.",
      image: ""
    },
    {
      id: "timeline-2",
      step: "2023",
      title: "A Revolução",
      description: "Implementamos metodologias próprias de auditoria e otimização. Nos tornamos parceiros oficiais do Google e Meta, com acesso a recursos exclusivos.",
      image: ""
    },
    {
      id: "timeline-3",
      step: "2024",
      title: "A Expansão",
      description: "Ampliamos nossa atuação para novas verticais e geografias. Desenvolvemos tecnologias proprietárias de análise e automação.",
      image: ""
    }
  ]
};

const mergeWithDefaults = (apiData: any, defaultData: TimelineData): TimelineData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id,
    header: {
      badge: apiData.header?.badge || defaultData.header.badge,
      title: apiData.header?.title || defaultData.header.title,
      subtitle: apiData.header?.subtitle || defaultData.header.subtitle,
    },
    timeline: apiData.timeline?.map((item: any, index: number) => ({
      id: item.id || `timeline-${index + 1}`,
      step: item.step || `Etapa ${index + 1}`,
      title: item.title || `Marco ${index + 1}`,
      description: item.description || "",
      image: item.image || "",
    })) || defaultData.timeline
  };
};

export default function TimelinePage() {
  const {
    data: timelineData,
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
  } = useJsonManagement<TimelineData>({
    apiPath: "/api/tegbe-institucional/json/historia",
    defaultData: defaultTimelineData,
    mergeFunction: mergeWithDefaults,
  });

  // Estado local para gerenciar a timeline
  const [localTimeline, setLocalTimeline] = useState<TimelineItem[]>([]);
  const [draggingItem, setDraggingItem] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    header: true,
    timeline: false,
  });

  // Referências para novos itens
  const newTimelineRef = useRef<HTMLDivElement>(null);

  // Controle de planos
  const currentPlanType = 'pro';
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  // Sincroniza os dados quando carregam do banco
  useEffect(() => {
    if (timelineData.timeline) {
      setLocalTimeline(timelineData.timeline);
    }
  }, [timelineData.timeline]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para timeline
  const handleAddTimelineItem = () => {
    if (localTimeline.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: TimelineItem = {
      id: `timeline-${Date.now()}`,
      step: '',
      title: '',
      description: '',
      image: ''
    };
    
    const updated = [...localTimeline, newItem];
    setLocalTimeline(updated);
    updateNested('timeline', updated);
    
    setTimeout(() => {
      newTimelineRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updateTimelineItem = (index: number, updates: Partial<TimelineItem>) => {
    const updated = [...localTimeline];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      setLocalTimeline(updated);
      updateNested('timeline', updated);
    }
  };

  const removeTimelineItem = (index: number) => {
    const updated = [...localTimeline];
    
    if (updated.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyItem: TimelineItem = {
        id: `timeline-${Date.now()}`,
        step: '',
        title: '',
        description: '',
        image: ''
      };
      setLocalTimeline([emptyItem]);
      updateNested('timeline', [emptyItem]);
    } else {
      updated.splice(index, 1);
      setLocalTimeline(updated);
      updateNested('timeline', updated);
    }
  };

  // Funções de drag & drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingItem === null || draggingItem === index) return;
    
    const updated = [...localTimeline];
    const draggedItem = updated[draggingItem];
    
    // Remove o item arrastado
    updated.splice(draggingItem, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingItem ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    setLocalTimeline(updated);
    updateNested('timeline', updated);
    setDraggingItem(index);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingItem(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  // Função para salvar
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Validações
  const isTimelineItemValid = (item: TimelineItem): boolean => {
    return item.step.trim() !== '' && 
           item.title.trim() !== '' && 
           item.description.trim() !== '' &&
           item.image?.trim() !== '';
  };

  const isTimelineLimitReached = localTimeline.length >= currentPlanLimit;
  const canAddNewItem = !isTimelineLimitReached;
  const timelineCompleteCount = localTimeline.filter(isTimelineItemValid).length;
  const timelineTotalCount = localTimeline.length;

  const headerCompleteCount = [
    timelineData.header.badge.trim() !== '',
    timelineData.header.title.trim() !== '',
    timelineData.header.subtitle.trim() !== ''
  ].filter(Boolean).length;

  const timelineValidationError = isTimelineLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  // Filtro de busca
  const filteredTimeline = useMemo(() => {
    if (!searchTerm.trim()) return localTimeline;
    
    const term = searchTerm.toLowerCase();
    return localTimeline.filter(item => 
      item.step.toLowerCase().includes(term) ||
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
    );
  }, [localTimeline, searchTerm]);

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Header (3 campos)
    total += 3;
    completed += headerCompleteCount;

    // Timeline items (4 campos cada)
    total += localTimeline.length * 4;
    localTimeline.forEach(item => {
      if (item.step.trim()) completed++;
      if (item.title.trim()) completed++;
      if (item.description.trim()) completed++;
      if (item.image?.trim()) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={History} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={History}
      title="Timeline - Nossa História"
      description="Gerencie a linha do tempo da empresa, mostrando os principais marcos e conquistas"
      exists={!!exists}
      itemName="Timeline"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho da Seção"
            section="header"
            icon={Layers}
            isExpanded={expandedSections.header}
            onToggle={() => toggleSection("header")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.header ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      Informações do Cabeçalho
                    </h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {headerCompleteCount} de 3 campos preenchidos
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                        <Badge className="w-4 h-4" />
                        Badge
                      </label>
                      <Input
                        type="text"
                        value={timelineData.header.badge}
                        onChange={(e) => updateNested('header.badge', e.target.value)}
                        placeholder="Ex: Nossa Jornada"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>

                    <Input
                      label="Título Principal"
                      value={timelineData.header.title}
                      onChange={(e) => updateNested('header.title', e.target.value)}
                      placeholder="Ex: Linha do Tempo"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] text-lg font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Subtítulo
                    </label>
                    <TextArea
                      placeholder="Ex: Uma trajetória marcada por inovação e resultados"
                      value={timelineData.header.subtitle}
                      onChange={(e) => updateNested('header.subtitle', e.target.value)}
                      rows={2}
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Timeline */}
        <div className="space-y-4">
          <SectionHeader
            title="Marcos da Timeline"
            section="timeline"
            icon={History}
            isExpanded={expandedSections.timeline}
            onToggle={() => toggleSection("timeline")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.timeline ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                        Marcos Históricos
                      </h4>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {timelineCompleteCount} de {timelineTotalCount} completos
                        </span>
                        <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          Limite: {currentPlanType === 'pro' ? '10' : '5'} itens
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        type="button"
                        onClick={handleAddTimelineItem}
                        variant="primary"
                        className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                        disabled={!canAddNewItem}
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Marco
                      </Button>
                      {isTimelineLimitReached && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Limite do plano atingido
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Barra de busca */}
                  <div className="mt-4 space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Buscar Marcos
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]/70" />
                      <Input
                        type="text"
                        placeholder="Buscar marcos por ano, título ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Mensagem de erro */}
                {timelineValidationError && (
                  <div className={`p-3 rounded-lg ${isTimelineLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                    <div className="flex items-start gap-2">
                      {isTimelineLimitReached ? (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm ${isTimelineLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                        {timelineValidationError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Lista da Timeline */}
                {filteredTimeline.length === 0 ? (
                  <Card className="p-8 bg-[var(--color-background)]">
                    <div className="text-center">
                      <History className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                        {searchTerm ? 'Nenhum marco encontrado' : 'Nenhum marco adicionado'}
                      </h3>
                      <p className="text-sm text-[var(--color-secondary)]/70">
                        {searchTerm ? 'Tente ajustar sua busca ou limpe o filtro' : 'Adicione seu primeiro marco usando o botão acima'}
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredTimeline.map((item, index) => {
                      const isComplete = isTimelineItemValid(item);
                      
                      return (
                        <div 
                          key={item.id || index}
                          ref={index === localTimeline.length - 1 && item.step === '' && item.title === '' ? newTimelineRef : undefined}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragEnd={handleDragEnd}
                          onDrop={handleDrop}
                          className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                            draggingItem === index 
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                              : 'hover:border-[var(--color-primary)]/50'
                          }`}
                          style={{ borderLeftWidth: '4px', borderLeftColor: isComplete ? 'var(--color-success)' : 'var(--color-warning)' }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              {/* Handle para drag & drop */}
                              <div 
                                className="cursor-grab active:cursor-grabbing p-2 hover:bg-[var(--color-background)]/50 rounded transition-colors"
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                              >
                                <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                              </div>
                              
                              {/* Indicador de posição */}
                              <div className="flex flex-col items-center">
                                <div className="flex items-center gap-2 text-xs text-[var(--color-secondary)]/70">
                                  <ArrowUpDown className="w-3 h-3" />
                                  <span className="font-medium">{index + 1}</span>
                                </div>
                                <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                  {item.step && (
                                    <div className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-full text-sm font-medium flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>{item.step}</span>
                                    </div>
                                  )}
                                  <h4 className="font-medium text-[var(--color-secondary)]">
                                    {item.title || "Marco sem título"}
                                  </h4>
                                  {isComplete ? (
                                    <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                      Completo
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                      Incompleto
                                    </span>
                                  )}
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
                                        currentImage={item.image || ""}
                                        selectedFile={fileStates[`timeline.${index}.image`] || null}
                                        onFileChange={(file) => setFileState(`timeline.${index}.image`, file)}
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
                                          value={item.step}
                                          onChange={(e) => updateTimelineItem(index, { step: e.target.value })}
                                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                        />
                                        <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                                          Use anos (2022, 2023) ou conceitos (Futuro, Próxima Fase)
                                        </p>
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                                          <Type className="w-4 h-4" />
                                          Título do Marco
                                        </label>
                                        <Input
                                          type="text"
                                          placeholder="Ex: O Inconformismo"
                                          value={item.title}
                                          onChange={(e) => updateTimelineItem(index, { title: e.target.value })}
                                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                                          <BookOpen className="w-4 h-4" />
                                          Descrição Detalhada
                                        </label>
                                        <TextArea
                                          placeholder="Nascemos da frustração. Vimos o mercado queimando verba em 'hacks' que não funcionavam. Decidimos que a Tegbe seria guiada por uma única bússola: o ROI do cliente."
                                          value={item.description}
                                          onChange={(e) => updateTimelineItem(index, { description: e.target.value })}
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
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <Button
                                type="button"
                                onClick={() => removeTimelineItem(index)}
                                variant="danger"
                                className="whitespace-nowrap bg-red-600 hover:bg-red-700 border-none flex items-center gap-2"
                                disabled={localTimeline.length <= 1}
                              >
                                <Trash2 className="w-4 h-4" />
                                Remover
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          onAddNew={handleAddTimelineItem}
          isAddDisabled={!canAddNewItem}
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
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração da Timeline"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}