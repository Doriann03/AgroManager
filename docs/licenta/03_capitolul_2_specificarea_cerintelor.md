# Capitolul 2. Specificarea cerințelor

Capitolul de față prezintă cerințele aplicației AgroManager, pornind de la problemele identificate în etapa de analiză. Scopul acestui capitol este de a descrie clar ce oferă sistemul, ce operații realizează fiecare tip de utilizator și ce reguli trebuie respectate pentru funcționarea corectă a aplicației.

AgroManager este o aplicație web pentru gestionarea activităților unei ferme agricole. Sistemul centralizează informațiile despre fermă, parcele, angajați, activități agricole, magazie, cereri de aprovizionare, utilaje, mentenanță, producție, date meteo și indicatori NDVI. Aplicația este construită pe baza unor roluri distincte, astfel încât fiecare utilizator să aibă acces la funcționalitățile corespunzătoare responsabilităților sale.

Rolurile principale sunt `FARM_MANAGER`, `AGRONOMIST`, `WORKER` și `SUPER_ADMIN`. Managerul fermei administrează resursele și urmărește performanța generală, agronomul planifică activitățile agricole și monitorizează parcelele, muncitorul execută și raportează lucrările, iar administratorul platformei gestionează aplicația la nivel global. Această separare permite o organizare clară a fluxurilor de lucru și protejează datele prin limitarea accesului la operațiile necesare fiecărui rol.

Pentru o evidență mai ușoară, cerințele sunt grupate pe categorii și numerotate. Codurile de tip `CFG` desemnează cerințele funcționale generale, `CFM` cerințele pentru manager, `CFA` cerințele pentru agronom, `CFW` cerințele pentru muncitor, `CFS` cerințele pentru administratorul platformei, `CQS` cerințele privind calitatea și funcționarea sistemului, `SEC` cerințele de securitate, iar `RAP` cerințele de raportare și analiză.

## 2.1. Cerințe funcționale generale

`CFG-01. Înregistrarea fermei și a managerului.` Sistemul permite crearea unei ferme împreună cu utilizatorul care are rolul de manager. La înregistrare se introduc datele de bază ale contului și informațiile inițiale ale fermei, astfel încât utilizatorul să poată începe administrarea acesteia.

`CFG-02. Autentificarea utilizatorilor.` Sistemul permite autentificarea utilizatorilor prin nume de utilizator și parolă. După autentificare, aplicația identifică rolul utilizatorului și îl redirecționează către interfața corespunzătoare.

`CFG-03. Gestionarea sesiunii.` Sistemul păstrează sesiunea utilizatorului autentificat și permite deconectarea acestuia. La deconectare, datele sesiunii sunt eliminate, iar utilizatorul trebuie să se autentifice din nou pentru a accesa modulele interne.

`CFG-04. Controlul accesului pe roluri.` Sistemul oferă acces diferențiat pentru rolurile `FARM_MANAGER`, `AGRONOMIST`, `WORKER` și `SUPER_ADMIN`. Fiecare rol are propriile pagini, operații și restricții.

`CFG-05. Asocierea utilizatorilor cu ferma.` Sistemul asociază utilizatorii operaționali cu o fermă concretă. Managerul, agronomii și muncitorii lucrează cu datele fermei din care fac parte, ceea ce permite separarea informațiilor între ferme.

`CFG-06. Gestionarea parcelelor agricole.` Sistemul permite introducerea, vizualizarea și administrarea parcelelor. Pentru fiecare parcelă se păstrează informații precum numele, cultura, suprafața și coordonatele geografice.

`CFG-07. Hartă interactivă pentru parcele.` Sistemul afișează parcelele pe o hartă interactivă. Utilizatorii autorizați pot vizualiza delimitările terenurilor, pot selecta parcele și pot consulta informațiile asociate fiecărei zone.

`CFG-08. Calcularea și stocarea suprafeței parcelelor.` Sistemul permite calcularea suprafeței pe baza delimitării parcelei și stochează această valoare pentru utilizarea ei în rapoarte, activități și analize.

