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
  Crown,
  Target,
  Image as ImageIcon,
  Type,
  Tag,
  ChevronDown, 
  ChevronUp,
  Palette,
  Sparkles,
  ArrowRight,
  Layers,
  FileText,
  Settings,
  Upload,
  Trash2
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import IconSelector from "@/components/IconSelector";
import Image from "next/image";

interface ThemeData {
  accentColor: string;
  secondaryColor: string;
}

interface HeaderData {
  badgeIcon: string;
  badgeText: string;
  titleLine1: string;
  titleHighlight: string;
}

interface FloatingCard {
  icon: string;
  title: string;
  subtitle: string;
}

interface VisualData {
  imageSrc: string;
  imageAlt: string;
  floatingCard: FloatingCard;
}

interface ContentData {
  paragraph1: string;
  paragraph2: string;
}

interface CTAData {
  text: string;
  link: string;
}

interface MethodData {
  id?: string;
  theme: ThemeData;
  header: HeaderData;
  visual: VisualData;
  content: ContentData;
  cta: CTAData;
  [key: string]: any;
}

const defaultMethodData: MethodData = {
  theme: {
    accentColor: "#FFD700",
    secondaryColor: "#B8860B"
  },
  header: {
    badgeIcon: "ph:strategy-bold",
    badgeText: "Método Proprietário",
    titleLine1: "Não é sorte. É engenharia.",
    titleHighlight: "Processos que replicam sucesso."
  },
  visual: {
    imageSrc: "",
    imageAlt: "Dashboards de Alunos TegPro",
    floatingCard: {
      icon: "ph:crown-simple-fill",
      title: "Protocolo Validado",
      subtitle: "Aplicado em +1.200 negócios"
    }
  },
  content: {
    paragraph1: "Você acabou de ver os resultados acima. Nenhum deles aconteceu por acaso. Eles aconteceram porque instalaram o <strong>Sistema Operacional TegPro</strong>.",
    paragraph2: "Não vendemos 'hacks' que param de funcionar na próxima atualização. Ensinamos <strong>fundamentos de negócios</strong>: aquisição de clientes, processos comerciais e gestão financeira. É assim que transformamos autônomos em <strong style='border-bottom: 1px solid #FFD700'>empresários de escala.</strong>"
  },
  cta: {
    text: "Acessar o Protocolo",
    link: "#planos"
  }
};

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

// Componente ColorPropertyInput para campos de cor
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
          placeholder="#FFD700"
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

// Componente ImageUpload
interface ImageUploadProps {
  label: string;
  currentImage: string;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  aspectRatio?: string;
}

