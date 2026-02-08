/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { 
  Settings, 
  CheckCircle2,
  Layers,
  Image,
  MessageSquare,
  Target,
  Link,
  Users,
  Eye,
  Shield
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import { ImageUpload } from "@/components/ImageUpload";
import IconSelector from "@/components/IconSelector";
import Loading from "@/components/Loading";

interface ConsultoriaData {
  id?: string;
  visual: {
    imageSrc: string;
    imageAlt: string;
    badgeText: string;
  };
  header: {
    badgeIcon: string;
    badgeText: string;
    titleMain: string;
    titleSecondary: string;
  };
  content: {
    description: string;
    details: string;
    cta: {
      text: string;
      link: string;
    };
    socialProof: {
      value: string;
      label: string;
    };
  };
}

const defaultConsultoriaData: ConsultoriaData = {
  visual: {
    imageSrc: "/15anos-image.png",
    imageAlt: "Equipe Tegbe em Operação",
    badgeText: "Desde 2022"
  },
  header: {
    badgeIcon: "ph:certificate-fill",
    badgeText: "Consultoria Oficial",
    titleMain: "Não apenas operamos.",
    titleSecondary: "Nós ditamos o ritmo."
  },
  content: {
    description: "Como Consultores Oficiais, temos acesso direto a estratégias e ferramentas que vendedores comuns desconhecem.",
    details: "Sua conta não será apenas gerenciada; ela será <strong>blindada e escalada</strong> com o aval da própria plataforma. O que para outros é 'segredo', para nós é ferramenta de trabalho diária.",
    cta: {
      text: "Falar com Especialista",
      link: "https://api.whatsapp.com/send?phone=5514991779502&text=Gostaria%20de%20falar%20com%20um%20especialista"
    },
    socialProof: {
      value: "+R$ 40M",
      label: "Gerenciados"
    }
  }
};

const mergeWithDefaults = (apiData: any, defaultData: ConsultoriaData): ConsultoriaData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id,
    visual: {
      imageSrc: apiData.visual?.imageSrc || defaultData.visual.imageSrc,
      imageAlt: apiData.visual?.imageAlt || defaultData.visual.imageAlt,
      badgeText: apiData.visual?.badgeText || defaultData.visual.badgeText,
    },
    header: {
      badgeIcon: apiData.header?.badgeIcon || defaultData.header.badgeIcon,
      badgeText: apiData.header?.badgeText || defaultData.header.badgeText,
      titleMain: apiData.header?.titleMain || defaultData.header.titleMain,
      titleSecondary: apiData.header?.titleSecondary || defaultData.header.titleSecondary,
    },
    content: {
      description: apiData.content?.description || defaultData.content.description,
      details: apiData.content?.details || defaultData.content.details,
      cta: {
        text: apiData.content?.cta?.text || defaultData.content.cta.text,
        link: apiData.content?.cta?.link || defaultData.content.cta.link,
      },
      socialProof: {
        value: apiData.content?.socialProof?.value || defaultData.content.socialProof.value,
        label: apiData.content?.socialProof?.label || defaultData.content.socialProof.label,
      },
    }
  };
};

