/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import { 
  Users, 
  ChevronDown, 
  ChevronUp,
  Upload,
  X,
  Plus,
  Trash2,
  TrendingUp,
  Building,
  ExternalLink,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Tag as TagIcon
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import Image from "next/image";

interface Testimonial {
  id: number;
  logo: string;
  name: string;
  description: string;
  result: string;
  metric?: string;
  tags: string[];
}

interface CTAData {
  text: string;
  url: string;
  description: string;
}

interface SuccessCasesData {
  badge: {
    text: string;
    icon: string;
  };
  title: {
    part1: string;
    part2: string;
  };
  testimonials: Testimonial[];
  cta: CTAData;
}

const defaultSuccessCasesData: SuccessCasesData = {
  badge: {
    text: "",
    icon: "lucide:trending-up"
  },
  title: {
    part1: "",
    part2: ""
  },
  testimonials: [
    {
      id: 1,
      logo: "",
      name: "",
      description: "",
      result: "",
      metric: "",
      tags: ["Meta Ads", "Google Ads", "TikTok Ads"]
    }
  ],
  cta: {
    text: "",
    url: "",
    description: ""
  }
};

// Ícones disponíveis para badges
const availableIcons = [
  { value: "lucide:trending-up", label: "Trending Up" },
  { value: "lucide:award", label: "Prêmio" },
  { value: "lucide:building", label: "Edifício" },
  { value: "lucide:briefcase", label: "Maleta" },
  { value: "lucide:users", label: "Usuários" },
  { value: "lucide:shopping-bag", label: "Sacola" }
];

const defaultTags = [
  "Meta Ads",
  "Google Ads", 
  "TikTok Ads",
  "E-commerce",
  "Gestão",
  "Automação",
  "Processos",
  "Social Media",
  "Branding",
  "Tráfego Local",
  "Google",
  "Leads",
  "Vendas",
  "CRM",
  "Fidelização",
  "CRM Kommo",
  "Inbound",
  "Hubspot",
  "Tráfego",
  "Copywriting",
  "BI",
  "Dashboards"
];

const mergeWithDefaults = (apiData: any, defaultData: SuccessCasesData): SuccessCasesData => {
  if (!apiData) return defaultData;
  
  return {
    badge: apiData.badge || defaultData.badge,
    title: apiData.title || defaultData.title,
    testimonials: apiData.testimonials || defaultData.testimonials,
    cta: apiData.cta || defaultData.cta
  };
};

// Componente de preview de logo
const LogoPreview = ({ logoUrl, name }: { logoUrl: string, name: string }) => {
  if (!logoUrl || logoUrl.trim() === "") {
    return (
      <div className="w-20 h-20 flex items-center justify-center bg-[var(--color-background-body)] rounded-lg border-2 border-[var(--color-border)]">
        <Building className="w-8 h-8 text-[var(--color-secondary)]/50" />
      </div>
    );
  }

  return (
    <div className="relative w-20 h-20 rounded-lg border-2 border-[var(--color-border)] overflow-hidden bg-[var(--color-background-body)]">
      <Image
        src={logoUrl}
        alt={`Logo ${name}`}
        fill
        className="object-contain p-1"
        sizes="80px"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="w-full h-full flex items-center justify-center bg-[var(--color-background-body)]">
                <svg class="w-8 h-8 text-[var(--color-secondary)]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            `;
          }
        }}
      />
    </div>
  );
};

// Componente de Tag Input
interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags?: string[];
}

