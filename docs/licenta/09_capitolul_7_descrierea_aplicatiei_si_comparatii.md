# Capitolul 7. Descrierea aplicației și realizarea de comparații cu alte sisteme

Acest capitol prezintă aplicația AgroManager din perspectiva utilizării efective. Spre deosebire de capitolul dedicat cerințelor, unde au fost descrise funcționalitățile pe care sistemul trebuie să le ofere, aici este urmărit modul în care utilizatorul interacționează cu aplicația realizată. Prezentarea este organizată pe roluri și pe fluxuri de lucru, astfel încât să se observe diferențele dintre manager, agronom, muncitor și administratorul platformei.

Aplicația este proiectată pentru a susține activitatea unei ferme agricole printr-o interfață web. Utilizatorii nu lucrează cu aceleași pagini și nu au aceleași responsabilități. Managerul urmărește administrarea fermei și indicatorii generali, agronomul planifică lucrările agricole și monitorizează parcelele, muncitorul execută activitățile atribuite, iar administratorul platformei gestionează sistemul la nivel global.

## 7.1. Prezentarea generală a aplicației

AgroManager oferă o structură de navigare bazată pe rolul utilizatorului autentificat. După login, aplicația redirecționează utilizatorul către dashboard-ul propriu. Această organizare evită încărcarea interfeței cu module care nu sunt relevante pentru rolul curent și reduce riscul ca utilizatorul să efectueze operații care nu țin de responsabilitatea sa.

Interfața folosește o navigație simplă, cu acces către modulele importante: hartă, magazie, utilaje, angajați, profil fermă, rapoarte, istoric activități și module de analiză. Pentru manager și agronom, aplicația afișează și zona de notificări, unde apar evenimente precum cereri de aprovizionare, stocuri reduse sau lucrări finalizate.

În partea centrală a aplicației se află modulele operaționale. Harta permite vizualizarea parcelelor și accesul la date despre culturi, lucrări, vreme și NDVI. Magazia păstrează evidența resurselor materiale. Modulul de activități leagă agronomul de muncitori, iar rapoartele transformă datele introduse în indicatori utili pentru manager.

**Aici se inserează Figura 7.1. Structura generală a aplicației AgroManager după autentificare.**  
Captură de realizat: o pagină autentificată cu meniul vizibil, de preferat dashboard manager sau agronom.

## 7.2. Fluxuri publice: pagina principală, autentificare, înregistrare

Înainte de autentificare, utilizatorul are acces la paginile publice ale aplicației. Acestea includ pagina principală, formularul de autentificare și formularul de înregistrare. Fluxul public are rolul de a permite accesul utilizatorilor existenți și de a crea o fermă nouă împreună cu primul cont de manager.

Pagina principală prezintă aplicația și oferă acces către autentificare și înregistrare. Aceasta este punctul de intrare pentru utilizatorii care ajung prima dată în sistem.

**Aici se inserează Figura 7.2. Pagina principală AgroManager.**  
Captură de realizat: landing page-ul aplicației, înainte de autentificare.

Formularul de autentificare solicită numele de utilizator și parola. După trimiterea datelor, backend-ul verifică identitatea utilizatorului, iar frontend-ul salvează informațiile necesare pentru sesiunea curentă: id-ul utilizatorului, numele, rolul și ferma asociată. În funcție de rol, utilizatorul este direcționat către dashboard-ul potrivit.

**Aici se inserează Figura 7.3. Formularul de autentificare.**  
Captură de realizat: pagina de login completată cu date demonstrative, fără parolă reală vizibilă.

Formularul de înregistrare este folosit pentru crearea unei ferme și a contului de manager. Acest flux este diferit de adăugarea angajaților. La înregistrare se creează entitatea fermei, iar utilizatorul inițial primește rolul `FARM_MANAGER`. Ulterior, managerul poate adăuga agronomi și muncitori în cadrul fermei sale.

**Aici se inserează Figura 7.4. Formularul de înregistrare a unei ferme și a contului de manager.**  
Captură de realizat: pagina de register cu câmpurile pentru cont și datele fermei.

## 7.3. Utilizarea aplicației de către managerul fermei

După autentificare, managerul ajunge în panoul de control al fermei. Dashboard-ul managerial grupează accesul către zonele administrative: echipă, hartă, utilaje, magazie, profil fermă, raportare și modul meteo. Această pagină funcționează ca un punct de plecare pentru activitatea de administrare.

