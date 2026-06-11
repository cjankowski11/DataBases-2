import { useState, useEffect } from "react"
import { TransactionService, ClientService, ReceptionistService, ArticleService } from "@/services/gym-service"
import type { Client, Employee, Article } from "@/types/gym-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Plus, Trash2, PlusCircle, XCircle } from "lucide-react"

interface TransactionFormProps {
  onSuccess: () => void
}

interface ArticleEntry {
  article_id: number;
  quantity: number;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [clients, setClients] = useState<Client[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [articlesList, setArticlesList] = useState<Article[]>([])

  const [selectedClient, setSelectedClient] = useState<string>("")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [articles, setArticles] = useState<ArticleEntry[]>([])

  const [validationErrors, setValidationErrors] = useState<{
    client_id?: string;
    receptionist_employee_id?: string;
    transaction_date?: string;
    articles?: string;
    [key: string]: string | undefined;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, e, a] = await Promise.all([
          ClientService.getAll(),
          ReceptionistService.getAll(),
          ArticleService.getAll()
        ])
        setClients(c)
        setEmployees(e)
        setArticlesList(a)
        
        // Add one empty article row by default
        setArticles([{ article_id: 0, quantity: 1 }])
      } catch (err) {
        setError("Failed to load details")
      } finally {
        setIsFetchingData(false)
      }
    }
    fetchData()
  }, [])

  const validateForm = (formData: FormData): boolean => {
    const errors: { [key: string]: string } = {};

    if (!selectedClient || selectedClient === "") {
      errors.client_id = "Client selection is required";
    }

    if (!selectedEmployee || selectedEmployee === "") {
      errors.receptionist_employee_id = "Receptionist selection is required";
    }

    const date = formData.get("transaction_date") as string;
    if (!date || date.trim() === "") {
      errors.transaction_date = "Date is required";
    }

    if (articles.length === 0) {
      errors.articles = "At least one article is required";
    } else {
      let hasArticleError = false;
      articles.forEach((art, idx) => {
        if (!art.article_id || art.article_id <= 0) {
          errors[`article_${idx}`] = "Please select an article";
          hasArticleError = true;
        }
        if (!art.quantity || art.quantity < 1) {
          errors[`quantity_${idx}`] = "Quantity must be at least 1";
          hasArticleError = true;
        }
      });
      if (hasArticleError) {
        errors.articles = "Please fix errors in the articles list";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);

    const payload = {
      client_id: parseInt(selectedClient),
      receptionist_employee_id: parseInt(selectedEmployee),
      transaction_date: formData.get("transaction_date") as string,
      articles: articles.map(a => ({
        article_id: a.article_id,
        quantity: a.quantity
      }))
    };

    try {
      await TransactionService.create(payload)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transaction")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addArticle = () => {
    setArticles([...articles, { article_id: 0, quantity: 1 }])
    handleInputChange('articles')
  }

  const removeArticle = (index: number) => {
    const newArticles = [...articles]
    newArticles.splice(index, 1)
    setArticles(newArticles)
    handleInputChange('articles')
    handleInputChange(`article_${index}`)
    handleInputChange(`quantity_${index}`)
  }

  const updateArticle = (index: number, field: keyof ArticleEntry, value: number) => {
    const newArticles = [...articles]
    newArticles[index] = { ...newArticles[index], [field]: value }
    setArticles(newArticles)
    handleInputChange('articles')
    if (field === 'article_id') handleInputChange(`article_${index}`)
    if (field === 'quantity') handleInputChange(`quantity_${index}`)
  }

  if (isFetchingData) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            Client <span className="text-destructive">*</span>
          </label>
          <select
            name="client_id"
            required
            value={selectedClient}
            onChange={(e) => {
              setSelectedClient(e.target.value);
              handleInputChange('client_id');
            }}
            disabled={isLoading}
            className={`flex h-10 w-full rounded-md border ${validationErrors.client_id ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <option value="">Select Client</option>
            {clients.map(c => (
              <option key={c.client_id} value={c.client_id}>
                {c.name} {c.surname}
              </option>
            ))}
          </select>
          {validationErrors.client_id && (
            <p className="text-sm text-destructive">{validationErrors.client_id}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            Receptionist <span className="text-destructive">*</span>
          </label>
          <select
            name="receptionist_employee_id"
            required
            value={selectedEmployee}
            onChange={(e) => {
              setSelectedEmployee(e.target.value);
              handleInputChange('receptionist_employee_id');
            }}
            disabled={isLoading}
            className={`flex h-10 w-full rounded-md border ${validationErrors.receptionist_employee_id ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <option value="">Select Employee</option>
            {employees.map(e => (
              <option key={e.employee_id} value={e.employee_id}>
                {e.name} {e.surname}
              </option>
            ))}
          </select>
          {validationErrors.receptionist_employee_id && (
            <p className="text-sm text-destructive">{validationErrors.receptionist_employee_id}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="transaction_date" className="text-sm font-medium flex items-center gap-2">
          Transaction Date <span className="text-destructive">*</span>
        </label>
        <Input
          id="transaction_date"
          name="transaction_date"
          type="date"
          required
          defaultValue={new Date().toISOString().split('T')[0]}
          disabled={isLoading}
          onChange={() => handleInputChange('transaction_date')}
          className={validationErrors.transaction_date ? 'border-destructive' : ''}
        />
        {validationErrors.transaction_date && (
          <p className="text-sm text-destructive">{validationErrors.transaction_date}</p>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Articles</label>
          <Button type="button" variant="outline" size="sm" onClick={addArticle} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" /> Add Article
          </Button>
        </div>
        
        {articles.map((art, index) => (
          <div key={index} className="flex items-end gap-3 p-3 border rounded-md bg-muted/20">
            <div className="flex-1 space-y-2">
              <label className="text-xs">Select Article</label>
              <select
                required
                value={art.article_id || ""}
                onChange={(e) => updateArticle(index, 'article_id', parseInt(e.target.value))}
                disabled={isLoading}
                className={`flex h-10 w-full rounded-md border ${validationErrors[`article_${index}`] ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <option value="">Select...</option>
                {articlesList.map(a => (
                  <option key={a.article_id} value={a.article_id}>
                    {a.name} (${a.price})
                  </option>
                ))}
              </select>
              {validationErrors[`article_${index}`] && (
                <p className="text-xs text-destructive">{validationErrors[`article_${index}`]}</p>
              )}
            </div>

            <div className="w-24 space-y-2">
              <label className="text-xs">Quantity</label>
              <Input 
                type="number" 
                min="1" 
                required
                value={art.quantity}
                onChange={(e) => updateArticle(index, 'quantity', parseInt(e.target.value) || 0)}
                disabled={isLoading}
                className={validationErrors[`quantity_${index}`] ? 'border-destructive' : ''}
              />
              {validationErrors[`quantity_${index}`] && (
                <p className="text-xs text-destructive">{validationErrors[`quantity_${index}`]}</p>
              )}
            </div>

            <Button 
              type="button" 
              variant="destructive" 
              size="icon" 
              onClick={() => removeArticle(index)}
              disabled={isLoading || articles.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {validationErrors.articles && (
          <p className="text-sm font-medium text-destructive">{validationErrors.articles}</p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating transaction...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Transaction
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
