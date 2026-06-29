# Capitolul 1. Analiza problemei

## 1.1. Contextul digitalizării activităților agricole

Agricultura reprezintă un domeniu în care deciziile operaționale trebuie luate permanent în funcție de factori variabili: condiții meteorologice, starea solului, evoluția culturilor, disponibilitatea personalului, existența materialelor în magazie, starea utilajelor și termenele lucrărilor agricole. Într-o fermă administrată prin metode tradiționale, aceste informații sunt adesea împărțite între documente pe hârtie, fișiere separate, mesaje, apeluri telefonice și experiența individuală a persoanelor implicate. Această fragmentare îngreunează urmărirea activităților, reduce trasabilitatea deciziilor și poate genera pierderi prin întârzieri, consumuri necontrolate sau lipsa unei imagini de ansamblu asupra fermei.

Digitalizarea agriculturii urmărește transformarea acestor procese într-un sistem organizat, în care datele sunt colectate, stocate, analizate și utilizate pentru planificarea și controlul activităților. Organizația pentru Alimentație și Agricultură a Națiunilor Unite descrie e-Agriculture ca un cadru de utilizare a tehnologiilor informației și comunicațiilor pentru agricultură durabilă și dezvoltare rurală [1]. De asemenea, Comisia Europeană evidențiază faptul că tehnologiile digitale pot contribui la creșterea eficienței, sustenabilității și competitivității sectorului agricol prin utilizarea senzorilor, a analizelor de date, a sistemelor de sprijin decizional și a tehnologiilor IoT [2].

În acest context, o aplicație informatică pentru management agricol nu are doar rolul de a înlocui documentele fizice cu formulare digitale. Valoarea unui astfel de sistem apare atunci când informațiile despre terenuri, lucrări, consumuri, personal, utilaje și producție sunt corelate între ele. De exemplu, o lucrare agricolă planificată pe o parcelă trebuie să fie legată de cultura existentă, de muncitorii disponibili, de utilajele necesare, de materialele consumate și de rezultatul obținut. Astfel, datele operaționale pot deveni o bază pentru decizii mai bune: când trebuie refăcut stocul, ce utilaje au nevoie de mentenanță, ce parcele au avut randament ridicat, ce activități au întârziat și ce costuri sunt asociate fiecărei culturi.

Aplicația AgroManager se încadrează în această direcție, propunând o platformă web pentru gestionarea activităților unei ferme agricole. Sistemul urmărește centralizarea informațiilor și separarea responsabilităților pe roluri, astfel încât managerul, agronomul și muncitorul să lucreze în același mediu informatic, dar cu interfețe și operații adaptate atribuțiilor fiecăruia. Prin această abordare, aplicația susține trecerea de la evidențe izolate la un instrument integrat de management operațional și analiză.

## 1.2. Probleme specifice gestionării unei ferme agricole

Gestionarea unei ferme agricole implică un volum mare de informații care se modifică frecvent. O parcelă poate avea culturi diferite de la un sezon la altul, lucrările agricole trebuie executate în anumite intervale, materialele pot fi consumate diferit față de estimările inițiale, iar utilajele pot deveni indisponibile din cauza defecțiunilor sau a mentenanței. În lipsa unei aplicații centralizate, aceste modificări sunt dificil de urmărit și pot conduce la decizii bazate pe date incomplete.

O primă problemă este lipsa unei evidențe unitare a parcelelor. Pentru o fermă vegetală, parcela reprezintă unitatea principală de lucru. Pe baza acesteia se planifică activități, se asociază culturi, se urmăresc consumuri și se calculează producții. Dacă suprafețele, culturile sau istoricul lucrărilor sunt păstrate în documente separate, devine dificilă reconstruirea istoricului unei parcele și compararea rezultatelor între ani agricoli.

A doua problemă este coordonarea activităților agricole. Lucrările precum semănatul, fertilizarea, erbicidarea, tratamentele fitosanitare, irigarea sau recoltarea necesită planificare, personal, utilaje și materiale. În practică, diferența dintre activitatea planificată și activitatea executată poate fi semnificativă. Pot apărea întârzieri, consumuri reale diferite de consumurile estimate sau observații din teren care trebuie transmise agronomului și managerului. Un sistem digital trebuie să permită nu doar crearea lucrării, ci și urmărirea stării acesteia până la finalizare.

