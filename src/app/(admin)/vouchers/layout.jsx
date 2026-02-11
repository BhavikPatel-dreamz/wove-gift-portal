
import { getSession } from "@/lib/action/userAction/session";
import VouchersTabs from "./_components/VouchersTabs";

export default async function VouchersLayout({ children }) {
    const session = await getSession();
    const user = session?.user;
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-[100%] mx-auto">
                <VouchersTabs user={user} />
                <div className="mt-8">
                    {children}
                </div>
            </div>
        </div>
    )
}