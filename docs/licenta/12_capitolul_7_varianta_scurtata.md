# Capitolul 7. Descrierea aplicației și realizarea de comparații cu alte sisteme

Acest capitol prezintă aplicația AgroManager din perspectiva utilizării efective. În capitolele anterioare au fost descrise problema, cerințele, proiectarea, implementarea, securitatea și testarea. În această parte accentul cade pe modul în care utilizatorii folosesc aplicația: ce pagini accesează, ce operații realizează și ce rezultate obțin.

Prezentarea este organizată pe roluri, deoarece AgroManager nu oferă aceeași interfață tuturor utilizatorilor. Managerul fermei are nevoie de control asupra resurselor și rapoartelor, agronomul lucrează cu planificarea activităților și monitorizarea parcelelor, muncitorul raportează execuția lucrărilor, iar administratorul platformei gestionează datele globale ale sistemului.

## 7.1. Prezentarea generală a aplicației

După autentificare, utilizatorul este redirecționat către dashboard-ul corespunzător rolului său. Această organizare reduce aglomerarea interfeței și limitează accesul la operațiile necesare fiecărui utilizator. Meniul aplicației oferă acces către modulele principale: hartă, magazie, utilaje, angajați, activități, rapoarte, notificări și module de analiză.

În AgroManager, datele introduse într-un modul sunt folosite și în alte zone ale aplicației. De exemplu, o activitate planificată de agronom apare în lista muncitorului, iar după finalizare poate actualiza stocurile, istoricul parcelei și raportul de producție. În acest fel, aplicația nu funcționează ca o colecție de pagini independente, ci ca un sistem în care informațiile sunt legate între ele.

**Aici se inserează Figura 7.1. Dashboard autentificat cu meniul principal al aplicației.**  
Captură de realizat: dashboard manager sau agronom, cu meniul vizibil și modulele principale.

## 7.2. Fluxuri publice: pagina principală, autentificare și înregistrare

Înainte de autentificare, utilizatorul are acces la pagina principală, la formularul de login și la formularul de înregistrare. Pagina principală prezintă pe scurt aplicația și oferă acces către cele două acțiuni esențiale: autentificarea unui utilizator existent și crearea unei ferme noi.

Formularul de autentificare solicită numele de utilizator și parola. După validarea datelor, aplicația identifică rolul utilizatorului și îl trimite către interfața potrivită. Înregistrarea este folosită pentru crearea unei ferme și a primului cont de manager. Angajații nu se înregistrează singuri în fluxul principal, ci sunt adăugați ulterior de manager în cadrul fermei.

**Aici se inserează Figura 7.2. Pagina de autentificare și formularul de înregistrare.**  
Captură de realizat: poți pune două capturi mai mici una lângă alta sau două figuri separate, dacă spațiul permite.

## 7.3. Funcționalități pentru managerul fermei

Managerul fermei folosește aplicația pentru administrarea resurselor și urmărirea activității generale. Din dashboard poate ajunge rapid la profilul fermei, angajați, hartă, magazie, utilaje, cereri de aprovizionare, rapoarte și notificări. Această pagină are rol de punct central de control.

În profilul fermei sunt afișate datele generale, precum denumirea, adresa, emailul de contact și descrierea. Tot aici poate fi urmărită suprafața totală administrată, calculată pe baza parcelelor introduse în sistem. Zona de jurnal permite păstrarea unor note sau decizii interne, utile pentru urmărirea activității administrative.

**Aici se inserează Figura 7.3. Dashboard-ul managerului și pagina de profil a fermei.**  
Captură de realizat: dashboard manager și, dacă ai spațiu, profilul fermei cu suprafața totală vizibilă.

Managerul gestionează echipa fermei prin pagina de angajați. Acesta poate adăuga utilizatori cu rol de agronom sau muncitor și poate urmări conturile asociate fermei. Separarea pe roluri este importantă deoarece nu toți utilizatorii trebuie să vadă aceleași informații sau să poată realiza aceleași operații.

**Aici se inserează Figura 7.4. Pagina de administrare a angajaților.**  
Captură de realizat: lista angajaților și formularul de adăugare utilizator.

Magazia oferă managerului evidența produselor disponibile. Pentru fiecare produs se urmăresc categoria, unitatea de măsură, cantitatea disponibilă, pragul minim și prețul unitar. Produsele cu stoc redus sunt evidențiate, iar cererile de aprovizionare trimise de agronom pot fi aprobate sau respinse. Dacă o cerere este aprobată, stocul este actualizat automat.

**Aici se inserează Figura 7.5. Magazia și cererile de aprovizionare.**  
Captură de realizat: tabul de stocuri și o cerere în așteptare, cu acțiunile de aprobare/respingere.

