# stundengebet-alexa | Skill
Alexa-Skill zum liturgischen Stundengebet (Laudes) auf dem Sprachassistenten "Amazon Alexa".

## Data
Bei den hier vorliegenden Daten handelt es sich um den kompletten Datensatz, der zum Betrieb des Alexa-Skills erforderlich ist. Als Laufzeitumgebung sollte ein entsprechendes Projekt in der Alexa Developer Console angelegt werden, von hieraus werden auch eine node-js-Umgebung sowie eine DynamoDB-Datenbank bereitgestellt.

### Files
* Die Datei `skill.json` enthält die Rahmendaten des Skills und ist zu dessen Aufruf (*Invocation*) sowie zur grundsätzlichen technischen Struktur erforderlich.
* Der Ordner `assets/` enthält intergrierte Dateien (wie z.B. Bilder).
* Der Ordner `interaction Models/` enthält (als json-Dateien) die Struktur (*Interaction Model*) des Skills und ist somit die Voraussetzung zum Aufruf des Skills, zur Zuweisung der Interaktionen (*Utterances* und *Intent Slots*) und zum Ablauf der dialogischen Kommunikation.
* Der Ordner `lambda/` enthält den zum Betrieb der Laufzeitumgebung (JavaScript bzw. *node.js*) erforderlichen Skriptcode. Hierüber werden die Hauptfunktionen (`lambda/index.js`) des Skills abgewickelt und konfiguriert.

## Installation
Zur Installation des Skills müssen die o.g. Voraussetzungen geschaffen werden. Ggfs. sind Anpassungen im Grundgerüst des Skills notwendig, um ihn in einem neuen Projekt der Alexa Developer Console zu betreiben.
	
## Copyright
Eine Verwendung ist nur im Zusammenhang mit dem Alexa-Skill zum liturgischen Stundengebet zulässig und bedarf der Genehmigung durch den Entwickler.

Hinweis: Amazon, Alexa und alle zugehörigen Logos sind Marken von Amazon.com, Inc. oder seinen verbundenen Unternehmen.
