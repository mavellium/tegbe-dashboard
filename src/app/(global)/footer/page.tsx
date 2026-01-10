/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { TextArea } from "@/components/TextArea";
import { ImageUpload } from "@/components/ImageUpload";
import { 
  Layout, 
  Settings, 
  Link as LinkIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Globe, 
  Instagram, 
  Linkedin, 
  Youtube, 
  FileText,
  Palette,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus
} from "lucide-react";
import { FeedbackMessages } from "@/components/Manage/FeedbackMessages";
import { FixedActionBar } from "@/components/Manage/FixedActionBar";
import { DeleteConfirmationModal } from "@/components/Manage/DeleteConfirmationModal";
import { SectionHeader } from "@/components/SectionHeader";
import { ThemePropertyInput } from "@/components/ThemePropertyInput";
import { extractHexFromTailwind, hexToTailwindClass } from "@/lib/colorUtils";
import Loading from "@/components/Loading";
import { useJsonManagement } from "@/hooks/useJsonManagement";
import { Button } from "@/components/Button";

// Tipos baseados no novo JSON
interface SocialLinks {
  instagram: string;
  linkedin: string;
  youtube: string;
}

interface NavigationItem {
  name: string;
  href: string;
}

interface StatsItem {
  val: string;
  label: string;
}

interface PageContent {
  badgeImage: string;
  badgeTitle: string;
  badgeDesc: string;
  stats1: StatsItem;
  stats2: StatsItem;
  columnTitle: string;
  links: string[];
  email: string;
  desc: string;
}

interface ThemeVariant {
  primary: string;
  hoverText: string;
  decoration: string;
  bgHover: string;
  borderHover: string;
  glowGradient: string;
  glowAmbient: string;
  iconBg: string;
  iconHoverText: string;
  iconHoverBg: string;
  topBorder: string;
}

type FooterData = {
  id?: string;
  general: {
    logo: string;
    poweredByLogo: string;
    cnpj: string;
    address: string;
    phone: string;
    whatsappLink: string;
    socials: SocialLinks;
  };
  navigation: NavigationItem[];
  content: {
    ecommerce: PageContent;
    marketing: PageContent;
    sobre: PageContent;
    cursos: PageContent;
  };
  variants: {
    ecommerce: ThemeVariant;
    marketing: ThemeVariant;
    sobre: ThemeVariant;
    cursos: ThemeVariant;
  };
};

const defaultFooterData: FooterData = {
  general: {
    logo: "",
    poweredByLogo: "",
    cnpj: "",
    address: "",
    phone: "",
    whatsappLink: "",
    socials: {
      instagram: "#",
      linkedin: "#",
      youtube: "#"
    }
  },
  navigation: [
    { name: "Home", href: "/" },
  ],
  content: {
    ecommerce: {
      badgeImage: "",
      badgeTitle: "",
      badgeDesc: "",
      stats1: { val: "", label: "" },
      stats2: { val: "", label: "" },
      columnTitle: "",
      links: ["Gestão Full Commerce", "Consultoria Oficial", "Ads & Performance", "Design & Branding"],
      email: "",
      desc: ""
    },
    marketing: {
      badgeImage: "",
      badgeTitle: "",
      badgeDesc: "",
      stats1: { val: "", label: "" },
      stats2: { val: "", label: "" },
      columnTitle: "",
      links: ["Gestão Full Commerce", "Consultoria Oficial", "Ads & Performance", "Design & Branding"],
      email: "",
      desc: ""
    },
    sobre: {
      badgeImage: "",
      badgeTitle: "",
      badgeDesc: "",
      stats1: { val: "", label: "" },
      stats2: { val: "", label: "" },
      columnTitle: "",
      links: ["Gestão Full Commerce", "Consultoria Oficial", "Ads & Performance", "Design & Branding"],
      email: "",
      desc: ""
    },
    cursos: {
      badgeImage: "",
      badgeTitle: "",
      badgeDesc: "",
      stats1: { val: "", label: "" },
      stats2: { val: "", label: "" },
      columnTitle: "",
      links: ["Gestão Full Commerce", "Consultoria Oficial", "Ads & Performance", "Design & Branding"],
      email: "",
      desc: ""
    }
  },
  variants: {
    ecommerce: {
      primary: "text-[#FFCC00]",
      hoverText: "hover:text-[#FFCC00]",
      decoration: "decoration-[#FFCC00]",
      bgHover: "hover:bg-[#FFCC00]",
      borderHover: "hover:border-[#FFCC00]/30",
      glowGradient: "from-[#FFCC00]/0 via-[#FFCC00]/5 to-[#FFCC00]/0",
      glowAmbient: "bg-[#FFCC00]/5",
      iconBg: "text-[#FFCC00]",
      iconHoverText: "group-hover:text-black",
      iconHoverBg: "group-hover:bg-[#FFCC00]",
      topBorder: "border-white/10"
    },
    marketing: {
      primary: "text-[#E31B63]",
      hoverText: "hover:text-[#E31B63]",
      decoration: "decoration-[#E31B63]",
      bgHover: "hover:bg-[#E31B63]",
      borderHover: "hover:border-[#E31B63]/30",
      glowGradient: "from-[#E31B63]/0 via-[#E31B63]/10 to-[#E31B63]/0",
      glowAmbient: "bg-[#E31B63]/10",
      iconBg: "text-[#E31B63]",
      iconHoverText: "group-hover:text-white",
      iconHoverBg: "group-hover:bg-[#E31B63]",
      topBorder: "border-rose-900/20"
    },
    sobre: {
      primary: "text-[#0071E3]",
      hoverText: "hover:text-[#0071E3]",
      decoration: "decoration-[#0071E3]",
      bgHover: "hover:bg-[#0071E3]",
      borderHover: "hover:border-[#0071E3]/30",
      glowGradient: "from-[#0071E3]/0 via-[#0071E3]/10 to-[#0071E3]/0",
      glowAmbient: "bg-[#0071E3]/10",
      iconBg: "text-[#0071E3]",
      iconHoverText: "group-hover:text-white",
      iconHoverBg: "group-hover:bg-[#0071E3]",
      topBorder: "border-blue-900/20"
    },
    cursos: {
      primary: "text-[#FFD700]",
      hoverText: "hover:text-[#FFD700]",
      decoration: "decoration-[#FFD700]",
      bgHover: "hover:bg-[#FFD700]",
      borderHover: "hover:border-[#FFD700]/30",
      glowGradient: "from-[#FFD700]/0 via-[#FFD700]/10 to-[#FFD700]/0",
      glowAmbient: "bg-[#FFD700]/5",
      iconBg: "text-[#FFD700]",
      iconHoverText: "group-hover:text-black",
      iconHoverBg: "group-hover:bg-[#FFD700]",
      topBorder: "border-[#FFD700]/20"
    }
  }
};

