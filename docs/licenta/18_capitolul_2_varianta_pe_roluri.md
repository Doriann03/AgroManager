# Capitolul 2. Specificarea cerințelor

Acest capitol prezintă cerințele aplicației AgroManager, cu accent pe operațiile disponibile pentru fiecare rol. Formularea urmează structura cerută pentru lucrare: ce permite aplicația la nivel general și ce funcționalități sunt disponibile pentru fiecare tip de utilizator.

AgroManager este o aplicație web pentru gestionarea activităților unei ferme agricole. Sistemul centralizează date despre fermă, utilizatori, parcele, lucrări agricole, magazie, utilaje, mentenanță, cereri de aprovizionare, notificări, producție, payroll, subvenții, vreme și NDVI. Accesul este diferențiat prin rolurile `FARM_MANAGER`, `AGRONOMIST`, `WORKER` și `SUPER_ADMIN`.

## 2.1. Cerințe funcționale generale

Aplicația permite înregistrarea unei ferme împreună cu primul cont de manager. În acest flux sunt introduse datele contului și informațiile de bază ale fermei. După autentificare, utilizatorul este direcționat către interfața corespunzătoare rolului său.

Utilizatorii autentificați lucrează doar cu operațiile permise rolului primit. Managerul, agronomul și muncitorul sunt asociați unei ferme, iar datele operaționale sunt separate pe fermă. Administratorul platformei are o perspectivă globală, necesară pentru administrarea sistemului.

Datele introduse în aplicație pot fi create, consultate, modificate sau șterse în funcție de drepturile rolului. Principalele categorii de date sunt ferma, angajații, parcelele, activitățile, produsele din magazie, cererile de aprovizionare, utilajele, înregistrările de mentenanță, sezoanele de cultură, subvențiile și notificările.

Aplicația include căutare, filtrare și afișare structurată în modulele unde volumul de date poate crește, de exemplu la utilizatori, ferme, magazie, utilaje, activități sau rapoarte. Pentru datele agricole, harta interactivă completează afișarea tabelară și permite înțelegerea rapidă a poziționării parcelelor.

Pentru raportare, aplicația folosește datele introduse în fluxurile operative. Producția, consumurile de materiale, costurile cu munca, salariile agronomilor, costurile de mentenanță, subvențiile și veniturile din recoltă sunt reunite în rapoarte care ajută managerul să analizeze rezultatele fermei.

## 2.2. Cerințe pentru rolul FARM_MANAGER

Rolul `FARM_MANAGER` este destinat utilizatorului care administrează ferma. Acesta are nevoie de control asupra resurselor, angajaților, stocurilor, utilajelor și rezultatelor economice.

Pentru acest rol, aplicația permite consultarea unui dashboard managerial. Din acest punct, utilizatorul ajunge rapid la modulele de profil fermă, angajați, hartă, magazie, utilaje, cereri de aprovizionare, rapoarte și notificări.

Datele fermei pot fi vizualizate și actualizate. Managerul poate completa informații precum adresa, emailul de contact, descrierea, viziunea și obiectivele fermei. Suprafața totală administrată poate fi urmărită pe baza parcelelor introduse în sistem.

Administrarea angajaților este o funcție centrală pentru manager. Aplicația permite adăugarea utilizatorilor operaționali, atribuirea rolurilor de agronom sau muncitor și completarea informațiilor necesare pentru salarizare. Pentru muncitori se poate folosi tarif orar, iar pentru agronomi salariu lunar.

Managerul poate consulta parcelele fermei și le poate vizualiza pe hartă. Pentru fiecare parcelă sunt disponibile informații despre cultură, suprafață și localizare. În funcție de fluxul operațional, managerul poate introduce parcele noi și poate urmări istoricul activităților asociate.

Magazia este administrată de manager. Acesta poate adăuga produse, modifica datele existente, șterge produse care nu mai sunt relevante, stabili praguri minime și urmări stocurile reduse. Produsele sunt folosite ulterior în planificarea și raportarea consumurilor de la activități.

Cererile de aprovizionare ajung la manager pentru decizie. Acesta poate consulta cererea, produsul solicitat, cantitatea și prioritatea, apoi o poate aproba sau respinge. În cazul aprobării, stocul poate fi actualizat în magazie.

Utilajele și mentenanța sunt gestionate tot de manager. Aplicația permite introducerea utilajelor, actualizarea statusului, urmărirea orelor de funcționare și înregistrarea intervențiilor de service. Acest modul ajută la evitarea planificării unor lucrări cu utilaje indisponibile.

Managerul primește notificări pentru evenimente relevante, cum ar fi cereri noi, stocuri minime sau lucrări finalizate. În zona de raportare poate analiza producția, consumurile, costurile, veniturile, subvențiile, profitul și indicatorii pe hectar. Tot aici poate consulta payroll-ul fermei pentru o lună aleasă.

## 2.3. Cerințe pentru rolul AGRONOMIST

Rolul `AGRONOMIST` este destinat utilizatorului care planifică și urmărește lucrările agricole. Interfața sa pune accent pe parcelă, hartă, activități, istoric și date de suport pentru decizii.

Pentru agronom, aplicația oferă acces la dashboard, hartă, parcele, activități, istoric culturi, date meteo, NDVI, magazie în regim de consultare, utilaje în regim de consultare și cereri de aprovizionare.

Agronomul poate lucra cu parcelele fermei. El consultă datele parcelelor, le vede pe hartă și poate folosi delimitările geografice pentru planificarea lucrărilor. Harta este importantă deoarece multe decizii agronomice depind de localizare și de distribuția terenurilor.

