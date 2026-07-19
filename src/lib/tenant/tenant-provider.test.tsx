import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { TenantProvider, useTenant } from "./tenant-provider";
import { DEFAULT_TENANT } from "./types";

describe("useTenant", () => {
  it("throws when used outside a TenantProvider", () => {
    expect(() => renderHook(() => useTenant())).toThrow(
      "useTenant must be used within TenantProvider"
    );
  });

  it("returns the tenant seeded into the provider", () => {
    const tenant = { ...DEFAULT_TENANT, slug: "acme-pt", clinicName: "Acme PT" };
    const { result } = renderHook(() => useTenant(), {
      wrapper: ({ children }) => (
        <TenantProvider tenant={tenant}>{children}</TenantProvider>
      ),
    });
    expect(result.current).toEqual(tenant);
  });
});
