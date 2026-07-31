import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "@/components/auth/SignupForm";

// ── Mock auth-service ──
const mockRegister = vi.fn();
const mockRequestLoginOtp = vi.fn();
const mockVerifyLoginOtp = vi.fn();
const mockSetTokens = vi.fn();
const mockInitiateGoogleOAuth = vi.fn();

vi.mock("@/lib/auth-service", () => ({
  register: (...args: unknown[]) => mockRegister(...args),
  requestLoginOtp: (...args: unknown[]) => mockRequestLoginOtp(...args),
  verifyLoginOtp: (...args: unknown[]) => mockVerifyLoginOtp(...args),
  setTokens: (...args: unknown[]) => mockSetTokens(...args),
  initiateGoogleOAuth: () => mockInitiateGoogleOAuth(),
}));

// ── Mock UserContext ──
const mockRefresh = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/UserContext", () => ({
  useUser: () => ({ user: null, loading: false, refresh: mockRefresh, patchUser: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SignupForm", () => {
  it("renders the signup heading", () => {
    render(<SignupForm />);
    expect(screen.getByText("auth.signupHeading")).toBeInTheDocument();
  });

  it("renders name and email input fields", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText("auth.nameLabel")).toBeInTheDocument();
    expect(screen.getByLabelText("auth.emailLabel")).toBeInTheDocument();
  });

  it("renders the create account button", () => {
    render(<SignupForm />);
    expect(screen.getByRole("button", { name: "auth.createAccount" })).toBeInTheDocument();
  });

  it("renders Google OAuth button", () => {
    render(<SignupForm />);
    expect(screen.getByRole("button", { name: /auth.continueWithGoogle/ })).toBeInTheDocument();
  });

  it("renders link to login page", () => {
    render(<SignupForm />);
    expect(screen.getByText("auth.loginTitle")).toBeInTheDocument();
  });

  it("shows error when submitting empty form", async () => {
    render(<SignupForm />);
    const submitButton = screen.getByRole("button", { name: "auth.createAccount" });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("auth.errors.enterDetails")).toBeInTheDocument();
    });
  });

  it("calls register and requestLoginOtp on valid submission", async () => {
    mockRegister.mockResolvedValue({ ok: true, data: {} });
    mockRequestLoginOtp.mockResolvedValue({ ok: true });

    render(<SignupForm />);

    const nameInput = screen.getByLabelText("auth.nameLabel");
    const emailInput = screen.getByLabelText("auth.emailLabel");

    await userEvent.type(nameInput, "John Doe");
    await userEvent.type(emailInput, "john@test.com");

    const submitButton = screen.getByRole("button", { name: "auth.createAccount" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        fullName: "John Doe",
        email: "john@test.com",
      });
    });

    await waitFor(() => {
      expect(mockRequestLoginOtp).toHaveBeenCalledWith({
        email: "john@test.com",
      });
    });
  });

  it("transitions to OTP step after successful registration", async () => {
    mockRegister.mockResolvedValue({ ok: true, data: {} });
    mockRequestLoginOtp.mockResolvedValue({ ok: true });

    render(<SignupForm />);

    await userEvent.type(screen.getByLabelText("auth.nameLabel"), "Jane");
    await userEvent.type(screen.getByLabelText("auth.emailLabel"), "jane@test.com");
    fireEvent.click(screen.getByRole("button", { name: "auth.createAccount" }));

    await waitFor(() => {
      expect(screen.getByText("auth.enterOtpCode")).toBeInTheDocument();
    });
  });

  it("shows error when registration fails", async () => {
    mockRegister.mockResolvedValue({
      ok: false,
      message: "Email already registered",
    });

    render(<SignupForm />);

    await userEvent.type(screen.getByLabelText("auth.nameLabel"), "Test");
    await userEvent.type(screen.getByLabelText("auth.emailLabel"), "existing@test.com");
    fireEvent.click(screen.getByRole("button", { name: "auth.createAccount" }));

    await waitFor(() => {
      expect(screen.getByText("Email already registered")).toBeInTheDocument();
    });
  });

  it("shows loading state during submission", async () => {
    // Keep the promise hanging to test loading state
    mockRegister.mockReturnValue(new Promise(() => {}));

    render(<SignupForm />);

    await userEvent.type(screen.getByLabelText("auth.nameLabel"), "Test");
    await userEvent.type(screen.getByLabelText("auth.emailLabel"), "test@test.com");
    fireEvent.click(screen.getByRole("button", { name: "auth.createAccount" }));

    await waitFor(() => {
      expect(screen.getByText("common.pleaseWait")).toBeInTheDocument();
    });
  });

  it("renders 6 OTP input fields when in OTP step", async () => {
    mockRegister.mockResolvedValue({ ok: true, data: {} });
    mockRequestLoginOtp.mockResolvedValue({ ok: true });

    render(<SignupForm />);

    await userEvent.type(screen.getByLabelText("auth.nameLabel"), "Test");
    await userEvent.type(screen.getByLabelText("auth.emailLabel"), "test@test.com");
    fireEvent.click(screen.getByRole("button", { name: "auth.createAccount" }));

    await waitFor(() => {
      const inputs = screen.getAllByRole("textbox");
      expect(inputs.length).toBe(6);
    });
  });

  it("calls initiateGoogleOAuth when Google button is clicked", async () => {
    render(<SignupForm />);

    const googleButton = screen.getByRole("button", { name: /auth.continueWithGoogle/ });
    fireEvent.click(googleButton);

    expect(mockInitiateGoogleOAuth).toHaveBeenCalled();
  });
});
