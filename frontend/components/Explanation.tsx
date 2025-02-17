import React, { useState } from "react";

export function Explanation({ text }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <button className="text-blue-600" onClick={() => setExpanded(!expanded)}>
        {expanded ? "Hide Explanation" : "Show Explanation"}
      </button>
      {expanded && <p className="mt-2">{text}</p>}
    </div>
  );
}
