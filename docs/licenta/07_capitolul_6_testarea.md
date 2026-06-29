# Capitolul 6. Testarea

Testarea aplicației AgroManager a avut rolul de a verifica dacă funcționalitățile implementate respectă cerințele definite anterior și dacă principalele fluxuri ale fermei pot fi executate fără erori. Deoarece aplicația este organizată pe roluri, testarea nu se limitează la verificarea formularelor, ci urmărește și modul în care managerul, agronomul, muncitorul și administratorul platformei interacționează cu sistemul.

Au fost utilizate două direcții principale de testare: testarea manuală și testarea automată. Testarea manuală a fost folosită pentru verificarea interfeței, a navigării, a fluxurilor pe roluri și a integrării dintre module. Testarea automată a fost utilizată pentru validarea unor reguli importante din backend, în special validarea datelor de intrare, fluxul de consumuri și stocuri, precum și calculul raportului financiar.

Pentru testarea automată s-a folosit JUnit, framework standard pentru testarea aplicațiilor Java [25]. În proiect sunt utilizate și Mockito, pentru izolarea serviciilor testate prin obiecte simulate [26], respectiv AssertJ, pentru formularea mai clară a verificărilor din teste [27]. În cazul aplicațiilor Spring Boot, testarea este susținută și de infrastructura oferită de Spring Boot Test [28].

## 6.1. Strategia de testare

Strategia de testare a fost adaptată structurii aplicației. AgroManager conține module diferite, dar acestea nu funcționează izolat. O lucrare agricolă poate afecta stocurile, utilajele, istoricul culturilor, notificările și rapoartele. Din acest motiv, testarea a urmărit atât componente individuale, cât și fluxuri complete.

În testarea manuală au fost urmărite scenarii de utilizare reale: autentificarea utilizatorului, accesul la dashboard-ul corespunzător rolului, crearea parcelelor, planificarea activităților, raportarea lucrărilor, verificarea magaziei, aprobarea cererilor de aprovizionare și consultarea rapoartelor. Aceste scenarii sunt importante deoarece reflectă modul în care aplicația este folosită într-o fermă.

În testarea automată au fost verificate reguli care pot fi afectate ușor prin modificări ulterioare ale codului. De exemplu, sistemul trebuie să respingă cantitățile negative, să nu scadă stocul în momentul planificării unei activități, să scadă stocul o singură dată la finalizarea lucrării și să calculeze corect profitul pe hectar. Aceste reguli au impact direct asupra corectitudinii datelor din aplicație.

Testarea a fost realizată în principal la nivel de backend, deoarece aici se află regulile critice ale aplicației. Frontend-ul a fost verificat manual, prin parcurgerea fluxurilor principale din browser.

## 6.2. Testarea manuală

Testarea manuală a fost realizată prin utilizarea aplicației din perspectiva fiecărui rol. Scopul a fost verificarea interfeței, a restricțiilor de acces și a legăturilor dintre module. Pentru fiecare scenariu s-au urmărit pașii executați, rezultatul așteptat și comportamentul observat.

**Autentificare și redirecționare pe roluri.** A fost verificat faptul că utilizatorul se poate autentifica prin nume de utilizator și parolă, iar după autentificare este trimis către dashboard-ul corespunzător rolului său. Managerul ajunge în interfața de administrare a fermei, agronomul în interfața de planificare, muncitorul în pagina de taskuri, iar administratorul platformei în zona globală.

**Protejarea rutelor.** A fost verificat comportamentul aplicației atunci când un utilizator încearcă să acceseze o pagină care nu aparține rolului său. De exemplu, un muncitor nu trebuie să poată accesa pagina de magazie sau pagina de angajați. Acest test este important deoarece confirmă separarea interfeței pe responsabilități.

**Înregistrarea fermei și a managerului.** A fost verificat formularul de înregistrare prin introducerea datelor pentru contul de manager și pentru fermă. Rezultatul așteptat este crearea fermei și asocierea managerului cu aceasta.

**Gestionarea profilului fermei.** Managerul poate vizualiza și actualiza informațiile fermei, precum adresa, datele de contact și obiectivele. Testarea acestui scenariu urmărește salvarea corectă a datelor și afișarea lor după reîncărcarea paginii.

