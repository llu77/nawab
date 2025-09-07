// app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Include a shared dashboard navbar or sidebar here */}
      <nav>Dashboard Nav</nav>
      {children}
    </section>
  );
}
