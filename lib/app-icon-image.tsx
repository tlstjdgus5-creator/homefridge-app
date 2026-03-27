import type { CSSProperties } from "react";

function absoluteFill(extra?: CSSProperties): CSSProperties {
  return {
    position: "absolute",
    display: "flex",
    ...extra,
  };
}

export function HomeFridgeIcon() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 50% 18%, #c9f5ff 0%, #8fddff 34%, #66bcff 72%, #5c90f0 100%)",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "84%",
          height: "84%",
          borderRadius: "24%",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 50% 12%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 36%), linear-gradient(180deg, #a9ecff 0%, #8bd2ff 28%, #69afff 68%, #4d79e5 100%)",
          boxShadow:
            "inset 0 0 0 10px rgba(211,255,255,0.75), inset 0 0 0 20px rgba(163,240,255,0.38)",
        }}
      >
        <div
          style={{
            ...absoluteFill({
              inset: 0,
              opacity: 0.95,
              display: "flex",
            }),
          }}
        >
          {[
            { top: "12%", left: "18%", size: "3.2%" },
            { top: "20%", left: "73%", size: "2.8%" },
            { top: "61%", left: "14%", size: "4%" },
            { top: "52%", left: "79%", size: "3.4%" },
            { top: "34%", left: "84%", size: "2.5%" },
            { top: "41%", left: "8%", size: "2.4%" },
          ].map((star, index) => (
            <div
              key={index}
              style={{
                ...absoluteFill({
                  top: star.top,
                  left: star.left,
                  width: star.size,
                  height: star.size,
                  borderRadius: "9999px",
                  background: "rgba(255,255,255,0.82)",
                  boxShadow: "0 0 18px rgba(255,255,255,0.95)",
                }),
              }}
            />
          ))}
        </div>

        <div
          style={{
            ...absoluteFill({
              left: "19%",
              top: "19%",
              display: "flex",
              width: "42%",
              height: "64%",
              borderRadius: "8% 8% 4% 4%",
              background:
                "linear-gradient(180deg, #ffffff 0%, #eff9ff 35%, #caebff 75%, #9bd2ff 100%)",
              boxShadow:
                "-24px 18px 34px rgba(61,109,182,0.16), inset -6px -8px 18px rgba(113,170,230,0.2)",
              border: "2px solid rgba(210,240,255,0.98)",
            }),
          }}
        >
          <div
            style={{
              ...absoluteFill({
                left: "7%",
                top: "7%",
                display: "flex",
                right: "6%",
                bottom: "11%",
                borderRadius: "8% 8% 8% 10%",
                background: "linear-gradient(180deg, #c6ecff 0%, #91cfff 100%)",
                border: "3px solid #7db7ea",
                overflow: "hidden",
              }),
            }}
          >
            <div
              style={{
                ...absoluteFill({
                  left: "8%",
                  right: "8%",
                  top: "9%",
                  height: "3.5%",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.85)",
                }),
              }}
            />
            {[32, 52, 72].map((top, index) => (
              <div
                key={index}
                style={{
                  ...absoluteFill({
                    left: "4%",
                    right: "4%",
                    top: `${top}%`,
                    height: "2.4%",
                    borderRadius: "999px",
                    background: "rgba(240,251,255,0.95)",
                  }),
                }}
              />
            ))}

            <div style={absoluteFill({ left: "11%", top: "21%" })}>
              <div
                style={{
                  width: 34,
                  height: 28,
                  borderRadius: "50% 50% 46% 46%",
                  background: "radial-gradient(circle at 40% 32%, #ffb8ce 0%, #ec6f96 55%, #be3f68 100%)",
                }}
              />
            </div>
            <div
              style={{
                ...absoluteFill({
                  left: "44%",
                  top: "14%",
                  width: "14%",
                  height: "18%",
                  borderRadius: "20% 20% 12% 12%",
                  background:
                    "linear-gradient(180deg, #ffffff 0%, #f8fbff 35%, #dbefff 100%)",
                  border: "2px solid #75b3ea",
                }),
              }}
            >
              <div
                style={{
                  ...absoluteFill({
                    top: "-3%",
                    left: "18%",
                    width: "64%",
                    height: "10%",
                    borderRadius: "999px",
                    background: "#5faef0",
                  }),
                }}
              />
            </div>
            <div
              style={{
                ...absoluteFill({
                  left: "62%",
                  top: "14%",
                  width: "13%",
                  height: "10%",
                  borderRadius: "8% 8% 14% 14%",
                  background: "#ffd984",
                }),
              }}
            />
            <div
              style={{
                ...absoluteFill({
                  left: "62%",
                  top: "42%",
                  width: "12%",
                  height: "22%",
                  borderRadius: "14% 14% 10% 10%",
                  background:
                    "linear-gradient(180deg, #ffffff 0%, #f8fbff 35%, #dbefff 100%)",
                  border: "2px solid #75b3ea",
                }),
              }}
            >
              <div
                style={{
                  ...absoluteFill({
                    top: "-2%",
                    left: "14%",
                    width: "72%",
                    height: "8%",
                    borderRadius: "999px",
                    background: "#5faef0",
                  }),
                }}
              />
            </div>
            <div
              style={{
                ...absoluteFill({
                  left: "13%",
                  top: "44%",
                  width: 28,
                  height: 34,
                  borderRadius: "46% 46% 44% 44%",
                  background: "radial-gradient(circle at 40% 30%, #ffb1b1 0%, #ea5967 55%, #cc3447 100%)",
                }),
              }}
            />
            <div
              style={{
                ...absoluteFill({
                  left: "12%",
                  top: "58%",
                  width: 36,
                  height: 32,
                  borderRadius: "40% 44% 38% 40%",
                  background: "linear-gradient(180deg, #76cf55 0%, #2d8f3b 100%)",
                }),
              }}
            />
            <div
              style={{
                ...absoluteFill({
                  left: "25%",
                  top: "66%",
                  width: 30,
                  height: 26,
                  borderRadius: "28% 28% 36% 36%",
                  background: "linear-gradient(180deg, #ffb66f 0%, #ef7b32 100%)",
                }),
              }}
            />
            <div
              style={{
                ...absoluteFill({
                  left: "15%",
                  bottom: "8%",
                  width: 78,
                  height: 32,
                  borderRadius: "12px",
                  background: "#ffcf61",
                }),
              }}
            />
            <div
              style={{
                ...absoluteFill({
                  left: "53%",
                  bottom: "9%",
                  width: 76,
                  height: 22,
                  borderRadius: "999px 999px 12px 12px",
                  background: "#ffd971",
                }),
              }}
            />
          </div>

          <div
            style={{
              ...absoluteFill({
                left: "31%",
                bottom: "4%",
                width: "36%",
                height: "6%",
                borderRadius: "0 0 18px 18px",
                background: "linear-gradient(180deg, #7bc8ff 0%, #66a6f3 100%)",
              }),
            }}
          />
          <div
            style={{
              ...absoluteFill({
                left: "4%",
                bottom: "-2%",
                width: "16%",
                height: "5%",
                borderRadius: "999px",
                background: "rgba(54,82,118,0.7)",
              }),
            }}
          />
          <div
            style={{
              ...absoluteFill({
                right: "7%",
                bottom: "-2%",
                width: "18%",
                height: "5%",
                borderRadius: "999px",
                background: "rgba(54,82,118,0.7)",
              }),
            }}
          />
        </div>

        <div
          style={{
            ...absoluteFill({
              left: "59%",
              top: "20%",
              display: "flex",
              width: "17%",
              height: "58%",
              borderRadius: "10% 16% 14% 10%",
              background:
                "linear-gradient(180deg, #ebfbff 0%, #d7f2ff 28%, #a6ddff 80%, #6eaff0 100%)",
              border: "3px solid rgba(78,130,198,0.78)",
              boxShadow: "18px 14px 22px rgba(53,96,170,0.18)",
            }),
          }}
        >
          <div
            style={{
              ...absoluteFill({
                left: "13%",
                top: "8%",
                right: "16%",
                bottom: "8%",
                borderRadius: "10% 14% 12% 10%",
                background: "linear-gradient(180deg, #ffffff 0%, #e5f6ff 100%)",
                border: "2px solid rgba(157,205,236,0.9)",
              }),
            }}
          />
          <div
            style={{
              ...absoluteFill({
                left: "66%",
                top: "40%",
                width: "14%",
                height: "22%",
                borderRadius: "999px",
                background: "#7cbaf0",
              }),
            }}
          />
          <div
            style={{
              ...absoluteFill({
                left: "28%",
                top: "17%",
                width: "20%",
                height: "9%",
                borderRadius: "999px",
                background: "#ffe6da",
              }),
            }}
          />
          <div
            style={{
              ...absoluteFill({
                left: "51%",
                top: "17%",
                width: "20%",
                height: "9%",
                borderRadius: "999px",
                background: "#ffd9c0",
              }),
            }}
          />
        </div>

        <div
          style={{
            ...absoluteFill({
              left: "38%",
              top: "30%",
              display: "flex",
              width: "33%",
              height: "33%",
              borderRadius: "999px",
              background: "rgba(219,246,255,0.26)",
              border: "10px solid rgba(235,248,255,0.98)",
              boxShadow:
                "0 0 0 4px rgba(87,142,210,0.85), inset 0 0 0 6px rgba(191,230,255,0.68), 0 16px 24px rgba(42,87,165,0.18)",
            }),
          }}
        >
          <div
            style={{
              ...absoluteFill({
                left: "15%",
                top: "11%",
                width: "34%",
                height: "18%",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.52)",
                transform: "rotate(-18deg)",
              }),
            }}
          />
          <div
            style={{
              ...absoluteFill({
                left: "31%",
                top: "40%",
                display: "flex",
                width: 54,
                height: 62,
                borderRadius: "46% 46% 44% 44%",
                background: "radial-gradient(circle at 36% 30%, #ffd8d8 0%, #ff5b5b 48%, #cf273b 100%)",
                boxShadow: "inset -8px -10px 12px rgba(164,10,30,0.18)",
              }),
            }}
          >
            <div
              style={{
                ...absoluteFill({
                  left: "40%",
                  top: "-10%",
                  width: "12%",
                  height: "22%",
                  borderRadius: "999px",
                  background: "#70401d",
                  transform: "rotate(-10deg)",
                }),
              }}
            />
            <div
              style={{
                ...absoluteFill({
                  left: "54%",
                  top: "-6%",
                  width: "24%",
                  height: "18%",
                  borderRadius: "70% 20% 70% 20%",
                  background: "linear-gradient(180deg, #8ce04a 0%, #43b430 100%)",
                  transform: "rotate(-28deg)",
                }),
              }}
            />
          </div>
          <div
            style={{
              ...absoluteFill({
                right: "18%",
                top: "33%",
                width: "16%",
                height: "34%",
                borderRadius: "14% 14% 10% 10%",
                background:
                  "linear-gradient(180deg, #ffffff 0%, #f8fbff 35%, #dbefff 100%)",
                border: "2px solid #75b3ea",
              }),
            }}
          >
            <div
              style={{
                ...absoluteFill({
                  top: "-2%",
                  left: "14%",
                  width: "72%",
                  height: "8%",
                  borderRadius: "999px",
                  background: "#5faef0",
                }),
              }}
            />
          </div>
        </div>

        <div
          style={{
            ...absoluteFill({
              left: "63%",
              top: "56%",
              width: "24%",
              height: "8%",
              borderRadius: "999px",
              background: "linear-gradient(180deg, #d8f5ff 0%, #88b6f2 100%)",
              border: "4px solid rgba(96,146,212,0.86)",
              transform: "rotate(46deg)",
              boxShadow: "0 10px 18px rgba(61,94,164,0.2)",
            }),
          }}
        />
      </div>
    </div>
  );
}
