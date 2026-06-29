import { redirect } from "next/navigation";

type Params = { id: string };

export default async function GalleryDetailRedirect({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  redirect(`/discover/galleries/${id}`);
}
