# Capitolul 4. Implementarea sistemului

Capitolul de față prezintă implementarea aplicației AgroManager, tehnologiile utilizate și modul în care proiectarea descrisă anterior a fost transpusă într-un produs software funcțional. Implementarea urmărește separarea clară între interfața utilizator, logica de business și persistența datelor, folosind o arhitectură web de tip client-server.

Aplicația este alcătuită dintr-un backend dezvoltat în Java cu Spring Boot, un frontend dezvoltat în React și o bază de date MySQL. Comunicarea dintre frontend și backend se realizează prin API-uri REST, iar accesul la funcționalități este controlat prin autentificare, sesiuni și roluri. Pe lângă modulele interne, aplicația integrează servicii externe pentru date meteorologice și pentru indicatori NDVI.

## 4.1. Alegerea limbajelor și tehnologiilor

Pentru dezvoltarea backend-ului a fost ales limbajul Java, utilizat împreună cu framework-ul Spring Boot. Java oferă un mediu matur pentru aplicații server-side, iar Spring Boot simplifică dezvoltarea aplicațiilor web prin configurare automată, integrare cu Spring MVC, Spring Security, Spring Data JPA și mecanisme standardizate pentru validare și testare [10], [11]. În cadrul aplicației AgroManager, backend-ul expune API-uri REST, aplică regulile de securitate, gestionează tranzacțiile și realizează comunicarea cu baza de date.

Spring Security a fost utilizat pentru autentificare și autorizare. Această tehnologie permite protejarea endpoint-urilor, definirea regulilor de acces și integrarea utilizatorilor aplicației cu mecanismele de securitate Spring [12]. În AgroManager, rolurile `FARM_MANAGER`, `AGRONOMIST`, `WORKER` și `SUPER_ADMIN` sunt folosite pentru separarea responsabilităților.

Pentru persistența datelor a fost utilizată baza de date MySQL. Alegerea acesteia este justificată de structura relațională a datelor aplicației: ferme, utilizatori, parcele, activități, stocuri, utilaje, cereri, notificări și rapoarte. MySQL este potrivită pentru reprezentarea relațiilor dintre entități și pentru interogări asupra datelor operaționale [15]. Accesul la baza de date este realizat prin Spring Data JPA, care permite maparea claselor Java la tabele relaționale.

Frontend-ul este dezvoltat în React, o bibliotecă JavaScript pentru construirea interfețelor utilizator pe bază de componente [13]. React a fost ales deoarece permite organizarea interfeței în pagini și componente reutilizabile, adaptate rolurilor aplicației. Pentru configurarea și rularea frontend-ului este utilizat Vite, care oferă un mediu rapid de dezvoltare și build pentru aplicații moderne [14].

Pentru navigarea între pagini este utilizat React Router, iar pentru comunicarea HTTP cu backend-ul este utilizat Axios. Aceste biblioteci permit definirea rutelor publice și protejate, redirecționarea utilizatorilor în funcție de rol și trimiterea cererilor către API-ul Spring Boot.

Pentru componenta cartografică sunt utilizate Leaflet, React Leaflet, Geoman și Turf.js. Leaflet asigură afișarea hărții interactive [16], Geoman permite desenarea și editarea poligoanelor, iar Turf.js este utilizat pentru calcule geospațiale, precum determinarea suprafeței unei parcele [17].

Pentru integrarea datelor externe sunt utilizate Sentinel Hub și Open-Meteo. Sentinel Hub este folosit pentru obținerea indicatorilor NDVI pe baza datelor satelitare [18], iar Open-Meteo este utilizat pentru date meteorologice relevante în planificarea lucrărilor agricole [19].

## 4.2. Implementarea backend-ului

Backend-ul aplicației este organizat în pachete cu responsabilități clare: `controller`, `service`, `repository`, `model`, `model.dto` și `config`. Această organizare urmează arhitectura pe niveluri și permite separarea dintre expunerea API-urilor, logica de business, persistența datelor și configurarea aplicației.

Pachetul `controller` conține clasele care expun endpoint-uri REST. Aceste clase primesc cererile de la frontend, extrag utilizatorul curent și apelează serviciile corespunzătoare. De exemplu, `ActivityController` expune endpoint-uri pentru listarea activităților, crearea activităților și actualizarea statusului unei lucrări.

Pachetul `service` conține logica principală a aplicației. Aici sunt implementate regulile de business, verificările de apartenență la fermă, actualizarea stocurilor, generarea notificărilor, sincronizarea recoltelor și integrarea cu servicii externe. De exemplu, `ActivityService` gestionează fluxul unei lucrări agricole de la planificare până la finalizare.

Pachetul `repository` conține interfețe Spring Data JPA care permit accesul la baza de date. Acestea oferă operații standard de tip CRUD și metode personalizate pentru căutări specifice, cum ar fi activitățile unei ferme, cererile de aprovizionare sau notificările unui utilizator.

