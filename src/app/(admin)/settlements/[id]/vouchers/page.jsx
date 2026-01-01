"use client";

import VouchersTab from "../../../../../components/settlements/VouchersTab";
import { useParams } from "next/navigation";

const page = () => {
  const params = useParams();
  const settlementId = params.id;

  return (
    <>
      <VouchersTab settlementId={settlementId} />
    </>
  );
};

export default page;
