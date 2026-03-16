/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useCallback, useId, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useListManagement } from "@/hooks/useListManagement";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import { 
  Image as ImageIcon, 
  X, 
  GripVertical, 
  ArrowUpDown, 
  AlertCircle, 
  CheckCircle2, 
  Trash2,
  XCircle,
  Search,
  Target,
  List,
  Type,
  DownloadCloud,
  ChevronDown,
  Check
} from "lucide-react";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { ImageUpload } from "@/components/ImageUpload";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LogoItem {
  id?: string;
  name: string;
  description: string;
  image?: string;
  category?: string;
}

interface SuggestionData {
  categories: string[];
  companies: LogoItem[];
}

interface ResourceSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholderInput?: string;
  placeholderSelect?: string;
  description?: string;
  className?: string;
}

function ResourceSelector({
  label,
  value,
  onChange,
  options,
  placeholderInput = "Digite um novo valor...",
  placeholderSelect = "Selecione uma opção...",
  description,
  className = ""
}: ResourceSelectorProps) {
  const isKnownOption = options.includes(value);
  const [mode, setMode] = useState<'select' | 'create'>(value && !isKnownOption ? 'create' : 'select');
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[var(--color-secondary)]">
          {label}
        </label>
        <div className="flex bg-[var(--color-background-body)] rounded-md p-1 border border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => { setMode('select'); onChange(''); }}
            className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
              mode === 'select' 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'text-[var(--color-secondary)] hover:bg-[var(--color-border)]'
            }`}
          >
            <List className="w-3 h-3" />
            Selecionar
          </button>
          <button
            type="button"
            onClick={() => { setMode('create'); onChange(''); }}
            className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
              mode === 'create' 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'text-[var(--color-secondary)] hover:bg-[var(--color-border)]'
            }`}
          >
            <Type className="w-3 h-3" />
            Criar
          </button>
        </div>
      </div>

      {mode === 'select' ? (
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onClick={() => setShowDropdown(!showDropdown)}
              placeholder={placeholderSelect}
              className="w-full px-4 py-2 rounded-lg bg-[var(--color-background-body)] border border-[var(--color-border)] text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 pr-10 cursor-pointer"
            />
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-[var(--color-secondary)]/50" />
            </div>
          </div>
          
          {/* Dropdown de categorias */}
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2">
                {options.map((option, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md mb-1 flex items-center justify-between hover:bg-[var(--color-primary)]/10 ${
                      value === option
                        ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
                        : "text-[var(--color-secondary)]"
                    }`}
                  >
                    <span>{option}</span>
                    {value === option && (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Input
          type="text"
          placeholder={placeholderInput}
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
        />
      )}
      
      {description && (
        <p className="text-xs text-[var(--color-secondary)]/70">
          {description}
        </p>
      )}
    </div>
  );
}

interface LogoSelectorProps {
  value: string;
  onChange: (imageUrl: string, companyName?: string) => void;
  suggestions: LogoItem[];
  className?: string;
}

function LogoSelector({
  value,
  onChange,
  suggestions,
  className = ""
}: LogoSelectorProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogos = suggestions.filter(logo =>
    logo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (logo.category && logo.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={className}>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setShowSelector(true)}
        className="w-full justify-start"
      >
        <ImageIcon className="w-4 h-4 mr-2" />
        {value ? "Alterar logo" : "Selecionar logo da biblioteca"}
      </Button>

      {showSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[var(--color-background)] rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6">
              {/* Cabeçalho */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--color-secondary)]">
                    Biblioteca de Logos
                  </h3>
                  <p className="text-sm text-[var(--color-secondary)]/70 mt-1">
                    Selecione um logo existente para reutilizar
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSelector(false)}
                  className="text-[var(--color-secondary)]/70 hover:text-[var(--color-secondary)]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Busca */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]/70" />
                  <input
                    type="text"
                    placeholder="Buscar logos por nome ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--color-background-body)] border border-[var(--color-border)] text-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
                  />
                </div>
              </div>

              {/* Grid de logos */}
              {filteredLogos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-y-auto max-h-[400px] p-2">
                  {filteredLogos.map((logo, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        onChange(logo.image || '', logo.name);
                        setShowSelector(false);
                      }}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                        value === logo.image
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                          : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5'
                      }`}
                    >
                      {logo.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={logo.image}
                          alt={logo.name}
                          className="w-16 h-16 object-contain mb-2"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.querySelector('.logo-fallback')?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <div className="logo-fallback">
                          <ImageIcon className="w-16 h-16 text-[var(--color-secondary)]/50 mb-2" />
                        </div>
                      )}
                      <div className="logo-fallback hidden">
                        <ImageIcon className="w-16 h-16 text-[var(--color-secondary)]/50 mb-2" />
                      </div>
                      <span className="text-xs font-medium text-[var(--color-secondary)] text-center truncate w-full">
                        {logo.name}
                      </span>
                      {logo.category && (
                        <span className="text-xs text-[var(--color-secondary)]/70 mt-1 px-2 py-1 bg-[var(--color-background-body)] rounded-full">
                          {logo.category}
                        </span>
                      )}
                      {value === logo.image && (
                        <div className="mt-2 p-1 bg-[var(--color-primary)] rounded-full">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-[var(--color-secondary)]/30 mx-auto mb-4" />
                  <p className="text-[var(--color-secondary)]/70">
                    {searchTerm 
                      ? `Nenhum logo encontrado para "${searchTerm}"`
                      : "Nenhum logo disponível na biblioteca"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortableLogoItem({
  logo,
  index,
  originalIndex,
  isLastInOriginalList,
  isLastAndEmpty,
  showValidation,
  logoList,
  suggestions,
  handleChange,
  handleImportCompany,
  openDeleteSingleModal,
  setNewItemRef,
}: {
  logo: LogoItem;
  index: number;
  originalIndex: number;
  isLastInOriginalList: boolean;
  isLastAndEmpty: boolean;
  showValidation: boolean;
  logoList: LogoItem[];
  suggestions: SuggestionData;
  handleChange: (index: number, field: keyof LogoItem, value: any) => void;
  handleImportCompany: (index: number, companyData: LogoItem) => void;
  openDeleteSingleModal: (index: number, name: string) => void;
  setNewItemRef?: (node: HTMLDivElement | null) => void;
}) {
  const stableId = useId();
  const sortableId = logo.id || `logo-${index}-${stableId}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasName = logo.name.trim() !== "";
  const hasDescription = logo.description.trim() !== "";
  const hasImage = logo.image?.trim() !== "";

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      if (isLastAndEmpty && setNewItemRef) {
        setNewItemRef(node);
      }
    },
    [setNodeRef, isLastAndEmpty, setNewItemRef]
  );

  return (
    <div
      ref={setRefs}
      style={style}
      className={`relative ${isDragging ? 'z-50' : ''}`}
    >
      <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
        isLastInOriginalList && showValidation && !hasName ? 'ring-2 ring-[var(--color-danger)]' : ''
      } ${isDragging ? 'shadow-lg scale-105' : ''} bg-[var(--color-background)] border-l-4 border-[var(--color-primary)]`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="cursor-grab active:cursor-grabbing text-[var(--color-secondary)]/70 hover:text-[var(--color-primary)] transition-colors p-2 rounded-lg hover:bg-[var(--color-background)]/50"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-sm text-[var(--color-secondary)]/70">
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Posição: {index + 1}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {hasName ? (
                    <h4 className="font-medium text-[var(--color-secondary)]">
                      {logo.name}
                    </h4>
                  ) : (
                    <h4 className="font-medium text-[var(--color-secondary)]/50">
                      Novo Logo
                    </h4>
                  )}
                  {hasName && hasDescription && hasImage ? (
                    <span className="px-2 py-1 text-xs bg-[var(--color-success)]/20 text-green-300 rounded-full border border-[var(--color-success)]/30">
                      Completo
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                      Incompleto
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              type="button"
              onClick={() => openDeleteSingleModal(originalIndex, logo.name)}
              variant="danger"
              className="whitespace-nowrap bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90 border-none flex items-center gap-2"
              disabled={logoList.length <= 1}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          {!hasName && !hasImage && suggestions.companies.length > 0 && (
             <div className="mb-6 p-4 bg-[var(--color-primary)]/10 rounded-lg border border-[var(--color-primary)]/20">
               <div className="flex flex-col sm:flex-row items-center gap-4">
                 <div className="flex items-center gap-2 text-[var(--color-primary)]">
                    <DownloadCloud className="w-5 h-5" />
                    <span className="font-medium text-sm">Agilizar preenchimento:</span>
                 </div>
                 <select 
                   className="flex-1 px-3 py-2 rounded bg-[var(--color-background)] border border-[var(--color-border)] text-sm text-[var(--color-secondary)] w-full"
                   onChange={(e) => {
                     if(!e.target.value) return;
                     const company = suggestions.companies.find(c => c.name === e.target.value);
                     if(company) handleImportCompany(originalIndex, company);
                   }}
                   value=""
                 >
                   <option value="">Selecione uma empresa existente...</option>
                   {suggestions.companies.map((c, i) => (
                     <option key={i} value={c.name}>{c.name}</option>
                   ))}
                 </select>
               </div>
             </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-secondary)] mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Imagem do Logo
                </label>
                <ImageUpload
                  label="Imagem do Logo"
                  description="Formatos suportados: PNG (transparente), SVG, JPG."
                  currentImage={logo.image || ""}
                  onChange={(url) => handleChange(originalIndex, "image", url)}
                  aspectRatio="aspect-square"
                  previewWidth={200}
                  previewHeight={200}
                />
                
                <div className="mt-4">
                  <LogoSelector
                    value={logo.image || ""}
                    onChange={(imageUrl, companyName) => {
                      handleChange(originalIndex, "image", imageUrl);
                      if (companyName && !logo.name) {
                        handleChange(originalIndex, "name", companyName);
                      }
                    }}
                    suggestions={suggestions.companies}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                  Nome da Empresa/Marca
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Google, Apple, Microsoft"
                  value={logo.name}
                  onChange={(e: any) => handleChange(originalIndex, "name", e.target.value)}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>

              <ResourceSelector 
                label="Categoria"
                value={logo.category || ""}
                onChange={(val) => handleChange(originalIndex, "category", val)}
                options={suggestions.categories}
                description="Use para organizar os logos em grupos (opcional)"
                placeholderInput="Nova categoria (ex: Parceiros Tech)..."
                placeholderSelect="Selecione uma categoria existente..."
              />

              <div className="space-y-2">
                <TextArea
                  label="Descrição"
                  placeholder="Descrição sobre a empresa, parceria ou contexto do logo"
                  value={logo.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    handleChange(originalIndex, "description", e.target.value)
                  }
                  rows={3}
                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function LogosPage({ 
  type = "logos-ecommerce", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  const defaultLogo = useMemo(() => ({ 
    name: "", 
    description: "",
    category: "",
    image: "" 
  }), []);

  const [localLogos, setLocalLogos] = useState<LogoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionData>({ categories: [], companies: [] });

  const apiBase = `/api/${subtype}/form`;

  const {
    list: logoList,
    setList: setLogoList,
    exists,
    loading,
    setLoading,
    success,
    setSuccess,
    errorMsg,
    setErrorMsg,
    showValidation, // Adicionado aqui
    deleteModal,
    currentPlanLimit,
    currentPlanType,
    openDeleteSingleModal,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
  } = useListManagement<LogoItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem: defaultLogo,
    validationFields: ["name", "description", "image"]
  });

  // Carregar sugestões
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`${apiBase}/${type}?suggestions=true`);
        if (response.ok) {
          const data = await response.json();
          if (data.suggestions) {
            setSuggestions(data.suggestions);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar sugestões:", error);
      }
    };

    if (type.startsWith('logos')) {
      fetchSuggestions();
    }
  }, [apiBase, type]);

  useEffect(() => {
    setLocalLogos(logoList);
  }, [logoList]);

  const newLogoRef = useRef<HTMLDivElement>(null);

  const setNewItemRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      newLogoRef.current = node;
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = localLogos.findIndex((item) => 
        item.id === active.id || item.id?.includes(active.id as string)
      );
      const newIndex = localLogos.findIndex((item) => 
        item.id === over.id || item.id?.includes(over.id as string)
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const newList = arrayMove(localLogos, oldIndex, newIndex);
        setLocalLogos(newList);
        setLogoList(newList);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const filteredList = localLogos.filter(
        logo => logo.name.trim() && logo.description.trim() && logo.image?.trim()
      );

      if (!filteredList.length) {
        setErrorMsg("Adicione ao menos um logo completo com nome, descrição e imagem.");
        return;
      }

      const fd = new FormData();

      if (exists) fd.append("id", exists.id);

      fd.append(
        "values",
        JSON.stringify(filteredList)
      );

      const method = exists ? "PUT" : "POST";

      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar logos");
      }

      const saved = await res.json();

      const normalized = saved.values.map((v: any, i: number) => ({
        ...v,
        id: v.id || `logo-${Date.now()}-${i}`,
      }));

      setLocalLogos(normalized);
      setLogoList(normalized);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Atualizar sugestões após salvar
      const suggestionsResponse = await fetch(`${apiBase}/${type}?suggestions=true`);
      if (suggestionsResponse.ok) {
        const suggestionsData = await suggestionsResponse.json();
        if (suggestionsData.suggestions) {
          setSuggestions(suggestionsData.suggestions);
        }
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof LogoItem, value: any) => {
    const newList = [...localLogos];
    newList[index] = { ...newList[index], [field]: value };
    setLocalLogos(newList);
    setLogoList(newList);
  };

  const handleImportCompany = (index: number, companyData: LogoItem) => {
    const newList = [...localLogos];
    newList[index] = { 
      ...newList[index], 
      name: companyData.name,
      image: companyData.image,
      description: companyData.description || newList[index].description,
      category: companyData.category || newList[index].category
    };
    setLocalLogos(newList);
    setLogoList(newList);
  };

  const updateLogos = async (list: LogoItem[]) => {
    if (!exists) return;

    const filteredList = list.filter(
      logo => logo.name.trim() || logo.description.trim() || logo.category?.trim() || logo.image
    );

    const fd = new FormData();
    fd.append("id", exists.id);
    
    filteredList.forEach((logo, i) => {
      fd.append(`values[${i}][name]`, logo.name);
      fd.append(`values[${i}][description]`, logo.description);
      fd.append(`values[${i}][category]`, logo.category || "");
      fd.append(`values[${i}][image]`, logo.image || "");
      
      if (logo.id) {
        fd.append(`values[${i}][id]`, logo.id);
      }
    });

    const res = await fetch(`${apiBase}/${type}`, {
      method: "PUT",
      body: fd,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Falha ao atualizar dados");
    }

    const updated = await res.json();
    return updated;
  };

  const handleAddLogo = () => {
    if (localLogos.length >= currentPlanLimit) return false;
    
    const newItem: LogoItem = {
      name: '',
      description: '',
      category: '',
      image: ''
    };
    
    const updated = [...localLogos, newItem];
    setLocalLogos(updated);
    setLogoList(updated);
    
    setTimeout(() => {
      newLogoRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const filteredLogos = useMemo(() => {
    let filtered = [...localLogos];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(logo => 
        logo.name.toLowerCase().includes(term) ||
        logo.description.toLowerCase().includes(term) ||
        (logo.category && logo.category.toLowerCase().includes(term))
      );
    }
    return filtered;
  }, [localLogos, searchTerm]);

  const isLogosLimitReached = localLogos.length >= currentPlanLimit;
  const canAddNewLogo = !isLogosLimitReached;
  const logosCompleteCount = localLogos.filter(logo => 
    logo.name.trim() !== '' && 
    logo.description.trim() !== '' && 
    logo.image?.trim() !== ''
  ).length;
  const logosTotalCount = localLogos.length;

  const logosValidationError = isLogosLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;
    total += localLogos.length * 4;
    localLogos.forEach(logo => {
      if (logo.name.trim()) completed++;
      if (logo.description.trim()) completed++;
      if (logo.category?.trim()) completed++;
      if (logo.image?.trim()) completed++;
    });
    return { completed, total };
  };

  const completion = calculateCompletion();
  const stableIds = useMemo(
    () => localLogos.map((item, index) => item.id ?? `logo-${index}`),
    [localLogos]
  );

  return (
    <ManageLayout
      headerIcon={ImageIcon}
      title="Logos"
      description="Gerencie os logos de parceiros, clientes e marcas associadas"
      exists={!!exists}
      itemName="Logos"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        <Card className="p-6 bg-[var(--color-background)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                Gerenciamento de Logos
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span className="text-sm text-[var(--color-secondary)]/70">
                    {logosCompleteCount} de {logosTotalCount} completos
                  </span>
                </div>
                <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                <span className="text-sm text-[var(--color-secondary)]/70">
                  Limite: {currentPlanType === 'pro' ? '10' : '5'} itens
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--color-secondary)]">
              Buscar Logos
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-secondary)]/70" />
              <Input
                type="text"
                placeholder="Buscar logos por nome, descrição ou categoria..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)] pl-10"
              />
            </div>
          </div>
        </Card>

        {logosValidationError && (
          <div className={`p-3 rounded-lg ${isLogosLimitReached 
            ? 'bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30' 
            : 'bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30'}`}>
            <div className="flex items-start gap-2">
              {isLogosLimitReached ? (
                <XCircle className="w-5 h-5 text-[var(--color-danger)] flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${isLogosLimitReached 
                ? 'text-[var(--color-danger)]' 
                : 'text-[var(--color-warning)]'}`}>
                {logosValidationError}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <AnimatePresence>
            {filteredLogos.length === 0 ? (
              <Card className="p-8 bg-[var(--color-background)]">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-[var(--color-secondary)]/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                    Nenhum logo encontrado
                  </h3>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    {searchTerm ? 'Tente ajustar sua busca ou limpe o filtro' : 'Adicione seu primeiro logo usando o botão abaixo'}
                  </p>
                </div>
              </Card>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={stableIds}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredLogos.map((logo, index) => {
                    const originalIndex = localLogos.findIndex(l => l.id === logo.id) || index;
                    const hasName = logo.name.trim() !== "";
                    const hasDescription = logo.description.trim() !== "";
                    const hasImage = logo.image?.trim() !== "";
                    const isLastInOriginalList = originalIndex === localLogos.length - 1;
                    const isLastAndEmpty = isLastInOriginalList && !hasName && !hasDescription && !hasImage;

                    return (
                      <SortableLogoItem
                        key={stableIds[index]}
                        logo={logo}
                        index={index}
                        originalIndex={originalIndex}
                        isLastInOriginalList={isLastInOriginalList}
                        isLastAndEmpty={isLastAndEmpty}
                        showValidation={showValidation}
                        logoList={localLogos}
                        suggestions={suggestions}
                        handleChange={handleChange}
                        handleImportCompany={handleImportCompany}
                        openDeleteSingleModal={openDeleteSingleModal}
                        setNewItemRef={isLastAndEmpty ? setNewItemRef : undefined}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            )}
          </AnimatePresence>
        </div>

        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          onAddNew={handleAddLogo}
          isAddDisabled={!canAddNewLogo}
          isSaving={loading}
          exists={!!exists}
          totalCount={completion.total}
          itemName="Logo"
          icon={ImageIcon}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateLogos)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={localLogos.length}
        itemName="Logo"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}