import { Navigate, useParams } from "react-router-dom";
import { findSection } from "@/config";
import { Header } from "@/components/layout/Header";
import { SectionHeader } from "@/components/layout/SectionHeader";

/**
 * Placeholder until pass 2 replaces this with the generic board
 * (SPEC.md, decision 11). Only you and your friend have accounts during pass 1,
 * so an honest placeholder is fine — the crew is invited once pass 2 lands.
 */
export function SectionPage() {
  const { sectionKey } = useParams();
  if (!sectionKey || !findSection(sectionKey)) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Header back />
      <SectionHeader sectionKey={sectionKey} />
      <p className="border-t border-fg/15 pt-3 text-[11px] uppercase tracking-wider text-muted">
        Board arrives in pass 2
      </p>
    </div>
  );
}
