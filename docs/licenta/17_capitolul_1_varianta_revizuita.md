# Capitolul 1. Analiza problemei

## 1.1. Contextul digitalizării activităților agricole

Agricultura este un domeniu în care deciziile se iau în condiții schimbătoare. Starea vremii, umiditatea solului, disponibilitatea utilajelor, nivelul stocurilor, personalul disponibil și evoluția culturilor pot modifica rapid planul unei zile de lucru. Într-o fermă administrată prin metode tradiționale, aceste informații ajung adesea în locuri diferite: caiete de evidență, fișiere separate, mesaje, apeluri telefonice sau simple observații reținute de persoanele implicate. Problema nu este doar lipsa digitalizării, ci fragmentarea datelor.

Digitalizarea agriculturii urmărește organizarea acestor informații într-un sistem coerent. Datele despre terenuri, lucrări, materiale, utilaje și rezultate devin mai utile atunci când sunt legate între ele. Organizația pentru Alimentație și Agricultură a Națiunilor Unite descrie e-Agriculture ca utilizare a tehnologiilor informației și comunicațiilor în agricultură și dezvoltare rurală [1]. În aceeași direcție, Comisia Europeană evidențiază rolul tehnologiilor digitale în creșterea eficienței și sustenabilității sectorului agricol [2].

Pentru o fermă vegetală, valoarea unui sistem informatic apare mai ales în fluxurile de zi cu zi. O lucrare agricolă nu este doar o sarcină bifată într-o listă. Ea are legătură cu parcela, cultura, muncitorii, utilajele, materialele folosite, perioada de execuție și rezultatul obținut. Dacă aceste elemente sunt păstrate într-o aplicație comună, managerul și agronomul pot înțelege mai ușor ce s-a întâmplat în teren, iar muncitorul primește sarcini mai clare.

AgroManager se înscrie în această direcție. Aplicația propune o platformă web pentru gestionarea activităților unei ferme agricole, cu roluri distincte și module conectate între ele. Managerul, agronomul, muncitorul și administratorul platformei lucrează în același sistem, dar fiecare are acces la operațiile potrivite responsabilității sale.

## 1.2. Probleme specifice gestionării unei ferme agricole

Administrarea unei ferme presupune urmărirea unui volum mare de informații care se modifică frecvent. O parcelă poate avea culturi diferite de la un an la altul. O lucrare planificată poate fi amânată din cauza vremii. Un material estimat pentru o activitate poate fi consumat într-o cantitate diferită. Un utilaj disponibil dimineața poate ajunge în mentenanță până la finalul zilei. Fără o evidență centralizată, aceste schimbări se observă târziu și pot produce întârzieri sau costuri suplimentare.

O dificultate importantă apare în evidența parcelelor. Parcela este unitatea de bază pentru planificarea lucrărilor agricole, pentru asocierea culturilor și pentru analiza producției. Dacă suprafața, cultura curentă, lucrările executate și istoricul producției sunt păstrate în documente separate, compararea rezultatelor devine greoaie. În timp, se pierde și trasabilitatea: nu mai este clar ce intervenții s-au făcut pe o parcelă și ce efect au avut.

Coordonarea lucrărilor agricole aduce o altă problemă. Activități precum semănatul, fertilizarea, erbicidarea, irigarea sau recoltarea au nevoie de personal, utilaje și materiale. Planul inițial nu coincide întotdeauna cu execuția. Muncitorul poate lucra mai multe ore decât s-a estimat, poate consuma altă cantitate de material sau poate observa în teren o situație care trebuie transmisă agronomului. De aceea, un sistem informatic trebuie să păstreze atât datele planificate, cât și datele reale raportate după execuție.

Magazia influențează direct desfășurarea lucrărilor. Semințele, îngrășămintele, tratamentele, combustibilul sau piesele trebuie să fie disponibile la momentul potrivit. Stocurile neactualizate pot duce fie la blocarea unei lucrări, fie la achiziții inutile. Pragurile minime, alertele de stoc și cererile de aprovizionare ajută la prevenirea acestor situații, mai ales atunci când agronomul și managerul folosesc aceeași evidență.

Utilajele au un rol la fel de important. Tractorul, combina, semănătoarea sau pulverizatorul nu pot fi privite doar ca simple resurse alocate unei lucrări. Ele au status, ore de funcționare, istoric de mentenanță și costuri asociate. O defecțiune apărută într-o perioadă aglomerată poate afecta mai multe activități, nu doar lucrarea curentă. Din acest motiv, evidența utilajelor trebuie conectată cu planificarea și cu raportarea execuției.

Comunicarea între roluri este adesea subestimată. Managerul urmărește imaginea de ansamblu, agronomul are nevoie de detalii tehnice, iar muncitorul are nevoie de instrucțiuni simple și clare. Dacă informațiile circulă informal, prin discuții sau mesaje separate, apar ușor neînțelegeri. O aplicație pe roluri reduce această problemă: fiecare utilizator vede ce are de făcut, iar acțiunile sale lasă urme în sistem.

