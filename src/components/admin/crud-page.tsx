import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "date" | "datetime-local" | "checkbox" | "url" | "email" | "select" | "file" | "custom";
  renderCustom?: (row: any, form: any, setForm: any) => React.ReactNode;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  table?: string;
  optionLabel?: string;
  optionValue?: string;
};

export type CrudTab = {
  id: string;
  label: string;
  fieldNames: string[];
};

export type ColumnDef<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

type Props<T extends { id: string }> = {
  title: string;
  description?: string;
  table: string;
  columns: ColumnDef<T>[];
  fields: FieldDef[];
  tabs?: CrudTab[];
  orderBy?: { column: string; ascending?: boolean };
  defaultValues?: Partial<T>;
};

type FieldInputProps = {
  field: FieldDef;
  editing: any;
  form: Record<string, any>;
  setForm: (value: React.SetStateAction<Record<string, any>>) => void;
  saving: boolean;
  setSaving: (value: boolean) => void;
  externalOptions: Record<string, { label: string; value: string }[]>;
};

function FieldInput({ field: f, editing, form, setForm, saving, setSaving, externalOptions }: FieldInputProps) {
  return (
    <div>
      <Label htmlFor={f.name}>{f.label}{f.required && " *"}</Label>
      {f.type === "textarea" ? (
        <Textarea
          id={f.name}
          required={f.required}
          placeholder={f.placeholder}
          value={String(form[f.name] ?? "")}
          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
          rows={4}
        />
      ) : f.type === "checkbox" ? (
        <div className="flex items-center gap-2 pt-2">
          <input
            id={f.name}
            type="checkbox"
            checked={Boolean(form[f.name])}
            onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm text-slate-600">{f.placeholder ?? "Sim"}</span>
        </div>
      ) : f.type === "select" ? (
        <Select
          value={String(form[f.name] ?? "")}
          onValueChange={(v) => setForm({ ...form, [f.name]: v })}
          required={f.required}
        >
          <SelectTrigger>
            <SelectValue placeholder={f.placeholder || "Selecione..."} />
          </SelectTrigger>
          <SelectContent>
            {(f.options || externalOptions[f.name])?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : f.type === "file" ? (
        <div className="space-y-2">
          <Input
            id={f.name}
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
              if (!allowedTypes.includes(file.type)) {
                toast.error("Formato de imagem inválido. Use JPG, PNG ou WebP.");
                return;
              }

              const maxSize = 2 * 1024 * 1024;
              if (file.size > maxSize) {
                toast.error("Imagem muito grande. O tamanho máximo permitido é 2MB.");
                return;
              }
              
              setSaving(true);
              const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
              
              const safeFileName = file.name
                .split('.')[0]
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]/gi, '-')
                .toLowerCase();

              const fileName = `${Date.now()}-${safeFileName}.${fileExt}`;
              const filePath = fileName;

              console.log(`Iniciando upload para o bucket 'vereadores'...`, filePath);

              const { data, error: uploadError } = await supabase.storage
                .from('vereadores')
                .upload(filePath, file, {
                  cacheControl: '3600',
                  upsert: true,
                  contentType: file.type
                });

              if (uploadError) {
                console.error("Erro no upload:", uploadError);
                toast.error("Erro no upload: " + uploadError.message);
                setSaving(false);
                return;
              }

              console.log("Upload concluído com sucesso:", data);

              const { data: signed } = await supabase.storage
                .from('vereadores')
                .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10);

              if (!signed?.signedUrl) {
                toast.error("Falha ao gerar URL assinada");
                setSaving(false);
                return;
              }

              setForm((prev) => ({ ...prev, [f.name]: signed.signedUrl }));
              setSaving(false);
              toast.success("Foto enviada com sucesso!");
            }}

          />
          {form[f.name] ? (
            <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
              <img 
                src={`${String(form[f.name])}${String(form[f.name]).includes('?') ? '&' : '?'}t=${Date.now()}`} 
                alt="Preview" 
                className="w-full h-full object-cover" 
              />

            </div>
          ) : null}
        </div>
      ) : f.type === "custom" ? (
        f.renderCustom?.(editing, form, setForm)
      ) : (
        <Input
          id={f.name}
          type={f.type ?? "text"}
          required={f.required}
          placeholder={f.placeholder}
          value={
            f.type === "datetime-local" && form[f.name]
              ? String(form[f.name]).slice(0, 16)
              : String(form[f.name] ?? "")
          }
          onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
        />
      )}
    </div>
  );
}

