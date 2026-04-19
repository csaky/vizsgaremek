# 1. Rövid technikai áttekintés
A BladeRunner két fő részből áll:
- frontend: React + Vite kliensalkalmazás;
- backend: Node.js + Express REST API;
- adatbázis: MySQL.

A frontend fejlesztői módban a `3000` porton fut, és az `/api` hívásokat a `5000` porton futó backend felé proxyzza. 

# 2. Szükséges szoftverkörnyezet
- Windows 11
- PowerShell
- Node.js 18 vagy újabb
- npm
- MySQL 8 vagy kompatibilis MySQL szerver


# 3. Telepítési előfeltételek
- A MySQL szerver legyen elérhető.
- Legyen létrehozható a `bladerunner` adatbázis.
- A backendhez szükséges `.env` fájl legyen beállítva.
- A frontend és backend függőségek legyenek telepítve.

# 4. Függőségek telepítése
## Backend
```powershell
Set-Location ...\backend
npm install
```

## Frontend
```powershell
Set-Location ...\frontend
npm install
```


# 5. Konfigurációs fájlok és környezeti változók
## Backend `.env`
A repo tartalmaz mintafájlt:
- `backend/.env.example:1-16`

Javasolt lépés:
```powershell
Set-Location ...\backend
Copy-Item .env.example .env
```

## Használt változók
- `PORT`: backend port, alapértelmezésben `5000`.
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: MySQL kapcsolat.`backend/.env.example:3-7`
- `JWT_SECRET`, `JWT_EXPIRES_IN`: token aláírás és lejárat. 
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`: üdvözlő e-mail küldéshez. 

# 6. Adatbázis beállítása
Az adatbázis létrehozását és a táblák definiálását a `database/schema.sql` végzi. 

PowerShell példa:
```powershell
mysql -u root -p ...\schema.sql
```

A séma tartalmazza:
- az adatbázis létrehozását;
- a táblák létrehozását;
- 5 alap szolgáltatás seed adatát.



# 7. Migráció és seed
- Külön migrációs keretrendszer nem látszik a repóban.
- A seed adatok közvetlenül a `schema.sql` részeként szerepelnek.
- A fájl végén van kommentelt SQL a `no_show` státusz hozzáadására már futó adatbázis esetére. Hivatkozás: `database/schema.sql:133-136`

# 8. Indítás Windows 11 és PowerShell alatt
## Backend indítása fejlesztői módban
```powershell
Set-Location ...\backend
npm run dev
```


## Backend indítása normál módban
```powershell
Set-Location ...\backend
npm start
```


## Frontend indítása fejlesztői módban
```powershell
Set-Location ...\frontend
npm run dev
```


## Frontend build készítése
```powershell
Set-Location ...\frontend
npm run build
```


# 9. Fejlesztői és produkciós mód
## Fejlesztői mód
- backend: `nodemon` figyeli a változásokat.
- frontend: Vite dev szerver fut proxyval. 

## Produkciós jellegű mód
- backend: `node server.js`
- frontend: `npm run build`, majd a `dist` mappa szolgálható ki külön webszerverrel


# 10. Futtatási ellenőrzések
## Backend teszt
```powershell
Set-Location ...\backend
npm test
```


Valós futtatási eredmény:
- 4 tesztcsomagból 4 sikeres.

## Frontend build
A `npm run build` parancs sikeresen lefutott, és a `dist` mappa létrejött.


