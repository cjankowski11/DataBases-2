import { useEffect, useState, useMemo, useRef } from "react";
import { AddressService } from "@/services/gym-service";
import { AddressListView } from "@/components/tables/address-table";
import type { Address } from "@/types/gym-types";
import { Loader2, MapPinHouse, Plus, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";
import { AddressForm } from "@/components/forms/address-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function AddressesView() {
  const [data, setData] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [addressToDeleteId, setAddressToDeleteId] = useState<number | string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const addresses = await AddressService.getAll();
      setData(addresses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load addresses");
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
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteClick = (addressId: number) => {
    setAddressToDeleteId(addressId);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDeleteId) return;
    setIsDeleting(true);

    try {
      console.log("Delete finalized for address ID: " + addressToDeleteId);
      await AddressService.delete(addressToDeleteId);
      setSuccessMessage("Address deleted successfully!");
      await fetchData();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error: any) {
      setError(error instanceof Error ? error.message : "Failed to delete address");

      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setAddressToDeleteId(null);
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setAddressToDeleteId(null);
  };


  const handleSheetClose = () => {
    setIsSheetOpen(false);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    fetchData();
    setSuccessMessage("Address saved successfully!");
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const availableCities = useMemo(() => {
    const cities = data.map(addr => addr.city).filter(Boolean);
    return Array.from(new Set(cities));
  }, [data]);

  const filteredCityOptions = useMemo(() => {
    return availableCities.filter(city =>
      city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableCities, searchTerm]);

  const filteredAddresses = useMemo(() => {
    if (selectedCities.length === 0) return data;
    return data.filter(address => selectedCities.includes(address.city));
  }, [data, selectedCities]);

  const toggleCity = (city: string) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(selectedCities.filter(c => c !== city));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const removeCity = (city: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCities(selectedCities.filter(c => c !== city));
  };

  const addressToDelete = addressToDeleteId
    ? data.find(a => a.address_id === addressToDeleteId)
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
          <MapPinHouse className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Addresses</h1>
        </div>
        <Button onClick={() => setIsSheetOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Address
        </Button>
      </div>

      <div className="relative w-full max-w-md" ref={containerRef}>
        <div
          className="min-h-[42px] p-1.5 flex flex-wrap gap-1.5 border border-gray-300 rounded-lg bg-white cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
          onClick={() => setIsSearchOpen(true)}
        >
          {selectedCities.map(city => (
            <span 
              key={city} 
              className="flex items-center gap-1 bg-blue-100 text-blue-800 text-sm pl-2 pr-1 py-0.5 rounded-md font-medium"
            >
              {city}
              <button
                type="button"
                onClick={(e) => removeCity(city, e)}
                className="hover:bg-blue-200 rounded p-0.5 inline-flex items-center justify-center text-blue-600"
              >
                x
              </button>
            </span>
          ))}

          <input
            type="text"
            className="flex-1 bg-transparent outline-none min-w-[60px] text-sm text-gray-700 px-1"
            placeholder={selectedCities.length === 0 ? "Filter by cities" : ""}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearchOpen(true);
            }}
          />
        </div>

        {isSearchOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredCityOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">No addresses found</div>
            ) : (
              filteredCityOptions.map(city => {
                const isSelected = selectedCities.includes(city);
                return (
                  <div
                    key={city}
                    onClick={() => toggleCity(city)}
                    className={`flex items-center justify-between px-4 py-2 text-sm cursor-pointer select-none transition-colors ${
                      isSelected ? 'bg-blue-50 text-blue-900 font-medium' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{city}</span>
                    {isSelected && <span className="text-blue-600 font-bold">✓</span>}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
          <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                Add New Address
              </SheetTitle>
              <SheetDescription>
                Create a new address. Fill in all the details below.
              </SheetDescription>
            </SheetHeader>
              <AddressForm onSuccess={handleSuccess} />
          </SheetContent>
        </Sheet>

      <AddressListView
        data={filteredAddresses}
        onDelete={handleDeleteClick}
      />

      <DeleteConfirmDialog
        isOpen={addressToDeleteId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Address"
        description={`Are you sure you want to delete address "${addressToDelete?.city} ${addressToDelete?.street} #${addressToDelete?.address_id}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}