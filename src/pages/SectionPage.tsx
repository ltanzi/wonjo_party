import { Navigate, useParams } from "react-router-dom";
import { SECTIONS, sectionLabel } from "@/config";
import { Header } from "@/components/layout/Header";

/**
 * Placeholder until pass 2 replaces this with the generic board
 * (SPEC.md, decision 11). Only you and your friend have accounts during pass 1,
 * so an honest placeholder is fine — the crew is invited once pass 2 lands.
 */
export function SectionPage() {
  const { sectionKey } = useParams();
  const known = SECTIONS.some((s) => s.key === sectionKey);
  if (!known) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Header back />
      <div className="bar mb-4">{sectionLabel(sectionKey!)}</div>
      <p className="text-[11px] uppercase tracking-wider text-muted">Board arrives in pass 2</p>
    </div>
  );
}
