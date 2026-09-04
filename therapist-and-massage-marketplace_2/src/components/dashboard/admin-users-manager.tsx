"use client";

import { useState } from "react";
import { Trash2, Users as UsersIcon } from "lucide-react";
import { Badge, Button, EmptyState } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { formatDate, initials } from "@/lib/utils";
import { useDictionary, format } from "@/lib/i18n/locale-context";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export function AdminUsersManager({ initialUsers, currentUserId }: { initialUsers: UserRow[]; currentUserId: string }) {
  const { push } = useToast();
  const dict = useDictionary();
  const [users, setUsers] = useState(initialUsers);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function remove(user: UserRow) {
    if (!confirm(format(dict.adminUsersPage.confirmDelete, { name: user.name }))) return;
    const previous = users;
    setBusyId(user.id);
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? dict.adminUsersPage.toastDeleteError);
      }
      push(dict.adminUsersPage.toastDeleted, "success");
    } catch (err: any) {
      setUsers(previous);
      push(err.message, "error");
    } finally {
      setBusyId(null);
    }
  }

  if (users.length === 0) {
    return <EmptyState icon={<UsersIcon className="h-6 w-6" />} title={dict.adminUsersPage.emptyTitle} />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">{dict.adminUsersPage.colUser}</th>
            <th className="px-4 py-3">{dict.adminUsersPage.colEmail}</th>
            <th className="px-4 py-3">{dict.adminUsersPage.colRole}</th>
            <th className="px-4 py-3">{dict.adminUsersPage.colJoined}</th>
            <th className="px-4 py-3 text-right">{dict.adminUsersPage.colActions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                    {initials(u.name)}
                  </span>
                  <span className="font-medium text-slate-800">{u.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-500">{u.email}</td>
              <td className="px-4 py-3">
                <Badge variant={u.role === "admin" ? "info" : u.role === "provider" ? "default" : "neutral"} className="capitalize">
                  {u.role}
                </Badge>
              </td>
              <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                {u.id !== currentUserId && (
                  <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50" loading={busyId === u.id} onClick={() => remove(u)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
