/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import { 
  Crown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Layers,
  Palette,
  Badge,
  Type,
  Quote,
  User,
  Target,
  Hash,
  Sparkles,
  Eye
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import IconSelector from "@/components/IconSelector";
import ColorPicker from "@/components/ColorPicker";
import { normalizeHexColor } from "@/lib/colors";
import Loading from "@/components/Loading";

interface LeadershipData {
  id?: string;
  theme: {
    accentColor: string; // Armazenado como hex
    gradientStart: string; // Armazenado como hex
    gradientEnd: string; // Armazenado como hex
  };
  header: {
    badge: string;
    badgeIcon: string;
    titlePrefix: string;
    titleSuffix: string;
    titleHighlight: string;
    counterValue: number;
    counterLabel: string;
  };
  founder: {
    title: string;
    icon: string;
    quote: string;
  };
  methodology: {
    paragraphs: string[];
  };
}

const defaultLeadershipData: LeadershipData = {
  theme: {
    accentColor: "#FFCC00",
    gradientStart: "#FFCC00",
    gradientEnd: "#FF9900"
  },
  header: {
    badge: "Liderança & Visão",
    badgeIcon: "ph:crown-simple-bold",
    titlePrefix: "Não jogamos",
    titleSuffix: "com a sorte.",
    titleHighlight: "Jogamos com dados.",
    counterValue: 40,
    counterLabel: "Faturamento auditado<br/>gerado para clientes."
  },
  founder: {
    title: "A Visão do Fundador",
    icon: "ph:user-focus-bold",
    quote: "A Tegbe não nasceu em uma sala de aula, mas no campo de batalha. Fundada por <strong>Donizete Caetano</strong>, nossa estrutura é a resposta direta a anos observando o mercado desperdiçar potencial por falta de técnica."
  },
  methodology: {
    paragraphs: [
      "Criamos a agência que nós mesmos gostaríamos de contratar. Uma operação onde <span class='font-medium' style='color: var(--accent-color)'>transparência radical</span> e <span class='px-1.5 py-0.5 rounded-md font-bold text-[#1d1d1f]' style='background-color: var(--accent-color)'>obsessão por ROI</span> não são diferenciais, são o mínimo aceitável.",
      "Aqui, tratamos cada real do seu orçamento com o mesmo respeito, rigor e proteção que tratamos o nosso próprio capital."
    ]
  }
};

const mergeWithDefaults = (apiData: any, defaultData: LeadershipData): LeadershipData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id,
    theme: {
      accentColor: normalizeHexColor(apiData.theme?.accentColor || defaultData.theme.accentColor),
      gradientStart: normalizeHexColor(apiData.theme?.gradientStart || defaultData.theme.gradientStart),
      gradientEnd: normalizeHexColor(apiData.theme?.gradientEnd || defaultData.theme.gradientEnd),
    },
    header: {
      badge: apiData.header?.badge || defaultData.header.badge,
      badgeIcon: apiData.header?.badgeIcon || defaultData.header.badgeIcon,
      titlePrefix: apiData.header?.titlePrefix || defaultData.header.titlePrefix,
      titleSuffix: apiData.header?.titleSuffix || defaultData.header.titleSuffix,
      titleHighlight: apiData.header?.titleHighlight || defaultData.header.titleHighlight,
      counterValue: apiData.header?.counterValue !== undefined ? Number(apiData.header.counterValue) : defaultData.header.counterValue,
      counterLabel: apiData.header?.counterLabel || defaultData.header.counterLabel,
    },
    founder: {
      title: apiData.founder?.title || defaultData.founder.title,
      icon: apiData.founder?.icon || defaultData.founder.icon,
      quote: apiData.founder?.quote || defaultData.founder.quote,
    },
    methodology: {
      paragraphs: apiData.methodology?.paragraphs || defaultData.methodology.paragraphs
    }
  };
};

