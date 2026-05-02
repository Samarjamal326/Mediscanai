import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="relative z-[1] border-t border-[var(--msc-border)] bg-[var(--bg-surface)] py-12">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--msc-primary-light)]">
                <i className="fas fa-heart-pulse text-lg text-[var(--msc-primary)]" />
              </span>
              <span className="font-display text-lg font-bold text-[var(--text-heading)]">
                Medi<span className="text-[var(--msc-primary)]">SCAN</span>
                <span className="text-[var(--msc-accent-teal)]"> Ai</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              AI-powered healthcare intelligence for symptom insights, alternatives, and risk awareness — informational
              only.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-bold text-[var(--text-heading)]">Features</h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li>
                <Link href="/disease-prediction" className="transition-colors hover:text-[var(--msc-primary)]">
                  Disease Prediction
                </Link>
              </li>
              <li>
                <Link href="/drug-recommendation" className="transition-colors hover:text-[var(--msc-accent-teal)]">
                  Drug Finder
                </Link>
              </li>
              <li>
                <Link href="/heart-assessment" className="transition-colors hover:text-[var(--msc-danger)]">
                  Heart Risk
                </Link>
              </li>
              <li>
                <Link href="/reports" className="transition-colors hover:text-[var(--msc-primary)]">
                  Reports
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-bold text-[var(--text-heading)]">Technology</h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li>Gemini &amp; RAG grounding</li>
              <li>React &amp; TanStack Query</li>
              <li>Express &amp; PostgreSQL</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-bold text-[var(--text-heading)]">Legal</h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li>
                <span className="cursor-default hover:text-[var(--text-body)]">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-default hover:text-[var(--text-body)]">Terms of Service</span>
              </li>
              <li>
                <span className="cursor-default hover:text-[var(--text-body)]">Medical Disclaimer</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--msc-border)] pt-8 text-center text-sm text-[var(--text-muted)]">
          <p>
            © {new Date().getFullYear()} MediSCAN Ai. Educational / demo platform — not a substitute for professional
            care.
          </p>
        </div>
      </div>
    </footer>
  );
}
