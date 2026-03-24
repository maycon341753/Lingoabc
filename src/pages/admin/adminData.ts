export type AdminModuleRow = {
  id: number;
  name: string;
  age: string;
  lessons: number;
  active: boolean;
};

export type LessonType = "multiple_choice" | "complete_word" | "image_match" | "drag_order";

export type AdminLessonRow = {
  id: number;
  title: string;
  module: string;
  subject: "Matemática" | "Português" | "Inglês";
  type: LessonType;
  active: boolean;
};

export const adminModules: AdminModuleRow[] = [
  { id: 1, name: "Descoberta", age: "4–5 anos", lessons: 40, active: true },
  { id: 2, name: "Construção", age: "6–7 anos", lessons: 40, active: true },
  { id: 3, name: "Desenvolvimento", age: "8–9 anos", lessons: 35, active: true },
  { id: 4, name: "Domínio", age: "10+ anos", lessons: 28, active: false },
];

export const adminLessons: AdminLessonRow[] = [
  { id: 1, title: "Somas até 5", module: "Descoberta", subject: "Matemática", type: "multiple_choice", active: true },
  { id: 2, title: "Vogais", module: "Descoberta", subject: "Português", type: "complete_word", active: true },
  { id: 3, title: "Colors", module: "Construção", subject: "Inglês", type: "image_match", active: true },
  { id: 4, title: "Ordem numérica", module: "Descoberta", subject: "Matemática", type: "drag_order", active: true },
  { id: 5, title: "Subtração", module: "Construção", subject: "Matemática", type: "multiple_choice", active: false },
];

export const adminUsers = [
  { id: 1, name: "Maria Silva", email: "maria@email.com", plan: "Mensal", active: true, joined: "15/01/2026" },
  { id: 2, name: "João Pereira", email: "joao@email.com", plan: "Trimestral", active: true, joined: "20/02/2026" },
  { id: 3, name: "Ana Lima", email: "ana@email.com", plan: "—", active: false, joined: "01/03/2026" },
  { id: 4, name: "Pedro Santos", email: "pedro@email.com", plan: "Semestral", active: true, joined: "10/03/2026" },
];

export const adminSubscriptions = [
  { id: 1, user: "Maria Silva", plan: "Mensal", value: 74.9, status: "ativa", expires: "15/04/2026" },
  { id: 2, user: "João Pereira", plan: "Trimestral", value: 179.0, status: "ativa", expires: "20/05/2026" },
  { id: 3, user: "Pedro Santos", plan: "Semestral", value: 259.9, status: "ativa", expires: "10/09/2026" },
  { id: 4, user: "Carla Rocha", plan: "Mensal", value: 74.9, status: "expirada", expires: "01/03/2026" },
];

export const adminVideos = [
  { id: 1, title: "Introdução às Somas", module: "Descoberta", duration: "5:30", views: 245 },
  { id: 2, title: "Aprendendo Vogais", module: "Descoberta", duration: "4:15", views: 189 },
  { id: 3, title: "First Words in English", module: "Construção", duration: "6:00", views: 312 },
];