Pachetul `model` conține entitățile JPA, precum `Farm`, `User`, `Parcel`, `Activity`, `InventoryItem`, `Machinery`, `CropSeason` și `Notification`. Aceste clase sunt mapate la tabelele bazei de date prin adnotări JPA. Pachetul `model.dto` conține obiecte de transfer utilizate pentru validarea și transportul datelor între frontend și backend.

Configurarea conexiunii cu baza de date este realizată în `application.properties`. Aplicația folosește MySQL, portul backend-ului este `8081`, iar Hibernate este configurat pentru actualizarea automată a schemei în mediul de dezvoltare.

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/agromanager_db?createDatabaseIfNotExist=true&serverTimezone=Europe/Bucharest
spring.datasource.username=root
spring.datasource.password=root
server.port=8081
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

Această configurare permite rularea aplicației în mediul local de dezvoltare. Parametrul `createDatabaseIfNotExist=true` creează baza de date dacă aceasta nu există, iar `ddl-auto=update` permite sincronizarea structurii tabelelor cu entitățile JPA în timpul dezvoltării.

## 4.3. Implementarea frontend-ului

Frontend-ul aplicației este implementat în React și este organizat în componente. Fișierul `App.jsx` definește rutele publice și rutele protejate. Rutele publice includ pagina principală, autentificarea și înregistrarea. Rutele protejate sunt accesibile doar utilizatorilor autentificați și sunt filtrate în funcție de rol.

Componenta `ProtectedRoute` verifică existența utilizatorului în stocarea locală și rolul acestuia. Dacă utilizatorul nu este autentificat, acesta este redirecționat către pagina de autentificare. Dacă utilizatorul încearcă să acceseze o rută nepermisă rolului său, acesta este redirecționat către dashboard-ul propriu.

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

Interfața este împărțită pe roluri. Managerul are acces la dashboard managerial, profil fermă, angajați, magazie, utilaje și rapoarte. Agronomul are acces la hartă, activități, istoric culturi, vreme, NDVI și cereri de aprovizionare. Muncitorul are o interfață orientată spre taskurile proprii. Administratorul platformei are un dashboard separat pentru funcții globale.

Pentru comunicarea cu backend-ul este utilizat un client Axios configurat centralizat. Acesta permite trimiterea cererilor către API-ul Spring Boot și păstrarea unei structuri uniforme pentru apelurile HTTP. Astfel, componentele React nu trebuie să gestioneze direct detaliile conexiunii cu serverul.

## 4.4. Implementarea autentificării și autorizării

Autentificarea este realizată prin Spring Security. Utilizatorul trimite numele de utilizator și parola către endpoint-ul de autentificare, iar backend-ul validează datele prin `AuthenticationManager`. După autentificare, contextul de securitate este salvat în sesiune, iar frontend-ul primește informații despre utilizator, rol și ferma asociată.

Autorizarea se realizează în două niveluri. Primul nivel este frontend-ul, unde rutele sunt protejate în funcție de rol. Al doilea nivel este backend-ul, unde endpoint-urile sunt protejate prin adnotări precum `@PreAuthorize`. Această dublă protecție este importantă deoarece un utilizator ar putea încerca să trimită cereri direct către API, fără să folosească interfața.

