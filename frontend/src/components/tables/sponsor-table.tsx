import type { Sponsor } from "@/types/gym-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { TablePagination } from "./table-pagination"
import { ShieldCheck, ArrowUp, ArrowUpDown, ArrowDown } from "lucide-react"
import { TableActions } from "./table-actions"

interface SponsorListViewProps {
  data: Sponsor[],
  onDelete: (sponsorId: number) => void;
}

type SortField = 'id' | 'name';
type SortOrder = 'asc' | 'desc';

export function SponsorsListView({ data, onDelete }: SponsorListViewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [sortField, setSortField] = useState<SortField>('id');

  const sortedData = [...data].sort((a, b) => {
    switch (sortField) {
      case 'id':
        return sortOrder === 'asc' ? a.sponsor_id - b.sponsor_id : b.sponsor_id - a.sponsor_id;
      case 'name':
        return sortOrder === "asc" ? a.name.localeCompare(b.name, "pl") : b.name.localeCompare(a.name);
    }
  });

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1.5 h-4 w-4 text-muted-foreground/40 shrink-0" />;
    }
    return sortOrder === "asc" 
      ? <ArrowUp className="ml-1.5 h-4 w-4 text-primary shrink-0" /> 
      : <ArrowDown className="ml-1.5 h-4 w-4 text-primary shrink-0" />;
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-px whitespace-nowrap pr-4">
              <Button 
                variant="ghost" 
                onClick={() => handleSort("id")}
                className="hover:bg-transparent p-0 font-semibold text-foreground flex items-center select-none"
              >
                ID {getSortIcon("id")}
              </Button>
            </TableHead>
            <TableHead className="w-[60px] text-left">Status</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("name")}
                className="hover:bg-transparent p-0 font-semibold text-foreground flex items-center select-none"
              >
                Organization Name {getSortIcon("name")}
              </Button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((sponsor) => (
              <TableRow key={sponsor.sponsor_id}>
                <TableCell className="text-muted-foreground text-sm">
                  #{sponsor.sponsor_id}
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex justify-start">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                </TableCell>
                <TableCell className="font-medium text-sm text-card-foreground">
                  {sponsor.name}
                </TableCell>

                <TableCell className="text-right">
                  <TableActions
                    label="Sponsor Management"
                    onDelete={() => onDelete(sponsor.sponsor_id)}
                  />
                </TableCell>

              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No sponsors found.
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