Modulul de utilaje permite urmărirea echipamentelor agricole, a statusului acestora și a orelor de funcționare. Managerul poate consulta și jurnalul de mentenanță pentru fiecare utilaj. În practică, această evidență ajută la evitarea planificării unei lucrări cu un utilaj indisponibil sau aflat aproape de revizie.

**Aici se inserează Figura 7.6. Gestiunea utilajelor și jurnalul de mentenanță.**  
Captură de realizat: lista utilajelor, statusuri și detalii pentru o intervenție de service.

Managerul poate consulta și harta parcelelor. În cazul său, harta este folosită mai ales pentru supraveghere și analiză: vede distribuția terenurilor, culturile existente, suprafețele și activitățile asociate. Planificarea detaliată a lucrărilor rămâne în principal responsabilitatea agronomului.

**Aici se inserează Figura 7.7. Harta parcelelor în interfața managerului.**  
Captură de realizat: harta cu mai multe parcele și o parcelă selectată.

## 7.4. Funcționalități pentru agronom

Agronomul folosește AgroManager pentru planificarea și urmărirea lucrărilor agricole. Interfața sa este orientată spre parcele, hartă, activități, istoric culturi, date meteo, NDVI și cereri de aprovizionare. Spre deosebire de manager, agronomul are o perspectivă mai tehnică asupra fermei.

Harta este componenta principală pentru acest rol. Agronomul poate selecta o parcelă și poate consulta informațiile relevante: cultură, suprafață, activități asociate, istoric de culturi și indicatori agricoli. Din același context poate crea o lucrare nouă, legată direct de parcela respectivă.

**Aici se inserează Figura 7.8. Harta agronomului cu panoul de detalii al parcelei.**  
Captură de realizat: rol agronom, parcelă selectată, panou lateral cu informații.

Formularul de creare a unei activități permite completarea tipului de lucrare, perioadei, muncitorilor, utilajelor și materialelor estimate. Această legătură dintre parcelă, resurse și execuție este una dintre zonele centrale ale aplicației, deoarece transformă planificarea într-un flux urmărit până la finalizarea lucrării.

**Aici se inserează Figura 7.9. Formularul de creare a unei activități agricole.**  
Captură de realizat: formular completat cu parcelă, muncitori, utilaje și consumabile.

Pentru planificare, agronomul poate consulta date meteo și valori NDVI. Datele meteo ajută la alegerea momentului potrivit pentru lucrări, iar NDVI oferă o indicație asupra stării vegetației. Aceste informații nu înlocuiesc observația din teren, dar oferă un sprijin suplimentar pentru decizie.

**Aici se inserează Figura 7.10. Date meteo și NDVI pentru o parcelă.**  
Captură de realizat: pagina meteo sau widgetul NDVI, cu valoare vizibilă pentru o parcelă.

Agronomul poate consulta istoricul culturilor și istoricul lucrărilor. Aceste două zone sunt utile pentru înțelegerea evoluției unei parcele: ce s-a cultivat, ce producție a fost obținută și ce lucrări au fost executate. Dacă materialele necesare nu sunt suficiente, agronomul creează o cerere de aprovizionare către manager.

**Aici se inserează Figura 7.11. Istoric culturi și cerere de aprovizionare.**  
Captură de realizat: istoricul culturilor pentru o parcelă sau formularul de cerere de aprovizionare.

## 7.5. Funcționalități pentru muncitor

Muncitorul are cea mai simplă interfață. După autentificare, acesta vede activitățile care i-au fost atribuite. Pentru fiecare lucrare sunt afișate parcela, tipul activității, perioada planificată și statusul. Muncitorul nu are acces la module administrative, deoarece rolul său este legat de execuție și raportare.

La începerea unei lucrări, statusul activității este schimbat în `IN_PROGRESS`. După finalizare, muncitorul completează datele reale: intervalul de lucru, observații, consumuri efective și, dacă este cazul, cantitatea recoltată. Aceste informații sunt importante deoarece pot actualiza stocurile, producția și rapoartele.

**Aici se inserează Figura 7.12. Dashboard-ul muncitorului și lista de lucrări atribuite.**  
Captură de realizat: pagina muncitorului cu cel puțin o lucrare activă.

**Aici se inserează Figura 7.13. Formularul de finalizare a unei lucrări.**  
Captură de realizat: formular cu ore lucrate, comentarii, consum real și cantitate recoltată, dacă este cazul.

## 7.6. Funcționalități pentru administratorul platformei

Rolul `SUPER_ADMIN` este destinat administrării globale a platformei. Acesta nu trebuie confundat cu managerul unei ferme. Managerul lucrează cu datele propriei ferme, în timp ce administratorul platformei are o perspectivă generală asupra sistemului.

