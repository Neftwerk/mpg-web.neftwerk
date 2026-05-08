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
    <div className="min-h-[100dvh] bg-[url('/api/deco-bg')] bg-cover bg-center bg-no-repeat">
      <div className="mx-auto flex min-h-[100dvh] max-w-[520px] flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50/95 p-3">
          <h1 className="mx-auto text-center text-lg font-semibold text-slate-900">{title}</h1>
          <span className="h-10 w-10 flex-shrink-0" aria-hidden />
        </header>
        <div className="flex-1 px-4 py-6 pb-10">{children}</div>
      </div>
    </div>
  );
}
