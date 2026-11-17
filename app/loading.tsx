import { LoadingTile } from "@/app/business/components/loading-tile";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090909] px-5">
      <LoadingTile label="Processing request" />
    </main>
  );
}
