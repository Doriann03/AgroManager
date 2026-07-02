# Capitolul 3 - Proiectarea bazei de date

## Proiectarea bazei de date la nivel conceptual

La nivel conceptual, baza de date a aplicatiei AgroManager este reprezentata printr-o diagrama de tip MCD, realizata in MySQL Workbench. Aceasta diagrama evidentiaza principalele entitati ale sistemului, atributele lor si relatiile dintre ele. Modelul conceptual nu urmareste in primul rand detaliile tehnice ale implementarii, ci modul in care informatiile importante ale fermei sunt organizate si corelate.

Entitatea centrala a modelului este ferma, deoarece majoritatea datelor operationale sunt asociate unei ferme concrete. In jurul acesteia sunt organizate informatiile despre utilizatori, parcele, activitati agricole, magazie, utilaje, mentenanta, notificari si cereri de aprovizionare. Parcela reprezinta unitatea agricola de baza asupra careia se planifica lucrari, se urmareste cultura curenta, se inregistreaza istoricul culturilor si se pot asocia informatii despre subventii sau indicatori NDVI. Activitatea agricola face legatura intre parcela, muncitorii alocati, utilajele folosite si consumurile reale de materiale.

Modelul conceptual include si entitati auxiliare, precum notificarile, jurnalul de audit si notele fermei. Acestea nu definesc fluxul agricol principal, dar ajuta la urmarirea actiunilor importante din aplicatie, la informarea utilizatorilor si la pastrarea unui istoric administrativ.

**Aici se insereaza Figura 3.x. Modelul conceptual al bazei de date AgroManager.**

## Proiectarea bazei de date la nivel logic

La nivel logic, modelul conceptual este transpus intr-un set de relatii corespunzatoare tabelelor din baza de date. Fiecare relatie este descrisa prin numele tabelei si lista atributelor acesteia. In documentul Word, atributul marcat cu `[PK]` trebuie subliniat cu linie continua, iar atributele marcate cu `[FK]` trebuie subliniate cu linie discontinua.

Farm: (id [PK], name, address, contact_email, vision_and_goals, created_by_user_id [FK])

User: (id [PK], username, password, email, role, hourly_rate, monthly_salary, farm_id [FK])

Parcel: (id [PK], name, crop_type, area_hectares, coordinates_json, farm_id [FK])

Activity: (id [PK], title, type, harvested_yield_kg, start_date, status, end_date, comments, inventory_deducted, parcel_id [FK])

ActivityWorkers: (activity_id [PK, FK], user_id [PK, FK])

ActivityMachinery: (activity_id [PK, FK], machinery_id [PK, FK])

ActivityConsumption: (id [PK], activity_id [FK], inventory_item_id [FK], quantity_used, unit_price_at_consumption)

InventoryItem: (id [PK], name, category, unit_of_measure, quantity_available, minimum_stock_threshold, unit_price, farm_id [FK])

InventoryRequest: (id [PK], item_name, item_category, quantity_requested, unit_of_measure, priority, status, date_created, requester_id [FK], farm_id [FK])

Machinery: (id [PK], name, model, license_plate, type, status, total_hours, maintenance_interval_hours, next_maintenance_hours, last_maintenance_date, purchase_date, farm_id [FK])

MaintenanceLog: (id [PK], date, description, cost, hours_at_maintenance, machinery_id [FK])

CropSeason: (id [PK], harvest_year, crop_type, total_yield_kg, sale_price_per_kg, revenue_override, parcel_id [FK])

ParcelSubsidy: (id [PK], parcel_id [FK], year, subsidy_type, amount_per_hectare, total_amount, status, notes)

ParcelNdviHistory: (id [PK], parcel_id [FK], period_key, ndvi_value, is_mock_data)

FarmNote: (id [PK], title, content, date_created, farm_id [FK])

Notification: (id [PK], message, type, is_read, date_created, user_id [FK])

AuditLog: (id [PK], actor_id, actor_username, action, target_type, target_id, target_name, details, created_at)

Relatiile de tip multi-la-multi sunt transformate la nivel logic in tabele intermediare. Astfel, asocierea dintre activitati si muncitori este reprezentata prin tabela `ActivityWorkers`, iar asocierea dintre activitati si utilaje este reprezentata prin tabela `ActivityMachinery`. Aceasta abordare permite ca o activitate agricola sa fie realizata de mai multi muncitori si sa utilizeze mai multe utilaje, fara duplicarea informatiilor in tabela principala a activitatilor.

