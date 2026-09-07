export function interpretBool(value) {
  if (value === true) return "Enabled";
  if (value === false) return "Not enabled";
  return "Not reported";
}

export function securityChecks(device) {
  const sec = device.security || {};
  const bit = sec.bitlocker || {};
  const bitRaw = String(bit.protectionStatus || bit.ProtectionStatus || bit.volumeStatus || "").toLowerCase();
  const bitStatus = bitRaw
    ? (["on", "protected", "encrypted", "fully"].some((k) => bitRaw.includes(k)) ? "Compliant" : "Not compliant")
    : "Not reported";

  const def = sec.defender || {};
  const defKeys = ["AMServiceEnabled", "AntivirusEnabled", "RealTimeProtectionEnabled"];
  const defReported = defKeys.some((k) => k in def);
  const defOk = defReported && defKeys.every((k) => !(k in def) || def[k] === true);
  const defStatus = defReported ? (defOk ? "Compliant" : "Not compliant") : "Not reported";

  const fw = sec.firewall || {};
  const fwVals = Object.values(fw);
  const fwReported = fwVals.length > 0;
  const fwOk = fwReported && fwVals.every((v) => v === true);
  const fwStatus = fwReported ? (fwOk ? "Compliant" : "Not compliant") : "Not reported";

  const patches = sec.patches || {};
  const days = patches.daysSinceLastPatch;
  const patchStatus = days == null ? "Not reported" : days <= 35 ? "Compliant" : "Not compliant";
  const patchDetail = days == null
    ? "No installed-update history reported by the agent."
    : `Last patch installed ${days} day(s) ago${days > 35 ? " — overdue for the monthly cycle" : ""}.`;

  return [
    { label: "BitLocker", status: bitStatus, detail: bitRaw ? `Reported state: ${bitRaw}` : "No BitLocker data in this payload." },
    { label: "Microsoft Defender", status: defStatus, detail: defReported ? `Real-time protection ${interpretBool(def.RealTimeProtectionEnabled).toLowerCase()}.` : "No Defender data in this payload." },
    { label: "Firewall", status: fwStatus, detail: fwReported ? `${fwVals.filter(Boolean).length}/${fwVals.length} profile(s) enabled.` : "No firewall profile data in this payload." },
    { label: "Secure Boot", status: sec.secureBoot === true ? "Enabled" : sec.secureBoot === false ? "Not enabled" : "Not reported", detail: "UEFI Secure Boot state." },
    { label: "TPM", status: sec.tpm?.TpmReady === true ? "Enabled" : sec.tpm?.TpmPresent === false ? "Not enabled" : "Not reported", detail: sec.tpm ? `Present: ${interpretBool(sec.tpm.TpmPresent)}, Ready: ${interpretBool(sec.tpm.TpmReady)}` : "No TPM data in this payload." },
    { label: "Patch compliance", status: patchStatus, detail: patchDetail },
  ];
}

export function statusTone(status) {
  if (status === "Compliant" || status === "Enabled") return "green";
  if (status === "Not compliant" || status === "Not enabled") return "red";
  return "slate";
}

export function StatusPill({ status }) {
  const tone = statusTone(status);
  const classes = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
    slate: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${classes[tone]}`}>{status}</span>;
}
