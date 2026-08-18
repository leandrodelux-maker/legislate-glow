import { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Trash2, Crop as CropIcon, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { VereadorAvatar } from "@/components/vereador-avatar";
import { getVereadorPublicUrl } from "@/lib/vereador-image";

// Lazy load: background-removal pulls WASM on demand only when the user enables it.
const removeBackground = async (src: string | Blob | File) => {
  const mod = await import("@imgly/background-removal");
  const fn = (mod as any).default || (mod as any).removeBackground;
  return await fn(src, { output: { format: "image/jpeg", quality: 0.9 } });
};

type Area = { x: number; y: number; width: number; height: number };

async function cropToBlob(file: File, area: Area): Promise<Blob> {
  const imgUrl = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = imgUrl;
  });
  const canvas = document.createElement("canvas");
  const size = Math.min(1024, Math.round(area.width));
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, size, size);
  URL.revokeObjectURL(imgUrl);
  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9),
  );
}

async function uploadToVereadores(blob: Blob, filename: string): Promise<string | null> {
  const path = `fotos/${Date.now()}-${filename.replace(/[^a-z0-9.]/gi, "_")}`;
  const { error } = await supabase.storage.from("vereadores").upload(path, blob, {
    cacheControl: "31536000",
    upsert: true,
    contentType: "image/jpeg",
  });
  if (error) {
    console.error("[VereadorPhotoUploader] upload error", error);
    toast.error(error.message);
    return null;
  }
  // Armazena apenas o caminho; a exibição usa getPublicUrl() para URL pública.
  return path;
}

export function VereadorPhotoUploader({
  value,
  onChange,
  nome = "",
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  nome?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPx, setAreaPx] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const [removeBg, setRemoveBg] = useState(false);
  const [processingBg, setProcessingBg] = useState(false);

  const onPick = async (file: File) => {
    if (!file) return;
    setRawFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setOpen(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRemoveBg(false);
    setAreaPx(null);
  };

  const onCropComplete = useCallback((_: Area, areaPx: Area) => {
    setAreaPx(areaPx);
  }, []);

  const toggleRemoveBg = async (enabled: boolean) => {
    if (!rawFile) return;
    setRemoveBg(enabled);
    if (enabled) {
      setProcessingBg(true);
      try {
        const blob = await removeBackground(rawFile);
        setPreviewUrl(URL.createObjectURL(blob));
      } catch (e: any) {
        console.error("[VereadorPhotoUploader] background removal error", e);
        toast.error("Falha ao remover fundo: " + (e?.message || "erro desconhecido"));
        setRemoveBg(false);
      } finally {
        setProcessingBg(false);
      }
    } else {
      setPreviewUrl(URL.createObjectURL(rawFile));
    }
  };

  const confirm = async () => {
    if (!rawFile || !areaPx) return;
    setBusy(true);
    try {
      const cropped = await cropToBlob(rawFile, areaPx);
      const compressed = await imageCompression(
        new File([cropped], rawFile.name, { type: "image/jpeg" }),
        { maxSizeMB: 0.8, maxWidthOrHeight: 1024, useWebWorker: true, fileType: "image/jpeg" },
      );
      const url = await uploadToVereadores(compressed, rawFile.name);
      if (url) {
        onChange(url);
        toast.success("Foto enviada");
        setOpen(false);
      }
    } catch (e: any) {
      console.error("[VereadorPhotoUploader] crop/compress error", e);
      toast.error(e?.message || "Falha ao processar imagem");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <VereadorAvatar nome={nome || "?"} foto={value} size={96} rounded="2xl" />
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-3.5 h-3.5 mr-1" />
            {value ? "Trocar foto" : "Enviar foto"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Remover
            </Button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) onPick(f);
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CropIcon className="w-4 h-4" /> Ajustar foto
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-72 bg-slate-900 rounded-lg overflow-hidden">
            {previewUrl && (
              <Cropper
                image={previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
            {processingBg && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
                <span className="ml-2 text-white text-sm">Removendo fundo...</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="text-xs text-slate-500">Zoom</div>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.05}
                onValueChange={(v) => setZoom(v[0])}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="remove-bg"
                checked={removeBg}
                onCheckedChange={toggleRemoveBg}
                disabled={processingBg}
              />
              <Label htmlFor="remove-bg" className="text-xs flex items-center gap-1">
                <Wand2 className="w-3.5 h-3.5" /> Remover fundo
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy || processingBg}>
              Cancelar
            </Button>
            <Button onClick={confirm} disabled={busy || processingBg}>
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
