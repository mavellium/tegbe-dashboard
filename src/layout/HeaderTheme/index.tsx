/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Palette, Layout, ChevronDown, ChevronUp, Home, ShoppingCart, Megaphone, Info, GraduationCap } from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import ColorPicker from "@/components/ColorPicker";

interface ThemeColors {
  primary: string;
  hoverBg: string;
  textOnPrimary: string;
  accentText: string;
  hoverText: string;
  border: string;
  glow: string;
  underline: string;
}

interface HeaderData {
  id?: string;
  home: ThemeColors;
  ecommerce: ThemeColors;
  marketing: ThemeColors;
  sobre: ThemeColors;
  cursos: ThemeColors;
}

interface HeaderThemePageComponentProps {
  activeTab?: "home" | "ecommerce" | "marketing" | "sobre" | "cursos";
}

const defaultHeaderData: HeaderData = {
  home: {
    primary: "#10B981",
    hoverBg: "#34D399",
    textOnPrimary: "#FFFFFF",
    accentText: "#10B981",
    hoverText: "#10B981",
    border: "#34D399",
    glow: "#10B981",
    underline: "#10B981",
  },
  ecommerce: {
    primary: "#FFCC00",
    hoverBg: "#FFDB15",
    textOnPrimary: "#000000",
    accentText: "#FFCC00",
    hoverText: "#FFCC00",
    border: "#FBBF24",
    glow: "#FFCC00",
    underline: "#FFCC00",
  },
  marketing: {
    primary: "#E31B63",
    hoverBg: "#FF1758",
    textOnPrimary: "#FFFFFF",
    accentText: "#E31B63",
    hoverText: "#E31B63",
    border: "#F472B6",
    glow: "#E31B63",
    underline: "#E31B63",
  },
  sobre: {
    primary: "#0071E3",
    hoverBg: "#2B8CFF",
    textOnPrimary: "#FFFFFF",
    accentText: "#0071E3",
    hoverText: "#0071E3",
    border: "#60A5FA",
    glow: "#0071E3",
    underline: "#0071E3",
  },
  cursos: {
    primary: "#8B5CF6",
    hoverBg: "#A78BFA",
    textOnPrimary: "#FFFFFF",
    accentText: "#8B5CF6",
    hoverText: "#8B5CF6",
    border: "#A78BFA",
    glow: "#8B5CF6",
    underline: "#8B5CF6",
  },
};

const hexToTailwind = (property: string, hex: string): string => {
  if (hex.startsWith("text-") || hex.startsWith("bg-") || hex.startsWith("border-")) {
    return hex;
  }

  switch (property) {
    case "primary":
    case "hoverBg":
    case "underline":
      return `bg-[${hex}]`;
    case "textOnPrimary":
    case "accentText":
    case "hoverText":
      return `text-[${hex}]`;
    case "border":
      return `border-[${hex}]`;
    case "glow":
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `shadow-[0_0_20px_rgba(${r},${g},${b},0.4)]`;
    default:
      return hex;
  }
};

