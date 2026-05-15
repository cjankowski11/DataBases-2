import type { Registration } from "@/types/gym-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Calendar } from "lucide-react"
import { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions";

interface RegistrationListViewProps {
  data: Registration[]
}

export function RegistrationListView({ data }: RegistrationListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Reg ID</TableHead>
            <TableHead>Client ID</TableHead>
            <TableHead>Class ID</TableHead>
            <TableHead className="text-right">Registration Date</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((r) => (
              <TableRow key={r.class_registration_id}>
                <TableCell className="font-mono text-muted-foreground">
                  #{r.class_registration_id}
                </TableCell>
                <TableCell className="font-medium">
                  Client #{r.client_id}
                </TableCell>
                <TableCell>
                  Class #{r.class_id}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(r.registration_date).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <TableActions
                    label="Registration Management"
                    onEdit={() => console.log("Edit " + r.class_registration_id)}
                    onDelete={() => console.log("Delete " + r.class_registration_id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No registrations found.
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
  )
}