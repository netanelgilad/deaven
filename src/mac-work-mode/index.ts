/// <reference path="./external-types.d.ts" />
import { execString } from "applescript";
import { promisify } from "util";
import { sleep } from "@deaven/sleep";

const runApplescript = promisify(execString);

async function goFullScreen() {
  await runApplescript(`
    tell application "System Events" to keystroke "f" using { command down, control down }
  `);
}

async function openApp(appName: string) {
  await runApplescript(`
    tell application "${appName}" to activate
  `);
}

async function setPositionOfAppWindow(
  appName: string,
  window: string,
  x: number,
  y: number
) {
  await runApplescript(`
  tell application "System Events"
    set position of ${window} of application process "${appName}" to {${x}, ${y}}
  end tell  
  `);
}

async function setSizeOfAppWindow(
  appName: string,
  window: string,
  width: number,
  height: number
) {
  await runApplescript(`
  tell application "System Events"
    set size of ${window} of application process "${appName}" to {${width}, ${height}}
  end tell  
  `);
}

async function main() {
  await openApp("Visual Studio Code");
  await sleep(2000);
  await goFullScreen();
  await openApp("Google Chrome");
  await openApp("iTerm2");
  await sleep(3000);
  await setPositionOfAppWindow("iTerm2", "first window", 1280, 86);
  await setPositionOfAppWindow("Google Chrome", "second window", 1279, 62);
  await setSizeOfAppWindow("Google Chrome", "second window", 1200, 1136);
  await setSizeOfAppWindow("iTerm2", "first window", 1200, 758);
}

main();
