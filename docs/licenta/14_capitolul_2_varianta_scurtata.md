# Capitolul 2. Specificarea cerințelor

Acest capitol prezintă cerințele aplicației AgroManager. Cerințele sunt formulate pornind de la analiza problemei și descriu ce trebuie să permită sistemul, ce operații sunt disponibile pentru fiecare rol și ce reguli trebuie respectate pentru funcționarea corectă a aplicației.

AgroManager este o aplicație web pentru gestionarea activităților unei ferme agricole. Sistemul centralizează informații despre fermă, parcele, utilizatori, activități, magazie, cereri de aprovizionare, utilaje, mentenanță, rapoarte, date meteo și indicatori NDVI. Accesul la aceste funcționalități este diferențiat prin rolurile `FARM_MANAGER`, `AGRONOMIST`, `WORKER` și `SUPER_ADMIN`.

## 2.1. Cerințe funcționale generale

Sistemul permite înregistrarea unei ferme împreună cu primul cont de manager. La înregistrare sunt introduse datele contului și informațiile de bază ale fermei, astfel încât utilizatorul să poată începe administrarea acesteia. După crearea contului, utilizatorii se pot autentifica prin nume de utilizator și parolă, iar aplicația îi redirecționează către interfața corespunzătoare rolului.

Sistemul permite gestionarea sesiunii utilizatorului autentificat. Datele necesare pentru sesiune sunt păstrate pe durata utilizării aplicației, iar la logout utilizatorul trebuie să se autentifice din nou pentru a accesa modulele interne. Accesul la pagini și operații este controlat pe roluri, astfel încât fiecare utilizator să poată realiza doar acțiunile potrivite responsabilității sale.

Sistemul permite asocierea utilizatorilor operaționali cu o fermă concretă. Managerul, agronomii și muncitorii lucrează cu datele fermei din care fac parte. Această regulă este necesară pentru separarea informațiilor în cazul în care platforma este folosită de mai multe ferme.

Sistemul permite introducerea, modificarea, vizualizarea și ștergerea parcelelor agricole. Pentru fiecare parcelă sunt păstrate informații precum numele, cultura, suprafața și coordonatele geografice. Parcelele sunt afișate pe o hartă interactivă, iar suprafața poate fi calculată pe baza delimitării desenate de utilizator.

Sistemul permite planificarea și urmărirea activităților agricole. O activitate este asociată cu o parcelă, cu muncitori, utilaje și materiale consumabile. Pe parcursul execuției, activitatea poate trece prin mai multe stări, de la planificată la în desfășurare și finalizată.

Sistemul permite gestionarea magaziei. Pentru produse sunt păstrate denumirea, categoria, unitatea de măsură, cantitatea disponibilă, pragul minim și prețul unitar. Sistemul semnalează produsele cu stoc redus și poate actualiza cantitățile după aprovizionare sau după consumurile raportate la finalizarea unei lucrări.

Sistemul permite crearea, consultarea, aprobarea și respingerea cererilor de aprovizionare. Cererile sunt inițiate atunci când materialele necesare unei lucrări nu sunt suficiente. În cazul aprobării unei cereri, magazia este actualizată.

Sistemul permite gestionarea utilajelor și a mentenanței. Pentru fiecare utilaj sunt salvate informații despre tip, model, status, număr de înmatriculare, ore de funcționare și intervenții de service. Aceste date ajută la planificarea lucrărilor și la urmărirea stării echipamentelor.

Sistemul permite generarea notificărilor operaționale. Notificările sunt create pentru evenimente importante, precum cereri noi, decizii asupra cererilor, lucrări finalizate, stocuri minime sau probleme care necesită atenție.

Sistemul permite consultarea istoricului culturilor, a datelor meteo și a indicatorilor NDVI. Aceste informații ajută la urmărirea evoluției parcelelor și la planificarea lucrărilor agricole.

Sistemul permite realizarea de rapoarte privind producția, consumurile, stocurile, activitățile, utilajele și indicatorii economici ai fermei. Rapoartele trebuie să sprijine deciziile manageriale și agronomice, nu doar să afișeze date brute.

## 2.2. Cerințe pentru rolul FARM_MANAGER

Rolul `FARM_MANAGER` este destinat utilizatorului care administrează ferma. Managerul are nevoie de o imagine de ansamblu asupra resurselor, angajaților, lucrărilor, stocurilor și rezultatelor economice.

Sistemul oferă managerului un dashboard cu acces rapid la modulele importante: profil fermă, angajați, hartă, magazie, utilaje, cereri, rapoarte și notificări. Managerul poate vizualiza și actualiza datele fermei, inclusiv adresa, datele de contact, descrierea, obiectivele și suprafața totală administrată.

