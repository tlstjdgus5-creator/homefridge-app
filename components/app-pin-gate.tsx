"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { PinDots, PinPad } from "@/components/pin-pad";
import {
  fetchAppSettings,
  readCachedAppSettings,
  savePinHash,
  type AppSettingsRow,
} from "@/lib/app-settings";
import { hashPin, isValidPin, verifyPin } from "@/lib/pin-utils";

type PinGateStatus = "loading" | "setup" | "locked" | "unlocked" | "error";

type ChangePinParams = {
  currentPin: string;
  nextPin: string;
  confirmPin: string;
};

type AppPinContextValue = {
  status: PinGateStatus;
  appSettings: AppSettingsRow | null;
  refreshPinState: () => Promise<void>;
  changePin: (params: ChangePinParams) => Promise<{ ok: boolean; message?: string }>;
  lockApp: () => void;
};

const APP_PIN_SESSION_KEY = "homefridge.pin_session_hash";

const AppPinContext = createContext<AppPinContextValue | null>(null);

type AppPinGateProps = {
  children: ReactNode;
};

function getPinErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
}

export function AppPinGate({ children }: AppPinGateProps) {
  const [status, setStatus] = useState<PinGateStatus>("loading");
  const [appSettings, setAppSettings] = useState<AppSettingsRow | null>(null);
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [setupStep, setSetupStep] = useState<"new" | "confirm">("new");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function refreshPinState() {
    try {
      setStatus("loading");
      setMessage("");
      const settings = await fetchAppSettings();
      setAppSettings(settings);

      if (!settings?.pin_hash) {
        sessionStorage.removeItem(APP_PIN_SESSION_KEY);
        setStatus("setup");
        return;
      }

      // 같은 탭에서 새로고침해도 잠금 해제 상태를 유지하되, PIN이 바뀌면 다시 잠그도록 해요.
      const sessionHash = sessionStorage.getItem(APP_PIN_SESSION_KEY);
      setStatus(sessionHash === settings.pin_hash ? "unlocked" : "locked");
    } catch (error) {
      console.error("[pin-gate] refresh failed", error);
      const cachedSettings = readCachedAppSettings();

      if (cachedSettings?.pin_hash) {
        const sessionHash = sessionStorage.getItem(APP_PIN_SESSION_KEY);
        setAppSettings(cachedSettings);
        setStatus(sessionHash === cachedSettings.pin_hash ? "unlocked" : "locked");
        setMessage(
          "네트워크 연결이 불안정해 저장된 PIN 정보로 잠금 화면을 열었어요. PIN 변경은 연결이 복구된 뒤 다시 시도해주세요.",
        );
        return;
      }

      setStatus("error");
      setMessage(
        getPinErrorMessage(
          error,
          "PIN 설정 정보를 불러오지 못했어요. Supabase 연결과 app_settings 테이블을 확인해주세요.",
        ),
      );
    }
  }

  useEffect(() => {
    void refreshPinState();
  }, []);

  async function handleSetupPin() {
    if (!isValidPin(newPin)) {
      setMessage("새 PIN은 4자리 숫자로 입력해주세요.");
      return;
    }

    if (newPin !== confirmPin) {
      setMessage("새 PIN과 확인 PIN이 일치하지 않아요.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");
      const nextHash = await hashPin(newPin);
      const nextSettings = await savePinHash({
        pinHash: nextHash,
        settingsId: appSettings?.id,
      });

      sessionStorage.setItem(APP_PIN_SESSION_KEY, nextHash);
      setAppSettings(nextSettings);
      setNewPin("");
      setConfirmPin("");
      setSetupStep("new");
      setStatus("unlocked");
    } catch (error) {
      setMessage(getPinErrorMessage(error, "PIN 저장 중 문제가 생겼어요."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUnlock() {
    if (!isValidPin(pin)) {
      setMessage("PIN 4자리를 입력해주세요.");
      return;
    }

    if (!appSettings?.pin_hash) {
      setStatus("setup");
      setPin("");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");
      const isMatch = await verifyPin(pin, appSettings.pin_hash);

      if (!isMatch) {
        setMessage("PIN이 맞지 않아요. 다시 확인해주세요.");
        setPin("");
        return;
      }

      sessionStorage.setItem(APP_PIN_SESSION_KEY, appSettings.pin_hash);
      setPin("");
      setStatus("unlocked");
    } catch (error) {
      setMessage(getPinErrorMessage(error, "PIN 검증 중 문제가 생겼어요."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function changePin({ currentPin, nextPin, confirmPin }: ChangePinParams) {
    if (!appSettings?.pin_hash) {
      return { ok: false, message: "먼저 PIN을 설정해주세요." };
    }

    if (!isValidPin(currentPin)) {
      return { ok: false, message: "현재 PIN은 4자리 숫자로 입력해주세요." };
    }

    if (!isValidPin(nextPin)) {
      return { ok: false, message: "새 PIN은 4자리 숫자로 입력해주세요." };
    }

    if (nextPin !== confirmPin) {
      return { ok: false, message: "새 PIN과 확인 PIN이 일치하지 않아요." };
    }

    try {
      const isCurrentPinValid = await verifyPin(currentPin, appSettings.pin_hash);

      if (!isCurrentPinValid) {
        return { ok: false, message: "현재 PIN이 맞지 않아요." };
      }

      const nextHash = await hashPin(nextPin);
      const nextSettings = await savePinHash({
        pinHash: nextHash,
        settingsId: appSettings.id,
      });

      sessionStorage.setItem(APP_PIN_SESSION_KEY, nextHash);
      setAppSettings(nextSettings);
      setStatus("unlocked");

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: getPinErrorMessage(error, "PIN 변경 중 문제가 생겼어요."),
      };
    }
  }

  function lockApp() {
    sessionStorage.removeItem(APP_PIN_SESSION_KEY);
    setPin("");
    setStatus(appSettings?.pin_hash ? "locked" : "setup");
  }

  const contextValue: AppPinContextValue = {
    status,
    appSettings,
    refreshPinState,
    changePin,
    lockApp,
  };

  if (status === "unlocked") {
    return <AppPinContext.Provider value={contextValue}>{children}</AppPinContext.Provider>;
  }

  return (
    <AppPinContext.Provider value={contextValue}>
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-5 py-10">
        <div className="w-full overflow-hidden rounded-[32px] border border-[var(--color-line)] bg-[linear-gradient(150deg,#fbfcfb_0%,#f3f8f6_52%,#eef6f1_100%)] shadow-[0_28px_90px_-36px_rgba(15,23,42,0.38)]">
          <div className="border-b border-[var(--color-line)] bg-[radial-gradient(circle_at_top,#f7fffb_0%,rgba(247,255,251,0)_60%)] px-6 pb-5 pt-7">
            <p className="font-display text-sm tracking-[0.28em] text-[var(--color-mint-deep)]">
              HOME FRIDGE
            </p>
            <h1 className="mt-3 text-[32px] font-semibold tracking-tight text-[var(--color-ink)]">
              우리집냉장고
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
              {status === "setup"
                ? "앱을 보호할 4자리 PIN을 설정해주세요."
                : status === "locked"
                  ? "앱에 들어가려면 공용 PIN을 입력해주세요."
                  : status === "loading"
                    ? "PIN 상태를 확인하는 중이에요."
                    : "잠시 후 다시 시도해주세요."}
            </p>
          </div>

          <div className="px-6 py-6">
            {status === "setup" ? (
              <>
                <h2 className="text-lg font-semibold text-[var(--color-ink)]">
                  PIN 설정
                </h2>
                <div className="mt-5 space-y-5">
                  <button
                    type="button"
                    onClick={() => setSetupStep("new")}
                    className={`block w-full rounded-[28px] border px-4 py-4 text-left ${
                      setupStep === "new"
                        ? "border-[var(--color-mint)] bg-[#f4fbf8]"
                        : "border-[var(--color-line)] bg-white/70"
                    }`}
                  >
                    <p className="text-center text-sm font-semibold text-[var(--color-muted)]">
                      새 PIN
                    </p>
                    <div className="mt-3">
                      <PinDots value={newPin} tone={setupStep === "new" ? "active" : "default"} />
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSetupStep("confirm")}
                    className={`block w-full rounded-[28px] border px-4 py-4 text-left ${
                      setupStep === "confirm"
                        ? "border-[var(--color-mint)] bg-[#f4fbf8]"
                        : "border-[var(--color-line)] bg-white/70"
                    }`}
                  >
                    <p className="text-center text-sm font-semibold text-[var(--color-muted)]">
                      새 PIN 확인
                    </p>
                    <div className="mt-3">
                      <PinDots
                        value={confirmPin}
                        tone={setupStep === "confirm" ? "active" : "default"}
                      />
                    </div>
                  </button>
                  <PinPad
                    value={setupStep === "new" ? newPin : confirmPin}
                    disabled={isSubmitting}
                    submitLabel="저장"
                    onChange={(value) => {
                      if (setupStep === "new") {
                        setNewPin(value);
                        if (value.length === 4) {
                          setSetupStep("confirm");
                        }
                      } else {
                        setConfirmPin(value);
                      }
                      if (message) {
                        setMessage("");
                      }
                    }}
                    onSubmit={() => {
                      if (setupStep === "new") {
                        if (newPin.length === 4) {
                          setSetupStep("confirm");
                        }
                        return;
                      }

                      void handleSetupPin();
                    }}
                  />
                </div>
              </>
            ) : null}

            {status === "locked" ? (
              <>
                <h2 className="text-lg font-semibold text-[var(--color-ink)]">
                  PIN 입력
                </h2>
                <div className="mt-5 rounded-[28px] border border-[var(--color-line)] bg-white/70 px-4 py-4">
                  <p className="text-center text-sm font-semibold text-[var(--color-muted)]">
                    PIN 입력
                  </p>
                  <div className="mt-3">
                    <PinDots value={pin} tone="active" />
                  </div>
                </div>
                <div className="mt-5">
                  <PinPad
                    value={pin}
                    disabled={isSubmitting}
                    submitLabel="열기"
                    onChange={(value) => {
                      setPin(value);
                      if (message) {
                        setMessage("");
                      }
                    }}
                    onSubmit={() => {
                      void handleUnlock();
                    }}
                  />
                </div>
              </>
            ) : null}

            {status === "loading" ? (
              <div className="rounded-2xl border border-[var(--color-line)] bg-white/80 px-4 py-4 text-sm text-[var(--color-muted)]">
                PIN 설정 상태를 불러오고 있어요.
              </div>
            ) : null}

            {status === "error" ? (
              <div className="rounded-2xl border border-[#ffd7d7] bg-[#fff4f4] px-4 py-4 text-sm text-[var(--color-today)]">
                {message}
              </div>
            ) : null}

            {status === "setup" || status === "locked" ? (
              <p
                className={`mt-3 min-h-6 text-center text-sm ${
                  message.includes("네트워크 연결이 불안정")
                    ? "text-[var(--color-muted)]"
                    : "text-[var(--color-today)]"
                }`}
              >
                {message}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </AppPinContext.Provider>
  );
}

export function useAppPinAccess() {
  const context = useContext(AppPinContext);

  if (!context) {
    throw new Error("useAppPinAccess must be used within AppPinGate");
  }

  return context;
}
