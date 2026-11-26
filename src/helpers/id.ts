export const randomId = (prefix = "u") =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/** Kode rapat ala Google Meet: abc-defg-hij */
export const meetingCode = () => {
  const part = (n: number) =>
    Array.from(
      { length: n },
      () => "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)],
    ).join("");
  return `${part(3)}-${part(4)}-${part(3)}`;
};

/** Ambil kode rapat dari teks bebas atau tautan yang ditempel. */
export const parseMeetingCode = (input: string) => {
  const v = input.trim();
  if (!v) return "";
  try {
    const url = new URL(v);
    return decodeURIComponent(
      url.pathname.split("/").filter(Boolean).pop() ?? "",
    );
  } catch {
    return v;
  }
};
