# Capitolul 2. Specificarea cerințelor

Acest capitol prezintă cerințele aplicației AgroManager, formulate în funcție de rolurile utilizatorilor. Scopul capitolului este de a arăta ce funcționalități oferă sistemul și ce operații poate realiza fiecare tip de utilizator.

AgroManager este o aplicație web pentru gestionarea activităților unei ferme agricole. Sistemul centralizează informații despre fermă, angajați, parcele, activități agricole, magazie, cereri de aprovizionare, utilaje, mentenanță, notificări, istoric culturi, producție, subvenții, payroll, date meteo și indicatori NDVI. Accesul la aceste funcționalități este diferențiat prin rolurile `FARM_MANAGER`, `AGRONOMIST`, `WORKER` și `SUPER_ADMIN`.

## 2.1. Cerințe funcționale generale

La nivel general, aplicația va permite:

- înregistrarea unei ferme împreună cu primul cont de manager;
- autentificarea utilizatorilor pe bază de nume de utilizator și parolă;
- redirecționarea utilizatorului autentificat către interfața corespunzătoare rolului său;
- separarea accesului pe rolurile `FARM_MANAGER`, `AGRONOMIST`, `WORKER` și `SUPER_ADMIN`;
- asocierea utilizatorilor operaționali cu o fermă concretă;
- păstrarea separată a datelor pentru fiecare fermă;
- consultarea modulelor aplicației în funcție de drepturile utilizatorului autentificat;
- afișarea notificărilor pentru evenimente importante;
- utilizarea unei hărți interactive pentru vizualizarea parcelelor;
- păstrarea istoricului lucrărilor agricole;
- actualizarea datelor operaționale în funcție de acțiunile realizate de utilizatori;
- generarea de rapoarte pe baza datelor introduse în aplicație.

## 2.2. Cerințe pentru rolul FARM_MANAGER

Rolul `FARM_MANAGER` este destinat utilizatorului care administrează ferma. Acesta are acces la funcționalități de control, monitorizare și analiză.

Pentru rolul `FARM_MANAGER`, aplicația va permite:

- vizualizarea dashboard-ului managerial;
- consultarea unei imagini generale asupra fermei;
- actualizarea profilului fermei;
- completarea datelor despre adresă, contact, descriere, viziune și obiective;
- consultarea suprafeței totale administrate;
- gestionarea angajaților fermei;
- adăugarea utilizatorilor cu rol de agronom sau muncitor;
- modificarea datelor angajaților;
- stabilirea tarifului orar pentru muncitori;
- stabilirea salariului lunar pentru agronomi;
- consultarea parcelelor fermei;
- vizualizarea parcelelor pe hartă;
- introducerea de parcele noi în sistem;
- urmărirea culturii și suprafeței fiecărei parcele;
- consultarea istoricului activităților asociate parcelelor;
- administrarea produselor din magazie;
- adăugarea produselor în stoc;
- modificarea cantităților, categoriilor, unităților de măsură și prețurilor;
- ștergerea produselor care nu mai sunt necesare;
- definirea pragurilor minime de stoc;
- consultarea produselor cu stoc redus;
- analizarea cererilor de aprovizionare trimise de agronom;
- aprobarea cererilor de aprovizionare;
- respingerea cererilor de aprovizionare;
- actualizarea stocului în urma unei cereri aprobate;
- administrarea utilajelor fermei;
- adăugarea utilajelor în evidența fermei;
- modificarea datelor despre utilaje;
- ștergerea utilajelor care nu mai sunt folosite;
- urmărirea statusului utilajelor;
- urmărirea orelor de funcționare ale utilajelor;
- înregistrarea intervențiilor de mentenanță;
- consultarea istoricului de mentenanță;
- primirea notificărilor despre evenimente importante;
- consultarea notificărilor privind stocurile minime;
- consultarea notificărilor privind lucrările finalizate;
- consultarea notificărilor privind cererile de aprovizionare;
- generarea rapoartelor de producție;
- analizarea costurilor cu materialele;
- analizarea costurilor cu munca muncitorilor;
- analizarea salariilor agronomilor;
- analizarea costurilor de mentenanță;
- gestionarea subvențiilor asociate parcelelor;
- includerea subvențiilor în analiza financiară;
- consultarea veniturilor, cheltuielilor și profitului;
- consultarea indicatorilor calculați pe hectar;
- consultarea payroll-ului angajaților pentru o perioadă aleasă.

## 2.3. Cerințe pentru rolul AGRONOMIST

Rolul `AGRONOMIST` este destinat utilizatorului care planifică și urmărește lucrările agricole. Acesta folosește aplicația pentru organizarea activităților din teren și pentru consultarea datelor agronomice.

Pentru rolul `AGRONOMIST`, aplicația va permite:

