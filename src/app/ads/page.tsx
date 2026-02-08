/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListManagement } from "@/hooks/useListManagement";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { 
  Type, 
  MessageSquare, 
  Image as ImageIcon, 
  X, 
  ChevronDown, 
  ChevronUp
} from "lucide-react";
import { SearchSortBar } from "@/components/Manage/SearchSortBar";
import { ItemHeader } from "@/components/Manage/ItemHeader";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { ImageUpload } from "@/components/ImageUpload";
import ColorPicker from "@/components/ColorPicker";
import IconSelector from "@/components/IconSelector";
import { Button } from "@/components/Button";

// ================= TIPOS =================
interface AdsItem {
  id?: string;
  titulo: {
    linha1: string;
    linha2: string;
    linha3: string;
    linha4: string;
    linha5: string;
    linha6: string;
    linha7: string;
    corDestaque: string;
  };
  botao: {
    texto: string;
    link: string;
    icone: string;
  };
  background: {
    src: string;
    alt: string;
  };
}

// ================= COMPONENTE PRINCIPAL =================
export default function AdsPage({ 
  type = "ads", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  // --- Estados e Configurações Iniciais ---
  const defaultItem: AdsItem = useMemo(() => ({ 
    titulo: {
      linha1: "", linha2: "", linha3: "", linha4: "", 
      linha5: "", linha6: "", linha7: "", corDestaque: "#FFCC00"
    },
    botao: {
      texto: "", link: "", icone: "ic:baseline-whatsapp"
    },
    background: {
      src: "", alt: ""
    }
  }), []);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const apiBase = `/api/${subtype}/form`;

  // --- Hook de Gerenciamento ---
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
    // save removido pois não existe no hook useListManagement
  } = useListManagement<AdsItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem,
    validationFields: ["titulo", "botao"]
  });

  const remainingSlots = Math.max(0, currentPlanLimit - adsList.length);

  // --- Refs ---
  const setNewItemRef = useCallback((node: HTMLDivElement | null) => {
    if (newItemRef && node) {
      (newItemRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [newItemRef]);

  // --- Carregamento de Dados ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBase}/${type}`);

        if (!response.ok) {
          setAdsList([defaultItem]);
          return;
        }

        const data = await response.json();

        if (data && Array.isArray(data.values) && data.values.length > 0) {
          const dbItem = data.values[0];
          
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
            }
          };

          setAdsList([normalizedItem]);
        } else {
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
  }, [apiBase, type, initialLoad, defaultItem, setAdsList, setLoading]);

  // --- Handlers ---
  const toggleSection = (index: number, section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${index}-${section}`]: !prev[`${index}-${section}`]
    }));
  };

  const handleChange = (index: number, path: string, value: any) => {
    const newList = [...adsList];
    
    // Garantir que temos um item
    if (!newList[index]) {
      newList[index] = JSON.parse(JSON.stringify(defaultItem));
    }
    
    // Deep Clone simples para evitar mutação direta
    const item = JSON.parse(JSON.stringify(newList[index]));
    
    const keys = path.split('.');
    let current = item;
    
    // Navegar até a propriedade correta
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) current[key] = {};
      current = current[key];
    }
    
    // Extrair valor do evento se necessário
    const finalValue = value?.target?.value !== undefined ? value.target.value : value;
    
    // Atribuir valor
    current[keys[keys.length - 1]] = finalValue;
    
    newList[index] = item;
    setAdsList(newList);
  };

  // Manipulador simplificado que atualiza diretamente a URL da imagem no objeto
  const handleImageChange = (index: number, url: string) => {
    const newList = [...adsList];
    
    if (!newList[index]) {
      newList[index] = JSON.parse(JSON.stringify(defaultItem));
    }
    
    // Atualiza diretamente o src do background
    newList[index] = {
      ...newList[index],
      background: {
        ...newList[index].background,
        src: url
      }
    };
    
    setAdsList(newList);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      const payload = {
        id: exists?.id,
        values: adsList
      };

      const res = await fetch(`${apiBase}/${type}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");

      // Atualizar lista com dados retornados se necessário
      // (Mantendo o estado local para preservar a UI, mas poderia atualizar com `data.values`)
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("SAVE ERROR:", err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (item: AdsItem): string => {
    return item?.background?.src || "";
  };

  // --- Sub-Componentes de Renderização ---
  const AdsSectionHeader = ({ 
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
        className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors mb-4 border border-zinc-200 dark:border-zinc-700"
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

  const renderAdsItem = (item: AdsItem, index: number, isSearchMode = false) => {
    if (!item) return null;

    const titulo = item.titulo;
    const botao = item.botao;
    const background = item.background;

    const hasTitulo = Object.values(titulo).some(val => val.trim() !== "");
    const hasBotao = botao.texto.trim() !== "" || botao.link.trim() !== "";
    const hasBackground = Boolean(background.src?.trim());
    
    const isLastInOriginalList = index === adsList.length - 1;
    const isLastAndEmpty = isLastInOriginalList && !hasTitulo && !hasBotao && !hasBackground;
    const imageUrl = background.src || "";

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
            <AdsSectionHeader title="Título" section="titulo" index={index} icon={Type} />
            
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
                          value={(titulo as any)[`linha${num}`] || ""}
                          onChange={(e: any) => handleChange(index, `titulo.linha${num}`, e)}
                          className="bg-white dark:bg-zinc-800"
                        />
                      </div>
                    ))}

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Cor de Destaque (Linha 7)
                      </label>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <Input
                            type="text"
                            placeholder="#FFCC00"
                            value={titulo.corDestaque}
                            onChange={(e: any) => handleChange(index, 'titulo.corDestaque', e)}
                            className="font-mono bg-white dark:bg-zinc-800"
                          />
                        </div>
                        <ColorPicker
                          color={titulo.corDestaque}
                          onChange={(color: string) => handleChange(index, 'titulo.corDestaque', color)}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Seção Botão */}
            <AdsSectionHeader title="Botão de Ação" section="botao" index={index} icon={MessageSquare} />
            
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
                        value={botao.texto}
                        onChange={(e: any) => handleChange(index, 'botao.texto', e)}
                        className="bg-white dark:bg-zinc-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Link (URL)
                      </label>
                      <Input
                        type="text"
                        value={botao.link}
                        onChange={(e: any) => handleChange(index, 'botao.link', e)}
                        className="bg-white dark:bg-zinc-800"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <IconSelector
                        value={botao.icone}
                        onChange={(value: string) => handleChange(index, 'botao.icone', value)}
                        label="Ícone do Botão"
                        placeholder="ic:baseline-whatsapp"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Seção Background */}
            <AdsSectionHeader title="Imagem de Fundo" section="background" index={index} icon={ImageIcon} />
            
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
                        currentImage={imageUrl}
                        onChange={(url: string) => handleImageChange(index, url)}
                        label="Imagem de Fundo (Opcional)"
                        description="Formatos suportados: JPG, PNG, WEBP. Tamanho recomendado: 1920x1080px."
                        aspectRatio="aspect-video"
                        previewHeight={200}
                        previewWidth={400}
                        showRemoveButton={false}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Texto Alternativo (Alt Text)
                      </label>
                      <Input
                        type="text"
                        value={background.alt}
                        onChange={(e: any) => handleChange(index, 'background.alt', e)}
                        className="bg-white dark:bg-zinc-800"
                        placeholder="Descrição da imagem para acessibilidade"
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

  // ================= RENDERIZAÇÃO =================
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
              filteredAds.map((item) => {
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
        onSubmit={() => handleSubmit()}
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
                className="absolute -top-4 -right-4 !p-3 !rounded-full bg-red-500 hover:bg-red-600 z-10 shadow-lg text-white border-none"
              >
                <X className="w-5 h-5" />
              </Button>
              
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={expandedImage}
                alt="Preview expandido"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                onError={(e) => {
                  console.error('Erro ao carregar imagem expandida:', expandedImage);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ManageLayout>
  );
}