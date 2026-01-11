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
  TrendingUp, 
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Tag,
  Type,
  Sparkles,
  Palette,
  Award,
  Target,
  Search,
  Layers
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import { ImageUpload } from "@/components/ImageUpload";
import ColorPicker from "@/components/ColorPicker";
import { hexToTailwindBgClass, normalizeHexColor } from "@/lib/colors";
import Loading from "@/components/Loading";

interface CaseItem {
  id?: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  image: string;
  color: string; // Armazenado como hex
  badgeColor: string; // Armazenado como hex
  effect: "none" | "glow" | "pulse" | "shadow" | "gradient";
}

interface CasesData {
  id?: string;
  header: {
    badge: string;
    title: string;
  };
  cases: CaseItem[];
}

const defaultCasesData: CasesData = {
  header: {
    badge: "Casos de Sucesso",
    title: "Transformamos Ideias em Resultados Reais"
  },
  cases: [
    {
      id: "case-1",
      title: "Case 40k - R$40.000,00 de faturamento em 90 dias",
      subtitle: "R$40.000,00 de faturamento em 90 dias",
      badge: "Sucesso",
      description: "Em apenas 90 dias, estruturamos uma operação que saltou para R$ 40.000,00 de faturamento e mais de 650 vendas. Escala real para quem busca resultados sólidos.",
      image: "",
      color: "#8B5CF6", // Armazenado como hex
      badgeColor: "#10B981", // Armazenado como hex
      effect: "none"
    }
  ]
};

const effectOptions = [
  { value: "none", label: "Sem Efeito" },
  { value: "glow", label: "Brilho Suave" },
  { value: "pulse", label: "Pulsação Leve" },
  { value: "shadow", label: "Sombra Elevada" },
  { value: "gradient", label: "Gradiente" },
];

// Função para extrair hex de uma classe Tailwind
const extractHexFromTailwindString = (tailwindClass: string): string => {
  if (!tailwindClass) return "#8B5CF6";
  
  // Se já for hex, normaliza e retorna
  if (tailwindClass.startsWith("#")) {
    return normalizeHexColor(tailwindClass);
  }
  
  // Se for classe Tailwind com hex customizado [hex]
  const hexMatch = tailwindClass.match(/\[#([0-9A-Fa-f]{3,6})\]/);
  if (hexMatch) {
    return normalizeHexColor(`#${hexMatch[1]}`);
  }
  
  // Para classes Tailwind nomeadas, mapeamos para hex
  const colorMap: Record<string, string> = {
    // Purple
    "bg-purple-500": "#8B5CF6", "text-purple-500": "#8B5CF6",
    "bg-purple-600": "#7C3AED", "text-purple-600": "#7C3AED",
    // Green
    "bg-green-500": "#10B981", "text-green-500": "#10B981",
    "bg-green-600": "#059669", "text-green-600": "#059669",
    // Blue
    "bg-blue-500": "#3B82F6", "text-blue-500": "#3B82F6",
    // Red
    "bg-red-500": "#EF4444", "text-red-500": "#EF4444",
    // Fallback
    "bg-[#8B5CF6]": "#8B5CF6", "text-[#8B5CF6]": "#8B5CF6",
    "bg-[#10B981]": "#10B981", "text-[#10B981]": "#10B981",
  };
  
  return colorMap[tailwindClass] || "#8B5CF6";
};

const mergeWithDefaults = (apiData: any, defaultData: CasesData): CasesData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id,
    header: {
      badge: apiData.header?.badge || defaultData.header.badge,
      title: apiData.header?.title || defaultData.header.title,
    },
    cases: apiData.cases?.map((caseItem: any, index: number) => ({
      id: caseItem.id || `case-${index + 1}`,
      title: caseItem.title || `Case ${index + 1}`,
      subtitle: caseItem.subtitle || "",
      badge: caseItem.badge || "",
      description: caseItem.description || "",
      image: caseItem.image || "",
      // Converte classes Tailwind para hex se necessário
      color: extractHexFromTailwindString(caseItem.color || defaultData.cases[0].color),
      badgeColor: extractHexFromTailwindString(caseItem.badgeColor || defaultData.cases[0].badgeColor),
      effect: caseItem.effect || "none",
    })) || defaultData.cases
  };
};

