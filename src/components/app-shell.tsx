"use client";
import Image from "next/image";
export function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const onBack = () => {
    window.history.back();
  }
  return (
    <section className="bg-white">
      <header className="flex items-center gap-4 ps-2 bg-white py-3 lg:px-3">
        <Image alt='' onClick={onBack} src="/arrow.svg" width={22} height={22} />
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      </header>
      <div className="p-2">{children}</div>
    </section>
  );
}
