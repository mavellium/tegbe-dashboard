/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Switch } from "@/components/Switch";
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
  Bot,
  CheckCircle2,
  AlertCircle,
  XCircle,
  GripVertical,
  Zap
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
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

const mergeWithDefaults = (apiData: any, defaultData: TegProData): TegProData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id,
    header: {
      badge: apiData.header?.badge || defaultData.header.badge,
      title: apiData.header?.title || defaultData.header.title,
      subtitle: apiData.header?.subtitle || defaultData.header.subtitle,
    },
    modules: apiData.modules || defaultData.modules,
    cta: {
      text: apiData.cta?.text || defaultData.cta.text,
      link: apiData.cta?.link || defaultData.cta.link,
    },
  };
};

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
      <label className="block text-sm font-medium text-[var(--color-secondary)]">
        {label}
      </label>
      
      <div className="flex gap-2 mb-3">
        <Input
          type="text"
          value={newTag}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma tag e pressione Enter"
          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
        />
        <Button
          type="button"
          onClick={addTag}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
        >
          Adicionar
        </Button>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-background-body)] rounded-full text-sm border border-[var(--color-border)]"
            >
              <span className="text-[var(--color-secondary)]">{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="text-[var(--color-secondary)]/50 hover:text-red-500"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-secondary)]/70">Nenhuma tag adicionada</p>
      )}
    </div>
  );
};

