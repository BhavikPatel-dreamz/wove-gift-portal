import { redirect } from "next/navigation";
import PromoCodeForm from "@/components/admin/PromoCodeForm";
import { getSession } from "@/lib/action/userAction/session";
import { getPromoCodeById } from "@/lib/action/promoCodeAction";
import { isAdminRole } from "@/lib/roles";

export default async function EditPromoCodePage({ params }) {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  if (!isAdminRole(user.role)) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const promoCode = await getPromoCodeById(id);

  return <PromoCodeForm initialPromoCode={promoCode} />;
}
