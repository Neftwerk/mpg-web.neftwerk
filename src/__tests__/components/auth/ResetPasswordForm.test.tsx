import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

describe("ResetPasswordForm", () => {
  it("renders the choose new password heading", () => {
    render(<ResetPasswordForm />);
    expect(screen.getByText("auth.chooseNewPasswordTitle")).toBeInTheDocument();
  });

  it("renders password and confirm password fields", () => {
    render(<ResetPasswordForm />);
    expect(screen.getByLabelText("auth.newPasswordLabel")).toBeInTheDocument();
    expect(screen.getByLabelText("auth.confirmPasswordLabel")).toBeInTheDocument();
  });

  it("renders the update password button", () => {
    render(<ResetPasswordForm />);
    expect(screen.getByRole("button", { name: "auth.updatePasswordButton" })).toBeInTheDocument();
  });

  it("disables submit when passwords are empty", () => {
    render(<ResetPasswordForm />);
    expect(screen.getByRole("button", { name: "auth.updatePasswordButton" })).toBeDisabled();
  });

  it("disables submit when password is too short (< 8 chars)", async () => {
    render(<ResetPasswordForm />);

    await userEvent.type(screen.getByLabelText("auth.newPasswordLabel"), "short");
    await userEvent.type(screen.getByLabelText("auth.confirmPasswordLabel"), "short");

    expect(screen.getByRole("button", { name: "auth.updatePasswordButton" })).toBeDisabled();
  });

  it("disables submit when passwords don't match", async () => {
    render(<ResetPasswordForm />);

    await userEvent.type(screen.getByLabelText("auth.newPasswordLabel"), "password123");
    await userEvent.type(screen.getByLabelText("auth.confirmPasswordLabel"), "different123");

    expect(screen.getByRole("button", { name: "auth.updatePasswordButton" })).toBeDisabled();
  });

  it("shows mismatch error when confirm password differs", async () => {
    render(<ResetPasswordForm />);

    await userEvent.type(screen.getByLabelText("auth.newPasswordLabel"), "password123");
    await userEvent.type(screen.getByLabelText("auth.confirmPasswordLabel"), "different123");

    expect(screen.getByRole("alert")).toHaveTextContent("auth.errors.passwordsDoNotMatch");
  });

  it("enables submit when passwords match and are >= 8 chars", async () => {
    render(<ResetPasswordForm />);

    await userEvent.type(screen.getByLabelText("auth.newPasswordLabel"), "password123");
    await userEvent.type(screen.getByLabelText("auth.confirmPasswordLabel"), "password123");

    expect(screen.getByRole("button", { name: "auth.updatePasswordButton" })).not.toBeDisabled();
  });

  it("shows success state after valid submission", async () => {
    render(<ResetPasswordForm />);

    await userEvent.type(screen.getByLabelText("auth.newPasswordLabel"), "password123");
    await userEvent.type(screen.getByLabelText("auth.confirmPasswordLabel"), "password123");
    fireEvent.click(screen.getByRole("button", { name: "auth.updatePasswordButton" }));

    await waitFor(() => {
      expect(screen.getByText("auth.passwordUpdatedTitle")).toBeInTheDocument();
      expect(screen.getByText("auth.passwordUpdatedBody")).toBeInTheDocument();
    });
  });

  it("shows back to login link after success", async () => {
    render(<ResetPasswordForm />);

    await userEvent.type(screen.getByLabelText("auth.newPasswordLabel"), "password123");
    await userEvent.type(screen.getByLabelText("auth.confirmPasswordLabel"), "password123");
    fireEvent.click(screen.getByRole("button", { name: "auth.updatePasswordButton" }));

    await waitFor(() => {
      expect(screen.getByText("auth.backToLogin")).toBeInTheDocument();
    });
  });

  it("renders cancel and return to login link", () => {
    render(<ResetPasswordForm />);
    expect(screen.getByText("auth.cancelAndReturnToLogin")).toBeInTheDocument();
  });
});
