// app/como-fazemos/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListManagement } from "@/hooks/useListManagement";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Switch } from "@/components/Switch";
import { 
  Layout, 
  Type, 
  ShoppingCart,
  List, 
  Plus, 
  X, 
  GripVertical, 
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Palette,
  Target
} from "lucide-react";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { SearchSortBar } from "@/components/Manage/SearchSortBar";
import { ItemHeader } from "@/components/Manage/ItemHeader";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import ColorPicker from "@/components/ColorPicker";
import IconSelector from "@/components/IconSelector";
import ClientOnly from "@/components/ClientOnly";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  id?: string;
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

const defaultComoFazemosData: ComoFazemosData = {
  home: defaultSectionData,
  marketing: defaultSectionData,
  ecommerce: defaultSectionData,
  sobre: defaultSectionData
};

interface SortableServiceItemProps {
  item: ServiceItem;
  index: number;
  sectionKey: "home" | "marketing" | "ecommerce" | "sobre";
  sectionIndex: number;
  isLastInOriginalList: boolean;
  isLastAndEmpty: boolean;
  showValidation: boolean;
  itemList: ServiceItem[];
  handleServiceChange: (section: "home" | "marketing" | "ecommerce" | "sobre", index: number, field: keyof ServiceItem, value: any) => void;
  openDeleteSingleModal: (section: string, index: number, title: string) => void;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
}

