# Capitolul 3. Proiectarea sistemului

Capitolul de față prezintă proiectarea aplicației AgroManager, pornind de la cerințele formulate anterior. Proiectarea sistemului urmărește să descrie modul în care aplicația este organizată din punct de vedere arhitectural, funcțional, comportamental, al bazei de date și al interfeței utilizator. Această etapă este importantă deoarece face legătura dintre cerințele aplicației și implementarea propriu-zisă.

AgroManager este proiectată ca aplicație web de tip client-server. Utilizatorii accesează sistemul printr-un browser, interfața fiind dezvoltată în React. Partea de backend este realizată în Java, utilizând Spring Boot, iar datele sunt persistate într-o bază de date MySQL. Aplicația comunică și cu servicii externe pentru date meteorologice și pentru obținerea indicatorilor NDVI. Prin această organizare, sistemul separă interfața utilizator de logica de business și de nivelul de persistență.

## 3.1. Arhitectura generală a sistemului

Arhitectura generală a aplicației este organizată pe mai multe niveluri. Primul nivel este reprezentat de browserul utilizatorului, prin care sunt accesate paginile aplicației. Al doilea nivel este frontend-ul React, responsabil de afișarea interfeței, de protejarea rutelor pe roluri și de trimiterea cererilor către server. Al treilea nivel este backend-ul Spring Boot, care expune API-uri REST, validează cererile, aplică regulile de securitate și execută logica de business. Ultimul nivel este reprezentat de baza de date MySQL, în care sunt stocate informațiile despre utilizatori, ferme, parcele, activități, stocuri, utilaje, mentenanță și rapoarte.

Pe lângă aceste componente interne, sistemul comunică și cu servicii externe. Modulul meteo utilizează date furnizate de Open-Meteo, iar modulul NDVI utilizează Sentinel Hub pentru obținerea indicatorilor satelitari. În cazul în care datele externe nu pot fi obținute, sistemul păstrează informațiile disponibile anterior sau utilizează valori de rezervă, pentru ca interfața să rămână funcțională.

**Aici se inserează Figura 3.1. Arhitectura generală a aplicației AgroManager.**  
Diagramă realizată de Codex: `docs/licenta/diagrame/figura_3_1_arhitectura_generala.mmd`.

Arhitectura aleasă permite separarea responsabilităților. Frontend-ul este responsabil pentru experiența utilizatorului, backend-ul pentru reguli și securitate, iar baza de date pentru persistența informațiilor. Această separare facilitează întreținerea aplicației și permite extinderea ulterioară cu module noi, precum analiză financiară avansată, chat intern sau integrarea unor servicii suplimentare.

## 3.2. Diagrama de componente

Diagrama de componente evidențiază modulele principale ale aplicației și relațiile dintre acestea. Frontend-ul conține componente pentru autentificare, dashboard-uri, hartă, magazie, utilaje, angajați, rapoarte și taskuri. Backend-ul conține controllere REST, servicii de business, repository-uri și entități JPA. Baza de date MySQL stochează datele aplicației, iar serviciile externe oferă informații suplimentare pentru vreme și NDVI.

**Aici se inserează Figura 3.2. Diagrama de componente a aplicației AgroManager.**  
Diagramă realizată de Codex: `docs/licenta/diagrame/figura_3_2_diagrama_componente.mmd`.

Componenta de autentificare gestionează înregistrarea, autentificarea și sesiunea utilizatorului. Componenta pentru ferme și angajați gestionează profilul fermei și utilizatorii asociați acesteia. Componenta de parcele și hartă permite delimitarea terenurilor și vizualizarea acestora. Componenta de activități gestionează planificarea lucrărilor agricole, atribuirea muncitorilor, asocierea utilajelor și raportarea execuției. Componenta de magazie gestionează stocurile și consumurile, iar componenta de cereri de aprovizionare realizează legătura dintre agronom și manager. Componenta de utilaje și mentenanță păstrează evidența echipamentelor și a intervențiilor tehnice. Componenta de notificări informează utilizatorii despre evenimente relevante.

