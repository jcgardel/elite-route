"use client";

import { telDeChofer } from "@/lib/choferes";

/** Campo del nombre del chofer: al elegir uno del directorio, llena su WhatsApp en el mismo formulario. */
export default function ChoferNombre({ className, defaultValue }: { className: string; defaultValue: string }) {
  return (
    <input
      className={className}
      name="chofer"
      list="choferes"
      defaultValue={defaultValue}
      placeholder="Nombre del chofer"
      aria-label="Nombre del chofer"
      maxLength={80}
      onChange={(e) => {
        const tel = telDeChofer(e.currentTarget.value);
        const campo = e.currentTarget.form?.elements.namedItem("tel");
        if (tel && campo instanceof HTMLInputElement) campo.value = tel;
      }}
    />
  );
}
