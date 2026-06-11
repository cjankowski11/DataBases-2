import type { Registration } from "@/types/gym-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar } from "lucide-react"
import { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions";
import { RegistrationService } from "@/services/gym-service"

interface RegistrationListViewProps {
  data: Registration[]
  onEdit: (registrationId: number) => void;
  onDelete: (registrationId: number) => void;
}

type SortField = 'id' | 'client' | 'class' | 'date';
type SortOrder = 'asc' | 'desc';

export function RegistrationListView({ data, onEdit, onDelete }: RegistrationListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'id':
        comparison = a.class_registration_id - b.class_registration_id;
        break;
      case 'client':
        comparison = a.client_id - b.client_id;
        break;
      case 'class':
        comparison = a.class_id - b.class_id;
        break;
      case 'date':
        comparison = new Date(a.registration_date).getTime() - new Date(b.registration_date).getTime();
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
              className="w-[120px] cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('id')}
            >
              <div className="flex items-center">
                Reg ID
                {getSortIcon('id')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('client')}
            >
              <div className="flex items-center">
                Client
                {getSortIcon('client')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('class')}
            >
              <div className="flex items-center">
                Class
                {getSortIcon('class')}
              </div>
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center justify-end">
                Registration Date
                {getSortIcon('date')}
              </div>
            </TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((r) => (
              <TableRow key={r.class_registration_id}>
                <TableCell className="text-muted-foreground text-sm">
                  #{r.class_registration_id}
                </TableCell>
                <TableCell className="font-medium">
                  #{r.client_id} {r.client.name} {r.client.surname}
                </TableCell>
                <TableCell>
                  #{r.class_id} {r.class_info.class_type.name} - {r.class_info.room.name} - {r.class_info.room.gym.name}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(r.registration_date).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <TableActions
                    label="Registration Management"
                    onEdit={() => onEdit(r.class_registration_id)}
                    onDelete={() => onDelete(r.class_registration_id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No registrations found.
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