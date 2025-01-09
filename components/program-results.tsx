import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
      {programs.map((program, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{program.name}</CardTitle>
            <CardDescription>{program.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Subjects:</h4>
                <div className="flex flex-wrap gap-2">
                  {program.subjects.map((subject, i) => (
                    <Badge key={i} variant="secondary">{subject}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Careers:</h4>
                <div className="flex flex-wrap gap-2">
                  {program.careers.map((career, i) => (
                    <Badge key={i} variant="outline">{career}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {program.skills.map((skill, i) => (
                    <Badge key={i} variant="default">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

