import { motion } from "framer-motion";

const ReportsPage = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-display font-extrabold">Relatórios ⚙️</h1>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-2xl shadow-card p-6">
        <h3 className="font-display font-bold text-lg mb-4">📊 Receita por Plano</h3>
        <div className="space-y-4">
          {[
            { plan: "Mensal (R$ 74,90)", pct: 45, color: "bg-primary" },
            { plan: "Trimestral (R$ 179,00)", pct: 35, color: "bg-accent" },
            { plan: "Semestral (R$ 259,90)", pct: 20, color: "bg-sun" },
          ].map((p) => (
            <div key={p.plan}>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span>{p.plan}</span>
                <span>{p.pct}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div className={`h-full ${p.color} rounded-full`} initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} transition={{ duration: 0.8 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card rounded-2xl shadow-card p-6">
        <h3 className="font-display font-bold text-lg mb-4">👥 Crescimento de Usuários</h3>
        <div className="space-y-3">
          {[
            { month: "Janeiro", users: 280 },
            { month: "Fevereiro", users: 450 },
            { month: "Março", users: 517 },
          ].map((m) => (
            <div key={m.month} className="flex items-center gap-4">
              <span className="text-sm font-bold w-24">{m.month}</span>
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-hero rounded-full" initial={{ width: 0 }} animate={{ width: `${(m.users / 600) * 100}%` }} transition={{ duration: 0.8 }} />
              </div>
              <span className="text-sm font-bold w-12 text-right">{m.users}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="bg-card rounded-2xl shadow-card p-6">
      <h3 className="font-display font-bold text-lg mb-4">💰 Resumo Financeiro</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Receita Total", value: "R$ 189.540" },
          { label: "Comissões Pagas", value: "R$ 12.360" },
          { label: "Taxa de Conversão", value: "31.6%" },
          { label: "Ticket Médio", value: "R$ 142,50" },
        ].map((f) => (
          <div key={f.label} className="text-center p-4 bg-muted/50 rounded-xl">
            <p className="text-2xl font-extrabold">{f.value}</p>
            <p className="text-xs text-muted-foreground font-bold">{f.label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ReportsPage;

