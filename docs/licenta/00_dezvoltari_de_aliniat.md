# Funcționalități de aliniat cu aplicația practică

Acest fișier ține evidența funcționalităților care pot fi descrise în lucrare ca parte din versiunea finală dorită, dar care trebuie verificate sau finalizate în aplicație înainte de predare.

## Funcționale deja identificate în cod

- Autentificare pe roluri: FARM_MANAGER, AGRONOMIST, WORKER, SUPER_ADMIN.
- Înregistrare fermă și cont manager.
- Profil fermă, date generale, suprafață totală calculată din parcele și jurnal decizii/ședințe.
- Management angajați pentru manager.
- Hartă interactivă cu desenare parcele, calcul suprafață și inspecție parcelă.
- Planificare lucrări agricole pe parcele.
- Atribuire muncitori și utilaje la activități.
- Consumabile planificate și consum real raportat la finalizarea lucrării.
- Scădere automată din magazie la finalizarea lucrării.
- Stoc minim și notificare pentru manager.
- Cereri de aprovizionare inițiate de agronom și aprobate/respinse de manager.
- Utilaje, tipuri de utilaje, statusuri, ore de funcționare și mentenanță.
- Istoric culturi și raport producție/recolte.
- Notificări pentru cereri, decizii și finalizare lucrări.
- NDVI prin Sentinel Hub, cu fallback/estimare locală.
- Modul meteo prin Open-Meteo și recomandări operaționale.
- Teste automate JUnit/Mockito pentru fluxul stocurilor și validări DTO.

## De verificat sau completat în aplicație

- Modul SUPER_ADMIN extins: gestiune utilizatori/ferme la nivel de platformă, dacă se dorește prezentare amplă.
- Ștergere/administrare completă angajați, nu doar afișarea butonului de ștergere.
- Read-only real pentru agronom la utilaje, dacă lucrarea va susține explicit această diferență față de manager.
- Restricții frontend clare pentru SUPER_ADMIN pe module care cer fermă asociată.
- Alerte automate pentru service utilaje și defecțiuni raportate.
- Istoric complet al lucrărilor/mentenanțelor utilajelor în raportări.
- Raportare defecțiune utilaj de către muncitor.
- Modul financiar P&L, cost/ha, venit/ha, profit/ha și subvenții APIA, dacă va fi inclus ca funcționalitate finală.
- Modul chat/forum, doar dacă va fi implementat efectiv.
- Time-lapse NDVI vizual prin slider, dacă va fi prezentat ca funcționalitate finală.
- Date suplimentare pentru muncitor: ore suplimentare, zile libere, salariu/fluturaș, doar dacă va fi implementat.
- Rearanjarea manuală a utilajelor, doar dacă va fi implementată.

## Regula de redactare

În capitolele de analiză și cerințe se poate descrie versiunea țintă a sistemului. În capitolele de implementare, testare și descriere finală trebuie ca textul să fie sincronizat cu aplicația existentă la momentul predării.
