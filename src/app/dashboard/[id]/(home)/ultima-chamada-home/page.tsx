/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Switch } from "@/components/Switch";
import IconSelector from "@/components/IconSelector";
import { 
  MessageSquare,
  Palette,
  Type,
  MousePointerClick,
  Eye,
  Sparkles,
  Grid3x3,
  Settings,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Zap,
  LayoutTemplate,
  Link2
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { hexToTailwindBgClass, tailwindToHex } from "@/lib/colors";

interface CTATheme {
  gold_start: string;
  gold_end: string;
  bg_color: string;
  button_bg: string;
}

interface CTAText {
  headline: string;
  highlight: string;
  description: string;
}

interface CTAButton {
  label: string;
  href: string;
  icon: string;
  type: string;
  use_form?: boolean; // ADICIONADO
  form_id?: string;   // ADICIONADO
}

interface CallsToAction {
  primary: CTAButton;
  secondary: CTAButton;
}

interface VisualMetadata {
  ambiance: string;
  texture: string;
  grid: string;
}

interface FinalCTAConfig {
  id?: string;
  final_cta: {
    theme: CTATheme;
    text: CTAText;
    calls_to_action: CallsToAction;
    visual_metadata: VisualMetadata;
  };
}

const defaultCTAConfig: FinalCTAConfig = {
  final_cta: {
    theme: {
      gold_start: "#FFD700",
      gold_end: "#B8860B",
      bg_color: "#FFFFFF",
      button_bg: "#050505"
    },
    text: {
      headline: "",
      highlight: "",
      description: ""
    },
    calls_to_action: {
      primary: {
        label: "",
        href: "",
        icon: "solar:arrow-right-up-linear",
        type: "High-Impact",
        use_form: false,
        form_id: ""
      },
      secondary: {
        label: "",
        href: "",
        icon: "solar:arrow-right-linear",
        type: "Low-Friction",
        use_form: false,
        form_id: ""
      }
    },
    visual_metadata: {
      ambiance: "Clean/Apple Style",
      texture: "Grainy Noise 0.15",
      grid: "Radial Masked 4rem"
    }
  }
};

const mergeWithDefaults = (apiData: any, defaultData: FinalCTAConfig): FinalCTAConfig => {
  if (!apiData) return defaultData;
  
  // Se a API retornar dados sem a chave final_cta, assumimos que é o conteúdo direto
  const data = apiData.final_cta ? apiData : { final_cta: apiData };
  
  return {
    id: data.id,
    final_cta: {
      theme: {
        gold_start: data.final_cta?.theme?.gold_start || defaultData.final_cta.theme.gold_start,
        gold_end: data.final_cta?.theme?.gold_end || defaultData.final_cta.theme.gold_end,
        bg_color: data.final_cta?.theme?.bg_color || defaultData.final_cta.theme.bg_color,
        button_bg: data.final_cta?.theme?.button_bg || defaultData.final_cta.theme.button_bg
      },
      text: {
        headline: data.final_cta?.text?.headline || defaultData.final_cta.text.headline,
        highlight: data.final_cta?.text?.highlight || defaultData.final_cta.text.highlight,
        description: data.final_cta?.text?.description || defaultData.final_cta.text.description
      },
      calls_to_action: {
        primary: {
          label: data.final_cta?.calls_to_action?.primary?.label || defaultData.final_cta.calls_to_action.primary.label,
          href: data.final_cta?.calls_to_action?.primary?.href || defaultData.final_cta.calls_to_action.primary.href,
          icon: data.final_cta?.calls_to_action?.primary?.icon || defaultData.final_cta.calls_to_action.primary.icon,
          type: data.final_cta?.calls_to_action?.primary?.type || defaultData.final_cta.calls_to_action.primary.type,
          use_form: data.final_cta?.calls_to_action?.primary?.use_form ?? defaultData.final_cta.calls_to_action.primary.use_form,
          form_id: data.final_cta?.calls_to_action?.primary?.form_id || defaultData.final_cta.calls_to_action.primary.form_id
        },
        secondary: {
          label: data.final_cta?.calls_to_action?.secondary?.label || defaultData.final_cta.calls_to_action.secondary.label,
          href: data.final_cta?.calls_to_action?.secondary?.href || defaultData.final_cta.calls_to_action.secondary.href,
          icon: data.final_cta?.calls_to_action?.secondary?.icon || defaultData.final_cta.calls_to_action.secondary.icon,
          type: data.final_cta?.calls_to_action?.secondary?.type || defaultData.final_cta.calls_to_action.secondary.type,
          use_form: data.final_cta?.calls_to_action?.secondary?.use_form ?? defaultData.final_cta.calls_to_action.secondary.use_form,
          form_id: data.final_cta?.calls_to_action?.secondary?.form_id || defaultData.final_cta.calls_to_action.secondary.form_id
        }
      },
      visual_metadata: {
        ambiance: data.final_cta?.visual_metadata?.ambiance || defaultData.final_cta.visual_metadata.ambiance,
        texture: data.final_cta?.visual_metadata?.texture || defaultData.final_cta.visual_metadata.texture,
        grid: data.final_cta?.visual_metadata?.grid || defaultData.final_cta.visual_metadata.grid
      }
    }
  };
};

export default function CTAPage() {
  const {
    data: ctaData,
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
  } = useJsonManagement<FinalCTAConfig>({
    apiPath: "/api/tegbe-institucional/json/final-cta",
    defaultData: defaultCTAConfig,
    mergeFunction: mergeWithDefaults,
  });

  const [expandedSections, setExpandedSections] = useState({
    theme: true,
    text: false,
    callsToAction: false,
    visualMetadata: false,
  });

  // --- BUSCA OS FORMULÁRIOS DISPONÍVEIS ---
  const [availableForms, setAvailableForms] = useState<{id: string, name: string}[]>([]);
  
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await fetch("/api/components");
        const data = await res.json();
        if (data.success) {
          setAvailableForms(data.components);
        }
      } catch (error) {
        console.error("Erro ao buscar formulários:", error);
      }
    };
    fetchForms();
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  const handleThemeColorChange = (property: keyof CTATheme, hexColor: string) => {
    updateNested(`final_cta.theme.${property}`, hexColor);
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Theme - 4 cores
    total += 4;
    if (ctaData.final_cta.theme.gold_start.trim()) completed++;
    if (ctaData.final_cta.theme.gold_end.trim()) completed++;
    if (ctaData.final_cta.theme.bg_color.trim()) completed++;
    if (ctaData.final_cta.theme.button_bg.trim()) completed++;

    // Text - 3 campos
    total += 3;
    if (ctaData.final_cta.text.headline.trim()) completed++;
    if (ctaData.final_cta.text.highlight.trim()) completed++;
    if (ctaData.final_cta.text.description.trim()) completed++;

    // Calls to Action - 2 botões × 4 campos cada
    total += 8;
    const primary = ctaData.final_cta.calls_to_action.primary;
    const secondary = ctaData.final_cta.calls_to_action.secondary;
    
    if (primary.label.trim()) completed++;
    if (primary.icon.trim()) completed++;
    if (primary.type.trim()) completed++;
    if (primary.use_form) {
      if (primary.form_id?.trim()) completed++;
    } else {
      if (primary.href.trim()) completed++;
    }
    
    if (secondary.label.trim()) completed++;
    if (secondary.icon.trim()) completed++;
    if (secondary.type.trim()) completed++;
    if (secondary.use_form) {
      if (secondary.form_id?.trim()) completed++;
    } else {
      if (secondary.href.trim()) completed++;
    }

    // Visual Metadata - 3 campos
    total += 3;
    if (ctaData.final_cta.visual_metadata.ambiance.trim()) completed++;
    if (ctaData.final_cta.visual_metadata.texture.trim()) completed++;
    if (ctaData.final_cta.visual_metadata.grid.trim()) completed++;

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Settings} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={MessageSquare}
      title="Final Call to Action"
      description="Configure o CTA final da página com tema gradiente ouro e estilo premium"
      exists={!!exists}
      itemName="CTA Config"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Tema */}
        <div className="space-y-4">
          <SectionHeader
            title="Tema e Cores"
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
            <Card className="p-6 bg-[var(--color-background)] border border-[var(--color-border)] shadow-[0_2px_10px_var(--color-shadow)]">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Configuração do Gradiente Ouro e Cores
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Defina as cores para criar o efeito gradiente premium
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ThemePropertyInput
                  property="bg"
                  label="Cor Inicial do Gradiente (Ouro Claro)"
                  description="Cor inicial do efeito gradiente dourado"
                  currentHex={ctaData.final_cta.theme.gold_start}
                  tailwindClass={hexToTailwindBgClass(ctaData.final_cta.theme.gold_start)}
                  onThemeChange={(_, hex) => handleThemeColorChange('gold_start', hex)}
                />

                <ThemePropertyInput
                  property="bg"
                  label="Cor Final do Gradiente (Ouro Escuro)"
                  description="Cor final do efeito gradiente dourado"
                  currentHex={ctaData.final_cta.theme.gold_end}
                  tailwindClass={hexToTailwindBgClass(ctaData.final_cta.theme.gold_end)}
                  onThemeChange={(_, hex) => handleThemeColorChange('gold_end', hex)}
                />

                <ThemePropertyInput
                  property="bg"
                  label="Cor de Fundo do Container"
                  description="Cor de fundo do container do CTA"
                  currentHex={ctaData.final_cta.theme.bg_color}
                  tailwindClass={hexToTailwindBgClass(ctaData.final_cta.theme.bg_color)}
                  onThemeChange={(_, hex) => handleThemeColorChange('bg_color', hex)}
                />

                <ThemePropertyInput
                  property="bg"
                  label="Cor de Fundo do Botão"
                  description="Cor de fundo dos botões de ação"
                  currentHex={ctaData.final_cta.theme.button_bg}
                  tailwindClass={hexToTailwindBgClass(ctaData.final_cta.theme.button_bg)}
                  onThemeChange={(_, hex) => handleThemeColorChange('button_bg', hex)}
                />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Texto */}
        <div className="space-y-4">
          <SectionHeader
            title="Texto e Conteúdo"
            section="text"
            icon={Type}
            isExpanded={expandedSections.text}
            onToggle={() => toggleSection("text")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.text ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] border border-[var(--color-border)] shadow-[0_2px_10px_var(--color-shadow)]">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Mensagem do CTA
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Configure o texto persuasivo do Call to Action final
                </p>
              </div>

              <div className="space-y-6">
                <Input
                  label="Headline (Parte 1)"
                  value={ctaData.final_cta.text.headline}
                  onChange={(e) => updateNested('final_cta.text.headline', e.target.value)}
                  placeholder="Pare de deixar dinheiro"
                  required
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <Input
                  label="Headline (Parte 2 - Destaque)"
                  value={ctaData.final_cta.text.highlight}
                  onChange={(e) => updateNested('final_cta.text.highlight', e.target.value)}
                  placeholder="na mesa."
                  required
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] font-semibold"
                />

                <TextArea
                  label="Descrição"
                  value={ctaData.final_cta.text.description}
                  onChange={(e) => updateNested('final_cta.text.description', e.target.value)}
                  placeholder="A estratégia está desenhada. A equipe está pronta..."
                  rows={4}
                  required
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Calls to Action */}
        <div className="space-y-4">
          <SectionHeader
            title="Botões de Ação"
            section="callsToAction"
            icon={MousePointerClick}
            isExpanded={expandedSections.callsToAction}
            onToggle={() => toggleSection("callsToAction")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.callsToAction ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] border border-[var(--color-border)] shadow-[0_2px_10px_var(--color-shadow)]">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Configure os botões de ação
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Defina os botões primário e secundário com seus respectivos formulários ou links.
                </p>
              </div>

              <div className="space-y-8">
                
                {/* ---------------- BOTÃO PRIMÁRIO ---------------- */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-full text-sm font-medium">
                      Ação Primária
                    </div>
                    <span className="text-sm text-[var(--color-secondary)]/70">
                      {ctaData.final_cta.calls_to_action.primary.type}
                    </span>
                  </div>

                  {/* Toggle de Ação Primária */}
                  <div className="p-4 border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--color-secondary)] flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4 text-[var(--color-primary)]" />
                        Abrir Formulário no Clique
                      </h4>
                      <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                        Ative para abrir um popup de captura ao invés de redirecionar.
                      </p>
                    </div>
                    <Switch
                      checked={ctaData.final_cta.calls_to_action.primary.use_form || false}
                      onCheckedChange={(checked: boolean) => updateNested('final_cta.calls_to_action.primary.use_form', checked)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Input
                        label="Texto do Botão"
                        value={ctaData.final_cta.calls_to_action.primary.label}
                        onChange={(e) => updateNested('final_cta.calls_to_action.primary.label', e.target.value)}
                        placeholder="Ex: Agendar Diagnóstico"
                        required
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />

                      {/* Destino Primário (Formulário ou Link) */}
                      {ctaData.final_cta.calls_to_action.primary.use_form ? (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                            <LayoutTemplate className="w-4 h-4" /> Formulário Vinculado
                          </label>
                          <select
                            value={ctaData.final_cta.calls_to_action.primary.form_id || ""}
                            onChange={(e) => updateNested('final_cta.calls_to_action.primary.form_id', e.target.value)}
                            className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background-body)] text-[var(--color-secondary)] outline-none"
                          >
                            <option value="">-- Selecione o formulário --</option>
                            {availableForms.map(form => (
                              <option key={form.id} value={form.id}>{form.name}</option>
                            ))}
                          </select>
                          {availableForms.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">Nenhum formulário encontrado. Crie um no menu Formulários.</p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                            <Link2 className="w-4 h-4" /> URL/Link
                          </label>
                          <Input
                            value={ctaData.final_cta.calls_to_action.primary.href}
                            onChange={(e) => updateNested('final_cta.calls_to_action.primary.href', e.target.value)}
                            placeholder="https://api.whatsapp.com/send?phone=..."
                            required
                            className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--color-secondary)]">
                          Ícone do Botão
                        </label>
                        <IconSelector
                          value={ctaData.final_cta.calls_to_action.primary.icon}
                          onChange={(value) => updateNested('final_cta.calls_to_action.primary.icon', value)}
                          placeholder="solar:arrow-right-up-linear"
                        />
                        <p className="text-xs text-[var(--color-secondary)]/50">
                          Use ícones do Material Design Icons ou Solar Icons
                        </p>
                      </div>

                      <Input
                        label="Tipo de Ação"
                        value={ctaData.final_cta.calls_to_action.primary.type}
                        onChange={(e) => updateNested('final_cta.calls_to_action.primary.type', e.target.value)}
                        placeholder="Ex: High-Impact"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Separador */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--color-border)]"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-[var(--color-background)] text-sm text-[var(--color-secondary)]/50">
                      Ação Secundária
                    </span>
                  </div>
                </div>

                {/* ---------------- BOTÃO SECUNDÁRIO ---------------- */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] rounded-full text-sm font-medium">
                      Ação Secundária
                    </div>
                    <span className="text-sm text-[var(--color-secondary)]/70">
                      {ctaData.final_cta.calls_to_action.secondary.type}
                    </span>
                  </div>

                  {/* Toggle de Ação Secundária */}
                  <div className="p-4 border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--color-secondary)] flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4 text-[var(--color-primary)]" />
                        Abrir Formulário no Clique
                      </h4>
                    </div>
                    <Switch
                      checked={ctaData.final_cta.calls_to_action.secondary.use_form || false}
                      onCheckedChange={(checked: boolean) => updateNested('final_cta.calls_to_action.secondary.use_form', checked)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Input
                        label="Texto do Botão"
                        value={ctaData.final_cta.calls_to_action.secondary.label}
                        onChange={(e) => updateNested('final_cta.calls_to_action.secondary.label', e.target.value)}
                        placeholder="Ex: Conhecer Tegpro"
                        required
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />

                      {/* Destino Secundário (Formulário ou Link) */}
                      {ctaData.final_cta.calls_to_action.secondary.use_form ? (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                            <LayoutTemplate className="w-4 h-4" /> Formulário Vinculado
                          </label>
                          <select
                            value={ctaData.final_cta.calls_to_action.secondary.form_id || ""}
                            onChange={(e) => updateNested('final_cta.calls_to_action.secondary.form_id', e.target.value)}
                            className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-background-body)] text-[var(--color-secondary)] outline-none"
                          >
                            <option value="">-- Selecione o formulário --</option>
                            {availableForms.map(form => (
                              <option key={form.id} value={form.id}>{form.name}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                            <Link2 className="w-4 h-4" /> URL/Link
                          </label>
                          <Input
                            value={ctaData.final_cta.calls_to_action.secondary.href}
                            onChange={(e) => updateNested('final_cta.calls_to_action.secondary.href', e.target.value)}
                            placeholder="/cursos"
                            required
                            className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[var(--color-secondary)]">
                          Ícone do Botão
                        </label>
                        <IconSelector
                          value={ctaData.final_cta.calls_to_action.secondary.icon}
                          onChange={(value) => updateNested('final_cta.calls_to_action.secondary.icon', value)}
                          placeholder="solar:arrow-right-linear"
                        />
                        <p className="text-xs text-[var(--color-secondary)]/50">
                          Use ícones do Material Design Icons ou Solar Icons
                        </p>
                      </div>

                      <Input
                        label="Tipo de Ação"
                        value={ctaData.final_cta.calls_to_action.secondary.type}
                        onChange={(e) => updateNested('final_cta.calls_to_action.secondary.type', e.target.value)}
                        placeholder="Ex: Low-Friction"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Metadados Visuais */}
        <div className="space-y-4">
          <SectionHeader
            title="Metadados Visuais"
            section="visualMetadata"
            icon={Eye}
            isExpanded={expandedSections.visualMetadata}
            onToggle={() => toggleSection("visualMetadata")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.visualMetadata ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)] border border-[var(--color-border)] shadow-[0_2px_10px_var(--color-shadow)]">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                  Efeitos Visuais e Estilo
                </h4>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Configure os efeitos visuais que dão o estilo premium ao CTA
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
                    <h4 className="font-medium text-[var(--color-secondary)]">Ambiente Visual</h4>
                  </div>
                  <Input
                    label="Estilo/Ambiente"
                    value={ctaData.final_cta.visual_metadata.ambiance}
                    onChange={(e) => updateNested('final_cta.visual_metadata.ambiance', e.target.value)}
                    placeholder="Ex: Clean/Apple Style"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/50">
                    Define o estilo visual geral (ex: Clean, Minimalist, Apple Style)
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Grid3x3 className="w-5 h-5 text-[var(--color-primary)]" />
                    <h4 className="font-medium text-[var(--color-secondary)]">Textura</h4>
                  </div>
                  <Input
                    label="Efeito de Textura"
                    value={ctaData.final_cta.visual_metadata.texture}
                    onChange={(e) => updateNested('final_cta.visual_metadata.texture', e.target.value)}
                    placeholder="Ex: Grainy Noise 0.15"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/50">
                    Configuração de textura (ex: Grainy Noise, Paper Texture)
                  </p>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Grid3x3 className="w-5 h-5 text-[var(--color-primary)]" />
                    <h4 className="font-medium text-[var(--color-secondary)]">Grade e Layout</h4>
                  </div>
                  <Input
                    label="Configuração da Grade"
                    value={ctaData.final_cta.visual_metadata.grid}
                    onChange={(e) => updateNested('final_cta.visual_metadata.grid', e.target.value)}
                    placeholder="Ex: Radial Masked 4rem"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                  <p className="text-xs text-[var(--color-secondary)]/50">
                    Define o sistema de grade e máscaras visuais
                  </p>
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
          itemName="CTA Config"
          icon={Zap}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração de CTA"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}