- vizualizarea dashboard-ului agronomic;
- consultarea parcelelor fermei;
- vizualizarea parcelelor pe hartă;
- folosirea hărții pentru alegerea parcelei pe care se planifică o lucrare;
- consultarea detaliilor despre cultură și suprafață;
- crearea de activități agricole;
- alegerea tipului de lucrare agricolă;
- asocierea activității cu o parcelă;
- stabilirea perioadei planificate pentru lucrare;
- selectarea muncitorilor responsabili;
- selectarea utilajelor necesare;
- selectarea materialelor estimate pentru consum;
- urmărirea activităților planificate;
- consultarea statusului lucrărilor;
- consultarea lucrărilor aflate în desfășurare;
- consultarea lucrărilor finalizate;
- consultarea comentariilor raportate de muncitori;
- consultarea consumurilor reale raportate la finalizarea lucrărilor;
- consultarea cantității recoltate pentru activitățile de recoltare;
- consultarea istoricului culturilor;
- urmărirea evoluției culturilor pe parcele;
- consultarea istoricului activităților agricole;
- consultarea magaziei în regim read-only;
- verificarea disponibilității materialelor înainte de planificarea lucrărilor;
- crearea cererilor de aprovizionare;
- completarea produsului solicitat, cantității, unității de măsură și priorității;
- urmărirea statusului cererilor de aprovizionare;
- consultarea utilajelor în regim read-only;
- verificarea disponibilității utilajelor înainte de planificarea unei lucrări;
- consultarea datelor meteo;
- folosirea informațiilor meteo pentru planificarea lucrărilor;
- consultarea indicatorilor NDVI pentru parcele;
- folosirea indicatorilor NDVI pentru observarea stării vegetației;
- primirea notificărilor despre cereri, lucrări sau alte evenimente relevante.

## 2.4. Cerințe pentru rolul WORKER

Rolul `WORKER` este destinat utilizatorului care execută lucrările agricole. Interfața acestuia este orientată spre taskuri, acțiuni rapide și raportarea datelor reale din teren.

Pentru rolul `WORKER`, aplicația va permite:

- vizualizarea dashboard-ului de muncitor;
- consultarea activităților atribuite;
- vizualizarea detaliilor unei lucrări;
- consultarea parcelei pe care trebuie executată lucrarea;
- consultarea tipului de activitate;
- consultarea perioadei planificate;
- consultarea utilajelor asociate lucrării;
- consultarea materialelor planificate pentru consum;
- marcarea unei lucrări ca începută;
- schimbarea statusului activității în „în desfășurare”;
- completarea formularului de finalizare a lucrării;
- introducerea datei și orei de început;
- introducerea datei și orei de final;
- raportarea comentariilor din teren;
- raportarea consumurilor reale pentru materialele planificate;
- raportarea cantității recoltate pentru lucrările de recoltare;
- finalizarea activității;
- actualizarea automată a stocurilor pe baza consumurilor raportate;
- actualizarea orelor de funcționare ale utilajelor folosite;
- actualizarea istoricului de producție în cazul lucrărilor de recoltare;
- consultarea istoricului propriilor activități;
- consultarea lucrărilor finalizate anterior;
- consultarea propriului payroll;
- vizualizarea orelor lucrate într-o perioadă;
- vizualizarea plății estimate pe baza tarifului orar.

Muncitorul nu va avea acces la operații administrative precum gestionarea fermei, modificarea angajaților, administrarea magaziei, modificarea parcelelor sau gestionarea utilajelor. Această limitare este necesară pentru protecția datelor și pentru păstrarea unei interfețe simple.

## 2.5. Cerințe pentru rolul SUPER_ADMIN

Rolul `SUPER_ADMIN` este destinat administrării globale a platformei. Acesta nu lucrează în interiorul unei singure ferme, ci are acces la datele generale ale sistemului. Spre deosebire de manager, care gestionează o fermă concretă, administratorul platformei intervine la nivel de platformă, utilizatori și entități principale.

Pentru rolul `SUPER_ADMIN`, aplicația va permite:

- vizualizarea dashboard-ului global al platformei;
- vizualizarea statisticilor generale despre ferme, utilizatori și roluri;
- realizarea operațiilor de administrare asupra fermelor înregistrate;
- realizarea operațiilor de administrare asupra conturilor de utilizator;
- modificarea rolurilor și a asocierii utilizatorilor cu fermele;
- realizarea operațiilor CRUD controlate pe entitățile importante ale aplicației;
- administrarea datelor despre parcele, activități, produse din magazie, cereri de aprovizionare, utilaje, mentenanță și sezoane de cultură;
- corectarea sau ștergerea unor înregistrări, atunci când datele introduse sunt greșite sau nu mai sunt necesare;
- folosirea interfeței aplicației pentru aceste operații, fără modificarea directă a bazei de date;
- vizualizarea jurnalului de audit pentru acțiunile administrative importante.

Administratorul platformei nu are acces la parole în clar și nu modifică manual date tehnice sensibile, precum token-uri sau informații interne de sesiune. Operațiile sale sunt realizate prin interfața aplicației, pe baza unor acțiuni controlate.

## 2.6. Concluzii privind specificarea cerințelor

Cerințele aplicației AgroManager sunt organizate în jurul rolurilor principale ale sistemului. Managerul administrează ferma, agronomul planifică lucrările, muncitorul execută activitățile, iar administratorul platformei gestionează sistemul la nivel global.

Această separare permite o interfață mai clară pentru fiecare utilizator și limitează accesul la operațiile necesare rolului său. Datele introduse de utilizatori sunt reutilizate în mai multe module: activități, magazie, utilaje, mentenanță, notificări, istoric, payroll și rapoarte financiare. Pe baza acestor cerințe se poate trece la proiectarea sistemului, unde sunt descrise arhitectura aplicației, baza de date, diagramele UML și interfețele utilizator.

## Observații pentru copierea în Word

Această variantă este gândită să înlocuiască variantele anterioare ale Capitolului 2. Structura este mai apropiată de exemplul dat de profesor, deoarece prezintă direct ce poate face fiecare rol.

Pentru Word, se recomandă folosirea listelor cu bullets normale, fără tabele. Textul va ocupa mai puțin spațiu decât paragrafele lungi și va evita repetițiile de tipul „Sistemul permite...” sau „Managerul poate...”.
