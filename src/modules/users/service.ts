import { prisma } from "@/lib/prisma";
import { ROLES, type Role } from "@/lib/constants";

export interface UserActionResult {
  ok: boolean;
  error?: string;
}

export async function listUsersForAdmin() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { listings: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

/** Deactivating a user also revokes their sessions so access ends immediately. */
export async function setUserActive(
  userId: string,
  isActive: boolean,
  actingAdminId: string,
): Promise<UserActionResult> {
  if (userId === actingAdminId) {
    return { ok: false, error: "Você não pode desativar a própria conta." };
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { ok: false, error: "Usuário não encontrado." };
  }
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { isActive } });
    if (!isActive) {
      await tx.session.deleteMany({ where: { userId } });
    }
  });
  return { ok: true };
}

export async function setUserRole(
  userId: string,
  role: Role,
  actingAdminId: string,
): Promise<UserActionResult> {
  if (userId === actingAdminId) {
    return { ok: false, error: "Você não pode alterar o próprio nível de acesso." };
  }
  if (!Object.values(ROLES).includes(role)) {
    return { ok: false, error: "Nível de acesso inválido." };
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { ok: false, error: "Usuário não encontrado." };
  }
  await prisma.user.update({ where: { id: userId }, data: { role } });
  return { ok: true };
}
