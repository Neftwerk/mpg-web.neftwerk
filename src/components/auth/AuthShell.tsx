export function AuthShell({
  title,
  backHref = "/home",
  children,
}: {
  title: string;
  backHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[url('/images/deco-pattern-background.svg')] bg-cover bg-center bg-no-repeat">
      <div className="mx-auto flex min-h-[100dvh] max-w-[520px] flex-col">
        <header className="flex items-center justify-center border-b border-slate-200 bg-[#F7F4F3]/95 p-3">
          <h1 className="text-center text-lg font-semibold text-[#1A3F6C]">{title}</h1>
        </header>
        <div className="flex-1 px-4 py-6 pb-10">
          {/* Neftwerk logo */}
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