## 3.3. Diagrama de pachete

Backend-ul aplicației este organizat în pachete cu responsabilități distincte. Pachetul `controller` conține clasele care expun endpoint-uri REST. Pachetul `service` conține logica de business. Pachetul `repository` conține interfețele prin care se realizează accesul la baza de date. Pachetul `model` conține entitățile JPA și enumerațiile aplicației. Pachetul `model.dto` conține obiectele utilizate pentru transferul datelor între client și server. Pachetul `config` conține configurările aplicației, inclusiv securitatea.

Frontend-ul este organizat în componente React, într-un fișier principal de rutare și într-un modul de configurare a clientului HTTP. Componenta `App.jsx` definește rutele și protecția acestora pe roluri, iar componentele din folderul `components` implementează paginile aplicației.

**Aici se inserează Figura 3.3. Diagrama de pachete a aplicației AgroManager.**  
Diagramă realizată de Codex: `docs/licenta/diagrame/figura_3_3_diagrama_pachete.mmd`.

Această structură sprijină principiul separării responsabilităților. Controller-ele nu conțin logica principală a aplicației, ci direcționează cererile către servicii. Serviciile aplică regulile de business și folosesc repository-urile pentru accesul la date. Entitățile definesc structura datelor persistate, iar DTO-urile controlează forma datelor primite sau trimise prin API.

## 3.4. Diagrame ale cazurilor de utilizare

Diagrama cazurilor de utilizare descrie interacțiunile principale dintre utilizatori și sistem. Actorii aplicației sunt managerul fermei, agronomul, muncitorul și administratorul platformei. Fiecare actor are acces la un set de funcționalități corespunzător rolului său.

Managerul gestionează ferma, angajații, magazia, utilajele, mentenanța, cererile de aprovizionare și rapoartele. Agronomul planifică activitățile agricole, consultă harta, urmărește istoricul culturilor, verifică stocurile în regim de consultare și creează cereri de aprovizionare. Muncitorul consultă taskurile proprii, începe și finalizează lucrări, raportează orele, consumurile reale, comentariile și recolta. Administratorul platformei gestionează aplicația la nivel global.

**Aici se inserează Figura 3.4. Diagrama cazurilor de utilizare pentru AgroManager.**  
Diagramă realizată de Codex: `docs/licenta/diagrame/figura_3_4_cazuri_utilizare.mmd`.

Această diagramă este importantă deoarece oferă o imagine de ansamblu asupra funcționalităților sistemului și asupra separării responsabilităților. Ea poate fi utilizată ca punct de legătură între cerințele formulate în Capitolul 2 și proiectarea detaliată a modulelor.

## 3.5. Diagrama de clase

Diagrama de clase prezintă structura principalelor entități din aplicație și relațiile dintre acestea. Entitățile centrale sunt `Farm`, `User`, `Parcel`, `Activity`, `ActivityConsumption`, `InventoryItem`, `InventoryRequest`, `Machinery`, `MaintenanceLog`, `CropSeason`, `Notification` și `ParcelNdviHistory`.

O fermă are mai mulți utilizatori, mai multe parcele, mai multe produse în magazie și mai multe utilaje. O parcelă aparține unei ferme și poate avea mai multe activități, sezoane de cultură și înregistrări NDVI. O activitate aparține unei parcele, poate avea muncitori atribuiți, poate utiliza utilaje și poate avea consumuri asociate. Un consum de activitate este legat de un produs din magazie. Un utilaj aparține unei ferme și poate avea mai multe intervenții de mentenanță. Un utilizator poate primi notificări și poate crea cereri de aprovizionare.

**Aici se inserează Figura 3.5. Diagrama de clase pentru entitățile principale.**  
Diagramă realizată de Codex: `docs/licenta/diagrame/figura_3_5_diagrama_clase.mmd`.

