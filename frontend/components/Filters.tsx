import React from "react";
import { Select, SelectItem } from "@/frontend/components/ui/select";

const subjects = ["All", "AI", "Data Science", "Economics", "Law", "Psychology"];
const skills = ["All", "Programming", "Data Analysis", "Research", "Leadership"];
const careers = ["All", "Consulting", "Researcher", "Software Engineer"];

export function Filters({ filters, setFilters }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Select value={filters.subjects} onValueChange={(value) => setFilters((prev) => ({ ...prev, subjects: value }))}>
        {subjects.map((subject) => (
          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
        ))}
      </Select>

      <Select value={filters.skills} onValueChange={(value) => setFilters((prev) => ({ ...prev, skills: value }))}>
        {skills.map((skill) => (
          <SelectItem key={skill} value={skill}>{skill}</SelectItem>
        ))}
      </Select>

      <Select value={filters.careers} onValueChange={(value) => setFilters((prev) => ({ ...prev, careers: value }))}>
        {careers.map((career) => (
          <SelectItem key={career} value={career}>{career}</SelectItem>
        ))}
      </Select>
    </div>
  );
}
