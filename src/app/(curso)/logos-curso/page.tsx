/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { Button } from "@/components/Button";
import { 
  BookOpen,
  Layers,
  Settings,
  CheckCircle2,
  Plus,
  Trash2,
  GripVertical,
  ArrowUpDown,
  Eye,
  EyeOff
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { ImageUpload } from "@/components/ImageUpload";

interface CursoItem {
  id: string;
  image: string;
  name: string;
  url: string;
  website: string;
}

interface CursosData {
  id: string;
  type: string;
  subtype: string;
  values: CursoItem[];
}

const defaultCursosData: CursosData = {
  id: "cursos-parceiros",
  type: "",
  subtype: "",
  values: [
    {
      id: "",
      image: "",
      name: "",
      url: "",
      website: ""
    }
  ]
};

const mergeWithDefaults = (apiData: any, defaultData: CursosData): CursosData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id || defaultData.id,
    type: apiData.type || defaultData.type,
    subtype: apiData.subtype || defaultData.subtype,
    values: apiData.values || defaultData.values
  };
};

// Função para gerar slug a partir do nome
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50);
};

// Função para gerar ID único
const generateUniqueId = (name: string, index: number): string => {
  if (name.trim()) {
    const slug = generateSlug(name);
    return `${slug}-${Date.now()}-${index}`;
  }
  return `curso-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`;
};

