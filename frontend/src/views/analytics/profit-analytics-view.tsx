import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, XCircle, DollarSign, SlidersHorizontal, TrendingUp, Wallet, ArrowDownCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Zaimportuj swój zdefiniowany serwis API
import { AnalyticsProfitTypeService } from "../../services/gym-service";

interface FinancialData {
  year_month: string;
  subscription_income: number;
  sponsor_income: number;
  total_income: number;
  salary_costs: number;
  net_profit: number;
}

export default function FinancialAnalyticsDashboard() {
  const [data, setData] = useState<FinancialData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Domyślny zakres: ostatnie pół roku wstecz od dzisiejszego dnia (2026 r.)
  const [startDate, setStartDate] = useState<string>("2026-01-01");
  const [endDate, setEndDate] = useState<string>("2026-06-30");

  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Metoda getAll przyjmuje obiekt Query mapowany na parametry URL w ApiClient
      const result = await AnalyticsProfitTypeService.getAll({
        start_date: startDate,
        end_date: endDate
      });

      if (Array.isArray(result)) {
        setData(result);
      } else if (result && typeof result === "object" && "data" in result) {
        setData((result as any).data);
      } else {
        setData([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load financial records");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchFinancialData();
    }
  }, [startDate, endDate]);

  // Obliczanie sum podsumowujących dla kart KPI na podstawie pobranego okresu
  const totalPeriodIncome = data.reduce((sum, item) => sum + item.total_income, 0);
  const totalPeriodCosts = data.reduce((sum, item) => sum + item.salary_costs, 0);
  const totalPeriodProfit = data.reduce((sum, item) => sum + item.net_profit, 0);

  // Formatowanie waluty (PLN)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Nagłówek strony */}
      <div className="flex items-center gap-3 border-b pb-5">
        <DollarSign className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Analytics</h1>
          <p className="text-muted-foreground">Track club revenues, corporate sponsor contracts, and operational salary costs.</p>
        </div>
      </div>

      {/* Panel filtrów */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/40 p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold tracking-tight">Timeframe Selection</h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">From:</span>
            <input
              type="date"
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">To:</span>
            <input
              type="date"
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Karty KPI (Podsumowanie u góry ekranu) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPeriodIncome)}</div>
            <p className="text-xs text-muted-foreground">Subscriptions + Sponsors in period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salary Expenditures</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{formatCurrency(totalPeriodCosts)}</div>
            <p className="text-xs text-muted-foreground">Active employees fixed costs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPeriodProfit >= 0 ? "text-blue-600" : "text-rose-600"}`}>
              {formatCurrency(totalPeriodProfit)}
            </div>
            <p className="text-xs text-muted-foreground">Total bottom-line balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Wykres trendu finansowego */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Financial Cashflow Trend</CardTitle>
          <CardDescription>Visual comparison of income streams, staff cost lines, and actual profitability profiles.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed rounded-md">
              No financial data available for the chosen date range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {/* Posortowane chronologicznie do wykresu (.reverse() ponieważ backend zwraca DESC) */}
              <LineChart data={[...data].reverse()} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year_month" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} tickFormatter={(v) => `${v} zł`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), ""]} />
                <Legend />
                <Line type="monotone" dataKey="total_income" name="Total Revenue" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="salary_costs" name="Salary Expenses" stroke="#f43f5e" strokeWidth={2} />
                <Line type="monotone" dataKey="net_profit" name="Net Profit Margin" stroke="#3b82f6" strokeWidth={3} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Tabela szczegółowa */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Detailed Ledger Breakdown</CardTitle>
          <CardDescription>Monthly tabular breakdown of all calculated cost centers and asset streams.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Billing Month</TableHead>
                  <TableHead className="text-right">Subscription Income</TableHead>
                  <TableHead className="text-right">Sponsor Income</TableHead>
                  <TableHead className="text-right">Combined Gross Revenue</TableHead>
                  <TableHead className="text-right">Employee Payroll Cost</TableHead>
                  <TableHead className="text-right">Net Return</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No matching records found within the parameters specified.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row) => (
                    <TableRow key={row.year_month}>
                      <TableCell className="font-semibold">{row.year_month}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(row.subscription_income)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(row.sponsor_income)}</TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">{formatCurrency(row.total_income)}</TableCell>
                      <TableCell className="text-right text-rose-500">{formatCurrency(row.salary_costs)}</TableCell>
                      <TableCell className={`text-right font-bold ${row.net_profit >= 0 ? "text-blue-600" : "text-rose-600"}`}>
                        {formatCurrency(row.net_profit)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}