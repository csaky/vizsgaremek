# 1. A rendszer célja
A BladeRunner egy borbélyszalon időpontfoglaló rendszer. Lehetővé teszi, hogy az ügyfelek szalonokat nézzenek meg, szolgáltatást válasszanak és időpontot foglaljanak. A rendszerben tulajdonosi és borbély szerepkör is van, ezért nem csak foglalásra, hanem szalon- és munkafolyamat-kezelésre is használható. 

# 2. Kiknek szól a rendszer
- Ügyfeleknek: szalonkereséshez és foglaláshoz. 
- Szalontulajdonosoknak: saját szalon, szolgáltatások és borbélyok kezelésére. 
- Borbélyoknak: saját szolgáltatások és foglalások kezelésére. 

# 3. Bejelentkezés és regisztráció
## Regisztráció
- A regisztráció a `/register` oldalon érhető el. 
- A felhasználó megadja a nevét, e-mail címét, jelszavát, telefonszámát, és kiválasztja a fiók típusát. 
- A frontend jelenleg ügyfél és tulajdonos szerepkört kínál fel közvetlen regisztrációkor.
- Sikeres regisztráció után a rendszer automatikusan bejelentkezteti a felhasználót.

## Bejelentkezés
- A bejelentkezés a `/login` oldalon történik. 
- Sikeres bejelentkezés után a token és a felhasználói adatok a böngésző `localStorage` tárába kerülnek. 

## Kijelentkezés
- A kijelentkezés a felső navigációs sávból érhető el. 

# 4. Fő képernyők és menüpontok
## Vendég felhasználó
- Főoldal: rövid bemutató és gyors linkek.
- Szalonok: nyilvános lista keresővel.
- Bejelentkezés és regisztráció. 

## Ügyfél
- Főoldal gyors műveletekkel. 
- Szalonok böngészése.
- Időpont foglalása.
- Saját foglalások kezelése. 

## Szalontulajdonos
- Saját szalonok oldala. 
- Szalon szerkesztése. 
- Globális szolgáltatások kezelése. .
- Szalonhoz tartozó szolgáltatások kezelése. 
- Borbélyok kezelése. 
- Szalon foglalásainak áttekintése.

## Borbély
- Saját foglalások. 
- Saját szolgáltatások. 

# 5. Tipikus használati folyamatok
## 5.1 Ügyfélként új foglalás készítése
1. A felhasználó megnyitja a szalonlistát vagy egy konkrét szalon oldalát. 
2. A foglalási folyamatban kiválaszt egy szalont.
3. Kiválaszt egy borbélyt és legalább egy szolgáltatást.
4. Megad egy dátumot és időpontot.
5. A rendszer összesíti a kiválasztott szolgáltatások árát.
6. A foglalás megerősítése után a rendszer a foglalások oldalra irányítja a felhasználót.

## 5.2 Saját foglalás megtekintése és lemondása
1. A felhasználó megnyitja a `Foglalásaim` oldalt. 
2. Itt látszik az időpont, a szalon neve, a borbély neve, a szolgáltatások és a státusz.
3. Függőben vagy megerősített foglalás esetén megjelenik a `Lemondás` gomb.
4. A lemondás megerősítés után történik.

## 5.3 Tulajdonosként szalon létrehozása
1. A tulajdonos megnyitja a `Szalonjaim` oldalt. 
2. Kitölti az új szalon űrlapját névvel, címmel és opcionális telefonszámmal.
3. Létrehozás után a szalon megjelenik a listában.

## 5.4 Tulajdonosként szolgáltatás hozzárendelése szalonhoz
1. A tulajdonos belép a szalon szolgáltatásai oldalra. 
2. Kiválaszt egy még nem használt globális szolgáltatást.
3. Megadja az árat és az időtartamot. 
4. Hozzáadás után a szolgáltatás megjelenik a hozzárendelt listában.

## 5.5 Tulajdonosként borbély felvétele
1. A tulajdonos megnyitja a borbélykezelő oldalt.
2. Megadja a borbély nevét, e-mail címét, jelszavát és opcionálisan telefonszámát.
3. Sikeres mentés után a borbély megjelenik a listában.

## 5.6 Borbélyként státusz módosítása
1. A borbély megnyitja a `Foglalásaim` oldalt.
2. Egy függőben vagy megerősített foglalás mellett választható státuszgombok jelennek meg.
3. A borbély `Teljesítve`, `Nem jelent meg` vagy `Lemondva` állapotot állíthat be. 

