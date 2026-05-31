import type { Client } from "@/types/gym-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"

interface ClientListViewProps {
  data: Client[]
}

export function ClientListView({ data }: ClientListViewProps) {
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
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Birth Date</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((c) => (
              <TableRow key={c.client_id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.surname}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>{c.birth_date || "N/A"}</TableCell>
                <TableCell className="text-right">
                  <TableActions
                    label="Client Management"
                    onEdit={() => console.log("Edit " + c.client_id)}
                    onDelete={() => console.log("Delete " + c.client_id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No clients found.
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
