import type { Article } from "@/types/gym-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"

interface ArticleListViewProps {
  data: Article[]
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

type SortField = 'name' | 'type' | 'price' | 'stock';
type SortOrder = 'asc' | 'desc';

export function ArticleListView({ data, onEdit, onDelete }: ArticleListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const itemsPerPage = 10;

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'stock':
        comparison = a.stock - b.stock;
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
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Article Name
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('type')}
            >
              <div className="flex items-center">
                Type
                {getSortIcon('type')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('price')}
            >
              <div className="flex items-center">
                Price
                {getSortIcon('price')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSort('stock')}
            >
              <div className="flex items-center">
                Stock Level
                {getSortIcon('stock')}
              </div>
            </TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((a) => (
              <TableRow key={a.article_id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell className="capitalize">{a.type}</TableCell>
                <TableCell>${a.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={a.stock < 10 ? "destructive" : "secondary"}>
                    {a.stock} in stock
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <TableActions
                    label="Article Management"
                    onEdit={onEdit ? () => onEdit(a.article_id) : undefined}
                    onDelete={onDelete ? () => onDelete(a.article_id) : undefined}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No articles found.
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
