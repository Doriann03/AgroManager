# Capitolul 3 - completări recomandate pentru proiectarea bazei de date

Acest fișier nu înlocuiește tot capitolul 3. El conține fragmente și recomandări pentru zona care trebuie verificată cel mai atent: proiectarea bazei de date la nivel conceptual, logic și fizic.

Profesorul a cerut explicit:

- proiectarea la nivel conceptual, prin diagrama Entitate-Relație;
- proiectarea la nivel logic, prin schema bazei de date relaționale;
- proiectarea la nivel fizic, prin descrierea tabelelor, câmpurilor, tipurilor, dimensiunilor și restricțiilor de integritate.

În documentul Word, aceste trei părți trebuie să fie ușor de identificat. Cel mai bine este să rămână ca subcapitole separate: `3.8`, `3.9` și `3.10`.

## 3.8. Proiectarea bazei de date la nivel conceptual - text revizuit

Proiectarea conceptuală identifică entitățile importante ale aplicației și relațiile dintre acestea, fără a intra încă în detalii de tip SQL. Pentru AgroManager, modelul conceptual pornește de la ferma agricolă, deoarece majoritatea datelor operaționale aparțin unei ferme concrete.

Entitatea `Farm` reprezintă ferma înregistrată în platformă. Ea este legată de utilizatori, parcele, produse din magazie, utilaje și cereri de aprovizionare. Entitatea `User` descrie conturile aplicației și include rolurile `FARM_MANAGER`, `AGRONOMIST`, `WORKER` și `SUPER_ADMIN`. Utilizatorii operaționali sunt asociați unei ferme, în timp ce administratorul platformei poate exista fără asociere directă cu o fermă.

Entitatea `Parcel` reprezintă terenurile agricole. O parcelă aparține unei ferme și poate avea activități agricole, sezoane de cultură, valori NDVI și subvenții. Pe baza parcelei se organizează o parte importantă din aplicație: planificarea lucrărilor, istoricul culturilor și raportarea producției.

Entitatea `Activity` descrie lucrările agricole. O activitate este legată de o parcelă, poate avea mai mulți muncitori, poate folosi mai multe utilaje și poate avea consumuri planificate sau raportate. Relația dintre activitate și muncitori, respectiv dintre activitate și utilaje, este de tip many-to-many.

Entitatea `InventoryItem` descrie produsele din magazie, iar `ActivityConsumption` face legătura dintre o activitate și produsul consumat. Această structură permite păstrarea consumurilor reale și folosirea lor în rapoartele economice.

Entitatea `InventoryRequest` descrie cererile de aprovizionare. Ea leagă utilizatorul solicitant, ferma și produsul cerut. Statusul cererii indică dacă solicitarea este în așteptare, aprobată sau respinsă.

Entitatea `Machinery` reprezintă utilajele fermei, iar `MaintenanceLog` păstrează intervențiile de mentenanță. Legătura dintre ele permite urmărirea istoricului tehnic și a costurilor asociate utilajelor.

Entitatea `CropSeason` păstrează date despre cultura unei parcele într-un anumit an, inclusiv producția și valorile folosite în raportare. Entitatea `ParcelSubsidy` completează analiza economică prin subvențiile asociate unei parcele și unui an. Entitățile `Notification`, `ParcelNdviHistory`, `FarmNote` și `AuditLog` susțin comunicarea, istoricul agronomic și trasabilitatea administrativă.

**Aici se inserează Figura 3.10. Diagrama Entitate-Relație la nivel conceptual.**

Recomandare: diagrama trebuie să conțină cel puțin entitățile `Farm`, `User`, `Parcel`, `Activity`, `ActivityConsumption`, `InventoryItem`, `InventoryRequest`, `Machinery`, `MaintenanceLog`, `CropSeason`, `ParcelSubsidy`, `Notification`, `ParcelNdviHistory` și `AuditLog`.

## 3.9. Proiectarea bazei de date la nivel logic - text revizuit

Proiectarea logică transformă modelul conceptual într-o schemă relațională. În această etapă sunt definite tabelele, cheile primare, cheile externe și tabelele de legătură necesare pentru relațiile many-to-many.

Schema relațională principală a aplicației poate fi prezentată astfel:

`farms(id, name, address, contact_email, vision_and_goals, created_by_user_id)`

