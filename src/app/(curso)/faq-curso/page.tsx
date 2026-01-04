/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { 
  HelpCircle,
  ChevronDown, 
  ChevronUp,
  Plus,
  Trash2,
  Sparkles,
  MessageCircleQuestion,
  List,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { useJsonManagement } from "@/hooks/useJsonManagement";

interface QuestionItem {
  question: string;
  answer: string;
}

interface Header {
  title: string;
  subtitle: string;
}

interface FAQData {
  id?: string;
  header: Header;
  questions: QuestionItem[];
  [key: string]: any;
}

const defaultFAQData: FAQData = {
  header: {
    title: "Perguntas Frequentes",
    subtitle: "Tudo o que você precisa saber antes de entrar."
  },
  questions: [
    {
      question: "O curso serve para quem está começando do zero?",
      answer: "Sim. O Módulo 01 (Fundação) foi desenhado especificamente para quem nunca vendeu online. Ensinamos desde a criação do CNPJ até a configuração das ferramentas."
    },
    {
      question: "Preciso ter muito dinheiro para investir em tráfego?",
      answer: "Não. Ensinamos a estratégia de 'Validação Barata'. Você começa com orçamentos mínimos (R$ 20-30/dia) para validar a oferta antes de escalar."
    },
    {
      question: "Tenho acesso ao suporte para tirar dúvidas?",
      answer: "Com certeza. Alunos do plano Black têm acesso à nossa comunidade exclusiva e encontros mensais ao vivo para análise de campanhas."
    },
    {
      question: "Por quanto tempo tenho acesso ao conteúdo?",
      answer: "O plano Start garante 1 ano de acesso. O plano TegPro Black garante acesso vitalício a todas as atualizações futuras."
    }
  ]
};

// Componente SectionHeader
interface SectionHeaderProps {
  title: string;
  section: any;
  icon: any;
  isExpanded: boolean;
  onToggle: (section: any) => void;
}

const SectionHeader = ({
  title,
  section,
  icon: Icon,
  isExpanded,
  onToggle
}: SectionHeaderProps) => (
  <div
    onClick={() => onToggle(section)}
    className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        {title}
      </h3>
    </div>
    {isExpanded ? (
      <ChevronUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
    ) : (
      <ChevronDown className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
    )}
  </div>
);

// Componente QuestionEditor
interface QuestionEditorProps {
  questionItem: QuestionItem;
  index: number;
  onChange: (question: QuestionItem) => void;
  onRemove: () => void;
}

const QuestionEditor = ({ questionItem, index, onChange, onRemove }: QuestionEditorProps) => {
  const updateQuestion = (field: keyof QuestionItem, value: string) => {
    onChange({ ...questionItem, [field]: value });
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            <MessageCircleQuestion className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-lg">
              Pergunta {index + 1}
            </h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {questionItem.question.substring(0, 50)}...
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="danger"
          onClick={onRemove}
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Remover
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Pergunta
          </label>
          <Input
            type="text"
            value={questionItem.question}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateQuestion("question", e.target.value)
            }
            placeholder="Digite a pergunta"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Resposta
          </label>
          <textarea
            value={questionItem.answer}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              updateQuestion("answer", e.target.value)
            }
            placeholder="Digite a resposta detalhada"
            className="w-full h-40 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
    </Card>
  );
};

