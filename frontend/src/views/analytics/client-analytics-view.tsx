import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, XCircle, BarChart3, SlidersHorizontal, Footprints, CreditCard } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AnalyticsClassTypeService,
  AnalyticsGymEntriesService,
  AnalyticsSubscriptionService
} from "../../services/gym-service";

interface ClassTypeAnalytics {
  class_type_name: string;
  total_classes: number;
  total_registrations: number;
  total_capacity: number;
  avg_occupancy_rate: number;
  total_available_spots: number;
}

interface GymEntryAnalytics {
  gym_id: number;
  total_entries: number;
  avg_daily_entries: number;
}

interface SubscriptionAnalytics {
  subscription_name: string;
  total_purchased: number;
}

function ComponentLoader() {
  return (
    <div className="h-full w-full flex items-center justify-center min-h-[250px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function ClientAnalyticsDashboard() {
  const [classData, setClassData] = useState<ClassTypeAnalytics[]>([]);
  const [entriesData, setEntriesData] = useState<GymEntryAnalytics[]>([]);
  const [subData, setSubData] = useState<SubscriptionAnalytics[]>([]);

  const [isClassLoading, setIsClassLoading] = useState(true);
  const [isEntriesLoading, setIsEntriesLoading] = useState(true);
  const [isSubLoading, setIsSubLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [limit, setLimit] = useState<number>(5);
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(6);

  const [entriesYear, setEntriesYear] = useState<number>(2026);
  const [entriesMonth, setEntriesMonth] = useState<number>(6);

  const [subYear, setSubYear] = useState<number>(2026);
  const [subMonth, setSubMonth] = useState<number>(6);

  useEffect(() => {
    const fetchClassAnalytics = async () => {
      try {
        setIsClassLoading(true);
        const classResult = await AnalyticsClassTypeService.getAll({ year, month, limit });

        if (Array.isArray(classResult)) {
          setClassData(classResult);
        } else if (classResult && typeof classResult === "object" && "data" in classResult) {
          setClassData((classResult as any).data);
        } else {
          setClassData([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load class metrics");
        setClassData([]);
      } finally {
        setIsClassLoading(false);
      }
    };
    fetchClassAnalytics();
  }, [limit, year, month]);

  useEffect(() => {
    const fetchEntriesAnalytics = async () => {
      try {
        setIsEntriesLoading(true);
        const entriesResult = await AnalyticsGymEntriesService.getAll({ year: entriesYear, month: entriesMonth });

        if (Array.isArray(entriesResult)) {
          setEntriesData(entriesResult);
        } else if (entriesResult && typeof entriesResult === "object" && "data" in entriesResult) {
          setEntriesData((entriesResult as any).data);
        } else {
          setEntriesData([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load entries traffic");
        setEntriesData([]);
      } finally {
        setIsEntriesLoading(false);
      }
    };
    fetchEntriesAnalytics();
  }, [entriesYear, entriesMonth]);

  useEffect(() => {
    const fetchSubAnalytics = async () => {
      try {
        setIsSubLoading(true);
        const subResult = await AnalyticsSubscriptionService.getAll({ year: subYear, month: subMonth });

        if (Array.isArray(subResult)) {
          setSubData(subResult);
        } else if (subResult && typeof subResult === "object" && "data" in subResult) {
          setSubData((subResult as any).data);
        } else {
          setSubData([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sub information");
        setSubData([]);
      } finally {
        setIsSubLoading(false);
      }
    };
    fetchSubAnalytics();
  }, [subYear, subMonth]);

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

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/40 p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold tracking-tight">Class Analytics Filters</h2>
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

        <div className="grid grid-cols-1 gap-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Registration vs Capacity Metrics</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              {isClassLoading ? (
                <ComponentLoader />
              ) : classData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed rounded-md">
                  No visualization data loaded for this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
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
              <div className="rounded-md border min-h-[150px] relative">
                {isClassLoading ? (
                  <ComponentLoader />
                ) : (
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
                      {classData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                            No operational records found for chosen period.
                          </TableCell>
                        </TableRow>
                      ) : (
                        classData.map((row) => (
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
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/40 p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Footprints className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl font-bold tracking-tight">Entries Filters</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={entriesMonth.toString()} onValueChange={(v) => setEntriesMonth(Number(v))}>
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

            <Select value={entriesYear.toString()} onValueChange={(v) => setEntriesYear(Number(v))}>
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

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Gym Total Entries vs Daily Averages</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            {isEntriesLoading ? (
              <ComponentLoader />
            ) : entriesData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed rounded-md">
                No entry traffic recorded for this chosen period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={entriesData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="gym_id" tickFormatter={(value) => `Gym #${value}`} stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip labelFormatter={(value) => `Gym ID: ${value}`} />
                  <Legend />
                  <Bar dataKey="total_entries" name="Total Monthly Entries" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avg_daily_entries" name="Avg Daily Entries" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Gym Entries Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border min-h-[120px]">
              {isEntriesLoading ? (
                <ComponentLoader />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gym Location Reference</TableHead>
                      <TableHead className="text-right">Total Entries</TableHead>
                      <TableHead className="text-right">Daily Average</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entriesData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                          No active check-ins stored for this period scope.
                        </TableCell>
                      </TableRow>
                    ) : (
                      entriesData.map((row) => (
                        <TableRow key={row.gym_id}>
                          <TableCell className="font-medium">Gym ID Location #{row.gym_id}</TableCell>
                          <TableCell className="text-right font-semibold">{row.total_entries}</TableCell>
                          <TableCell className="text-right text-emerald-600 font-semibold">
                            {row.avg_daily_entries} / day
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/40 p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-bold tracking-tight">Subscription Plan Filters</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={subMonth.toString()} onValueChange={(v) => setSubMonth(Number(v))}>
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

            <Select value={subYear.toString()} onValueChange={(v) => setSubYear(Number(v))}>
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

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Popularity of Chosen Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            {isSubLoading ? (
              <ComponentLoader />
            ) : subData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed rounded-md">
                No active sub transaction sales documented for this specific period scope.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="subscription_name" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_purchased" name="Purchased Quantities" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Subscription Plan Distribution Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border min-h-[120px]">
              {isSubLoading ? (
                <ComponentLoader />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subscription Name</TableHead>
                      <TableHead className="text-right">Total Purchased</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-10 text-muted-foreground">
                          No subscription purchases logged for chosen selection period.
                        </TableCell>
                      </TableRow>
                    ) : (
                      subData.map((row) => (
                        <TableRow key={row.subscription_name}>
                          <TableCell className="font-medium">{row.subscription_name}</TableCell>
                          <TableCell className="text-right font-semibold text-purple-600">
                            {row.total_purchased} sales
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}