`users(id, username, password, email, role, hourly_rate, monthly_salary, farm_id)`

`farm_notes(id, title, content, date_created, farm_id)`

`parcels(id, name, crop_type, area_hectares, coordinates_json, farm_id)`

`activities(id, title, type, harvested_yield_kg, start_date, end_date, status, comments, inventory_deducted, parcel_id)`

`activity_workers(activity_id, user_id)`

`activity_machinery(activity_id, machinery_id)`

`activity_consumptions(id, activity_id, inventory_item_id, quantity_used, unit_price_at_consumption)`

`inventory_items(id, name, category, unit_of_measure, quantity_available, minimum_stock_threshold, unit_price, farm_id)`

`inventory_requests(id, item_name, item_category, quantity_requested, unit_of_measure, priority, status, date_created, requester_id, farm_id)`

`machinery(id, name, model, license_plate, type, status, total_hours, maintenance_interval_hours, next_maintenance_hours, last_maintenance_date, purchase_date, farm_id)`

`maintenance_logs(id, date, description, cost, hours_at_maintenance, machinery_id)`

`crop_seasons(id, harvest_year, crop_type, total_yield_kg, sale_price_per_kg, revenue_override, parcel_id)`

`parcel_subsidies(id, parcel_id, year, subsidy_type, amount_per_hectare, total_amount, status, notes)`

`notifications(id, message, type, is_read, date_created, user_id)`

`parcel_ndvi_history(id, parcel_id, period_key, ndvi_value, is_mock_data)`

`audit_logs(id, actor_username, action, entity_type, entity_id, details, created_at)`

**Aici se inserează Figura 3.11. Schema logică a bazei de date relaționale.**

Tabelele `activity_workers` și `activity_machinery` sunt tabele de legătură. Prima permite atribuirea mai multor muncitori la aceeași activitate, iar a doua permite folosirea mai multor utilaje în aceeași lucrare. Aceste relații sunt necesare deoarece o lucrare agricolă poate implica mai multe persoane și mai multe echipamente.

## 3.10. Proiectarea bazei de date la nivel fizic - variantă recomandată

În proiectarea fizică se descrie modul concret în care tabelele sunt implementate în MySQL prin entitățile JPA/Hibernate. Fiecare tabel principal are o cheie primară numerică, de tip `BIGINT`, generată automat. Relațiile dintre tabele sunt reprezentate prin chei externe, iar valorile cu set finit, precum rolul utilizatorului sau statusul unei activități, sunt păstrate ca enumerații.

Pentru a nu încărca excesiv lucrarea, partea fizică poate fi prezentată printr-un tabel sintetic. Este suficient să includă tabelele importante și câmpurile lor. Dacă Word-ul devine prea lung, tabelele foarte detaliate pot fi mutate într-o anexă.

## Tabele recomandate pentru descrierea fizică

### Tabela `farms`

Stochează datele generale ale fermei.

| Câmp | Tip recomandat | Restricții / observații |
| --- | --- | --- |
| `id` | BIGINT | cheie primară, auto-increment |
| `name` | VARCHAR(255) | obligatoriu, unic |
| `address` | VARCHAR(255) | opțional |
| `contact_email` | VARCHAR(255) | opțional |
| `vision_and_goals` | TEXT | opțional |
| `created_by_user_id` | BIGINT | cheie externă către `users`, unic |

### Tabela `users`

Stochează conturile utilizatorilor.

| Câmp | Tip recomandat | Restricții / observații |
| --- | --- | --- |
| `id` | BIGINT | cheie primară, auto-increment |
| `username` | VARCHAR(255) | obligatoriu, unic |
| `password` | VARCHAR(255) | obligatoriu, parolă hash-uită |
| `email` | VARCHAR(255) | opțional |
| `role` | VARCHAR(50) | obligatoriu, enum: `FARM_MANAGER`, `AGRONOMIST`, `WORKER`, `SUPER_ADMIN` |
| `hourly_rate` | DOUBLE | folosit pentru muncitori |
| `monthly_salary` | DOUBLE | folosit pentru agronomi |
| `farm_id` | BIGINT | cheie externă către `farms`, poate fi NULL pentru `SUPER_ADMIN` |

### Tabela `parcels`

Stochează parcelele agricole ale fermei.