A treia problemă este gestionarea resurselor materiale. Magazia unei ferme conține semințe, îngrășăminte, pesticide, combustibil, piese și alte materiale necesare desfășurării activităților. Fără o evidență actualizată a stocurilor, ferma riscă fie lipsa materialelor în momente critice, fie achiziții inutile. Pragurile minime de stoc, alertele și cererile de aprovizionare sunt mecanisme importante pentru prevenirea acestor situații.

A patra problemă este legată de utilaje și mentenanță. Tractorul, combina, semănătoarea, pulverizatorul sau alte echipamente agricole trebuie urmărite în funcție de disponibilitate, ore de funcționare, intervenții de service și lucrările la care sunt utilizate. O aplicație de management agricol trebuie să ofere o evidență clară a utilajelor și să ajute la planificarea mentenanței, deoarece indisponibilitatea unui utilaj într-o perioadă agricolă importantă poate afecta întregul flux de lucru.

A cincea problemă este comunicarea între roluri. Managerul are nevoie de indicatori generali despre fermă, agronomul are nevoie de date tehnice despre parcele și lucrări, iar muncitorul are nevoie de o listă clară de sarcini. Dacă aceste informații circulă prin canale informale, există riscul de pierdere a datelor, neînțelegeri sau raportări incomplete. Separarea interfețelor pe roluri și păstrarea unui jurnal de activități reduc aceste riscuri.

O ultimă problemă importantă este lipsa de suport pentru decizii. O fermă modernă nu are nevoie doar de evidență, ci și de informații interpretate. Datele meteorologice, indicatorii satelitari de vegetație, istoricul culturilor, rapoartele de producție și analiza consumurilor pot ajuta la prioritizarea lucrărilor și la evaluarea eficienței activităților. Prin integrarea acestor informații, aplicația poate evolua dintr-un simplu instrument de urmărire a sarcinilor într-o soluție de business intelligence pentru fermă.

## 1.3. Sisteme existente și soluții similare

Pentru analiza problemei au fost studiate mai multe soluții existente pe piață sau disponibile online. Acestea au rolul de a evidenția tipurile de servicii oferite de aplicațiile moderne de management agricol și de a poziționa aplicația AgroManager în raport cu funcționalitățile frecvent întâlnite. Analiza nu urmărește reproducerea completă a acestor platforme, ci identificarea unor repere relevante pentru proiectarea sistemului.

AGRIVI este o platformă comercială de management agricol orientată spre ferme, companii agroalimentare și lanțuri de aprovizionare. Soluția pune accent pe managementul fermei, decizii agronomice și economice bazate pe date, monitorizare și trasabilitate [3]. Această platformă evidențiază importanța corelării datelor operaționale cu datele economice și cu trasabilitatea producției.

John Deere Operations Center este un sistem online pentru managementul operațiunilor agricole, disponibil pe web și dispozitive mobile. Platforma este orientată puternic spre utilaje, date colectate din teren, planificarea lucrărilor, monitorizarea calității și analiza rezultatelor [4]. Comparativ cu o aplicație generală de management agricol, această soluție are avantajul integrării cu ecosistemul de echipamente John Deere.

Climate FieldView este o soluție digitală pentru agricultură care pune accent pe colectarea datelor din câmp, analizarea acestora, monitorizarea presiunilor asupra culturilor și sprijinirea deciziilor de producție [5]. Platforma este relevantă pentru analiza lucrării deoarece arată importanța datelor din teren și a accesului rapid la informații privind starea culturilor.

Farmbrite este o platformă de management al fermei care include module pentru sarcini, culturi, animale, inventar, cheltuieli, vânzări, rapoarte și analiză [6]. Această soluție ilustrează direcția aplicațiilor integrate, în care activitățile operaționale sunt conectate cu partea economică și administrativă a fermei.

xFarm este o aplicație pentru management agricol care urmărește centralizarea datelor despre fermă într-un singur sistem. Platforma include funcții pentru managementul câmpurilor, activităților, utilajelor, irigațiilor, sustenabilității, vremii, senzorilor și agriculturii de precizie [7]. Este relevantă pentru AgroManager prin accentul pus pe hartă, activități, utilaje și date externe.

Agworld este o platformă de management agricol orientată spre colaborarea dintre fermieri, agronomi, angajați, contractori și alți participanți la procesul agricol. Soluția pune accent pe planificarea culturilor, urmărirea execuției, centralizarea înregistrărilor și îmbunătățirea performanței financiare și agricole [8]. Această abordare confirmă importanța colaborării între roluri, aspect aflat și la baza aplicației AgroManager.

