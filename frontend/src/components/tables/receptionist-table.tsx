import type { Receptionist } from "@/types/gym-types"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"

interface ReceptionistListViewProps {
  data: Receptionist[]
  onDelete: (id: number | string) => void 
}

export function ReceptionistListView({ data = [], onDelete }: ReceptionistListViewProps) { 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const safeData = Array.isArray(data) ? data : [];

  const totalPages = Math.max(1, Math.ceil(safeData.length / itemsPerPage));

  const paginatedData = safeData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Employment Date</TableHead>
            <TableHead>Birth Date</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Shift</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeData.length > 0 ? (
            paginatedData.map((emp) => (
              <TableRow key={emp.employee_id}>
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
                <TableCell>
                  {emp.salary ? `${emp.salary} PLN` : "—"}
                </TableCell>
                <TableCell>
                  {emp.shift}
                </TableCell>
                <TableCell>
                  <Badge variant={emp.is_employed ? "default" : "secondary"}>
                    {emp.is_employed ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <TableActions
                    label="Receptionist"
                    onEdit={() => console.log("Edit", emp.employee_id)}
                    onDelete={() => onDelete(emp.employee_id)} 
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                No receptionists found.
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