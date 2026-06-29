# Capitolul 5. Securitatea aplicației

Securitatea aplicației AgroManager este tratată ca parte a proiectării și implementării sistemului, nu ca o etapă separată adăugată la final. Aplicația gestionează date despre ferme, utilizatori, angajați, parcele, activități agricole, stocuri, utilaje, cereri de aprovizionare, producție și indicatori economici. O parte dintre aceste date sunt operaționale, iar o parte pot fi considerate date personale sau sensibile din perspectiva administrării unei ferme.

Într-o aplicație de management agricol, securitatea nu se reduce doar la parolă. Este necesar ca un muncitor să vadă doar lucrările atribuite lui, un agronom să poată planifica activități fără a modifica date administrative, iar managerul să controleze resursele fermei sale fără a accesa datele unei alte ferme. Din acest motiv, AgroManager folosește autentificare, autorizare pe roluri, validarea datelor de intrare, separarea datelor pe fermă și protejarea informațiilor sensibile.

Pentru orientarea măsurilor de securitate au fost avute în vedere recomandări generale din OWASP Top 10, document care sintetizează riscurile frecvente ale aplicațiilor web [20]. În același timp, pentru protecția datelor personale, aplicația are în vedere principiile Regulamentului (UE) 2016/679, cunoscut ca GDPR [24]. Aceste surse nu sunt copiate în lucrare, ci sunt folosite ca repere pentru adaptarea securității la proiectul AgroManager.

## 5.1. Identificarea datelor sensibile

Primul pas în securizarea aplicației constă în identificarea datelor care trebuie protejate. În AgroManager, datele sensibile pot fi împărțite în mai multe categorii.

Datele de autentificare includ numele de utilizator, parola și rolul utilizatorului. Parola este cea mai sensibilă informație din această categorie și nu este stocată în clar. Rolul utilizatorului este important deoarece determină ce funcționalități poate accesa persoana autentificată.

Datele personale includ numele de utilizator, adresa de email și apartenența unui angajat la o fermă. Deși aplicația nu gestionează date medicale sau date speciale, informațiile despre angajați trebuie protejate, deoarece indică identitatea utilizatorului și rolul său în cadrul fermei.

Datele operaționale ale fermei includ parcelele, activitățile agricole, consumurile de materiale, cererile de aprovizionare, utilajele, mentenanța, istoricul culturilor și notificările. Aceste date nu sunt neapărat date personale, dar sunt sensibile pentru activitatea economică a fermei. De exemplu, stocurile, producția și costurile pot oferi informații despre performanța fermei.

Datele de localizare și teren includ coordonatele parcelelor și suprafețele agricole. Aceste informații trebuie protejate deoarece descriu structura fermei și amplasarea terenurilor.

Datele financiare și de raportare includ costurile materialelor, veniturile, profitul, costul pe hectar și profitul pe hectar. Aceste informații sunt relevante pentru manager și nu trebuie expuse utilizatorilor care nu au responsabilități administrative.

Prin identificarea acestor categorii, aplicația poate aplica reguli diferite de acces și protecție. Nu toate datele au același nivel de sensibilitate, dar toate trebuie gestionate coerent, în funcție de rol și de ferma asociată utilizatorului.

## 5.2. Autentificare și autorizare

Autentificarea este procesul prin care sistemul verifică identitatea utilizatorului. În AgroManager, utilizatorul se autentifică prin nume de utilizator și parolă. Backend-ul folosește `AuthenticationManager` din Spring Security pentru verificarea credențialelor, iar după autentificare contextul de securitate este salvat în sesiune.

Autorizarea stabilește ce are voie să facă utilizatorul după autentificare. Aplicația utilizează patru roluri principale: `FARM_MANAGER`, `AGRONOMIST`, `WORKER` și `SUPER_ADMIN`. Rolurile sunt folosite atât în frontend, pentru protejarea rutelor, cât și în backend, pentru protejarea endpoint-urilor.

În frontend, rutele sunt filtrate în funcție de rol. Dacă un utilizator neautentificat încearcă să acceseze o pagină internă, acesta este redirecționat către autentificare. Dacă un utilizator autentificat încearcă să acceseze o pagină care nu aparține rolului său, aplicația îl redirecționează către dashboard-ul corect.

În backend, autorizarea este aplicată prin adnotări `@PreAuthorize`. De exemplu, crearea unei activități agricole este permisă agronomului, actualizarea statusului unei activități este permisă muncitorului atribuit, iar administrarea magaziei este permisă managerului. Această verificare în backend este esențială, deoarece protecția din frontend poate fi ocolită prin apeluri directe către API.

