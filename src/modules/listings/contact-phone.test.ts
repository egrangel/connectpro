import { describe, expect, test } from "vitest";
import { normalizeContactPhone } from "./contact-phone";

describe("normalizeContactPhone", () => {
  test.each([
    ["(44) 99999-0000", "5544999990000"],
    ["44999990000", "5544999990000"],
    ["+55 (44) 3333-5555", "554433335555"],
    ["5544999990000", "5544999990000"],
    ["+1 (212) 555-0123", "12125550123"],
    ["telefone 44999990000", null],
    ["99999-0000", null],
    ["+55 44 9999", null],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeContactPhone(input)).toBe(expected);
  });
});
