import type { Entry } from "@/types/gym-types"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState, useMemo } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EntryListViewProps {
  data: Entry[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

type SortOrder = "asc" | "desc" | null;

export function EntryListView({ data, onEdit, onDelete }: EntryListViewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const itemsPerPage = 10

  const handleSort = () => {
    setSortOrder((prev) => {
      if (prev === null) return "asc";
      if (prev === "asc") return "desc";
      return null;
    });
  };

  const sortedData = useMemo(() => {
    if (!sortOrder) return data;
    return [...data].sort((a, b) => {
      const dateA = new Date(a.entry_time).getTime();
      const dateB = new Date(b.entry_time).getTime();
      if (sortOrder === "asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }, [data, sortOrder]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const formatDateTime = (iso: string) => {
    const d = new Date(iso)
    return {
      date: d.toLocaleDateString("pl-PL"),
      time: d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const isToday = (iso: string) =>
    new Date(iso).toDateString() === new Date().toDateString()

  const SortIcon = () => {
    if (sortOrder === "asc") return <ArrowUp className="ml-2 h-4 w-4" />;
    if (sortOrder === "desc") return <ArrowDown className="ml-2 h-4 w-4" />;
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Gym</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={handleSort} 
                className="-ml-4 h-8 data-[state=open]:bg-accent font-semibold hover:bg-transparent"
              >
                Date
                <SortIcon />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={handleSort} 
                className="-ml-4 h-8 data-[state=open]:bg-accent font-semibold hover:bg-transparent"
              >
                Time
                <SortIcon />
              </Button>
            </TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((e) => {
              const { date, time } = formatDateTime(e.entry_time)
              return (
                <TableRow key={e.entry_id}>
                  <TableCell className="text-muted-foreground text-sm">
                    #{e.entry_id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {e.client
                      ? `${e.client.name} ${e.client.surname}`
                      : `Client #${e.client_id}`}
                  </TableCell>
                  <TableCell>
                    {e.gym ? e.gym.name : `Gym #${e.gym_id}`}
                  </TableCell>
                  <TableCell>{date}</TableCell>
                  <TableCell>{time}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={isToday(e.entry_time) ? "default" : "secondary"}>
                      {isToday(e.entry_time) ? "Today" : "Past"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <TableActions
                      label="Entry Management"
                      onEdit={() => onEdit(e.entry_id)}
                      onDelete={() => onDelete(e.entry_id)}
                    />
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No entries found.
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