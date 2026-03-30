"use client";

import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { TextStyle } from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import { Node, mergeAttributes } from '@tiptap/core';
import Blockquote from '@tiptap/extension-blockquote';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Code from '@tiptap/extension-code';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import ImageUploadDialog from '@/components/ImageUploadDialog';
import VideoUploadDialog from '@/components/VideoUploadDialog';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Quote as QuoteIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Type as TypeIcon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Palette as PaletteIcon,
  AlignLeft as AlignLeftIcon,
  AlignCenter as AlignCenterIcon,
  AlignRight as AlignRightIcon,
  Settings as SettingsIcon,
  Code as CodeIcon,
  X
} from 'lucide-react';

// Extensão personalizada para Video Node
const VideoNode = Node.create({
  name: 'video',
  
  group: 'block',
  
  atom: true,
  
  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
      width: {
        default: '300px',
      },
      height: {
        default: '200px',
      },
      style: {
        default: null,
      },
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes)]
  },
});

// Extensão personalizada para FontSize e Color
const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
          color: {
            default: null,
            parseHTML: element => element.style.color.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.color) {
                return {}
              }

              return {
                style: `color: ${attributes.color}`,
              }
            },
          },
        },
      },
    ]
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Comece a escrever sua história épica aqui...",
  className = ""
}: RichTextEditorProps) {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isYoutubeDialogOpen, setIsYoutubeDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [currentSize, setCurrentSize] = useState('base');
  const [customSize, setCustomSize] = useState('16');
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const [selectedMedia, setSelectedMedia] = useState<{type: 'image' | 'img' | 'video', element: HTMLElement} | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      VideoNode,
      TextStyle,
      FontSize,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Bold,
      Italic,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[var(--color-primary)] underline',
        },
      }),
      Code.configure({
        HTMLAttributes: {
          class: 'bg-zinc-800 text-zinc-100 px-2 py-1 rounded text-sm font-mono',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-[var(--color-primary)] pl-4 italic text-zinc-300',
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc list-inside space-y-1',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal list-inside space-y-1',
        },
      }),
      ListItem,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-lg cursor-move',
          draggable: 'true',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 480,
        HTMLAttributes: {
          class: 'aspect-video rounded-lg shadow-lg cursor-move',
          draggable: 'true',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `max-w-none focus:outline-none min-h-[500px] p-6 bg-zinc-950 border border-white/10 rounded-xl text-base leading-relaxed text-zinc-100 placeholder:text-zinc-600 resize-y custom-scrollbar shadow-inner ${className}`,
      },
    },
  });

  // Adicionar CSS para spans com estilos
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        /* Spans com estilos */
        .ProseMirror span[style] {
          display: inline !important;
        }
        
        /* Cursor pointer em mídia */
        .ProseMirror .image-wrapper,
        .ProseMirror .video-wrapper {
          cursor: pointer;
          position: relative;
        }
        
        .ProseMirror .image-wrapper:hover,
        .ProseMirror .video-wrapper:hover {
          opacity: 0.8;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  const addImage = useCallback((url: string) => {
    // Fechar menus ao inserir imagem
    setShowSizeMenu(false);
    setShowColorMenu(false);
    
    editor?.chain().focus().insertContent(`
      <div class="image-wrapper resizable" data-type="image" style="position: relative; display: inline-block; max-width: 100%;">
        <img src="${url}" style="display: block; max-width: 100%; height: auto;" class="rounded-lg" />
        <div class="resize-handle" style="position: absolute; width: 10px; height: 10px; background: var(--color-primary); cursor: nwse-resize; bottom: -5px; right: -5px; border-radius: 50%;"></div>
      </div>
    `).run();
  }, [editor]);

  const setLink = useCallback(() => {
    const { from, to } = editor?.state.selection || {};
    const selectedText = editor?.state.doc.textBetween(from || 0, to || 0);
    
    setLinkText(selectedText || '');
    setLinkUrl('');
    setIsLinkDialogOpen(true);
  }, [editor]);

  const insertLink = useCallback(() => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).insertContent(linkText || linkUrl).run();
      setLinkUrl('');
      setLinkText('');
      setIsLinkDialogOpen(false);
    }
  }, [editor, linkUrl, linkText]);

  const setTextSize = useCallback((size: string) => {
    let fontSize: string;
    
    if (size.startsWith('custom-')) {
      // É um valor personalizado em px
      const pxValue = size.replace('custom-', '');
      fontSize = `${pxValue}px`;
    } else {
      // É um tamanho pré-definido
      const sizes: Record<string, string> = {
        'xs': '12px',
        'sm': '14px', 
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '30px'
      };
      fontSize = sizes[size] || '16px';
    }
    
    // Verificar se há texto selecionado
    const { from, to } = editor?.state.selection || {};
    const selectedText = editor?.state.doc.textBetween(from || 0, to || 0);
    
    if (selectedText) {
      // Se há texto selecionado, aplicar tamanho diretamente
      editor?.chain().focus()
        .deleteSelection()
        .insertContent(`<span style="font-size: ${fontSize}">${selectedText}</span>`)
        .run();
    } else {
      // Se não há seleção, inserir span com tamanho para digitação
      editor?.chain().focus()
        .insertContent(`<span style="font-size: ${fontSize}"></span>`)
        .run();
    }
    
    setCurrentSize(size);
    setShowSizeMenu(false);
    // Fechar outros menus
    setShowColorMenu(false);
  }, [editor]);

  const setCustomTextSize = useCallback(() => {
    const sizeValue = customSize.trim();
    if (sizeValue && !isNaN(Number(sizeValue))) {
      setTextSize(`custom-${sizeValue}`);
    }
  }, [customSize, setTextSize]);

  // Funções para manipulação de mídia
  const setMediaAlignment = useCallback((alignment: 'left' | 'center' | 'right') => {
    if (!selectedMedia) {
      setShowMediaOptions(false);
      return;
    }
    
    // Encontrar o elemento no DOM usando uma abordagem segura
    const mediaElement = selectedMedia.element;
    const mediaSrc = (mediaElement as HTMLImageElement | HTMLVideoElement).src;
    const mediaType = selectedMedia.type;
    
    // Encontrar o elemento no DOM
    let targetElement: HTMLElement | null = null;
    
    // Verificar se é imagem (aceita 'image' ou 'img')
    const isImage = mediaType === 'image' || mediaType === 'img';
    const isVideo = mediaType === 'video';
    
    if (isImage) {
      targetElement = document.querySelector(`img[src="${mediaSrc}"]`) as HTMLElement;
    } else if (isVideo) {
      targetElement = document.querySelector(`video[src="${mediaSrc}"]`) as HTMLElement;
    }
    
    if (!targetElement) {
      // Tentar encontrar por classe ou atributos
      if (isImage) {
        const allImages = document.querySelectorAll('img');
        for (const img of allImages) {
          if ((img as HTMLImageElement).src === mediaSrc) {
            targetElement = img as HTMLElement;
            break;
          }
        }
      } else if (isVideo) {
        const allVideos = document.querySelectorAll('video');
        for (const video of allVideos) {
          if ((video as HTMLVideoElement).src === mediaSrc) {
            targetElement = video as HTMLElement;
            break;
          }
        }
      }
    }
    
    if (!targetElement) {
      setShowMediaOptions(false);
      return;
    }
    
    
    // Tentar encontrar wrapper
    const wrapper = targetElement.closest('.image-wrapper, .video-wrapper') as HTMLElement;
    if (wrapper) {
      // Aplicar estilos no wrapper
      wrapper.style.marginLeft = '';
      wrapper.style.marginRight = '';
      wrapper.style.display = '';
      wrapper.style.float = '';
      
      switch (alignment) {
        case 'left':
          wrapper.style.float = 'left';
          wrapper.style.marginRight = '1rem';
          wrapper.style.display = 'inline-block';
          break;
        case 'center':
          wrapper.style.marginLeft = 'auto';
          wrapper.style.marginRight = 'auto';
          wrapper.style.display = 'block';
          wrapper.style.float = 'none';
          break;
        case 'right':
          wrapper.style.float = 'right';
          wrapper.style.marginLeft = '1rem';
          wrapper.style.display = 'inline-block';
          break;
      }
    } else {
      // Aplicar estilos diretamente na imagem
      targetElement.style.marginLeft = '';
      targetElement.style.marginRight = '';
      targetElement.style.display = '';
      targetElement.style.float = '';
      
      switch (alignment) {
        case 'left':
          targetElement.style.float = 'left';
          targetElement.style.marginRight = '1rem';
          targetElement.style.display = 'inline-block';
          break;
        case 'center':
          targetElement.style.marginLeft = 'auto';
          targetElement.style.marginRight = 'auto';
          targetElement.style.display = 'block';
          targetElement.style.float = 'none';
          break;
        case 'right':
          targetElement.style.float = 'right';
          targetElement.style.marginLeft = '1rem';
          targetElement.style.display = 'inline-block';
          break;
      }
    }
    
    setShowMediaOptions(false); // Fechar menu após aplicar
  }, [selectedMedia]);

  const setMediaDimensions = useCallback((width: string, height: string) => {
    if (!selectedMedia) {
      setShowMediaOptions(false); // Fechar menu mesmo se não houver seleção
      return;
    }
    
    // Encontrar o elemento no DOM usando querySelector
    const mediaSrc = (selectedMedia.element as HTMLImageElement | HTMLVideoElement).src;
    const mediaType = selectedMedia.type;
    
    let targetElement: HTMLElement | null = null;
    
    // Verificar se é imagem (aceita 'image' ou 'img')
    const isImage = mediaType === 'image' || mediaType === 'img';
    const isVideo = mediaType === 'video';
    
    if (isImage) {
      targetElement = document.querySelector(`img[src="${mediaSrc}"]`) as HTMLElement;
    } else if (isVideo) {
      targetElement = document.querySelector(`video[src="${mediaSrc}"]`) as HTMLElement;
    }
    
    if (!targetElement) {
      setShowMediaOptions(false);
      return;
    }
    
    // Tentar encontrar wrapper
    const wrapper = targetElement.closest('.image-wrapper, .video-wrapper') as HTMLElement;
    if (!wrapper) {
      // Se não tiver wrapper, aplicar diretamente no elemento
      if (width) {
        targetElement.style.width = width;
      }
      if (height) {
        targetElement.style.height = height;
      }
      setShowMediaOptions(false); // Fechar menu após aplicar
      return;
    }
    
    // Aplicar dimensões ao wrapper
    if (width) {
      wrapper.style.width = width;
    }
    if (height) {
      wrapper.style.height = height;
    }
    
    // Manter o elemento de mídia preenchendo o wrapper
    const mediaElement = wrapper.querySelector('img, video') as HTMLImageElement | HTMLVideoElement;
    if (mediaElement) {
      mediaElement.style.width = '100%';
      mediaElement.style.height = '100%';
    }
    
    setShowMediaOptions(false); // Fechar menu após aplicar
  }, [selectedMedia]);

  const detectMediaSelection = useCallback(() => {
    // Verificar se há alguma imagem ou vídeo selecionada no editor
    const selection = editor?.state.selection;
    if (!selection) return null;
    
    const { from, to } = selection;
    
    // Procurar por nós de imagem ou vídeo na seleção
    let foundMedia = null;
    
    editor?.state.doc.content.descendants((node, pos) => {
      if (pos >= from && pos <= to) {
        if (node.type.name === 'image' || node.type.name === 'video') {
          const type = node.type.name as 'image' | 'video';
          const src = node.attrs.src;
          
          // Encontrar o elemento DOM correspondente
          const element = document.querySelector(`${type === 'image' ? 'img' : 'video'}[src="${src}"]`) as HTMLElement;
          
          if (element) {
            foundMedia = { type, element };
            return false; // Parar busca
          }
        }
      }
    });
    
    return foundMedia;
  }, [editor]);

  const setTextColor = useCallback((color: string) => {
    // Verificar se há texto selecionado
    const { from, to } = editor?.state.selection || {};
    const selectedText = editor?.state.doc.textBetween(from || 0, to || 0);
    
    if (selectedText) {
      // Se há texto selecionado, aplicar cor diretamente
      const html = `<span style="color: ${color} !important; font-size: unset !important;">${selectedText}</span>`;
      
      editor?.chain().focus()
        .deleteSelection()
        .insertContent(html)
        .run();
    } else {
      // Se não há seleção, inserir span com cor para digitação
      const html = `<span style="color: ${color} !important; font-size: unset !important;"></span>`;
      
      editor?.chain().focus()
        .insertContent(html)
        .run();
    }
    
    setCurrentColor(color);
    setShowColorMenu(false);
    setShowSizeMenu(false); // Fechar outros menus
  }, [editor]);

  // Sistema de clique em mídia
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleMediaClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        
        // Verificar se clicou em imagem ou vídeo
        if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
          const type = target.tagName.toLowerCase() as 'img' | 'video';
          
          // Se já havia uma mídia selecionada e é diferente, fecha e reabre
          if (selectedMedia && selectedMedia.element !== target) {
            setShowMediaOptions(false);
            
            // Pequeno delay para fechar e reabrir
            setTimeout(() => {
              setSelectedMedia({ type, element: target });
              setShowMediaOptions(true);
            }, 100);
          } else {
            // Mesma mídia ou primeira seleção
            setSelectedMedia({ type, element: target });
            setShowMediaOptions(true);
          }
          
          // Impedir comportamento padrão
          e.preventDefault();
          e.stopPropagation();
        }
      };
      
      // Adicionar event listener para clique em mídia
      document.addEventListener('click', handleMediaClick);
      
      return () => {
        document.removeEventListener('click', handleMediaClick);
      };
    }
  }, [selectedMedia]);

  // Adicionar script de redimensionamento
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleMouseDown = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('resize-handle')) {
          e.preventDefault();
          const wrapper = target.parentElement as HTMLElement;
          const startX = e.clientX;
          const startY = e.clientY;
          const startWidth = wrapper.offsetWidth;
          const startHeight = wrapper.offsetHeight;

          const handleMouseMove = (e: MouseEvent) => {
            const newWidth = startWidth + (e.clientX - startX);
            const newHeight = startHeight + (e.clientY - startY);
            
            if (newWidth > 50) wrapper.style.width = `${newWidth}px`;
            if (newHeight > 50) wrapper.style.height = `${newHeight}px`;
          };

          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }
      };

      document.addEventListener('mousedown', handleMouseDown);
      return () => document.removeEventListener('mousedown', handleMouseDown);
    }
  }, []);

  return (
    <div className="relative">
      {/* Menu Bar */}
      <div className="border-b border-white/10 p-3 flex flex-wrap gap-1 bg-zinc-900 rounded-t-xl">
        {/* Formatação Básica */}
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${
            editor?.isActive('bold') ? 'bg-zinc-800 text-[var(--color-primary)]' : 'text-zinc-400'
          }`}
          title="Negrito"
        >
          <BoldIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${
            editor?.isActive('italic') ? 'bg-zinc-800 text-[var(--color-primary)]' : 'text-zinc-400'
          }`}
          title="Itálico"
        >
          <ItalicIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${
            editor?.isActive('underline') ? 'bg-zinc-800 text-[var(--color-primary)]' : 'text-zinc-400'
          }`}
          title="Sublinhado"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        {/* Separador */}
        <div className="w-px h-6 bg-zinc-700 mx-1" />

        {/* Títulos */}
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${
            editor?.isActive('heading', { level: 1 }) ? 'bg-zinc-800 text-[var(--color-primary)]' : 'text-zinc-400'
          }`}
          title="Título 1"
        >
          <TypeIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${
            editor?.isActive('heading', { level: 2 }) ? 'bg-zinc-800 text-[var(--color-primary)]' : 'text-zinc-400'
          }`}
          title="Título 2"
        >
          <TypeIcon className="w-4 h-3" />
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${
            editor?.isActive('heading', { level: 3 }) ? 'bg-zinc-800 text-[var(--color-primary)]' : 'text-zinc-400'
          }`}
          title="Título 3"
        >
          <TypeIcon className="w-4 h-2" />
        </button>

        {/* Separador */}
        <div className="w-px h-6 bg-zinc-700 mx-1" />

        {/* Listas */}
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${
            editor?.isActive('bulletList') ? 'bg-zinc-800 text-[var(--color-primary)]' : 'text-zinc-400'
          }`}
          title="Lista com marcadores"
        >
          <ListIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${
            editor?.isActive('orderedList') ? 'bg-zinc-800 text-[var(--color-primary)]' : 'text-zinc-400'
          }`}
          title="Lista numerada"
        >
          <ListOrderedIcon className="w-4 h-4" />
        </button>

        {/* Separador */}
        <div className="w-px h-6 bg-zinc-700 mx-1" />

        {/* Citação e Código */}
        <button
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${
            editor?.isActive('blockquote') ? 'bg-zinc-800 text-[var(--color-primary)]' : 'text-zinc-400'
          }`}
          title="Citação"
        >
          <QuoteIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor?.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${
            editor?.isActive('code') ? 'bg-zinc-800 text-[var(--color-primary)]' : 'text-zinc-400'
          }`}
          title="Código"
        >
          <CodeIcon className="w-4 h-4" />
        </button>

        {/* Separador */}
        <div className="w-px h-6 bg-zinc-700 mx-1" />

        {/* Link */}
        <button
          onClick={setLink}
          className="p-2 rounded hover:bg-zinc-800 transition-colors text-zinc-400"
          title="Inserir link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        {/* Separador */}
        <div className="w-px h-6 bg-zinc-700 mx-1" />

        {/* Separador */}
        <div className="w-px h-6 bg-white/10 mx-1"></div>

        {/* Tamanho do Texto */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSizeMenu(!showSizeMenu);
              setShowColorMenu(false); // Fechar menu de cor
              setShowMediaOptions(false); // Fechar menu de configurações
            }}
            className="p-2 rounded hover:bg-zinc-800 transition-colors text-zinc-400 flex items-center gap-1"
            title="Tamanho do texto"
          >
            <TypeIcon className="w-4 h-4" />
            <span className="text-xs">Aa</span>
          </button>
          
          {showSizeMenu && (
            <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-white/10 rounded-lg shadow-lg z-50 p-3 min-w-[160px]">
              <div className="space-y-2">
                {/* Tamanhos pré-definidos */}
                <div className="space-y-1">
                  {['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'].map(size => (
                    <button
                      key={size}
                      onClick={() => setTextSize(size)}
                      className={`block w-full text-left px-2 py-1 rounded text-sm hover:bg-zinc-700 ${
                        currentSize === size ? 'bg-zinc-700 text-[var(--color-primary)]' : 'text-zinc-300'
                      }`}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
                
                {/* Separador */}
                <div className="border-t border-zinc-700 pt-2"></div>
                
                {/* Input personalizado */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-medium">Personalizado (px):</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={customSize}
                      onChange={(e) => setCustomSize(e.target.value)}
                      className="flex-1 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-sm text-zinc-100 focus:outline-none focus:border-[var(--color-primary)]"
                      placeholder="16"
                      min="8"
                      max="200"
                    />
                    <button
                      onClick={setCustomTextSize}
                      className="px-3 py-1 bg-[var(--color-primary)] text-white rounded text-sm hover:opacity-90 transition-opacity"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cor do Texto */}
        <div className="relative">
          <button
            onClick={() => {
              setShowColorMenu(!showColorMenu);
              setShowSizeMenu(false); // Fechar menu de tamanho
              setShowMediaOptions(false); // Fechar menu de configurações
            }}
            className="p-2 rounded hover:bg-zinc-800 transition-colors text-zinc-400"
            title="Cor do texto"
          >
            <PaletteIcon className="w-4 h-4" />
          </button>
          
          {showColorMenu && (
            <div className="absolute top-full left-0 mt-1 bg-zinc-800 border border-white/10 rounded-lg shadow-lg z-50 p-4 min-w-[200px]">
              <div className="space-y-3">
                {/* Cores básicas */}
                <div>
                  <label className="text-xs text-zinc-400 font-medium mb-2 block">Cores Básicas</label>
                  <div className="grid grid-cols-6 gap-2">
                    {['#ffffff', '#000000', '#6b7280', '#ef4444', '#f97316', '#eab308'].map(color => (
                      <button
                        key={color}
                        onClick={() => setTextColor(color)}
                        className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                          currentColor === color ? 'border-white shadow-lg' : 'border-zinc-600'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Cores vibrantes */}
                <div>
                  <label className="text-xs text-zinc-400 font-medium mb-2 block">Cores Vibrantes</label>
                  <div className="grid grid-cols-6 gap-2">
                    {['#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'].map(color => (
                      <button
                        key={color}
                        onClick={() => setTextColor(color)}
                        className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                          currentColor === color ? 'border-white shadow-lg' : 'border-zinc-600'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Cor personalizada */}
                <div className="pt-2 border-t border-zinc-700">
                  <label className="text-xs text-zinc-400 font-medium mb-2 block">Cor Personalizada</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-8 rounded border border-zinc-600 cursor-pointer bg-zinc-700"
                    />
                    <input
                      type="text"
                      value={currentColor}
                      onChange={(e) => {
                        const color = e.target.value;
                        if (/^#[0-9A-F]{6}$/i.test(color)) {
                          setTextColor(color);
                        }
                      }}
                      className="flex-1 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-sm text-zinc-100 focus:outline-none focus:border-[var(--color-primary)]"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Separador */}
        <div className="w-px h-6 bg-white/10 mx-1"></div>

        {/* Mídia */}
        <button
          onClick={() => {
            setIsImageDialogOpen(true);
            setShowSizeMenu(false); // Fechar menus
            setShowColorMenu(false);
            setShowMediaOptions(false); // Fechar menu de configurações
          }}
          className="p-2 rounded hover:bg-zinc-800 transition-colors text-zinc-400"
          title="Inserir imagem"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            setIsYoutubeDialogOpen(true);
            setShowSizeMenu(false); // Fechar menus
            setShowColorMenu(false);
            setShowMediaOptions(false); // Fechar menu de configurações
          }}
          className="p-2 rounded hover:bg-zinc-800 transition-colors text-zinc-400"
          title="Inserir vídeo"
        >
          <VideoIcon className="w-4 h-4" />
        </button>

        {/* Opções de Mídia */}
        <div className="relative">
          <button
            onClick={() => {
              if (selectedMedia) {
                // Se já há mídia selecionada, toggle do menu
                setShowMediaOptions(!showMediaOptions);
              } else {
                // Se não, tentar detectar mídia na seleção atual
                const media = detectMediaSelection();
                if (media) {
                  setSelectedMedia(media);
                  setShowMediaOptions(true);
                }
              }
              setShowSizeMenu(false);
              setShowColorMenu(false);
            }}
            className={`p-2 rounded transition-colors ${
              selectedMedia ? 'text-[var(--color-primary)]' : 'text-zinc-400 hover:bg-zinc-800'
            }`}
            title="Opções de mídia"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
          
          {showMediaOptions && selectedMedia && (
            <div className="absolute top-full right-0 mt-1 bg-zinc-800 border border-white/10 rounded-lg shadow-lg z-50 p-4 min-w-[250px]">
              <div className="space-y-4">
                {/* Alinhamento */}
                <div>
                  <label className="text-xs text-zinc-400 font-medium mb-2 block">Alinhamento</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setMediaAlignment('left')}
                      className="p-2 rounded hover:bg-zinc-700 transition-colors text-zinc-300 flex flex-col items-center"
                      title="Alinhar à esquerda"
                    >
                      <AlignLeftIcon className="w-4 h-4 mb-1" />
                      <span className="text-xs">Esq</span>
                    </button>
                    <button
                      onClick={() => setMediaAlignment('center')}
                      className="p-2 rounded hover:bg-zinc-700 transition-colors text-zinc-300 flex flex-col items-center"
                      title="Centralizar"
                    >
                      <AlignCenterIcon className="w-4 h-4 mb-1" />
                      <span className="text-xs">Centro</span>
                    </button>
                    <button
                      onClick={() => setMediaAlignment('right')}
                      className="p-2 rounded hover:bg-zinc-700 transition-colors text-zinc-300 flex flex-col items-center"
                      title="Alinhar à direita"
                    >
                      <AlignRightIcon className="w-4 h-4 mb-1" />
                      <span className="text-xs">Dir</span>
                    </button>
                  </div>
                </div>
                
                {/* Dimensões */}
                <div>
                  <label className="text-xs text-zinc-400 font-medium mb-2 block">Dimensões</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Largura</label>
                      <input
                        type="text"
                        placeholder="300px"
                        className="w-full px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-sm text-zinc-100 focus:outline-none focus:border-[var(--color-primary)]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            setMediaDimensions(target.value, '');
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Altura</label>
                      <input
                        type="text"
                        placeholder="200px"
                        className="w-full px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-sm text-zinc-100 focus:outline-none focus:border-[var(--color-primary)]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            setMediaDimensions('', target.value);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    <button
                      onClick={() => setMediaDimensions('200px', '150px')}
                      className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded text-xs transition-colors"
                    >
                      Pequeno
                    </button>
                    <button
                      onClick={() => setMediaDimensions('400px', '300px')}
                      className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded text-xs transition-colors"
                    >
                      Médio
                    </button>
                    <button
                      onClick={() => setMediaDimensions('600px', '400px')}
                      className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded text-xs transition-colors"
                    >
                      Grande
                    </button>
                  </div>
                </div>
                
                {/* Tipo de mídia */}
                <div className="text-xs text-zinc-500">
                  {selectedMedia.type === 'img' ? '📷 Imagem selecionada' : '🎬 Vídeo selecionado'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        placeholder={placeholder}
      />

      {/* Dialog para inserir imagem */}
      <ImageUploadDialog
        isOpen={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        onInsert={addImage}
      />

      {/* Dialog para inserir link */}
      {isLinkDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-100">Inserir Link</h3>
              <button
                onClick={() => setIsLinkDialogOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-2">Texto do Link</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Texto exibido"
                  className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-2">URL do Link</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://exemplo.com"
                  className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsLinkDialogOpen(false)}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={insertLink}
                className="flex-1 px-4 py-2 bg-[var(--color-primary)] hover:opacity-90 text-white rounded-xl transition-colors"
              >
                Inserir Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog para inserir vídeo */}
      {isYoutubeDialogOpen && (
        <VideoUploadDialog
          isOpen={isYoutubeDialogOpen}
          onClose={() => setIsYoutubeDialogOpen(false)}
          onInsert={(url: string) => {
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
              const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
              const videoId = match ? match[1] : null;
              
              if (videoId) {
                editor?.chain().focus().setYoutubeVideo({ src: `https://www.youtube.com/embed/${videoId}` }).run();
              }
            } else {
              // Para vídeos diretos, usar VideoNode personalizado
              
              try {
                // Inserir usando o tipo video da extensão VideoNode
                editor?.chain().focus().insertContent({
                  type: 'video',
                  attrs: {
                    src: url,
                    controls: true,
                    width: '300px',
                    height: '200px',
                    style: 'display: block;'
                  }
                }).run();
              } catch {
                // Fallback para HTML direto
                const videoHtml = `<video src="${url}" controls style="width: 300px; height: 200px; display: block;"></video>`;
                editor?.chain().focus().insertContent(videoHtml).run();
              }
            }
            setIsYoutubeDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
