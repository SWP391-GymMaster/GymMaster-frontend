import { screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TdeeCalculator } from "@/features/member-nutrition/components/TdeeCalculator";
import { renderWithMemberSession } from "@/tests/member-nutrition/test-utils";
import { http } from "msw";
import { server } from "@/mocks/server";
import { ok } from "@/mocks/utils/api-response";

describe("TdeeCalculator Upgrade", () => {
  beforeEach(() => {
    // Mock the GET calorie-target endpoint to return null by default (chưa đặt)
    server.use(
      http.get("/api/v1/members/:id/calorie-target", () => {
        return ok(null);
      }),
      http.post("/api/v1/members/:id/calorie-target", async ({ request }) => {
        const body = await request.json();
        return ok(body);
      })
    );
  });

  it("renders correctly with tabs", () => {
    renderWithMemberSession(
      <TdeeCalculator isOpen={true} onClose={vi.fn()} onTargetApplied={vi.fn()} />
    );

    expect(screen.getByText("Tính TDEE tự động")).toBeInTheDocument();
    expect(screen.getByText("Tự thiết lập (Manual)")).toBeInTheDocument();
  });

  it("calculates TDEE and applies macro target automatically on TDEE tab", async () => {
    const handleTargetApplied = vi.fn();
    renderWithMemberSession(
      <TdeeCalculator isOpen={true} onClose={vi.fn()} onTargetApplied={handleTargetApplied} />
    );

    // Trigger TDEE calculation
    const calcButton = screen.getByText("Tính chỉ số TDEE");
    fireEvent.click(calcButton);

    // The TDEE result should show up
    expect(screen.getByText("Chỉ số TDEE tính toán:")).toBeInTheDocument();

    // Click Apply Target
    const applyButton = screen.getByText("Áp dụng mục tiêu");
    fireEvent.click(applyButton);

    // onTargetApplied chạy trong onSuccess của mutation (bất đồng bộ) -> phải chờ
    await waitFor(() => {
      expect(handleTargetApplied).toHaveBeenCalled();
    });
  });

  it("switches to Manual tab, modifies target, and saves manually", async () => {
    const handleTargetApplied = vi.fn();
    renderWithMemberSession(
      <TdeeCalculator isOpen={true} onClose={vi.fn()} onTargetApplied={handleTargetApplied} />
    );

    // Switch to manual tab
    const manualTabButton = screen.getByText("Tự thiết lập (Manual)");
    fireEvent.click(manualTabButton);

    // Check manual inputs are rendered
    const calInput = screen.getByLabelText("Calo mục tiêu (kcal)");
    const pInput = screen.getByLabelText(/Protein/);
    const cInput = screen.getByLabelText(/Carbs/);
    const fInput = screen.getByLabelText(/Fats/);

    // Modify manual target
    fireEvent.change(calInput, { target: { value: "1800" } });
    fireEvent.change(pInput, { target: { value: "150" } });
    fireEvent.change(cInput, { target: { value: "200" } });
    fireEvent.change(fInput, { target: { value: "60" } });

    // Click Apply Manual Target
    const applyManualButton = screen.getByText("Áp dụng mục tiêu thủ công");
    fireEvent.click(applyManualButton);

    // onTargetApplied chạy trong onSuccess của mutation (bất đồng bộ) -> phải chờ
    await waitFor(() => {
      expect(handleTargetApplied).toHaveBeenCalledWith(1800);
    });
  });

  it("prefills form from BE calorie target when open", async () => {
    // Override the GET mock to return target values
    server.use(
      http.get("/api/v1/members/:id/calorie-target", () => {
        return ok({
          dailyCalories: 1950,
          proteinG: 130,
          carbG: 220,
          fatG: 65,
        });
      })
    );

    renderWithMemberSession(
      <TdeeCalculator isOpen={true} onClose={vi.fn()} onTargetApplied={vi.fn()} />
    );

    // Switch to manual tab to inspect prefilled values
    const manualTabButton = screen.getByText("Tự thiết lập (Manual)");
    fireEvent.click(manualTabButton);

    // Wait and assert the input values are prefilled from BE instead of default
    await waitFor(() => {
      expect(screen.getByLabelText("Calo mục tiêu (kcal)")).toHaveValue(1950);
    });
    expect(screen.getByLabelText(/Protein/)).toHaveValue(130);
    expect(screen.getByLabelText(/Carbs/)).toHaveValue(220);
    expect(screen.getByLabelText(/Fats/)).toHaveValue(65);
  });
});
