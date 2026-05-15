import type { GymClass } from "@/types/gym-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"


interface ClassListViewProps {
  data: GymClass[]
}

export function ClassListView({ data }: ClassListViewProps) {
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
            <TableHead>Class Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead className="text-right">Difficulty</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((c) => (
              <TableRow key={c.class_id}>
                <TableCell className="font-medium">
                  {c.class_type?.name || "Unknown Class"}
                </TableCell>
                <TableCell>{c.class_date}</TableCell>
                <TableCell>{c.room?.name || "No Room Assigned"}</TableCell>
                <TableCell>{c.duration} min</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span>{c.capacity} Slots</span>
                      <span className={cn(
                        c.occupancy_pct >= 100 ? "text-destructive" :
                        c.occupancy_pct >= 80 ? "text-orange-500" : ""
                      )}>
                        {c.occupancy_pct}%
                      </span>
                    </div>
                    <Progress
                      value={c.occupancy_pct}
                      className={cn(
                        "h-2",
                        c.occupancy_pct >= 100 ? "[&>div]:bg-destructive" :
                        c.occupancy_pct >= 80 ? "[&>div]:bg-orange-500" : ""
                      )}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={c.class_type?.difficulty > 3 ? "destructive" : "secondary"}
                    className="capitalize"
                  >
                    Level {c.class_type?.difficulty || 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <TableActions
                    label="Class Management"
                    onEdit={() => console.log("Edit " + c.class_id)}
                    onDelete={() => console.log("Delete " + c.class_id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No classes found.
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