// Função para mesclar dados com padrão
const mergeWithDefaults = (apiData: any, defaultData: FooterData): FooterData => {
  if (!apiData) return defaultData;
  
  return {
    id: apiData.id,
    general: {
      logo: apiData.general?.logo || defaultData.general.logo,
      poweredByLogo: apiData.general?.poweredByLogo || defaultData.general.poweredByLogo,
      cnpj: apiData.general?.cnpj || defaultData.general.cnpj,
      address: apiData.general?.address || defaultData.general.address,
      phone: apiData.general?.phone || defaultData.general.phone,
      whatsappLink: apiData.general?.whatsappLink || defaultData.general.whatsappLink,
      socials: {
        instagram: apiData.general?.socials?.instagram || defaultData.general.socials.instagram,
        linkedin: apiData.general?.socials?.linkedin || defaultData.general.socials.linkedin,
        youtube: apiData.general?.socials?.youtube || defaultData.general.socials.youtube,
      }
    },
    navigation: apiData.navigation || defaultData.navigation,
    content: {
      ecommerce: {
        badgeImage: apiData.content?.ecommerce?.badgeImage || defaultData.content.ecommerce.badgeImage,
        badgeTitle: apiData.content?.ecommerce?.badgeTitle || defaultData.content.ecommerce.badgeTitle,
        badgeDesc: apiData.content?.ecommerce?.badgeDesc || defaultData.content.ecommerce.badgeDesc,
        stats1: {
          val: apiData.content?.ecommerce?.stats1?.val || defaultData.content.ecommerce.stats1.val,
          label: apiData.content?.ecommerce?.stats1?.label || defaultData.content.ecommerce.stats1.label,
        },
        stats2: {
          val: apiData.content?.ecommerce?.stats2?.val || defaultData.content.ecommerce.stats2.val,
          label: apiData.content?.ecommerce?.stats2?.label || defaultData.content.ecommerce.stats2.label,
        },
        columnTitle: apiData.content?.ecommerce?.columnTitle || defaultData.content.ecommerce.columnTitle,
        links: apiData.content?.ecommerce?.links || defaultData.content.ecommerce.links,
        email: apiData.content?.ecommerce?.email || defaultData.content.ecommerce.email,
        desc: apiData.content?.ecommerce?.desc || defaultData.content.ecommerce.desc,
      },
      marketing: {
        badgeImage: apiData.content?.marketing?.badgeImage || defaultData.content.marketing.badgeImage,
        badgeTitle: apiData.content?.marketing?.badgeTitle || defaultData.content.marketing.badgeTitle,
        badgeDesc: apiData.content?.marketing?.badgeDesc || defaultData.content.marketing.badgeDesc,
        stats1: {
          val: apiData.content?.marketing?.stats1?.val || defaultData.content.marketing.stats1.val,
          label: apiData.content?.marketing?.stats1?.label || defaultData.content.marketing.stats1.label,
        },
        stats2: {
          val: apiData.content?.marketing?.stats2?.val || defaultData.content.marketing.stats2.val,
          label: apiData.content?.marketing?.stats2?.label || defaultData.content.marketing.stats2.label,
        },
        columnTitle: apiData.content?.marketing?.columnTitle || defaultData.content.marketing.columnTitle,
        links: apiData.content?.marketing?.links || defaultData.content.marketing.links,
        email: apiData.content?.marketing?.email || defaultData.content.marketing.email,
        desc: apiData.content?.marketing?.desc || defaultData.content.marketing.desc,
      },
      sobre: {
        badgeImage: apiData.content?.sobre?.badgeImage || defaultData.content.sobre.badgeImage,
        badgeTitle: apiData.content?.sobre?.badgeTitle || defaultData.content.sobre.badgeTitle,
        badgeDesc: apiData.content?.sobre?.badgeDesc || defaultData.content.sobre.badgeDesc,
        stats1: {
          val: apiData.content?.sobre?.stats1?.val || defaultData.content.sobre.stats1.val,
          label: apiData.content?.sobre?.stats1?.label || defaultData.content.sobre.stats1.label,
        },
        stats2: {
          val: apiData.content?.sobre?.stats2?.val || defaultData.content.sobre.stats2.val,
          label: apiData.content?.sobre?.stats2?.label || defaultData.content.sobre.stats2.label,
        },
        columnTitle: apiData.content?.sobre?.columnTitle || defaultData.content.sobre.columnTitle,
        links: apiData.content?.sobre?.links || defaultData.content.sobre.links,
        email: apiData.content?.sobre?.email || defaultData.content.sobre.email,
        desc: apiData.content?.sobre?.desc || defaultData.content.sobre.desc,
      },
      cursos: {
        badgeImage: apiData.content?.cursos?.badgeImage || defaultData.content.cursos.badgeImage,
        badgeTitle: apiData.content?.cursos?.badgeTitle || defaultData.content.cursos.badgeTitle,
        badgeDesc: apiData.content?.cursos?.badgeDesc || defaultData.content.cursos.badgeDesc,
        stats1: {
          val: apiData.content?.cursos?.stats1?.val || defaultData.content.cursos.stats1.val,
          label: apiData.content?.cursos?.stats1?.label || defaultData.content.cursos.stats1.label,
        },
        stats2: {
          val: apiData.content?.cursos?.stats2?.val || defaultData.content.cursos.stats2.val,
          label: apiData.content?.cursos?.stats2?.label || defaultData.content.cursos.stats2.label,
        },
        columnTitle: apiData.content?.cursos?.columnTitle || defaultData.content.cursos.columnTitle,
        links: apiData.content?.cursos?.links || defaultData.content.cursos.links,
        email: apiData.content?.cursos?.email || defaultData.content.cursos.email,
        desc: apiData.content?.cursos?.desc || defaultData.content.cursos.desc,
      }
    },
    variants: {
      ecommerce: {
        primary: apiData.variants?.ecommerce?.primary || defaultData.variants.ecommerce.primary,
        hoverText: apiData.variants?.ecommerce?.hoverText || defaultData.variants.ecommerce.hoverText,
        decoration: apiData.variants?.ecommerce?.decoration || defaultData.variants.ecommerce.decoration,
        bgHover: apiData.variants?.ecommerce?.bgHover || defaultData.variants.ecommerce.bgHover,
        borderHover: apiData.variants?.ecommerce?.borderHover || defaultData.variants.ecommerce.borderHover,
        glowGradient: apiData.variants?.ecommerce?.glowGradient || defaultData.variants.ecommerce.glowGradient,
        glowAmbient: apiData.variants?.ecommerce?.glowAmbient || defaultData.variants.ecommerce.glowAmbient,
        iconBg: apiData.variants?.ecommerce?.iconBg || defaultData.variants.ecommerce.iconBg,
        iconHoverText: apiData.variants?.ecommerce?.iconHoverText || defaultData.variants.ecommerce.iconHoverText,
        iconHoverBg: apiData.variants?.ecommerce?.iconHoverBg || defaultData.variants.ecommerce.iconHoverBg,
        topBorder: apiData.variants?.ecommerce?.topBorder || defaultData.variants.ecommerce.topBorder,
      },
      marketing: {
        primary: apiData.variants?.marketing?.primary || defaultData.variants.marketing.primary,
        hoverText: apiData.variants?.marketing?.hoverText || defaultData.variants.marketing.hoverText,
        decoration: apiData.variants?.marketing?.decoration || defaultData.variants.marketing.decoration,
        bgHover: apiData.variants?.marketing?.bgHover || defaultData.variants.marketing.bgHover,
        borderHover: apiData.variants?.marketing?.borderHover || defaultData.variants.marketing.borderHover,
        glowGradient: apiData.variants?.marketing?.glowGradient || defaultData.variants.marketing.glowGradient,
        glowAmbient: apiData.variants?.marketing?.glowAmbient || defaultData.variants.marketing.glowAmbient,
        iconBg: apiData.variants?.marketing?.iconBg || defaultData.variants.marketing.iconBg,
        iconHoverText: apiData.variants?.marketing?.iconHoverText || defaultData.variants.marketing.iconHoverText,
        iconHoverBg: apiData.variants?.marketing?.iconHoverBg || defaultData.variants.marketing.iconHoverBg,
        topBorder: apiData.variants?.marketing?.topBorder || defaultData.variants.marketing.topBorder,
      },
      sobre: {
        primary: apiData.variants?.sobre?.primary || defaultData.variants.sobre.primary,
        hoverText: apiData.variants?.sobre?.hoverText || defaultData.variants.sobre.hoverText,
        decoration: apiData.variants?.sobre?.decoration || defaultData.variants.sobre.decoration,
        bgHover: apiData.variants?.sobre?.bgHover || defaultData.variants.sobre.bgHover,
        borderHover: apiData.variants?.sobre?.borderHover || defaultData.variants.sobre.borderHover,
        glowGradient: apiData.variants?.sobre?.glowGradient || defaultData.variants.sobre.glowGradient,
        glowAmbient: apiData.variants?.sobre?.glowAmbient || defaultData.variants.sobre.glowAmbient,
        iconBg: apiData.variants?.sobre?.iconBg || defaultData.variants.sobre.iconBg,
        iconHoverText: apiData.variants?.sobre?.iconHoverText || defaultData.variants.sobre.iconHoverText,
        iconHoverBg: apiData.variants?.sobre?.iconHoverBg || defaultData.variants.sobre.iconHoverBg,
        topBorder: apiData.variants?.sobre?.topBorder || defaultData.variants.sobre.topBorder,
      },
      cursos: {
        primary: apiData.variants?.cursos?.primary || defaultData.variants.cursos.primary,
        hoverText: apiData.variants?.cursos?.hoverText || defaultData.variants.cursos.hoverText,
        decoration: apiData.variants?.cursos?.decoration || defaultData.variants.cursos.decoration,
        bgHover: apiData.variants?.cursos?.bgHover || defaultData.variants.cursos.bgHover,
        borderHover: apiData.variants?.cursos?.borderHover || defaultData.variants.cursos.borderHover,
        glowGradient: apiData.variants?.cursos?.glowGradient || defaultData.variants.cursos.glowGradient,
        glowAmbient: apiData.variants?.cursos?.glowAmbient || defaultData.variants.cursos.glowAmbient,
        iconBg: apiData.variants?.cursos?.iconBg || defaultData.variants.cursos.iconBg,
        iconHoverText: apiData.variants?.cursos?.iconHoverText || defaultData.variants.cursos.iconHoverText,
        iconHoverBg: apiData.variants?.cursos?.iconHoverBg || defaultData.variants.cursos.iconHoverBg,
        topBorder: apiData.variants?.cursos?.topBorder || defaultData.variants.cursos.topBorder,
      }
    }
  };
};

