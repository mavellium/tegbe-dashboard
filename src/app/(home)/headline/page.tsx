/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Switch } from "@/components/Switch";
import { 
  Tag, 
  Palette, 
  Type, 
  Zap, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  LucideIcon
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import ColorPicker from "@/components/ColorPicker";
import IconSelector from "@/components/IconSelector";
import { useJsonManagement } from "@/hooks/useJsonManagement";

interface BadgeData {
  icone?: string;
  texto?: string;
  cor?: string;
  visivel?: boolean;
}

interface PalavraAnimada {
  texto?: string;
  cor?: string;
  ordem?: number;
}

interface TituloData {
  chamada?: string;
  palavrasAnimadas?: PalavraAnimada[];
  tituloPrincipal?: string;
  separador?: string;
}

interface BotaoData {
  texto?: string;
  link?: string;
  icone?: string;
  estilo?: string;
  visivel?: boolean;
}

interface AgendaData {
  status?: string;
  mes?: string;
  corStatus?: string;
  texto?: string;
  visivel?: boolean;
}

interface EfeitosData {
  brilhoTitulo?: string;
  spotlight?: boolean;
  grid?: boolean;
  sombraInferior?: boolean;
}

interface ConfiguracoesData {
  intervaloAnimacao?: number;
  corFundo?: string;
  corDestaque?: string;
  efeitos?: EfeitosData;
}

interface HeadlinePageData {
  badge?: BadgeData;
  titulo?: TituloData;
  subtitulo?: string;
  botao?: BotaoData;
  agenda?: AgendaData;
  configuracoes?: ConfiguracoesData;
}

interface HeadlineData {
  home?: HeadlinePageData;
  ecommerce?: HeadlinePageData;
  marketing?: HeadlinePageData;
  defaultTheme?: "home" | "ecommerce" | "marketing";
}

const defaultHeadlinePageData: HeadlinePageData = {
  badge: {
    icone: "",
    texto: "",
    cor: "#FFCC00",
    visivel: true
  },
  titulo: {
    chamada: "",
    palavrasAnimadas: [],
    tituloPrincipal: "",
    separador: ""
  },
  subtitulo: "",
  botao: {
    texto: "",
    link: "",
    icone: "",
    estilo: "gradiente-amarelo",
    visivel: true
  },
  agenda: {
    status: "aberta",
    mes: "",
    corStatus: "#22C55E",
    texto: "",
    visivel: true
  },
  configuracoes: {
    intervaloAnimacao: 2500,
    corFundo: "#020202",
    corDestaque: "#FFCC00",
    efeitos: {
      brilhoTitulo: "",
      spotlight: false,
      grid: false,
      sombraInferior: false
    }
  }
};

const defaultHeadlineData: HeadlineData = {
  home: { ...defaultHeadlinePageData },
  ecommerce: { ...defaultHeadlinePageData },
  marketing: { ...defaultHeadlinePageData },
  defaultTheme: "home"
};

const expandedSectionsDefault = {
  badge: true,
  titulo: true,
  subtitulo: true,
  botao: true,
  agenda: true,
  configuracoes: false
};

// Componente SectionHeader
interface SectionHeaderProps {
  title: string;
  section: keyof typeof expandedSectionsDefault;
  icon: LucideIcon;
  isExpanded: boolean;
  onToggle: (section: keyof typeof expandedSectionsDefault) => void;
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

// Componente ThemeTab
interface ThemeTabProps {
  themeKey: "home" | "ecommerce" | "marketing";
  label: string;
  isActive: boolean;
  onClick: (theme: "home" | "ecommerce" | "marketing") => void;
}

const ThemeTab = ({ themeKey, label, isActive, onClick }: ThemeTabProps) => (
  <button
    type="button"
    onClick={() => onClick(themeKey)}
    className={`px-4 py-2 font-medium rounded-lg transition-colors ${
      isActive
        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
    }`}
  >
    {label}
  </button>
);

// Helper function para obter dados seguros com valores padrão
const getSafeData = <T,>(data: T | undefined | null, defaultValue: T): T => {
  if (!data) return defaultValue;
  return data;
};

export default function HeadlinePage() {
  const [activeTheme, setActiveTheme] = useState<"home" | "ecommerce" | "marketing">("home");
  const [expandedSections, setExpandedSections] = useState(expandedSectionsDefault);
  
  const {
    data: headlineData,
    setData: setHeadlineData,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload,
    updateNested
  } = useJsonManagement<HeadlineData>({
    apiPath: "/api/tegbe-institucional/json/headline",
    defaultData: defaultHeadlineData,
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });

  // Helper para obter dados do tema atual de forma segura
  const getCurrentThemeData = useCallback((): HeadlinePageData => {
    const themeData = headlineData?.[activeTheme];
    return getSafeData(themeData, defaultHeadlinePageData);
  }, [headlineData, activeTheme]);

  // Calcular campos completos
  const calculateCompleteCount = useCallback(() => {
    const currentThemeData = getCurrentThemeData();
    let count = 0;
    
    // Verificar campos básicos com encadeamento opcional
    if (currentThemeData.badge?.texto?.trim() !== "") count++;
    if (currentThemeData.titulo?.tituloPrincipal?.trim() !== "") count++;
    if (currentThemeData.subtitulo?.trim() !== "") count++;
    if (currentThemeData.botao?.texto?.trim() !== "" && currentThemeData.botao?.link?.trim() !== "") count++;
    if (currentThemeData.agenda?.texto?.trim() !== "") count++;
    if (currentThemeData.configuracoes?.corFundo?.trim() !== "") count++;
    
    return count;
  }, [getCurrentThemeData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 6;
  const canAddNewItem = false;
  const isLimitReached = false;

  const toggleSection = (section: keyof typeof expandedSectionsDefault) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleThemeChange = useCallback((path: string, value: any) => {
    updateNested(`${activeTheme}.${path}`, value);
  }, [activeTheme, updateNested]);

  const handleColorChange = (path: string, color: string) => {
    const cleanColor = color.startsWith('#') ? color : `#${color}`;
    handleThemeChange(path, cleanColor);
  };

  // Funções para palavras animadas
  const handlePalavraAnimadaChange = (index: number, field: keyof PalavraAnimada, value: string) => {
    const currentThemeData = getCurrentThemeData();
    const palavras = currentThemeData.titulo?.palavrasAnimadas || [];
    const newPalavras = [...palavras];
    
    if (!newPalavras[index]) {
      newPalavras[index] = { texto: "", cor: "#FFCC00", ordem: index + 1 };
    }
    
    newPalavras[index] = { ...newPalavras[index], [field]: value };
    handleThemeChange('titulo.palavrasAnimadas', newPalavras);
  };

  const addPalavraAnimada = () => {
    const currentThemeData = getCurrentThemeData();
    const palavras = currentThemeData.titulo?.palavrasAnimadas || [];
    const newPalavras = [...palavras, {
      texto: "NOVA PALAVRA",
      cor: "#FFCC00",
      ordem: palavras.length + 1
    }];
    handleThemeChange('titulo.palavrasAnimadas', newPalavras);
  };

  const removePalavraAnimada = (index: number) => {
    const currentThemeData = getCurrentThemeData();
    const palavras = currentThemeData.titulo?.palavrasAnimadas || [];
    const newPalavras = palavras.filter((_, i) => i !== index);
    handleThemeChange('titulo.palavrasAnimadas', newPalavras);
  };

  const movePalavraAnimada = (index: number, direction: 'up' | 'down') => {
    const currentThemeData = getCurrentThemeData();
    const palavras = currentThemeData.titulo?.palavrasAnimadas || [];
    const newPalavras = [...palavras];
    
    if (direction === 'up' && index > 0) {
      [newPalavras[index], newPalavras[index - 1]] = [newPalavras[index - 1], newPalavras[index]];
    } else if (direction === 'down' && index < newPalavras.length - 1) {
      [newPalavras[index], newPalavras[index + 1]] = [newPalavras[index + 1], newPalavras[index]];
    }
    
    handleThemeChange('titulo.palavrasAnimadas', newPalavras);
  };

  const handleSubmitWrapper = () => {
    const fd = new FormData();
    fd.append("values", JSON.stringify(headlineData));
    save(fd);
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODOS OS HEADLINES"
    });
  };

  const confirmDelete = async () => {
    try {
      await fetch("/api/tegbe-institucional/json/headline", {
        method: "DELETE",
      });
      
      setHeadlineData(defaultHeadlineData);
      closeDeleteModal();
      await reload();
    } catch (err: any) {
      console.error("Erro ao deletar:", err);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: "all", 
      title: "" 
    });
  };

  const renderBadgeSection = () => {
    const currentThemeData = getCurrentThemeData();
    const badgeData = currentThemeData.badge || {};
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Badge" 
          section="badge" 
          icon={Tag}
          isExpanded={expandedSections.badge}
          onToggle={toggleSection}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.badge ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <IconSelector
                  value={badgeData.icone || ""}
                  onChange={(value) => handleThemeChange('badge.icone', value)}
                  label="Ícone do Badge"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Texto do Badge
                </label>
                <Input
                  type="text"
                  placeholder="Consultoria Oficial Mercado Livre"
                  value={badgeData.texto || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('badge.texto', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Cor do Texto (Hexadecimal)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="#FFCC00"
                    value={badgeData.cor || "#FFCC00"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleThemeChange('badge.cor', e.target.value)
                    }
                    className="font-mono"
                  />
                  <ColorPicker
                    color={badgeData.cor || "#FFCC00"}
                    onChange={(color: string) => handleColorChange('badge.cor', color)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Visibilidade
                  </label>
                  <p className="text-sm text-zinc-500">Mostrar ou esconder o badge</p>
                </div>
                <Switch
                  checked={badgeData.visivel !== false}
                  onCheckedChange={(checked: boolean) => 
                    handleThemeChange('badge.visivel', checked)
                  }
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderTituloSection = () => {
    const currentThemeData = getCurrentThemeData();
    const tituloData = currentThemeData.titulo || {};
    const palavrasAnimadas = tituloData.palavrasAnimadas || [];
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Título" 
          section="titulo" 
          icon={Type}
          isExpanded={expandedSections.titulo}
          onToggle={toggleSection}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.titulo ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Chamada Inicial
              </label>
              <Input
                type="text"
                placeholder="O seu negócio não precisa de mais"
                value={tituloData.chamada || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleThemeChange('titulo.chamada', e.target.value)
                }
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Palavras Animadas
                </label>
                <Button
                  type="button"
                  onClick={addPalavraAnimada}
                >
                  + Adicionar Palavra
                </Button>
              </div>

              <div className="space-y-3">
                {palavrasAnimadas.map((palavra, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => movePalavraAnimada(index, 'up')}
                        disabled={index === 0}
                        className="p-1 disabled:opacity-30 text-zinc-600 dark:text-zinc-400"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePalavraAnimada(index, 'down')}
                        disabled={index === palavrasAnimadas.length - 1}
                        className="p-1 disabled:opacity-30 text-zinc-600 dark:text-zinc-400"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <Input
                      type="text"
                      value={palavra.texto || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handlePalavraAnimadaChange(index, 'texto', e.target.value)
                      }
                      placeholder="Palavra animada"
                      className="flex-1"
                    />
                    
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={palavra.cor || "#FFCC00"}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          handlePalavraAnimadaChange(index, 'cor', e.target.value)
                        }
                        placeholder="#FFCC00"
                        className="w-32 font-mono"
                      />
                      <ColorPicker
                        color={palavra.cor || "#FFCC00"}
                        onChange={(color: string) => {
                          handlePalavraAnimadaChange(index, 'cor', color);
                        }}
                      />
                    </div>
                    
                    <Button
                      type="button"
                      onClick={() => removePalavraAnimada(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Título Principal (HTML permitido)
              </label>
              <textarea
                placeholder="PRECISA<br/>VENDER MAIS"
                value={tituloData.tituloPrincipal || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  handleThemeChange('titulo.tituloPrincipal', e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
              />
              <p className="text-xs text-zinc-500 mt-1">Use &lt;br/&gt; para quebras de linha</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Separador Responsivo (HTML)
              </label>
              <Input
                type="text"
                placeholder="<br className='hidden sm:block'/>"
                value={tituloData.separador || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleThemeChange('titulo.separador', e.target.value)
                }
              />
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderSubtituloSection = () => {
    const currentThemeData = getCurrentThemeData();
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Subtítulo" 
          section="subtitulo" 
          icon={Type}
          isExpanded={expandedSections.subtitulo}
          onToggle={toggleSection}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.subtitulo ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Texto do Subtítulo (HTML permitido)
              </label>
              <textarea
                placeholder="A única assessoria com selo Oficial que..."
                value={currentThemeData.subtitulo || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                  handleThemeChange('subtitulo', e.target.value)
                }
                rows={4}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Use tags HTML como &lt;strong&gt; para destaque
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderBotaoSection = () => {
    const currentThemeData = getCurrentThemeData();
    const botaoData = currentThemeData.botao || {};
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Botão de Ação" 
          section="botao" 
          icon={Zap}
          isExpanded={expandedSections.botao}
          onToggle={toggleSection}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.botao ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Texto do Botão
                </label>
                <Input
                  type="text"
                  placeholder="QUERO VENDER AGORA"
                  value={botaoData.texto || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('botao.texto', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Link
                </label>
                <Input
                  type="text"
                  placeholder="#planos"
                  value={botaoData.link || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('botao.link', e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-2">
                <IconSelector
                  value={botaoData.icone || ""}
                  onChange={(value) => handleThemeChange('botao.icone', value)}
                  label="Ícone do Botão"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Estilo do Botão
                </label>
                <Input
                  type="text"
                  placeholder="gradiente-amarelo"
                  value={botaoData.estilo || "gradiente-amarelo"}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('botao.estilo', e.target.value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Visibilidade
                  </label>
                  <p className="text-sm text-zinc-500">Mostrar ou esconder o botão</p>
                </div>
                <Switch
                  checked={botaoData.visivel !== false}
                  onCheckedChange={(checked: boolean) => 
                    handleThemeChange('botao.visivel', checked)
                  }
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderAgendaSection = () => {
    const currentThemeData = getCurrentThemeData();
    const agendaData = currentThemeData.agenda || {};
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Agenda" 
          section="agenda" 
          icon={Eye}
          isExpanded={expandedSections.agenda}
          onToggle={toggleSection}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.agenda ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Status
                </label>
                <select
                  value={agendaData.status || "aberta"}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    handleThemeChange('agenda.status', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="aberta">Aberta</option>
                  <option value="fechada">Fechada</option>
                  <option value="em-breve">Em breve</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Mês
                </label>
                <Input
                  type="text"
                  placeholder="Janeiro"
                  value={agendaData.mes || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('agenda.mes', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Cor do Status (Hexadecimal)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="#22C55E"
                    value={agendaData.corStatus || "#22C55E"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleThemeChange('agenda.corStatus', e.target.value)
                    }
                    className="font-mono"
                  />
                  <ColorPicker
                    color={agendaData.corStatus || "#22C55E"}
                    onChange={(color: string) => handleColorChange('agenda.corStatus', color)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Texto da Agenda
                </label>
                <Input
                  type="text"
                  placeholder="Agenda de Janeiro aberta"
                  value={agendaData.texto || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleThemeChange('agenda.texto', e.target.value)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Visibilidade
                  </label>
                  <p className="text-sm text-zinc-500">Mostrar ou esconder a agenda</p>
                </div>
                <Switch
                  checked={agendaData.visivel !== false}
                  onCheckedChange={(checked: boolean) => 
                    handleThemeChange('agenda.visivel', checked)
                  }
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  const renderConfiguracoesSection = () => {
    const currentThemeData = getCurrentThemeData();
    const configuracoesData = currentThemeData.configuracoes || {};
    const efeitosData = configuracoesData.efeitos || {};
    
    return (
      <div className="space-y-4">
        <SectionHeader 
          title="Configurações" 
          section="configuracoes" 
          icon={Palette}
          isExpanded={expandedSections.configuracoes}
          onToggle={toggleSection}
        />
        
        <motion.div
          initial={false}
          animate={{ height: expandedSections.configuracoes ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Intervalo da Animação (ms)
                </label>
                <Input
                  type="number"
                  min="500"
                  step="100"
                  value={configuracoesData.intervaloAnimacao?.toString() || "2500"}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      handleThemeChange('configuracoes.intervaloAnimacao', value);
                    }
                  }}
                />
                <p className="text-xs text-zinc-500 mt-1">Tempo entre animações das palavras (em milissegundos)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Cor de Fundo (Hexadecimal)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="#020202"
                    value={configuracoesData.corFundo || "#020202"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleThemeChange('configuracoes.corFundo', e.target.value)
                    }
                    className="font-mono"
                  />
                  <ColorPicker
                    color={configuracoesData.corFundo || "#020202"}
                    onChange={(color: string) => handleColorChange('configuracoes.corFundo', color)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Cor de Destaque (Hexadecimal)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="#FFCC00"
                    value={configuracoesData.corDestaque || "#FFCC00"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleThemeChange('configuracoes.corDestaque', e.target.value)
                    }
                    className="font-mono"
                  />
                  <ColorPicker
                    color={configuracoesData.corDestaque || "#FFCC00"}
                    onChange={(color: string) => handleThemeChange('configuracoes.corDestaque', color)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Efeitos Visuais
                </label>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm text-zinc-700 dark:text-zinc-300">Brilho no Título</label>
                      <p className="text-xs text-zinc-500">Drop shadow no texto principal</p>
                    </div>
                    <Switch
                      checked={efeitosData.brilhoTitulo !== ''}
                      onCheckedChange={(checked: boolean) => 
                        handleThemeChange('configuracoes.efeitos.brilhoTitulo', 
                          checked ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]" : ""
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm text-zinc-700 dark:text-zinc-300">Spotlight</label>
                      <p className="text-xs text-zinc-500">Efeito de foco no conteúdo</p>
                    </div>
                    <Switch
                      checked={efeitosData.spotlight || false}
                      onCheckedChange={(checked: boolean) => 
                        handleThemeChange('configuracoes.efeitos.spotlight', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm text-zinc-700 dark:text-zinc-300">Grid Background</label>
                      <p className="text-xs text-zinc-500">Fundo com padrão de grid</p>
                    </div>
                    <Switch
                      checked={efeitosData.grid || false}
                      onCheckedChange={(checked: boolean) => 
                        handleThemeChange('configuracoes.efeitos.grid', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm text-zinc-700 dark:text-zinc-300">Sombra Inferior</label>
                      <p className="text-xs text-zinc-500">Degradê na parte inferior</p>
                    </div>
                    <Switch
                      checked={efeitosData.sombraInferior || false}
                      onCheckedChange={(checked: boolean) => 
                        handleThemeChange('configuracoes.efeitos.sombraInferior', checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={Layers}
      title="Headline - Seção Hero"
      description="Configure o conteúdo principal da seção hero para cada página"
      exists={!!exists}
      itemName="Headline"
    >
      <div className="space-y-6 pb-32">
        {/* Tabs de Temas */}
        <Card className="p-6">
          <div className="flex flex-wrap gap-2">
            <ThemeTab 
              themeKey="home" 
              label="Home" 
              isActive={activeTheme === "home"} 
              onClick={setActiveTheme} 
            />
            <ThemeTab 
              themeKey="ecommerce" 
              label="E-commerce" 
              isActive={activeTheme === "ecommerce"} 
              onClick={setActiveTheme} 
            />
            <ThemeTab 
              themeKey="marketing" 
              label="Marketing" 
              isActive={activeTheme === "marketing"} 
              onClick={setActiveTheme} 
            />
          </div>
        </Card>

        {/* Seções do Headline */}
        <div className="space-y-6">
          {renderBadgeSection()}
          {renderTituloSection()}
          {renderSubtituloSection()}
          {renderBotaoSection()}
          {renderAgendaSection()}
          {renderConfiguracoesSection()}

          {/* Fixed Action Bar */}
          <FixedActionBar
            onDeleteAll={openDeleteAllModal}
            onSubmit={handleSubmitWrapper}
            isAddDisabled={!canAddNewItem || isLimitReached}
            isSaving={loading}
            exists={!!exists}
            completeCount={completeCount}
            totalCount={totalCount}
            itemName="Headline"
            icon={Layers}
          />
        </div>

        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          type={deleteModal.type}
          itemTitle={deleteModal.title}
          totalItems={4}
          itemName="Headline"
        />

        <FeedbackMessages success={success} errorMsg={errorMsg} />
      </div>
    </ManageLayout>
  );
}