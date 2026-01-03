/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Palette, Layout, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import ColorPicker from "@/components/ColorPicker";
import { ImageUpload } from "@/components/Manage/ImageUpload";
import { AnimatePresence } from "framer-motion";

interface ThemeColors {
  primary: string; // ex: "text-[#FFCC00]"
  hoverText: string; // ex: "hover:text-[#FFCC00]"
  decoration: string; // ex: "decoration-[#FFCC00]"
  bgHover: string; // ex: "hover:bg-[#FFCC00]"
  borderHover: string; // ex: "hover:border-[#FFCC00]/30"
  glowGradient: string; // ex: "from-[#FFCC00]/0 via-[#FFCC00]/5 to-[#FFCC00]/0"
  glowAmbient: string; // ex: "bg-[#FFCC00]/5"
  iconBg: string; // ex: "text-[#FFCC00]"
  iconHoverText: string; // ex: "group-hover:text-black"
  iconHoverBg: string; // ex: "group-hover:bg-[#FFCC00]"
  topBorder: string; // ex: "border-white/10"
}

interface FooterContent {
  badgeImage: string;
  badgeTitle: string;
  badgeDesc: string;
  stats1: {
    val: string;
    label: string;
  };
  stats2: {
    val: string;
    label: string;
  };
  columnTitle: string;
  links: string[]; // Array de 4 links
  email: string;
  desc: string;
  file?: File | null;
}

interface FooterData {
  id?: string;
  theme: {
    ecommerce: ThemeColors;
    marketing: ThemeColors;
    sobre: ThemeColors;
  };
  content: {
    ecommerce: FooterContent;
    marketing: FooterContent;
    sobre: FooterContent;
  };
  defaultTheme: "ecommerce" | "marketing" | "sobre";
  showThemeSwitcher: boolean;
}

const defaultFooterData: FooterData = {
  theme: {
    ecommerce: {
      primary: "text-[#FFCC00]",
      hoverText: "hover:text-[#FFCC00]",
      decoration: "decoration-[#FFCC00]",
      bgHover: "hover:bg-[#FFCC00]",
      borderHover: "hover:border-[#FFCC00]/30",
      glowGradient: "from-[#FFCC00]/0 via-[#FFCC00]/5 to-[#FFCC00]/0",
      glowAmbient: "bg-[#FFCC00]/5",
      iconBg: "text-[#FFCC00]",
      iconHoverText: "group-hover:text-black", 
      iconHoverBg: "group-hover:bg-[#FFCC00]",
      topBorder: "border-white/10"
    },
    marketing: {
      primary: "text-[#E31B63]",
      hoverText: "hover:text-[#E31B63]",
      decoration: "decoration-[#E31B63]",
      bgHover: "hover:bg-[#E31B63]",
      borderHover: "hover:border-[#E31B63]/30",
      glowGradient: "from-[#E31B63]/0 via-[#E31B63]/10 to-[#E31B63]/0",
      glowAmbient: "bg-[#E31B63]/10",
      iconBg: "text-[#E31B63]",
      iconHoverText: "group-hover:text-white", 
      iconHoverBg: "group-hover:bg-[#E31B63]",
      topBorder: "border-rose-900/20"
    },
    sobre: {
      primary: "text-[#0071E3]",
      hoverText: "hover:text-[#0071E3]",
      decoration: "decoration-[#0071E3]",
      bgHover: "hover:bg-[#0071E3]",
      borderHover: "hover:border-[#0071E3]/30",
      glowGradient: "from-[#0071E3]/0 via-[#0071E3]/10 to-[#0071E3]/0",
      glowAmbient: "bg-[#0071E3]/10",
      iconBg: "text-[#0071E3]",
      iconHoverText: "group-hover:text-white",
      iconHoverBg: "group-hover:bg-[#0071E3]",
      topBorder: "border-blue-900/20"
    }
  },
  content: {
    ecommerce: {
      badgeImage: "/logo-consultoria.svg",
      badgeTitle: "Consultoria Certificada",
      badgeDesc: "Selo oficial de qualidade e segurança Mercado Livre.",
      stats1: { val: "+100M", label: "Gerenciados" },
      stats2: { val: "Top 1%", label: "Performance" },
      columnTitle: "Expertise",
      links: ["Gestão Full Commerce", "Consultoria Oficial", "Ads & Performance", "Design & Branding"],
      email: "contato@tegbe.com.br",
      desc: "Aceleradora de E-commerce. Transformamos operação técnica em lucro real através de dados e estratégia.",
      file: null
    },
    marketing: {
      badgeImage: "/logo-kommo.svg", 
      badgeTitle: "Kommo Gold Partner",
      badgeDesc: "Especialistas certificados em CRM e Automação.",
      stats1: { val: "+40", label: "Implantações" },
      stats2: { val: "24/7", label: "Suporte IA" },
      columnTitle: "Soluções",
      links: ["Implementação CRM", "Tráfego de Elite", "Automação com IA", "Business Intelligence"],
      email: "comercial@tegbe.com.br",
      desc: "Engenharia de Vendas. Transformamos tráfego em receita previsível através de CRM, Dados e IA.",
      file: null
    },
    sobre: {
      badgeImage: "/logo-tegbe-simbolo.svg",
      badgeTitle: "Cultura de Excelência",
      badgeDesc: "Growth Partners focados em Equity e Governança.",
      stats1: { val: "2020", label: "Fundação" },
      stats2: { val: "Senior", label: "Equipe" },
      columnTitle: "Institucional",
      links: ["Nossa História", "Manifesto", "Carreiras", "Imprensa"],
      email: "institucional@tegbe.com.br",
      desc: "Não somos uma agência. Somos o braço direito estratégico que constrói o futuro da sua operação.",
      file: null
    }
  },
  defaultTheme: "ecommerce",
  showThemeSwitcher: true,
};

