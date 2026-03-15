/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { generateInsights } from '@/lib/generative';
import { AnalyticsData, Insight, TotalMetrics, AverageMetrics } from '@/types';
import DateFilter from '@/components/DataFilter';
import MetricCard from '@/components/MetricCard';
import DataTable from '@/components/DataTable';
import { Loader2, RefreshCw } from 'lucide-react';

const Chart = dynamic(() => import("@/components/Chart"), { 
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center text-zinc-500">Carregando gráfico...</div>
});

export default function DynamicSubCompanyDashboard() {
  const { id } = useParams();
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [filteredData, setFilteredData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  
  // 1. INICIA NOS 30 DIAS
  const [timeRange, setTimeRange] = useState<string>('30d');

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      
      const response = await fetch(`/api/analytics/${id}`);
      if (!response.ok) throw new Error(`Falha ao buscar dados do Google Analytics`);
      
      const analyticsData: AnalyticsData[] = await response.json();
      setData(analyticsData);
      
      // 2. APLICA O FILTRO INICIAL DE 30 DIAS NA CHEGADA DOS DADOS
      setFilteredData(analyticsData.slice(-30));
      setInsights(generateInsights(analyticsData));
    } catch (err: any) {
      console.error('Erro:', err);
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchData();
  }, [id, fetchData]);

  const handleDateFilter = (range: string): void => {
    setTimeRange(range);
    
    // 3. LÓGICA DE FILTRAGEM (Pega os últimos X dias do array total)
    if (range === '7d') {
      setFilteredData(data.slice(-7));
    } else if (range === '30d') {
      setFilteredData(data.slice(-30));
    } else {
      setFilteredData(data); // 'all' ou outros
    }
  };

  const calculateTotalMetrics = (): TotalMetrics => {
    return filteredData.reduce((acc, day) => ({
      activeUsers: acc.activeUsers + (day.activeUsers || 0),
      sessions: acc.sessions + (day.sessions || 0),
      pageViews: acc.pageViews + (day.pageViews || 0),
      engagedSessions: acc.engagedSessions + (day.engagedSessions || 0),
    }), { activeUsers: 0, sessions: 0, pageViews: 0, engagedSessions: 0 });
  };

  const calculateAverageMetrics = (): AverageMetrics => {
    const totals = calculateTotalMetrics();
    const count = filteredData.length || 1;
    return {
      activeUsers: Math.round(totals.activeUsers / count),
      sessions: Math.round(totals.sessions / count),
      pageViews: Math.round(totals.pageViews / count),
      engagedSessions: Math.round(totals.engagedSessions / count),
    };
  };

  const totalMetrics = calculateTotalMetrics();
  const avgMetrics = calculateAverageMetrics();

  if (isLoading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      <p className="text-zinc-400 animate-pulse">Sincronizando com Google Analytics...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 text-zinc-100 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="pl-14 lg:pl-0">
          <h2 className="text-2xl font-bold text-white">Análise de Unidade</h2>
          <p className="text-zinc-400">Métricas dinâmicas via GTM/GA4</p>
        </div>
        <div className="flex items-center gap-4">
          <DateFilter onFilterChange={handleDateFilter} currentRange={timeRange} />
          <button onClick={fetchData} className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2 text-white">
            <RefreshCw size={16} /> Atualizar
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8">
          {errorMsg}
        </div>
      )}

      {insights.length > 0 && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Componentes de Insight omitidos para brevidade, mas o bloco existe */}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Usuários Ativos" value={totalMetrics.activeUsers} avg={avgMetrics.activeUsers} change={12} trend="up" icon="👥" color="blue" />
        <MetricCard title="Sessões" value={totalMetrics.sessions} avg={avgMetrics.sessions} change={8} trend="up" icon="📊" color="purple" />
        <MetricCard title="Visualizações" value={totalMetrics.pageViews} avg={avgMetrics.pageViews} change={15} trend="up" icon="👁️" color="green" />
        <MetricCard title="Sessões Engajadas" value={totalMetrics.engagedSessions} avg={avgMetrics.engagedSessions} change={5} trend="up" icon="🎯" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
         <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
            <Chart data={filteredData} type="line" height={300} />
         </div>
         <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl backdrop-blur-sm">
            <Chart data={filteredData} type="bar" height={300} />
         </div>
      </div>

      <DataTable data={filteredData} />
    </div>
  );
}