`CFG-09. Gestionarea activităților agricole.` Sistemul permite planificarea, urmărirea și finalizarea lucrărilor agricole. Activitățile sunt legate de parcele, muncitori, utilaje și consumuri de materiale.

`CFG-10. Atribuirea resurselor la activități.` Sistemul permite asocierea muncitorilor, utilajelor și materialelor consumabile cu o activitate. Astfel, fiecare lucrare are resursele necesare definite înainte de execuție.

`CFG-11. Gestionarea magaziei.` Sistemul permite evidența produselor din magazie, incluzând numele produsului, categoria, unitatea de măsură, cantitatea disponibilă, pragul minim și prețul unitar.

`CFG-12. Monitorizarea stocurilor.` Sistemul urmărește cantitățile disponibile și semnalează produsele care ajung sub pragul minim. Această funcționalitate ajută la evitarea situațiilor în care materialele necesare lipsesc în perioade importante.

`CFG-13. Cereri de aprovizionare.` Sistemul permite crearea, consultarea, aprobarea și respingerea cererilor de aprovizionare. Cererile sunt inițiate atunci când este nevoie de materiale suplimentare pentru activitățile agricole.

`CFG-14. Actualizarea stocurilor după aprovizionare.` Sistemul actualizează magazia atunci când o cerere de aprovizionare este aprobată. Cantitatea solicitată este adăugată produsului existent sau este creat un produs nou, după caz.

`CFG-15. Gestionarea utilajelor.` Sistemul permite administrarea utilajelor agricole. Pentru fiecare utilaj se păstrează informații despre nume, model, tip, număr de înmatriculare, status, ore totale de funcționare și interval de mentenanță.

`CFG-16. Gestionarea mentenanței.` Sistemul permite înregistrarea intervențiilor de mentenanță pentru utilaje. Pentru fiecare intervenție se păstrează data, descrierea, costul și orele de funcționare la momentul mentenanței.

`CFG-17. Notificări operaționale.` Sistemul generează notificări pentru evenimente importante, precum cereri de aprovizionare, decizii privind cererile, finalizarea lucrărilor și depășirea pragurilor minime de stoc.

`CFG-18. Istoric culturi.` Sistemul păstrează istoricul culturilor pentru fiecare parcelă. Acesta include informații despre cultura cultivată, perioada sezonului agricol și producția obținută.

`CFG-19. Date meteorologice.` Sistemul include un modul meteo care oferă informații utile pentru planificarea lucrărilor agricole. Aceste date ajută utilizatorii să ia decizii în funcție de condițiile din teren.

`CFG-20. Indicatori NDVI.` Sistemul include consultarea indicatorilor NDVI pentru parcele. Aceste informații ajută la monitorizarea stării vegetației și la identificarea zonelor care necesită atenție.

`CFG-21. Rapoarte și analiză.` Sistemul oferă rapoarte privind producția, activitățile, consumurile, stocurile, utilajele și performanța fermei. Rapoartele susțin deciziile manageriale și agronomice.

`CFG-22. Interfață web.` Sistemul este accesibil printr-un browser web și oferă interfețe adaptate fiecărui rol. Utilizatorul vede doar paginile și operațiile relevante pentru responsabilitățile sale.

## 2.2. Cerințe pentru rolul FARM_MANAGER

Rolul `FARM_MANAGER` este destinat utilizatorului care administrează ferma. Managerul are o perspectivă de ansamblu asupra activităților, angajaților, resurselor, producției și deciziilor administrative. Acesta folosește aplicația pentru control, monitorizare și analiză.

`CFM-01. Dashboard managerial.` Sistemul oferă managerului o pagină principală cu acces rapid la modulele importante ale fermei: profil fermă, angajați, hartă, magazie, utilaje, cereri, rapoarte și notificări.

`CFM-02. Administrarea profilului fermei.` Managerul poate vizualiza și actualiza datele fermei, precum adresa, datele de contact, descrierea, viziunea și obiectivele.

`CFM-03. Consultarea suprafeței totale.` Managerul poate vedea suprafața totală administrată de fermă, calculată pe baza parcelelor introduse în sistem.

