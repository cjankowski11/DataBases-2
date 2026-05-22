# BD2


## Authorzy
- Przemysław Twarowski
- Cezary Jankowski
- Maciej Krasoń
- Bartosz Paszkiewicz
- Marta Wiśniewska

## Spis treści

- [Etap 1](#etap-1)
- [Etap 2](#etap-2)
- [Etap 3](#etap-3)

---

## Uruchomienie środowiska

```bash
python3 -m venv venv
source ./venv/bin/activate
pip install -r backend/requirements.txt

# W głównym katalogu:
docker compose up --build
```

---

## Etap 1

**Temat:** System zarządzania siecią siłowni

### Technologie
Backend:Python(FastAPI)

DB:PostgreSQL

Frontend: React


## Etap 2

### Prototyp aplikacji

#### Frontend
Zbudowany w oparciu o bibliotekę React z TypeScript oraz narzędzie Vite. Zapewnia interfejs (Single Page Application) do przeglądania i modyfikowania danych za pomocą interaktywnych tabel i formularzy.

#### Backend
Utworzony w języku Python (FastAPI). Realizuje podejście asynchroniczne i udostępnia zasoby przez architekturę REST API. Łączy się z bazą danych wykorzystując SQLAlchemy (ORM).

#### Baza danych
Wykorzystano PostgreSQL. W tej warstwie osadzono część logiki biznesowej projektu (np. kontrolę stanów magazynowych, walidację pojemności sal) za pomocą mechanizmów po stronie serwera bazy danych.

---

### Procedury operacyjne

| Procedura | Opis |
|---|---|
| `add_subscriptions()` | Dodaje nową ofertę karnetu lub aktualizuje istniejącą |
| `add_equipment_base()` | Wstawia rekord do tabeli bazowej `equipment` |
| `add_weight()` | Obsługuje dodanie sprzętu typu ciężar |
| `add_machine()` | Obsługuje dodanie sprzętu typu maszyna |
| `add_accessory()` | Obsługuje dodanie sprzętu typu akcesorium |
| `add_client_subscription()` | Przypisuje karnet do klienta |
| `add_entry()` | Rejestruje wejście klienta na siłownię |
| `schedule_recurring_class()` | Automatyzuje harmonogramowanie zajęć cyklicznych |

> `add_equipment_base()`, `add_weight()`, `add_machine()` i `add_accessory()` tworzą hierarchię procedur — główna wstawia rekord do tabeli bazowej, a procedury szczegółowe uzupełniają odpowiednie tabele podrzędne.

---

### Procedury generujące dane

#### Zasoby bazowe
`generate_addresses()`, `generate_gyms()`, `generate_rooms()`, `generate_sponsors()`, `generate_subscriptions()`, `generate_articles()`

#### Ludzie
`generate_employees()`, `generate_receptionists()`, `generate_trainers()`, `generate_more_clients()`

#### Relacje i operacje
`generate_contracts()`, `generate_employees_gyms()`, `generate_trainers_classes()`, `generate_equipment()` (losuje typy sprzętu), `generate_classes()`, `generate_registrations()`, `generate_personal_training()`, `generate_transactions()` (tworzy koszyki zakupowe z artykułami)

#### Ruch
`generate_client_subscriptions()`, `generate_entries()` (tworzy historię wejść powiązaną z ważnymi karnetami)

---

### Triggery

| Trigger | Opis |
|---|---|
| `trg_check_duplicate_subscription` | Ochrona przed błędem klienta — zapobiega przypisaniu klientowi drugiego takiego samego, aktywnego karnetu |
| `trg_check_entry_subscription` | Kontrola dostępu (bramka) — przy próbie wejścia sprawdza, czy klient ma aktywny, opłacony karnet |
| `trg_check_entry_gym_hours` | Logika godzin otwarcia — blokuje rejestrację wejścia w godzinach, w których dana siłownia jest zamknięta |
| `trg_check_equipment_state` | Wymusza jednokierunkowe starzenie się sprzętu |
| `trg_check_capacity` | Zapisy na zajęcia — blokuje zapis na zajęcia fitness, jeśli limit miejsc został już osiągnięty |
| `trg_check_and_update_stock` | Obsługa magazynu (sklep) — przy każdym zakupie sprawdza, czy towar jest na stanie, i aktualizuje stan magazynowy |
| `trg_restore_stock` | Korekty transakcji — jeśli transakcja zostanie usunięta lub zaktualizowana, trigger automatycznie przywraca odpowiednią ilość sztuk do magazynu |
| `trg_check_contract_dates_validity` | Umowy sponsorskie — gwarantuje, że data wygaśnięcia umowy następuje po dacie jej zawarcia |
| `trg_check_overlapping_contracts` | Wyłączność sponsoringu — pilnuje, aby ta sama siłownia nie miała dwóch aktywnych umów z tym samym sponsorem w tym samym czasie |

---

### Funkcje raportowe

| Funkcja | Opis |
|---|---|
| `get_class_occupancy_pct(p_class_id)` | Zwraca procentowe zapełnienie konkretnych zajęć fitness |
| `get_transaction_total(p_transaction_client_id)` | Oblicza łączną kwotę do zapłaty za dany koszyk zakupowy w recepcji |
| `get_client_total_spent(p_client_id)` | Agreguje wszystkie historyczne zakupy klienta, wyliczając jego „wartość" dla biznesu |

---

## Etap 3


