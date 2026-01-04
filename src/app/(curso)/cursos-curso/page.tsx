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
  Layers,
  Tag,
  Type,
  ChevronDown, 
  ChevronUp,
  Plus,
  Trash2,
  Settings,
  Sparkles,
  ArrowRight,
  Grid,
  ListChecks,
  Hash,
  Wrench,
  Target,
  Users,
  Bot
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import IconSelector from "@/components/IconSelector";

interface Module {
  id: string;
  phase: string;
  title: string;
  description: string;
  tags: string[];
  icon: string;
}

interface CTA {
  text: string;
  link: string;
}

interface Header {
  badge: string;
  title: string;
  subtitle: string;
}

interface TegProData {
  id?: string;
  header: Header;
  modules: Module[];
  cta: CTA;
  [key: string]: any;
}

const defaultTegProData: TegProData = {
  header: {
    badge: "O Protocolo TegPro",
    title: "Engenharia Reversa da Venda",
    subtitle: "Não é um curso. É a instalação do nosso sistema operacional dentro da sua empresa, dividido em 4 fases de execução."
  },
  modules: [
    {
      id: "01",
      phase: "FASE DE FUNDAÇÃO",
      title: "Setup da Máquina",
      description: "Antes de acelerar, blindamos o chassi. Configuramos seu Business Manager, estruturamos o CRM (Kommo/Bitrix) e definimos os KPIs que realmente importam. Sem isso, o tráfego é desperdício.",
      tags: ["Setup Técnico", "Governança", "KPIs"],
      icon: "ph:wrench-bold"
    },
    {
      id: "02",
      phase: "FASE DE TRAÇÃO",
      title: "Tráfego de Alta Intenção",
      description: "Esqueça métricas de vaidade. Ensinamos a criar campanhas que buscam o 'lead comprador'. Estratégias de Google Ads (Fundo de Funil) e Meta Ads (Criação de Demanda) validadas com milhões em verba.",
      tags: ["Google Ads", "Meta Ads", "Tracking"],
      icon: "ph:target-bold"
    },
    {
      id: "03",
      phase: "FASE DE CONVERSÃO",
      title: "Comercial & Scripts",
      description: "O tráfego traz o lead, o processo traz o dinheiro. Entregamos nossos scripts de vendas, playbooks de contorno de objeções e rituais de gestão para seu time fechar mais contratos.",
      tags: ["Playbook de Vendas", "Spin Selling", "Gestão"],
      icon: "ph:users-three-bold"
    },
    {
      id: "04",
      phase: "FASE DE ESCALA",
      title: "Automação & LTV",
      description: "Hora de tirar o humano do processo repetitivo. Implementação de automações de follow-up, recuperação de vendas e estratégias de upsell para aumentar o valor vitalício do cliente.",
      tags: ["Automação", "Z-API", "Recompra"],
      icon: "ph:robot-bold"
    }
  ],
  cta: {
    text: "Ver Grade Detalhada",
    link: "#grade"
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

// Componente para editar Tags
interface TagsEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  label?: string;
}

const TagsEditor = ({ tags, onChange, label = "Tags" }: TagsEditorProps) => {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onChange([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
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
          value={newTag}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma tag e pressione Enter"
        />
        <Button
          type="button"
          onClick={addTag}
        >
          Adicionar
        </Button>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm"
            >
              <span className="text-zinc-700 dark:text-zinc-300">{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="text-zinc-500 hover:text-red-500"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">Nenhuma tag adicionada</p>
      )}
    </div>
  );
};

// Componente ModuleEditor
interface ModuleEditorProps {
  module: Module;
  index: number;
  onChange: (module: Module) => void;
  onRemove: () => void;
}

const ModuleEditor = ({ module, index, onChange, onRemove }: ModuleEditorProps) => {
  const updateModule = (field: keyof Module, value: any) => {
    onChange({ ...module, [field]: value });
  };

  const getModuleIcon = (index: number) => {
    switch (index) {
      case 0: return Wrench;
      case 1: return Target;
      case 2: return Users;
      case 3: return Bot;
      default: return ListChecks;
    }
  };

  const ModuleIcon = getModuleIcon(index);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <ModuleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">
              Módulo {module.id}: {module.title || "Sem título"}
            </h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {module.phase || "Sem fase definida"}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna 1: Informações básicas */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                ID do Módulo
              </label>
              <Input
                type="text"
                value={module.id}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateModule("id", e.target.value)
                }
                placeholder="01"
              />
            </div>

            <div>
              <IconSelector
                value={module.icon}
                onChange={(value) => updateModule("icon", value)}
                label="Ícone do Módulo"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Fase
            </label>
            <Input
              type="text"
              value={module.phase}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateModule("phase", e.target.value)
              }
              placeholder="FASE DE FUNDAÇÃO"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Título
            </label>
            <Input
              type="text"
              value={module.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateModule("title", e.target.value)
              }
              placeholder="Setup da Máquina"
            />
          </div>
        </div>

        {/* Coluna 2: Descrição e Tags */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Descrição
            </label>
            <textarea
              value={module.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                updateModule("description", e.target.value)
              }
              rows={4}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="Descreva detalhadamente o módulo..."
            />
          </div>

          <TagsEditor
            tags={module.tags}
            onChange={(tags) => updateModule("tags", tags)}
            label="Tags do Módulo"
          />
        </div>
      </div>
    </Card>
  );
};

