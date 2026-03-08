/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ManageLayout } from "@/components/Manage/ManageLayout";
import { ArrowLeft, LayoutTemplate, Calendar, Eye, Download, Search } from "lucide-react";
import { Button } from "@/components/Button";

export default function LeadsClientLayout({ formName, submissions }: { formName: string, submissions: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const headers = useMemo(() => {
    const keys = new Set<string>();
    submissions.forEach(sub => {
      try {
        const data = typeof sub.data === "string" ? JSON.parse(sub.data) : sub.data;
        Object.keys(data).forEach(k => {
          if (k !== "componentId" && k !== "componentName") keys.add(k);
        });
      } catch(e) {}
    });
    return Array.from(keys);
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    if (!searchTerm) return submissions;
    return submissions.filter(sub => {
      try {
        const data = typeof sub.data === "string" ? JSON.parse(sub.data) : sub.data;
        return Object.values(data).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
      } catch {
        return false;
      }
    });
  }, [submissions, searchTerm]);

  const handleExportXLSX = () => {
    let csvContent = "Data;" + headers.map(h => h.replace(/_/g, ' ')).join(";") + "\n";
    
    filteredSubmissions.forEach(sub => {
      const date = new Date(sub.createdAt).toLocaleString("pt-BR");
      let data: any = {};
      try {
        data = typeof sub.data === "string" ? JSON.parse(sub.data) : sub.data;
      } catch(e) {}
      
      const row = headers.map(h => {
        const val = data[h] || "";
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      
      csvContent += `"${date}";` + row.join(";") + "\n";
    });

    const blob = new Blob(["\ufeff", csvContent], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `leads_${formName}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ManageLayout
      headerIcon={Eye}
      title={`Respostas: ${formName}`}
      description="Gerencie os leads e contatos que preencheram este formulário."
      exists={true}
      itemName="Leads do Formulário"
    >
      <div className="space-y-6 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-background)] p-4 rounded-xl border border-[var(--color-border)]">
          <Link 
            href="/formularios-acoes" 
            className="flex items-center gap-2 text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Formulários
          </Link>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-secondary)] opacity-50" />
              <input 
                type="text" 
                placeholder="Buscar lead..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[var(--color-background-body)] border border-[var(--color-border)] rounded-lg text-[var(--color-secondary)] text-sm outline-none focus:ring-2 transition-shadow"
                style={{ '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
              />
            </div>
            
            <Button variant="primary" onClick={handleExportXLSX} className="flex items-center gap-2 whitespace-nowrap">
              <Download className="w-4 h-4" />
              Exportar XLSX
            </Button>
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-background)] border-dashed border-2 border-[var(--color-border)] rounded-xl">
            <div className="w-16 h-16 bg-[var(--color-background-body)] rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutTemplate className="w-8 h-8 text-[var(--color-primary)] opacity-80" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-secondary)]">Nenhum dado capturado</h3>
          </div>
        ) : (
          <div className="w-full overflow-x-auto bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[var(--color-background-body)] border-b border-[var(--color-border)]">
                  <th className="p-4 font-semibold text-sm text-[var(--color-secondary)]">Data</th>
                  {headers.map(h => (
                    <th key={h} className="p-4 font-semibold text-sm text-[var(--color-secondary)] capitalize">
                      {h.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub) => {
                  let data: any = {};
                  try {
                    data = typeof sub.data === "string" ? JSON.parse(sub.data) : sub.data;
                  } catch(e) {}

                  return (
                    <tr key={sub.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background-body)] transition-colors">
                      <td className="p-4 text-sm text-[var(--color-secondary)] whitespace-nowrap">
                        <div className="flex items-center gap-2 opacity-80">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(sub.createdAt).toLocaleString("pt-BR", { 
                            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      {headers.map(h => (
                        <td key={h} className="p-4 text-sm text-[var(--color-secondary)] font-medium">
                          {data[h] || "-"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ManageLayout>
  );
}