În final, ferma are nevoie nu doar de evidență, ci și de analiză. Datele meteo, indicatorii NDVI, istoricul culturilor, rapoartele de producție, costurile cu materialele, costurile cu munca și subvențiile pot susține decizii mai bune. AgroManager pornește de la activitățile operative, dar le pune în legătură cu indicatori utili pentru management.

## 1.3. Sisteme existente și soluții similare

Pentru înțelegerea domeniului au fost analizate mai multe soluții existente, comerciale și gratuite. Scopul analizei nu este copierea acestor platforme, ci identificarea funcționalităților întâlnite frecvent în aplicațiile moderne de management agricol.

AGRIVI este o platformă comercială orientată spre managementul fermei, monitorizare, trasabilitate și decizii bazate pe date [3]. Soluția arată importanța corelării activităților agricole cu informații economice și operaționale.

John Deere Operations Center este o platformă online legată puternic de ecosistemul de utilaje John Deere. Aceasta pune accent pe datele colectate din teren, pe planificarea lucrărilor și pe monitorizarea operațiunilor [4]. Pentru AgroManager, această soluție este relevantă mai ales prin modul în care utilajele devin parte a fluxului digital.

Climate FieldView este orientată spre colectarea și analiza datelor din câmp, monitorizarea culturilor și sprijinirea deciziilor de producție [5]. Platforma confirmă rolul datelor agronomice și al observațiilor din teren în agricultură.

Farmbrite oferă module pentru activități, culturi, inventar, cheltuieli, vânzări și rapoarte [6]. Această direcție este apropiată de ideea unei aplicații integrate, în care datele operaționale și cele economice sunt tratate împreună.

xFarm include funcții pentru câmpuri, activități, utilaje, vreme, senzori și agricultură de precizie [7]. Platforma este relevantă pentru AgroManager prin folosirea hărții, a modulelor operaționale și a datelor externe.

Agworld se concentrează pe colaborarea dintre fermieri, agronomi, angajați și alți participanți la procesul agricol [8]. Această perspectivă susține alegerea de a organiza AgroManager în jurul unor roluri clare.

farmOS este o aplicație web open-source pentru managementul fermei, planificare și păstrarea evidențelor [9]. Prezența unei soluții deschise arată că domeniul nu este acoperit doar de produse comerciale, ci și de platforme care pot fi adaptate.

Comparativ cu aceste sisteme, AgroManager urmărește o variantă potrivită pentru o fermă vegetală gestionată printr-o aplicație web. Accentul este pus pe parcelă, lucrări agricole, muncitori, magazie, utilaje, mentenanță, notificări, rapoarte și date de suport precum vremea și NDVI.

## 1.4. Serviciile oferite de un sistem de management agricol

Un sistem de management agricol trebuie să acopere fluxurile principale ale fermei. Aceste servicii sunt utile separat, dar devin mult mai valoroase atunci când datele lor se întâlnesc în același sistem.

Administrarea parcelelor oferă baza pentru restul aplicației. Fiecare parcelă trebuie să aibă informații despre nume, cultură, suprafață și poziționare pe hartă. Harta interactivă ajută utilizatorul să înțeleagă distribuția terenurilor și să acceseze rapid detaliile unei zone.

Planificarea activităților agricole leagă parcela de munca efectivă. O activitate include tipul lucrării, perioada, muncitorii, utilajele și materialele estimate. După execuție, sistemul trebuie să păstreze datele reale: intervalul lucrat, observațiile din teren, cantitatea recoltată și consumurile raportate.

Managementul personalului și al rolurilor asigură separarea responsabilităților. Managerul administrează ferma, agronomul planifică lucrările, muncitorul execută sarcinile, iar administratorul platformei gestionează datele globale. Această separare este importantă atât pentru claritatea interfeței, cât și pentru securitate.

Magazia susține planificarea lucrărilor. Produsele trebuie să poată fi introduse, modificate, consultate și urmărite prin cantitate, categorie, unitate de măsură, preț și prag minim. Când materialele lipsesc sau scad sub un nivel critic, aplicația trebuie să semnaleze situația și să permită cereri de aprovizionare.

Utilajele și mentenanța formează un modul necesar pentru organizarea lucrărilor. Sistemul trebuie să păstreze statusul utilajelor, orele de funcționare, datele de identificare și intervențiile de service. Astfel, managerul poate evita planificarea unor lucrări cu utilaje indisponibile.

Notificările reduc dependența de comunicarea informală. Cererile de aprovizionare, stocurile minime și lucrările finalizate sunt evenimente care trebuie transmise rapid utilizatorilor interesați.

