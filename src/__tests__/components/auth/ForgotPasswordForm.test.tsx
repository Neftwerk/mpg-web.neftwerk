import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

describe("ForgotPasswordForm", () => {
  it("renders the reset password heading", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByText("auth.resetPasswordTitle")).toBeInTheDocument();
  });

  it("renders the email input", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByLabelText("auth.emailLabel")).toBeInTheDocument();
  });

  it("renders the send reset link button", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByRole("button", { name: "auth.sendResetLink" })).toBeInTheDocument();
  });

  it("disables submit button when email is empty", () => {
    render(<ForgotPasswordForm />);
    const btn = screen.getByRole("button", { name: "auth.sendResetLink" });
    expect(btn).toBeDisabled();
  });

  it("enables submit button when email is entered", async () => {
    render(<ForgotPasswordForm />);
    await userEvent.type(screen.getByLabelText("auth.emailLabel"), "user@test.com");
    const btn = screen.getByRole("button", { name: "auth.sendResetLink" });
    expect(btn).not.toBeDisabled();
  });

  it("transitions to 'check email' state after submission", async () => {
    render(<ForgotPasswordForm />);

    await userEvent.type(screen.getByLabelText("auth.emailLabel"), "user@test.com");
    fireEvent.click(screen.getByRole("button", { name: "auth.sendResetLink" }));

    await waitFor(() => {
      expect(screen.getByText("auth.checkEmailTitle")).toBeInTheDocument();
    });
  });

  it("shows 'have a reset link' button after submission", async () => {
    render(<ForgotPasswordForm />);

    await userEvent.type(screen.getByLabelText("auth.emailLabel"), "user@test.com");
    fireEvent.click(screen.getByRole("button", { name: "auth.sendResetLink" }));

    await waitFor(() => {
      expect(screen.getByText("auth.haveResetLink")).toBeInTheDocument();
    });
  });

  it("shows 'use different email' button after submission", async () => {
    render(<ForgotPasswordForm />);

    await userEvent.type(screen.getByLabelText("auth.emailLabel"), "user@test.com");
    fireEvent.click(screen.getByRole("button", { name: "auth.sendResetLink" }));

    await waitFor(() => {
      expect(screen.getByText("auth.useDifferentEmail")).toBeInTheDocument();
    });
  });

  it("returns to email form when 'use different email' is clicked", async () => {
    render(<ForgotPasswordForm />);

    await userEvent.type(screen.getByLabelText("auth.emailLabel"), "user@test.com");
    fireEvent.click(screen.getByRole("button", { name: "auth.sendResetLink" }));

    await waitFor(() => {
      expect(screen.getByText("auth.useDifferentEmail")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("auth.useDifferentEmail"));

    await waitFor(() => {
      expect(screen.getByLabelText("auth.emailLabel")).toBeInTheDocument();
    });
  });
});