farmOS este o aplicație web open-source pentru managementul fermei, planificare și păstrarea evidențelor. Proiectul este dezvoltat de o comunitate și este licențiat ca software liber și open-source [9]. Acest exemplu este important deoarece arată că sistemele de management agricol nu sunt doar produse comerciale, ci pot exista și ca platforme deschise, extensibile și adaptabile.

Tabelul 1.1 prezintă o comparație sintetică între aceste soluții și aplicația AgroManager.

| Sistem analizat | Tip soluție | Funcționalități principale observate | Observații în raport cu AgroManager |
| --- | --- | --- | --- |
| AGRIVI | Comercial | Management fermă, trasabilitate, date agronomice și economice, monitorizare | Reprezintă un reper pentru integrarea managementului operațional cu analiza economică. |
| John Deere Operations Center | Comercial, integrat cu ecosistem de utilaje | Planificare lucrări, monitorizare operațiuni, date din utilaje, analiză rezultate | Este puternic orientat spre utilaje și date generate de echipamente. AgroManager urmărește o soluție mai generală, independentă de producătorul utilajelor. |
| Climate FieldView | Comercial | Colectare date din câmp, analiză, monitorizare culturi, decizii agronomice | Este relevant pentru componenta de date agricole și monitorizare, dar AgroManager pune accent și pe fluxuri administrative, stocuri și roluri operaționale. |
| Farmbrite | Comercial | Sarcini, culturi, animale, inventar, cheltuieli, vânzări, rapoarte | Evidențiază utilitatea unei platforme complete pentru administrarea fermei. |
| xFarm | Comercial, aplicație web și mobilă | Câmpuri, activități, utilaje, vreme, senzori, agricultură de precizie, sustenabilitate | Este apropiată ca direcție de AgroManager prin hărți, activități, utilaje și integrarea datelor externe. |
| Agworld | Comercial | Colaborare între fermieri, agronomi și colaboratori, planificare, execuție, performanță | Confirmă importanța colaborării și a fluxurilor pe roluri. |
| farmOS | Gratuit/open-source | Management fermă, planificare, evidențe, platformă extensibilă | Demonstrează posibilitatea unei soluții deschise și personalizabile. |
| AgroManager | Aplicație web realizată în cadrul lucrării | Roluri distincte, hartă parcele, activități agricole, taskuri, magazie, cereri, utilaje, mentenanță, vreme, NDVI, rapoarte | Este adaptată unei ferme agricole și urmărește integrarea managementului operațional cu informații de suport decizional. |

Analiza acestor sisteme arată că aplicațiile moderne de management agricol tind să integreze mai multe direcții: evidență operațională, hartă, planificare, colaborare, raportare, date externe și analiză. Diferențele apar în special în nivelul de specializare: unele soluții sunt orientate spre utilaje, altele spre trasabilitate, contabilitate, colaborare sau agricultură de precizie. AgroManager urmărește o variantă echilibrată pentru o fermă vegetală, cu accent pe activități, roluri, resurse și monitorizare.

## 1.4. Serviciile oferite de un sistem de management agricol

Un sistem informatic pentru management agricol trebuie să ofere servicii care acoperă principalele fluxuri de lucru din fermă. Aceste servicii nu trebuie privite izolat, deoarece valoarea lor crește atunci când informațiile sunt conectate între module.

Primul serviciu este administrarea parcelelor. Sistemul trebuie să permită introducerea datelor despre parcele, reprezentarea lor pe hartă, calcularea sau memorarea suprafețelor și asocierea acestora cu anumite culturi sau sezoane agricole. Harta interactivă oferă utilizatorilor o percepție clară asupra distribuției terenurilor și permite acces rapid la informațiile fiecărei parcele.

Al doilea serviciu este planificarea și urmărirea activităților agricole. O activitate trebuie să conțină informații despre parcela vizată, tipul lucrării, perioada planificată, persoanele responsabile, utilajele folosite și materialele estimate. După execuție, sistemul trebuie să poată stoca datele reale: intervalul de lucru, observațiile muncitorului, cantitatea recoltată și consumurile efective. Această diferențiere între planificare și execuție este esențială pentru controlul activităților.