**Gestionarea angajaților.** Managerul poate adăuga utilizatori cu rol de agronom sau muncitor. Testarea urmărește completarea formularului, salvarea utilizatorului și apariția acestuia în lista angajaților fermei.

**Crearea și vizualizarea parcelelor.** Managerul sau agronomul poate crea o parcelă, completând numele, cultura, suprafața și coordonatele. Pe hartă se verifică afișarea parcelei, culoarea asociată culturii și deschiderea panoului de detalii.

**Planificarea unei activități agricole.** Agronomul selectează o parcelă, introduce titlul lucrării, tipul activității, muncitorii, utilajele și consumurile estimate. Rezultatul așteptat este salvarea activității și afișarea acesteia în istoricul parcelei.

**Executarea activității de către muncitor.** Muncitorul vede activitățile atribuite, marchează o lucrare ca începută și apoi o finalizează. La finalizare, acesta raportează perioada de lucru, comentarii, cantitatea recoltată și consumurile reale. Testarea verifică schimbarea statusului și transmiterea datelor către backend.

**Actualizarea magaziei după finalizarea lucrării.** După finalizarea unei activități cu materiale consumate, se verifică dacă stocul produselor scade cu cantitatea raportată. Acest scenariu este important deoarece leagă activitatea din teren de evidența magaziei.

**Alerte de stoc minim.** Se verifică dacă managerul primește notificare atunci când un produs scade sub pragul minim stabilit. Testarea acestui scenariu confirmă legătura dintre consumuri, stocuri și notificări.

**Cereri de aprovizionare.** Agronomul creează o cerere pentru un produs necesar. Managerul vede cererea și o aprobă sau o respinge. Dacă cererea este aprobată, se verifică actualizarea magaziei și notificarea agronomului.

**Gestionarea utilajelor și mentenanței.** Managerul adaugă un utilaj, modifică informațiile acestuia și înregistrează o operație de mentenanță. Se verifică afișarea istoricului de service și actualizarea datelor utilajului.

**Consultarea datelor meteo și NDVI.** Pe pagina de hartă se verifică afișarea datelor meteorologice și a valorilor NDVI pentru parcela selectată. În cazul în care serviciul extern nu răspunde, se verifică faptul că aplicația afișează o valoare de rezervă sau un mesaj adecvat.

**Consultarea rapoartelor.** Managerul consultă raportul de producție și profitabilitate. Se verifică afișarea recoltei, costurilor, veniturilor, profitului și indicatorilor pe hectar pentru anul selectat.

Pentru lucrare, aceste scenarii pot fi prezentate într-un tabel de testare manuală. Tabelul poate avea coloanele: scenariu, rol, pași executați, rezultat așteptat și rezultat obținut. Dacă tabelul devine prea lung în Word, poate fi mutat în anexă, iar în capitol se păstrează doar scenariile principale.

## 6.3. Testarea automată

Testarea automată a fost implementată în backend, folosind infrastructura de testare inclusă prin `spring-boot-starter-test`. Aceasta include JUnit Jupiter, AssertJ, Mockito și suport pentru testarea aplicațiilor Spring Boot. Testele automate sunt localizate în directorul `backend/src/test/java`.

În proiect există patru clase principale de test:

`BackendApplicationTests` verifică încărcarea contextului Spring Boot. Testul `contextLoads()` confirmă că aplicația poate porni cu configurația existentă, fără erori majore de inițializare.

`RequestDtoValidationTests` verifică validările definite în DTO-uri. Aceste teste confirmă că aplicația respinge date invalide, precum nume lipsă, suprafețe negative, cantități negative, costuri negative sau intervale de mentenanță invalide.

`ActivityServiceInventoryWorkflowTests` verifică fluxul dintre activități și magazie. Testele confirmă că stocul nu este scăzut la planificarea unei activități, că este scăzut la finalizare, că scăderea se face o singură dată și că managerul este notificat atunci când stocul scade sub pragul minim.

`FinancialReportServiceTests` verifică raportul financiar. Testele confirmă calculul costurilor, veniturilor, profitului și indicatorilor pe hectar. De asemenea, verifică faptul că un venit introdus manual poate suprascrie calculul bazat pe prețul de vânzare.

Un exemplu de test pentru validarea datelor este următorul:

