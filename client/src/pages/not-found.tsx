import { Link } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="msc-page-bg">
      <div className="msc-inner min-h-screen">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center px-4 pb-16 pt-28">
          <Card className="mx-auto w-full max-w-md border-[var(--msc-border)] bg-[var(--bg-surface)] shadow-[var(--shadow-md)]">
            <CardContent className="pt-8 pb-8">
              <div className="mb-4 flex gap-3">
                <AlertCircle className="h-8 w-8 text-[var(--msc-danger)]" />
                <h1 className="font-display text-2xl font-bold text-[var(--text-heading)]">404 — Page Not Found</h1>
              </div>

              <p className="mt-4 font-sans text-sm text-[var(--text-muted)]">That route does not exist in MediSCAN Ai.</p>
              <Link
                href="/"
                className="mt-6 inline-flex rounded-[var(--radius-pill)] bg-[var(--msc-primary)] px-5 py-2 font-sans text-sm font-semibold text-white hover:bg-[var(--msc-primary-hover)]"
              >
                Back to Dashboard
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </div>
  );
}
