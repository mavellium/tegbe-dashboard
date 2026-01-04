/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Switch } from "@/components/Switch";
import { 
  DollarSign,
  Tag,
  Type,
  ChevronDown, 
  ChevronUp,
  Plus,
  Trash2,
  Settings,
  Sparkles,
  Shield,
  Award,
  Crown,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Target
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  installments: string;
  features: string[];
  cta: string;
  highlight: boolean;
  tag?: string;
}

interface Header {
  badge: string;
  title: string;
  subtitle: string;
}

interface Guarantee {
  title: string;
  text: string;
}

interface PricingData {
  id?: string;
  header: Header;
  plans: Plan[];
  guarantee: Guarantee;
  [key: string]: any;
}

const defaultPricingData: PricingData = {
  header: {
    badge: "Investimento Estratégico",
    title: "Escolha seu Nível de Acesso",
    subtitle: "O valor de uma única venda feita com nosso método já paga o seu acesso anual."
  },
  plans: [
    {
      id: "starter",
      name: "Start",
      description: "Para quem quer dar o primeiro passo com segurança.",
      price: "997",
      installments: "12x de R$ 99,70",
      features: [
        "Acesso ao Curso Completo",
        "Suporte por E-mail",
        "Acesso por 1 Ano",
        "Sem acesso à Comunidade"
      ],
      cta: "Começar Agora",
      highlight: false
    },
    {
      id: "pro",
      name: "TegPro Black",
      description: "O ecossistema completo para quem não aceita jogar pequeno.",
      price: "1.997",
      installments: "12x de R$ 199,70",
      features: [
        "Tudo do plano Start",
        "Acesso Vitalício",
        "Comunidade Elite (Networking)",
        "Calls Mensais de Tira-Dúvidas",
        "Pack de Templates (Ads + Copy)"
      ],
      cta: "Garantir Acesso Black",
      highlight: true,
      tag: "MAIS ESCOLHIDO"
    },
    {
      id: "mentoria",
      name: "Mentoria Individual",
      description: "Acompanhamento direto com o time sênior da Tegbe.",
      price: "5.000",
      installments: "Aplicação Necessária",
      features: [
        "Acesso TegPro Black",
        "4 Encontros de Diagnóstico",
        "Análise de Campanhas ao Vivo",
        "Acesso direto ao WhatsApp"
      ],
      cta: "Aplicar para Mentoria",
      highlight: false
    }
  ],
  guarantee: {
    title: "Garantia Blindada de 7 Dias",
    text: "Entre, assista, aplique. Se achar que não é para você, devolvemos 100% do valor. O risco é todo nosso."
  }
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

// Componente FeaturesEditor para os benefícios dos planos
interface FeaturesEditorProps {
  features: string[];
  onChange: (features: string[]) => void;
  label?: string;
}

const FeaturesEditor = ({ features, onChange, label = "Benefícios" }: FeaturesEditorProps) => {
  const [newFeature, setNewFeature] = useState("");

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      onChange([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    onChange(newFeatures);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      
      <div className="flex gap-2 mb-3">
        <Input
          type="text"
          value={newFeature}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFeature(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite um benefício e pressione Enter"
        />
        <Button
          type="button"
          onClick={addFeature}
        >
          Adicionar
        </Button>
      </div>

      {features.length > 0 ? (
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="text-zinc-500 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">Nenhum benefício adicionado</p>
      )}
    </div>
  );
};

// Componente PlanEditor
interface PlanEditorProps {
  plan: Plan;
  index: number;
  onChange: (plan: Plan) => void;
  onRemove: () => void;
  isHighlighted?: boolean;
}

const PlanEditor = ({ plan, index, onChange, onRemove, isHighlighted }: PlanEditorProps) => {
  const updatePlan = (field: keyof Plan, value: any) => {
    onChange({ ...plan, [field]: value });
  };

  const getPlanIcon = (id: string) => {
    switch (id) {
      case 'starter': return Target;
      case 'pro': return Crown;
      case 'mentoria': return Users;
      default: return Award;
    }
  };

  const PlanIcon = getPlanIcon(plan.id);

  return (
    <Card className={`p-6 ${isHighlighted ? 'border-yellow-400 dark:border-yellow-600 border-2' : ''}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isHighlighted 
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' 
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          }`}>
            <PlanIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-lg">
                Plano {index + 1}: {plan.name || "Sem nome"}
              </h4>
              {plan.tag && (
                <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                  {plan.tag}
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {plan.id || "Sem ID"}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              ID do Plano
            </label>
            <Input
              type="text"
              value={plan.id}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updatePlan("id", e.target.value.toLowerCase())
              }
              placeholder="starter, pro, mentoria"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Nome do Plano
            </label>
            <Input
              type="text"
              value={plan.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updatePlan("name", e.target.value)
              }
              placeholder="Start, TegPro Black, Mentoria Individual"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Descrição
          </label>
          <Input
            type="text"
            value={plan.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePlan("description", e.target.value)
            }
            placeholder="Descrição curta do plano"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Preço (R$)
            </label>
            <Input
              type="text"
              value={plan.price}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updatePlan("price", e.target.value)
              }
              placeholder="997, 1997, 5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Parcelamento
            </label>
            <Input
              type="text"
              value={plan.installments}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updatePlan("installments", e.target.value)
              }
              placeholder="12x de R$ 99,70"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Texto do Botão (CTA)
          </label>
          <Input
            type="text"
            value={plan.cta}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updatePlan("cta", e.target.value)
            }
            placeholder="Começar Agora"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Tag (Opcional)
            </label>
            <Input
              type="text"
              value={plan.tag || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updatePlan("tag", e.target.value)
              }
              placeholder="MAIS ESCOLHIDO"
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={plan.highlight}
              onCheckedChange={(checked: boolean) =>
                updatePlan("highlight", checked)
              }
            />
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Destaque
              </label>
              <p className="text-xs text-zinc-500">Destacar este plano</p>
            </div>
          </div>
        </div>

        <FeaturesEditor
          features={plan.features}
          onChange={(features) => updatePlan("features", features)}
          label="Benefícios do Plano"
        />
      </div>
    </Card>
  );
};

export default function PricingPage() {
  const {
    data: pricingData,
    setData: setPricingData,
    updateNested,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload
  } = useJsonManagement<PricingData>({
    apiPath: "/api/tegbe-institucional/json/preco",
    defaultData: defaultPricingData,
  });

  const [expandedSections, setExpandedSections] = useState({
    header: true,
    plans: true,
    guarantee: true
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });

  // Processar os dados para mesclar propriedades
  const [processedData, setProcessedData] = useState<PricingData>(defaultPricingData);

  useEffect(() => {
    if (pricingData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProcessedData(pricingData);
    }
  }, [pricingData]);

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
    
    // Verificar plans
    if (processedData.plans.length > 0) {
      const hasValidPlans = processedData.plans.some(plan => 
        plan.id.trim() !== "" && 
        plan.name.trim() !== "" &&
        plan.description.trim() !== "" &&
        plan.price.trim() !== "" &&
        plan.installments.trim() !== "" &&
        plan.cta.trim() !== "" &&
        plan.features.length > 0
      );
      if (hasValidPlans) count++;
    }
    
    // Verificar guarantee
    if (
      processedData.guarantee.title.trim() !== "" &&
      processedData.guarantee.text.trim() !== ""
    ) {
      count++;
    }
    
    return count;
  }, [processedData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 3; // header, plans, guarantee

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    updateNested(path, value);
  };

  const handlePlanChange = (index: number, plan: Plan) => {
    const newPlans = [...processedData.plans];
    newPlans[index] = plan;
    handleChange("plans", newPlans);
  };

  const addPlan = () => {
    const newPlan: Plan = {
      id: "novo-plano",
      name: "Novo Plano",
      description: "Descrição do novo plano",
      price: "0",
      installments: "À vista",
      features: ["Benefício 1", "Benefício 2"],
      cta: "Adquirir Agora",
      highlight: false
    };
    handleChange("plans", [...processedData.plans, newPlan]);
  };

  const removePlan = (index: number) => {
    const newPlans = processedData.plans.filter((_, i) => i !== index);
    handleChange("plans", newPlans);
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      const fd = new FormData();
      fd.append("values", JSON.stringify(pricingData));
      save(fd);
      await reload();
      await reload();
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
    }
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODOS OS PLANOS E PREÇOS"
    });
  };

  const confirmDelete = async () => {
    await fetch("/api/tegbe-institucional/json/preco", {
      method: "DELETE",
    });

    setPricingData(defaultPricingData);
    setProcessedData(defaultPricingData);
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
              placeholder="Investimento Estratégico"
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
              placeholder="Escolha seu Nível de Acesso"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Subtítulo
          </label>
          <Input
            type="text"
            value={processedData.header.subtitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("header.subtitle", e.target.value)
            }
            placeholder="O valor de uma única venda feita com nosso método já paga o seu acesso anual."
          />
        </div>
      </div>
    );
  };

  const renderGuaranteeSection = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Título da Garantia
            </label>
            <Input
              type="text"
              value={processedData.guarantee.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("guarantee.title", e.target.value)
              }
              placeholder="Garantia Blindada de 7 Dias"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Texto da Garantia
            </label>
            <Input
              type="text"
              value={processedData.guarantee.text}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("guarantee.text", e.target.value)
              }
              placeholder="Entre, assista, aplique. Se achar que não é para você, devolvemos 100% do valor."
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={DollarSign}
      title="Planos e Preços"
      description="Gerencie os planos de investimento estratégico e preços da TegPro"
      exists={!!exists}
      itemName="Planos"
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

        {/* Seção Planos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader
              title={`Planos (${processedData.plans.length} disponíveis)`}
              section="plans"
              icon={Award}
              isExpanded={expandedSections.plans}
              onToggle={() => toggleSection("plans")}
            />
            <Button
              type="button"
              onClick={addPlan}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Plano
            </Button>
          </div>

          <AnimatePresence>
            {expandedSections.plans && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {processedData.plans.length === 0 ? (
                    <div className="text-center py-12">
                      <Award className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Nenhum plano adicionado
                      </h4>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                        Adicione os planos de investimento estratégico
                      </p>
                      <Button
                        type="button"
                        onClick={addPlan}
                        className="flex items-center gap-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Primeiro Plano
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {processedData.plans.map((plan, index) => (
                        <PlanEditor
                          key={index}
                          plan={plan}
                          index={index}
                          onChange={(updatedPlan) => handlePlanChange(index, updatedPlan)}
                          onRemove={() => removePlan(index)}
                          isHighlighted={plan.highlight}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção Garantia */}
        <div className="space-y-4">
          <SectionHeader
            title="Garantia"
            section="guarantee"
            icon={Shield}
            isExpanded={expandedSections.guarantee}
            onToggle={() => toggleSection("guarantee")}
          />

          <AnimatePresence>
            {expandedSections.guarantee && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderGuaranteeSection()}
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
          itemName="Planos"
          icon={DollarSign}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={processedData.plans.length}
        itemName="Plano"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}