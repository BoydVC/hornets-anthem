// Headless check of Hornets Anthem Release via window.__HA__.
import { pathToFileURL, fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { launch, sleep } from "./cdp.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = pathToFileURL(join(ROOT, "dist", "hornets-anthem.html")).href;
const checks = [];
const check = (ok, msg, info = "") => checks.push({ ok: !!ok, msg, info: String(info) });
const J = async (c, expr) => JSON.parse(await c.ev(`(async () => JSON.stringify(${expr}))()`));

async function main() {
  const c = await launch({ width: 1280, height: 800, port: 9465 });
  try {
    await c.goto(DIST);
    check(await c.ev("typeof window.__HA__ === 'object'"), "__HA__ test API present");
    const title = await c.ev("document.title");
    check(title.includes("Hornets Anthem"), "document title", title);
    const song = await J(c, "window.__HA__.SONG");
    check(song.bars === 40 && Math.abs(song.duration - 75) < 0.01, "40 bars @128 BPM = 75s loop", JSON.stringify(song));
    const lines = await J(c, "window.__HA__.LINES");
    check(lines.length >= 18, "original lyric lines timed", lines.length);
    check(lines.every((l, i) => i === 0 || l.t0 >= lines[i - 1].t0), "lyric timings monotonic");
    const ebs = await J(c, "window.__HA__.eventsByStem()");
    check(ebs.drums > 300 && ebs.bass > 200 && ebs.lead > 100 && ebs.chords > 100 && ebs.fx >= 8, "event counts per stem", JSON.stringify(ebs));

    // render the 5 stems offline
    const t0 = Date.now();
    const rep = await J(c, "await window.__HA__.render()");
    const ms = Date.now() - t0;
    for (const [id, s] of Object.entries(rep.stems)) {
      check(s.len === 75 * 44100 && s.rms > 0.002 && s.peak > 0.05, `stem ${id} rendered & audible`, JSON.stringify(s));
    }
    check(Object.values(rep.stems).every((s) => s.peak < 4), "no runaway stem peaks", JSON.stringify(Object.values(rep.stems).map((s) => s.peak)));
    check(ms < 30000, "offline render time", ms + "ms");

    // WAV export
    const wav = await J(c, "await window.__HA__.wavInfo()");
    check(wav.header === "RIFF/WAVE" && wav.sr === 44100 && wav.size > 6_000_000, "WAV export (RIFF/WAVE 44.1k, ~6.6MB)", JSON.stringify(wav));

    // lyric sync
    const l1 = await J(c, "window.__HA__.lineAt(12 * 1.875 + 0.05)");
    check(l1.section === "c1" && l1.line && l1.line.startsWith("Buzz, buzz"), "chorus line at bar 13 (t=22.5s)", JSON.stringify(l1));
    const l2 = await J(c, "window.__HA__.lineAt(0.5)");
    check(l2.line === null && l2.section === "intro", "intro title card gap", JSON.stringify(l2));
    const l3 = await J(c, "window.__HA__.lineAt(38 * 1.875 + 0.2)");
    check(l3.line && l3.line.startsWith("HORNETS!"), "outro chant line", JSON.stringify(l3));

    // cover art
    const cover = await c.ev("window.__HA__.coverDataURL().length");
    check(cover > 200000, "cover PNG generated", cover);
    const cs = await J(c, "window.__HA__.canvasStats('#cover')");
    check(cs.gold > 1500 && cs.std > 30, "cover has gold + contrast", JSON.stringify(cs));
    const rmx = await c.ev("window.__HA__.remixCover()");
    check(typeof rmx === "string", "cover remix palette", rmx);
    await c.ev("window.__HA__.remixCover(); window.__HA__.remixCover()");

    // lyric video frame
    await c.ev("window.__HA__.setTab('video')");
    const line = await c.ev("window.__HA__.preview(14 * 1.875 + 1.2)");
    const vs = await J(c, "window.__HA__.canvasStats('#video')");
    check(line && vs.gold > 300 && vs.std > 15, "lyric video karaoke frame drawn", JSON.stringify({ line, ...vs }));

    // share + sheet
    await c.ev("window.__HA__.setTab('share')");
    const share = await c.ev("window.__HA__.shareDataURL().length");
    check(share > 200000, "share card PNG", share);
    const sheet = await c.ev("window.__HA__.sheetLines()");
    check(sheet === lines.length, "printable lyric sheet lines", sheet);

    // live playback
    await c.ev("window.__HA__.setTab('video')");
    await c.ev("window.__HA__.seek(14 * 1.875)");
    await c.ev("window.__HA__.play()");
    await sleep(1500);
    const st = await J(c, "window.__HA__.getState()");
    check(st.playing && st.pos > 26.5 && st.pos < 30, "playback advances clock", JSON.stringify(st));
    const live = await c.ev("window.__HA__.liveSheetLine()");
    check(live !== null, "sheet highlights live line", live);
    await c.ev("window.__HA__.setMuted(true)");
    await c.ev("window.__HA__.pause()");
    const st2 = await J(c, "window.__HA__.getState()");
    check(!st2.playing && st2.muted, "pause + mute", JSON.stringify(st2));
    // loop wrap
    await c.ev("window.__HA__.seek(74.6)"); await c.ev("window.__HA__.play()"); await sleep(900);
    const st3 = await J(c, "window.__HA__.getState()");
    check(st3.playing && st3.pos < 2, "loops back to top", JSON.stringify(st3));
    await c.ev("window.__HA__.pause()");
    await c.ev("window.__HA__.setPreset('instrumental')");
    const st4 = await J(c, "window.__HA__.getState()");
    check(st4.preset === "instrumental", "preset switch", st4.preset);

    check(c.errors.length === 0, "no console errors", c.errors.slice(0, 3).join(" | "));
    check(c.requests.length === 0, "no network requests", c.requests.slice(0, 3).join(" "));
  } finally {
    await c.close();
  }
  const failed = checks.filter((x) => !x.ok).length;
  console.log(JSON.stringify({ passed: checks.length - failed, failed, checks }));
}
main().catch((e) => { console.log(JSON.stringify({ passed: 0, failed: 1, checks: [{ ok: false, msg: "exception", info: String(e) }] })); process.exit(1); });
