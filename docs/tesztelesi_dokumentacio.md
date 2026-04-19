# 1. Tesztelés célja

A tesztelés célja annak ellenőrzése, hogy a rendszer fő funkciói helyesen működnek-e, különösen:
- a hitelesítés (regisztráció, bejelentkezés, jogosultságkezelés);
- a szalonkezelés (létrehozás, lekérdezés, jogosultság-ellenőrzés);
- a szolgáltatáskezelés (létrehozás, lekérdezés, jogosultság-ellenőrzés);
- a szerver alapvető elérhetősége.

A borbélykezelés és az időpontfoglalás automatizált tesztelése helyett ezeket manuálisan ellenőriztük.


# 2. Alkalmazott tesztelési módszerek rövid magyarázata

## Manuális tesztelés
A felhasználó vagy tesztelő kézzel kipróbálja a rendszer funkcióit a felületen. A projekt frontendhez és a foglalási folyamathoz kapcsolódó ellenőrzése manuálisan történt, mivel a projektben nincs Playwright, Cypress vagy hasonló UI-tesztelő eszköz.

## Automatizált tesztelés
Programkód futtat teszteket, és automatikusan ellenőrzi az eredményt. A backendben Jest és Supertest kombináció végzi ezt. A Supertest HTTP kéréseket küld a futó Express alkalmazásnak anélkül, hogy valódi portot kellene megnyitni. 


# 3. Meglévő automatizált tesztek

## 3.1 Health check
- Fájl: `backend/tests/health.test.js`
- Mit ellenőriz: a `GET /api/health` végpont `200` státusszal és `{ status: 'ok' }` adattal tér vissza.


## 3.2 Auth tesztek
- Fájl: `backend/tests/auth.test.js`
- Fő esetek:
  - sikeres ügyfél regisztráció: `201` státusz, token visszaadása;
  - duplikált email elutasítása: `409` státusz;
  - helyes adatokkal bejelentkezés: `200` státusz, token visszaadása;
  - hibás jelszóval bejelentkezés: `401` státusz;
  - `GET /api/auth/me` érvényes tokennel: `200`, helyes email visszaadása;
  - `GET /api/auth/me` token nélkül: `401` státusz.
- Tesztek után a létrehozott tesztfelhasználó törlésre kerül az adatbázisból.


## 3.3 Szalon tesztek
- Fájl: `backend/tests/salon.test.js`
- Fő esetek:
  - `GET /api/salons` publikusan elérhető, tömböt ad vissza;
  - `POST /api/salons` tulajdonosi tokennel: `201` státusz, `salon_id` visszaadása;
  - `POST /api/salons` bejelentkezés nélkül: `401` státusz;
  - `GET /api/salons/:id` létező szalonra: `200`, helyes azonosító visszaadása;
  - `GET /api/salons/:id` nem létező szalonra: `404` státusz.
- A `beforeAll` létrehoz egy teszt owner felhasználót; az `afterAll` törli a szalont és a felhasználót.


## 3.4 Szolgáltatás tesztek
- Fájl: `backend/tests/service.test.js`
- Fő esetek:
  - `GET /api/services` publikusan elérhető, tömböt ad vissza;
  - `POST /api/services` tulajdonosi tokennel: `201` státusz, `service_id` visszaadása;
  - `POST /api/services` bejelentkezés nélkül: `401` státusz.
- A `beforeAll` létrehoz egy teszt owner felhasználót; az `afterAll` törli a szolgáltatást és a felhasználót.


# 4. Manuális tesztelés

A frontend használata alapján a következő manuális tesztek kerültek elvégzésre:
- regisztráció ügyfélként és tulajdonosként;
- login és logout;
- szalonok keresése a listában;
- szalon részleteinek megnyitása;
- időpontfoglalás végigvitele (szalon → borbély → szolgáltatás → naptár → megerősítés);
- foglalás lemondása;
- tulajdonosként szalon létrehozása és szerkesztése;
- szolgáltatás hozzáadása szalonhoz árral és időtartammal;
- borbély felvétele tulajdonosként;
- borbélyként foglalás státuszának módosítása.


# 5. Tesztelési eredmények

## Automatizált tesztek futtatása

Futtatott parancs:
```powershell
Set-Location ...\backend
npm test
```

Eredmény:
- 4 tesztcsomagból 4 sikeres.

## Sikeres csomagok
- `health.test.js`
- `auth.test.js`
- `salon.test.js`
- `service.test.js`

