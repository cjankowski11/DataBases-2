import type { Room } from "@/types/gym-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"

interface RoomListViewProps {
  data: Room[];
  onEdit: (roomId: number) => void;
  onDelete: (roomId: number) => void;
}

type SortField = 'id' | 'name' | 'gym';
type SortOrder = 'asc' | 'desc';

export function RoomListView({ data, onEdit, onDelete }: RoomListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const itemsPerPage = 10;

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'id':
        comparison = a.room_id - b.room_id;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'gym':
        comparison = (a.gym?.name || "").localeCompare(b.gym?.name || "");
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === 'asc'
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('id')}
            >
              <div className="flex items-center">
                Room ID
                {getSortIcon('id')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Room Name
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('gym')}
            >
              <div className="flex items-center justify-end">
                Gym
                {getSortIcon('gym')}
              </div>
            </TableHead>
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
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
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