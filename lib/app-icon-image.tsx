import type { CSSProperties } from "react";

function circleStyle(size: number, color: string): CSSProperties {
  return {
    width: size,
    height: size,
    borderRadius: "9999px",
    background: color,
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
        background: "linear-gradient(180deg, #f7faf8 0%, #eff5f2 100%)",
      }}
    >
      <div
        style={{
          width: "74%",
          height: "74%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "26%",
          background: "linear-gradient(145deg, #edf5f1 0%, #e2eee8 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
        }}
      >
        <div
          style={{
            width: "63%",
            height: "70%",
            borderRadius: "22%",
            background: "#fcfefd",
            border: "2px solid #dde8e1",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "34%",
              borderBottom: "2px solid #dde8e1",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              padding: "10% 14% 0",
              boxSizing: "border-box",
            }}
          >
            <div style={circleStyle(14, "#7eb9a5")} />
            <div style={circleStyle(14, "#d7e7df")} />
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8%",
              padding: "8% 0 10%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "40%",
                height: "23%",
                borderRadius: "9999px",
                background: "#7eb9a5",
              }}
            />
            <div
              style={{
                width: "58%",
                height: "18%",
                borderRadius: "9999px 9999px 0 0",
                background: "#eaf4ef",
              }}
            />
            <div
              style={{
                width: "48%",
                height: "2%",
                borderRadius: "9999px",
                background: "#c9ddd4",
              }}
            />
            <div
              style={{
                width: "32%",
                height: "2%",
                borderRadius: "9999px",
                background: "#d7e7df",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