`CFM-04. Gestionarea angajaților.` Managerul poate adăuga angajați și poate atribui acestora roluri operaționale, precum agronom sau muncitor. Lista angajaților permite urmărirea utilizatorilor asociați fermei.

`CFM-05. Controlul drepturilor interne.` Managerul stabilește structura operațională a fermei prin atribuirea rolurilor potrivite angajaților. Astfel, agronomii și muncitorii primesc acces doar la funcționalitățile necesare.

`CFM-06. Consultarea parcelelor.` Managerul poate vizualiza toate parcelele fermei, inclusiv cultura, suprafața și localizarea acestora pe hartă.

`CFM-07. Crearea parcelelor.` Managerul poate introduce parcele noi în sistem, completând datele necesare pentru evidența terenurilor.

`CFM-08. Utilizarea hărții.` Managerul poate consulta harta interactivă pentru a vedea distribuția terenurilor și pentru a selecta parcelele relevante.

`CFM-09. Consultarea activităților agricole.` Managerul poate urmări lucrările planificate, în desfășurare și finalizate. Această funcționalitate oferă o imagine clară asupra stadiului activităților fermei.

`CFM-10. Consultarea istoricului unei parcele.` Managerul poate vedea activitățile, culturile și producțiile asociate fiecărei parcele. Acest istoric ajută la evaluarea performanței terenului.

`CFM-11. Administrarea magaziei.` Managerul poate adăuga, modifica și șterge produse din magazie. Pentru fiecare produs se gestionează cantitatea, categoria, unitatea de măsură, pragul minim și prețul unitar.

`CFM-12. Stabilirea pragurilor minime.` Managerul poate defini cantitatea minimă necesară pentru fiecare produs. Atunci când stocul scade sub acest prag, sistemul generează o notificare.

`CFM-13. Gestionarea cererilor de aprovizionare.` Managerul poate analiza cererile de aprovizionare trimise de agronom și poate decide aprobarea sau respingerea acestora.

`CFM-14. Actualizarea magaziei prin aprovizionare.` La aprobarea unei cereri, sistemul actualizează stocul corespunzător. Astfel, fluxul dintre solicitare, decizie și aprovizionare este păstrat în aplicație.

`CFM-15. Administrarea utilajelor.` Managerul poate introduce, modifica și șterge utilaje. De asemenea, poate urmări starea acestora și numărul total de ore de funcționare.

`CFM-16. Administrarea mentenanței.` Managerul poate înregistra operații de mentenanță pentru utilaje, incluzând descrierea intervenției, costul și orele la care s-a realizat service-ul.

`CFM-17. Urmărirea disponibilității utilajelor.` Managerul poate vedea dacă un utilaj este disponibil, în lucru, în mentenanță sau defect. Această informație este importantă pentru planificarea lucrărilor.

`CFM-18. Consultarea notificărilor.` Managerul primește notificări pentru cereri noi, decizii operaționale, stocuri minime și activități finalizate. Notificările pot fi marcate ca citite.

`CFM-19. Jurnal managerial.` Managerul poate introduce note și decizii interne, utile pentru urmărirea activității administrative și pentru păstrarea unui istoric al deciziilor.

`CFM-20. Consultarea rapoartelor.` Managerul poate consulta rapoarte privind producția, consumurile, stocurile, activitățile, utilajele și indicatorii economici ai fermei.

`CFM-21. Analiza economică.` Managerul poate urmări costurile, veniturile, profitul, costul pe hectar, venitul pe hectar și profitul pe hectar. Această analiză transformă aplicația într-un instrument de sprijin decizional.

`CFM-22. Consultarea datelor externe.` Managerul poate utiliza datele meteo și indicatorii NDVI pentru a înțelege mai bine starea culturilor și impactul condițiilor externe asupra fermei.

## 2.3. Cerințe pentru rolul AGRONOMIST

Rolul `AGRONOMIST` este destinat utilizatorului care planifică și urmărește lucrările agricole. Agronomul are responsabilități tehnice și operaționale, fiind legătura dintre obiectivele manageriale și execuția lucrărilor în teren.