```java
@PostMapping
@PreAuthorize("hasRole('AGRONOMIST')")
public ResponseEntity<Activity> createActivity(
        @Valid @RequestBody ActivityRequestDTO activityRequest,
        Principal principal) {
    User currentUser = getCurrentUser(principal);
    Activity savedActivity = activityService.createActivity(activityRequest, currentUser);
    return ResponseEntity.ok(savedActivity);
}
```

Securitatea este aplicată și la nivel de date, nu doar la nivel de pagini. De exemplu, atunci când se creează o activitate, backend-ul verifică dacă parcela, muncitorii, utilajele și produsele selectate aparțin fermei utilizatorului curent. Astfel, un agronom nu poate crea o lucrare folosind resurse din altă fermă.

## 5.3. Implementarea principiilor pentru prevenirea OWASP Top 10

OWASP Top 10 este folosit ca reper pentru identificarea riscurilor frecvente ale aplicațiilor web [20]. În AgroManager, cele mai relevante categorii sunt controlul accesului, erorile criptografice, injecțiile, configurarea greșită de securitate, autentificarea și jurnalizarea evenimentelor.

**Controlul accesului.** Riscul de acces neautorizat este redus prin autentificare obligatorie pentru endpoint-urile interne și prin autorizare pe roluri. Managerul, agronomul, muncitorul și administratorul platformei au operații diferite. În plus, serviciile verifică apartenența datelor la ferma utilizatorului curent. Această verificare este importantă mai ales pentru parcele, activități, produse din magazie și cereri de aprovizionare.

**Protecția datelor sensibile.** Parolele sunt stocate prin hashing cu BCrypt, iar credențialele pentru Sentinel Hub sunt citite din variabile de mediu. Această abordare evită păstrarea parolelor sau cheilor externe în clar în codul sursă.

**Prevenirea injecțiilor.** Accesul la baza de date este realizat prin Spring Data JPA, nu prin concatenarea manuală a interogărilor SQL. Datele primite de la utilizator sunt mapate în obiecte și validate înainte de procesare. Această abordare reduce riscul de injecții SQL, deoarece interacțiunea cu baza de date este realizată prin mecanismele framework-ului.

**Validarea datelor de intrare.** DTO-urile folosesc adnotări precum `@NotBlank`, `@NotNull`, `@NotEmpty`, `@Size`, `@Positive` și `@PositiveOrZero`. În plus, serviciile aplică reguli de business care nu pot fi exprimate doar prin adnotări, cum ar fi verificarea fermei sau verificarea muncitorului atribuit activității. Această abordare este în acord cu recomandările OWASP privind validarea datelor primite de la utilizatori [21].

**Configurarea securității.** Spring Security este configurat astfel încât endpoint-urile de autentificare să fie publice, iar restul endpoint-urilor să necesite autentificare. CORS este limitat la originile folosite de frontend în mediul local. Pentru un mediu de producție, lista originilor trebuie actualizată la domeniul real al aplicației.

**Jurnalizare și monitorizare.** Aplicația folosește logging în zone precum integrarea NDVI, unde pot apărea erori de comunicare cu servicii externe. În plus, notificările interne păstrează evenimente importante pentru utilizatori: cereri de aprovizionare, decizii, stocuri reduse și activități finalizate. Pentru o variantă de producție, jurnalizarea tehnică trebuie extinsă astfel încât să includă evenimente de securitate, fără a salva parole sau date sensibile în loguri [22].

**Gestionarea dependențelor.** Aplicația folosește Maven pentru backend și npm pentru frontend. Pentru reducerea riscurilor, dependențele trebuie actualizate periodic, iar vulnerabilitățile cunoscute trebuie verificate cu instrumente precum `mvn dependency-check`, `npm audit` sau instrumente similare.

## 5.4. Protecția datelor

Protecția datelor este realizată prin mai multe mecanisme. Primul mecanism este separarea datelor pe fermă. Utilizatorii operaționali sunt asociați unei ferme, iar operațiile sunt filtrate în funcție de această asociere. De exemplu, o activitate creată de agronom trebuie să folosească o parcelă aparținând fermei sale.

Al doilea mecanism este separarea drepturilor pe roluri. Muncitorul are acces la taskurile atribuite lui, dar nu poate modifica magazia sau utilajele. Agronomul poate planifica activități și crea cereri de aprovizionare, dar nu administrează direct stocurile. Managerul are acces administrativ la resursele fermei. Administratorul platformei are rol global, dar datele fermelor rămân separate logic.

Al treilea mecanism este validarea datelor înainte de salvare. Datele invalide sunt respinse pentru a preveni erori în rapoarte, stocuri sau activități. De exemplu, aplicația nu acceptă suprafețe negative, cantități negative, activități fără parcelă sau activități fără muncitori.

