import { DIALOGUE_BANK } from "./dialogueBank.js?v=20260618d";

const recentLines = [];
const MAX_RECENT = 8;

function pickRandom(lines) {
  const available = lines.filter((line) => !recentLines.includes(line));
  const pool = available.length > 0 ? available : lines;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  recentLines.push(picked);
  if (recentLines.length > MAX_RECENT) {
    recentLines.shift();
  }

  return picked;
}

function fillTemplate(text, vars = {}) {
  return text.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

export function getDialogue(path, vars = {}) {
  const keys = path.split(".");
  let node = DIALOGUE_BANK;

  for (const key of keys) {
    node = node?.[key];
    if (!node) {
      return "";
    }
  }

  if (!Array.isArray(node)) {
    return "";
  }

  return fillTemplate(pickRandom(node), vars);
}

export function resetDialogueHistory() {
  recentLines.length = 0;
}
