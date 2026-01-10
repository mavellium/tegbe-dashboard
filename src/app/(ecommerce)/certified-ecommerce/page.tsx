/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { 
  Award,
  Shield,
  Settings,
  Type,
  ImageIcon,
  BadgeCheck,
  Sparkles,
  LinkIcon,
  ListChecks
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";
import { ImageUpload } from "@/components/ImageUpload";

interface TitleSection {
  main: string;
  highlight: string;
}

interface ImagesSection {
  consultant: string;
  seal: string;
}

interface CTA {
  text: string;
  link: string;
}

interface CertificacaoMLData {
  id: string;
  type: string;
  subtype: string;
  values: {
    badge: string;
    title: TitleSection;
    descriptions: string[];
    images: ImagesSection;
    cta: CTA;
  };
}

const defaultCertificacaoMLData: CertificacaoMLData = {
  id: "secao-certificacao-ml",
  type: "",
  subtype: "",
  values: {
    badge: "",
    title: {
      main: "",
      highlight: ""
    },
    descriptions: [
      "",
      ""
    ],
    images: {
      consultant: "",
      seal: ""
    },
    cta: {
      text: "",
      link: ""
    }
  }
};

const mergeWithDefaults = (apiData: any, defaultData: CertificacaoMLData): CertificacaoMLData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id || defaultData.id,
    type: apiData.type || defaultData.type,
    subtype: apiData.subtype || defaultData.subtype,
    values: {
      badge: apiData.values?.badge || defaultData.values.badge,
      title: apiData.values?.title || defaultData.values.title,
      descriptions: apiData.values?.descriptions || defaultData.values.descriptions,
      images: apiData.values?.images || defaultData.values.images,
      cta: apiData.values?.cta || defaultData.values.cta,
    }
  };
};

