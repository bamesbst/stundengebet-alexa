# stundengebet-alexa | Database
Datenbank für den Skill zum liturgischen Stundengebet auf dem Sprachassistenten "Amazon Alexa".

## Data
Dieser Ordner enthält SQL-Dateien, welche die tagesaktuellen ID-Zuordnungsschlüssel des Deutschen Liturgischen Instituts (DLI) zu den einzelnen Horen und Elementen des Stundengebets enthalten.
Die Dateien sind jeweils jährlich zu generieren und werden im Verzeichnis unter Angabe des entsprechenden Jahre gespeichert.

### Files
* Die Datei `dli_daily.sql` enthält die Datenbankstruktur und bildet somit die Felder (Spalten) der Tabelle `dli_daily` ab. Diese Datei ist jahresunabhängig.
* Die Datei `YEAR-dli_daily_content.sql` enthält die Daten (Zeilen) der Tabelle `dli_daily` für jeden Tag des jeweiligen Jahres.
* Die Datei `display-database.php` enthält ein PHP-Skript, welches die derzeit bestehenden Daten (für Redaktions- und Demonstrationszwecke) anzeigt. Diese Datei muss auf dem zugehörigen Webserver ausgeführt werden.

## Structure
Die Struktur der Tabelle `dli_daily` umfasst:
1. ID als Primary-Key des jeweiligen Tagesdatensatzes (`id`)
2. Bezeichnendes Datum (`date`) und die Kalenderwoche (`week`)
3. Daten zum liturgischen Tag und den Tagestexten
	1. Allgemeine Daten (Bezeichnungen)
	2. Tagestexte (IDs)
4. Daten zu den einzelnen Horen des Stundengebets. Wo immer die IDs biblischer Texte (z.B. Psalmen) angegeben werden, wird in einem weiteren Feld auch die jeweilige Bezeichnung (i.d.R. die Bibelstelle) angegeben. Die einzelnen Felder (Spalten) innerhalb der Datensätze zu den Horen ergeben sich aus deren jeweiligen Struktur.
	1. Lesehore (`stb_readings_`)
	2. Invitatorium (`stb_inv_`)
	3. Laudes (`stb_lauds_`)
	4. Vesper (`stb_vespers_`)
	5. Kleine Horen (Terz: `stb_3_`, Sext: `stb_3_`, Non: `stb_9_`)
	6. Komplet (`stb_compline_`)

### Data demonstration
Die aktuellen Daten der Live-Datenbank können [hier (Link)](https://stundenbuch.bamesbst.de/laudes/display-database.php) angezeigt/geprüft werden
	
## Copyright
Diese Daten wurden unentgeltlich durch das Deutsche Liturgische Institut (DLI) zur Verfügung gestellt.
Eine Verwendung ist nur im Zusammenhang mit dem Alexa-Skill zum liturgischen Stundengebet zulässig und bedarf ggfs. der Genehmigung durch das DLI.
Die kommerzielle Nutzung der Daten ohne schriftliche Einwilligung des DLI ist ausgeschlossen.
Hinweis: Amazon, Alexa und alle zugehörigen Logos sind Marken von Amazon.com, Inc. oder seinen verbundenen Unternehmen.
