import { useState, useEffect } from "react"
import { ArticleService } from "@/services/gym-service"
import type { Article } from "@/types/gym-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Package, Tag, DollarSign, Hash, CheckCircle, XCircle } from "lucide-react"

interface EditArticleFormProps {
  articleId: number | null
  onSuccess: () => void
}

export function EditArticleForm({ articleId, onSuccess }: EditArticleFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [articleData, setArticleData] = useState<Article | null>(null)
  
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    type?: string;
    price?: string;
    stock?: string;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!articleId) return
      
      try {
        setIsFetchingData(true)
        const data = await ArticleService.getById(articleId)
        setArticleData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load article details")
      } finally {
        setIsFetchingData(false)
      }
    }

    fetchData()
  }, [articleId])

  const validateForm = (formData: FormData): boolean => {
    const errors: { name?: string; type?: string; price?: string; stock?: string } = {};

    const name = formData.get("name") as string;
    if (!name || name.trim() === "") errors.name = "Name is required";

    const type = formData.get("type") as string;
    if (!type || type.trim() === "") errors.type = "Type is required";

    const priceStr = formData.get("price") as string;
    if (!priceStr || priceStr.trim() === "") {
      errors.price = "Price is required";
    } else {
      const price = parseFloat(priceStr);
      if (isNaN(price) || price < 0) errors.price = "Price must be a positive number";
    }

    const stockStr = formData.get("stock") as string;
    if (!stockStr || stockStr.trim() === "") {
      errors.stock = "Stock is required";
    } else {
      const stock = parseInt(stockStr);
      if (isNaN(stock) || stock < 0) errors.stock = "Stock must be a positive integer";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!articleId) return;

    setError(null);

    const formData = new FormData(e.currentTarget);

    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);

    const payload = {
      name: (formData.get("name") as string).trim(),
      type: (formData.get("type") as string).trim(),
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string),
    };

    try {
      await ArticleService.update(articleId, payload)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update article")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string) => {
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isFetchingData) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
          <Package className="w-4 h-4" /> Article Name
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Protein Bar"
          required
          disabled={isLoading}
          defaultValue={articleData?.name}
          onChange={() => handleInputChange('name')}
          className={validationErrors.name ? 'border-destructive' : ''}
        />
        {validationErrors.name && (
          <p className="text-sm text-destructive">{validationErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium flex items-center gap-2">
          <Tag className="w-4 h-4" /> Type
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="type"
          name="type"
          type="text"
          placeholder="e.g. Food, Clothing, Equipment"
          required
          disabled={isLoading}
          defaultValue={articleData?.type}
          onChange={() => handleInputChange('type')}
          className={validationErrors.type ? 'border-destructive' : ''}
        />
        {validationErrors.type && (
          <p className="text-sm text-destructive">{validationErrors.type}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Price ($)
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          required
          disabled={isLoading}
          defaultValue={articleData?.price}
          onChange={() => handleInputChange('price')}
          className={validationErrors.price ? 'border-destructive' : ''}
        />
        {validationErrors.price && (
          <p className="text-sm text-destructive">{validationErrors.price}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="stock" className="text-sm font-medium flex items-center gap-2">
          <Hash className="w-4 h-4" /> Current Stock Level
          <span className="text-destructive">*</span>
        </label>
        <Input
          id="stock"
          name="stock"
          type="number"
          step="1"
          min="0"
          required
          disabled={isLoading}
          defaultValue={articleData?.stock}
          onChange={() => handleInputChange('stock')}
          className={validationErrors.stock ? 'border-destructive' : ''}
        />
        {validationErrors.stock && (
          <p className="text-sm text-destructive">{validationErrors.stock}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating article...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Update Article
          </>
        )}
      </Button>
    </form>
  )
}
