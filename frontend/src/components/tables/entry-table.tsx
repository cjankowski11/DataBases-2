import type { Entry } from "@/types/gym-types"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { TablePagination } from "./table-pagination"
import { TableActions } from "./table-actions"
import { EntryService } from "@/services/gym-service"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface EntryListViewProps {
  data: Entry[]
}

export function EntryListView({ data }: EntryListViewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [entryToDelete, setEntryToDelete] = useState<number | string | null>(null)

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;

    try {
      console.log("Delete finalized for entry ID: " + entryToDelete);
      await EntryService.delete(entryToDelete);
      window.location.reload();
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred.";

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Deletion Failed:\n${errorMessage}`);
      console.error("Failed to delete entry:", error);
    } finally {
      setEntryToDelete(null);
    }
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso)
    return {
      date: d.toLocaleDateString("pl-PL"),
      time: d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const isToday = (iso: string) =>
    new Date(iso).toDateString() === new Date().toDateString()

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Gym</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
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
                      onEdit={() => console.log("Edit " + e.entry_id)}
                      onDelete={() => setEntryToDelete(e.entry_id)}
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

      <AlertDialog 
        open={entryToDelete !== null} 
        onOpenChange={(open) => { if (!open) setEntryToDelete(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Do you want to delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}