| Câmp | Tip recomandat | Restricții / observații |
| --- | --- | --- |
| `id` | BIGINT | cheie primară, auto-increment |
| `name` | VARCHAR(255) | obligatoriu |
| `crop_type` | VARCHAR(255) | cultura curentă |
| `area_hectares` | DOUBLE | suprafața parcelei |
| `coordinates_json` | TEXT / JSON | delimitarea geografică |
| `farm_id` | BIGINT | cheie externă către `farms` |

### Tabela `activities`

Stochează lucrările agricole planificate și executate.

| Câmp | Tip recomandat | Restricții / observații |
| --- | --- | --- |
| `id` | BIGINT | cheie primară, auto-increment |
| `title` | VARCHAR(255) | denumirea lucrării |
| `type` | VARCHAR(50) | enum pentru tipul activității |
| `harvested_yield_kg` | DOUBLE | cantitate recoltată, unde este cazul |
| `start_date` | DATETIME | început planificat sau raportat |
| `end_date` | DATETIME | finalizare |
| `status` | VARCHAR(50) | enum: `PENDING`, `IN_PROGRESS`, `COMPLETED` |
| `comments` | TEXT | observații din teren |
| `inventory_deducted` | BOOLEAN | indică dacă stocul a fost scăzut |
| `parcel_id` | BIGINT | cheie externă către `parcels` |

### Tabela `activity_consumptions`

Stochează materialele asociate unei activități și cantitatea raportată.

| Câmp | Tip recomandat | Restricții / observații |
| --- | --- | --- |
| `id` | BIGINT | cheie primară, auto-increment |
| `activity_id` | BIGINT | cheie externă către `activities` |
| `inventory_item_id` | BIGINT | cheie externă către `inventory_items` |
| `quantity_used` | DOUBLE | cantitate consumată |
| `unit_price_at_consumption` | DOUBLE | prețul unitar la momentul consumului |

### Tabela `inventory_items`

Stochează produsele din magazie.

| Câmp | Tip recomandat | Restricții / observații |
| --- | --- | --- |
| `id` | BIGINT | cheie primară, auto-increment |
| `name` | VARCHAR(255) | obligatoriu |
| `category` | VARCHAR(50) | enum pentru categoria produsului |
| `unit_of_measure` | VARCHAR(50) | unitatea de măsură |
| `quantity_available` | DOUBLE | cantitate curentă |
| `minimum_stock_threshold` | DOUBLE | prag minim pentru alertare |
| `unit_price` | DOUBLE | preț unitar |
| `farm_id` | BIGINT | cheie externă către `farms` |

### Tabela `inventory_requests`

Stochează cererile de aprovizionare.

| Câmp | Tip recomandat | Restricții / observații |
| --- | --- | --- |
| `id` | BIGINT | cheie primară, auto-increment |
| `item_name` | VARCHAR(255) | produs solicitat |
| `item_category` | VARCHAR(50) | categorie |
| `quantity_requested` | DOUBLE | cantitate solicitată |
| `unit_of_measure` | VARCHAR(50) | unitate de măsură |
| `priority` | VARCHAR(50) | prioritate |
| `status` | VARCHAR(50) | `PENDING`, `APPROVED`, `REJECTED` |
| `date_created` | DATETIME | data creării |
| `requester_id` | BIGINT | cheie externă către `users` |
| `farm_id` | BIGINT | cheie externă către `farms` |

### Tabela `machinery`

Stochează utilajele fermei.

| Câmp | Tip recomandat | Restricții / observații |
| --- | --- | --- |
| `id` | BIGINT | cheie primară, auto-increment |
| `name` | VARCHAR(255) | denumirea utilajului |
| `model` | VARCHAR(255) | model |
| `license_plate` | VARCHAR(255) | număr de înmatriculare |
| `type` | VARCHAR(50) | enum pentru tipul utilajului |
| `status` | VARCHAR(50) | enum pentru disponibilitate |
| `total_hours` | INT | ore totale de funcționare |
| `maintenance_interval_hours` | INT | interval de mentenanță |
| `next_maintenance_hours` | INT | prag pentru următoarea mentenanță |
| `last_maintenance_date` | DATE | data ultimei intervenții |
| `purchase_date` | DATE | data achiziției |
| `farm_id` | BIGINT | cheie externă către `farms` |

### Tabela `maintenance_logs`

Stochează intervențiile de service.

