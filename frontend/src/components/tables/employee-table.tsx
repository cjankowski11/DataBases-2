import type { Employee } from "@/types/gym-types"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmployeeListViewProps {
  data: Employee[]
  onEdit: (id: number | string) => void 
  onDelete: (id: number | string) => void 
}

type SortField = "id" | "name" | "date_employed" | "birth_date" | "salary";
type SortOrder = "asc" | "desc";

export function EmployeeListView({ data = [], onEdit, onDelete }: EmployeeListViewProps) { 
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  
  const itemsPerPage = 10;
  const safeData = Array.isArray(data) ? data : [];

  const sortedData = [...safeData].sort((a, b) => {
    if (sortField === "id") {
      return sortOrder === "asc" ? a.employee_id - b.employee_id : b.employee_id - a.employee_id;
    }

    if (sortField === "salary") {
      return sortOrder === "asc" ? (a.salary || 0) - (b.salary || 0) : (b.salary || 0) - (a.salary || 0);
    }

    if (sortField === "name") {
      const nameA = `${a.surname || ""} ${a.name || ""}`.trim().toLowerCase();
      const nameB = `${b.surname || ""} ${b.name || ""}`.trim().toLowerCase();
      return sortOrder === "asc" ? nameA.localeCompare(nameB, "pl") : nameB.localeCompare(nameA, "pl");
    }

    if (sortField === "date_employed" || sortField === "birth_date") {
      const dateA = a[sortField] ? new Date(a[sortField]!).getTime() : 0;
      const dateB = b[sortField] ? new Date(b[sortField]!).getTime() : 0;
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }

    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1.5 h-4 w-4 text-muted-foreground/40 shrink-0" />;
    }
    return sortOrder === "asc" 
      ? <ArrowUp className="ml-1.5 h-4 w-4 text-primary shrink-0" /> 
      : <ArrowDown className="ml-1.5 h-4 w-4 text-primary shrink-0" />;
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("id")}
                className="hover:bg-transparent p-0 font-semibold text-foreground flex items-center select-none"
              >
                ID {renderSortIcon("id")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("name")}
                className="hover:bg-transparent p-0 font-semibold text-foreground flex items-center select-none"
              >
                Employee {renderSortIcon("name")}
              </Button>
            </TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("date_employed")}
                className="hover:bg-transparent p-0 font-semibold text-foreground flex items-center select-none"
              >
                Employment Date {renderSortIcon("date_employed")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("birth_date")}
                className="hover:bg-transparent p-0 font-semibold text-foreground flex items-center select-none"
              >
                Birth Date {renderSortIcon("birth_date")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("salary")}
                className="hover:bg-transparent p-0 font-semibold text-foreground flex items-center select-none"
              >
                Salary {renderSortIcon("salary")}
              </Button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length > 0 ? (
            paginatedData.map((emp) => (
              <TableRow key={emp.employee_id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{emp.employee_id}
                </TableCell>
                <TableCell className="font-medium">
                  {emp.name} {emp.surname}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{emp.gender}</Badge>
                </TableCell>
                <TableCell>
                  {emp.date_employed ? new Date(emp.date_employed).toLocaleDateString("pl-PL") : "—"}
                </TableCell>
                <TableCell>
                  {emp.birth_date ? new Date(emp.birth_date).toLocaleDateString("pl-PL") : "—"}
                </TableCell>
                <TableCell className="font-medium">
                  {emp.salary ? `${emp.salary.toLocaleString("pl-PL")} PLN` : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={emp.is_employed ? "default" : "secondary"}>
                    {emp.is_employed ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <TableActions
                    label="Employee"
                    onEdit={() => onEdit(emp.employee_id)} 
                    onDelete={() => onDelete(emp.employee_id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                No employees found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}