export default function CasesVendaMaisPage() {
  const {
    data: casesData,
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
  } = useJsonManagement<CasesData>({
    apiPath: "/api/tegbe-institucional/json/cases-venda-mais",
    defaultData: defaultCasesData,
    mergeFunction: mergeWithDefaults,
  });

  // Estado local para gerenciar os cases
  const [localCases, setLocalCases] = useState<CaseItem[]>([]);
  const [draggingCase, setDraggingCase] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    header: true,
    cases: false,
  });

  // Referências para novos itens
  const newCaseRef = useRef<HTMLDivElement>(null);

  // Controle de planos
  const currentPlanType = 'pro'; // Altere conforme sua lógica de planos
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  // Sincroniza os dados quando carregam do banco
  useEffect(() => {
    if (casesData.cases) {
      setLocalCases(casesData.cases);
    }
  }, [casesData.cases]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para cases
  const handleAddCase = () => {
    if (localCases.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: CaseItem = {
      id: `case-${Date.now()}`,
      title: '',
      subtitle: '',
      badge: '',
      description: '',
      image: '',
      color: '#8B5CF6',
      badgeColor: '#10B981',
      effect: 'none'
    };
    
    const updated = [...localCases, newItem];
    setLocalCases(updated);
    updateNested('cases', updated);
    
    setTimeout(() => {
      newCaseRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updateCase = (index: number, updates: Partial<CaseItem>) => {
    const updated = [...localCases];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      setLocalCases(updated);
      updateNested('cases', updated);
    }
  };

  const removeCase = (index: number) => {
    const updated = [...localCases];
    
    if (updated.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyItem: CaseItem = {
        id: `case-${Date.now()}`,
        title: '',
        subtitle: '',
        badge: '',
        description: '',
        image: '',
        color: '#8B5CF6',
        badgeColor: '#10B981',
        effect: 'none'
      };
      setLocalCases([emptyItem]);
      updateNested('cases', [emptyItem]);
    } else {
      updated.splice(index, 1);
      setLocalCases(updated);
      updateNested('cases', updated);
    }
  };

  // Funções de drag & drop para cases
  const handleCaseDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingCase(index);
  };

  const handleCaseDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingCase === null || draggingCase === index) return;
    
    const updated = [...localCases];
    const draggedItem = updated[draggingCase];
    
    // Remove o item arrastado
    updated.splice(draggingCase, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingCase ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    setLocalCases(updated);
    updateNested('cases', updated);
    setDraggingCase(index);
  };

  const handleCaseDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingCase(null);
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

  // Função para atualizar cores dos cases
  const handleCaseColorChange = (index: number, hexColor: string, type: "main" | "badge") => {
    const normalizedHex = normalizeHexColor(hexColor);
    const field = type === "main" ? "color" : "badgeColor";
    updateCase(index, { [field]: normalizedHex });
  };

  // Função para salvar - converte hex para Tailwind antes de salvar
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      // Converte cores hex para Tailwind antes de salvar
      const casesWithTailwind = localCases.map(caseItem => ({
        ...caseItem,
        color: hexToTailwindBgClass(caseItem.color),
        badgeColor: hexToTailwindBgClass(caseItem.badgeColor)
      }));
      
      // Atualiza temporariamente os dados com Tailwind
      updateNested('cases', casesWithTailwind);
      
      await save();
      
      // Reverte para hex após salvar (para continuar mostrando hex na UI)
      const casesWithHex = localCases.map(caseItem => ({
        ...caseItem,
        color: normalizeHexColor(caseItem.color),
        badgeColor: normalizeHexColor(caseItem.badgeColor)
      }));
      
      updateNested('cases', casesWithHex);
      
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Validações
  const isCaseValid = (item: CaseItem): boolean => {
    return item.title.trim() !== '' && 
           item.description.trim() !== '' && 
           item.image.trim() !== '';
  };

  const isCasesLimitReached = localCases.length >= currentPlanLimit;
  const canAddNewCase = !isCasesLimitReached;
  const casesCompleteCount = localCases.filter(isCaseValid).length;
  const casesTotalCount = localCases.length;

  const headerCompleteCount = [
    casesData.header.badge.trim() !== '',
    casesData.header.title.trim() !== ''
  ].filter(Boolean).length;

  const casesValidationError = isCasesLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  // Filtro de busca
  const filteredCases = useMemo(() => {
    if (!searchTerm.trim()) return localCases;
    
    const term = searchTerm.toLowerCase();
    return localCases.filter(caseItem => 
      caseItem.title.toLowerCase().includes(term) ||
      caseItem.subtitle.toLowerCase().includes(term) ||
      caseItem.badge.toLowerCase().includes(term) ||
      caseItem.description.toLowerCase().includes(term)
    );
  }, [localCases, searchTerm]);

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Header (2 campos)
    total += 2;
    completed += headerCompleteCount;

    // Cases (8 campos cada)
    total += localCases.length * 8;
    localCases.forEach(caseItem => {
      if (caseItem.title.trim()) completed++;
      if (caseItem.subtitle.trim()) completed++;
      if (caseItem.badge.trim()) completed++;
      if (caseItem.description.trim()) completed++;
      if (caseItem.image.trim()) completed++;
      if (caseItem.color.trim()) completed++;
      if (caseItem.badgeColor.trim()) completed++;
      if (caseItem.effect.trim()) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={TrendingUp} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={TrendingUp}
      title="Cases de Venda+"
      description="Gerencie os cases de sucesso que mostram resultados reais de vendas"
      exists={!!exists}
      itemName="Cases de Venda"
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
                        {headerCompleteCount} de 2 campos preenchidos
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Badge (Categoria)"
                      value={casesData.header.badge}
                      onChange={(e) => updateNested('header.badge', e.target.value)}
                      placeholder="Ex: Casos de Sucesso"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />

                    <div className="md:col-span-2">
                      <Input
                        label="Título Principal"
                        value={casesData.header.title}
                        onChange={(e) => updateNested('header.title', e.target.value)}
                        placeholder="Ex: Transformamos Ideias em Resultados Reais"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] text-lg font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Cases */}
        <div className="space-y-4">
          <SectionHeader
            title="Cases de Sucesso"
            section="cases"
            icon={TrendingUp}
            isExpanded={expandedSections.cases}
            onToggle={() => toggleSection("cases")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.cases ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                        Lista de Cases
                      </h4>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {casesCompleteCount} de {casesTotalCount} completos
                        </span>
                        <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          Limite: {currentPlanType === 'pro' ? '10' : '5'} casos
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        type="button"
                        onClick={handleAddCase}
                        variant="primary"
                        className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                        disabled={!canAddNewCase}
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Case
                      </Button>
                      {isCasesLimitReached && (
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
                      Buscar Cases
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]/70" />
                      <Input
                        type="text"
                        placeholder="Buscar cases por título, subtítulo, badge ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Mensagem de erro */}
                {casesValidationError && (
                  <div className={`p-3 rounded-lg ${isCasesLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                    <div className="flex items-start gap-2">
                      {isCasesLimitReached ? (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm ${isCasesLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                        {casesValidationError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Lista de Cases */}
                {filteredCases.length === 0 ? (
                  <Card className="p-8 bg-[var(--color-background)]">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                        {searchTerm ? 'Nenhum case encontrado' : 'Nenhum case adicionado'}
                      </h3>
                      <p className="text-sm text-[var(--color-secondary)]/70">
                        {searchTerm ? 'Tente ajustar sua busca ou limpe o filtro' : 'Adicione seu primeiro case usando o botão acima'}
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredCases.map((caseItem, index) => {
                      const normalizedColor = normalizeHexColor(caseItem.color);
                      const normalizedBadgeColor = normalizeHexColor(caseItem.badgeColor);
                      
                      return (
                        <div 
                          key={caseItem.id || index}
                          ref={index === localCases.length - 1 && caseItem.title === '' && caseItem.description === '' ? newCaseRef : undefined}
                          draggable
                          onDragStart={(e) => handleCaseDragStart(e, index)}
                          onDragOver={(e) => handleCaseDragOver(e, index)}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragEnd={handleCaseDragEnd}
                          onDrop={handleDrop}
                          className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                            draggingCase === index 
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                              : 'hover:border-[var(--color-primary)]/50'
                          }`}
                          style={{ borderLeftColor: normalizedColor || '#8B5CF6', borderLeftWidth: '4px' }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              {/* Handle para drag & drop */}
                              <div 
                                className="cursor-grab active:cursor-grabbing p-2 hover:bg-[var(--color-background)]/50 rounded transition-colors"
                                draggable
                                onDragStart={(e) => handleCaseDragStart(e, index)}
                              >
                                <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                              </div>
                              
                              {/* Indicador de posição */}
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-medium text-[var(--color-secondary)]/70">
                                  {index + 1}
                                </span>
                                <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                  <h4 className="font-medium text-[var(--color-secondary)]">
                                    {caseItem.title || "Case sem título"}
                                  </h4>
                                  {caseItem.title && caseItem.description && caseItem.image ? (
                                    <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                      Completo
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                      Incompleto
                                    </span>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                  <div className="space-y-6">
                                    <div>
                                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                                        <Target className="w-4 h-4" />
                                        Imagem do Case
                                      </label>
                                      <ImageUpload
                                        label="Imagem de Destaque"
                                        description="Formatos suportados: JPG, PNG, WEBP. Tamanho recomendado: 800x400px."
                                        currentImage={caseItem.image}
                                        selectedFile={fileStates[`cases.${index}.image`] || null}
                                        onFileChange={(file) => setFileState(`cases.${index}.image`, file)}
                                        aspectRatio="aspect-video"
                                        previewWidth={300}
                                        previewHeight={150}
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                                        <Palette className="w-4 h-4" />
                                        Cor Principal
                                      </label>
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="text"
                                          value={caseItem.color}
                                          onChange={(e) => {
                                            const hex = normalizeHexColor(e.target.value);
                                            updateCase(index, { color: hex });
                                          }}
                                          placeholder="Ex: #8B5CF6"
                                          className="flex-1 font-mono bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                        />
                                        <ColorPicker
                                          color={normalizedColor}
                                          onChange={(hex: string) => handleCaseColorChange(index, hex, "main")}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="lg:col-span-2 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-2">
                                        <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                                          <Type className="w-4 h-4" />
                                          Título do Case
                                        </label>
                                        <Input
                                          type="text"
                                          value={caseItem.title}
                                          onChange={(e) => updateCase(index, { title: e.target.value })}
                                          placeholder="Ex: Case 40k - R$40.000,00 de faturamento em 90 dias"
                                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] text-lg font-semibold"
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                                          <Award className="w-4 h-4" />
                                          Badge/Etiqueta
                                        </label>
                                        <Input
                                          type="text"
                                          value={caseItem.badge}
                                          onChange={(e) => updateCase(index, { badge: e.target.value })}
                                          placeholder="Ex: Sucesso, Destaque, Recorde"
                                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-2">
                                        <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                          Subtítulo/Resultado
                                        </label>
                                        <Input
                                          type="text"
                                          value={caseItem.subtitle}
                                          onChange={(e) => updateCase(index, { subtitle: e.target.value })}
                                          placeholder="Ex: R$40.000,00 de faturamento em 90 dias"
                                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                                          <Sparkles className="w-4 h-4" />
                                          Efeito Visual
                                        </label>
                                        <select
                                          value={caseItem.effect}
                                          onChange={(e) => updateCase(index, { effect: e.target.value as any })}
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

                                    <div className="space-y-2">
                                      <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                                        <Tag className="w-4 h-4" />
                                        Cor do Badge
                                      </label>
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="text"
                                          placeholder="Ex: #10B981"
                                          value={caseItem.badgeColor}
                                          onChange={(e) => {
                                            const hex = normalizeHexColor(e.target.value);
                                            updateCase(index, { badgeColor: hex });
                                          }}
                                          className="flex-1 font-mono bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                        />
                                        <ColorPicker
                                          color={normalizedBadgeColor}
                                          onChange={(hex: string) => handleCaseColorChange(index, hex, "badge")}
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                        Descrição Detalhada
                                      </label>
                                      <TextArea
                                        placeholder="Ex: Em apenas 90 dias, estruturamos uma operação que saltou para R$ 40.000,00 de faturamento e mais de 650 vendas. Escala real para quem busca resultados sólidos."
                                        value={caseItem.description}
                                        onChange={(e) => updateCase(index, { description: e.target.value })}
                                        rows={6}
                                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <Button
                                type="button"
                                onClick={() => removeCase(index)}
                                variant="danger"
                                className="whitespace-nowrap bg-red-600 hover:bg-red-700 border-none flex items-center gap-2"
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
          isAddDisabled={false}
          isSaving={loading}
          exists={!!exists}
          totalCount={completion.total}
          itemName="Cases de Venda"
          icon={TrendingUp}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração dos Cases de Venda"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}