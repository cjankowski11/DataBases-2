import type { Gym } from "@/types/gym-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"
import { useLocation } from "wouter"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"

interface GymListViewProps {
  data: Gym[]
  onEdit: (gym_id: number) => void
  onDelete: (gym_id: number) => void
}

type SortField = 'id' | 'name' | 'open_hour' | 'area';
type SortOrder = 'asc' | 'desc';

export function GymListView({ data, onEdit, onDelete }: GymListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [, setLocation] = useLocation();
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [sortField, setSortField] = useState<SortField>('id');

  const sortedData = [...data].sort((a, b) => {
    switch (sortField) {
      case 'id':
        return sortOrder === 'asc' ? a.gym_id - b.gym_id : b.gym_id - a.gym_id;
      case 'name':
        return sortOrder === "asc" ? a.name.localeCompare(b.name, "pl") : b.name.localeCompare(a.name);
      case 'open_hour':
        const aVal_hr = a.open_hour;
        const bVal_hr = b.open_hour;
        if (aVal_hr === undefined && bVal_hr === undefined) return 0;
        if (aVal_hr === undefined) return 1;
        if (bVal_hr === undefined) return -1;
        return sortOrder === 'asc' ? aVal_hr.localeCompare(bVal_hr) : bVal_hr.localeCompare(aVal_hr);
      case 'area':
        const aVal_a = a.area;
        const bVal_a = b.area;
        if (aVal_a === undefined && bVal_a === undefined) return 0;
        if (aVal_a === undefined) return 1;
        if (bVal_a === undefined) return -1;
        return sortOrder === 'asc' ? aVal_a - bVal_a : bVal_a - aVal_a;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

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
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("name")}
                className="hover:bg-transparent p-0 font-semibold text-foreground flex items-center select-none"
              >
                Gym Name {getSortIcon("name")}
              </Button>
            </TableHead>
            <TableHead>Address</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("open_hour")}
                className="hover:bg-transparent p-0 font-semibold text-foreground flex items-center select-none"
              >
                Hours {getSortIcon("open_hour")}
              </Button>
            </TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-right w-[80px]">
              <Button
                variant="ghost"
                onClick={() => handleSort("area")}
                className="hover:bg-transparent p-0 font-semibold text-foreground flex items-center select-none"
              >
                Area {getSortIcon("area")}
              </Button>
            </TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((g) => (
              <TableRow 
                key={g.gym_id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setLocation(`/gyms/${g.gym_id}/employees`)}
              >
                {/* Gym Name and Established Date */}
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{g.name}</span>
                    <span className="text-[11px] text-muted-foreground font-normal">
                      Est. {g.established}
                    </span>
                  </div>
                </TableCell>

                {/* Address */}
                <TableCell>
                  {g.address ? (
                    <div className="flex flex-col text-sm">
                      <span>{g.address.street} {g.address.building_number}</span>
                      <span className="text-xs text-muted-foreground">
                        {g.address.postal_code} {g.address.city}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic text-sm">
                      No Address Linked
                    </span>
                  )}
                </TableCell>

                {/* Operating Hours */}
                <TableCell>
                  {g.open_hour && g.close_hour ? (
                    <Badge variant="secondary" className="font-mono">
                      {g.open_hour.slice(0, 5)} - {g.close_hour.slice(0, 5)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>

                {/* Email and Phone Contact Info */}
                <TableCell>
                  <div className="flex flex-col text-xs gap-0.5">
                    {g.email && <span className="text-muted-foreground">{g.email}</span>}
                    {g.phone && <span className="font-medium text-card-foreground">{g.phone}</span>}
                    {!g.email && !g.phone && (
                      <span className="text-muted-foreground italic">No contact details</span>
                    )}
                  </div>
                </TableCell>

                {/* Gym Area */}
                <TableCell className="text-right font-mono">
                  {g.area ? `${g.area} m²` : "—"}
                </TableCell>

                <TableCell className="text-right">
                  <div onClick={(e) => e.stopPropagation()}>
                    <TableActions
                      label="Gym Management"
                      onEdit={() => onEdit(g.gym_id)}
                      onDelete={() => onDelete(g.gym_id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No gyms found.
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