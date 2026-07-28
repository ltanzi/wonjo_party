import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "@/auth/AuthProvider";
import { LoginPage } from "@/auth/LoginPage";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { HomePage } from "@/pages/HomePage";
import { LineupPage } from "@/pages/LineupPage";
import { CompilationPage } from "@/pages/CompilationPage";
import { BoardPage } from "@/pages/BoardPage";

/**
 * Keyed by section so a param change is a remount. React Router reuses the
 * component instance when only the param changes, which would leave the
 * previous section's rows on screen under the new heading — and offline, with
 * no fetch to correct it, indefinitely. Unreachable through the current UI
 * (every board-to-board move goes via Home), but one nav link away.
 */
function BoardRoute() {
  const { sectionKey } = useParams();
  return <BoardPage key={sectionKey} />;
}

function Gate() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted">…</span>
      </div>
    );
  }

  if (!session) return <LoginPage />;

  return (
    <>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Bespoke sections before the generic board */}
        <Route path="/lineup" element={<LineupPage />} />
        <Route path="/compilation" element={<CompilationPage />} />
        <Route path="/:sectionKey" element={<BoardRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export function App() {
  return (
    // BASE_URL is '/wonjo_party/' in production, '/' in dev
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </BrowserRouter>
  );
}
