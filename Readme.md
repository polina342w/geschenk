# Persönliche Geburtstagsseite

Mobile Geburtstagsseite mit sicherem Login, separaten Inhalten je Nutzer, zehn Fotoplätzen und Geburtstagsanimationen.

## Kostenlos online stellen

1. Bei [Neon](https://neon.tech/) ein kostenloses PostgreSQL-Projekt erstellen. Neon skaliert bei Inaktivität herunter; ein wöchentliches Keep-alive-Skript ist nicht nötig.
2. Im Neon SQL Editor den Inhalt von `database/schema.sql` ausführen. Dadurch entsteht der Nutzer `Tim` mit einem zunächst unbekannten Zufallspasswort.
3. Direkt im privaten Neon SQL Editor (nicht in einer Datei im öffentlichen Repo) einmal ausführen und den Platzhalter durch das gewünschte Passwort ersetzen:

```sql
UPDATE users
SET password_hash = crypt('HIER_DEIN_PASSWORT', gen_salt('bf'))
WHERE username = 'Tim';
```
4. Das öffentliche GitHub-Repo in Vercel importieren.
5. In Vercel unter **Settings → Environment Variables** eintragen:
   - `DATABASE_URL`: die Neon-Verbindungsadresse
   - `SESSION_SECRET`: ein zufälliger Wert mit mindestens 32 Zeichen
6. Neu deployen. Vercel erkennt die API-Funktionen automatisch.

Lokal: `npm install`, `.env.example` als `.env.local` kopieren, Werte einsetzen und `npm run dev` starten. Echte `.env`-Dateien niemals committen.

## Texte und Bilder ändern

Bilder nicht als Binärdaten in PostgreSQL speichern. Sie gehören z. B. in Vercel Blob oder Cloudinary; in der DB wird nur ihre URL gespeichert.

```sql
UPDATE gallery_images
SET image_url='https://deine-bild-url.jpg',caption='Unser erster Urlaub',note='Sommer 2025',alt_text='Tim am Meer'
WHERE user_id=(SELECT id FROM users WHERE username='Tim') AND position=1;
```

Weitere Personen bekommen je einen Eintrag in `users` und `profiles`. Die API leitet aus der verschlüsselten Session ab, welche persönliche Seite geladen werden darf.

## Sicherheit

- `DATABASE_URL` und `SESSION_SECRET` bleiben nur in Vercel und kommen nie ins öffentliche Repository.
- Passwörter werden mit PostgreSQL `pgcrypto` gehasht.
- Die Session nutzt ein `HttpOnly`, `Secure`, `SameSite=Strict` Cookie.
- Das Backend entscheidet serverseitig, welche Nutzerseite geladen wird.
