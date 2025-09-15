import { ReactNode } from "react";
import AppLayout from "../../components/layout/AppLayout";

export default async function AuthLayout({ children }) {
 return (
      <AppLayout>{children}</AppLayout>
  );
}