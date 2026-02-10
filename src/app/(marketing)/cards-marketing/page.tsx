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
  MessageSquare,
  RefreshCw,
  BarChart3,
  Image as ImageIcon
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import ColorPicker from "@/components/ColorPicker";

// --- INTERFACES ---

interface ServiceItem {
  step: string;
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  wide: boolean;
  visualType: string;
}

interface CTAButton {
  text: string;
  url: string;
}

interface CTASection {
  text: string;
  url: string;
  description: string;
  // Novos campos para Marketing
  primary?: CTAButton;
  secondary?: CTAButton;
}

interface FlywheelPhase {
  title: string;
  color: string;
}

interface FlywheelData {
  title: string;
  description: string;
  subtitle: string;
  benefits: string[];
  phases: FlywheelPhase[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  // Novo campo para Marketing
  image?: string; 
}

interface StatItem {
  value: string;
  label: string;
}

interface HeaderData {
  preTitle: string;
  title: string;
  subtitle: string;
  gradientTitle?: string;
  // Novos campos para Marketing
  badge?: string;
  highlighted?: string;
  description?: string;
}

interface SectionData {
  header: HeaderData;
  services: ServiceItem[];
  cta: CTASection;
  flywheel?: FlywheelData;
  // Novo campo para Marketing
  stats?: StatItem[];
}

interface ComoFazemosData {
  home: SectionData;
  marketing: SectionData;
  ecommerce: SectionData;
  sobre: SectionData;
}

// --- DEFAULTS ---

const defaultCTASection: CTASection = {
  text: "Quero Estruturar e Escalar Meu Negócio",
  url: "https://api.whatsapp.com/send?phone=5514991779502",
  description: "Anúncios, operação e dados trabalhando juntos para vender mais."
};

const defaultMarketingCTA: CTASection = {
  text: "Começar Agora",
  url: "https://api.whatsapp.com/send?phone=5514991779502",
  description: "Marketing que realmente converte",
  primary: {
    text: "Começar Agora",
    url: "https://api.whatsapp.com/send?phone=5514991779502"
  },
  secondary: {
    text: "Ver Demo",
    url: "#demo"
  }
};

const defaultFlywheel: FlywheelData = {
  title: "Marketing Flywheel",
  description: "Sistema de crescimento contínuo que transforma clientes satisfeitos em promotores da marca.",
  subtitle: "Sistema de Crescimento Contínuo",
  benefits: ["Crescimento Orgânico", "Retenção Elevada", "Custo de Aquisição Reduzido"],
  phases: [
    { title: "ATRAIR", color: "#3B82F6" },
    { title: "ENGAJAR", color: "#8B5CF6" },
    { title: "ENCANTAR", color: "#EC4899" },
    { title: "EXPANDIR", color: "#10B981" }
  ],
  colors: {
    primary: "#3B82F6",
    secondary: "#8B5CF6",
    accent: "#EC4899"
  },
  image: ""
};

const defaultSectionData: SectionData = {
  header: {
    preTitle: "",
    title: "",
    subtitle: "",
    gradientTitle: ""
  },
  services: [],
  cta: defaultCTASection
};

const defaultMarketingData: SectionData = {
  header: {
    preTitle: "Marketing Inteligente",
    title: "Acelere seu",
    subtitle: "Transforme desconhecidos em promotores...",
    badge: "Marketing Inteligente",
    highlighted: "Crescimento",
    description: "Transforme desconhecidos em promotores da sua marca com uma estratégia de inbound marketing que realmente funciona."
  },
  services: [],
  cta: defaultMarketingCTA,
  flywheel: defaultFlywheel,
  stats: [
    { value: "3x", label: "Mais Leads" },
    { value: "47%", label: "Conversão" },
    { value: "2.5x", label: "ROI" }
  ]
};

const defaultComoFazemosData: ComoFazemosData = {
  home: {
    header: { preTitle: "", title: "", subtitle: "", gradientTitle: "" },
    services: [
      { step: "01", id: "setup-infra", title: "Infraestrutura de Elite", description: "Configuração de servidores...", icon: "lucide:settings", color: "#3B82F6", wide: false, visualType: "technical" },
      { step: "02", id: "growth-ads", title: "Growth & Performance", description: "Tráfego pago inteligente...", icon: "lucide:trending-up", color: "#10B981", wide: true, visualType: "chart" },
      { step: "03", id: "ai-employees", title: "Funcionários de IA", description: "Automação total...", icon: "lucide:cpu", color: "#8B5CF6", wide: false, visualType: "ai-mesh" }
    ],
    cta: defaultCTASection
  },
  marketing: defaultMarketingData,
  ecommerce: defaultSectionData,
  sobre: defaultSectionData
};

const mergeWithDefaults = (apiData: any, defaultData: ComoFazemosData): ComoFazemosData => {
  if (!apiData) return defaultData;
  
  const sections: (keyof ComoFazemosData)[] = ['home', 'marketing', 'ecommerce', 'sobre'];
  const result: Partial<ComoFazemosData> = {};
  
  sections.forEach(section => {
    if (apiData[section]) {
      // Merge Header
      const header = { ...defaultData[section].header, ...apiData[section].header };
      
      // Merge Services
      let services = apiData[section].services || [];
      if (services.length === 0 && section === 'home') {
        services = defaultData.home.services;
      }
      
      services = services.map((service: any, index: number) => {
        let icon = service.icon || "lucide:sparkles";
        if (icon && !icon.includes(':')) {
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
      
      // Merge CTA
      const cta = { ...defaultData[section].cta, ...apiData[section].cta };
      // Garantir merge profundo para botões do marketing
      if (section === 'marketing' && apiData[section].cta) {
        if (apiData[section].cta.primary) cta.primary = { ...defaultMarketingCTA.primary, ...apiData[section].cta.primary };
        if (apiData[section].cta.secondary) cta.secondary = { ...defaultMarketingCTA.secondary, ...apiData[section].cta.secondary };
      }

      // Merge Flywheel
      let flywheel = undefined;
      if (section === 'marketing') {
         flywheel = apiData[section].flywheel 
            ? { ...defaultFlywheel, ...apiData[section].flywheel }
            : defaultFlywheel;
      }

      // Merge Stats (Marketing specific)
      let stats = undefined;
      if (section === 'marketing') {
         stats = apiData[section].stats || defaultMarketingData.stats;
      }
      
      result[section] = { header, services, cta, flywheel, stats };
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

  const newServiceHomeRef = useRef<HTMLDivElement>(null);
  const newServiceMarketingRef = useRef<HTMLDivElement>(null);
  const newServiceEcommerceRef = useRef<HTMLDivElement>(null);
  const newServiceSobreRef = useRef<HTMLDivElement>(null);

  const currentPlanType = 'pro';
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  useEffect(() => { if (pageData.home?.services) setLocalServicesHome(pageData.home.services); }, [pageData.home?.services]);
  useEffect(() => { if (pageData.marketing?.services) setLocalServicesMarketing(pageData.marketing.services); }, [pageData.marketing?.services]);
  useEffect(() => { if (pageData.ecommerce?.services) setLocalServicesEcommerce(pageData.ecommerce.services); }, [pageData.ecommerce?.services]);
  useEffect(() => { if (pageData.sobre?.services) setLocalServicesSobre(pageData.sobre.services); }, [pageData.sobre?.services]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

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
      title: '', description: '', icon: 'lucide:sparkles', color: '#3B82F6', wide: false, visualType: ''
    };
    
    const updated = [...services, newService];
    
    switch(section) {
      case 'home': setLocalServicesHome(updated); updateNested('home.services', updated); break;
      case 'marketing': setLocalServicesMarketing(updated); updateNested('marketing.services', updated); break;
      case 'ecommerce': setLocalServicesEcommerce(updated); updateNested('ecommerce.services', updated); break;
      case 'sobre': setLocalServicesSobre(updated); updateNested('sobre.services', updated); break;
    }
    
    setTimeout(() => {
      const ref = getSectionRef(section);
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
    return true;
  };

  const updateService = (section: keyof ComoFazemosData, index: number, updates: Partial<ServiceItem>) => {
    const services = getSectionData(section);
    const updated = [...services];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      switch(section) {
        case 'home': setLocalServicesHome(updated); updateNested('home.services', updated); break;
        case 'marketing': setLocalServicesMarketing(updated); updateNested('marketing.services', updated); break;
        case 'ecommerce': setLocalServicesEcommerce(updated); updateNested('ecommerce.services', updated); break;
        case 'sobre': setLocalServicesSobre(updated); updateNested('sobre.services', updated); break;
      }
    }
  };

  const removeService = (section: keyof ComoFazemosData, index: number) => {
    const services = getSectionData(section);
    const updated = [...services];
    
    if (updated.length <= 1) {
      const emptyItem: ServiceItem = {
        step: '01', id: `service-${Date.now()}`, title: '', description: '', icon: 'lucide:sparkles', color: '#3B82F6', wide: false, visualType: ''
      };
      updated[0] = emptyItem;
    } else {
      updated.splice(index, 1);
      updated.forEach((item, i) => { item.step = (i + 1).toString().padStart(2, '0'); });
    }
    
    switch(section) {
      case 'home': setLocalServicesHome(updated); updateNested('home.services', updated); break;
      case 'marketing': setLocalServicesMarketing(updated); updateNested('marketing.services', updated); break;
      case 'ecommerce': setLocalServicesEcommerce(updated); updateNested('ecommerce.services', updated); break;
      case 'sobre': setLocalServicesSobre(updated); updateNested('sobre.services', updated); break;
    }
  };

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
    updated.splice(draggingItem.index, 1);
    const newIndex = index;
    updated.splice(newIndex, 0, draggedItem);
    updated.forEach((item, i) => { item.step = (i + 1).toString().padStart(2, '0'); });
    
    switch(section) {
      case 'home': setLocalServicesHome(updated); updateNested('home.services', updated); break;
      case 'marketing': setLocalServicesMarketing(updated); updateNested('marketing.services', updated); break;
      case 'ecommerce': setLocalServicesEcommerce(updated); updateNested('ecommerce.services', updated); break;
      case 'sobre': setLocalServicesSobre(updated); updateNested('sobre.services', updated); break;
    }
    setDraggingItem({ section, index: newIndex });
  };

  const handleDragEnd = (e: React.DragEvent) => { e.currentTarget.classList.remove('dragging'); setDraggingItem(null); };
  const handleDragEnter = (e: React.DragEvent) => { e.currentTarget.classList.add('drag-over'); };
  const handleDragLeave = (e: React.DragEvent) => { e.currentTarget.classList.remove('drag-over'); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); };

  const handleHeaderChange = (section: keyof ComoFazemosData, field: string, value: string) => updateNested(`${section}.header.${field}`, value);
  const handleCtaChange = (section: keyof ComoFazemosData, field: string, value: string) => updateNested(`${section}.cta.${field}`, value);
  const handleFlywheelChange = (field: string, value: any) => updateNested(`marketing.flywheel.${field}`, value);
  
  const updateFlywheelArray = (arrayName: 'benefits' | 'phases', index: number, value: any, field?: string) => {
    const currentFlywheel = pageData.marketing.flywheel || defaultFlywheel;
    
    if (arrayName === 'benefits') {
      const array = [...currentFlywheel.benefits];
      array[index] = value;
      updateNested(`marketing.flywheel.benefits`, array);
    } else {
      const array = [...currentFlywheel.phases];
      if (field) {
        array[index] = { ...array[index], [field]: value };
        updateNested(`marketing.flywheel.phases`, array);
      }
    }
  };

  const addFlywheelItem = (arrayName: 'benefits' | 'phases') => {
    const currentFlywheel = pageData.marketing.flywheel || defaultFlywheel;
    
    if (arrayName === 'benefits') {
      const array = [...currentFlywheel.benefits, ""];
      updateNested(`marketing.flywheel.benefits`, array);
    } else {
      const array = [...currentFlywheel.phases, { title: "Nova Fase", color: "#000000" }];
      updateNested(`marketing.flywheel.phases`, array);
    }
  };

  const removeFlywheelItem = (arrayName: 'benefits' | 'phases', index: number) => {
    const currentFlywheel = pageData.marketing.flywheel || defaultFlywheel;
    
    if (arrayName === 'benefits') {
      const array = [...currentFlywheel.benefits];
      array.splice(index, 1);
      updateNested(`marketing.flywheel.benefits`, array);
    } else {
      const array = [...currentFlywheel.phases];
      array.splice(index, 1);
      updateNested(`marketing.flywheel.phases`, array);
    }
  };

  // Funções para Stats (Marketing)
  const addStat = () => {
    const currentStats = pageData.marketing.stats || [];
    const newStats = [...currentStats, { value: "", label: "" }];
    updateNested('marketing.stats', newStats);
  };

  const removeStat = (index: number) => {
    const currentStats = pageData.marketing.stats || [];
    const newStats = [...currentStats];
    newStats.splice(index, 1);
    updateNested('marketing.stats', newStats);
  };

  const updateStat = (index: number, field: 'value' | 'label', value: string) => {
    const currentStats = pageData.marketing.stats || [];
    const newStats = [...currentStats];
    newStats[index] = { ...newStats[index], [field]: value };
    updateNested('marketing.stats', newStats);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try { await save(); } catch (err) { console.error("Erro ao salvar:", err); }
  };

  const isServiceValid = (item: ServiceItem) => item.title.trim() !== '' && item.description.trim() !== '' && item.icon.trim() !== '' && item.color.trim() !== '';
  
  const getSectionValidation = (section: keyof ComoFazemosData) => {
    const services = getSectionData(section);
    const isLimitReached = services.length >= currentPlanLimit;
    return {
      isLimitReached,
      canAddNew: !isLimitReached,
      completeCount: services.filter(isServiceValid).length,
      totalCount: services.length,
      validationError: isLimitReached ? `Limite do plano atingido.` : null
    };
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;
    const sections: (keyof ComoFazemosData)[] = ['home', 'marketing', 'ecommerce', 'sobre'];
    
    sections.forEach(section => {
      const sectionData = pageData[section];
      total += section === 'home' ? 3 : 4;
      if (sectionData.header.preTitle?.trim()) completed++;
      if (sectionData.header.title?.trim()) completed++;
      if (sectionData.header.subtitle?.trim()) completed++;
      if (section !== 'home' && sectionData.header.gradientTitle?.trim()) completed++;
      
      const services = getSectionData(section);
      total += services.length * 6;
      services.forEach(s => {
        if (s.title.trim()) completed++;
        if (s.description.trim()) completed++;
        if (s.icon.trim()) completed++;
        if (s.color.trim()) completed++;
        if (s.visualType.trim()) completed++;
        if (s.wide !== undefined) completed++;
      });
      
      total += 3;
      if (sectionData.cta.text.trim()) completed++;
      if (sectionData.cta.url.trim()) completed++;
      if (sectionData.cta.description.trim()) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  const renderHeaderSection = (section: keyof ComoFazemosData, sectionTitle: string) => {
    const header = pageData[section]?.header || defaultSectionData.header;
    const isMarketing = section === 'marketing';

    return (
      <Card className="p-6 bg-[var(--color-background)]">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-5 h-5 text-[var(--color-secondary)]" />
          <h4 className="text-lg font-semibold text-[var(--color-secondary)]">Cabeçalho - {sectionTitle}</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Pré-título</label>
              <Input type="text" value={header.preTitle || ""} onChange={(e) => handleHeaderChange(section, "preTitle", e.target.value)} placeholder="Ex: O Padrão Tegbe" className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Título (HTML)</label>
              <TextArea value={header.title || ""} onChange={(e) => handleHeaderChange(section, "title", e.target.value)} placeholder="Ex: Não é mágica.<br />É Metodologia." rows={3} className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]" />
            </div>
            {isMarketing && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Palavra Destacada (Highlighted)</label>
                <Input type="text" value={header.highlighted || ""} onChange={(e) => handleHeaderChange(section, "highlighted", e.target.value)} placeholder="Ex: Crescimento" className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]" />
              </div>
            )}
          </div>
          <div className="space-y-4">
            {section !== 'home' && !isMarketing && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Título Gradiente (HTML)</label>
                <TextArea value={header.gradientTitle || ""} onChange={(e) => handleHeaderChange(section, "gradientTitle", e.target.value)} placeholder="HTML com classes tailwind" rows={3} className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Subtítulo</label>
              <TextArea value={header.subtitle || ""} onChange={(e) => handleHeaderChange(section, "subtitle", e.target.value)} placeholder="Ex: Metodologia validada..." rows={2} className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]" />
            </div>
            {isMarketing && (
               <>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Badge</label>
                  <Input type="text" value={header.badge || ""} onChange={(e) => handleHeaderChange(section, "badge", e.target.value)} placeholder="Ex: Marketing Inteligente" className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Descrição Longa</label>
                  <TextArea value={header.description || ""} onChange={(e) => handleHeaderChange(section, "description", e.target.value)} rows={3} className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]" />
                </div>
               </>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderStatsSection = (section: keyof ComoFazemosData) => {
     if (section !== 'marketing') return null;
     const stats = pageData.marketing.stats || [];

     return (
      <Card className="p-6 bg-[var(--color-background)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-[var(--color-secondary)]" />
            <h4 className="text-lg font-semibold text-[var(--color-secondary)]">Estatísticas</h4>
          </div>
          <Button 
            type="button" 
            onClick={addStat} 
            variant="secondary" 
            className="h-8 text-xs flex items-center gap-1 bg-transparent border border-[var(--color-border)] shadow-none text-[var(--color-secondary)] hover:bg-[var(--color-background-body)]"
          >
            <Plus className="w-3 h-3" /> Adicionar Stat
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {stats.map((stat, idx) => (
             <div key={`stat-${idx}`} className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background-body)] relative group">
                <button 
                  type="button" 
                  onClick={() => removeStat(idx)} 
                  className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[var(--color-secondary)] font-medium">Valor</label>
                    <Input 
                      value={stat.value} 
                      onChange={(e) => updateStat(idx, 'value', e.target.value)}
                      placeholder="Ex: 3x"
                      className="mt-1 h-9 bg-[var(--color-background)] border-[var(--color-border)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-secondary)] font-medium">Legenda</label>
                    <Input 
                      value={stat.label} 
                      onChange={(e) => updateStat(idx, 'label', e.target.value)}
                      placeholder="Ex: Mais Leads"
                      className="mt-1 h-9 bg-[var(--color-background)] border-[var(--color-border)]"
                    />
                  </div>
                </div>
             </div>
           ))}
        </div>
      </Card>
     );
  };

  const renderCtaSection = (section: keyof ComoFazemosData, sectionTitle: string) => {
    const cta = pageData[section]?.cta || defaultCTASection;
    const isMarketing = section === 'marketing';

    return (
      <Card className="p-6 bg-[var(--color-background)]">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-5 h-5 text-[var(--color-secondary)]" />
          <h4 className="text-lg font-semibold text-[var(--color-secondary)]">Call to Action (CTA) - {sectionTitle}</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Texto do CTA</label>
              <Input type="text" value={cta.text} onChange={(e) => handleCtaChange(section, "text", e.target.value)} className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">URL do CTA</label>
              <Input type="text" value={cta.url} onChange={(e) => handleCtaChange(section, "url", e.target.value)} className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Descrição do CTA</label>
              <TextArea value={cta.description} onChange={(e) => handleCtaChange(section, "description", e.target.value)} rows={4} className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]" />
            </div>
          </div>
        </div>

        {isMarketing && (
          <>
            <div className="border-t border-[var(--color-border)] my-6" />
            <h5 className="text-sm font-semibold text-[var(--color-secondary)] mb-4">Botões Específicos (Marketing)</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background-body)]">
                <h6 className="text-xs font-bold text-[var(--color-secondary)] uppercase">Botão Primário</h6>
                <div>
                   <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Texto</label>
                   <Input value={cta.primary?.text || ""} onChange={(e) => updateNested('marketing.cta.primary.text', e.target.value)} className="bg-[var(--color-background)] border-[var(--color-border)]" />
                </div>
                <div>
                   <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">URL</label>
                   <Input value={cta.primary?.url || ""} onChange={(e) => updateNested('marketing.cta.primary.url', e.target.value)} className="bg-[var(--color-background)] border-[var(--color-border)]" />
                </div>
              </div>
              <div className="space-y-4 p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background-body)]">
                <h6 className="text-xs font-bold text-[var(--color-secondary)] uppercase">Botão Secundário</h6>
                <div>
                   <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">Texto</label>
                   <Input value={cta.secondary?.text || ""} onChange={(e) => updateNested('marketing.cta.secondary.text', e.target.value)} className="bg-[var(--color-background)] border-[var(--color-border)]" />
                </div>
                <div>
                   <label className="block text-xs font-medium text-[var(--color-secondary)] mb-1">URL</label>
                   <Input value={cta.secondary?.url || ""} onChange={(e) => updateNested('marketing.cta.secondary.url', e.target.value)} className="bg-[var(--color-background)] border-[var(--color-border)]" />
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    );
  };

  const renderFlywheelSection = () => {
    const flywheel = pageData.marketing?.flywheel || defaultFlywheel;

    return (
      <Card className="p-6 bg-[var(--color-background)] border-l-4 border-l-[var(--color-primary)]">
        <div className="flex items-center gap-3 mb-6">
          <RefreshCw className="w-5 h-5 text-[var(--color-primary)]" />
          <h4 className="text-lg font-semibold text-[var(--color-secondary)]">Marketing Flywheel (Exclusivo)</h4>
        </div>

        <div className="space-y-6">
          {/* Novo campo de Imagem do Flywheel */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4"/> Imagem do Flywheel (URL)
            </label>
            <Input 
              value={flywheel.image || ""} 
              onChange={(e) => handleFlywheelChange("image", e.target.value)} 
              className="bg-[var(--color-background-body)] border-[var(--color-border)]" 
              placeholder="https://..."
            />
            {flywheel.image && (
              <div className="mt-2 w-full h-32 bg-[var(--color-background-body)] rounded overflow-hidden flex items-center justify-center border border-[var(--color-border)]">
                 <img src={flywheel.image} alt="Flywheel Preview" className="h-full object-contain" />
              </div>
            )}
          </div>

          <div className="border-t border-[var(--color-border)] my-4" />

          {/* Campos originais mantidos (Títulos/Cores) caso queira reverter para CSS puro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Título do Flywheel</label>
                <Input value={flywheel.title} onChange={(e) => handleFlywheelChange("title", e.target.value)} className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Subtítulo</label>
                <Input value={flywheel.subtitle} onChange={(e) => handleFlywheelChange("subtitle", e.target.value)} className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">Descrição</label>
              <TextArea value={flywheel.description} onChange={(e) => handleFlywheelChange("description", e.target.value)} rows={4} className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] my-4" />

          <div>
            <h5 className="text-sm font-semibold text-[var(--color-secondary)] mb-4">Cores do Sistema</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(flywheel.colors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="block text-xs font-medium text-[var(--color-secondary)] capitalize">{key}</label>
                  <div className="flex gap-2">
                    <Input 
                      value={value} 
                      onChange={(e) => updateNested(`marketing.flywheel.colors.${key}`, e.target.value)} 
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] h-10" 
                    />
                    <ColorPicker 
                      color={value} 
                      onChange={(color) => updateNested(`marketing.flywheel.colors.${key}`, color)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] my-4" />

          <div>
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-sm font-semibold text-[var(--color-secondary)]">Benefícios (Lista)</h5>
              <Button 
                type="button" 
                onClick={() => addFlywheelItem('benefits')} 
                variant="secondary" 
                className="h-8 text-xs flex items-center gap-1 bg-transparent border-none shadow-none text-[var(--color-secondary)] hover:bg-[var(--color-background-body)]"
              >
                <Plus className="w-3 h-3" /> Adicionar
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {flywheel.benefits.map((benefit, idx) => (
                <div key={`benefit-${idx}`} className="flex gap-2 items-center">
                  <Input 
                    value={benefit} 
                    onChange={(e) => updateFlywheelArray('benefits', idx, e.target.value)} 
                    className="bg-[var(--color-background-body)] border-[var(--color-border)]"
                    placeholder="Ex: Crescimento Orgânico"
                  />
                  <button type="button" onClick={() => removeFlywheelItem('benefits', idx)} className="text-red-500 hover:text-red-700">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] my-4" />

          <div>
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-sm font-semibold text-[var(--color-secondary)]">Fases do Ciclo</h5>
              <Button 
                type="button" 
                onClick={() => addFlywheelItem('phases')} 
                variant="secondary" 
                className="h-8 text-xs flex items-center gap-1 bg-transparent border-none shadow-none text-[var(--color-secondary)] hover:bg-[var(--color-background-body)]"
              >
                <Plus className="w-3 h-3" /> Adicionar Fase
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {flywheel.phases.map((phase, idx) => (
                <div key={`phase-${idx}`} className="p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-background-body)] space-y-3 relative group">
                  <button 
                    type="button" 
                    onClick={() => removeFlywheelItem('phases', idx)} 
                    className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div>
                    <label className="text-xs text-[var(--color-secondary)]">Nome da Fase</label>
                    <Input 
                      value={phase.title} 
                      onChange={(e) => updateFlywheelArray('phases', idx, e.target.value, 'title')} 
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-secondary)]">Cor</label>
                    <div className="flex gap-2 mt-1">
                      <div className="w-6 h-8 rounded border border-[var(--color-border)]" style={{ backgroundColor: phase.color }} />
                      <Input 
                        value={phase.color} 
                        onChange={(e) => updateFlywheelArray('phases', idx, e.target.value, 'color')} 
                        className="h-8 text-sm flex-1"
                      />
                      <ColorPicker 
                        color={phase.color} 
                        onChange={(color) => updateFlywheelArray('phases', idx, color, 'color')} 
                      />
                    </div>
                  </div>
                </div>
              ))}
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
                <CheckCircle2 className="w-4 h-4 text-[var(--color-secondary)]" />
                <span className="text-sm text-[var(--color-secondary)]">{completeCount} de {totalCount} completos</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button type="button" onClick={() => handleAddService(section)} variant="primary" className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)] text-white border-none flex items-center gap-2" disabled={!canAddNew}>
                <Plus className="w-4 h-4" /> Adicionar Serviço
              </Button>
              {isLimitReached && <p className="text-xs text-[var(--color-secondary)] flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Limite atingido</p>}
            </div>
          </div>

          {validationError && (
             <div className="p-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] flex items-start gap-2">
               <AlertCircle className="w-5 h-5 text-[var(--color-secondary)]" />
               <p className="text-sm text-[var(--color-secondary)]">{validationError}</p>
             </div>
          )}

          <div className="space-y-4">
            {services.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                <div className="p-3 bg-[var(--color-background-body)] rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-[var(--color-secondary)]" />
                </div>
                <p className="text-[var(--color-secondary)] mb-6">Nenhum serviço cadastrado</p>
                <Button type="button" onClick={() => handleAddService(section)} variant="primary" className="flex items-center gap-2 mx-auto"><Plus className="w-4 h-4" /> Adicionar</Button>
              </div>
            ) : (
              services.map((item, index) => {
                const isLast = index === services.length - 1;
                return (
                  <div key={`service-${section}-${index}`} ref={isLast ? sectionRef : null} draggable onDragStart={(e) => handleDragStart(e, section, index)} onDragOver={(e) => handleDragOver(e, section, index)} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragEnd={handleDragEnd} onDrop={handleDrop} 
                    className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${draggingItem?.section === section && draggingItem?.index === index ? 'border-[var(--color-primary)] bg-[var(--color-background-body)]' : 'hover:border-[var(--color-primary)]'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="cursor-grab active:cursor-grabbing p-2 hover:bg-[var(--color-background-body)] rounded" draggable onDragStart={(e) => handleDragStart(e, section, index)}>
                          <GripVertical className="w-5 h-5 text-[var(--color-secondary)]" />
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-medium text-[var(--color-secondary)]">{item.step}</span>
                          <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                        </div>
                        <div className="flex-1">
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Título</label>
                                  <Input value={item.title} onChange={(e) => updateService(section, index, { title: e.target.value })} className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2"><Palette className="w-4 h-4" /> Cor</label>
                                  <div className="flex gap-2">
                                    <Input value={item.color} onChange={(e) => updateService(section, index, { color: e.target.value })} className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                                    <ColorPicker color={item.color} onChange={(color) => updateService(section, index, { color })} />
                                  </div>
                                </div>
                                <div className="p-3 bg-[var(--color-background-body)] rounded-lg">
                                  <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm font-medium text-[var(--color-secondary)]">Card Largo ({item.wide ? 'Sim' : 'Não'})</span>
                                    <div className="relative inline-block w-12 h-6">
                                      <input type="checkbox" checked={item.wide} onChange={(e) => updateService(section, index, { wide: e.target.checked })} className="opacity-0 w-0 h-0" id={`wide-${section}-${index}`} />
                                      <label htmlFor={`wide-${section}-${index}`} className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${item.wide ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`}>
                                        <span className={`absolute h-4 w-4 rounded-full bg-[var(--color-background-body)] transition-transform top-1 ${item.wide ? 'translate-x-7' : 'translate-x-1'}`} />
                                      </label>
                                    </div>
                                  </label>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Descrição</label>
                                  <TextArea value={item.description} onChange={(e) => updateService(section, index, { description: e.target.value })} rows={5} className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Ícone</label>
                                  <IconSelector value={item.icon} onChange={(value) => updateService(section, index, { icon: value })} label="" />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">Tipo Visual</label>
                                  <Input value={item.visualType} onChange={(e) => updateService(section, index, { visualType: e.target.value })} className="bg-[var(--color-background-body)] border-[var(--color-border)]" />
                                </div>
                              </div>
                           </div>
                        </div>
                      </div>
                      <Button type="button" onClick={() => removeService(section, index)} variant="secondary" className="whitespace-nowrap bg-[var(--color-background-body)] hover:bg-[var(--color-background-body)] border border-[var(--color-border)] text-[var(--color-secondary)] flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Remover
                      </Button>
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
        <button type="button" onClick={() => toggleSection(section)} className="w-full flex items-center justify-between p-4 bg-[var(--color-background)] rounded-lg hover:bg-[var(--color-background-body)] transition-colors">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-[var(--color-secondary)]" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-[var(--color-secondary)]">{sectionTitle}</h3>
              <p className="text-sm text-[var(--color-secondary)]">Configuração da seção {sectionTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm px-3 py-1 bg-[var(--color-background-body)] text-[var(--color-secondary)] rounded-full border border-[var(--color-border)]">{getSectionData(section).length} serviços</span>
            {isExpanded ? <ChevronUp className="w-5 h-5 text-[var(--color-secondary)]" /> : <ChevronDown className="w-5 h-5 text-[var(--color-secondary)]" />}
          </div>
        </button>

        <motion.div initial={false} animate={{ height: isExpanded ? "auto" : 0 }} className="overflow-hidden">
          <div className="space-y-6 mt-4">
            {renderHeaderSection(section, sectionTitle)}
            {renderStatsSection(section)}
            {section === 'marketing' && renderFlywheelSection()}
            {renderServicesSection(section, sectionTitle, Icon)}
            {renderCtaSection(section, sectionTitle)}
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading && !exists) return <Loading layout={Layout} exists={!!exists} />;

  return (
    <ManageLayout headerIcon={Layout} title="Como Fazemos" description="Configure as seções de metodologia e serviços" exists={!!exists} itemName="Seção">
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {renderSection("home", "Home Page", Layout)}
        {renderSection("marketing", "Marketing", Type)}
        {renderSection("ecommerce", "E-commerce", ShoppingCart)}
        {renderSection("sobre", "Sobre Nós", List)}

        <FixedActionBar onDeleteAll={openDeleteAllModal} onSubmit={handleSubmit} isAddDisabled={false} isSaving={loading} exists={!!exists} completeCount={completion.completed} totalCount={completion.total} itemName="Seção" icon={Layout} />
      </form>
      <DeleteConfirmationModal isOpen={deleteModal.isOpen} onClose={closeDeleteModal} onConfirm={confirmDelete} type={deleteModal.type} itemTitle={deleteModal.title} totalItems={4} itemName="Configuração" />
      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}