export default function FAQPage() {
  const {
    data: faqData,
    setData: setFAQData,
    updateNested,
    loading,
    success,
    errorMsg,
    save,
    exists,
    reload
  } = useJsonManagement<FAQData>({
    apiPath: "/api/tegbe-institucional/json/faq-curso",
    defaultData: defaultFAQData,
  });

  const [expandedSections, setExpandedSections] = useState({
    header: true,
    questions: true
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "all" as const,
    title: ""
  });

  // Processar os dados para mesclar propriedades
  const [processedData, setProcessedData] = useState<FAQData>(defaultFAQData);

  useEffect(() => {
    if (faqData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProcessedData(faqData);
    }
  }, [faqData]);

  // Calcular campos completos
  const calculateCompleteCount = useCallback(() => {
    let count = 0;
    
    if (!processedData) return 0;
    
    // Verificar header
    if (
      processedData.header.title.trim() !== "" &&
      processedData.header.subtitle.trim() !== ""
    ) {
      count++;
    }
    
    // Verificar questions
    if (processedData.questions.length > 0) {
      const hasValidQuestions = processedData.questions.some(question => 
        question.question.trim() !== "" && 
        question.answer.trim() !== ""
      );
      if (hasValidQuestions) count++;
    }
    
    return count;
  }, [processedData]);

  const completeCount = calculateCompleteCount();
  const totalCount = 2; // header, questions

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (path: string, value: any) => {
    updateNested(path, value);
  };

  const handleQuestionChange = (index: number, question: QuestionItem) => {
    const newQuestions = [...processedData.questions];
    newQuestions[index] = question;
    handleChange("questions", newQuestions);
  };

  const addQuestion = () => {
    const newQuestion: QuestionItem = {
      question: "Nova pergunta frequente?",
      answer: "Resposta para a nova pergunta frequente."
    };
    handleChange("questions", [...processedData.questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = processedData.questions.filter((_, i) => i !== index);
    handleChange("questions", newQuestions);
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      const fd = new FormData();
      fd.append("values", JSON.stringify(faqData));
      save(fd);
      await reload();
      await reload();
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
    }
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: "all",
      title: "TODAS AS PERGUNTAS FREQUENTES"
    });
  };

  const confirmDelete = async () => {
    await fetch("/api/tegbe-institucional/json/faq-curso", {
      method: "DELETE",
    });

    setFAQData(defaultFAQData);
    setProcessedData(defaultFAQData);
    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setDeleteModal({ 
      isOpen: false, 
      type: "all", 
      title: "" 
    });
  };

  const renderHeaderSection = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Título
            </label>
            <Input
              type="text"
              value={processedData.header.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("header.title", e.target.value)
              }
              placeholder="Perguntas Frequentes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Subtítulo
            </label>
            <Input
              type="text"
              value={processedData.header.subtitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("header.subtitle", e.target.value)
              }
              placeholder="Tudo o que você precisa saber antes de entrar."
            />
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2">Pré-visualização:</h4>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
              {processedData.header.title || "Perguntas Frequentes"}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              {processedData.header.subtitle || "Subtítulo do FAQ..."}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ManageLayout
      headerIcon={HelpCircle}
      title="FAQ - Perguntas Frequentes"
      description="Gerencie as perguntas frequentes e respostas da TegPro"
      exists={!!exists}
      itemName="FAQ"
    >
      <form onSubmit={handleSubmitWrapper} className="space-y-6 pb-32">
        {/* Seção Header */}
        <div className="space-y-4">
          <SectionHeader
            title="Cabeçalho"
            section="header"
            icon={List}
            isExpanded={expandedSections.header}
            onToggle={() => toggleSection("header")}
          />

          <AnimatePresence>
            {expandedSections.header && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {renderHeaderSection()}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seção Perguntas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <SectionHeader
              title={`Perguntas (${processedData.questions.length} disponíveis)`}
              section="questions"
              icon={MessageCircleQuestion}
              isExpanded={expandedSections.questions}
              onToggle={() => toggleSection("questions")}
            />
            <Button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Pergunta
            </Button>
          </div>

          <AnimatePresence>
            {expandedSections.questions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-6 space-y-6">
                  {processedData.questions.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircleQuestion className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Nenhuma pergunta adicionada
                      </h4>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                        Adicione perguntas frequentes para ajudar seus clientes
                      </p>
                      <Button
                        type="button"
                        onClick={addQuestion}
                        className="flex items-center gap-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Primeira Pergunta
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {processedData.questions.map((question, index) => (
                        <QuestionEditor
                          key={index}
                          questionItem={question}
                          index={index}
                          onChange={(updatedQuestion) => handleQuestionChange(index, updatedQuestion)}
                          onRemove={() => removeQuestion(index)}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Action Bar */}
        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmit}
          isAddDisabled={false}
          isSaving={loading}
          exists={!!exists}
          completeCount={completeCount}
          totalCount={totalCount}
          itemName="FAQ"
          icon={HelpCircle}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={processedData.questions.length}
        itemName="Pergunta"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}