`CFA-01. Dashboard agronomic.` Sistemul oferă agronomului o pagină principală orientată spre activități, parcele, hartă, istoric culturi, vreme, NDVI și cereri de aprovizionare.

`CFA-02. Consultarea parcelelor.` Agronomul poate vedea parcelele fermei, cultura asociată, suprafața și localizarea pe hartă.

`CFA-03. Crearea parcelelor.` Agronomul poate introduce parcele noi, folosind informații descriptive și coordonate geografice.

`CFA-04. Modificarea parcelelor.` Agronomul poate actualiza datele unei parcele, precum cultura, suprafața sau coordonatele.

`CFA-05. Ștergerea parcelelor.` Agronomul poate elimina parcelele introduse eronat, cu respectarea regulilor de integritate ale sistemului.

`CFA-06. Utilizarea hărții interactive.` Agronomul poate delimita parcele, poate selecta zone de interes și poate consulta informațiile asociate terenurilor.

`CFA-07. Planificarea activităților agricole.` Agronomul poate crea activități agricole pentru parcele. Pentru fiecare activitate se introduc titlul, tipul lucrării, descrierea, perioada și resursele implicate.

`CFA-08. Alegerea muncitorilor.` Agronomul poate selecta muncitorii care execută o lucrare. Astfel, fiecare activitate are responsabili clari.

`CFA-09. Alegerea utilajelor.` Agronomul poate asocia utilaje unei activități, în funcție de tipul lucrării și de disponibilitatea echipamentelor.

`CFA-10. Estimarea consumurilor.` Agronomul poate defini materialele necesare pentru o activitate și cantitățile estimate. Aceste estimări sunt comparate ulterior cu raportările reale.

`CFA-11. Consultarea magaziei.` Agronomul poate vedea produsele disponibile în magazie, cantitățile existente și pragurile de stoc, fără a modifica direct inventarul.

`CFA-12. Crearea cererilor de aprovizionare.` Agronomul poate solicita materiale necesare activităților agricole prin cereri de aprovizionare trimise managerului.

`CFA-13. Urmărirea cererilor.` Agronomul poate vedea statusul cererilor sale: în așteptare, aprobate sau respinse. Decizia managerului este comunicată prin notificări.

`CFA-14. Consultarea istoricului culturilor.` Agronomul poate analiza culturile anterioare ale unei parcele și producția obținută în sezoanele precedente.

`CFA-15. Consultarea jurnalului de activități.` Agronomul poate vedea lucrările realizate pe o parcelă și poate urmări evoluția activităților de-a lungul sezonului agricol.

`CFA-16. Consultarea datelor meteo.` Agronomul poate utiliza informațiile meteorologice pentru planificarea lucrărilor. Date precum precipitațiile, temperatura și vântul ajută la alegerea momentului potrivit pentru activități.

`CFA-17. Consultarea indicatorilor NDVI.` Agronomul poate analiza valorile NDVI pentru parcele, identificând diferențe în starea vegetației și zone care necesită atenție.

`CFA-18. Monitorizarea utilajelor.` Agronomul poate vedea utilajele disponibile și statusul lor, pentru a planifica activitățile în mod realist.

`CFA-19. Primirea notificărilor.` Agronomul primește notificări privind cererile de aprovizionare, lucrările finalizate și alte evenimente relevante pentru activitatea sa.

`CFA-20. Analiza tehnică a lucrărilor.` Agronomul poate compara planificarea inițială cu execuția raportată de muncitori, folosind date despre consumuri reale, intervale de lucru și observații din teren.

## 2.4. Cerințe pentru rolul WORKER

Rolul `WORKER` este destinat utilizatorului care execută lucrările agricole în teren. Interfața muncitorului este orientată spre simplitate și rapiditate, deoarece acesta are nevoie să vadă sarcinile atribuite și să raporteze execuția lor.

`CFW-01. Dashboard pentru muncitor.` Sistemul afișează muncitorului o pagină principală cu activitățile care îi sunt atribuite.

