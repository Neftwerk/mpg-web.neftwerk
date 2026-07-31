import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/LoginForm";

// ── Mock auth-service ──
const mockRequestLoginOtp = vi.fn();
const mockVerifyLoginOtp = vi.fn();
const mockSetTokens = vi.fn();
const mockInitiateGoogleOAuth = vi.fn();

vi.mock("@/lib/auth-service", () => ({
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

describe("LoginForm", () => {
  it("renders the login heading", () => {
    render(<LoginForm />);
    expect(screen.getByText("auth.loginHeading")).toBeInTheDocument();
  });

  it("renders the email input field", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("auth.emailLabel")).toBeInTheDocument();
  });

  it("renders the login button", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: "auth.loginButton" })).toBeInTheDocument();
  });

  it("renders link to signup page", () => {
    render(<LoginForm />);
    expect(screen.getByText("auth.signUp")).toBeInTheDocument();
  });

  it("renders Google OAuth button", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: /auth.continueWithGoogle/ })).toBeInTheDocument();
  });

  it("does not submit when email is empty", async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: "auth.loginButton" }));

    // Should NOT call the API
    expect(mockRequestLoginOtp).not.toHaveBeenCalled();
  });

  it("calls requestLoginOtp with trimmed email", async () => {
    mockRequestLoginOtp.mockResolvedValue({ ok: true });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("auth.emailLabel"), "  user@test.com  ");
    fireEvent.click(screen.getByRole("button", { name: "auth.loginButton" }));

    await waitFor(() => {
      expect(mockRequestLoginOtp).toHaveBeenCalledWith({
        email: "user@test.com",
      });
    });
  });

  it("transitions to OTP step after successful OTP request", async () => {
    mockRequestLoginOtp.mockResolvedValue({ ok: true });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("auth.emailLabel"), "user@test.com");
    fireEvent.click(screen.getByRole("button", { name: "auth.loginButton" }));

    await waitFor(() => {
      expect(screen.getByText("auth.enterOtpCode")).toBeInTheDocument();
    });
  });

  it("shows error when OTP request fails", async () => {
    mockRequestLoginOtp.mockResolvedValue({
      ok: false,
      message: "Account not found",
    });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("auth.emailLabel"), "unknown@test.com");
    fireEvent.click(screen.getByRole("button", { name: "auth.loginButton" }));

    await waitFor(() => {
      expect(screen.getByText("Account not found")).toBeInTheDocument();
    });
  });

  it("shows loading state during submission", async () => {
    mockRequestLoginOtp.mockReturnValue(new Promise(() => {}));

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("auth.emailLabel"), "user@test.com");
    fireEvent.click(screen.getByRole("button", { name: "auth.loginButton" }));

    await waitFor(() => {
      expect(screen.getByText("common.pleaseWait")).toBeInTheDocument();
    });
  });

  it("shows the email in OTP step with edit button", async () => {
    mockRequestLoginOtp.mockResolvedValue({ ok: true });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("auth.emailLabel"), "user@test.com");
    fireEvent.click(screen.getByRole("button", { name: "auth.loginButton" }));

    await waitFor(() => {
      expect(screen.getByText("user@test.com")).toBeInTheDocument();
      expect(screen.getByText("auth.notYou")).toBeInTheDocument();
    });
  });

  it("returns to email step when edit button is clicked", async () => {
    mockRequestLoginOtp.mockResolvedValue({ ok: true });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("auth.emailLabel"), "user@test.com");
    fireEvent.click(screen.getByRole("button", { name: "auth.loginButton" }));

    await waitFor(() => {
      expect(screen.getByText("auth.notYou")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("auth.notYou"));

    await waitFor(() => {
      expect(screen.getByLabelText("auth.emailLabel")).toBeInTheDocument();
    });
  });

  it("calls initiateGoogleOAuth when Google button is clicked", () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /auth.continueWithGoogle/ }));
    expect(mockInitiateGoogleOAuth).toHaveBeenCalled();
  });
});
