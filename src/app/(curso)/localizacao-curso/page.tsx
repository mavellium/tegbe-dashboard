/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import { 
  MapPin,
  Building,
  Settings,
  Layers,
  Plus,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Palette,
  Heading,
  List,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  XCircle,
  GripVertical,
  Sparkles,
  Tag
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ImageUpload } from "@/components/ImageUpload";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { tailwindToHex, hexToTailwindTextClass } from "@/lib/colors";

interface Location {
  id: string;
  city: string;
  role: string;
  description: string;
  features: string[];
  address: string;
  mapLink: string;
  images: string[];
}

interface ThemeData {
  accentColor: string;
}

interface HeaderData {
  badge: string;
  title: string;
  subtitle: string;
}

interface CtaData {
  text: string;
  link: string;
}

interface CentrosData {
  theme: ThemeData;
  header: HeaderData;
  locations: Location[];
  cta: CtaData;
}

const defaultData: CentrosData = {
  theme: {
    accentColor: "#FFFFFF"
  },
  header: {
    badge: "Operational Presence",
    title: "Nossos Centros",
    subtitle: "Infraestrutura de elite projetada para performance e criatividade."
  },
  locations: [
    {
      id: "sp-01",
      city: "São Paulo",
      role: "Hub de Inteligência & IA",
      description: "Nossa central de comando com infraestrutura de elite para imersões executivas e engenharia de dados aplicada.",
      features: [
        "Estrategistas Sênior",
        "Laboratório IA",
        "Setup Apple Pro"
      ],
      address: "Av. Paulista, Jardins - SP",
      mapLink: "https://maps.google.com",
      images: ["/card1.png", "/card2.png", "/ads-bg.png"]
    },
    {
      id: "rj-02",
      city: "Rio de Janeiro",
      role: "Célula de Growth & Social",
      description: "Ambiente disruptivo focado em produção de conteúdo de alto impacto e escala de tráfego orgânico.",
      features: [
        "Studio Pro",
        "Growth Social",
        "Célula de Performance"
      ],
      address: "Barra da Tijuca - RJ",
      mapLink: "https://maps.google.com",
      images: ["/ads-bg.png", "/ads-bg.png"]
    }
  ],
  cta: {
    text: "Agendar Visita Técnica",
    link: "#contato"
  }
};

const mergeWithDefaults = (apiData: any, defaultData: CentrosData): CentrosData => {
  if (!apiData) return defaultData;
  
  return {
    theme: {
      accentColor: apiData.theme?.accentColor || defaultData.theme.accentColor
    },
    header: {
      badge: apiData.header?.badge || defaultData.header.badge,
      title: apiData.header?.title || defaultData.header.title,
      subtitle: apiData.header?.subtitle || defaultData.header.subtitle
    },
    locations: apiData.locations?.map((loc: any, index: number) => ({
      id: loc?.id || `loc-${Date.now()}-${index}`,
      city: loc?.city || "",
      role: loc?.role || "",
      description: loc?.description || "",
      features: Array.isArray(loc?.features) ? loc.features : [],
      address: loc?.address || "",
      mapLink: loc?.mapLink || "",
      images: Array.isArray(loc?.images) ? loc.images : []
    })) || defaultData.locations,
    cta: {
      text: apiData.cta?.text || defaultData.cta.text,
      link: apiData.cta?.link || defaultData.cta.link
    }
  };
};