```java
@Test
void parcelRequestRejectsBlankNameAndNegativeArea() {
    ParcelRequestDTO request = new ParcelRequestDTO();
    request.setName(" ");
    request.setAreaHectares(-1.0);
    request.setCoordinatesJson("[]");

    Set<String> fields = invalidFields(request);

    assertThat(fields).contains("name", "areaHectares");
}
```

Acest test verifică faptul că o parcelă fără nume valid și cu suprafață negativă este respinsă. Testul nu pornește întreaga aplicație, ci folosește validatorul Jakarta Validation pentru a verifica regulile definite pe DTO.

Un alt exemplu important este testarea scăderii stocului la finalizarea unei activități:

```java
@Test
void completingActivityDeductsInventoryOnce() {
    Farm farm = farm();
    Parcel parcel = parcel(farm);
    User worker = worker(farm);
    InventoryItem item = inventoryItem(farm, 600.0);
    Activity activity = activityWithConsumption(parcel, worker, item, 200.0);

    when(activityRepository.findById(activity.getId())).thenReturn(Optional.of(activity));
    when(inventoryItemRepository.findById(item.getId())).thenReturn(Optional.of(item));
    when(activityRepository.save(any(Activity.class))).thenAnswer(invocation -> invocation.getArgument(0));

    activityService.updateActivityStatus(activity.getId(), "COMPLETED", null, null, null, null, null, worker);

    assertThat(item.getQuantityAvailable()).isEqualTo(400.0);
    assertThat(activity.getInventoryDeducted()).isTrue();
}
```

Acest test verifică o regulă importantă: stocul este scăzut doar la finalizarea activității, nu la planificare. În plus, testele verifică și faptul că aceeași activitate nu scade stocul de mai multe ori.

Pentru raportul financiar, testele verifică transformarea datelor operaționale în indicatori economici:

```java
@Test
void reportCalculatesCostRevenueAndProfitPerHectare() {
    CropSeason season = season(parcel, 2026, 1000.0);
    season.setSalePricePerKg(1.5);

    Activity activity = completedActivity(parcel, inventoryItem(farm, 4.0), 50.0);
    activity.getConsumptions().get(0).setUnitPriceAtConsumption(3.0);

    FinancialReportDTO report = financialReportService.getFinancialReport("manager", 2026);

    assertThat(report.getRows().get(0).getTotalInputCost()).isEqualTo(150.0);
    assertThat(report.getRows().get(0).getTotalRevenue()).isEqualTo(1500.0);
    assertThat(report.getRows().get(0).getProfit()).isEqualTo(1350.0);
}
```

Acest scenariu este relevant deoarece raportul financiar folosește informații din mai multe zone ale aplicației: parcelă, sezon de cultură, activitate finalizată, consumuri și prețuri. Testarea lui reduce riscul ca o modificare ulterioară să afecteze calculele economice.

## 6.4. Testarea fluxurilor principale

Fluxurile principale ale aplicației au fost testate manual, iar unele reguli interne au fost acoperite prin teste automate. Cel mai important flux este cel al unei activități agricole, deoarece acesta conectează mai multe module.

Fluxul începe cu agronomul, care creează lucrarea pe o parcelă. În această etapă sunt selectați muncitorii, utilajele și materialele estimate. După salvare, lucrarea apare în lista muncitorului atribuit. Muncitorul începe lucrarea, apoi o finalizează și raportează consumurile reale. După finalizare, sistemul actualizează stocurile, utilajele, producția și notificările.

Un alt flux important este cererea de aprovizionare. Agronomul solicită un material, managerul primește notificare, analizează cererea și o aprobă sau o respinge. Dacă cererea este aprobată, magazia este actualizată. Acest flux verifică interacțiunea dintre roluri și actualizarea corectă a datelor.

Fluxul de raportare financiară pornește de la datele introduse în activități și sezoane de cultură. Sistemul folosește producția, prețurile, costurile materialelor și suprafețele pentru a calcula indicatori precum profitul total și profitul pe hectar. Testarea acestui flux este importantă deoarece datele rezultate sunt folosite de manager pentru decizii.

## 6.5. Testarea validărilor și a restricțiilor de acces

