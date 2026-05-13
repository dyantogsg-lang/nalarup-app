export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-navy flex items-center justify-center">
      {children}
    </main>
  );
}