export default function CentrosPage() {
  const [expandedSections, setExpandedSections] = useState({
    theme: true,
    header: false,
    locations: true,
    cta: false
  });

  // Estados para drag & drop
  const [draggingLocation, setDraggingLocation] = useState<number | null>(null);
  const [draggingFeature, setDraggingFeature] = useState<{locationIndex: number, featureIndex: number} | null>(null);

  const newLocationRef = useRef<HTMLDivElement>(null);

  const {
    data: componentData,
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
  } = useJsonManagement<CentrosData>({
    apiPath: "/api/tegbe-institucional/json/localizacoes",
    defaultData: defaultData,
    mergeFunction: mergeWithDefaults,
  });

  const currentData = componentData || defaultData;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    updateNested(path, value);
  };

  // Validações
  const isLocationValid = (location: Location): boolean => {
    return location.city.trim() !== '' && 
           location.role.trim() !== '' && 
           location.description.trim() !== '' && 
           location.address.trim() !== '';
  };

  const locationsCompleteCount = currentData.locations.filter(isLocationValid).length;
  const locationsTotalCount = currentData.locations.length;

  // Planos (simulando da página exemplo)
  const currentPlanType = 'pro';
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;
  const canAddNewLocation = currentData.locations.length < currentPlanLimit;

  // Funções para localizações
  const addLocation = () => {
    if (!canAddNewLocation) return;
    
    const newLocation: Location = {
      id: `loc-${Date.now()}`,
      city: "",
      role: "",
      description: "",
      features: [],
      address: "",
      mapLink: "",
      images: []
    };
    
    handleChange('locations', [...currentData.locations, newLocation]);
    
    setTimeout(() => {
      newLocationRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
  };

  const handleLocationChange = (index: number, field: keyof Location, value: any) => {
    const newLocations = [...currentData.locations];
    newLocations[index] = {
      ...newLocations[index],
      [field]: value
    };
    handleChange('locations', newLocations);
  };

  const removeLocation = (index: number) => {
    const newLocations = currentData.locations.filter((_, i) => i !== index);
    handleChange('locations', newLocations);
  };

  // Funções para features
  const addFeature = (locationIndex: number) => {
    const newLocations = [...currentData.locations];
    newLocations[locationIndex].features.push("");
    handleChange('locations', newLocations);
  };

  const handleFeatureChange = (locationIndex: number, featureIndex: number, value: string) => {
    const newLocations = [...currentData.locations];
    const newFeatures = [...newLocations[locationIndex].features];
    newFeatures[featureIndex] = value;
    newLocations[locationIndex].features = newFeatures;
    handleChange('locations', newLocations);
  };

  const removeFeature = (locationIndex: number, featureIndex: number) => {
    const newLocations = [...currentData.locations];
    newLocations[locationIndex].features.splice(featureIndex, 1);
    handleChange('locations', newLocations);
  };

  // Funções para imagens
  const addImage = (locationIndex: number) => {
    const newLocations = [...currentData.locations];
    newLocations[locationIndex].images.push("");
    handleChange('locations', newLocations);
  };

  const handleImageChange = (locationIndex: number, imageIndex: number, value: string) => {
    const newLocations = [...currentData.locations];
    const newImages = [...newLocations[locationIndex].images];
    newImages[imageIndex] = value;
    newLocations[locationIndex].images = newImages;
    handleChange('locations', newLocations);
  };

  const removeImage = (locationIndex: number, imageIndex: number) => {
    const newLocations = [...currentData.locations];
    newLocations[locationIndex].images.splice(imageIndex, 1);
    handleChange('locations', newLocations);
  };

  // Funções para drag & drop de localizações
  const handleLocationDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingLocation(index);
  };

  const handleLocationDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingLocation === null || draggingLocation === index) return;
    
    const newLocations = [...currentData.locations];
    const draggedItem = newLocations[draggingLocation];
    
    newLocations.splice(draggingLocation, 1);
    const newIndex = index > draggingLocation ? index : index;
    newLocations.splice(newIndex, 0, draggedItem);
    
    handleChange('locations', newLocations);
    setDraggingLocation(index);
  };

  const handleLocationDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingLocation(null);
  };

  // Funções para drag & drop de features
  const handleFeatureDragStart = (e: React.DragEvent, locationIndex: number, featureIndex: number) => {
    e.dataTransfer.setData('text/plain', `${locationIndex}-${featureIndex}`);
    e.currentTarget.classList.add('dragging');
    setDraggingFeature({ locationIndex, featureIndex });
  };

  const handleFeatureDragOver = (e: React.DragEvent, locationIndex: number, featureIndex: number) => {
    e.preventDefault();
    
    if (!draggingFeature || 
        (draggingFeature.locationIndex === locationIndex && draggingFeature.featureIndex === featureIndex)) return;
    
    const newLocations = [...currentData.locations];
    const currentLocation = newLocations[locationIndex];
    const draggedFeature = currentLocation.features[draggingFeature.featureIndex];
    
    currentLocation.features.splice(draggingFeature.featureIndex, 1);
    const newIndex = featureIndex > draggingFeature.featureIndex ? featureIndex : featureIndex;
    currentLocation.features.splice(newIndex, 0, draggedFeature);
    
    handleChange('locations', newLocations);
    setDraggingFeature({ locationIndex, featureIndex });
  };

  const handleFeatureDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingFeature(null);
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

  // Função auxiliar para obter File do fileStates
  const getFileFromState = (key: string): File | null => {
    const value = fileStates[key];
    return value instanceof File ? value : null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await save();
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Theme
    total += 1;
    if (currentData.theme.accentColor?.trim()) completed++;

    // Header
    total += 3;
    if (currentData.header.badge?.trim()) completed++;
    if (currentData.header.title?.trim()) completed++;
    if (currentData.header.subtitle?.trim()) completed++;

    // Locations
    currentData.locations.forEach((location) => {
      total += 6; // city, role, description, address, mapLink, images
      if (location.city?.trim()) completed++;
      if (location.role?.trim()) completed++;
      if (location.description?.trim()) completed++;
      if (location.address?.trim()) completed++;
      if (location.mapLink?.trim()) completed++;
      if (location.images.length > 0) completed++;
      
      // Features
      total += 1; // at least one feature
      if (location.features.length > 0) completed++;
    });

    // CTA
    total += 2;
    if (currentData.cta.text?.trim()) completed++;
    if (currentData.cta.link?.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layers} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Building}
      title="Nossos Centros"
      description="Gerencie os centros, localizações e informações de contato"
      exists={!!exists}
      itemName="Nossos Centros"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Theme */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações de Tema"
            section="theme"
            icon={Palette}
            isExpanded={expandedSections.theme}
            onToggle={() => toggleSection("theme")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.theme ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-[var(--color-border)]"
                      style={{ backgroundColor: currentData.theme.accentColor }}
                    />
                    <ThemePropertyInput
                      property="primary"
                      label="Cor de Destaque"
                      description="Cor utilizada para destaques, botões e elementos visuais"
                      currentHex={currentData.theme.accentColor}
                      tailwindClass={`bg-[${currentData.theme.accentColor}]`}
                      onThemeChange={(_, hex) => handleChange('theme.accentColor', hex)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho da Seção"
            section="header"
            icon={Heading}
            isExpanded={expandedSections.header}
            onToggle={() => toggleSection("header")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.header ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Badge
                  </label>
                  <Input
                    value={currentData.header.badge}
                    onChange={(e) => handleChange('header.badge', e.target.value)}
                    placeholder="Ex: Operational Presence"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    Título Principal
                  </label>
                  <Input
                    value={currentData.header.title}
                    onChange={(e) => handleChange('header.title', e.target.value)}
                    placeholder="Ex: Nossos Centros"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Subtítulo
                  </label>
                  <Input
                    value={currentData.header.subtitle}
                    onChange={(e) => handleChange('header.subtitle', e.target.value)}
                    placeholder="Ex: Infraestrutura de elite projetada para performance e criatividade."
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Locations */}
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <SectionHeader
                  title="Centros / Localizações"
                  section="locations"
                  icon={MapPin}
                  isExpanded={expandedSections.locations}
                  onToggle={() => toggleSection("locations")}
                />
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-[var(--color-secondary)]/70">
                      {locationsCompleteCount} de {locationsTotalCount} completos
                    </span>
                  </div>
                  <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                  <span className="text-sm text-[var(--color-secondary)]/70">
                    Limite: {currentPlanType === 'pro' ? '10' : '5'} localizações
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button
                  type="button"
                  onClick={addLocation}
                  variant="primary"
                  className="flex items-center gap-2"
                  disabled={!canAddNewLocation}
                  loading={false}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Localização
                </Button>
                {!canAddNewLocation && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Limite do plano atingido
                  </p>
                )}
              </div>
            </div>
          </div>

          <motion.div
            initial={false}
            animate={{ height: expandedSections.locations ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-6">
              {currentData.locations.map((location, locationIndex) => (
                <div 
                  key={location.id}
                  ref={locationIndex === currentData.locations.length - 1 ? newLocationRef : undefined}
                  draggable
                  onDragStart={(e) => handleLocationDragStart(e, locationIndex)}
                  onDragOver={(e) => handleLocationDragOver(e, locationIndex)}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragEnd={handleLocationDragEnd}
                  onDrop={handleDrop}
                  className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                    draggingLocation === locationIndex 
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
                        onDragStart={(e) => handleLocationDragStart(e, locationIndex)}
                      >
                        <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                      </div>
                      
                      {/* Indicador de posição */}
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-medium text-[var(--color-secondary)]/70">
                          {locationIndex + 1}
                        </span>
                        <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-[var(--color-secondary)]">
                            {location.city || `Localização ${locationIndex + 1}`}
                          </h4>
                          {isLocationValid(location) ? (
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Input
                                label="Cidade"
                                value={location.city}
                                onChange={(e) => handleLocationChange(locationIndex, 'city', e.target.value)}
                                placeholder="Ex: São Paulo"
                                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                              />
                            </div>

                            <div>
                              <Input
                                label="Função/Role"
                                value={location.role}
                                onChange={(e) => handleLocationChange(locationIndex, 'role', e.target.value)}
                                placeholder="Ex: Hub de Inteligência & IA"
                                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <TextArea
                              label="Descrição"
                              value={location.description}
                              onChange={(e) => handleLocationChange(locationIndex, 'description', e.target.value)}
                              placeholder="Descrição do centro..."
                              className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                              rows={4}
                            />
                          </div>

                          {/* Features */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                                <List className="w-5 h-5" />
                                Recursos & Diferenciais
                              </h4>
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => addFeature(locationIndex)}
                                className="flex items-center gap-2"
                                loading={false}
                              >
                                <Plus className="w-4 h-4" />
                                Adicionar
                              </Button>
                            </div>

                            <div className="space-y-3">
                              {location.features.map((feature, featureIndex) => (
                                <div 
                                  key={featureIndex}
                                  draggable
                                  onDragStart={(e) => handleFeatureDragStart(e, locationIndex, featureIndex)}
                                  onDragOver={(e) => handleFeatureDragOver(e, locationIndex, featureIndex)}
                                  onDragEnter={handleDragEnter}
                                  onDragLeave={handleDragLeave}
                                  onDragEnd={handleFeatureDragEnd}
                                  onDrop={handleDrop}
                                  className={`flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg ${
                                    draggingFeature?.locationIndex === locationIndex && draggingFeature?.featureIndex === featureIndex
                                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                                      : 'hover:border-[var(--color-primary)]/50'
                                  }`}
                                >
                                  <div 
                                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-[var(--color-background)]/50 rounded transition-colors"
                                    draggable
                                    onDragStart={(e) => handleFeatureDragStart(e, locationIndex, featureIndex)}
                                  >
                                    <GripVertical className="w-4 h-4 text-[var(--color-secondary)]/70" />
                                  </div>
                                  
                                  <Input
                                    value={feature}
                                    onChange={(e) => handleFeatureChange(locationIndex, featureIndex, e.target.value)}
                                    placeholder="Ex: Estrategistas Sênior"
                                    className="flex-1 bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                  
                                  <Button
                                    type="button"
                                    variant="danger"
                                    onClick={() => removeFeature(locationIndex, featureIndex)}
                                    className="flex items-center gap-2"
                                    loading={false}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Input
                                label="Endereço"
                                value={location.address}
                                onChange={(e) => handleLocationChange(locationIndex, 'address', e.target.value)}
                                placeholder="Ex: Av. Paulista, Jardins - SP"
                                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                              />
                            </div>

                            <div>
                              <Input
                                label="Link do Mapa (Google Maps)"
                                value={location.mapLink}
                                onChange={(e) => handleLocationChange(locationIndex, 'mapLink', e.target.value)}
                                placeholder="https://maps.google.com"
                                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                              />
                              <div className="flex items-center gap-2 mt-2 text-xs text-[var(--color-secondary)]/70">
                                <ExternalLink className="w-3 h-3" />
                                <span>Link para o Google Maps</span>
                              </div>
                            </div>
                          </div>

                          {/* Images */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" />
                                Imagens do Centro
                              </h4>
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => addImage(locationIndex)}
                                className="flex items-center gap-2"
                                loading={false}
                              >
                                <Plus className="w-4 h-4" />
                                Adicionar Imagem
                              </Button>
                            </div>

                            <div className="space-y-3">
                              {location.images.map((image, imageIndex) => (
                                <div key={imageIndex} className="space-y-2">
                                  <div className="flex items-center gap-3">
                                    <Input
                                      value={image}
                                      onChange={(e) => handleImageChange(locationIndex, imageIndex, e.target.value)}
                                      placeholder="/imagem.png"
                                      className="flex-1 bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                    />
                                    <Button
                                      type="button"
                                      variant="danger"
                                      onClick={() => removeImage(locationIndex, imageIndex)}
                                      className="flex items-center gap-2"
                                      loading={false}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    {image && (
                                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-[var(--color-border)]">
                                        <img 
                                          src={image} 
                                          alt={`Preview ${imageIndex}`}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      </div>
                                    )}
                                    <ImageUpload
                                      label=""
                                      currentImage={image}
                                      selectedFile={getFileFromState(`locations.${locationIndex}.images.${imageIndex}`)}
                                      onFileChange={(file) => setFileState(`locations.${locationIndex}.images.${imageIndex}`, file)}
                                      aspectRatio="aspect-video"
                                      previewWidth={200}
                                      previewHeight={150}
                                                              />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        onClick={() => removeLocation(locationIndex)}
                        variant="danger"
                        className="flex items-center gap-2"
                        loading={false}
                      >
                        <Trash2 className="w-4 h-4" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Seção CTA */}
        <div className="space-y-4">
          <SectionHeader
            title="Call to Action"
            section="cta"
            icon={MessageSquare}
            isExpanded={expandedSections.cta}
            onToggle={() => toggleSection("cta")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.cta ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Texto do Botão"
                    value={currentData.cta.text}
                    onChange={(e) => handleChange('cta.text', e.target.value)}
                    placeholder="Ex: Agendar Visita Técnica"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div>
                  <Input
                    label="Link/Âncora"
                    value={currentData.cta.link}
                    onChange={(e) => handleChange('cta.link', e.target.value)}
                    placeholder="Ex: #contato"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                    Pode ser um link interno (#seção) ou externo
                  </p>
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
          itemName="Nossos Centros"
          icon={Building}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={currentData.locations.length}
        itemName="Nossos Centros"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}