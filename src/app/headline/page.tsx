// app/headline/page.tsx - CÓDIGO COMPLETO CORRIGIDO
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Switch } from "@/components/Switch";
import { Tag, Palette, Type, Zap, Eye, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import ColorPicker from "@/components/ColorPicker";
import IconSelector from "@/components/IconSelector";

interface BadgeData {
  icone: string;
  texto: string;
  cor: string;
  visivel: boolean;
}

interface PalavraAnimada {
  texto: string;
  cor: string;
  ordem: number;
}

interface TituloData {
  chamada: string;
  palavrasAnimadas: PalavraAnimada[];
  tituloPrincipal: string;
  separador: string;
}

interface BotaoData {
  texto: string;
  link: string;
  icone: string;
  estilo: string;
  visivel: boolean;
}

interface AgendaData {
  status: string;
  mes: string;
  corStatus: string;
  texto: string;
  visivel: boolean;
}

interface EfeitosData {
  brilhoTitulo: string;
  spotlight: boolean;
  grid: boolean;
  sombraInferior: boolean;
}

interface ConfiguracoesData {
  intervaloAnimacao: number;
  corFundo: string;
  corDestaque: string;
  efeitos: EfeitosData;
}

interface HeadlineData {
  id?: string;
  badge: BadgeData;
  titulo: TituloData;
  subtitulo: string;
  botao: BotaoData;
  agenda: AgendaData;
  configuracoes: ConfiguracoesData;
}

const defaultHeadlineData: HeadlineData = {
  badge: {
    icone: "",
    texto: "",
    cor: "#FFCC00",
    visivel: true
  },
  titulo: {
    chamada: "",
    palavrasAnimadas: [],
    tituloPrincipal: "",
    separador: ""
  },
  subtitulo: "",
  botao: {
    texto: "",
    link: "",
    icone: "",
    estilo: "gradiente-amarelo",
    visivel: true
  },
  agenda: {
    status: "aberta",
    mes: "",
    corStatus: "#22C55E",
    texto: "",
    visivel: true
  },
  configuracoes: {
    intervaloAnimacao: 2500,
    corFundo: "#020202",
    corDestaque: "#FFCC00",
    efeitos: {
      brilhoTitulo: "",
      spotlight: false,
      grid: false,
      sombraInferior: false
    }
  }
};

// Função para converter Tailwind para hexadecimal
const extractHexFromTailwind = (tailwindString: string): string => {
  if (!tailwindString) return "#FFCC00";
  
  if (tailwindString.startsWith('#')) {
    return tailwindString;
  }
  
  const hexMatch = tailwindString.match(/#([0-9A-Fa-f]{6})/);
  if (hexMatch) {
    return `#${hexMatch[1]}`;
  }
  
  const tailwindColors: Record<string, string> = {
    'red-500': '#EF4444',
    'green-500': '#22C55E',
    'blue-500': '#3B82F6',
    'yellow-500': '#FFCC00',
    'orange-500': '#F97316',
    'purple-500': '#A855F7',
    'pink-500': '#EC4899',
    'gray-500': '#6B7280',
  };
  
  for (const [key, value] of Object.entries(tailwindColors)) {
    if (tailwindString.includes(key)) {
      return value;
    }
  }
  
  return "#FFCC00";
};

// Lista de etapas/fields para validação
const stepList = [
  { id: 'badge', label: 'Badge', fields: ['badge.texto'] },
  { id: 'titulo', label: 'Título', fields: ['titulo.tituloPrincipal'] },
  { id: 'subtitulo', label: 'Subtítulo', fields: ['subtitulo'] },
  { id: 'botao', label: 'Botão', fields: ['botao.texto', 'botao.link'] },
  { id: 'agenda', label: 'Agenda', fields: ['agenda.texto'] },
  { id: 'configuracoes', label: 'Configurações', fields: ['configuracoes.corFundo'] }
];

export default function HeadlinePage({ 
  type = "headline", 
  subtype = "tegbe-institucional"
}: { 
  type: string; 
  subtype: string; 
}) {
  const [headlineData, setHeadlineData] = useState<HeadlineData>(defaultHeadlineData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    badge: true,
    titulo: true,
    subtitulo: true,
    botao: true,
    agenda: true,
    configuracoes: false
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: 'single' as 'single' | 'all',
    title: ''
  });

  const apiBase = `/api/${subtype}/form`;

  // Calcular campos completos
  const completeCount = useMemo(() => {
    let count = 0;
    
    stepList.forEach(step => {
      const allFieldsFilled = step.fields.every(field => {
        const keys = field.split('.');
        let value: any = headlineData;
        
        for (const key of keys) {
          if (value && typeof value === 'object' && key in value) {
            value = value[key];
          } else {
            return false;
          }
        }
        
        return value !== undefined && value !== null && value !== '';
      });
      
      if (allFieldsFilled) count++;
    });
    
    return count;
  }, [headlineData]);

  // Verificar se pode adicionar (sempre true para headline único)
  const canAddNewItem = true;
  const isLimitReached = false;
  const exists = !!headlineData.id;

  const fetchExistingData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/${type}`);
      
      if (res.ok) {
        const data = await res.json();
        if (data && data.values && data.values[0]) {
          const fetchedData = data.values[0];
          
          const transformedData = {
            ...fetchedData,
            id: data.id,
            badge: {
              ...fetchedData.badge,
              cor: extractHexFromTailwind(fetchedData.badge?.cor || "#FFCC00")
            },
            titulo: {
              ...fetchedData.titulo,
              palavrasAnimadas: fetchedData.titulo?.palavrasAnimadas?.map((palavra: PalavraAnimada) => ({
                ...palavra,
                cor: extractHexFromTailwind(palavra.cor)
              })) || defaultHeadlineData.titulo.palavrasAnimadas
            },
            agenda: {
              ...fetchedData.agenda,
              corStatus: extractHexFromTailwind(fetchedData.agenda?.corStatus || "#22C55E")
            },
            configuracoes: {
              ...fetchedData.configuracoes,
              corFundo: extractHexFromTailwind(fetchedData.configuracoes?.corFundo || "#020202"),
              corDestaque: fetchedData.configuracoes?.corDestaque || "#FFCC00"
            }
          };
          
          setHeadlineData(transformedData);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setErrorMsg("Erro ao carregar dados do servidor");
    } finally {
      setLoading(false);
    }
  }, [apiBase, type]);

  useEffect(() => {
    fetchExistingData();
  }, [fetchExistingData]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (path: string, value: any) => {
    const keys = path.split('.');
    setHeadlineData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handlePalavraAnimadaChange = (index: number, field: keyof PalavraAnimada, value: string) => {
    const newPalavras = [...headlineData.titulo.palavrasAnimadas];
    newPalavras[index] = { ...newPalavras[index], [field]: value };
    handleChange('titulo.palavrasAnimadas', newPalavras);
  };

  const addPalavraAnimada = () => {
    const newPalavras = [...headlineData.titulo.palavrasAnimadas, {
      texto: "NOVA PALAVRA",
      cor: "#FFCC00",
      ordem: headlineData.titulo.palavrasAnimadas.length + 1
    }];
    handleChange('titulo.palavrasAnimadas', newPalavras);
  };

  const removePalavraAnimada = (index: number) => {
    const newPalavras = headlineData.titulo.palavrasAnimadas.filter((_, i) => i !== index);
    handleChange('titulo.palavrasAnimadas', newPalavras);
  };

  const movePalavraAnimada = (index: number, direction: 'up' | 'down') => {
    const newPalavras = [...headlineData.titulo.palavrasAnimadas];
    if (direction === 'up' && index > 0) {
      [newPalavras[index], newPalavras[index - 1]] = [newPalavras[index - 1], newPalavras[index]];
    } else if (direction === 'down' && index < newPalavras.length - 1) {
      [newPalavras[index], newPalavras[index + 1]] = [newPalavras[index + 1], newPalavras[index]];
    }
    handleChange('titulo.palavrasAnimadas', newPalavras);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      const fd = new FormData();

      fd.append("type", type);
      fd.append("subtype", subtype);
      fd.append("values", JSON.stringify([headlineData]));

      if (headlineData.id) {
        fd.append("id", headlineData.id);
      }

      const method = headlineData.id ? "PUT" : "POST";

      const res = await fetch(`${apiBase}/${type}`, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao salvar headline");
      }

      const saved = await res.json();

      if (saved?.values?.[0]) {
        setHeadlineData(saved.values[0]);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWrapper = () => {
    handleSubmit();
  };

  const handleColorChange = (path: string, color: string) => {
    const cleanColor = color.startsWith('#') ? color : `#${color}`;
    handleChange(path, cleanColor);
  };

  const openDeleteAllModal = () => {
    setDeleteModal({
      isOpen: true,
      type: 'all',
      title: 'TODOS OS DADOS'
    });
  };

  const confirmDelete = async () => {
    if (!headlineData.id) return;

    try {
      const res = await fetch(`${apiBase}/${type}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: headlineData.id })
      });

      if (res.ok) {
        setHeadlineData(defaultHeadlineData);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Erro ao deletar');
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao deletar");
    } finally {
      closeDeleteModal();
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: 'single', title: '' });
  };

  const SectionHeader = ({ 
    title, 
    section, 
    icon: Icon 
  }: { 
    title: string; 
    section: keyof typeof expandedSections; 
    icon: any; 
  }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      ) : (
        <ChevronDown className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      )}
    </button>
  );

  return (
    <ManageLayout
      headerIcon={Type}
      title="Headline - Seção Hero"
      description="Configure o conteúdo principal da seção hero da página"
      exists={exists}
      itemName="Headline"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Badge Section */}
        <div className="space-y-4">
          <SectionHeader title="Badge" section="badge" icon={Tag} />
          
          <motion.div
            initial={false}
            animate={{ height: expandedSections.badge ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <IconSelector
                    value={headlineData.badge.icone}
                    onChange={(value) => handleChange('badge.icone', value)}
                    label="Ícone do Badge"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Texto do Badge
                  </label>
                  <Input
                    type="text"
                    placeholder="Consultoria Oficial Mercado Livre"
                    value={headlineData.badge.texto}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('badge.texto', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Cor do Texto (Hexadecimal)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="#FFCC00"
                      value={headlineData.badge.cor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('badge.cor', e.target.value)}
                      className="font-mono"
                    />
                    <ColorPicker
                      color={headlineData.badge.cor}
                      onChange={(color: string) => handleColorChange('badge.cor', color)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Visibilidade
                    </label>
                    <p className="text-sm text-zinc-500">Mostrar ou esconder o badge</p>
                  </div>
                  <Switch
                    checked={headlineData.badge.visivel}
                    onCheckedChange={(checked: boolean) => handleChange('badge.visivel', checked)}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Título Section */}
        <div className="space-y-4">
          <SectionHeader title="Título" section="titulo" icon={Type} />
          
          <motion.div
            initial={false}
            animate={{ height: expandedSections.titulo ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Chamada Inicial
                </label>
                <Input
                  type="text"
                  placeholder="O seu negócio não precisa de mais"
                  value={headlineData.titulo.chamada}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('titulo.chamada', e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Palavras Animadas
                  </label>
                  <Button
                    type="button"
                    onClick={addPalavraAnimada}
                  >
                    + Adicionar Palavra
                  </Button>
                </div>

                <div className="space-y-3">
                  {headlineData.titulo.palavrasAnimadas.map((palavra, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => movePalavraAnimada(index, 'up')}
                          disabled={index === 0}
                          className="p-1 disabled:opacity-30 text-zinc-600 dark:text-zinc-400"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => movePalavraAnimada(index, 'down')}
                          disabled={index === headlineData.titulo.palavrasAnimadas.length - 1}
                          className="p-1 disabled:opacity-30 text-zinc-600 dark:text-zinc-400"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <Input
                        type="text"
                        value={palavra.texto}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePalavraAnimadaChange(index, 'texto', e.target.value)}
                        placeholder="Palavra animada"
                        className="flex-1"
                      />
                      
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={palavra.cor}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePalavraAnimadaChange(index, 'cor', e.target.value)}
                          placeholder="#FFCC00"
                          className="w-32 font-mono"
                        />
                        <ColorPicker
                          color={palavra.cor}
                          onChange={(color: string) => {
                            const newPalavras = [...headlineData.titulo.palavrasAnimadas];
                            newPalavras[index].cor = color;
                            handleChange('titulo.palavrasAnimadas', newPalavras);
                          }}
                        />
                      </div>
                      
                      <Button
                        type="button"
                        onClick={() => removePalavraAnimada(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Título Principal (HTML permitido)
                </label>
                <textarea
                  placeholder="PRECISA<br/>VENDER MAIS"
                  value={headlineData.titulo.tituloPrincipal}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('titulo.tituloPrincipal', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                />
                <p className="text-xs text-zinc-500 mt-1">Use &lt;br/&gt; para quebras de linha</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Separador Responsivo (HTML)
                </label>
                <Input
                  type="text"
                  placeholder="<br className='hidden sm:block'/>"
                  value={headlineData.titulo.separador}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('titulo.separador', e.target.value)}
                />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Subtítulo Section */}
        <div className="space-y-4">
          <SectionHeader title="Subtítulo" section="subtitulo" icon={Type} />
          
          <motion.div
            initial={false}
            animate={{ height: expandedSections.subtitulo ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Texto do Subtítulo (HTML permitido)
                </label>
                <textarea
                  placeholder="A única assessoria com selo Oficial que..."
                  value={headlineData.subtitulo}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('subtitulo', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Use tags HTML como &lt;strong&gt; para destaque
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Botão Section */}
        <div className="space-y-4">
          <SectionHeader title="Botão de Ação" section="botao" icon={Zap} />
          
          <motion.div
            initial={false}
            animate={{ height: expandedSections.botao ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Texto do Botão
                  </label>
                  <Input
                    type="text"
                    placeholder="QUERO VENDER AGORA"
                    value={headlineData.botao.texto}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('botao.texto', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Link
                  </label>
                  <Input
                    type="text"
                    placeholder="#planos"
                    value={headlineData.botao.link}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('botao.link', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <IconSelector
                    value={headlineData.botao.icone}
                    onChange={(value) => handleChange('botao.icone', value)}
                    label="Ícone do Botão"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Estilo do Botão
                  </label>
                  <Input
                    type="text"
                    placeholder="gradiente-amarelo"
                    value={headlineData.botao.estilo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('botao.estilo', e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Visibilidade
                    </label>
                    <p className="text-sm text-zinc-500">Mostrar ou esconder o botão</p>
                  </div>
                  <Switch
                    checked={headlineData.botao.visivel}
                    onCheckedChange={(checked: boolean) => handleChange('botao.visivel', checked)}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Agenda Section */}
        <div className="space-y-4">
          <SectionHeader title="Agenda" section="agenda" icon={Eye} />
          
          <motion.div
            initial={false}
            animate={{ height: expandedSections.agenda ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Status
                  </label>
                  <select
                    value={headlineData.agenda.status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('agenda.status', e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="aberta">Aberta</option>
                    <option value="fechada">Fechada</option>
                    <option value="em-breve">Em breve</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Mês
                  </label>
                  <Input
                    type="text"
                    placeholder="Janeiro"
                    value={headlineData.agenda.mes}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('agenda.mes', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Cor do Status (Hexadecimal)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="#22C55E"
                      value={headlineData.agenda.corStatus}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('agenda.corStatus', e.target.value)}
                      className="font-mono"
                    />
                    <ColorPicker
                      color={headlineData.agenda.corStatus}
                      onChange={(color: string) => handleColorChange('agenda.corStatus', color)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Texto da Agenda
                  </label>
                  <Input
                    type="text"
                    placeholder="Agenda de Janeiro aberta"
                    value={headlineData.agenda.texto}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('agenda.texto', e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Visibilidade
                    </label>
                    <p className="text-sm text-zinc-500">Mostrar ou esconder a agenda</p>
                  </div>
                  <Switch
                    checked={headlineData.agenda.visivel}
                    onCheckedChange={(checked: boolean) => handleChange('agenda.visivel', checked)}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Configurações Section */}
        <div className="space-y-4">
          <SectionHeader title="Configurações" section="configuracoes" icon={Palette} />
          
          <motion.div
            initial={false}
            animate={{ height: expandedSections.configuracoes ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Intervalo da Animação (ms)
                  </label>
                  <Input
                    type="number"
                    min="500"
                    step="100"
                    value={headlineData.configuracoes.intervaloAnimacao.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        handleChange('configuracoes.intervaloAnimacao', value);
                      }
                    }}
                  />
                  <p className="text-xs text-zinc-500 mt-1">Tempo entre animações das palavras (em milissegundos)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Cor de Fundo (Hexadecimal)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="#020202"
                      value={headlineData.configuracoes.corFundo}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('configuracoes.corFundo', e.target.value)}
                      className="font-mono"
                    />
                    <ColorPicker
                      color={headlineData.configuracoes.corFundo}
                      onChange={(color: string) => handleColorChange('configuracoes.corFundo', color)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Cor de Destaque (Hexadecimal)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="#FFCC00"
                      value={headlineData.configuracoes.corDestaque}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('configuracoes.corDestaque', e.target.value)}
                      className="font-mono"
                    />
                    <ColorPicker
                      color={headlineData.configuracoes.corDestaque}
                      onChange={(color: string) => handleChange('configuracoes.corDestaque', color)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Efeitos Visuais
                  </label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm text-zinc-700 dark:text-zinc-300">Brilho no Título</label>
                        <p className="text-xs text-zinc-500">Drop shadow no texto principal</p>
                      </div>
                      <Switch
                        checked={headlineData.configuracoes.efeitos.brilhoTitulo !== ''}
                        onCheckedChange={(checked: boolean) => 
                          handleChange('configuracoes.efeitos.brilhoTitulo', 
                            checked ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]" : ""
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm text-zinc-700 dark:text-zinc-300">Spotlight</label>
                        <p className="text-xs text-zinc-500">Efeito de foco no conteúdo</p>
                      </div>
                      <Switch
                        checked={headlineData.configuracoes.efeitos.spotlight}
                        onCheckedChange={(checked: boolean) => handleChange('configuracoes.efeitos.spotlight', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm text-zinc-700 dark:text-zinc-300">Grid Background</label>
                        <p className="text-xs text-zinc-500">Fundo com padrão de grid</p>
                      </div>
                      <Switch
                        checked={headlineData.configuracoes.efeitos.grid}
                        onCheckedChange={(checked: boolean) => handleChange('configuracoes.efeitos.grid', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm text-zinc-700 dark:text-zinc-300">Sombra Inferior</label>
                        <p className="text-xs text-zinc-500">Degradê na parte inferior</p>
                      </div>
                      <Switch
                        checked={headlineData.configuracoes.efeitos.sombraInferior}
                        onCheckedChange={(checked: boolean) => handleChange('configuracoes.efeitos.sombraInferior', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Fixed Action Bar */}
        <FixedActionBar
          onDeleteAll={openDeleteAllModal}
          onSubmit={handleSubmitWrapper}
          isAddDisabled={!canAddNewItem || isLimitReached}
          isSaving={loading}
          exists={exists}
          completeCount={completeCount}
          totalCount={stepList.length}
          itemName="Headline"
          icon={Layers}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Headline"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}