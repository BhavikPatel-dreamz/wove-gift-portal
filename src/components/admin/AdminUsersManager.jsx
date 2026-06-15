"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { MailPlus, Power, PowerOff, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  inviteAdminUser,
  setAdminActiveStatus,
} from "@/lib/action/adminInviteAction";

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function RoleBadge({ role }) {
  const className = role === "SUPER_ADMIN"
    ? "border-purple-200 bg-purple-50 text-purple-700"
    : "border-blue-200 bg-blue-50 text-blue-700";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
      {role === "SUPER_ADMIN" ? "Super admin" : "Admin"}
    </span>
  );
}

export default function AdminUsersManager({
  initialUsers,
  canInviteSuperAdmin = false,
  currentUserId = null,
}) {
  const [users, setUsers] = useState(initialUsers || []);
  const [inviteResult, setInviteResult] = useState(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef(null);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (a.role !== b.role) return a.role === "SUPER_ADMIN" ? -1 : 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [users]);

  const handleInvite = (formData) => {
    setInviteResult(null);

    startTransition(async () => {
      try {
        const result = await inviteAdminUser(formData);
        setInviteResult(result);
        setUsers((prev) => {
          const withoutUser = prev.filter((user) => user.id !== result.user.id);
          return [result.user, ...withoutUser];
        });
        formRef.current?.reset();

        if (result.action === "promoted") {
          toast.success("Existing user promoted to backend admin.");
        } else {
          toast.success("Admin invitation created.");
        }

        if (!result.emailSent && result.emailError) {
          toast.error("Invite created, but email was not sent.");
        }
      } catch (error) {
        toast.error(error.message || "Failed to invite admin.");
      }
    });
  };

  const updateUser = (updatedUser) => {
    setUsers((prev) => prev.map((user) => (
      user.id === updatedUser.id ? updatedUser : user
    )));
  };

  const canManageUser = (user) => {
    if (user.role === "SUPER_ADMIN" && !canInviteSuperAdmin) return false;
    return true;
  };

  const handleStatusChange = (user) => {
    const nextIsActive = !user.isActive;
    const actionLabel = nextIsActive ? "enable" : "disable";

    if (!confirm(`Are you sure you want to ${actionLabel} ${user.email}?`)) return;

    const formData = new FormData();
    formData.set("userId", user.id);
    formData.set("isActive", String(nextIsActive));

    startTransition(async () => {
      try {
        const result = await setAdminActiveStatus(formData);
        updateUser(result.user);
        toast.success(`Admin ${nextIsActive ? "enabled" : "disabled"}.`);
      } catch (error) {
        toast.error(error.message || "Failed to update admin status.");
      }
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-gray-900">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-950">Backend Administrators</h1>
        <p className="text-sm text-gray-600">
          Invite trusted team members to access the Wove backend.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <MailPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Invite administrator</h2>
              <p className="text-sm text-gray-500">Invitees set their own password from email.</p>
            </div>
          </div>

          <form ref={formRef} action={handleInvite} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-gray-700">
                First name
                <input
                  name="firstName"
                  required
                  maxLength={100}
                  className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Jane"
                />
              </label>

              <label className="space-y-1.5 text-sm font-medium text-gray-700">
                Last name
                <input
                  name="lastName"
                  required
                  maxLength={100}
                  className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Doe"
                />
              </label>
            </div>

            <label className="space-y-1.5 text-sm font-medium text-gray-700">
              Email address
              <input
                name="email"
                type="email"
                required
                className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="admin@example.com"
              />
            </label>

            <label className="space-y-1.5 text-sm font-medium text-gray-700">
              Role
              <select
                name="role"
                defaultValue="ADMIN"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="ADMIN">Admin</option>
                {canInviteSuperAdmin ? (
                  <option value="SUPER_ADMIN">Super admin</option>
                ) : null}
              </select>
            </label>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 mt-5 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <MailPlus className="h-4 w-4" />
              {isPending ? "Inviting..." : "Invite admin"}
            </button>
          </form>

          {inviteResult ? (
            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-semibold">
                {inviteResult.action === "promoted" ? "User promoted" : "Admin created"}
              </p>
              <p className="mt-1">{inviteResult.user.email}</p>
              <p className="mt-3">
                {inviteResult.emailSent
                  ? "Invitation email sent. The receiver will set their own password."
                  : `Email not sent${inviteResult.emailError ? `: ${inviteResult.emailError}` : "."}`}
              </p>
            </div>
          ) : null}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Current admins</h2>
                <p className="text-sm text-gray-500">{sortedUsers.length} backend user{sortedUsers.length === 1 ? "" : "s"}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">User</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Role</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Created</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {sortedUsers.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const canManage = canManageUser(user);
                  const statusDisabled = isPending || isSelf || !canManage;

                  return (
                    <tr key={user.id}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-950">{`${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unnamed admin"}</p>
                        <p className="text-gray-500">{user.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          user.isActive
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-gray-200 bg-gray-50 text-gray-600"
                        }`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(user)}
                          disabled={statusDisabled}
                          title={isSelf ? "You cannot disable your own account" : undefined}
                          className={`inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 ${
                            user.isActive
                              ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                              : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          {user.isActive ? (
                            <PowerOff className="h-3.5 w-3.5" />
                          ) : (
                            <Power className="h-3.5 w-3.5" />
                          )}
                          {user.isActive ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