**Aici se inserează Figura 7.5. Dashboard-ul managerului fermei.**  
Captură de realizat: panoul managerului cu toate cardurile principale vizibile.

Una dintre primele zone importante pentru manager este profilul fermei. Aici sunt afișate datele generale ale fermei, precum adresa, emailul de contact și obiectivele. Tot în această zonă poate fi urmărită suprafața totală administrată, calculată pe baza parcelelor introduse în sistem. Profilul fermei include și o zonă de jurnal, utilă pentru notarea deciziilor, observațiilor sau ședințelor interne.

**Aici se inserează Figura 7.6. Pagina de profil a fermei.**  
Captură de realizat: profil fermă cu date generale, suprafață totală și jurnal.

Managerul gestionează și echipa fermei. Pagina de angajați permite adăugarea unor utilizatori cu rol de agronom sau muncitor. În acest fel, structura fermei este construită în jurul rolurilor reale din aplicație. Managerul nu doar creează conturi, ci stabilește cine planifică lucrări și cine le execută.

**Aici se inserează Figura 7.7. Pagina de management al angajaților.**  
Captură de realizat: lista angajaților și formularul de adăugare angajat.

Magazia este una dintre zonele importante pentru manager, deoarece oferă evidența resurselor materiale. În pagina de stocuri sunt afișate produsele existente, categoria, unitatea de măsură, cantitatea disponibilă, pragul minim și prețul unitar. Produsele cu stoc redus sunt evidențiate vizual, astfel încât managerul să observe rapid materialele care trebuie refăcute.

**Aici se inserează Figura 7.8. Pagina de magazie cu stocurile curente.**  
Captură de realizat: tabul de stocuri, cu cel puțin un produs cu status normal și unul cu stoc redus.

În aceeași zonă, managerul poate analiza cererile de aprovizionare trimise de agronom. O cerere conține numele produsului, categoria, cantitatea solicitată, prioritatea și statusul. Managerul poate aproba sau respinge cererea. În cazul aprobării, stocul este actualizat automat, iar agronomul primește notificare.

**Aici se inserează Figura 7.9. Cereri de aprovizionare vizibile pentru manager.**  
Captură de realizat: tabul de cereri cu o cerere în așteptare și acțiunile de aprobare/respingere.

Modulul de utilaje permite managerului să urmărească flota fermei. Pentru fiecare utilaj sunt afișate numele, tipul, statusul, orele de funcționare și progresul către următoarea mentenanță. Această afișare ajută la planificarea lucrărilor, deoarece un utilaj aflat în service sau aproape de revizie poate influența decizia de alocare.

**Aici se inserează Figura 7.10. Pagina de gestiune a utilajelor.**  
Captură de realizat: lista utilajelor, statusuri și progres mentenanță.

Pentru fiecare utilaj, managerul poate consulta jurnalul de service și poate adăuga o intervenție nouă. În jurnal se păstrează data intervenției, descrierea, costul și orele motor la momentul service-ului. Această evidență este utilă pentru urmărirea istoricului tehnic al utilajelor.

**Aici se inserează Figura 7.11. Jurnalul de mentenanță al unui utilaj.**  
Captură de realizat: modalul sau zona de detalii service pentru un utilaj.

Managerul are acces și la hartă, unde poate inspecta parcelele fermei. Din această perspectivă, harta este folosită mai ales pentru supraveghere: managerul poate vedea suprafețele, culturile și activitățile asociate unei parcele. Pentru planificare detaliată, rolul principal îl are agronomul.

**Aici se inserează Figura 7.12. Harta parcelelor în interfața managerului.**  
Captură de realizat: harta cu mai multe parcele și o parcelă selectată.

## 7.4. Utilizarea aplicației de către agronom

Agronomul folosește aplicația în special pentru planificarea și urmărirea lucrărilor agricole. Dashboard-ul său oferă acces către harta parcelelor, utilaje, magazie, istoricul sarcinilor și modulul meteo. Spre deosebire de manager, agronomul are o interfață orientată spre decizii tehnice și activități pe teren.

**Aici se inserează Figura 7.13. Dashboard-ul agronomului.**  
Captură de realizat: panoul agronomului cu modulele disponibile.

Pagina de hartă este componenta principală pentru agronom. Aici sunt afișate parcelele fermei, colorate în funcție de cultura asociată. Agronomul poate selecta o parcelă și poate vedea detaliile acesteia într-un panou lateral. În funcție de datele disponibile, panoul prezintă suprafața, cultura, istoricul lucrărilor, istoricul culturilor, datele NDVI și informațiile meteo.

