import { StudyPathFinder } from "@/components/study-path-finder";

export default function Page() {
  return (
    <main className="container mx-auto p-4 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <StudyPathFinder />
      </div>
    </main>
  );
}