export default function LeadershipPage() {
  const {
    data: leadershipData,
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
  } = useJsonManagement<LeadershipData>({
    apiPath: "/api/tegbe-institucional/json/sobre",
    defaultData: defaultLeadershipData,
    mergeFunction: mergeWithDefaults,
  });

  const [expandedSections, setExpandedSections] = useState({
    theme: true,
    header: false,
    founder: false,
    methodology: false,
  });

  const [methodologyParagraphs, setMethodologyParagraphs] = useState<string[]>([]);

  // Sincroniza os parágrafos quando carregam do banco
  useEffect(() => {
    if (leadershipData.methodology?.paragraphs) {
      setMethodologyParagraphs(leadershipData.methodology.paragraphs);
    }
  }, [leadershipData.methodology?.paragraphs]);

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
      // Atualiza os parágrafos da metodologia antes de salvar
      updateNested('methodology.paragraphs', methodologyParagraphs);
      
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Funções para os parágrafos da metodologia
  const handleAddParagraph = () => {
    const updated = [...methodologyParagraphs, ""];
    setMethodologyParagraphs(updated);
    updateNested('methodology.paragraphs', updated);
  };

  const updateParagraph = (index: number, value: string) => {
    const updated = [...methodologyParagraphs];
    updated[index] = value;
    setMethodologyParagraphs(updated);
    updateNested('methodology.paragraphs', updated);
  };

  const removeParagraph = (index: number) => {
    const updated = [...methodologyParagraphs];
    updated.splice(index, 1);
    setMethodologyParagraphs(updated);
    updateNested('methodology.paragraphs', updated);
  };

  // Funções para cores do tema
  const handleColorChange = (field: keyof LeadershipData['theme'], hexColor: string) => {
    const normalizedHex = normalizeHexColor(hexColor);
    updateNested(`theme.${field}`, normalizedHex);
  };

  // Validações
  const themeCompleteCount = [
    leadershipData.theme.accentColor.trim() !== '',
    leadershipData.theme.gradientStart.trim() !== '',
    leadershipData.theme.gradientEnd.trim() !== ''
  ].filter(Boolean).length;

  const headerCompleteCount = [
    leadershipData.header.badge.trim() !== '',
    leadershipData.header.badgeIcon.trim() !== '',
    leadershipData.header.titlePrefix.trim() !== '',
    leadershipData.header.titleSuffix.trim() !== '',
    leadershipData.header.titleHighlight.trim() !== '',
    leadershipData.header.counterValue > 0,
    leadershipData.header.counterLabel.trim() !== ''
  ].filter(Boolean).length;

  const founderCompleteCount = [
    leadershipData.founder.title.trim() !== '',
    leadershipData.founder.icon.trim() !== '',
    leadershipData.founder.quote.trim() !== ''
  ].filter(Boolean).length;

  const methodologyCompleteCount = methodologyParagraphs.filter(p => p.trim() !== '').length;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Theme (3 campos)
    total += 3;
    completed += themeCompleteCount;

    // Header (7 campos)
    total += 7;
    completed += headerCompleteCount;

    // Founder (3 campos)
    total += 3;
    completed += founderCompleteCount;

    // Methodology (1 campo por parágrafo)
    total += methodologyParagraphs.length;
    completed += methodologyCompleteCount;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Crown} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Crown}
      title="Liderança & Visão"
      description="Gerencie a seção de liderança e visão da empresa"
      exists={!!exists}
      itemName="Liderança & Visão"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Tema */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações do Tema"
            section="theme"
            icon={Palette}
            isExpanded={expandedSections.theme}
            onToggle={() => toggleSection("theme")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.theme ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Cores do Tema
                    </h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {themeCompleteCount} de 3 campos preenchidos
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Cor de Destaque
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={leadershipData.theme.accentColor}
                          onChange={(e) => updateNested('theme.accentColor', normalizeHexColor(e.target.value))}
                          placeholder="Ex: #FFCC00"
                          className="flex-1 font-mono bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                        />
                        <ColorPicker
                          color={normalizeHexColor(leadershipData.theme.accentColor)}
                          onChange={(hex: string) => handleColorChange('accentColor', hex)}
                        />
                      </div>
                      <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                        Cor principal para destaques
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Início do Gradiente
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={leadershipData.theme.gradientStart}
                          onChange={(e) => updateNested('theme.gradientStart', normalizeHexColor(e.target.value))}
                          placeholder="Ex: #FFCC00"
                          className="flex-1 font-mono bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                        />
                        <ColorPicker
                          color={normalizeHexColor(leadershipData.theme.gradientStart)}
                          onChange={(hex: string) => handleColorChange('gradientStart', hex)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Fim do Gradiente
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={leadershipData.theme.gradientEnd}
                          onChange={(e) => updateNested('theme.gradientEnd', normalizeHexColor(e.target.value))}
                          placeholder="Ex: #FF9900"
                          className="flex-1 font-mono bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                        />
                        <ColorPicker
                          color={normalizeHexColor(leadershipData.theme.gradientEnd)}
                          onChange={(hex: string) => handleColorChange('gradientEnd', hex)}
                        />
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
                        {headerCompleteCount} de 7 campos preenchidos
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--color-secondary)]">
                          Badge
                        </label>
                        <Input
                          type="text"
                          value={leadershipData.header.badge}
                          onChange={(e) => updateNested('header.badge', e.target.value)}
                          placeholder="Ex: Liderança & Visão"
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--color-secondary)]">
                          Ícone do Badge
                        </label>
                        <IconSelector
                          value={leadershipData.header.badgeIcon}
                          onChange={(value: string) => updateNested('header.badgeIcon', value)}
                          label="Selecione um ícone para o badge"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Prefixo do Título"
                        value={leadershipData.header.titlePrefix}
                        onChange={(e) => updateNested('header.titlePrefix', e.target.value)}
                        placeholder="Ex: Não jogamos"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />

                      <Input
                        label="Sufixo do Título"
                        value={leadershipData.header.titleSuffix}
                        onChange={(e) => updateNested('header.titleSuffix', e.target.value)}
                        placeholder="Ex: com a sorte."
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Destaque do Título
                      </label>
                      <Input
                        type="text"
                        value={leadershipData.header.titleHighlight}
                        onChange={(e) => updateNested('header.titleHighlight', e.target.value)}
                        placeholder="Ex: Jogamos com dados."
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] text-lg font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          Valor do Contador
                        </label>
                        <Input
                          type="number"
                          value={leadershipData.header.counterValue}
                          onChange={(e) => updateNested('header.counterValue', Number(e.target.value))}
                          placeholder="Ex: 40"
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--color-secondary)]">
                          Rótulo do Contador (HTML)
                        </label>
                        <TextArea
                          placeholder="Ex: Faturamento auditado&lt;br/&gt;gerado para clientes."
                          value={leadershipData.header.counterLabel}
                          onChange={(e) => updateNested('header.counterLabel', e.target.value)}
                          rows={3}
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono"
                        />
                        <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                          Use tags HTML como &lt;br/&gt; para quebras de linha
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Fundador */}
        <div className="space-y-4">
          <SectionHeader
            title="Visão do Fundador"
            section="founder"
            icon={User}
            isExpanded={expandedSections.founder}
            onToggle={() => toggleSection("founder")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.founder ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informações do Fundador
                    </h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {founderCompleteCount} de 3 campos preenchidos
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Título da Seção"
                        value={leadershipData.founder.title}
                        onChange={(e) => updateNested('founder.title', e.target.value)}
                        placeholder="Ex: A Visão do Fundador"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--color-secondary)]">
                          Ícone
                        </label>
                        <IconSelector
                          value={leadershipData.founder.icon}
                          onChange={(value: string) => updateNested('founder.icon', value)}
                          label="Selecione um ícone para a seção"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                        <Quote className="w-4 h-4" />
                        Citação (HTML)
                      </label>
                      <TextArea
                        placeholder="Ex: A Tegbe não nasceu em uma sala de aula, mas no campo de batalha. Fundada por &lt;strong&gt;Donizete Caetano&lt;/strong&gt;, nossa estrutura é a resposta direta a anos observando o mercado desperdiçar potencial por falta de técnica."
                        value={leadershipData.founder.quote}
                        onChange={(e) => updateNested('founder.quote', e.target.value)}
                        rows={5}
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono"
                      />
                      <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                        Use tags HTML como &lt;strong&gt;, &lt;em&gt; para formatação
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Metodologia */}
        <div className="space-y-4">
          <SectionHeader
            title="Metodologia"
            section="methodology"
            icon={Target}
            isExpanded={expandedSections.methodology}
            onToggle={() => toggleSection("methodology")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.methodology ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Parágrafos da Metodologia
                    </h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {methodologyCompleteCount} de {methodologyParagraphs.length} parágrafos preenchidos
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={handleAddParagraph}
                        variant="primary"
                        className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Parágrafo
                      </Button>
                    </div>

                    {methodologyParagraphs.length === 0 ? (
                      <Card className="p-8 bg-[var(--color-background)]">
                        <div className="text-center">
                          <Target className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                            Nenhum parágrafo adicionado
                          </h3>
                          <p className="text-sm text-[var(--color-secondary)]/70">
                            Adicione seu primeiro parágrafo usando o botão acima
                          </p>
                        </div>
                      </Card>
                    ) : (
                      <div className="space-y-6">
                        {methodologyParagraphs.map((paragraph, index) => (
                          <div 
                            key={index}
                            className="p-6 border border-[var(--color-border)] rounded-lg space-y-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-sm font-medium">
                                  Parágrafo {index + 1}
                                </div>
                                {paragraph.trim() !== '' ? (
                                  <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                    Completo
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                    Vazio
                                  </span>
                                )}
                              </div>
                              
                              <Button
                                type="button"
                                onClick={() => removeParagraph(index)}
                                variant="danger"
                                className="whitespace-nowrap bg-red-600 hover:bg-red-700 border-none flex items-center gap-2"
                                disabled={methodologyParagraphs.length <= 1}
                              >
                                <Trash2 className="w-4 h-4" />
                                Remover
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                Conteúdo (HTML permitido)
                              </label>
                              <TextArea
                                placeholder="Ex: Criamos a agência que nós mesmos gostaríamos de contratar. Uma operação onde &lt;span style='color: var(--accent-color)'&gt;transparência radical&lt;/span&gt; e &lt;span style='background-color: var(--accent-color)'&gt;obsessão por ROI&lt;/span&gt; não são diferenciais, são o mínimo aceitável."
                                value={paragraph}
                                onChange={(e) => updateParagraph(index, e.target.value)}
                                rows={4}
                                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-mono"
                              />
                              <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                                Use tags HTML e referencie var(--accent-color) para cores do tema
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
          itemName="Configuração de Liderança"
          icon={Crown}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração de Liderança"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}

// Componente Plus para o botão de adicionar
const Plus = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

// Componente Trash2 para o botão de remover
const Trash2 = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);