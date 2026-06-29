# Capitolul 4. Implementarea sistemului

Acest capitol prezintă modul în care proiectarea aplicației AgroManager a fost transpusă într-un produs software funcțional. Sunt descrise tehnologiile utilizate, organizarea aplicației, câteva fragmente de cod relevante și detaliile de rulare în mediul de dezvoltare.

Aplicația are o arhitectură web de tip client-server. Backend-ul este dezvoltat în Java cu Spring Boot, frontend-ul este realizat în React, iar datele sunt persistate într-o bază de date MySQL. Comunicarea dintre client și server se face prin API-uri REST. Separarea acestor componente a fost aleasă pentru ca interfața, logica de business și nivelul de date să poată fi dezvoltate și întreținute independent.

## 4.1. Alegerea limbajelor și tehnologiilor

Pentru backend a fost ales limbajul Java împreună cu framework-ul Spring Boot. Java este potrivit pentru aplicații server-side, iar Spring Boot simplifică dezvoltarea prin configurare automată, integrare cu Spring MVC, Spring Data JPA, Spring Security și mecanisme de validare [10], [11]. În AgroManager, backend-ul expune endpoint-uri REST, verifică drepturile utilizatorilor, aplică regulile de business și comunică cu baza de date.

Spring Security a fost utilizat pentru autentificare și autorizare [12]. Această alegere este importantă deoarece aplicația lucrează cu roluri diferite: `FARM_MANAGER`, `AGRONOMIST`, `WORKER` și `SUPER_ADMIN`. Fiecare rol are acces la pagini și operații diferite, iar această regulă trebuie aplicată atât în frontend, cât și în backend.

Pentru persistența datelor a fost folosit MySQL, deoarece datele aplicației au o structură relațională: ferme, utilizatori, parcele, activități, stocuri, utilaje, cereri și notificări [15]. Accesul la baza de date este realizat prin Spring Data JPA, care mapează clasele Java la tabelele relaționale.

Frontend-ul este dezvoltat în React, cu Vite ca mediu de dezvoltare și build [13], [14]. React a fost ales deoarece permite împărțirea interfeței în componente reutilizabile, iar această abordare se potrivește cu structura aplicației pe roluri. Pentru navigare este utilizat React Router, iar pentru cererile HTTP către backend este utilizat Axios.

Pentru hartă sunt utilizate Leaflet, React Leaflet, Geoman și Turf.js. Leaflet afișează harta, Geoman permite desenarea parcelelor, iar Turf.js este folosit pentru calcularea suprafeței [16], [17]. Pentru date externe, aplicația integrează Open-Meteo pentru informații meteorologice și Sentinel Hub pentru indicatori NDVI [18], [19].

## 4.2. Implementarea backend-ului

Backend-ul este organizat pe pachete cu responsabilități clare. Pachetul `controller` expune endpoint-urile REST, `service` conține logica aplicației, `repository` oferă acces la baza de date, `model` conține entitățile JPA, iar `model.dto` conține obiectele folosite pentru transferul și validarea datelor.

Această organizare este folosită în toate modulele principale. De exemplu, pentru activități agricole, controller-ul primește cererea din frontend, serviciul verifică regulile aplicației, repository-ul citește sau salvează datele, iar entitățile JPA sunt persistate în MySQL. În acest fel, logica importantă nu rămâne în controller, ci este concentrată în service-uri.

Configurarea bazei de date este realizată în `application.properties`. În mediul local, backend-ul rulează pe portul `8081`, iar schema MySQL utilizată este `agromanager_db`. Opțiunea `ddl-auto=update` este utilă în dezvoltare, deoarece permite sincronizarea tabelelor cu entitățile JPA.

## 4.3. Implementarea frontend-ului

Frontend-ul este organizat în pagini și componente React. Rutele publice includ pagina principală, autentificarea și înregistrarea. Rutele interne sunt protejate și sunt afișate în funcție de rolul utilizatorului autentificat.

Un fragment relevant este componenta `ProtectedRoute`, care verifică dacă utilizatorul există în sesiunea locală și dacă rolul său permite accesul la pagina cerută:

