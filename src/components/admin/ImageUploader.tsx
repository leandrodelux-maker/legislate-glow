import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import { uploadToSiteMedia } from "@/hooks/use-site-settings";

export function ImageUploader({
  value, onChange, folder, label, height = 96,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  label?: string;
  height?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-medium text-slate-600">{label}</p>}
      <div
        className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden"
        style={{ height }}
      >
        {value ? (
          <img src={value} alt="" className="max-h-full max-w-full object-contain p-2" />
        ) : (
          <div className="text-center text-slate-400">
            <ImageIcon className="w-6 h-6 mx-auto mb-1" />
            <p className="text-[11px]">Sem imagem</p>
          </div>
        )}
      </div>
      <input
        ref={ref} type="file" accept="image/*" className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0]; e.target.value = "";
          if (!f) return;
          setBusy(true);
          const url = await uploadToSiteMedia(f, folder);
          setBusy(false);
          if (url) onChange(url);
        }}
      />
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()} disabled={busy} className="flex-1">
          {busy ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
          {value ? "Trocar" : "Enviar"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </Button>
        )}
      </div>
    </div>
  );
}
