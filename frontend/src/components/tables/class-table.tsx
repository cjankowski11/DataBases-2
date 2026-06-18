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
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

interface ClassListViewProps {
  data: GymClass[],
  onEdit: (classId: number) => void,
  onDelete: (classId: number) => void;
}

type SortField = 'id' | 'name' | 'date' | 'room' | 'duration' | 'capacity' | 'difficulty';
type SortOrder = 'asc' | 'desc';

export function ClassListView({ data, onEdit, onDelete }: ClassListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const itemsPerPage = 10;

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'id':
        comparison = a.class_id - b.class_id;
        break;
      case 'name':
        comparison = (a.class_type?.name || "").localeCompare(b.class_type?.name || "");
        break;
      case 'date':
        comparison = new Date(a.class_date).getTime() - new Date(b.class_date).getTime();
        break;
      case 'room':
        comparison = (a.room?.name || "").localeCompare(b.room?.name || "");
        break;
      case 'duration':
        comparison = a.duration - b.duration;
        break;
      case 'capacity':
        comparison = (a.occupancy_pct || 0) - (b.occupancy_pct || 0);
        break;
      case 'difficulty':
        comparison = (a.class_type?.difficulty || 0) - (b.class_type?.difficulty || 0);
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
                Class ID
                {getSortIcon('id')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Class Name
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center">
                Date
                {getSortIcon('date')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('room')}
            >
              <div className="flex items-center">
                Room
                {getSortIcon('room')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('duration')}
            >
              <div className="flex items-center">
                Duration
                {getSortIcon('duration')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('capacity')}
            >
              <div className="flex items-center">
                Capacity
                {getSortIcon('capacity')}
              </div>
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('difficulty')}
            >
              <div className="flex items-center justify-end">
                Difficulty
                {getSortIcon('difficulty')}
              </div>
            </TableHead>
            <TableHead>Trainers</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((c) => (
              <TableRow key={c.class_id}>
                <TableCell className="text-muted-foreground text-sm">#{c.class_id}</TableCell>
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
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {c.trainers && c.trainers.length > 0 ? (
                      c.trainers.map((trainer) => (
                        <Badge
                          key={trainer.employee_id}
                          variant="outline"
                          className="bg-background text-xs font-normal"
                        >
                          {trainer.name} {trainer.surname}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No trainers</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <TableActions
                    label="Class Management"
                    onEdit={() => onEdit(c.class_id)}
                    onDelete={() => onDelete(c.class_id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
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