const ImageUpload = ({ label, currentImage, selectedFile, onFileChange, aspectRatio = "aspect-video" }: ImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    // Se houver um arquivo selecionado, criar uma URL temporária
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(objectUrl);
      
      // Limpar a URL quando o componente for desmontado
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else if (currentImage) {
      // Se não houver arquivo mas houver uma imagem salva, usar ela
      setPreviewUrl(currentImage);
    } else {
      // Se não houver nada, limpar a preview
      setPreviewUrl("");
    }
  }, [selectedFile, currentImage]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {previewUrl ? (
          <div className={`relative w-full ${aspectRatio} rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900`}>
            <Image
              src={previewUrl}
              alt="Image preview"
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                      <svg class="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  `;
                }
              }}
            />
          </div>
        ) : (
          <div className={`w-full ${aspectRatio} flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600`}>
            <ImageIcon className="w-12 h-12 text-zinc-400" />
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
                      Trocar Imagem
                      <input
                        type="file"
                        accept="image/*"
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
                    Clique em &quot;Trocar Imagem&quot; para substituir
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 text-center">
                    Upload recomendado: JPG, PNG ou WebP<br/>
                    Tamanho ideal: 1200x800px
                  </p>
                  <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Selecionar Imagem
                    <input
                      type="file"
                      accept="image/*"
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

export default function MethodPage() {
  const {
    data: methodData,
    setData: setMethodData,
    updateNested,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload
  } = useJsonManagement<MethodData>({
    apiPath: "/api/tegbe-institucional/json/expertise-curso",
    defaultData: defaultMethodData,
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    theme: true,
    header: true,
    visual: true,
    content: true,
    cta: true
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });

  // Processar os dados para mesclar propriedades
  const [processedData, setProcessedData] = useState<MethodData>(defaultMethodData);

  useEffect(() => {
    if (methodData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProcessedData(methodData);
    }
  }, [methodData]);

  // Calcular campos completos
  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    if (!processedData) return 0;
    
    // Verificar tema
    if (
      processedData.theme.accentColor.trim() !== "" &&
      processedData.theme.secondaryColor.trim() !== ""
    ) {
      count++;
    }
    
    // Verificar header
    if (
      processedData.header.badgeIcon.trim() !== "" &&
      processedData.header.badgeText.trim() !== "" &&
      processedData.header.titleLine1.trim() !== "" &&
      processedData.header.titleHighlight.trim() !== ""
    ) {
      count++;
    }
    
    // Verificar visual
    if (
      processedData.visual.imageSrc.trim() !== "" &&
      processedData.visual.imageAlt.trim() !== "" &&
      processedData.visual.floatingCard.icon.trim() !== "" &&
      processedData.visual.floatingCard.title.trim() !== "" &&
      processedData.visual.floatingCard.subtitle.trim() !== ""
    ) {
      count++;
    }
    
    // Verificar content
    if (
      processedData.content.paragraph1.trim() !== "" &&
      processedData.content.paragraph2.trim() !== ""
    ) {
      count++;
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
  const totalCount = 5; // theme, header, visual, content, cta

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    updateNested(path, value);
  };

  const handleImageFileChange = (file: File | null) => {
    setSelectedImageFile(file);
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    
    // Adicionar os dados JSON
    fd.append("values", JSON.stringify(processedData));

    // Processar arquivo de imagem se existir
    if (selectedImageFile) {
      fd.append("file:visual.imageSrc", selectedImageFile, selectedImageFile.name);
    }

    try {
      const fd = new FormData();
      fd.append("values", JSON.stringify(methodData));
      save(fd);
      await reload();
      
      // Limpar o arquivo local após o envio
      setSelectedImageFile(null);
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
    }
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODOS OS CONTEÚDOS DO MÉTODO"
    });
  };

  const confirmDelete = async () => {
    await fetch("/api/tegbe-institucional/json/expertise-curso", {
      method: "DELETE",
    });

    setMethodData(defaultMethodData);
    setProcessedData(defaultMethodData);
    setSelectedImageFile(null);
    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: "all", 
      title: "" 
    });
  };

  const renderThemeSection = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ColorPropertyInput
            label="Cor de Destaque (Acentuação)"
            value={processedData.theme.accentColor}
            onChange={(color) => handleChange("theme.accentColor", color)}
            description="Cor principal para destaques e elementos importantes"
          />

          <ColorPropertyInput
            label="Cor Secundária"
            value={processedData.theme.secondaryColor}
            onChange={(color) => handleChange("theme.secondaryColor", color)}
            description="Cor de apoio e elementos complementares"
          />
        </div>
      </div>
    );
  };

  const renderHeaderSection = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <IconSelector
              value={processedData.header.badgeIcon}
              onChange={(value) => handleChange("header.badgeIcon", value)}
              label="Ícone do Badge"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Texto do Badge
            </label>
            <Input
              type="text"
              value={processedData.header.badgeText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("header.badgeText", e.target.value)
              }
              placeholder="Método Proprietário"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Linha 1 do Título
            </label>
            <Input
              type="text"
              value={processedData.header.titleLine1}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("header.titleLine1", e.target.value)
              }
              placeholder="Não é sorte. É engenharia."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Destaque do Título
            </label>
            <Input
              type="text"
              value={processedData.header.titleHighlight}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("header.titleHighlight", e.target.value)
              }
              placeholder="Processos que replicam sucesso."
              className="font-semibold"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderVisualSection = () => {
    return (
      <div className="space-y-6">
        <ImageUpload
          label="Imagem Principal"
          currentImage={processedData.visual.imageSrc}
          selectedFile={selectedImageFile}
          onFileChange={handleImageFileChange}
          aspectRatio="aspect-video"
        />

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Texto Alternativo da Imagem
          </label>
          <Input
            type="text"
            value={processedData.visual.imageAlt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("visual.imageAlt", e.target.value)
            }
            placeholder="Dashboards de Alunos TegPro"
          />
          <p className="text-xs text-zinc-500 mt-2">
            Descrição da imagem para acessibilidade e SEO
          </p>
        </div>

        {/* Floating Card */}
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
          <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Card Flutuante
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <IconSelector
                value={processedData.visual.floatingCard.icon}
                onChange={(value) => handleChange("visual.floatingCard.icon", value)}
                label="Ícone do Card"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Título do Card
              </label>
              <Input
                type="text"
                value={processedData.visual.floatingCard.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("visual.floatingCard.title", e.target.value)
                }
                placeholder="Protocolo Validado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Subtítulo do Card
              </label>
              <Input
                type="text"
                value={processedData.visual.floatingCard.subtitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("visual.floatingCard.subtitle", e.target.value)
                }
                placeholder="Aplicado em +1.200 negócios"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContentSection = () => {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Parágrafo 1 (HTML permitido)
          </label>
          <textarea
            value={processedData.content.paragraph1}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleChange("content.paragraph1", e.target.value)
            }
            rows={4}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
            placeholder="Você acabou de ver os resultados acima. Nenhum deles aconteceu por acaso..."
          />
          <p className="text-xs text-zinc-500 mt-2">
            Use tags HTML como &lt;strong&gt; para texto em negrito
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Parágrafo 2 (HTML permitido)
          </label>
          <textarea
            value={processedData.content.paragraph2}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleChange("content.paragraph2", e.target.value)
            }
            rows={4}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
            placeholder="Não vendemos 'hacks' que param de funcionar na próxima atualização..."
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
              placeholder="Acessar o Protocolo"
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
              placeholder="#planos"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={Layers}
      title="Método Proprietário TegPro"
      description="Gerencie o conteúdo e visual da seção que apresenta o método proprietário"
      exists={!!exists}
      itemName="Método"
    >
      <form onSubmit={handleSubmitWrapper} className="space-y-6 pb-32">
        {/* Seção Tema */}
        <div className="space-y-4">
          <SectionHeader
            title="Tema e Cores"
            section="theme"
            icon={Palette}
            isExpanded={expandedSections.theme}
            onToggle={() => toggleSection("theme")}
          />

          <AnimatePresence>
            {expandedSections.theme && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderThemeSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho"
            section="header"
            icon={Type}
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

        {/* Seção Visual */}
        <div className="space-y-4">
          <SectionHeader
            title="Visual e Imagem"
            section="visual"
            icon={ImageIcon}
            isExpanded={expandedSections.visual}
            onToggle={() => toggleSection("visual")}
          />

          <AnimatePresence>
            {expandedSections.visual && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderVisualSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção Conteúdo */}
        <div className="space-y-4">
          <SectionHeader
            title="Conteúdo"
            section="content"
            icon={FileText}
            isExpanded={expandedSections.content}
            onToggle={() => toggleSection("content")}
          />

          <AnimatePresence>
            {expandedSections.content && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderContentSection()}
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
          itemName="Método"
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
        itemName="Método"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}