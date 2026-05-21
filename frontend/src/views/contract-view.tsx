import { useEffect, useState } from "react";
import { ContractService } from "@/services/gym-service";
import type { Contract } from "@/types/gym-types";
import { Loader2, AlertCircle, FileText, Plus, Calendar, Coins, Building2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


export default function ContractView() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const contracts = await ContractService.getAll();
        setContracts(contracts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load contracts");
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


  const groupedByGym = contracts.reduce((groups, contract) => {
    const gymName = contract.gym?.name || `Gym #${contract.gym_id}`;
    if (!groups[gymName]) {
      groups[gymName] = [];
    }
    groups[gymName].push(contract);
    return groups;
  }, {} as Record<string, Contract[]>);

  return (
    <div className="p-8 space-y-8">
      {/* View Header block */}
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sponsorship Contracts</h1>
          </div>
        </div>
        <Button onClick={() => console.log("Open Contract Modal")} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Contract
        </Button>
      </div>

      {contracts.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">No active contracts found.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByGym).map(([gymName, gymContracts]) => (
            <div key={gymName} className="space-y-3">
              {/* Gym Group Header section */}
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground tracking-wider uppercase border-b border-dashed pb-1.5">
                <Building2 className="w-4 h-4 text-primary" />
                <span>{gymName}</span>
                <Badge variant="secondary" className="ml-1 text-[11px] font-normal lowercase">
                  {gymContracts.length} {gymContracts.length === 1 ? "contract" : "contracts"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {gymContracts.map((contract) => (
                  <Card 
                    key={contract.contract_id} 
                    className="flex flex-col justify-between p-3 h-[175px] w-full min-w-[140px] max-w-[180px] hover:border-primary/40 transition-colors"
                  >
                    <CardContent className="p-0 flex flex-col h-full justify-between">
                      
                      {/* Name */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-muted-foreground">#{contract.contract_id}</span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-1.5 py-0.5 rounded">Active</span>
                        </div>
                        <h3 className="font-bold text-sm tracking-tight text-card-foreground line-clamp-2 mt-0.5" title={contract.sponsor?.name}>
                          {contract.sponsor?.name || `Sponsor #${contract.sponsor_id}`}
                        </h3>
                      </div>

                      {/* Money */}
                      <div className="my-2">
                        <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
                          <Coins className="w-3 h-3 text-amber-500" />
                          <span>Payout</span>
                        </div>
                        <div className="text-base font-extrabold text-foreground tracking-tight">
                          {Number(contract.payment || 0).toLocaleString()} zł
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="border-t pt-2 space-y-0.5 text-[11px] text-muted-foreground">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> Start:</span>
                          <span className="font-mono text-right">{contract.contract_date.slice(2, 10)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> End:</span>
                          <span className="font-mono text-right text-destructive font-medium">{contract.expiration_date.slice(2, 10)}</span>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}