import { redirect } from "next/navigation";

const OccasionPage = async ({ params }) => {
  const { id } = await params;
  redirect(`/occasions/${id}/cards`);
};

export default OccasionPage;
