import { Link } from "wouter";

export default function Hero() {
  return (
    <section
      className="msc-inner scroll-mt-28 pb-14 pt-28 md:scroll-mt-32 md:pb-24 md:pt-32"
      aria-label="Home hero"
    >
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="msc-stagger-1">
          <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-[var(--text-heading)] md:text-[64px] md:leading-[1.05]">
            <span className="msc-hero-shimmer">Healthcare Intelligence</span>
          </h1>
          <div className="mx-auto mb-8 mt-5 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--msc-accent-teal-light)] px-4 py-1.5 font-sans text-sm font-semibold text-[var(--msc-accent-teal)]">
            <span aria-hidden>⚕</span> AI-Powered Platform
          </div>
          <p className="mx-auto max-w-[520px] font-sans text-base leading-[1.7] text-[var(--text-muted)] md:text-[18px]">
            Leveraging Machine Learning and NLP for accurate disease insights, thoughtful medication alternatives, and
            assisted heart-health awareness — all in one place.
          </p>
        </div>

        <div className="msc-stagger-2 mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <div className="msc-btn-pulse-wrap">
            <Link href="/disease-prediction">
              <button
                type="button"
                className="inline-flex rounded-[var(--radius-pill)] bg-[var(--msc-primary)] px-8 py-3.5 font-sans text-base font-semibold text-white shadow-md transition-[transform,box-shadow] duration-150 hover:scale-[1.02] hover:bg-[var(--msc-primary-hover)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.35)] active:scale-[0.98]"
                data-testid="button-start-assessment"
              >
                Start Health Assessment
              </button>
            </Link>
          </div>
          <Link href="/heart-assessment">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-[var(--radius-pill)] border-[1.5px] border-[var(--msc-border)] bg-[var(--bg-surface)] px-8 py-3.5 font-sans text-base font-semibold text-[var(--text-heading)] transition-colors duration-150 hover:border-[var(--msc-primary)] hover:bg-[var(--msc-primary-light)] hover:text-[var(--msc-primary)] sm:w-auto"
              data-testid="button-learn-more"
            >
              Check Heart Risk
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
