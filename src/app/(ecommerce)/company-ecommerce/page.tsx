/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { 
  Users, 
  ShoppingBag, 
  Megaphone,
  ChevronDown, 
  ChevronUp,
  Upload,
  X,
  Plus,
  Trash2,
  Star,
  Building,
  Tag,
  TrendingUp,
  LucideIcon,
  BriefcaseBusiness
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
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

interface SectionData {
  badge: {
    text: string;
    icon: string;
  };
  title: {
    part1: string;
    part2: string;
  };
  testimonials: Testimonial[];
}

interface SuccessCasesData {
  ecommerce: SectionData;
  marketing: SectionData;
}

interface SectionFiles {
  [key: string]: {
    [testimonialId: number]: File | null;
  };
}

const defaultSuccessCasesData: SuccessCasesData = {
  ecommerce: {
    badge: {
      text: "",
      icon: ""
    },
    title: {
      part1: "",
      part2: ""
    },
    testimonials: []
  },
  marketing: {
    badge: {
      text: "",
      icon: ""
    },
    title: {
      part1: "",
      part2: ""
    },
    testimonials: []
  }
};

// Ícones disponíveis para badges
const availableIcons = [
  { value: "solar:graph-up-bold", label: "Gráfico Crescente", icon: TrendingUp },
  { value: "mdi:chart-box-outline", label: "Gráfico em Caixa", icon: TrendingUp },
  { value: "lucide:trending-up", label: "Trending Up", icon: TrendingUp },
  { value: "lucide:award", label: "Prêmio", icon: Star },
  { value: "lucide:building", label: "Edifício", icon: Building },
  { value: "lucide:briefcase", label: "Maleta", icon: BriefcaseBusiness },
  { value: "lucide:users", label: "Usuários", icon: Users },
  { value: "lucide:shopping-bag", label: "Sacola", icon: ShoppingBag }
];

const defaultTags = [
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
  "Google Ads",
  "CRM Kommo",
  "Meta Ads",
  "Inbound",
  "Hubspot",
  "Tráfego",
  "Copywriting",
  "BI",
  "Dashboards"
];

// Componente de preview de logo
const LogoPreview = ({ logoUrl, name }: { logoUrl: string, name: string }) => {
  if (!logoUrl || logoUrl.trim() === "") {
    return (
      <div className="w-20 h-20 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg border-2 border-zinc-300 dark:border-zinc-600">
        <Building className="w-8 h-8 text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="relative w-20 h-20 rounded-lg border-2 border-zinc-300 dark:border-zinc-600 overflow-hidden bg-white dark:bg-zinc-900">
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
              <div class="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                <svg class="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

// Componente SectionHeader
interface SectionHeaderProps {
  title: string;
  section: "ecommerce" | "marketing";
  icon: LucideIcon;
  isExpanded: boolean;
  onToggle: (section: "ecommerce" | "marketing") => void;
}

const SectionHeader = ({
  title,
  section,
  icon: Icon,
  isExpanded,
  onToggle
}: SectionHeaderProps) => (
  <button
    type="button"
    onClick={() => onToggle(section)}
    className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        {title}
      </h3>
      <span className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded">
        {section === "ecommerce" ? "E-commerce" : "Marketing"}
      </span>
    </div>
    {isExpanded ? (
      <ChevronUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
    ) : (
      <ChevronDown className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
    )}
  </button>
);

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
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Tags
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-blue-600 dark:hover:text-blue-400"
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
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => addTag(input)}
            disabled={!input.trim()}
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
              className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-auto"
            >
              {filteredTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    addTag(tag);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
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
  const [files, setFiles] = useState<SectionFiles>({
    ecommerce: {},
    marketing: {}
  });
  
  const {
    data: successCasesData,
    setData: setSuccessCasesData,
    updateNested,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload
  } = useJsonManagement<SuccessCasesData>({
    apiPath: "/api/tegbe-institucional/json/company",
    defaultData: defaultSuccessCasesData,
  });

  const [expandedSections, setExpandedSections] = useState({
    ecommerce: true,
    marketing: false
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });

  const [expandedTestimonial, setExpandedTestimonial] = useState<{
    section: "ecommerce" | "marketing";
    index: number;
  } | null>(null);

  // Calcular campos completos
  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    // Verificar se cada seção tem badge e título
    const sections = ["ecommerce", "marketing"] as const;
    
    sections.forEach(section => {
      const sectionData = successCasesData[section];
      if (
        sectionData.badge.text.trim() !== "" &&
        sectionData.title.part1.trim() !== "" &&
        sectionData.title.part2.trim() !== ""
      ) {
        count++;
      }
    });
    
    return count;
  }, [successCasesData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 2; // ecommerce, marketing
  const canAddNewItem = false;
  const isLimitReached = false;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSectionChange = (section: "ecommerce" | "marketing", path: string, value: any) => {
    updateNested(`${section}.${path}`, value);
  };

  const handleTestimonialChange = (
    section: "ecommerce" | "marketing",
    index: number,
    field: keyof Testimonial,
    value: any
  ) => {
    updateNested(`${section}.testimonials.${index}.${field}`, value);
  };

  const addTestimonial = (section: "ecommerce" | "marketing") => {
    const currentTestimonials = successCasesData[section].testimonials;
    const newId = currentTestimonials.length > 0 
      ? Math.max(...currentTestimonials.map(t => t.id)) + 1 
      : 1;
    
    const newTestimonial: Testimonial = {
      id: newId,
      logo: "",
      name: "",
      description: "",
      result: "",
      metric: "",
      tags: []
    };

    updateNested(`${section}.testimonials`, [...currentTestimonials, newTestimonial]);
  };

  const removeTestimonial = (section: "ecommerce" | "marketing", index: number) => {
    const currentTestimonials = [...successCasesData[section].testimonials];
    currentTestimonials.splice(index, 1);
    updateNested(`${section}.testimonials`, currentTestimonials);
    
    // Limpar arquivo se existir
    setFiles(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [index]: null
      }
    }));
  };

  const handleFileChange = (
    section: "ecommerce" | "marketing", 
    testimonialIndex: number, 
    file: File | null
  ) => {
    setFiles(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [testimonialIndex]: file
      }
    }));
  };

  const getLogoUrl = (section: "ecommerce" | "marketing", testimonial: Testimonial): string => {
    const testimonialIndex = successCasesData[section].testimonials.findIndex(t => t.id === testimonial.id);
    
    // Primeiro verificar se há arquivo selecionado
    if (files[section]?.[testimonialIndex]) {
      return URL.createObjectURL(files[section][testimonialIndex]!);
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

  const handleSubmit = async () => {
    const fd = new FormData();

    // Processar arquivos de ecommerce
    Object.entries(files.ecommerce).forEach(([index, file]) => {
      if (file) {
        const testimonial = successCasesData.ecommerce.testimonials[parseInt(index)];
        if (testimonial) {
          fd.append(`file:ecommerce.testimonials.${index}.logo`, file);
        }
      }
    });

    // Processar arquivos de marketing
    Object.entries(files.marketing).forEach(([index, file]) => {
      if (file) {
        const testimonial = successCasesData.marketing.testimonials[parseInt(index)];
        if (testimonial) {
          fd.append(`file:marketing.testimonials.${index}.logo`, file);
        }
      }
    });

    await save(fd);
    await reload();
    setFiles({ ecommerce: {}, marketing: {} });
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODOS OS CASES DE SUCESSO"
    });
  };

  const confirmDelete = async () => {
    await fetch("/api/tegbe-institucional/json/company", {
      method: "DELETE",
    });

    setSuccessCasesData(defaultSuccessCasesData);
    setFiles({ ecommerce: {}, marketing: {} });

    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: "all", 
      title: "" 
    });
  };

  const renderTestimonialCard = (
    testimonial: Testimonial, 
    index: number, 
    section: "ecommerce" | "marketing"
  ) => {
    const logoUrl = getLogoUrl(section, testimonial);
    const isExpanded = expandedTestimonial?.section === section && expandedTestimonial?.index === index;

    return (
      <Card key={testimonial.id} className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <LogoPreview logoUrl={logoUrl} name={testimonial.name} />
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {testimonial.name || "Novo Case"}
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {testimonial.description || "Sem descrição"}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setExpandedTestimonial(
                isExpanded ? null : { section, index }
              )}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {isExpanded ? "Recolher" : "Expandir"}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => removeTestimonial(section, index)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                {/* Upload da Logo */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Logo da Empresa
                  </label>
                  <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4">
                    <div className="flex flex-col items-center justify-center">
                      {logoUrl ? (
                        <>
                          <div className="mb-4">
                            <LogoPreview logoUrl={logoUrl} name={testimonial.name} />
                          </div>
                          <div className="flex gap-2">
                            <label className="cursor-pointer px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                              <Upload className="w-4 h-4 inline mr-1" />
                              Trocar Logo
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  handleFileChange(section, index, file);
                                }}
                              />
                            </label>
                            <Button
                              type="button"
                              onClick={() => {
                                handleFileChange(section, index, null);
                                handleTestimonialChange(section, index, "logo", "");
                              }}
                              variant="danger"
                            >
                              Remover
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                            <Building className="w-6 h-6 text-zinc-400" />
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                            Adicione o logo da empresa
                          </p>
                          <label className="cursor-pointer px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <Upload className="w-4 h-4 inline mr-1" />
                            Selecionar Logo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                handleFileChange(section, index, file);
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
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Nome da Empresa
                    </label>
                    <Input
                      type="text"
                      value={testimonial.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleTestimonialChange(section, index, "name", e.target.value)
                      }
                      placeholder="Ex: Decora Fest"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Descrição
                    </label>
                    <Input
                      type="text"
                      value={testimonial.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleTestimonialChange(section, index, "description", e.target.value)
                      }
                      placeholder="Ex: Loja de Decorações • Garça/SP"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Resultado Alcançado
                    </label>
                    <Input
                      type="text"
                      value={testimonial.result}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleTestimonialChange(section, index, "result", e.target.value)
                      }
                      placeholder="Ex: Aumento de 30% nas Vendas"
                    />
                  </div>

                  {section === "marketing" && (
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Métrica Adicional (opcional)
                      </label>
                      <Input
                        type="text"
                        value={testimonial.metric || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleTestimonialChange(section, index, "metric", e.target.value)
                        }
                        placeholder="Ex: Em 3 meses de campanha"
                      />
                    </div>
                  )}

                  <TagInput
                    tags={testimonial.tags || []}
                    onTagsChange={(newTags) => 
                      handleTestimonialChange(section, index, "tags", newTags)
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

  const renderSection = (section: "ecommerce" | "marketing") => {
    const sectionData = successCasesData[section];
    const sectionLabel = section === "ecommerce" ? "E-commerce" : "Marketing";

    return (
      <div className="space-y-6">
        {/* Cabeçalho e Badge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Texto do Badge
            </label>
            <Input
              type="text"
              value={sectionData.badge.text}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSectionChange(section, "badge.text", e.target.value)
              }
              placeholder="Ex: Track Record"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Ícone do Badge
            </label>
            <select
              value={sectionData.badge.icon}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleSectionChange(section, "badge.icon", e.target.value)
              }
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
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

        {/* Título */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Primeira Parte do Título
            </label>
            <Input
              type="text"
              value={sectionData.title.part1}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSectionChange(section, "title.part1", e.target.value)
              }
              placeholder="Ex: Empresas que estão"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Segunda Parte do Título
            </label>
            <Input
              type="text"
              value={sectionData.title.part2}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSectionChange(section, "title.part2", e.target.value)
              }
              placeholder="Ex: vendendo conosco."
            />
          </div>
        </div>

        {/* Lista de Testimonials */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              Cases de Sucesso ({sectionData.testimonials.length})
            </h4>
            <Button
              type="button"
              onClick={() => addTestimonial(section)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Case
            </Button>
          </div>

          {sectionData.testimonials.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Nenhum case de sucesso adicionado
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Comece adicionando os primeiros cases de sucesso da área de {sectionLabel.toLowerCase()}
              </p>
              <Button
                type="button"
                onClick={() => addTestimonial(section)}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Adicionar Primeiro Case
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {sectionData.testimonials.map((testimonial, index) => 
                renderTestimonialCard(testimonial, index, section)
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={Users}
      title="Cases de Sucesso"
      description="Gerencie os cases de sucesso das áreas de E-commerce e Marketing"
      exists={!!exists}
      itemName="Configuração de Cases"
    >
      <form onSubmit={handleSubmitWrapper} className="space-y-6 pb-32">
        {/* Seção E-commerce */}
        <div className="space-y-4">
          <SectionHeader
            title="Cases de Sucesso - E-commerce"
            section="ecommerce"
            icon={ShoppingBag}
            isExpanded={expandedSections.ecommerce}
            onToggle={toggleSection}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.ecommerce ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderSection("ecommerce")}
            </Card>
          </motion.div>
        </div>

        {/* Seção Marketing */}
        <div className="space-y-4">
          <SectionHeader
            title="Cases de Sucesso - Marketing"
            section="marketing"
            icon={Megaphone}
            isExpanded={expandedSections.marketing}
            onToggle={toggleSection}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.marketing ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderSection("marketing")}
            </Card>
          </motion.div>
        </div>

        {/* Fixed Action Bar */}
        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          isAddDisabled={!canAddNewItem || isLimitReached}
          isSaving={loading}
          exists={!!exists}
          completeCount={completeCount}
          totalCount={totalCount}
          itemName="Seção"
          icon={Users}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={2}
        itemName="Seção de Cases"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}