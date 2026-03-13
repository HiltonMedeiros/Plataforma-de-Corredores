import { useEffect, useRef } from "react";
import { TrendingUp, Zap } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { weeklyData } from "@/data/mockData";

const activeDays = weeklyData.filter((d) => d.km > 0).length;
const chartData = weeklyData.filter((_, i) => i % 2 === 0 || weeklyData[i].km > 0);

export function PerformanceChart() {
  return (
    <section className="card-fitness p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground">Desempenho</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-accent px-3 py-1.5 rounded-full">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-xs font-semibold text-primary">
            {activeDays} dias ativos
          </span>
        </div>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={weeklyData.slice(0, 28)}
            margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorKm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152, 72%, 36%)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(152, 72%, 36%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "hsl(215, 15%, 52%)" }}
              tickLine={false}
              axisLine={false}
              interval={6}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(215, 15%, 52%)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(214, 20%, 88%)",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(value: number) => [`${value} km`, "Distância"]}
              labelStyle={{ color: "hsl(215, 15%, 52%)", fontWeight: 500 }}
            />
            <Area
              type="monotone"
              dataKey="km"
              stroke="hsl(152, 72%, 36%)"
              strokeWidth={2.5}
              fill="url(#colorKm)"
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.km === 0) return <g key={`dot-${cx}-${cy}`} />;
                return (
                  <circle
                    key={`dot-${cx}-${cy}`}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="hsl(152, 72%, 36%)"
                    stroke="white"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ r: 6, fill: "hsl(152, 72%, 36%)", stroke: "white", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Active days mini indicators */}
      <div className="mt-3 flex gap-1 flex-wrap">
        {weeklyData.slice(0, 28).map((d, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              d.km > 0 ? "bg-primary" : "bg-muted"
            }`}
            title={`Dia ${d.day}: ${d.km}km`}
          />
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">
        Cada ponto verde = dia ativo
      </p>
    </section>
  );
}
