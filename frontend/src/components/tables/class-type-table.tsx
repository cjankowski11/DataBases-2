import { useState } from "react"
import type { ClassType } from "@/types/gym-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "../ui/badge"
import { TablePagination } from "./table-pagination"

import { TableActions } from "./table-actions";

export function ClassTypeListView({ data }: { data: ClassType[] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Class Type Name</TableHead>
            <TableHead className="text-right">Difficulty</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((ct) => (
              <TableRow key={ct.class_type_id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{ct.class_type_id}
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  {ct.name}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={ct.difficulty > 3 ? "destructive" : "secondary"}
                    className="capitalize"
                  >
                    Level {ct.difficulty || 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <TableActions
                    label="Class Type Management"
                    onEdit={() => console.log("Edit " + ct.class_type_id)}
                    onDelete={() => console.log("Delete " + ct.class_type_id)}
                  />
                </TableCell>
              </TableRow>
            ))

          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                No class types defined yet.
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