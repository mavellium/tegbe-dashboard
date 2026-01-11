/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Switch } from "@/components/Switch";
import { Button } from "@/components/Button";
import { 
  MessageCircle,
  Video,
  Image as ImageIcon,
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Upload,
  Settings,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Zap,
  Tag,
  Palette
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import ColorPicker from "@/components/ColorPicker";
import Image from "next/image";

// Importar componentes de upload da página de exemplo
import { ImageUpload } from "@/components/ImageUpload";
import { VideoUpload } from "@/components/VideoUpload";

interface TestimonialStats {
  value: string;
  label: string;
}

interface Testimonial {
  id: string;
  type: "video" | "text" | "image";
  clientName: string;
  clientRole: string;
  description: string;
  src?: string;
  poster?: string;
  stats?: TestimonialStats;
}

interface TestimonialsData {
  id: string;
  titulo: string;
  subtitulo: string;
  backgroundColor: string;
  textColor: string;
  showStats: boolean;
  testimonials: Testimonial[];
}

const defaultTestimonialsData: TestimonialsData = {
  id: "testimonials-section",
  titulo: "Casos de Sucesso",
  subtitulo: "Veja o que nossos alunos e clientes estão conquistando",
  backgroundColor: "#FFFFFF",
  textColor: "#1F2937",
  showStats: true,
  testimonials: []
};

const mergeWithDefaults = (apiData: any, defaultData: TestimonialsData): TestimonialsData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id || defaultData.id,
    titulo: apiData.titulo || defaultData.titulo,
    subtitulo: apiData.subtitulo || defaultData.subtitulo,
    backgroundColor: apiData.backgroundColor || defaultData.backgroundColor,
    textColor: apiData.textColor || defaultData.textColor,
    showStats: apiData.showStats ?? defaultData.showStats,
    testimonials: apiData.testimonials || defaultData.testimonials,
  };
};

// Componente ColorPropertyInput ajustado
interface ColorPropertyInputProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
}

const ColorPropertyInput = ({ 
  label, 
  value, 
  onChange, 
  description 
}: ColorPropertyInputProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--color-secondary)]">
          {label}
        </label>
      </div>
      {description && (
        <p className="text-xs text-[var(--color-secondary)]/70">{description}</p>
      )}
      <div className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          placeholder="#000000"
          className="flex-1 font-mono bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
        />
        <ColorPicker
          color={value}
          onChange={onChange}
        />
        <div 
          className="w-10 h-10 rounded-lg border border-[var(--color-border)]"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );
};

// Função para obter ícone e cor baseado no tipo
const getTypeIcon = (type: Testimonial["type"]) => {
  switch (type) {
    case "video": return Video;
    case "image": return ImageIcon;
    case "text": return FileText;
    default: return MessageCircle;
  }
};

const getTypeColor = (type: Testimonial["type"]) => {
  switch (type) {
    case "video": return "bg-blue-500/10 text-blue-500";
    case "image": return "bg-green-500/10 text-green-500";
    case "text": return "bg-purple-500/10 text-purple-500";
    default: return "bg-[var(--color-background-body)] text-[var(--color-secondary)]";
  }
};

