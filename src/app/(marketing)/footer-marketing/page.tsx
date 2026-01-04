/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { 
  Store,
  Megaphone,
  Building2,
  Image as ImageIcon,
  Link as LinkIcon,
  Mail,
  Type,
  ChevronDown, 
  ChevronUp,
  Plus,
  Trash2,
  Upload,
  BarChart3,
  Users,
  Calendar,
  Target,
  TrendingUp,
  LucideIcon
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import Image from "next/image";

interface Stat {
  val: string;
  label: string;
}

interface SectionData {
  badgeImage: string;
  badgeTitle: string;
  badgeDesc: string;
  stats1: Stat;
  stats2: Stat;
  columnTitle: string;
  links: string[];
  email: string;
  desc: string;
}

interface FooterData {
  ecommerce: SectionData;
  marketing: SectionData;
  sobre: SectionData;
}

interface SectionFiles {
  ecommerce: File | null;
  marketing: File | null;
  sobre: File | null;
}

const defaultFooterData: FooterData = {
  ecommerce: {
    badgeImage: "",
    badgeTitle: "Consultoria Certificada",
    badgeDesc: "Selo oficial de qualidade e segurança Mercado Livre.",
    stats1: { val: "+100M", label: "Gerenciados" },
    stats2: { val: "Top 1%", label: "Performance" },
    columnTitle: "Expertise",
    links: ["Gestão Full Commerce", "Consultoria Oficial", "Ads & Performance", "Design & Branding"],
    email: "contato@tegbe.com.br",
    desc: "Aceleradora de E-commerce. Transformamos operação técnica em lucro real através de dados e estratégia."
  },
  marketing: {
    badgeImage: "",
    badgeTitle: "Kommo Gold Partner",
    badgeDesc: "Especialistas certificados em CRM e Automação.",
    stats1: { val: "+40", label: "Implantações" },
    stats2: { val: "24/7", label: "Suporte IA" },
    columnTitle: "Soluções",
    links: ["Implementação CRM", "Tráfego de Elite", "Automação com IA", "Business Intelligence"],
    email: "comercial@tegbe.com.br",
    desc: "Engenharia de Vendas. Transformamos tráfego em receita previsível através de CRM, Dados e IA."
  },
  sobre: {
    badgeImage: "",
    badgeTitle: "Cultura de Excelência",
    badgeDesc: "Growth Partners focados em Equity e Governança.",
    stats1: { val: "2020", label: "Fundação" },
    stats2: { val: "Senior", label: "Equipe" },
    columnTitle: "Institucional",
    links: ["Nossa História", "Manifesto", "Carreiras", "Imprensa"],
    email: "institucional@tegbe.com.br",
    desc: "Não somos uma agência. Somos o braço direito estratégico que constrói o futuro da sua operação."
  }
};

// Ícones para cada seção
const sectionIcons = {
  ecommerce: Store,
  marketing: Megaphone,
  sobre: Building2
};

const sectionTitles = {
  ecommerce: "E-commerce",
  marketing: "Marketing",
  sobre: "Sobre"
};

// Componente SectionHeader
interface SectionHeaderProps {
  title: string;
  section: "ecommerce" | "marketing" | "sobre";
  icon: LucideIcon;
  isExpanded: boolean;
  onToggle: (section: "ecommerce" | "marketing" | "sobre") => void;
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
    </div>
    {isExpanded ? (
      <ChevronUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
    ) : (
      <ChevronDown className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
    )}
  </button>
);

// Componente ImageUpload - CORRIGIDO
interface ImageUploadProps {
  section: "ecommerce" | "marketing" | "sobre";
  currentImage: string;
  selectedFile: File | null;
  onFileChange: (section: "ecommerce" | "marketing" | "sobre", file: File | null) => void;
}

const ImageUpload = ({ section, currentImage, selectedFile, onFileChange }: ImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    // Se houver um arquivo selecionado, criar uma URL temporária
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(objectUrl);
      
      // Limpar a URL quando o componente for desmontado
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else if (currentImage) {
      // Se não houver arquivo mas houver uma imagem salva, usar ela
      setPreviewUrl(currentImage);
    } else {
      // Se não houver nada, limpar a preview
      setPreviewUrl("");
    }
  }, [selectedFile, currentImage]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Imagem do Badge
      </label>
      
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {previewUrl ? (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900">
            <Image
              src={previewUrl}
              alt="Badge preview"
              fill
              className="object-contain p-4"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                      <svg class="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  `;
                }
              }}
            />
          </div>
        ) : (
          <div className="w-32 h-32 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600">
            <ImageIcon className="w-8 h-8 text-zinc-400" />
          </div>
        )}
        
        <div className="flex-1 space-y-4">
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-6">
            <div className="flex flex-col items-center justify-center">
              {previewUrl ? (
                <>
                  <div className="flex gap-3 mb-3">
                    <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Trocar Imagem
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          onFileChange(section, file);
                        }}
                      />
                    </label>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => onFileChange(section, null)}
                    >
                      Remover
                    </Button>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Clique em &quot;Trocar Imagem&quot; para substituir
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 text-center">
                    Upload recomendado: SVG ou PNG transparente<br/>
                    Tamanho ideal: 64x64px
                  </p>
                  <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Selecionar Imagem
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        onFileChange(section, file);
                      }}
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente LinksEditor
interface LinksEditorProps {
  links: string[];
  onChange: (links: string[]) => void;
}

