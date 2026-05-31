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
import { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"

interface ArticleListViewProps {
  data: Article[]
}

export function ArticleListView({ data }: ArticleListViewProps) {
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
            <TableHead>Article Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock Level</TableHead>
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
                    onEdit={() => console.log("Edit " + a.article_id)}
                    onDelete={() => console.log("Delete " + a.article_id)}
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
