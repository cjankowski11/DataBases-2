import type { Equipment } from "@/types/gym-types"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"

interface EquipmentListViewProps {
  data: Equipment[]
}

const STATE_STYLES: Record<string, string> = {
  new:  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  good: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  used: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  worn: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const TYPE_LABELS: Record<string, string> = {
  machine:   "Machine",
  weight:    "Weight",
  accessory: "Accessory",
}

export function EquipmentListView({ data }: EquipmentListViewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getDetail = (eq: Equipment) => {
    if (eq.equipment_type === "weight" && eq.weight)
      return `${eq.weight} kg`
    if (eq.equipment_type === "machine" && eq.max_weight)
      return `Max ${eq.max_weight} kg · ${eq.bodypart_target ?? "—"}`
    if (eq.equipment_type === "accessory" && eq.type)
      return eq.type
    return "—"
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Producer</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Detail</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>State</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((eq) => (
              <TableRow key={eq.equipment_id}>
                <TableCell className="font-medium">{eq.name}</TableCell>
                <TableCell>{eq.producer}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {TYPE_LABELS[eq.equipment_type] ?? eq.equipment_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {getDetail(eq)}
                </TableCell>
                <TableCell>{Number(eq.price || 0).toFixed(2)} zł</TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                    STATE_STYLES[eq.state] ?? "bg-muted text-muted-foreground"
                  )}>
                    {eq.state}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <TableActions
                    label="Equipment Management"
                    onEdit={() => console.log("Edit " + eq.equipment_id)}
                    onDelete={() => console.log("Delete " + eq.equipment_id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No equipment found.
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