Planificarea activităților este funcționalitatea principală a acestui rol. Aplicația permite crearea unei lucrări agricole prin alegerea parcelei, tipului de activitate, perioadei, muncitorilor, utilajelor și materialelor estimate. După salvare, activitatea devine vizibilă pentru muncitorii alocați.

Pe durata sezonului, agronomul poate urmări starea activităților și istoricul lucrărilor. Finalizarea unei activități de către muncitor actualizează datele disponibile pentru agronom: intervalul real, comentariile, consumurile raportate și cantitatea recoltată, atunci când lucrarea este de tip recoltare.

Magazia este disponibilă pentru consultare. Agronomul verifică existența materialelor înainte de planificarea lucrărilor, dar nu modifică direct stocurile. Dacă observă lipsuri, poate crea o cerere de aprovizionare către manager și poate urmări statusul acesteia.

Datele meteo și NDVI susțin deciziile tehnice. Vremea ajută la alegerea momentului potrivit pentru lucrări, iar NDVI oferă o imagine orientativă asupra stării vegetației. Istoricul culturilor completează aceste informații prin date despre sezoanele anterioare.

## 2.4. Cerințe pentru rolul WORKER

Rolul `WORKER` este destinat utilizatorului care execută lucrările agricole. Interfața acestuia trebuie să fie simplă, concentrată pe taskuri și pe raportarea datelor reale din teren.

Muncitorul poate vedea activitățile la care este alocat. Pentru fiecare lucrare sunt afișate informații precum parcela, tipul activității, perioada planificată, utilajele și materialele asociate.

În momentul începerii unei lucrări, muncitorul poate schimba statusul activității în „în desfășurare”. Această acțiune marchează intrarea lucrării în etapa de execuție și permite urmărirea ei de către celelalte roluri.

La finalizarea lucrării, aplicația permite completarea datelor reale: data și ora de început, data și ora de final, comentarii din teren, consumurile efective ale materialelor planificate și cantitatea recoltată, dacă activitatea este de tip recoltare. Aceste date sunt importante deoarece influențează stocurile, istoricul culturilor, orele utilajelor și rapoartele.

Muncitorul poate consulta istoricul propriilor lucrări. În acest mod poate vedea ce activități a realizat și ce date au fost raportate pentru ele. De asemenea, are acces la propriul payroll, calculat pe baza lucrărilor finalizate, a orelor lucrate și a tarifului orar.

Acest rol nu are acces la operații administrative. Muncitorul nu modifică angajați, ferme, stocuri, parcele sau utilaje. Separarea este necesară pentru ca interfața să rămână simplă și pentru ca datele administrative să fie protejate.

## 2.5. Cerințe pentru rolul SUPER_ADMIN

Rolul `SUPER_ADMIN` este destinat administrării globale a platformei. Acesta nu trebuie confundat cu managerul unei ferme. Managerul lucrează în interiorul fermei sale, în timp ce administratorul platformei are vizibilitate asupra mai multor ferme și utilizatori.

Aplicația oferă administratorului un dashboard global. Acesta poate consulta statistici despre ferme, utilizatori, roluri, parcele și alte entități importante. Scopul dashboard-ului este monitorizarea platformei, nu planificarea lucrărilor agricole.

Administratorul poate gestiona fermele înregistrate. Operațiile includ consultarea listelor, modificarea datelor generale și ștergerea fermelor atunci când este necesar. Aceste acțiuni sunt realizate prin interfața aplicației și sunt supuse regulilor de validare.

Utilizatorii platformei pot fi consultați și administrați. Administratorul poate modifica datele de bază ale unui cont, rolul și asocierea cu ferma, acolo unde regulile aplicației permit acest lucru. Parolele nu sunt afișate în clar, iar operațiile asupra conturilor sunt controlate pentru a evita situații periculoase, cum ar fi ștergerea accidentală a propriului cont administrativ.

Pentru entitățile operaționale, aplicația permite consultare și intervenție controlată asupra datelor importante: parcele, activități, produse din magazie, cereri de aprovizionare, utilaje, mentenanță și sezoane de cultură. Administratorul nu lucrează direct în baza de date, ci folosește formulare și endpoint-uri care păstrează regulile aplicației.

Jurnalul de audit este disponibil pentru acest rol. Prin el se pot urmări acțiunile administrative importante, precum modificări sau ștergeri realizate la nivel global. Această funcționalitate susține trasabilitatea și ajută la verificarea intervențiilor făcute în platformă.

## 2.6. Concluzii privind specificarea cerințelor

Cerințele aplicației AgroManager sunt organizate în jurul rolurilor reale dintr-o fermă. Managerul administrează resursele și analizează rezultatele, agronomul planifică lucrările, muncitorul execută și raportează, iar administratorul platformei asigură controlul global.

Această separare reduce încărcarea fiecărei interfețe și limitează accesul la operațiile necesare. În același timp, datele introduse de fiecare rol sunt folosite în module comune: activități, stocuri, utilaje, istoric, rapoarte și notificări. Pe baza acestor cerințe se poate trece la proiectarea arhitecturii, a bazei de date și a fluxurilor principale ale sistemului.

## Observații pentru copierea în Word

Această variantă înlocuiește varianta lungă a capitolului 2. Se recomandă eliminarea vechilor subcapitole `2.6 Cerințe privind calitatea și funcționarea sistemului`, `2.7 Cerințe de securitate și protecție a datelor` și `2.8 Cerințe de raportare și analiză` din capitolul 2, deoarece ele sunt tratate mai potrivit în capitolele 5, 6 și 7.

Pentru documentul final, păstrează doar subcapitolele `2.1` - `2.6` din această variantă. Capitolul devine mai apropiat de exemplul profesorului și nu mai repetă excesiv formula „Sistemul permite...”.
