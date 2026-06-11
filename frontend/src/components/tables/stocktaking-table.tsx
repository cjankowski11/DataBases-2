import type { Stocktaking } from "@/types/gym-types"
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

interface StocktakingListViewProps {
  data: Stocktaking[]
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

type SortField = 'id' | 'gym' | 'date';
type SortOrder = 'asc' | 'desc';

export function StocktakingListView({ data, onEdit, onDelete }: StocktakingListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const itemsPerPage = 10;

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'id':
        comparison = a.stocktaking_id - b.stocktaking_id;
        break;
      case 'gym':
        comparison = a.gym_id - b.gym_id;
        break;
      case 'date':
        comparison = a.stocktaking_date.localeCompare(b.stocktaking_date);
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
                Stocktaking ID
                {getSortIcon('id')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('gym')}
            >
              <div className="flex items-center">
                Gym ID
                {getSortIcon('gym')}
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
                    onEdit={onEdit ? () => onEdit(s.stocktaking_id) : undefined}
                    onDelete={onDelete ? () => onDelete(s.stocktaking_id) : undefined}
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