Diagrama de clase ajută la înțelegerea modelului de domeniu al aplicației. Aceasta arată că AgroManager nu este doar o aplicație de task-uri, ci un sistem integrat în care lucrările agricole, stocurile, utilajele, personalul și producția sunt conectate între ele.

## 3.6. Diagrame de secvență pentru fluxurile principale

Diagramele de secvență descriu modul în care componentele sistemului colaborează în timpul executării unor fluxuri importante. Pentru AgroManager sunt relevante fluxurile de autentificare, creare activitate, finalizare activitate, aprobare cerere de aprovizionare și consultare NDVI.

Primul flux important este crearea unei activități agricole. Agronomul selectează parcela, muncitorii, utilajele și consumurile estimate, apoi trimite formularul către backend. Controller-ul primește cererea, serviciul validează faptul că parcela, utilajele, muncitorii și produsele aparțin fermei curente, apoi salvează activitatea în baza de date.

**Aici se inserează Figura 3.6. Diagrama de secvență pentru crearea unei activități agricole.**  
Diagramă realizată de Codex: `docs/licenta/diagrame/figura_3_6_secventa_creare_activitate.mmd`.

Al doilea flux important este finalizarea unei activități de către muncitor. Muncitorul actualizează statusul activității, raportează intervalul de lucru, comentariile, cantitatea recoltată și consumurile reale. Backend-ul verifică dacă muncitorul este atribuit activității, actualizează statusul, scade consumurile din magazie, actualizează orele utilajelor, sincronizează producția în istoricul culturii și generează notificări pentru manager și agronom.

**Aici se inserează Figura 3.7. Diagrama de secvență pentru finalizarea unei activități agricole.**  
Diagramă realizată de Codex: `docs/licenta/diagrame/figura_3_7_secventa_finalizare_activitate.mmd`.

Fluxul de aprovizionare este important deoarece leagă activitatea agronomului de decizia managerului. Agronomul creează o cerere pentru un produs necesar, sistemul notifică managerul, iar managerul aprobă sau respinge cererea. Dacă cererea este aprobată, sistemul actualizează automat magazia și notifică solicitantul.

**Aici se inserează Figura 3.8. Diagrama de activitate pentru fluxul unei cereri de aprovizionare.**  
Diagramă realizată de Codex: `docs/licenta/diagrame/figura_3_8_flux_cerere_aprovizionare.mmd`.

## 3.7. Diagrama de stări

Diagrama de stări descrie evoluția unor entități importante din sistem. Pentru AgroManager, cele mai relevante stări sunt cele ale unei activități agricole și cele ale unei cereri de aprovizionare.

O activitate pornește din starea `PENDING`, atunci când este planificată de agronom. În momentul în care muncitorul începe lucrarea, activitatea trece în starea `IN_PROGRESS`. După raportarea finalizării, activitatea trece în starea `COMPLETED`. În această etapă sunt actualizate consumurile, producția, utilajele și notificările.

O cerere de aprovizionare pornește din starea `PENDING`, după ce este creată de agronom. Managerul poate aproba cererea, caz în care aceasta trece în starea `APPROVED`, sau o poate respinge, caz în care trece în starea `REJECTED`. Dacă cererea este aprobată, stocul este actualizat automat.

**Aici se inserează Figura 3.9. Diagrama de stări pentru activități și cereri de aprovizionare.**  
Diagramă realizată de Codex: `docs/licenta/diagrame/figura_3_9_diagrama_stari.mmd`.

## 3.8. Proiectarea bazei de date la nivel conceptual

Proiectarea conceptuală a bazei de date are rolul de a identifica entitățile principale ale sistemului și relațiile dintre acestea, fără a intra în detaliile tehnice ale implementării. La acest nivel, baza de date este descrisă printr-o diagramă Entitate-Relație.

Entitatea `Farm` reprezintă ferma administrată în aplicație. Aceasta este legată de utilizatori, parcele, utilaje, produse din magazie și cereri de aprovizionare. Entitatea `User` reprezintă utilizatorii aplicației și include rolurile de manager, agronom, muncitor și administrator. Entitatea `Parcel` reprezintă terenurile agricole ale fermei. Entitatea `Activity` reprezintă lucrările agricole planificate și executate pe parcele. Entitatea `InventoryItem` reprezintă produsele din magazie, iar `ActivityConsumption` face legătura dintre o activitate și produsele consumate.

