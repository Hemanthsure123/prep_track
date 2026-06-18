export type ParsedCsvRow = Record<string, string>;

export type CsvRowError = {
  rowIndex: number; // 1-based
  companyName: string;
  errors: string[];
};

const BASE_HEADERS = [
  "company_name",
  "role",
  "role_level",
  "year",
  "total_selected",
  "biggest_tip",
] as const;

const ROUND_FIELDS = [
  "name",
  "type",
  "duration_min",
  "mode",
  "outcome",
  "context",
  "prep_link",
] as const;

export const EXPECTED_HEADERS: readonly string[] = [
  ...BASE_HEADERS,
  ...[1, 2, 3, 4, 5].flatMap((n) =>
    ROUND_FIELDS.map((f) => `round_${n}_${f}`),
  ),
];

function isMissing(value: string | undefined): boolean {
  if (value == null) return true;
  const v = value.trim();
  if (v === "" || v.toUpperCase() === "NA") return true;
  return false;
}

export type CsvValidationResult = {
  headerErrors: string[];
  rowErrors: CsvRowError[];
};

export function validateRows(
  headers: string[],
  rows: ParsedCsvRow[],
): CsvValidationResult {
  const headerErrors: string[] = [];
  const presentHeaders = new Set(headers.map((h) => h.trim()));

  for (const expected of EXPECTED_HEADERS) {
    if (!presentHeaders.has(expected)) {
      headerErrors.push(`Missing required column "${expected}"`);
    }
  }

  if (headerErrors.length > 0) {
    return { headerErrors, rowErrors: [] };
  }

  const rowErrors: CsvRowError[] = [];

  rows.forEach((row, i) => {
    const errs: string[] = [];

    if (isMissing(row.company_name)) errs.push("company_name is required");
    if (isMissing(row.role)) errs.push("role is required");
    if (isMissing(row.role_level)) errs.push("role_level is required");

    const yearNum = Number(row.year);
    if (
      isMissing(row.year) ||
      !Number.isFinite(yearNum) ||
      yearNum < 2000 ||
      yearNum > 2035
    ) {
      errs.push("year must be an integer between 2000 and 2035");
    }

    const hasAnyRound = [1, 2, 3, 4, 5].some(
      (n) => !isMissing(row[`round_${n}_context`]),
    );
    if (!hasAnyRound) {
      errs.push("at least one round (round_N_context) is required");
    }

    for (const n of [1, 2, 3, 4, 5]) {
      const context = row[`round_${n}_context`];
      if (isMissing(context)) continue;
      // If round_N_context is present, the round name is required.
      if (isMissing(row[`round_${n}_name`])) {
        errs.push(`round ${n}: round_${n}_name is required when context is set`);
      }
    }

    if (errs.length > 0) {
      rowErrors.push({
        rowIndex: i + 1,
        companyName: row.company_name ?? "",
        errors: errs,
      });
    }
  });

  return { headerErrors, rowErrors };
}
