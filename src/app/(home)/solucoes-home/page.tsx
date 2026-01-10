/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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
  Sliders
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { useListState } from "@/hooks/useListState";
import { Button } from "@/components/Button";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { extractHexFromTailwind } from "@/lib/colorUtils";
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

const defaultServiceRouterData: ServiceRouterData = {
  service_router: {
    header: {
      label: "",
      title: "",
      desc: ""
    },
    services: [
      {
        id: "",
        number: "01",
        title: "",
        verticalTitle: "",
        icon: "solar:shop-2-bold-duotone",
        image: "",
        description: "",
        buttonText: "",
        href: "",
        theme: {
          color: "",
          bg: "",
          border: "",
          btn: ""
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

// Função auxiliar para hex para border class
const hexToTailwindBorderClass = (hex: string): string => {
  const cleanHex = hex.replace("#", "");
  
  const colorMap: Record<string, string> = {
    "000000": "border-black",
    "FFFFFF": "border-white",
    "F59E0B": "border-amber-500",
    "D97706": "border-amber-600",
    "B45309": "border-amber-700",
    "EF4444": "border-red-500",
    "DC2626": "border-red-600",
    "B91C1C": "border-red-700",
    "3B82F6": "border-blue-500",
    "2563EB": "border-blue-600",
    "1D4ED8": "border-blue-700",
    "22C55E": "border-green-500",
    "16A34A": "border-green-600",
    "15803D": "border-green-700",
    "8B5CF6": "border-violet-500",
    "7C3AED": "border-violet-600",
    "6D28D9": "border-violet-700",
  };

  const colorName = colorMap[cleanHex];
  return colorName || `border-[#${cleanHex}]`;
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

  // Hook para gerenciar services como lista dinâmica
  const servicesList = useListState<Service>({
    initialItems: pageData.service_router.services,
    defaultItem: {
      id: '',
      number: '',
      title: '',
      verticalTitle: '',
      icon: 'solar:question-circle-bold-duotone',
      image: '',
      description: '',
      buttonText: '',
      href: '',
      theme: {
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        btn: 'hover:bg-gray-500'
      }
    },
    validationFields: ['title', 'verticalTitle', 'description', 'buttonText', 'href'],
    enableDragDrop: true
  });

  const [expandedSections, setExpandedSections] = useState({
    header: true,
    services: true,
    animation: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Função para adicionar serviço com número sequencial
  const handleAddService = () => {
    const success = servicesList.addItem();
    
    if (success) {
      // Gera número sequencial para o novo serviço
      const lastNumber = servicesList.items.length > 0 
        ? parseInt(servicesList.items[servicesList.items.length - 1].number) || 0
        : 0;
      const newNumber = (lastNumber + 1).toString().padStart(2, '0');
      
      // Gera ID baseado no título ou número
      const newId = `service-${newNumber}`;
      
      const lastIndex = servicesList.items.length - 1;
      servicesList.updateItem(lastIndex, { 
        number: newNumber,
        id: newId
      });
    } else {
      console.warn(servicesList.validationError);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Atualiza os serviços no pageData antes de salvar
    updateNested('service_router.services', servicesList.items);
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Funções de drag & drop para services
  const handleServiceDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    servicesList.startDrag(index);
  };

  const handleServiceDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    servicesList.handleDragOver(index);
  };

  const handleServiceDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    servicesList.endDrag();
    
    // Reordena números após drag & drop
    const reorderedItems = servicesList.items.map((item, index) => ({
      ...item,
      number: (index + 1).toString().padStart(2, '0')
    }));
    
    // Atualiza todos os itens com novos números
    reorderedItems.forEach((item, index) => {
      servicesList.updateItem(index, { number: item.number });
    });
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

  // Função para remover item e reajustar números
  const handleRemoveService = (index: number) => {
    servicesList.removeItem(index);
    
    // Reajusta números após remoção
    const remainingItems = servicesList.items;
    const renumberedItems = remainingItems.map((item, idx) => ({
      ...item,
      number: (idx + 1).toString().padStart(2, '0')
    }));
    
    // Atualiza todos os itens com novos números
    renumberedItems.forEach((item, idx) => {
      servicesList.updateItem(idx, { number: item.number });
    });
  };

  // Funções para atualizar tema do serviço
  const handleServiceThemeChange = (index: number, property: keyof ServiceTheme, hexColor: string) => {
    const currentService = servicesList.items[index];
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
        // Para hover classes, precisamos manter o formato
        const bgClass = hexToTailwindBgClass(hexColor);
        newTheme.btn = bgClass.replace('bg-', 'hover:bg-');
        break;
    }
    
    servicesList.updateItem(index, { theme: newTheme });
  };

  // Função para lidar com upload de imagem
  const handleImageUpload = (index: number, file: File | null) => {
    if (file) {
      // Em uma implementação real, aqui você faria upload para um CDN/S3
      // Por enquanto, vamos apenas simular com um objeto URL
      const objectUrl = URL.createObjectURL(file);
      servicesList.updateItem(index, { image: objectUrl });
    } else {
      servicesList.updateItem(index, { image: '' });
    }
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Header (3 campos)
    total += 3;
    if (pageData.service_router.header.label.trim()) completed++;
    if (pageData.service_router.header.title.trim()) completed++;
    if (pageData.service_router.header.desc.trim()) completed++;

    // Services (lista dinâmica - cada serviço tem 9 campos principais + 4 de tema)
    total += servicesList.items.length * 13;
    servicesList.items.forEach(service => {
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
      // ID e number são automáticos, não contam
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

        {/* Seção Services - COM LISTA DINÂMICA */}
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
                          {servicesList.completeCount} de {servicesList.totalCount} completos
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        Limite: {servicesList.currentPlanType === 'pro' ? '10' : '5'} itens
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddService}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                      disabled={!servicesList.canAddNewItem}
                    >
                      + Adicionar Serviço
                    </Button>
                    {servicesList.isLimitReached && (
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
              {servicesList.validationError && (
                <div className={`p-3 rounded-lg ${servicesList.isLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                  <div className="flex items-start gap-2">
                    {servicesList.isLimitReached ? (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${servicesList.isLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                      {servicesList.validationError}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {servicesList.filteredItems.map((service, index) => (
                  <div 
                    key={`service-${service.id || index}`}
                    ref={index === servicesList.filteredItems.length - 1 ? servicesList.newItemRef : undefined}
                    draggable
                    onDragStart={(e) => handleServiceDragStart(e, index)}
                    onDragOver={(e) => handleServiceDragOver(e, index)}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleServiceDragEnd}
                    onDrop={handleDrop}
                    className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                      servicesList.draggingItem === index 
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
                        
                        {/* Número do serviço (apenas visual) */}
                        <div className="flex flex-col items-center">
                          <div 
                            className="flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold"
                            style={{ 
                              backgroundColor: extractHexFromTailwind(service.theme.bg) + '20',
                              borderColor: extractHexFromTailwind(service.theme.border),
                              color: extractHexFromTailwind(service.theme.color)
                            }}
                          >
                            {service.number || (index + 1).toString().padStart(2, '0')}
                          </div>
                          <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-[var(--color-secondary)]">
                              {service.title || "Sem título"}
                            </h4>
                            {service.title && service.verticalTitle && service.icon && service.description && service.buttonText && service.href ? (
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
                                      {service.number || (index + 1).toString().padStart(2, '0')}
                                    </div>
                                    <p className="text-xs text-[var(--color-secondary)]/50 text-center">
                                      Automático
                                    </p>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">Título Vertical</label>
                                    <Input
                                      value={service.verticalTitle}
                                      onChange={(e) => servicesList.updateItem(index, { verticalTitle: e.target.value })}
                                      placeholder="Ex: ESTRUTURA"
                                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Título do Serviço</label>
                                  <Input
                                    value={service.title}
                                    onChange={(e) => servicesList.updateItem(index, { title: e.target.value })}
                                    placeholder="Ex: E-commerce"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Ícone</label>
                                  <IconSelector
                                    value={service.icon}
                                    onChange={(value) => servicesList.updateItem(index, { icon: value })}
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
                                    onChange={(e) => servicesList.updateItem(index, { buttonText: e.target.value })}
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
                                    onChange={(e) => servicesList.updateItem(index, { href: e.target.value })}
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
                                    selectedFile={null} // Em produção, você precisaria gerenciar os arquivos
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
                                onChange={(e) => servicesList.updateItem(index, { description: e.target.value })}
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
                                  currentHex={extractHexFromTailwind(service.theme.color)}
                                  tailwindClass={service.theme.color}
                                  onThemeChange={(_, hex) => handleServiceThemeChange(index, 'color', hex)}
                                />
                                
                                <ThemePropertyInput
                                  property="bg"
                                  label="Cor de Fundo"
                                  description=""
                                  currentHex={extractHexFromTailwind(service.theme.bg)}
                                  tailwindClass={service.theme.bg}
                                  onThemeChange={(_, hex) => handleServiceThemeChange(index, 'bg', hex)}
                                />
                                
                                <ThemePropertyInput
                                  property="border"
                                  label="Cor da Borda"
                                  description=""
                                  currentHex={extractHexFromTailwind(service.theme.border)}
                                  tailwindClass={service.theme.border}
                                  onThemeChange={(_, hex) => handleServiceThemeChange(index, 'border', hex)}
                                />
                                
                                <ThemePropertyInput
                                  property="btn"
                                  label="Cor do Botão (hover)"
                                  description=""
                                  currentHex={extractHexFromTailwind(service.theme.btn.replace('hover:', ''))}
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
                          onClick={() => handleRemoveService(index)}
                          variant="danger"
                          className="whitespace-nowrap bg-red-600 hover:bg-red-700 border-none"
                        >
                          <Trash2 className="w-4 h-4" />
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
              
              <div className="mt-4 p-4 bg-[var(--color-background-body)] border border-[var(--color-border)] rounded-lg">
                <p className="text-sm text-[var(--color-secondary)]/70">
                  <strong>Dica:</strong> Estes valores controlam a animação dos elementos da seção. 
                  Ajuste conforme necessário para obter o efeito desejado.
                </p>
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