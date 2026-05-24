import type { ParsedReceipt } from './types';

const AMOUNT_PATTERN = /[-+]?\$?\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)(?:\.(\d{2}))\b/;
const TRAILING_AMOUNT_PATTERN = /(?:^|\s)([-+]?\$?\s*(?:[0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)(?:\.\d{2}))\s*$/;

const LABELS = {
  subtotal: /\b(sub\s*total|subtotal)\b/i,
  tax: /\b(tax|vat|gst|hst|pst)\b/i,
  total: /\b(grand\s+total|amount\s+due|balance\s+due|total\s+due|total)\b/i,
};

const NON_ITEM_LINE =
  /\b(sub\s*total|subtotal|tax|vat|gst|hst|pst|grand\s+total|amount\s+due|balance\s+due|total\s+due|total|cash|change|visa|mastercard|amex|discover|debit|credit|card|auth|approval|receipt|invoice|order|thank\s+you)\b/i;

export function parseReceiptText(text: string): ParsedReceipt {
  const lines = normalizeLines(text);
  const subtotal = findLabeledAmount(lines, LABELS.subtotal);
  const tax = findLabeledAmount(lines, LABELS.tax);
  const total =
    findTotalAmount(lines) ??
    roundCurrency((subtotal ?? sumAmounts(extractItems(lines))) + (tax ?? 0));

  return {
    merchant: findMerchant(lines),
    date: findDate(lines),
    ...(subtotal === undefined ? {} : { subtotal }),
    ...(tax === undefined ? {} : { tax }),
    total,
    items: extractItems(lines),
  };
}

function normalizeLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function findMerchant(lines: string[]): string {
  const merchant = lines.find((line) => {
    if (findDateInLine(line)) return false;
    if (AMOUNT_PATTERN.test(line)) return false;
    if (/^\d+\s+/.test(line)) return false;
    return /[a-z]/i.test(line);
  });

  return merchant ?? 'Unknown merchant';
}

function findDate(lines: string[]): string {
  for (const line of lines) {
    const date = findDateInLine(line);
    if (date) return date;
  }

  return new Date().toISOString().slice(0, 10);
}

function findDateInLine(line: string): string | undefined {
  const iso = line.match(/\b(20\d{2}|19\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/);
  if (iso) {
    return [iso[1], iso[2].padStart(2, '0'), iso[3].padStart(2, '0')].join('-');
  }

  const slash = line.match(/\b(0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])[-/](20\d{2}|19\d{2}|\d{2})\b/);
  if (!slash) return undefined;

  const year = slash[3].length === 2 ? `20${slash[3]}` : slash[3];
  return [year, slash[1].padStart(2, '0'), slash[2].padStart(2, '0')].join('-');
}

function findLabeledAmount(lines: string[], label: RegExp): number | undefined {
  const line = lines.find((candidate) => label.test(candidate));
  return line ? parseLastAmount(line) : undefined;
}

function findTotalAmount(lines: string[]): number | undefined {
  const totalLines = lines.filter((line) => LABELS.total.test(line) && !LABELS.subtotal.test(line));
  for (let index = totalLines.length - 1; index >= 0; index -= 1) {
    const amount = parseLastAmount(totalLines[index]);
    if (amount !== undefined) return amount;
  }

  return undefined;
}

function extractItems(lines: string[]): ParsedReceipt['items'] {
  return lines
    .map((line) => {
      const amount = parseTrailingAmount(line);
      if (amount === undefined || NON_ITEM_LINE.test(line) || findDateInLine(line)) {
        return undefined;
      }

      const name = line.replace(TRAILING_AMOUNT_PATTERN, '').trim();
      if (!name || !/[a-z]/i.test(name)) return undefined;

      return { name, amount };
    })
    .filter((item): item is ParsedReceipt['items'][number] => item !== undefined);
}

function parseLastAmount(line: string): number | undefined {
  const matches = [...line.matchAll(new RegExp(AMOUNT_PATTERN.source, 'g'))];
  const last = matches.at(-1)?.[0];
  return last ? parseMoney(last) : undefined;
}

function parseTrailingAmount(line: string): number | undefined {
  const match = line.match(TRAILING_AMOUNT_PATTERN);
  return match ? parseMoney(match[1]) : undefined;
}

function parseMoney(value: string): number {
  return roundCurrency(Number(value.replace(/[$,\s]/g, '')));
}

function sumAmounts(items: ParsedReceipt['items']): number {
  return roundCurrency(items.reduce((sum, item) => sum + item.amount, 0));
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
