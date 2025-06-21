import React, { useState } from "react";
import { Slider } from "./ui/slider";
import { Calendar } from "lucide-react";
import { DataStat } from "./DataStat";

interface DemoEntry {
  date: string; // ISO string
  bodyFat: number;
  weight: number; // in lbs
  ffmi: number;
}

const demoData: DemoEntry[] = [
  { date: "2024-01-01", bodyFat: 21, weight: 180, ffmi: 22.0 },
  { date: "2024-01-15", bodyFat: 19, weight: 176, ffmi: 22.1 },
  { date: "2024-02-01", bodyFat: 17, weight: 172, ffmi: 22.3 },
  { date: "2024-02-15", bodyFat: 15, weight: 169, ffmi: 22.4 },
  { date: "2024-03-05", bodyFat: 13, weight: 166, ffmi: 22.6 },
  { date: "2024-03-25", bodyFat: 12, weight: 164, ffmi: 22.7 },
];

function formatDate(dateStr: string, opts?: Intl.DateTimeFormatOptions) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", opts);
}

export function LandingTimelineDemo() {
  const [index, setIndex] = useState(demoData.length - 1);
  const entry = demoData[index];

  const startLabel = formatDate(demoData[0].date, { month: "short", year: "numeric" });
  const endLabel = formatDate(demoData[demoData.length - 1].date, { month: "short", year: "numeric" });

  return (
    <div className="relative rounded-2xl border border-linear-border bg-linear-card p-8">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-linear-purple/10 px-4 py-2">
          <Calendar className="h-4 w-4 text-linear-purple" />
          <span className="text-sm font-medium text-linear-purple">
            {formatDate(entry.date, { month: "long", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>

      <div className="grid gap-4 text-center mb-8">
        <DataStat value={`${entry.bodyFat}%`} label="Body Fat" />
        <div className="grid grid-cols-2 gap-4">
          <DataStat value={`${entry.weight} lbs`} label="Weight" />
          <DataStat value={entry.ffmi} label="FFMI" />
        </div>
      </div>

      <div className="relative">
        <div className="mb-2 flex items-center justify-between text-xs text-linear-text-tertiary">
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
        <Slider
          value={[index]}
          min={0}
          max={demoData.length - 1}
          step={1}
          onValueChange={(v) => setIndex(v[0])}
        />
        <div className="mt-4 text-center">
          <p className="text-sm text-linear-text-secondary">Drag to travel through time</p>
        </div>
      </div>
    </div>
  );
}

export default LandingTimelineDemo;