export default function CursosPage() {
  const {
    data: pageData,
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
  } = useJsonManagement<CursosData>({
    apiPath: "/api/tegbe-institucional/json/cursos",
    defaultData: defaultCursosData,
    mergeFunction: mergeWithDefaults,
  });

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    cursos: false,
  });

  const [showHiddenIds, setShowHiddenIds] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para gerenciar cursos
  const handleAddCurso = () => {
    const newId = generateUniqueId("", pageData.values.length);
    const newCurso: CursoItem = {
      id: newId,
      image: "",
      name: "",
      url: "",
      website: ""
    };
    const updatedCursos = [...pageData.values, newCurso];
    updateNested('values', updatedCursos);
  };

  const handleUpdateCurso = (index: number, updates: Partial<CursoItem>) => {
    const updatedCursos = [...pageData.values];
    
    // Se estiver atualizando o nome, gera automaticamente o ID se estiver vazio
    if (updates.name && !updatedCursos[index].id) {
      updates.id = generateUniqueId(updates.name, index);
    }
    
    updatedCursos[index] = { ...updatedCursos[index], ...updates };
    updateNested('values', updatedCursos);
  };

  const handleRemoveCurso = (index: number) => {
    const updatedCursos = pageData.values.filter((_, i) => i !== index);
    updateNested('values', updatedCursos);
  };

  // Função para mover curso para cima
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updatedCursos = [...pageData.values];
    const [item] = updatedCursos.splice(index, 1);
    updatedCursos.splice(index - 1, 0, item);
    updateNested('values', updatedCursos);
  };

  // Função para mover curso para baixo
  const handleMoveDown = (index: number) => {
    if (index === pageData.values.length - 1) return;
    const updatedCursos = [...pageData.values];
    const [item] = updatedCursos.splice(index, 1);
    updatedCursos.splice(index + 1, 0, item);
    updateNested('values', updatedCursos);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Garantir que todos os cursos tenham IDs
    const updatedCursos = pageData.values.map((curso, index) => {
      if (!curso.id || curso.id.trim() === "") {
        return {
          ...curso,
          id: generateUniqueId(curso.name || "", index)
        };
      }
      return curso;
    });
    
    updateNested('values', updatedCursos);
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Função auxiliar para obter File do fileStates
  const getFileFromState = (key: string): File | null => {
    const value = fileStates[key];
    return value instanceof File ? value : null;
  };

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Informações básicas
    total += 2; // type e subtype
    if (pageData.type.trim()) completed++;
    if (pageData.subtype.trim()) completed++;

    // Cursos
    total += pageData.values.length * 3; // image, name são obrigatórios, id é automático
    pageData.values.forEach(curso => {
      if (curso.image.trim()) completed++;
      if (curso.name.trim()) completed++;
      if (curso.id.trim()) completed++; // ID é gerado automaticamente, mas conta como completo se existir
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layers} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={BookOpen}
      title="Cursos & Plataformas"
      description="Gerenciamento de cursos e plataformas parceiras"
      exists={!!exists}
      itemName="Cursos"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Básica */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações da Seção"
            section="basic"
            icon={Settings}
            isExpanded={expandedSections.basic}
            onToggle={() => toggleSection("basic")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.basic ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="ID da Seção"
                    value={pageData.id}
                    onChange={(e) => updateNested('id', e.target.value)}
                    placeholder="Ex: cursos-parceiros"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Tipo de Conteúdo"
                    value={pageData.type}
                    onChange={(e) => updateNested('type', e.target.value)}
                    placeholder="Ex: cursos"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Subcategoria"
                    value={pageData.subtype}
                    onChange={(e) => updateNested('subtype', e.target.value)}
                    placeholder="Ex: plataformas-ensino"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Cursos */}
        <div className="space-y-4">
          <SectionHeader
            title="Cursos & Plataformas"
            section="cursos"
            icon={BookOpen}
            isExpanded={expandedSections.cursos}
            onToggle={() => toggleSection("cursos")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.cursos ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Lista de Cursos e Plataformas
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {pageData.values.filter(c => c.image && c.name).length} de {pageData.values.length} completos
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddCurso}
                    variant="primary"
                    className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Curso
                  </Button>
                </div>
                <p className="text-sm text-[var(--color-secondary)]/70 mt-2">
                  Gerencie os cursos e plataformas de ensino parceiras. IDs são gerados automaticamente.
                </p>
              </div>

              <div className="space-y-6">
                {pageData.values.map((curso, index) => (
                  <div 
                    key={curso.id || index}
                    className="p-6 border border-[var(--color-border)] rounded-lg space-y-6 hover:border-[var(--color-primary)]/50 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Controles de ordenação e indicador de posição */}
                        <div className="flex flex-col items-center">
                          <button
                            type="button"
                            className="cursor-grab active:cursor-grabbing p-2 hover:bg-[var(--color-background)]/50 rounded transition-colors"
                          >
                            <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                          </button>
                          
                          <div className="flex flex-col items-center mt-2">
                            <div className="p-1 px-2 rounded bg-[var(--color-primary)]/10">
                              <span className="text-xs font-medium text-[var(--color-primary)]">
                                {index + 1}
                              </span>
                            </div>
                            
                            <div className="flex flex-col gap-1 mt-1">
                              <button
                                type="button"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className={`p-0.5 rounded ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--color-border)]'}`}
                              >
                                <ArrowUpDown className="w-3 h-3 rotate-90" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === pageData.values.length - 1}
                                className={`p-0.5 rounded ${index === pageData.values.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[var(--color-border)]'}`}
                              >
                                <ArrowUpDown className="w-3 h-3 -rotate-90" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-medium text-[var(--color-secondary)]">
                                  {curso.name || "Novo Curso"}
                                </h4>
                                {curso.image && curso.name ? (
                                  <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                    Completo
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                    Incompleto
                                  </span>
                                )}
                                <span className="px-2 py-1 text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full">
                                  Item {index + 1} de {pageData.values.length}
                                </span>
                              </div>
                              {showHiddenIds && curso.id && (
                                <div className="mt-2">
                                  <span className="text-xs font-mono text-[var(--color-secondary)]/50 bg-[var(--color-background-body)] px-2 py-1 rounded">
                                    ID: {curso.id}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Coluna 1: Imagem */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Logo/Imagem *
                                </label>
                                <ImageUpload
                                  label=""
                                  currentImage={curso.image || ''}
                                  selectedFile={getFileFromState(`values.${index}.image`)}
                                  onFileChange={(file) => setFileState(`values.${index}.image`, file)}
                                  aspectRatio="aspect-square"
                                  previewWidth={200}
                                  previewHeight={200}
                                  description="Logo do curso ou plataforma"
                                />
                                <Input
                                  type="text"
                                  value={curso.image || ""}
                                  onChange={(e) => handleUpdateCurso(index, { image: e.target.value })}
                                  placeholder="https://exemplo.com/logo.png"
                                  className="mt-2 bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                            </div>
                            
                            {/* Coluna 2: Informações básicas */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Nome do Curso/Plataforma *
                                </label>
                                <Input
                                  value={curso.name}
                                  onChange={(e) => handleUpdateCurso(index, { name: e.target.value })}
                                  placeholder="Ex: React JS, Node.js, TypeScript"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  required
                                />
                                <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                                  O ID será gerado automaticamente a partir do nome
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  URL do Curso (opcional)
                                </label>
                                <Input
                                  type="url"
                                  value={curso.url}
                                  onChange={(e) => handleUpdateCurso(index, { url: e.target.value })}
                                  placeholder="https://exemplo.com/curso"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                                <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                                  Link para a página do curso ou plataforma
                                </p>
                              </div>
                            </div>
                            
                            {/* Coluna 3: Website e ações */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Website (opcional)
                                </label>
                                <Input
                                  type="url"
                                  value={curso.website}
                                  onChange={(e) => handleUpdateCurso(index, { website: e.target.value })}
                                  placeholder="https://exemplo.com"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                                <p className="text-xs text-[var(--color-secondary)]/70 mt-1">
                                  Site principal da plataforma
                                </p>
                              </div>
                              
                              <div className="pt-4">
                                <Button
                                  type="button"
                                  onClick={() => handleRemoveCurso(index)}
                                  variant="danger"
                                  className="w-full bg-red-600 hover:bg-red-700 border-none flex items-center justify-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remover Curso
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pageData.values.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-background-body)] mb-4">
                    <BookOpen className="w-8 h-8 text-[var(--color-secondary)]/50" />
                  </div>
                  <h4 className="text-lg font-medium text-[var(--color-secondary)] mb-2">
                    Nenhum curso definido
                  </h4>
                  <p className="text-sm text-[var(--color-secondary)]/70 mb-6">
                    Comece adicionando cursos ou plataformas parceiras
                  </p>
                  <Button
                    type="button"
                    onClick={handleAddCurso}
                    variant="primary"
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Curso
                  </Button>
                </div>
              )}
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
          itemName="Cursos"
          icon={BookOpen}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Cursos"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}