`CFW-02. Vizualizarea taskurilor proprii.` Muncitorul vede doar lucrările la care este alocat. Acesta nu are acces la activitățile altor muncitori decât dacă îi sunt atribuite.

`CFW-03. Consultarea detaliilor activității.` Muncitorul poate vedea informațiile importante despre o lucrare: parcela, tipul activității, descrierea, perioada planificată, utilajele și materialele asociate.

`CFW-04. Începerea unei lucrări.` Muncitorul poate marca o activitate ca începută. Această acțiune actualizează statusul lucrării și permite urmărirea execuției.

`CFW-05. Finalizarea unei lucrări.` Muncitorul poate marca o activitate ca finalizată. La finalizare, sistemul solicită informațiile necesare pentru raportarea execuției.

`CFW-06. Raportarea intervalului de lucru.` Muncitorul poate introduce data și ora începerii, respectiv data și ora finalizării lucrării.

`CFW-07. Raportarea observațiilor din teren.` Muncitorul poate adăuga comentarii privind condițiile întâlnite, problemele observate sau alte detalii utile pentru agronom și manager.

`CFW-08. Raportarea cantității recoltate.` În cazul activităților de recoltare, muncitorul poate introduce cantitatea obținută. Această informație este folosită în istoricul culturilor și în rapoartele de producție.

`CFW-09. Raportarea consumurilor reale.` Muncitorul poate introduce materialele și cantitățile consumate efectiv în timpul lucrării. Aceste date sunt folosite pentru actualizarea magaziei și pentru analiza diferențelor față de consumurile estimate.

`CFW-10. Actualizarea automată a stocurilor.` După finalizarea lucrării, sistemul scade din magazie consumurile reale raportate.

`CFW-11. Actualizarea utilizării utilajelor.` Sistemul actualizează informațiile despre utilajele folosite, inclusiv orele de funcționare, pentru a susține evidența mentenanței.

`CFW-12. Consultarea istoricului propriu.` Muncitorul poate vedea lucrările executate anterior și detaliile raportate pentru fiecare activitate.

`CFW-13. Raportarea defecțiunilor utilajelor.` Muncitorul poate semnala probleme tehnice observate la utilaje. Această informație ajută managerul să planifice intervențiile de service.

`CFW-14. Limitarea accesului la date administrative.` Muncitorul nu poate modifica parcele, angajați, stocuri, utilaje sau cereri de aprovizionare. Rolul său este limitat la execuția și raportarea activităților atribuite.

## 2.5. Cerințe pentru rolul SUPER_ADMIN

Rolul `SUPER_ADMIN` reprezintă administratorul global al platformei. Acesta nu este asociat unei singure ferme, ci gestionează aplicația la nivel general. Rolul este necesar pentru administrarea fermelor și utilizatorilor din platformă, pentru monitorizarea funcționării sistemului și pentru intervenții administrative care depășesc nivelul unui manager de fermă.

**Dashboard global.** Sistemul oferă administratorului o pagină separată de dashboard-urile fermelor, destinată administrării platformei. Această interfață centralizează informațiile importante despre utilizatori, ferme și starea generală a aplicației.

**Vizualizarea fermelor înregistrate.** Administratorul poate consulta fermele existente în sistem și informațiile generale asociate acestora. Această funcționalitate permite verificarea entităților active din platformă și urmărirea modului în care este utilizată aplicația.

**Vizualizarea utilizatorilor.** Administratorul poate vedea utilizatorii înregistrați, rolurile acestora și ferma de care aparțin. Prin această funcționalitate, sistemul oferă o evidență clară a conturilor și a responsabilităților atribuite.

**Administrarea conturilor.** Administratorul poate gestiona conturile utilizatorilor, inclusiv activarea, dezactivarea sau corectarea acestora. Această operație este importantă pentru menținerea controlului asupra accesului la platformă.

**Monitorizarea platformei.** Administratorul poate consulta informații sintetice despre utilizarea aplicației și despre starea generală a sistemului. Aceste date ajută la identificarea eventualelor probleme administrative și la menținerea unei funcționări coerente.

