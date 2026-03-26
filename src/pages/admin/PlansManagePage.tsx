import { useEffect, useState } from "react";
import { ActionButtons, CrudTable } from "./AdminUi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

type PlanRow = {
  id: string;
  code: string | null;
  name: string;
  period_months: number;
  billing_cycle: string | null;
  price: number;
};

type PlanSelectRow = {
  id: string;
  code: string | null;
  name: string;
  period_months: number | null;
  billing_cycle: string | null;
  price: number | null;
};

const formatBrlFromDigits = (digitsOnly: string) => {
  const digits = String(digitsOnly || "").replace(/\D/g, "");
  if (!digits) return "";
  const cents = Number(digits);
  const integer = Math.floor(cents / 100);
  const decimal = cents % 100;
  const integerFormatted = String(integer).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${integerFormatted},${String(decimal).padStart(2, "0")}`;
};

const formatBrlFromNumber = (value: number) => {
  const cents = Math.round(Number(value || 0) * 100);
  return formatBrlFromDigits(String(cents));
};

const parseBrlToNumber = (value: string) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits) / 100;
};

const PlansManagePage = () => {
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [planCode, setPlanCode] = useState("");
  const [planName, setPlanName] = useState("");
  const [planMonths, setPlanMonths] = useState(1);
  const [planCycle, setPlanCycle] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const loadRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("plans")
      .select("id,code,name,period_months,billing_cycle,price")
      .order("period_months");
    if (error) {
      alert(error.message);
      setRows([]);
      setLoading(false);
      return;
    }
    const mapped =
      ((data ?? []) as PlanSelectRow[]).map((p) => ({
        id: p.id,
        code: p.code ?? null,
        name: p.name,
        period_months: Number(p.period_months ?? 1),
        billing_cycle: p.billing_cycle ?? null,
        price: Number(p.price ?? 0),
      })) ?? [];
    setRows(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadRows().then(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-display font-extrabold mb-6">Planos ⚙️</h1>

      <div className="mb-4">
        <Button
          className="rounded-xl bg-gradient-hero font-bold"
          onClick={() => {
            setEditingId(null);
            setPlanCode("");
            setPlanName("");
            setPlanMonths(1);
            setPlanCycle("");
            setPlanPrice("");
            setEditOpen(true);
          }}
        >
          Novo plano
        </Button>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar plano" : "Novo plano"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="planCode">Código</Label>
              <Input id="planCode" className="rounded-xl" value={planCode} onChange={(e) => setPlanCode(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="planName">Nome</Label>
              <Input id="planName" className="rounded-xl" value={planName} onChange={(e) => setPlanName(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="planMonths">Meses</Label>
                <Input
                  id="planMonths"
                  className="rounded-xl"
                  inputMode="numeric"
                  value={String(planMonths)}
                  onChange={(e) => setPlanMonths(Math.max(1, Number(e.target.value || "1")))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="planCycle">Ciclo</Label>
                <Input id="planCycle" className="rounded-xl" placeholder="mensal|trimestral|semestral" value={planCycle} onChange={(e) => setPlanCycle(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="planPrice">Preço (R$)</Label>
                <Input
                  id="planPrice"
                  className="rounded-xl"
                  inputMode="decimal"
                  value={planPrice}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setPlanPrice(formatBrlFromDigits(digits));
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button variant="outline" className="rounded-xl" type="button" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              className="bg-gradient-hero rounded-xl font-bold"
              type="button"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                const priceNum = parseBrlToNumber(planPrice);
                const payload = {
                  code: planCode || null,
                  name: planName || "",
                  period_months: Number(planMonths || 1),
                  billing_cycle: planCycle || null,
                  price: Number(priceNum || 0),
                };
                const resp = editingId
                  ? await supabase.from("plans").update(payload).eq("id", editingId)
                  : await supabase.from("plans").insert(payload);
                setSaving(false);
                if (resp.error) {
                  alert(resp.error.message);
                  return;
                }
                setEditOpen(false);
                loadRows().then(() => {});
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <p className="text-muted-foreground font-bold">Carregando…</p>
      ) : (
        <CrudTable
          columns={["Código", "Nome", "Meses", "Ciclo", "Preço"]}
          data={rows}
          renderRow={(p) => (
            <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
              <td className="p-4 font-bold">{p.code ?? "—"}</td>
              <td className="p-4">{p.name}</td>
              <td className="p-4">{p.period_months}</td>
              <td className="p-4">{p.billing_cycle ?? "—"}</td>
              <td className="p-4">R$ {p.price.toFixed(2)}</td>
              <ActionButtons
                onEdit={() => {
                  setEditingId(p.id);
                  setPlanCode(p.code ?? "");
                  setPlanName(p.name);
                  setPlanMonths(p.period_months);
                  setPlanCycle(p.billing_cycle ?? "");
                  setPlanPrice(formatBrlFromNumber(p.price));
                  setEditOpen(true);
                }}
                onDelete={async () => {
                  const del = await supabase.from("plans").delete().eq("id", p.id);
                  if (del.error) {
                    alert(del.error.message);
                    return;
                  }
                  setRows((prev) => prev.filter((x) => x.id !== p.id));
                }}
              />
            </tr>
          )}
        />
      )}
    </div>
  );
};

export default PlansManagePage;
