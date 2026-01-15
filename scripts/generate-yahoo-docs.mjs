import fs from "node:fs/promises";
import path from "node:path";

const baseDir = path.join(process.cwd(), "fantastats");
const samplesDir = path.join(baseDir, "scripts", "yahoo-samples");
const summaryPath = path.join(samplesDir, "_summary.json");
const outputPath = path.join(baseDir, "docs", "YAHOO_API_SAMPLE_STRUCTURES.md");

const MAX_DEPTH = 8;

function indent(level) {
  return "  ".repeat(level);
}

function formatValue(value) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") {
    const trimmed = value.length > 80 ? `${value.slice(0, 77)}...` : value;
    return `"${trimmed}"`;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return typeof value;
}

function describeNode(node, level, lines, keyName = "") {
  if (level > MAX_DEPTH) {
    lines.push(`${indent(level)}- ${keyName}: (depth limit)`);
    return;
  }

  if (Array.isArray(node)) {
    lines.push(
      `${indent(level)}- ${keyName}: array (length ${node.length})`
    );
    if (node.length > 0) {
      describeNode(node[0], level + 1, lines, "[0]");
    }
    return;
  }

  if (node && typeof node === "object") {
    const keys = Object.keys(node);
    lines.push(`${indent(level)}- ${keyName}: object`);
    keys.forEach((key) => {
      describeNode(node[key], level + 1, lines, key);
    });
    return;
  }

  lines.push(`${indent(level)}- ${keyName}: ${formatValue(node)}`);
}

function titleFromId(id) {
  return id
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

async function main() {
  const summary = JSON.parse(await fs.readFile(summaryPath, "utf8"));
  const sections = [];

  for (const entry of summary.endpoints) {
    if (entry.status !== "ok") continue;
    const filePath = path.join(samplesDir, entry.file);
    const raw = JSON.parse(await fs.readFile(filePath, "utf8"));

    const lines = [];
    lines.push(`## ${titleFromId(entry.id)}`);
    lines.push(`Endpoint: \`${entry.endpoint}\``);
    lines.push(`Sample file: \`scripts/yahoo-samples/${entry.file}\``);
    lines.push("");
    lines.push("Structure:");

    const structureLines = [];
    describeNode(raw, 0, structureLines, "root");
    lines.push("```");
    lines.push(structureLines.join("\n"));
    lines.push("```");

    sections.push(lines.join("\n"));
  }

  const header = [
    "# Yahoo API Sample Structures",
    "",
    "Generated from `scripts/yahoo-samples/_summary.json` and sample JSON files.",
    `Max depth: ${MAX_DEPTH}`,
    "",
  ].join("\n");

  await fs.writeFile(outputPath, `${header}\n${sections.join("\n\n")}\n`);
  console.log(`Wrote ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