În varianta finală a aplicației, administratorul poate realiza operații de creare, vizualizare, modificare și ștergere pentru entitățile importante ale sistemului, precum ferme, utilizatori, parcele, activități, stocuri, utilaje și mentenanță. Accesul este însă controlat. Datele sensibile, precum parolele, token-urile sau logurile, nu sunt editate direct. Pentru acestea se folosesc operații limitate, cum ar fi resetarea parolei, activarea/dezactivarea unui cont sau consultarea evenimentelor relevante.

Această abordare păstrează rolul de administrator ca instrument de control al platformei, nu ca acces liber la baza de date. Modificările se fac prin interfețe și validări ale aplicației, astfel încât să fie respectate integritatea datelor și separarea fermelor.

**Aici se inserează Figura 7.14. Panoul SUPER_ADMIN pentru administrarea globală.**  
Captură de realizat: dashboard Super Admin sau o pagină CRUD pentru ferme/utilizatori.

## 7.7. Rapoarte, notificări și module de analiză

AgroManager folosește datele introduse în fluxurile zilnice pentru notificări și rapoarte. Managerul primește notificări pentru cereri de aprovizionare, stocuri minime sau lucrări finalizate. Agronomul poate primi notificări legate de deciziile managerului asupra cererilor sale. Astfel, evenimentele importante nu rămân doar în discuții separate, ci sunt vizibile în aplicație.

Rapoartele sunt orientate în special spre manager. Raportul de producție și profitabilitate folosește informații din activități finalizate, consumuri reale și sezoane de cultură. Prin acest modul, aplicația trece de la simpla evidență a lucrărilor la o zonă de analiză economică.

**Aici se inserează Figura 7.15. Notificări și raport de producție/profitabilitate.**  
Captură de realizat: panoul de notificări sau raportul financiar cu indicatorii principali.

## 7.8. Comparație cu alte sisteme existente

În Capitolul 1 au fost prezentate mai multe sisteme de management agricol. Compararea lor cu AgroManager trebuie privită realist. Aplicația dezvoltată nu urmărește să înlocuiască platforme comerciale mature, ci să demonstreze un flux complet de management agricol într-un proiect web integrat.

Comparativ cu AGRIVI [3], AgroManager are o arie mai restrânsă, dar pune accent pe fluxurile de bază ale unei ferme: parcele, activități, stocuri, utilaje, cereri și rapoarte. Comparativ cu John Deere Operations Center [4], aplicația nu este legată de un anumit producător de utilaje, ci tratează echipamentele într-un mod general. Față de Climate FieldView [5], AgroManager nu se concentrează doar pe date din câmp, ci include și module administrative.

Farmbrite [6] și xFarm [7] oferă platforme comerciale mai extinse, cu mai multe integrări și funcții economice. AgroManager rămâne mai simplă, dar acoperă un flux coerent pentru o fermă vegetală. În raport cu farmOS [9], aplicația este mai ghidată pe roluri, având interfețe distincte pentru manager, agronom și muncitor.

Prin această comparație, AgroManager poate fi poziționată ca o aplicație web integrată, potrivită pentru demonstrarea procesului de digitalizare a unei ferme. Punctul său forte este legătura dintre planificare, execuție și raportare, nu numărul foarte mare de integrări externe.

## 7.9. Avantaje, limitări și dezvoltări viitoare

Principalul avantaj al aplicației este faptul că reunește mai multe module într-un singur flux. O lucrare planificată de agronom ajunge la muncitor, este raportată după execuție, poate modifica stocurile și poate contribui la rapoarte. Un alt avantaj este separarea clară pe roluri, care face aplicația mai apropiată de organizarea reală a unei ferme.

Există și limitări. Aplicația este realizată ca proiect de licență, nu ca produs comercial matur. Unele zone pot fi extinse, precum testarea frontend, exportul rapoartelor, aplicația mobilă, integrarea cu senzori IoT sau analiza financiară avansată. Serviciile externe pentru meteo și NDVI trebuie tratate cu atenție, deoarece disponibilitatea lor poate influența precizia informațiilor afișate.

În ansamblu, AgroManager acoperă fluxul principal al unei ferme agricole: definirea fermei, administrarea resurselor, planificarea lucrărilor, execuția în teren, raportarea consumurilor și analiza rezultatelor. Prin aceste funcționalități, aplicația răspunde obiectivului lucrării, acela de a realiza o aplicație web pentru gestionarea activităților unei ferme agricole.

## Observații pentru copierea în Word

- Această variantă înlocuiește Capitolul 7 actual.
- Numărul de capturi scade de la 28 la 15, ceea ce economisește multe pagini.
- Capturile pot fi așezate la dimensiuni moderate, nu pe pagină întreagă.
- Dacă profesorul cere mai multe exemple vizuale, poți adăuga capturi suplimentare la rolurile manager și agronom, dar doar dacă lucrarea rămâne sub limita de pagini.
