# Sincronizare documentație cu aplicația actuală

Acest fișier notează pe scurt ce rezultă din verificarea codului aplicației AgroManager, pentru ca lucrarea scrisă să rămână aliniată cu proiectul practic.

## Module implementate care trebuie reflectate în lucrare

Aplicația este structurată ca sistem web cu backend Java Spring Boot, frontend React și bază de date MySQL. Accesul este separat pe rolurile `FARM_MANAGER`, `AGRONOMIST`, `WORKER` și `SUPER_ADMIN`.

În backend există controllere și servicii pentru autentificare, administrare globală, fermă, angajați, parcele, activități agricole, magazie, cereri de aprovizionare, utilaje, mentenanță, notificări, istoric culturi, NDVI, vreme, subvenții pe parcelă, raport financiar și payroll.

În frontend există pagini separate pentru rolurile principale: dashboard manager, dashboard agronom, dashboard muncitor, dashboard super admin, hartă, magazie, utilaje, profil fermă, angajați, raport producție/profitabilitate, istoric agronom, istoric muncitor, payroll muncitor și strategie meteo.

Pentru muncitor este implementat fluxul de execuție a lucrării: vizualizarea taskurilor alocate, pornirea lucrării, finalizarea lucrării, introducerea intervalului efectiv, comentarii, cantitate recoltată și consumuri reale ale materialelor planificate. La finalizare, aplicația actualizează stocurile, orele utilajelor, producția asociată sezonului de cultură și notificările pentru rolurile relevante.

Pentru manager sunt implementate modulele de administrare a fermei, angajaților, magaziei, utilajelor, mentenanței, cererilor de aprovizionare, rapoartelor financiare, payroll-ului și subvențiilor APIA. Raportul financiar include producția, costurile materialelor, costul muncii, salariile agronomilor, costurile de mentenanță, veniturile din recoltă, subvențiile și profitul.

Pentru agronom sunt implementate modulele de planificare și urmărire a lucrărilor agricole, consultarea hărții și a parcelelor, istoricul culturilor, datele NDVI, vremea, magazia în regim de consultare, utilajele în regim de consultare și cererile de aprovizionare.

Pentru administratorul platformei este implementat un dashboard global, cu statistici, administrarea fermelor și utilizatorilor, consultarea și administrarea controlată a unor entități importante, precum parcele, activități, produse din magazie, cereri, utilaje, mentenanță și sezoane de cultură. Există și jurnal de audit pentru operațiile administrative.

## Funcționalități care trebuie tratate cu atenție

Consumul real de materiale este implementat la finalizarea activității. Consumul separat de combustibil, ca rubrică distinctă față de materialele din magazie, nu apare încă drept modul dedicat. Dacă în interfață va fi adăugat un câmp separat pentru combustibil, documentația poate fi actualizată în capitolele 2, 3, 4, 6 și 7.

Raportarea unui defect de utilaj de către muncitor nu apare încă drept flux separat. În prezent, muncitorul poate introduce observații la finalizarea lucrării, iar managerul gestionează utilajele și mentenanța. Dacă se implementează un formular dedicat pentru defecte, acesta trebuie adăugat la cerințele rolului `WORKER`, la diagrama de stări sau secvență și la descrierea aplicației.

Istoricul utilajelor există prin mentenanță, ore de funcționare și asocierea utilajelor cu activități. Dacă se adaugă o pagină mai clară de istoric utilaj, documentația trebuie să o descrie ca funcționalitate distinctă.

Bonusul pentru agronom nu este tratat ca funcție stabilă în codul verificat. Payroll-ul include salarii lunare pentru agronomi și plată estimată pentru muncitori pe baza orelor lucrate. Bonusul poate rămâne la dezvoltări viitoare până la implementare.

## Recomandare pentru lucrare

În textul principal este bine să fie prezentate ca funcționalități implementate doar modulele stabile: activități, consumuri reale de materiale, stocuri, cereri, utilaje, mentenanță, payroll, subvenții, raport financiar, NDVI, vreme, notificări și administrare globală.

Funcțiile încă neterminate pot apărea la „Limitări și dezvoltări viitoare”, cu formulări scurte. Astfel lucrarea rămâne coerentă, iar demo-ul practic nu riscă să fie contrazis de text.
