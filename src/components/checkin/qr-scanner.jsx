"use client";

import { useEffect, useRef } from "react";

// ID constante para el div donde se inyectará el video del escáner
const REGION_ID = "qr-reader-region";

// Componente QrScanner
// Usa la librería html5-qrcode para leer códigos QR desde la cámara del dispositivo.
export default function QrScanner({ onScan, onError }) {
  // Referencia para guardar la instancia del escáner y poder detenerla luego
  const scannerRef = useRef(null);
  // Referencia para evitar que el mismo código QR dispare múltiples escaneos repetidos
  const handledRef = useRef(false);

  useEffect(() => {
    // Bandera para evitar arrancar la cámara si el componente se desmonta muy rápido
    let cancelled = false;
    let instance = null;

    // Función asíncrona para iniciar la cámara
    async function start() {
      try {
        // Importación dinámica de la librería pesada.
        // Solo se descarga cuando este componente realmente se monta en pantalla.
        const { Html5Qrcode } = await import("html5-qrcode");
        
        if (cancelled) return;
        
        // Creamos la instancia apuntando al ID del div
        instance = new Html5Qrcode(REGION_ID, { verbose: false });
        scannerRef.current = instance;
        
        // Iniciamos el escáner
        await instance.start(
          { facingMode: "environment" }, // Preferimos la cámara trasera del celular
          { fps: 10, qrbox: { width: 220, height: 220 } }, // Configuraciones: frames por segundo y tamaño de la caja de lectura
          (decodedText) => {
            // Cuando lee un código con éxito
            if (handledRef.current) return; // Si ya procesamos uno, ignoramos el resto
            handledRef.current = true;
            onScan(decodedText); // Ejecutamos la función prop con el texto leído
          },
          () => {}, // Función vacía para errores menores de lectura por frame
        );
      } catch (err) {
        // Si hay error (ej. permisos denegados), lo reportamos
        if (!cancelled) onError?.(err?.message || "No se pudo abrir la cámara.");
      }
    }
    
    start();

    // Función de limpieza: Se ejecuta cuando el componente desaparece de la pantalla
    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s) {
        // Detenemos el escáner y limpiamos el div
        s.stop()
          .then(() => s.clear())
          .catch(() => {});
      }
    };
  }, [onScan, onError]);

  // Contenedor visual del escáner
  return <div id={REGION_ID} className="w-full overflow-hidden rounded-xl" />;
}
