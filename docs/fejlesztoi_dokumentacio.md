# 1. A projekt célja és felépítése
A projekt célja egy több szerepkörös borbélyszalon foglalási rendszer megvalósítása. A felépítés klasszikus, külön frontend és backend résszel:
- `frontend/`: felhasználói felület;
- `backend/`: REST API és üzleti logika;
- `database/`: MySQL séma.


# 2. Használt technológiák
## Backend
- Node.js
- Express
- mysql2
- jsonwebtoken
- bcryptjs
- express-validator
- nodemailer
- Jest
- Supertest


## Frontend
- React 18
- React Router v6
- Axios
- Vite
- Bootstrap


# 3. Főbb modulok és rétegek
## Backend rétegek
- `routes/`: végpontok és middleware láncok. 
- `controllers/`: üzleti logika és adatbázis műveletek. 
- `validators/`: bemeneti ellenőrzés.
- `middlewares/`: auth és jogosultság. 
- `config/`: külső szolgáltatás konfiguráció, jelenleg e-mail. 

## Frontend rétegek
- `pages/`: alap oldalak, például főoldal, login, register, szalonlista.
- `features/`: szerepkör vagy funkció szerinti nagyobb egységek. 
- `app/`: router és globális provider. 
- `lib/`: API kliens. 
- `components/`: újrahasználható elemek. 

# 4. Adatbázis felépítése röviden
A modell központi eleme a `users` tábla, ehhez kapcsolódnak az altípus táblák:
- `customers`
- `owners`
- `barbers`

Erre épülnek:
- `salons`
- `services`
- `salon_services`
- `barber_services`
- `appointments`
- `appointment_services`

Ez a megoldás egyszerre támogatja a szerepkörök elkülönítését és a több kapcsolódó üzleti folyamatot. 

# 5. API végpontok összefoglalója
## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`


## Szalon
- `GET /api/salons`
- `GET /api/salons/:id`
- `POST /api/salons`
- `PUT /api/salons/:id`
- `GET /api/salons/:id/services`
- `POST /api/salons/:id/services`
- `DELETE /api/salons/:id/services/:serviceId`


## Szolgáltatás
- `GET /api/services`
- `POST /api/services`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`


## Borbély
- `GET /api/salons/:id/barbers`
- `POST /api/salons/:id/barbers`
- `DELETE /api/salons/:id/barbers/:userId`
- `GET /api/barbers/:id/services`
- `POST /api/barbers/:id/services`


## Foglalás
- `POST /api/appointments`
- `GET /api/appointments/my`
- `DELETE /api/appointments/:id`
- `GET /api/appointments/salon/:id`
- `PATCH /api/appointments/:id/status`


# 6. Frontend és backend kapcsolata
- A frontend minden API hívást az Axios példányon keresztül küld. 
- A token automatikusan bekerül az `Authorization` fejlécbe. 
- A frontend Vite proxyt használ, így fejlesztői környezetben nem kell teljes backend URL-t megadni. 

# 7. Funkciók és megvalósításuk
## Funkció neve: Felhasználó regisztráció
- Rövid leírás: új ügyfél, tulajdonos vagy borbély létrehozása.
- Érintett fájlok: `backend/routes/auth.routes.js`, `backend/controllers/auth.controller.js`, `backend/validators/auth.validator.js`, `frontend/src/pages/Register.jsx`
- Használt technológia: Express, MySQL, bcryptjs, JWT, React, Axios


## Funkció neve: Bejelentkezés
- Rövid leírás: meglévő felhasználó hitelesítése.
- Érintett fájlok: `backend/controllers/auth.controller.js`, `frontend/src/pages/Login.jsx`, `frontend/src/app/provider.jsx`
- Használt technológia: bcryptjs, JWT, React Context


## Funkció neve: Szalonlista és részletes nézet
- Rövid leírás: a felhasználó böngészheti a szalonokat.
- Érintett fájlok: `backend/controllers/salon.controller.js`, `frontend/src/pages/SalonList.jsx`, `frontend/src/pages/SalonDetails.jsx`
- Használt technológia: Express, MySQL, React


## Funkció neve: Szalon létrehozás és szerkesztés
- Rövid leírás: a tulajdonos saját szalont hozhat létre és módosíthat.
- Érintett fájlok: `backend/controllers/salon.controller.js`, `frontend/src/features/salon/MySalon.jsx`, `frontend/src/features/salon/EditSalon.jsx`
- Használt technológia: Express, MySQL, React formkezelés


## Funkció neve: Globális szolgáltatáskezelés
- Rövid leírás: szolgáltatások létrehozása, módosítása, törlése.
- Érintett fájlok: `backend/controllers/service.controller.js`, `frontend/src/features/service/ManageServices.jsx`
- Használt technológia: Express, MySQL, React

## Funkció neve: Szalonszintű szolgáltatás-hozzárendelés
- Rövid leírás: egy szalonhoz ár és időtartam megadásával rendelhető szolgáltatás.
- Érintett fájlok: `backend/controllers/salon.controller.js`, `frontend/src/features/service/SalonServices.jsx`
- Használt technológia: Express, MySQL, React

## Funkció neve: Borbély felvétele
- Rövid leírás: a tulajdonos új borbély felhasználót hoz létre a saját szalonjába.
- Érintett fájlok: `backend/controllers/barber.controller.js`, `frontend/src/features/barber/ManageBarbers.jsx`
- Használt technológia: Express, MySQL, bcryptjs, React

## Funkció neve: Borbély szolgáltatáskezelés
- Rövid leírás: a borbély saját magához rendelhet szolgáltatásokat.
- Érintett fájlok: `backend/controllers/barber.controller.js`, `frontend/src/features/barber/BarberServices.jsx`
- Használt technológia: Express, MySQL, React

## Funkció neve: Időpontfoglalás
- Rövid leírás: ügyfél időpontot foglal szalonhoz, borbélyhoz és szolgáltatásokhoz.
- Érintett fájlok: `backend/controllers/appointment.controller.js`, `frontend/src/features/appointment/BookAppointment.jsx`
- Használt technológia: Express, MySQL, React

## Funkció neve: Saját foglalások kezelése
- Rövid leírás: ügyfél és borbély megtekintheti a saját időpontjait.
- Érintett fájlok: `backend/controllers/appointment.controller.js`, `frontend/src/features/appointment/MyAppointments.jsx`, `frontend/src/features/barber/BarberAppointments.jsx`
- Használt technológia: Express, MySQL, React

# 8. Fejlesztés közben használt eszközök
- `nodemon`: backend újraindítás fejlesztés közben.
- Vite dev szerver: frontend fejlesztéshez.
- Jest és Supertest: backend API teszteléshez. 
