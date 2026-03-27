import { ImageResponse } from "next/og";
import React from "react";
import { HomeFridgeIcon } from "@/lib/app-icon-image";

export function GET() {
  return new ImageResponse(React.createElement(HomeFridgeIcon), {
    width: 512,
    height: 512,
  });
}