export default function TegProProtocolPage() {
  const {
    data: tegProData,
    setData: setTegProData,
    updateNested,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload
  } = useJsonManagement<TegProData>({
    apiPath: "/api/tegbe-institucional/json/cursos",
    defaultData: defaultTegProData,
  });

  const [expandedSections, setExpandedSections] = useState({
    header: true,
    modules: true,
    cta: true
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });

  // Processar os dados para mesclar propriedades
  const [processedData, setProcessedData] = useState<TegProData>(defaultTegProData);

  useEffect(() => {
    if (tegProData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProcessedData(tegProData);
    }
  }, [tegProData]);

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
    
    // Verificar modules
    if (processedData.modules.length > 0) {
      const hasValidModules = processedData.modules.some(module => 
        module.id.trim() !== "" && 
        module.phase.trim() !== "" &&
        module.title.trim() !== "" &&
        module.description.trim() !== ""
      );
      if (hasValidModules) count++;
    }
    
    // Verificar cta
    if (
      processedData.cta.text.trim() !== "" &&
      processedData.cta.link.trim() !== ""
    ) {
      count++;
    }
    
    return count;
  }, [processedData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 3; // header, modules, cta

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    updateNested(path, value);
  };

  const handleModuleChange = (index: number, module: Module) => {
    const newModules = [...processedData.modules];
    newModules[index] = module;
    handleChange("modules", newModules);
  };

  const addModule = () => {
    const newId = (processedData.modules.length + 1).toString().padStart(2, '0');
    const newModule: Module = {
      id: newId,
      phase: "",
      title: "",
      description: "",
      tags: [],
      icon: "ph:rocket-bold"
    };
    handleChange("modules", [...processedData.modules, newModule]);
  };

  const removeModule = (index: number) => {
    const newModules = processedData.modules.filter((_, i) => i !== index);
    handleChange("modules", newModules);
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      await save();
      await reload();
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
    }
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODOS OS CONTEÚDOS DO PROTOCOLO"
    });
  };

  const confirmDelete = async () => {
    await fetch("/api/tegbe-institucional/json/cursos", {
      method: "DELETE",
    });

    setTegProData(defaultTegProData);
    setProcessedData(defaultTegProData);
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
              placeholder="O Protocolo TegPro"
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
              placeholder="Engenharia Reversa da Venda"
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
            placeholder="Não é um curso. É a instalação do nosso sistema operacional dentro da sua empresa..."
          />
        </div>
      </div>
    );
  };

  const renderCTASection = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Texto do CTA
            </label>
            <Input
              type="text"
              value={processedData.cta.text}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("cta.text", e.target.value)
              }
              placeholder="Ver Grade Detalhada"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Link do CTA
            </label>
            <Input
              type="text"
              value={processedData.cta.link}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("cta.link", e.target.value)
              }
              placeholder="#grade"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={Layers}
      title="Cursos TegPro"
      description="Gerencie o conteúdo do sistema de cursos da venda em 4 fases"
      exists={!!exists}
      itemName="Cursos TegPro"
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

        {/* Seção Módulos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <SectionHeader
              title={`Módulos (${processedData.modules.length} fases)`}
              section="modules"
              icon={Grid}
              isExpanded={expandedSections.modules}
              onToggle={() => toggleSection("modules")}
            />
            <Button
              type="button"
              onClick={addModule}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Módulo
            </Button>
          </div>

          <AnimatePresence>
            {expandedSections.modules && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {processedData.modules.length === 0 ? (
                    <div className="text-center py-12">
                      <Grid className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Nenhum módulo adicionado
                      </h4>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                        Adicione os módulos que compõem o protocolo TegPro
                      </p>
                      <Button
                        type="button"
                        onClick={addModule}
                        className="flex items-center gap-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Primeiro Módulo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {processedData.modules.map((module, index) => (
                        <ModuleEditor
                          key={index}
                          module={module}
                          index={index}
                          onChange={(updatedModule) => handleModuleChange(index, updatedModule)}
                          onRemove={() => removeModule(index)}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção CTA */}
        <div className="space-y-4">
          <SectionHeader
            title="Call to Action"
            section="cta"
            icon={ArrowRight}
            isExpanded={expandedSections.cta}
            onToggle={() => toggleSection("cta")}
          />

          <AnimatePresence>
            {expandedSections.cta && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderCTASection()}
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
          itemName="Protocolo TegPro"
          icon={Layers}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={processedData.modules.length}
        itemName="Módulo"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}