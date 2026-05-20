import { redirect } from "next/navigation";
import PromoCodeForm from "@/components/admin/PromoCodeForm";
import { getSession } from "@/lib/action/userAction/session";
import { isAdminRole } from "@/lib/roles";

export default async function NewPromoCodePage() {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  if (!isAdminRole(user.role)) {
    redirect("/dashboard");
  }

  return <PromoCodeForm />;
}
