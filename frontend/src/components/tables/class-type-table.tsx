import { useState } from "react"
import type { ClassType } from "@/types/gym-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "../ui/badge"
import { TablePagination } from "./table-pagination"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { TableActions } from "./table-actions";

interface ClassTypeListViewProps {
  data: ClassType[]
  onEdit: (classTypeId: number) => void;
  onDelete: (classTypeId: number) => void;
}

type SortField = 'id' | 'name' | 'difficulty';
type SortOrder = 'asc' | 'desc';

export function ClassTypeListView({ data, onEdit, onDelete }: ClassTypeListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const itemsPerPage = 10;

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'id':
        comparison = a.class_type_id - b.class_type_id;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'difficulty':
        comparison = a.difficulty - b.difficulty;
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
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead
              className="w-[100px] cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('id')}
            >
              <div className="flex items-center">
                ID
                {getSortIcon('id')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Class Type Name
                {getSortIcon('name')}
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
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((ct) => (
              <TableRow key={ct.class_type_id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{ct.class_type_id}
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  {ct.name}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={ct.difficulty > 3 ? "destructive" : "secondary"}
                    className="capitalize"
                  >
                    Level {ct.difficulty || 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <TableActions
                    label="Class Type Management"
                    onEdit={() => onEdit(ct.class_type_id)}
                    onDelete={() => onDelete(ct.class_type_id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No class types defined yet.
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