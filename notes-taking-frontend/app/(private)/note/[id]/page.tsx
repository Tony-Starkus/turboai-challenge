import { DashboardRoutePage } from "../../page";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DashboardRoutePage routeNoteId={id} />;
}
