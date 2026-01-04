/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { 
  GraduationCap,
  Award,
  ChevronDown, 
  ChevronUp,
  Plus,
  Trash2,
  Settings,
  CheckCircle,
  Sparkles,
  Bold,
  Highlighter,
  Type,
  ListChecks
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import IconSelector from "@/components/IconSelector";

interface Headline {
  prefix: string;
  highlight: string;
  suffix: string;
}

interface Paragraph {
  text: string;
  bold?: string;
  highlight?: string;
}

interface Description {
  paragraph1: Paragraph;
  paragraph2: Paragraph;
}

interface Feature {
  label: string;
  icon: string;
}

interface WhyLearnData {
  id?: string;
  badge: string;
  headline: Headline;
  description: Description;
  features: Feature[];
  [key: string]: any;
}

const defaultWhyLearnData: WhyLearnData = {
  badge: "Vivência de Campo",
  headline: {
    prefix: "Por que aprender com a",
    highlight: "Tegbe",
    suffix: "e não com um \"guru\"?"
  },
  description: {
    paragraph1: {
      text: "O mercado está cheio de professores que nunca venderam nada. A Tegbe é, antes de tudo, uma",
      bold: "operação de vendas ativa"
    },
    paragraph2: {
      text: "Não ensinamos teorias de livros antigos. Nós abrimos a caixa-preta das estratégias que geram milhões todos os meses para nossos clientes de assessoria.",
      highlight: "Você aprende o que nós aplicamos hoje."
    }
  },
  features: [
    { label: "Método Validado", icon: "ph:check-circle-fill" },
    { label: "Foco em ROI", icon: "ph:chart-line-up-bold" },
    { label: "Comunidade Ativa", icon: "ph:users-three-fill" }
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

// Componente FeaturesEditor corrigido seguindo o padrão do HeroPage
interface FeaturesEditorProps {
  features: Feature[];
  onChange: (features: Feature[]) => void;
}

const FeaturesEditor = ({ features, onChange }: FeaturesEditorProps) => {
  const addFeature = () => {
    onChange([...features, { label: "", icon: "ph:check-circle-fill" }]);
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onChange(newFeatures);
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    onChange(newFeatures);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <ListChecks className="w-5 h-5" />
          Diferenciais ({features.length})
        </h4>
        <Button
          type="button"
          onClick={addFeature}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Diferencial
        </Button>
      </div>

      {features.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Nenhum diferencial adicionado
          </h4>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Adicione os diferenciais da Tegbe
          </p>
          <Button
            type="button"
            onClick={addFeature}
            className="flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Adicionar Primeiro Diferencial
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Campo do Label */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Texto do Diferencial
                  </label>
                  <Input
                    type="text"
                    value={feature.label}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateFeature(index, "label", e.target.value)
                    }
                    placeholder="Ex: Método Validado"
                  />
                </div>

                {/* Seletor de Ícone - seguindo o padrão do HeroPage */}
                <div>
                  <IconSelector
                    value={feature.icon}
                    onChange={(value) => updateFeature(index, "icon", value)}
                    label="Ícone do Diferencial"
                  />
                </div>
              </div>
              
              {/* Botão de Remover - alinhado à direita */}
              <div className="flex justify-end mt-4">
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => removeFeature(index)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remover Diferencial
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default function WhyLearnPage() {
  const {
    data: whyLearnData,
    setData: setWhyLearnData,
    updateNested,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload
  } = useJsonManagement<WhyLearnData>({
    apiPath: "/api/tegbe-institucional/json/porque-aprender",
    defaultData: defaultWhyLearnData,
  });

  const [expandedSections, setExpandedSections] = useState({
    badge: true,
    headline: true,
    description: true,
    features: true
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });

  // Processar os dados para mesclar propriedades
  const [processedData, setProcessedData] = useState<WhyLearnData>(defaultWhyLearnData);

  useEffect(() => {
    if (whyLearnData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProcessedData(whyLearnData);
    }
  }, [whyLearnData]);

  // Calcular campos completos
  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    if (!processedData) return 0;
    
    // Verificar badge
    if (processedData.badge.trim() !== "") {
      count++;
    }
    
    // Verificar headline - corrigido: remover referência ao "sobre"
    if (
      processedData.headline.prefix.trim() !== "" &&
      processedData.headline.highlight.trim() !== "" &&
      processedData.headline.suffix.trim() !== ""
    ) {
      count++;
    }
    
    // Verificar description
    if (
      processedData.description.paragraph1.text.trim() !== "" &&
      processedData.description.paragraph2.text.trim() !== ""
    ) {
      count++;
    }
    
    // Verificar features
    if (processedData.features.length > 0) {
      const hasValidFeatures = processedData.features.some(feature => 
        feature.label.trim() !== "" && 
        feature.icon.trim() !== ""
      );
      if (hasValidFeatures) count++;
    }
    
    return count;
  }, [processedData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 4; // badge, headline, description, features

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    updateNested(path, value);
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      const fd = new FormData();
      fd.append("values", JSON.stringify(whyLearnData));
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
      title: "TODOS OS CONTEÚDOS"
    });
  };

  const confirmDelete = async () => {
    await fetch("/api/tegbe-institucional/json/porque-aprender", {
      method: "DELETE",
    });

    setWhyLearnData(defaultWhyLearnData);
    setProcessedData(defaultWhyLearnData);
    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: "all", 
      title: "" 
    });
  };

  const renderBadgeSection = () => {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Badge
          </label>
          <Input
            type="text"
            value={processedData.badge}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("badge", e.target.value)
            }
            placeholder="Ex: Vivência de Campo"
          />
          <p className="text-xs text-zinc-500 mt-2">
            Texto curto que aparece como um selo ou destaque acima do título
          </p>
        </div>
      </div>
    );
  };

  const renderHeadlineSection = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Prefixo
            </label>
            <Input
              type="text"
              value={processedData.headline.prefix}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("headline.prefix", e.target.value)
              }
              placeholder="Por que aprender com a"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Destaque
            </label>
            <Input
              type="text"
              value={processedData.headline.highlight}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("headline.highlight", e.target.value)
              }
              placeholder="Tegbe"
              className="font-semibold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Sufixo
            </label>
            <Input
              type="text"
              value={processedData.headline.suffix}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("headline.suffix", e.target.value)
              }
              placeholder='e não com um "guru"?'
            />
          </div>
        </div>
      </div>
    );
  };

  const renderDescriptionSection = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Parágrafo 1 - Texto
            </label>
            <textarea
              value={processedData.description.paragraph1.text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleChange("description.paragraph1.text", e.target.value)
              }
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[100px]"
              rows={2}
              placeholder="O mercado está cheio de professores que nunca venderam nada. A Tegbe é, antes de tudo, uma"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
              <Bold className="w-4 h-4" />
              Parágrafo 1 - Texto em Negrito
            </label>
            <Input
              type="text"
              value={processedData.description.paragraph1.bold || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("description.paragraph1.bold", e.target.value)
              }
              placeholder="operação de vendas ativa"
              className="font-semibold"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Parágrafo 2 - Texto
            </label>
            <textarea
              value={processedData.description.paragraph2.text}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleChange("description.paragraph2.text", e.target.value)
              }
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[100px]"
              rows={2}
              placeholder="Não ensinamos teorias de livros antigos. Nós abrimos a caixa-preta das estratégias que geram milhões todos os meses para nossos clientes de assessoria."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
              <Highlighter className="w-4 h-4" />
              Parágrafo 2 - Texto Destacado
            </label>
            <Input
              type="text"
              value={processedData.description.paragraph2.highlight || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("description.paragraph2.highlight", e.target.value)
              }
              placeholder="Você aprende o que nós aplicamos hoje."
              className="font-medium bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={GraduationCap}
      title="Por que Aprender com a Tegbe"
      description="Gerencie o conteúdo da seção que explica os diferenciais"
      exists={!!exists}
      itemName="Conteúdo"
    >
      <form onSubmit={handleSubmitWrapper} className="space-y-6 pb-32">
        {/* Seção Badge */}
        <div className="space-y-4">
          <SectionHeader
            title="Badge"
            section="badge"
            icon={Award}
            isExpanded={expandedSections.badge}
            onToggle={() => toggleSection("badge")}
          />

          <AnimatePresence>
            {expandedSections.badge && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderBadgeSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção Headline */}
        <div className="space-y-4">
          <SectionHeader
            title="Headline (Título Principal)"
            section="headline"
            icon={Type}
            isExpanded={expandedSections.headline}
            onToggle={() => toggleSection("headline")}
          />

          <AnimatePresence>
            {expandedSections.headline && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderHeadlineSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção Description */}
        <div className="space-y-4">
          <SectionHeader
            title="Descrição"
            section="description"
            icon={Settings}
            isExpanded={expandedSections.description}
            onToggle={() => toggleSection("description")}
          />

          <AnimatePresence>
            {expandedSections.description && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderDescriptionSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção Features */}
        <div className="space-y-4">
          <SectionHeader
            title="Diferenciais"
            section="features"
            icon={CheckCircle}
            isExpanded={expandedSections.features}
            onToggle={() => toggleSection("features")}
          />

          <AnimatePresence>
            {expandedSections.features && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  <FeaturesEditor
                    features={processedData.features}
                    onChange={(features) => handleChange("features", features)}
                  />
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
          itemName="Conteúdo"
          icon={GraduationCap}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Conteúdo"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}