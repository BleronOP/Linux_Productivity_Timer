# Timer App

Eine Linux-fokussierte Timer-App mit Windows-inspirierter Bedienung, gebaut mit Flask.

## Features

- Mehrere Timer parallel verwalten
- Schnellstart-Presets (1/5/10/25/45 Minuten)
- Start/Pause/Reset pro Timer
- Fortschrittsanzeige pro Timer
- Persistenz via `localStorage` (Timer bleiben nach Reload erhalten)
- Klingelton + Hinweis, wenn ein Timer abgelaufen ist

## Start ohne Terminal (per Klick/Button)

Du kannst die App jetzt mit einer kleinen Launcher-Oberfläche starten:

```bash
python launch_timer_app.py
```

Dann öffnet sich ein Fenster mit dem Button **„▶ Timer App starten“**. Ein Klick startet den Flask-Server und öffnet die App im Browser automatisch.


### Voller Ein-Klick-Start unter Linux

Zusätzlich liegen diese Dateien im Repo:

- `start_timer_app.sh`
- `Timer-App.desktop`

So nutzt du sie:
1. Datei `Timer-App.desktop` ausführbar machen (Dateimanager: Rechtsklick → Eigenschaften → Ausführbar).
2. Doppelklick auf `Timer-App.desktop`.
3. Der Launcher öffnet sich, dann auf **„▶ Timer App starten“** klicken.

## Klassisch mit Terminal starten

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Dann im Browser öffnen: `http://localhost:8000`

## Check ausführen: `python -m compileall app.py`

Diesen Befehl gibst du im Projektordner in einem Terminal ein. Er prüft, ob `app.py` ohne Syntaxfehler kompiliert.

## Wenn du **kein Terminal** hast

Du hast drei einfache Optionen:

1. **VS Code (empfohlen)**
   - Projekt in VS Code öffnen.
   - Menü **Terminal → New Terminal**.
   - Dort den Befehl eingeben: `python -m compileall app.py`.

2. **PyCharm**
   - Projekt öffnen.
   - Unten den Tab **Terminal** öffnen.
   - Befehl ausführen: `python -m compileall app.py`.

3. **GitHub Codespaces / Gitpod / Cloud-IDE**
   - Repository online öffnen.
   - Dort ein integriertes Terminal nutzen.
   - Befehl ausführen wie oben.

### Geht es ganz ohne irgendein Terminal?

**Nicht direkt.** Für diesen konkreten Befehl brauchst du eine Shell/Terminal-Umgebung.

Wenn du wirklich keine Shell verwenden willst, kannst du stattdessen:
- die App direkt starten (`python app.py`) über einen „Run“-Button deiner IDE,
- oder den neuen Launcher nutzen (`python launch_timer_app.py`) und dort auf **Start** klicken.


## Warum ist es auf GitHub noch gleich?

Änderungen in dieser Umgebung sind erst lokal im Git-Branch gespeichert. Damit du sie auf GitHub siehst, musst du sie in dein Remote-Repository pushen.

```bash
git status
git log --oneline -5
git push origin <dein-branch>
```

Wenn dein Standard-Branch `main` ist und du direkt darauf arbeitest:

```bash
git push origin main
```

Wenn du mit Pull Request arbeitest, push zuerst den Feature-Branch und öffne dann den PR auf GitHub.
