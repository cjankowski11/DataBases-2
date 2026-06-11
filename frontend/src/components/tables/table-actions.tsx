import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TableActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  label?: string;
}

export function TableActions({ onEdit, onDelete, label = "Actions" }: TableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onEdit && (
          <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
            <Pencil className="h-4 w-4 text-muted-foreground" />
            Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}