Managerul poate gestiona angajații fermei. Acesta poate adăuga utilizatori cu rol de agronom sau muncitor și poate urmări conturile asociate fermei. Prin această funcționalitate, managerul stabilește structura operațională a fermei.

Managerul poate vizualiza parcelele fermei și le poate consulta pe hartă. Pentru fiecare parcelă poate urmări cultura, suprafața, localizarea, istoricul lucrărilor și istoricul culturilor. De asemenea, managerul poate introduce parcele noi atunci când este necesară actualizarea evidenței terenurilor.

Managerul poate administra magazia. Acesta poate adăuga, modifica sau șterge produse, poate stabili praguri minime și poate urmări produsele cu stoc redus. Managerul poate analiza cererile de aprovizionare trimise de agronom și poate decide aprobarea sau respingerea lor.

Managerul poate administra utilajele și intervențiile de mentenanță. Pentru fiecare utilaj poate urmări statusul, orele de funcționare și istoricul service-ului. Această funcționalitate ajută la evitarea planificării unor lucrări cu utilaje indisponibile.

Managerul primește notificări pentru evenimente relevante: cereri de aprovizionare, stocuri minime, lucrări finalizate sau actualizări importante. Acesta poate consulta rapoarte privind producția, consumurile, costurile, veniturile, profitul și indicatorii pe hectar.

## 2.3. Cerințe pentru rolul AGRONOMIST

Rolul `AGRONOMIST` este destinat utilizatorului care planifică și urmărește lucrările agricole. Agronomul are o perspectivă tehnică asupra fermei și folosește aplicația pentru organizarea activităților pe parcele.

Sistemul oferă agronomului acces la dashboard, hartă, parcele, activități, istoric culturi, date meteo, NDVI, magazie în regim de consultare și cereri de aprovizionare. Agronomul poate vizualiza parcelele, poate consulta detaliile acestora și poate folosi harta pentru planificarea lucrărilor.

Agronomul poate crea, modifica și urmări activități agricole. Pentru fiecare activitate poate selecta parcela, tipul lucrării, perioada, muncitorii, utilajele și materialele estimate. Activitatea creată ajunge ulterior în interfața muncitorilor alocați.

Agronomul poate consulta magazia pentru a verifica disponibilitatea materialelor, dar nu administrează direct stocurile. Dacă materialele nu sunt suficiente, acesta poate crea o cerere de aprovizionare către manager și poate urmări statusul acesteia.

Agronomul poate consulta istoricul culturilor și istoricul activităților pentru fiecare parcelă. Aceste informații sunt utile pentru rotația culturilor, analiza lucrărilor anterioare și planificarea sezonului următor.

Agronomul poate utiliza date meteo și indicatori NDVI pentru a susține deciziile de planificare. Datele meteo ajută la alegerea momentului potrivit pentru lucrări, iar NDVI oferă o indicație asupra stării vegetației.

## 2.4. Cerințe pentru rolul WORKER

Rolul `WORKER` este destinat utilizatorului care execută lucrările agricole. Interfața muncitorului trebuie să fie simplă, deoarece acesta are nevoie de acces rapid la sarcinile atribuite și la formularul de raportare.

Sistemul permite muncitorului să vadă doar activitățile la care este alocat. Pentru fiecare activitate sunt afișate detalii precum parcela, tipul lucrării, perioada planificată, utilajele și materialele asociate.

Muncitorul poate marca o lucrare ca începută. Această acțiune schimbă statusul activității și permite urmărirea execuției. După finalizare, muncitorul completează informații despre intervalul de lucru, observațiile din teren, consumurile reale și cantitatea recoltată, dacă activitatea este de tip recoltare.

Sistemul folosește datele raportate de muncitor pentru actualizarea stocurilor, a istoricului activităților, a producției și a orelor de funcționare ale utilajelor. Muncitorul poate consulta și istoricul propriilor lucrări, dar nu poate modifica date administrative precum angajați, stocuri, parcele sau utilaje.

## 2.5. Cerințe pentru rolul SUPER_ADMIN

Rolul `SUPER_ADMIN` este destinat administrării globale a platformei. Acesta nu este asociat unei singure ferme și nu trebuie confundat cu managerul unei ferme. Managerul controlează datele propriei ferme, în timp ce administratorul platformei gestionează sistemul la nivel general.

Sistemul oferă administratorului un dashboard global, separat de dashboard-urile fermelor. Administratorul poate vizualiza fermele înregistrate, utilizatorii existenți, rolurile acestora și starea generală a platformei.

Administratorul poate realiza operații CRUD controlate pe entitățile importante ale sistemului: ferme, utilizatori, parcele, activități, produse din magazie, cereri de aprovizionare, utilaje, mentenanță și sezoane de cultură. Aceste operații sunt realizate prin interfețe ale aplicației, nu prin modificarea directă a bazei de date.

