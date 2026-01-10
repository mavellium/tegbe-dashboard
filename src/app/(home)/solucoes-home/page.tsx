/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import IconSelector from "@/components/IconSelector";
import { ImageUpload } from "@/components/ImageUpload";
import { 
  Layout, 
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Layers,
  Trash2,
  Palette,
  Sliders,
  Plus
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { hexToTailwindBgClass, hexToTailwindTextClass } from "@/lib/colors";

interface ServiceTheme {
  color: string;
  bg: string;
  border: string;
  btn: string;
}

interface Service {
  id: string;
  number: string;
  title: string;
  verticalTitle: string;
  icon: string;
  image: string;
  description: string;
  buttonText: string;
  href: string;
  theme: ServiceTheme;
}

interface HeaderData {
  label: string;
  title: string;
  desc: string;
}

interface AnimationConfig {
  transition_type: string;
  stiffness: number;
  damping: number;
  mass: number;
}

interface ServiceRouterData {
  service_router: {
    header: HeaderData;
    services: Service[];
    animation_config: AnimationConfig;
  };
}

// Cores padrão em hex para garantir funcionamento
const defaultTheme = {
  color: "#4B5563", // text-gray-600
  bg: "#F9FAFB",    // bg-gray-50
  border: "#E5E7EB", // border-gray-200
  btn: "#6B7280"    // hover:bg-gray-500
};

const defaultServiceRouterData: ServiceRouterData = {
  service_router: {
    header: {
      label: "",
      title: "",
      desc: ""
    },
    services: [
      {
        id: "service-01",
        number: "01",
        title: "",
        verticalTitle: "",
        icon: "solar:shop-2-bold-duotone",
        image: "",
        description: "",
        buttonText: "",
        href: "",
        theme: {
          color: hexToTailwindTextClass(defaultTheme.color),
          bg: hexToTailwindBgClass(defaultTheme.bg),
          border: `border-[${defaultTheme.border}]`,
          btn: `hover:bg-[${defaultTheme.btn}]`
        }
      },
    ],
    animation_config: {
      transition_type: "spring",
      stiffness: 100,
      damping: 25,
      mass: 1
    }
  }
};

const mergeWithDefaults = (apiData: any, defaultData: ServiceRouterData): ServiceRouterData => {
  if (!apiData) return defaultData;
  
  return {
    service_router: {
      header: apiData.service_router?.header || defaultData.service_router.header,
      services: apiData.service_router?.services || defaultData.service_router.services,
      animation_config: apiData.service_router?.animation_config || defaultData.service_router.animation_config,
    },
  };
};

// Função auxiliar para extrair hex de qualquer formato
const extractHexFromAnyFormat = (colorString: string): string => {
  if (!colorString) return "#000000";
  
  // Se já for um hex (começa com #)
  if (colorString.startsWith("#")) {
    return colorString.length === 7 ? colorString : "#000000";
  }
  
  // Se for uma classe Tailwind com cor arbitrária [#ABC123]
  const arbitraryMatch = colorString.match(/\[#([0-9A-Fa-f]{6})\]/i);
  if (arbitraryMatch) {
    return `#${arbitraryMatch[1]}`;
  }
  
  // Mapeamento de cores Tailwind comuns para hex
  const tailwindColorMap: Record<string, string> = {
    // Gray
    "gray-50": "#F9FAFB",
    "gray-100": "#F3F4F6",
    "gray-200": "#E5E7EB",
    "gray-300": "#D1D5DB",
    "gray-400": "#9CA3AF",
    "gray-500": "#6B7280",
    "gray-600": "#4B5563",
    "gray-700": "#374151",
    "gray-800": "#1F2937",
    "gray-900": "#111827",
    // Red
    "red-500": "#EF4444",
    "red-600": "#DC2626",
    "red-700": "#B91C1C",
    // Green
    "green-500": "#22C55E",
    "green-600": "#16A34A",
    "green-700": "#15803D",
    // Blue
    "blue-500": "#3B82F6",
    "blue-600": "#2563EB",
    "blue-700": "#1D4ED8",
    // Yellow/Amber
    "amber-500": "#F59E0B",
    "amber-600": "#D97706",
    "amber-700": "#B45309",
    // Purple/Violet
    "violet-500": "#8B5CF6",
    "violet-600": "#7C3AED",
    "violet-700": "#6D28D9",
    // Black and White
    "black": "#000000",
    "white": "#FFFFFF"
  };
  
  // Tenta extrair o nome da cor da classe Tailwind
  // Ex: "text-gray-600" -> "gray-600"
  // Ex: "bg-gray-50" -> "gray-50"
  // Ex: "border-gray-200" -> "gray-200"
  // Ex: "hover:bg-gray-500" -> "gray-500"
  const colorMatch = colorString.match(/(?:text-|bg-|border-|hover:bg-)?([a-z]+-\d+|black|white)/);
  if (colorMatch && tailwindColorMap[colorMatch[1]]) {
    return tailwindColorMap[colorMatch[1]];
  }
  
  // Fallback para cor preta
  return "#000000";
};

// Função para criar classe de borda a partir de hex
const hexToTailwindBorderClass = (hex: string): string => {
  const cleanHex = hex.replace("#", "");
  return `border-[#${cleanHex}]`;
};

export default function ServiceRouterPage() {
  const {
    data: pageData,
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
  } = useJsonManagement<ServiceRouterData>({
    apiPath: "/api/tegbe-institucional/json/solucoes",
    defaultData: defaultServiceRouterData,
    mergeFunction: mergeWithDefaults,
  });

  // Estado local para gerenciar services
  const [localServices, setLocalServices] = useState<Service[]>([]);
  const [draggingItem, setDraggingItem] = useState<number | null>(null);

  const [expandedSections, setExpandedSections] = useState({
    header: true,
    services: false,
    animation: false,
  });

  // Referência para novo item
  const newServiceRef = useRef<HTMLDivElement>(null);

  // Controle de planos
  const currentPlanType = 'pro'; // Altere conforme sua lógica de planos
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  // Sincroniza os dados quando carregam do banco
  useEffect(() => {
    if (pageData.service_router.services && pageData.service_router.services.length > 0) {
      setLocalServices(pageData.service_router.services);
    } else {
      setLocalServices(defaultServiceRouterData.service_router.services);
    }
  }, [pageData.service_router.services]);

  // Função para atualizar o estado do hook useJsonManagement
  const updateServicesInPageData = (services: Service[]) => {
    updateNested('service_router.services', services);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Função para adicionar serviço
  const handleAddService = () => {
    if (localServices.length >= currentPlanLimit) {
      return false;
    }
    
    // Gera número sequencial
    const numericIds = localServices
      .map(service => {
        const num = parseInt(service.number);
        return isNaN(num) ? 0 : num;
      })
      .filter(num => num > 0);
    
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    const newNumber = (maxId + 1).toString().padStart(2, '0');
    const newId = `service-${newNumber}`;
    
    const newItem: Service = {
      id: newId,
      number: newNumber,
      title: '',
      verticalTitle: '',
      icon: 'solar:shop-2-bold-duotone',
      image: '',
      description: '',
      buttonText: '',
      href: '',
      theme: {
        color: hexToTailwindTextClass(defaultTheme.color),
        bg: hexToTailwindBgClass(defaultTheme.bg),
        border: hexToTailwindBorderClass(defaultTheme.border),
        btn: `hover:bg-[${defaultTheme.btn}]`
      }
    };
    
    const updated = [...localServices, newItem];
    setLocalServices(updated);
    updateServicesInPageData(updated);
    
    setTimeout(() => {
      newServiceRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  // Função para atualizar serviço
  const updateService = (index: number, updates: Partial<Service>) => {
    const updated = [...localServices];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      setLocalServices(updated);
      updateServicesInPageData(updated);
    }
  };

  // Função para remover serviço
  const removeService = (index: number) => {
    const updated = [...localServices];
    
    if (updated.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyItem: Service = {
        id: 'service-01',
        number: '01',
        title: '',
        verticalTitle: '',
        icon: 'solar:shop-2-bold-duotone',
        image: '',
        description: '',
        buttonText: '',
        href: '',
        theme: {
          color: hexToTailwindTextClass(defaultTheme.color),
          bg: hexToTailwindBgClass(defaultTheme.bg),
          border: hexToTailwindBorderClass(defaultTheme.border),
          btn: `hover:bg-[${defaultTheme.btn}]`
        }
      };
      setLocalServices([emptyItem]);
      updateServicesInPageData([emptyItem]);
    } else {
      updated.splice(index, 1);
      
      // Reajusta números após remoção
      const renumberedItems = updated.map((item, idx) => ({
        ...item,
        number: (idx + 1).toString().padStart(2, '0'),
        id: `service-${(idx + 1).toString().padStart(2, '0')}`
      }));
      
      setLocalServices(renumberedItems);
      updateServicesInPageData(renumberedItems);
    }
  };

  // Funções de drag & drop para services
  const handleServiceDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingItem(index);
  };

  const handleServiceDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingItem === null || draggingItem === index) return;
    
    const updated = [...localServices];
    const draggedItem = updated[draggingItem];
    
    // Remove o item arrastado
    updated.splice(draggingItem, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingItem ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    // Reajusta números após reordenação
    const reorderedItems = updated.map((item, idx) => ({
      ...item,
      number: (idx + 1).toString().padStart(2, '0'),
      id: `service-${(idx + 1).toString().padStart(2, '0')}`
    }));
    
    setLocalServices(reorderedItems);
    updateServicesInPageData(reorderedItems);
    setDraggingItem(index);
  };

  const handleServiceDragEnd = (e: React.DragEvent) => {
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

  // Funções para atualizar tema do serviço
  const handleServiceThemeChange = (index: number, property: keyof ServiceTheme, hexColor: string) => {
    const currentService = localServices[index];
    const newTheme = { ...currentService.theme };
    
    switch (property) {
      case 'color':
        newTheme.color = hexToTailwindTextClass(hexColor);
        break;
      case 'bg':
        newTheme.bg = hexToTailwindBgClass(hexColor);
        break;
      case 'border':
        newTheme.border = hexToTailwindBorderClass(hexColor);
        break;
      case 'btn':
        // Para hover classes
        const cleanHex = hexColor.replace("#", "");
        newTheme.btn = `hover:bg-[#${cleanHex}]`;
        break;
    }
    
    updateService(index, { theme: newTheme });
  };

  // Função para lidar com upload de imagem
  const handleImageUpload = (index: number, file: File | null) => {
    if (file) {
      // Em uma implementação real, aqui você faria upload para um CDN/S3
      // Por enquanto, vamos apenas simular com um objeto URL
      const objectUrl = URL.createObjectURL(file);
      updateService(index, { image: objectUrl });
    } else {
      updateService(index, { image: '' });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      // Primeiro, garante que os dados locais estejam sincronizados
      updateServicesInPageData(localServices);
      
      // Aguarda um momento para garantir a atualização
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Salva no banco
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Validações
  const isServiceValid = (item: Service): boolean => {
    return item.title.trim() !== '' && 
           item.verticalTitle.trim() !== '' && 
           item.description.trim() !== '' &&
           item.buttonText.trim() !== '' &&
           item.href.trim() !== '';
  };

  const isServicesLimitReached = localServices.length >= currentPlanLimit;
  const canAddNewService = !isServicesLimitReached;
  const servicesCompleteCount = localServices.filter(isServiceValid).length;
  const servicesTotalCount = localServices.length;

  const servicesValidationError = isServicesLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  // Função para obter a cor de fundo com fallback
  const getBackgroundColor = (bgClass: string) => {
    const hex = extractHexFromAnyFormat(bgClass);
    return hex + '20'; // Adiciona transparência (20 = 12%)
  };

  // Função para obter a cor da borda com fallback
  const getBorderColor = (borderClass: string) => {
    return extractHexFromAnyFormat(borderClass);
  };

  // Função para obter a cor do texto com fallback
  const getTextColor = (textClass: string) => {
    return extractHexFromAnyFormat(textClass);
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Header (3 campos)
    total += 3;
    if (pageData.service_router.header.label.trim()) completed++;
    if (pageData.service_router.header.title.trim()) completed++;
    if (pageData.service_router.header.desc.trim()) completed++;

    // Services
    total += localServices.length * 13; // 13 campos por serviço
    localServices.forEach(service => {
      if (service.title.trim()) completed++;
      if (service.verticalTitle.trim()) completed++;
      if (service.icon.trim()) completed++;
      if (service.image.trim()) completed++;
      if (service.description.trim()) completed++;
      if (service.buttonText.trim()) completed++;
      if (service.href.trim()) completed++;
      if (service.theme.color.trim()) completed++;
      if (service.theme.bg.trim()) completed++;
      if (service.theme.border.trim()) completed++;
      if (service.theme.btn.trim()) completed++;
    });

    // Animation Config (4 campos)
    total += 4;
    if (pageData.service_router.animation_config.transition_type.trim()) completed++;
    if (pageData.service_router.animation_config.stiffness) completed++;
    if (pageData.service_router.animation_config.damping) completed++;
    if (pageData.service_router.animation_config.mass) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Layers}
      title="Gerenciar Serviços (Router)"
      description="Configure os serviços principais da página inicial"
      exists={!!exists}
      itemName="Serviços Router"
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Label
                    </label>
                    <Input
                      value={pageData.service_router.header.label}
                      onChange={(e) => updateNested('service_router.header.label', e.target.value)}
                      placeholder="Ex: Nossos Pilares"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Título
                    </label>
                    <Input
                      value={pageData.service_router.header.title}
                      onChange={(e) => updateNested('service_router.header.title', e.target.value)}
                      placeholder="Ex: Escolha sua Escala."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="md:col-span-3 space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Descrição
                    </label>
                    <TextArea
                      value={pageData.service_router.header.desc}
                      onChange={(e) => updateNested('service_router.header.desc', e.target.value)}
                      placeholder="Descrição da seção"
                      rows={3}
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Services */}
        <div className="space-y-4">
          <SectionHeader
            title="Serviços"
            section="services"
            icon={Layers}
            isExpanded={expandedSections.services}
            onToggle={() => toggleSection("services")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.services ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Configure os serviços principais
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {servicesCompleteCount} de {servicesTotalCount} completos
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        Limite: {currentPlanType === 'pro' ? '10' : '5'} itens
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
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Cada serviço representa um pilar principal da empresa. <strong>Números e IDs são gerados automaticamente.</strong>
                </p>
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

              <div className="space-y-6">
                {localServices.map((service, index) => (
                  <div 
                    key={`service-${service.id || index}`}
                    ref={index === localServices.length - 1 ? newServiceRef : undefined}
                    draggable
                    onDragStart={(e) => handleServiceDragStart(e, index)}
                    onDragOver={(e) => handleServiceDragOver(e, index)}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleServiceDragEnd}
                    onDrop={handleDrop}
                    className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                      draggingItem === index 
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
                          onDragStart={(e) => handleServiceDragStart(e, index)}
                        >
                          <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                        </div>
                        
                        {/* Número do serviço */}
                        <div className="flex flex-col items-center">
                          <div 
                            className="flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold"
                            style={{ 
                              backgroundColor: getBackgroundColor(service.theme.bg),
                              borderColor: getBorderColor(service.theme.border),
                              color: getTextColor(service.theme.color)
                            }}
                          >
                            {service.number}
                          </div>
                          <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-[var(--color-secondary)]">
                              {service.title || "Sem título"}
                            </h4>
                            {isServiceValid(service) ? (
                              <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                Completo
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                Incompleto
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-6">
                            {/* Informações básicas */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                      Número
                                    </label>
                                    <div className="px-3 py-2 bg-[var(--color-background-body)] border border-[var(--color-border)] rounded text-[var(--color-secondary)] text-center font-mono">
                                      {service.number}
                                    </div>
                                    <p className="text-xs text-[var(--color-secondary)]/50 text-center">
                                      Automático
                                    </p>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Título Vertical</label>
                                    <Input
                                      value={service.verticalTitle}
                                      onChange={(e) => updateService(index, { verticalTitle: e.target.value })}
                                      placeholder="Ex: ESTRUTURA"
                                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Título do Serviço</label>
                                  <Input
                                    value={service.title}
                                    onChange={(e) => updateService(index, { title: e.target.value })}
                                    placeholder="Ex: E-commerce"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Ícone</label>
                                  <IconSelector
                                    value={service.icon}
                                    onChange={(value) => updateService(index, { icon: value })}
                                    placeholder="solar:shop-2-bold-duotone"
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Texto do Botão
                                  </label>
                                  <Input
                                    value={service.buttonText}
                                    onChange={(e) => updateService(index, { buttonText: e.target.value })}
                                    placeholder="Ex: Construir Máquina"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Link (href)
                                  </label>
                                  <Input
                                    value={service.href}
                                    onChange={(e) => updateService(index, { href: e.target.value })}
                                    placeholder="Ex: /ecommerce"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    Imagem de Fundo
                                  </label>
                                  <ImageUpload
                                    label=""
                                    currentImage={service.image}
                                    selectedFile={null}
                                    onFileChange={(file) => handleImageUpload(index, file)}
                                    description="Imagem de fundo do serviço"
                                    aspectRatio="aspect-video"
                                    previewWidth={200}
                                    previewHeight={150}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* Descrição */}
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-[var(--color-secondary)]">Descrição</label>
                              <TextArea
                                value={service.description}
                                onChange={(e) => updateService(index, { description: e.target.value })}
                                placeholder="Descrição detalhada do serviço"
                                rows={3}
                                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                              />
                            </div>
                            
                            {/* Configurações de Tema */}
                            <div className="border-t border-[var(--color-border)] pt-6">
                              <div className="flex items-center gap-2 mb-4">
                                <Palette className="w-5 h-5 text-[var(--color-secondary)]" />
                                <h5 className="font-medium text-[var(--color-secondary)]">Configurações de Tema</h5>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <ThemePropertyInput
                                  property="color"
                                  label="Cor do Texto"
                                  description=""
                                  currentHex={extractHexFromAnyFormat(service.theme.color)}
                                  tailwindClass={service.theme.color}
                                  onThemeChange={(_, hex) => handleServiceThemeChange(index, 'color', hex)}
                                />
                                
                                <ThemePropertyInput
                                  property="bg"
                                  label="Cor de Fundo"
                                  description=""
                                  currentHex={extractHexFromAnyFormat(service.theme.bg)}
                                  tailwindClass={service.theme.bg}
                                  onThemeChange={(_, hex) => handleServiceThemeChange(index, 'bg', hex)}
                                />
                                
                                <ThemePropertyInput
                                  property="border"
                                  label="Cor da Borda"
                                  description=""
                                  currentHex={extractHexFromAnyFormat(service.theme.border)}
                                  tailwindClass={service.theme.border}
                                  onThemeChange={(_, hex) => handleServiceThemeChange(index, 'border', hex)}
                                />
                                
                                <ThemePropertyInput
                                  property="btn"
                                  label="Cor do Botão (hover)"
                                  description=""
                                  currentHex={extractHexFromAnyFormat(service.theme.btn.replace('hover:', ''))}
                                  tailwindClass={service.theme.btn}
                                  onThemeChange={(_, hex) => handleServiceThemeChange(index, 'btn', hex)}
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
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Configurações de Animação */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações de Animação"
            section="animation"
            icon={Sliders}
            isExpanded={expandedSections.animation}
            onToggle={() => toggleSection("animation")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.animation ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Tipo de Transição
                  </label>
                  <select
                    value={pageData.service_router.animation_config.transition_type}
                    onChange={(e) => updateNested('service_router.animation_config.transition_type', e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-background-body)] border border-[var(--color-border)] rounded text-[var(--color-secondary)]"
                  >
                    <option value="spring">Spring</option>
                    <option value="tween">Tween</option>
                    <option value="inertia">Inertia</option>
                    <option value="just">Just</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Stiffness
                  </label>
                  <Input
                    type="number"
                    value={pageData.service_router.animation_config.stiffness}
                    onChange={(e) => updateNested('service_router.animation_config.stiffness', parseInt(e.target.value) || 100)}
                    placeholder="100"
                    min="1"
                    max="1000"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Damping
                  </label>
                  <Input
                    type="number"
                    value={pageData.service_router.animation_config.damping}
                    onChange={(e) => updateNested('service_router.animation_config.damping', parseInt(e.target.value) || 25)}
                    placeholder="25"
                    min="0"
                    max="100"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Mass
                  </label>
                  <Input
                    type="number"
                    value={pageData.service_router.animation_config.mass}
                    onChange={(e) => updateNested('service_router.animation_config.mass', parseFloat(e.target.value) || 1)}
                    placeholder="1"
                    min="0.1"
                    max="10"
                    step="0.1"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
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
          totalCount={completion.total}
          itemName="Serviços Router"
          icon={Layers}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração de Serviços Router"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}