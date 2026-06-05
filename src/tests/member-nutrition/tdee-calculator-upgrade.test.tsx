import { screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TdeeCalculator } from "@/features/member-nutrition/components/TdeeCalculator";
import { renderWithMemberSession } from "@/tests/member-nutrition/test-utils";

describe("TdeeCalculator Upgrade", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders correctly with tabs", () => {
    renderWithMemberSession(
      <TdeeCalculator isOpen={true} onClose={vi.fn()} onTargetApplied={vi.fn()} />
    );

    expect(screen.getByText("Tính TDEE tự động")).toBeInTheDocument();
    expect(screen.getByText("Tự thiết lập (Manual)")).toBeInTheDocument();
  });

  it("calculates TDEE and applies macro target automatically on TDEE tab", () => {
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

    expect(handleTargetApplied).toHaveBeenCalled();

    // Check localStorage values
    const storedCal = localStorage.getItem("gymmaster-calorie-goal");
    const storedP = localStorage.getItem("gymmaster-protein-goal");
    const storedC = localStorage.getItem("gymmaster-carbs-goal");
    const storedF = localStorage.getItem("gymmaster-fat-goal");

    expect(storedCal).not.toBeNull();
    expect(storedP).not.toBeNull();
    expect(storedC).not.toBeNull();
    expect(storedF).not.toBeNull();
  });

  it("switches to Manual tab, modifies target, and saves manually", () => {
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

    expect(handleTargetApplied).toHaveBeenCalledWith(1800);
    expect(localStorage.getItem("gymmaster-calorie-goal")).toBe("1800");
    expect(localStorage.getItem("gymmaster-protein-goal")).toBe("150");
    expect(localStorage.getItem("gymmaster-carbs-goal")).toBe("200");
    expect(localStorage.getItem("gymmaster-fat-goal")).toBe("60");
  });
});
