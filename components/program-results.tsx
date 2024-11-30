interface Program {
    name: string;
    description: string;
  }
  
  interface ProgramResultsProps {
    programs: Program[];
  }
  
  export function ProgramResults({ programs }: ProgramResultsProps) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Top 3 Matching Programs:</h2>
        {programs.map((program, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <h3 className="text-xl font-semibold">{program.name}</h3>
            <p className="mt-2">{program.description}</p>
          </div>
        ))}
      </div>
    )
  }
  
  