**Aici se inserează Figura 7.14. Harta parcelelor cu panoul de detalii deschis.**  
Captură de realizat: rol agronom, parcelă selectată, panou lateral vizibil.

Agronomul poate crea o lucrare direct din contextul unei parcele. Formularul de activitate permite alegerea tipului de lucrare, a datei, a muncitorilor, a utilajelor și a materialelor consumabile. Acest mod de lucru este util deoarece activitatea este legată încă de la început de parcela pe care se execută.

**Aici se inserează Figura 7.15. Formularul de creare a unei activități agricole.**  
Captură de realizat: formular completat cu tip lucrare, muncitori, utilaje și consumabile.

În timpul planificării, agronomul poate consulta datele meteo. Aceste informații ajută la alegerea momentului potrivit pentru lucrări. De exemplu, vântul sau precipitațiile pot influența tratamentele, iar temperatura poate influența unele activități agricole.

**Aici se inserează Figura 7.16. Widgetul meteo utilizat în planificarea lucrărilor.**  
Captură de realizat: zona meteo din formular sau pagina de strategie meteo.

Pentru monitorizarea culturilor, aplicația include un widget NDVI. Agronomul poate selecta perioada dorită și poate vedea valoarea NDVI asociată parcelei. Informația este utilă pentru observarea stării vegetației și pentru identificarea perioadelor în care cultura poate avea nevoie de atenție.

**Aici se inserează Figura 7.17. Widgetul NDVI pentru o parcelă selectată.**  
Captură de realizat: valoare NDVI, lună/an selectate și etichetă privind sursa datelor.

Agronomul poate consulta și istoricul culturilor. Această zonă arată ce culturi au fost înregistrate pe parcelă în sezoane diferite și ce producție a fost obținută. Informația ajută la urmărirea rotației culturilor și la compararea rezultatelor de la un an la altul.

**Aici se inserează Figura 7.18. Istoricul culturilor pentru o parcelă.**  
Captură de realizat: lista sezoanelor de cultură pentru parcela selectată.

Pentru urmărirea lucrărilor, agronomul are acces la istoricul activităților. Aici poate vedea lucrările planificate, în desfășurare sau finalizate, împreună cu statusul și datele raportate de muncitori.

**Aici se inserează Figura 7.19. Istoricul activităților urmărite de agronom.**  
Captură de realizat: pagina de istoric sarcini alocate sau istoricul unei parcele.

În cazul în care agronomul observă că materialele disponibile nu sunt suficiente pentru o lucrare, acesta poate crea o cerere de aprovizionare. Cererea ajunge la manager, iar decizia acestuia este comunicată prin notificări. Acest flux leagă planificarea tehnică de administrarea resurselor.

**Aici se inserează Figura 7.20. Formularul de cerere de aprovizionare pentru agronom.**  
Captură de realizat: tabul de cereri, cu formularul de creare cerere deschis.

## 7.5. Utilizarea aplicației de către muncitor

Muncitorul are o interfață mai simplă decât managerul și agronomul. După autentificare, acesta vede sarcinile active care i-au fost atribuite. Fiecare task conține informații despre tipul lucrării, parcela, data planificată și statusul curent.

**Aici se inserează Figura 7.21. Dashboard-ul muncitorului cu sarcini active.**  
Captură de realizat: pagina muncitorului, cu cel puțin o lucrare în așteptare sau în lucru.

Atunci când începe o lucrare, muncitorul apasă butonul de pornire. Sistemul schimbă statusul activității în `IN_PROGRESS` și poate actualiza statusul utilajelor asociate. Interfața rămâne concentrată pe operațiile necesare muncitorului, fără acces la module administrative.

După finalizarea lucrării, muncitorul completează formularul de raportare. Acesta include ora începerii, ora finalizării, comentarii, consumurile reale și, în cazul unei activități de recoltare, cantitatea recoltată. Aceste date sunt importante deoarece actualizează stocurile, producția și istoricul activităților.

**Aici se inserează Figura 7.22. Formularul de finalizare și raportare a unei lucrări.**  
Captură de realizat: formularul muncitorului cu ore, comentarii, consum real și recoltă, dacă este cazul.

După trimiterea raportului, activitatea este marcată ca finalizată. Managerul și agronomul primesc notificări, iar activitatea intră în istoricul lucrărilor. Muncitorul poate consulta ulterior lista lucrărilor executate, ceea ce oferă o evidență personală a activității sale.

