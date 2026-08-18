import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Edit, Trash2, ExternalLink, Link as LinkIcon, RotateCcw } from "lucide-react";
import {
  useQuickAccess,
  CATEGORY_LABELS,
  ICON_OPTIONS,
  type QuickAccessCategory,
  type QuickAccessIcon,
  type QuickAccessItem,
} from "@/lib/quick-access-store";
import { QuickAccessIconRender } from "@/components/quick-access-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/acesso-rapido/")({
  component: AdminQuickAccess,
});

const CATEGORIES: QuickAccessCategory[] = ["cidadaos", "servidores", "empresas", "legislacao"];

type FormState = Omit<QuickAccessItem, "id">;

const emptyForm: FormState = {
  label: "",
  tag: "",
  icon: "FileText",
  url: "",
  category: "cidadaos",
  external: false,
};

function AdminQuickAccess() {
  const { items, add, update, remove, reset } = useQuickAccess();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [tab, setTab] = useState<QuickAccessCategory>("cidadaos");

  const openNew = (cat: QuickAccessCategory) => {
    setEditingId(null);
    setForm({ ...emptyForm, category: cat });
    setOpen(true);
  };

  const openEdit = (item: QuickAccessItem) => {
    setEditingId(item.id);
    setForm({
      label: item.label,
      tag: item.tag ?? "",
      icon: item.icon,
      url: item.url,
      category: item.category,
      external: item.external,
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.label.trim() || !form.url.trim()) return;
    const payload = { ...form, tag: form.tag?.trim() || undefined };
    if (editingId) update(editingId, payload);
    else add(payload);
    setOpen(false);
  };

  return (
    <div className="space-y-8 animate-[fade-up_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Acesso Rápido</h2>
          <p className="text-slate-500">
            Gerencie os atalhos exibidos na seção "Acesso Rápido" da home.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-2" /> Restaurar padrões
          </Button>
          <Button className="bg-primary-deep text-white hover:bg-primary-deep/90" onClick={() => openNew(tab)}>
            <Plus className="w-4 h-4 mr-2" /> Novo Atalho
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as QuickAccessCategory)}>
        <TabsList className="bg-white border border-slate-200 h-auto p-1">
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c} value={c} className="px-4 py-2">
              {CATEGORY_LABELS[c]}
              <Badge variant="outline" className="ml-2 text-[10px]">
                {items.filter((i) => i.category === c).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((c) => {
          const list = items.filter((i) => i.category === c);
          return (
            <TabsContent key={c} value={c} className="mt-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-16">Ícone</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Tag</TableHead>
                      <TableHead>URL / Rota</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-400 py-10">
                          Nenhum atalho nesta categoria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      list.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50/50">
                          <TableCell>
                            <div className="w-9 h-9 rounded-lg bg-primary/5 text-primary grid place-items-center">
                              <QuickAccessIconRender name={item.icon} className="w-4 h-4" />
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-slate-900">{item.label}</TableCell>
                          <TableCell>
                            {item.tag ? (
                              <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                                {item.tag}
                              </Badge>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-500 max-w-xs truncate">
                            {item.url}
                          </TableCell>
                          <TableCell>
                            {item.external ? (
                              <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                <ExternalLink className="w-3 h-3" /> Externo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                                <LinkIcon className="w-3 h-3" /> Interno
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEdit(item)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => remove(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar atalho" : "Novo atalho"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v as QuickAccessCategory })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ícone</Label>
                <Select
                  value={form.icon}
                  onValueChange={(v) => setForm({ ...form, icon: v as QuickAccessIcon })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((i) => (
                      <SelectItem key={i} value={i}>
                        <span className="inline-flex items-center gap-2">
                          <QuickAccessIconRender name={i} className="w-4 h-4" />
                          {i}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Ex: Licitações"
              />
            </div>

            <div className="space-y-2">
              <Label>Tag (opcional)</Label>
              <Input
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                placeholder="Ex: NFSE, IPTU, E-MAIL"
              />
            </div>

            <div className="space-y-2">
              <Label>URL / Rota *</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="/transparencia ou https://servico.gov.br"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium">Link externo</p>
                <p className="text-xs text-slate-500">
                  Abre em nova aba. Desative para rotas internas do portal.
                </p>
              </div>
              <Switch
                checked={form.external}
                onCheckedChange={(v) => setForm({ ...form, external: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} className="bg-primary-deep text-white hover:bg-primary-deep/90">
              {editingId ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