| Câmp | Tip recomandat | Restricții / observații |
| --- | --- | --- |
| `id` | BIGINT | cheie primară, auto-increment |
| `date` | DATE | data intervenției |
| `description` | VARCHAR(1000) / TEXT | descrierea lucrării |
| `cost` | DOUBLE | costul intervenției |
| `hours_at_maintenance` | INT | orele utilajului la service |
| `machinery_id` | BIGINT | cheie externă către `machinery` |

### Tabela `crop_seasons`

Stochează istoricul culturilor și datele de producție.

| Câmp | Tip recomandat | Restricții / observații |
| --- | --- | --- |
| `id` | BIGINT | cheie primară, auto-increment |
| `harvest_year` | INT | anul recoltei |
| `crop_type` | VARCHAR(255) | cultura |
| `total_yield_kg` | DOUBLE | producție totală |
| `sale_price_per_kg` | DOUBLE | preț de vânzare |
| `revenue_override` | DOUBLE | venit introdus manual, opțional |
| `parcel_id` | BIGINT | cheie externă către `parcels` |

### Tabela `parcel_subsidies`

Stochează subvențiile asociate parcelelor.

| Câmp | Tip recomandat | Restricții / observații |
| --- | --- | --- |
| `id` | BIGINT | cheie primară, auto-increment |
| `parcel_id` | BIGINT | cheie externă către `parcels`, obligatoriu |
| `year` | INT | anul subvenției, obligatoriu |
| `subsidy_type` | VARCHAR(255) | tipul subvenției, obligatoriu |
| `amount_per_hectare` | DOUBLE | valoare pe hectar |
| `total_amount` | DOUBLE | valoare totală, obligatoriu |
| `status` | VARCHAR(50) | enum: `ESTIMATED`, `SUBMITTED`, `APPROVED`, `PAID`, în funcție de valorile implementate |
| `notes` | VARCHAR(1000) | observații |

### Tabela `notifications`

Stochează notificările transmise utilizatorilor.

| Câmp | Tip recomandat | Restricții / observații |
| --- | --- | --- |
| `id` | BIGINT | cheie primară, auto-increment |
| `message` | VARCHAR(1000) / TEXT | mesajul notificării |
| `type` | VARCHAR(100) | tipul evenimentului |
| `is_read` | BOOLEAN | citit / necitit |
| `date_created` | DATETIME | data creării |
| `user_id` | BIGINT | cheie externă către `users` |

### Tabela `audit_logs`

Stochează acțiunile administrative importante.

| Câmp | Tip recomandat | Restricții / observații |
| --- | --- | --- |
| `id` | BIGINT | cheie primară, auto-increment |
| `actor_username` | VARCHAR(255) | utilizatorul care a realizat acțiunea |
| `action` | VARCHAR(100) | tipul acțiunii |
| `entity_type` | VARCHAR(100) | tipul entității afectate |
| `entity_id` | BIGINT | identificatorul entității |
| `details` | TEXT | detalii despre modificare |
| `created_at` | DATETIME | momentul acțiunii |

## Unde se pun diagramele

În `3.8`, după primul sau al doilea paragraf explicativ, se inserează diagrama ER conceptuală. Caption recomandat: `Figura 3.10. Diagrama Entitate-Relație pentru aplicația AgroManager`.

În `3.9`, după lista schemei relaționale, se inserează schema logică. Caption recomandat: `Figura 3.11. Schema relațională a bazei de date`.

În `3.10`, după introducerea despre proiectarea fizică, se pot insera tabelele fizice. Dacă ocupă prea mult spațiu, păstrează în capitol doar tabelele principale și mută restul într-o anexă.

## Ce trebuie verificat manual

Verifică în MySQL sau în entitățile JPA dacă numele generate ale coloanelor coincid exact cu cele din lucrare. Hibernate poate transforma automat numele Java camelCase în snake_case, dar este bine să verifici schema finală.

Verifică valorile exacte ale enumerațiilor înainte de forma finală: statusuri de activitate, statusuri de cerere, statusuri de utilaj, tipuri de utilaj, tipuri de activitate, categorii de produse și statusuri de subvenție.

Dacă implementezi consum separat de combustibil, raportare defect utilaj sau bonus pentru agronom, adaugă câmpurile/tabelele corespunzătoare și actualizează `3.9` și `3.10`.
