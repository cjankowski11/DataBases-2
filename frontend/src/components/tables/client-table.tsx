import type { Client } from "@/types/gym-types"
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

interface ClientListViewProps {
  data: Client[]
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

type SortField = 'name' | 'surname' | 'email' | 'phone' | 'birth_date';
type SortOrder = 'asc' | 'desc';

export function ClientListView({ data, onEdit, onDelete }: ClientListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('surname');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const itemsPerPage = 10;

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'surname':
        comparison = a.surname.localeCompare(b.surname);
        break;
      case 'email':
        comparison = a.email.localeCompare(b.email);
        break;
      case 'phone':
        comparison = a.phone.localeCompare(b.phone);
        break;
      case 'birth_date':
        comparison = (a.birth_date || "").localeCompare(b.birth_date || "");
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
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                First Name
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('surname')}
            >
              <div className="flex items-center">
                Last Name
                {getSortIcon('surname')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('email')}
            >
              <div className="flex items-center">
                Email
                {getSortIcon('email')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('phone')}
            >
              <div className="flex items-center">
                Phone
                {getSortIcon('phone')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('birth_date')}
            >
              <div className="flex items-center">
                Birth Date
                {getSortIcon('birth_date')}
              </div>
            </TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((c) => (
              <TableRow key={c.client_id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.surname}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>{c.birth_date || "N/A"}</TableCell>
                <TableCell className="text-right">
                  <TableActions
                    label="Client Management"
                    onEdit={onEdit ? () => onEdit(c.client_id) : undefined}
                    onDelete={onDelete ? () => onDelete(c.client_id) : undefined}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No clients found.
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