export default function TestimonialsPage() {
  const {
    data: testimonialsData,
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
  } = useJsonManagement<TestimonialsData>({
    apiPath: "/api/tegbe-institucional/json/alunos",
    defaultData: defaultTestimonialsData,
    mergeFunction: mergeWithDefaults,
  });

  const [expandedSections, setExpandedSections] = useState({
    geral: true,
    testimonials: true
  });
  const [expandedTestimonials, setExpandedTestimonials] = useState<string[]>([]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleTestimonial = (testimonialId: string) => {
    setExpandedTestimonials(prev => 
      prev.includes(testimonialId) 
        ? prev.filter(id => id !== testimonialId)
        : [...prev, testimonialId]
    );
  };

  // Funções para gerenciar testimonials - similares às da página de exemplo
  const handleAddTestimonial = () => {
    const newId = Date.now().toString();
    const newTestimonial: Testimonial = {
      id: newId,
      type: "text",
      clientName: "",
      clientRole: "",
      description: "",
      src: "",
      poster: ""
    };
    const updatedTestimonials = [...testimonialsData.testimonials, newTestimonial];
    updateNested('testimonials', updatedTestimonials);
    setExpandedTestimonials(prev => [...prev, newId]);
  };

  const handleUpdateTestimonial = (index: number, updates: Partial<Testimonial>) => {
    const updatedTestimonials = [...testimonialsData.testimonials];
    updatedTestimonials[index] = { ...updatedTestimonials[index], ...updates };
    updateNested('testimonials', updatedTestimonials);
  };

  const handleRemoveTestimonial = (index: number) => {
    const updatedTestimonials = testimonialsData.testimonials.filter((_, i) => i !== index);
    updateNested('testimonials', updatedTestimonials);
    setExpandedTestimonials(prev => prev.filter(id => id !== testimonialsData.testimonials[index].id));
  };

  const moveTestimonial = (index: number, direction: "up" | "down") => {
    const currentTestimonials = [...testimonialsData.testimonials];
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === currentTestimonials.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const [movedTestimonial] = currentTestimonials.splice(index, 1);
    currentTestimonials.splice(newIndex, 0, movedTestimonial);
    
    updateNested('testimonials', currentTestimonials);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Função auxiliar para obter File do fileStates - igual à página de exemplo
  const getFileFromState = (key: string): File | null => {
    const value = fileStates[key];
    return value instanceof File ? value : null;
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Configurações gerais
    total += 5;
    if (testimonialsData.id.trim()) completed++;
    if (testimonialsData.titulo.trim()) completed++;
    if (testimonialsData.subtitulo.trim()) completed++;
    if (testimonialsData.backgroundColor.trim()) completed++;
    if (testimonialsData.textColor.trim()) completed++;

    // Testimonials
    total += testimonialsData.testimonials.length * 4;
    testimonialsData.testimonials.forEach(testimonial => {
      if (testimonial.clientName.trim()) completed++;
      if (testimonial.clientRole.trim()) completed++;
      if (testimonial.description.trim()) completed++;
      if (testimonial.type) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={MessageCircle} exists={!!exists} />;
  }

  const renderTestimonial = (testimonial: Testimonial, index: number) => {
    const isExpanded = expandedTestimonials.includes(testimonial.id);
    const TypeIcon = getTypeIcon(testimonial.type);

    return (
      <div key={testimonial.id} className="space-y-4">
        <div
          onClick={() => toggleTestimonial(testimonial.id)}
          className="w-full flex items-center justify-between p-4 bg-[var(--color-background-body)] rounded-lg hover:bg-[var(--color-background-body)]/80 transition-colors cursor-pointer border border-[var(--color-border)]"
        >
          <div className="flex items-center gap-3">
            <TypeIcon className="w-5 h-5 text-[var(--color-secondary)]" />
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(testimonial.type)}`}>
                  {testimonial.type.toUpperCase()}
                </span>
                {testimonial.stats && (
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/10 text-yellow-500">
                    COM ESTATÍSTICA
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-secondary)] mt-1">
                {testimonial.clientName || "Cliente sem nome"}
              </h3>
              <p className="text-sm text-[var(--color-secondary)]/70 line-clamp-1">
                {testimonial.description || "Sem descrição"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  moveTestimonial(index, "up");
                }}
                disabled={index === 0}
                className="bg-[var(--color-background-body)] hover:bg-[var(--color-background-body)]/80 border-[var(--color-border)]"
              >
                <ArrowUp className="w-3 h-3" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  moveTestimonial(index, "down");
                }}
                disabled={index === testimonialsData.testimonials.length - 1}
                className="bg-[var(--color-background-body)] hover:bg-[var(--color-background-body)]/80 border-[var(--color-border)]"
              >
                <ArrowDown className="w-3 h-3" />
              </Button>
            </div>
            <Button
              type="button"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTestimonial(index);
              }}
              className="bg-red-600 hover:bg-red-700 border-none"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-[var(--color-secondary)]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[var(--color-secondary)]" />
            )}
          </div>
        </div>

        <motion.div
          initial={false}
          animate={{ height: isExpanded ? "auto" : 0 }}
          className="overflow-hidden"
        >
          <Card className="p-6 bg-[var(--color-background)] space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Coluna 1: Informações básicas */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Tipo de Depoimento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["video", "image", "text"] as const).map((type) => {
                      const Icon = getTypeIcon(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            handleUpdateTestimonial(index, { type });
                          }}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                            testimonial.type === type
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                              : "border-[var(--color-border)] hover:bg-[var(--color-background-body)]"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${
                            testimonial.type === type
                              ? "text-[var(--color-primary)]"
                              : "text-[var(--color-secondary)]/70"
                          }`} />
                          <span className={`text-xs font-medium capitalize ${
                            testimonial.type === type
                              ? "text-[var(--color-primary)]"
                              : "text-[var(--color-secondary)]/70"
                          }`}>{type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                      Nome do Cliente
                    </label>
                    <Input
                      type="text"
                      value={testimonial.clientName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleUpdateTestimonial(index, { clientName: e.target.value })
                      }
                      placeholder="Ex: Lucas Martins"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                      Cargo/Função
                    </label>
                    <Input
                      type="text"
                      value={testimonial.clientRole}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleUpdateTestimonial(index, { clientRole: e.target.value })
                      }
                      placeholder="Ex: Aluno - Dropshipping"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                    Depoimento
                  </label>
                  <TextArea
                    value={testimonial.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleUpdateTestimonial(index, { description: e.target.value })
                    }
                    placeholder="Digite o depoimento do cliente..."
                    rows={4}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                {/* Estatísticas */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-lg">
                    <div>
                      <h4 className="font-medium text-[var(--color-secondary)]">Estatística do Resultado</h4>
                      <p className="text-sm text-[var(--color-secondary)]/70">
                        Mostra um número chave do resultado
                      </p>
                    </div>
                    <Switch
                      checked={!!testimonial.stats}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleUpdateTestimonial(index, { 
                            stats: { value: "", label: "" }
                          });
                        } else {
                          handleUpdateTestimonial(index, { stats: undefined });
                        }
                      }}
                    />
                  </div>

                  {testimonial.stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                          Valor
                        </label>
                        <Input
                          type="text"
                          value={testimonial.stats.value}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleUpdateTestimonial(index, {
                              stats: {
                                ...testimonial.stats!,
                                value: e.target.value
                              }
                            })
                          }
                          placeholder="Ex: R$ 15k, +20%, -50%"
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2">
                          Rótulo
                        </label>
                        <Input
                          type="text"
                          value={testimonial.stats.label}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleUpdateTestimonial(index, {
                              stats: {
                                ...testimonial.stats!,
                                label: e.target.value
                              }
                            })
                          }
                          placeholder="Ex: Em 48h, Recuperação, CAC"
                          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Coluna 2: Mídia - USANDO OS COMPONENTES DA PÁGINA DE EXEMPLO */}
              <div className="space-y-6">
                {testimonial.type === "video" && (
                  <>
                    <VideoUpload
                      label="Vídeo do Depoimento"
                      currentVideo={testimonial.src || ''}
                      selectedFile={getFileFromState(`testimonials.${index}.src`)}
                      onFileChange={(file) => setFileState(`testimonials.${index}.src`, file)}
                      aspectRatio="aspect-video"
                      previewWidth={800}
                      previewHeight={450}
                      description="Vídeo do depoimento do cliente"
                    />
                    
                    <ImageUpload
                      label="Thumbnail do Vídeo (Poster)"
                      currentImage={testimonial.poster || ''}
                      selectedFile={getFileFromState(`testimonials.${index}.poster`)}
                      onFileChange={(file) => setFileState(`testimonials.${index}.poster`, file)}
                      aspectRatio="aspect-video"
                      previewWidth={800}
                      previewHeight={450}
                      description="Imagem de capa para o vídeo (opcional)"
                    />
                  </>
                )}

                {testimonial.type === "image" && (
                  <ImageUpload
                    label="Imagem do Depoimento"
                    currentImage={testimonial.src || ''}
                    selectedFile={getFileFromState(`testimonials.${index}.src`)}
                    onFileChange={(file) => setFileState(`testimonials.${index}.src`, file)}
                    aspectRatio="aspect-video"
                    previewWidth={800}
                    previewHeight={450}
                    description="Imagem do cliente ou do resultado"
                  />
                )}

                {testimonial.type === "text" && (
                  <div className={`w-full aspect-video flex items-center justify-center bg-[var(--color-background-body)] rounded-lg border-2 border-dashed border-[var(--color-border)]`}>
                    <div className="text-center p-8">
                      <FileText className="w-16 h-16 text-[var(--color-secondary)]/30 mx-auto mb-4" />
                      <p className="text-[var(--color-secondary)]/70">
                        Depoimento em formato de texto
                      </p>
                      <p className="text-sm text-[var(--color-secondary)]/50 mt-2">
                        Apenas o texto será exibido
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-xs text-[var(--color-secondary)]/50 space-y-1">
                  <p>• Para vídeos: envie o arquivo .mp4 ou .webm</p>
                  <p>• A thumbnail será gerada automaticamente ou você pode enviar uma imagem personalizada</p>
                  <p>• Para imagens: JPG, PNG ou WebP (recomendado 800x600px)</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={MessageCircle}
      title="Casos de Sucesso"
      description="Gerencie depoimentos e cases de alunos e clientes"
      exists={!!exists}
      itemName="Casos de Sucesso"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Configurações Gerais */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações Gerais"
            section="geral"
            icon={Settings}
            isExpanded={expandedSections.geral}
            onToggle={() => toggleSection("geral")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.geral ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="ID da Seção"
                  value={testimonialsData.id}
                  onChange={(e) => updateNested('id', e.target.value)}
                  placeholder="testimonials-section"
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />

                <div className="md:col-span-2">
                  <Input
                    label="Título"
                    value={testimonialsData.titulo}
                    onChange={(e) => updateNested('titulo', e.target.value)}
                    placeholder="Casos de Sucesso"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="md:col-span-2">
                  <TextArea
                    label="Subtítulo"
                    value={testimonialsData.subtitulo}
                    onChange={(e) => updateNested('subtitulo', e.target.value)}
                    placeholder="Veja o que nossos alunos e clientes estão conquistando"
                    rows={2}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <ColorPropertyInput
                  label="Cor de Fundo"
                  value={testimonialsData.backgroundColor}
                  onChange={(color) => updateNested('backgroundColor', color)}
                  description="Cor de fundo da seção"
                />

                <ColorPropertyInput
                  label="Cor do Texto"
                  value={testimonialsData.textColor}
                  onChange={(color) => updateNested('textColor', color)}
                  description="Cor principal do texto"
                />

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background-body)]">
                    <div>
                      <h4 className="font-medium text-[var(--color-secondary)]">Exibir Estatísticas</h4>
                      <p className="text-sm text-[var(--color-secondary)]/70">
                        Mostrar os números de resultado nos depoimentos
                      </p>
                    </div>
                    <Switch
                      checked={testimonialsData.showStats}
                      onCheckedChange={(checked) => updateNested('showStats', checked)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Depoimentos */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <SectionHeader
              title={`Casos de Sucesso (${testimonialsData.testimonials.length})`}
              section="testimonials"
              icon={MessageCircle}
              isExpanded={expandedSections.testimonials}
              onToggle={() => toggleSection("testimonials")}
            />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-[var(--color-secondary)]/70">
                  {testimonialsData.testimonials.filter(t => t.clientName && t.description).length} de {testimonialsData.testimonials.length} completos
                </span>
              </div>
              <Button
                type="button"
                onClick={handleAddTestimonial}
                variant="primary"
                className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Caso
              </Button>
            </div>
          </div>

          <motion.div
            initial={false}
            animate={{ height: expandedSections.testimonials ? "auto" : 0 }}
            className="overflow-hidden"
          >
            {testimonialsData.testimonials.length === 0 ? (
              <Card className="p-6 bg-[var(--color-background)]">
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-[var(--color-secondary)]/30 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                    Nenhum caso de sucesso adicionado
                  </h4>
                  <p className="text-[var(--color-secondary)]/70 mb-6 max-w-md mx-auto">
                    Comece adicionando depoimentos em vídeo, imagem ou texto dos seus clientes
                  </p>
                  <Button
                    type="button"
                    onClick={handleAddTestimonial}
                    variant="primary"
                    className="mx-auto bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Caso
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {testimonialsData.testimonials.map((testimonial, index) => 
                  renderTestimonial(testimonial, index)
                )}
              </div>
            )}
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
          itemName="Casos de Sucesso"
          icon={MessageCircle}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={testimonialsData.testimonials.length}
        itemName="Caso de Sucesso"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}