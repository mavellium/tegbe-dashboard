/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { 
  Layout, 
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BookOpen,
  Trash2,
  Plus,
  Badge,
  Link,
  Image as ImageIcon,
  Eye,
  EyeOff
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";
import { ImageUpload } from "@/components/ImageUpload";

interface CursoItem {
  id: number;
  src: string;
  alt: string;
  width: number;
  height: number;
  url: string;
}

interface CursosData {
  variant: string;
  data: CursoItem[];
  showBadge: boolean;
  badgeText: string;
  badgeIcon: string;
}

const defaultCursosData: CursosData = {
  variant: "cursos",
  data: [
    {
      id: 1,
      src: "",
      alt: "",
      width: 120,
      height: 80,
      url: ""
    }
  ],
  showBadge: true,
  badgeText: "Plataformas Parceiras",
  badgeIcon: "ph:graduation-cap-fill"
};

const mergeWithDefaults = (apiData: any, defaultData: CursosData): CursosData => {
  if (!apiData) return defaultData;
  
  return {
    variant: apiData.variant || defaultData.variant,
    data: apiData.data || defaultData.data,
    showBadge: apiData.showBadge !== undefined ? apiData.showBadge : defaultData.showBadge,
    badgeText: apiData.badgeText || defaultData.badgeText,
    badgeIcon: apiData.badgeIcon || defaultData.badgeIcon,
  };
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
    apiPath: "/api/tegbe-institucional/json/logos-curso",
    defaultData: defaultCursosData,
    mergeFunction: mergeWithDefaults,
  });

  const [draggingItem, setDraggingItem] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    badge: true,
    cursos: false,
  });

  const newCursoRef = useRef<HTMLDivElement>(null);
  const currentPlanType = 'pro';
  const currentPlanLimit = currentPlanType === 'pro' ? 20 : 10;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddCurso = () => {
    if (pageData.data.length >= currentPlanLimit) {
      return false;
    }
    
    const cursos = pageData.data;
    const maxId = cursos.length > 0 
      ? Math.max(...cursos.map(item => item.id))
      : 0;
    
    const newItem: CursoItem = {
      id: maxId + 1,
      src: "",
      alt: "",
      width: 120,
      height: 80,
      url: ""
    };
    
    const updated = [...cursos, newItem];
    updateNested('data', updated);
    
    setTimeout(() => {
      newCursoRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updateCurso = (index: number, updates: Partial<CursoItem>) => {
    const updated = [...pageData.data];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      updateNested('data', updated);
    }
  };

  const removeCurso = (index: number) => {
    const cursos = pageData.data;
    
    if (cursos.length <= 1) {
      const emptyItem: CursoItem = {
        id: 1,
        src: "",
        alt: "",
        width: 120,
        height: 80,
        url: ""
      };
      updateNested('data', [emptyItem]);
    } else {
      const updated = cursos.filter((_, i) => i !== index);
      
      // Reajusta IDs após remoção mantendo ordem
      const renumberedItems = updated.map((item, idx) => ({
        ...item,
        id: idx + 1
      }));
      
      updateNested('data', renumberedItems);
    }
  };

  const handleCursoDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingItem(index);
  };

  const handleCursoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingItem === null || draggingItem === index) return;
    
    const cursos = pageData.data;
    const updated = [...cursos];
    const draggedItem = updated[draggingItem];
    
    updated.splice(draggingItem, 1);
    const newIndex = index > draggingItem ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    // Reajusta IDs após reordenação
    const reorderedItems = updated.map((item, idx) => ({
      ...item,
      id: idx + 1
    }));
    
    updateNested('data', reorderedItems);
    setDraggingItem(index);
  };

  const handleCursoDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingItem(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const getFileFromState = (key: string): File | null => {
    const value = fileStates[key];
    return value instanceof File ? value : null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  const isCursoValid = (item: CursoItem): boolean => {
    return item.src.trim() !== '' && 
           item.alt.trim() !== '' && 
           item.url.trim() !== '' &&
           item.width > 0 &&
           item.height > 0;
  };

  const cursos = pageData.data;
  const isCursosLimitReached = cursos.length >= currentPlanLimit;
  const canAddNewCurso = !isCursosLimitReached;
  const cursosCompleteCount = cursos.filter(isCursoValid).length;
  const cursosTotalCount = cursos.length;

  const cursosValidationError = isCursosLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Badge config (3 campos)
    total += 3;
    if (pageData.badgeText.trim()) completed++;
    if (pageData.badgeIcon.trim()) completed++;
    completed++; // showBadge é boolean, sempre tem valor

    // Cursos
    total += cursos.length * 6;
    cursos.forEach(curso => {
      if (curso.src.trim()) completed++;
      if (curso.alt.trim()) completed++;
      if (curso.url.trim()) completed++;
      if (curso.width > 0) completed++;
      if (curso.height > 0) completed++;
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={BookOpen}
      title="Gerenciar Cursos & Plataformas"
      description="Configure as plataformas de cursos parceiras"
      exists={!!exists}
      itemName="Cursos"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Badge */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações do Badge"
            section="badge"
            icon={Badge}
            isExpanded={expandedSections.badge}
            onToggle={() => toggleSection("badge")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.badge ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[var(--color-background-body)] rounded-lg border border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    {pageData.showBadge ? (
                      <Eye className="w-5 h-5 text-green-500" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-500" />
                    )}
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Mostrar Badge
                      </label>
                      <p className="text-sm text-[var(--color-secondary)]/70">
                        Exibir badge de identificação da seção
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateNested('showBadge', !pageData.showBadge)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      pageData.showBadge 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        pageData.showBadge 
                          ? 'translate-x-6' 
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Texto do Badge
                    </label>
                    <Input
                      value={pageData.badgeText}
                      onChange={(e) => updateNested('badgeText', e.target.value)}
                      placeholder="Ex: Plataformas Parceiras"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                      Ícone do Badge
                    </label>
                    <Input
                      value={pageData.badgeIcon}
                      onChange={(e) => updateNested('badgeIcon', e.target.value)}
                      placeholder="Ex: ph:graduation-cap-fill"
                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                    />
                    <p className="text-xs text-[var(--color-secondary)]/50">
                      Use ícones do Phosphor Icons (ex: ph:graduation-cap-fill)
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Cursos */}
        <div className="space-y-4">
          <SectionHeader
            title="Plataformas de Cursos"
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                      Configure as plataformas parceiras
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {cursosCompleteCount} de {cursosTotalCount} completos
                        </span>
                      </div>
                      <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        Limite: {currentPlanType === 'pro' ? '20' : '10'} itens
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={handleAddCurso}
                      variant="primary"
                      className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                      disabled={!canAddNewCurso}
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Plataforma
                    </Button>
                    {isCursosLimitReached && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Limite do plano atingido
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-[var(--color-secondary)]/70">
                  Cada plataforma será exibida como um logo clicável. <strong>IDs são gerados automaticamente.</strong>
                </p>
              </div>

              {cursosValidationError && (
                <div className={`p-3 rounded-lg ${isCursosLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                  <div className="flex items-start gap-2">
                    {isCursosLimitReached ? (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${isCursosLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                      {cursosValidationError}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {cursos.map((curso, index) => (
                  <div 
                    key={`curso-${curso.id || index}`}
                    ref={index === cursos.length - 1 ? newCursoRef : undefined}
                    draggable
                    onDragStart={(e) => handleCursoDragStart(e, index)}
                    onDragOver={(e) => handleCursoDragOver(e, index)}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleCursoDragEnd}
                    onDrop={handleDrop}
                    className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                      draggingItem === index 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                        : 'hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div 
                          className="cursor-grab active:cursor-grabbing p-2 hover:bg-[var(--color-background)]/50 rounded transition-colors"
                          draggable
                          onDragStart={(e) => handleCursoDragStart(e, index)}
                        >
                          <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <div 
                            className="flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                          >
                            {curso.id}
                          </div>
                          <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-[var(--color-secondary)]">
                              {curso.alt || "Plataforma sem nome"}
                            </h4>
                            {isCursoValid(curso) ? (
                              <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                Completo
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                Incompleto
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                      ID
                                    </label>
                                    <div className="px-3 py-2 bg-[var(--color-background-body)] border border-[var(--color-border)] rounded text-[var(--color-secondary)] text-center font-mono">
                                      {curso.id}
                                    </div>
                                    <p className="text-xs text-[var(--color-secondary)]/50 text-center">
                                      Automático
                                    </p>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                      Texto Alternativo
                                    </label>
                                    <Input
                                      value={curso.alt}
                                      onChange={(e) => updateCurso(index, { alt: e.target.value })}
                                      placeholder="Ex: Alura"
                                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    URL do Logo
                                  </label>
                                  <Input
                                    value={curso.src}
                                    onChange={(e) => updateCurso(index, { src: e.target.value })}
                                    placeholder="https://example.com/logos/alura.svg"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                  <p className="text-xs text-[var(--color-secondary)]/50">
                                    URL da imagem do logo (SVG recomendado)
                                  </p>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                      Largura (px)
                                    </label>
                                    <Input
                                      type="number"
                                      value={curso.width}
                                      onChange={(e) => updateCurso(index, { width: parseInt(e.target.value) || 120 })}
                                      placeholder="120"
                                      min="1"
                                      max="500"
                                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                      Altura (px)
                                    </label>
                                    <Input
                                      type="number"
                                      value={curso.height}
                                      onChange={(e) => updateCurso(index, { height: parseInt(e.target.value) || 80 })}
                                      placeholder="80"
                                      min="1"
                                      max="500"
                                      className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                    <div className="flex items-center gap-2">
                                      <Link className="w-4 h-4" />
                                      Link da Plataforma
                                    </div>
                                  </label>
                                  <Input
                                    value={curso.url}
                                    onChange={(e) => updateCurso(index, { url: e.target.value })}
                                    placeholder="https://alura.com.br/"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="border-t border-[var(--color-border)] pt-6">
                              <div className="flex items-center gap-2 mb-4">
                                <ImageIcon className="w-5 h-5 text-[var(--color-secondary)]" />
                                <h5 className="font-medium text-[var(--color-secondary)]">Upload de Logo</h5>
                              </div>
                              
                              <div className="space-y-2">
                                <ImageUpload
                                  label="Logo da Plataforma"
                                  currentImage={curso.src}
                                  selectedFile={getFileFromState(`data.${index}.src`)}
                                  onFileChange={(file) => setFileState(`data.${index}.src`, file)}
                                  description="Faça upload do logo em formato SVG ou PNG (transparente)"
                                  aspectRatio="aspect-auto"
                                  previewWidth={curso.width}
                                  previewHeight={curso.height}
                                />
                                <div className="text-sm text-[var(--color-secondary)]/70">
                                  <p>Dimensões recomendadas: {curso.width}px × {curso.height}px</p>
                                  <p>Formatos aceitos: SVG, PNG, JPG</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          onClick={() => removeCurso(index)}
                          variant="danger"
                          className="whitespace-nowrap bg-red-600 hover:bg-red-700 border-none flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
        itemName="Configuração de Cursos"
      />

      <FeedbackMessages 
        success={success} 
        errorMsg={errorMsg} 
      />
    </ManageLayout>
  );
}