Un fragment relevant din configurația de securitate este următorul:

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(AbstractHttpConfigurer::disable)
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .anyRequest().authenticated()
        )
        .sessionManagement(session ->
            session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
        .formLogin(AbstractHttpConfigurer::disable)
        .httpBasic(AbstractHttpConfigurer::disable);

    return http.build();
}
```

Prin această configurare, endpoint-urile din `/api/auth/**` sunt publice, iar restul cererilor necesită autentificare. Configurarea CORS permite comunicarea dintre frontend și backend în mediul de dezvoltare, iar parolele sunt criptate cu `BCryptPasswordEncoder`.

## 4.5. Implementarea modulelor funcționale

Modulul de gestiune a fermei permite managerului să consulte și să actualizeze datele fermei. Tot în acest modul sunt gestionate notele manageriale și angajații. Angajații sunt creați cu roluri operaționale, precum agronom sau muncitor, și sunt asociați fermei curente.

Modulul de parcele permite introducerea și vizualizarea terenurilor agricole. Parcelele sunt reprezentate pe hartă prin poligoane, iar coordonatele sunt stocate în format JSON. În frontend, utilizatorul poate desena parcela pe hartă, iar suprafața este calculată cu ajutorul bibliotecii Turf.js.

Modulul de activități este unul dintre cele mai importante module ale aplicației. Agronomul creează activități agricole pentru parcele, selectează muncitori, utilaje și materiale consumabile. La crearea activității, backend-ul verifică faptul că toate resursele aparțin aceleiași ferme. Această verificare previne asocierea accidentală a unor date din altă fermă.

```java
Parcel parcel = parcelRepository.findById(dto.getParcelId())
        .orElseThrow(() -> new RuntimeException("Parcela nu a fost gasita"));

if (!parcel.getFarm().getId().equals(userFarmId)) {
    throw new RuntimeException("Parcela nu apartine fermei curente.");
}

List<User> workers = userRepository.findAllById(dto.getAssignedWorkerIds());
for (User worker : workers) {
    if (worker.getFarm() == null || !worker.getFarm().getId().equals(userFarmId)) {
        throw new RuntimeException("Un muncitor selectat nu apartine fermei curente.");
    }
}
```

La finalizarea unei activități, muncitorul raportează intervalul de lucru, comentariile, cantitatea recoltată și consumurile reale. Backend-ul actualizează statusul activității, scade produsele din magazie, actualizează orele utilajelor, sincronizează producția în istoricul culturii și generează notificări.

```java
if (status == ActivityStatus.COMPLETED) {
    applyActualConsumptions(activity, actualConsumptions, currentUser);
    deductInventoryForCompletedActivity(activity);
}

if (status == ActivityStatus.COMPLETED
        && activity.getStartDate() != null
        && activity.getEndDate() != null) {
    long durationHours = Duration
            .between(activity.getStartDate(), activity.getEndDate())
            .toHours();
    activity.getMachineries().forEach(m -> {
        int currentHours = m.getTotalHours() != null ? m.getTotalHours() : 0;
        m.setTotalHours(currentHours + (int) durationHours);
        machineryRepository.save(m);
    });
}
```

Modulul de magazie permite managerului să administreze produsele disponibile. Produsele au categorie, unitate de măsură, cantitate, prag minim și preț unitar. La finalizarea activităților, consumurile reale sunt scăzute automat din stoc. Dacă produsul scade sub pragul minim, sistemul generează o notificare pentru manager.

Modulul de cereri de aprovizionare permite agronomului să solicite materiale necesare lucrărilor. Managerul aprobă sau respinge cererile. Dacă o cerere este aprobată, sistemul actualizează automat magazia, fie prin creșterea cantității unui produs existent, fie prin crearea unui produs nou.

```java
if (status == RequestStatus.APPROVED) {
    inventoryItemRepository
        .findByFarmIdAndNameIgnoreCase(request.getFarm().getId(), request.getItemName())
        .ifPresentOrElse(item -> {
            double current = item.getQuantityAvailable() != null
                    ? item.getQuantityAvailable() : 0;
            item.setQuantityAvailable(current + request.getQuantityRequested());
            inventoryItemRepository.save(item);
        }, () -> {
            InventoryItem newItem = new InventoryItem();
            newItem.setName(request.getItemName());
            newItem.setCategory(request.getItemCategory());
            newItem.setUnitOfMeasure(request.getUnitOfMeasure());
            newItem.setQuantityAvailable(request.getQuantityRequested());
            newItem.setFarm(request.getFarm());
            inventoryItemRepository.save(newItem);
        });
}
```

Modulul de utilaje și mentenanță permite managerului să gestioneze utilajele fermei. Pentru fiecare utilaj se păstrează tipul, statusul, modelul, numărul de înmatriculare, orele totale de funcționare și datele de mentenanță. Intervențiile de service sunt memorate separat, per utilaj.

Modulul de rapoarte permite managerului să analizeze producția și profitabilitatea fermei. Raportul financiar calculează producția totală, costurile materialelor, veniturile, profitul, costul pe hectar, venitul pe hectar și profitul pe hectar. Aceste valori sunt obținute prin corelarea sezoanelor de cultură, parcelelor, activităților finalizate și consumurilor de materiale.

```java
double activityCost = 0.0;
for (ActivityConsumption consumption : activity.getConsumptions()) {
    InventoryItem item = consumption.getInventoryItem();
    double quantity = value(consumption.getQuantityUsed());
    double unitPrice = consumption.getUnitPriceAtConsumption() != null
            ? consumption.getUnitPriceAtConsumption()
            : item != null ? value(item.getUnitPrice()) : 0.0;
    activityCost += quantity * unitPrice;
}
```

Prin acest calcul, aplicația transformă datele operaționale în indicatori economici. Astfel, sistemul nu se limitează la urmărirea activităților, ci oferă suport pentru decizii manageriale.

## 4.6. Integrarea serviciilor externe

Integrarea serviciilor externe este realizată în două direcții: date meteorologice și indicatori NDVI. Modulul meteo folosește date externe pentru a oferi informații utile despre condițiile curente și pentru a sprijini planificarea lucrărilor agricole. Datele meteo sunt importante în special pentru activități precum tratamentele, irigarea sau recoltarea, unde vremea poate influența decizia de execuție.

Modulul NDVI utilizează Sentinel Hub pentru a obține informații despre starea vegetației la nivel de parcelă. Pentru aceasta, coordonatele parcelei sunt transformate într-o geometrie GeoJSON, apoi sunt trimise către API-ul Sentinel Hub. Răspunsul este interpretat și salvat în tabela `parcel_ndvi_history`.

```java
String geoJsonGeometry = convertToGeoJsonGeometry(coordinatesJson);
String accessToken = getAccessToken();

HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_JSON);
headers.setBearerAuth(accessToken);

HttpEntity<String> requestEntity = new HttpEntity<>(jsonPayload, headers);
ResponseEntity<Map> responseEntity =
        restTemplate.postForEntity(STATISTICS_URL, requestEntity, Map.class);

Double actualNdvi = extractNdviFromMap(responseEntity.getBody());
history.setNdviValue(actualNdvi);
history.setIsMockData(false);
```

Serviciul include și mecanisme de rezervă. Dacă datele satelitare nu pot fi obținute sau dacă perioada cerută este în viitor, sistemul utilizează o valoare estimată sau o valoare salvată anterior. Această abordare permite aplicației să rămână funcțională chiar și atunci când serviciul extern nu răspunde.

## 4.7. Validarea datelor și tratarea erorilor

Validarea datelor este realizată prin adnotări Jakarta Validation în DTO-uri și prin verificări suplimentare în servicii. De exemplu, la crearea unei activități este obligatorie selectarea unei parcele și a cel puțin unui muncitor. Pentru produsele din magazie, sistemul verifică numele, categoria, unitatea de măsură și cantitățile introduse.

Validările sunt importante deoarece aplicația folosește datele introduse în mai multe module. O cantitate introdusă greșit poate afecta stocurile, raportările și calculele financiare. Din acest motiv, sistemul nu se bazează doar pe validările din frontend, ci verifică datele și în backend.

Erorile sunt tratate astfel încât utilizatorul să primească feedback clar. În cazul în care o activitate nu aparține fermei utilizatorului, dacă un muncitor nu este atribuit lucrării sau dacă stocul este insuficient, sistemul oprește operația și returnează un mesaj de eroare.

## 4.8. Detalii de infrastructură și rulare

Aplicația este rulată în mediul de dezvoltare prin pornirea separată a backend-ului, frontend-ului și bazei de date. Backend-ul Spring Boot rulează pe portul `8081`, iar frontend-ul React, prin Vite, rulează pe portul `5173`. Baza de date MySQL rulează local și conține schema `agromanager_db`.

Pentru backend, proiectul folosește Maven. Aplicația poate fi pornită din directorul `backend`, iar dependențele sunt definite în fișierul `pom.xml`. Pentru frontend, proiectul folosește npm și Vite, iar scripturile principale sunt `dev`, `build`, `lint` și `preview`, definite în `package.json`.

În versiunea curentă, rularea este realizată manual în mediul local de dezvoltare. Proiectul nu folosește containere Docker sau un pipeline CI/CD dedicat. Totuși, arhitectura aplicației permite extinderea ulterioară către o infrastructură containerizată, în care backend-ul, frontend-ul și baza de date să fie pornite printr-un fișier `docker-compose`. De asemenea, aplicația poate fi publicată într-un mediu cloud, cu separarea serverului de aplicație și a serverului de bază de date.

Pentru integrarea Sentinel Hub, aplicația citește credențialele din variabile de mediu:

```properties
sentinel-hub.client-id=${SENTINEL_HUB_CLIENT_ID:}
sentinel-hub.client-secret=${SENTINEL_HUB_CLIENT_SECRET:}
```

Această abordare evită includerea cheilor externe direct în codul sursă și permite configurarea diferită a aplicației în funcție de mediul de rulare.

## 4.9. Concluzii privind implementarea sistemului

Implementarea aplicației AgroManager urmează arhitectura proiectată în capitolul anterior. Backend-ul Spring Boot gestionează autentificarea, autorizarea, logica de business și persistența datelor. Frontend-ul React oferă interfețe diferite pentru rolurile aplicației și comunică cu backend-ul prin API-uri REST. Baza de date MySQL păstrează informațiile operaționale ale fermei, iar serviciile externe completează aplicația cu date meteo și indicatori NDVI.

Modulele implementate acoperă fluxurile principale ale unei ferme agricole: gestionarea parcelelor, planificarea activităților, executarea lucrărilor, raportarea consumurilor, administrarea stocurilor, cererile de aprovizionare, utilajele, mentenanța, notificările și rapoartele de producție și profitabilitate. Prin aceste module, AgroManager devine o aplicație integrată pentru management agricol, capabilă să susțină atât activitatea operațională, cât și analiza managerială.
