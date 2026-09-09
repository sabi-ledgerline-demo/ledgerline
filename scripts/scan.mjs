// Secret and content scan over the working tree AND the full git history.
// Usage: npm run scan   (exit 1 on any finding)
import { execSync } from "node:child_process";
import fs from "node:fs";

const SECRET = [
  [/gh[pousr]_[A-Za-z0-9]{30,}/, "GitHub token"],
  [/github_pat_[A-Za-z0-9_]{30,}/, "GitHub fine-grained token"],
  [/sk-[A-Za-z0-9_-]{20,}/, "API secret key"],
  [/AKIA[0-9A-Z]{16}/, "AWS access key"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key"],
  [/xox[abp]-[A-Za-z0-9-]{10,}/, "Slack token"],
  [/postgres(ql)?:\/\/[^\s:@/]+:(?!pass\b|password\b)[^\s@]{6,}@/, "connection string with credentials"],
  [/(password|secret|token)\s*[:=]\s*["'][A-Za-z0-9_+\/=-]{8,}["']/i, "hard-coded credential"]
];
const CONTENT = [
  [/@intelligaize|intelligaize\//i, "reference to the Sabí codebase"],
  [/PROTOTYPE_HANDOFF|prototypeHandoff/, "prototype handoff"],
  [/getsabi\.io\/api|SABI_[A-Z_]+/, "Sabí internals"],
  [/lib\/model\/|lib\/pipeline\//, "Sabí source path"],
  [/\b(presenter|jump-to-beat|assessor|uiState|partialPayments=)/i, "demo mechanism"]
];
const BAD_FILES = [/(^|\/)\.env($|\.)(?!example)/, /\.pem$/, /\.key$/, /id_rsa/];
const ALLOW = new Set(["scripts/scan.mjs"]);

const findings = [];
const check = (where, path, text) => {
  if (ALLOW.has(path)) return;
  for (const [re, label] of [...SECRET, ...CONTENT]) if (re.test(text)) findings.push(`${where}: ${path}: ${label}`);
};

const sh = (c) => execSync(c, { encoding: "utf8", maxBuffer: 1 << 28 });
for (const f of sh("git ls-files").split("\n").filter(Boolean)) {
  if (BAD_FILES.some((re) => re.test(f))) findings.push(`tree: ${f}: forbidden file`);
  if (f === "package-lock.json" || !fs.existsSync(f)) continue;
  check("tree", f, fs.readFileSync(f, "utf8"));
}
// full history: every file ever committed, every commit message
const revs = sh("git rev-list --all").split("\n").filter(Boolean);
for (const r of revs) {
  check("message", r.slice(0, 7), sh(`git log -1 --format=%B%an%ae ${r}`));
  for (const f of sh(`git ls-tree -r --name-only ${r}`).split("\n").filter(Boolean)) {
    if (BAD_FILES.some((re) => re.test(f))) findings.push(`history ${r.slice(0, 7)}: ${f}: forbidden file`);
  }
  const diff = sh(`git show --format= -U0 ${r} -- . ':(exclude)package-lock.json' ':(exclude)scripts/scan.mjs'`);
  check(`history ${r.slice(0, 7)}`, "diff", diff);
}
console.log(`Scanned ${revs.length} commits and the working tree.`);
if (findings.length) { console.error([...new Set(findings)].join("\n")); console.error(`\n${new Set(findings).size} finding(s).`); process.exit(1); }
console.log("Scan clean: no secrets, env files, keys, Sabí references or demo mechanisms found.");