**Aici se inserează Figura 7.23. Istoricul lucrărilor executate de muncitor.**  
Captură de realizat: pagina de istoric lucrări pentru rolul muncitor.

## 7.6. Utilizarea aplicației de către administratorul platformei

Rolul `SUPER_ADMIN` este destinat administrării la nivel global. În forma curentă, interfața acestui rol este minimală și separată de modulele unei ferme. Această separare este importantă deoarece administratorul platformei nu trebuie confundat cu managerul unei ferme. Managerul administrează resursele fermei sale, în timp ce administratorul platformei are rol tehnic și global.

**Aici se inserează Figura 7.24. Panoul de bază pentru administratorul platformei.**  
Captură de realizat: dashboard-ul Super Admin.

Într-o versiune extinsă, acest rol poate include gestiunea fermelor înregistrate, gestiunea conturilor, activarea sau dezactivarea utilizatorilor și monitorizarea generală a platformei. Pentru lucrarea de față, rolul este prezentat ca punct de plecare pentru administrarea globală, nu ca modul operațional al unei ferme.

## 7.7. Rapoarte, notificări și module de analiză

Un element important al aplicației este faptul că datele introduse în fluxurile operaționale sunt folosite ulterior pentru analiză. Activitățile, consumurile, producția și stocurile nu rămân doar înregistrări izolate, ci sunt valorificate în rapoarte și notificări.

Sistemul de notificări informează managerul și agronomul despre evenimente importante. De exemplu, managerul primește notificare atunci când apare o cerere de aprovizionare sau când un stoc scade sub pragul minim. Agronomul primește notificare atunci când managerul aprobă sau respinge o cerere. Notificările reduc dependența de comunicarea informală și fac ca evenimentele importante să fie vizibile în aplicație.

**Aici se inserează Figura 7.25. Panoul de notificări al aplicației.**  
Captură de realizat: meniul de notificări deschis, cu cel puțin două notificări demonstrative.

Raportul de producție și profitabilitate este destinat managerului. Acesta afișează recolta totală, costurile materialelor, veniturile, profitul total și profitul pe hectar. Datele provin din activități finalizate, consumuri reale și sezoane de cultură. Prin acest modul, aplicația trece de la simpla evidență a activităților la o zonă de analiză economică.

**Aici se inserează Figura 7.26. Raportul de producție și profitabilitate.**  
Captură de realizat: pagina raportului financiar, cu indicatorii sintetici și tabelul pe parcele.

Modulul meteo și strategie oferă o perspectivă asupra condițiilor de lucru. Utilizatorul poate vedea informații despre vreme și recomandări utile pentru planificarea activităților. Acest modul este relevant mai ales pentru agronom, dar poate fi consultat și de manager.

**Aici se inserează Figura 7.27. Pagina Meteo și Strategie.**  
Captură de realizat: pagina meteo cu date și recomandări operaționale.

Modulul NDVI completează informațiile din teren cu date satelitare. Valorile NDVI sunt afișate pentru parcela selectată și pentru perioada aleasă. În cazul în care datele externe nu sunt disponibile, aplicația poate folosi valori estimate sau salvate anterior, astfel încât utilizatorul să primească totuși o indicație despre starea culturii.

**Aici se inserează Figura 7.28. Analiza NDVI pentru o parcelă.**  
Captură de realizat: widget NDVI sau panou hartă cu valoare NDVI vizibilă.

## 7.8. Comparație cu alte sisteme existente

În Capitolul 1 au fost analizate mai multe platforme existente pentru management agricol. În această secțiune, comparația este realizată din perspectiva aplicației implementate. Scopul nu este afirmarea faptului că AgroManager înlocuiește platformele comerciale mature, ci evidențierea poziției aplicației față de acestea.

Comparativ cu AGRIVI [3], AgroManager are o abordare mai restrânsă și mai adaptată proiectului de licență. AGRIVI este o platformă comercială complexă, orientată spre management agricol la scară largă, trasabilitate și analiză. AgroManager se concentrează pe fluxurile esențiale ale unei ferme: parcele, lucrări, muncitori, utilaje, magazie, cereri și rapoarte. Avantajul aplicației este simplitatea și separarea clară pe roluri.

Comparativ cu John Deere Operations Center [4], AgroManager nu este legată de un anumit producător de utilaje. John Deere pune accent pe datele generate de echipamente și pe integrarea cu ecosistemul propriu. AgroManager tratează utilajele într-un mod general: evidență, status, ore de funcționare și mentenanță. Această abordare este mai simplă, dar poate fi utilizată pentru utilaje diferite, indiferent de marcă.