export default function TegProProtocolPage() {
  const {
    data: tegProData,
    exists,
    loading,
    success,
    errorMsg,
    deleteModal,
    updateNested,
    save,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
  } = useJsonManagement<TegProData>({
    apiPath: "/api/tegbe-institucional/json/cursos",
    defaultData: defaultTegProData,
    mergeFunction: mergeWithDefaults,
  });

  const [expandedSections, setExpandedSections] = useState({
    header: true,
    modules: true,
    cta: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddModule = () => {
    const newModule: Module = {
      id: `${tegProData.modules.length + 1}`.padStart(2, '0'),
      phase: "",
      title: "",
      description: "",
      tags: [],
      icon: "ph:rocket-bold"
    };
    const updatedModules = [...tegProData.modules, newModule];
    updateNested('modules', updatedModules);
  };

  const handleUpdateModule = (index: number, updates: Partial<Module>) => {
    const updatedModules = [...tegProData.modules];
    updatedModules[index] = { ...updatedModules[index], ...updates };
    updateNested('modules', updatedModules);
  };

  const handleRemoveModule = (index: number) => {
    const updatedModules = tegProData.modules.filter((_, i) => i !== index);
    updateNested('modules', updatedModules);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Header
    total += 3;
    if (tegProData.header.badge.trim()) completed++;
    if (tegProData.header.title.trim()) completed++;
    if (tegProData.header.subtitle.trim()) completed++;

    // Modules
    total += tegProData.modules.length * 5;
    tegProData.modules.forEach(module => {
      if (module.id.trim()) completed++;
      if (module.phase.trim()) completed++;
      if (module.title.trim()) completed++;
      if (module.description.trim()) completed++;
      if (module.icon.trim()) completed++;
    });

    // CTA
    total += 2;
    if (tegProData.cta.text.trim()) completed++;
    if (tegProData.cta.link.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layers} exists={!!exists} />;
  }

  const getModuleIcon = (index: number) => {
    switch (index) {
      case 0: return Wrench;
      case 1: return Target;
      case 2: return Users;
      case 3: return Bot;
      default: return ListChecks;
    }
  };

  return (
    <ManageLayout
      headerIcon={Layers}
      title="Cursos TegPro"
      description="Gerencie o conteúdo do sistema de cursos da venda em 4 fases"
      exists={!!exists}
      itemName="Cursos TegPro"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho"
            section="header"
            icon={Tag}
            isExpanded={expandedSections.header}
            onToggle={() => toggleSection("header")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.header ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Badge"
                  value={tegProData.header.badge}
                  onChange={(e) => updateNested('header.badge', e.target.value)}
                  placeholder="O Protocolo TegPro"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <Input
                  label="Título"
                  value={tegProData.header.title}
                  onChange={(e) => updateNested('header.title', e.target.value)}
                  placeholder="Engenharia Reversa da Venda"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <div className="md:col-span-2">
                  <TextArea
                    label="Subtítulo"
                    value={tegProData.header.subtitle}
                    onChange={(e) => updateNested('header.subtitle', e.target.value)}
                    placeholder="Não é um curso. É a instalação do nosso sistema operacional dentro da sua empresa..."
                    rows={3}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Módulos */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <SectionHeader
              title={`Módulos (${tegProData.modules.length} fases)`}
              section="modules"
              icon={Grid}
              isExpanded={expandedSections.modules}
              onToggle={() => toggleSection("modules")}
            />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-[var(--color-secondary)]/70">
                  {tegProData.modules.filter(m => m.title && m.description && m.icon).length} de {tegProData.modules.length} completos
                </span>
              </div>
              <Button
                type="button"
                onClick={handleAddModule}
                variant="primary"
                className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Módulo
              </Button>
            </div>
          </div>

          <motion.div
            initial={false}
            animate={{ height: expandedSections.modules ? "auto" : 0 }}
            className="overflow-hidden"
          >
            {tegProData.modules.length === 0 ? (
              <Card className="p-6 bg-[var(--color-background)]">
                <div className="text-center py-12">
                  <Grid className="w-16 h-16 text-[var(--color-secondary)]/30 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                    Nenhum módulo adicionado
                  </h4>
                  <p className="text-[var(--color-secondary)]/70 mb-6 max-w-md mx-auto">
                    Adicione os módulos que compõem o protocolo TegPro
                  </p>
                  <Button
                    type="button"
                    onClick={handleAddModule}
                    variant="primary"
                    className="mx-auto bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Módulo
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {tegProData.modules.map((module, index) => {
                  const ModuleIcon = getModuleIcon(index);
                  return (
                    <Card key={index} className="p-6 bg-[var(--color-background)]">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                            <ModuleIcon className="w-5 h-5 text-[var(--color-primary)]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-[var(--color-secondary)]">
                              Módulo {module.id}: {module.title || "Sem título"}
                            </h4>
                            <p className="text-sm text-[var(--color-secondary)]/70">
                              {module.phase || "Sem fase definida"}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => handleRemoveModule(index)}
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 border-none"
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
                              <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                                ID do Módulo
                              </label>
                              <Input
                                value={module.id}
                                onChange={(e) => handleUpdateModule(index, { id: e.target.value })}
                                placeholder="01"
                                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                              />
                            </div>

                            <div>
                              <IconSelector
                                value={module.icon}
                                onChange={(value) => handleUpdateModule(index, { icon: value })}
                                label="Ícone do Módulo"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                              Fase
                            </label>
                            <Input
                              value={module.phase}
                              onChange={(e) => handleUpdateModule(index, { phase: e.target.value })}
                              placeholder="FASE DE FUNDAÇÃO"
                              className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                              Título
                            </label>
                            <Input
                              value={module.title}
                              onChange={(e) => handleUpdateModule(index, { title: e.target.value })}
                              placeholder="Setup da Máquina"
                              className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                            />
                          </div>
                        </div>

                        {/* Coluna 2: Descrição e Tags */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                              Descrição
                            </label>
                            <TextArea
                              value={module.description}
                              onChange={(e) => handleUpdateModule(index, { description: e.target.value })}
                              placeholder="Descreva detalhadamente o módulo..."
                              rows={4}
                              className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                            />
                          </div>

                          <TagsEditor
                            tags={module.tags}
                            onChange={(tags) => handleUpdateModule(index, { tags })}
                            label="Tags do Módulo"
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>
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

          <motion.div
            initial={false}
            animate={{ height: expandedSections.cta ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Texto do CTA"
                  value={tegProData.cta.text}
                  onChange={(e) => updateNested('cta.text', e.target.value)}
                  placeholder="Ver Grade Detalhada"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <Input
                  label="Link do CTA"
                  value={tegProData.cta.link}
                  onChange={(e) => updateNested('cta.link', e.target.value)}
                  placeholder="#grade"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>
            </Card>
          </motion.div>
        </div>

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          isAddDisabled={false}
          isSaving={loading}
          exists={!!exists}
          completeCount={completion.completed}
          totalCount={completion.total}
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
        totalItems={tegProData.modules.length}
        itemName="Módulo"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}