const extractHexFromTailwind = (tailwindClass: string): string => {
  if (!tailwindClass) return "#000000";

  if (tailwindClass.startsWith("#")) {
    return tailwindClass;
  }

  const hexMatch = tailwindClass.match(/#([0-9A-Fa-f]{6})/);
  if (hexMatch) {
    return `#${hexMatch[1]}`;
  }

  const shadowMatch = tailwindClass.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
  if (shadowMatch) {
    const [_, r, g, b] = shadowMatch;
    return `#${parseInt(r).toString(16).padStart(2, "0")}${parseInt(g)
      .toString(16)
      .padStart(2, "0")}${parseInt(b).toString(16).padStart(2, "0")}`;
  }

  if (tailwindClass.includes("black")) return "#000000";
  if (tailwindClass.includes("white")) return "#FFFFFF";

  return "#000000";
};

interface ThemeTabProps {
  themeKey: "home" | "ecommerce" | "marketing" | "sobre" | "cursos";
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

const ThemeTab: React.FC<ThemeTabProps> = ({ themeKey, label, isActive, onClick, icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 font-medium rounded-lg transition-all flex items-center gap-2 ${
      isActive
        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md"
        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
    }`}
    aria-pressed={isActive}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export const HeaderThemePageComponent: React.FC<HeaderThemePageComponentProps> = ({ 
  activeTab = "home" 
}) => {
  const [headerData, setHeaderData] = useState<HeaderData>(defaultHeaderData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    themes: true,
    config: false,
  });
  const [currentActiveTab, setCurrentActiveTab] = useState<"home" | "ecommerce" | "marketing" | "sobre" | "cursos">(activeTab);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "single" as "single" | "all",
    title: "",
  });

  const apiBase = "/api/tegbe-institucional/form";
  const type = "header";

  const completeCount = 5;
  const totalCount = 5;
  const exists = !!headerData.id;
  const canAddNewItem = true;
  const isLimitReached = false;

  // Atualizar aba ativa quando a prop mudar
  useEffect(() => {
    setCurrentActiveTab(activeTab);
  }, [activeTab]);

  const fetchExistingData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/${type}`);

      if (res.ok) {
        const data = await res.json();
        if (data && data.values && data.values[0]) {
          const fetchedData = data.values[0];
          
          const transformedData: HeaderData = {
            id: data.id,
            home: {
              primary: extractHexFromTailwind(fetchedData.home?.primary || ""),
              hoverBg: extractHexFromTailwind(fetchedData.home?.hoverBg || ""),
              textOnPrimary: extractHexFromTailwind(fetchedData.home?.textOnPrimary || ""),
              accentText: extractHexFromTailwind(fetchedData.home?.accentText || ""),
              hoverText: extractHexFromTailwind(fetchedData.home?.hoverText || ""),
              border: extractHexFromTailwind(fetchedData.home?.border || ""),
              glow: extractHexFromTailwind(fetchedData.home?.glow || ""),
              underline: extractHexFromTailwind(fetchedData.home?.underline || ""),
            },
            ecommerce: {
              primary: extractHexFromTailwind(fetchedData.ecommerce?.primary || ""),
              hoverBg: extractHexFromTailwind(fetchedData.ecommerce?.hoverBg || ""),
              textOnPrimary: extractHexFromTailwind(fetchedData.ecommerce?.textOnPrimary || ""),
              accentText: extractHexFromTailwind(fetchedData.ecommerce?.accentText || ""),
              hoverText: extractHexFromTailwind(fetchedData.ecommerce?.hoverText || ""),
              border: extractHexFromTailwind(fetchedData.ecommerce?.border || ""),
              glow: extractHexFromTailwind(fetchedData.ecommerce?.glow || ""),
              underline: extractHexFromTailwind(fetchedData.ecommerce?.underline || ""),
            },
            marketing: {
              primary: extractHexFromTailwind(fetchedData.marketing?.primary || ""),
              hoverBg: extractHexFromTailwind(fetchedData.marketing?.hoverBg || ""),
              textOnPrimary: extractHexFromTailwind(fetchedData.marketing?.textOnPrimary || ""),
              accentText: extractHexFromTailwind(fetchedData.marketing?.accentText || ""),
              hoverText: extractHexFromTailwind(fetchedData.marketing?.hoverText || ""),
              border: extractHexFromTailwind(fetchedData.marketing?.border || ""),
              glow: extractHexFromTailwind(fetchedData.marketing?.glow || ""),
              underline: extractHexFromTailwind(fetchedData.marketing?.underline || ""),
            },
            sobre: {
              primary: extractHexFromTailwind(fetchedData.sobre?.primary || ""),
              hoverBg: extractHexFromTailwind(fetchedData.sobre?.hoverBg || ""),
              textOnPrimary: extractHexFromTailwind(fetchedData.sobre?.textOnPrimary || ""),
              accentText: extractHexFromTailwind(fetchedData.sobre?.accentText || ""),
              hoverText: extractHexFromTailwind(fetchedData.sobre?.hoverText || ""),
              border: extractHexFromTailwind(fetchedData.sobre?.border || ""),
              glow: extractHexFromTailwind(fetchedData.sobre?.glow || ""),
              underline: extractHexFromTailwind(fetchedData.sobre?.underline || ""),
            },
            cursos: {
              primary: extractHexFromTailwind(fetchedData.cursos?.primary || ""),
              hoverBg: extractHexFromTailwind(fetchedData.cursos?.hoverBg || ""),
              textOnPrimary: extractHexFromTailwind(fetchedData.cursos?.textOnPrimary || ""),
              accentText: extractHexFromTailwind(fetchedData.cursos?.accentText || ""),
              hoverText: extractHexFromTailwind(fetchedData.cursos?.hoverText || ""),
              border: extractHexFromTailwind(fetchedData.cursos?.border || ""),
              glow: extractHexFromTailwind(fetchedData.cursos?.glow || ""),
              underline: extractHexFromTailwind(fetchedData.cursos?.underline || ""),
            },
          };

          setHeaderData(transformedData);
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
    setHeaderData((prev) => {
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
    theme: "home" | "ecommerce" | "marketing" | "sobre" | "cursos",
    property: keyof ThemeColors,
    hexColor: string
  ) => {
    const newThemeData = { ...headerData[theme], [property]: hexColor };
    handleChange(theme, newThemeData);
  };

  const prepareDataForApi = (): HeaderData => {
    const dataForApi = { ...headerData };
    
    const themes: ("home" | "ecommerce" | "marketing" | "sobre" | "cursos")[] = 
      ["home", "ecommerce", "marketing", "sobre", "cursos"];
    
    themes.forEach(theme => {
      Object.keys(dataForApi[theme]).forEach((property) => {
        const prop = property as keyof ThemeColors;
        const hexColor = dataForApi[theme][prop];
        dataForApi[theme][prop] = hexToTailwind(prop, hexColor);
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
      fd.append("values", JSON.stringify([dataToSend]));

      if (dataToSend.id) {
        fd.append("id", dataToSend.id);
      }

      const method = dataToSend.id ? "PUT" : "POST";

      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || "Erro ao salvar configurações do header"
        );
      }

      const saved = await res.json();

      if (saved?.values?.[0]) {
        const savedData = saved.values[0];
        
        const transformedData: HeaderData = {
          id: saved.id,
          home: {
            primary: extractHexFromTailwind(savedData.home?.primary || ""),
            hoverBg: extractHexFromTailwind(savedData.home?.hoverBg || ""),
            textOnPrimary: extractHexFromTailwind(savedData.home?.textOnPrimary || ""),
            accentText: extractHexFromTailwind(savedData.home?.accentText || ""),
            hoverText: extractHexFromTailwind(savedData.home?.hoverText || ""),
            border: extractHexFromTailwind(savedData.home?.border || ""),
            glow: extractHexFromTailwind(savedData.home?.glow || ""),
            underline: extractHexFromTailwind(savedData.home?.underline || ""),
          },
          ecommerce: {
            primary: extractHexFromTailwind(savedData.ecommerce?.primary || ""),
            hoverBg: extractHexFromTailwind(savedData.ecommerce?.hoverBg || ""),
            textOnPrimary: extractHexFromTailwind(savedData.ecommerce?.textOnPrimary || ""),
            accentText: extractHexFromTailwind(savedData.ecommerce?.accentText || ""),
            hoverText: extractHexFromTailwind(savedData.ecommerce?.hoverText || ""),
            border: extractHexFromTailwind(savedData.ecommerce?.border || ""),
            glow: extractHexFromTailwind(savedData.ecommerce?.glow || ""),
            underline: extractHexFromTailwind(savedData.ecommerce?.underline || ""),
          },
          marketing: {
            primary: extractHexFromTailwind(savedData.marketing?.primary || ""),
            hoverBg: extractHexFromTailwind(savedData.marketing?.hoverBg || ""),
            textOnPrimary: extractHexFromTailwind(savedData.marketing?.textOnPrimary || ""),
            accentText: extractHexFromTailwind(savedData.marketing?.accentText || ""),
            hoverText: extractHexFromTailwind(savedData.marketing?.hoverText || ""),
            border: extractHexFromTailwind(savedData.marketing?.border || ""),
            glow: extractHexFromTailwind(savedData.marketing?.glow || ""),
            underline: extractHexFromTailwind(savedData.marketing?.underline || ""),
          },
          sobre: {
            primary: extractHexFromTailwind(savedData.sobre?.primary || ""),
            hoverBg: extractHexFromTailwind(savedData.sobre?.hoverBg || ""),
            textOnPrimary: extractHexFromTailwind(savedData.sobre?.textOnPrimary || ""),
            accentText: extractHexFromTailwind(savedData.sobre?.accentText || ""),
            hoverText: extractHexFromTailwind(savedData.sobre?.hoverText || ""),
            border: extractHexFromTailwind(savedData.sobre?.border || ""),
            glow: extractHexFromTailwind(savedData.sobre?.glow || ""),
            underline: extractHexFromTailwind(savedData.sobre?.underline || ""),
          },
          cursos: {
            primary: extractHexFromTailwind(savedData.cursos?.primary || ""),
            hoverBg: extractHexFromTailwind(savedData.cursos?.hoverBg || ""),
            textOnPrimary: extractHexFromTailwind(savedData.cursos?.textOnPrimary || ""),
            accentText: extractHexFromTailwind(savedData.cursos?.accentText || ""),
            hoverText: extractHexFromTailwind(savedData.cursos?.hoverText || ""),
            border: extractHexFromTailwind(savedData.cursos?.border || ""),
            glow: extractHexFromTailwind(savedData.cursos?.glow || ""),
            underline: extractHexFromTailwind(savedData.cursos?.underline || ""),
          },
        };

        setHeaderData(transformedData);
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
    if (!headerData.id) return;

    try {
      const res = await fetch(`${apiBase}/${type}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: headerData.id }),
      });

      if (res.ok) {
        setHeaderData(defaultHeaderData);
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

  const ThemePropertyInput = ({
    theme,
    property,
    label,
    description,
  }: {
    theme: "home" | "ecommerce" | "marketing" | "sobre" | "cursos";
    property: keyof ThemeColors;
    label: string;
    description: string;
  }) => {
    const value = headerData[theme][property];

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

  return (
    <ManageLayout
      headerIcon={Layout}
      title="Personalização do Header"
      description="Configure os temas e aparência do cabeçalho do site"
      exists={exists}
      itemName="Header Theme"
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
                    themeKey="home"
                    label="Home"
                    isActive={currentActiveTab === "home"}
                    onClick={() => setCurrentActiveTab("home")}
                    icon={<Home className="w-4 h-4" />}
                  />
                  <ThemeTab
                    themeKey="ecommerce"
                    label="Ecommerce"
                    isActive={currentActiveTab === "ecommerce"}
                    onClick={() => setCurrentActiveTab("ecommerce")}
                    icon={<ShoppingCart className="w-4 h-4" />}
                  />
                  <ThemeTab
                    themeKey="marketing"
                    label="Marketing"
                    isActive={currentActiveTab === "marketing"}
                    onClick={() => setCurrentActiveTab("marketing")}
                    icon={<Megaphone className="w-4 h-4" />}
                  />
                  <ThemeTab
                    themeKey="sobre"
                    label="Sobre"
                    isActive={currentActiveTab === "sobre"}
                    onClick={() => setCurrentActiveTab("sobre")}
                    icon={<Info className="w-4 h-4" />}
                  />
                  <ThemeTab
                    themeKey="cursos"
                    label="Cursos"
                    isActive={currentActiveTab === "cursos"}
                    onClick={() => setCurrentActiveTab("cursos")}
                    icon={<GraduationCap className="w-4 h-4" />}
                  />
                </div>

                {/* Propriedades do Tema Ativo */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ThemePropertyInput
                      theme={currentActiveTab}
                      property="primary"
                      label="Cor Primária (Background)"
                      description="Cor de fundo principal para botões e elementos destacados"
                    />

                    <ThemePropertyInput
                      theme={currentActiveTab}
                      property="hoverBg"
                      label="Background no Hover"
                      description="Cor de fundo quando o usuário passa o mouse"
                    />

                    <ThemePropertyInput
                      theme={currentActiveTab}
                      property="textOnPrimary"
                      label="Texto sobre Cor Primária"
                      description="Cor do texto quando sobre fundo primário"
                    />

                    <ThemePropertyInput
                      theme={currentActiveTab}
                      property="accentText"
                      label="Texto de Destaque"
                      description="Cor para texto destacado e links"
                    />

                    <ThemePropertyInput
                      theme={currentActiveTab}
                      property="hoverText"
                      label="Texto no Hover"
                      description="Cor do texto quando o usuário passa o mouse"
                    />

                    <ThemePropertyInput
                      theme={currentActiveTab}
                      property="border"
                      label="Cor da Borda"
                      description="Cor para bordas e separadores"
                    />

                    <ThemePropertyInput
                      theme={currentActiveTab}
                      property="glow"
                      label="Efeito Glow (Sombra)"
                      description="Cor da sombra para efeitos de destaque"
                    />

                    <ThemePropertyInput
                      theme={currentActiveTab}
                      property="underline"
                      label="Sublinhado"
                      description="Cor para sublinhados e destaques lineares"
                    />
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
          itemName="Header Theme"
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
        itemName="Header Theme"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
};