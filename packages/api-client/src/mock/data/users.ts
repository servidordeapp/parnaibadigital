import type { User } from "@parnaibadigital/types";

/**
 * T093 / FR-038 — os usuários do painel, **sem autenticação e sem permissão efetiva**.
 *
 * `role` é rótulo exibido na tela de Usuários, não uma decisão de acesso. Nada nesta fase
 * lê este campo para permitir ou negar coisa alguma — e é importante que fique explícito,
 * porque uma lista de papéis dá a impressão contrária. Quando a autenticação existir, ela
 * virá do backend (Princípio IV), nunca de um módulo de dados do frontend.
 */
export const users: readonly User[] = Object.freeze([
  { id: "user-01", name: "Marina Sousa", role: "editor", status: "ativo" },
  { id: "user-02", name: "Rafael Coelho", role: "redator", status: "ativo" },
  { id: "user-03", name: "Ana Beatriz Melo", role: "redator", status: "ativo" },
  { id: "user-04", name: "Carla Nogueira", role: "revisor", status: "ativo" },
  { id: "user-05", name: "Tiago Bastos", role: "admin", status: "ativo" },
  { id: "user-06", name: "Helena Prado", role: "revisor", status: "inativo" },
]);
