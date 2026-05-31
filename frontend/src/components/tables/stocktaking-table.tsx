import type { Stocktaking } from "@/types/gym-types"
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

interface StocktakingListViewProps {
  data: Stocktaking[]
}

export function StocktakingListView({ data }: StocktakingListViewProps) {
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
            <TableHead>Stocktaking ID</TableHead>
            <TableHead>Gym ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((s) => (
              <TableRow key={s.stocktaking_id}>
                <TableCell className="font-medium">#{s.stocktaking_id}</TableCell>
                <TableCell>{s.gym_id}</TableCell>
                <TableCell>{s.stocktaking_date}</TableCell>
                <TableCell className="text-right">
                  <TableActions
                    label="Stocktaking Management"
                    onEdit={() => console.log("Edit " + s.stocktaking_id)}
                    onDelete={() => console.log("Delete " + s.stocktaking_id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No stocktakings found.
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
