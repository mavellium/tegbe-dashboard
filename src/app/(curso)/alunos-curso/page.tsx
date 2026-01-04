/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import ColorPicker from "@/components/ColorPicker";
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
  Sparkles,
  User,
  Briefcase,
  TrendingUp,
  Check,
  Play,
  Eye,
  Volume2,
  VolumeX
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import Image from "next/image";

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

interface MediaFiles {
  [testimonialId: string]: {
    video?: File | null;
    image?: File | null;
    poster?: File | null;
  };
}

const SectionHeader = ({
  title,
  icon: Icon,
  isExpanded,
  onToggle
}: {
  title: string;
  icon: any;
  isExpanded: boolean;
  onToggle: () => void;
}) => (
  <div
    onClick={onToggle}
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

const ColorPropertyInput = ({ 
  label, 
  value, 
  onChange, 
  description 
}: { 
  label: string; 
  value: string; 
  onChange: (color: string) => void; 
  description?: string;
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      </div>
      {description && (
        <p className="text-xs text-zinc-500">{description}</p>
      )}
      <div className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          placeholder="#000000"
          className="flex-1 font-mono"
        />
        <ColorPicker
          color={value}
          onChange={onChange}
        />
        <div 
          className="w-10 h-10 rounded-lg border border-zinc-300 dark:border-zinc-600"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );
};

const MediaUpload = ({ 
  label, 
  currentFile, 
  selectedFile, 
  onFileChange, 
  accept,
  type = "image",
  aspectRatio = "aspect-video"
}: { 
  label: string; 
  currentFile: string;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  accept: string;
  type?: "image" | "video";
  aspectRatio?: string;
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(objectUrl);
      
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else if (currentFile) {
      setPreviewUrl(currentFile);
    } else {
      setPreviewUrl("");
    }
  }, [selectedFile, currentFile]);

  const getIcon = () => {
    if (type === "video") return <Play className="w-12 h-12 text-zinc-400" />;
    return <ImageIcon className="w-12 h-12 text-zinc-400" />;
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {previewUrl ? (
          <div className={`relative w-full ${aspectRatio} rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-600 bg-black`}>
            {type === "video" ? (
              <video
                src={previewUrl}
                className="w-full h-full object-cover"
                controls={false}
                muted
                loop
              />
            ) : (
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                        <div class="w-16 h-16 flex items-center justify-center">
                        </div>
                      </div>
                    `;
                  }
                }}
              />
            )}
            {type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-white" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`w-full ${aspectRatio} flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600`}>
            {getIcon()}
          </div>
        )}
        
        <div className="w-full md:w-auto space-y-4">
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4">
            <div className="flex flex-col items-center justify-center">
              {previewUrl ? (
                <>
                  <div className="flex gap-3 mb-3">
                    <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Trocar {type === "video" ? "Vídeo" : "Imagem"}
                      <input
                        type="file"
                        accept={accept}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          onFileChange(file);
                        }}
                      />
                    </label>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => onFileChange(null)}
                    >
                      Remover
                    </Button>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Clique em &quot;Trocar&quot; para substituir
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    {getIcon()}
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 text-center">
                    {type === "video" 
                      ? "Upload recomendado: MP4 ou WebM\nTamanho máximo: 50MB"
                      : "Upload recomendado: JPG, PNG ou WebP\nTamanho ideal: 800x600px"
                    }
                  </p>
                  <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Selecionar {type === "video" ? "Vídeo" : "Imagem"}
                    <input
                      type="file"
                      accept={accept}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        onFileChange(file);
                      }}
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    case "video": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "image": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "text": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export default function TestimonialsPage() {
  const [files, setFiles] = useState<MediaFiles>({});
  const [expandedSections, setExpandedSections] = useState({
    geral: true,
    testimonials: true
  });
  const [expandedTestimonials, setExpandedTestimonials] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });

  const {
    data: testimonialsData,
    setData: setTestimonialsData,
    updateNested,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload
  } = useJsonManagement<TestimonialsData>({
    apiPath: "/api/tegbe-institucional/json/alunos",
    defaultData: defaultTestimonialsData,
  });

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

  const handleChange = (path: string, value: any) => {
    updateNested(path, value);
  };

  const handleTestimonialChange = (index: number, path: string, value: any) => {
    updateNested(`testimonials.${index}.${path}`, value);
  };

  const handleFileChange = (testimonialId: string, field: "video" | "image" | "poster", file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [testimonialId]: {
        ...prev[testimonialId],
        [field]: file
      }
    }));
  };

  const addTestimonial = () => {
    const currentTestimonials = [...testimonialsData.testimonials];
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

    handleChange("testimonials", [...currentTestimonials, newTestimonial]);
    setExpandedTestimonials(prev => [...prev, newId]);
  };

  const removeTestimonial = (index: number) => {
    const currentTestimonials = [...testimonialsData.testimonials];
    const testimonialId = currentTestimonials[index].id;
    currentTestimonials.splice(index, 1);
    handleChange("testimonials", currentTestimonials);
    
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[testimonialId];
      return newFiles;
    });
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
    
    handleChange("testimonials", currentTestimonials);
  };

  const handleSubmit = async () => {

    try {
      const fd = new FormData();
      fd.append("values", JSON.stringify(testimonialsData));
      save(fd);
      await reload();
      
      // Limpar os arquivos locais após o envio
      setFiles({});
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
    }
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODOS OS CASOS DE SUCESSO"
    });
  };

  const confirmDelete = async () => {
    try {
      await fetch("/api/tegbe-institucional/json/alunos", {
        method: "DELETE",
      });

      setTestimonialsData(defaultTestimonialsData);
      setFiles({});
      setExpandedTestimonials([]);
    } catch (error) {
      console.error("Erro ao deletar:", error);
    } finally {
      closeDeleteModal();
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: "all", 
      title: "" 
    });
  };

  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    // Verificar seção geral
    if (
      testimonialsData.id.trim() !== "" &&
      testimonialsData.titulo.trim() !== "" &&
      testimonialsData.subtitulo.trim() !== "" &&
      testimonialsData.backgroundColor.trim() !== "" &&
      testimonialsData.textColor.trim() !== ""
    ) {
      count++;
    }
    
    // Verificar depoimentos
    if (testimonialsData.testimonials.length > 0) {
      const hasValidTestimonials = testimonialsData.testimonials.some(testimonial => 
        testimonial.clientName.trim() !== "" && 
        testimonial.clientRole.trim() !== "" &&
        testimonial.description.trim() !== "" &&
        (testimonial.type === "text" || (testimonial.src && testimonial.src.trim() !== ""))
      );
      if (hasValidTestimonials) count++;
    }
    
    return count;
  }, [testimonialsData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 2;

  const renderGeralSection = () => {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            ID da Seção
          </label>
          <Input
            type="text"
            value={testimonialsData.id}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("id", e.target.value)
            }
            placeholder="testimonials-section"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Título
            </label>
            <Input
              type="text"
              value={testimonialsData.titulo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("titulo", e.target.value)
              }
              placeholder="Casos de Sucesso"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Subtítulo
            </label>
            <Input
              type="text"
              value={testimonialsData.subtitulo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("subtitulo", e.target.value)
              }
              placeholder="Veja o que nossos alunos e clientes estão conquistando"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ColorPropertyInput
            label="Cor de Fundo"
            value={testimonialsData.backgroundColor}
            onChange={(color) => handleChange("backgroundColor", color)}
            description="Cor de fundo da seção"
          />

          <ColorPropertyInput
            label="Cor do Texto"
            value={testimonialsData.textColor}
            onChange={(color) => handleChange("textColor", color)}
            description="Cor principal do texto"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-zinc-800 dark:text-zinc-200">
              Exibir Estatísticas
            </h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Mostrar os números de resultado nos depoimentos
            </p>
          </div>
          <div
            onClick={() => handleChange("showStats", !testimonialsData.showStats)}
            className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors cursor-pointer ${
              testimonialsData.showStats ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
              testimonialsData.showStats ? "translate-x-5" : ""
            }`} />
          </div>
        </div>
      </div>
    );
  };

  const renderTestimonial = (testimonial: Testimonial, index: number) => {
    const testimonialFiles = files[testimonial.id] || {};
    const isExpanded = expandedTestimonials.includes(testimonial.id);
    const TypeIcon = getTypeIcon(testimonial.type);

    return (
      <div key={testimonial.id} className="space-y-4">
        <div
          onClick={() => toggleTestimonial(testimonial.id)}
          className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <TypeIcon className="w-5 h-5" />
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(testimonial.type)}`}>
                  {testimonial.type.toUpperCase()}
                </span>
                {testimonial.stats && (
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    COM ESTATÍSTICA
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                {testimonial.clientName || "Cliente sem nome"}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">
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
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  moveTestimonial(index, "down");
                }}
                disabled={index === testimonialsData.testimonials.length - 1}
              >
                ↓
              </Button>
            </div>
            <Button
              type="button"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                removeTestimonial(index);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Card className="p-6 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Coluna 1: Informações básicas */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
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
                                handleTestimonialChange(index, "type", type);
                                // Limpar arquivos ao mudar tipo
                                if (type !== testimonial.type) {
                                  setFiles(prev => ({
                                    ...prev,
                                    [testimonial.id]: {}
                                  }));
                                }
                              }}
                              className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                                testimonial.type === type
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                  : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${
                                testimonial.type === type
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-zinc-500"
                              }`} />
                              <span className="text-xs font-medium capitalize">{type}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Nome do Cliente
                        </label>
                        <Input
                          type="text"
                          value={testimonial.clientName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleTestimonialChange(index, "clientName", e.target.value)
                          }
                          placeholder="Ex: Lucas Martins"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Cargo/Função
                        </label>
                        <Input
                          type="text"
                          value={testimonial.clientRole}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleTestimonialChange(index, "clientRole", e.target.value)
                          }
                          placeholder="Ex: Aluno - Dropshipping"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Depoimento
                      </label>
                      <textarea
                        value={testimonial.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          handleTestimonialChange(index, "description", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[120px]"
                        rows={4}
                        placeholder="Digite o depoimento do cliente..."
                      />
                    </div>

                    {/* Estatísticas */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-zinc-800 dark:text-zinc-200">
                            Estatística do Resultado
                          </h4>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Mostra um número chave do resultado
                          </p>
                        </div>
                        <div
                          onClick={() => {
                            if (testimonial.stats) {
                              handleTestimonialChange(index, "stats", undefined);
                            } else {
                              handleTestimonialChange(index, "stats", {
                                value: "",
                                label: ""
                              });
                            }
                          }}
                          className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors cursor-pointer ${
                            testimonial.stats ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-700"
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                            testimonial.stats ? "translate-x-5" : ""
                          }`} />
                        </div>
                      </div>

                      {testimonial.stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                              Valor
                            </label>
                            <Input
                              type="text"
                              value={testimonial.stats.value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleTestimonialChange(index, "stats", {
                                  ...testimonial.stats!,
                                  value: e.target.value
                                })
                              }
                              placeholder="Ex: R$ 15k, +20%, -50%"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                              Rótulo
                            </label>
                            <Input
                              type="text"
                              value={testimonial.stats.label}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleTestimonialChange(index, "stats", {
                                  ...testimonial.stats!,
                                  label: e.target.value
                                })
                              }
                              placeholder="Ex: Em 48h, Recuperação, CAC"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Coluna 2: Mídia */}
                  <div className="space-y-6">
                    {testimonial.type === "video" && (
                      <>
                        <MediaUpload
                          label="Vídeo do Depoimento"
                          currentFile={testimonial.src || ""}
                          selectedFile={testimonialFiles.video || null}
                          onFileChange={(file) => handleFileChange(testimonial.id, "video", file)}
                          accept="video/*,.mp4,.webm"
                          type="video"
                          aspectRatio="aspect-video"
                        />
                        
                        <MediaUpload
                          label="Thumbnail do Vídeo (Poster)"
                          currentFile={testimonial.poster || ""}
                          selectedFile={testimonialFiles.poster || null}
                          onFileChange={(file) => handleFileChange(testimonial.id, "poster", file)}
                          accept="image/*"
                          type="image"
                          aspectRatio="aspect-video"
                        />
                      </>
                    )}

                    {testimonial.type === "image" && (
                      <MediaUpload
                        label="Imagem do Depoimento"
                        currentFile={testimonial.src || ""}
                        selectedFile={testimonialFiles.image || null}
                        onFileChange={(file) => handleFileChange(testimonial.id, "image", file)}
                        accept="image/*"
                        type="image"
                        aspectRatio="aspect-video"
                      />
                    )}

                    {testimonial.type === "text" && (
                      <div className={`w-full aspect-video flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600`}>
                        <div className="text-center p-8">
                          <FileText className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                          <p className="text-zinc-600 dark:text-zinc-400">
                            Depoimento em formato de texto
                          </p>
                          <p className="text-sm text-zinc-500 mt-2">
                            Apenas o texto será exibido
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-zinc-500 space-y-1">
                      <p>• Para vídeos: envie o arquivo .mp4 ou .webm</p>
                      <p>• A thumbnail será gerada automaticamente ou você pode enviar uma imagem personalizada</p>
                      <p>• Para imagens: JPG, PNG ou WebP (recomendado 800x600px)</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
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
      <form onSubmit={handleSubmitWrapper} className="space-y-6 pb-32">
        {/* Seção Geral */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações Gerais"
            icon={Settings}
            isExpanded={expandedSections.geral}
            onToggle={() => toggleSection("geral")}
          />

          <AnimatePresence>
            {expandedSections.geral && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderGeralSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção Depoimentos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader
              title={`Casos de Sucesso (${testimonialsData.testimonials.length})`}
              icon={MessageCircle}
              isExpanded={expandedSections.testimonials}
              onToggle={() => toggleSection("testimonials")}
            />
            <Button
              type="button"
              onClick={addTestimonial}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Caso
            </Button>
          </div>

          <AnimatePresence>
            {expandedSections.testimonials && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {testimonialsData.testimonials.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Nenhum caso de sucesso adicionado
                      </h4>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                        Comece adicionando depoimentos em vídeo, imagem ou texto dos seus clientes
                      </p>
                      <Button
                        type="button"
                        onClick={addTestimonial}
                        className="flex items-center gap-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Primeiro Caso
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {testimonialsData.testimonials.map((testimonial, index) => 
                        renderTestimonial(testimonial, index)
                      )}
                    </div>
                  )}
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

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}