Tabela `AuditLog` pastreaza informatii despre actiunile importante efectuate in sistem. Campul `actor_id` este folosit ca referinta logica spre utilizatorul care a realizat actiunea, insa in modelul fizic poate fi pastrat fara constrangere stricta de cheie straina, pentru a conserva istoricul chiar daca utilizatorul este modificat sau sters ulterior.

## Proiectarea bazei de date la nivel fizic

La nivel fizic, proiectarea bazei de date descrie modul in care relatiile definite anterior sunt implementate in MySQL. Pentru fiecare tabela sunt prezentate principalele coloane, tipurile de date, dimensiunile si restrictiile relevante. Tipurile de date sunt formulate in concordanta cu modelul Java Spring Boot si cu maparea realizata prin JPA/Hibernate.

### Tabela farms

Tabela `farms` retine informatiile generale despre fermele inregistrate in aplicatie.

| Coloana | Tip de date | Dimensiune | Restrictii |
|---|---:|---:|---|
| id | BIGINT | N/A | Primary key, auto increment |
| name | VARCHAR | 255 | NOT NULL, UNIQUE |
| address | VARCHAR | 255 | - |
| contact_email | VARCHAR | 255 | - |
| vision_and_goals | TEXT | N/A | - |
| created_by_user_id | BIGINT | N/A | Foreign key catre users(id), UNIQUE |

### Tabela users

Tabela `users` retine conturile utilizatorilor si rolurile asociate acestora.

| Coloana | Tip de date | Dimensiune | Restrictii |
|---|---:|---:|---|
| id | BIGINT | N/A | Primary key, auto increment |
| username | VARCHAR | 255 | NOT NULL, UNIQUE |
| password | VARCHAR | 255 | NOT NULL |
| email | VARCHAR | 255 | - |
| role | ENUM/VARCHAR | 50 | NOT NULL |
| hourly_rate | DOUBLE | N/A | - |
| monthly_salary | DOUBLE | N/A | - |
| farm_id | BIGINT | N/A | Foreign key catre farms(id), poate fi NULL pentru SUPER_ADMIN |

Valorile posibile pentru rol sunt: `SUPER_ADMIN`, `FARM_MANAGER`, `AGRONOMIST`, `WORKER`.

### Tabela parcels

Tabela `parcels` retine parcelele agricole apartinand unei ferme.

| Coloana | Tip de date | Dimensiune | Restrictii |
|---|---:|---:|---|
| id | BIGINT | N/A | Primary key, auto increment |
| name | VARCHAR | 255 | NOT NULL |
| crop_type | VARCHAR | 255 | - |
| area_hectares | DOUBLE | N/A | - |
| coordinates_json | TEXT | N/A | - |
| farm_id | BIGINT | N/A | Foreign key catre farms(id), NOT NULL |

### Tabela activities

Tabela `activities` retine lucrarile agricole planificate sau executate pe parcele.

| Coloana | Tip de date | Dimensiune | Restrictii |
|---|---:|---:|---|
| id | BIGINT | N/A | Primary key, auto increment |
| title | VARCHAR | 255 | - |
| type | ENUM/VARCHAR | 50 | - |
| harvested_yield_kg | DOUBLE | N/A | - |
| start_date | DATETIME | N/A | - |
| status | ENUM/VARCHAR | 50 | - |
| end_date | DATETIME | N/A | - |
| comments | VARCHAR | 1000 | - |
| inventory_deducted | BOOLEAN | N/A | Valoare implicita false |
| parcel_id | BIGINT | N/A | Foreign key catre parcels(id) |

Valorile posibile pentru tipul activitatii sunt: `ARAT`, `SEMANAT`, `RECOLTAT`, `IRIGAT`, `TRATAMENT`, `ALTELE`. Valorile posibile pentru status sunt: `PENDING`, `IN_PROGRESS`, `COMPLETED`.

### Tabela activity_workers

Tabela `activity_workers` reprezinta asocierea dintre activitati si muncitorii alocati.

| Coloana | Tip de date | Dimensiune | Restrictii |
|---|---:|---:|---|
| activity_id | BIGINT | N/A | Primary key compusa, Foreign key catre activities(id) |
| user_id | BIGINT | N/A | Primary key compusa, Foreign key catre users(id) |

### Tabela activity_machinery

