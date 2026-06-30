"use client";

import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud, Image as ImageIcon, Film, X } from "lucide-react";

export type MediaItem = { url: string; type: "image" | "video" };

interface MultiMediaUploaderProps {
  values: MediaItem[];
  onAdd: (item: MediaItem) => void;
  onRemove: (index: number) => void;
  label?: string;
  accept?: "image" | "video" | "both";
  maxFiles?: number;
}

export function MultiMediaUploader({ values, onAdd, onRemove, label = "Ajouter des médias", accept = "both", maxFiles = 10 }: MultiMediaUploaderProps) {
  const resourceType = accept === "image" ? "image" : accept === "video" ? "video" : "auto";

  return (
    <div className="flex flex-col gap-4">
      {values.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {values.map((item, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              {item.type === "video" ? (
                <video src={item.url} className="w-full h-full object-cover bg-black" />
              ) : (
                <img src={item.url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {values.length < maxFiles && (
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "guilogtrans-images"}
          options={{
            multiple: true,
            maxFiles: maxFiles - values.length,
            resourceType: resourceType,
            clientAllowedFormats: accept === "image" ? ["png", "jpeg", "jpg", "webp"] : accept === "video" ? ["mp4", "webm"] : ["png", "jpeg", "jpg", "webp", "mp4", "webm"],
            sources: ["local", "url", "camera"],
          }}
          onSuccess={(result: any) => {
            if (result.info && result.info.secure_url) {
              const url = result.info.secure_url;
              const type = result.info.resource_type === "video" ? "video" : "image";
              onAdd({ url, type });
            }
          }}
        >
          {({ open }) => {
            return (
              <button
                type="button"
                onClick={() => open()}
                className="flex items-center justify-center gap-2 w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[var(--color-secondary)] hover:bg-blue-50 transition-colors text-gray-600 font-medium text-sm"
              >
                <UploadCloud className="w-5 h-5 text-[var(--color-secondary)]" />
                {values.length > 0 ? "Ajouter d'autres médias" : label}
                <div className="flex gap-1 ml-auto text-gray-400">
                  {(accept === "image" || accept === "both") && <ImageIcon className="w-4 h-4" />}
                  {(accept === "video" || accept === "both") && <Film className="w-4 h-4" />}
                </div>
              </button>
            );
          }}
        </CldUploadWidget>
      )}
    </div>
  );
}