const LinksEditor = ({ links, onChange }: LinksEditorProps) => {
  const addLink = () => {
    onChange([...links, ""]);
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    onChange(newLinks);
  };

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    onChange(newLinks);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          Links ({links.length})
        </h4>
        <Button
          type="button"
          onClick={addLink}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Link
        </Button>
      </div>

      {links.length === 0 ? (
        <Card className="p-8 text-center">
          <LinkIcon className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Nenhum link adicionado
          </h4>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Adicione os links desta seção
          </p>
          <Button
            type="button"
            onClick={addLink}
            className="flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Adicionar Primeiro Link
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {links.map((link, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={link}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateLink(index, e.target.value)
                    }
                    placeholder="Ex: Gestão Full Commerce"
                  />
                </div>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => removeLink(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente StatsEditor
interface StatsEditorProps {
  stats1: Stat;
  stats2: Stat;
  onChange: (stats: { stats1?: Stat; stats2?: Stat }) => void;
}

const StatsEditor = ({ stats1, stats2, onChange }: StatsEditorProps) => {
  const updateStat = (stat: "stats1" | "stats2", field: "val" | "label", value: string) => {
    onChange({
      [stat]: { ...(stat === "stats1" ? stats1 : stats2), [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Estatísticas
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
          <h5 className="font-medium text-zinc-800 dark:text-zinc-200">
            Estatística 1
          </h5>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Valor
              </label>
              <Input
                type="text"
                value={stats1.val}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  updateStat("stats1", "val", e.target.value)
                }
                placeholder="Ex: +100M"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Rótulo
              </label>
              <Input
                type="text"
                value={stats1.label}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  updateStat("stats1", "label", e.target.value)
                }
                placeholder="Ex: Gerenciados"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
          <h5 className="font-medium text-zinc-800 dark:text-zinc-200">
            Estatística 2
          </h5>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Valor
              </label>
              <Input
                type="text"
                value={stats2.val}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  updateStat("stats2", "val", e.target.value)
                }
                placeholder="Ex: Top 1%"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Rótulo
              </label>
              <Input
                type="text"
                value={stats2.label}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  updateStat("stats2", "label", e.target.value)
                }
                placeholder="Ex: Performance"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FooterPage() {
  const [files, setFiles] = useState<SectionFiles>({
    ecommerce: null,
    marketing: null,
    sobre: null
  });
  
  const {
    data: footerData,
    setData: setFooterData,
    updateNested,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload
  } = useJsonManagement<FooterData>({
    apiPath: "/api/tegbe-institucional/json/footer",
    defaultData: defaultFooterData,
  });

  const [expandedSections, setExpandedSections] = useState({
    ecommerce: false,
    marketing: true,
    sobre: false
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });

  // Calcular campos completos
  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    // Verificar cada seção
    const sections = ["ecommerce", "marketing", "sobre"] as const;
    
    sections.forEach(section => {
      const sectionData = footerData?.[section];
      if (sectionData && 
          sectionData.badgeImage.trim() !== "" && 
          sectionData.badgeTitle.trim() !== "" && 
          sectionData.badgeDesc.trim() !== "" &&
          sectionData.stats1.val.trim() !== "" &&
          sectionData.stats1.label.trim() !== "" &&
          sectionData.stats2.val.trim() !== "" &&
          sectionData.stats2.label.trim() !== "" &&
          sectionData.columnTitle.trim() !== "" &&
          sectionData.links.length > 0 &&
          sectionData.email.trim() !== "" &&
          sectionData.desc.trim() !== "") {
        count++;
      }
    });
    
    return count;
  }, [footerData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 3;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSectionChange = (section: "ecommerce" | "marketing" | "sobre", path: string, value: any) => {
    updateNested(`${section}.${path}`, value);
  };

  const handleStatsChange = (section: "ecommerce" | "marketing" | "sobre", stats: { stats1?: Stat; stats2?: Stat }) => {
    if (stats.stats1) {
      updateNested(`${section}.stats1`, stats.stats1);
    }
    if (stats.stats2) {
      updateNested(`${section}.stats2`, stats.stats2);
    }
  };

  const handleLinksChange = (section: "ecommerce" | "marketing" | "sobre", links: string[]) => {
    updateNested(`${section}.links`, links);
  };

  const handleFileChange = (
    section: "ecommerce" | "marketing" | "sobre",
    file: File | null
  ) => {
    setFiles(prev => ({
      ...prev,
      [section]: file
    }));
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    
    // Adicionar os dados JSON
    fd.append("values", JSON.stringify(footerData));

    // Processar arquivos de imagem para cada seção
    Object.entries(files).forEach(([section, file]) => {
      if (file) {
        fd.append(`file:${section}.badgeImage`, file, file.name);
      }
    });

    try {
      // Enviar tudo para o mesmo endpoint
      await save(fd);
      await reload();
      
      // Limpar os arquivos locais após o envio
      setFiles({ ecommerce: null, marketing: null, sobre: null });
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
    }
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODAS AS SEÇÕES DO RODAPÉ"
    });
  };

  const confirmDelete = async () => {
    await fetch("/api/tegbe-institucional/json/footer", {
      method: "DELETE",
    });

    setFooterData(defaultFooterData);
    setFiles({ ecommerce: null, marketing: null, sobre: null });

    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: "all", 
      title: "" 
    });
  };

  const renderSection = (sectionKey: "ecommerce" | "marketing" | "sobre") => {
    const section = footerData?.[sectionKey];
    const Icon = sectionIcons[sectionKey];
    const title = sectionTitles[sectionKey];

    if (!section) return null;

    return (
      <div className="space-y-4">
        <SectionHeader
          title={`Seção ${title}`}
          section={sectionKey}
          icon={Icon}
          isExpanded={expandedSections[sectionKey]}
          onToggle={toggleSection}
        />

        <AnimatePresence>
          {expandedSections[sectionKey] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Card className="p-6 space-y-8">
                {/* Badge Image */}
                <ImageUpload
                  section={sectionKey}
                  currentImage={section.badgeImage}
                  selectedFile={files[sectionKey]}
                  onFileChange={handleFileChange}
                />
                
                {/* Badge Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Título do Badge
                    </label>
                    <Input
                      type="text"
                      value={section.badgeTitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleSectionChange(sectionKey, "badgeTitle", e.target.value)
                      }
                      placeholder="Ex: Consultoria Certificada"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Email de Contato
                    </label>
                    <Input
                      type="email"
                      value={section.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleSectionChange(sectionKey, "email", e.target.value)
                      }
                      placeholder="Ex: contato@tegbe.com.br"
                    />
                  </div>
                </div>
                
                {/* Badge Description */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Descrição do Badge
                  </label>
                  <textarea
                    value={section.badgeDesc}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleSectionChange(sectionKey, "badgeDesc", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[80px]"
                    rows={3}
                    placeholder="Descreva o badge/selo..."
                  />
                </div>
                
                {/* Statistics */}
                <StatsEditor
                  stats1={section.stats1}
                  stats2={section.stats2}
                  onChange={(stats) => handleStatsChange(sectionKey, stats)}
                />
                
                {/* Column Title & Links */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Título da Coluna
                    </label>
                    <Input
                      type="text"
                      value={section.columnTitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleSectionChange(sectionKey, "columnTitle", e.target.value)
                      }
                      placeholder="Ex: Expertise"
                    />
                  </div>
                  
                  <LinksEditor
                    links={section.links}
                    onChange={(links) => handleLinksChange(sectionKey, links)}
                  />
                </div>
                
                {/* Description */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Descrição Geral
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Descrição Completa
                    </label>
                    <textarea
                      value={section.desc}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleSectionChange(sectionKey, "desc", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[120px]"
                      rows={4}
                      placeholder="Descreva esta solução/área em detalhes..."
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={Store}
      title="Rodapé - Seções"
      description="Gerencie as seções de E-commerce, Marketing e Institucional do rodapé"
      exists={!!exists}
      itemName="Rodapé"
    >
      <form onSubmit={handleSubmitWrapper} className="space-y-6 pb-32">
        {/* Seção E-commerce */}
        {renderSection("ecommerce")}

        {/* Seção Marketing */}
        {renderSection("marketing")}

        {/* Seção Sobre */}
        {renderSection("sobre")}

        {/* Fixed Action Bar */}
        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          isAddDisabled={false}
          isSaving={loading}
          exists={!!exists}
          completeCount={completeCount}
          totalCount={totalCount}
          itemName="Rodapé"
          icon={Store}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={3}
        itemName="Rodapé"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}