Tabela `activity_machinery` reprezinta asocierea dintre activitati si utilajele folosite.

| Coloana | Tip de date | Dimensiune | Restrictii |
|---|---:|---:|---|
| activity_id | BIGINT | N/A | Primary key compusa, Foreign key catre activities(id) |
| machinery_id | BIGINT | N/A | Primary key compusa, Foreign key catre machinery(id) |

### Tabela activity_consumptions

Tabela `activity_consumptions` retine consumurile reale de materiale pentru fiecare activitate agricola.

| Coloana | Tip de date | Dimensiune | Restrictii |
|---|---:|---:|---|
| id | BIGINT | N/A | Primary key, auto increment |
| activity_id | BIGINT | N/A | Foreign key catre activities(id), NOT NULL |
| inventory_item_id | BIGINT | N/A | Foreign key catre inventory_items(id), NOT NULL |
| quantity_used | DOUBLE | N/A | NOT NULL |
| unit_price_at_consumption | DOUBLE | N/A | - |

### Tabela inventory_items

Tabela `inventory_items` retine produsele si materialele disponibile in magazia fermei.

| Coloana | Tip de date | Dimensiune | Restrictii |
|---|---:|---:|---|
| id | BIGINT | N/A | Primary key, auto increment |
| name | VARCHAR | 255 | NOT NULL |
| category | ENUM/VARCHAR | 50 | NOT NULL |
| unit_of_measure | VARCHAR | 255 | NOT NULL |
| quantity_available | DOUBLE | N/A | NOT NULL |
| minimum_stock_threshold | DOUBLE | N/A | - |
| unit_price | DOUBLE | N/A | - |
| farm_id | BIGINT | N/A | Foreign key catre farms(id), NOT NULL |

Valorile posibile pentru categorie sunt: `SEED`, `FERTILIZER`, `HERBICIDE`, `FUNGICIDE`, `INSECTICIDE`, `PESTICIDE`, `FUEL`, `SPARE_PARTS`, `OTHER`.

### Tabela inventory_requests

Tabela `inventory_requests` retine cererile de aprovizionare create de utilizatori.

| Coloana | Tip de date | Dimensiune | Restrictii |
|---|---:|---:|---|
| id | BIGINT | N/A | Primary key, auto increment |
| item_name | VARCHAR | 255 | NOT NULL |
| item_category | ENUM/VARCHAR | 50 | - |
| quantity_requested | DOUBLE | N/A | - |
| unit_of_measure | VARCHAR | 255 | - |
| priority | ENUM/VARCHAR | 50 | - |
| status | ENUM/VARCHAR | 50 | - |
| date_created | DATETIME | N/A | - |
| requester_id | BIGINT | N/A | Foreign key catre users(id), NOT NULL |
| farm_id | BIGINT | N/A | Foreign key catre farms(id), NOT NULL |

Valorile posibile pentru prioritate sunt: `LOW`, `MEDIUM`, `HIGH`. Valorile posibile pentru status sunt: `PENDING`, `APPROVED`, `REJECTED`.

### Tabela machinery

Tabela `machinery` retine utilajele unei ferme si informatiile de stare ale acestora.

| Coloana | Tip de date | Dimensiune | Restrictii |
|---|---:|---:|---|
| id | BIGINT | N/A | Primary key, auto increment |
| name | VARCHAR | 255 | NOT NULL |
| model | VARCHAR | 255 | - |
| license_plate | VARCHAR | 255 | - |
| type | ENUM/VARCHAR | 50 | NOT NULL |
| status | ENUM/VARCHAR | 50 | NOT NULL |
| total_hours | INT | N/A | - |
| maintenance_interval_hours | INT | N/A | - |
| next_maintenance_hours | INT | N/A | - |
| last_maintenance_date | DATE | N/A | - |
| purchase_date | DATE | N/A | - |
| farm_id | BIGINT | N/A | Foreign key catre farms(id), NOT NULL |

Valorile posibile pentru tip sunt: `TRACTOR`, `COMBINA`, `SEMANATOARE`, `PLUG`, `DISC`, `PULVERIZATOR`, `ALTELE`. Valorile posibile pentru status sunt: `DISPONIBIL`, `IN_CURSA`, `IN_SERVICE`.

### Tabela maintenance_logs

Tabela `maintenance_logs` retine interventiile de mentenanta efectuate asupra utilajelor.