export default function ConsultoriaPage() {
  const {
    data: consultoriaData,
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
  } = useJsonManagement<ConsultoriaData>({
    apiPath: "/api/tegbe-institucional/json/anos-mercado",
    defaultData: defaultConsultoriaData,
    mergeFunction: mergeWithDefaults,
  });

  const [expandedSections, setExpandedSections] = useState({
    visual: true,
    header: false,
    content: false,
  });

  // Referência para scroll
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Função para salvar
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Validações
  const visualCompleteCount = [
    consultoriaData.visual.imageSrc.trim() !== '',
    consultoriaData.visual.imageAlt.trim() !== '',
    consultoriaData.visual.badgeText.trim() !== ''
  ].filter(Boolean).length;

  const headerCompleteCount = [
    consultoriaData.header.badgeIcon.trim() !== '',
    consultoriaData.header.badgeText.trim() !== '',
    consultoriaData.header.titleMain.trim() !== '',
    consultoriaData.header.titleSecondary.trim() !== ''
  ].filter(Boolean).length;

  const contentCompleteCount = [
    consultoriaData.content.description.trim() !== '',
    consultoriaData.content.details.trim() !== '',
    consultoriaData.content.cta.text.trim() !== '',
    consultoriaData.content.cta.link.trim() !== '',
    consultoriaData.content.socialProof.value.trim() !== '',
    consultoriaData.content.socialProof.label.trim() !== ''
  ].filter(Boolean).length;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Visual (3 campos)
    total += 3;
    completed += visualCompleteCount;

    // Header (4 campos)
    total += 4;
    completed += headerCompleteCount;

    // Content (6 campos)
    total += 6;
    completed += contentCompleteCount;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Settings} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Shield}
      title="Consultoria"
      description="Gerencie a seção de consultoria oficial da empresa"
      exists={!!exists}
      itemName="Consultoria"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Visual */}
        <div className="space-y-4">
          <SectionHeader
            title="Elementos Visuais"
            section="visual"
            icon={Eye}
            isExpanded={expandedSections.visual}
            onToggle={() => toggleSection("visual")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.visual ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Elementos Visuais da Seção
                    </h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {visualCompleteCount} de 3 campos preenchidos
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          Imagem de Destaque
                        </label>
                        <ImageUpload
                          label="Imagem Principal"
                          description="Formatos suportados: JPG, PNG, WEBP. Tamanho recomendado: 800x600px."
                          currentImage={consultoriaData.visual.imageSrc}
                          onChange={(url) => updateNested('visual.imageSrc', url)}
                          aspectRatio="aspect-[4/3]"
                          previewWidth={400}
                          previewHeight={300}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--color-secondary)]">
                          Texto Alternativo da Imagem
                        </label>
                        <Input
                          type="text"
                          value={consultoriaData.visual.imageAlt}
                          onChange={(e) => updateNested('visual.imageAlt', e.target.value)}
                          placeholder="Ex: Equipe Tegbe em Operação"
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                        />
                        <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                          Descreva a imagem para acessibilidade e SEO
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho da Seção"
            section="header"
            icon={Layers}
            isExpanded={expandedSections.header}
            onToggle={() => toggleSection("header")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.header ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      Informações do Cabeçalho
                    </h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {headerCompleteCount} de 4 campos preenchidos
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--color-secondary)]">
                          Ícone do Badge
                        </label>
                        <IconSelector
                          value={consultoriaData.header.badgeIcon}
                          onChange={(value: string) => updateNested('header.badgeIcon', value)}
                          label="Selecione um ícone para o badge"
                        />
                        <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                          Ícone exibido ao lado do texto do badge
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--color-secondary)]">
                          Texto do Badge
                        </label>
                        <Input
                          type="text"
                          value={consultoriaData.header.badgeText}
                          onChange={(e) => updateNested('header.badgeText', e.target.value)}
                          placeholder="Ex: Consultoria Oficial"
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Título Principal
                      </label>
                      <Input
                        type="text"
                        value={consultoriaData.header.titleMain}
                        onChange={(e) => updateNested('header.titleMain', e.target.value)}
                        placeholder="Ex: Não apenas operamos."
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] text-lg font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Título Secundário
                      </label>
                      <Input
                        type="text"
                        value={consultoriaData.header.titleSecondary}
                        onChange={(e) => updateNested('header.titleSecondary', e.target.value)}
                        placeholder="Ex: Nós ditamos o ritmo."
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Content */}
        <div className="space-y-4">
          <SectionHeader
            title="Conteúdo Principal"
            section="content"
            icon={MessageSquare}
            isExpanded={expandedSections.content}
            onToggle={() => toggleSection("content")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.content ? "auto" : 0 }}
            className="overflow-hidden"
            ref={contentRef}
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Conteúdo da Seção
                    </h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {contentCompleteCount} de 6 campos preenchidos
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Descrição Principal
                      </label>
                      <TextArea
                        placeholder="Ex: Como Consultores Oficiais, temos acesso direto a estratégias e ferramentas que vendedores comuns desconhecem."
                        value={consultoriaData.content.description}
                        onChange={(e) => updateNested('content.description', e.target.value)}
                        rows={3}
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Detalhes (HTML permitido)
                      </label>
                      <TextArea
                        placeholder="Ex: Sua conta não será apenas gerenciada; ela será <strong>blindada e escalada</strong> com o aval da própria plataforma."
                        value={consultoriaData.content.details}
                        onChange={(e) => updateNested('content.details', e.target.value)}
                        rows={4}
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono"
                      />
                      <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                        Use tags HTML como &lt;strong&gt;, &lt;em&gt;, &lt;span&gt; para formatação
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-[var(--color-secondary)] flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Call-to-Action (CTA)
                        </h4>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[var(--color-secondary)]">
                            Texto do Botão
                          </label>
                          <Input
                            type="text"
                            value={consultoriaData.content.cta.text}
                            onChange={(e) => updateNested('content.cta.text', e.target.value)}
                            placeholder="Ex: Falar com Especialista"
                            className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                            <Link className="w-4 h-4" />
                            Link do Botão
                          </label>
                          <Input
                            type="url"
                            value={consultoriaData.content.cta.link}
                            onChange={(e) => updateNested('content.cta.link', e.target.value)}
                            placeholder="Ex: https://api.whatsapp.com/send?phone=..."
                            className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                          />
                          <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                            Link externo para WhatsApp, site, etc.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium text-[var(--color-secondary)] flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Prova Social
                        </h4>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[var(--color-secondary)]">
                            Valor
                          </label>
                          <Input
                            type="text"
                            value={consultoriaData.content.socialProof.value}
                            onChange={(e) => updateNested('content.socialProof.value', e.target.value)}
                            placeholder="Ex: +R$ 40M"
                            className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[var(--color-secondary)]">
                            Rótulo
                          </label>
                          <Input
                            type="text"
                            value={consultoriaData.content.socialProof.label}
                            onChange={(e) => updateNested('content.socialProof.label', e.target.value)}
                            placeholder="Ex: Gerenciados"
                            className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                          />
                        </div>
                      </div>
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
          totalCount={completion.total}
          itemName="Configuração de Consultoria"
          icon={Shield}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração de Consultoria"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}