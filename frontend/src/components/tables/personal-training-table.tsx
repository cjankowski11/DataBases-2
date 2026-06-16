import type { PersonalTraining } from "@/types/gym-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { TablePagination } from "./table-pagination";
import { TableActions } from "./table-actions";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface PersonalTrainingListViewProps {
  data: PersonalTraining[];
  onEdit: (trainingId: number) => void;
  onDelete: (trainingId: number) => void;
}

type SortField = 'id' | 'client' | 'trainer' | 'date' | 'duration';
type SortOrder = 'asc' | 'desc';

export function PersonalTrainingListView({ data, onEdit, onDelete }: PersonalTrainingListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const itemsPerPage = 10;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleString("pl-PL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;

    const idA = a.personal_training_id || a.training_id || 0;
    const idB = b.personal_training_id || b.training_id || 0;

    switch (sortField) {
      case 'id':
        comparison = idA - idB;
        break;
      case 'client':
        comparison = (a.client?.name || "").localeCompare(b.client?.name || "");
        break;
      case 'trainer':
        comparison = (a.trainer?.name || "").localeCompare(b.trainer?.name || "");
        break;
      case 'date': {
        const timeA = a.start_time ? new Date(a.start_time).getTime() : 0;
        const timeB = b.start_time ? new Date(b.start_time).getTime() : 0;
        comparison = timeA - timeB;
        break;
      }
      case 'duration':
        comparison = a.duration - b.duration;
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
                ID
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
              onClick={() => handleSort('trainer')}
            >
              <div className="flex items-center">
                Trainer
                {getSortIcon('trainer')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center">
                Date & Time
                {getSortIcon('date')}
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
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((t) => {
              const currentId = t.personal_training_id || t.training_id;

              return (
                <TableRow key={currentId}>
                  <TableCell className="text-muted-foreground text-sm">#{currentId}</TableCell>
                  <TableCell className="font-medium">
                    {t.client?.name || t.client?.surname
                      ? `${t.client.name || ""} ${t.client.surname || ""}`.trim()
                      : "Unknown Client"}
                  </TableCell>
                  <TableCell>
                    {t.trainer?.name || t.trainer?.surname
                      ? `${t.trainer.name || ""} ${t.trainer.surname || ""}`.trim()
                      : "No Trainer Assigned"}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatDate(t.start_time)}
                  </TableCell>
                  <TableCell>{t.duration} min</TableCell>
                  <TableCell className="text-right">
                    <TableActions
                      label="Training Management"
                      onEdit={() => onEdit(currentId)}
                      onDelete={() => onDelete(currentId)}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No personal trainings found.
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
  );
}