| Coloana | Tip de date | Dimensiune | Restrictii |
|---|---:|---:|---|
| id | BIGINT | N/A | Primary key, auto increment |
| date | DATE | N/A | - |
| description | VARCHAR | 255 | NOT NULL |
| cost | DOUBLE | N/A | - |
| hours_at_maintenance | INT | N/A | - |
| machinery_id | BIGINT | N/A | Foreign key catre machinery(id), NOT NULL |

### Tabela crop_seasons

Tabela `crop_seasons` retine istoricul culturilor si rezultatele obtinute pe parcele.

| Coloana | Tip de date | Dimensiune | Restrictii |
|---|---:|---:|---|
| id | BIGINT | N/A | Primary key, auto increment |
| harvest_year | INT | N/A | NOT NULL |
| crop_type | VARCHAR | 255 | NOT NULL |
| total_yield_kg | DOUBLE | N/A | - |
| sale_price_per_kg | DOUBLE | N/A | - |
| revenue_override | DOUBLE | N/A | - |
| parcel_id | BIGINT | N/A | Foreign key catre parcels(id), NOT NULL |

### Tabela parcel_subsidies

Tabela `parcel_subsidies` retine informatii despre subventiile asociate parcelelor.

| Coloana | Tip de date | Dimensiune | Restrictii |
|---|---:|---:|---|
| id | BIGINT | N/A | Primary key, auto increment |
| parcel_id | BIGINT | N/A | Foreign key catre parcels(id), NOT NULL |
| year | INT | N/A | NOT NULL |
| subsidy_type | VARCHAR | 255 | NOT NULL |
| amount_per_hectare | DOUBLE | N/A | - |
| total_amount | DOUBLE | N/A | NOT NULL |
| status | ENUM/VARCHAR | 50 | NOT NULL |
| notes | VARCHAR | 1000 | - |

Valorile posibile pentru status sunt: `ESTIMATED`, `APPROVED`, `PAID`.

### Tabela parcel_ndvi_history

Tabela `parcel_ndvi_history` retine valorile NDVI istorice asociate unei parcele si unei perioade.

| Coloana | Tip de date | Dimensiune | Restrictii |
|---|---:|---:|---|
| id | BIGINT | N/A | Primary key, auto increment |
| parcel_id | BIGINT | N/A | Referinta catre parcels(id), NOT NULL |
| period_key | VARCHAR | 255 | NOT NULL |
| ndvi_value | DOUBLE | N/A | NOT NULL |
| is_mock_data | BOOLEAN | N/A | NOT NULL |

Perechea `(parcel_id, period_key)` este unica, astfel incat pentru aceeasi parcela si aceeasi perioada sa nu fie salvate valori duplicate.

### Tabela farm_notes

Tabela `farm_notes` retine note interne asociate unei ferme.

| Coloana | Tip de date | Dimensiune | Restrictii |
|---|---:|---:|---|
| id | BIGINT | N/A | Primary key, auto increment |
| title | VARCHAR | 255 | NOT NULL |
| content | TEXT | N/A | NOT NULL |
| date_created | DATETIME | N/A | - |
| farm_id | BIGINT | N/A | Foreign key catre farms(id), NOT NULL |

### Tabela notifications

Tabela `notifications` retine notificarile trimise utilizatorilor.

| Coloana | Tip de date | Dimensiune | Restrictii |
|---|---:|---:|---|
| id | BIGINT | N/A | Primary key, auto increment |
| message | VARCHAR | 255 | NOT NULL |
| type | VARCHAR | 255 | - |
| is_read | BOOLEAN | N/A | Valoare implicita false |
| date_created | DATETIME | N/A | - |
| user_id | BIGINT | N/A | Foreign key catre users(id), NOT NULL |

### Tabela audit_logs

Tabela `audit_logs` retine istoricul actiunilor importante realizate in aplicatie.

| Coloana | Tip de date | Dimensiune | Restrictii |
|---|---:|---:|---|
| id | BIGINT | N/A | Primary key, auto increment |
| actor_id | BIGINT | N/A | Referinta logica spre utilizator |
| actor_username | VARCHAR | 255 | - |
| action | VARCHAR | 255 | - |
| target_type | VARCHAR | 255 | - |
| target_id | BIGINT | N/A | - |
| target_name | VARCHAR | 255 | - |
| details | VARCHAR | 1000 | - |
| created_at | DATETIME | N/A | - |

