import { useEffect, useState } from "react";
import { ArticleService } from "@/services/gym-service";
import { ArticleListView } from "@/components/tables/article-table";
import type { Article } from "@/types/gym-types";
import { Loader2, AlertCircle, Package, Plus, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ArticleForm } from "@/components/forms/article-form";
import { EditArticleForm } from "@/components/forms/edit/edit-article-form";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";

export default function ArticlesView() {
  const [data, setData] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [deletingArticleId, setDeletingArticleId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const articles = await ArticleService.getAll();
      setData(articles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load articles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (articleId: number) => {
    setEditingArticleId(articleId);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (articleId: number) => {
    setDeletingArticleId(articleId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingArticleId) return;

    setIsDeleting(true);
    try {
      await ArticleService.delete(deletingArticleId);
      setSuccessMessage("Article deleted successfully!");
      await fetchData();
      setDeletingArticleId(null);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete article");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingArticleId(null);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setEditingArticleId(null);
    }, 300);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setSuccessMessage("Article saved successfully!");
    fetchData();
    setTimeout(() => {
      setEditingArticleId(null);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }, 300);
  };

  const isEditing = editingArticleId !== null;
  const articleToDelete = deletingArticleId
    ? data.find(a => a.article_id === deletingArticleId)
    : null;

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {successMessage && (
        <Alert className="border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
        </div>
        <Button 
          className="gap-2"
          onClick={() => {
            setEditingArticleId(null);
            setIsSheetOpen(true);
          }}
        >
            <Plus className="h-4 w-4" />
            Add Article
        </Button>
      </div>

      <ArticleListView 
        data={data} 
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Edit Article" : "Add New Article"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Update the article details like price or stock."
                : "Create a new article for the gym inventory."}
            </SheetDescription>
          </SheetHeader>
          {isEditing ? (
            <EditArticleForm
              articleId={editingArticleId}
              onSuccess={handleSuccess}
            />
          ) : (
            <ArticleForm onSuccess={handleSuccess} />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        isOpen={deletingArticleId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Article"
        description={`Are you sure you want to delete article "${articleToDelete?.name}"? This action cannot be undone and will fail if the article is part of past transactions.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
