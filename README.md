# rule-keeper · 改规矩不堆屎山

用 AI（Claude Code）做项目，从 0 到 1 不难。难的是之后：每次优化都往 CLAUDE.md、skill、规矩文件里加一条，几个月后规矩越来越长，前后打架，旧数字没人删，AI 也开始随便挑一条照做。

rule-keeper 是一个 Claude Code 插件，让「改规矩」这件事有固定的做法：

1. **先分类**：先问「这条是在规定结果，还是规定过程？」能检查结果的就写成验收，不写成步骤。再分六类：数字放程序里；规矩放它唯一的「家」；接口（交什么文件、在哪停）写死；做法进工具箱当可选的「招」；验收写成一道关；某天的经历和原话记进日志。
2. **找家**：全文搜这件事的所有旧说法。
3. **替换，不追加**：新说法换掉旧说法，别处改成指针或删掉，规矩里不写修改史（历史交给 git 和日志）。
4. **三行报告**：改了哪、跟着改了哪、记进了哪条日志。
5. **体检**：定期查重复、打架、过时、写死的数字、管太死，列清单给人拍板；换了更强的模型后，可以做「删减测试」，拿掉一条规矩做 A/B 盲评，没变差就删。

## 里面有什么

| 部件 | 作用 |
|---|---|
| skill `change-rules` | 上面这套流程。你说「以后都……」「这条记下来」「体检」，或者 Claude 要改规矩文件时，自动用上 |
| hook（PreToolUse） | Claude 要改 CLAUDE.md、AGENTS.md、SKILL.md、`.claude/rules/`、`references/` 这类文件时，系统先提醒它走流程。只提醒、不拦截，同一对话同一文件只提醒一次 |

## 安装

需要 Claude Code 和 Node.js（hook 用 node 跑）。

```bash
claude plugin marketplace add KoroLiu/rule-keeper
claude plugin install rule-keeper@rule-keeper
```

## 让它认出你项目里的其他规矩文件

在项目根目录建 `.claude/rule-files.txt`，每行写一个路径片段，路径里含这段文字的文件就算规矩文件：

```
# 例子
规矩.md
创作原则.md
docs/conventions/
```

## 为什么这样做（依据）

- Anthropic 官方：CLAUDE.md 每份最好少于 200 行，越长越不容易照做；两条指令打架时 Claude 可能随便挑一条；要定期删掉过时和冲突的内容。<https://code.claude.com/docs/en/memory>
- Anthropic 官方：CLAUDE.md 是指导，必须每次都发生的事交给 hook。<https://code.claude.com/docs/en/best-practices>
- 软件工程的「架构决策记录（ADR）」：新决定取代旧决定，旧记录只标「已被取代」。<https://www.martinfowler.com/bliki/ArchitectureDecisionRecord.html>
- 官方插件 `claude-md-improver` 负责给 CLAUDE.md 打分体检；rule-keeper 管的是每一次「改规矩」的那个动作，两个可以一起用。

## English

rule-keeper is a Claude Code plugin that keeps your CLAUDE.md, skills and rule files from rotting as they evolve. Every rule change goes through: classify (numbers → code, rules → one home, experiences → dated log), find every existing mention, **replace instead of append**, report in three lines. A PreToolUse hook reminds Claude whenever it is about to edit a rule file. Say "checkup" to audit for duplicates, conflicts, stale items and hard-coded numbers.

## License

MIT
