# Persönliche Geburtstagsseite

Eine private, für Mobilgeräte optimierte Geburtstagsüberraschung.

## Vercel-Konfiguration

Die Zugangsdaten gehören ausschließlich in die geschützten Environment Variables des Vercel-Projekts:

- `DATABASE_URL` – Neon-Verbindung
- `SESSION_SECRET` – ein langer, zufälliger Wert

Der gemeinsame Eingang fragt nur das Passwort ab. Jedes Profil braucht deshalb ein eigenes Passwort; darüber wird nach dem Öffnen die richtige persönliche Seite ausgewählt.

## Private Fotos

In `gallery_images.image_url` sollte kein frei erreichbarer Bild-Link gespeichert werden, wenn die Fotos privat bleiben sollen. Die empfohlene Aufteilung ist:

1. Bilddateien in einem **privaten Vercel Blob Store** speichern.
2. In Neon nur Blob-Pfad, Bildtext, Beschriftung, Position und Besitzer speichern.
3. Bilder über eine Vercel-API ausgeben, die zuerst das vorhandene `gift_session`-Cookie prüft und danach den privaten Blob abruft.

So bleiben Daten und Bildzuordnung in Neon, während die eigentlichen Dateien in einem dafür optimierten privaten Speicher liegen. Das Speichern als PostgreSQL-`bytea` ist für wenige kleine Bilder technisch möglich, ist aber langsamer und unnötig teuer. Außerdem darf eine einzelne Antwort einer Vercel Function nicht größer als 4,5 MB sein. Fotos deshalb vor dem Upload als WebP/AVIF komprimieren.
