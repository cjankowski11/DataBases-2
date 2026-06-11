import type { Address } from "@/types/gym-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import React, { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"

interface AddressListViewProps {
  data: Address[],
  onDelete: (addressId: number) => void;
}

export function AddressListView({ data, onDelete }: AddressListViewProps) {
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
            <TableHead>City</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Postal Code</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((a) => (
              <TableRow key={a.address_id}>
                {/* City */}
                <TableCell className="font-medium">
                  {a.city}
                </TableCell>

                {/* Street and number */}
                <TableCell>
                  {`${a.street} ${a.building_number}`}
                </TableCell>

                {/* Postal code */}
                <TableCell className="text-muted-foreground text-sm">
                  {a.postal_code}
                </TableCell>

                <TableCell className="text-right">
                  <TableActions
                    label="Address Management"
                    onDelete={() => onDelete(a.address_id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No addresses found.
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

