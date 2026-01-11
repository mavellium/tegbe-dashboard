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
import { hexToTailwindBgClass, hexToTailwindTextClass, tailwindToHex } from "@/lib/colors";

interface ServiceTheme {
  color: string; // Tailwind text class (ex: "text-gray-600")
  bg: string;    // Tailwind bg class (ex: "bg-gray-50")
  border: string; // Tailwind border class (ex: "border-gray-200")
  btn: string;   // Tailwind button class (ex: "bg-gray-500")
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
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
          btn: "bg-gray-500"
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
    fileStates,
    setFileState,
  } = useJsonManagement<ServiceRouterData>({
    apiPath: "/api/tegbe-institucional/json/solucoes",
    defaultData: defaultServiceRouterData,
    mergeFunction: mergeWithDefaults,
  });

  const [draggingItem, setDraggingItem] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    header: true,
    services: false,
    animation: false,
  });

  const newServiceRef = useRef<HTMLDivElement>(null);
  const currentPlanType = 'pro';
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Função para adicionar serviço - ATUALIZADA para usar pageData diretamente
  const handleAddService = () => {
    if (pageData.service_router.services.length >= currentPlanLimit) {
      return false;
    }
    
    const services = pageData.service_router.services;
    const numericIds = services
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
        color: "text-gray-600",
        bg: "bg-gray-50",
        border: "border-gray-200",
        btn: "bg-gray-500"
      }
    };
    
    const updated = [...services, newItem];
    updateNested('service_router.services', updated);
    
    setTimeout(() => {
      newServiceRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  // Função para atualizar serviço - ATUALIZADA
  const updateService = (index: number, updates: Partial<Service>) => {
    const updated = [...pageData.service_router.services];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      updateNested('service_router.services', updated);
    }
  };

  // Função para remover serviço - ATUALIZADA
  const removeService = (index: number) => {
    const services = pageData.service_router.services;
    
    if (services.length <= 1) {
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
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
          btn: "bg-gray-500"
        }
      };
      updateNested('service_router.services', [emptyItem]);
    } else {
      const updated = services.filter((_, i) => i !== index);
      
      // Reajusta números após remoção
      const renumberedItems = updated.map((item, idx) => ({
        ...item,
        number: (idx + 1).toString().padStart(2, '0'),
        id: `service-${(idx + 1).toString().padStart(2, '0')}`
      }));
      
      updateNested('service_router.services', renumberedItems);
    }
  };

  // Funções de drag & drop - ATUALIZADAS para usar pageData diretamente
  const handleServiceDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingItem(index);
  };

  const handleServiceDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingItem === null || draggingItem === index) return;
    
    const services = pageData.service_router.services;
    const updated = [...services];
    const draggedItem = updated[draggingItem];
    
    updated.splice(draggingItem, 1);
    const newIndex = index > draggingItem ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    // Reajusta números após reordenação
    const reorderedItems = updated.map((item, idx) => ({
      ...item,
      number: (idx + 1).toString().padStart(2, '0'),
      id: `service-${(idx + 1).toString().padStart(2, '0')}`
    }));
    
    updateNested('service_router.services', reorderedItems);
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

  // Funções para atualizar tema do serviço - CORRIGIDAS
  const handleServiceThemeChange = (index: number, property: keyof ServiceTheme, hexColor: string) => {
    const currentService = pageData.service_router.services[index];
    const newTheme = { ...currentService.theme };
    
    switch (property) {
      case 'color':
        newTheme.color = hexToTailwindTextClass(hexColor);
        break;
      case 'bg':
        newTheme.bg = hexToTailwindBgClass(hexColor);
        break;
      case 'border':
        newTheme.border = `border-${hexToTailwindBgClass(hexColor).replace('bg-', '')}`;
        break;
      case 'btn':
        newTheme.btn = hexToTailwindBgClass(hexColor);
        break;
    }
    
    updateService(index, { theme: newTheme });
  };

  // Função auxiliar para obter File do fileStates - ADICIONADA
  const getFileFromState = (key: string): File | null => {
    const value = fileStates[key];
    return value instanceof File ? value : null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Validações - ATUALIZADAS para usar pageData
  const isServiceValid = (item: Service): boolean => {
    return item.title.trim() !== '' && 
           item.verticalTitle.trim() !== '' && 
           item.description.trim() !== '' &&
           item.buttonText.trim() !== '' &&
           item.href.trim() !== '';
  };

  const services = pageData.service_router.services;
  const isServicesLimitReached = services.length >= currentPlanLimit;
  const canAddNewService = !isServicesLimitReached;
  const servicesCompleteCount = services.filter(isServiceValid).length;
  const servicesTotalCount = services.length;

  const servicesValidationError = isServicesLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  // Funções para obter cores hex - SIMPLIFICADAS
  const getBackgroundColor = (bgClass: string) => {
    const hex = tailwindToHex(bgClass);
    return hex ? hex + '20' : '#F9FAFB20';
  };

  const getBorderColor = (borderClass: string) => {
    const hex = tailwindToHex(borderClass);
    return hex || '#E5E7EB';
  };

  const getTextColor = (textClass: string) => {
    const hex = tailwindToHex(textClass);
    return hex || '#4B5563';
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
    total += services.length * 13;
    services.forEach(service => {
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
                {services.map((service, index) => (
                  <div 
                    key={`service-${service.id || index}`}
                    ref={index === services.length - 1 ? newServiceRef : undefined}
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
                        <div 
                          className="cursor-grab active:cursor-grabbing p-2 hover:bg-[var(--color-background)]/50 rounded transition-colors"
                          draggable
                          onDragStart={(e) => handleServiceDragStart(e, index)}
                        >
                          <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                        </div>
                        
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
                                    selectedFile={getFileFromState(`service_router.services.${index}.image`)}
                                    onFileChange={(file) => setFileState(`service_router.services.${index}.image`, file)}
                                    description="Imagem de fundo do serviço"
                                    aspectRatio="aspect-video"
                                    previewWidth={200}
                                    previewHeight={150}
                                  />
                                </div>
                              </div>
                            </div>
                            
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
                                  currentHex={tailwindToHex(service.theme.color)}
                                  tailwindClass={service.theme.color}
                                  onThemeChange={(_, hex) => handleServiceThemeChange(index, 'color', hex)}
                                />
                                
                                <ThemePropertyInput
                                  property="bg"
                                  label="Cor de Fundo"
                                  description=""
                                  currentHex={tailwindToHex(service.theme.bg)}
                                  tailwindClass={service.theme.bg}
                                  onThemeChange={(_, hex) => handleServiceThemeChange(index, 'bg', hex)}
                                />
                                
                                <ThemePropertyInput
                                  property="border"
                                  label="Cor da Borda"
                                  description=""
                                  currentHex={tailwindToHex(service.theme.border)}
                                  tailwindClass={service.theme.border}
                                  onThemeChange={(_, hex) => handleServiceThemeChange(index, 'border', hex)}
                                />
                                
                                <ThemePropertyInput
                                  property="btn"
                                  label="Cor do Botão"
                                  description=""
                                  currentHex={tailwindToHex(service.theme.btn)}
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
          completeCount={completion.completed}
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