Validările au fost testate automat prin `RequestDtoValidationTests`. Aceste teste confirmă că aplicația respinge valori invalide înainte ca acestea să ajungă în logica de business. Printre cazurile verificate se află parcele fără nume, suprafețe negative, produse cu cantități negative, utilaje cu ore negative, mentenanțe fără dată și activități cu consumuri negative.

Restricțiile de acces au fost verificate manual prin autentificarea cu roluri diferite. Managerul are acces la module administrative, agronomul la planificare și monitorizare, iar muncitorul la taskurile proprii. În backend, restricțiile sunt aplicate prin adnotări `@PreAuthorize`, iar în frontend prin rute protejate.

Un aspect important este că aplicația nu verifică doar rolul, ci și apartenența datelor la fermă. De exemplu, la crearea unei activități se verifică dacă parcela, muncitorii, utilajele și produsele selectate aparțin aceleiași ferme. Această regulă a fost analizată în testarea manuală și trebuie păstrată în toate fluxurile care accesează date operaționale.

## 6.6. Testarea integrărilor externe

Aplicația include integrare cu servicii externe pentru vreme și NDVI. Aceste integrări au fost testate manual, deoarece depind de conexiunea la internet, de disponibilitatea serviciilor externe și de existența unor coordonate valide pentru parcele.

Pentru modulul meteo s-a verificat afișarea informațiilor relevante în interfață și folosirea lor în contextul planificării lucrărilor. Pentru modulul NDVI s-a verificat consultarea valorilor pe parcelă și perioadă. În cazul în care Sentinel Hub nu returnează date sau credențialele nu sunt configurate, aplicația folosește valori de rezervă sau date salvate anterior. Acest comportament este important deoarece aplicația nu trebuie să devină inutilizabilă doar pentru că un serviciu extern nu răspunde.

Pentru o testare mai riguroasă, integrarea NDVI poate fi acoperită ulterior prin teste automate care simulează răspunsurile Sentinel Hub. În acest fel, s-ar putea verifica separat comportamentul pentru răspuns valid, lipsă date, perioadă viitoare și eroare de comunicare.

## 6.7. Limitări și direcții de îmbunătățire a testării

Testarea realizată acoperă fluxuri importante ale aplicației, dar există și limitări. În primul rând, frontend-ul este testat manual, nu automatizat. Acest lucru este acceptabil pentru o versiune de licență, dar pe termen lung ar fi utilă introducerea unor teste end-to-end pentru fluxurile principale: autentificare, creare activitate, finalizare activitate și aprobare cerere.

În al doilea rând, testele automate existente sunt concentrate pe backend. Ele verifică validări, stocuri și rapoarte financiare, dar nu acoperă toate controllerele și toate restricțiile de securitate. O direcție de îmbunătățire este adăugarea unor teste de integrare cu Spring Security Test, pentru a verifica accesul la endpoint-uri în funcție de rol.

În al treilea rând, integrarea cu serviciile externe este verificată manual. Pentru o variantă mai matură, se pot adăuga teste cu răspunsuri simulate pentru Open-Meteo și Sentinel Hub. Astfel, aplicația ar putea fi testată fără dependență de internet sau de disponibilitatea API-urilor externe.

O altă direcție este testarea performanței pentru cazuri cu volum mai mare de date: mai multe parcele, multe activități, multe produse în magazie și rapoarte pe mai mulți ani. Această testare ar arăta cum se comportă aplicația într-o fermă cu activitate intensă.

## 6.8. Concluzii privind testarea

Testarea aplicației AgroManager a urmărit verificarea funcționalităților principale și a regulilor care pot afecta datele fermei. Testarea manuală a confirmat fluxurile pe roluri, navigarea, interacțiunea cu harta, administrarea resurselor și consultarea rapoartelor. Testarea automată a verificat reguli importante din backend: validarea datelor, scăderea corectă a stocurilor și calculul raportului financiar.

Prin combinarea testării manuale cu testarea automată, aplicația este verificată atât din perspectiva utilizatorului, cât și din perspectiva logicii interne. Testarea poate fi extinsă în continuare prin teste de integrare, teste de securitate automate și teste end-to-end pentru frontend. Totuși, pentru versiunea curentă, scenariile testate acoperă fluxurile esențiale ale aplicației și oferă încredere în funcționarea modulelor principale.
