import subprocess
import sys
import threading
import time
import tkinter as tk
import urllib.error
import urllib.request
import webbrowser
from pathlib import Path

HOST = "http://127.0.0.1:8000"
APP_FILE = Path(__file__).with_name("app.py")


class TimerLauncher:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.process: subprocess.Popen[str] | None = None

        root.title("Timer App Launcher")
        root.geometry("360x180")
        root.resizable(False, False)

        frame = tk.Frame(root, padx=18, pady=18)
        frame.pack(fill="both", expand=True)

        self.status_var = tk.StringVar(value="Bereit. Klicke auf Start.")

        title = tk.Label(frame, text="Timer App", font=("Segoe UI", 16, "bold"))
        title.pack(anchor="w")

        subtitle = tk.Label(
            frame,
            text="Starte die Web-App ohne Terminal.",
            font=("Segoe UI", 10),
        )
        subtitle.pack(anchor="w", pady=(0, 10))

        self.start_button = tk.Button(
            frame,
            text="▶ Timer App starten",
            font=("Segoe UI", 11, "bold"),
            command=self.start_app,
            bg="#2563eb",
            fg="white",
            activebackground="#1d4ed8",
            activeforeground="white",
            relief="flat",
            padx=12,
            pady=10,
        )
        self.start_button.pack(fill="x")

        self.stop_button = tk.Button(
            frame,
            text="■ Stoppen",
            command=self.stop_app,
            state="disabled",
        )
        self.stop_button.pack(fill="x", pady=(8, 0))

        status = tk.Label(frame, textvariable=self.status_var, fg="#374151")
        status.pack(anchor="w", pady=(10, 0))

        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    def start_app(self) -> None:
        if self.process and self.process.poll() is None:
            self.status_var.set("App läuft bereits – Browser wird geöffnet.")
            webbrowser.open(HOST)
            return

        if not APP_FILE.exists():
            self.status_var.set("Fehler: app.py wurde nicht gefunden.")
            return

        self.status_var.set("Starte Server …")
        self.start_button.config(state="disabled")

        self.process = subprocess.Popen(
            [sys.executable, str(APP_FILE)],
            cwd=APP_FILE.parent,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            text=True,
        )

        self.stop_button.config(state="normal")

        thread = threading.Thread(target=self._wait_and_open_browser, daemon=True)
        thread.start()

    def _wait_and_open_browser(self) -> None:
        timeout_seconds = 12
        started = False

        for _ in range(timeout_seconds * 4):
            if not self.process or self.process.poll() is not None:
                break

            try:
                with urllib.request.urlopen(HOST, timeout=0.8):
                    started = True
                    break
            except (urllib.error.URLError, TimeoutError):
                time.sleep(0.25)

        if started:
            self.root.after(0, lambda: self.status_var.set("Läuft. Browser wird geöffnet."))
            webbrowser.open(HOST)
        else:
            self.root.after(0, lambda: self.status_var.set("Start fehlgeschlagen. Bitte erneut versuchen."))
            self.root.after(0, lambda: self.start_button.config(state="normal"))

    def stop_app(self) -> None:
        if not self.process:
            return

        if self.process.poll() is None:
            self.process.terminate()
            try:
                self.process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                self.process.kill()

        self.process = None
        self.stop_button.config(state="disabled")
        self.start_button.config(state="normal")
        self.status_var.set("Gestoppt.")

    def on_close(self) -> None:
        self.stop_app()
        self.root.destroy()


def main() -> None:
    root = tk.Tk()
    TimerLauncher(root)
    root.mainloop()


if __name__ == "__main__":
    main()
