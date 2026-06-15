import { redirect } from "next/navigation";
import AdminUsersManager from "@/components/admin/AdminUsersManager";
import { getAdminUsers } from "@/lib/action/adminInviteAction";
import { getSession } from "@/lib/action/userAction/session";
import { isAdminRole, isSuperAdminRole } from "@/lib/roles";

export default async function AdminUsersPage() {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  if (!isAdminRole(user.role)) {
    redirect("/");
  }

  const adminUsers = await getAdminUsers();

  return (
    <AdminUsersManager
      initialUsers={adminUsers}
      canInviteSuperAdmin={isSuperAdminRole(user.role)}
      currentUserId={user.id}
    />
  );
}
