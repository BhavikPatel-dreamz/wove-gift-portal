import { redirect } from "next/navigation";
import PromoCodesManager from "@/components/admin/PromoCodesManager";
import { getSession } from "@/lib/action/userAction/session";
import { getPromoCodes } from "@/lib/action/promoCodeAction";
import { isAdminRole } from "@/lib/roles";

export default async function ControlsPage() {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  if (!isAdminRole(user.role)) {
    redirect("/dashboard");
  }

  const promoCodes = await getPromoCodes();

  return (
    <PromoCodesManager initialPromoCodes={promoCodes} />
  );
}