**Gestionarea fermelor.** Administratorul poate urmări fermele înregistrate și poate interveni în situații administrative care nu pot fi rezolvate de managerul unei singure ferme. Această funcționalitate susține utilizarea aplicației de către mai multe ferme.

**Izolarea datelor fermelor.** Sistemul păstrează datele fermelor separate, chiar dacă administratorul are vizibilitate globală asupra platformei. Această separare protejează informațiile operaționale ale fiecărei ferme.

**Administrarea controlată a modulelor globale.** Administratorul are acces la funcții globale, însă modificările asupra datelor operaționale ale unei ferme sunt realizate doar în contexte justificate. Astfel, rolul de administrator rămâne orientat spre controlul platformei, nu spre intervenția curentă în activitatea agricolă.

## 2.6. Cerințe privind calitatea și funcționarea sistemului

Pe lângă funcționalitățile propriu-zise, aplicația trebuie să funcționeze coerent, să fie ușor de utilizat și să ofere o structură clară pentru toate rolurile implicate. Aceste cerințe descriu modul în care sistemul se comportă în utilizare și contribuie la calitatea produsului software.

**Interfață clară și consecventă.** Sistemul oferă o interfață organizată, cu meniuri și pagini adaptate rolului autentificat. Utilizatorii pot identifica rapid operațiile disponibile și pot naviga între module fără confuzie.

**Utilizare eficientă pentru operațiile frecvente.** Operațiile uzuale, precum autentificarea, consultarea taskurilor, crearea unei activități sau raportarea unei lucrări, sunt realizate prin pași simpli și ușor de urmărit. Această cerință este importantă mai ales pentru muncitori, care au nevoie de o interfață rapidă și directă.

**Răspuns rapid la operațiile curente.** Sistemul răspunde într-un timp rezonabil la operații de listare, creare, modificare și consultare a datelor. Utilizatorul trebuie să poată lucra fără întârzieri vizibile în fluxurile obișnuite.

**Organizare modulară.** Aplicația este organizată pe module funcționale, precum autentificare, fermă, parcele, activități, magazie, utilaje, mentenanță, notificări, NDVI și vreme. Această organizare face aplicația mai ușor de întreținut și de înțeles.

**Separarea frontend-backend.** Sistemul folosește o arhitectură client-server. Frontend-ul React comunică prin API-uri REST cu backend-ul Spring Boot, iar datele sunt persistate în MySQL. Separarea componentelor permite dezvoltarea independentă a interfeței și a logicii de business.

**Persistența datelor.** Datele introduse de utilizatori sunt salvate într-o bază de date relațională, pentru a fi disponibile între sesiuni și pentru a putea fi utilizate în rapoarte. Această cerință asigură continuitatea activității și păstrarea istoricului fermei.

**Integritatea datelor.** Sistemul validează datele introduse și previne salvarea unor valori incorecte, precum suprafețe invalide, cantități negative, produse fără nume sau activități fără parcelă. Prin această regulă, aplicația păstrează coerența informațiilor utilizate în decizii.

**Tratarea erorilor.** Sistemul afișează mesaje clare atunci când o operație nu poate fi realizată, de exemplu din cauza datelor lipsă, a valorilor invalide sau a accesului nepermis. Utilizatorul primește feedback suficient pentru a înțelege problema și pentru a corecta datele introduse.

**Trasabilitatea activităților.** Sistemul păstrează informații despre lucrări, statusuri, consumuri, cereri, mentenanță și notificări, astfel încât evoluția operațiilor să poată fi urmărită. Trasabilitatea este esențială pentru analiza ulterioară a activității fermei.

**Extensibilitate.** Aplicația este construită astfel încât să permită adăugarea de module noi, precum analiză financiară avansată, subvenții APIA, chat intern, raportări suplimentare sau integrarea unor servicii externe noi. Această cerință susține dezvoltarea aplicației pe termen lung.

## 2.7. Cerințe de securitate și protecție a datelor

