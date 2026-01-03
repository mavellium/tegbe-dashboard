// app/como-fazemos/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Switch } from "@/components/Switch";
import { 
  Layout, 
  Type, 
  List, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  MoveUp,
  MoveDown
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import ColorPicker from "@/components/ColorPicker";
import IconSelector from "@/components/IconSelector";

interface ServiceItem {
  step: string;
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string; // hexadecimal
  wide: boolean;
  visualType: string;
}

interface SectionHeader {
  preTitle: string;
  title: string;
  subtitle: string;
  gradientTitle?: string;
}

interface SectionData {
  header: SectionHeader;
  services: ServiceItem[];
}

interface PageData {
  id?: string;
  home: SectionData;
  marketing: SectionData;
  sobre: SectionData;
}

const defaultPageData: PageData = {
  home: {
    header: {
      preTitle: "",
      title: "",
      subtitle: ""
    },
    services: []
  },
  marketing: {
    header: {
      preTitle: "",
      title: "",
      subtitle: "",
      gradientTitle: ""
    },
    services: []
  },
  sobre: {
    header: {
      preTitle: "",
      title: "",
      subtitle: "",
      gradientTitle: ""
    },
    services: []
  }
};

// Valores de exemplo para referência
const exampleData = {
  home: {
    header: {
      preTitle: "",
      title: "Como fazemos você vender",
      subtitle: "Metodologia validada em mais de R$ 40 milhões faturados."
    },
    services: [
      {
        step: "01",
        id: "seo",
        title: "SEO de Conversão",
        description: "Não criamos apenas anúncios, criamos máquinas de vendas. Títulos e descrições otimizados para que o cliente te encontre e compre sem hesitar.",
        icon: "lucide:search-code",
        color: "#0071E3",
        wide: false,
        visualType: "graph"
      }
    ]
  },
  marketing: {
    header: {
      preTitle: "O Padrão Tegbe",
      title: "Não é mágica.<br />É Metodologia.",
      gradientTitle: "Não é mágica.<br /><span class='text-transparent bg-clip-text bg-gradient-to-r from-[#FF0F43] to-[#A30030]'>É Metodologia.</span>",
      subtitle: "O tripé estratégico que sustenta operações de alta performance."
    },
    services: [
      {
        step: "01",
        id: "traffic",
        title: "Tráfego de Elite",
        description: "Não buscamos cliques, buscamos decisores. Segmentação cirúrgica para atrair quem pode pagar.",
        icon: "mdi:target-account",
        color: "#FF0F43",
        wide: false,
        visualType: "traffic"
      }
    ]
  },
  sobre: {
    header: {
      preTitle: "Nosso Modus Operandi",
      title: "A engenharia por trás<br/>da nossa excelência.",
      subtitle: "",
      gradientTitle: ""
    },
    services: [
      {
        step: "01",
        id: "tracking",
        title: "Rastreabilidade Total",
        description: "Eliminamos a intuição. Antes de gastar R$ 1, implementamos um ecossistema de rastreamento (GA4 + Server Side). Se o dado não existe, a decisão não é tomada.",
        icon: "ph:chart-bar-bold",
        color: "#0071E3",
        wide: false,
        visualType: "bar-chart"
      }
    ]
  }
};

export default function ComoFazemosPage() {
  const [pageData, setPageData] = useState<PageData>(defaultPageData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    home: true,
    marketing: false,
    sobre: false
  });
  const [activeSection, setActiveSection] = useState<"home" | "marketing" | "sobre">("home");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "single" as "single" | "all",
    title: "",
    section: "" as "home" | "marketing" | "sobre" | "",
    serviceIndex: -1
  });

  const apiBase = "/api/tegbe-institucional/form";
  const type = "cards";

  // Calcular campos completos
  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    // Verificar se cada seção tem conteúdo básico
    if (pageData.home.header.title.trim() !== "") count++;
    if (pageData.marketing.header.title.trim() !== "") count++;
    if (pageData.sobre.header.title.trim() !== "") count++;
    
    return count;
  }, [pageData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 3; // home, marketing, sobre
  const exists = !!pageData.id;
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
          setPageData({
            id: data.id,
            home: fetchedData.home || defaultPageData.home,
            marketing: fetchedData.marketing || defaultPageData.marketing,
            sobre: fetchedData.sobre || defaultPageData.sobre
          });
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
    setPageData((prev) => {
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

  const handleHeaderChange = (section: "home" | "marketing" | "sobre", field: keyof SectionHeader, value: string) => {
    const newHeader = { ...pageData[section].header, [field]: value };
    handleChange(`${section}.header`, newHeader);
  };

  const handleServiceChange = (
    section: "home" | "marketing" | "sobre",
    index: number,
    field: keyof ServiceItem,
    value: any
  ) => {
    const newServices = [...pageData[section].services];
    newServices[index] = { ...newServices[index], [field]: value };
    handleChange(`${section}.services`, newServices);
  };

  const addService = (section: "home" | "marketing" | "sobre") => {
    const newService: ServiceItem = {
      step: (pageData[section].services.length + 1).toString().padStart(2, '0'),
      id: `novo-${Date.now()}`,
      title: "",
      description: "",
      icon: "",
      color: "#0071E3",
      wide: false,
      visualType: ""
    };
    
    const newServices = [...pageData[section].services, newService];
    handleChange(`${section}.services`, newServices);
  };

  const removeService = (section: "home" | "marketing" | "sobre", index: number) => {
    const newServices = pageData[section].services.filter((_, i) => i !== index);
    
    // Reordenar steps
    const reorderedServices = newServices.map((service, i) => ({
      ...service,
      step: (i + 1).toString().padStart(2, '0')
    }));
    
    handleChange(`${section}.services`, reorderedServices);
  };

  const moveService = (section: "home" | "marketing" | "sobre", index: number, direction: "up" | "down") => {
    const newServices = [...pageData[section].services];
    
    if (direction === "up" && index > 0) {
      [newServices[index], newServices[index - 1]] = [newServices[index - 1], newServices[index]];
    } else if (direction === "down" && index < newServices.length - 1) {
      [newServices[index], newServices[index + 1]] = [newServices[index + 1], newServices[index]];
    }
    
    // Reordenar steps após mover
    const reorderedServices = newServices.map((service, i) => ({
      ...service,
      step: (i + 1).toString().padStart(2, '0')
    }));
    
    handleChange(`${section}.services`, reorderedServices);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const fd = new FormData();

      fd.append("type", type);
      fd.append("subtype", "tegbe-institucional");
      fd.append("values", JSON.stringify([pageData]));

      if (pageData.id) {
        fd.append("id", pageData.id);
      }

      const method = pageData.id ? "PUT" : "POST";

      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || "Erro ao salvar configurações"
        );
      }

      const saved = await res.json();

      if (saved?.values?.[0]) {
        setPageData(prev => ({
          ...saved.values[0],
          id: saved.id
        }));
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
      section: "",
      serviceIndex: -1
    });
  };

  const openDeleteServiceModal = (section: "home" | "marketing" | "sobre", index: number) => {
    const service = pageData[section].services[index];
    setDeleteModal({
      isOpen: true,
      type: "single",
      title: `Serviço: ${service.title || "Sem título"}`,
      section,
      serviceIndex: index
    });
  };

  const addItem = () => {
    // Para esta página, podemos adicionar um serviço à seção ativa
    addService(activeSection);
  };

  const confirmDelete = async () => {
    if (deleteModal.type === "all" && pageData.id) {
      try {
        const res = await fetch(`${apiBase}/${type}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: pageData.id }),
        });

        if (res.ok) {
          setPageData(defaultPageData);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        } else {
          throw new Error("Erro ao deletar");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Erro ao deletar");
      }
    } else if (deleteModal.type === "single" && deleteModal.section && deleteModal.serviceIndex >= 0) {
      removeService(deleteModal.section, deleteModal.serviceIndex);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
    
    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: "single", 
      title: "", 
      section: "", 
      serviceIndex: -1 
    });
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
      onClick={() => {
        toggleSection(section);
        setActiveSection(section as "home" | "marketing" | "sobre");
      }}
      className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          {title}
        </h3>
        <span className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded">
          {section === "home" ? "Home" : section === "marketing" ? "Marketing" : "Sobre"}
        </span>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      ) : (
        <ChevronDown className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      )}
    </button>
  );

  const renderHeaderSection = (section: "home" | "marketing" | "sobre") => {
    const header = pageData[section].header;
    
    return (
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200 border-b pb-2">
          Cabeçalho
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Pré-título
            </label>
            <Input
              type="text"
              value={header.preTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleHeaderChange(section, "preTitle", e.target.value)
              }
              placeholder="Ex: O Padrão Tegbe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Título (HTML permitido)
            </label>
            <textarea
              value={header.title}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleHeaderChange(section, "title", e.target.value)
              }
              placeholder="Ex: Não é mágica.<br />É Metodologia."
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
            <p className="text-xs text-zinc-500 mt-1">Use &lt;br /&gt; para quebras de linha</p>
          </div>

          {(section === "marketing" || section === "sobre") && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Título com Gradiente (HTML)
              </label>
              <textarea
                value={header.gradientTitle || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleHeaderChange(section, "gradientTitle", e.target.value)
                }
                placeholder="Ex: Não é mágica.<br /><span class='text-transparent bg-clip-text bg-gradient-to-r from-[#FF0F43] to-[#A30030]'>É Metodologia.</span>"
                rows={3}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Subtítulo
            </label>
            <textarea
              value={header.subtitle}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleHeaderChange(section, "subtitle", e.target.value)
              }
              placeholder="Ex: Metodologia validada em mais de R$ 40 milhões faturados."
              rows={2}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderServiceItem = (section: "home" | "marketing" | "sobre", service: ServiceItem, index: number) => {
    return (
      <Card key={index} className="mb-4 overflow-hidden border border-zinc-200 dark:border-zinc-700">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveService(section, index, "up")}
                  disabled={index === 0}
                  className="p-1 disabled:opacity-30 text-zinc-600 dark:text-zinc-400"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveService(section, index, "down")}
                  disabled={index === pageData[section].services.length - 1}
                  className="p-1 disabled:opacity-30 text-zinc-600 dark:text-zinc-400"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
              </div>
              <span className="text-lg font-bold text-zinc-700 dark:text-zinc-300">
                {service.step}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={service.wide}
                onCheckedChange={(checked: boolean) =>
                  handleServiceChange(section, index, "wide", checked)
                }
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {service.wide ? "Largo" : "Normal"}
              </span>
              
              <Button
                type="button"
                onClick={() => openDeleteServiceModal(section, index)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                variant="danger"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                ID (único)
              </label>
              <Input
                type="text"
                value={service.id}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleServiceChange(section, index, "id", e.target.value)
                }
                placeholder="Ex: seo, traffic, tracking"
                className="font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Título
              </label>
              <Input
                type="text"
                value={service.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleServiceChange(section, index, "title", e.target.value)
                }
                placeholder="Ex: SEO de Conversão"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Descrição
              </label>
              <textarea
                value={service.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleServiceChange(section, index, "description", e.target.value)
                }
                placeholder="Descrição detalhada do serviço..."
                rows={3}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Ícone
              </label>
              <IconSelector
                value={service.icon}
                onChange={(value) =>
                  handleServiceChange(section, index, "icon", value)
                }
                label=""
                placeholder="Ex: lucide:search-code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Tipo Visual
              </label>
              <Input
                type="text"
                value={service.visualType}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleServiceChange(section, index, "visualType", e.target.value)
                }
                placeholder="Ex: graph, medal, traffic, dashboard"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Cor (Hexadecimal)
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={service.color}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleServiceChange(section, index, "color", e.target.value)
                  }
                  placeholder="#0071E3"
                  className="font-mono"
                />
                <ColorPicker
                  color={service.color}
                  onChange={(color: string) =>
                    handleServiceChange(section, index, "color", color)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderServicesSection = (section: "home" | "marketing" | "sobre") => {
    const services = pageData[section].services;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-200 border-b pb-2">
            Serviços ({services.length})
          </h4>
          
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
          <div className="text-center py-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
            <List className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
            <p className="text-zinc-600 dark:text-zinc-400">
              Nenhum serviço cadastrado para esta seção
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service, index) => 
              renderServiceItem(section, service, index)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={Layout}
      title="Como Fazemos"
      description="Configure as seções 'Como Fazemos' para home, marketing e sobre"
      exists={exists}
      itemName="Como Fazemos"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Home Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Seção Home"
            section="home"
            icon={Layout}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.home ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderHeaderSection("home")}
              {renderServicesSection("home")}
            </Card>
          </motion.div>
        </div>

        {/* Marketing Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Seção Marketing"
            section="marketing"
            icon={Type}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.marketing ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderHeaderSection("marketing")}
              {renderServicesSection("marketing")}
            </Card>
          </motion.div>
        </div>

        {/* Sobre Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Seção Sobre"
            section="sobre"
            icon={List}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.sobre ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              {renderHeaderSection("sobre")}
              {renderServicesSection("sobre")}
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
          itemName="Seção"
          icon={Layout}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={deleteModal.type === "single" ? 1 : 3}
        itemName={deleteModal.type === "single" ? "Serviço" : "Como Fazemos"}
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}