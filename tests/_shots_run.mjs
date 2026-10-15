import { pathToFileURL, fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { launch, sleep } from "./cdp.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = pathToFileURL(join(ROOT, "dist", "hornets-anthem.html")).href;
const OUT = join(ROOT, "screenshots");
const BAR = 1.875;

async function main() {
  const c = await launch({ width: 1280, height: 800, port: 9466 });
  try {
    await c.goto(DIST, 600);
    await c.ev("window.__HA__.render().then(() => true)");
    await c.ev("window.__HA__.setTab('release'); window.__HA__.preview(14 * 1.875 + 2.6)");
    await sleep(300);
    await c.shot(join(OUT, "01-release.png"));

    await c.ev("window.__HA__.setTab('video')");
    await c.ev(`window.__HA__.preview(${14 * BAR + 2.6})`); await sleep(150);
    await c.shot(join(OUT, "03-video-chorus.png"));
    await c.ev("window.__HA__.preview(1.6)"); await sleep(150);
    await c.shot(join(OUT, "02-video-title.png"));
    await c.ev(`window.__HA__.preview(${5 * BAR + 1.0})`); await sleep(150);
    await c.shot(join(OUT, "04-video-verse.png"));
    await c.ev(`window.__HA__.preview(${39 * BAR + 0.05})`); await sleep(150);
    await c.shot(join(OUT, "05-video-endcard.png"));

    await c.ev("window.__HA__.setTab('lyrics')"); await sleep(200);
    await c.shot(join(OUT, "06-lyric-sheet.png"));

    await c.send("Emulation.setEmulatedMedia", { media: "print" }); await sleep(200);
    await c.shot(join(OUT, "09-print-sheet.png"));
    await c.send("Emulation.setEmulatedMedia", { media: "" });
    await c.ev("window.__HA__.setTab('studio')");
    await c.ev(`window.__HA__.preview(${13 * BAR + 0.9})`); await sleep(300);
    await c.shot(join(OUT, "07-studio.png"));

    await c.ev("window.__HA__.setTab('share')"); await sleep(250);
    await c.shot(join(OUT, "08-share-card.png"));

    await c.ev("window.__HA__.setTab('release')"); await c.ev("window.scrollTo(0,0)"); await sleep(200);
    await c.shot(join(OUT, "00-best-release.png"));
    console.log("shots done", c.errors.length ? "errors: " + c.errors.join(" | ") : "");
  } finally {
    await c.close();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