Datele externe completează imaginea fermei. Vremea ajută la alegerea momentului potrivit pentru lucrări, iar NDVI oferă o indicație asupra stării vegetației. Aceste date nu înlocuiesc decizia agronomului, dar oferă un punct de sprijin.

Raportarea transformă datele operaționale în informație managerială. Managerul poate urmări producția, costurile, veniturile, subvențiile și profitabilitatea, iar muncitorul poate consulta propriul payroll pe baza orelor raportate. În această formă, aplicația nu se limitează la evidență, ci sprijină controlul fermei.

## 1.5. Tipuri de utilizatori

Aplicația AgroManager este construită în jurul a patru roluri principale: `FARM_MANAGER`, `AGRONOMIST`, `WORKER` și `SUPER_ADMIN`. Fiecare rol corespunde unei poziții diferite în utilizarea aplicației.

Managerul fermei este responsabil de administrarea generală. El urmărește angajații, magazia, utilajele, cererile de aprovizionare, mentenanța, profilul fermei și rapoartele. Interfața sa trebuie să ofere control și sinteză.

Agronomul are rol tehnic. El lucrează cu parcele, hartă, planificarea activităților, istoricul culturilor, vremea, NDVI și cererile de aprovizionare. Pentru acest rol, aplicația trebuie să ofere instrumente de planificare, nu doar liste de date.

Muncitorul este utilizatorul orientat spre execuție. El vede taskurile atribuite, începe lucrări, finalizează lucrări și raportează datele reale din teren. Interfața lui trebuie să fie simplă, deoarece scopul principal este raportarea rapidă și corectă.

Administratorul platformei are rol global. El nu administrează o singură fermă, ci urmărește fermele, utilizatorii și entitățile principale ale sistemului la nivel de platformă. Acest rol este util pentru mentenanța aplicației și pentru control administrativ.

## 1.6. Operații realizate de fiecare tip de utilizator

Managerul actualizează datele fermei, gestionează angajații, consultă parcelele, administrează magazia, aprobă sau respinge cereri de aprovizionare, gestionează utilaje și mentenanță și analizează rapoarte. În plus, poate urmări payroll-ul angajaților și indicatorii financiari ai fermei.

Agronomul creează și urmărește activități agricole. El selectează parcela, muncitorii, utilajele și materialele planificate, apoi urmărește execuția. Poate consulta stocurile, însă administrarea magaziei rămâne la manager. Dacă apar necesități de aprovizionare, agronomul trimite cereri către manager.

Muncitorul lucrează cu activitățile primite. El marchează începerea lucrării și completează raportul de finalizare: perioada efectivă, comentarii, consumuri reale și recoltă, atunci când activitatea este de tip recoltare. Pe baza acestor date, sistemul actualizează stocurile, orele utilajelor și istoricul producției.

Administratorul platformei consultă statistici globale, gestionează ferme și utilizatori și poate interveni controlat asupra entităților importante din sistem. Operațiile sale sunt înregistrate în jurnalul de audit, pentru a păstra trasabilitatea modificărilor administrative.

## 1.7. Necesitatea aplicației AgroManager

Necesitatea aplicației rezultă din legătura strânsă dintre activitățile agricole și resursele fermei. O lucrare depinde de parcelă, cultură, vreme, muncitori, utilaje și materiale. Un raport financiar depinde de recoltă, costuri, salarii, mentenanță și subvenții. Dacă aceste date sunt păstrate separat, analiza devine lentă și predispusă la erori.

AgroManager propune centralizarea acestor informații într-o aplicație web. Managerul urmărește resursele și rezultatele, agronomul planifică lucrările, muncitorul raportează execuția, iar administratorul platformei asigură controlul global. Modulele de hartă, activități, magazie, utilaje, mentenanță, notificări, rapoarte, vreme și NDVI contribuie la o imagine mai clară asupra fermei.

Prin această abordare, aplicația urmărește să reducă evidențele fragmentate, să îmbunătățească comunicarea între roluri și să ofere date utile pentru decizii. Nu este doar un instrument de stocare a informațiilor, ci o platformă care le conectează.

## 1.8. Concluzii privind analiza problemei

Analiza problemei arată că managementul unei ferme agricole presupune coordonarea mai multor tipuri de informații: terenuri, activități, oameni, stocuri, utilaje, mentenanță, producție și costuri. Soluțiile existente confirmă direcția digitalizării și evidențiază importanța colaborării, a hărților, a datelor externe și a rapoartelor.

AgroManager se poziționează ca aplicație web pentru gestionarea integrată a unei ferme vegetale. Sistemul folosește roluri clare și module conectate, astfel încât datele introduse în fluxurile zilnice să poată fi folosite ulterior pentru monitorizare și analiză. Capitolul următor formulează cerințele aplicației pornind de la aceste nevoi.
