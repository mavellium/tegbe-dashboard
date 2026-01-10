// components/HeadlinePageComponent.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Switch } from "@/components/Switch";
import { 
  Tag, 
  Palette, 
  Type, 
  Zap, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  Home,
  ShoppingCart,
  Megaphone,
  Info,
  GraduationCap,
  LucideIcon,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import ColorPicker from "@/components/ColorPicker";
import IconSelector from "@/components/IconSelector";
import { useJsonManagement } from "@/hooks/useJsonManagement";

interface BadgeData {
  icone?: string;
  texto?: string;
  cor?: string;
  visivel?: boolean;
}

interface PalavraAnimada {
  texto?: string;
  cor?: string;
  ordem?: number;
}

interface TituloData {
  chamada?: string;
  palavrasAnimadas?: PalavraAnimada[];
  tituloPrincipal?: string;
  separador?: string;
}

interface BotaoData {
  texto?: string;
  link?: string;
  icone?: string;
  estilo?: string;
  visivel?: boolean;
}

interface AgendaData {
  status?: string;
  mes?: string;
  corStatus?: string;
  texto?: string;
  visivel?: boolean;
}

interface EfeitosData {
  brilhoTitulo?: string;
  spotlight?: boolean;
  grid?: boolean;
  sombraInferior?: boolean;
}

interface ConfiguracoesData {
  intervaloAnimacao?: number;
  corFundo?: string;
  corDestaque?: string;
  efeitos?: EfeitosData;
}

interface HeadlinePageData {
  badge?: BadgeData;
  titulo?: TituloData;
  subtitulo?: string;
  botao?: BotaoData;
  agenda?: AgendaData;
  configuracoes?: ConfiguracoesData;
}

interface HeadlineData {
  home?: HeadlinePageData;
  ecommerce?: HeadlinePageData;
  marketing?: HeadlinePageData;
  sobre?: HeadlinePageData;
  cursos?: HeadlinePageData;
  defaultTheme?: "home" | "ecommerce" | "marketing" | "sobre" | "cursos";
}

const defaultHeadlinePageData: HeadlinePageData = {
  badge: {
    icone: "",
    texto: "",
    cor: "#FFCC00",
    visivel: true
  },
  titulo: {
    chamada: "",
    palavrasAnimadas: [],
    tituloPrincipal: "",
    separador: ""
  },
  subtitulo: "",
  botao: {
    texto: "",
    link: "",
    icone: "",
    estilo: "gradiente-amarelo",
    visivel: true
  },
  agenda: {
    status: "aberta",
    mes: "",
    corStatus: "#22C55E",
    texto: "",
    visivel: true
  },
  configuracoes: {
    intervaloAnimacao: 2500,
    corFundo: "#020202",
    corDestaque: "#FFCC00",
    efeitos: {
      brilhoTitulo: "",
      spotlight: false,
      grid: false,
      sombraInferior: false
    }
  }
};

const defaultHeadlineData: HeadlineData = {
  home: { ...defaultHeadlinePageData },
  ecommerce: { ...defaultHeadlinePageData },
  marketing: { ...defaultHeadlinePageData },
  sobre: { ...defaultHeadlinePageData },
  cursos: { ...defaultHeadlinePageData },
  defaultTheme: "home"
};

const expandedSectionsDefault = {
  badge: true,
  titulo: false,
  subtitulo: false,
  botao: false,
  agenda: false,
  configuracoes: false
};

// Componente ThemeTab
interface ThemeTabProps {
  themeKey: "home" | "ecommerce" | "marketing" | "sobre" | "cursos";
  label: string;
  isActive: boolean;
  onClick: (theme: "home" | "ecommerce" | "marketing" | "sobre" | "cursos") => void;
  icon: React.ReactNode;
}

const ThemeTab = ({ themeKey, label, isActive, onClick, icon }: ThemeTabProps) => (
  <Button
    type="button"
    onClick={() => onClick(themeKey)}
    variant={isActive ? "primary" : "secondary"}
    className={`px-4 py-2 font-medium rounded-lg transition-all flex items-center gap-2 ${
      isActive
        ? "bg-[var(--color-primary)] text-white shadow-md"
        : "bg-[var(--color-background)] text-[var(--color-secondary)] hover:bg-[var(--color-background)]/80 border border-[var(--color-border)]"
    }`}
  >
    {icon}
    <span>{label}</span>
  </Button>
);

// Helper function para obter dados seguros com valores padrão
const getSafeData = <T,>(data: T | undefined | null, defaultValue: T): T => {
  if (!data) return defaultValue;
  return data;
};

export function HeadlinePageComponent({activeTab}: {activeTab: "home" | "ecommerce" | "marketing" | "sobre" | "cursos"}) {
  const [activeTheme, setActiveTheme] = useState<"home" | "ecommerce" | "marketing" | "sobre" | "cursos">(activeTab);
  const [expandedSections, setExpandedSections] = useState(expandedSectionsDefault);
  const [localPalavrasAnimadas, setLocalPalavrasAnimadas] = useState<PalavraAnimada[]>([]);
  const [draggingPalavra, setDraggingPalavra] = useState<number | null>(null);
  
  const {
    data: headlineData,
    loading,
    success,
    errorMsg,
    deleteModal,
    save,
    exists,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
    updateNested
  } = useJsonManagement<HeadlineData>({
    apiPath: "/api/tegbe-institucional/json/headline",
    defaultData: defaultHeadlineData,
  });

  // Referência para nova palavra animada
  const newPalavraRef = useRef<HTMLDivElement>(null);

  // Controle de planos
  const currentPlanType = 'pro';
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  // Sincroniza palavras animadas quando carregam do banco
  useEffect(() => {
    const currentThemeData = getCurrentThemeData();
    const palavras = currentThemeData.titulo?.palavrasAnimadas || [];
    setLocalPalavrasAnimadas(palavras);
  }, [headlineData, activeTheme]);

  // Helper para obter dados do tema atual de forma segura
  const getCurrentThemeData = useCallback((): HeadlinePageData => {
    const themeData = headlineData?.[activeTheme];
    return getSafeData(themeData, defaultHeadlinePageData);
  }, [headlineData, activeTheme]);

  // Calcular campos completos
  const calculateCompleteCount = useCallback(() => {
    const currentThemeData = getCurrentThemeData();
    let count = 0;
    
    // Verificar campos básicos com encadeamento opcional
    if (currentThemeData.badge?.texto?.trim() !== "") count++;
    if (currentThemeData.titulo?.tituloPrincipal?.trim() !== "") count++;
    if (currentThemeData.subtitulo?.trim() !== "") count++;
    if (currentThemeData.botao?.texto?.trim() !== "" && currentThemeData.botao?.link?.trim() !== "") count++;
    if (currentThemeData.agenda?.texto?.trim() !== "") count++;
    if (currentThemeData.configuracoes?.corFundo?.trim() !== "") count++;
    
    return count;
  }, [getCurrentThemeData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 6;

  const toggleSection = (section: keyof typeof expandedSectionsDefault) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleThemeChange = useCallback((path: string, value: any) => {
    updateNested(`${activeTheme}.${path}`, value);
  }, [activeTheme, updateNested]);

  const handleColorChange = (path: string, color: string) => {
    const cleanColor = color.startsWith('#') ? color : `#${color}`;
    handleThemeChange(path, cleanColor);
  };

  // Funções para palavras animadas com drag & drop
  const handleAddPalavraAnimada = () => {
    if (localPalavrasAnimadas.length >= currentPlanLimit) {
      return false;
    }
    
    const newPalavra: PalavraAnimada = {
      texto: "NOVA PALAVRA",
      cor: "#FFCC00",
      ordem: localPalavrasAnimadas.length + 1
    };
    
    const updated = [...localPalavrasAnimadas, newPalavra];
    setLocalPalavrasAnimadas(updated);
    handleThemeChange('titulo.palavrasAnimadas', updated);
    
    setTimeout(() => {
      newPalavraRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updatePalavraAnimada = (index: number, updates: Partial<PalavraAnimada>) => {
    const updated = [...localPalavrasAnimadas];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      setLocalPalavrasAnimadas(updated);
      handleThemeChange('titulo.palavrasAnimadas', updated);
    }
  };

  const removePalavraAnimada = (index: number) => {
    const updated = [...localPalavrasAnimadas];
    
    if (updated.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyPalavra: PalavraAnimada = {
        texto: "",
        cor: "#FFCC00",
        ordem: 1
      };
      setLocalPalavrasAnimadas([emptyPalavra]);
      handleThemeChange('titulo.palavrasAnimadas', [emptyPalavra]);
    } else {
      updated.splice(index, 1);
      // Atualiza ordens
      updated.forEach((palavra, idx) => {
        palavra.ordem = idx + 1;
      });
      setLocalPalavrasAnimadas(updated);
      handleThemeChange('titulo.palavrasAnimadas', updated);
    }
  };

  // Funções de drag & drop para palavras animadas
  const handlePalavraDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingPalavra(index);
  };

  const handlePalavraDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingPalavra === null || draggingPalavra === index) return;
    
    const updated = [...localPalavrasAnimadas];
    const draggedItem = updated[draggingPalavra];
    
    // Remove o item arrastado
    updated.splice(draggingPalavra, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingPalavra ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    // Atualiza ordens
    updated.forEach((palavra, idx) => {
      palavra.ordem = idx + 1;
    });
    
    setLocalPalavrasAnimadas(updated);
    handleThemeChange('titulo.palavrasAnimadas', updated);
    setDraggingPalavra(index);
  };

  const handlePalavraDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingPalavra(null);
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Validações
  const isPalavraAnimadaValid = (palavra: PalavraAnimada): boolean => {
    return palavra.texto?.trim() !== '' && palavra.cor?.trim() !== '';
  };

  const isPalavrasLimitReached = localPalavrasAnimadas.length >= currentPlanLimit;
  const canAddNewPalavra = !isPalavrasLimitReached;
  const palavrasCompleteCount = localPalavrasAnimadas.filter(isPalavraAnimadaValid).length;
  const palavrasTotalCount = localPalavrasAnimadas.length;

  const palavrasValidationError = isPalavrasLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;
    const currentThemeData = getCurrentThemeData();

    // Badge (4 campos)
    total += 4;
    if (currentThemeData.badge?.icone?.trim()) completed++;
    if (currentThemeData.badge?.texto?.trim()) completed++;
    if (currentThemeData.badge?.cor?.trim()) completed++;
    if (currentThemeData.badge?.visivel !== undefined) completed++;

    // Título (3 campos + palavras animadas)
    total += 3;
    if (currentThemeData.titulo?.chamada?.trim()) completed++;
    if (currentThemeData.titulo?.tituloPrincipal?.trim()) completed++;
    if (currentThemeData.titulo?.separador?.trim()) completed++;

    // Palavras Animadas (2 campos cada)
    total += localPalavrasAnimadas.length * 2;
    localPalavrasAnimadas.forEach(palavra => {
      if (palavra.texto?.trim()) completed++;
      if (palavra.cor?.trim()) completed++;
    });

    // Subtítulo (1 campo)
    total += 1;
    if (currentThemeData.subtitulo?.trim()) completed++;

    // Botão (5 campos)
    total += 5;
    if (currentThemeData.botao?.texto?.trim()) completed++;
    if (currentThemeData.botao?.link?.trim()) completed++;
    if (currentThemeData.botao?.icone?.trim()) completed++;
    if (currentThemeData.botao?.estilo?.trim()) completed++;
    if (currentThemeData.botao?.visivel !== undefined) completed++;

    // Agenda (5 campos)
    total += 5;
    if (currentThemeData.agenda?.status?.trim()) completed++;
    if (currentThemeData.agenda?.mes?.trim()) completed++;
    if (currentThemeData.agenda?.corStatus?.trim()) completed++;
    if (currentThemeData.agenda?.texto?.trim()) completed++;
    if (currentThemeData.agenda?.visivel !== undefined) completed++;

    // Configurações (6 campos)
    total += 6;
    if (currentThemeData.configuracoes?.intervaloAnimacao) completed++;
    if (currentThemeData.configuracoes?.corFundo?.trim()) completed++;
    if (currentThemeData.configuracoes?.corDestaque?.trim()) completed++;
    if (currentThemeData.configuracoes?.efeitos?.brilhoTitulo?.trim() !== undefined) completed++;
    if (currentThemeData.configuracoes?.efeitos?.spotlight !== undefined) completed++;
    if (currentThemeData.configuracoes?.efeitos?.grid !== undefined) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  const renderBadgeSection = () => {
    const currentThemeData = getCurrentThemeData();
    const badgeData = currentThemeData.badge || {};
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Badge" 
          section="badge" 
          icon={Tag}
          isExpanded={expandedSections.badge}
          onToggle={() => toggleSection("badge")}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.badge ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6 bg-[var(--color-background)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)]">
                  Configurações do Badge
                </h4>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-[var(--color-secondary)]/70">
                    {[
                      badgeData.icone?.trim() !== '',
                      badgeData.texto?.trim() !== '',
                      badgeData.cor?.trim() !== ''
                    ].filter(Boolean).length} de 3 campos preenchidos
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <IconSelector
                    value={badgeData.icone || ""}
                    onChange={(value) => handleThemeChange('badge.icone', value)}
                    label="Ícone do Badge"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Texto do Badge
                  </label>
                  <Input
                    type="text"
                    placeholder="Consultoria Oficial Mercado Livre"
                    value={badgeData.texto || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleThemeChange('badge.texto', e.target.value)
                    }
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Cor do Texto
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="#FFCC00"
                      value={badgeData.cor || "#FFCC00"}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleThemeChange('badge.cor', e.target.value)
                      }
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono flex-1"
                    />
                    <ColorPicker
                      color={badgeData.cor || "#FFCC00"}
                      onChange={(color: string) => handleColorChange('badge.cor', color)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                      Visibilidade
                    </label>
                    <p className="text-sm text-[var(--color-secondary)]/70">Mostrar ou esconder o badge</p>
                  </div>
                  <Switch
                    checked={badgeData.visivel !== false}
                    onCheckedChange={(checked: boolean) => 
                      handleThemeChange('badge.visivel', checked)
                    }
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderTituloSection = () => {
    const currentThemeData = getCurrentThemeData();
    const tituloData = currentThemeData.titulo || {};
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Título" 
          section="titulo" 
          icon={Type}
          isExpanded={expandedSections.titulo}
          onToggle={() => toggleSection("titulo")}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.titulo ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6 bg-[var(--color-background)]">
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Chamada Inicial
                </label>
                <Input
                  type="text"
                  placeholder="O seu negócio não precisa de mais"
                  value={tituloData.chamada || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('titulo.chamada', e.target.value)
                  }
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Palavras Animadas
                    </h4>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {palavrasCompleteCount} de {palavrasTotalCount} completas
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
                      onClick={handleAddPalavraAnimada}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                      disabled={!canAddNewPalavra}
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Palavra
                    </Button>
                    {isPalavrasLimitReached && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Limite do plano atingido
                      </p>
                    )}
                  </div>
                </div>

                {/* Mensagem de erro */}
                {palavrasValidationError && (
                  <div className={`p-3 rounded-lg ${isPalavrasLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                    <div className="flex items-start gap-2">
                      {isPalavrasLimitReached ? (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm ${isPalavrasLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                        {palavrasValidationError}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {localPalavrasAnimadas.map((palavra, index) => (
                    <div 
                      key={`palavra-${index}`}
                      ref={index === localPalavrasAnimadas.length - 1 ? newPalavraRef : undefined}
                      draggable
                      onDragStart={(e) => handlePalavraDragStart(e, index)}
                      onDragOver={(e) => handlePalavraDragOver(e, index)}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragEnd={handlePalavraDragEnd}
                      onDrop={handleDrop}
                      className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                        draggingPalavra === index 
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                          : 'hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Handle para drag & drop */}
                          <div 
                            className="cursor-grab active:cursor-grabbing p-2 hover:bg-[var(--color-background)]/50 rounded transition-colors"
                            draggable
                            onDragStart={(e) => handlePalavraDragStart(e, index)}
                          >
                            <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                          </div>
                          
                          {/* Indicador de posição */}
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-medium text-[var(--color-secondary)]/70">
                              {palavra.ordem || index + 1}
                            </span>
                            <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <h4 className="font-medium text-[var(--color-secondary)]">
                                {palavra.texto || "Palavra sem texto"}
                              </h4>
                              {palavra.texto && palavra.cor ? (
                                <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                  Completa
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                  Incompleta
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Texto
                                </label>
                                <Input
                                  value={palavra.texto || ""}
                                  onChange={(e) => updatePalavraAnimada(index, { texto: e.target.value })}
                                  placeholder="Palavra animada"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Cor
                                </label>
                                <div className="flex gap-2">
                                  <Input
                                    type="text"
                                    value={palavra.cor || "#FFCC00"}
                                    onChange={(e) => updatePalavraAnimada(index, { cor: e.target.value })}
                                    placeholder="#FFCC00"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono flex-1"
                                  />
                                  <ColorPicker
                                    color={palavra.cor || "#FFCC00"}
                                    onChange={(color: string) => updatePalavraAnimada(index, { cor: color })}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            onClick={() => removePalavraAnimada(index)}
                            variant="danger"
                            className="whitespace-nowrap bg-red-600 hover:bg-red-700 border-none flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Título Principal (HTML permitido)
                </label>
                <textarea
                  placeholder="PRECISA<br/>VENDER MAIS"
                  value={tituloData.tituloPrincipal || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    handleThemeChange('titulo.tituloPrincipal', e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--color-background-body)] text-[var(--color-secondary)] font-mono"
                />
                <p className="text-xs text-[var(--color-secondary)]/70 mt-1">Use &lt;br/&gt; para quebras de linha</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Separador Responsivo (HTML)
                </label>
                <Input
                  type="text"
                  placeholder="<br className='hidden sm:block'/>"
                  value={tituloData.separador || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('titulo.separador', e.target.value)
                  }
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderSubtituloSection = () => {
    const currentThemeData = getCurrentThemeData();
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Subtítulo" 
          section="subtitulo" 
          icon={Type}
          isExpanded={expandedSections.subtitulo}
          onToggle={() => toggleSection("subtitulo")}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.subtitulo ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6 bg-[var(--color-background)]">
            <div>
              <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                Texto do Subtítulo (HTML permitido)
              </label>
              <textarea
                placeholder="A única assessoria com selo Oficial que..."
                value={currentThemeData.subtitulo || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  handleThemeChange('subtitulo', e.target.value)
                }
                rows={4}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--color-background-body)] text-[var(--color-secondary)]"
              />
              <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                Use tags HTML como &lt;strong&gt; para destaque
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderBotaoSection = () => {
    const currentThemeData = getCurrentThemeData();
    const botaoData = currentThemeData.botao || {};
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Botão de Ação" 
          section="botao" 
          icon={Zap}
          isExpanded={expandedSections.botao}
          onToggle={() => toggleSection("botao")}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.botao ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6 bg-[var(--color-background)]">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Texto do Botão
                </label>
                <Input
                  type="text"
                  placeholder="QUERO VENDER AGORA"
                  value={botaoData.texto || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('botao.texto', e.target.value)
                  }
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Link
                </label>
                <Input
                  type="text"
                  placeholder="#planos"
                  value={botaoData.link || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('botao.link', e.target.value)
                  }
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>

              <div>
                <IconSelector
                  value={botaoData.icone || ""}
                  onChange={(value) => handleThemeChange('botao.icone', value)}
                  label="Ícone do Botão"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Estilo do Botão
                </label>
                <Input
                  type="text"
                  placeholder="gradiente-amarelo"
                  value={botaoData.estilo || "gradiente-amarelo"}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('botao.estilo', e.target.value)
                  }
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Visibilidade
                  </label>
                  <p className="text-sm text-[var(--color-secondary)]/70">Mostrar ou esconder o botão</p>
                </div>
                <Switch
                  checked={botaoData.visivel !== false}
                  onCheckedChange={(checked: boolean) => 
                    handleThemeChange('botao.visivel', checked)
                  }
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderAgendaSection = () => {
    const currentThemeData = getCurrentThemeData();
    const agendaData = currentThemeData.agenda || {};
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Agenda" 
          section="agenda" 
          icon={Eye}
          isExpanded={expandedSections.agenda}
          onToggle={() => toggleSection("agenda")}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.agenda ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6 bg-[var(--color-background)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Status
                </label>
                <select
                  value={agendaData.status || "aberta"}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    handleThemeChange('agenda.status', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--color-background-body)] text-[var(--color-secondary)]"
                >
                  <option value="aberta">Aberta</option>
                  <option value="fechada">Fechada</option>
                  <option value="em-breve">Em breve</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Mês
                </label>
                <Input
                  type="text"
                  placeholder="Janeiro"
                  value={agendaData.mes || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('agenda.mes', e.target.value)
                  }
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Cor do Status
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="#22C55E"
                    value={agendaData.corStatus || "#22C55E"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleThemeChange('agenda.corStatus', e.target.value)
                    }
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono flex-1"
                  />
                  <ColorPicker
                    color={agendaData.corStatus || "#22C55E"}
                    onChange={(color: string) => handleColorChange('agenda.corStatus', color)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Texto da Agenda
                </label>
                <Input
                  type="text"
                  placeholder="Agenda de Janeiro aberta"
                  value={agendaData.texto || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('agenda.texto', e.target.value)
                  }
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)] md:col-span-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Visibilidade
                  </label>
                  <p className="text-sm text-[var(--color-secondary)]/70">Mostrar ou esconder a agenda</p>
                </div>
                <Switch
                  checked={agendaData.visivel !== false}
                  onCheckedChange={(checked: boolean) => 
                    handleThemeChange('agenda.visivel', checked)
                  }
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderConfiguracoesSection = () => {
    const currentThemeData = getCurrentThemeData();
    const configuracoesData = currentThemeData.configuracoes || {};
    const efeitosData = configuracoesData.efeitos || {};
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Configurações" 
          section="configuracoes" 
          icon={Palette}
          isExpanded={expandedSections.configuracoes}
          onToggle={() => toggleSection("configuracoes")}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.configuracoes ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6 bg-[var(--color-background)]">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Intervalo da Animação (ms)
                </label>
                <Input
                  type="number"
                  min="500"
                  step="100"
                  value={configuracoesData.intervaloAnimacao?.toString() || "2500"}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      handleThemeChange('configuracoes.intervaloAnimacao', value);
                    }
                  }}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
                <p className="text-xs text-[var(--color-secondary)]/70 mt-1">Tempo entre animações das palavras (em milissegundos)</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Cor de Fundo
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="#020202"
                    value={configuracoesData.corFundo || "#020202"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleThemeChange('configuracoes.corFundo', e.target.value)
                    }
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono flex-1"
                  />
                  <ColorPicker
                    color={configuracoesData.corFundo || "#020202"}
                    onChange={(color: string) => handleColorChange('configuracoes.corFundo', color)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Cor de Destaque
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="#FFCC00"
                    value={configuracoesData.corDestaque || "#FFCC00"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleThemeChange('configuracoes.corDestaque', e.target.value)
                    }
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono flex-1"
                  />
                  <ColorPicker
                    color={configuracoesData.corDestaque || "#FFCC00"}
                    onChange={(color: string) => handleThemeChange('configuracoes.corDestaque', color)}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Efeitos Visuais
                </label>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm text-[var(--color-secondary)]">Brilho no Título</label>
                      <p className="text-xs text-[var(--color-secondary)]/70">Drop shadow no texto principal</p>
                    </div>
                    <Switch
                      checked={efeitosData.brilhoTitulo !== ''}
                      onCheckedChange={(checked: boolean) => 
                        handleThemeChange('configuracoes.efeitos.brilhoTitulo', 
                          checked ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]" : ""
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm text-[var(--color-secondary)]">Spotlight</label>
                      <p className="text-xs text-[var(--color-secondary)]/70">Efeito de foco no conteúdo</p>
                    </div>
                    <Switch
                      checked={efeitosData.spotlight || false}
                      onCheckedChange={(checked: boolean) => 
                        handleThemeChange('configuracoes.efeitos.spotlight', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm text-[var(--color-secondary)]">Grid Background</label>
                      <p className="text-xs text-[var(--color-secondary)]/70">Fundo com padrão de grid</p>
                    </div>
                    <Switch
                      checked={efeitosData.grid || false}
                      onCheckedChange={(checked: boolean) => 
                        handleThemeChange('configuracoes.efeitos.grid', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm text-[var(--color-secondary)]">Sombra Inferior</label>
                      <p className="text-xs text-[var(--color-secondary)]/70">Degradê na parte inferior</p>
                    </div>
                    <Switch
                      checked={efeitosData.sombraInferior || false}
                      onCheckedChange={(checked: boolean) => 
                        handleThemeChange('configuracoes.efeitos.sombraInferior', checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={Layers}
      title="Headline - Seção Hero"
      description="Configure o conteúdo principal da seção hero para cada página"
      exists={!!exists}
      itemName="Headline"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Tabs de Temas */}
        <Card className="p-6 bg-[var(--color-background)]">
          <div className="flex flex-wrap gap-2">
            <ThemeTab 
              themeKey="home" 
              label="Home" 
              isActive={activeTheme === "home"} 
              onClick={setActiveTheme}
              icon={<Home className="w-4 h-4" />}
            />
            <ThemeTab 
              themeKey="ecommerce" 
              label="E-commerce" 
              isActive={activeTheme === "ecommerce"} 
              onClick={setActiveTheme}
              icon={<ShoppingCart className="w-4 h-4" />}
            />
            <ThemeTab 
              themeKey="marketing" 
              label="Marketing" 
              isActive={activeTheme === "marketing"} 
              onClick={setActiveTheme}
              icon={<Megaphone className="w-4 h-4" />}
            />
            <ThemeTab 
              themeKey="sobre" 
              label="Sobre" 
              isActive={activeTheme === "sobre"} 
              onClick={setActiveTheme}
              icon={<Info className="w-4 h-4" />}
            />
            <ThemeTab 
              themeKey="cursos" 
              label="Cursos" 
              isActive={activeTheme === "cursos"} 
              onClick={setActiveTheme}
              icon={<GraduationCap className="w-4 h-4" />}
            />
          </div>
        </Card>

        {/* Seções do Headline */}
        <div className="space-y-6">
          {renderBadgeSection()}
          {renderTituloSection()}
          {renderSubtituloSection()}
          {renderBotaoSection()}
          {renderAgendaSection()}
          {renderConfiguracoesSection()}

          {/* Fixed Action Bar */}
          <FixedActionBar
            onDeleteAll={openDeleteAllModal}
            onSubmit={handleSubmit}
            isAddDisabled={false}
            isSaving={loading}
            exists={!!exists}
            totalCount={completion.total}
            itemName="Headline"
            icon={Layers}
          />
        </div>

        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          type={deleteModal.type}
          itemTitle={deleteModal.title}
          totalItems={5}
          itemName="Configuração do Headline"
        />

        <FeedbackMessages success={success} errorMsg={errorMsg} />
      </form>
    </ManageLayout>
  );
}