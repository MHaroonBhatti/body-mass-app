import { notFound } from "next/navigation";
import { PhotoStep } from "@/components/scan/PhotoStep";
import { parseScanViewParam } from "@/lib/validation/views";

export default async function PhotoViewPage({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const { view: raw } = await params;
  const view = parseScanViewParam(raw);
  if (!view) notFound();

  return (
    <div className="mx-auto max-w-lg">
      <PhotoStep view={view} />
    </div>
  );
}
