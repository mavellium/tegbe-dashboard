// hooks/useListManagement.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSite } from "@/context/site-context";

interface UseListManagementProps<T> {
  type: string;
  apiPath: string;
  defaultItem: T;
  validationFields?: (keyof T)[];
}

interface DeleteModalState {
  isOpen: boolean;
  type: 'single' | 'all' | null;
  index: number | null;
  title: string;
}

function getPlanLimit(planType: "basic" | "pro"): number {
  const limits: Record<"basic" | "pro", number> = {
    basic: 5,
    pro: 10
  };
  return limits[planType] || 5;
}

export function useListManagement<T extends { id?: string }>({
  type,
  apiPath,
  defaultItem,
  validationFields = []
}: UseListManagementProps<T>) {
  const { currentSite } = useSite(); // Usar contexto do site
  
  const [list, setList] = useState<T[]>([{...defaultItem}]);
  const [exists, setExists] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showValidation, setShowValidation] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: null,
    index: null,
    title: ''
  });
  
  const newItemRef = useRef<HTMLDivElement>(null);

  const currentPlanLimit = useMemo(() => {
    return getPlanLimit(currentSite.planType); // Usar do site atual
  }, [currentSite.planType]);

  const isLimitReached = useMemo(() => {
    return list.length >= currentPlanLimit;
  }, [list.length, currentPlanLimit]);

  const currentPlanType = useMemo(() => {
    return currentSite.planType; // Usar do site atual
  }, [currentSite.planType]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(apiPath);
        if (!res.ok) return;

        const data = await res.json();

        let itemsArray: any[] = [];
        let savedExists = null;

        if (Array.isArray(data)) {
          if (data.length > 0 && data[0].values) {
            savedExists = data[0];
            itemsArray = data[0].values || [];
          } else {
            itemsArray = data;
            if (itemsArray.length > 0) {
              savedExists = {
                id: `temp-${type}-${Date.now()}`,
                type,
                values: itemsArray
              };
            }
          }
        }

        const safeList = itemsArray
          .map((val: any, index: number) => ({
            ...val,
            id: val.id || `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
          }))
          .slice(0, currentPlanLimit);

        if (safeList.length > 0) {
          setExists(savedExists);
          setList(safeList);
        } else {
          setList([{
            ...defaultItem,
            id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }]);
        }
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
      }
    }

    loadData();
  }, [apiPath, type, currentPlanLimit, defaultItem]);

  const createNewItem = useCallback((): T => {
    return {
      ...defaultItem,
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }, [defaultItem, type]);

  const canAddNewItem = useCallback(() => {
    if (isLimitReached) {
      return false;
    }
    
    if (search) return false;
    
    const lastItem = list[list.length - 1];
    
    if (validationFields.length === 0) return true;
    
    return validationFields.every(field => {
      const value = lastItem[field];
      if (typeof value === 'string') return value.trim() !== "";
      if (Array.isArray(value)) return value.some((v: string) => v.trim() !== "");
      return !!value;
    });
  }, [list, search, validationFields, isLimitReached]);

  const filteredItems = useMemo(() => {
    let filtered = list
      .map((item, index) => ({ ...item, originalIndex: index }))
      .filter(item => {
        if (!search) return true;
        
        const searchLower = search.toLowerCase();
        return Object.entries(item).some(([key, value]) => {
          if (key === 'originalIndex' || key === 'file' || key === 'id') return false;
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchLower);
          }
          if (Array.isArray(value)) {
            return value.some((v: string) => 
              typeof v === 'string' && v.toLowerCase().includes(searchLower)
            );
          }
          return false;
        });
      });
    
    if (sortOrder === 'desc') {
      filtered = filtered.sort((a, b) => b.originalIndex - a.originalIndex);
    } else {
      filtered = filtered.sort((a, b) => a.originalIndex - b.originalIndex);
    }
    
    return filtered;
  }, [list, search, sortOrder]);

  const addItem = useCallback((newItem?: T) => {
    if (isLimitReached) {
      setErrorMsg(`Limite do plano atingido! Plano ${currentPlanType} permite apenas ${currentPlanLimit} itens.`);
      setTimeout(() => setErrorMsg(""), 5000);
      return;
    }

    if (search) {
      setErrorMsg("Limpe a busca antes de adicionar um novo item.");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }

    const lastItem = list[list.length - 1];
    
    if (validationFields.length > 0) {
      const isValid = validationFields.every(field => {
        const value = lastItem[field];
        if (typeof value === 'string') return value.trim() !== "";
        if (Array.isArray(value)) return value.some((v: string) => v.trim() !== "");
        return !!value;
      });

      if (!isValid) {
        setShowValidation(true);
        setErrorMsg("Complete o item atual antes de adicionar um novo.");
        setTimeout(() => setErrorMsg(""), 3000);
        return;
      }
    }

    const itemToAdd = newItem || createNewItem();
    
    setList([...list, itemToAdd]);
    setShowValidation(false);
    
    setTimeout(() => {
      newItemRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  }, [list, search, validationFields, createNewItem, isLimitReached, currentPlanLimit, currentPlanType]);

  const openDeleteSingleModal = useCallback((index: number, title: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'single',
      index,
      title: title || "Item sem título"
    });
  }, []);

  const openDeleteAllModal = useCallback(() => {
    setDeleteModal({
      isOpen: true,
      type: 'all',
      index: null,
      title: ''
    });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal({
      isOpen: false,
      type: null,
      index: null,
      title: ''
    });
  }, []);

  const confirmDelete = useCallback(async (updateFunction?: (newList: T[]) => Promise<void>) => {
    if (deleteModal.type === 'all') {
      const newEmptyItem = createNewItem();
      setList([newEmptyItem]);
      setSearch("");
      setSortOrder('asc');
      setShowValidation(false);
      
      if (exists && updateFunction) {
        try {
          await updateFunction([newEmptyItem]);
        } catch (err: any) {
          console.error("Erro ao limpar itens:", err);
        }
      }
    } else if (deleteModal.type === 'single' && deleteModal.index !== null) {
      if (list.length === 1) {
        const newEmptyItem = createNewItem();
        setList([newEmptyItem]);
        if (exists && updateFunction) await updateFunction([newEmptyItem]);
      } else {
        const newList = list.filter((_, i) => i !== deleteModal.index);
        setList(newList);
        if (exists && updateFunction) await updateFunction(newList);
      }
    }
    
    closeDeleteModal();
  }, [deleteModal, list, exists, createNewItem, closeDeleteModal]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setSortOrder('asc');
  }, []);

  const getCompleteCount = useCallback((): number => {
    if (validationFields.length === 0) return list.length;
    
    return list.filter(item => 
      validationFields.every(field => {
        const value = item[field];
        if (typeof value === 'string') return value.trim() !== "";
        if (Array.isArray(value)) return value.some((v: string) => v.trim() !== "");
        return !!value;
      })
    ).length;
  }, [list, validationFields]);

  return {
    list,
    setList,
    exists,
    setExists,
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
    setShowValidation,
    deleteModal,
    newItemRef,
    filteredItems,
    canAddNewItem: canAddNewItem(),
    completeCount: getCompleteCount(),
    isLimitReached,
    currentPlanLimit,
    currentPlanType,
    addItem,
    openDeleteSingleModal,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
    clearFilters,
  };
}