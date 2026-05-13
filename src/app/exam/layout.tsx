import { requireUser } from "@/lib/auth/requireUser";

/**
 * Exam route is outside the (app) group on purpose — full-bleed layout
 * without sidebar/topbar so the user focuses on the question + timer only.
 * Auth still enforced by middleware + this guard.
 */
export default async function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return <>{children}</>;
}
