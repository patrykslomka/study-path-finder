"use client";

import { motion } from "framer-motion";
import { BookOpen, BriefcaseIcon, GraduationCap, TagIcon, ExternalLink, Trophy } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { boostPercentage } from "@/lib/match-programs";

interface Program {
  name: string;
  description: string;
  subjects: string[];
  careers: string[];
  skills: string[];
  keywords: string[];
  compatibilityPercentage: number;
  link: string;
}

interface ProgramResultsProps {
  programs: Program[];
}

export function ProgramResults({ programs }: ProgramResultsProps) {
  // Programs are already sorted and limited to top 3 from the backend
  const topPrograms = programs;

  return (
    <div className="space-y-6">
      {topPrograms.map((program, index) => (
        <motion.div
          key={program.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={index === 0 ? "border-2 border-primary" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {index === 0 && <Trophy className="h-6 w-6 text-yellow-500" />}
                  <CardTitle>{program.name}</CardTitle>
                </div>
                <Badge
                  variant="default"
                  className={`text-lg px-3 py-1 ${index === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                >
                  {boostPercentage(program.compatibilityPercentage)}% Match
                </Badge>
              </div>
              <CardDescription className="mt-2">{program.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Collapsible>
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold">Career Opportunities</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {program.careers.slice(0, 3).map((career, i) => (
                          <Badge key={i} variant="outline">
                            {career}
                          </Badge>
                        ))}
                        {program.careers.length > 3 && (
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="h-6 px-2 text-xs">
                              +{program.careers.length - 3} more
                            </Button>
                          </CollapsibleTrigger>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold">Key Skills</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {program.skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="default">
                            {skill}
                          </Badge>
                        ))}
                        {program.skills.length > 3 && (
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="h-6 px-2 text-xs">
                              +{program.skills.length - 3} more
                            </Button>
                          </CollapsibleTrigger>
                        )}
                      </div>
                    </div>
                  </div>
                  <CollapsibleContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-semibold">Core Subjects</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {program.subjects.map((subject, i) => (
                            <Badge key={i} variant="secondary">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TagIcon className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-semibold">Keywords</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {program.keywords.map((keyword, i) => (
                            <Badge key={i} variant="outline">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <a href={program.link} target="_blank" rel="noopener noreferrer">
                    Learn More
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}