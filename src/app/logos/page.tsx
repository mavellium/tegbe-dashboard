// app/logos/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Image as ImageIcon, Plus, Trash2, ChevronDown, ChevronUp, MoveUp, MoveDown } from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { ImageUpload } from "@/components/Manage/ImageUpload";

interface LogoItem {
  id?: string;
  image: string; // Alterado de src para image
  alt: string;
  width: number;
  height: number;
  file?: File | null;
}

const defaultLogoItem: LogoItem = {
  image: "", // Alterado de src para image
  alt: "",
  width: 100,
  height: 100,
  file: null
};

export default function LogosPage() {
  const [logos, setLogos] = useState<LogoItem[]>([defaultLogoItem]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedLogos, setExpandedLogos] = useState<Record<number, boolean>>({});
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "single" as "single" | "all",
    title: "",
    logoIndex: -1
  });

  const apiBase = "/api/tegbe-institucional/form";
  const type = "logos";

  // Calcular campos completos
  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    logos.forEach(logo => {
      if (logo.image.trim() !== "" && logo.alt.trim() !== "" && logo.width > 0 && logo.height > 0) {
        count++;
      }
    });
    
    return count;
  }, [logos]);

  const completeCount = calculateCompleteCount();
  const totalCount = logos.length;
  const exists = logos.some(logo => logo.id);
  const canAddNewItem = true;
  const isLimitReached = false;

  const fetchExistingData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/${type}`);

      if (res.ok) {
        const data = await res.json();
        if (data && data.values && Array.isArray(data.values)) {
          // Se já existirem logos salvos
          if (data.values.length > 0) {
            setLogos(data.values.map((item: any) => ({
              ...item,
              file: null // Reset file para evitar problemas
            })));
          }
        }
      } else if (res.status === 404) {
        // Não encontrado, usar estado padrão
        console.log("Nenhum dado encontrado, usando padrão");
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setErrorMsg("Erro ao carregar dados do servidor");
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchExistingData();
  }, [fetchExistingData]);

  const toggleLogoExpansion = (index: number) => {
    setExpandedLogos(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleChange = (index: number, field: keyof LogoItem, value: any) => {
    const newLogos = [...logos];
    
    if (!newLogos[index]) {
      newLogos[index] = { ...defaultLogoItem };
    }
    
    // Converter para número se for width ou height
    if (field === 'width' || field === 'height') {
      newLogos[index][field] = Number(value) || 0;
    } else {
      newLogos[index][field] = value;
    }
    
    setLogos(newLogos);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newLogos = [...logos];
    
    if (!newLogos[index]) {
      newLogos[index] = { ...defaultLogoItem };
    }
    
    newLogos[index] = {
      ...newLogos[index],
      file,
      image: file ? URL.createObjectURL(file) : newLogos[index].image || "" // Alterado de src para image
    };
    
    setLogos(newLogos);
  };

  const addLogo = () => {
    const newLogo: LogoItem = {
      image: "", // Alterado de src para image
      alt: "",
      width: 100,
      height: 100,
      file: null
    };
    setLogos(prev => [...prev, newLogo]);
  };

  const removeLogo = (index: number) => {
    if (logos.length <= 1) {
      // Se for o último, apenas limpa os campos
      setLogos([defaultLogoItem]);
    } else {
      const newLogos = logos.filter((_, i) => i !== index);
      setLogos(newLogos);
    }
  };

  const moveLogo = (index: number, direction: "up" | "down") => {
    const newLogos = [...logos];
    
    if (direction === "up" && index > 0) {
      [newLogos[index], newLogos[index - 1]] = [newLogos[index - 1], newLogos[index]];
    } else if (direction === "down" && index < newLogos.length - 1) {
      [newLogos[index], newLogos[index + 1]] = [newLogos[index + 1], newLogos[index]];
    }
    
    setLogos(newLogos);
  };

  const prepareDataForApi = () => {
    // Remover a propriedade 'file' antes de enviar
    return logos.map(logo => {
      const { file, ...logoData } = logo;
      return logoData;
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const dataToSend = prepareDataForApi();
      const fd = new FormData();

      fd.append("type", type);
      fd.append("subtype", "tegbe-institucional");
      fd.append("values", JSON.stringify(dataToSend));

      // Adicionar IDs existentes
      const existingIds = logos.filter(logo => logo.id).map(logo => logo.id);
      if (existingIds.length > 0) {
        fd.append("ids", JSON.stringify(existingIds));
      }

      // Adicionar arquivos
      logos.forEach((logo, index) => {
        if (logo.file) {
          fd.append(`file${index}`, logo.file);
          fd.append(`file${index}_path`, logo.image); // Para referência
        }
      });

      const method = exists ? "PUT" : "POST";

      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || "Erro ao salvar logos"
        );
      }

      const saved = await res.json();

      if (saved?.values && Array.isArray(saved.values)) {
        // Atualizar os IDs dos logos salvos
        const updatedLogos = logos.map((logo, index) => ({
          ...logo,
          id: saved.values[index]?.id || logo.id,
          image: saved.values[index]?.image || logo.image, // Alterado de src para image
          file: null // Limpar arquivo após salvar
        }));
        setLogos(updatedLogos);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWrapper = () => {
    handleSubmit();
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODOS OS LOGOS",
      logoIndex: -1
    });
  };

  const openDeleteLogoModal = (index: number) => {
    const logo = logos[index];
    setDeleteModal({
      isOpen: true,
      type: "single",
      title: `Logo: ${logo.alt || "Sem descrição"}`,
      logoIndex: index
    });
  };

  const addItem = () => {
    addLogo();
  };

  const confirmDelete = async () => {
    if (deleteModal.type === "all") {
      try {
        // Buscar IDs existentes para deletar
        const existingIds = logos.filter(logo => logo.id).map(logo => logo.id);
        
        if (existingIds.length > 0) {
          const res = await fetch(`${apiBase}/${type}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ids: existingIds })
          });

          if (!res.ok) {
            throw new Error("Erro ao deletar logos");
          }
        }

        setLogos([defaultLogoItem]);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err: any) {
        setErrorMsg(err.message || "Erro ao deletar");
      }
    } else if (deleteModal.type === "single" && deleteModal.logoIndex >= 0) {
      removeLogo(deleteModal.logoIndex);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
    
    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: "single", 
      title: "", 
      logoIndex: -1 
    });
  };

  const getImageUrl = (logo: LogoItem): string => {
    if (logo.file) {
      return URL.createObjectURL(logo.file);
    }
    return logo.image || ""; // Alterado de src para image
  };

  const renderLogoItem = (logo: LogoItem, index: number) => {
    const imageUrl = getImageUrl(logo);
    const isExpanded = expandedLogos[index] || false;
    
    return (
      <Card key={index} className="mb-4 overflow-hidden border border-zinc-200 dark:border-zinc-700">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveLogo(index, "up")}
                  disabled={index === 0}
                  className="p-1 disabled:opacity-30 text-zinc-600 dark:text-zinc-400"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveLogo(index, "down")}
                  disabled={index === logos.length - 1}
                  className="p-1 disabled:opacity-30 text-zinc-600 dark:text-zinc-400"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
              </div>
              <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                Logo #{index + 1}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleLogoExpansion(index)}
                className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              
              <Button
                type="button"
                onClick={() => openDeleteLogoModal(index)}
                disabled={logos.length <= 1}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                variant="danger"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <motion.div
            initial={false}
            animate={{ height: isExpanded ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
              {/* Coluna 1: Upload e Preview */}
              <div className="space-y-6">
                <div>
                  <ImageUpload
                    imageUrl={imageUrl}
                    hasImage={!!imageUrl}
                    file={logo.file || null}
                    onFileChange={(file) => handleFileChange(index, file)}
                    onExpand={setExpandedImage}
                    label="Upload do Logo"
                    altText={logo.alt || "Preview do logo"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    URL do Logo (Opcional)
                  </label>
                  <Input
                    type="text"
                    value={logo.image} // Alterado de src para image
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(index, "image", e.target.value) // Alterado de src para image
                    }
                    placeholder="/logo1.svg"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Caminho relativo ou URL completa. Se fizer upload, isso será sobrescrito.
                  </p>
                </div>
              </div>

              {/* Coluna 2: Dados do Logo */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Texto Alternativo (Alt Text)
                  </label>
                  <Input
                    type="text"
                    value={logo.alt}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(index, "alt", e.target.value)
                    }
                    placeholder="Ex: Logo da Empresa X"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Descrição para acessibilidade e SEO
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Largura (px)
                    </label>
                    <Input
                      type="number"
                      min="10"
                      max="500"
                      value={logo.width.toString()}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange(index, "width", e.target.value)
                      }
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Altura (px)
                    </label>
                    <Input
                      type="number"
                      min="10"
                      max="500"
                      value={logo.height.toString()}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange(index, "height", e.target.value)
                      }
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Card>
    );
  };

  return (
    <ManageLayout
      headerIcon={ImageIcon}
      title="Gerenciamento de Logos"
      description="Adicione e gerencie os logos que serão exibidos no site"
      exists={exists}
      itemName="Logo"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Lista de Logos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              Logos ({logos.length})
            </h3>
            
            <Button
              type="button"
              onClick={addLogo}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Logo
            </Button>
          </div>

          {logos.length === 0 ? (
            <Card className="p-8 text-center border-2 border-dashed border-zinc-300 dark:border-zinc-700">
              <ImageIcon className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Nenhum logo cadastrado. Adicione seu primeiro logo!
              </p>
              <Button
                type="button"
                onClick={addLogo}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Adicionar Primeiro Logo
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {logos.map((logo, index) => 
                renderLogoItem(logo, index)
              )}
            </div>
          )}
        </div>

        {/* Fixed Action Bar */}
        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onAddNew={addItem}
          onSubmit={handleSubmitWrapper}
          isAddDisabled={!canAddNewItem || isLimitReached}
          isSaving={loading}
          exists={exists}
          completeCount={completeCount}
          totalCount={totalCount}
          itemName="Logo"
          icon={ImageIcon}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={deleteModal.type === "single" ? 1 : logos.length}
        itemName="Logo"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />

      {/* Modal de Imagem Expandida */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <Button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-4 -right-4 !p-3 !rounded-full bg-red-500 hover:bg-red-600 z-10"
            >
              ✕
            </Button>
            <img
              src={expandedImage}
              alt="Preview expandido"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl"
              onError={(e) => {
                console.error('Erro ao carregar imagem expandida:', expandedImage);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </ManageLayout>
  );
}