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
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"

interface TransactionListViewProps {
  data: TransactionClient[]
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

type SortField = 'id' | 'date' | 'client' | 'receptionist';
type SortOrder = 'asc' | 'desc';

export function TransactionListView({ data, onEdit, onDelete }: TransactionListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const itemsPerPage = 10;

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'id':
        comparison = a.transaction_client_id - b.transaction_client_id;
        break;
      case 'date':
        comparison = a.transaction_date.localeCompare(b.transaction_date);
        break;
      case 'client':
        comparison = a.client_id - b.client_id;
        break;
      case 'receptionist':
        comparison = a.receptionist_employee_id - b.receptionist_employee_id;
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
                Transaction ID
                {getSortIcon('id')}
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
              onClick={() => handleSort('client')}
            >
              <div className="flex items-center">
                Client ID
                {getSortIcon('client')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('receptionist')}
            >
              <div className="flex items-center">
                Receptionist ID
                {getSortIcon('receptionist')}
              </div>
            </TableHead>
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
                    onEdit={onEdit ? () => onEdit(t.transaction_client_id) : undefined}
                    onDelete={onDelete ? () => onDelete(t.transaction_client_id) : undefined}
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
