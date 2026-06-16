import { useEffect, useState, useRef, useMemo } from "react";
import { ContractService } from "@/services/gym-service";
import type { Contract } from "@/types/gym-types";
import { Loader2, FileText, Plus, Calendar, Coins, Building2, XCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ContractForm } from "@/components/forms/contract-form";
import { EditContractForm } from "@/components/forms/edit/edit-contract-form";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";
import { TableActions } from "@/components/tables/table-actions"
import type { SponsorForm } from "@/components/forms/sponsor-form";

export default function ContractView() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingContractId, setEditingContractId] = useState<number | null>(null);
  const [deletingContractId, setDeletingContractId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isSearchGymOpen, setIsSearchGymOpen] = useState(false);
  const [isSearchSponsorOpen, setIsSearchSponsorOpen] = useState(false);
  const [searchTermGym, setSearchTermGym] = useState('');
  const [searchTermSponsor, setSearchTermSponsor] = useState('');
  const [selectedGyms, setSelectedGyms] = useState<string[]>([]);
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);
  const [expFilter, setExpFilter] = useState<string>('all');
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSearchGymOpen(false);
        setIsSearchSponsorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEdit = (contractId: number) => {
    setEditingContractId(contractId);
    setIsSheetOpen(true);
    setIsActionsOpen(false);
    setSelectedContract(null);
  };
  
  const handleDeleteClick = (contractId: number) => {
    setDeletingContractId(contractId);
    setIsActionsOpen(false);
    setSelectedContract(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingContractId) return;

    setIsDeleting(true);
    try {
      await ContractService.delete(deletingContractId);
      setSuccessMessage("Contract deleted successfully!");
      await fetchData();
      setEditingContractId(null);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete contract");

      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingContractId(null);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setEditingContractId(null);
    }, 300);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setSuccessMessage("Contract saved successfully!");
    fetchData();
    setTimeout(() => {
      setEditingContractId(null);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }, 300);
  };

  const availableGyms = useMemo(() => {
    const gyms = contracts.map(contract => contract.gym.name).filter(Boolean);
    return Array.from(new Set(gyms));
  }, [contracts]);

  const filteredGymOptions = useMemo(() => {
    return availableGyms.filter(gym =>
      gym.toLowerCase().includes(searchTermGym.toLowerCase())
    );
  }, [availableGyms, searchTermGym]);

  const availableSponsors = useMemo(() => {
    const sponsors = contracts.map(contract => contract.sponsor.name).filter(Boolean);
    return Array.from(new Set(sponsors));
  }, [contracts]);

  const filteredSponsorOptions = useMemo(() => {
    return availableSponsors.filter(gym =>
      gym.toLowerCase().includes(searchTermSponsor.toLowerCase())
    );
  }, [availableSponsors, searchTermSponsor]);

  const filters = ["all", "active", "expired"];

  const filteredContracts = useMemo(() => {
    let result = contracts;
    if (selectedGyms.length != 0) {
      result = result.filter(contr => selectedGyms.includes(contr.gym.name));
    }
    if (selectedSponsors.length != 0) {
      result = result.filter(contr => selectedSponsors.includes(contr.sponsor.name));
    }
    if (expFilter === "active") {
      result = result.filter(contr => new Date() <= new Date(contr.expiration_date));
    } else if (expFilter === "expired") {
      result = result.filter(contr => new Date() > new Date(contr.expiration_date));
    }
    return result;
  }, [contracts, selectedGyms, selectedSponsors, expFilter]);

  const toggleGym = (gym: string) => {
    if (selectedGyms.includes(gym)) {
      setSelectedGyms(selectedGyms.filter(g => g !== gym));
    } else {
      setSelectedGyms([...selectedGyms, gym]);
    }
  };

  const toggleSponsor = (sponsor: string) => {
    if (selectedSponsors.includes(sponsor)) {
      setSelectedSponsors(selectedSponsors.filter(s => s !== sponsor));
    } else {
      setSelectedSponsors([...selectedSponsors, sponsor]);
    }
  };

  const removeGym = (gym: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedGyms(selectedGyms.filter(g => g !== gym));
  };

  const removeSponsor = (sponsor: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSponsors(selectedSponsors.filter(s => s !== sponsor));
  };

  const isEditing = editingContractId !== null;
  const contractToDelete = deletingContractId
    ? contracts.find(c => c.contract_id === deletingContractId)
    : null;

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const groupedByGym = filteredContracts.reduce((groups, contract) => {
    const gymName = contract.gym?.name || `Gym #${contract.gym_id}`;
    if (!groups[gymName]) {
      groups[gymName] = [];
    }
    groups[gymName].push(contract);
    return groups;
  }, {} as Record<string, Contract[]>);

  return (
    <div className="p-8 space-y-8">

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

      {/* View Header block */}
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sponsorship Contracts</h1>
          </div>
        </div>
        <Button onClick={() => setIsSheetOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Contract
        </Button>
      </div>

      <div className="flex gap-2">
        {filters.map((f) => (
          <Badge
            key={f}
            variant={expFilter === f ? "default" : "outline"}
            className="cursor-pointer capitalize px-3 py-1 text-sm"
            onClick={() => setExpFilter(f)}
          >
            {f}
          </Badge>
        ))}
      </div>
      
      <div className="flex w-full gap-4" ref={containerRef}>
        <div className="relative w-1/2">
          <div
            className="min-h-[42px] p-1.5 flex flex-wrap gap-1.5 border border-gray-300 rounded-lg bg-white cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
            onClick={() => setIsSearchGymOpen(true)}
          >
            {selectedGyms.map(gym => (
              <span 
                key={gym} 
                className="flex items-center gap-1 bg-blue-100 text-blue-800 text-sm pl-2 pr-1 py-0.5 rounded-md font-medium"
              >
                {gym}
                <button
                  type="button"
                  onClick={(e) => removeGym(gym, e)}
                  className="hover:bg-blue-200 rounded p-0.5 inline-flex items-center justify-center text-blue-600"
                >
                  x
                </button>
              </span>
            ))}

            <input
              type="text"
              className="flex-1 bg-transparent outline-none min-w-[60px] text-sm text-gray-700 px-1"
              placeholder={selectedGyms.length === 0 ? "Filter by gyms" : ""}
              value={searchTermGym}
              onChange={(e) => {
                setSearchTermGym(e.target.value);
                setIsSearchGymOpen(true);
              }}
            />
          </div>

          {isSearchGymOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredGymOptions.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">No contracts found</div>
              ) : (
                filteredGymOptions.map(gym => {
                  const isSelected = selectedGyms.includes(gym);
                  return (
                    <div
                      key={gym}
                      onClick={() => toggleGym(gym)}
                      className={`flex items-center justify-between px-4 py-2 text-sm cursor-pointer select-none transition-colors ${
                        isSelected ? 'bg-blue-50 text-blue-900 font-medium' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{gym}</span>
                      {isSelected && <span className="text-blue-600 font-bold">✓</span>}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="relative w-1/2">
          <div
            className="min-h-[42px] p-1.5 flex flex-wrap gap-1.5 border border-gray-300 rounded-lg bg-white cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
            onClick={() => setIsSearchSponsorOpen(true)}
          >
            {selectedSponsors.map(sponsor => (
              <span 
                key={sponsor} 
                className="flex items-center gap-1 bg-blue-100 text-blue-800 text-sm pl-2 pr-1 py-0.5 rounded-md font-medium"
              >
                {sponsor}
                <button
                  type="button"
                  onClick={(e) => removeSponsor(sponsor, e)}
                  className="hover:bg-blue-200 rounded p-0.5 inline-flex items-center justify-center text-blue-600"
                >
                  x
                </button>
              </span>
            ))}

            <input
              type="text"
              className="flex-1 bg-transparent outline-none min-w-[60px] text-sm text-gray-700 px-1"
              placeholder={selectedSponsors.length === 0 ? "Filter by sponsors" : ""}
              value={searchTermSponsor}
              onChange={(e) => {
                setSearchTermSponsor(e.target.value);
                setIsSearchSponsorOpen(true);
              }}
            />
          </div>

          {isSearchSponsorOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredSponsorOptions.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">No contracts found</div>
              ) : (
                filteredSponsorOptions.map(sponsor => {
                  const isSelected = selectedSponsors.includes(sponsor);
                  return (
                    <div
                      key={sponsor}
                      onClick={() => toggleSponsor(sponsor)}
                      className={`flex items-center justify-between px-4 py-2 text-sm cursor-pointer select-none transition-colors ${
                        isSelected ? 'bg-blue-50 text-blue-900 font-medium' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{sponsor}</span>
                      {isSelected && <span className="text-blue-600 font-bold">✓</span>}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {filteredContracts.length === 0 ? (
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
                {gymContracts.map((contract) => {
                  const isSelected = selectedContract?.contract_id === contract.contract_id;

                  return (
                    <Card 
                      key={contract.contract_id} 
                      onClick={() => {
                        setSelectedContract(contract);
                        setIsActionsOpen(true);
                      }}
                      className={`flex flex-col justify-between p-3 h-[175px] w-full min-w-[140px] max-w-[180px] transition-all cursor-pointer ${
                        isSelected && isActionsOpen ? 'border-primary bg-primary/5' : 'hover:border-primary/40'
                      }`}
                    >
                      {isSelected && isActionsOpen ? (
                        <div className="flex flex-col justify-center items-center h-full space-y-2" onClick={(e) => e.stopPropagation()}>
                          <TableActions
                            label="Equipment"
                            onEdit={() => handleEdit(contract.contract_id)}
                            onDelete={() => handleDeleteClick(contract.contract_id)}
                          />
                          <button 
                            onClick={() => {
                              setIsActionsOpen(false);
                              setSelectedContract(null);
                            }}
                            className="text-xs text-muted-foreground underline mt-1 hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <CardContent className="p-0 flex flex-col h-full justify-between">
                          
                          {/* Name */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-muted-foreground">#{contract.contract_id}</span>
                              {new Date(contract.expiration_date) > new Date() ? 
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-1.5 py-0.5 rounded">Active</span>
                                : <span className="text-[10px] bg-red-500/10 text-red-600 font-bold px-1.5 py-0.5 rounded">Expired</span> }
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
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Edit Contract" : "Add New Contract"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Update the contract details. Modify date, type, duration, capagym, or room."
                : "Add a new contract. Fill in all the details below."}
            </SheetDescription>
          </SheetHeader>
          {isEditing ? (
            <EditContractForm
              contractId={editingContractId}
              onSuccess={handleSuccess}
            />
          ) : (
            <ContractForm onSuccess={handleSuccess} />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        isOpen={deletingContractId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Contract"
        description={`Are you sure you want to delete contract "${contractToDelete?.gym?.name} ${contractToDelete?.sponsor?.name} #${contractToDelete?.contract_id}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}