/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { 
  BarChart,
  TrendingUp,
  Tag,
  Type,
  ChevronDown, 
  ChevronUp,
  Plus,
  Trash2,
  Settings,
  Sparkles,
  ListChecks,
  Target,
  Shield,
  Zap,
  Users,
  RefreshCw,
  Columns as ColumnsIcon
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";

interface Feature {
  label: string;
  competitor: string;
  us: string;
}

interface Columns {
  competitor: string;
  us: string;
}

interface Header {
  badge: string;
  title: string;
  subtitle: string;
}

interface BenchmarkData {
  id?: string;
  header: Header;
  columns: Columns;
  features: Feature[];
  [key: string]: any;
}

const defaultBenchmarkData: BenchmarkData = {
  header: {
    badge: "Benchmarking de Mercado",
    title: "A diferença é óbvia.",
    subtitle: "Compare a profundidade da entrega. Não é sobre quantidade de aulas, é sobre a utilidade do que é ensinado."
  },
  columns: {
    competitor: "Cursos Tradicionais",
    us: "Ecossistema TegPro"
  },
  features: [
    {
      label: "Origem do Método",
      competitor: "Teoria e Livros",
      us: "Campo de Batalha (R$ 45M+ Gerados)"
    },
    {
      label: "Foco do Conteúdo",
      competitor: "Gatilhos Mentais Genéricos",
      us: "Processos Operacionais de Escala"
    },
    {
      label: "Ferramentas Entregues",
      competitor: "Nenhuma (Apenas PDF)",
      us: "Templates de CRM, Scripts e Dashboards"
    },
    {
      label: "Suporte",
      competitor: "E-mail ou Ticket",
      us: "Comunidade Ativa no WhatsApp"
    },
    {
      label: "Atualização",
      competitor: "Anual (Se houver)",
      us: "Mensal (Baseado no que validamos na agência)"
    }
  ]
};

// Componente SectionHeader
interface SectionHeaderProps {
  title: string;
  section: any;
  icon: any;
  isExpanded: boolean;
  onToggle: (section: any) => void;
}

const SectionHeader = ({
  title,
  section,
  icon: Icon,
  isExpanded,
  onToggle
}: SectionHeaderProps) => (
  <div
    onClick={() => onToggle(section)}
    className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
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
  </div>
);

// Componente FeatureEditor
interface FeatureEditorProps {
  feature: Feature;
  index: number;
  onChange: (feature: Feature) => void;
  onRemove: () => void;
  competitorLabel: string;
  usLabel: string;
}

const FeatureEditor = ({ 
  feature, 
  index, 
  onChange, 
  onRemove, 
  competitorLabel,
  usLabel 
}: FeatureEditorProps) => {
  const updateFeature = (field: keyof Feature, value: string) => {
    onChange({ ...feature, [field]: value });
  };

  const getFeatureIcon = (index: number) => {
    switch (index % 5) {
      case 0: return Target;     // Origem do Método
      case 1: return Zap;        // Foco do Conteúdo
      case 2: return Shield;     // Ferramentas Entregues
      case 3: return Users;      // Suporte
      case 4: return RefreshCw;  // Atualização
      default: return ListChecks;
    }
  };

  const FeatureIcon = getFeatureIcon(index);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <FeatureIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">
              Item {index + 1}: {feature.label || "Sem rótulo"}
            </h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Comparação entre {competitorLabel} e {usLabel}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="danger"
          onClick={onRemove}
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Remover
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Rótulo da Característica
          </label>
          <Input
            type="text"
            value={feature.label}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateFeature("label", e.target.value)
            }
            placeholder="Ex: Origem do Método"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {competitorLabel}
            </label>
            <Input
              type="text"
              value={feature.competitor}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateFeature("competitor", e.target.value)
              }
              placeholder="Ex: Teoria e Livros"
              className="border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {usLabel}
            </label>
            <Input
              type="text"
              value={feature.us}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateFeature("us", e.target.value)
              }
              placeholder="Ex: Campo de Batalha (R$ 45M+ Gerados)"
              className="border-green-300 dark:border-green-700 focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function BenchmarkPage() {
  const {
    data: benchmarkData,
    setData: setBenchmarkData,
    updateNested,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload
  } = useJsonManagement<BenchmarkData>({
    apiPath: "/api/tegbe-institucional/json/concorrentes",
    defaultData: defaultBenchmarkData,
  });

  const [expandedSections, setExpandedSections] = useState({
    header: true,
    columns: true,
    features: true
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });

  // Processar os dados para mesclar propriedades
  const [processedData, setProcessedData] = useState<BenchmarkData>(defaultBenchmarkData);

  useEffect(() => {
    if (benchmarkData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProcessedData(benchmarkData);
    }
  }, [benchmarkData]);

  // Calcular campos completos
  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    if (!processedData) return 0;
    
    // Verificar header
    if (
      processedData.header.badge.trim() !== "" &&
      processedData.header.title.trim() !== "" &&
      processedData.header.subtitle.trim() !== ""
    ) {
      count++;
    }
    
    // Verificar columns
    if (
      processedData.columns.competitor.trim() !== "" &&
      processedData.columns.us.trim() !== ""
    ) {
      count++;
    }
    
    // Verificar features
    if (processedData.features.length > 0) {
      const hasValidFeatures = processedData.features.some(feature => 
        feature.label.trim() !== "" && 
        feature.competitor.trim() !== "" &&
        feature.us.trim() !== ""
      );
      if (hasValidFeatures) count++;
    }
    
    return count;
  }, [processedData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 3; // header, columns, features

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    updateNested(path, value);
  };

  const handleFeatureChange = (index: number, feature: Feature) => {
    const newFeatures = [...processedData.features];
    newFeatures[index] = feature;
    handleChange("features", newFeatures);
  };

  const addFeature = () => {
    const newFeature: Feature = {
      label: "",
      competitor: "",
      us: ""
    };
    handleChange("features", [...processedData.features, newFeature]);
  };

  const removeFeature = (index: number) => {
    const newFeatures = processedData.features.filter((_, i) => i !== index);
    handleChange("features", newFeatures);
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      const fd = new FormData();
      fd.append("values", JSON.stringify(benchmarkData));
      save(fd);
      await reload();
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
    }
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODOS OS CONTEÚDOS DE COMPARAÇÃO"
    });
  };

  const confirmDelete = async () => {
    await fetch("/api/tegbe-institucional/json/concorrentes", {
      method: "DELETE",
    });

    setBenchmarkData(defaultBenchmarkData);
    setProcessedData(defaultBenchmarkData);
    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: "all", 
      title: "" 
    });
  };

  const renderHeaderSection = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Badge
            </label>
            <Input
              type="text"
              value={processedData.header.badge}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("header.badge", e.target.value)
              }
              placeholder="Benchmarking de Mercado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Título
            </label>
            <Input
              type="text"
              value={processedData.header.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("header.title", e.target.value)
              }
              placeholder="A diferença é óbvia."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Subtítulo
          </label>
          <textarea
            value={processedData.header.subtitle}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleChange("header.subtitle", e.target.value)
            }
            rows={3}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="Compare a profundidade da entrega. Não é sobre quantidade de aulas, é sobre a utilidade do que é ensinado."
          />
        </div>
      </div>
    );
  };

  const renderColumnsSection = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Título da Coluna Concorrente
            </label>
            <Input
              type="text"
              value={processedData.columns.competitor}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("columns.competitor", e.target.value)
              }
              placeholder="Cursos Tradicionais"
            />
            <p className="text-xs text-zinc-500 mt-2">
              Título da coluna da esquerda (geralmente negativo)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Título da Coluna TegPro
            </label>
            <Input
              type="text"
              value={processedData.columns.us}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("columns.us", e.target.value)
              }
              placeholder="Ecossistema TegPro"
            />
            <p className="text-xs text-zinc-500 mt-2">
              Título da coluna da direita (geralmente positivo)
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={BarChart}
      title="Benchmarking de Mercado"
      description="Gerencie a tabela de comparação entre a TegPro e cursos tradicionais"
      exists={!!exists}
      itemName="Benchmark"
    >
      <form onSubmit={handleSubmitWrapper} className="space-y-6 pb-32">
        {/* Seção Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho"
            section="header"
            icon={Tag}
            isExpanded={expandedSections.header}
            onToggle={() => toggleSection("header")}
          />

          <AnimatePresence>
            {expandedSections.header && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderHeaderSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção Colunas */}
        <div className="space-y-4">
          <SectionHeader
            title="Colunas da Comparação"
            section="columns"
            icon={ColumnsIcon}
            isExpanded={expandedSections.columns}
            onToggle={() => toggleSection("columns")}
          />

          <AnimatePresence>
            {expandedSections.columns && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderColumnsSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção Features */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <SectionHeader
              title={`Características de Comparação (${processedData.features.length} itens)`}
              section="features"
              icon={TrendingUp}
              isExpanded={expandedSections.features}
              onToggle={() => toggleSection("features")}
            />
            <Button
              type="button"
              onClick={addFeature}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Item
            </Button>
          </div>

          <AnimatePresence>
            {expandedSections.features && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {processedData.features.length === 0 ? (
                    <div className="text-center py-12">
                      <TrendingUp className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Nenhuma característica adicionada
                      </h4>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                        Adicione características para comparar a TegPro com a concorrência
                      </p>
                      <Button
                        type="button"
                        onClick={addFeature}
                        className="flex items-center gap-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Primeira Característica
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {processedData.features.map((feature, index) => (
                        <FeatureEditor
                          key={index}
                          feature={feature}
                          index={index}
                          onChange={(updatedFeature) => handleFeatureChange(index, updatedFeature)}
                          onRemove={() => removeFeature(index)}
                          competitorLabel={processedData.columns.competitor}
                          usLabel={processedData.columns.us}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Action Bar */}
        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          isAddDisabled={false}
          isSaving={loading}
          exists={!!exists}
          completeCount={completeCount}
          totalCount={totalCount}
          itemName="Benchmark"
          icon={BarChart}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={processedData.features.length}
        itemName="Característica"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}