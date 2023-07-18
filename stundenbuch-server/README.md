# stundengebet-alexa | Server
Server zum Verarbeiten und Bereitstellen der vom Deutschen Liturgischen Institut (DLI) gelieferten liturgischen Texte für den Skill zum liturgischen Stundengebet auf dem Sprachassistenten "Amazon Alexa".

## Data
Bei den hier vorliegenden Daten handelt es sich um den kompletten Webservice, der für das Einlesen, Parsen und Bereitstellen der Daten erforderlich ist. Zum Betrieb ist ein Webserver (PHP) erforderlich, der seitens des Skills über eine entsprechende URL erreichbar ist. Seinerseits muss der Server auch Zugriff auf die entsprechende MySQL-Datenbank haben, welche die tagesaktuellen IDs des DLI enthält.

### Files
* Die Datei `index.php` muss zur Nutzung des Webservices aufgerufen werden. Sie führt die Authentifizierungsprüfung durch, stellt eine Verbindung zur Datenbank her und ruft dann die weiteren Funktionsdateien auf, welche zum Abruf, zum Parsen und zum Bereitstellen der Daten für den Skill erforderlich sind.
* Die Datei `functions.php` enthält die einzelnen Parsing- und Abruf-Funktionen.
* Die Datei `output.php` stellt unter Nutzung der in `functions.php` spezifizierten Funktionen einen strukturierten XML-Datensatz zur Verfügung, welcher die verarbeiteten Daten des DLI für den Skill enthält.
* Die Datei `db_config_sample.php` zeigt die zu konfigurierenden Parameter, welche für den Zugriff zur MySQL-Datenbank notwendig sind.
* Die Datei `pw_config_sample.php` zeigt die zu konfigurierenden Parameter, welche für den Passwortschutz des Webservice oder dessen Überbrückung notwendig sind.

## Installation
Zur Installation des Webservices müssen die o.g. Voraussetzungen geschaffen werden. Ggfs. erfordert der jeweilige Webserver bestimmte Anpassungen in der Konfiguration oder die Installation bestimmter Plugins, damit der Webservice voll funktionsfähig ist.
Anschließend müssen die jeweiligen Parameter der beiden Konfigurationsdateien gesetzt werden. Dazu können die Dateien mit dem Zusatz `_sample` kopiert werden (Beispiel: `db_config_sample.php` -> `db_config.php`). Bitte achten Sie bei den kopierten Dateien mit den tatsächlichen Konfigurationsparametern unbedingt auf die adäquate und sichere Vergabe der entsprechenden Dateirechte.
	
## Copyright
Eine Verwendung des Webservices ist nur im Zusammenhang mit dem Alexa-Skill zum liturgischen Stundengebet zulässig und bedarf der Genehmigung durch den Entwickler.
Hinweis: Amazon, Alexa und alle zugehörigen Logos sind Marken von Amazon.com, Inc. oder seinen verbundenen Unternehmen.
