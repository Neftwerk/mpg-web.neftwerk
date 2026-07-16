import { AppTopBar } from "@/components/AppTopBar";

export function AuthShell({
  title,
  children,
  /** Mid-flow auth steps (OTP, reset) use history; landing pages go Home. */
  historyBack = false,
}: {
  title: string;
  children: React.ReactNode;
  historyBack?: boolean;
}) {
  return (
    <div className="min-h-[100dvh] bg-[url('/images/deco-pattern-background.svg')] bg-cover bg-center bg-no-repeat">
      <div className="mx-auto flex min-h-[100dvh] max-w-[520px] flex-col">
        <AppTopBar
          title={title}
          historyBack={historyBack}
          forwardHome={!historyBack}
        />
        <div className="flex-1 px-4 py-6 pb-10">
          <div className="flex justify-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/neftwerklogo.webp"
              alt="Neftwerk"
              className="h-[60px] object-contain"
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