Entitatea `InventoryRequest` descrie cererile de aprovizionare, inițiate de agronom și aprobate sau respinse de manager. Entitatea `Machinery` reprezintă utilajele fermei, iar `MaintenanceLog` păstrează intervențiile de mentenanță. Entitatea `CropSeason` păstrează istoricul culturilor și al producției pe parcelă. Entitatea `Notification` stochează mesajele transmise utilizatorilor, iar `ParcelNdviHistory` păstrează valorile NDVI pentru parcele și perioade de timp.

**Aici se inserează Figura 3.10. Diagrama Entitate-Relație la nivel conceptual.**  
Diagramă realizată de Codex: `docs/licenta/diagrame/figura_3_10_erd_conceptual.mmd`.

Relațiile principale sunt următoarele: o fermă are mai mulți utilizatori, mai multe parcele, mai multe produse în magazie și mai multe utilaje; o parcelă are mai multe activități și mai multe sezoane de cultură; o activitate poate avea mai mulți muncitori și mai multe utilaje; o activitate consumă unul sau mai multe produse din magazie; un utilaj are mai multe înregistrări de mentenanță; un utilizator poate primi mai multe notificări și poate crea mai multe cereri de aprovizionare.

## 3.9. Proiectarea bazei de date la nivel logic

Proiectarea logică transformă modelul conceptual într-o schemă relațională. În această etapă sunt definite tabelele, cheile primare, cheile externe și tabelele de legătură pentru relațiile de tip many-to-many.

Schema relațională principală a aplicației este următoarea:

`farms(id, name, address, contact_email, vision_and_goals, created_by_user_id)`

`users(id, username, password, email, role, farm_id)`

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

`notifications(id, message, type, is_read, date_created, user_id)`

`parcel_ndvi_history(id, parcel_id, period_key, ndvi_value, is_mock_data)`

**Aici se inserează Figura 3.11. Schema logică a bazei de date relaționale.**  
Diagramă realizată de Codex: `docs/licenta/diagrame/figura_3_11_schema_logica_bd.mmd`.

Tabelele `activity_workers` și `activity_machinery` sunt tabele de legătură. Prima leagă activitățile de muncitorii atribuiți, iar a doua leagă activitățile de utilajele folosite. Aceste tabele sunt necesare deoarece o activitate poate avea mai mulți muncitori și mai multe utilaje, iar același muncitor sau același utilaj poate participa la mai multe activități.

## 3.10. Proiectarea bazei de date la nivel fizic

Proiectarea fizică descrie modul concret în care datele sunt stocate în baza de date. În aplicația AgroManager, entitățile sunt mapate în tabele relaționale prin JPA/Hibernate, iar baza de date utilizată este MySQL. Fiecare tabel are o cheie primară de tip numeric, generată automat, iar relațiile dintre tabele sunt reprezentate prin chei externe.

Tabela `farms` stochează datele generale ale fermei. Aceasta conține identificatorul fermei, numele, adresa, adresa de contact, obiectivele și utilizatorul care a creat ferma. Câmpul `id` este cheia primară, iar `created_by_user_id` face legătura cu utilizatorul manager care a creat ferma.

Tabela `users` stochează conturile utilizatorilor. Aceasta conține numele de utilizator, parola criptată, emailul, rolul și ferma asociată. Câmpul `role` este memorat ca valoare enumerată, cu valori precum `FARM_MANAGER`, `AGRONOMIST`, `WORKER` și `SUPER_ADMIN`. Câmpul `farm_id` este cheie externă către `farms` și poate lipsi pentru administratorul global al platformei.

