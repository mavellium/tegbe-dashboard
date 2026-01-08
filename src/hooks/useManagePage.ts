/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useGenericManagePage.ts
import { useState, useEffect } from "react";

interface UseGenericManagePageProps<T> {
  type: string;
  defaultData: T;
  mergeFunction: (apiData: any) => T;
  apiBase?: string;
}

export const useGenericManagePage = <T extends { id?: string }>({
  type,
  defaultData,
  mergeFunction,
  apiBase = "/api/tegbe-institucional/json",
}: UseGenericManagePageProps<T>) => {
  const [data, setData] = useState<T>(defaultData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "single" as "single" | "all",
    title: "",
  });
  
  const [fileStates, setFileStates] = useState<Record<string, File | null>>({});

  const exists = !!data?.id;

  const fetchExistingData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/${type}`);

      if (res.ok) {
        const apiData = await res.json();
        console.log(`Dados recebidos da API (${type}):`, apiData);
        
        if (apiData) {
          const mergedData = mergeFunction(apiData);
          setData(mergedData);
        }
      }
    } catch (error) {
      console.error(`Erro ao buscar dados do ${type}:`, error);
      setErrorMsg("Erro ao carregar dados do servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingData();
  }, []);

  const handleChange = (path: string, value: any) => {
    const keys = path.split('.');
    setData(prev => {
      const newData = { ...prev } as any;
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const setFileState = (field: string, file: File | null) => {
    setFileStates(prev => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const dataToSend = { ...data };
      const fd = new FormData();

      fd.append("values", JSON.stringify(dataToSend));

      // Adicionar arquivos ao FormData
      Object.entries(fileStates).forEach(([field, file]) => {
        if (file) {
          fd.append(`file:${field}`, file);
        }
      });

      const method = dataToSend.id ? "PUT" : "POST";

      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Erro ao salvar configurações do ${type}`);
      }

      const saved = await res.json();
      console.log("Dados salvos:", saved);
      
      if (saved) {
        const mergedData = mergeFunction(saved);
        setData(mergedData);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Limpar estados de arquivo após envio bem-sucedido
      setFileStates({});
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: `TODAS AS CONFIGURAÇÕES DO ${type.toUpperCase()}`,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: "single", title: "" });
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`${apiBase}/${type}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setData(defaultData);
        setFileStates({});
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error("Erro ao deletar");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao deletar");
    } finally {
      closeDeleteModal();
    }
  };

  return {
    // Estados
    data,
    loading,
    success,
    errorMsg,
    deleteModal,
    fileStates,
    exists,
    
    // Setters
    setData,
    
    // Funções genéricas
    fetchExistingData,
    handleChange,
    setFileState,
    handleSubmit,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
  };
};