"use client";

import { QRCodeSVG } from "qrcode.react";

export default function MemberQr({ value, size = 130 }) {
  if (!value) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-gris-claro-acro/10 text-xs text-acro-muted"
        style={{ width: size, height: size }}
      >
        Sin QR
      </div>
    );
  }

  return (
    <div className="relative p-3.5 flex items-center justify-center">
      {/* Esquina Superior Izquierda */}
      <div className="absolute top-0 left-0 size-5 border-t-4 border-l-4 border-blanco-acro rounded-tl-sm" />
      {/* Esquina Superior Derecha */}
      <div className="absolute top-0 right-0 size-5 border-t-4 border-r-4 border-blanco-acro rounded-tr-sm" />
      {/* Esquina Inferior Izquierda */}
      <div className="absolute bottom-0 left-0 size-5 border-b-4 border-l-4 border-blanco-acro rounded-bl-sm" />
      {/* Esquina Inferior Derecha */}
      <div className="absolute bottom-0 right-0 size-5 border-b-4 border-r-4 border-blanco-acro rounded-br-sm" />

      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        fgColor="#FFFFFF"
        bgColor="transparent"
      />
    </div>
  );
}