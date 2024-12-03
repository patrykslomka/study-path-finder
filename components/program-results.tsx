interface Program {
  name: string;
  description: string;
  subjects: string[];
  careers: string[];
  skills: string[];
  keywords: string[];
}

interface ProgramResultsProps {
  programs: Program[];
}

export function ProgramResults({ programs }: ProgramResultsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Top {programs.length} Matching Programs:</h2>
      {programs.map((program, index) => (
        <div key={index} className="border p-4 rounded-lg">
          <h3 className="text-xl font-semibold">{program.name}</h3>
          <p className="mt-2">{program.description}</p>
          <div className="mt-4">
            <h4 className="font-semibold">Subjects:</h4>
            <p>{program.subjects.join(', ')}</p>
          </div>
          <div className="mt-2">
            <h4 className="font-semibold">Careers:</h4>
            <p>{program.careers.join(', ')}</p>
          </div>
          <div className="mt-2">
            <h4 className="font-semibold">Skills:</h4>
            <p>{program.skills.join(', ')}</p>
          </div>
          <div className="mt-2">
            <h4 className="font-semibold">Keywords:</h4>
            <p>{program.keywords.join(', ')}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

