import React from "react";
import { Card, CardContent, CardTitle } from "@/frontend/components/ui/card";

export function ProgramCard({ program }) {
  return (
    <Card className="border rounded-lg p-4">
      <CardTitle>{program.name}</CardTitle>
      <CardContent>
        <p>{program.description}</p>
        <p className="text-sm text-gray-500">Skills: {program.skills.join(", ")}</p>
        <p className="text-sm text-gray-500">Careers: {program.careers.join(", ")}</p>
      </CardContent>
    </Card>
  );
}
