# Audit pentru reducerea lucrării

Fișier analizat: `docs/licenta/Dorian.docx`

## 1. Situația actuală

Documentul Word are, conform proprietăților interne, aproximativ **75 de pagini**, **26.730 de cuvinte** și **1.269 de linii**. Din textul extras efectiv din paragrafe rezultă aproximativ **22.000 de cuvinte**. Diferența este normală într-un document Word care conține cuprins, câmpuri, titluri, elemente formatate și eventual spații generate de structură.

Randarea vizuală a documentului nu a putut fi realizată în mediul Codex deoarece lipsește executabilul LibreOffice/`soffice`. Prin urmare, analiza de mai jos se bazează pe textul extras din document și pe proprietățile interne ale fișierului Word, nu pe inspecția fiecărei pagini randate.

Problema principală nu este doar numărul de cuvinte. Lucrarea are multe paragrafe scurte, multe fragmente de cod și multe explicații care reiau aceleași idei în capitole diferite. Pentru a ajunge la 40-50 de pagini A4 cu figuri incluse, textul ar trebui redus semnificativ, probabil cu **30-40%**. Altfel, după adăugarea diagramelor și capturilor de ecran, lucrarea poate depăși ușor limita cerută.

## 2. Distribuția conținutului pe capitole

Estimarea după textul extras din `Dorian.docx`:

| Secțiune | Cuvinte aproximative | Observație |
|---|---:|---|
| Rezumat | 394 | Lungime bună. Nu este problema principală. |
| Introducere | 609 | Poate fi redusă ușor, deoarece repetă scopul, rolurile și tehnologiile. |
| Capitolul 1 | 2.661 | Bun ca structură, dar repetă rolurile și funcționalitățile care apar și în Capitolul 2. |
| Capitolul 2 | 3.676 | Cel mai mare capitol. Conține multe cerințe formulate ca mini-paragrafe. |
| Capitolul 3 | 3.062 | Acceptabil ca importanță, dar include multe explicații de diagramă și descrieri lungi ale bazei de date. |
| Capitolul 4 | 2.412 | Are foarte multe paragrafe scurte, mai ales din cod. Consumă mai multe pagini decât sugerează numărul de cuvinte. |
| Capitolul 5 | 2.526 | Repetă parțial autentificarea, rolurile și validarea din capitolele 2 și 4. |
| Capitolul 6 | 2.194 | Bun ca temă, dar zona de testare automată poate fi compactată. |
| Capitolul 7 | 3.022 | Repetă funcționalități din Capitolul 2. Trebuie să devină mai mult tur vizual al aplicației. |
| Concluzii | 747 | Prea lungi pentru final. Pot fi reduse fără pierdere. |

## 3. Zone unde informația se repetă

### 3.1. Rolurile aplicației

Rolurile `FARM_MANAGER`, `AGRONOMIST`, `WORKER` și `SUPER_ADMIN` sunt explicate în mai multe locuri:

- Introducere;
- Capitolul 1, la tipuri de utilizatori;
- Capitolul 1, la operații realizate de fiecare utilizator;
- Capitolul 2, la cerințe pe roluri;
- Capitolul 5, la autorizare;
- Capitolul 7, la descrierea aplicației;
- Concluzii.

Recomandare: păstrează explicația completă doar în Capitolul 1 și Capitolul 2. În celelalte capitole, rolurile trebuie menționate doar în contextul capitolului respectiv.

Exemplu:

În Capitolul 5 nu mai trebuie explicat din nou ce face fiecare rol. Este suficient:

> Controlul accesului este realizat pe baza celor patru roluri definite anterior. În backend, rolul este verificat la nivelul endpoint-urilor, iar în frontend este folosit pentru afișarea rutelor disponibile.

### 3.2. Funcționalitățile aplicației

Funcționalitățile principale apar de mai multe ori: parcele, hartă, activități, magazie, utilaje, mentenanță, cereri, notificări, NDVI, vreme și rapoarte.

Nu este greșit să apară în mai multe capitole, dar scopul trebuie să fie diferit:

- Capitolul 1: de ce sunt necesare;
- Capitolul 2: ce trebuie să permită sistemul;
- Capitolul 3: cum sunt proiectate;
- Capitolul 4: cum sunt implementate;
- Capitolul 7: cum se văd în aplicație.

În forma actuală, Capitolul 7 seamănă prea mult cu o reformulare a Capitolului 2. Pentru reducere, Capitolul 7 ar trebui să fie scurtat și legat direct de capturi de ecran.

### 3.3. Tehnologiile

Java Spring Boot, React, MySQL, Leaflet, Sentinel Hub și Open-Meteo sunt menționate în Introducere, Capitolul 3, Capitolul 4, Capitolul 5 și Capitolul 6.

