// app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Include a shared dashboard navbar or sidebar here */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex-shrink-0">
                    <h1 className="text-xl font-bold text-gray-800">NAWAB-AI Dashboard</h1>
                </div>
            </div>
        </div>
      </nav>
      <main>
        {children}
      </main>
    </section>
  );
}
