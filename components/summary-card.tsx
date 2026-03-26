type SummaryCardProps = {
  label: string;
  value: number | string;
  tone: "mint" | "fresh" | "soon" | "today" | "expired";
};

const toneStyles: Record<SummaryCardProps["tone"], string> = {
  mint: "bg-[linear-gradient(135deg,#effbf6_0%,#daf2e8_100%)] text-[var(--color-mint-deep)]",
  fresh: "bg-[linear-gradient(135deg,#eefcf4_0%,#ddf6e7_100%)] text-[var(--color-fresh)]",
  soon: "bg-[linear-gradient(135deg,#fff8eb_0%,#ffedd1_100%)] text-[var(--color-soon)]",
  today: "bg-[linear-gradient(135deg,#fff0f0_0%,#ffdede_100%)] text-[var(--color-today)]",
  expired:
    "bg-[linear-gradient(135deg,#f5f7fb_0%,#e8edf5_100%)] text-[var(--color-expired)]",
};

export function SummaryCard({ label, value, tone }: SummaryCardProps) {
  return (
    <article
      className={`rounded-[28px] px-4 py-5 shadow-[var(--shadow-card-strong)] transition hover:-translate-y-0.5 ${toneStyles[tone]}`}
    >
      <p className="text-xs font-medium tracking-[0.03em] opacity-80">{label}</p>
      <p className="mt-3 text-[2rem] font-semibold tracking-tight leading-none">
        {value}
      </p>
    </article>
  );
}
