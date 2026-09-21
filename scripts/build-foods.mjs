#!/usr/bin/env node
// Turns the raw USDA "Nutritive Value of Foods" CSV plus scripts/food-catalog.mjs
// into static/data/foods.json, the searchable dataset the app loads.
//
// Run with: node scripts/build-foods.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { catalog, countableUnits, rowFixes } from "./food-catalog.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "nutritive_value_of_foods.csv");
const target = resolve(root, "static/data/foods.json");

const nutrientColumns = {
  calories: "calories",
  totalFat: "total_fat_g",
  saturatedFat: "sat_fat_g",
  cholesterol: "cholesterol_mg",
  sodium: "sodium_mg",
  carbohydrate: "carbohydrate_g",
  fiber: "fiber_g",
  protein: "protein_g",
  calcium: "calcium_mg",
  iron: "iron_mg",
  potassium: "potassium_mg",
};

function parseCsvRows(csv) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];

    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && csv[index + 1] === "\n") index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field || row.length) {
    row.push(field.trim());
    if (row.some(Boolean)) rows.push(row);
  }

  return rows;
}

function parseNumber(value) {
  if (!value) return 0;
  const text = value.trim().toLowerCase();
  if (!text || text === "tr" || text === "na") return 0;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

function cleanText(value) {
  return (value ?? "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,)])/g, "$1")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/^[,;:\s]+|[,;:\s]+$/g, "")
    .trim();
}

function resolveVariant(entry, csvVariant, fix) {
  if (fix && fix.variant !== undefined) return fix.variant;
  if (entry.variant === null) return "";
  if (entry.variant === undefined) return csvVariant;
  return entry.variant;
}

// The printed table's vulgar fractions did not survive extraction, so a measure
// can arrive as a bare unit ("cup") that would overstate the portion. Those fall
// back to the gram weight, which the CSV does carry correctly.
function normalizeMeasure(measure, weight) {
  const text = cleanText(measure);
  if (!text) return `${weight} g`;
  if (/\d/.test(text)) return text;
  if (countableUnits.has(text.toLowerCase())) return `1 ${text}`;
  return `${weight} g`;
}

// Expand the catalog into a food_no -> entry lookup, checking as we go that no
// item number is claimed twice.
const byItemNumber = new Map();
for (const [idSpec, group, name, aliases = [], variant] of catalog) {
  const [start, end = start] = String(idSpec).split("-").map(Number);
  if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) {
    throw new Error(`Bad id range "${idSpec}" in the food catalog.`);
  }
  for (let itemNumber = start; itemNumber <= end; itemNumber += 1) {
    if (byItemNumber.has(itemNumber)) {
      throw new Error(`Item ${itemNumber} appears twice in the food catalog.`);
    }
    byItemNumber.set(itemNumber, { group, name, aliases, variant });
  }
}

const csv = readFileSync(source, "utf8");
const [headers, ...rows] = parseCsvRows(csv);
const columnIndex = Object.fromEntries(
  headers.map((header, index) => [header, index]),
);

const foods = [];
const skipped = [];

for (const values of rows) {
  const cell = (column) => cleanText(values[columnIndex[column]]);
  const itemNumber = Number(cell("food_no"));
  const entry = byItemNumber.get(itemNumber);

  if (!entry) {
    skipped.push(itemNumber);
    continue;
  }

  // The CSV's `food` column holds the variant within a food ("Shredded",
  // "From frozen") - or, for single-row items, the food's own name.
  const csvVariant = cell("food");
  const name = entry.name ?? csvVariant;
  const variant = resolveVariant(entry, csvVariant, rowFixes[itemNumber]);

  const weight = parseNumber(cell("weight_g"));
  if (!name || weight <= 0) {
    skipped.push(itemNumber);
    continue;
  }

  const nutrients = {};
  for (const [key, column] of Object.entries(nutrientColumns)) {
    nutrients[key] = parseNumber(cell(column));
  }

  const fix = rowFixes[itemNumber] ?? {};
  const measure = normalizeMeasure(
    fix.measure === undefined ? cell("measure") : fix.measure,
    weight,
  );
  const keywords = [
    ...new Set(entry.aliases.map((alias) => alias.toLowerCase())),
  ];

  foods.push({
    id: String(itemNumber),
    name,
    variant: variant === name || variant === measure ? "" : variant,
    group: entry.group,
    measure,
    weight,
    keywords,
    nutrients,
  });
}

foods.sort(
  (a, b) => a.name.localeCompare(b.name) || Number(a.id) - Number(b.id),
);

writeFileSync(
  target,
  `${JSON.stringify({
    source:
      "USDA Nutritive Value of Foods, Home and Garden Bulletin No. 72, renamed by scripts/food-catalog.mjs",
    generated: new Date().toISOString().slice(0, 10),
    foods,
  })}\n`,
);

const names = new Set(foods.map((food) => food.name));
console.log(
  `Wrote ${foods.length} rows (${names.size} distinct foods) to ${target}`,
);
console.log(
  `Skipped ${skipped.length} CSV rows with no catalog entry or no weight.`,
);