Recomandare: explicația tehnologiilor trebuie să fie concentrată în Capitolul 4. În celelalte capitole, tehnologiile trebuie menționate doar dacă susțin direct ideea secțiunii.

### 3.4. Securitatea

Autentificarea, autorizarea, validarea datelor și protejarea parolelor apar în Capitolul 2, Capitolul 4, Capitolul 5 și Capitolul 6.

Recomandare:

- Capitolul 2: cerințe de securitate, pe scurt;
- Capitolul 4: implementare, cu cel mult 1-2 fragmente de cod;
- Capitolul 5: explicația completă a securității;
- Capitolul 6: doar ce a fost testat.

## 4. Ce capitole trebuie reduse cel mai mult

### Capitolul 2

Capitolul 2 este util, dar prea granular. Fiecare cerință este scrisă ca un paragraf separat. Această structură crește mult numărul de rânduri și de pagini.

Recomandare de reducere:

- păstrează cerințele, dar scurtează explicațiile;
- elimină formulările repetate de tip „Sistemul permite...”;
- unește cerințele apropiate;
- nu explica în Capitolul 2 detalii care vor fi reluate în Capitolul 7.

Exemplu actual:

> Gestionarea utilajelor. Sistemul permite administrarea utilajelor agricole. Pentru fiecare utilaj se păstrează informații despre nume, model, tip, număr de înmatriculare, status, ore totale de funcționare și interval de mentenanță.

Variantă compactă:

> Gestionarea utilajelor. Sistemul păstrează evidența utilajelor, incluzând tipul, statusul, orele de funcționare și informațiile necesare mentenanței.

Țintă: reducere cu **800-1.200 de cuvinte**.

### Capitolul 3

Capitolul 3 este important, deoarece profesorul cere proiectare, UML și bază de date. Nu trebuie tăiat agresiv, dar trebuie curățat.

Recomandări:

- elimină din document formulări precum „Diagramă realizată de Codex: ...”; acestea nu trebuie să apară în lucrarea finală;
- titlurile figurilor nu trebuie puse cu stil `Heading`, ci cu stil de caption sau text normal;
- descrierea fiecărei diagrame trebuie să fie scurtă: ce arată și de ce este relevantă;
- descrierea tabelelor bazei de date poate fi compactată, eventual într-un tabel tehnic sau în anexă.

Țintă: reducere cu **500-800 de cuvinte**, plus câștig de spațiu prin eliminarea liniilor de tip placeholder.

### Capitolul 4

Capitolul 4 consumă multe pagini din cauza codului. Din analiză au rezultat multe paragrafe foarte scurte, mai ales linii de cod. Acestea ocupă spațiu disproporționat în Word.

Recomandare:

- păstrează doar 3-4 fragmente de cod relevante;
- fiecare fragment să aibă maximum 10-15 linii;
- nu include metode întregi dacă este suficientă secvența relevantă;
- mută fragmentele mai lungi în anexă sau elimină-le complet;
- după fiecare fragment de cod, explică în 3-5 fraze ce demonstrează.

Fragmente care merită păstrate:

- protejarea rutelor în frontend;
- verificarea rolurilor în backend;
- scăderea stocului la finalizarea activității;
- calculul raportului financiar sau integrarea NDVI, dar nu ambele în formă lungă.

Țintă: reducere cu **4-6 pagini**, chiar dacă numărul de cuvinte nu pare foarte mare.

### Capitolul 5

Capitolul de securitate este necesar, dar poate fi mai concentrat. În prezent, unele secțiuni reiau implementarea din Capitolul 4 și testarea din Capitolul 6.

Recomandări:

- păstrează structura cerută: OWASP, date sensibile, autentificare, autorizare, protecție, criptare, validare, loguri, GDPR, teste;
- elimină fragmentele de cod care au fost deja prezentate în Capitolul 4;
- păstrează explicațiile concrete despre AgroManager;
- redu listele lungi de exemple manuale.

Țintă: reducere cu **500-700 de cuvinte**.

### Capitolul 6

Capitolul 6 este bun ca intenție, dar testarea automată este prea detaliată dacă include mult cod. Lucrarea trebuie să arate că ai testat aplicația, nu să reproducă fișierele de test.

Recomandări:

- testarea manuală poate rămâne sub formă de scenarii scurte;
- pentru testarea automată, descrie clasele de test și ce verifică;
- păstrează un singur exemplu de cod JUnit, dacă este necesar;
- restul testelor pot fi prezentate în text.

Țintă: reducere cu **500-800 de cuvinte** și 2-3 pagini prin reducerea codului.

### Capitolul 7

Capitolul 7 trebuie redus cel mai atent. Este obligatoriu, dar nu trebuie să repete cerințele.

