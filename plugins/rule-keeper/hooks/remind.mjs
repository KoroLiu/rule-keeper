// PreToolUse hook：Claude 要改「规矩类文件」时，提醒它先走 change-rules 流程。
// 只提醒、不拦截；同一个对话里同一个文件只提醒一次。
// 规矩类文件 = 下面 DEFAULT_* 认得的，加上项目里 .claude/rule-files.txt 每行写的路径片段（# 开头是注释）。
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const DEFAULT_NAMES = ["CLAUDE.md", "CLAUDE.local.md", "AGENTS.md", "GEMINI.md", "SKILL.md"];
const DEFAULT_PARTS = ["/.claude/rules/", "/references/"];

let input;
try {
  input = JSON.parse(fs.readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}
const file = input?.tool_input?.file_path;
if (!file) process.exit(0);

const norm = (p) => p.replace(/\\/g, "/");
const f = norm(file);

function projectParts() {
  const dirs = [path.dirname(file), process.env.CLAUDE_PROJECT_DIR, input.cwd].filter(Boolean);
  const parts = [];
  for (const d of dirs) {
    // 先从被改文件所在的文件夹往上找，再从项目和当前目录往上找 .claude/rule-files.txt；每条路找到第一份就停
    let cur = path.resolve(d);
    while (true) {
      const list = path.join(cur, ".claude", "rule-files.txt");
      if (fs.existsSync(list)) {
        for (const line of fs.readFileSync(list, "utf8").split(/\r?\n/)) {
          const s = line.trim();
          if (s && !s.startsWith("#")) parts.push(norm(s));
        }
        break;
      }
      const up = path.dirname(cur);
      if (up === cur) break;
      cur = up;
    }
  }
  return parts;
}

const isRule =
  DEFAULT_NAMES.includes(path.basename(f)) ||
  DEFAULT_PARTS.some((p) => f.includes(p)) ||
  projectParts().some((p) => f.includes(p));
if (!isRule) process.exit(0);

// 一个对话一个文件只提醒一次
const stateDir = path.join(os.tmpdir(), "rule-keeper");
const stateFile = path.join(stateDir, `${String(input.session_id || "nosession").replace(/[^\w-]/g, "")}.json`);
let seen = [];
try {
  seen = JSON.parse(fs.readFileSync(stateFile, "utf8"));
} catch {}
if (seen.includes(f)) process.exit(0);
try {
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify([...seen, f]));
} catch {}

const ctx =
  `${path.basename(f)} 是规矩类文件。这个项目改规矩用 rule-keeper 的 change-rules 流程：` +
  `先问这条是在规定结果还是规定过程，再分类（数字放程序、规矩放唯一的家、做法进工具箱、能检查的写成验收、经历记日志），再全文搜这件事的所有旧说法，` +
  `新说法替换旧说法而不是往后追加，别处改成指针或删掉，规矩里不写修改史。` +
  `日志类文件（口味档案、复盘、决策记录）照常按日期追加。`;
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: ctx } }));
