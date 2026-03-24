import { useEffect, useState } from "react";
import { ActionButtons, CrudTable, StatusBadge } from "./AdminUi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

type AdminUsersViewRow = {
  user_id: string;
  name: string | null;
  email: string | null;
  cpf: string | null;
  role: string | null;
  plan_name: string | null;
  subscription_status: string | null;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: string;
  plan: string;
  subscription_status: string | null;
};

const UsersPage = () => {
  const [usersData, setUsersData] = useState<UserRow[]>([]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userCpf, setUserCpf] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [userPlan, setUserPlan] = useState("—");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.from("v_admin_users").select("*").order("user_id");
      if (!mounted) return;
      const mapped =
        ((data ?? []) as AdminUsersViewRow[]).map((r) => ({
          id: r.user_id,
          name: r.name ?? "-",
          email: r.email ?? "-",
          cpf: r.cpf ?? "",
          role: r.role ?? "user",
          plan: r.plan_name ?? "—",
          subscription_status: r.subscription_status ?? null,
        })) ?? [];
      setUsersData(mapped);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-display font-extrabold mb-6">Usuários ⚙️</h1>

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="userName">Nome</Label>
              <Input id="userName" className="rounded-xl" value={userName} onChange={(e) => setUserName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userEmail">Email</Label>
              <Input id="userEmail" type="email" className="rounded-xl" value={userEmail} readOnly />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="userCpf">CPF</Label>
                <Input id="userCpf" className="rounded-xl" value={userCpf} onChange={(e) => setUserCpf(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="userRole">Role</Label>
                <select
                  id="userRole"
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                  <option value="super_admin">super_admin</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="userPlan">Plano</Label>
                <select
                  id="userPlan"
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  value={userPlan}
                  onChange={(e) => setUserPlan(e.target.value)}
                  disabled
                >
                  <option value={userPlan}>{userPlan}</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Input
                  className="rounded-xl"
                  value={(usersData.find((u) => u.id === editingUserId)?.subscription_status ?? "—") || "—"}
                  readOnly
                />
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button variant="outline" className="rounded-xl" type="button" onClick={() => setUserDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-gradient-hero rounded-xl font-bold"
              type="button"
              onClick={async () => {
                if (editingUserId === null) {
                  setUserDialogOpen(false);
                  return;
                }
                const upd = await supabase
                  .from("profiles")
                  .update({ name: userName || null, cpf: userCpf || null, role: userRole || null })
                  .eq("id", editingUserId);
                if (upd.error) {
                  alert(upd.error.message);
                  return;
                }
                setUsersData((prev) => prev.map((u) => (u.id === editingUserId ? { ...u, name: userName, cpf: userCpf, role: userRole } : u)));
                setUserDialogOpen(false);
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CrudTable
        columns={["Nome", "Email", "Plano", "Status", "Role"]}
        data={usersData}
        renderRow={(u) => (
          <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
            <td className="p-4 font-bold">{u.name}</td>
            <td className="p-4">{u.email}</td>
            <td className="p-4">{u.plan}</td>
            <td className="p-4">
              <StatusBadge active={(u.subscription_status ?? "").toLowerCase() === "active" || (u.subscription_status ?? "").toLowerCase() === "ativa"} activeLabel="Ativa" inactiveLabel="—" />
            </td>
            <td className="p-4">{u.role ?? "user"}</td>
            <ActionButtons
              onEdit={() => {
                setEditingUserId(u.id);
                setUserName(u.name);
                setUserEmail(u.email);
                setUserCpf(u.cpf ?? "");
                setUserRole(u.role ?? "user");
                setUserPlan(u.plan ?? "—");
                setUserDialogOpen(true);
              }}
            />
          </tr>
        )}
      />
    </div>
  );
};

export default UsersPage;
