import type { Sponsor } from "@/types/gym-types"
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
import { ShieldCheck } from "lucide-react"
import { TableActions } from "./table-actions"

interface SponsorListViewProps {
  data: Sponsor[]
}

export function SponsorsListView({ data }: SponsorListViewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px] text-center">Status</TableHead>
            <TableHead>Organization Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((sponsor) => (
              <TableRow key={sponsor.sponsor_id}>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                </TableCell>
                <TableCell className="font-medium text-sm text-card-foreground">
                  {sponsor.name}
                </TableCell>

                <TableCell className="text-right">
                  <TableActions
                    label="Sponsor Management"
                    onEdit={() => console.log("Edit Sponsor " + sponsor.sponsor_id)}
                    onDelete={() => console.log("Delete Sponsor " + sponsor.sponsor_id)}
                  />
                </TableCell>

              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                No sponsors found.
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