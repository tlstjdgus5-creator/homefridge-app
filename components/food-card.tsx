import Link from "next/link";
import type { Food } from "@/lib/mock-data";
import { getDaysUntilExpiry, getFoodStatus, getFoodStatusLabel } from "@/lib/food-status";

type FoodCardProps = {
  food: Food;
  storageSpaceName: string;
  actions?: {
    onDelete?: () => void;
    onConsume?: () => void;
    onDiscard?: () => void;
  };
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

export function FoodCard({ food, storageSpaceName, actions }: FoodCardProps) {
  const status = getFoodStatus(food);
  const daysUntilExpiry = getDaysUntilExpiry(food.expiryDate);

  return (
    <article className="rounded-[28px] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-4 shadow-[var(--shadow-card-strong)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
              {food.name}
            </h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold tracking-[0.01em] ${statusClassName[status]}`}
            >
              {getFoodStatusLabel(status)}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-[var(--color-muted)]">
            {food.quantity}
            {food.unit} · {storageSpaceName}
          </p>
        </div>
        <div className="rounded-3xl bg-[var(--color-surface-soft)] px-4 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
          <p className="text-[11px] font-medium tracking-[0.02em] text-[var(--color-muted)]">
            소비기한
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-[var(--color-ink)]">
            {food.expiryDate}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm text-[var(--color-muted)]">
        {daysUntilExpiry < 0
          ? `${Math.abs(daysUntilExpiry)}일 지났어요`
          : daysUntilExpiry === 0
            ? "오늘까지예요"
            : `${daysUntilExpiry}일 남았어요`}
      </p>
      {actions ? (
        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link
            href={`/foods/${food.id}/edit`}
            className="inline-flex min-w-[78px] items-center justify-center rounded-full bg-[var(--color-bg-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--color-mint-deep)] hover:-translate-y-0.5"
          >
            수정
          </Link>
          {actions.onConsume ? (
            <button
              type="button"
              onClick={actions.onConsume}
              className="inline-flex min-w-[78px] items-center justify-center rounded-full bg-[#effbf6] px-4 py-2.5 text-sm font-semibold text-[var(--color-fresh)] hover:-translate-y-0.5"
            >
              소비완료
            </button>
          ) : null}
          {actions.onDelete ? (
            <button
              type="button"
              onClick={actions.onDelete}
              className="inline-flex min-w-[78px] items-center justify-center rounded-full bg-[#fff3f3] px-4 py-2.5 text-sm font-semibold text-[var(--color-today)] hover:-translate-y-0.5"
            >
              삭제
            </button>
          ) : null}
          {actions.onDiscard ? (
            <button
              type="button"
              onClick={actions.onDiscard}
              className="inline-flex min-w-[78px] items-center justify-center rounded-full bg-[#f1f5f9] px-4 py-2.5 text-sm font-semibold text-[var(--color-expired)] hover:-translate-y-0.5"
            >
              폐기
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
