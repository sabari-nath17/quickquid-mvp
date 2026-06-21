"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { uploadImage } from "@/app/actions/upload";

type Bucket = "avatars" | "portfolios" | "packages";
type Shape = "circle" | "square";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket: Bucket;
  shape?: Shape;
  label?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket,
  shape = "square",
  label = "Upload image",
  className = "",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadImage(fd, bucket);
    setUploading(false);
    if (result.error) {
      setError(result.error);
    } else if (result.url) {
      onChange(result.url);
    }
    // reset so same file can be re-selected
    e.target.value = "";
  }

  const isCircle = shape === "circle";
  const containerCls = isCircle
    ? "w-20 h-20 rounded-full"
    : "w-full aspect-[16/9] rounded-xl max-w-[240px]";

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-end gap-4">
        {/* Preview */}
        <div
          className={`${containerCls} bg-muted border-2 border-dashed border-border overflow-hidden relative flex items-center justify-center shrink-0`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-6 h-6 text-muted-foreground/50" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-white text-xs font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            <Camera className="w-3.5 h-3.5" />
            {uploading ? "Uploading…" : value ? "Change" : label}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-3 h-3" />
              Remove
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
