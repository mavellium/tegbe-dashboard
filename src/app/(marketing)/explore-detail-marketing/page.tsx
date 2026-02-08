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
  Settings, 
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Target,
  Tag,
  Type,
  Sparkles,
  Palette,
  Search,
  Layers,
  Eye,
  EyeOff,
  Power
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import { ImageUpload } from "@/components/ImageUpload";
import IconSelector from "@/components/IconSelector";
import ColorPicker from "@/components/ColorPicker";
import { hexToTailwindBgClass, normalizeHexColor } from "@/lib/colors";
import Loading from "@/components/Loading";

interface ServiceItem {
  id?: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  icon: string;
  image: string;
  color: string; // Armazenado como hex
  badgeColor: string; // Armazenado como hex
  effect: "none" | "glow" | "pulse" | "shadow" | "gradient";
}

interface CTA {
  enabled: boolean;
  text: string;
  link: string;
  style: string;
  showIcon: boolean;
  icon: string;
  position: string;
}

interface ServicesData {
  id?: string;
  header: {
    title: string;
    subtitle: string;
  };
  services: ServiceItem[];
  cta: CTA;
}

const defaultCTA: CTA = {
  enabled: true,
  text: "Agendar Consultoria",
  link: "/contato",
  style: "default",
  showIcon: true,
  icon: "ph:calendar-check",
  position: "below-content"
};

const defaultServicesData: ServicesData = {
  header: {
    title: "Nossos Serviços",
    subtitle: "Soluções especializadas para impulsionar seu negócio"
  },
  services: [
    {
      id: "service-1",
      title: "Aquisição Cirúrgica",
      subtitle: "Tráfego pago de alta conversão",
      badge: "Popular",
      description: "Tráfego pago focado em ICPs (Perfis de Cliente Ideal). Ignoramos curiosos e atraímos decisores com Google e Meta Ads de alta intenção.",
      icon: "target",
      image: "",
      color: "#3B82F6", // Armazenado como hex
      badgeColor: "#EF4444", // Armazenado como hex
      effect: "none"
    }
  ],
  cta: defaultCTA
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
  if (!tailwindClass) return "#3B82F6";
  
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
    // Blue
    "bg-blue-500": "#3B82F6", "text-blue-500": "#3B82F6",
    "bg-blue-600": "#2563EB", "text-blue-600": "#2563EB",
    // Red
    "bg-red-500": "#EF4444", "text-red-500": "#EF4444",
    "bg-red-600": "#DC2626", "text-red-600": "#DC2626",
    // Purple
    "bg-purple-500": "#8B5CF6", "text-purple-500": "#8B5CF6",
    // Green
    "bg-green-500": "#10B981", "text-green-500": "#10B981",
    // Fallback
    "bg-[#3B82F6]": "#3B82F6", "text-[#3B82F6]": "#3B82F6",
  };
  
  return colorMap[tailwindClass] || "#3B82F6";
};

const mergeWithDefaults = (apiData: any, defaultData: ServicesData): ServicesData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id,
    header: {
      title: apiData.header?.title || defaultData.header.title,
      subtitle: apiData.header?.subtitle || defaultData.header.subtitle,
    },
    services: apiData.services?.map((service: any, index: number) => ({
      id: service.id || `service-${index + 1}`,
      title: service.title || `Serviço ${index + 1}`,
      subtitle: service.subtitle || "",
      badge: service.badge || "",
      description: service.description || "",
      icon: service.icon || "",
      image: service.image || "",
      // Converte classes Tailwind para hex se necessário
      color: extractHexFromTailwindString(service.color || defaultData.services[0].color),
      badgeColor: extractHexFromTailwindString(service.badgeColor || defaultData.services[0].badgeColor),
      effect: service.effect || "none",
    })) || defaultData.services,
    cta: {
      enabled: apiData.cta?.enabled ?? defaultData.cta.enabled,
      text: apiData.cta?.text || defaultData.cta.text,
      link: apiData.cta?.link || defaultData.cta.link,
      style: apiData.cta?.style || defaultData.cta.style,
      showIcon: apiData.cta?.showIcon ?? defaultData.cta.showIcon,
      icon: apiData.cta?.icon || defaultData.cta.icon,
      position: apiData.cta?.position || defaultData.cta.position,
    }
  };
};