export default function CertificacaoMLPage() {
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
  } = useJsonManagement<CertificacaoMLData>({
    apiPath: "/api/tegbe-institucional/json/certificacao",
    defaultData: defaultCertificacaoMLData,
    mergeFunction: mergeWithDefaults,
  });

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    badge: false,
    title: false,
    descriptions: false,
    images: false,
    cta: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para gerenciar descriptions
  const handleAddDescription = () => {
    const updatedDescriptions = [...pageData.values.descriptions, ""];
    updateNested('values.descriptions', updatedDescriptions);
  };

  const handleUpdateDescription = (index: number, value: string) => {
    const updatedDescriptions = [...pageData.values.descriptions];
    updatedDescriptions[index] = value;
    updateNested('values.descriptions', updatedDescriptions);
  };

  const handleRemoveDescription = (index: number) => {
    const updatedDescriptions = pageData.values.descriptions.filter((_, i) => i !== index);
    updateNested('values.descriptions', updatedDescriptions);
  };

  const handleMoveDescriptionUp = (index: number) => {
    if (index === 0) return;
    const updatedDescriptions = [...pageData.values.descriptions];
    const [item] = updatedDescriptions.splice(index, 1);
    updatedDescriptions.splice(index - 1, 0, item);
    updateNested('values.descriptions', updatedDescriptions);
  };

  const handleMoveDescriptionDown = (index: number) => {
    if (index === pageData.values.descriptions.length - 1) return;
    const updatedDescriptions = [...pageData.values.descriptions];
    const [item] = updatedDescriptions.splice(index, 1);
    updatedDescriptions.splice(index + 1, 0, item);
    updateNested('values.descriptions', updatedDescriptions);
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
    total += 2; // type e subtype
    if (pageData.type.trim()) completed++;
    if (pageData.subtype.trim()) completed++;

    // Badge
    total += 1;
    if (pageData.values.badge.trim()) completed++;

    // Title
    total += 2;
    if (pageData.values.title.main.trim()) completed++;
    if (pageData.values.title.highlight.trim()) completed++;

    // Descriptions
    total += pageData.values.descriptions.length;
    pageData.values.descriptions.forEach(desc => {
      if (desc.trim()) completed++;
    });

    // Images
    total += 2;
    if (pageData.values.images.consultant.trim()) completed++;
    if (pageData.values.images.seal.trim()) completed++;

    // CTA
    total += 2;
    if (pageData.values.cta.text.trim()) completed++;
    if (pageData.values.cta.link.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Shield} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Award}
      title="Seção de Certificação - Mercado Livre"
      description="Gerenciamento da seção de certificação oficial do Mercado Livre"
      exists={!!exists}
      itemName="Certificação ML"
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

        {/* Seção Badge */}
        <div className="space-y-4">
          <SectionHeader
            title="Badge/Certificação"
            section="badge"
            icon={BadgeCheck}
            isExpanded={expandedSections.badge}
            onToggle={() => toggleSection("badge")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.badge ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-4">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                    Badge de Certificação
                  </h4>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    Texto do badge que aparece como selo de certificação
                  </p>
                </div>

                <Input
                  label="Texto do Badge"
                  value={pageData.values.badge}
                  onChange={(e) => updateNested('values.badge', e.target.value)}
                  placeholder="Ex: Parceria Estratégica, Certificado Oficial"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Título */}
        <div className="space-y-4">
          <SectionHeader
            title="Título Principal"
            section="title"
            icon={Type}
            isExpanded={expandedSections.title}
            onToggle={() => toggleSection("title")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.title ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                    Título da Seção
                  </h4>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    Configure o título principal dividido em parte normal e parte destacada
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Parte Principal
                    </label>
                    <Input
                      value={pageData.values.title.main}
                      onChange={(e) => updateNested('values.title.main', e.target.value)}
                      placeholder="Ex: O selo que"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Parte Destacada
                    </label>
                    <div className="relative">
                      <Input
                        value={pageData.values.title.highlight}
                        onChange={(e) => updateNested('values.title.highlight', e.target.value)}
                        placeholder="Ex: destrava o seu lucro."
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
                      />
                      <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-500" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Descriptions */}
        <div className="space-y-4">
          <SectionHeader
            title="Descrições"
            section="descriptions"
            icon={ListChecks}
            isExpanded={expandedSections.descriptions}
            onToggle={() => toggleSection("descriptions")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.descriptions ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                        Textos Descritivos
                      </h4>
                      <p className="text-sm text-[var(--color-secondary)]/70">
                        Parágrafos que explicam a certificação e seus benefícios
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddDescription}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                    >
                      + Adicionar Descrição
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {pageData.values.descriptions.map((desc, index) => (
                    <div key={index} className="p-4 border border-[var(--color-border)] rounded-lg space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Controles de ordenação */}
                          <div className="flex flex-col items-center">
                            <div className="p-2 rounded bg-[var(--color-primary)]/10">
                              <span className="text-sm font-medium text-[var(--color-primary)]">
                                {index + 1}
                              </span>
                            </div>
                            
                            <div className="flex flex-col gap-1 mt-2">
                              <button
                                type="button"
                                onClick={() => handleMoveDescriptionUp(index)}
                                disabled={index === 0}
                                className={`p-1 rounded ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--color-border)]'}`}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveDescriptionDown(index)}
                                disabled={index === pageData.values.descriptions.length - 1}
                                className={`p-1 rounded ${index === pageData.values.descriptions.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--color-border)]'}`}
                              >
                                ↓
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[var(--color-secondary)]">
                                Descrição {index + 1}
                              </span>
                              {desc.trim() ? (
                                <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                  Completa
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                  Vazia
                                </span>
                              )}
                            </div>
                            
                            <TextArea
                              value={desc}
                              onChange={(e) => handleUpdateDescription(index, e.target.value)}
                              placeholder="Digite o texto descritivo. Use *texto* para itálico."
                              rows={3}
                              className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                            />
                            
                            <div className="text-xs text-[var(--color-secondary)]/70">
                              <p className="flex items-center gap-1">
                                <span className="font-medium">Dica:</span> Use *asteriscos* para itálico
                              </p>
                              <p>Exemplo: Somos uma *Consultoria Oficial Certificada* pelo Mercado Livre.</p>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          type="button"
                          onClick={() => handleRemoveDescription(index)}
                          variant="danger"
                          className="bg-red-600 hover:bg-red-700 border-none"
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {pageData.values.descriptions.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-background-body)] mb-3">
                      <Type className="w-6 h-6 text-[var(--color-secondary)]/50" />
                    </div>
                    <h4 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                      Nenhuma descrição adicionada
                    </h4>
                    <p className="text-sm text-[var(--color-secondary)]/70 mb-4">
                      Adicione textos que expliquem a certificação e seus benefícios
                    </p>
                    <Button
                      type="button"
                      onClick={handleAddDescription}
                      variant="primary"
                      className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                    >
                      + Adicionar Primeira Descrição
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Imagens */}
        <div className="space-y-4">
          <SectionHeader
            title="Imagens"
            section="images"
            icon={ImageIcon}
            isExpanded={expandedSections.images}
            onToggle={() => toggleSection("images")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.images ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                    Imagens da Seção
                  </h4>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    Configure as imagens da consultoria e do selo de certificação
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Imagem da Consultoria */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-[var(--color-secondary)] flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Imagem da Consultoria
                    </h5>
                    <p className="text-sm text-[var(--color-secondary)]/70">
                      Foto da equipe ou imagem representativa da consultoria
                    </p>
                    <ImageUpload
                      label=""
                      currentImage={pageData.values.images.consultant || ''}
                      selectedFile={getFileFromState('values.images.consultant')}
                      onFileChange={(file) => setFileState('values.images.consultant', file)}
                      aspectRatio="aspect-square"
                      previewWidth={300}
                      previewHeight={300}
                      description="Recomendado: 600x600px"
                    />
                  </div>

                  {/* Imagem do Selo */}
                  <div className="space-y-4">
                    <h5 className="font-medium text-[var(--color-secondary)] flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Selo de Certificação
                    </h5>
                    <p className="text-sm text-[var(--color-secondary)]/70">
                      Logo ou selo oficial da certificação
                    </p>
                    <ImageUpload
                      label=""
                      currentImage={pageData.values.images.seal || ''}
                      selectedFile={getFileFromState('values.images.seal')}
                      onFileChange={(file) => setFileState('values.images.seal', file)}
                      aspectRatio="aspect-square"
                      previewWidth={300}
                      previewHeight={300}
                      description="Recomendado: SVG ou PNG transparente"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção CTA */}
        <div className="space-y-4">
          <SectionHeader
            title="Call to Action (CTA)"
            section="cta"
            icon={LinkIcon}
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
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                    Botão de Ação
                  </h4>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    Configure o botão que direciona o usuário para mais informações
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Texto do Botão
                    </label>
                    <Input
                      value={pageData.values.cta.text}
                      onChange={(e) => updateNested('values.cta.text', e.target.value)}
                      placeholder="Ex: DESCUBRA O PODER DO SELO"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Link do Botão
                    </label>
                    <Input
                      value={pageData.values.cta.link}
                      onChange={(e) => updateNested('values.cta.link', e.target.value)}
                      placeholder="Ex: /consultoria, /contato, https://..."
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
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
          itemName="Certificação ML"
          icon={Award}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Certificação ML"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}