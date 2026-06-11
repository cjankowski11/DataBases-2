import type { Gym } from "@/types/gym-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"


interface GymListViewProps {
  data: Gym[]
  onEdit: (gym_id: number) => void
  onDelete: (gym_id: number) => void
}

export function GymListView({ data, onEdit, onDelete }: GymListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Gym Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-right">Area</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((g) => (
              <TableRow key={g.gym_id}>
                {/* Gym Name nd Established Date */}
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
                  <TableActions
                    label="Gym Management"
                    onEdit={() => onEdit(g.gym_id)}
                    onDelete={() => onDelete(g.gym_id)}
                  />
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

