'use client';

import { MetricCardProps } from "@/types";

export default function MetricCard({ 
  title, 
  value = 0, 
  change = 0, 
  trend = 'stable', 
  icon, 
  color = 'blue', 
  avg = 0 
}: MetricCardProps) {
  
  const colorClasses = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', progress: 'bg-blue-500' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', progress: 'bg-purple-500' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', progress: 'bg-green-500' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', progress: 'bg-orange-500' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', progress: 'bg-red-500' },
  };

  const trendIcons = {
    up: { icon: '↗', color: 'text-green-400' },
    down: { icon: '↘', color: 'text-red-400' },
    stable: { icon: '→', color: 'text-zinc-400' },
  };

  const currentColor = colorClasses[color] || colorClasses.blue;
  const currentTrend = trendIcons[trend] || trendIcons.stable;

  // Proteção contra divisão por zero e NaN
  const safeAvg = avg || 0;
  const maxBarValue = Math.max(value, safeAvg * 2) || 1;
  const progressWidth = Math.min((value / maxBarValue) * 100, 100);

  return (
    <div className="bg-zinc-900/80 rounded-xl shadow-sm border border-zinc-800 p-6 transition-all duration-300 hover:border-zinc-700 backdrop-blur-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-zinc-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-xl ${currentColor.bg} ${currentColor.border} border text-2xl`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center">
          <span className={`inline-flex items-center ${currentTrend.color}`}>
            <span className="text-lg font-bold">{currentTrend.icon}</span>
            <span className="ml-1 text-sm font-bold">{change}%</span>
          </span>
          <span className="text-xs text-zinc-500 ml-2">vs. período</span>
        </div>
        <div className="text-xs text-zinc-400">
          Média: <span className="font-bold text-zinc-200">{safeAvg}/dia</span>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-[10px] text-zinc-500 mb-1 font-bold uppercase tracking-wider">
          <span>Min</span>
          <span>Méd: {safeAvg}</span>
          <span>Max: {maxBarValue}</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${currentColor.progress} rounded-full transition-all duration-1000`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}