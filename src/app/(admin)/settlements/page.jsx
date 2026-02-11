// app/settlements/page.tsx
import { Suspense } from "react";
import { getSettlements } from "@/lib/action/brandPartner";
import SettlementsClient from "../../../components/settlements/SettlementsClient";


export default async function SettlementsPage({
  searchParams
}) {

  const params = await searchParams;

  const parameters = {
    page: params.page || "1",
    limit: params.limit || "10",
    search: params.search || "",
    status: params.status || "",
    frequency: params.frequency || "",
    filterMonth: params.filterMonth || null,
    filterYear: params.filterYear || null,
  };

  const response = await getSettlements(parameters);

  return (
      <SettlementsClient
        initialData={response.data || []}
        initialPagination={response.pagination || {}}
        initialSummary={response.summary || null}
        initialFilterInfo={response.filters || null}
      />
  );
}