const TagInput = ({ tags, onTagsChange, availableTags = defaultTags }: TagInputProps) => {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      onTagsChange([...tags, tag]);
    }
    setInput("");
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const filteredTags = availableTags.filter(tag => 
    tag.toLowerCase().includes(input.toLowerCase()) && !tags.includes(tag)
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--color-secondary)]">
        Tags
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-[var(--color-primary)]/80"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      
      <div className="relative">
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setInput(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Digite uma tag ou selecione..."
            className="flex-1 bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
          />
          <Button
            type="button"
            onClick={() => addTag(input)}
            disabled={!input.trim()}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
          >
            Adicionar
          </Button>
        </div>

        <AnimatePresence>
          {isOpen && input && filteredTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-full mt-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg shadow-lg max-h-60 overflow-auto"
            >
              {filteredTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    addTag(tag);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[var(--color-background-body)] transition-colors text-[var(--color-secondary)]"
                >
                  {tag}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function SuccessCasesPage() {
  const [expandedSections, setExpandedSections] = useState({
    header: true,
    testimonials: false,
    cta: false,
  });

  const [expandedTestimonial, setExpandedTestimonial] = useState<number | null>(null);

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
  } = useJsonManagement<SuccessCasesData>({
    apiPath: "/api/tegbe-institucional/json/company",
    defaultData: defaultSuccessCasesData,
    mergeFunction: mergeWithDefaults,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para gerenciar testimonials
  const handleAddTestimonial = () => {
    const newId = Math.max(...pageData.testimonials.map(t => t.id), 0) + 1;
    const newTestimonial: Testimonial = {
      id: newId,
      logo: "",
      name: "",
      description: "",
      result: "",
      metric: "",
      tags: []
    };
    const updatedTestimonials = [...pageData.testimonials, newTestimonial];
    updateNested('testimonials', updatedTestimonials);
  };

  const handleUpdateTestimonial = (index: number, updates: Partial<Testimonial>) => {
    const updatedTestimonials = [...pageData.testimonials];
    updatedTestimonials[index] = { ...updatedTestimonials[index], ...updates };
    updateNested('testimonials', updatedTestimonials);
  };

  const handleRemoveTestimonial = (index: number) => {
    const updatedTestimonials = pageData.testimonials.filter((_, i) => i !== index);
    updateNested('testimonials', updatedTestimonials);
    // Limpar arquivo se existir
    setFileState(`testimonials.${index}.logo`, null);
  };

  // Funções para gerenciar CTA
  const handleCTAChange = (field: keyof CTAData, value: string) => {
    updateNested(`cta.${field}`, value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Função auxiliar para obter File do fileStates
  const getFileFromState = (key: string): File | null => {
    const value = fileStates[key];
    return value instanceof File ? value : null;
  };

  const getLogoUrl = (testimonial: Testimonial, index: number): string => {
    // Primeiro verificar se há arquivo selecionado
    const file = getFileFromState(`testimonials.${index}.logo`);
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    
    // Verificar se há URL no estado
    const logo = testimonial.logo;
    
    if (logo && typeof logo === 'string' && logo.trim() !== "") {
      // Se já for uma URL completa, retornar como está
      if (logo.startsWith('http') || logo.startsWith('//') || logo.startsWith('blob:')) {
        return logo;
      }
      // Se for uma URL relativa, adicionar o domínio
      return `https://mavellium.com.br${logo.startsWith('/') ? '' : '/'}${logo}`;
    }
    
    return "";
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Badge
    total += 2;
    if (pageData.badge.text.trim()) completed++;
    if (pageData.badge.icon.trim()) completed++;

    // Título
    total += 2;
    if (pageData.title.part1.trim()) completed++;
    if (pageData.title.part2.trim()) completed++;

    // Testimonials
    total += pageData.testimonials.length * 6;
    pageData.testimonials.forEach(testimonial => {
      if (testimonial.name.trim()) completed++;
      if (testimonial.description.trim()) completed++;
      if (testimonial.result.trim()) completed++;
      if (testimonial.metric?.trim()) completed++;
      if (testimonial.logo.trim()) completed++;
      if (testimonial.tags.length > 0) completed++;
    });

    // CTA
    total += 3;
    if (pageData.cta.text.trim()) completed++;
    if (pageData.cta.url.trim()) completed++;
    if (pageData.cta.description.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  const renderTestimonialCard = (testimonial: Testimonial, index: number) => {
    const logoUrl = getLogoUrl(testimonial, index);
    const isExpanded = expandedTestimonial === index;

    return (
      <Card key={testimonial.id} className="p-6 bg-[var(--color-background)] border-[var(--color-border)]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <LogoPreview logoUrl={logoUrl} name={testimonial.name} />
            <div>
              <h4 className="font-semibold text-[var(--color-secondary)]">
                {testimonial.name || "Novo Case"}
              </h4>
              <p className="text-sm text-[var(--color-secondary)]/70">
                {testimonial.description || "Sem descrição"}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setExpandedTestimonial(isExpanded ? null : index)}
              className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {isExpanded ? "Recolher" : "Expandir"}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => handleRemoveTestimonial(index)}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--color-border)]">
                {/* Upload da Logo */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Logo da Empresa
                  </label>
                  <div className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-4">
                    <div className="flex flex-col items-center justify-center">
                      {logoUrl ? (
                        <>
                          <div className="mb-4">
                            <LogoPreview logoUrl={logoUrl} name={testimonial.name} />
                          </div>
                          <div className="flex gap-2">
                            <label className="cursor-pointer px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors">
                              <Upload className="w-4 h-4 inline mr-1" />
                              Trocar Logo
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  setFileState(`testimonials.${index}.logo`, file);
                                }}
                              />
                            </label>
                            <Button
                              type="button"
                              onClick={() => {
                                setFileState(`testimonials.${index}.logo`, null);
                                handleUpdateTestimonial(index, { logo: "" });
                              }}
                              variant="danger"
                              className="bg-red-600 hover:bg-red-700 text-white border-none"
                            >
                              Remover
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-[var(--color-background-body)] rounded-full flex items-center justify-center mb-3">
                            <Building className="w-6 h-6 text-[var(--color-secondary)]/50" />
                          </div>
                          <p className="text-sm text-[var(--color-secondary)]/70 mb-3">
                            Adicione o logo da empresa
                          </p>
                          <label className="cursor-pointer px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors">
                            <Upload className="w-4 h-4 inline mr-1" />
                            Selecionar Logo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setFileState(`testimonials.${index}.logo`, file);
                              }}
                            />
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Campos do Testimonial */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">
                      Nome da Empresa
                    </label>
                    <Input
                      type="text"
                      value={testimonial.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleUpdateTestimonial(index, { name: e.target.value })
                      }
                      placeholder="Ex: Empresa XYZ"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">
                      Descrição
                    </label>
                    <Input
                      type="text"
                      value={testimonial.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleUpdateTestimonial(index, { description: e.target.value })
                      }
                      placeholder="Ex: E-commerce de Moda"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">
                      Resultado Alcançado
                    </label>
                    <Input
                      type="text"
                      value={testimonial.result}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleUpdateTestimonial(index, { result: e.target.value })
                      }
                      placeholder="Ex: 150% ROI em 3 meses"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-secondary)] mb-1">
                      Métrica Adicional
                    </label>
                    <Input
                      type="text"
                      value={testimonial.metric || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleUpdateTestimonial(index, { metric: e.target.value })
                      }
                      placeholder="Ex: +300% em vendas"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <TagInput
                    tags={testimonial.tags || []}
                    onTagsChange={(newTags) => 
                      handleUpdateTestimonial(index, { tags: newTags })
                    }
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  };

  return (
    <ManageLayout
      headerIcon={Users}
      title="Cases de Sucesso"
      description="Gerencie os cases de sucesso das empresas que escalamos"
      exists={!!exists}
      itemName="Configuração de Cases"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho da Seção"
            section="header"
            icon={TrendingUp}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                      Texto do Badge
                    </label>
                    <Input
                      type="text"
                      value={pageData.badge.text}
                      onChange={(e) => updateNested('badge.text', e.target.value)}
                      placeholder="Ex: Resultados Reais"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                      Ícone do Badge
                    </label>
                    <select
                      value={pageData.badge.icon}
                      onChange={(e) => updateNested('badge.icon', e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-background-body)] text-[var(--color-secondary)]"
                    >
                      <option value="">Selecione um ícone...</option>
                      {availableIcons.map((icon) => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                      Primeira Parte do Título
                    </label>
                    <Input
                      type="text"
                      value={pageData.title.part1}
                      onChange={(e) => updateNested('title.part1', e.target.value)}
                      placeholder="Ex: Empresas que escalamos"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                      Segunda Parte do Título
                    </label>
                    <Input
                      type="text"
                      value={pageData.title.part2}
                      onChange={(e) => updateNested('title.part2', e.target.value)}
                      placeholder="Ex: com tecnologia e dados"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Testimonials */}
        <div className="space-y-4">
          <SectionHeader
            title="Cases de Sucesso"
            section="testimonials"
            icon={Users}
            isExpanded={expandedSections.testimonials}
            onToggle={() => toggleSection("testimonials")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.testimonials ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)]">
                      Cases de Sucesso ({pageData.testimonials.length})
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {pageData.testimonials.filter(t => t.name && t.description && t.result && t.logo).length} de {pageData.testimonials.length} completos
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddTestimonial}
                    className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Case
                  </Button>
                </div>

                {pageData.testimonials.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                    <Users className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                      Nenhum case de sucesso adicionado
                    </h4>
                    <p className="text-[var(--color-secondary)]/70 mb-4">
                      Comece adicionando os primeiros cases de sucesso
                    </p>
                    <Button
                      type="button"
                      onClick={handleAddTestimonial}
                      className="flex items-center gap-2 mx-auto bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Primeiro Case
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pageData.testimonials.map((testimonial, index) => 
                      renderTestimonialCard(testimonial, index)
                    )}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção CTA */}
        <div className="space-y-4">
          <SectionHeader
            title="Call to Action"
            section="cta"
            icon={MessageCircle}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                        Texto do Botão
                      </label>
                      <Input
                        type="text"
                        value={pageData.cta.text || ""}
                        onChange={(e) => handleCTAChange("text", e.target.value)}
                        placeholder="Ex: Quero Estruturar e Escalar Meu Negócio"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                        URL de Destino
                      </label>
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-[var(--color-secondary)]" />
                        <Input
                          type="text"
                          value={pageData.cta.url || ""}
                          onChange={(e) => handleCTAChange("url", e.target.value)}
                          placeholder="Ex: https://api.whatsapp.com/send?phone=5514991779502"
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                        Descrição do CTA
                      </label>
                      <TextArea
                        value={pageData.cta.description || ""}
                        onChange={(e) => handleCTAChange("description", e.target.value)}
                        placeholder="Ex: Anúncios, operação e dados trabalhando juntos para vender mais."
                        rows={4}
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
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
          itemName="Seção de Cases"
          icon={Users}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Seção de Cases de Sucesso"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}