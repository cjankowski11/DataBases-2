import type { Address } from "@/types/gym-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import React, { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"

interface AddressListViewProps {
  data: Address[],
  onDelete: (addressId: number) => void;
}

type SortField = 'postal_code' | 'city' | 'id';
type SortOrder = 'asc' | 'desc';

export function AddressListView({ data, onDelete }: AddressListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [sortField, setSortField] = useState<SortField>('id');

  const sortedData = [...data].sort((a, b) => {
    switch (sortField) {
      case 'id':
        return sortOrder === 'asc' ? a.address_id - b.address_id : b.address_id - a.address_id;
      case 'postal_code':
        return sortOrder === 'asc' ? a.postal_code.localeCompare(b.postal_code, "pl") : b.postal_code.localeCompare(a.postal_code);
      case 'city':
        return sortOrder === "asc" ? a.city.localeCompare(b.city, "pl") : b.city.localeCompare(a.city);
    }
  });

  const totalPages = Math.ceil(data.length / itemsPerPage);
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
                onClick={() => handleSort("city")}
                className="hover:bg-transparent p-0 font-semibold text-foreground flex items-center select-none"
              >
                City {getSortIcon("city")}
              </Button>
            </TableHead>
            <TableHead>Address</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("postal_code")}
                className="hover:bg-transparent p-0 font-semibold text-foreground flex items-center select-none"
              >
                Postal Code {getSortIcon("postal_code")}
              </Button>
            </TableHead>
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