const pageKeys = ['ecommerce', 'marketing', 'sobre', 'cursos'] as const;
type PageKey = typeof pageKeys[number];

export default function Page() {
  const {
    data: footerData,
    exists,
    loading,
    success,
    errorMsg,
    deleteModal,
    fileStates,
    updateNested,
    setFileState,
    save,
    openDeleteAllModal,
    closeDeleteModal,
    confirmDelete,
  } = useJsonManagement<FooterData>({
    apiPath: "/api/tegbe-institucional/json/footer",
    defaultData: defaultFooterData,
    mergeFunction: mergeWithDefaults,
  });

  // Estados locais para gerenciar listas
  const [localNavigation, setLocalNavigation] = useState<NavigationItem[]>([]);
  const [localContentLinks, setLocalContentLinks] = useState<string[]>([]);
  const [draggingNavItem, setDraggingNavItem] = useState<number | null>(null);
  const [draggingContentLink, setDraggingContentLink] = useState<number | null>(null);

  const [expandedSections, setExpandedSections] = useState({
    general: true,
    navigation: false,
    content: false,
    variants: false
  });

  // Referências para novos itens
  const newNavItemRef = useRef<HTMLDivElement>(null);
  const newContentLinkRef = useRef<HTMLDivElement>(null);

  // Controle de planos
  const currentPlanType = 'pro'; // Altere conforme sua lógica de planos
  const currentPlanLimit = currentPlanType === 'pro' ? 10 : 5;

  // Sincroniza os dados quando carregam do banco
  useEffect(() => {
    if (footerData.navigation) {
      setLocalNavigation(footerData.navigation);
    }
  }, [footerData.navigation]);

  useEffect(() => {
    if (footerData.content.ecommerce.links) {
      setLocalContentLinks(footerData.content.ecommerce.links);
    }
  }, [footerData.content.ecommerce.links]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Funções para navigation
  const handleAddNav = () => {
    if (localNavigation.length >= currentPlanLimit) {
      return false;
    }
    
    const newItem: NavigationItem = {
      name: '',
      href: ''
    };
    
    const updated = [...localNavigation, newItem];
    setLocalNavigation(updated);
    updateNested('navigation', updated);
    
    setTimeout(() => {
      newNavItemRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updateNav = (index: number, updates: Partial<NavigationItem>) => {
    const updated = [...localNavigation];
    if (index >= 0 && index < updated.length) {
      updated[index] = { ...updated[index], ...updates };
      setLocalNavigation(updated);
      updateNested('navigation', updated);
    }
  };

  const removeNav = (index: number) => {
    const updated = [...localNavigation];
    
    if (updated.length <= 1) {
      // Mantém pelo menos um item vazio
      const emptyItem: NavigationItem = {
        name: '',
        href: ''
      };
      setLocalNavigation([emptyItem]);
      updateNested('navigation', [emptyItem]);
    } else {
      updated.splice(index, 1);
      setLocalNavigation(updated);
      updateNested('navigation', updated);
    }
  };

  // Funções para content links
  const handleAddContentLink = () => {
    if (localContentLinks.length >= currentPlanLimit) {
      return false;
    }
    
    const updated = [...localContentLinks, ""];
    setLocalContentLinks(updated);
    
    // Replica automaticamente para todas as páginas
    pageKeys.forEach((page) => {
      updateNested(`content.${page}.links`, updated);
    });
    
    setTimeout(() => {
      newContentLinkRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }, 100);
    
    return true;
  };

  const updateContentLink = (index: number, value: string) => {
    const updated = [...localContentLinks];
    if (index >= 0 && index < updated.length) {
      updated[index] = value;
      setLocalContentLinks(updated);
      
      // Replica automaticamente para todas as páginas
      pageKeys.forEach((page) => {
        updateNested(`content.${page}.links`, updated);
      });
    }
  };

  const removeContentLink = (index: number) => {
    const updated = [...localContentLinks];
    
    if (updated.length <= 1) {
      // Mantém pelo menos um item vazio
      setLocalContentLinks([""]);
      pageKeys.forEach((page) => {
        updateNested(`content.${page}.links`, [""]);
      });
    } else {
      updated.splice(index, 1);
      setLocalContentLinks(updated);
      pageKeys.forEach((page) => {
        updateNested(`content.${page}.links`, updated);
      });
    }
  };

  // Funções de drag & drop para navigation
  const handleNavDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingNavItem(index);
  };

  const handleNavDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingNavItem === null || draggingNavItem === index) return;
    
    const updated = [...localNavigation];
    const draggedItem = updated[draggingNavItem];
    
    // Remove o item arrastado
    updated.splice(draggingNavItem, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingNavItem ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    setLocalNavigation(updated);
    updateNested('navigation', updated);
    setDraggingNavItem(index);
  };

  const handleNavDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingNavItem(null);
  };

  // Funções de drag & drop para content links
  const handleContentLinkDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.currentTarget.classList.add('dragging');
    setDraggingContentLink(index);
  };

  const handleContentLinkDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggingContentLink === null || draggingContentLink === index) return;
    
    const updated = [...localContentLinks];
    const draggedItem = updated[draggingContentLink];
    
    // Remove o item arrastado
    updated.splice(draggingContentLink, 1);
    
    // Insere na nova posição
    const newIndex = index > draggingContentLink ? index : index;
    updated.splice(newIndex, 0, draggedItem);
    
    setLocalContentLinks(updated);
    
    // Replica automaticamente para todas as páginas
    pageKeys.forEach((page) => {
      updateNested(`content.${page}.links`, updated);
    });
    
    setDraggingContentLink(index);
  };

  const handleContentLinkDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
    setDraggingContentLink(null);
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

  // Funções para replicar conteúdo automaticamente para todas as páginas
  const updateContentForAllPages = (path: string, value: any) => {
    pageKeys.forEach((page) => {
      updateNested(`content.${page}.${path}`, value);
    });
  };

  const updateVariantForAllPages = (property: keyof ThemeVariant, hexColor: string) => {
    const tailwindClass = hexToTailwindClass(property as any, hexColor);
    pageKeys.forEach((page) => {
      updateNested(`variants.${page}.${property}`, tailwindClass);
    });
  };

  // Configuração de upload de imagens (aplica automaticamente a todas as páginas)
  const handleBadgeImageUpload = (file: File | null) => {
    // Aplica automaticamente a todas as páginas
    pageKeys.forEach((page) => {
      setFileState(`content.${page}.badgeImage`, file);
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      await save();
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };

  // Validações
  const isNavValid = (item: NavigationItem): boolean => {
    return item.name.trim() !== '' && item.href.trim() !== '';
  };

  const isContentLinkValid = (link: string): boolean => {
    return link.trim() !== '';
  };

  const isNavLimitReached = localNavigation.length >= currentPlanLimit;
  const canAddNewNav = !isNavLimitReached;
  const navCompleteCount = localNavigation.filter(isNavValid).length;
  const navTotalCount = localNavigation.length;

  const isContentLinksLimitReached = localContentLinks.length >= currentPlanLimit;
  const canAddNewContentLink = !isContentLinksLimitReached;
  const contentLinksCompleteCount = localContentLinks.filter(isContentLinkValid).length;
  const contentLinksTotalCount = localContentLinks.length;

  const navValidationError = isNavLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const contentLinksValidationError = isContentLinksLimitReached 
    ? `Você chegou ao limite do plano ${currentPlanType} (${currentPlanLimit} itens).`
    : null;

  const calculateCompletion = () => {
    let completed = 0;
    let total = 0;

    // Geral (7 campos + 3 redes sociais = 10)
    total += 10;
    if (footerData.general.logo.trim()) completed++;
    if (footerData.general.poweredByLogo.trim()) completed++;
    if (footerData.general.cnpj.trim()) completed++;
    if (footerData.general.address.trim()) completed++;
    if (footerData.general.phone.trim()) completed++;
    if (footerData.general.whatsappLink.trim()) completed++;
    if (footerData.general.socials.instagram.trim()) completed++;
    if (footerData.general.socials.linkedin.trim()) completed++;
    if (footerData.general.socials.youtube.trim()) completed++;

    // Navigation (2 campos cada)
    total += localNavigation.length * 2;
    localNavigation.forEach(nav => {
      if (nav.name.trim()) completed++;
      if (nav.href.trim()) completed++;
    });

    // Content (11 campos por página * 4 páginas = 44)
    // badgeImage, badgeTitle, badgeDesc, stats1.val, stats1.label, stats2.val, stats2.label, columnTitle, email, desc + links array
    total += 44;
    pageKeys.forEach(page => {
      const content = footerData.content[page];
      if (content.badgeImage.trim()) completed++;
      if (content.badgeTitle.trim()) completed++;
      if (content.badgeDesc.trim()) completed++;
      if (content.stats1.val.trim()) completed++;
      if (content.stats1.label.trim()) completed++;
      if (content.stats2.val.trim()) completed++;
      if (content.stats2.label.trim()) completed++;
      if (content.columnTitle.trim()) completed++;
      if (content.email.trim()) completed++;
      if (content.desc.trim()) completed++;
    });

    // Variants (11 propriedades * 4 páginas = 44)
    total += 44;
    const variantProperties: (keyof ThemeVariant)[] = [
      'primary', 'hoverText', 'decoration', 'bgHover', 'borderHover', 
      'glowGradient', 'glowAmbient', 'iconBg', 'iconHoverText', 'iconHoverBg', 'topBorder'
    ];
    
    pageKeys.forEach(page => {
      const variant = footerData.variants[page];
      variantProperties.forEach(prop => {
        if (variant[prop]?.trim()) completed++;
      });
    });

    return { completed, total };
  };

  const completion = calculateCompletion();

  if (loading && !exists) {
    return <Loading layout={Layout} exists={!!exists} />;
  }

  return (
    <ManageLayout
      headerIcon={Layout}
      title="Personalização do Footer"
      description="Configure o footer do site incluindo informações gerais, navegação e conteúdo. Todas as configurações serão aplicadas automaticamente a todas as páginas (E-commerce, Marketing, Sobre, Cursos)."
      exists={!!exists}
      itemName="Footer"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-32">
        {/* Seção Geral */}
        <div className="space-y-4">
          <SectionHeader
            title="Configurações Gerais"
            section="general"
            icon={Settings}
            isExpanded={expandedSections.general}
            onToggle={() => toggleSection("general")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.general ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Logos
                    </h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {[
                          footerData.general.logo.trim() !== '',
                          footerData.general.poweredByLogo.trim() !== ''
                        ].filter(Boolean).length} de 2 logos preenchidos
                      </span>
                    </div>
                  </div>
                  
                  <ImageUpload
                    label="Logo do Footer"
                    description="Logo principal no rodapé"
                    currentImage={footerData.general.logo}
                    selectedFile={fileStates['general.logo'] || null}
                    onFileChange={(file) => setFileState('general.logo', file)}
                    aspectRatio="aspect-[4/1]"
                    previewWidth={200}
                    previewHeight={200}
                  />

                  <ImageUpload
                    label="Logo Powered By"
                    description="Logo da empresa parceira (ex: Mavellium)"
                    currentImage={footerData.general.poweredByLogo}
                    selectedFile={fileStates['general.poweredByLogo'] || null}
                    onFileChange={(file) => setFileState('general.poweredByLogo', file)}
                    aspectRatio="aspect-[3/1]"
                    previewWidth={200}
                    previewHeight={200}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Dados da Empresa
                  </h3>
                  
                  <Input
                    label="CNPJ"
                    value={footerData.general.cnpj}
                    onChange={(e) => updateNested('general.cnpj', e.target.value)}
                    placeholder="Ex: 48.802.866/0001-42"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <TextArea
                    label="Endereço"
                    value={footerData.general.address}
                    onChange={(e) => updateNested('general.address', e.target.value)}
                    placeholder="Ex: R. Santos Dumont, 133\nGarça - SP\nOperação Global"
                    rows={3}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Telefone"
                    value={footerData.general.phone}
                    onChange={(e) => updateNested('general.phone', e.target.value)}
                    placeholder="Ex: (14) 99177-9502"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <Input
                    label="Link do WhatsApp"
                    value={footerData.general.whatsappLink}
                    onChange={(e) => updateNested('general.whatsappLink', e.target.value)}
                    placeholder="Ex: https://api.whatsapp.com/send?phone=5514991779502"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Redes Sociais
                    </h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {[
                          footerData.general.socials.instagram.trim() !== '',
                          footerData.general.socials.linkedin.trim() !== '',
                          footerData.general.socials.youtube.trim() !== ''
                        ].filter(Boolean).length} de 3 preenchidas
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        Instagram
                      </label>
                      <Input
                        value={footerData.general.socials.instagram}
                        onChange={(e) => updateNested('general.socials.instagram', e.target.value)}
                        placeholder="https://instagram.com/..."
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-blue-700" />
                        LinkedIn
                      </label>
                      <Input
                        value={footerData.general.socials.linkedin}
                        onChange={(e) => updateNested('general.socials.linkedin', e.target.value)}
                        placeholder="https://linkedin.com/..."
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)] flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-600" />
                        YouTube
                      </label>
                      <Input
                        value={footerData.general.socials.youtube}
                        onChange={(e) => updateNested('general.socials.youtube', e.target.value)}
                        placeholder="https://youtube.com/..."
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Navegação */}
        <div className="space-y-4">
          <SectionHeader
            title="Links de Navegação"
            section="navigation"
            icon={LinkIcon}
            isExpanded={expandedSections.navigation}
            onToggle={() => toggleSection("navigation")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.navigation ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                        Menu de Navegação do Footer
                      </h4>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          {navCompleteCount} de {navTotalCount} completos
                        </span>
                        <span className="text-sm text-[var(--color-secondary)]/50">•</span>
                        <span className="text-sm text-[var(--color-secondary)]/70">
                          Limite: {currentPlanType === 'pro' ? '10' : '5'} itens
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        type="button"
                        onClick={handleAddNav}
                        variant="primary"
                        className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                        disabled={!canAddNewNav}
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Link
                      </Button>
                      {isNavLimitReached && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Limite do plano atingido
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    Configure os links do menu de navegação no rodapé.
                  </p>
                </div>

                {/* Mensagem de erro */}
                {navValidationError && (
                  <div className={`p-3 rounded-lg ${isNavLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                    <div className="flex items-start gap-2">
                      {isNavLimitReached ? (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm ${isNavLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                        {navValidationError}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {localNavigation.map((nav, index) => (
                    <div 
                      key={`nav-${index}`}
                      ref={index === localNavigation.length - 1 ? newNavItemRef : undefined}
                      draggable
                      onDragStart={(e) => handleNavDragStart(e, index)}
                      onDragOver={(e) => handleNavDragOver(e, index)}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragEnd={handleNavDragEnd}
                      onDrop={handleDrop}
                      className={`p-6 border border-[var(--color-border)] rounded-lg space-y-6 transition-all duration-200 ${
                        draggingNavItem === index 
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                          : 'hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Handle para drag & drop */}
                          <div 
                            className="cursor-grab active:cursor-grabbing p-2 hover:bg-[var(--color-background)]/50 rounded transition-colors"
                            draggable
                            onDragStart={(e) => handleNavDragStart(e, index)}
                          >
                            <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                          </div>
                          
                          {/* Indicador de posição */}
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-medium text-[var(--color-secondary)]/70">
                              {index + 1}
                            </span>
                            <div className="w-px h-4 bg-[var(--color-border)] mt-1"></div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <h4 className="font-medium text-[var(--color-secondary)]">
                                {nav.name || "Link sem nome"}
                              </h4>
                              {nav.name && nav.href ? (
                                <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                  Completo
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                  Incompleto
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  Nome do Link
                                </label>
                                <Input
                                  value={nav.name}
                                  onChange={(e) => updateNav(index, { name: e.target.value })}
                                  placeholder="Ex: Home"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-[var(--color-secondary)]">
                                  URL do Link
                                </label>
                                <Input
                                  value={nav.href}
                                  onChange={(e) => updateNav(index, { href: e.target.value })}
                                  placeholder="Ex: /"
                                  className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            onClick={() => removeNav(index)}
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
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Conteúdo */}
        <div className="space-y-4">
          <SectionHeader
            title="Conteúdo do Footer"
            section="content"
            icon={FileText}
            isExpanded={expandedSections.content}
            onToggle={() => toggleSection("content")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.content ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-8">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                    Configuração do Conteúdo
                  </h4>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    Todas as configurações serão aplicadas automaticamente a todas as páginas (E-commerce, Marketing, Sobre, Cursos).
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Badge e Estatísticas
                  </h3>
                  
                  <ImageUpload
                    label="Imagem do Badge"
                    description="Selo/logo que aparece no footer (aplica a todas as páginas)"
                    currentImage={footerData.content.ecommerce.badgeImage}
                    selectedFile={fileStates['content.ecommerce.badgeImage'] || null}
                    onFileChange={handleBadgeImageUpload}
                    aspectRatio="aspect-square"
                    previewWidth={100}
                    previewHeight={100}
                  />

                  <Input
                    label="Título do Badge"
                    value={footerData.content.ecommerce.badgeTitle}
                    onChange={(e) => updateContentForAllPages('badgeTitle', e.target.value)}
                    placeholder="Ex: Consultoria Certificada"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <TextArea
                    label="Descrição do Badge"
                    value={footerData.content.ecommerce.badgeDesc}
                    onChange={(e) => updateContentForAllPages('badgeDesc', e.target.value)}
                    placeholder="Ex: Selo oficial de qualidade e segurança Mercado Livre."
                    rows={3}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Estatística 1
                      </label>
                      <Input
                        label="Valor"
                        value={footerData.content.ecommerce.stats1.val}
                        onChange={(e) => updateContentForAllPages('stats1.val', e.target.value)}
                        placeholder="Ex: +100M"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                      <Input
                        label="Rótulo"
                        value={footerData.content.ecommerce.stats1.label}
                        onChange={(e) => updateContentForAllPages('stats1.label', e.target.value)}
                        placeholder="Ex: Gerenciados"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Estatística 2
                      </label>
                      <Input
                        label="Valor"
                        value={footerData.content.ecommerce.stats2.val}
                        onChange={(e) => updateContentForAllPages('stats2.val', e.target.value)}
                        placeholder="Ex: Top 1%"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                      <Input
                        label="Rótulo"
                        value={footerData.content.ecommerce.stats2.label}
                        onChange={(e) => updateContentForAllPages('stats2.label', e.target.value)}
                        placeholder="Ex: Performance"
                        className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                      <LinkIcon className="w-5 h-5" />
                      Coluna de Links
                    </h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[var(--color-secondary)]/70">
                        {contentLinksCompleteCount} de {contentLinksTotalCount} preenchidos
                      </span>
                    </div>
                  </div>
                  
                  <Input
                    label="Título da Coluna"
                    value={footerData.content.ecommerce.columnTitle}
                    onChange={(e) => updateContentForAllPages('columnTitle', e.target.value)}
                    placeholder="Ex: Expertise"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                      <label className="block text-sm font-medium text-[var(--color-secondary)]">
                        Links da Coluna (aplicam a todas as páginas)
                      </label>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          type="button"
                          onClick={handleAddContentLink}
                          variant="primary"
                          className="whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white border-none flex items-center gap-2"
                          disabled={!canAddNewContentLink}
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar Link
                        </Button>
                        {isContentLinksLimitReached && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Limite do plano atingido
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Mensagem de erro */}
                    {contentLinksValidationError && (
                      <div className={`p-3 rounded-lg ${isContentLinksLimitReached ? 'bg-red-900/20 border border-red-800' : 'bg-yellow-900/20 border border-yellow-800'} mb-4`}>
                        <div className="flex items-start gap-2">
                          {isContentLinksLimitReached ? (
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          )}
                          <p className={`text-sm ${isContentLinksLimitReached ? 'text-red-400' : 'text-yellow-400'}`}>
                            {contentLinksValidationError}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {localContentLinks.map((link, index) => (
                        <div 
                          key={`content-link-${index}`}
                          ref={index === localContentLinks.length - 1 ? newContentLinkRef : undefined}
                          draggable
                          onDragStart={(e) => handleContentLinkDragStart(e, index)}
                          onDragOver={(e) => handleContentLinkDragOver(e, index)}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragEnd={handleContentLinkDragEnd}
                          onDrop={handleDrop}
                          className={`p-4 border border-[var(--color-border)] rounded-lg transition-all duration-200 ${
                            draggingContentLink === index 
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                              : 'hover:border-[var(--color-primary)]/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              {/* Handle para drag & drop */}
                              <div 
                                className="cursor-grab active:cursor-grabbing p-2 hover:bg-[var(--color-background)]/50 rounded transition-colors"
                                draggable
                                onDragStart={(e) => handleContentLinkDragStart(e, index)}
                              >
                                <GripVertical className="w-5 h-5 text-[var(--color-secondary)]/70" />
                              </div>
                              
                              {/* Indicador de posição */}
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-medium text-[var(--color-secondary)]/70">
                                  {index + 1}
                                </span>
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-medium text-[var(--color-secondary)]">
                                    {link || "Link sem texto"}
                                  </h4>
                                  {link.trim() ? (
                                    <span className="px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
                                      Completo
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-300 rounded-full">
                                      Incompleto
                                    </span>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  <Input
                                    value={link}
                                    onChange={(e) => updateContentLink(index, e.target.value)}
                                    placeholder="Ex: Gestão Full Commerce"
                                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <Button
                                type="button"
                                onClick={() => removeContentLink(index)}
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
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--color-secondary)] flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Contato e Descrição
                  </h3>
                  
                  <Input
                    label="Email de Contato"
                    type="email"
                    value={footerData.content.ecommerce.email}
                    onChange={(e) => updateContentForAllPages('email', e.target.value)}
                    placeholder="Ex: contato@tegbe.com.br"
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />

                  <TextArea
                    label="Descrição da Empresa"
                    value={footerData.content.ecommerce.desc}
                    onChange={(e) => updateContentForAllPages('desc', e.target.value)}
                    placeholder="Descrição da empresa que aparece no footer (aplica a todas as páginas)..."
                    rows={4}
                    className="bg-[var(--color-background-body)] border-[var(--color-border)] text-[var(--color-secondary)]"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Seção Variantes de Cor */}
        <div className="space-y-4">
          <SectionHeader
            title="Tema Visual do Footer"
            section="variants"
            icon={Palette}
            isExpanded={expandedSections.variants}
            onToggle={() => toggleSection("variants")}
          />

          <motion.div
            initial={false}
            animate={{ height: expandedSections.variants ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-[var(--color-background)]">
              <div className="space-y-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-[var(--color-secondary)] mb-2">
                    Configuração das Cores
                  </h4>
                  <p className="text-sm text-[var(--color-secondary)]/70">
                    As cores configuradas aqui serão aplicadas automaticamente a todas as páginas (E-commerce, Marketing, Sobre, Cursos).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ThemePropertyInput
                    property="primary"
                    label="Cor Primária (Texto)"
                    description="Cor primária para textos e elementos"
                    currentHex={extractHexFromTailwind(footerData.variants.ecommerce.primary)}
                    tailwindClass={footerData.variants.ecommerce.primary}
                    onThemeChange={(prop, hex) => updateVariantForAllPages(prop as keyof ThemeVariant, hex)}
                  />

                  <ThemePropertyInput
                    property="hoverText"
                    label="Texto no Hover"
                    description="Cor do texto quando o usuário passa o mouse"
                    currentHex={extractHexFromTailwind(footerData.variants.ecommerce.hoverText)}
                    tailwindClass={footerData.variants.ecommerce.hoverText}
                    onThemeChange={(prop, hex) => updateVariantForAllPages(prop as keyof ThemeVariant, hex)}
                  />

                  <ThemePropertyInput
                    property="decoration"
                    label="Decoração"
                    description="Cor para sublinhados e decorações"
                    currentHex={extractHexFromTailwind(footerData.variants.ecommerce.decoration)}
                    tailwindClass={footerData.variants.ecommerce.decoration}
                    onThemeChange={(prop, hex) => updateVariantForAllPages(prop as keyof ThemeVariant, hex)}
                  />

                  <ThemePropertyInput
                    property="bgHover"
                    label="Background no Hover"
                    description="Cor de fundo quando o usuário passa o mouse"
                    currentHex={extractHexFromTailwind(footerData.variants.ecommerce.bgHover)}
                    tailwindClass={footerData.variants.ecommerce.bgHover}
                    onThemeChange={(prop, hex) => updateVariantForAllPages(prop as keyof ThemeVariant, hex)}
                  />

                  <ThemePropertyInput
                    property="borderHover"
                    label="Borda no Hover"
                    description="Cor da borda quando o usuário passa o mouse"
                    currentHex={extractHexFromTailwind(footerData.variants.ecommerce.borderHover)}
                    tailwindClass={footerData.variants.ecommerce.borderHover}
                    onThemeChange={(prop, hex) => updateVariantForAllPages(prop as keyof ThemeVariant, hex)}
                  />

                  <ThemePropertyInput
                    property="glowGradient"
                    label="Gradiente Glow"
                    description="Gradiente para efeitos de brilho"
                    currentHex={extractHexFromTailwind(footerData.variants.ecommerce.glowGradient)}
                    tailwindClass={footerData.variants.ecommerce.glowGradient}
                    onThemeChange={(prop, hex) => updateVariantForAllPages(prop as keyof ThemeVariant, hex)}
                  />

                  <ThemePropertyInput
                    property="glowAmbient"
                    label="Brilho Ambiental"
                    description="Cor do brilho ambiental de fundo"
                    currentHex={extractHexFromTailwind(footerData.variants.ecommerce.glowAmbient)}
                    tailwindClass={footerData.variants.ecommerce.glowAmbient}
                    onThemeChange={(prop, hex) => updateVariantForAllPages(prop as keyof ThemeVariant, hex)}
                  />

                  <ThemePropertyInput
                    property="iconBg"
                    label="Ícone (Cor)"
                    description="Cor para ícones"
                    currentHex={extractHexFromTailwind(footerData.variants.ecommerce.iconBg)}
                    tailwindClass={footerData.variants.ecommerce.iconBg}
                    onThemeChange={(prop, hex) => updateVariantForAllPages(prop as keyof ThemeVariant, hex)}
                  />

                  <ThemePropertyInput
                    property="iconHoverText"
                    label="Texto no Hover do Ícone"
                    description="Cor do texto quando o usuário passa o mouse no ícone"
                    currentHex={extractHexFromTailwind(footerData.variants.ecommerce.iconHoverText)}
                    tailwindClass={footerData.variants.ecommerce.iconHoverText}
                    onThemeChange={(prop, hex) => updateVariantForAllPages(prop as keyof ThemeVariant, hex)}
                  />

                  <ThemePropertyInput
                    property="iconHoverBg"
                    label="Background no Hover do Ícone"
                    description="Cor de fundo quando o usuário passa o mouse no ícone"
                    currentHex={extractHexFromTailwind(footerData.variants.ecommerce.iconHoverBg)}
                    tailwindClass={footerData.variants.ecommerce.iconHoverBg}
                    onThemeChange={(prop, hex) => updateVariantForAllPages(prop as keyof ThemeVariant, hex)}
                  />

                  <ThemePropertyInput
                    property="topBorder"
                    label="Borda Superior"
                    description="Cor da borda superior"
                    currentHex={extractHexFromTailwind(footerData.variants.ecommerce.topBorder)}
                    tailwindClass={footerData.variants.ecommerce.topBorder}
                    onThemeChange={(prop, hex) => updateVariantForAllPages(prop as keyof ThemeVariant, hex)}
                  />
                </div>
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
          totalCount={completion.total}
          itemName="Footer"
          icon={Layout}
        />
      </form>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        type={deleteModal.type}
        itemTitle={deleteModal.title}
        totalItems={1}
        itemName="Configuração do Footer"
      />

      <FeedbackMessages success={success} errorMsg={errorMsg} />
    </ManageLayout>
  );
}