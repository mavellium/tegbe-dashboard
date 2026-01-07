/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import Image from "next/image";
import { ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/Button";

interface ImageUploadProps {
  label: string;
  currentImage: string;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  aspectRatio?: string;
}

export const ImageUpload = ({ 
  label, 
  currentImage, 
  selectedFile, 
  onFileChange, 
  aspectRatio = "aspect-video" 
}: ImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else if (currentImage) {
      setPreviewUrl(currentImage);
    } else {
      setPreviewUrl("");
    }
  }, [selectedFile, currentImage]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {previewUrl ? (
          <div className={`relative w-full ${aspectRatio} rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900`}>
            <Image
              src={previewUrl}
              alt="Image preview"
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                      <svg class="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  `;
                }
              }}
            />
          </div>
        ) : (
          <div className={`w-full ${aspectRatio} flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600`}>
            <ImageIcon className="w-12 h-12 text-zinc-400" />
          </div>
        )}
        
        <div className="w-full md:w-auto space-y-4">
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4">
            <div className="flex flex-col items-center justify-center">
              {previewUrl ? (
                <>
                  <div className="flex gap-3 mb-3">
                    <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Trocar Imagem
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          onFileChange(file);
                        }}
                      />
                    </label>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => onFileChange(null)}
                    >
                      Remover
                    </Button>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Clique em &quot;Trocar Imagem&quot; para substituir
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 text-center">
                    Upload recomendado: JPG, PNG ou WebP<br/>
                    Tamanho ideal: 800x600px
                  </p>
                  <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Selecionar Imagem
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        onFileChange(file);
                      }}
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};