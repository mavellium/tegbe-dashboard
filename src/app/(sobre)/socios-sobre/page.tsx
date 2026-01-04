/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { 
  Dna,
  Handshake,
  Atom,
  Rocket,
  Type,
  ChevronDown, 
  ChevronUp,
  Plus,
  Trash2,
  Sparkles,
  Palette,
  LucideIcon,
  Target,
  TrendingUp,
  Brain,
  Users,
  Shield,
  Zap,
  Star,
  Trophy,
  Award
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import IconSelector from "@/components/IconSelector";

interface Badge {
  text: string;
  icon: string;
}

interface Valor {
  titulo: string;
  descricao: string;
  icone: string;
  cor: string;
}

interface DnaData {
  badge: Badge;
  titulo: string;
  subtitulo: string;
  valores: Valor[];
}

interface DnaOnlyData {
  dna: DnaData;
}

const defaultDnaData: DnaOnlyData = {
  dna: {
    badge: {
      text: "Nosso DNA",
      icon: "ph:dna-bold"
    },
    titulo: "Cultura de alta performance,<br/>não de agência.",
    subtitulo: "Somos um time de engenheiros, ex-fundadores e estrategistas obcecados por resolver problemas complexos de negócio.",
    valores: [
      {
        titulo: "Skin in the Game",
        descricao: "Não somos prestadores de serviço. Somos sócios na dor e na vitória. Nossa remuneração está atrelada aos seus resultados.",
        icone: "ph:handshake-bold",
        cor: "green"
      },
      {
        titulo: "Método Científico",
        descricao: "Testamos, medimos, iteramos. Rejeitamos achismos e apostamos em dados para cada decisão.",
        icone: "ph:atom-bold",
        cor: "blue"
      },
      {
        titulo: "Long-Term Play",
        descricao: "Construímos para durar. Nossas soluções são pensadas para escalar e gerar valor por anos, não para entregas pontuais.",
        icone: "ph:rocket-launch-bold",
        cor: "purple"
      }
    ]
  }
};

// Ícones disponíveis para valores
const availableIcons = [
  { value: "ph:dna-bold", label: "DNA", icon: Dna },
  { value: "ph:handshake-bold", label: "Aperto de Mãos", icon: Handshake },
  { value: "ph:atom-bold", label: "Átomo", icon: Atom },
  { value: "ph:rocket-launch-bold", label: "Foguete", icon: Rocket },
  { value: "ph:target-bold", label: "Alvo", icon: Target },
  { value: "ph:chart-line-up-bold", label: "Gráfico Crescente", icon: TrendingUp },
  { value: "ph:brain-bold", label: "Cérebro", icon: Brain },
  { value: "ph:users-bold", label: "Usuários", icon: Users },
  { value: "ph:shield-check-bold", label: "Escudo com Check", icon: Shield },
  { value: "ph:zap-bold", label: "Raio", icon: Zap },
  { value: "ph:star-bold", label: "Estrela", icon: Star },
  { value: "ph:trophy-bold", label: "Troféu", icon: Trophy },
  { value: "ph:award-bold", label: "Prêmio", icon: Award },
  { value: "ph:crown-simple-bold", label: "Coroa", icon: Award },
  { value: "ph:trend-up-bold", label: "Trending Up", icon: TrendingUp },
  { value: "ph:lightbulb-bold", label: "Lâmpada", icon: Brain },
  { value: "ph:gear-six-bold", label: "Engrenagem", icon: Target },
  { value: "ph:globe-bold", label: "Globo", icon: Target },
  { value: "ph:clock-bold", label: "Relógio", icon: Target },
  { value: "ph:chart-pie-bold", label: "Gráfico de Pizza", icon: TrendingUp },
  { value: "ph:check-circle-bold", label: "Check em Círculo", icon: Shield }
];

// Cores disponíveis
const availableColors = [
  { value: "green", label: "Verde", class: "from-green-500 to-green-400" },
  { value: "blue", label: "Azul", class: "from-blue-500 to-blue-400" },
  { value: "purple", label: "Roxo", class: "from-purple-500 to-purple-400" },
  { value: "red", label: "Vermelho", class: "from-red-500 to-red-400" },
  { value: "orange", label: "Laranja", class: "from-orange-500 to-orange-400" },
  { value: "pink", label: "Rosa", class: "from-pink-500 to-pink-400" },
  { value: "indigo", label: "Índigo", class: "from-indigo-500 to-indigo-400" },
  { value: "teal", label: "Verde Água", class: "from-teal-500 to-teal-400" },
  { value: "amber", label: "Âmbar", class: "from-amber-500 to-amber-400" },
  { value: "cyan", label: "Ciano", class: "from-cyan-500 to-cyan-400" }
];

// Componente SectionHeader
interface SectionHeaderProps {
  title: string;
  section: "badge" | "titulo" | "valores";
  icon: LucideIcon;
  isExpanded: boolean;
  onToggle: (section: "badge" | "titulo" | "valores") => void;
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

// Componente ValorItemEditor
interface ValorItemEditorProps {
  valor: Valor;
  index: number;
  onValorChange: (index: number, field: keyof Valor, value: any) => void;
  onRemove: (index: number) => void;
}

const ValorItemEditor = ({
  valor,
  index,
  onValorChange,
  onRemove
}: ValorItemEditorProps) => {
  // Encontrar o ícone correspondente na lista de availableIcons
  const iconData = availableIcons.find(icon => icon.value === valor.icone);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${valor.cor}-100 dark:bg-${valor.cor}-900/30`}>
            {iconData?.icon ? (
              <iconData.icon className={`w-5 h-5 text-${valor.cor}-600 dark:text-${valor.cor}-400`} />
            ) : (
              <Sparkles className={`w-5 h-5 text-${valor.cor}-600 dark:text-${valor.cor}-400`} />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {valor.titulo || "Novo Valor"}
            </h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">
              {valor.descricao || "Sem descrição"}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Título do Valor
          </label>
          <Input
            type="text"
            value={valor.titulo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onValorChange(index, "titulo", e.target.value)
            }
            placeholder="Ex: Skin in the Game"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Cor
          </label>
          <select
            value={valor.cor}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onValorChange(index, "cor", e.target.value)
            }
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            {availableColors.map((color) => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <IconSelector
          value={valor.icone}
          onChange={(newIcon) => onValorChange(index, "icone", newIcon)}
          label="Ícone do Valor"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Descrição
        </label>
        <textarea
          value={valor.descricao}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onValorChange(index, "descricao", e.target.value)
          }
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[100px]"
          rows={3}
          placeholder="Descreva este valor em detalhes..."
        />
      </div>
    </Card>
  );
};

export default function DnaPage() {
  const {
    data: dnaData,
    setData: setDnaData,
    updateNested,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload
  } = useJsonManagement<DnaOnlyData>({
    apiPath: "/api/tegbe-institucional/json/dna",
    defaultData: defaultDnaData,
  });

  const [expandedSections, setExpandedSections] = useState({
    badge: true,
    titulo: true,
    valores: true
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });

  // Calcular campos completos
  const calculateCompleteCount = useCallback(() => {
    const data = dnaData?.dna;
    let count = 0;
    
    // Verificar badge
    if (data?.badge.text.trim() !== "" && data?.badge.icon.trim() !== "") {
      count++;
    }
    
    // Verificar título
    if (data?.titulo.trim() !== "") {
      count++;
    }
    
    // Verificar valores
    if (data?.valores.length > 0) {
      const hasValidValores = data?.valores.some(valor => 
        valor.titulo.trim() !== "" && valor.descricao.trim() !== ""
      );
      if (hasValidValores) count++;
    }
    
    return count;
  }, [dnaData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 3; // badge, titulo, valores
  const canAddNewItem = true;
  const isLimitReached = dnaData?.dna?.valores.length >= 6;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    updateNested(`dna.${path}`, value);
  };

  const handleValorChange = (index: number, field: keyof Valor, value: any) => {
    updateNested(`dna.valores.${index}.${field}`, value);
  };

  const addValor = () => {
    const currentValores = [...dnaData?.dna?.valores];
    
    const newValor: Valor = {
      titulo: "",
      descricao: "",
      icone: "ph:star-bold",
      cor: "blue"
    };

    updateNested("dna.valores", [...currentValores, newValor]);
  };

  const removeValor = (index: number) => {
    const currentValores = [...dnaData?.dna?.valores];
    currentValores.splice(index, 1);
    updateNested("dna.valores", currentValores);
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append("values", JSON.stringify(dnaData));
    save(fd);
    await reload();
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODOS OS DADOS DA SEÇÃO DNA"
    });
  };

  const confirmDelete = async () => {
    await fetch("/api/tegbe-institucional/json/dna", {
      method: "DELETE",
    });

    setDnaData(defaultDnaData);
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
    const badge = dnaData?.dna?.badge;

    return (
      <div className="space-y-6">
        {/* Texto do Badge */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Texto do Badge
          </label>
          <Input
            type="text"
            value={badge?.text}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("badge.text", e.target.value)
            }
            placeholder="Ex: Nosso DNA"
          />
        </div>

        {/* Ícone do Badge */}
        <div>
          <IconSelector
            value={badge?.icon}
            onChange={(value) => handleChange("badge.icon", value)}
            label="Ícone do Badge"
          />
        </div>
      </div>
    );
  };

  const renderTituloSection = () => {
    const data = dnaData?.dna;

    return (
      <div className="space-y-6">
        {/* Título com HTML */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Título (HTML permitido)
          </label>
          <textarea
            value={data?.titulo}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleChange("titulo", e.target.value)
            }
            placeholder="Cultura de alta performance,<br/>não de agência."
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[100px]"
            rows={3}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Use HTML para estilização, como &lt;br/&gt; para quebras de linha
          </p>
        </div>

        {/* Subtítulo */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Subtítulo
          </label>
          <textarea
            value={data?.subtitulo}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleChange("subtitulo", e.target.value)
            }
            placeholder="Somos um time de engenheiros, ex-fundadores e estrategistas obcecados por resolver problemas complexos de negócio."
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[80px]"
            rows={3}
          />
        </div>
      </div>
    );
  };

  const renderValoresSection = () => {
    const valores = dnaData?.dna?.valores;

    return (
      <div className="space-y-6">
        {/* Contador */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Estatísticas
          </label>
          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-semibold">{valores?.length}</span> valores cadastrados
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {isLimitReached ? "Limite de 6 valores atingido" : "Máximo de 6 valores recomendado"}
            </p>
          </div>
        </div>

        {/* Lista de Valores */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              Valores ({valores?.length})
            </h4>
            <Button
              type="button"
              onClick={addValor}
              className="flex items-center gap-2"
              disabled={isLimitReached}
            >
              <Plus className="w-4 h-4" />
              Adicionar Valor
            </Button>
          </div>

          {valores?.length === 0 ? (
            <Card className="p-8 text-center">
              <Dna className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Nenhum valor adicionado
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Comece definindo os valores do DNA da empresa
              </p>
              <Button
                type="button"
                onClick={addValor}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Adicionar Primeiro Valor
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {valores?.map((valor, index) => (
                <ValorItemEditor
                  key={index}
                  valor={valor}
                  index={index}
                  onValorChange={handleValorChange}
                  onRemove={removeValor}
                />
              ))}
            </div>
          )}

          {isLimitReached && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <span className="font-semibold">Limite atingido:</span> Você atingiu o máximo de 6 valores. 
                Remova algum valor antes de adicionar novos para manter a seção limpa e eficiente.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={Dna}
      title="DNA da Empresa"
      description="Gerencie os valores e princípios que definem o DNA da Tegbe"
      exists={!!exists}
      itemName="Seção DNA"
    >
      <form onSubmit={handleSubmitWrapper} className="space-y-6 pb-32">
        {/* Seção Badge */}
        <div className="space-y-4">
          <SectionHeader
            title="Badge"
            section="badge"
            icon={Dna}
            isExpanded={expandedSections.badge}
            onToggle={toggleSection}
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

        {/* Seção Título */}
        <div className="space-y-4">
          <SectionHeader
            title="Título e Introdução"
            section="titulo"
            icon={Type}
            isExpanded={expandedSections.titulo}
            onToggle={toggleSection}
          />

          <AnimatePresence>
            {expandedSections.titulo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderTituloSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção Valores */}
        <div className="space-y-4">
          <SectionHeader
            title="Valores do DNA"
            section="valores"
            icon={Palette}
            isExpanded={expandedSections.valores}
            onToggle={toggleSection}
          />

          <AnimatePresence>
            {expandedSections.valores && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderValoresSection()}
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
          icon={Dna}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={dnaData?.dna?.valores.length}
        itemName="Valor"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}