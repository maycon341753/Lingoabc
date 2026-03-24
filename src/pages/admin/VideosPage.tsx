import { useEffect, useState } from "react";
import { ActionButtons, CrudTable } from "./AdminUi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

type VideoMediaRow = {
  id: string;
  title: string;
  module: string | null;
  is_music: boolean;
  active: boolean;
  bucket: string;
  object_name: string;
};

const VideosPage = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [isMusic, setIsMusic] = useState(false);
  const [rows, setRows] = useState<VideoMediaRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("videos_media")
      .select("id,title,module,is_music,active,bucket,object_name,created_at")
      .order("created_at", { ascending: false });
    if (error) {
      alert(error.message);
      setRows([]);
      setLoading(false);
      return;
    }
    setRows((data ?? []) as VideoMediaRow[]);
    setLoading(false);
  };

  useEffect(() => {
    loadRows().then(() => {});
    return () => {
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-display font-extrabold mb-6">Vídeos ⚙️</h1>

      <div className="mb-6">
        <Button className="bg-gradient-hero rounded-xl font-bold" type="button" onClick={() => setUploadOpen(true)}>
          Upload Vídeo/Música
        </Button>
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Upload de conteúdo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Arquivo</Label>
              <input
                id="file"
                type="file"
                accept="video/*,audio/*"
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" className="rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" className="rounded-xl" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Matéria</Label>
                <select
                  id="subject"
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="">—</option>
                  <option value="Português">Português</option>
                  <option value="Matemática">Matemática</option>
                  <option value="Inglês">Inglês</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="module">Módulo</Label>
                <select
                  id="module"
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                >
                  <option value="">—</option>
                  <option value="Descoberta">Descoberta</option>
                  <option value="Construção">Construção</option>
                  <option value="Desenvolvimento">Desenvolvimento</option>
                  <option value="Domínio">Domínio</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <label className="flex items-center gap-3 rounded-xl border border-input bg-background px-3 py-2 h-10">
                <input type="checkbox" checked={isMusic} onChange={(e) => setIsMusic(e.target.checked)} />
                <span className="text-sm font-bold">Conteúdo de música (áudio)</span>
              </label>
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button variant="outline" className="rounded-xl" type="button" onClick={() => setUploadOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-gradient-hero rounded-xl font-bold"
              type="button"
              onClick={async () => {
                if (!file || !title) {
                  alert("Selecione um arquivo e informe o título.");
                  return;
                }
                const objectName = `uploads/${Date.now()}-${file.name}`;
                const up = await supabase.storage.from("videos_music").upload(objectName, file);
                if (up.error) {
                  alert(up.error.message);
                  return;
                }
                const ins = await supabase.from("videos_media").insert({
                  title,
                  description: description || null,
                  subject: subject || null,
                  module: moduleName || null,
                  bucket: "videos_music",
                  object_name: objectName,
                  is_music: isMusic,
                  active: true,
                });
                if (ins.error) {
                  alert(ins.error.message);
                  return;
                }
                alert("Upload concluído. Conteúdo disponível em /videos.");
                await loadRows();
                setUploadOpen(false);
                setFile(null);
                setTitle("");
                setDescription("");
                setSubject("");
                setModuleName("");
                setIsMusic(false);
              }}
            >
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <p className="text-muted-foreground font-bold">Carregando…</p>
      ) : (
        <CrudTable
          columns={["Título", "Módulo", "Tipo", "Status"]}
          data={rows}
          renderRow={(v) => (
            <tr key={v.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
              <td className="p-4 font-bold">{v.title}</td>
              <td className="p-4">{v.module ?? "—"}</td>
              <td className="p-4">{v.is_music ? "Música" : "Vídeo"}</td>
              <td className="p-4">{v.active ? "Ativo" : "Inativo"}</td>
              <ActionButtons
                onDelete={async () => {
                  const del = await supabase.from("videos_media").delete().eq("id", v.id);
                  if (del.error) {
                    alert(del.error.message);
                    return;
                  }
                  setRows((prev) => prev.filter((x) => x.id !== v.id));
                }}
              />
            </tr>
          )}
        />
      )}
    </div>
  );
};

export default VideosPage;