Al patrulea mecanism este evitarea expunerii informațiilor sensibile în răspunsurile API. În entitățile transmise către frontend sunt folosite adnotări precum `@JsonIgnore` și `@JsonIgnoreProperties`, pentru a evita serializarea unor câmpuri care nu trebuie trimise în răspunsuri, cum ar fi parola sau relațiile care pot produce expuneri inutile.

## 5.5. Criptare și protejarea parolelor

Parolele utilizatorilor nu sunt stocate în clar. La înregistrarea unui manager sau la crearea unui angajat, parola este procesată printr-un `PasswordEncoder`. În configurația aplicației este utilizat `BCryptPasswordEncoder`, recomandat în ecosistemul Spring Security pentru stocarea parolelor prin hashing adaptiv [12], [23].

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

Hashing-ul parolelor este diferit de criptarea reversibilă. În cazul parolelor, sistemul nu trebuie să poată recupera parola originală, ci doar să verifice dacă parola introdusă la autentificare corespunde hash-ului salvat. Această abordare reduce impactul unei eventuale expuneri a bazei de date.

Cheile de acces pentru Sentinel Hub sunt protejate prin configurare externă. În fișierul `application.properties`, valorile sunt citite din variabile de mediu:

```properties
sentinel-hub.client-id=${SENTINEL_HUB_CLIENT_ID:}
sentinel-hub.client-secret=${SENTINEL_HUB_CLIENT_SECRET:}
```

Această abordare este potrivită deoarece permite rularea aplicației în medii diferite fără includerea credențialelor în codul sursă. Pentru o instalare de producție, aceleași principii trebuie aplicate și pentru parola bazei de date, cheia serviciilor externe și alte secrete de configurare.

## 5.6. Validarea datelor de intrare

Validarea datelor de intrare este importantă deoarece AgroManager folosește aceleași date în mai multe fluxuri. O cantitate greșită poate afecta magazia, o suprafață incorectă poate afecta rapoartele, iar o activitate fără muncitori nu poate fi executată corect.

Aplicația folosește validare la nivel de DTO. De exemplu, pentru o parcelă sunt obligatorii numele, suprafața și coordonatele. Pentru un produs din magazie sunt obligatorii numele, categoria, unitatea de măsură și cantitatea. Pentru o activitate sunt obligatorii titlul, parcela și cel puțin un muncitor.

```java
public class ActivityRequestDTO {
    @NotBlank(message = "Titlul lucrarii este obligatoriu.")
    private String title;

    @NotNull(message = "Parcela este obligatorie.")
    private Long parcelId;

    @NotEmpty(message = "Trebuie selectat cel putin un muncitor.")
    private List<Long> assignedWorkerIds;
}
```

Pe lângă aceste validări, serviciile verifică reguli de business. De exemplu, la finalizarea unei activități se verifică dacă muncitorul curent este atribuit acelei lucrări. De asemenea, la raportarea consumurilor reale se verifică dacă produsul raportat aparține fermei curente și dacă face parte din consumurile planificate.

Această combinație între validarea DTO-urilor și verificările din servicii este necesară deoarece nu toate regulile pot fi exprimate prin adnotări. Unele reguli depind de utilizatorul curent, de fermă, de statusul unei activități sau de relațiile dintre entități.

## 5.7. Loguri și monitorizare

Logurile sunt folosite pentru observarea comportamentului aplicației și pentru diagnosticarea problemelor. În AgroManager, logging-ul este prezent în special în serviciul NDVI, unde pot apărea erori externe: lipsa credențialelor Sentinel Hub, indisponibilitatea API-ului sau lipsa datelor satelitare pentru o anumită perioadă.

În cazul unei erori la obținerea valorii NDVI, sistemul scrie un mesaj în log și folosește o valoare salvată anterior sau o estimare locală. Această abordare ajută la menținerea funcționării aplicației fără a întrerupe complet experiența utilizatorului.

Pentru o aplicație de producție, logurile trebuie extinse astfel încât să includă evenimente relevante de securitate: autentificări reușite și eșuate, acces refuzat, încercări de acces la date din altă fermă, modificări de roluri, aprobări de cereri și schimbări importante ale datelor financiare. Totuși, logurile nu trebuie să conțină parole, token-uri, chei API sau date personale în exces. Recomandările OWASP privind logging-ul subliniază importanța înregistrării evenimentelor utile fără expunerea informațiilor sensibile [22].

În aplicație există și un mecanism intern de notificări. Acesta nu înlocuiește logurile tehnice, dar ajută utilizatorii să urmărească evenimente operaționale: lucrări finalizate, cereri de aprovizionare, decizii ale managerului și stocuri reduse. Astfel, sistemul are atât o componentă de comunicare cu utilizatorul, cât și o bază pentru monitorizarea tehnică.

## 5.8. GDPR și acordul utilizatorilor pentru prelucrarea datelor personale

