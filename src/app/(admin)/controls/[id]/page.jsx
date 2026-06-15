import { redirect } from "next/navigation";

const ControlPage = async ({ params }) => {
  const { id } = await params;
  redirect(`/controls/${id}/edit`);
};

export default ControlPage;
