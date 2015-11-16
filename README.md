# Karte der Asylgroßaufträge
Karte aller Großaufträge im Bereich Flüchtlingsunterkünfte/Asyl aus der Europäischen Ausschreibungsdatenbank TED. Welches Unternehmen hat wann, wie viele Auftraäge bekommen und für was? Die Visualisierung benutzt die JavaScript-Bibliothek D3.js.

Artikel:
Direktlink:

### Verwendung
1. Repository klonen `git clone https://...`
2. Erforderliche Module installieren `npm install`
3. Projekt bauen mit `grunt build
4. Webseite über Apache oder einen ähnlichen HTTP-Server ausliefern

### Daten
**germany.json**: Deutschland mit Bundesländern im TopoJSON-Format

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

### Verbesserungen
- Dependencies nicht einchecken, sondern über Bower installieren.
