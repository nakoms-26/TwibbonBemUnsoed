import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditForm from "./EditForm";

export default async function EditTwibbonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const twibbon = await prisma.twibbon.findUnique({
    where: { id: parseInt(id) }
  });

  if (!twibbon) {
    notFound();
  }

  return <EditForm twibbon={twibbon} />;
}
