#!/usr/bin/env node
// Copies this package's skills/ into the local skill directories used by each
// agent harness:
//   - ~/.agents/skills  — always (Codex and other Agent Skills-compatible harnesses)
//   - ~/.claude/skills  — only when ~/.claude exists (Claude Code)
//   - ~/.hermes/skills  — only when ~/.hermes exists (Hermes)
//   - ~/.cursor/skills  — only when ~/.cursor exists (Cursor)
//   - ~/.codex/skills   — only when ~/.codex exists (Codex)
//
// npx unpacks this package into an ephemeral cache directory, so skills are
// COPIED rather than symlinked — symlinks into the cache would break once the
// cache is cleared. Re-run `npx -y simple-skills` to update installed skills.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SKILLS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "skills");
const HOME = homedir();

function collectSkills(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "deprecated") continue;
    const path = join(dir, entry.name);
    if (!entry.isDirectory()) continue;
    if (existsSync(join(path, "SKILL.md"))) {
      out.push(path);
    } else {
      collectSkills(path, out);
    }
  }
  return out;
}

const skills = collectSkills(SKILLS_DIR);
if (skills.length === 0) {
  console.error(`No skills found under ${SKILLS_DIR}`);
  process.exit(1);
}

const targets = [join(HOME, ".agents", "skills")];
for (const agent of [".claude", ".hermes", ".cursor", ".codex"]) {
  if (existsSync(join(HOME, agent))) {
    targets.push(join(HOME, agent, "skills"));
  }
}

for (const target of targets) {
  mkdirSync(target, { recursive: true });
  for (const skill of skills) {
    const dest = join(target, basename(skill));
    rmSync(dest, { recursive: true, force: true });
    cpSync(skill, dest, { recursive: true });
  }
  console.log(`Installed ${skills.length} skills to ${target}`);
}

console.log("\nDone. Re-run `npx -y simple-skills` to update.");
