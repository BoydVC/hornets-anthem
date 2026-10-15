#!/usr/bin/env python3
"""Hornets Anthem Release smoke test.
Builds the offline snapshot, asserts a self-contained HTML file, checks the
server /healthz, then runs a headless Chrome pass (tests/play.mjs via CDP):
offline stem render, WAV export, lyric sync, cover/video/share canvases, playback.
Usage: python3 tests/smoke_test.py   (or ./run.sh test)
"""
import json, os, re, socket, subprocess, sys, time, urllib.request

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(HERE, "dist", "hornets-anthem.html")
RES = []


def check(ok, msg, info=""):
    RES.append(bool(ok))
    print(("PASS " if ok else "FAIL ") + msg + (f"  [{info}]" if info else ""), flush=True)


def free_port():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p


def main():
    print(f"Hornets Anthem Release smoke · {time.strftime('%Y-%m-%d %H:%M %Z')}", flush=True)
    subprocess.run([sys.executable, os.path.join(HERE, "build.py")], check=True, capture_output=True)
    html = open(DIST, encoding="utf-8").read()
    size = os.path.getsize(DIST)
    check(size > 30000, f"offline snapshot built ({size:,} bytes)")
    check("<style>" in html and "<script>" in html, "CSS and JS inlined into dist")
    check(open(os.path.join(HERE, "dist", "index.html"), encoding="utf-8").read() == html, "dist/index.html mirrors snapshot")
    bad = re.findall(r'<(?:script|link|img|iframe|source|audio|video)[^>]+(?:src|href)\s*=\s*["\'](?!data:)[^"\']+', html, re.I)
    check(not bad, "no external script/link/img/audio tags", str(bad[:3]))
    urls = [u for u in re.findall(r"https?://[^\s\"'<>)]+", html) if "w3.org/2000/svg" not in u]
    check(not urls, "no external http(s) URLs", str(urls[:3]))
    check(not re.search(r"\.(mp3|ogg|wav|m4a)[\"']", html), "no external audio files referenced")
    check("OfflineAudioContext" in html and "createOscillator" in html, "audio synthesized with WebAudio")
    check("__HA__" in html, "test API __HA__ present")
    check("Buzz Like Thunder" in html and "Green Hornets rise" in html, "original anthem lyrics embedded")

    port = free_port()
    env = dict(os.environ, HA_PORT=str(port))
    proc = subprocess.Popen([sys.executable, os.path.join(HERE, "server.py")], env=env,
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        ok = False
        for _ in range(40):
            time.sleep(0.1)
            try:
                ok = json.loads(urllib.request.urlopen(f"http://127.0.0.1:{port}/healthz", timeout=1).read()).get("ok")
                break
            except Exception:
                pass
        check(ok, f"server /healthz on test port {port}")
        body = urllib.request.urlopen(f"http://127.0.0.1:{port}/", timeout=2).read().decode()
        check("Hornets Anthem Release" in body, "server serves snapshot at /")
    finally:
        proc.terminate(); proc.wait(timeout=5)

    print("headless Chrome pass (tests/play.mjs) ...", flush=True)
    t0 = time.time()
    r = subprocess.run(["node", "--experimental-websocket", os.path.join(HERE, "tests", "play.mjs")],
                       capture_output=True, text=True, timeout=240, cwd=HERE)
    out = None
    for line in reversed(r.stdout.strip().splitlines()):
        if line.strip().startswith("{"):
            try:
                out = json.loads(line); break
            except Exception:
                pass
    if not out:
        check(False, "play.mjs produced JSON", (r.stdout + r.stderr)[-800:])
    else:
        for c in out.get("checks", []):
            check(c.get("ok"), "browser: " + c.get("msg", "?"), c.get("info", "")[:200])
    print(f"     browser pass took {time.time() - t0:.1f}s", flush=True)

    shots = os.path.join(HERE, "screenshots")
    pngs = [f for f in os.listdir(shots) if f.endswith(".png")] if os.path.isdir(shots) else []
    if pngs:
        best = [f for f in pngs if f.startswith("00-best")]
        check(bool(best), f"hero screenshot 00-best-*.png ({len(pngs)} shots)", ",".join(best) or "none")

    n, p = len(RES), sum(RES)
    print(f"RESULT: {p}/{n} checks passed" + ("" if p == n else f" ({n - p} FAILED)"), flush=True)
    sys.exit(0 if p == n else 1)


if __name__ == "__main__":
    main()
