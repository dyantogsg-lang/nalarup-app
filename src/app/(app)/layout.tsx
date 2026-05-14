import { requireUser } from "@/lib/auth/requireUser";
import { TopNav } from "@/components/app-shell/TopNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopNav fullName={profile.fullName} />
      <main
        style={{
          flex: 1,
          padding: "1.5rem 2rem",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {children}
      </main>
    </div>
  );
}
