import React, { useRef, useState } from 'react';
import { Upload, X, Camera, Shirt, UserCheck } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  description: string;
  image: string | null;
  onImageChange: (base64: string | null) => void;
  icon?: 'shirt' | 'user';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  description,
  image,
  onImageChange,
  icon = 'shirt'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato no permitido. Usa JPG, PNG o WEBP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen supera el límite de 10 MB.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => onImageChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    processFile(file);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="font-serif text-lg tracking-wide uppercase text-white/90 font-light flex items-center gap-2">
          {icon === 'user' ? <UserCheck size={18} className="text-white/60" /> : <Shirt size={18} className="text-white/60" />}
          {label}
        </span>
        {image && (
          <button
            onClick={() => onImageChange(null)}
            className="text-xs uppercase tracking-wider text-white/40 hover:text-white flex items-center gap-1 transition-colors"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      <div
        onClick={() => !image && fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`relative flex-1 min-h-[320px] rounded-2xl border transition-all duration-300 overflow-hidden group ${
          image
            ? 'border-white/20 bg-black'
            : 'border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/40 cursor-pointer flex flex-col items-center justify-center p-6 text-center'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {image ? (
          <div className="relative w-full h-full min-h-[320px] flex items-center justify-center bg-black/40">
            <img
              src={image}
              alt={label}
              className="max-h-[360px] w-auto object-contain rounded-xl p-2"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 bg-white text-black text-xs uppercase tracking-widest rounded-full font-medium shadow-lg hover:bg-gray-200 transition-colors"
              >
                Change Image
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <Upload size={24} className="text-white/60 group-hover:text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80 group-hover:text-white tracking-wide">
                Drop image here or click to browse
              </p>
              <p className="text-xs text-white/40 mt-1 font-light max-w-xs">{description}</p>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-white/30 px-3 py-1 bg-white/5 rounded-full">
              JPG, PNG, WEBP (Up to 10MB)
            </span>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-400" role="alert">{error}</p>}
    </div>
  );
};
