import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminUsersTemplateWorkspace } from "@/features/member-management/components/AdminUsersTemplateWorkspace";
import { mapMemberManagementError } from "@/features/member-management/utils/member-management-errors";
import { ApiClientError } from "@/lib/api/http-client";
import { renderWithAdminSession } from "@/tests/admin-dashboard/test-utils";

describe("AdminUsersTemplateWorkspace", () => {
  it("creates, edits, locks, resets password, and deletes a user", async () => {
    renderWithAdminSession(<AdminUsersTemplateWorkspace />);

    expect(await screen.findByText("Tài khoản hệ thống")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByText("GymMaster Admin").length).toBeGreaterThan(0);
    });
    expect(screen.getByText("Thông tin chung")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Thêm người dùng" }));
    fireEvent.change(screen.getByTestId("user-create-name"), {
      target: { value: "Template Fidelity Staff" },
    });
    fireEvent.change(screen.getByTestId("user-create-email"), {
      target: { value: "template-fidelity-staff@gymmaster.local" },
    });
    fireEvent.change(screen.getByTestId("user-create-phone"), {
      target: { value: "0900000555" },
    });
    fireEvent.click(screen.getByTestId("user-create-submit"));

    fireEvent.click(await screen.findByText("Template Fidelity Staff"));

    fireEvent.change(screen.getByTestId("user-edit-name"), {
      target: { value: "Template Fidelity Lead" },
    });
    fireEvent.click(screen.getByTestId("user-edit-submit"));

    expect(await screen.findByText("Da cap nhat thong tin nguoi dung")).toBeInTheDocument();
    expect(
      (await screen.findAllByText("Template Fidelity Lead")).length,
    ).toBeGreaterThan(0);

    fireEvent.click(screen.getByTestId("user-toggle-lock-button"));
    expect(await screen.findByText("Da khoa tai khoan")).toBeInTheDocument();
    expect((await screen.findAllByText("Đã khóa")).length).toBeGreaterThan(0);

    const securityTab = screen.getByRole("tab", { name: "Bảo mật" });
    fireEvent.pointerDown(securityTab);
    fireEvent.mouseDown(securityTab);
    fireEvent.click(securityTab);
    const resetBtn = await screen.findByTestId("user-reset-password-button");
    fireEvent.click(resetBtn);
    expect(
      await screen.findByText("Đã tạo mật khẩu tạm thời"),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Mật khẩu tạm thời:/)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("user-delete-button"));
    expect(await screen.findByText("Đã vô hiệu hóa tài khoản")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryAllByText("Template Fidelity Lead")).toHaveLength(0);
    });
  });

  it("limits create-user role choices to staff and admin", async () => {
    renderWithAdminSession(<AdminUsersTemplateWorkspace />);

    fireEvent.click(await screen.findByRole("button", { name: "Thêm người dùng" }));

    const select = screen.getByTestId("user-create-role") as HTMLSelectElement;
    expect(Array.from(select.options).map((option) => option.value)).toEqual([
      "staff",
      "admin",
    ]);
    expect(screen.getByText(/Man nay chi tao tai khoan van hanh/)).toBeInTheDocument();
  });

  it("keeps persona account roles read-only in the edit form", async () => {
    renderWithAdminSession(<AdminUsersTemplateWorkspace />);

    fireEvent.click(await screen.findByText("Gym Member"));

    expect(screen.queryByTestId("user-edit-role")).not.toBeInTheDocument();
    expect(await screen.findByText(/Tai khoan/)).toBeInTheDocument();
    expect(screen.getByText(/Quan ly tai man Hoi vien/)).toBeInTheDocument();
  });

  it("maps blocked role transition errors to the role guard message", () => {
    const result = mapMemberManagementError(
      new ApiClientError(
        {
          code: "ROLE_TRANSITION_NOT_ALLOWED",
          message: "Cannot transition role",
        },
        422,
      ),
    );

    expect(result.message).toMatch(/Khong the chuyen vai tro/);
  });
});