Tabela `parcels` stochează parcelele agricole. Aceasta conține numele parcelei, cultura, suprafața în hectare, coordonatele în format JSON și ferma de care aparține parcela. Câmpul `coordinates_json` permite păstrarea delimitării geografice a parcelei, iar `farm_id` asigură asocierea cu ferma curentă.

Tabela `activities` stochează lucrările agricole. Aceasta conține titlul activității, tipul lucrării, statusul, data de început, data de finalizare, comentariile, cantitatea recoltată și informația privind scăderea stocului. Câmpul `parcel_id` leagă activitatea de parcela pe care se desfășoară.

Tabelele `activity_workers` și `activity_machinery` stochează relațiile many-to-many dintre activități și muncitori, respectiv dintre activități și utilaje. Acestea conțin perechi de chei externe și permit atribuirea mai multor resurse unei singure lucrări.

Tabela `activity_consumptions` stochează consumurile asociate activităților. Fiecare înregistrare leagă o activitate de un produs din magazie și păstrează cantitatea utilizată, precum și prețul unitar la momentul consumului. Această structură permite analiza ulterioară a consumurilor reale.

Tabela `inventory_items` stochează produsele din magazie. Aceasta conține numele produsului, categoria, unitatea de măsură, cantitatea disponibilă, pragul minim de stoc, prețul unitar și ferma asociată. Pragul minim este folosit pentru generarea alertelor de stoc redus.

Tabela `inventory_requests` stochează cererile de aprovizionare. Aceasta conține produsul solicitat, categoria, cantitatea, unitatea de măsură, prioritatea, statusul, data creării, utilizatorul solicitant și ferma. Statusul cererii poate fi `PENDING`, `APPROVED` sau `REJECTED`.

Tabela `machinery` stochează utilajele fermei. Aceasta conține numele, modelul, numărul de înmatriculare, tipul, statusul, orele totale de funcționare, intervalul de mentenanță, următoarele ore de mentenanță, data ultimei mentenanțe, data achiziției și ferma asociată.

Tabela `maintenance_logs` stochează intervențiile de mentenanță. Fiecare înregistrare conține data intervenției, descrierea, costul, orele utilajului la momentul mentenanței și utilajul asociat.

Tabela `crop_seasons` stochează istoricul culturilor. Aceasta conține anul recoltei, tipul culturii, cantitatea totală recoltată, prețul de vânzare, venitul suprascris manual și parcela asociată. Această tabelă permite realizarea rapoartelor de producție.

Tabela `notifications` stochează notificările utilizatorilor. Aceasta conține mesajul, tipul notificării, starea citit/necitit, data creării și utilizatorul destinatar.

Tabela `parcel_ndvi_history` stochează valorile NDVI pentru parcele. Aceasta conține identificatorul parcelei, perioada, valoarea NDVI și informația dacă datele sunt reale sau estimate. Pentru combinația dintre parcelă și perioadă se aplică o constrângere de unicitate, astfel încât să nu existe duplicate pentru aceeași lună.

Prin această proiectare fizică, baza de date susține funcționalitățile aplicației și păstrează relațiile importante dintre componentele fermei. Cheile externe asigură legătura dintre tabele, iar constrângerile de validare din aplicație contribuie la păstrarea integrității datelor.

## 3.11. Proiectarea interfeței utilizator

Interfața aplicației este proiectată în funcție de rolul utilizatorului autentificat. Această abordare reduce complexitatea și permite fiecărui utilizator să vadă doar funcționalitățile de care are nevoie. Managerul are acces la module administrative și de analiză, agronomul la module tehnice și de planificare, muncitorul la taskurile proprii, iar administratorul platformei la funcții globale.

Principiile de UI/UX utilizate sunt claritatea, consistența, separarea pe roluri, accesul rapid la operațiile frecvente și reducerea pașilor inutili. Interfața folosește dashboard-uri diferite pentru roluri, meniuri clare, formulare structurate și feedback vizual prin statusuri, notificări și mesaje de eroare. Harta interactivă reprezintă o componentă centrală pentru agronom și manager, deoarece permite vizualizarea terenurilor în context geografic.

