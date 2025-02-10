import { StudyPathFinder } from "@/components/study-path-finder"

export default function Page() {
  return (
    <main className="container mx-auto p-4 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Find Your Study Path</h1>
          <p className="text-muted-foreground text-lg">
            Discover the perfect bachelor&apos;s program at Tilburg University based on your interests and goals
          </p>
        </div>
        <StudyPathFinder />
      </div>
    </main>
  )
}