Pentru date sensibile sau tehnice, accesul administratorului este limitat. Parolele nu sunt afișate, token-urile sau datele de sesiune nu sunt editate manual, iar logurile sunt consultate, nu modificate. Pentru conturi, administratorul poate folosi operații controlate, precum activarea, dezactivarea sau resetarea accesului.

Sistemul păstrează separarea logică a datelor fermelor. Chiar dacă administratorul are vizibilitate globală, modificările asupra datelor operaționale trebuie făcute în contexte justificate și cu respectarea regulilor de validare.

## 2.6. Cerințe privind calitatea și funcționarea sistemului

Aplicația trebuie să ofere o interfață clară și consecventă. Utilizatorii trebuie să identifice rapid operațiile disponibile și să navigheze între module fără confuzie. Interfața trebuie adaptată rolului autentificat, astfel încât muncitorul să nu fie încărcat cu module administrative, iar managerul să aibă acces rapid la zonele de control.

Sistemul trebuie să răspundă într-un timp rezonabil la operațiile curente: autentificare, listare, creare, modificare, filtrare și consultare a rapoartelor. Datele trebuie persistate în baza de date, astfel încât informațiile fermei să fie disponibile între sesiuni.

Sistemul trebuie să păstreze integritatea datelor. Nu trebuie salvate valori invalide, precum cantități negative, suprafețe incorecte, activități fără parcelă sau activități fără muncitori. Erorile trebuie afișate prin mesaje clare, astfel încât utilizatorul să înțeleagă ce trebuie corectat.

Aplicația trebuie să fie modulară și extensibilă. Module precum fermă, parcele, activități, magazie, utilaje, mentenanță, notificări, meteo și NDVI trebuie să poată fi dezvoltate și întreținute separat.

## 2.7. Cerințe de securitate și protecție a datelor

Modulele interne ale aplicației trebuie să fie accesibile doar utilizatorilor autentificați. Persoanele neautentificate pot accesa doar paginile publice: pagina principală, autentificarea și înregistrarea.

Parolele trebuie stocate în formă securizată, prin hashing, astfel încât parola în clar să nu fie păstrată în baza de date. Accesul la pagini și endpoint-uri trebuie verificat pe baza rolului utilizatorului.

Datele fermelor trebuie izolate logic. Utilizatorii unei ferme nu trebuie să poată accesa sau modifica datele unei alte ferme. Această regulă este aplicată pentru parcele, activități, stocuri, utilaje, cereri și rapoarte.

Datele de intrare trebuie validate înainte de salvare. Sistemul trebuie să respingă valori incomplete sau incorecte și să evite expunerea informațiilor sensibile în răspunsurile API. Evenimentele importante trebuie păstrate suficient pentru trasabilitate și verificare.

## 2.8. Cerințe de raportare și analiză

Sistemul trebuie să permită realizarea de rapoarte privind producția, activitățile, consumurile, stocurile, utilajele și mentenanța. Rapoartele trebuie să folosească datele introduse în fluxurile operaționale, nu valori separate introduse manual.

Managerul trebuie să poată analiza producția, costurile materialelor, veniturile, profitul și indicatorii pe hectar. Agronomul trebuie să poată consulta istoricul culturilor, lucrările executate și indicatorii NDVI pentru parcele.

Sistemul trebuie să evidențieze notificări și situații care necesită atenție: stocuri minime, cereri de aprovizionare, lucrări finalizate sau probleme semnalate. Aceste informații ajută utilizatorii să reacționeze rapid la evenimente importante.

## 2.9. Concluzii privind specificarea cerințelor

Cerințele prezentate definesc comportamentul aplicației AgroManager și modul în care aceasta răspunde nevoilor unei ferme agricole. Sistemul trebuie să permită gestionarea parcelelor, planificarea lucrărilor, raportarea execuției, administrarea stocurilor, utilajelor și cererilor, precum și analiza rezultatelor.

Prin separarea rolurilor, aplicația oferă fiecărui utilizator operațiile necesare: managerul administrează, agronomul planifică, muncitorul execută, iar administratorul platformei gestionează sistemul la nivel global. Pe baza acestor cerințe, capitolul următor prezintă proiectarea sistemului.

## Observații pentru copierea în Word

- Această variantă păstrează structura profesorului: cerințe generale, cerințe pe roluri, calitate, securitate și raportare.
- Textul este mai compact și evită repetarea continuă a formulei „Sistemul permite...”.
- Nu folosește tabele, ca să se copieze mai ușor în Word și să nu creeze rânduri foarte înalte.
- Dacă vrei o variantă și mai scurtă, se poate reduce 2.1 prin comasarea meteo, NDVI, notificări și rapoarte într-un singur paragraf.
