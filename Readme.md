# Persönliche Geburtstagsseite

Eine private, für Mobilgeräte optimierte Geburtstagsüberraschung.

## Vercel-Konfiguration

Die Zugangsdaten gehören ausschließlich in die geschützten Environment Variables des Vercel-Projekts:

- `DATABASE_URL` – Neon-Verbindung
- `SESSION_SECRET` – ein langer, zufälliger Wert
- `ADMIN_UPLOAD_SECRET` – separates, langes Passwort für `/admin.html`
- `BLOB_STORE_ID` oder die vom verbundenen Store erzeugte `*_STORE_ID`-Variable – Private-Blob-Store

Der gemeinsame Eingang fragt nur das Passwort ab. Jedes Profil braucht deshalb ein eigenes Passwort; darüber wird nach dem Öffnen die richtige persönliche Seite ausgewählt.

## Private Fotos

In `gallery_images.image_url` sollte kein frei erreichbarer Bild-Link gespeichert werden, wenn die Fotos privat bleiben sollen. Die empfohlene Aufteilung ist:

1. Bilddateien in einem **privaten Vercel Blob Store** speichern.
2. In Neon nur Blob-Pfad, Bildtext, Beschriftung, Position und Besitzer speichern.
3. Bilder über eine Vercel-API ausgeben, die zuerst das vorhandene `gift_session`-Cookie prüft und danach den privaten Blob abruft.

So bleiben Daten und Bildzuordnung in Neon, während die eigentlichen Dateien in einem dafür optimierten privaten Speicher liegen. Das Speichern als PostgreSQL-`bytea` ist für wenige kleine Bilder technisch möglich, ist aber langsamer und unnötig teuer. Außerdem darf eine einzelne Antwort einer Vercel Function nicht größer als 4,5 MB sein. Fotos deshalb vor dem Upload als WebP/AVIF komprimieren.

## Fotos zuordnen

1. Bilder im Vercel Dashboard in den verbundenen Private Blob Store hochladen.
2. `/admin.html` auf der bereitgestellten Website öffnen.
3. Mit `ADMIN_UPLOAD_SECRET` anmelden.
4. Reihenfolge, Überschrift, kleinen Text und finales Foto auswählen.
5. **In Neon speichern** drücken.

Private Bilder werden auf der Geschenkseite ausschließlich über `/api/photo` nach erfolgreicher Geschenk-Anmeldung ausgeliefert. Die direkten Blob-Adressen werden nicht an den normalen Content-Endpunkt weitergegeben.
