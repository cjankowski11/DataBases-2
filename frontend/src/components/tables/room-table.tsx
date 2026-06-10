import type { Room } from "@/types/gym-types"
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

interface RoomListViewProps {
  data: Room[];
  onEdit: (roomId: number) => void;
  onDelete: (roomId: number) => void;
}

export function RoomListView({ data, onEdit, onDelete }: RoomListViewProps) {
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
            <TableHead>Room ID</TableHead>
            <TableHead>Room Name</TableHead>
            <TableHead className="text-right">Gym</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((r) => (
              <TableRow key={r.room_id}>
                <TableCell className="font-mono text-muted-foreground">
                  #{r.room_id}
                </TableCell>
                <TableCell className="font-medium">
                  {r.name}
                </TableCell>
                <TableCell className="text-right">
                  #{r.gym_id} - {r.gym.name}
                </TableCell>
                <TableCell className="text-right">
                  <TableActions
                    label="Room Management"
                    onEdit={() => onEdit(r.room_id)}
                    onDelete={() => onDelete(r.room_id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                No rooms found.
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