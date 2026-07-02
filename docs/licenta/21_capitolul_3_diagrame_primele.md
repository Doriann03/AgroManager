# Capitolul 3 - cod diagrame pentru prima etapă

Acest fișier listează diagramele regenerate pentru prima parte a Capitolului 3. Nu include diagramele pentru baza de date, wireframe-urile de interfață și diagrama de infrastructură.

Diagramele au fost actualizate după codul curent al aplicației, incluzând module precum payroll, rapoarte financiare, subvenții, istoric culturi, NDVI, vreme, notificări, Super Admin și jurnal de audit.

## Diagrame regenerate

| Figură | Rol în capitol | Fișier Mermaid |
| --- | --- | --- |
| Figura 3.1 | Arhitectura generală a aplicației | `docs/licenta/diagrame/figura_3_1_arhitectura_generala.mmd` |
| Figura 3.2 | Diagrama de componente | `docs/licenta/diagrame/figura_3_2_diagrama_componente.mmd` |
| Figura 3.3 | Diagrama de pachete | `docs/licenta/diagrame/figura_3_3_diagrama_pachete.mmd` |
| Figura 3.4 | Diagrama cazurilor de utilizare | `docs/licenta/diagrame/figura_3_4_cazuri_utilizare.mmd` |
| Figura 3.5 | Diagrama de clase | `docs/licenta/diagrame/figura_3_5_diagrama_clase.mmd` |
| Figura 3.6 | Secvență pentru crearea unei activități agricole | `docs/licenta/diagrame/figura_3_6_secventa_creare_activitate.mmd` |
| Figura 3.7 | Secvență pentru finalizarea unei activități agricole | `docs/licenta/diagrame/figura_3_7_secventa_finalizare_activitate.mmd` |
| Figura 3.8 | Fluxul unei cereri de aprovizionare | `docs/licenta/diagrame/figura_3_8_flux_cerere_aprovizionare.mmd` |
| Figura 3.9 | Diagrama de stări | `docs/licenta/diagrame/figura_3_9_diagrama_stari.mmd` |

## Unde se inserează în Word

În `3.1. Arhitectura generală a sistemului`, inserează Figura 3.1 după paragraful în care sunt menționate frontend-ul React, backend-ul Spring Boot și baza de date MySQL.

În `3.2. Diagrama de componente`, inserează Figura 3.2 imediat după prima explicație despre modulele aplicației.

În `3.3. Diagrama de pachete`, inserează Figura 3.3 după descrierea pachetelor backend și frontend.

În `3.4. Diagrame ale cazurilor de utilizare`, inserează Figura 3.4 după paragraful în care sunt enumerați actorii: manager, agronom, muncitor și administrator.

În `3.5. Diagrama de clase`, inserează Figura 3.5 după paragraful care enumeră entitățile principale.

În `3.6. Diagrame de secvență pentru fluxurile principale`, inserează Figura 3.6 după descrierea creării unei activități agricole și Figura 3.7 după descrierea finalizării activității de către muncitor.

Tot în zona fluxurilor, inserează Figura 3.8 după explicația fluxului de aprovizionare.

În `3.7. Diagrama de stări`, inserează Figura 3.9 după descrierea stărilor pentru activități și cereri.

## Observații

Diagramele pentru baza de date rămân pentru etapa următoare: model conceptual, schemă logică și descriere fizică.

Wireframe-urile pentru interfața utilizator și diagrama de infrastructură nu au fost regenerate în această etapă.

Pentru inserarea în Word, exportă fiecare fișier `.mmd` ca imagine PNG sau SVG, apoi adaugă caption-ul corespunzător sub figură.
