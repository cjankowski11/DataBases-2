import type { TransactionClient } from "@/types/gym-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"

interface TransactionListViewProps {
  data: TransactionClient[]
}

export function TransactionListView({ data }: TransactionListViewProps) {
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
            <TableHead>Transaction ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Client ID</TableHead>
            <TableHead>Receptionist ID</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((t) => (
              <TableRow key={t.transaction_client_id}>
                <TableCell className="font-medium">#{t.transaction_client_id}</TableCell>
                <TableCell>{t.transaction_date}</TableCell>
                <TableCell>{t.client_id}</TableCell>
                <TableCell>{t.receptionist_employee_id}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {t.articles?.length || 0} items
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <TableActions
                    label="Transaction Management"
                    onEdit={() => console.log("Edit " + t.transaction_client_id)}
                    onDelete={() => console.log("Delete " + t.transaction_client_id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No transactions found.
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