// Função para extrair hex de classes Tailwind
const extractHexFromTailwind = (tailwindClass: string): string => {
  if (!tailwindClass) return "#000000";

  // Se já for hexadecimal
  if (tailwindClass.startsWith("#")) {
    return tailwindClass;
  }

  // Extrair hex de formatos text-[#HEX], bg-[#HEX], etc.
  const hexMatch = tailwindClass.match(/#([0-9A-Fa-f]{3,8})/);
  if (hexMatch) {
    return `#${hexMatch[1]}`;
  }

  // Extrair RGB de formatos rgba
  const rgbaMatch = tailwindClass.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10);
    const g = parseInt(rgbaMatch[2], 10);
    const b = parseInt(rgbaMatch[3], 10);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  // Mapear cores básicas do Tailwind
  if (tailwindClass.includes("white")) return "#FFFFFF";
  if (tailwindClass.includes("black")) return "#000000";
  if (tailwindClass.includes("rose-900")) return "#881337";
  if (tailwindClass.includes("blue-900")) return "#1e3a8a";

  return "#000000";
};

// Função para converter hex para Tailwind classes apropriadas
const hexToTailwind = (property: string, hex: string): string => {
  // Se já for uma classe Tailwind, retorna como está
  if (hex.startsWith("text-") || hex.startsWith("bg-") || hex.startsWith("border-") || 
      hex.startsWith("hover:") || hex.startsWith("decoration-") || hex.startsWith("from-") ||
      hex.startsWith("via-") || hex.startsWith("to-") || hex.startsWith("group-hover:")) {
    return hex;
  }

  // Se for hexadecimal, converte para Tailwind baseado na propriedade
  const hexColor = hex.startsWith("#") ? hex : `#${hex}`;
  
  switch (property) {
    case "primary":
    case "iconBg":
      return `text-[${hexColor}]`;
    case "hoverText":
      return `hover:text-[${hexColor}]`;
    case "decoration":
      return `decoration-[${hexColor}]`;
    case "bgHover":
      return `hover:bg-[${hexColor}]`;
    case "borderHover":
      return `hover:border-[${hexColor}]/30`;
    case "iconHoverBg":
      return `group-hover:bg-[${hexColor}]`;
    case "glowGradient":
      return `from-[${hexColor}]/0 via-[${hexColor}]/10 to-[${hexColor}]/0`;
    case "glowAmbient":
      return `bg-[${hexColor}]/10`;
    case "topBorder":
      // Para topBorder, mantemos as classes originais ou criamos uma nova
      if (hexColor === "#FFFFFF") return "border-white/10";
      if (hexColor === "#E31B63") return "border-rose-900/20";
      if (hexColor === "#0071E3") return "border-blue-900/20";
      return `border-[${hexColor}]/20`;
    default:
      return hex;
  }
};

