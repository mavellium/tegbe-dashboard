/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListManagement } from "@/hooks/useListManagement";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Type, MessageSquare, Image as ImageIcon, X, ChevronDown, ChevronUp } from "lucide-react";
import { SearchSortBar } from "@/components/Manage/SearchSortBar";
import { ItemHeader } from "@/components/Manage/ItemHeader";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { ImageUpload } from "@/components/Manage/ImageUpload";
import ColorPicker from "@/components/ColorPicker";
import IconSelector from "@/components/IconSelector";
import Image from "next/image";

interface AdsItem {
  id?: string;
  titulo?: {
    linha1?: string;
    linha2?: string;
    linha3?: string;
    linha4?: string;
    linha5?: string;
    linha6?: string;
    linha7?: string;
    corDestaque?: string;
  };
  botao?: {
    texto?: string;
    link?: string;
    icone?: string;
  };
  background?: {
    src?: string;
    alt?: string;
  };
  file?: File | null;
}

export default function AdsPage({ 
  type = "ads", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  const defaultItem = useMemo(() => ({ 
    titulo: {
      linha1: "",
      linha2: "",
      linha3: "",
      linha4: "",
      linha5: "",
      linha6: "",
      linha7: "",
      corDestaque: "#FFCC00"
    },
    botao: {
      texto: "",
      link: "",
      icone: "ic:baseline-whatsapp"
    },
    background: {
      src: "",
      alt: ""
    },
    file: null
  }), []);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const apiBase = `/api/${subtype}/form`;

  const {
    list: adsList,
    setList: setAdsList,
    exists,
    loading,
    setLoading,
    success,
    setSuccess,
    errorMsg,
    setErrorMsg,
    search,
    setSearch,
    sortOrder,
    setSortOrder,
    showValidation,
    filteredItems: filteredAds,
    deleteModal,
    newItemRef,
    canAddNewItem,
    completeCount,
    isLimitReached,
    currentPlanLimit,
    currentPlanType,
    openDeleteSingleModal,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
    clearFilters,
  } = useListManagement<AdsItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem,
    validationFields: ["titulo", "botao"]
  });

  const remainingSlots = Math.max(0, currentPlanLimit - adsList.length);

  const setNewItemRef = useCallback((node: HTMLDivElement | null) => {
    if (newItemRef && node) {
      (newItemRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [newItemRef]);

  // Carregar dados do backend
useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      console.log("Carregando dados do backend...");

      const response = await fetch(`${apiBase}/${type}`);

      if (!response.ok) {
        console.error("Erro na resposta do backend:", response.status);
        setAdsList([defaultItem]);
        return;
      }

      const data = await response.json();
      console.log("Dados recebidos do backend:", data);

      if (data && Array.isArray(data.values) && data.values.length > 0) {
        const dbItem = data.values[0];
        console.log("Item encontrado no banco:", dbItem);

        const normalizedItem: AdsItem = {
          id: data.id,
          titulo: {
            linha1: dbItem?.titulo?.linha1 ?? "",
            linha2: dbItem?.titulo?.linha2 ?? "",
            linha3: dbItem?.titulo?.linha3 ?? "",
            linha4: dbItem?.titulo?.linha4 ?? "",
            linha5: dbItem?.titulo?.linha5 ?? "",
            linha6: dbItem?.titulo?.linha6 ?? "",
            linha7: dbItem?.titulo?.linha7 ?? "",
            corDestaque: dbItem?.titulo?.corDestaque ?? "#FFCC00",
          },
          botao: {
            texto: dbItem?.botao?.texto ?? "",
            link: dbItem?.botao?.link ?? "",
            icone: dbItem?.botao?.icone ?? "ic:baseline-whatsapp",
          },
          background: {
            src: dbItem?.background?.src ?? "",
            alt: dbItem?.background?.alt ?? "",
          },
          file: null,
        };

        console.log("Item normalizado:", normalizedItem);
        setAdsList([normalizedItem]);
      } else {
        console.log("Registro existe, mas values vazio. Usando padrão");
        setAdsList([defaultItem]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setAdsList([defaultItem]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  if (initialLoad) {
    loadData();
  }
}, [apiBase, type, initialLoad]);
  const toggleSection = (index: number, section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${index}-${section}`]: !prev[`${index}-${section}`]
    }));
  };

const handleSubmit = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();

  setLoading(true);
  setErrorMsg("");
  setSuccess(false);

  try {
    const item = adsList[0];
    if (!item) throw new Error("Nenhum Ads para salvar");

    const fd = new FormData();

    // Identificação
    fd.append("type", type);
    fd.append("subtype", subtype);

    if (item.id) {
      fd.append("id", item.id);
    }

    // Conteúdo (JSON)
    const values = [
      {
        titulo: item.titulo,
        botao: item.botao,
        background: {
          ...item.background,
          src: item.background?.src || "",
        },
      },
    ];

    fd.append("values", JSON.stringify(values));

    // Arquivo
    if (item.file) {
      fd.append("file0", item.file);
    }

    const method =  item.id && !item.id.startsWith("temp-") ? "PUT" : "POST";

    const res = await fetch(`/api/${subtype}/form/${type}`, {
      method,
      body: fd,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao salvar");

    setAdsList([
      {
        ...item,
        id: data.id,
        file: null,
        background: data.values?.[0]?.background ?? item.background,
      },
    ]);

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  } catch (err: any) {
    console.error("SAVE ERROR:", err);
    setErrorMsg(err.message);
  } finally {
    setLoading(false);
  }
};


  const handleChange = (index: number, path: string, value: any) => {
    const newList = [...adsList];
    
    // Garantir que temos um item
    if (!newList[index]) {
      newList[index] = JSON.parse(JSON.stringify(defaultItem));
    }
    
    const keys = path.split('.');
    let current: any = newList[index];
    
    // Criar estrutura se não existir
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    // Extrair valor do evento ou usar valor direto
    const finalValue = value?.target?.value !== undefined ? value.target.value : value;
    
    // Atualizar valor
    current[keys[keys.length - 1]] = String(finalValue || "");
    
    setAdsList(newList);
    console.log(`Campo ${path} alterado para:`, finalValue);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newList = [...adsList];
    
    if (!newList[index]) {
      newList[index] = JSON.parse(JSON.stringify(defaultItem));
    }
    
    newList[index] = {
      ...newList[index],
      file,
      background: {
        ...newList[index]?.background,
        src: file ? URL.createObjectURL(file) : newList[index]?.background?.src || ""
      }
    };
    
    setAdsList(newList);
    console.log('Arquivo alterado:', file ? file.name : 'removido');
  };

  const getImageUrl = (item: AdsItem): string => {
    if (item?.file) {
      return URL.createObjectURL(item.file);
    }
    return item?.background?.src || "";
  };

  const SectionHeader = ({ 
    title, 
    section, 
    index, 
    icon: Icon 
  }: { 
    title: string; 
    section: string; 
    index: number;
    icon: any; 
  }) => {
    const isExpanded = expandedSections[`${index}-${section}`];
    
    return (
      <button
        type="button"
        onClick={() => toggleSection(index, section)}
        className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors mb-4"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
        )}
      </button>
    );
  };

  const renderAdsItem = (item: AdsItem | null, index: number, isSearchMode = false) => {
    if (!item) return null;

    // Extrair valores com fallbacks
    const titulo = item.titulo || {};
    const botao = item.botao || {};
    const background = item.background || {};

    const linha1 = titulo.linha1 || "";
    const linha2 = titulo.linha2 || "";
    const linha3 = titulo.linha3 || "";
    const linha4 = titulo.linha4 || "";
    const linha5 = titulo.linha5 || "";
    const linha6 = titulo.linha6 || "";
    const linha7 = titulo.linha7 || "";
    const corDestaque = titulo.corDestaque || "#FFCC00";
    
    const botaoTexto = botao.texto || "";
    const botaoLink = botao.link || "";
    const botaoIcone = botao.icone || "ic:baseline-whatsapp";
    
    const backgroundSrc = background.src || "";
    const backgroundAlt = background.alt || "";

    const hasTitulo = [linha1, linha2, linha3, linha4, linha5, linha6, linha7].some(val => val.trim() !== "");
    const hasBotao = botaoTexto.trim() !== "" || botaoLink.trim() !== "";
    const hasBackground =
    Boolean(backgroundSrc?.trim()) || Boolean(item.file);
    const isLastInOriginalList = index === adsList.length - 1;
    const isLastAndEmpty = isLastInOriginalList && !hasTitulo && !hasBotao && !hasBackground;
    const imageUrl = getImageUrl(item);

    return (
      <div
        key={item?.id || `ads-${index}`}
        ref={isLastAndEmpty && !isSearchMode ? setNewItemRef : null}
      >
        <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
          isLastInOriginalList && showValidation && !hasTitulo && !hasBotao ? 'ring-2 ring-red-500' : ''
        }`}>
          <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
            {isSearchMode && (
              <ItemHeader
                index={index}
                fields={[
                  { label: 'Título', hasValue: hasTitulo },
                  { label: 'Botão', hasValue: hasBotao },
                  { label: 'Fundo', hasValue: hasBackground }
                ]}
                showValidation={showValidation}
                isLast={isLastInOriginalList}
                onDelete={() => openDeleteSingleModal(index, "Seção Ads")}
                showDelete={adsList.length > 1}
              />
            )}
            
            {/* Seção Título */}
            <SectionHeader title="Título" section="titulo" index={index} icon={Type} />
            
            <AnimatePresence>
              {expandedSections[`${index}-titulo`] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                    {[1, 2, 3, 4, 5, 6, 7].map(num => (
                      <div key={`linha${num}`}>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Linha {num}
                        </label>
                        <Input
                          type="text"
                          value={titulo[`linha${num}` as keyof typeof titulo] || ""}
                          onChange={(e: any) => handleChange(index, `titulo.linha${num}`, e)}
                        />
                      </div>
                    ))}

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Cor de Destaque (Linha 7)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="#FFCC00"
                          value={corDestaque}
                          onChange={(e: any) => handleChange(index, 'titulo.corDestaque', e)}
                          className="font-mono"
                        />
                        <ColorPicker
                          color={corDestaque}
                          onChange={(color: string) => handleChange(index, 'titulo.corDestaque', color)}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Seção Botão */}
            <SectionHeader title="Botão de Ação" section="botao" index={index} icon={MessageSquare} />
            
            <AnimatePresence>
              {expandedSections[`${index}-botao`] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Texto do Botão
                      </label>
                      <Input
                        type="text"
                        value={botaoTexto}
                        onChange={(e: any) => handleChange(index, 'botao.texto', e)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Link (URL)
                      </label>
                      <Input
                        type="text"
                        value={botaoLink}
                        onChange={(e: any) => handleChange(index, 'botao.link', e)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <IconSelector
                        value={botaoIcone}
                        onChange={(value) => handleChange(index, 'botao.icone', value)}
                        label="Ícone do Botão"
                        placeholder="ic:baseline-whatsapp"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Seção Background */}
            <SectionHeader title="Imagem de Fundo" section="background" index={index} icon={ImageIcon} />
            
            <AnimatePresence>
              {expandedSections[`${index}-background`] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-6 p-4">
                    <div>
                      <ImageUpload
                        imageUrl={imageUrl}
                        hasImage={!!hasBackground}
                        file={item.file || null}
                        onFileChange={(file) => handleFileChange(index, file)}
                        onExpand={setExpandedImage}
                        label="Imagem de Fundo (Opcional)"
                        altText={backgroundAlt || "Preview da imagem de fundo"}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Texto Alternativo (Alt Text)
                      </label>
                      <Input
                        type="text"
                        value={backgroundAlt}
                        onChange={(e: any) => handleChange(index, 'background.alt', e)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>
    );
  };

  const handleSubmitWrapper = () => {
    handleSubmit();
  };

  return (
    <ManageLayout
      headerIcon={Type}
      title="Ads - Seção de Anúncios"
      description="Configure o conteúdo da seção de anúncios/ads da página"
      exists={!!exists}
      itemName="Seção Ads"
    >
      <div className="mb-6 space-y-4">
        <SearchSortBar
          search={search}
          setSearch={setSearch}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onClearFilters={clearFilters}
          searchPlaceholder="Buscar seções de Ads..."
          total={adsList.length}
          showing={filteredAds.length}
          searchActiveText="ⓘ Busca ativa - não é possível adicionar nova seção"
          currentPlanType={currentPlanType}
          currentPlanLimit={currentPlanLimit}
          remainingSlots={remainingSlots}
          isLimitReached={isLimitReached}
        />
      </div>

      <div className="space-y-4 pb-32">
        <form onSubmit={handleSubmit}>
          <AnimatePresence>
            {search ? (
              filteredAds.map((item ) => {
                const originalIndex = adsList.findIndex(a => a.id === item.id);
                return renderAdsItem(item, originalIndex, true);
              })
            ) : (
              adsList.map((item, index) => renderAdsItem(item, index))
            )}
          </AnimatePresence>
        </form>
      </div>

      <FixedActionBar
        onDeleteAll={openDeleteAllModal}
        onSubmit={handleSubmitWrapper}
        isAddDisabled={!canAddNewItem || isLimitReached}
        isSaving={loading}
        exists={!!exists}
        completeCount={completeCount}
        totalCount={adsList.length}
        itemName="Seção Ads"
        icon={Type}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete()}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={adsList.length}
        itemName="Seção Ads"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />

      {/* Modal de Imagem Expandida */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setExpandedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={() => setExpandedImage(null)}
                className="absolute -top-4 -right-4 !p-3 !rounded-full bg-red-500 hover:bg-red-600 z-10"
              >
                <X className="w-5 h-5" />
              </Button>
              {expandedImage.startsWith('blob:') ? (
                <img
                  src={expandedImage}
                  alt="Preview expandido"
                  className="max-w-full max-h-[80vh] object-contain rounded-2xl"
                  onError={(e) => {
                    console.error('Erro ao carregar imagem expandida:', expandedImage);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <Image
                  src={expandedImage}
                  alt="Preview expandido"
                  width={800}
                  height={600}
                  className="max-w-full max-h-[80vh] object-contain rounded-2xl"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ManageLayout>
  );
}