Al treilea serviciu este gestionarea personalului și a responsabilităților. Într-o aplicație agricolă, utilizatorii nu au toți aceleași drepturi. Managerul are nevoie de operații administrative, agronomul are nevoie de instrumente de planificare tehnică, muncitorul are nevoie de sarcini clare și simple, iar administratorul platformei are rol global. Prin urmare, sistemul trebuie să implementeze autentificare, autorizare și interfețe diferențiate pe roluri.

Al patrulea serviciu este managementul magaziei. Aplicația trebuie să permită evidența stocurilor, organizarea pe categorii, urmărirea unităților de măsură, definirea pragurilor minime și generarea alertelor atunci când materialele sunt aproape de epuizare. În plus, un flux de cereri de aprovizionare permite agronomului sau altor utilizatori autorizați să solicite materiale, iar managerului să aprobe sau să respingă aceste cereri.

Al cincilea serviciu este gestionarea utilajelor și a mentenanței. Sistemul trebuie să păstreze informații despre utilaje, starea lor, orele de funcționare, lucrările la care au fost utilizate și intervențiile de service. Acest serviciu ajută la evitarea indisponibilităților neplanificate și la păstrarea unui istoric tehnic pentru fiecare echipament.

Al șaselea serviciu este notificarea utilizatorilor. Într-un sistem colaborativ, utilizatorii trebuie informați atunci când apare o activitate nouă, o cerere de aprovizionare, un stoc minim, o lucrare finalizată sau o situație care necesită atenție. Notificările reduc dependența de comunicarea informală și contribuie la reacții mai rapide.

Al șaptelea serviciu este integrarea datelor externe. Datele meteorologice și indicii satelitari, precum NDVI, pot oferi informații utile pentru prioritizarea lucrărilor și monitorizarea culturilor. Integrarea acestor servicii transformă aplicația într-un instrument mai apropiat de nevoile agriculturii moderne, în care deciziile sunt susținute de date.

Al optulea serviciu este raportarea. Managerul și agronomul au nevoie de informații centralizate despre producție, consumuri, activități, stocuri, costuri și performanță. Rapoartele permit evaluarea rezultatelor pe ani, parcele, culturi sau tipuri de lucrări și pot susține deciziile pentru sezoanele următoare.

## 1.5. Tipuri de utilizatori

Aplicația AgroManager este construită în jurul mai multor tipuri de utilizatori, fiecare având responsabilități diferite în cadrul fermei. Separarea pe roluri asigură atât organizarea fluxurilor de lucru, cât și protecția datelor prin limitarea accesului la operațiile necesare fiecărui utilizator.

Managerul fermei este utilizatorul cu responsabilitate administrativă asupra fermei. Acesta gestionează informațiile generale despre fermă, angajații, magazia, utilajele, mentenanța, cererile de aprovizionare și rapoartele. Managerul are nevoie de o imagine de ansamblu asupra activităților și resurselor, deoarece deciziile sale influențează organizarea întregii ferme. Din acest motiv, interfața managerului trebuie să pună accent pe control, monitorizare și acces rapid la date sintetice.

Agronomul este utilizatorul cu rol tehnic în planificarea și urmărirea lucrărilor agricole. Acesta gestionează activitățile pe parcele, consultă harta, verifică istoricul culturilor, urmărește datele meteo și indicatorii de vegetație, consultă stocurile disponibile și poate crea cereri de aprovizionare. Rolul agronomului este esențial deoarece acesta transformă obiectivele fermei în lucrări concrete, adaptate condițiilor din teren.

Muncitorul este utilizatorul orientat spre execuția activităților. Acesta nu are nevoie de acces la toate datele administrative ale fermei, ci de o interfață simplificată, în care să vadă sarcinile atribuite, să înceapă și să finalizeze lucrări, să raporteze orele de lucru, observațiile, cantitatea recoltată și consumurile reale. Prin raportarea datelor direct în sistem, munca din teren devine trasabilă și poate fi corelată cu planificarea agronomului.

Administratorul platformei, numit în aplicație SUPER_ADMIN, este rolul responsabil de administrarea globală a sistemului. Într-o versiune completă, acesta poate gestiona fermele înregistrate, utilizatorii la nivel de platformă, activarea sau dezactivarea conturilor și monitorizarea generală a aplicației. Rolul este diferit de managerul fermei, deoarece acționează la nivelul întregii platforme, nu doar la nivelul unei ferme.

## 1.6. Operații realizate de fiecare tip de utilizator