function SortableServiceItem({
  item,
  index,
  sectionKey,
  sectionIndex,
  isLastInOriginalList,
  isLastAndEmpty,
  showValidation,
  itemList,
  handleServiceChange,
  openDeleteSingleModal,
  setNewItemRef,
}: SortableServiceItemProps) {
  const stableId = useId();
  const sortableId = `service-${sectionKey}-${item.id || index}-${stableId}`;

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

  const hasTitle = item.title.trim() !== "";
  const hasDescription = item.description.trim() !== "";
  const hasIcon = item.icon.trim() !== "";
  const hasColor = item.color.trim() !== "";

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      
      if (isLastAndEmpty && setNewItemRef) {
        setNewItemRef(node);
      }
    },
    [setNodeRef, isLastAndEmpty, setNewItemRef]
  );

  return (
    <div
      ref={setRefs}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
        isLastInOriginalList && showValidation && (!hasTitle || !hasDescription || !hasIcon) ? 'ring-2 ring-red-500' : ''
      } ${isDragging ? 'shadow-lg scale-105' : ''}`}>
        <div className="p-6 bg-white dark:bg-zinc-900">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="cursor-move text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <ArrowUpDown className="w-4 h-4" />
                <span>Posição: {index + 1}</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div 
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: item.color || '#0071E3' }}
                />
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  {item.step}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ItemHeader
                index={sectionIndex}
                fields={[
                  { label: 'Título', hasValue: hasTitle },
                  { label: 'Descrição', hasValue: hasDescription },
                  { label: 'Ícone', hasValue: hasIcon }
                ]}
                showValidation={showValidation}
                isLast={isLastInOriginalList}
                onDelete={() => openDeleteSingleModal(sectionKey, sectionIndex, item.title)}
                showDelete={itemList.length > 1}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  ID (único)
                </label>
                <Input
                  type="text"
                  value={item.id}
                  onChange={(e: any) => handleServiceChange(sectionKey, sectionIndex, "id", e.target.value)}
                  placeholder="Ex: seo, traffic, ecommerce"
                  className="font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Título
                </label>
                <Input
                  type="text"
                  value={item.title}
                  onChange={(e: any) => handleServiceChange(sectionKey, sectionIndex, "title", e.target.value)}
                  placeholder="Ex: SEO de Conversão"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Cor
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={item.color}
                    onChange={(e: any) => handleServiceChange(sectionKey, sectionIndex, "color", e.target.value)}
                    placeholder="#0071E3"
                    className="font-mono"
                  />
                  <ColorPicker
                    color={item.color}
                    onChange={(color: string) => handleServiceChange(sectionKey, sectionIndex, "color", color)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Card Largo
                  </label>
                  <p className="text-xs text-zinc-500">
                    {item.wide ? "Ocupará largura total" : "Largura padrão"}
                  </p>
                </div>
                <Switch
                  checked={item.wide}
                  onCheckedChange={(checked: boolean) => 
                    handleServiceChange(sectionKey, sectionIndex, "wide", checked)
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={item.description}
                  onChange={(e: any) => handleServiceChange(sectionKey, sectionIndex, "description", e.target.value)}
                  placeholder="Descrição detalhada do serviço..."
                  rows={5}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Ícone
                </label>
                <IconSelector
                  value={item.icon}
                  onChange={(value) => handleServiceChange(sectionKey, sectionIndex, "icon", value)}
                  label=""
                  placeholder="Ex: lucide:search-code"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Selecione um ícone ou digite o nome (ex: lucide:search)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Tipo Visual
                </label>
                <Input
                  type="text"
                  value={item.visualType}
                  onChange={(e: any) => handleServiceChange(sectionKey, sectionIndex, "visualType", e.target.value)}
                  placeholder="Ex: graph, traffic, dashboard"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Referência para animações/ilustrações
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function ComoFazemosPage({ 
  type = "cards", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  const defaultItem = useMemo(() => defaultComoFazemosData, []);
  
  const [expandedSections, setExpandedSections] = useState({
    home: false,
    marketing: false,
    ecommerce: true,
    sobre: false
  });

  const apiBase = `/api/${subtype}/form`;

  const {
    list: itemList,
    setList: setItemList,
    exists,
    loading,
    setLoading,
    success,
    setSuccess,
    errorMsg,
    setErrorMsg,
    search,
    setSearch,
    sortOrder,
    setSortOrder,
    showValidation,
    filteredItems: filteredItems,
    deleteModal,
    newItemRef,
    canAddNewItem,
    completeCount,
    isLimitReached,
    currentPlanLimit,
    currentPlanType,
    addItem,
    openDeleteSingleModal,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
    clearFilters,
  } = useListManagement<ComoFazemosData>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem,
    validationFields: []
  });

  // Como esta é uma estrutura complexa, vamos usar apenas o primeiro item da lista
  const pageData = itemList[0] || defaultItem;

  const setNewItemRef = useCallback((node: HTMLDivElement | null) => {
    if (newItemRef && node) {
      (newItemRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [newItemRef]);

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

  const handleChange = (path: string, value: any) => {
    const newList = [...itemList];
    const currentData = newList[0] || defaultItem;
    
    const keys = path.split(".");
    const newData = { ...currentData };
    let current: any = newData;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    
    if (newList.length === 0) {
      newList.push(newData);
    } else {
      newList[0] = newData;
    }
    
    setItemList(newList);
  };

  const handleHeaderChange = (section: "home" | "marketing" | "ecommerce" | "sobre", field: string, value: string) => {
    const newHeader = { ...pageData[section].header, [field]: value };
    handleChange(`${section}.header`, newHeader);
  };

  const handleServiceChange = (section: "home" | "marketing" | "ecommerce" | "sobre", index: number, field: keyof ServiceItem, value: any) => {
    const newServices = [...pageData[section].services];
    newServices[index] = { ...newServices[index], [field]: value };
    handleChange(`${section}.services`, newServices);
  };

  const addService = (section: "home" | "marketing" | "ecommerce" | "sobre") => {
    const newService: ServiceItem = {
      step: ((pageData[section]?.services?.length || 0) + 1).toString().padStart(2, '0'),
      id: `service-${Date.now()}`,
      title: "",
      description: "",
      icon: "",
      color: "#0071E3",
      wide: false,
      visualType: ""
    };
    
    const currentServices = pageData[section]?.services || [];
    const newServices = [...currentServices, newService];
    handleChange(`${section}.services`, newServices);
  };

  const handleDragEnd = (event: DragEndEvent, section: "home" | "marketing" | "ecommerce" | "sobre") => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const services = [...pageData[section].services];
      
      const oldIndex = services.findIndex((_, index) => 
        `service-${section}-${services[index].id || index}` === active.id
      );
      const newIndex = services.findIndex((_, index) => 
        `service-${section}-${services[index].id || index}` === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newServices = arrayMove(services, oldIndex, newIndex);
        
        // Reordenar steps
        const reorderedServices = newServices.map((service, i) => ({
          ...service,
          step: (i + 1).toString().padStart(2, '0')
        }));
        
        handleChange(`${section}.services`, reorderedServices);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      // Validar se há pelo menos uma seção com conteúdo
      const hasContent = Object.values(pageData).some(section => 
        section.header.title.trim() !== "" || section.services?.length > 0
      );

      if (!hasContent) {
        setErrorMsg("Adicione conteúdo em pelo menos uma seção.");
        return;
      }

      const fd = new FormData();

      if (exists) fd.append("id", exists.id);

      fd.append(
        "values",
        JSON.stringify([pageData])
      );

      const method = exists ? "PUT" : "POST";

      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar configurações");
      }

      const saved = await res.json();

      if (saved?.values?.[0]) {
        const newList = [saved.values[0]];
        setItemList(newList);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWrapper = () => {
    handleSubmit();
  };

  const updateItems = async (list: ComoFazemosData[]) => {
    if (!exists) return;

    const fd = new FormData();
    fd.append("id", exists.id);
    fd.append("values", JSON.stringify([list[0]]));

    const res = await fetch(`${apiBase}/${type}`, {
      method: "PUT",
      body: fd,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Falha ao atualizar dados");
    }

    const updated = await res.json();
    return updated;
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const SectionHeader = ({
    title,
    section,
    icon: Icon,
  }: {
    title: string;
    section: keyof typeof expandedSections;
    icon: any;
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
        <div className="text-left">
          <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {title}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {section === "home" && "Seção principal da home page"}
            {section === "marketing" && "Seção de estratégias de marketing"}
            {section === "ecommerce" && "Seção para e-commerce"}
            {section === "sobre" && "Seção da página sobre"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm px-3 py-1 bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full border border-zinc-200 dark:border-zinc-600">
          {(pageData[section]?.services?.length || 0)} serviços
        </span>
        {expandedSections[section] ? (
          <ChevronUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
        )}
      </div>
    </button>
  );

  const renderHeaderSection = (section: "home" | "marketing" | "ecommerce" | "sobre") => {
    const header = pageData[section]?.header;
    
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Configurações do Cabeçalho
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Pré-título
              </label>
              <Input
                type="text"
                value={header?.preTitle || ""}
                onChange={(e: any) => handleHeaderChange(section, "preTitle", e.target.value)}
                placeholder="Ex: O Padrão Tegbe"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Texto pequeno acima do título principal
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Título (HTML permitido)
              </label>
              <textarea
                value={header?.title || ""}
                onChange={(e: any) => handleHeaderChange(section, "title", e.target.value)}
                placeholder="Ex: Não é mágica.<br />É Metodologia."
                rows={3}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Use &lt;br /&gt; para quebras de linha
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {(section === "marketing" || section === "ecommerce" || section === "sobre") && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Título com Gradiente (HTML)
                </label>
                <textarea
                  value={header?.gradientTitle || ""}
                  onChange={(e: any) => handleHeaderChange(section, "gradientTitle", e.target.value)}
                  placeholder="Ex: Não é mágica.<br /><span class='text-transparent bg-clip-text bg-gradient-to-r from-[#FF0F43] to-[#A30030]'>É Metodologia.</span>"
                  rows={3}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Use spans com classes de gradiente para efeitos especiais
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Subtítulo
              </label>
              <textarea
                value={header?.subtitle || ""}
                onChange={(e: any) => handleHeaderChange(section, "subtitle", e.target.value)}
                placeholder="Ex: Metodologia validada em mais de R$ 40 milhões faturados."
                rows={2}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderServicesSection = (section: "home" | "marketing" | "ecommerce" | "sobre") => {
    const services = pageData[section]?.services || [];
    const serviceIds = services.map((service, index) => 
      `service-${section}-${service.id || index}`
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
              Serviços ({services.length})
            </h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Arraste para reordenar. Clique no ícone de arrastar para mover.
            </p>
          </div>
          
          <Button
            type="button"
            onClick={() => addService(section)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Serviço
          </Button>
        </div>

        {services.length === 0 ? (
          <Card className="text-center py-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Plus className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h5 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              Nenhum serviço cadastrado
            </h5>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
              Adicione serviços para mostrar como sua empresa trabalha nesta seção.
            </p>
            <Button
              type="button"
              onClick={() => addService(section)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Adicionar Primeiro Serviço
            </Button>
          </Card>
        ) : (
          <ClientOnly>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => handleDragEnd(event, section)}
            >
              <SortableContext
                items={serviceIds}
                strategy={verticalListSortingStrategy}
              >
                {services.map((service, index) => {
                  const isLastInOriginalList = index === services.length - 1;
                  const isLastAndEmpty = isLastInOriginalList && 
                    !service.title.trim() && 
                    !service.description.trim() && 
                    !service.icon.trim();

                  return (
                    <SortableServiceItem
                      key={serviceIds[index]}
                      item={service}
                      index={index}
                      sectionKey={section}
                      sectionIndex={index}
                      isLastInOriginalList={isLastInOriginalList}
                      isLastAndEmpty={isLastAndEmpty}
                      showValidation={showValidation}
                      itemList={services}
                      handleServiceChange={handleServiceChange}
                      openDeleteSingleModal={() => openDeleteSingleModal}
                      setNewItemRef={isLastAndEmpty ? setNewItemRef : undefined}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>
          </ClientOnly>
        )}
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={Layout}
      title="Como Fazemos"
      description="Configure as seções 'Como Fazemos' para home, marketing, ecommerce e sobre"
      exists={!!exists}
      itemName="Seção"
    >

      <div className="space-y-6 pb-32">
        <form onSubmit={handleSubmit}>
          {/* Home Section */}
          <div className="space-y-4">
            <SectionHeader
              title="Seção Home"
              section="home"
              icon={Layout}
            />

            <AnimatePresence>
              {expandedSections.home && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-6 mt-4">
                    {renderHeaderSection("home")}
                    {renderServicesSection("home")}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Marketing Section */}
          <div className="space-y-4">
            <SectionHeader
              title="Seção Marketing"
              section="marketing"
              icon={Type}
            />

            <AnimatePresence>
              {expandedSections.marketing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-6 mt-4">
                    {renderHeaderSection("marketing")}
                    {renderServicesSection("marketing")}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ecommerce Section */}
          <div className="space-y-4">
            <SectionHeader
              title="Seção Ecommerce"
              section="ecommerce"
              icon={ShoppingCart}
            />

            <AnimatePresence>
              {expandedSections.ecommerce && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-6 mt-4">
                    {renderHeaderSection("ecommerce")}
                    {renderServicesSection("ecommerce")}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sobre Section */}
          <div className="space-y-4">
            <SectionHeader
              title="Seção Sobre"
              section="sobre"
              icon={List}
            />

            <AnimatePresence>
              {expandedSections.sobre && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-6 mt-4">
                    {renderHeaderSection("sobre")}
                    {renderServicesSection("sobre")}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>

      <FixedActionBar
        onDeleteAll={openDeleteAllModal}
        onSubmit={handleSubmitWrapper}
        isAddDisabled={!canAddNewItem || isLimitReached}
        isSaving={loading}
        exists={!!exists}
        completeCount={completeCount}
        totalCount={4} // home, marketing, ecommerce, sobre
        itemName="Seção"
        icon={Layout}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateItems)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={4}
        itemName="Seção"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}