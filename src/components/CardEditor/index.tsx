import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { 
  Trash2, 
  Phone, 
  Target, 
  MessageCircle, 
  LinkIcon, 
  ChevronUp, 
  ChevronDown, 
  ShoppingBag,
  Mail
} from "lucide-react";
import IconSelector from "@/components/IconSelector";
import { ColorPropertyInput } from "../ColorPropertyInput";
import { ImageUpload } from "../ImageUpload";
import { FeaturesEditor } from "../FeaturesEditor";

// ================= TIPOS =================
interface Feature {
  text: string;
  icon: string;
}

interface CTA {
  text: string;
  action: "whatsapp" | "link" | "email" | "phone";
  value: string;
}

interface PhoneImageSize {
  width: number;
  height: number;
}

interface CardData {
  id: number;
  title: string;
  highlightedText: string;
  description: string;
  icon: string;
  iconBgColor: string;
  backgroundColor: string;
  primaryColor: string;
  backgroundImage: string;
  features: Feature[];
  cta: CTA;
  hasPhoneImage?: boolean;
  phoneImage?: string;
  phoneImageSize?: PhoneImageSize;
}

interface CardEditorProps {
  card: CardData;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  // onChange genérico para manipular campos diversos do card
  onChange: (field: string, value: string | number | boolean | Feature[] | CTA | PhoneImageSize) => void;
  onRemove: () => void;
}

