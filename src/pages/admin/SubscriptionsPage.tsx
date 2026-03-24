import { useEffect, useState } from "react";
import { ActionButtons, CrudTable, StatusBadge } from "./AdminUi";
import { supabase } from "@/lib/supabase";

type SubscriptionSelectRow = {
  id: string;
  status: string | null;
  value: number | null;
  expires_at: string | null;
  profiles: { name: string | null } | null;
  plans: { name: string | null } | null;
};

type SubscriptionRow = {
  id: string;
  user: string;
  plan: string;
  value: number;
  status: string;
  expires: string;
};

const SubscriptionsPage = () => {
  const [rows, setRows] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("id,status,value,expires_at,profiles(name),plans(name)")
      .order("expires_at", { ascending: false });
    if (error) {
      alert(error.message);
      setRows([]);
      setLoading(false);
      return;
    }
    const mapped =
      ((data ?? []) as SubscriptionSelectRow[]).map((s) => ({
        id: s.id,
        user: s.profiles?.name ?? "-",
        plan: s.plans?.name ?? "-",
        value: Number(s.value ?? 0),
        status: s.status ?? "-",
        expires: s.expires_at ? new Date(s.expires_at).toLocaleDateString() : "—",
      })) ?? [];
    setRows(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadRows().then(() => {});
    return () => {
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-display font-extrabold mb-6">Assinaturas ⚙️</h1>
      {loading ? (
        <p className="text-muted-foreground font-bold">Carregando…</p>
      ) : (
        <CrudTable
          columns={["Usuário", "Plano", "Valor", "Status", "Vencimento"]}
          data={rows}
          renderRow={(s) => (
            <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
              <td className="p-4 font-bold">{s.user}</td>
              <td className="p-4">{s.plan}</td>
              <td className="p-4">R$ {s.value.toFixed(2)}</td>
              <td className="p-4">
                <StatusBadge active={(s.status ?? "").toLowerCase() === "ativa" || (s.status ?? "").toLowerCase() === "active"} activeLabel="Ativa" inactiveLabel="Expirada" />
              </td>
              <td className="p-4">{s.expires}</td>
              <ActionButtons
                onDelete={async () => {
                  const del = await supabase.from("subscriptions").delete().eq("id", s.id);
                  if (del.error) {
                    alert(del.error.message);
                    return;
                  }
                  setRows((prev) => prev.filter((x) => x.id !== s.id));
                }}
              />
            </tr>
          )}
        />
      )}
    </div>
  );
};

export default SubscriptionsPage;
