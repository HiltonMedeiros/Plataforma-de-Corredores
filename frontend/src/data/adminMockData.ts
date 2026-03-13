// ── Admin Mock Data ────────────────────────────────────────────────────────

export const adminMetrics = {
  totalUsers: 1247,
  totalUsersGrowth: 12,
  activeUsers: 856,
  activeUsersGrowth: 8,
  totalKm: 15847,
  totalKmGrowth: 23,
  newToday: 18,
  newTodayDelta: 5,
};

export const userGrowthData = [
  { month: "Out", users: 620 },
  { month: "Nov", users: 754 },
  { month: "Dez", users: 831 },
  { month: "Jan", users: 952 },
  { month: "Fev", users: 1104 },
  { month: "Mar", users: 1247 },
];

export const activityByNeighborhood = [
  { neighborhood: "Centro", count: 345 },
  { neighborhood: "Norte", count: 287 },
  { neighborhood: "Sul", count: 256 },
  { neighborhood: "Leste", count: 198 },
  { neighborhood: "Oeste", count: 167 },
];

export const levelDistribution = [
  { name: "Bronze (5km)", value: 412, color: "#f97316" },
  { name: "Prata (10km)", value: 328, color: "#94a3b8" },
  { name: "Ouro (21km)", value: 287, color: "#eab308" },
  { name: "Diamante (42km)", value: 220, color: "#3b82f6" },
];

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  neighborhood: string;
  km: number;
  activeDays: number;
  status: "ativo" | "inativo" | "bloqueado";
  joinedAt: string;
  profileComplete: boolean;
};

export const adminUsers: AdminUser[] = [
  { id: 1, name: "Ana Paula S.", email: "ana.paula@email.com", neighborhood: "Centro", km: 32.4, activeDays: 22, status: "ativo", joinedAt: "01/01/2026", profileComplete: true },
  { id: 2, name: "João Marcos R.", email: "joao.marcos@email.com", neighborhood: "Norte", km: 28.7, activeDays: 19, status: "ativo", joinedAt: "03/01/2026", profileComplete: true },
  { id: 3, name: "Carlos Oliveira", email: "carlos@bayeux.com", neighborhood: "Centro", km: 15.8, activeDays: 12, status: "ativo", joinedAt: "05/01/2026", profileComplete: true },
  { id: 4, name: "Fernanda Lima", email: "fernanda.lima@email.com", neighborhood: "Sul", km: 14.2, activeDays: 10, status: "ativo", joinedAt: "08/01/2026", profileComplete: false },
  { id: 5, name: "Ricardo Santos", email: "ricardo.s@email.com", neighborhood: "Leste", km: 12.9, activeDays: 9, status: "inativo", joinedAt: "10/01/2026", profileComplete: true },
  { id: 6, name: "Mariana Costa", email: "mariana.c@email.com", neighborhood: "Oeste", km: 9.5, activeDays: 7, status: "ativo", joinedAt: "12/01/2026", profileComplete: false },
  { id: 7, name: "Pedro Alves", email: "pedro.alves@email.com", neighborhood: "Norte", km: 8.1, activeDays: 6, status: "bloqueado", joinedAt: "15/01/2026", profileComplete: true },
  { id: 8, name: "Camila Rocha", email: "camila.r@email.com", neighborhood: "Centro", km: 6.3, activeDays: 5, status: "ativo", joinedAt: "18/01/2026", profileComplete: true },
  { id: 9, name: "Lucas Ferreira", email: "lucas.f@email.com", neighborhood: "Sul", km: 5.7, activeDays: 4, status: "inativo", joinedAt: "20/01/2026", profileComplete: false },
  { id: 10, name: "Beatriz Nunes", email: "beatriz.n@email.com", neighborhood: "Leste", km: 4.2, activeDays: 3, status: "ativo", joinedAt: "22/01/2026", profileComplete: true },
];

export type PendingActivity = {
  id: number;
  userName: string;
  userAvatar: string;
  km: number;
  date: string;
  type: "corrida" | "caminhada";
  suspicious: boolean;
};

export const pendingActivities: PendingActivity[] = [
  { id: 1, userName: "Ricardo Santos", userAvatar: "RS", km: 62.5, date: "08/03/2026", type: "corrida", suspicious: true },
  { id: 2, userName: "Fernanda Lima", userAvatar: "FL", km: 8.3, date: "07/03/2026", type: "corrida", suspicious: false },
  { id: 3, userName: "Mariana Costa", userAvatar: "MC", km: 55.1, date: "06/03/2026", type: "caminhada", suspicious: true },
  { id: 4, userName: "Lucas Ferreira", userAvatar: "LF", km: 4.7, date: "05/03/2026", type: "caminhada", suspicious: false },
  { id: 5, userName: "Camila Rocha", userAvatar: "CR", km: 11.2, date: "04/03/2026", type: "corrida", suspicious: false },
];

export type Medal = {
  id: number;
  name: string;
  emoji: string;
  description: string;
  requirement: string;
  usersEarned: number;
  color: string;
};

export const adminMedals: Medal[] = [
  { id: 1, name: "Bronze", emoji: "🥉", description: "Primeira conquista do participante", requirement: "5 km acumulados", usersEarned: 412, color: "#f97316" },
  { id: 2, name: "Prata", emoji: "🥈", description: "Atleta intermediário em evolução", requirement: "10 km acumulados", usersEarned: 328, color: "#94a3b8" },
  { id: 3, name: "Ouro", emoji: "🥇", description: "Corredor dedicado e consistente", requirement: "21 km acumulados", usersEarned: 287, color: "#eab308" },
  { id: 4, name: "Diamante", emoji: "💎", description: "Elite do programa Bayeux", requirement: "42 km acumulados", usersEarned: 220, color: "#3b82f6" },
];

export const systemAlerts = [
  { id: 1, type: "warning" as const, message: "3 usuários reportaram problema no app hoje", time: "Há 15 minutos" },
  { id: 2, type: "success" as const, message: "Sistema de API funcionando normalmente", time: "Há 1 hora" },
  { id: 3, type: "info" as const, message: "Backup automático realizado com sucesso", time: "Há 2 horas" },
  { id: 4, type: "info" as const, message: "18 novos cadastros registrados hoje", time: "Hoje" },
];
