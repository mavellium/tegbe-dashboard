/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { 
  ShieldCheck,
  Crown,
  Users,
  ChevronDown, 
  ChevronUp,
  Upload,
  Plus,
  Trash2,
  Eye,
  Grid3x3,
  TrendingUp,
  LucideIcon,
  Image as ImageIcon,
  MoveHorizontal
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import Image from "next/image";

interface LogoItem {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface LogoRow {
  row1: LogoItem[];
  row2: LogoItem[];
}

interface Badge {
  text: string;
  icon: string;
}

interface Stats {
  label: string;
  description: string;
  icon: string;
}

interface Footer {
  label: string;
  linkText: string;
}

interface MarketingData {
  badge: Badge;
  title: string;
  footer: string;
  layout: "marquee" | "grid" | "carousel";
  logos: LogoRow;
}

interface SobreData {
  badge: Badge;
  title: string;
  subtitle: string;
  layout: "bento-grid" | "grid" | "carousel";
  stats: Stats;
  footer: Footer;
}

interface EcosystemData {
  marketing: MarketingData;
  sobre: SobreData;
}

interface LogoFiles {
  marketing: {
    row1: { [index: number]: File | null };
    row2: { [index: number]: File | null };
  };
  sobre?: {
    row1?: { [index: number]: File | null };
    row2?: { [index: number]: File | null };
  };
}

const defaultEcosystemData: EcosystemData = {
  marketing: {
    badge: {
      text: "Ecossistema Validado",
      icon: "mdi:shield-check"
    },
    title: "Não testamos com o seu dinheiro. <br/><span class='text-transparent bg-clip-text bg-gradient-to-r from-[#FF0F43] to-[#E31B63]'>Validamos com o deles.</span>",
    footer: "Empresas que escalaram acima de 7 dígitos/ano",
    layout: "marquee",
    logos: {
      row1: [
      ],
      row2: [
      ]
    }
  },
  sobre: {
    badge: {
      text: "Hall de Clientes",
      icon: "ph:crown-simple-bold"
    },
    title: "Onde os gigantes <br/>escolhem escalar.",
    subtitle: "Não colecionamos logos. Colecionamos cases de expansão de market share.",
    layout: "bento-grid",
    stats: {
      label: "Volume Tracionado",
      description: "Soma do faturamento gerado sob nossa gestão direta nos últimos 12 meses.",
      icon: "ph:trend-up-bold"
    },
    footer: {
      label: "Ecossistema Validado",
      linkText: "Ver todos os cases"
    }
  }
};

// Ícones disponíveis para badges
const availableIcons = [
  { value: "mdi:shield-check", label: "Escudo com Check", icon: ShieldCheck },
  { value: "ph:crown-simple-bold", label: "Coroa", icon: Crown },
  { value: "lucide:users", label: "Usuários", icon: Users },
  { value: "lucide:trending-up", label: "Trending Up", icon: TrendingUp },
  { value: "lucide:shield", label: "Escudo", icon: ShieldCheck },
  { value: "lucide:award", label: "Prêmio", icon: Crown },
  { value: "lucide:star", label: "Estrela", icon: Crown },
  { value: "lucide:trophy", label: "Troféu", icon: Crown }
];

// Opções de layout
const layoutOptions = [
  { value: "marquee", label: "Marquee (Rolagem)", icon: MoveHorizontal },
  { value: "grid", label: "Grid (Grade)", icon: Grid3x3 },
  { value: "carousel", label: "Carrossel", icon: Eye },
  { value: "bento-grid", label: "Bento Grid", icon: Grid3x3 }
];

// Componente de preview de logo
const LogoPreview = ({ logoUrl, alt }: { logoUrl: string, alt: string }) => {
  if (!logoUrl || logoUrl.trim() === "") {
    return (
      <div className="w-24 h-16 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600">
        <ImageIcon className="w-8 h-8 text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="relative w-24 h-16 rounded-lg border-2 border-zinc-300 dark:border-zinc-600 overflow-hidden bg-white dark:bg-zinc-900">
      <Image
        src={logoUrl}
        alt={alt}
        fill
        className="object-contain p-1"
        sizes="96px"
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
  );
};

// Componente SectionHeader
interface SectionHeaderProps {
  title: string;
  section: "marketing" | "sobre";
  icon: LucideIcon;
  isExpanded: boolean;
  onToggle: (section: "marketing" | "sobre") => void;
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
        {section === "marketing" ? "Marketing" : "Sobre"}
      </span>
    </div>
    {isExpanded ? (
      <ChevronUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
    ) : (
      <ChevronDown className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
    )}
  </button>
);

// Componente de Logo Item Editor
interface LogoItemEditorProps {
  logo: LogoItem;
  index: number;
  row: "row1" | "row2";
  onLogoChange: (index: number, field: keyof LogoItem, value: any) => void;
  onFileChange: (row: "row1" | "row2", index: number, file: File | null) => void;
  onRemove: (index: number) => void;
  files: { [index: number]: File | null };
}

const LogoItemEditor = ({
  logo,
  index,
  row,
  onLogoChange,
  onFileChange,
  onRemove,
  files
}: LogoItemEditorProps) => {
  const getLogoUrl = (): string => {
    // Primeiro verificar se há arquivo selecionado
    if (files[index]) {
      return URL.createObjectURL(files[index]!);
    }
    
    // Verificar se há URL no estado
    const src = logo.src;
    
    if (src && typeof src === 'string' && src.trim() !== "") {
      // Se já for uma URL completa, retornar como está
      if (src.startsWith('http') || src.startsWith('//') || src.startsWith('blob:')) {
        return src;
      }
      // Se for uma URL relativa, adicionar o domínio
      return `https://mavellium.com.br${src.startsWith('/') ? '' : '/'}${src}`;
    }
    
    return "";
  };

  const logoUrl = getLogoUrl();

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <LogoPreview 
            logoUrl={logoUrl} 
            alt={logo.alt}
          />
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Logo {index + 1}
            </h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {logo.alt || "Sem descrição"}
            </p>
          </div>
        </div>
        
        <Button
          type="button"
          variant="danger"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Upload da Logo */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Imagem da Logo
          </label>
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4">
            <div className="flex flex-col items-center justify-center">
              {logoUrl ? (
                <>
                  <div className="mb-3">
                    <LogoPreview 
                      logoUrl={logoUrl} 
                      alt={logo.alt}
                    />
                  </div>
                  <div className="flex gap-2">
                    <label className="cursor-pointer px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Upload className="w-4 h-4 inline mr-1" />
                      Trocar
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          onFileChange(row, index, file);
                        }}
                      />
                    </label>
                    <Button
                      type="button"
                      onClick={() => {
                        onFileChange(row, index, null);
                        onLogoChange(index, "src", "");
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
                    <ImageIcon className="w-6 h-6 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                    Adicione o logo do cliente
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
                        onFileChange(row, index, file);
                      }}
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Campos da Logo */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Texto Alt (acessibilidade)
            </label>
            <Input
              type="text"
              value={logo.alt}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onLogoChange(index, "alt", e.target.value)
              }
              placeholder="Ex: Nome da Empresa"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Largura (px)
              </label>
              <Input
                type="number"
                value={logo.width.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onLogoChange(index, "width", parseInt(e.target.value) || 120)
                }
                placeholder="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Altura (px)
              </label>
              <Input
                type="number"
                value={logo.height.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onLogoChange(index, "height", parseInt(e.target.value) || 40)
                }
                placeholder="40"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              URL da Logo (alternativa)
            </label>
            <Input
              type="text"
              value={logo.src}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onLogoChange(index, "src", e.target.value)
              }
              placeholder="/logos/logo1.svg"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Use apenas se não for fazer upload de arquivo
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function EcosystemPage() {
  const [files, setFiles] = useState<LogoFiles>({
    marketing: {
      row1: {},
      row2: {}
    }
  });
  
  const {
    data: ecosystemData,
    setData: setEcosystemData,
    updateNested,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload
  } = useJsonManagement<EcosystemData>({
    apiPath: "/api/tegbe-institucional/json/empresas",
    defaultData: defaultEcosystemData,
  });

  const [expandedSections, setExpandedSections] = useState({
    marketing: false,
    sobre: true
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });

  // Calcular campos completos
  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    // Verificar se cada seção tem badge e título
    const sections = ["marketing", "sobre"] as const;
    
    sections.forEach(section => {
      const sectionData = ecosystemData[section];
      if (
        sectionData.badge.text.trim() !== "" &&
        sectionData.title.trim() !== ""
      ) {
        count++;
      }
    });
    
    return count;
  }, [ecosystemData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 2;
  const canAddNewItem = false;
  const isLimitReached = false;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSectionChange = (section: "marketing" | "sobre", path: string, value: any) => {
    updateNested(`${section}.${path}`, value);
  };

  const handleLogoChange = (
    section: "marketing",
    row: "row1" | "row2",
    index: number,
    field: keyof LogoItem,
    value: any
  ) => {
    updateNested(`${section}.logos.${row}.${index}.${field}`, value);
  };

  const addLogo = (section: "marketing", row: "row1" | "row2") => {
    const currentLogos = [...ecosystemData[section].logos[row]];
    const newIndex = currentLogos.length;
    
    const newLogo: LogoItem = {
      src: "",
      alt: `Cliente ${newIndex + 1}`,
      width: 120,
      height: 40
    };

    updateNested(`${section}.logos.${row}`, [...currentLogos, newLogo]);
  };

  const removeLogo = (section: "marketing", row: "row1" | "row2", index: number) => {
    const currentLogos = [...ecosystemData[section].logos[row]];
    currentLogos.splice(index, 1);
    updateNested(`${section}.logos.${row}`, currentLogos);
    
    // Limpar arquivo se existir
    setFiles(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [row]: {
          ...prev[section][row],
          [index]: null
        }
      }
    }));
  };

  const handleFileChange = (
    section: "marketing",
    row: "row1" | "row2",
    index: number,
    file: File | null
  ) => {
    setFiles(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [row]: {
          ...prev[section][row],
          [index]: file
        }
      }
    }));
  };

  const handleSubmit = async () => {
    const fd = new FormData();

    // Processar arquivos de marketing
    Object.entries(files.marketing.row1).forEach(([index, file]) => {
      if (file) {
        fd.append(`file:marketing.logos.row1.${index}.src`, file);
      }
    });

    Object.entries(files.marketing.row2).forEach(([index, file]) => {
      if (file) {
        fd.append(`file:marketing.logos.row2.${index}.src`, file);
      }
    });

    await save();
    await reload();
    setFiles({ marketing: { row1: {}, row2: {} } });
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODOS OS ECOSSISTEMAS"
    });
  };

  const confirmDelete = async () => {
    await fetch("/api/tegbe-institucional/json/ecosystem", {
      method: "DELETE",
    });

    setEcosystemData(defaultEcosystemData);
    setFiles({ marketing: { row1: {}, row2: {} } });

    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: "all", 
      title: "" 
    });
  };

  const renderMarketingSection = () => {
    const sectionData = ecosystemData.marketing;

    return (
      <div className="space-y-6">
        {/* Badge e Título */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Texto do Badge
            </label>
            <Input
              type="text"
              value={sectionData.badge.text}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSectionChange("marketing", "badge.text", e.target.value)
              }
              placeholder="Ex: Ecossistema Validado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Ícone do Badge
            </label>
            <select
              value={sectionData.badge.icon}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleSectionChange("marketing", "badge.icon", e.target.value)
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

        {/* Título com HTML */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Título (HTML permitido)
          </label>
          <textarea
            value={sectionData.title}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleSectionChange("marketing", "title", e.target.value)
            }
            placeholder="Não testamos com o seu dinheiro. <br/><span class='text-transparent bg-clip-text bg-gradient-to-r from-[#FF0F43] to-[#E31B63]'>Validamos com o deles.</span>"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[100px]"
            rows={3}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Use HTML para estilização, como spans com classes de gradiente
          </p>
        </div>

        {/* Footer e Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Texto do Footer
            </label>
            <Input
              type="text"
              value={sectionData.footer}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSectionChange("marketing", "footer", e.target.value)
              }
              placeholder="Ex: Empresas que escalaram acima de 7 dígitos/ano"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Layout de Exibição
            </label>
            <select
              value={sectionData.layout}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleSectionChange("marketing", "layout", e.target.value)
              }
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              {layoutOptions.filter(opt => opt.value !== "bento-grid").map((layout) => (
                <option key={layout.value} value={layout.value}>
                  {layout.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Logos - Row 1 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              Logos - Linha 1 ({sectionData.logos.row1.length})
            </h4>
            <Button
              type="button"
              onClick={() => addLogo("marketing", "row1")}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Logo
            </Button>
          </div>

          {sectionData.logos.row1.length === 0 ? (
            <Card className="p-8 text-center">
              <ImageIcon className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Nenhum logo adicionado
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Comece adicionando os primeiros logos de clientes
              </p>
              <Button
                type="button"
                onClick={() => addLogo("marketing", "row1")}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Adicionar Primeiro Logo
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {sectionData.logos.row1.map((logo, index) => (
                <LogoItemEditor
                  key={index}
                  logo={logo}
                  index={index}
                  row="row1"
                  onLogoChange={(idx, field, value) => 
                    handleLogoChange("marketing", "row1", idx, field, value)
                  }
                  onFileChange={(row, idx, file) => 
                    handleFileChange("marketing", row, idx, file)
                  }
                  onRemove={(idx) => removeLogo("marketing", "row1", idx)}
                  files={files.marketing.row1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Logos - Row 2 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              Logos - Linha 2 ({sectionData.logos.row2.length})
            </h4>
            <Button
              type="button"
              onClick={() => addLogo("marketing", "row2")}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Logo
            </Button>
          </div>

          {sectionData.logos.row2.length === 0 ? (
            <Card className="p-8 text-center">
              <ImageIcon className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Nenhum logo adicionado
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Adicione logos para a segunda linha
              </p>
              <Button
                type="button"
                onClick={() => addLogo("marketing", "row2")}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Adicionar Primeiro Logo
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {sectionData.logos.row2.map((logo, index) => (
                <LogoItemEditor
                  key={index}
                  logo={logo}
                  index={index}
                  row="row2"
                  onLogoChange={(idx, field, value) => 
                    handleLogoChange("marketing", "row2", idx, field, value)
                  }
                  onFileChange={(row, idx, file) => 
                    handleFileChange("marketing", row, idx, file)
                  }
                  onRemove={(idx) => removeLogo("marketing", "row2", idx)}
                  files={files.marketing.row2}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSobreSection = () => {
    const sectionData = ecosystemData.sobre;

    return (
      <div className="space-y-6">
        {/* Badge e Título */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Texto do Badge
            </label>
            <Input
              type="text"
              value={sectionData.badge.text}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSectionChange("sobre", "badge.text", e.target.value)
              }
              placeholder="Ex: Hall de Clientes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Ícone do Badge
            </label>
            <select
              value={sectionData.badge.icon}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleSectionChange("sobre", "badge.icon", e.target.value)
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

        {/* Título e Subtítulo */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Título (HTML permitido)
            </label>
            <textarea
              value={sectionData.title}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleSectionChange("sobre", "title", e.target.value)
              }
              placeholder="Onde os gigantes <br/>escolhem escalar."
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[80px]"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Subtítulo
            </label>
            <Input
              type="text"
              value={sectionData.subtitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSectionChange("sobre", "subtitle", e.target.value)
              }
              placeholder="Não colecionamos logos. Colecionamos cases de expansão de market share."
            />
          </div>
        </div>

        {/* Layout e Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Layout de Exibição
            </label>
            <select
              value={sectionData.layout}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleSectionChange("sobre", "layout", e.target.value)
              }
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              {layoutOptions.map((layout) => (
                <option key={layout.value} value={layout.value}>
                  {layout.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="space-y-4 p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
          <h4 className="font-medium text-zinc-800 dark:text-zinc-200">
            Estatísticas
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Rótulo
              </label>
              <Input
                type="text"
                value={sectionData.stats.label}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSectionChange("sobre", "stats.label", e.target.value)
                }
                placeholder="Ex: Volume Tracionado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Ícone
              </label>
              <Input
                type="text"
                value={sectionData.stats.icon}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSectionChange("sobre", "stats.icon", e.target.value)
                }
                placeholder="Ex: ph:trend-up-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Descrição
            </label>
            <textarea
              value={sectionData.stats.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleSectionChange("sobre", "stats.description", e.target.value)
              }
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[60px]"
              rows={2}
              placeholder="Soma do faturamento gerado sob nossa gestão direta nos últimos 12 meses."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-4 p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
          <h4 className="font-medium text-zinc-800 dark:text-zinc-200">
            Rodapé
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Rótulo
              </label>
              <Input
                type="text"
                value={sectionData.footer.label}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSectionChange("sobre", "footer.label", e.target.value)
                }
                placeholder="Ex: Ecossistema Validado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Texto do Link
              </label>
              <Input
                type="text"
                value={sectionData.footer.linkText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSectionChange("sobre", "footer.linkText", e.target.value)
                }
                placeholder="Ex: Ver todos os cases"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={ShieldCheck}
      title="Ecossistema Validado"
      description="Gerencie os logos de clientes e configurações das seções Marketing e Sobre"
      exists={!!exists}
      itemName="Configuração de Ecossistema"
    >
      <form onSubmit={handleSubmitWrapper} className="space-y-6 pb-32">
        {/* Seção Marketing */}
        <div className="space-y-4">
          <SectionHeader
            title="Ecossistema Validado - Marketing"
            section="marketing"
            icon={ShieldCheck}
            isExpanded={expandedSections.marketing}
            onToggle={toggleSection}
          />

          <AnimatePresence>
            {expandedSections.marketing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderMarketingSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção Sobre */}
        <div className="space-y-4">
          <SectionHeader
            title="Hall de Clientes - Sobre"
            section="sobre"
            icon={Crown}
            isExpanded={expandedSections.sobre}
            onToggle={toggleSection}
          />

          <AnimatePresence>
            {expandedSections.sobre && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderSobreSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
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
          icon={ShieldCheck}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={2}
        itemName="Configuração de Ecossistema"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}