export default function ServicesPage() {
  const {
    data: servicesData,
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
  } = useJsonManagement<ServicesData>({
    apiPath: "/api/tegbe-institucional/json/services-marketing",
    defaultData: defaultServicesData,
    mergeFunction: mergeWithDefaults,
  });

  // Estado local para gerenciar os serviços
  const [localServices, setLocalServices] = useState<ServiceItem[]>([]);
  const [draggingService, setDraggingService] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    header: true,
    services: false,
    cta: false,
  });

  // Referências para novos itens
  const newServiceRef = useRef<HTMLDivElement>(null);

  // Controle de planos
  const currentPlanType = 'pro';
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  // Sincroniza os dados quando carregam do banco
  useEffect(() => {
    if (servicesData.services) {
      setLocalServices(servicesData.services);
    }
  }, [servicesData.services]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para serviços
  const handleAddService = () => {
    if (localServices.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: ServiceItem = {
      id: `service-${Date.now()}`,
      title: '',
      subtitle: '',
      badge: '',
      description: '',
      icon: '',
      image: '',
      color: '#3B82F6',
      badgeColor: '#EF4444',
      effect: 'none'
    };
    
    const updated = [...localServices, newItem];
    setLocalServices(updated);
    updateNested('services', updated);
    
    setTimeout(() => {
      newServiceRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updateService = (index: number, updates: Partial<ServiceItem>) => {
    const updated = [...localServices];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      setLocalServices(updated);
      updateNested('services', updated);
    }
  };

  const removeService = (index: number) => {
    const updated = [...localServices];
    
    if (updated.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyItem: ServiceItem = {
        id: `service-${Date.now()}`,
        title: '',
        subtitle: '',
        badge: '',
        description: '',
        icon: '',
        image: '',
        color: '#3B82F6',
        badgeColor: '#EF4444',
        effect: 'none'
      };
      setLocalServices([emptyItem]);
      updateNested('services', [emptyItem]);
    } else {
      updated.splice(index, 1);
      setLocalServices(updated);
      updateNested('services', updated);
    }
  };

  // Funções de drag & drop para serviços
  const handleServiceDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingService(index);
  };

  const handleServiceDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingService === null || draggingService === index) return;
    
    const updated = [...localServices];
    const draggedItem = updated[draggingService];
    
    // Remove o item arrastado
    updated.splice(draggingService, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingService ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    setLocalServices(updated);
    updateNested('services', updated);
    setDraggingService(index);
  };

  const handleServiceDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingService(null);
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

  // Função para atualizar cores dos serviços
  const handleServiceColorChange = (index: number, hexColor: string, type: "main" | "badge") => {
    const normalizedHex = normalizeHexColor(hexColor);
    const field = type === "main" ? "color" : "badgeColor";
    updateService(index, { [field]: normalizedHex });
  };

  // Função para salvar - converte hex para Tailwind antes de salvar
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      // Converte cores hex para Tailwind antes de salvar
      const servicesWithTailwind = localServices.map(service => ({
        ...service,
        color: hexToTailwindBgClass(service.color),
        badgeColor: hexToTailwindBgClass(service.badgeColor)
      }));
      
      // Atualiza temporariamente os dados com Tailwind
      updateNested('services', servicesWithTailwind);
      
      await save();
      
      // Reverte para hex após salvar (para continuar mostrando hex na UI)
      const servicesWithHex = localServices.map(service => ({
        ...service,
        color: normalizeHexColor(service.color),
        badgeColor: normalizeHexColor(service.badgeColor)
      }));
      
      updateNested('services', servicesWithHex);
      
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Validações
  const isServiceValid = (item: ServiceItem): boolean => {
    return item.title.trim() !== '' && 
           item.description.trim() !== '' && 
           item.icon.trim() !== '' &&
           item.image.trim() !== '';
  };

  const isServicesLimitReached = localServices.length >= currentPlanLimit;
  const canAddNewService = !isServicesLimitReached;
  const servicesCompleteCount = localServices.filter(isServiceValid).length;
  const servicesTotalCount = localServices.length;

  const headerCompleteCount = [
    servicesData.header.title.trim() !== '',
    servicesData.header.subtitle.trim() !== ''
  ].filter(Boolean).length;

  const ctaCompleteCount = [
    servicesData.cta.enabled,
    servicesData.cta.text.trim() !== '',
    servicesData.cta.link.trim() !== '',
    servicesData.cta.icon.trim() !== '',
    servicesData.cta.showIcon
  ].filter(Boolean).length;

  const servicesValidationError = isServicesLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  // Filtro de busca
  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return localServices;
    
    const term = searchTerm.toLowerCase();
    return localServices.filter(service => 
      service.title.toLowerCase().includes(term) ||
      service.subtitle.toLowerCase().includes(term) ||
      service.badge.toLowerCase().includes(term) ||
      service.description.toLowerCase().includes(term) ||
      service.icon.toLowerCase().includes(term)
    );
  }, [localServices, searchTerm]);

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Header (2 campos)
    total += 2;
    completed += headerCompleteCount;

    // Services (9 campos cada)
    total += localServices.length * 9;
    localServices.forEach(service => {
      if (service.title.trim()) completed++;
      if (service.subtitle.trim()) completed++;
      if (service.badge.trim()) completed++;
      if (service.description.trim()) completed++;
      if (service.icon.trim()) completed++;
      if (service.image.trim()) completed++;
      if (service.color.trim()) completed++;
      if (service.badgeColor.trim()) completed++;
      if (service.effect.trim()) completed++;
    });

    // CTA (7 campos)
    total += 7;
    if (servicesData.cta.enabled) completed++;
    if (servicesData.cta.text.trim()) completed++;
    if (servicesData.cta.link.trim()) completed++;
    if (servicesData.cta.style.trim()) completed++;
    if (servicesData.cta.showIcon) completed++;
    if (servicesData.cta.icon.trim()) completed++;
    if (servicesData.cta.position.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Settings} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Settings}
      title="Serviços"
      description="Gerencie os serviços oferecidos pela sua empresa"
      exists={!!exists}
      itemName="Serviços"
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
                      label="Título Principal"
                      value={servicesData.header.title}
                      onChange={(e) => updateNested('header.title', e.target.value)}
                      placeholder="Ex: Nossos Serviços"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] text-lg font-semibold"
                    />

                    <Input
                      label="Subtítulo"
                      value={servicesData.header.subtitle}
                      onChange={(e) => updateNested('header.subtitle', e.target.value)}
                      placeholder="Ex: Soluções especializadas para impulsionar seu negócio"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Serviços */}
        <div className="space-y-4">
          <SectionHeader
            title="Lista de Serviços"
            section="services"
            icon={Settings}
            isExpanded={expandedSections.services}
            onToggle={() => toggleSection("services")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.services ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                        Serviços Oferecidos
                      </h4>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {servicesCompleteCount} de {servicesTotalCount} completos
                        </span>
                        <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          Limite: {currentPlanType === 'pro' ? '10' : '5'} serviços
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        type="button"
                        onClick={handleAddService}
                        variant="primary"
                        className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                        disabled={!canAddNewService}
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Serviço
                      </Button>
                      {isServicesLimitReached && (
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
                      Buscar Serviços
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]/70" />
                      <Input
                        type="text"
                        placeholder="Buscar serviços por título, subtítulo, badge, descrição ou ícone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Mensagem de erro */}
                {servicesValidationError && (
                  <div className={`p-3 rounded-lg ${isServicesLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                    <div className="flex items-start gap-2">
                      {isServicesLimitReached ? (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm ${isServicesLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                        {servicesValidationError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Lista de Serviços */}
                {filteredServices.length === 0 ? (
                  <Card className="p-8 bg-[var(--color-background)]">
                    <div className="text-center">
                      <Settings className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                        {searchTerm ? 'Nenhum serviço encontrado' : 'Nenhum serviço adicionado'}
                      </h3>
                      <p className="text-sm text-[var(--color-secondary)]/70">
                        {searchTerm ? 'Tente ajustar sua busca ou limpe o filtro' : 'Adicione seu primeiro serviço usando o botão acima'}
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredServices.map((service, index) => {
                      const normalizedColor = normalizeHexColor(service.color);
                      const normalizedBadgeColor = normalizeHexColor(service.badgeColor);
                      
                      return (
                        <div 
                          key={service.id || index}
                          ref={index === localServices.length - 1 && service.title === '' && service.description === '' ? newServiceRef : undefined}
                          draggable
                          onDragStart={(e) => handleServiceDragStart(e, index)}
                          onDragOver={(e) => handleServiceDragOver(e, index)}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragEnd={handleServiceDragEnd}
                          onDrop={handleDrop}
                          className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                            draggingService === index 
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                              : 'hover:border-[var(--color-primary)]/50'
                          }`}
                          style={{ borderLeftColor: normalizedColor || '#3B82F6', borderLeftWidth: '4px' }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              {/* Handle para drag & drop */}
                              <div 
                                className="cursor-grab active:cursor-grabbing p-2 hover:bg-[var(--color-background)]/50 rounded transition-colors"
                                draggable
                                onDragStart={(e) => handleServiceDragStart(e, index)}
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
                                    {service.title || "Serviço sem título"}
                                  </h4>
                                  {service.title && service.description && service.icon && service.image ? (
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
                                        Imagem do Serviço
                                      </label>
                                      <ImageUpload
                                        label="Imagem de Destaque"
                                        description="Formatos suportados: JPG, PNG, WEBP. Tamanho recomendado: 800x400px."
                                        currentImage={service.image}
                                        onChange={(url) => updateService(index, { image: url })}
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
                                        onChange={(value: string) => updateService(index, { icon: value })}
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
                                          onChange={(e) => updateService(index, { title: e.target.value })}
                                          placeholder="Ex: Aquisição Cirúrgica"
                                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] text-lg font-semibold"
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                                          <Type className="w-4 h-4" />
                                          Subtítulo do Serviço
                                        </label>
                                        <Input
                                          type="text"
                                          value={service.subtitle}
                                          onChange={(e) => updateService(index, { subtitle: e.target.value })}
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
                                          onChange={(e) => updateService(index, { badge: e.target.value })}
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
                                          onChange={(e) => updateService(index, { effect: e.target.value as any })}
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
                                            onChange={(e) => {
                                              const hex = normalizeHexColor(e.target.value);
                                              updateService(index, { color: hex });
                                            }}
                                            placeholder="Ex: #3B82F6"
                                            className="flex-1 font-mono bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                          />
                                          <ColorPicker
                                            color={normalizedColor}
                                            onChange={(hex: string) => handleServiceColorChange(index, hex, "main")}
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
                                            onChange={(e) => {
                                              const hex = normalizeHexColor(e.target.value);
                                              updateService(index, { badgeColor: hex });
                                            }}
                                            className="flex-1 font-mono bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                          />
                                          <ColorPicker
                                            color={normalizedBadgeColor}
                                            onChange={(hex: string) => handleServiceColorChange(index, hex, "badge")}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <TextArea
                                        label="Descrição do Serviço"
                                        placeholder="Ex: Tráfego pago focado em ICPs (Perfis de Cliente Ideal). Ignoramos curiosos e atraímos decisores com Google e Meta Ads de alta intenção."
                                        value={service.description}
                                        onChange={(e) => updateService(index, { description: e.target.value })}
                                        rows={4}
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
                                onClick={() => removeService(index)}
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

        {/* Seção CTA */}
        <div className="space-y-4">
          <SectionHeader
            title="Call to Action (CTA)"
            section="cta"
            icon={Target}
            isExpanded={expandedSections.cta}
            onToggle={() => toggleSection("cta")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.cta ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)]">
                      Configuração do CTA
                    </h4>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {ctaCompleteCount} de 5 campos preenchidos
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    Configure o botão de ação principal que aparece na seção de serviços.
                  </p>
                </div>

                {/* Controle de ativação */}
                <div className="flex items-center justify-between p-4 bg-[var(--color-background-body)] rounded-lg border border-[var(--color-border)] mb-6">
                  <div className="flex items-center gap-3">
                    {servicesData.cta.enabled ? (
                      <Power className="w-5 h-5 text-green-500" />
                    ) : (
                      <Power className="w-5 h-5 text-gray-500" />
                    )}
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        CTA Ativo
                      </label>
                      <p className="text-sm text-[var(--color-secondary)]/70">
                        {servicesData.cta.enabled 
                          ? "O botão de ação está visível na seção" 
                          : "O botão de ação está oculto na seção"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateNested('cta.enabled', !servicesData.cta.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      servicesData.cta.enabled 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        servicesData.cta.enabled 
                          ? 'translate-x-6' 
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Texto do CTA
                    </label>
                    <Input
                      value={servicesData.cta.text}
                      onChange={(e) => updateNested('cta.text', e.target.value)}
                      placeholder="Ex: Agendar Consultoria"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      disabled={!servicesData.cta.enabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Link do CTA
                    </label>
                    <Input
                      value={servicesData.cta.link}
                      onChange={(e) => updateNested('cta.link', e.target.value)}
                      placeholder="Ex: /contato"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      disabled={!servicesData.cta.enabled}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Ícone do CTA
                    </label>
                    <IconSelector
                      value={servicesData.cta.icon}
                      onChange={(value) => updateNested('cta.icon', value)}
                      placeholder="ph:calendar-check"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[var(--color-background-body)] rounded-lg border border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                      {servicesData.cta.showIcon ? (
                        <Eye className="w-5 h-5 text-green-500" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      )}
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-secondary)]">
                          Mostrar Ícone
                        </label>
                        <p className="text-sm text-[var(--color-secondary)]/70">
                          Exibir ícone ao lado do texto
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateNested('cta.showIcon', !servicesData.cta.showIcon)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        servicesData.cta.showIcon 
                          ? 'bg-green-500' 
                          : 'bg-gray-300'
                      } ${!servicesData.cta.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!servicesData.cta.enabled}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          servicesData.cta.showIcon 
                            ? 'translate-x-6' 
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
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
          completeCount={completion.completed}
          totalCount={completion.total}
          itemName="Serviços"
          icon={Settings}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração dos Serviços"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}