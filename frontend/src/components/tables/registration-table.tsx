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
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"

export type SortField = 'id' | 'client' | 'class' | 'date';
export type SortOrder = 'asc' | 'desc';

interface RegistrationListViewProps {
  data: Registration[]
  totalPages: number
  currentPage: number
  sortField: SortField
  sortOrder: SortOrder
  onPageChange: (page: number) => void
  onSortChange: (field: SortField, order: SortOrder) => void
  onEdit: (registrationId: number) => void
  onDelete: (registrationId: number) => void
}

export function RegistrationListView({
  data,
  totalPages,
  currentPage,
  sortField,
  sortOrder,
  onPageChange,
  onSortChange,
  onEdit,
  onDelete
}: RegistrationListViewProps) {

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortOrder === 'asc'
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px] cursor-pointer hover:bg-muted/50" onClick={() => handleSort('id')}>
              <div className="flex items-center">Reg ID {getSortIcon('id')}</div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('client')}>
              <div className="flex items-center">Client {getSortIcon('client')}</div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('class')}>
              <div className="flex items-center">Class {getSortIcon('class')}</div>
            </TableHead>
            <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('date')}>
              <div className="flex items-center justify-end">Registration Date {getSortIcon('date')}</div>
            </TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((r) => (
              <TableRow key={r.class_registration_id}>
                <TableCell className="text-muted-foreground text-sm">#{r.class_registration_id}</TableCell>
                <TableCell className="font-medium">#{r.client_id} {r.client.name} {r.client.surname}</TableCell>
                <TableCell>#{r.class_id} {r.class_info.class_type.name} - {r.class_info.room.name}</TableCell>
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
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No registrations found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}