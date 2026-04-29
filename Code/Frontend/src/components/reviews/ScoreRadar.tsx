import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface ScoreRadarProps {
  scores: Record<string, number>;
  labels?: Record<string, string>;
}

const ScoreRadar = ({ scores, labels }: ScoreRadarProps) => {
  const data = Object.entries(scores).map(([key, value]) => ({
    subject: labels?.[key] || key.charAt(0).toUpperCase() + key.slice(1),
    value,
    fullMark: 10,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="var(--accent)"
            fill="var(--accent)"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export { ScoreRadar };
