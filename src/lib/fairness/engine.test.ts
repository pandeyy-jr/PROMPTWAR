import { describe, expect, it } from "vitest";
import { estimateWage, evaluateFairness } from "./engine";

describe("FairShift transparent rules", () => {
  it("uses different documented industry review thresholds", () => {
    const shift = { shiftId:"s1",startsAt:"2026-01-01T08:00:00Z",endsAt:"2026-01-01T17:00:00Z",hourlyRateMinor:10000,currency:"INR" };
    expect(evaluateFairness(shift,"factory")).toHaveLength(0);
    expect(evaluateFairness(shift,"college")[0]?.code).toBe("college.long_shift");
  });
  it("alerts only beyond the configured long-shift and short-rest thresholds", () => {
    expect(evaluateFairness({shiftId:"factory-boundary",startsAt:"2026-01-01T08:00:00Z",endsAt:"2026-01-01T18:00:00Z",hourlyRateMinor:10000,currency:"INR"},"factory")).toEqual([]);
    expect(evaluateFairness({shiftId:"factory-over",startsAt:"2026-01-01T08:00:00Z",endsAt:"2026-01-01T18:01:00Z",hourlyRateMinor:10000,currency:"INR"},"factory").map((alert)=>alert.code)).toEqual(["factory.long_shift"]);
    const restBoundary={shiftId:"rest-boundary",startsAt:"2026-01-02T09:00:00Z",endsAt:"2026-01-02T17:00:00Z",hourlyRateMinor:10000,currency:"INR",previousShiftEndsAt:"2026-01-01T22:00:00Z"};
    expect(evaluateFairness(restBoundary,"factory")).toEqual([]);
    expect(evaluateFairness({...restBoundary,startsAt:"2026-01-02T08:59:00Z",endsAt:"2026-01-02T16:59:00Z"},"factory").map((alert)=>alert.code)).toEqual(["factory.short_rest"]);
  });
  it("explains short rest and hazard without scoring people", () => {
    const alerts=evaluateFairness({shiftId:"s",startsAt:"2026-01-02T06:00:00Z",endsAt:"2026-01-02T14:00:00Z",hourlyRateMinor:12000,currency:"INR",previousShiftEndsAt:"2026-01-01T22:00:00Z",unresolvedHighSeveritySafetyIncident:true},"factory");
    expect(alerts.map((a)=>a.code)).toEqual(["factory.short_rest","factory.hazard_open"]);
    expect(alerts.every((a)=>a.followUp.length>0)).toBe(true);
    const withoutHighSeverityReport=evaluateFairness({shiftId:"s",startsAt:"2026-01-02T06:00:00Z",endsAt:"2026-01-02T14:00:00Z",hourlyRateMinor:12000,currency:"INR"},"factory");
    expect(withoutHighSeverityReport).toEqual([]);
  });
  it("calculates integer minor units and rejects invalid intervals", () => {
    expect(estimateWage(12500,"2026-01-01T08:00:00Z","2026-01-01T12:30:00Z")?.amountMinor).toBe(56250);
    expect(estimateWage(100,"bad","later")).toBeNull();
    expect(estimateWage(-1,"2026-01-01T08:00:00Z","2026-01-01T09:00:00Z")).toBeNull();
    expect(evaluateFairness({shiftId:"invalid",startsAt:"2026-01-01T10:00:00Z",endsAt:"2026-01-01T09:00:00Z",hourlyRateMinor:10000,currency:"INR"},"factory")).toEqual([]);
  });
});
