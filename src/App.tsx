import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/auth/AuthProvider";
import { LoginPage } from "@/auth/LoginPage";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { HomePage } from "@/pages/HomePage";
import { LineupPage } from "@/pages/LineupPage";
import { BoardPage } from "@/pages/BoardPage";

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
        <Route path="/lineup" element={<LineupPage />} />
        <Route path="/:sectionKey" element={<BoardPage />} />
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
