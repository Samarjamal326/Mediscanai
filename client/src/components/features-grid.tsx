import { Link } from "wouter";

function IconBrainStethoscope({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M12 17h.01M12 14a3 3 0 100-6 3 3 0 000 6z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconMolecule({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="7" cy="8" r="1.8" />
      <circle cx="17" cy="8" r="1.8" />
      <circle cx="10" cy="17" r="1.8" />
      <circle cx="16" cy="17" r="1.8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 10l-2-1M14 10l2-1M11 13l-1 3M13 13l1 3" />
    </svg>
  );
}

function IconHeartPulse({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 21s-6.716-4.35-9-8.5C1.5 8.5 4.5 5 8.5 5c2.064 0 3.563 1.32 3.5 4 .063-2.68 1.564-4 3.5-4 4 0 7 3.5 6.5 7.5-2.284 4.15-9 8.5-9 8.5zm.5-9.8l1.8 3.2 2.5-7-2.2.9-2.1-.8-2.1.8-2.2-.9 2.5 7 1.8-3.2z" />
    </svg>
  );
}

export default function FeaturesGrid() {
  const features = [
    {
      href: "/disease-prediction",
      title: "Disease Prediction",
      description:
        "AI-powered symptom analysis to highlight possible conditions and sensible next-step guidance — not a formal diagnosis.",
      cta: "Start Diagnosis",
      iconBg: "bg-[var(--msc-primary-light)] text-[var(--msc-primary)]",
      Icon: IconBrainStethoscope,
      borderHover: "hover:border-[var(--msc-primary)]",
    },
    {
      href: "/drug-recommendation",
      title: "Drug Finder",
      description: "Natural-language similarity to surface alternative medicines you can discuss with your clinician.",
      cta: "Find Alternatives",
      iconBg: "bg-[var(--msc-accent-teal-light)] text-[var(--msc-accent-teal)]",
      Icon: IconMolecule,
      borderHover: "hover:border-[var(--msc-accent-teal)]",
    },
    {
      href: "/heart-assessment",
      title: "Heart Risk",
      description:
        "Lifestyle and history inputs combined into a cardiovascular risk outlook for education and motivation.",
      cta: "Assess Risk",
      iconBg: "bg-[var(--msc-danger-light)] text-[var(--msc-danger)]",
      Icon: IconHeartPulse,
      borderHover: "hover:border-[var(--msc-danger)]",
    },
  ];

  return (
    <section className="msc-stagger-4 relative msc-inner overflow-hidden py-20 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold text-[var(--text-heading)] md:text-[36px]">
          Comprehensive AI Healthcare Solutions
        </h2>
        <p className="mx-auto mt-3 max-w-2xl font-sans text-base text-[var(--text-muted)] md:text-[16px]">
          Modular tools grounded in retrieval and structured medical prompts — unified under one calm interface.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-8 text-left md:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href}>
              <article
                className={`msc-card-lift flex h-full cursor-pointer flex-col rounded-[var(--radius-lg)] border border-[var(--msc-border)] bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-sm)] ${feature.borderHover} group`}
                data-testid={`card-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div
                  className={`mb-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] ${feature.iconBg}`}
                >
                  <feature.Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-[var(--text-heading)]">{feature.title}</h3>
                <p className="mt-3 flex-grow font-sans text-sm leading-[1.65] text-[var(--text-body)]">
                  {feature.description}
                </p>
                <div className="mt-8 flex items-center font-sans text-sm font-semibold text-[var(--msc-primary)]">
                  <span>{feature.cta}</span>
                  <span className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
