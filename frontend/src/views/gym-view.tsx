import { useEffect, useState, useRef, useMemo } from "react";
import { GymService } from "@/services/gym-service";
import { GymListView } from "@/components/tables/gym-table";
import type { Gym } from "@/types/gym-types";
import { Loader2, CheckCircle, XCircle, Building2, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { GymForm } from "@/components/forms/gym-form";
import { EditGymForm } from "@/components/forms/edit/edit-gym-form";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";

export default function GymsView() {
  const [data, setData] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingGymId, setEditingGymId] = useState<number | null>(null);
  const [deletingGymId, setDeletingGymId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hour, setHour] = useState<string>("");
  const [appliedHour, setAppliedHour] = useState<string>("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const gyms = await GymService.getAll();
      setData(gyms);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load gyms");
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

  const handleEdit = (gymId: number) => {
    setEditingGymId(gymId);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (gymId: number) => {
    setDeletingGymId(gymId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGymId) return;

    setIsDeleting(true);
    try {
      await GymService.delete(deletingGymId);
      setSuccessMessage("Gym deleted successfully!");
      await fetchData();
      setDeletingGymId(null);

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete gym");

      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingGymId(null);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setTimeout(() => {
      setEditingGymId(null);
    }, 300);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setSuccessMessage("Gym saved successfully!");
    fetchData();
    setTimeout(() => {
      setEditingGymId(null);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }, 300);
  };

  const availableCities = useMemo(() => {
    const cities = data.map(gym => gym.address.city).filter(Boolean);
    return Array.from(new Set(cities));
  }, [data]);

  const filteredCityOptions = useMemo(() => {
    return availableCities.filter(city =>
      city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableCities, searchTerm]);

  const isAtHourOpen = (gym: Gym) => {
    if (!gym.open_hour || !gym.close_hour) return false;
    const open = gym.open_hour.slice(0, 5);
    const close = gym.close_hour.slice(0, 5);
    const target = appliedHour.slice(0, 5);
    if (open < close) {
      return target >= open && target <= close;
    } else {
      return target >= open || target <= close;
    }
  }

  const filteredGyms = useMemo(() => {
    let result = data;
    if (selectedCities.length != 0) {
      result = result.filter(gym => selectedCities.includes(gym.address.city));
    }
    if (appliedHour != "") {
      result = result.filter(gym => isAtHourOpen(gym));
    }
    return result;
  }, [data, selectedCities, appliedHour]);

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

  const removeHour = () => {
    setHour("");
    setAppliedHour("");
  };

  const isEditing = editingGymId !== null;
  const gymToDelete = deletingGymId
    ? data.find(g => g.gym_id === deletingGymId)
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
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Gyms</h1>
        </div>
        <Button
          onClick={() => {
            setEditingGymId(null);
            setIsSheetOpen(true);
          }}
          className="gap-2"
        >
            <Plus className="h-4 w-4" />
            Add Gym
        </Button>
      </div>
      
      <div className="flex w-full gap-4">
        <div className="relative w-1/2" ref={containerRef}>
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
                <div className="p-3 text-sm text-gray-500 text-center">No gyms found</div>
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

        <div className="relative w-1/2 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
            Open at
          </label>
      
          <div className="flex items-center gap-3">
            <input
              type="time"
              step="1"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
            />
            
            <Button onClick={() => setAppliedHour(hour)} size="sm">
              Apply
            </Button>
            {appliedHour && (
              <Button variant="ghost" size="sm" onClick={()=>removeHour()}>Clear</Button>
            )}
          </div>
        </div>
      </div>

      <GymListView
        data={filteredGyms}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="right" className="sm:max-w-[425px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Edit Gym" : "Add New Gym"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Update the gym details. Modify name, address, contact info and area."
                : "Create a new gym. Fill in all the details below."}
            </SheetDescription>
          </SheetHeader>
          {isEditing ? (
            <EditGymForm
              gymId={editingGymId}
              onSuccess={handleSuccess}
            />
          ) : (
            <GymForm onSuccess={handleSuccess} />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        isOpen={deletingGymId !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Gym"
        description={`Are you sure you want to delete gym "${gymToDelete?.name} #${gymToDelete?.gym_id}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}