```jsx
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const roleRoutes = {
      SUPER_ADMIN: '/super-admin',
      FARM_MANAGER: '/manager',
      AGRONOMIST: '/agronomist',
      WORKER: '/worker'
    };
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
  }

  return children;
};
```

Acest cod nu înlocuiește securitatea din backend, dar îmbunătățește experiența utilizatorului. Un muncitor nu vede paginile managerului, iar un agronom este redirecționat către interfața sa. Verificarea finală a drepturilor rămâne totuși în backend, deoarece cererile HTTP pot fi trimise și în afara interfeței.

## 4.4. Implementarea autentificării și autorizării

Autentificarea este realizată cu Spring Security. Utilizatorul trimite numele de utilizator și parola, backend-ul validează datele, apoi returnează informațiile necesare pentru interfață: identificatorul utilizatorului, numele, rolul și ferma asociată.

Autorizarea este aplicată în două locuri. În frontend, rutele sunt filtrate în funcție de rol. În backend, endpoint-urile sunt protejate prin reguli de securitate și prin verificări în service-uri. Această a doua verificare este esențială, deoarece protecția interfeței poate fi ocolită prin apeluri directe către API.

Parolele nu sunt salvate în clar. Aplicația folosește `BCryptPasswordEncoder`, astfel încât în baza de date să fie păstrat doar hash-ul parolei. Această alegere reduce riscul expunerii parolelor în cazul accesului neautorizat la baza de date.

## 4.5. Implementarea modulelor funcționale

Modulul de fermă permite managerului să consulte și să actualizeze datele fermei. Tot aici sunt gestionate notele manageriale și angajații asociați fermei. Utilizatorii operaționali sunt creați cu roluri specifice, precum agronom sau muncitor.

Modulul de parcele permite reprezentarea terenurilor agricole pe hartă. Utilizatorul poate desena o parcelă, iar coordonatele sunt salvate pentru utilizare ulterioară. Suprafața este calculată cu Turf.js, pe baza geometriei desenate.

Modulul de activități leagă planificarea agronomului de execuția muncitorului. La crearea unei activități, backend-ul verifică faptul că parcela și muncitorii selectați aparțin aceleiași ferme. Verificarea previne asocierea unor resurse din altă fermă:

```java
Parcel parcel = parcelRepository.findById(dto.getParcelId())
        .orElseThrow(() -> new RuntimeException("Parcela nu a fost gasita"));

if (!parcel.getFarm().getId().equals(userFarmId)) {
    throw new RuntimeException("Parcela nu apartine fermei curente.");
}

List<User> workers = userRepository.findAllById(dto.getAssignedWorkerIds());
for (User worker : workers) {
    if (worker.getFarm() == null ||
        !worker.getFarm().getId().equals(userFarmId)) {
        throw new RuntimeException("Muncitor invalid pentru aceasta ferma.");
    }
}
```

La finalizarea unei lucrări, muncitorul raportează orele, comentariile, consumurile reale și, dacă este cazul, cantitatea recoltată. Aceste date sunt folosite pentru actualizarea stocurilor, a istoricului culturilor, a orelor de funcționare ale utilajelor și a rapoartelor.

Magazia permite managerului să urmărească produsele disponibile. Pentru fiecare produs se salvează categoria, unitatea de măsură, cantitatea, pragul minim și prețul unitar. Dacă o activitate finalizată consumă materiale, stocul este scăzut automat. Dacă un produs ajunge sub pragul minim, sistemul generează o notificare.

Cererea de aprovizionare este fluxul prin care agronomul solicită materiale, iar managerul aprobă sau respinge solicitarea. În cazul aprobării, cantitatea este adăugată în magazie. Astfel, cererea nu rămâne doar o înregistrare administrativă, ci produce efect asupra stocurilor.

Modulul de utilaje și mentenanță păstrează informații despre echipamentele fermei: tip, model, status, ore de funcționare și intervenții de service. Aceste date sunt folosite la planificarea lucrărilor și la urmărirea întreținerii utilajelor.

