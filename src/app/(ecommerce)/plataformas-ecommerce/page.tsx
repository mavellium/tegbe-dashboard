/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { 
  ShoppingBag,
  Grid,
  Settings,
  CheckCircle2,
  Plus,
  ExternalLink,
  MessageCircle,
  ArrowRight
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";
import { ImageUpload } from "@/components/ImageUpload";

interface Plataforma {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

interface CTAData {
  text: string;
  url: string;
  description: string;
}

interface PlataformasData {
  id: string;
  type: string;
  subtype: string;
  values: Plataforma[];
  cta: CTAData;
}

const defaultPlataformasData: PlataformasData = {
  id: "plataformas-marketing",
  type: "",
  subtype: "",
  values: [
    {
      id: 1,
      title: "",
      subtitle: "",
      description: "",
      image: ""
    }
  ],
  cta: {
    text: "",
    url: "",
    description: ""
  }
};

const mergeWithDefaults = (apiData: any, defaultData: PlataformasData): PlataformasData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id || defaultData.id,
    type: apiData.type || defaultData.type,
    subtype: apiData.subtype || defaultData.subtype,
    values: apiData.values || defaultData.values,
    cta: apiData.cta || defaultData.cta
  };
};

export default function PlataformasMarketingPage() {
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
  } = useJsonManagement<PlataformasData>({
    apiPath: "/api/tegbe-institucional/json/plataformas",
    defaultData: defaultPlataformasData,
    mergeFunction: mergeWithDefaults,
  });

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    plataformas: false,
    cta: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para gerenciar plataformas
  const handleAddPlataforma = () => {
    const newId = Math.max(...pageData.values.map(p => p.id), 0) + 1;
    const newPlataforma: Plataforma = {
      id: newId,
      title: "",
      subtitle: "",
      description: "",
      image: ""
    };
    const updatedPlataformas = [...pageData.values, newPlataforma];
    updateNested('values', updatedPlataformas);
  };

  const handleUpdatePlataforma = (index: number, updates: Partial<Plataforma>) => {
    const updatedPlataformas = [...pageData.values];
    updatedPlataformas[index] = { ...updatedPlataformas[index], ...updates };
    updateNested('values', updatedPlataformas);
  };

  const handleRemovePlataforma = (index: number) => {
    const updatedPlataformas = pageData.values.filter((_, i) => i !== index);
    updateNested('values', updatedPlataformas);
  };

  // Funções para gerenciar CTA
  const handleCTAChange = (field: keyof CTAData, value: string) => {
    updateNested(`cta.${field}`, value);
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
    total += 3;
    if (pageData.id.trim()) completed++;
    if (pageData.type.trim()) completed++;
    if (pageData.subtype.trim()) completed++;

    // Plataformas
    total += pageData.values.length * 4;
    pageData.values.forEach(plataforma => {
      if (plataforma.title.trim()) completed++;
      if (plataforma.subtitle.trim()) completed++;
      if (plataforma.description.trim()) completed++;
      if (plataforma.image.trim()) completed++;
    });

    // CTA
    total += 3;
    if (pageData.cta.text.trim()) completed++;
    if (pageData.cta.url.trim()) completed++;
    if (pageData.cta.description.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Grid} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={ShoppingBag}
      title="Plataformas de Marketing"
      description="Gerenciamento das plataformas de marketing onde atuamos como especialistas"
      exists={!!exists}
      itemName="Plataformas de Marketing"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Básica */}
        <div className="space-y-4">
          <SectionHeader
            title="Informações da Seção"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                    ID (não editável)
                  </label>
                  <Input
                    value={pageData.id}
                    readOnly
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] opacity-70 cursor-not-allowed"
                  />
                </div>

                <Input
                  label="Tipo"
                  value={pageData.type}
                  onChange={(e) => updateNested('type', e.target.value)}
                  placeholder="Ex: Plataformas"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <Input
                  label="Subtipo"
                  value={pageData.subtype}
                  onChange={(e) => updateNested('subtype', e.target.value)}
                  placeholder="Ex: Plataformas que utilizamos para escalar seu negócio"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Plataformas */}
        <div className="space-y-4">
          <SectionHeader
            title="Plataformas de Marketing"
            section="plataformas"
            icon={Grid}
            isExpanded={expandedSections.plataformas}
            onToggle={() => toggleSection("plataformas")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.plataformas ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Plataformas onde atuamos
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {pageData.values.filter(p => p.title && p.description && p.image).length} de {pageData.values.length} completas
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddPlataforma}
                    variant="primary"
                    className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Plataforma
                  </Button>
                </div>
                <p className="text-sm text-[var(--color-secondary)]/70 mt-2">
                  Adicione e configure as plataformas de marketing onde sua empresa é especialista
                </p>
              </div>

              <div className="space-y-6">
                {pageData.values.map((plataforma, index) => (
                  <div 
                    key={plataforma.id}
                    className="p-6 border border-[var(--color-border)] rounded-lg space-y-6 hover:border-[var(--color-primary)]/50 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Indicador de posição */}
                        <div className="flex flex-col items-center">
                          <div className="p-2 rounded bg-[var(--color-primary)]/10">
                            <span className="text-sm font-medium text-[var(--color-primary)]">
                              #{plataforma.id}
                            </span>
                          </div>
                          <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <h4 className="font-medium text-[var(--color-secondary)]">
                              {plataforma.title || "Nova Plataforma"}
                            </h4>
                            {plataforma.title && plataforma.description && plataforma.image ? (
                              <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                Completa
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                Incompleta
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Coluna 1: Informações básicas */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Nome da Plataforma
                                </label>
                                <Input
                                  value={plataforma.title}
                                  onChange={(e) => handleUpdatePlataforma(index, { title: e.target.value })}
                                  placeholder="Ex: Meta Ads, Google Ads, TikTok Ads"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Subtítulo/Especialização
                                </label>
                                <Input
                                  value={plataforma.subtitle}
                                  onChange={(e) => handleUpdatePlataforma(index, { subtitle: e.target.value })}
                                  placeholder="Ex: Gestão de Tráfego Pago"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                            </div>
                            
                            {/* Coluna 2: Descrição */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Descrição da Especialização
                                </label>
                                <TextArea
                                  value={plataforma.description}
                                  onChange={(e) => handleUpdatePlataforma(index, { description: e.target.value })}
                                  placeholder="Descreva sua expertise nesta plataforma, serviços oferecidos, diferenciais, etc."
                                  rows={5}
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                            </div>
                            
                            {/* Coluna 3: Logo/Imagem */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Logo da Plataforma
                                </label>
                                <ImageUpload
                                  label=""
                                  currentImage={plataforma.image || ''}
                                  selectedFile={getFileFromState(`values.${index}.image`)}
                                  onFileChange={(file) => setFileState(`values.${index}.image`, file)}
                                  aspectRatio="aspect-square"
                                  previewWidth={200}
                                  previewHeight={200}
                                  description="Logo oficial da plataforma em formato SVG ou PNG transparente"
                                />
                              </div>
                              
                              <div className="pt-4">
                                <Button
                                  type="button"
                                  onClick={() => handleRemovePlataforma(index)}
                                  variant="danger"
                                  className="w-full bg-red-600 hover:bg-red-700 border-none"
                                >
                                  Remover Plataforma
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
                    <ShoppingBag className="w-8 h-8 text-[var(--color-secondary)]/50" />
                  </div>
                  <h4 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                    Nenhuma plataforma adicionada
                  </h4>
                  <p className="text-sm text-[var(--color-secondary)]/70 mb-6">
                    Comece adicionando as plataformas de marketing onde sua empresa atua
                  </p>
                  <Button
                    type="button"
                    onClick={handleAddPlataforma}
                    variant="primary"
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeira Plataforma
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Seção CTA */}
        <div className="space-y-4">
          <SectionHeader
            title="Call to Action"
            section="cta"
            icon={MessageCircle}
            isExpanded={expandedSections.cta}
            onToggle={() => toggleSection("cta")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.cta ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                        Texto do Botão
                      </label>
                      <Input
                        type="text"
                        value={pageData.cta.text || ""}
                        onChange={(e) => handleCTAChange("text", e.target.value)}
                        placeholder="Ex: Quero Estruturar e Escalar Meu Negócio"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                        URL de Destino
                      </label>
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-[var(--color-secondary)]" />
                        <Input
                          type="text"
                          value={pageData.cta.url || ""}
                          onChange={(e) => handleCTAChange("url", e.target.value)}
                          placeholder="Ex: https://api.whatsapp.com/send?phone=5514991779502"
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                        Descrição do CTA
                      </label>
                      <TextArea
                        value={pageData.cta.description || ""}
                        onChange={(e) => handleCTAChange("description", e.target.value)}
                        placeholder="Ex: Integração completa de plataformas para escalar seus resultados."
                        rows={4}
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                  </div>
                </div>
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
          itemName="Plataformas de Marketing"
          icon={ShoppingBag}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Seção de Plataformas de Marketing"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}