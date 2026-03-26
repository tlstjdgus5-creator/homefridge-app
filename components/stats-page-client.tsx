"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/section-header";
import { SummaryCard } from "@/components/summary-card";
import { getDaysUntilExpiry, getFoodStatusLabel } from "@/lib/food-status";
import { getDiscardStats } from "@/lib/discard-log";
import { useFoodStore } from "@/lib/food-store";

function formatDiscardedDate(value: string) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${month}.${day}`;
}

export function StatsPageClient() {
  const { discardLogs, consumeLogs, isLoading, error } = useFoodStore();
  const stats = getDiscardStats(discardLogs, consumeLogs);
  const maxDailyDiscardCount = Math.max(
    1,
    ...stats.dailyDiscardCounts.map((item) => item.count),
  );

  return (
    <div className="space-y-6 pb-32">
      {isLoading ? (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
          통계 데이터를 불러오는 중이에요.
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-[#ffd7d7] bg-[#fff4f4] px-4 py-3 text-sm text-[var(--color-today)]">
          {error}
        </div>
      ) : null}
      <section className="rounded-[28px] bg-[linear-gradient(135deg,#eef9f4_0%,#f7fffc_55%,#fffaf1_100%)] px-5 py-6 shadow-[var(--shadow-card)]">
        <p className="text-sm font-medium text-[var(--color-mint-deep)]">
          냉장고 리포트
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
          폐기 통계
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          버린 식품 기록을 바탕으로 지금까지의 패턴을 정리했어요.
        </p>
        <div className="mt-4 flex gap-2">
          <Link
            href="/"
            className="rounded-full bg-[var(--color-mint)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-card)]"
          >
            홈으로
          </Link>
          <Link
            href="/foods"
            className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-mint-deep)]"
          >
            식품 보기
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <SummaryCard label="총 폐기" value={stats.totalCount} tone="expired" />
        <SummaryCard
          label="이번 달 폐기"
          value={stats.currentMonthCount}
          tone="today"
        />
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="최근 7일 폐기 추이"
          subtitle="날짜별 폐기 건수를 간단한 막대로 보여줘요"
        />
        <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
          <div className="flex h-40 items-end gap-2">
            {stats.dailyDiscardCounts.map((item) => (
              <div key={item.dateKey} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[11px] font-medium text-[var(--color-muted)]">
                  {item.count}
                </span>
                <div className="flex h-24 w-full items-end">
                  <div
                    className={`w-full rounded-t-2xl ${
                      item.count > 0
                        ? "bg-[linear-gradient(180deg,#8bd6bb_0%,#53b892_100%)]"
                        : "bg-[var(--color-surface-soft)]"
                    }`}
                    style={{
                      height: `${Math.max(12, (item.count / maxDailyDiscardCount) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] text-[var(--color-muted)]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="소비 vs 폐기"
          subtitle="먹어서 정리한 수와 버려진 수를 함께 봐요"
        />
        <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
          <div className="flex overflow-hidden rounded-full bg-[var(--color-surface-soft)]">
            <div
              className="flex h-4 items-center justify-center bg-[var(--color-mint)]"
              style={{ width: `${stats.consumeRatio}%` }}
            />
            <div
              className="flex h-4 items-center justify-center bg-[#d9dee7]"
              style={{ width: `${stats.discardRatio}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#effbf6] px-3 py-3">
              <p className="text-xs text-[var(--color-muted)]">소비완료</p>
              <p className="mt-1 text-xl font-semibold text-[var(--color-fresh)]">
                {stats.consumeRatio}%
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {stats.consumeCount}건
              </p>
            </div>
            <div className="rounded-2xl bg-[#f1f5f9] px-3 py-3">
              <p className="text-xs text-[var(--color-muted)]">폐기</p>
              <p className="mt-1 text-xl font-semibold text-[var(--color-expired)]">
                {stats.discardRatio}%
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {stats.totalCount}건
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="가장 많이 폐기한 식품"
          subtitle="최근까지 누적된 기록 기준이에요"
        />
        <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
          {stats.topDiscardedFoods.length > 0 ? (
            <div className="space-y-2">
              {stats.topDiscardedFoods.map((item, index) => (
                <div
                  key={item.foodName}
                  className="flex items-center justify-between rounded-2xl bg-[var(--color-surface-soft)] px-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-strong)] text-sm font-semibold text-[var(--color-mint-deep)]">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-ink)]">
                      {item.foodName}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-expired)]">
                    {item.count}건
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">
              아직 기록된 폐기 내역이 없어요.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="아깝게 버린 식품"
          subtitle="아직 남은 기간이 있거나 임박 단계였던 폐기를 보여줘요"
        />
        <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
          {stats.avoidableDiscards.length > 0 ? (
            <div className="space-y-2">
              {stats.avoidableDiscards.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[var(--color-surface-soft)] px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
                      {item.foodName}
                    </p>
                    <span className="text-xs text-[var(--color-muted)]">
                      {formatDiscardedDate(item.discardedAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {item.daysUntilExpiry > 0
                      ? `아직 ${item.daysUntilExpiry}일 남음`
                      : item.daysUntilExpiry === 0
                        ? "오늘까지였어요"
                        : `${Math.abs(getDaysUntilExpiry(item.expiryDate))}일 지났어요`}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {item.storageSpaceName} · {getFoodStatusLabel(item.statusAtDiscard)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">
              아직 아깝게 버린 식품 기록은 없어요.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="보관공간별 폐기"
          subtitle="어느 공간에서 폐기가 자주 발생하는지 볼 수 있어요"
        />
        <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
          {stats.storageSpaceCounts.length > 0 ? (
            <div className="space-y-2">
              {stats.storageSpaceCounts.map((item) => (
                <div
                  key={item.storageSpaceId}
                  className="flex items-center justify-between rounded-2xl bg-[var(--color-surface-soft)] px-3 py-3"
                >
                  <span className="text-sm text-[var(--color-ink)]">
                    {item.storageSpaceName}
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-expired)]">
                    {item.count}건
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">
              아직 기록된 폐기 내역이 없어요.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="최근 폐기 내역"
          subtitle="가장 최근에 폐기한 식품을 최대 5개까지 보여줘요"
        />
        <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
          {stats.recentDiscards.length > 0 ? (
            <div className="space-y-2">
              {stats.recentDiscards.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[var(--color-surface-soft)] px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
                      {item.foodName}
                    </p>
                    <span className="text-xs text-[var(--color-muted)]">
                      {formatDiscardedDate(item.discardedAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {item.quantity}
                    {item.unit} · {item.storageSpaceName}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    폐기 시 상태 {getFoodStatusLabel(item.statusAtDiscard)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">
              아직 기록된 폐기 내역이 없어요.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
