/* eslint-disable react-hooks/refs */
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { Icon } from '@iconify/react';

interface AdminIconSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  showHelperText?: boolean;
}

const iconCategories = [
  {
    name: "Material Design",
    icons: [
      { value: "mdi:check-decagram", label: "Verificado" },
      { value: "mdi:star", label: "Estrela" },
      { value: "mdi:shield-check", label: "Escudo" },
      { value: "mdi:rocket-launch", label: "Foguete" },
      { value: "mdi:chart-line", label: "Gráfico Linha" },
      { value: "mdi:account-group", label: "Grupo" },
      { value: "mdi:cash", label: "Dinheiro" },
      { value: "mdi:cart", label: "Carrinho" },
      { value: "mdi:cog", label: "Engrenagem" },
      { value: "mdi:view-dashboard", label: "Painel" },
    ]
  },
  {
    name: "Lucide",
    icons: [
      { value: "lucide:layout-dashboard", label: "Dashboard" },
      { value: "lucide:users", label: "Usuários" },
      { value: "lucide:settings", label: "Configurações" },
      { value: "lucide:network", label: "Filiais" },
      { value: "lucide:building", label: "Empresas" },
      { value: "lucide:layout-template", label: "Páginas/Template" },
      { value: "lucide:file-text", label: "Texto/Arquivo" },
      { value: "lucide:newspaper", label: "Notícias" },
      { value: "lucide:play-circle", label: "Play/Vídeo" },
      { value: "lucide:globe", label: "Globo/Web" },
      { value: "lucide:shopping-cart", label: "Carrinho" },
      { value: "lucide:package", label: "Pacote" },
      { value: "lucide:truck", label: "Caminhão" },
      { value: "lucide:award", label: "Prêmio" },
      { value: "lucide:thumbs-up", label: "Joinha" },
      { value: "lucide:help-circle", label: "Ajuda" },
      { value: "lucide:home", label: "Casa" },
      { value: "lucide:link", label: "Link" },
      { value: "lucide:external-link", label: "Link Externo" },
      { value: "lucide:zap", label: "Raio" },
      { value: "lucide:target", label: "Alvo" },
      { value: "lucide:bar-chart", label: "Gráfico" },
      { value: "lucide:arrow-right", label: "Seta Direita" },
      { value: "lucide:check-circle", label: "Círculo Verificado" },
      { value: "lucide:trending-up", label: "Crescendo" },
      { value: "lucide:dollar-sign", label: "Cifrão" },
      { value: "lucide:calendar", label: "Calendário" },
      { value: "lucide:clock", label: "Relógio" },
      { value: "lucide:phone", label: "Telefone" },
      { value: "lucide:mail", label: "Email" },
      { value: "lucide:message-square", label: "Mensagem" },
    ]
  },
  {
    name: "Heroicons",
    icons: [
      { value: "heroicons:chart-bar-solid", label: "Gráfico" },
      { value: "heroicons:user-group-solid", label: "Grupo" },
      { value: "heroicons:currency-dollar-solid", label: "Dólar" },
      { value: "heroicons:cog-solid", label: "Engrenagem" },
      { value: "heroicons:home-solid", label: "Casa" },
    ]
  }
];

