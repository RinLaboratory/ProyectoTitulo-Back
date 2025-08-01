export default function decodeBase64(base64String: string) {
  const [_, mimeType, base64Data] = /^data:(.*);base64,(.*)$/.exec(
    base64String,
  ) as unknown as string[];
  if (!mimeType || !base64Data) throw new Error("Invalid base64 format");

  const buffer = Buffer.from(base64Data, "base64");
  const blob = new Blob([buffer], { type: mimeType });

  return { blob, mimeType };
}