Pentru manager, interfața evidențiază modulele de administrare: profil fermă, angajați, magazie, utilaje, mentenanță, cereri și rapoarte. Pentru agronom, interfața evidențiază harta, parcelele, activitățile agricole, istoricul culturilor, vremea, NDVI și cererile de aprovizionare. Pentru muncitor, interfața este simplificată, fiind orientată spre lista de taskuri, începerea și finalizarea lucrărilor și raportarea datelor din teren.

**Aici se inserează Figura 3.12. Wireframe pentru pagina de autentificare.**  
Diagramă de realizat de tine, pe baza interfeței aplicației sau ca wireframe simplu în Word/Figma/Canva.

**Aici se inserează Figura 3.13. Wireframe pentru dashboard-ul managerului.**  
Diagramă de realizat de tine. Trebuie să evidențieze cardurile/zonele principale: profil fermă, angajați, magazie, utilaje, rapoarte și notificări.

**Aici se inserează Figura 3.14. Wireframe pentru pagina de hartă și planificare agronomică.**  
Diagramă de realizat de tine. Trebuie să evidențieze harta, panoul parcelei selectate, istoricul activităților, NDVI, vremea și formularul de creare activitate.

**Aici se inserează Figura 3.15. Wireframe pentru interfața muncitorului.**  
Diagramă de realizat de tine. Trebuie să evidențieze lista taskurilor, detaliile lucrării și formularul de finalizare.

Wireframe-urile pot fi simple, deoarece scopul lor este să arate organizarea interfeței, nu designul final la nivel de detaliu. În documentul Word, acestea se inserează ca figuri, cu caption și referire în text.

## 3.12. Proiectarea infrastructurii

Din punct de vedere al infrastructurii, AgroManager este proiectată pentru rulare ca aplicație web. Utilizatorii accesează aplicația din browser, frontend-ul React comunică prin HTTP cu backend-ul Spring Boot, iar backend-ul comunică la rândul său cu baza de date MySQL și cu serviciile externe.

În mediul de dezvoltare, frontend-ul și backend-ul pot rula local, pe porturi diferite, iar comunicarea dintre ele este permisă prin configurarea CORS. Baza de date MySQL rulează local sau pe un server dedicat, în funcție de mediul de instalare. Într-un mediu de producție, aplicația poate fi publicată pe un server sau într-un mediu cloud, iar baza de date poate fi găzduită separat pentru siguranță și scalabilitate.

**Aici se inserează Figura 3.16. Diagrama infrastructurii aplicației AgroManager.**  
Diagramă realizată de Codex: `docs/licenta/diagrame/figura_3_16_diagrama_infrastructura.mmd`.

Arhitectura hardware nu impune componente speciale, deoarece aplicația este una web. Este necesar un server pentru backend, un mediu de servire pentru frontend și un server de bază de date. Serviciile externe sunt accesate prin internet, iar utilizatorii au nevoie doar de un browser modern și de conexiune la rețea.

## 3.13. Concluzii privind proiectarea sistemului

Proiectarea aplicației AgroManager evidențiază o structură modulară, orientată spre separarea responsabilităților și spre organizarea clară a fluxurilor agricole. Arhitectura client-server permite separarea interfeței de logica de business și de baza de date. Diagramele UML prezintă componentele, pachetele, clasele și comportamentul principal al sistemului, iar proiectarea bazei de date descrie modul în care informațiile fermei sunt stocate și corelate.

Prin proiectarea bazei de date la nivel conceptual, logic și fizic, sistemul oferă o structură coerentă pentru stocarea datelor despre ferme, utilizatori, parcele, activități, stocuri, utilaje, mentenanță, producție și notificări. Proiectarea interfeței pe roluri asigură o experiență adaptată fiecărui tip de utilizator, iar infrastructura propusă permite rularea aplicației ca sistem web extensibil.

Capitolul următor va prezenta implementarea sistemului, tehnologiile utilizate și modul în care componentele proiectate au fost transpuse în aplicația practică.