În forma actuală, rolurile și modulele sunt descrise încă o dată în detaliu. După ce adaugi capturi de ecran, textul trebuie să devină mai scurt, pentru că imaginile vor prelua o parte din explicație.

Recomandare de structură compactă:

- 7.1 Prezentare generală: 2 paragrafe;
- 7.2 Autentificare și înregistrare: 2 paragrafe;
- 7.3 Manager: 3-4 paragrafe, nu câte unul pentru fiecare pagină;
- 7.4 Agronom: 3-4 paragrafe;
- 7.5 Muncitor: 2-3 paragrafe;
- 7.6 Super Admin: 1-2 paragrafe;
- 7.7 Rapoarte și analiză: 2 paragrafe;
- 7.8 Comparație: un tabel sau 4 paragrafe scurte;
- 7.9 Avantaje și limitări: 2 paragrafe.

Țintă: reducere de la aproximativ **3.000 de cuvinte** la **1.600-1.800 de cuvinte**.

### Concluzii

Concluziile sunt bune ca idee, dar prea lungi. Unele paragrafe repetă introducerea și Capitolul 7.

Recomandare:

- păstrează rezultatele obținute;
- păstrează contribuția personală;
- păstrează limitările și direcțiile viitoare;
- elimină repetarea tehnologiilor, pentru că au fost discutate în Capitolul 4.

Țintă: reducere de la **747 de cuvinte** la **450-500 de cuvinte**.

## 5. Recomandare de paginare țintă

Pentru a ajunge la 40-50 de pagini cu diagrame și capturi incluse, textul ar trebui să ajungă aproximativ la următoarea distribuție:

| Secțiune | Țintă recomandată |
|---|---:|
| Rezumat | 1 pagină |
| Introducere | 1-1,5 pagini |
| Capitolul 1 | 4-5 pagini |
| Capitolul 2 | 5-6 pagini |
| Capitolul 3 | 8-10 pagini, cu diagrame |
| Capitolul 4 | 5-6 pagini |
| Capitolul 5 | 4-5 pagini |
| Capitolul 6 | 3-4 pagini |
| Capitolul 7 | 7-9 pagini, cu capturi |
| Concluzii | 1-1,5 pagini |

Această distribuție ar duce lucrarea în zona de **40-50 de pagini**, fără bibliografie și cuprins, dacă imaginile sunt inserate controlat.

## 6. Reguli de rescriere pentru un text mai natural

Textul nu trebuie rescris doar prin sinonime. Cea mai bună metodă este să fie făcut mai concret și mai personalizat pe proiect.

Reguli recomandate:

- fiecare paragraf important trebuie să răspundă la una dintre întrebările: ce s-a realizat, de ce s-a ales această soluție, cum funcționează în AgroManager sau ce problemă rezolvă;
- evită frazele prea generale, precum „aplicația contribuie la eficientizarea proceselor”;
- înlocuiește afirmațiile largi cu exemple concrete din aplicație;
- alternează fraze scurte cu fraze mai lungi;
- nu începe multe paragrafe la fel;
- evită repetarea expresiilor „această funcționalitate”, „această abordare”, „este important”, „sistemul permite”;
- dacă o idee a fost spusă deja într-un capitol, în capitolul următor trebuie doar legată de tema capitolului, nu explicată din nou.

Exemplu de rescriere:

Variantă prea generală:

> Aplicația contribuie la eficientizarea activităților agricole prin centralizarea informațiilor și îmbunătățirea proceselor de lucru.

Variantă mai bună:

> În AgroManager, centralizarea apare concret în momentul în care agronomul creează o lucrare pe o parcelă, alege muncitorii și utilajele, iar muncitorul raportează ulterior consumul real și cantitatea recoltată. Datele nu rămân într-un mesaj separat, ci sunt salvate în activitatea respectivă și pot fi folosite în rapoarte.

## 7. Ce aș face concret mai departe

Ordinea recomandată de lucru:

1. Scurtarea Capitolului 7, deoarece va primi capturi de ecran și acum repetă Capitolul 2.
2. Scurtarea Capitolului 4 prin reducerea fragmentelor de cod.
3. Compactarea Capitolului 2, fără a elimina cerințele importante.
4. Curățarea Capitolului 3 de linii de tip placeholder și descrieri prea lungi.
5. Scurtarea concluziilor.
6. Abia apoi actualizarea cuprinsului și a listei de figuri.

Aceasta este o reducere mai sigură decât tăierea uniformă din toate capitolele. Capitolul 3 trebuie păstrat mai consistent, pentru că profesorul cere explicit proiectarea sistemului și baza de date. În schimb, Capitolul 4, Capitolul 6 și Capitolul 7 pot fi comprimate fără să piardă valoare academică.
