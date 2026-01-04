/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";

interface UseJsonManagementProps<T> {
  apiPath: string;
  defaultData: T;
}

export function useJsonManagement<T>({
  apiPath,
  defaultData,
}: UseJsonManagementProps<T>) {
  /* =========================
     STATE
  ========================= */
  const [data, setData] = useState<T>(defaultData);
  const [exists, setExists] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* =========================
     LOAD (GET)
  ========================= */
  const load = useCallback(async () => {
    try {
      const res = await fetch(apiPath, { cache: "no-store" });
      if (!res.ok) return;

      const record = (await res.json()) as T | null;
      if (!record) return;

      setExists(record);
      setData(record);
    } catch (err) {
      console.error("Erro ao carregar JSON:", err);
    }
  }, [apiPath]);

  useEffect(() => {
    load();
  }, [load]);

  /* =========================
     UPDATERS
  ========================= */

  // Atualiza campo de primeiro nível
  const updateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Atualiza qualquer campo interno via path (image.home, buttons.0.label)
  const updateNested = useCallback((path: string, value: any) => {
    setData((prev: any) => {
      const clone = structuredClone(prev);
      const keys = path.split(".");
      let current = clone;

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (i === keys.length - 1) {
          current[key] = value;
        } else {
          if (!current[key]) current[key] = {};
          current = current[key];
        }
      }

      return clone;
    });
  }, []);

  /* =========================
     SAVE (POST | PUT)
  ========================= */
  const save = useCallback(
    async (formData?: FormData): Promise<T> => {
      try {
        setLoading(true);
        setSuccess(false);
        setErrorMsg("");

        let body: BodyInit;
        let headers: HeadersInit | undefined;

        if (formData) {
          // garante que o JSON atual sempre vá junto
          formData.set("values", JSON.stringify(data));
          body = formData;
          headers = undefined;
        } else {
          body = JSON.stringify({ values: data });
          headers = { "Content-Type": "application/json" };
        }

        const res = await fetch(apiPath, {
          method: exists ? "PUT" : "POST",
          body,
          headers,
        });

        if (!res.ok) {
          throw new Error("Erro ao salvar dados");
        }

        const record = (await res.json()) as T;

        // 🔥 sincroniza frontend com backend imediatamente
        setExists(record);
        setData(record);
        setSuccess(true);

        return record;
      } catch (err: any) {
        setErrorMsg(err.message || "Erro ao salvar");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiPath, data, exists]
  );

  /* =========================
     DELETE
  ========================= */
  const remove = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await fetch(apiPath, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao deletar");

      setData(defaultData);
      setExists(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao deletar");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiPath, defaultData]);

  /* =========================
     RETURN
  ========================= */
  return {
    data,
    setData,

    exists,
    loading,
    success,
    errorMsg,

    updateField,
    updateNested,

    save,
    remove,
    reload: load,
  };
}