// ================= COMPONENTE =================
export const CardEditor: React.FC<CardEditorProps> = ({
  card,
  index,
  isExpanded,
  onToggle,
  onChange,
  onRemove
}) => {
  
  // Helpers para renderização do ícone de ação
  const getActionIcon = (action: string) => {
    switch (action) {
      case "whatsapp": return <MessageCircle className="w-4 h-4" />;
      case "email": return <Mail className="w-4 h-4" />;
      case "phone": return <Phone className="w-4 h-4" />;
      default: return <LinkIcon className="w-4 h-4" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "whatsapp": return "Abrir WhatsApp";
      case "email": return "Enviar Email";
      case "phone": return "Ligar";
      default: return "Navegar para URL";
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho do Card (Colapsável) */}
      <div
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors cursor-pointer border border-zinc-700"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 rounded-md">
            <ShoppingBag className="w-5 h-5 text-zinc-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-200">
              Card {index + 1}: {card.title || "Sem título"}
            </h3>
            <p className="text-sm text-zinc-400">
              {card.highlightedText ? `Destaque: ${card.highlightedText}` : "Sem destaque"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-2 h-auto"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-300" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-300" />
          )}
        </div>
      </div>

      {/* Corpo do Editor */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-6 space-y-8 border-t-0 rounded-t-none mt-[-1rem]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                
                {/* Coluna 1: Informações básicas */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Título
                      </label>
                      <Input
                        type="text"
                        value={card.title}
                        onChange={(e) => onChange("title", e.target.value)}
                        placeholder="Ex: Consultoria Oficial"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Texto Destacado
                      </label>
                      <Input
                        type="text"
                        value={card.highlightedText}
                        onChange={(e) => onChange("highlightedText", e.target.value)}
                        placeholder="Ex: Mercado Livre"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={card.description}
                      onChange={(e) => onChange("description", e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-zinc-800 text-zinc-100 min-h-[100px]"
                      rows={3}
                      placeholder="Descrição detalhada do serviço..."
                    />
                  </div>

                  {/* Ícone e cores */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Ícone
                      </label>
                      <IconSelector
                        value={card.icon}
                        onChange={(value) => onChange("icon", value)}
                        label="Selecione um ícone"
                      />
                    </div>

                    <div>
                      <ColorPropertyInput
                        label="Cor do Ícone"
                        value={card.iconBgColor}
                        onChange={(color) => onChange("iconBgColor", color)}
                        description="Cor de fundo do ícone"
                      />
                    </div>

                    <div>
                      <ColorPropertyInput
                        label="Cor Primária"
                        value={card.primaryColor}
                        onChange={(color) => onChange("primaryColor", color)}
                        description="Cor principal para textos"
                      />
                    </div>
                  </div>

                  <div>
                    <ColorPropertyInput
                      label="Cor de Fundo do Card"
                      value={card.backgroundColor}
                      onChange={(color) => onChange("backgroundColor", color)}
                      description="Cor de fundo do card completo"
                    />
                  </div>
                </div>

                {/* Coluna 2: Imagens e CTA */}
                <div className="space-y-6">
                  {/* Imagem de Fundo */}
                  <ImageUpload
                    label="Imagem de Fundo do Card"
                    currentImage={card.backgroundImage}
                    onChange={(url) => onChange("backgroundImage", url)}
                    aspectRatio="aspect-video"
                  />

                  {/* Phone Image */}
                  <div className="space-y-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-zinc-200 flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Imagem de Telefone
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-400">Ativar:</span>
                        <div
                          onClick={() => onChange("hasPhoneImage", !card.hasPhoneImage)}
                          className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors cursor-pointer ${
                            card.hasPhoneImage ? "bg-green-500" : "bg-gray-600"
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                            card.hasPhoneImage ? "translate-x-5" : ""
                          }`} />
                        </div>
                      </div>
                    </div>

                    {card.hasPhoneImage && (
                      <div className="space-y-4 pt-2">
                        <ImageUpload
                          label="Upload Imagem do Telefone"
                          currentImage={card.phoneImage || ""}
                          onChange={(url) => onChange("phoneImage", url)}
                          aspectRatio="aspect-[2/3]"
                        />

                        {card.phoneImageSize && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Largura (px)
                              </label>
                              <Input
                                type="number"
                                value={card.phoneImageSize.width.toString()}
                                onChange={(e) =>
                                  onChange("phoneImageSize", {
                                    ...card.phoneImageSize!,
                                    width: parseInt(e.target.value) || 0
                                  })
                                }
                                placeholder="400"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Altura (px)
                              </label>
                              <Input
                                type="number"
                                value={card.phoneImageSize.height.toString()}
                                onChange={(e) =>
                                  onChange("phoneImageSize", {
                                    ...card.phoneImageSize!,
                                    height: parseInt(e.target.value) || 0
                                  })
                                }
                                placeholder="600"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Benefícios */}
              <div className="space-y-6 border-t border-zinc-700 pt-6">
                <FeaturesEditor
                  features={card.features}
                  onChange={(features) => onChange("features", features)}
                />
              </div>

              {/* CTA */}
              <div className="space-y-6 p-4 border border-zinc-700 rounded-lg bg-zinc-900/30">
                <h4 className="font-semibold text-zinc-200 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Call to Action (CTA)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Texto do Botão
                    </label>
                    <Input
                      type="text"
                      value={card.cta.text}
                      onChange={(e) => onChange("cta", { ...card.cta, text: e.target.value })}
                      placeholder="Ex: Contratar"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Ação
                    </label>
                    <select
                      value={card.cta.action}
                      onChange={(e) => onChange("cta", { ...card.cta, action: e.target.value as CTA["action"] })}
                      className="w-full px-3 py-2 border border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-zinc-800 text-zinc-100"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="link">Link</option>
                      <option value="email">Email</option>
                      <option value="phone">Telefone</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Valor / Link
                    </label>
                    <Input
                      type="text"
                      value={card.cta.value}
                      onChange={(e) => onChange("cta", { ...card.cta, value: e.target.value })}
                      placeholder={card.cta.action === "whatsapp" ? "https://wa.me/..." : "/pagina"}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-zinc-400 bg-zinc-800 p-2 rounded-md w-fit">
                  {getActionIcon(card.cta.action)}
                  <span>Ação: {getActionLabel(card.cta.action)}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};