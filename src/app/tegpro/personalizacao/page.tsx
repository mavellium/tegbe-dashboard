/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListManagement } from "@/hooks/useListManagement";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Layers, X } from "lucide-react";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { ItemHeader } from "@/components/Manage/ItemHeader";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";

// Interface para campos do formulário
interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  description?: string;
}

// Interface para seções do formulário
interface FormSection {
  sectionTitle: string;
  sectionSubtitle?: string;
  fields: FormField[];
}

// Schema do formulário baseado no JSON fornecido
const formSchema: FormSection[] = [
  {
    sectionTitle: "Seção Inicial",
    sectionSubtitle: "",
    fields: [
      {
        name: "title-init",
        label: "Título",
        type: "text",
        required: true,
      },
      {
        name: "description-init",
        label: "Descrição",
        type: "text",
        required: true,
      },
      {
        name: "title-garca",
        label: "Mensagem sobre o curso, cidade de Garça",
        type: "text",
        required: true,
      },
      {
        name: "title-marilia",
        label: "Mensagem sobre o curso, cidade de Marília",
        type: "text",
        required: true,
      },
    ],
  },
  {
    sectionTitle: "Seção Vídeo",
    sectionSubtitle: "",
    fields: [
      {
        name: "title-video",
        label: "Título",
        type: "text",
        required: true,
      },
    ],
  },
  {
    sectionTitle: "Seção Não é sorte. É decisão.",
    sectionSubtitle: "",
    fields: [
      {
        name: "title-decisao",
        label: "Título",
        type: "text",
        required: true,
      },
      {
        name: "description-decisao",
        label: "Descrição",
        type: "text",
        required: true,
      },
    ],
  },
];

interface FormItem {
  id?: string;
  [key: string]: any;
}

// Função para converter nomes com hífen para formato seguro (underscore)
const toSafeFieldName = (fieldName: string): string => {
  return fieldName.replace(/-/g, '_');
};

// Função para converter de volta para o nome original
const fromSafeFieldName = (safeName: string): string => {
  return safeName.replace(/_/g, '-');
};

