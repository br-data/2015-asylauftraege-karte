# Karte der Asylgroßaufträge
Karte aller Großaufträge im Bereich Flüchtlingsunterkünfte/Asyl aus der Europäischen Ausschreibungsdatenbank [TED](http://ted.europa.eu/TED/main/HomePage.do). Welches Unternehmen hat wann, wie viele Aufträge bekommen und für was? Die Visualisierung benutzt die JavaScript-Bibliothek [D3.js](https://d3js.org/).

- **Artikel**: https://www.br.de/nachrichten/asyl-grossauftraege-karte-104.html
- **Direktlink**: https://web.br.de/interaktiv/asylauftraege/

### Verwendung
1. Repository klonen `git clone https://...`
2. Erforderliche Module installieren `npm install`
3. Projekt bauen mit `grunt dist`
4. Website über Apache oder einen ähnlichen HTTP-Server ausliefern

### Daten
Öffentliche Aufträge ab einer gewissen Größenordnung müssen EU-weit ausgeschrieben werden. Diese Aufträge werden in der öffentlich einsehbaren EU-Datenbank [TED](http://ted.europa.eu/TED/main/HomePage.do) gesammelt. Für verschiedene Auftraggeber gelten dabei unterschiedliche Schwellenwerte. Die meisten Aufträge im Bereich Asyl werden von Landesbehörden vergeben, die ihre Aufträge ab einem Volumen von 207.000 € veröffentlichen müssen. Die genauen [Schwellenwerte](http://www.bmwi.de/Redaktion/DE/Dossier/oeffentliche-auftraege-und-vergabe.html) hat das Bundeswirtschaftsministerium veröffentlicht.


*Die Daten wurden zuletzt am 26.11.2015 aktualisiert.*

**locations.json**: Alle Auftraggeber/-nehmer mit Geokoordinaten
```
{
  "id": 101,
  "name": "Kaufmann Bausysteme GmbH",
  "city": "Reuthe",
  "lat": 47.56123,
  "long": 9.993836,
  "type": "gewinnorientiert",
  "sector": "Bau/Planung",
  "type": "client"
}

```

**contracts.json**: Alle Ausschreibungen mit Quelle
```
{
  "source": 1,
  "target": 100,
  "id": 1000,
  "name": "Berlin: Notdusche",
  "year": 2015,
  "url": "http://ted.europa.eu/udl?uri=TED:NOTICE:385111-2015:TEXT:DE:HTML&src=0"
}
```

**germany.json**: Deutschland mit Bundesländern im TopoJSON-Format

### Entwickeln
Die Karte der Asylgroßaufträge eine Web-Anwendung basierend auf HTML, CSS und JavaScript. Zum Entwickeln und Bauen werden jedoch [Node.js](https://nodejs.org/en/), der dazugehörige Paketmanager [NPM](https://www.npmjs.com/) und das Grunt-Kommandozeilen-Interface [grunt-cli](https://github.com/gruntjs/grunt-cli) benötigt:

Grunt-cli muss einmalig global installiert werden:

```
$ npm install -g grunt-cli
```

Das Projekt kann dann mit `grunt dist` gebaut werden. Dabei werden JavaScript und CSS-Dateien zusammengefasst und optimiert. 

Zum lokalen Entwickeln ist ein kleiner [HTTP-Server](https://github.com/indexzero/http-server) integriert. Diesen kann man mit dem Befehl `npm start` starten. Der Server läuft unter http://localhost:8080. Beim Starten des Entwicklungsservers sollte automatisch ein neues Browserfenster aufgehen.