Comparativ cu Climate FieldView [5], aplicația AgroManager nu este centrată exclusiv pe analiza culturilor și pe date din câmp. AgroManager include monitorizare prin NDVI și date meteo, dar păstrează în același timp module administrative: angajați, magazie, cereri de aprovizionare și rapoarte financiare. Astfel, aplicația combină partea agronomică cu partea operațională.

Comparativ cu Farmbrite [6], AgroManager are o arie mai îngustă, fiind orientată spre o fermă vegetală și spre fluxurile implementate în proiect. Farmbrite include multe zone administrative și economice, inclusiv funcționalități mai largi pentru managementul fermei. AgroManager se diferențiază prin integrarea hărții cu activitățile agricole, prin rolul muncitorului și prin fluxul concret de raportare a consumurilor reale.

Comparativ cu xFarm [7], AgroManager are mai puține integrări externe și nu include un ecosistem complet de senzori sau agricultură de precizie. Totuși, aplicația include elemente relevante pentru un proiect integrat: hartă, vreme, NDVI, utilaje, stocuri și rapoarte. Diferența principală este nivelul de maturitate: xFarm este o platformă comercială extinsă, iar AgroManager este o aplicație web construită pentru a demonstra un flux complet de management agricol.

Comparativ cu farmOS [9], AgroManager are o structură mai controlată pe roluri. farmOS este un sistem open-source flexibil, care poate fi adaptat în mai multe direcții. AgroManager propune o experiență mai ghidată: managerul, agronomul și muncitorul au interfețe distincte și fluxuri bine delimitate.

Prin această comparație, AgroManager poate fi poziționată ca o aplicație integrată, adaptată unei ferme agricole și orientată spre colaborarea dintre roluri. Nu are complexitatea platformelor comerciale mari, dar acoperă un flux complet: planificare, execuție, raportare, stocuri, utilaje, mentenanță și analiză.

## 7.9. Avantaje, limitări și dezvoltări viitoare

Un prim avantaj al aplicației este integrarea mai multor module într-un singur sistem. Datele despre parcele, activități, muncitori, stocuri, utilaje și rapoarte sunt conectate între ele. De exemplu, o lucrare finalizată de muncitor poate afecta stocurile, producția și notificările.

Un al doilea avantaj este separarea clară pe roluri. Managerul, agronomul și muncitorul nu folosesc aceeași interfață și nu au aceleași drepturi. Această structură face aplicația mai apropiată de modul real de lucru al unei ferme.

Un alt avantaj este folosirea hărții interactive. Parcelele nu sunt prezentate doar într-o listă, ci sunt afișate geografic. Această abordare este potrivită pentru domeniul agricol, unde localizarea terenului influențează planificarea lucrărilor.

Aplicația include și module de analiză: raportul de producție și profitabilitate, datele meteo și valorile NDVI. Aceste funcționalități ajută managerul și agronomul să folosească datele introduse în aplicație pentru decizii mai bine fundamentate.

Există însă și limitări. Aplicația este dezvoltată ca proiect de licență, nu ca platformă comercială matură. Unele module pot fi extinse, în special zona de administrator global, testarea frontend, exportul rapoartelor și integrarea cu servicii externe. De asemenea, aplicația nu are încă o versiune mobilă nativă, deși interfața web poate fi accesată din browser.

O altă limitare este dependența de servicii externe pentru vreme și NDVI. Dacă aceste servicii nu răspund, aplicația folosește valori de rezervă sau date salvate anterior, dar precizia informațiilor poate fi afectată.

Ca dezvoltări viitoare, aplicația poate fi extinsă cu un modul de chat intern între membrii fermei, export PDF sau Excel pentru rapoarte, integrare cu senzori IoT, alerte mai avansate pentru service utilaje, raportare financiară detaliată, gestionarea subvențiilor APIA și o aplicație mobilă dedicată muncitorilor. De asemenea, rolul `SUPER_ADMIN` poate fi dezvoltat pentru gestiunea completă a fermelor și utilizatorilor la nivel de platformă.

În forma actuală, AgroManager demonstrează un flux complet de management agricol: definirea fermei, administrarea resurselor, planificarea lucrărilor, execuția în teren, raportarea consumurilor și analiza rezultatelor. Prin aceste funcționalități, aplicația răspunde obiectivului lucrării, acela de a realiza o aplicație web pentru gestionarea activităților unei ferme agricole.