Rapoartele folosesc informațiile introduse în activități, stocuri și sezoane de cultură. Managerul poate consulta indicatori precum producția totală, costurile materialelor, veniturile, profitul și profitul pe hectar. În acest fel, aplicația transformă datele operaționale în informații utile pentru decizie.

## 4.6. Integrarea serviciilor externe

AgroManager integrează două surse externe de date: Open-Meteo și Sentinel Hub. Modulul meteo oferă informații utile pentru planificarea lucrărilor, în special în cazul activităților influențate de temperatură, precipitații sau vânt.

Pentru NDVI, aplicația folosește coordonatele parcelei și solicită date satelitare prin Sentinel Hub. Rezultatul este salvat în istoricul NDVI al parcelei. Dacă datele externe nu sunt disponibile, sistemul poate folosi valori estimate sau salvate anterior, astfel încât interfața să rămână funcțională.

Credențialele pentru Sentinel Hub sunt citite din variabile de mediu:

```properties
sentinel-hub.client-id=${SENTINEL_HUB_CLIENT_ID:}
sentinel-hub.client-secret=${SENTINEL_HUB_CLIENT_SECRET:}
```

Această soluție evită includerea cheilor de acces direct în codul sursă și permite configurarea diferită a aplicației în funcție de mediul de rulare.

## 4.7. Validarea datelor și tratarea erorilor

Validarea este realizată atât în frontend, cât și în backend. Frontend-ul ajută utilizatorul să completeze corect formularele, iar backend-ul verifică datele înainte de salvare. Sunt respinse valori precum suprafețe invalide, cantități negative, activități fără parcelă sau activități fără muncitori.

Această dublă validare este necesară deoarece datele sunt folosite în mai multe module. O cantitate greșită poate afecta stocurile, rapoartele și istoricul unei activități. Din acest motiv, backend-ul rămâne punctul principal de control.

Erorile sunt tratate prin mesaje clare pentru utilizator. Dacă o parcelă nu aparține fermei curente sau dacă un muncitor nu este alocat lucrării, sistemul oprește operația și explică problema.

## 4.8. Detalii de infrastructură și rulare

În mediul de dezvoltare, aplicația este rulată local. Backend-ul Spring Boot rulează pe portul `8081`, frontend-ul React/Vite pe portul `5173`, iar baza de date MySQL rulează local cu schema `agromanager_db`.

Backend-ul este gestionat cu Maven, iar frontend-ul cu npm. Pentru rularea aplicației se pornesc separat serverul Spring Boot, serverul Vite și baza de date MySQL. În varianta curentă nu este folosit Docker și nu există un pipeline CI/CD dedicat.

Pe viitor, aplicația poate fi containerizată prin Docker, folosind servicii separate pentru backend, frontend și baza de date. O astfel de abordare ar face rularea mai ușoară pe alte calculatoare sau într-un mediu cloud.

## 4.9. Concluzii privind implementarea sistemului

Implementarea aplicației AgroManager respectă arhitectura proiectată anterior. Backend-ul Spring Boot gestionează API-urile, securitatea, logica de business și persistența datelor. Frontend-ul React oferă interfețe adaptate rolurilor, iar MySQL păstrează datele fermei.

Modulele implementate acoperă fluxurile principale ale unei ferme agricole: parcele, activități, muncitori, stocuri, cereri de aprovizionare, utilaje, mentenanță, notificări, rapoarte, meteo și NDVI. Prin aceste componente, aplicația susține atât activitatea zilnică din fermă, cât și analiza rezultatelor obținute.

## Observații pentru copierea în Word

- Această variantă păstrează structura cerută de profesor: tehnologii, cod explicat și infrastructură.
- Numărul de fragmente de cod este redus, pentru a economisi spațiu.
- Codul rămas este ales pentru că arată părți reprezentative: protecția rutelor, verificarea apartenenței la fermă și configurarea serviciului extern.
- Dacă vrei să mai reduci 1-2 pagini, poți elimina fragmentul `ProtectedRoute` sau codul cu variabilele Sentinel Hub și să păstrezi doar explicația în text.
