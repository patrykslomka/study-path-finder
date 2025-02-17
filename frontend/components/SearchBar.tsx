import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBar({ query, setQuery, onSearch }) {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Enter your interests..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button onClick={onSearch}>Search</Button>
    </div>
  );
}