export function CrudPage<T extends { id: string }>({
  title, description, table, columns, fields, tabs, orderBy, defaultValues = {},
}: Props<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [externalOptions, setExternalOptions] = useState<Record<string, { label: string; value: string }[]>>({});

  const load = async () => {
    setLoading(true);
    let q = (supabase as any).from(table).select("*");
    if (orderBy) q = q.order(orderBy.column, { ascending: orderBy.ascending ?? false });
    const { data, error, status } = await q;
    if (error) {
      console.error(`[CRUD SELECT] ${table} falhou`, { status, code: error.code, message: error.message, details: error.details, hint: error.hint });
      toast.error(`Falha ao carregar "${table}" (${error.code || status}): ${error.message}`);
    } else setRows((data as T[]) ?? []);
    setLoading(false);
  };

  const loadExternal = async () => {
    for (const field of fields) {
      if (field.table && field.optionLabel && field.optionValue) {
        const { data, error } = await (supabase as any)
          .from(field.table)
          .select(`${field.optionValue}, ${field.optionLabel}`);
        
        if (!error && data) {
          setExternalOptions(prev => ({
            ...prev,
            [field.name]: data.map((d: any) => ({
              label: d[field.optionLabel!],
              value: String(d[field.optionValue!])
            }))
          }));
        }
      }
    }
  };

  useEffect(() => { 
    load(); 
    loadExternal();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */ 
  }, [table]);

  const startNew = () => {
    setEditing(null);
    setForm({ ...defaultValues });
    setOpen(true);
  };

  const startEdit = (row: T) => {
    setEditing(row);
    setForm({ ...row });
    setOpen(true);
  };

  const handleDelete = async (row: T) => {
    if (!confirm("Excluir este registro?")) return;
    const { error, status } = await (supabase as any).from(table).delete().eq("id", row.id);
    if (error) {
      console.error(`[CRUD DELETE] ${table} id=${row.id}`, { status, code: error.code, message: error.message, details: error.details, hint: error.hint });
      const isRls = error.code === "42501" || /row-level security|permission denied/i.test(error.message || "");
      return toast.error(isRls ? `Bloqueado por RLS: ${error.message}` : `Erro (${error.code || status}): ${error.message}`);
    }
    toast.success("Excluído");
    load();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: Record<string, unknown> = {};
    fields.forEach((f) => {
      let v = form[f.name];
      if (f.type === "number" && v !== "" && v != null) v = Number(v);
      if (f.type === "checkbox") v = Boolean(v);
      if (v === "" || v === undefined) v = null;
      payload[f.name] = v;
    });

    const operation = editing ? "UPDATE" : "INSERT";
    const startedAt = performance.now();
    console.groupCollapsed(
      `%c[CRUD ${operation}] ${table}${editing ? ` (id=${editing.id})` : ""}`,
      "color:#2563eb;font-weight:bold",
    );
    console.log("Payload:", payload);

    try {
      const { data: authData } = await supabase.auth.getUser();
      console.log("Auth user:", authData.user?.id ?? "(anonymous)", authData.user?.email ?? "");

      const op = editing
        ? (supabase as any).from(table).update(payload).eq("id", editing.id).select()
        : (supabase as any).from(table).insert(payload).select();

      const { data, error, status, statusText } = await op;
      const durationMs = Math.round(performance.now() - startedAt);
      console.log(`HTTP ${status ?? "?"} ${statusText ?? ""} • ${durationMs}ms`);

      if (error) {
        console.error("Supabase error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          status,
        });

        const isRls =
          error.code === "42501" ||
          /row-level security|permission denied|violates row-level/i.test(error.message || "");

        if (isRls) {
          console.error(
            "%c⛔ RLS/permissão bloqueou a operação",
            "color:#dc2626;font-weight:bold",
            `\nTabela: ${table}\nOperação: ${operation}\nUsuário: ${authData.user?.id ?? "anon"}\nDica: verifique policies (has_role/admin) e GRANTs.`,
          );
          toast.error(
            `Bloqueado por RLS em "${table}": ${error.hint || error.details || error.message}`,
            { duration: 8000 },
          );
        } else {
          toast.error(`Erro (${error.code || status || "?"}): ${error.message}`, { duration: 6000 });
        }
        throw error;
      }

      console.log("Resultado:", data);
      toast.success(editing ? "Atualizado com sucesso" : "Criado com sucesso");
      setOpen(false);
      load();
    } catch (error: any) {
      if (!error?.code) {
        console.error("Exceção não-Supabase:", error);
        toast.error("Erro inesperado: " + (error?.message || "desconhecido"));
      }
    } finally {
      console.groupEnd();
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-[fade-up_0.4s_ease-out]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">{title}</h2>
          {description && <p className="text-slate-500">{description}</p>}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startNew} className="bg-primary-deep">
              <Plus className="w-4 h-4 mr-2" /> Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar" : "Criar"} registro</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              {(() => {
                if (!tabs) {
                  return fields.map((f) => <FieldInput key={f.name} field={f} editing={editing} form={form} setForm={setForm} saving={saving} setSaving={setSaving} externalOptions={externalOptions} />);
                }
                const tabFieldNames = new Set(tabs.flatMap((t) => t.fieldNames));
                const outsideTabFields = fields.filter((f) => !tabFieldNames.has(f.name));
                return (
                  <>
                    {outsideTabFields.map((f) => (
                      <FieldInput key={f.name} field={f} editing={editing} form={form} setForm={setForm} saving={saving} setSaving={setSaving} externalOptions={externalOptions} />
                    ))}
                    <Tabs defaultValue={tabs[0]?.id} className="w-full">
                      <TabsList className="w-full flex-wrap h-auto gap-1">
                        {tabs.map((t) => (
                          <TabsTrigger key={t.id} value={t.id} className="text-xs">
                            {t.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {tabs.map((t) => {
                        const tabFields = fields.filter((f) => t.fieldNames.includes(f.name));
                        return (
                          <TabsContent key={t.id} value={t.id} className="space-y-4">
                            {tabFields.map((f) => (
                              <FieldInput key={f.name} field={f} editing={editing} form={form} setForm={setForm} saving={saving} setSaving={setSaving} externalOptions={externalOptions} />
                            ))}
                          </TabsContent>
                        );
                      })}
                    </Tabs>
                  </>
                );
              })()}
              <DialogFooter>
                <Button type="submit" disabled={saving} className="bg-primary-deep">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editing ? "Salvar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Nenhum registro. Clique em "Novo" para começar.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => <TableHead key={String(c.key)}>{c.label}</TableHead>)}
                <TableHead className="w-32 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((c) => (
                    <TableCell key={String(c.key)}>
                      {c.render ? c.render(row) : (String((row as Record<string, any>)[c.key as string] ?? "—") as React.ReactNode)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(row)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(row)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}