export default function FooterThemePage() {
  const [footerData, setFooterData] = useState<FooterData>(defaultFooterData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    themes: true,
    content: false,
    config: false,
  });
  const [activeThemeTab, setActiveThemeTab] = useState<"ecommerce" | "marketing" | "sobre">("ecommerce");
  const [activeContentTab, setActiveContentTab] = useState<"ecommerce" | "marketing" | "sobre">("ecommerce");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "single" as "single" | "all",
    title: "",
  });
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const apiBase = "/api/tegbe-institucional/form";
  const type = "footer";

  // Calcular campos completos
  const completeCount = 5;
  const totalCount = 5;
  const exists = !!footerData.id;
  const canAddNewItem = true;
  const isLimitReached = false;

  const fetchExistingData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/${type}`);

      if (res.ok) {
        const data = await res.json();
        if (data && data.values && data.values[0]) {
          const fetchedData = data.values[0];
          
          // Transformar dados do backend
          const transformedData: FooterData = {
            id: data.id,
            theme: {
              ecommerce: {
                primary: fetchedData.theme?.ecommerce?.primary || defaultFooterData.theme.ecommerce.primary,
                hoverText: fetchedData.theme?.ecommerce?.hoverText || defaultFooterData.theme.ecommerce.hoverText,
                decoration: fetchedData.theme?.ecommerce?.decoration || defaultFooterData.theme.ecommerce.decoration,
                bgHover: fetchedData.theme?.ecommerce?.bgHover || defaultFooterData.theme.ecommerce.bgHover,
                borderHover: fetchedData.theme?.ecommerce?.borderHover || defaultFooterData.theme.ecommerce.borderHover,
                glowGradient: fetchedData.theme?.ecommerce?.glowGradient || defaultFooterData.theme.ecommerce.glowGradient,
                glowAmbient: fetchedData.theme?.ecommerce?.glowAmbient || defaultFooterData.theme.ecommerce.glowAmbient,
                iconBg: fetchedData.theme?.ecommerce?.iconBg || defaultFooterData.theme.ecommerce.iconBg,
                iconHoverText: fetchedData.theme?.ecommerce?.iconHoverText || defaultFooterData.theme.ecommerce.iconHoverText,
                iconHoverBg: fetchedData.theme?.ecommerce?.iconHoverBg || defaultFooterData.theme.ecommerce.iconHoverBg,
                topBorder: fetchedData.theme?.ecommerce?.topBorder || defaultFooterData.theme.ecommerce.topBorder,
              },
              marketing: {
                primary: fetchedData.theme?.marketing?.primary || defaultFooterData.theme.marketing.primary,
                hoverText: fetchedData.theme?.marketing?.hoverText || defaultFooterData.theme.marketing.hoverText,
                decoration: fetchedData.theme?.marketing?.decoration || defaultFooterData.theme.marketing.decoration,
                bgHover: fetchedData.theme?.marketing?.bgHover || defaultFooterData.theme.marketing.bgHover,
                borderHover: fetchedData.theme?.marketing?.borderHover || defaultFooterData.theme.marketing.borderHover,
                glowGradient: fetchedData.theme?.marketing?.glowGradient || defaultFooterData.theme.marketing.glowGradient,
                glowAmbient: fetchedData.theme?.marketing?.glowAmbient || defaultFooterData.theme.marketing.glowAmbient,
                iconBg: fetchedData.theme?.marketing?.iconBg || defaultFooterData.theme.marketing.iconBg,
                iconHoverText: fetchedData.theme?.marketing?.iconHoverText || defaultFooterData.theme.marketing.iconHoverText,
                iconHoverBg: fetchedData.theme?.marketing?.iconHoverBg || defaultFooterData.theme.marketing.iconHoverBg,
                topBorder: fetchedData.theme?.marketing?.topBorder || defaultFooterData.theme.marketing.topBorder,
              },
              sobre: {
                primary: fetchedData.theme?.sobre?.primary || defaultFooterData.theme.sobre.primary,
                hoverText: fetchedData.theme?.sobre?.hoverText || defaultFooterData.theme.sobre.hoverText,
                decoration: fetchedData.theme?.sobre?.decoration || defaultFooterData.theme.sobre.decoration,
                bgHover: fetchedData.theme?.sobre?.bgHover || defaultFooterData.theme.sobre.bgHover,
                borderHover: fetchedData.theme?.sobre?.borderHover || defaultFooterData.theme.sobre.borderHover,
                glowGradient: fetchedData.theme?.sobre?.glowGradient || defaultFooterData.theme.sobre.glowGradient,
                glowAmbient: fetchedData.theme?.sobre?.glowAmbient || defaultFooterData.theme.sobre.glowAmbient,
                iconBg: fetchedData.theme?.sobre?.iconBg || defaultFooterData.theme.sobre.iconBg,
                iconHoverText: fetchedData.theme?.sobre?.iconHoverText || defaultFooterData.theme.sobre.iconHoverText,
                iconHoverBg: fetchedData.theme?.sobre?.iconHoverBg || defaultFooterData.theme.sobre.iconHoverBg,
                topBorder: fetchedData.theme?.sobre?.topBorder || defaultFooterData.theme.sobre.topBorder,
              },
            },
            content: {
              ecommerce: {
                badgeImage: fetchedData.content?.ecommerce?.badgeImage || defaultFooterData.content.ecommerce.badgeImage,
                badgeTitle: fetchedData.content?.ecommerce?.badgeTitle || defaultFooterData.content.ecommerce.badgeTitle,
                badgeDesc: fetchedData.content?.ecommerce?.badgeDesc || defaultFooterData.content.ecommerce.badgeDesc,
                stats1: fetchedData.content?.ecommerce?.stats1 || defaultFooterData.content.ecommerce.stats1,
                stats2: fetchedData.content?.ecommerce?.stats2 || defaultFooterData.content.ecommerce.stats2,
                columnTitle: fetchedData.content?.ecommerce?.columnTitle || defaultFooterData.content.ecommerce.columnTitle,
                links: fetchedData.content?.ecommerce?.links || defaultFooterData.content.ecommerce.links,
                email: fetchedData.content?.ecommerce?.email || defaultFooterData.content.ecommerce.email,
                desc: fetchedData.content?.ecommerce?.desc || defaultFooterData.content.ecommerce.desc,
                file: null
              },
              marketing: {
                badgeImage: fetchedData.content?.marketing?.badgeImage || defaultFooterData.content.marketing.badgeImage,
                badgeTitle: fetchedData.content?.marketing?.badgeTitle || defaultFooterData.content.marketing.badgeTitle,
                badgeDesc: fetchedData.content?.marketing?.badgeDesc || defaultFooterData.content.marketing.badgeDesc,
                stats1: fetchedData.content?.marketing?.stats1 || defaultFooterData.content.marketing.stats1,
                stats2: fetchedData.content?.marketing?.stats2 || defaultFooterData.content.marketing.stats2,
                columnTitle: fetchedData.content?.marketing?.columnTitle || defaultFooterData.content.marketing.columnTitle,
                links: fetchedData.content?.marketing?.links || defaultFooterData.content.marketing.links,
                email: fetchedData.content?.marketing?.email || defaultFooterData.content.marketing.email,
                desc: fetchedData.content?.marketing?.desc || defaultFooterData.content.marketing.desc,
                file: null
              },
              sobre: {
                badgeImage: fetchedData.content?.sobre?.badgeImage || defaultFooterData.content.sobre.badgeImage,
                badgeTitle: fetchedData.content?.sobre?.badgeTitle || defaultFooterData.content.sobre.badgeTitle,
                badgeDesc: fetchedData.content?.sobre?.badgeDesc || defaultFooterData.content.sobre.badgeDesc,
                stats1: fetchedData.content?.sobre?.stats1 || defaultFooterData.content.sobre.stats1,
                stats2: fetchedData.content?.sobre?.stats2 || defaultFooterData.content.sobre.stats2,
                columnTitle: fetchedData.content?.sobre?.columnTitle || defaultFooterData.content.sobre.columnTitle,
                links: fetchedData.content?.sobre?.links || defaultFooterData.content.sobre.links,
                email: fetchedData.content?.sobre?.email || defaultFooterData.content.sobre.email,
                desc: fetchedData.content?.sobre?.desc || defaultFooterData.content.sobre.desc,
                file: null
              },
            },
            defaultTheme: fetchedData.defaultTheme || "ecommerce",
            showThemeSwitcher: fetchedData.showThemeSwitcher !== false,
          };

          setFooterData(transformedData);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setErrorMsg("Erro ao carregar dados do servidor");
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchExistingData();
  }, [fetchExistingData]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    const keys = path.split(".");
    setFooterData((prev) => {
      const newData = { ...prev };
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleThemeChange = (
    theme: "ecommerce" | "marketing" | "sobre",
    property: keyof ThemeColors,
    hexColor: string
  ) => {
    const newThemeData = { ...footerData.theme[theme], [property]: hexColor };
    handleChange(`theme.${theme}`, newThemeData);
  };

  const handleContentChange = (
    theme: "ecommerce" | "marketing" | "sobre",
    property: string,
    value: any
  ) => {
    if (property === "stats1" || property === "stats2") {
      const currentStats = footerData.content[theme][property as keyof FooterContent] as { val: string; label: string };
      const newStats = { ...currentStats, ...value };
      handleChange(`content.${theme}.${property}`, newStats);
    } else if (property === "links") {
      // Para links, precisamos atualizar o array específico
      if (typeof value === "object" && value.index !== undefined) {
        const newLinks = [...footerData.content[theme].links];
        newLinks[value.index] = value.value;
        handleChange(`content.${theme}.links`, newLinks);
      } else if (Array.isArray(value)) {
        // Se for um array completo
        handleChange(`content.${theme}.links`, value);
      }
    } else {
      handleChange(`content.${theme}.${property}`, value);
    }
  };

  const handleFileChange = (theme: "ecommerce" | "marketing" | "sobre", file: File | null) => {
    const newContent = { ...footerData.content[theme], file };
    handleChange(`content.${theme}`, newContent);
  };

  const getImageUrl = (theme: "ecommerce" | "marketing" | "sobre"): string => {
    const content = footerData.content[theme];
    if (content.file) {
      return URL.createObjectURL(content.file);
    }
    return content.badgeImage || "";
  };

  const prepareDataForApi = (): FooterData => {
    const dataForApi = { ...footerData };
    
    // Converter cores hex para Tailwind classes no tema
    const themes: ("ecommerce" | "marketing" | "sobre")[] = ["ecommerce", "marketing", "sobre"];
    
    themes.forEach(theme => {
      Object.keys(dataForApi.theme[theme]).forEach((property) => {
        const prop = property as keyof ThemeColors;
        const hexColor = extractHexFromTailwind(dataForApi.theme[theme][prop]);
        dataForApi.theme[theme][prop] = hexToTailwind(prop, hexColor);
      });
    });
    
    return dataForApi;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const dataToSend = prepareDataForApi();
      const fd = new FormData();

      fd.append("type", type);
      fd.append("subtype", "tegbe-institucional");
      
      // Remover arquivos do objeto antes de serializar
      const dataWithoutFiles = {
        ...dataToSend,
        content: {
          ecommerce: {
            ...dataToSend.content.ecommerce,
            file: undefined
          },
          marketing: {
            ...dataToSend.content.marketing,
            file: undefined
          },
          sobre: {
            ...dataToSend.content.sobre,
            file: undefined
          }
        }
      };

      fd.append("values", JSON.stringify([dataWithoutFiles]));

      if (dataToSend.id) {
        fd.append("id", dataToSend.id);
      }

      // Adicionar arquivos de imagem separadamente
      const themes: ("ecommerce" | "marketing" | "sobre")[] = ["ecommerce", "marketing", "sobre"];
      themes.forEach((theme, index) => {
        const file = dataToSend.content[theme].file;
        if (file) {
          fd.append(`file${index}`, file);
        }
      });

      const method = dataToSend.id ? "PUT" : "POST";

      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || "Erro ao salvar configurações do footer"
        );
      }

      const saved = await res.json();

      if (saved?.values?.[0]) {
        const savedData = saved.values[0];
        
        // Atualizar estado com dados salvos
        const transformedData: FooterData = {
          id: saved.id,
          theme: {
            ecommerce: savedData.theme?.ecommerce || defaultFooterData.theme.ecommerce,
            marketing: savedData.theme?.marketing || defaultFooterData.theme.marketing,
            sobre: savedData.theme?.sobre || defaultFooterData.theme.sobre,
          },
          content: {
            ecommerce: {
              ...(savedData.content?.ecommerce || defaultFooterData.content.ecommerce),
              file: null
            },
            marketing: {
              ...(savedData.content?.marketing || defaultFooterData.content.marketing),
              file: null
            },
            sobre: {
              ...(savedData.content?.sobre || defaultFooterData.content.sobre),
              file: null
            },
          },
          defaultTheme: savedData.defaultTheme || "ecommerce",
          showThemeSwitcher: savedData.showThemeSwitcher !== false,
        };

        setFooterData(transformedData);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWrapper = () => {
    handleSubmit();
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODAS AS CONFIGURAÇÕES",
    });
  };

  const confirmDelete = async () => {
    if (!footerData.id) return;

    try {
      const res = await fetch(`${apiBase}/${type}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: footerData.id }),
      });

      if (res.ok) {
        setFooterData(defaultFooterData);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error("Erro ao deletar");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao deletar");
    } finally {
      closeDeleteModal();
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: "single", title: "" });
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
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          {title}
        </h3>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      ) : (
        <ChevronDown className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      )}
    </button>
  );

  const ThemeTab = ({
    themeKey,
    label,
    activeTab,
    setActiveTab,
  }: {
    themeKey: "ecommerce" | "marketing" | "sobre";
    label: string;
    activeTab: "ecommerce" | "marketing" | "sobre";
    setActiveTab: (tab: "ecommerce" | "marketing" | "sobre") => void;
  }) => (
    <button
      type="button"
      onClick={() => setActiveTab(themeKey)}
      className={`px-4 py-2 font-medium rounded-lg transition-colors ${
        activeTab === themeKey
          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      }`}
    >
      {label}
    </button>
  );

  const ThemePropertyInput = ({
    theme,
    property,
    label,
    description,
  }: {
    theme: "ecommerce" | "marketing" | "sobre";
    property: keyof ThemeColors;
    label: string;
    description: string;
  }) => {
    const value = extractHexFromTailwind(footerData.theme[theme][property]);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
        </div>
        <p className="text-xs text-zinc-500">{description}</p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleThemeChange(theme, property, e.target.value)
            }
            placeholder="#000000"
            className="flex-1 font-mono"
          />
          <ColorPicker
            color={value}
            onChange={(color: string) =>
              handleThemeChange(theme, property, color)
            }
          />
        </div>
      </div>
    );
  };

  const ContentInput = ({
    theme,
    property,
    label,
    description,
    type = "text",
    isTextarea = false,
    rows = 3,
  }: {
    theme: "ecommerce" | "marketing" | "sobre";
    property: keyof FooterContent;
    label: string;
    description: string;
    type?: string;
    isTextarea?: boolean;
    rows?: number;
  }) => {
    const content = footerData.content[theme];
    const value = content[property];

    if (property === "stats1" || property === "stats2") {
      const stats = value as { val: string; label: string };
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {label} - Valor
            </label>
            <Input
              type="text"
              value={stats.val}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleContentChange(theme, property, { val: e.target.value })
              }
              placeholder="Ex: +100M"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {label} - Label
            </label>
            <Input
              type="text"
              value={stats.label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleContentChange(theme, property, { label: e.target.value })
              }
              placeholder="Ex: Gerenciados"
            />
          </div>
          <p className="text-xs text-zinc-500">{description}</p>
        </div>
      );
    }

    if (property === "links") {
      const links = value as string[];
      return (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
          <p className="text-xs text-zinc-500">{description}</p>
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="space-y-2">
              <label className="text-sm text-zinc-600 dark:text-zinc-400">
                Link {index + 1}
              </label>
              <Input
                type="text"
                value={links[index] || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleContentChange(theme, "links", {
                    index,
                    value: e.target.value,
                  })
                }
                placeholder={`Texto do link ${index + 1}`}
              />
            </div>
          ))}
        </div>
      );
    }

    if (property === "badgeImage") {
      const imageUrl = getImageUrl(theme);
      const hasImage = !!content.badgeImage || !!content.file;
      
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
          <p className="text-xs text-zinc-500">{description}</p>
          <Input
            type="text"
            value={content.badgeImage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleContentChange(theme, property, e.target.value)
            }
            placeholder="URL da imagem do badge"
          />
          <div className="mt-4">
            <ImageUpload
              imageUrl={imageUrl}
              hasImage={hasImage}
              file={content.file || null}
              onFileChange={(file) => handleFileChange(theme, file)}
              onExpand={setExpandedImage}
              label="Upload de Imagem do Badge"
              altText={`Badge ${theme}`}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
        <p className="text-xs text-zinc-500">{description}</p>
        {isTextarea ? (
          <textarea
            value={value as string}
            onChange={(e) => handleContentChange(theme, property, e.target.value)}
            rows={rows}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Digite o ${label.toLowerCase()}...`}
          />
        ) : (
          <Input
            type={type}
            value={value as string}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleContentChange(theme, property, e.target.value)
            }
            placeholder={`Digite o ${label.toLowerCase()}...`}
          />
        )}
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={Layout}
      title="Personalização do Footer"
      description="Configure os temas e conteúdo do rodapé do site"
      exists={exists}
      itemName="Footer Theme"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Temas Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Configuração dos Temas"
            section="themes"
            icon={Palette}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.themes ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6">
              <div className="space-y-6">
                {/* Tabs de Temas */}
                <div className="flex gap-2">
                  <ThemeTab
                    themeKey="ecommerce"
                    label="E-commerce"
                    activeTab={activeThemeTab}
                    setActiveTab={setActiveThemeTab}
                  />
                  <ThemeTab
                    themeKey="marketing"
                    label="Marketing"
                    activeTab={activeThemeTab}
                    setActiveTab={setActiveThemeTab}
                  />
                  <ThemeTab
                    themeKey="sobre"
                    label="Sobre"
                    activeTab={activeThemeTab}
                    setActiveTab={setActiveThemeTab}
                  />
                </div>

                {/* Propriedades do Tema Ativo */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ThemePropertyInput
                      theme={activeThemeTab}
                      property="primary"
                      label="Cor Primária (Texto)"
                      description="Cor principal para texto"
                    />

                    <ThemePropertyInput
                      theme={activeThemeTab}
                      property="hoverText"
                      label="Texto no Hover"
                      description="Cor do texto no estado hover"
                    />

                    <ThemePropertyInput
                      theme={activeThemeTab}
                      property="decoration"
                      label="Decoração"
                      description="Cor para sublinhados e decorações"
                    />

                    <ThemePropertyInput
                      theme={activeThemeTab}
                      property="bgHover"
                      label="Background no Hover"
                      description="Cor de fundo no estado hover"
                    />

                    <ThemePropertyInput
                      theme={activeThemeTab}
                      property="borderHover"
                      label="Borda no Hover"
                      description="Cor da borda no estado hover (com opacidade)"
                    />

                    <ThemePropertyInput
                      theme={activeThemeTab}
                      property="iconBg"
                      label="Ícone Background"
                      description="Cor para ícones"
                    />

                    <ThemePropertyInput
                      theme={activeThemeTab}
                      property="iconHoverBg"
                      label="Ícone Background no Hover"
                      description="Cor de fundo do ícone no estado hover"
                    />

                    <ThemePropertyInput
                      theme={activeThemeTab}
                      property="iconHoverText"
                      label="Ícone Texto no Hover"
                      description="Cor do texto do ícone no estado hover"
                    />

                    <ThemePropertyInput
                      theme={activeThemeTab}
                      property="glowGradient"
                      label="Gradiente Glow"
                      description="Cores do gradiente para efeitos de brilho"
                    />

                    <ThemePropertyInput
                      theme={activeThemeTab}
                      property="glowAmbient"
                      label="Glow Ambient"
                      description="Cor do brilho ambiental (com opacidade)"
                    />

                    <ThemePropertyInput
                      theme={activeThemeTab}
                      property="topBorder"
                      label="Borda Superior"
                      description="Cor da borda superior do footer"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Conteúdo Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Conteúdo do Footer"
            section="content"
            icon={FileText}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.content ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6">
              <div className="space-y-6">
                {/* Tabs de Conteúdo */}
                <div className="flex gap-2">
                  <ThemeTab
                    themeKey="ecommerce"
                    label="E-commerce"
                    activeTab={activeContentTab}
                    setActiveTab={setActiveContentTab}
                  />
                  <ThemeTab
                    themeKey="marketing"
                    label="Marketing"
                    activeTab={activeContentTab}
                    setActiveTab={setActiveContentTab}
                  />
                  <ThemeTab
                    themeKey="sobre"
                    label="Sobre"
                    activeTab={activeContentTab}
                    setActiveTab={setActiveContentTab}
                  />
                </div>

                {/* Conteúdo do Tema Ativo */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ContentInput
                      theme={activeContentTab}
                      property="badgeImage"
                      label="Imagem do Badge"
                      description="URL ou upload da imagem do selo/certificação"
                      type="text"
                    />

                    <ContentInput
                      theme={activeContentTab}
                      property="badgeTitle"
                      label="Título do Badge"
                      description="Título do selo/certificação"
                    />

                    <div className="md:col-span-2">
                      <ContentInput
                        theme={activeContentTab}
                        property="badgeDesc"
                        label="Descrição do Badge"
                        description="Descrição detalhada do selo"
                        isTextarea={true}
                        rows={2}
                      />
                    </div>

                    <ContentInput
                      theme={activeContentTab}
                      property="stats1"
                      label="Estatística 1"
                      description="Primeiro dado estatístico com valor e label"
                    />

                    <ContentInput
                      theme={activeContentTab}
                      property="stats2"
                      label="Estatística 2"
                      description="Segundo dado estatístico com valor e label"
                    />

                    <ContentInput
                      theme={activeContentTab}
                      property="columnTitle"
                      label="Título da Coluna"
                      description="Título da coluna de links"
                    />

                    <div className="md:col-span-2">
                      <ContentInput
                        theme={activeContentTab}
                        property="links"
                        label="Links da Coluna"
                        description="Lista de 4 links para a coluna"
                      />
                    </div>

                    <ContentInput
                      theme={activeContentTab}
                      property="email"
                      label="Email de Contato"
                      description="Email exibido no footer"
                      type="email"
                    />

                    <div className="md:col-span-2">
                      <ContentInput
                        theme={activeContentTab}
                        property="desc"
                        label="Descrição da Empresa"
                        description="Texto descritivo sobre a empresa"
                        isTextarea={true}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Fixed Action Bar */}
        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmitWrapper}
          isAddDisabled={!canAddNewItem || isLimitReached}
          isSaving={loading}
          exists={exists}
          completeCount={completeCount}
          totalCount={totalCount}
          itemName="Footer Theme"
          icon={Layout}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Footer Theme"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />

      {/* Modal de Imagem Expandida */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setExpandedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute -top-4 -right-4 p-3 rounded-full bg-red-500 hover:bg-red-600 z-10 text-white"
              >
                ×
              </button>
              <img
                src={expandedImage}
                alt="Preview expandido"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl"
                onError={(e) => {
                  console.error('Erro ao carregar imagem expandida:', expandedImage);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ManageLayout>
  );
}