Aplicația AgroManager gestionează date care trebuie protejate: conturi de utilizator, parole, date de contact, informații despre angajați, parcele, stocuri, utilaje, producție și activități. Din acest motiv, sistemul include mecanisme de securitate pentru autentificare, autorizare, validarea datelor și separarea informațiilor pe ferme.

**Acces doar pentru utilizatori autentificați.** Modulele interne ale aplicației sunt accesibile doar utilizatorilor autentificați. Persoanele neautentificate pot accesa doar paginile publice, precum pagina principală, autentificarea și înregistrarea.

**Stocarea securizată a parolelor.** Parolele sunt stocate în formă criptată printr-un mecanism de hashing adecvat, astfel încât parola în clar să nu fie păstrată în baza de date. Această abordare reduce riscul expunerii datelor sensibile.

**Autorizare pe roluri.** Sistemul verifică rolul utilizatorului înainte de accesarea paginilor și operațiilor protejate. Managerul, agronomul, muncitorul și administratorul platformei au drepturi diferite, în funcție de responsabilitățile lor.

**Protejarea rutelor din frontend.** Interfața web redirecționează utilizatorii care încearcă să acceseze pagini nepermise rolului lor. Această protecție îmbunătățește experiența utilizatorului și previne navigarea accidentală către zone neautorizate.

**Protejarea endpoint-urilor din backend.** Backend-ul verifică drepturile utilizatorului la nivelul API-urilor, astfel încât accesul neautorizat să fie respins chiar dacă o cerere este trimisă direct către server. Această verificare reprezintă o protecție esențială, deoarece securitatea nu trebuie să depindă doar de interfața frontend.

**Izolarea datelor pe fermă.** Utilizatorii unei ferme accesează doar datele asociate acelei ferme. Această regulă protejează informațiile în cazul folosirii platformei de mai multe ferme și previne amestecarea datelor operaționale.

**Validarea datelor de intrare.** Sistemul validează datele primite de la utilizatori înainte de salvarea lor în baza de date. Validarea reduce riscul introducerii unor informații incomplete, incorecte sau incompatibile cu regulile aplicației.

**Prevenirea valorilor invalide.** Sistemul respinge cantitățile negative, suprafețele invalide, produsele fără nume, activitățile fără parcelă și activitățile fără muncitori alocați. Aceste verificări susțin integritatea datelor și corectitudinea rapoartelor.

**Controlul sesiunii.** Sistemul permite deconectarea utilizatorului și eliminarea datelor de sesiune. După deconectare, utilizatorul trebuie să se autentifice din nou pentru a accesa modulele interne.

**Limitarea comunicării cu frontend-ul.** Sistemul acceptă cereri doar din originile configurate pentru aplicația frontend. Această regulă contribuie la controlul comunicării dintre client și server.

**Mesaje de eroare sigure.** Sistemul tratează erorile fără a expune detalii interne sensibile către utilizator. Mesajele afișate sunt orientate spre explicarea problemei, fără a dezvălui informații tehnice care ar putea fi exploatate.

**Protecția datelor personale.** Datele personale ale utilizatorilor sunt folosite doar pentru administrarea fermei și pentru funcționarea aplicației. Accesul la aceste date este limitat în funcție de rol și de contextul operațional.

**Principiul privilegiului minim.** Fiecare rol primește acces doar la funcționalitățile necesare. Managerul are acces administrativ la ferma sa, agronomul la planificare și monitorizare, muncitorul la execuție, iar administratorul la funcții globale.

**Evidența evenimentelor importante.** Sistemul păstrează informații despre operații relevante, precum activități finalizate, cereri aprobate, consumuri raportate și notificări generate. Această evidență contribuie la trasabilitatea activităților și la verificarea fluxurilor de lucru.

## 2.8. Cerințe de raportare și analiză

AgroManager nu se limitează la introducerea și stocarea datelor. Sistemul transformă informațiile operaționale în rapoarte și indicatori care susțin deciziile manageriale și agronomice. Prin aceste funcționalități, aplicația poate fi utilizată ca instrument de analiză a fermei, nu doar ca sistem de evidență.

