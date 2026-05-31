import { useEffect, useState } from "react";
import { ArticleService } from "@/services/gym-service";
import { ArticleListView } from "@/components/tables/article-table";
import type { Article } from "@/types/gym-types";
import { Loader2, AlertCircle, Package, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function ArticlesView() {
  const [data, setData] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
        </div>
        <Button onClick={() => console.log("Open Create Modal")} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Article
        </Button>
      </div>
      <ArticleListView data={data} />
    </div>
  );
}
