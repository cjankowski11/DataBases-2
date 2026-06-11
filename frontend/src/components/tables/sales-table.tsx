import type { ClientSubscription } from "@/types/gym-types"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"

interface SalesListViewProps {
  data: ClientSubscription[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function SalesListView({ data, onEdit, onDelete }: SalesListViewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const isExpired = (date: string) => new Date(date) < new Date()

  const isExpiringSoon = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime()
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000 // 7 dni
  }

  const getExpiryBadge = (date: string) => {
    if (isExpired(date))
      return <Badge variant="destructive">Expired</Badge>
    if (isExpiringSoon(date))
      return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">Expiring soon</Badge>
    return <Badge variant="secondary">Active</Badge>
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Transaction Date</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((s) => (
              <TableRow key={s.client_subscription_id}>
                <TableCell className="text-muted-foreground text-sm">
                  #{s.client_subscription_id}
                </TableCell>
                <TableCell className="font-medium">
                  {s.client
                    ? `${s.client.name} ${s.client.surname}`
                    : `Client #${s.client_id}`}
                </TableCell>
                <TableCell>
                  {s.subscription
                    ? s.subscription.name
                    : `Sub #${s.subscription_id}`}
                </TableCell>
                <TableCell>
                  {new Date(s.transaction_date).toLocaleDateString("pl-PL")}
                </TableCell>
                <TableCell className={cn(
                  isExpired(s.expiration_date) && "text-destructive",
                  isExpiringSoon(s.expiration_date) && "text-orange-500"
                )}>
                  {new Date(s.expiration_date).toLocaleDateString("pl-PL")}
                </TableCell>
                <TableCell>
                  <Badge variant={s.paid_now === "Y" ? "default" : "outline"}>
                    {s.paid_now === "Y" ? "Paid" : "Unpaid"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {getExpiryBadge(s.expiration_date)}
                </TableCell>
                <TableCell className="text-right">
                  <TableActions
                    label="Sale Management"
                    onEdit={() => onEdit(s.client_subscription_id)}
                    onDelete={() => onDelete(s.client_subscription_id)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                No sales found.
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