export default function LandingContentPage({ 
  type = "custom", 
  subtype = "tegpro"
}: { 
  type: string; 
  subtype: string; 
}) {
  // Gerar o defaultItem baseado no formSchema
  const defaultItem = useMemo(() => {
    const item: FormItem = { 
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
    };
    
    // Inicializar todos os campos com string vazia
    formSchema.forEach((section: FormSection) => {
      section.fields.forEach((field: FormField) => {
        item[field.name] = "";
      });
    });
    
    return item;
  }, [type]);

  const apiBase = `/api/${subtype}/form`;

  const {
    list: formItems,
    setList: setFormItems,
    exists,
    loading,
    setLoading,
    success,
    setSuccess,
    errorMsg,
    setErrorMsg,
    showValidation,
    deleteModal,
    canAddNewItem,
    completeCount,
    isLimitReached,
    addItem,
    openDeleteSingleModal,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
  } = useListManagement<FormItem>({
    type,
    apiPath: `${apiBase}/${type}`,
    defaultItem,
    validationFields: formSchema.flatMap(section => 
      section.fields.filter(field => field.required).map(field => field.name)
    )
  });

  // Efeito para converter os dados recebidos da API (underscore para hífen)
  useEffect(() => {
    if (formItems.length > 0) {
      const firstItem = formItems[0];
      // Verificar se há campos com underscore (formato da API)
      const hasUnderscoreFields = Object.keys(firstItem).some(key => 
        key.includes('_') && !key.includes('-')
      );
      
      if (hasUnderscoreFields) {
        // Converter todos os itens
        const convertedItems = formItems.map(item => {
          const newItem: FormItem = { id: item.id };
          Object.keys(item).forEach(key => {
            if (key === 'id') return;
            // Converter do formato da API (underscore) para o formato do formSchema (hífen)
            const originalFieldName = fromSafeFieldName(key);
            newItem[originalFieldName] = item[key];
          });
          return newItem;
        });
        setFormItems(convertedItems);
      }
    }
  }, [formItems, setFormItems]);

  // Para formulário dinâmico, sempre trabalhamos com o primeiro item
  const currentItem = formItems[0] || defaultItem;

  const handleChange = (index: number, fieldName: string, value: any) => {
    const newList = [...formItems];
    newList[index] = { ...newList[index], [fieldName]: value };
    setFormItems(newList);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const fd = new FormData();
      
      if (exists) fd.append("id", exists.id);
      
      formItems.forEach((item, i) => {
        Object.keys(item).forEach((key) => {
          if (key !== "id" && key !== "file") {
            // Converter o nome do campo para formato seguro (hífen -> underscore)
            const safeKey = toSafeFieldName(key);
            fd.append(`values[${i}][${safeKey}]`, item[key] || "");
          }
        });
        
        if (item.id) {
          fd.append(`values[${i}][id]`, item.id);
        }
      });

      const method = exists ? "PUT" : "POST";
      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Falha ao salvar dados");
      }

      const savedData = await res.json();
      // Converter os dados recebidos da API (underscore para hífen)
      const normalizedItems = savedData.values.map((v: any, index: number) => {
        const item: FormItem = { 
          id: v.id || `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
        };
        
        // Converter campos de underscore para hífen
        Object.keys(v).forEach(key => {
          if (key !== 'id') {
            const originalFieldName = fromSafeFieldName(key);
            item[originalFieldName] = v[key];
          }
        });
        
        return item;
      });
      
      setFormItems(normalizedItems);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Erro no submit:', err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateItems = async (list: FormItem[]) => {
    if (!exists) return;

    const fd = new FormData();
    
    fd.append("id", exists.id);
    
    list.forEach((item, i) => {
      Object.keys(item).forEach((key) => {
        if (key !== "id" && key !== "file") {
          // Converter o nome do campo para formato seguro (hífen -> underscore)
          const safeKey = toSafeFieldName(key);
          fd.append(`values[${i}][${safeKey}]`, item[key] || "");
        }
      });
      
      if (item.id) {
        fd.append(`values[${i}][id]`, item.id);
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
    // Converter os dados recebidos da API
    const convertedItems = updated.values.map((v: any) => {
      const item: FormItem = { id: v.id };
      Object.keys(v).forEach(key => {
        if (key !== 'id') {
          const originalFieldName = fromSafeFieldName(key);
          item[originalFieldName] = v[key];
        }
      });
      return item;
    });
    return convertedItems;
  };

  const handleSubmitWrapper = () => {
    handleSubmit();
  };

  // Função para renderizar um campo baseado no seu tipo
  const renderField = (field: FormField) => {
    const fieldValue = currentItem[field.name] || "";
    const fieldType = field.type || "text";

    if (fieldType === "textarea") {
      return (
        <textarea
          placeholder={field.placeholder || ""}
          value={fieldValue}
          onChange={(e) => handleChange(0, field.name, e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        />
      );
    }

    // Para checkbox
    if (fieldType === "checkbox") {
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={Boolean(fieldValue)}
            onChange={(e) => handleChange(0, field.name, e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-zinc-300 dark:border-zinc-600"
          />
          <span className="ml-2 text-sm text-zinc-700 dark:text-zinc-300">
            {field.label}
          </span>
        </div>
      );
    }

    // Para campos de texto
    return (
      <div>
        <Input
          type={fieldType}
          placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`}
          value={fieldValue}
          onChange={(e: any) => handleChange(0, field.name, e.target.value)}
          className={`w-full ${field.required && !fieldValue.trim() && showValidation ? "border-red-500 ring-1 ring-red-500" : ""}`}
        />
        {field.required && !fieldValue.trim() && showValidation && (
          <p className="text-xs text-red-500 mt-1">
            Este campo é obrigatório
          </p>
        )}
      </div>
    );
  };

  // Calcular campos completos para validação
  const getCompleteFields = useCallback(() => {
    const completedFields: { label: string; hasValue: boolean }[] = [];
    
    formSchema.forEach((section: FormSection) => {
      section.fields.forEach((field: FormField) => {
        const value = currentItem[field.name];
        const hasValue = field.type === "checkbox" 
          ? value !== undefined 
          : value && value.toString().trim() !== "";
        
        completedFields.push({
          label: field.label,
          hasValue
        });
      });
    });
    
    return completedFields;
  }, [currentItem]);

  const completedFields = getCompleteFields();

  // Contar campos obrigatórios
  const requiredFieldsCount = formSchema.reduce(
    (count, section) => count + section.fields.filter(f => f.required).length, 
    0
  );

  return (
    <ManageLayout
      headerIcon={Layers}
      title="Conteúdo da Landing Page"
      description={`Gerencie os textos da página de vendas (${requiredFieldsCount} campos obrigatórios)`}
      exists={!!exists}
      itemName="Conteúdo"
    >
      <div className="space-y-4 pb-32">
        <form onSubmit={handleSubmit}>
          <Card className="mb-4 overflow-hidden">
            <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
              <ItemHeader
                index={0}
                fields={completedFields}
                showValidation={showValidation}
                isLast={true}
                onDelete={() => openDeleteSingleModal(0, "Conteúdo da Landing Page")}
                showDelete={!!exists && formItems.length > 0}
              />
              
              <div className="space-y-8 mt-6">
                {formSchema.map((section: FormSection, sectionIndex: number) => (
                  <div key={sectionIndex} className="space-y-6 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-800/30 dark:to-zinc-900/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                          {section.sectionTitle}
                        </h2>
                        {section.sectionSubtitle && section.sectionSubtitle.trim() && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            {section.sectionSubtitle}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {section.fields.length} campo{section.fields.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className={`grid gap-6 ${
                      section.sectionTitle === "Seção Inicial" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                    }`}>
                      {section.fields.map((field: FormField) => (
                        <div key={field.name} className={`flex flex-col ${
                          field.type === "checkbox" ? "items-start" : ""
                        }`}>
                          <label 
                            htmlFor={field.name} 
                            className="mb-2 font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1"
                          >
                            <span>{field.label}</span>
                          </label>
                          <div className={`${field.type === "checkbox" ? "w-full" : ""}`}>
                            {renderField(field)}
                          </div>
                          {field.description && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 italic">
                              {field.description}
                            </p>
                          )}
                          
                          {/* Dicas específicas para certos campos */}
                          {field.name === "title-garca" && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                              💡 Mensagem específica para a cidade de Garça
                            </p>
                          )}
                          {field.name === "title-marilia" && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                              💡 Mensagem específica para a cidade de Marília
                            </p>
                          )}
                          {field.name === "title-decisao" && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                              💡 Título da seção &quot;Não é sorte. É decisão.&quot;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </form>
      </div>

      <FixedActionBar
        onDeleteAll={openDeleteAllModal}
        onAddNew={() => addItem()}
        onSubmit={handleSubmitWrapper}
        isAddDisabled={!canAddNewItem || isLimitReached}
        isSaving={loading}
        exists={!!exists}
        completeCount={completeCount}
        totalCount={formItems.length}
        itemName="Conteúdo"
        icon={Layers}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => confirmDelete(updateItems)}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={formItems.length}
        itemName="Conteúdo"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />

      <AnimatePresence>
        {false && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
            >
              <Button
                onClick={() => {}}
                className="absolute -top-4 -right-4 !p-3 !rounded-full bg-red-500 hover:bg-red-600 z-10"
              >
                <X className="w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ManageLayout>
  );
}