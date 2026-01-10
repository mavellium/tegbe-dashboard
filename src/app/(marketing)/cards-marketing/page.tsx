/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import IconSelector from "@/components/IconSelector";
import { 
  Layout, 
  Type,
  ShoppingCart,
  List,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Palette,
  Target,
  ArrowUpDown
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import ColorPicker from "@/components/ColorPicker";

interface ServiceItem {
  step: string;
  id: string;
  title: string;
  description: string;
  icon: string; // Formato: coleção:nome-do-ícone (ex: mdi:check-decagram, lucide:arrow-right)
  color: string;
  wide: boolean;
  visualType: string;
}

interface SectionData {
  header: {
    preTitle: string;
    title: string;
    subtitle: string;
    gradientTitle?: string;
  };
  services: ServiceItem[];
}

interface ComoFazemosData {
  home: SectionData;
  marketing: SectionData;
  ecommerce: SectionData;
  sobre: SectionData;
}

const defaultSectionData: SectionData = {
  header: {
    preTitle: "",
    title: "",
    subtitle: "",
    gradientTitle: ""
  },
  services: []
};

// Convertendo os ícones do JSON de exemplo para o formato coleção:nome-do-ícone
const defaultComoFazemosData: ComoFazemosData = {
  home: {
    header: {
      preTitle: "",
      title: "",
      subtitle: "",
      gradientTitle: ""
    },
    services: [
      {
        step: "01",
        id: "setup-infra",
        title: "Infraestrutura de Elite",
        description: "Configuração de servidores e plataforma escalável com foco em tempo de resposta zero.",
        icon: "lucide:settings", // Convertido de "Settings" para "lucide:settings"
        color: "#3B82F6",
        wide: false,
        visualType: "technical"
      },
      {
        step: "02",
        id: "growth-ads",
        title: "Growth & Performance",
        description: "Tráfego pago inteligente focado em ROI real e escala agressiva de vendas diárias.",
        icon: "lucide:trending-up", // Convertido de "TrendingUp" para "lucide:trending-up"
        color: "#10B981",
        wide: true,
        visualType: "chart"
      },
      {
        step: "03",
        id: "ai-employees",
        title: "Funcionários de IA",
        description: "Automação total do atendimento e recuperação de carrinhos com IA preditiva.",
        icon: "lucide:cpu", // Convertido de "Cpu" para "lucide:cpu"
        color: "#8B5CF6",
        wide: false,
        visualType: "ai-mesh"
      }
    ]
  },
  marketing: defaultSectionData,
  ecommerce: defaultSectionData,
  sobre: defaultSectionData
};

const mergeWithDefaults = (apiData: any, defaultData: ComoFazemosData): ComoFazemosData => {
  if (!apiData) return defaultData;
  
  const sections: (keyof ComoFazemosData)[] = ['home', 'marketing', 'ecommerce', 'sobre'];
  const result: Partial<ComoFazemosData> = {};
  
  sections.forEach(section => {
    if (apiData[section]) {
      // Merge do header
      const header = {
        ...defaultData[section].header,
        ...apiData[section].header
      };
      
      // Merge dos serviços
      let services = apiData[section].services || [];
      
      // Se não houver serviços, usar os padrões apenas para a seção home
      if (services.length === 0 && section === 'home') {
        services = defaultData.home.services;
      }
      
      // Garantir que cada serviço tenha todos os campos necessários e converter ícones para formato correto
      services = services.map((service: any, index: number) => {
        let icon = service.icon || "lucide:sparkles";
        
        // Se o ícone estiver no formato antigo (apenas nome), converter para formato coleção:nome
        if (icon && !icon.includes(':')) {
          // Converter nome PascalCase para kebab-case e adicionar prefixo lucide:
          const kebabCase = icon.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          icon = `lucide:${kebabCase}`;
        }
        
        return {
          step: service.step || (index + 1).toString().padStart(2, '0'),
          id: service.id || `service-${Date.now()}-${index}`,
          title: service.title || "",
          description: service.description || "",
          icon: icon,
          color: service.color || "#3B82F6",
          wide: service.wide || false,
          visualType: service.visualType || ""
        };
      });
      
      result[section] = { header, services };
    } else {
      result[section] = defaultData[section];
    }
  });
  
  return result as ComoFazemosData;
};

export default function ComoFazemosPage() {
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
  } = useJsonManagement<ComoFazemosData>({
    apiPath: "/api/tegbe-institucional/json/cards",
    defaultData: defaultComoFazemosData,
    mergeFunction: mergeWithDefaults,
  });

  // Estados locais para gerenciar as listas
  const [localServicesHome, setLocalServicesHome] = useState<ServiceItem[]>([]);
  const [localServicesMarketing, setLocalServicesMarketing] = useState<ServiceItem[]>([]);
  const [localServicesEcommerce, setLocalServicesEcommerce] = useState<ServiceItem[]>([]);
  const [localServicesSobre, setLocalServicesSobre] = useState<ServiceItem[]>([]);
  
  const [draggingItem, setDraggingItem] = useState<{section: keyof ComoFazemosData, index: number} | null>(null);

  const [expandedSections, setExpandedSections] = useState({
    home: false,
    marketing: true,
    ecommerce: false,
    sobre: false,
  });

  // Referências para novos itens
  const newServiceHomeRef = useRef<HTMLDivElement>(null);
  const newServiceMarketingRef = useRef<HTMLDivElement>(null);
  const newServiceEcommerceRef = useRef<HTMLDivElement>(null);
  const newServiceSobreRef = useRef<HTMLDivElement>(null);

  // Controle de planos
  const currentPlanType = 'pro';
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  // Sincroniza os dados quando carregam do banco
  useEffect(() => {
    if (pageData.home?.services) {
      setLocalServicesHome(pageData.home.services);
    }
  }, [pageData.home?.services]);

  useEffect(() => {
    if (pageData.marketing?.services) {
      setLocalServicesMarketing(pageData.marketing.services);
    }
  }, [pageData.marketing?.services]);

  useEffect(() => {
    if (pageData.ecommerce?.services) {
      setLocalServicesEcommerce(pageData.ecommerce.services);
    }
  }, [pageData.ecommerce?.services]);

  useEffect(() => {
    if (pageData.sobre?.services) {
      setLocalServicesSobre(pageData.sobre.services);
    }
  }, [pageData.sobre?.services]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções auxiliares para cada seção
  const getSectionData = (section: keyof ComoFazemosData): ServiceItem[] => {
    switch(section) {
      case 'home': return localServicesHome;
      case 'marketing': return localServicesMarketing;
      case 'ecommerce': return localServicesEcommerce;
      case 'sobre': return localServicesSobre;
    }
  };

  const getSectionRef = (section: keyof ComoFazemosData): any => {
    switch(section) {
      case 'home': return newServiceHomeRef;
      case 'marketing': return newServiceMarketingRef;
      case 'ecommerce': return newServiceEcommerceRef;
      case 'sobre': return newServiceSobreRef;
    }
  };

  const handleAddService = (section: keyof ComoFazemosData) => {
    const services = getSectionData(section);
    if (services.length >= currentPlanLimit) return false;
    
    const newService: ServiceItem = {
      step: (services.length + 1).toString().padStart(2, '0'),
      id: `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      description: '',
      icon: 'lucide:sparkles',
      color: '#3B82F6',
      wide: false,
      visualType: ''
    };
    
    const updated = [...services, newService];
    
    // Atualiza o estado local e o estado global
    switch(section) {
      case 'home':
        setLocalServicesHome(updated);
        updateNested('home.services', updated);
        break;
      case 'marketing':
        setLocalServicesMarketing(updated);
        updateNested('marketing.services', updated);
        break;
      case 'ecommerce':
        setLocalServicesEcommerce(updated);
        updateNested('ecommerce.services', updated);
        break;
      case 'sobre':
        setLocalServicesSobre(updated);
        updateNested('sobre.services', updated);
        break;
    }
    
    setTimeout(() => {
      const ref = getSectionRef(section);
      ref.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updateService = (section: keyof ComoFazemosData, index: number, updates: Partial<ServiceItem>) => {
    const services = getSectionData(section);
    const updated = [...services];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      
      switch(section) {
        case 'home':
          setLocalServicesHome(updated);
          updateNested('home.services', updated);
          break;
        case 'marketing':
          setLocalServicesMarketing(updated);
          updateNested('marketing.services', updated);
          break;
        case 'ecommerce':
          setLocalServicesEcommerce(updated);
          updateNested('ecommerce.services', updated);
          break;
        case 'sobre':
          setLocalServicesSobre(updated);
          updateNested('sobre.services', updated);
          break;
      }
    }
  };

  const removeService = (section: keyof ComoFazemosData, index: number) => {
    const services = getSectionData(section);
    const updated = [...services];
    
    if (updated.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyItem: ServiceItem = {
        step: '01',
        id: `service-${Date.now()}`,
        title: '',
        description: '',
        icon: 'lucide:sparkles',
        color: '#3B82F6',
        wide: false,
        visualType: ''
      };
      updated[0] = emptyItem;
    } else {
      updated.splice(index, 1);
      
      // Reordenar steps
      const reordered = updated.map((item, i) => ({
        ...item,
        step: (i + 1).toString().padStart(2, '0')
      }));
      
      switch(section) {
        case 'home':
          setLocalServicesHome(reordered);
          updateNested('home.services', reordered);
          break;
        case 'marketing':
          setLocalServicesMarketing(reordered);
          updateNested('marketing.services', reordered);
          break;
        case 'ecommerce':
          setLocalServicesEcommerce(reordered);
          updateNested('ecommerce.services', reordered);
          break;
        case 'sobre':
          setLocalServicesSobre(reordered);
          updateNested('sobre.services', reordered);
          break;
      }
      return;
    }
    
    switch(section) {
      case 'home':
        setLocalServicesHome(updated);
        updateNested('home.services', updated);
        break;
      case 'marketing':
        setLocalServicesMarketing(updated);
        updateNested('marketing.services', updated);
        break;
      case 'ecommerce':
        setLocalServicesEcommerce(updated);
        updateNested('ecommerce.services', updated);
        break;
      case 'sobre':
        setLocalServicesSobre(updated);
        updateNested('sobre.services', updated);
        break;
    }
  };

  // Funções de drag & drop
  const handleDragStart = (e: React.DragEvent, section: keyof ComoFazemosData, index: number) => {
    e.dataTransfer.setData('text/plain', `${section}-${index}`);
    e.currentTarget.classList.add('dragging');
    setDraggingItem({ section, index });
  };

  const handleDragOver = (e: React.DragEvent, section: keyof ComoFazemosData, index: number) => {
    e.preventDefault();
    
    if (!draggingItem || draggingItem.section !== section) return;
    
    const services = getSectionData(section);
    const updated = [...services];
    const draggedItem = updated[draggingItem.index];
    
    // Remove o item arrastado
    updated.splice(draggingItem.index, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingItem.index ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    // Reordenar steps
    const reordered = updated.map((item, i) => ({
      ...item,
      step: (i + 1).toString().padStart(2, '0')
    }));
    
    switch(section) {
      case 'home':
        setLocalServicesHome(reordered);
        updateNested('home.services', reordered);
        break;
      case 'marketing':
        setLocalServicesMarketing(reordered);
        updateNested('marketing.services', reordered);
        break;
      case 'ecommerce':
        setLocalServicesEcommerce(reordered);
        updateNested('ecommerce.services', reordered);
        break;
      case 'sobre':
        setLocalServicesSobre(reordered);
        updateNested('sobre.services', reordered);
        break;
    }
    
    setDraggingItem({ section, index: newIndex });
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

  const handleHeaderChange = (section: keyof ComoFazemosData, field: string, value: string) => {
    const path = `${section}.header.${field}`;
    updateNested(path, value);
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
  const isServiceValid = (item: ServiceItem): boolean => {
    return item.title.trim() !== '' && 
           item.description.trim() !== '' && 
           item.icon.trim() !== '' && 
           item.color.trim() !== '';
  };

  const getSectionValidation = (section: keyof ComoFazemosData) => {
    const services = getSectionData(section);
    const isLimitReached = services.length >= currentPlanLimit;
    const canAddNew = !isLimitReached;
    const completeCount = services.filter(isServiceValid).length;
    const totalCount = services.length;
    
    return {
      isLimitReached,
      canAddNew,
      completeCount,
      totalCount,
      validationError: isLimitReached 
        ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
        : null
    };
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Para cada seção, contar campos do header e dos serviços
    const sections: (keyof ComoFazemosData)[] = ['home', 'marketing', 'ecommerce', 'sobre'];
    
    sections.forEach(section => {
      const sectionData = pageData[section];
      
      // Header (home: 3 campos, outras: 4 campos)
      total += section === 'home' ? 3 : 4;
      if (sectionData.header.preTitle.trim()) completed++;
      if (sectionData.header.title.trim()) completed++;
      if (sectionData.header.subtitle.trim()) completed++;
      if (section !== 'home' && sectionData.header.gradientTitle?.trim()) completed++;
      
      // Serviços (6 campos cada)
      const services = getSectionData(section);
      total += services.length * 6;
      services.forEach(service => {
        if (service.title.trim()) completed++;
        if (service.description.trim()) completed++;
        if (service.icon.trim()) completed++;
        if (service.color.trim()) completed++;
        if (service.visualType.trim()) completed++;
        if (service.wide !== undefined) completed++; // wide é booleano
      });
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  const renderHeaderSection = (section: keyof ComoFazemosData, sectionTitle: string) => {
    const header = pageData[section]?.header || defaultSectionData.header;
    
    return (
      <Card className="p-6 bg-[var(--color-background)]">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-5 h-5 text-[var(--color-secondary)]" />
          <h4 className="text-lg font-semibold text-[var(--color-secondary)]">
            Configurações do Cabeçalho - {sectionTitle}
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                Pré-título
              </label>
              <Input
                type="text"
                value={header.preTitle || ""}
                onChange={(e) => handleHeaderChange(section, "preTitle", e.target.value)}
                placeholder="Ex: O Padrão Tegbe"
                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                Título (HTML permitido)
              </label>
              <TextArea
                value={header.title || ""}
                onChange={(e) => handleHeaderChange(section, "title", e.target.value)}
                placeholder="Ex: Não é mágica.<br />É Metodologia."
                rows={3}
                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
              />
            </div>
          </div>

          <div className="space-y-4">
            {section !== 'home' && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                  Título com Gradiente (HTML)
                </label>
                <TextArea
                  value={header.gradientTitle || ""}
                  onChange={(e) => handleHeaderChange(section, "gradientTitle", e.target.value)}
                  placeholder="Ex: Não é mágica.<br /><span class='text-transparent bg-clip-text bg-gradient-to-r from-[#FF0F43] to-[#A30030]'>É Metodologia.</span>"
                  rows={3}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                Subtítulo
              </label>
              <TextArea
                value={header.subtitle || ""}
                onChange={(e) => handleHeaderChange(section, "subtitle", e.target.value)}
                placeholder="Ex: Metodologia validada em mais de R$ 40 milhões faturados."
                rows={2}
                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
              />
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderServicesSection = (section: keyof ComoFazemosData, sectionTitle: string, Icon: any) => {
    const services = getSectionData(section);
    const { isLimitReached, canAddNew, completeCount, totalCount, validationError } = getSectionValidation(section);
    const sectionRef = getSectionRef(section);
    
    return (
      <Card className="p-6 bg-[var(--color-background)]">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">Serviços - {sectionTitle}</h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-secondary)]" />
                  <span className="text-sm text-[var(--color-secondary)]">
                    {completeCount} de {totalCount} completos
                  </span>
                </div>
                <span className="text-sm text-[var(--color-secondary)]">•</span>
                <span className="text-sm text-[var(--color-secondary)]">
                  Limite: {currentPlanType === 'pro' ? '10' : '5'} itens
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button
                type="button"
                onClick={() => handleAddService(section)}
                variant="primary"
                className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white border-none flex items-center gap-2"
                disabled={!canAddNew}
              >
                <Plus className="w-4 h-4" />
                Adicionar Serviço
              </Button>
              {isLimitReached && (
                <p className="text-xs text-[var(--color-secondary)] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Limite do plano atingido
                </p>
              )}
            </div>
          </div>

          {validationError && (
            <div className={`p-3 rounded-lg ${
              isLimitReached 
                ? 'bg-[var(--color-background)] border border-[var(--color-border)]' 
                : 'bg-[var(--color-background)] border border-[var(--color-border)]'
            }`}>
              <div className="flex items-start gap-2">
                {isLimitReached ? (
                  <XCircle className="w-5 h-5 text-[var(--color-secondary)] flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-[var(--color-secondary)] flex-shrink-0 mt-0.5" />
                )}
                <p className={`text-sm ${isLimitReached ? 'text-[var(--color-secondary)]' : 'text-[var(--color-secondary)]'}`}>
                  {validationError}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {services.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                <div className="p-3 bg-[var(--color-background-body)] rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-[var(--color-secondary)]" />
                </div>
                <h5 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Nenhum serviço cadastrado
                </h5>
                <p className="text-[var(--color-secondary)] mb-6 max-w-md mx-auto">
                  Adicione serviços para mostrar como sua empresa trabalha nesta seção.
                </p>
                <Button
                  type="button"
                  onClick={() => handleAddService(section)}
                  variant="primary"
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Primeiro Serviço
                </Button>
              </div>
            ) : (
              services.map((item, index) => {
                const isLast = index === services.length - 1;
                
                return (
                  <div 
                    key={`service-${section}-${index}`}
                    ref={isLast ? sectionRef : null}
                    draggable
                    onDragStart={(e) => handleDragStart(e, section, index)}
                    onDragOver={(e) => handleDragOver(e, section, index)}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDrop}
                    className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                      draggingItem?.section === section && draggingItem?.index === index
                        ? 'border-[var(--color-primary)] bg-[var(--color-background-body)]' 
                        : 'hover:border-[var(--color-primary)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Handle para drag & drop */}
                        <div 
                          className="cursor-grab active:cursor-grabbing p-2 hover:bg-[var(--color-background-body)] rounded transition-colors"
                          draggable
                          onDragStart={(e) => handleDragStart(e, section, index)}
                        >
                          <GripVertical className="w-5 h-5 text-[var(--color-secondary)]" />
                        </div>
                        
                        {/* Indicador de posição */}
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-medium text-[var(--color-secondary)]">
                            {item.step || (index + 1).toString().padStart(2, '0')}
                          </span>
                          <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 text-sm text-[var(--color-secondary)]">
                                <ArrowUpDown className="w-4 h-4" />
                                <span>Posição: {index + 1}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <h4 className="font-medium text-[var(--color-secondary)]">
                                  {item.title || "Sem título"}
                                </h4>
                                {item.title && item.description && item.icon ? (
                                  <span className="px-2 py-1 text-xs bg-[var(--color-background-body)] text-[var(--color-secondary)] rounded-full border border-[var(--color-border)]">
                                    Completo
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs bg-[var(--color-background-body)] text-[var(--color-secondary)] rounded-full border border-[var(--color-border)]">
                                    Incompleto
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Título
                                </label>
                                <Input
                                  value={item.title}
                                  onChange={(e) => updateService(section, index, { title: e.target.value })}
                                  placeholder="Ex: Infraestrutura de Elite"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                                  <Palette className="w-4 h-4" />
                                  Cor
                                </label>
                                <div className="flex gap-2">
                                  <Input
                                    value={item.color}
                                    onChange={(e) => updateService(section, index, { color: e.target.value })}
                                    placeholder="#3B82F6"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                  <ColorPicker
                                    color={item.color}
                                    onChange={(color) => updateService(section, index, { color })}
                                  />
                                </div>
                              </div>
                              
                              <div className="p-3 bg-[var(--color-background-body)] rounded-lg">
                                <label className="flex items-center justify-between cursor-pointer">
                                  <div>
                                    <span className="block text-sm font-medium text-[var(--color-secondary)] mb-1">
                                      Card Largo
                                    </span>
                                    <p className="text-xs text-[var(--color-secondary)]">
                                      {item.wide ? "Ocupará largura total" : "Largura padrão"}
                                    </p>
                                  </div>
                                  <div className="relative inline-block w-12 h-6">
                                    <input
                                      type="checkbox"
                                      checked={item.wide}
                                      onChange={(e) => updateService(section, index, { wide: e.target.checked })}
                                      className="opacity-0 w-0 h-0"
                                      id={`wide-${section}-${index}`}
                                    />
                                    <label 
                                      htmlFor={`wide-${section}-${index}`}
                                      className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-200 ${
                                        item.wide ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
                                      }`}
                                    >
                                      <span className={`absolute h-4 w-4 rounded-full bg-[var(--color-background-body)] transition-transform duration-200 ${
                                        item.wide ? 'transform translate-x-7' : 'transform translate-x-1'
                                      } top-1`} />
                                    </label>
                                  </div>
                                </label>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Descrição
                                </label>
                                <TextArea
                                  value={item.description}
                                  onChange={(e) => updateService(section, index, { description: e.target.value })}
                                  placeholder="Descrição detalhada do serviço..."
                                  rows={5}
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Ícone
                                </label>
                                <IconSelector
                                  value={item.icon}
                                  onChange={(value) => updateService(section, index, { icon: value })}
                                  label=""
                                  placeholder="Ex: mdi:check-decagram, lucide:settings"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Tipo Visual
                                </label>
                                <Input
                                  value={item.visualType}
                                  onChange={(e) => updateService(section, index, { visualType: e.target.value })}
                                  placeholder="Ex: technical, chart, ai-mesh"
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
                          onClick={() => removeService(section, index)}
                          className="whitespace-nowrap bg-[var(--color-background-body)] hover:bg-[var(--color-background-body)] border border-[var(--color-border)] text-[var(--color-secondary)] flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderSection = (section: keyof ComoFazemosData, sectionTitle: string, Icon: any) => {
    const isExpanded = expandedSections[section];
    
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => toggleSection(section)}
          className="w-full flex items-center justify-between p-4 bg-[var(--color-background)] rounded-lg hover:bg-[var(--color-background-body)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-[var(--color-secondary)]" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-[var(--color-secondary)]">
                {sectionTitle}
              </h3>
              <p className="text-sm text-[var(--color-secondary)]">
                {section === "home" && "Seção principal da home page"}
                {section === "marketing" && "Seção de estratégias de marketing"}
                {section === "ecommerce" && "Seção para e-commerce"}
                {section === "sobre" && "Seção da página sobre"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm px-3 py-1 bg-[var(--color-background-body)] text-[var(--color-secondary)] rounded-full border border-[var(--color-border)]">
              {getSectionData(section).length} serviços
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-[var(--color-secondary)]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[var(--color-secondary)]" />
            )}
          </div>
        </button>

        <motion.div
          initial={false}
          animate={{ height: isExpanded ? "auto" : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-6 mt-4">
            {renderHeaderSection(section, sectionTitle)}
            {renderServicesSection(section, sectionTitle, Icon)}
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Layout}
      title="Como Fazemos"
      description="Configure as seções 'Como Fazemos' para home, marketing, ecommerce e sobre"
      exists={!!exists}
      itemName="Seção"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {renderSection("home", "Seção Home", Layout)}
        {renderSection("marketing", "Seção Marketing", Type)}
        {renderSection("ecommerce", "Seção Ecommerce", ShoppingCart)}
        {renderSection("sobre", "Seção Sobre", List)}

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          isAddDisabled={false}
          isSaving={loading}
          exists={!!exists}
          completeCount={completion.completed}
          totalCount={completion.total}
          itemName="Seção"
          icon={Layout}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={4}
        itemName="Configuração Como Fazemos"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}