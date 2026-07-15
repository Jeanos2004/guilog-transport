"use client";

import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud, Image as ImageIcon, Film, FileText } from "lucide-react";

interface MediaUploaderProps {
  value?: string;
  onChange: (url: string, type: "image" | "video" | "document") => void;
  label?: string;
  accept?: "image" | "video" | "document" | "both";
}

export function MediaUploader({ value, onChange, label = "Ajouter un média", accept = "both" }: MediaUploaderProps) {
  const isVideo = value?.match(/\.(mp4|webm|ogg)$/i) || value?.includes("/video/upload/");
  const isDocument = accept === "document" || value?.match(/\.(pdf|doc|docx)$/i) || value?.includes("/raw/upload/");

  const resourceType = accept === "image" ? "image" : accept === "video" ? "video" : accept === "document" ? "raw" : "auto";

  return (
    <div className="flex flex-col gap-3">
      {value ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
          {isVideo ? (
            <video src={value} controls className="w-full h-full object-contain bg-black" />
          ) : isDocument ? (
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              <FileText className="w-12 h-12 text-gray-400" />
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--color-primary)] font-bold hover:underline line-clamp-2">
                Voir le document PDF
              </a>
            </div>
          ) : (
            <img src={value} alt="Upload" className="w-full h-full object-cover" />
          )}
        </div>
      ) : null}

      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "guilogtrans-images"}
        options={{
          maxFiles: 1,
          resourceType: resourceType,
          clientAllowedFormats: accept === "image" ? ["png", "jpeg", "jpg", "webp"] : accept === "video" ? ["mp4", "webm"] : accept === "document" ? ["pdf"] : ["png", "jpeg", "jpg", "webp", "mp4", "webm"],
          sources: ["local", "url", "camera"],
        }}
        onSuccess={(result: any) => {
          if (result.info && result.info.secure_url) {
            const url = result.info.secure_url;
            const type = result.info.resource_type === "video" ? "video" : result.info.resource_type === "raw" ? "document" : "image";
            onChange(url, type);
          }
        }}
      >
        {({ open }) => {
          return (
            <button
              type="button"
              onClick={() => open()}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[var(--color-secondary)] hover:bg-blue-50 transition-colors text-gray-600 font-medium text-sm"
            >
              <UploadCloud className="w-5 h-5 text-[var(--color-secondary)]" />
              {value ? "Remplacer le média" : label}
              <div className="flex gap-1 ml-auto text-gray-400">
                {(accept === "image" || accept === "both") && <ImageIcon className="w-4 h-4" />}
                {(accept === "video" || accept === "both") && <Film className="w-4 h-4" />}
                {accept === "document" && <FileText className="w-4 h-4" />}
              </div>
            </button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}
