export type Industry = "factory" | "college";
export type FairnessInput = { shiftId: string; startsAt: string; endsAt: string; hourlyRateMinor: number; currency: string; previousShiftEndsAt?: string | null; unresolvedHighSeveritySafetyIncident?: boolean };
export type FairnessAlert = { code: string; severity: "info" | "review"; explanation: string; evidence: string; followUp: string };
const rules: Record<Industry, { minRestHours: number; longShiftHours: number; labels: { hazard: string; long: string } }> = {
  factory: { minRestHours: 11, longShiftHours: 10, labels: { hazard: "Factory hazard follow-up", long: "Long production shift" } },
  college: { minRestHours: 10, longShiftHours: 8, labels: { hazard: "Campus safety follow-up", long: "Extended campus shift" } },
};
/** Transparent configured checks only; alerts inform a human and never penalize a worker. */
export function evaluateFairness(input: FairnessInput, industry: Industry): FairnessAlert[] {
  const cfg = rules[industry]; const alerts: FairnessAlert[] = [];
  const start = Date.parse(input.startsAt), end = Date.parse(input.endsAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || !Number.isSafeInteger(input.hourlyRateMinor) || input.hourlyRateMinor <= 0) return alerts;
  const hours = (end - start) / 3_600_000;
  if (hours > cfg.longShiftHours) alerts.push({ code: `${industry}.long_shift`, severity: "review", explanation: `${cfg.labels.long} exceeds the configured ${cfg.longShiftHours}-hour review threshold. This is a prompt for human review, not a legal limit.`, evidence: `${hours.toFixed(2)} scheduled hours; threshold ${cfg.longShiftHours}.`, followUp: "Confirm the schedule is voluntary, adequately rested and correctly recorded." });
  if (input.previousShiftEndsAt) {
    const rest = (start - Date.parse(input.previousShiftEndsAt)) / 3_600_000;
    if (Number.isFinite(rest) && rest >= 0 && rest < cfg.minRestHours) alerts.push({ code: `${industry}.short_rest`, severity: "review", explanation: `The gap between shifts is below FairShift's configured ${cfg.minRestHours}-hour review threshold.`, evidence: `${rest.toFixed(2)} hours between shifts.`, followUp: "Review worker preference, safety and applicable workplace rules." });
  }
  if (input.unresolvedHighSeveritySafetyIncident) alerts.push({ code: `${industry}.hazard_open`, severity: "review", explanation: cfg.labels.hazard, evidence: "An unresolved high or critical safety report is recorded for this work site.", followUp: "Check the report status and document protective actions." });
  return alerts;
}
export function estimateWage(hourlyRateMinor: number, start: string, end: string) {
  const durationMs = Date.parse(end) - Date.parse(start);
  if (!Number.isSafeInteger(hourlyRateMinor) || hourlyRateMinor < 0 || !Number.isFinite(durationMs) || durationMs <= 0) return null;
  const exactMinor = hourlyRateMinor * durationMs / 3_600_000;
  if (!Number.isSafeInteger(Math.round(exactMinor))) return null;
  return { amountMinor: Math.round(exactMinor), currencyUnit: "minor", explanation: `Scheduled duration × hourly rate: ${(durationMs / 3_600_000).toFixed(2)} hours × ${hourlyRateMinor} minor units/hour, rounded to nearest minor unit. Estimate only; excludes overtime, deductions and adjustments.` };
}
