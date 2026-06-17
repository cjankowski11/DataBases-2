import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, XCircle, BarChart3, SlidersHorizontal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { AnalyticsClassTypeService } from "../../services/gym-service";

interface ClassTypeAnalytics {
  class_type_name: string;
  total_classes: number;
  total_registrations: number;
  total_capacity: number;
  avg_occupancy_rate: number;
  total_available_spots: number;
}

export default function ClientAnalyticsDashboard() {
  const [data, setData] = useState<ClassTypeAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [limit, setLimit] = useState<number>(5);
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(6);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await AnalyticsClassTypeService.getAll({
        year: year,
        month: month,
        limit: limit
      });

      if (Array.isArray(result)) {
        setData(result);
      } else if (result && typeof result === "object" && "data" in result) {
        setData((result as any).data);
      } else {
        setData([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics records");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [limit, year, month]);

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

      <div className="flex items-center gap-3 border-b pb-5">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Analytics</h1>
          <p className="text-muted-foreground">Data insights for client-related topics.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/40 p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Class Operations Analysis</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={limit.toString()} onValueChange={(v) => setLimit(Number(v))}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Show Top" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Top 5 Classes</SelectItem>
                <SelectItem value="10">Top 10 Classes</SelectItem>
                <SelectItem value="20">Top 20 Classes</SelectItem>
              </SelectContent>
            </Select>

            <Select value={month.toString()} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-[130px] bg-background">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {new Date(2026, i).toLocaleString("en-US", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={year.toString()} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-[100px] bg-background">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Registration vs Capacity Metrics</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              {data.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed rounded-md">
                  No visualization data loaded for this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="class_type_name" stroke="#888888" fontSize={12} />
                    <YAxis stroke="#888888" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_registrations" name="Total Registrations" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total_capacity" name="Room Capacity" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Performance Breakdown</CardTitle>
              <CardDescription>Displaying up to top {limit} entries.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class Type</TableHead>
                      <TableHead className="text-right">Sessions</TableHead>
                      <TableHead className="text-right">Registrations</TableHead>
                      <TableHead className="text-right">Occupancy Rate</TableHead>
                      <TableHead className="text-right">Free Spots</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          No operational records found for chosen period.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.map((row) => (
                        <TableRow key={row.class_type_name}>
                          <TableCell className="font-medium">{row.class_type_name}</TableCell>
                          <TableCell className="text-right">{row.total_classes}</TableCell>
                          <TableCell className="text-right">{row.total_registrations}</TableCell>
                          <TableCell className="text-right font-semibold text-blue-600">
                            {row.avg_occupancy_rate}%
                          </TableCell>
                          <TableCell className="text-right">{row.total_available_spots}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="w-full border-dashed border-2 bg-muted/5 min-h-[350px] flex flex-col justify-center items-center">
        <CardHeader className="text-center max-w-md">
          <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground mb-2 stroke-1" />
          <CardTitle className="text-muted-foreground text-base font-semibold uppercase tracking-wider">
            Entries & Subscriptions Analytics
          </CardTitle>
        </CardHeader>
      </Card>

    </div>
  );
}