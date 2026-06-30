"use client";

import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud, Image as ImageIcon, Film } from "lucide-react";

interface MediaUploaderProps {
  value?: string;
  onChange: (url: string, type: "image" | "video") => void;
  label?: string;
  accept?: "image" | "video" | "both";
}

export function MediaUploader({ value, onChange, label = "Ajouter un média", accept = "both" }: MediaUploaderProps) {
  const isVideo = value?.match(/\.(mp4|webm|ogg)$/i) || value?.includes("/video/upload/");

  const resourceType = accept === "image" ? "image" : accept === "video" ? "video" : "auto";

  return (
    <div className="flex flex-col gap-3">
      {value ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
          {isVideo ? (
            <video src={value} controls className="w-full h-full object-contain bg-black" />
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
          clientAllowedFormats: accept === "image" ? ["png", "jpeg", "jpg", "webp"] : accept === "video" ? ["mp4", "webm"] : ["png", "jpeg", "jpg", "webp", "mp4", "webm"],
          sources: ["local", "url", "camera"],
        }}
        onSuccess={(result: any) => {
          if (result.info && result.info.secure_url) {
            const url = result.info.secure_url;
            const type = result.info.resource_type === "video" ? "video" : "image";
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
              </div>
            </button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}
