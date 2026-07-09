import { requireAdmin } from "@/lib/auth/session";
import { ROLES } from "@/lib/constants";
import { listUsersForAdmin } from "@/modules/users/service";
import { toggleUserActiveAction, toggleUserRoleAction } from "./actions";

interface AdminUsersPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const admin = await requireAdmin();
  const { error } = await searchParams;
  const users = await listUsersForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
      <p className="mt-1 text-sm text-slate-500">
        Usuários desativados perdem o acesso imediatamente, mas seus anúncios e
        avaliações são preservados.
      </p>

      {error && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Acesso</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Anúncios</th>
              <th className="px-4 py-3">Avaliações</th>
              <th className="px-4 py-3">Cadastro</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const isAdmin = user.role === ROLES.ADMIN;
              const isSelf = user.id === admin.id;
              return (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {user.displayName}
                    {isSelf && <span className="ml-1.5 text-xs text-slate-400">(você)</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isAdmin ? "bg-indigo-100 text-indigo-800" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isAdmin ? "Admin" : "Usuário"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Ativo" : "Desativado"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user._count.listings}</td>
                  <td className="px-4 py-3 text-slate-600">{user._count.reviews}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {user.createdAt.toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    {!isSelf && (
                      <div className="flex justify-end gap-2">
                        <form action={toggleUserRoleAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="currentRole" value={user.role} />
                          <button
                            type="submit"
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            {isAdmin ? "Remover admin" : "Tornar admin"}
                          </button>
                        </form>
                        <form action={toggleUserActiveAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="isActive" value={String(user.isActive)} />
                          <button
                            type="submit"
                            className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                              user.isActive
                                ? "border-red-200 text-red-700 hover:bg-red-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {user.isActive ? "Desativar" : "Reativar"}
                          </button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
