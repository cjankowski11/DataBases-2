import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "./table-pagination";
import { TableActions } from "./table-actions";
import type { GymEmployee } from "@/types/gym-types";
import { ArrowUpDown, ArrowUp, ArrowDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GymEmployeeListViewProps {
  data: GymEmployee[];
  onDelete: (gymId: number, employeeId: number, employmentId?: number) => void;
}

type SortOrder = "none" | "asc" | "desc";

export function GymEmployeeListView({ data, onDelete }: GymEmployeeListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  
  const itemsPerPage = 10;

  const normalizedData: GymEmployee[] = Array.isArray(data)
    ? data
    : (data as any)?.data && Array.isArray((data as any).data)
    ? (data as any).data
    : [];

  const filteredData = normalizedData.filter((g) => {
    if (roleFilter === "all") return true;
    
    const emp = g.employee || (g as any).employeeDetails;
    const role = (emp?.employee_type || emp?.role || "employee").toLowerCase();
    return role === roleFilter;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortOrder === "none") return 0;

    const empA = a.employee || (a as any).employeeDetails;
    const empB = b.employee || (b as any).employeeDetails;

    const nameA = `${empA?.surname || ""} ${empA?.name || ""}`.trim().toLowerCase();
    const nameB = `${empB?.surname || ""} ${empB?.name || ""}`.trim().toLowerCase();

    if (sortOrder === "asc") {
      return nameA.localeCompare(nameB, "pl");
    } else {
      return nameB.localeCompare(nameA, "pl");
    }
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const toggleSort = () => {
    setSortOrder((prev) => {
      if (prev === "none") return "asc";
      if (prev === "asc") return "desc";
      return "none";
    });
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const renderSortIcon = () => {
    if (sortOrder === "asc") return <ArrowUp className="ml-2 h-4 w-4" />;
    if (sortOrder === "desc") return <ArrowDown className="ml-2 h-4 w-4" />;
    return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
  };

  const renderRoleBadge = (emp: any) => {
    if (!emp) return <span className="text-sm text-muted-foreground">No data</span>;
    const role = emp.employee_type || emp.role || "employee";

    switch (role.toLowerCase()) {
      case "trainer":
        return <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Trainer</span>;
      case "receptionist":
        return <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Receptionist</span>;
      case "employee":
      default:
        return <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Employee</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-muted/20 p-3 rounded-md border">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={roleFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="flex h-9 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Positions</option>
            <option value="trainer">Trainers</option>
            <option value="receptionist">Receptionists</option>
            <option value="employee">Standard Employees</option>
          </select>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing {sortedData.length} of {normalizedData.length} staff members
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={toggleSort}
                  className="hover:bg-transparent p-0 font-semibold text-foreground flex items-center"
                >
                  Employee
                  {renderSortIcon()}
                </Button>
              </TableHead>
              <TableHead>Position (Type)</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((g) => {
                const emp = g.employee || (g as any).employeeDetails;
                
                const name = emp?.name || (g as any).name || "";
                const surname = emp?.surname || (g as any).surname || "";
                const employeeId = g.employee_id || emp?.employee_id;
                
                const employmentId = (g as any).id || (g as any).gym_employment_id;
                const rowKey = `${g.gym_id || 0}-${employeeId || Math.random()}`;

                return (
                  <TableRow key={rowKey} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">
                      {name || surname ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">
                            {name} {surname}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            ID Pracownika: #{employeeId} {employmentId && `| ID Zatrudnienia: #${employmentId}`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-sm animate-pulse">
                          Fetching staff data (ID: #{g.employee_id})...
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      {renderRoleBadge(emp)}
                    </TableCell>

                    <TableCell className="text-right">
                      <TableActions
                        label="Staff management"
                        onDelete={() => onDelete(g.gym_id, employeeId, employmentId)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                  No employees match the criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}