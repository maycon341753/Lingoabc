import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionButtons, CrudTable, StatusBadge } from "./AdminUi";
import { supabase } from "@/lib/supabase";

type ModuleOption = {
  id: string;
  title: string;
};

type LessonRow = {
  id: string;
  title: string;
  position: number;
  active: boolean;
  module_id: string;
  module_title: string;
};

type LessonSelectRow = {
  id: string;
  title: string;
  position: number;
  active: boolean;
  module_id: string;
  modules: { title: string } | null;
};

const LessonsPage = () => {
  const [lessonsData, setLessonsData] = useState<LessonRow[]>([]);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonModuleId, setLessonModuleId] = useState<string>("");
  const [lessonPosition, setLessonPosition] = useState<number>(1);
  const [lessonActive, setLessonActive] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [{ data: modulesData }, { data: lessonsData }] = await Promise.all([
        supabase.from("modules").select("id,title").order("title"),
        supabase.from("lessons").select("id,title,position,active,module_id,modules(title)").order("position"),
      ]);
      if (!mounted) return;
      setModules((modulesData ?? []) as ModuleOption[]);
      const mapped: LessonRow[] =
        ((lessonsData ?? []) as LessonSelectRow[]).map((r) => ({
          id: r.id,
          title: r.title,
          position: r.position,
          active: r.active,
          module_id: r.module_id,
          module_title: r.modules?.title ?? "-",
        })) ?? [];
      setLessonsData(mapped);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-display font-extrabold mb-6">Lições ⚙️</h1>

      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar lição</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="lessonTitle">Título</Label>
              <Input id="lessonTitle" className="rounded-xl" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lessonModule">Módulo</Label>
                <select
                  id="lessonModule"
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  value={lessonModuleId}
                  onChange={(e) => setLessonModuleId(e.target.value)}
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lessonPosition">Posição</Label>
                <Input
                  id="lessonPosition"
                  className="rounded-xl"
                  value={String(lessonPosition)}
                  onChange={(e) => setLessonPosition(Number(e.target.value || "1"))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <label className="flex items-center gap-3 rounded-xl border border-input bg-background px-3 py-2 h-10">
                <input type="checkbox" checked={lessonActive} onChange={(e) => setLessonActive(e.target.checked)} />
                <span className="text-sm font-bold">{lessonActive ? "Ativo" : "Inativo"}</span>
              </label>
            </div>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button variant="outline" className="rounded-xl" type="button" onClick={() => setLessonDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-gradient-hero rounded-xl font-bold"
              type="button"
              onClick={async () => {
                if (editingLessonId === null) {
                  setLessonDialogOpen(false);
                  return;
                }
                const upd = await supabase
                  .from("lessons")
                  .update({ title: lessonTitle, module_id: lessonModuleId, position: lessonPosition, active: lessonActive })
                  .eq("id", editingLessonId);
                if (upd.error) {
                  alert(upd.error.message);
                  return;
                }
                setLessonsData((prev) =>
                  prev.map((l) =>
                    l.id === editingLessonId
                      ? {
                          ...l,
                          title: lessonTitle,
                          module_id: lessonModuleId,
                          module_title: modules.find((m) => m.id === lessonModuleId)?.title ?? l.module_title,
                          position: lessonPosition,
                          active: lessonActive,
                        }
                      : l,
                  ),
                );
                setLessonDialogOpen(false);
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CrudTable
        columns={["Título", "Módulo", "Posição", "Status"]}
        data={lessonsData}
        renderRow={(l) => (
          <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
            <td className="p-4 font-bold">{l.title}</td>
            <td className="p-4">{l.module_title}</td>
            <td className="p-4">{l.position}</td>
            <td className="p-4">
              <StatusBadge active={l.active} />
            </td>
            <ActionButtons
              onEdit={() => {
                setEditingLessonId(l.id);
                setLessonTitle(l.title);
                setLessonModuleId(l.module_id);
                setLessonPosition(l.position);
                setLessonActive(l.active);
                setLessonDialogOpen(true);
              }}
              onDelete={async () => {
                const del = await supabase.from("lessons").delete().eq("id", l.id);
                if (del.error) {
                  alert(del.error.message);
                  return;
                }
                setLessonsData((prev) => prev.filter((x) => x.id !== l.id));
              }}
            />
          </tr>
        )}
      />
    </div>
  );
};

export default LessonsPage;