AgroManager prelucrează date personale de bază, precum numele de utilizator, adresa de email, rolul și asocierea cu o fermă. În plus, prin taskurile atribuite se poate observa activitatea profesională a unui muncitor sau a unui agronom. Aceste date trebuie tratate conform principiilor GDPR: scop determinat, minimizarea datelor, transparență, securitate și posibilitatea exercitării drepturilor persoanelor vizate [24].

În contextul aplicației, scopul prelucrării datelor este administrarea activităților fermei. Datele utilizatorilor sunt necesare pentru autentificare, autorizare, atribuirea lucrărilor, notificări și urmărirea activităților. Aplicația nu trebuie să colecteze date care nu sunt necesare acestor scopuri.

La înregistrarea unui cont, utilizatorul trebuie informat cu privire la datele prelucrate și scopul folosirii lor. În versiunea finală a aplicației, formularul de înregistrare trebuie să includă o informare privind prelucrarea datelor personale și o bifă de acord, acolo unde temeiul juridic este consimțământul. Pentru conturile angajaților create de manager, trebuie precizat în documentația internă a fermei că datele sunt prelucrate pentru organizarea activității profesionale.

Utilizatorii trebuie să poată solicita corectarea datelor greșite și ștergerea contului, în limitele obligațiilor legale sau operaționale ale fermei. De exemplu, anumite informații despre activități finalizate pot fi păstrate pentru evidența fermei, dar contul utilizatorului poate fi dezactivat sau anonimizat într-o versiune extinsă a sistemului.

Pentru protecția datelor, aplicația limitează accesul prin roluri și prin asocierea la fermă. Totuși, într-un mediu real de producție, trebuie completate și măsuri administrative: politică de confidențialitate, termen de păstrare a datelor, procedură de ștergere/anonymizare și evidența consimțămintelor.

## 5.9. Teste de securitate

Testarea securității urmărește verificarea mecanismelor de protecție implementate. În AgroManager există teste automate pentru validarea DTO-urilor și pentru fluxul de inventar asociat activităților. Aceste teste verifică respingerea valorilor invalide, precum suprafețe negative, cantități negative, costuri negative sau activități cu date incomplete.

Un exemplu relevant este testarea validării cererilor. Testele verifică faptul că sistemul respinge o parcelă fără nume sau cu suprafață negativă, un produs cu stoc negativ, un utilaj cu ore negative și o activitate cu un consum invalid. Aceste verificări reduc riscul ca date incorecte să ajungă în logica aplicației.

Testele pentru fluxul de inventar verifică faptul că stocul nu este scăzut la planificarea activității, ci doar la finalizare, și că scăderea se face o singură dată. Această regulă are și o componentă de securitate, deoarece previne modificarea incorectă a stocurilor prin repetarea aceleiași operații.

Pentru o acoperire mai bună, testele de securitate trebuie să includă și scenarii manuale:

- autentificarea cu date greșite;
- accesarea unei rute protejate fără autentificare;
- accesarea unei pagini de manager cu rol de muncitor;
- trimiterea directă către API a unei cereri nepermise rolului curent;
- încercarea unui agronom de a folosi o parcelă sau un produs din altă fermă;
- finalizarea unei activități de către un muncitor care nu este atribuit lucrării;
- introducerea unor cantități negative în formulare;
- verificarea faptului că parola nu este returnată în răspunsurile API;
- verificarea logout-ului și a invalidării sesiunii;
- verificarea accesului la rapoartele financiare doar pentru manager.

Aceste teste pot fi realizate manual prin interfață și prin apeluri directe către API. Pentru o versiune extinsă, ele pot fi automatizate prin teste de integrare cu Spring Security Test și prin teste end-to-end în frontend.

## 5.10. Concluzii privind securitatea aplicației

Securitatea aplicației AgroManager este construită în jurul controlului accesului, protejării parolelor, validării datelor și separării informațiilor pe ferme. Sistemul folosește Spring Security pentru autentificare și autorizare, BCrypt pentru protejarea parolelor, adnotări de validare pentru datele de intrare și verificări de business pentru apartenența resurselor la ferma utilizatorului curent.

Prin aplicarea acestor măsuri, aplicația reduce riscurile legate de acces neautorizat, date invalide, expunerea parolelor și modificarea incorectă a resurselor. În același timp, securitatea trebuie privită ca un proces continuu. Pentru utilizarea aplicației într-un mediu real, sunt necesare completări precum extinderea logurilor de securitate, configurarea pentru producție, verificarea periodică a dependențelor, documentarea politicii GDPR și automatizarea unor teste suplimentare.

AgroManager include bazele unei securități aplicate concret pe domeniul fermei: fiecare utilizator are rolul său, fiecare fermă are datele sale, iar operațiile importante sunt validate înainte de a modifica stocuri, activități, utilaje sau rapoarte.