**Raport de producție.** Sistemul afișează producția obținută pe parcele, culturi și ani agricoli. Acest raport ajută la evaluarea performanței terenurilor și la compararea rezultatelor între sezoane.

**Istoric culturi.** Sistemul permite consultarea culturilor cultivate pe fiecare parcelă de-a lungul timpului, împreună cu rezultatele obținute. Această informație este importantă pentru rotația culturilor și pentru analiza randamentului.

**Raport al activităților.** Sistemul permite consultarea lucrărilor planificate, în desfășurare și finalizate, cu detalii despre parcelă, muncitori, utilaje și status. Managerul și agronomul pot urmări astfel evoluția lucrărilor agricole.

**Raport al consumurilor.** Sistemul permite compararea consumurilor estimate cu cele reale, pentru a evidenția diferențele dintre planificare și execuție. Acest raport ajută la identificarea abaterilor și la îmbunătățirea estimărilor viitoare.

**Raport de stocuri.** Sistemul evidențiază produsele disponibile, produsele cu stoc redus și materialele folosite frecvent în activitățile agricole. Aceste informații ajută managerul să planifice aprovizionarea.

**Raport de mentenanță.** Sistemul permite consultarea intervențiilor de mentenanță pentru fiecare utilaj, împreună cu data, descrierea, costul și orele de funcționare. Această evidență contribuie la prevenirea defecțiunilor și la planificarea service-ului.

**Analiza NDVI.** Sistemul afișează indicatorii NDVI pentru parcele și permite interpretarea stării vegetației. Aceste date oferă agronomului un sprijin suplimentar pentru monitorizarea culturilor.

**Analiză meteo pentru lucrări.** Sistemul folosește datele meteorologice pentru a sprijini planificarea activităților agricole. Informațiile despre precipitații, temperatură sau vânt ajută la alegerea momentului potrivit pentru lucrări.

**Analiză economică.** Sistemul calculează costuri, venituri, profit, cost pe hectar, venit pe hectar și profit pe hectar. Acești indicatori oferă managerului o imagine clară asupra rentabilității fermei.

**Evidența notificărilor operaționale.** Sistemul evidențiază evenimentele care necesită atenție, precum stocuri minime, cereri de aprovizionare, lucrări finalizate sau probleme raportate. Notificările ajută utilizatorii să reacționeze rapid la situațiile importante.

**Analiza performanței pe parcelă.** Sistemul permite compararea parcelelor în funcție de producție, consumuri, costuri și profitabilitate. Această analiză ajută la identificarea terenurilor cu randament ridicat sau scăzut.

**Analiza performanței pe cultură.** Sistemul permite compararea culturilor în funcție de producție, costuri, venituri și profit. Rezultatele obținute pot fi folosite pentru planificarea sezoanelor agricole următoare.

## 2.9. Concluzii privind specificarea cerințelor

Specificarea cerințelor stabilește comportamentul aplicației AgroManager și modul în care aceasta răspunde nevoilor unei ferme agricole. Sistemul oferă funcționalități pentru gestionarea parcelelor, planificarea lucrărilor, administrarea stocurilor, gestionarea utilajelor, urmărirea mentenanței, raportarea activităților, analiza producției și monitorizarea culturilor prin date meteo și NDVI.

Managerul, agronomul, muncitorul și administratorul platformei au responsabilități distincte, iar aplicația oferă fiecăruia interfața și operațiile necesare. Prin separarea rolurilor, validarea datelor, protecția accesului și centralizarea informațiilor, AgroManager susține trecerea de la evidențe fragmentate la un sistem digital integrat.

Prin cerințele de raportare și analiză, sistemul devine un instrument util pentru luarea deciziilor. Datele introduse în timpul activităților agricole sunt valorificate în rapoarte privind producția, consumurile, stocurile, utilajele, indicatorii NDVI și performanța economică. Astfel, aplicația contribuie la transformarea activităților zilnice ale fermei în informații utile pentru management.

Pe baza acestor cerințe, capitolul următor va prezenta proiectarea sistemului, incluzând arhitectura generală, diagramele UML relevante, proiectarea bazei de date și proiectarea interfeței utilizator.
