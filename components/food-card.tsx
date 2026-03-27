import type { Food } from "@/lib/mock-data";
import { getDaysUntilExpiry, getFoodStatus, getFoodStatusLabel } from "@/lib/food-status";

type FoodCardProps = {
  food: Food;
  storageSpaceName: string;
  onClick?: () => void;
  compact?: boolean;
};

const statusClassName = {
  fresh:
    "border border-[#cfeeda] bg-[#ecfaf2] text-[var(--color-fresh)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  soon:
    "border border-[#fde0b2] bg-[#fff5df] text-[var(--color-soon)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  today:
    "border border-[#ffc8c8] bg-[#fff0f0] text-[var(--color-today)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  expired:
    "border border-[#d9e2ec] bg-[#f3f6fa] text-[var(--color-expired)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
};

export function FoodCard({
  food,
  storageSpaceName,
  onClick,
  compact = false,
}: FoodCardProps) {
  const status = getFoodStatus(food);
  const daysUntilExpiry = getDaysUntilExpiry(food.expiryDate);
  const remainingText =
    daysUntilExpiry < 0
      ? `${Math.abs(daysUntilExpiry)}일 지났어요`
      : daysUntilExpiry === 0
        ? "오늘까지예요"
        : `${daysUntilExpiry}일 남았어요`;
  const cardBody = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={`font-semibold tracking-tight text-[var(--color-ink)] ${
                compact ? "text-base" : "text-lg"
              }`}
            >
              {food.name}
            </h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold tracking-[0.01em] ${statusClassName[status]}`}
            >
              {getFoodStatusLabel(status)}
            </span>
          </div>
          <p
            className={`font-medium text-[var(--color-muted)] ${
              compact ? "mt-1.5 text-[13px]" : "mt-2 text-sm"
            }`}
          >
            {food.quantity}
            {food.unit} · {storageSpaceName}
          </p>
          <p
            className={`font-medium ${
              status === "expired"
                ? "text-[var(--color-today)]"
                : status === "today"
                  ? "text-[var(--color-today)]"
                  : status === "soon"
                    ? "text-[var(--color-soon)]"
                    : "text-[var(--color-muted)]"
            } ${compact ? "mt-1 text-[12px] leading-4" : "mt-1.5 text-[13px] leading-5"}`}
          >
            {remainingText}
          </p>
        </div>
        <div
          className={`rounded-3xl bg-[var(--color-surface-soft)] text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ${
            compact ? "px-3 py-2" : "px-3.5 py-2.5"
          }`}
        >
          <p className="text-[11px] font-medium tracking-[0.02em] text-[var(--color-muted)]">
            소비기한
          </p>
          <p
            className={`mt-1 font-semibold tracking-tight text-[var(--color-ink)] ${
              compact ? "text-base" : "text-lg"
            }`}
          >
            {food.expiryDate}
          </p>
        </div>
      </div>
      {onClick && !compact ? (
        <p className="mt-2.5 text-xs font-medium text-[var(--color-mint-deep)]">
          탭해서 수정, 소비완료, 폐기, 삭제를 선택할 수 있어요.
        </p>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`block w-full rounded-[28px] border border-[var(--color-line)] bg-[var(--color-surface)] text-left shadow-[var(--shadow-card-strong)] transition hover:-translate-y-0.5 hover:border-[#d5e4dd] hover:shadow-[var(--shadow-card)] active:scale-[0.99] ${
          compact ? "px-4 py-2.5" : "px-4 py-3"
        }`}
      >
        {cardBody}
      </button>
    );
  }

  return (
    <article
      className={`rounded-[28px] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-card-strong)] ${
        compact ? "px-4 py-2.5" : "px-4 py-3"
      }`}
    >
      {cardBody}
    </article>
  );
}
