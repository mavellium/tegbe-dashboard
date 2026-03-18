/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// =========================================================================
// O COMPONENTE MENU BUILDER
// =========================================================================
import { FolderPlus, GripVertical, LayoutTemplate, LinkIcon, Eye, EyeOff, ChevronUp, ChevronDown, Trash2, Plus, X } from "lucide-react";
import AdminIconSelector from "../AdminIconSelector";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function MenuBuilderInline({ 
  value, 
  onChange, 
  availablePages, 
  editingId 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  availablePages: any[]; 
  editingId: string | null; 
}) {
  const [items, setItems] = useState<any[]>([]);
  // Guarda os índices dos grupos que estão recolhidos (collapsed)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<number, boolean>>({});

  const dragItem = useRef<{ idx: number; parentIdx?: number } | null>(null);
  const dragOverItem = useRef<{ idx: number; parentIdx?: number } | null>(null);
  const [draggingPos, setDraggingPos] = useState<{ idx: number; parentIdx?: number } | null>(null);
  const [dragEnabledIdx, setDragEnabledIdx] = useState<{ idx: number; parentIdx?: number } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 150); 
  };

  useEffect(() => {
    try {
      if (value) setItems(JSON.parse(value));
    } catch (e) {
      setItems([]);
    }
  }, [value]);

  const syncParent = (newItems: any[]) => {
    setItems(newItems);
    onChange(JSON.stringify(newItems, null, 2));
  };

  const addGroup = () => {
    syncParent([...items, { type: "group", title: "Novo Grupo", icon: "lucide:folder", isActive: true, children: [] }]);
    scrollToBottom();
  };

  const addLink = (parentIndex?: number) => {
    const newLink = { name: "Link Manual", href: "/", icon: "lucide:file-text", isActive: true };
    if (parentIndex !== undefined) {
      const copy = [...items];
      if (!copy[parentIndex].children) copy[parentIndex].children = [];
      copy[parentIndex].children.push(newLink);
      
      // Se adicionar um filho, garante que o grupo esteja expandido
      setCollapsedGroups(prev => ({ ...prev, [parentIndex]: false }));
      syncParent(copy);
    } else {
      syncParent([...items, { type: "item", ...newLink }]);
    }
    scrollToBottom(); 
  };

  const addPage = (parentIndex: number | undefined, pageId: string) => {
    const page = availablePages.find(p => p.id === pageId);
    if (!page) return;
    const newLink = { name: page.title, href: `/dashboard/${editingId}/custom/${page.id}`, icon: page.icon || "lucide:file-text", isActive: true };
    
    if (parentIndex !== undefined) {
      const copy = [...items];
      if (!copy[parentIndex].children) copy[parentIndex].children = [];
      copy[parentIndex].children.push(newLink);
      
      // Expande grupo se tiver recolhido
      setCollapsedGroups(prev => ({ ...prev, [parentIndex]: false }));
      syncParent(copy);
    } else {
      syncParent([...items, { type: "item", ...newLink }]);
    }
    scrollToBottom();
  };

  const removeItem = (idx: number, parentIdx?: number) => {
    const copy = [...items];
    if (parentIdx !== undefined) {
      copy[parentIdx].children.splice(idx, 1);
    } else {
      copy.splice(idx, 1);
    }
    syncParent(copy);
  };

  const updateItem = (val: any, field: string, idx: number, parentIdx?: number) => {
    const copy = [...items];
    if (parentIdx !== undefined) {
      copy[parentIdx].children[idx][field] = val;
    } else {
      copy[idx][field] = val;
    }
    syncParent(copy);
  };

  const toggleActive = (idx: number, parentIdx?: number) => {
    const copy = [...items];
    if (parentIdx !== undefined) {
      const current = copy[parentIdx].children[idx].isActive;
      copy[parentIdx].children[idx].isActive = current === undefined ? false : !current;
    } else {
      const current = copy[idx].isActive;
      copy[idx].isActive = current === undefined ? false : !current;
    }
    syncParent(copy);
  };

  const toggleCollapse = (idx: number) => {
    setCollapsedGroups(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleDragStart = (e: React.DragEvent, idx: number, parentIdx?: number) => {
    dragItem.current = { idx, parentIdx };
    setDraggingPos({ idx, parentIdx });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e: React.DragEvent, idx: number, parentIdx?: number) => {
    e.preventDefault();
    dragOverItem.current = { idx, parentIdx };
  };

  const handleDragEnd = () => {
    if (dragItem.current && dragOverItem.current) {
      const { idx: dragIdx, parentIdx: dragParent } = dragItem.current;
      const { idx: overIdx, parentIdx: overParent } = dragOverItem.current;

      if (dragParent === overParent && dragIdx !== overIdx) {
        const copy = [...items];
        if (dragParent !== undefined) {
          const children = [...copy[dragParent].children];
          const [dragged] = children.splice(dragIdx, 1);
          children.splice(overIdx, 0, dragged);
          copy[dragParent].children = children;
        } else {
          const [dragged] = copy.splice(dragIdx, 1);
          copy.splice(overIdx, 0, dragged);
        }
        syncParent(copy);
      }
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingPos(null);
    setDragEnabledIdx(null);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="space-y-4 bg-black/30 p-4 rounded-xl border border-zinc-800">
      <div className="flex flex-wrap gap-2 pb-4 border-b border-zinc-800">
        <button type="button" onClick={addGroup} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded-lg transition-colors">
          <FolderPlus size={14} /> Novo Grupo (Pasta)
        </button>
        <button type="button" onClick={() => addLink()} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded-lg transition-colors">
          <LinkIcon size={14} /> Novo Link Manual
        </button>

        {editingId && availablePages.length > 0 ? (
          <div className="relative group">
            <select 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => { addPage(undefined, e.target.value); e.target.value = ""; }}
              defaultValue=""
            >
              <option value="" disabled>Selecionar Página</option>
              {availablePages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/30 text-xs font-bold rounded-lg transition-colors">
              <LayoutTemplate size={14} /> Vincular Página Criada
            </button>
          </div>
        ) : editingId ? (
          <span className="flex items-center text-[10px] text-zinc-500 px-2">Nenhuma página criada nesta filial.</span>
        ) : (
          <span className="flex items-center text-[10px] text-zinc-500 px-2">Salve a filial para vincular páginas.</span>
        )}
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4">Nenhum item no menu. Comece adicionando um acima.</p>
        ) : (
          items.map((item, idx) => {
            const isDragging = draggingPos?.idx === idx && draggingPos?.parentIdx === undefined;
            const isDraggable = dragEnabledIdx?.idx === idx && dragEnabledIdx?.parentIdx === undefined;
            
            const isActive = item.isActive !== false; 
            const isCollapsed = collapsedGroups[idx];
            
            return (
              <div 
                key={idx} 
                draggable={isDraggable}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragEnter={(e) => handleDragEnter(e, idx)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                className={`bg-zinc-900 border ${isDragging ? 'border-indigo-500/50 opacity-50 shadow-lg shadow-indigo-500/10' : 'border-zinc-800'} rounded-lg p-3 space-y-3 transition-all relative z-10 ${!isActive ? 'opacity-40 grayscale' : ''}`}
              >
                
                <div className="flex items-start gap-3 w-full">
                  <div 
                    className="mt-[18px] cursor-grab active:cursor-grabbing text-zinc-600 hover:text-white transition-colors p-1 bg-black/20 rounded shrink-0" 
                    title="Segure e arraste para reordenar"
                    onMouseDown={() => setDragEnabledIdx({ idx, parentIdx: undefined })}
                    onMouseUp={() => setDragEnabledIdx(null)}
                    onMouseLeave={() => setDragEnabledIdx(null)}
                  >
                    <GripVertical size={16} />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-4 relative">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] uppercase font-bold text-zinc-500">{item.type === 'group' ? 'Nome do Grupo' : 'Nome do Link'}</label>
                        {item.type === 'group' && (
                          <button 
                            type="button" 
                            onClick={() => toggleCollapse(idx)} 
                            className="flex items-center gap-1 text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 px-2 py-0.5 rounded transition-colors"
                            title={isCollapsed ? "Expandir pasta" : "Recolher pasta"}
                          >
                            <span className="text-[10px] font-bold uppercase">{isCollapsed ? 'Expandir' : 'Recolher'}</span>
                            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                          </button>
                        )}
                      </div>
                      <input type="text" value={item.title || item.name} onChange={e => updateItem(e.target.value, item.type === 'group' ? 'title' : 'name', idx)} className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-white outline-none focus:border-cyan-500" />
                    </div>
                    
                    <div className="col-span-4">
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Ícone</label>
                      <AdminIconSelector
                        value={item.icon} 
                        onChange={val => updateItem(val, 'icon', idx)} 
                        placeholder="Ex: lucide:folder"
                        variant="compact"
                        className="mt-1"
                      />
                    </div>
                    
                    {item.type === 'item' ? (
                      <div className="col-span-4">
                        <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">URL Destino</label>
                        <input type="text" value={item.href} onChange={e => updateItem(e.target.value, 'href', idx)} className="w-full mt-1 bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-white outline-none focus:border-cyan-500" placeholder="/dashboard/..." />
                      </div>
                    ) : (
                      <div className="col-span-4 flex items-end pb-1">
                        {isCollapsed && item.children?.length > 0 && (
                           <span className="text-[10px] text-zinc-500 font-medium ml-2">({item.children.length} itens ocultos)</span>
                        )}
                      </div> 
                    )}
                  </div>

                  <div className="flex flex-col gap-1 mt-[18px]">
                    <button type="button" onClick={() => toggleActive(idx)} title={isActive ? "Ocultar do Menu" : "Mostrar no Menu"} className={`p-1.5 rounded transition-colors ${isActive ? 'text-green-500 hover:bg-green-500/10' : 'text-zinc-500 hover:bg-zinc-800'}`}>
                      {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button type="button" onClick={() => removeItem(idx)} title="Excluir" className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"><Trash2 size={14}/></button>
                  </div>
                </div>

                {item.type === 'group' && (
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-8 pl-4 border-l border-zinc-800 space-y-3 pt-2 overflow-hidden"
                      >
                        {(item.children || []).map((child: any, cIdx: number) => {
                          const isChildDragging = draggingPos?.idx === cIdx && draggingPos?.parentIdx === idx;
                          const isChildDraggable = dragEnabledIdx?.idx === cIdx && dragEnabledIdx?.parentIdx === idx;
                          const isChildActive = child.isActive !== false;
                          
                          return (
                            <div 
                              key={cIdx} 
                              draggable={isChildDraggable}
                              onDragStart={(e) => handleDragStart(e, cIdx, idx)}
                              onDragEnter={(e) => handleDragEnter(e, cIdx, idx)}
                              onDragEnd={handleDragEnd}
                              onDragOver={handleDragOver}
                              className={`flex items-start gap-3 w-full bg-black/40 p-3 rounded-lg border transition-all relative z-20 ${isChildDragging ? 'border-cyan-500/50 opacity-50' : 'border-zinc-800/50'} ${!isChildActive ? 'opacity-40 grayscale' : ''}`}
                            >
                              <div 
                                className="mt-[18px] cursor-grab active:cursor-grabbing text-zinc-600 hover:text-white p-1 bg-black/20 rounded shrink-0" 
                                title="Segure e arraste para reordenar filho"
                                onMouseDown={() => setDragEnabledIdx({ idx: cIdx, parentIdx: idx })}
                                onMouseUp={() => setDragEnabledIdx(null)}
                                onMouseLeave={() => setDragEnabledIdx(null)}
                              >
                                <GripVertical size={14} />
                              </div>
                              
                              <div className="flex-1 grid grid-cols-12 gap-3 items-start">
                                <div className="col-span-4">
                                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Nome do Link</label>
                                  <input type="text" value={child.name} onChange={e => updateItem(e.target.value, 'name', cIdx, idx)} className="w-full mt-1 bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-white outline-none focus:border-cyan-500" placeholder="Nome" />
                                </div>
                                <div className="col-span-4">
                                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Ícone</label>
                                  <AdminIconSelector 
                                    value={child.icon} 
                                    onChange={val => updateItem(val, 'icon', cIdx, idx)} 
                                    placeholder="Ex: lucide:file-text"
                                    variant="compact"
                                    className="mt-1"
                                  />
                                </div>
                                <div className="col-span-4">
                                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">URL Destino</label>
                                  <input type="text" value={child.href} onChange={e => updateItem(e.target.value, 'href', cIdx, idx)} className="w-full mt-1 bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-indigo-400 outline-none focus:border-cyan-500" placeholder="/url-destino" />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1 mt-[18px]">
                                <button type="button" onClick={() => toggleActive(cIdx, idx)} title={isChildActive ? "Ocultar do Menu" : "Mostrar no Menu"} className={`p-1.5 rounded transition-colors ${isChildActive ? 'text-green-500 hover:bg-green-500/10' : 'text-zinc-500 hover:bg-zinc-800'}`}>
                                  {isChildActive ? <Eye size={14} /> : <EyeOff size={14} />}
                                </button>
                                <button type="button" onClick={() => removeItem(cIdx, idx)} title="Excluir" className="text-red-500 hover:bg-red-500/10 p-1.5 rounded shrink-0"><X size={14}/></button>
                              </div>
                            </div>
                          );
                        })}
                        
                        <div className="flex items-center gap-4 pt-2">
                          <button type="button" onClick={() => addLink(idx)} className="flex items-center gap-1 text-[10px] font-bold text-cyan-500 uppercase hover:text-cyan-400 transition-colors">
                            <Plus size={12} /> Link Manual
                          </button>
                          
                          {editingId && availablePages.length > 0 && (
                            <div className="relative flex items-center group">
                              <select 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={(e) => { addPage(idx, e.target.value); e.target.value = ""; }}
                                defaultValue=""
                              >
                                <option value="" disabled>Selecionar Página</option>
                                {availablePages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                              </select>
                              <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 uppercase group-hover:text-indigo-300 transition-colors">
                                <Plus size={12} /> Vincular Página
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

              </div>
            );
          })
        )}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
}