/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Switch } from "@/components/Switch";
import { 
  Layers,
  Grid,
  Settings,
  Tag,
  ImageIcon,
  CheckCircle2,
  Plus,
  TrendingUp,
  PlayCircle
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";
import { ImageUpload } from "@/components/ImageUpload";

interface Estagio {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

interface FluxoEstagiosData {
  id: string;
  type: string;
  subtype: string;
  values: Estagio[];
}

const defaultFluxoEstagiosData: FluxoEstagiosData = {
  id: "fluxo-estagios-ecommerce",
  type: "",
  subtype: "",
  values: [
    {
      id: 1,
      title: "",
      subtitle: "",
      description: "V",
      image: ""
    },
  ]
};

const mergeWithDefaults = (apiData: any, defaultData: FluxoEstagiosData): FluxoEstagiosData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id || defaultData.id,
    type: apiData.type || defaultData.type,
    subtype: apiData.subtype || defaultData.subtype,
    values: apiData.values || defaultData.values,
  };
};

export default function FluxoEstagiosEcommercePage() {
  const {
    data: pageData,
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
    fileStates,
    setFileState,
  } = useJsonManagement<FluxoEstagiosData>({
    apiPath: "/api/tegbe-institucional/json/passos",
    defaultData: defaultFluxoEstagiosData,
    mergeFunction: mergeWithDefaults,
  });

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    estagios: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para gerenciar estágios
  const handleAddEstagio = () => {
    const newId = Math.max(...pageData.values.map(e => e.id), 0) + 1;
    const newEstagio: Estagio = {
      id: newId,
      title: "",
      subtitle: "",
      description: "",
      image: ""
    };
    const updatedEstagios = [...pageData.values, newEstagio];
    updateNested('values', updatedEstagios);
  };

  const handleUpdateEstagio = (index: number, updates: Partial<Estagio>) => {
    const updatedEstagios = [...pageData.values];
    updatedEstagios[index] = { ...updatedEstagios[index], ...updates };
    updateNested('values', updatedEstagios);
  };

  const handleRemoveEstagio = (index: number) => {
    const updatedEstagios = pageData.values.filter((_, i) => i !== index);
    updateNested('values', updatedEstagios);
  };

  // Função para mover estágio para cima
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updatedEstagios = [...pageData.values];
    const [item] = updatedEstagios.splice(index, 1);
    updatedEstagios.splice(index - 1, 0, item);
    updateNested('values', updatedEstagios);
  };

  // Função para mover estágio para baixo
  const handleMoveDown = (index: number) => {
    if (index === pageData.values.length - 1) return;
    const updatedEstagios = [...pageData.values];
    const [item] = updatedEstagios.splice(index, 1);
    updatedEstagios.splice(index + 1, 0, item);
    updateNested('values', updatedEstagios);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Função auxiliar para obter File do fileStates
  const getFileFromState = (key: string): File | null => {
    const value = fileStates[key];
    return value instanceof File ? value : null;
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Informações básicas
    total += 2; // Apenas type e subtype (id não é editável)
    if (pageData.type.trim()) completed++;
    if (pageData.subtype.trim()) completed++;

    // Estágios
    total += pageData.values.length * 4;
    pageData.values.forEach(estagio => {
      if (estagio.title.trim()) completed++;
      if (estagio.subtitle.trim()) completed++;
      if (estagio.description.trim()) completed++;
      if (estagio.image.trim()) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  const getStageIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case "aprender":
        return <PlayCircle className="w-5 h-5" />;
      case "começar":
        return <TrendingUp className="w-5 h-5" />;
      case "estruturar":
        return <Layers className="w-5 h-5" />;
      case "performar":
        return <Grid className="w-5 h-5" />;
      default:
        return <div className="w-5 h-5 flex items-center justify-center">{pageData.values.findIndex(e => e.title === title) + 1}</div>;
    }
  };

  if (loading && !exists) {
    return <Loading layout={Layers} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Layers}
      title="Fluxo de Estágios - E-commerce"
      description="Gerenciamento da jornada do cliente no e-commerce, da base ao nível elite"
      exists={!!exists}
      itemName="Fluxo de Estágios"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Básica - ID oculto */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações da Seção"
            section="basic"
            icon={Settings}
            isExpanded={expandedSections.basic}
            onToggle={() => toggleSection("basic")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.basic ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Tipo de Conteúdo"
                    value={pageData.type}
                    onChange={(e) => updateNested('type', e.target.value)}
                    placeholder="Tipo de conteúdo"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Subtipo/Categoria"
                    value={pageData.subtype}
                    onChange={(e) => updateNested('subtype', e.target.value)}
                    placeholder="Subtipo/categoria"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Estágios */}
        <div className="space-y-4">
          <SectionHeader
            title="Estágios da Jornada E-commerce"
            section="estagios"
            icon={Layers}
            isExpanded={expandedSections.estagios}
            onToggle={() => toggleSection("estagios")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.estagios ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Sequência da Jornada do Cliente
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {pageData.values.filter(e => e.title && e.description && e.image).length} de {pageData.values.length} completos
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        • Ordem: {pageData.values.map(e => e.id).join(' → ')}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddEstagio}
                    variant="primary"
                    className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Estágio
                  </Button>
                </div>
                <p className="text-sm text-[var(--color-secondary)]/70 mt-2">
                  Configure os estágios da jornada do cliente no e-commerce em sequência lógica
                </p>
              </div>

              <div className="space-y-6">
                {pageData.values.map((estagio, index) => (
                  <div 
                    key={estagio.id}
                    className="p-6 border border-[var(--color-border)] rounded-lg space-y-6 hover:border-[var(--color-primary)]/50 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Controles de ordenação e indicador de posição */}
                        <div className="flex flex-col items-center">
                          <div className="p-2 rounded bg-[var(--color-primary)]/10">
                            <span className="text-sm font-medium text-[var(--color-primary)]">
                              {getStageIcon(estagio.title)}
                            </span>
                          </div>
                          
                          <div className="flex flex-col gap-1 mt-2">
                            <button
                              type="button"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              className={`p-1 rounded ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--color-border)]'}`}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === pageData.values.length - 1}
                              className={`p-1 rounded ${index === pageData.values.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--color-border)]'}`}
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <h4 className="font-medium text-[var(--color-secondary)]">
                              {estagio.title || "Novo Estágio"}
                            </h4>
                            {estagio.title && estagio.description && estagio.image ? (
                              <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                Completo
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                Incompleto
                              </span>
                            )}
                            <span className="px-2 py-1 text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full">
                              Estágio {index + 1} de {pageData.values.length}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Coluna 1: Informações básicas */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Nome do Estágio
                                </label>
                                <Input
                                  value={estagio.title}
                                  onChange={(e) => handleUpdateEstagio(index, { title: e.target.value })}
                                  placeholder="Ex: Aprender, Começar, Estruturar"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Subtítulo/Chamada
                                </label>
                                <Input
                                  value={estagio.subtitle}
                                  onChange={(e) => handleUpdateEstagio(index, { subtitle: e.target.value })}
                                  placeholder="Ex: Do zero ao primeiro faturamento"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                            </div>
                            
                            {/* Coluna 2: Descrição */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Descrição Detalhada
                                </label>
                                <TextArea
                                  value={estagio.description}
                                  onChange={(e) => handleUpdateEstagio(index, { description: e.target.value })}
                                  placeholder="Descreva o que o cliente aprende/ganha neste estágio, benefícios, diferenciais..."
                                  rows={7}
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                            </div>
                            
                            {/* Coluna 3: Imagem */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Imagem Ilustrativa
                                </label>
                                <ImageUpload
                                  label=""
                                  currentImage={estagio.image || ''}
                                  selectedFile={getFileFromState(`values.${index}.image`)}
                                  onFileChange={(file) => setFileState(`values.${index}.image`, file)}
                                  aspectRatio="aspect-video"
                                  previewWidth={300}
                                  previewHeight={200}
                                  description="Imagem representativa do estágio (formato recomendado: 16:9)"
                                />
                              </div>
                              
                              <div className="pt-4">
                                <Button
                                  type="button"
                                  onClick={() => handleRemoveEstagio(index)}
                                  variant="danger"
                                  className="w-full bg-red-600 hover:bg-red-700 border-none"
                                >
                                  Remover Estágio
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pageData.values.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-background-body)] mb-4">
                    <Layers className="w-8 h-8 text-[var(--color-secondary)]/50" />
                  </div>
                  <h4 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                    Nenhum estágio definido
                  </h4>
                  <p className="text-sm text-[var(--color-secondary)]/70 mb-6">
                    Comece definindo a jornada do cliente no e-commerce
                  </p>
                  <Button
                    type="button"
                    onClick={handleAddEstagio}
                    variant="primary"
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Estágio
                  </Button>
                </div>
              )}
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
          itemName="Fluxo de Estágios"
          icon={Layers}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Fluxo de Estágios"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}