Managerul fermei realizează operații administrative și de control. Acesta poate actualiza datele fermei, poate gestiona angajații și rolurile acestora, poate crea și vizualiza parcele, poate urmări activitățile planificate și realizate, poate administra magazia, poate aproba sau respinge cereri de aprovizionare și poate urmări notificările generate de sistem. De asemenea, managerul gestionează utilajele, starea acestora și intervențiile de mentenanță. Prin rapoarte, managerul poate analiza producția, consumurile și performanța generală a fermei.

Agronomul realizează operații tehnice legate de producția agricolă. Acesta poate vizualiza și administra parcelele pe hartă, poate crea activități agricole, poate selecta muncitorii și utilajele implicate, poate estima consumurile de materiale și poate urmări starea lucrărilor. Agronomul consultă istoricul culturilor pentru fiecare parcelă, verifică datele NDVI și datele meteorologice și poate introduce observații relevante. În cazul în care materialele necesare nu sunt suficiente, agronomul poate crea cereri de aprovizionare către manager.

Muncitorul realizează operații de execuție și raportare. Acesta vede lista lucrărilor atribuite, poate marca începerea unei activități și poate raporta finalizarea acesteia. La finalizarea unei lucrări, muncitorul poate introduce intervalul efectiv de lucru, comentarii din teren, cantitatea recoltată și consumurile reale ale materialelor utilizate. Aceste informații sunt importante deoarece permit actualizarea stocurilor și oferă managerului și agronomului o imagine reală asupra execuției.

Administratorul platformei realizează operații la nivel global. În forma finală a sistemului, acesta poate gestiona fermele și utilizatorii înregistrați în platformă, poate monitoriza utilizarea aplicației și poate interveni în situații administrative. Acest rol susține scalarea aplicației către mai multe ferme, fiecare cu propriul manager, propriii angajați și propriile date operaționale.

## 1.7. Necesitatea aplicației AgroManager

Necesitatea aplicației AgroManager rezultă din combinația dintre complexitatea activităților agricole și nevoia de centralizare a informațiilor. O fermă nu poate fi administrată eficient doar prin liste separate de sarcini sau evidențe manuale, deoarece fiecare decizie depinde de mai multe categorii de date. Planificarea unei lucrări depinde de parcelă, cultură, vreme, personal, utilaje și materiale. Evaluarea rezultatelor depinde de cantitatea recoltată, de consumurile efective și de istoricul parcelei. Gestionarea costurilor depinde de stocuri, operații, producție și mentenanță.

AgroManager propune o soluție în care aceste informații sunt reunite într-o aplicație web accesibilă rolurilor principale din fermă. Managerul poate urmări resursele și performanța, agronomul poate planifica și monitoriza activitățile, muncitorul poate raporta execuția, iar administratorul poate susține organizarea la nivel de platformă. Harta interactivă, jurnalul de activități, istoricul culturilor, magazia, cererile de aprovizionare, utilajele, mentenanța, notificările, datele meteo și NDVI contribuie la construirea unei imagini operaționale complete.

Prin urmare, aplicația nu este justificată doar ca un instrument informatic de evidență, ci ca o soluție integrată pentru management agricol. Scopul său este de a reduce fragmentarea informațiilor, de a îmbunătăți comunicarea între roluri, de a permite trasabilitatea lucrărilor și de a oferi suport pentru decizii bazate pe date. Această direcție corespunde tendințelor actuale din agricultura digitală, în care performanța fermei depinde tot mai mult de capacitatea de a colecta, interpreta și utiliza informațiile disponibile.

## 1.8. Concluzii privind analiza problemei

Analiza problemei evidențiază faptul că managementul unei ferme agricole presupune coordonarea unui număr mare de activități, resurse și persoane. Sistemele comerciale și open-source existente confirmă importanța digitalizării în agricultură și arată că principalele direcții urmărite de astfel de aplicații sunt planificarea, monitorizarea, colaborarea, evidența resurselor, raportarea și integrarea datelor externe.

AgroManager se poziționează ca o aplicație web destinată gestionării integrate a unei ferme agricole, cu accent pe roluri clare și pe fluxuri operaționale. Sistemul urmărește să ofere o alternativă coerentă la evidențele fragmentate, prin centralizarea datelor despre parcele, lucrări, personal, stocuri, utilaje și rezultate. În capitolul următor sunt formulate cerințele funcționale și nefuncționale ale aplicației, pornind de la problemele identificate și de la operațiile necesare fiecărui tip de utilizator.