export default function AdminIconSelector({ 
  value, 
  onChange, 
  placeholder = "Ex: lucide:home", 
  label,
  showHelperText = false 
}: AdminIconSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredIcons, setFilteredIcons] = useState<Array<{value: string, label: string}>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const closeDropdown = () => {
    setShowDropdown(false);
    setSearch('');
  };

  useEffect(() => {
    if (showDropdown) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showDropdown]);

  useEffect(() => {
    if (search.trim() === '') {
      const allIcons = iconCategories.flatMap(category => category.icons);
      setFilteredIcons(allIcons);
    } else {
      const searchLower = search.toLowerCase();
      const filtered: Array<{value: string, label: string}> = [];
      iconCategories.forEach(category => {
        category.icons.forEach(icon => {
          if (icon.label.toLowerCase().includes(searchLower) || icon.value.toLowerCase().includes(searchLower)) {
            filtered.push(icon);
          }
        });
      });
      setFilteredIcons(filtered);
    }
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) closeDropdown();
    };
    if (showDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleSelect = (iconValue: string) => {
    onChange(iconValue);
    closeDropdown();
  };

  const getPickerPosition = () => {
    if (!inputRef.current || !showDropdown) return { top: 0, left: 0, width: 0 };
    const inputRect = inputRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = inputRect.left;
    let top = inputRect.bottom + 4; // Bem coladinho no input
    const width = Math.max(inputRect.width, 280); // Um pouco mais compacto

    if (left + width > viewportWidth - 16) left = viewportWidth - width - 16;
    if (top + 300 > viewportHeight) top = inputRect.top - 310; 
    if (top < 16) top = 16;

    return { top: `${top}px`, left: `${left}px`, width: `${width}px` };
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* LABEL EXATAMENTE IGUAL AOS OUTROS CAMPOS */}
      {label && <label className="block text-[10px] uppercase font-bold text-zinc-500">{label}</label>}
      
      {/* INPUT COM MARGEM TOP 1 (mt-1) E PADDING (py-1) IGUAL AOS OUTROS */}
      <div className="relative mt-1">
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center pointer-events-none">
          {value ? (
            <Icon icon={value} className="w-3.5 h-3.5 text-white" />
          ) : (
            <Search className="w-3.5 h-3.5 text-zinc-500" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-7 pr-7 bg-black border border-zinc-800 rounded py-1 text-xs text-white outline-none focus:border-cyan-500 transition-colors cursor-text"
        />
        
        <button 
          type="button" 
          onClick={() => {
            if (showDropdown) {
              closeDropdown();
            } else if (value) {
              onChange(''); 
            } else {
              setShowDropdown(true);
            }
          }} 
          className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center justify-center p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-colors"
        >
          {showDropdown ? <X size={12} /> : (value ? <X size={12} /> : <ChevronDown size={12} />)}
        </button>
      </div>

      {showDropdown && (
        <>
          <div className="fixed inset-0 bg-transparent z-40" onClick={closeDropdown} />
          
          <div style={getPickerPosition()} className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[300px]">
            
            <div className="p-2 border-b border-zinc-800 bg-zinc-950 flex items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar..."
                  className="w-full pl-7 pr-2 py-1 border border-zinc-800 rounded bg-black text-[11px] text-white outline-none focus:border-cyan-500 transition-colors"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
              {search.trim() === '' ? (
                iconCategories.map((category) => (
                  <div key={category.name} className="mb-3">
                    <h3 className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 px-1.5 tracking-wider">{category.name}</h3>
                    <div className="grid grid-cols-6 gap-0.5 px-1">
                      {category.icons.map((icon) => (
                        <button
                          key={icon.value} type="button" onClick={() => handleSelect(icon.value)} title={icon.label}
                          className={`flex items-center justify-center p-1.5 rounded hover:bg-zinc-800 transition-colors ${value === icon.value ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-zinc-400 border border-transparent'}`}
                        >
                          <Icon icon={icon.value} className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-6 gap-0.5 p-1">
                  {filteredIcons.map((icon) => (
                    <button
                      key={icon.value} type="button" onClick={() => handleSelect(icon.value)} title={icon.label}
                      className={`flex items-center justify-center p-1.5 rounded hover:bg-zinc-800 transition-colors ${value === icon.value ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-400'}`}
                    >
                      <Icon icon={icon.value} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              )}
              {search.trim() !== '' && filteredIcons.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 opacity-50">
                  <Search className="w-6 h-6 text-zinc-500 mb-1" />
                  <p className="text-[10px] text-zinc-400">Sem resultados</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {showHelperText && (
        <div className="mt-1">
          <p className="text-[9px] text-zinc-500">Ex: lucide:home</p>
        </div>
      )}
    </div>
  );
}