export type CloudinarySignPayload =
  | { purpose: "room"; roomId: string }
  | { purpose: "avatar"; userId: string };

type SignResponse = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

/** Browser upload to Cloudinary (signed via /api/cloudinary/sign). */
export function uploadToCloudinary(
  file: File,
  payload: CloudinarySignPayload,
  onProgress?: (pct: number) => void
): Promise<string> {
  return (async () => {
    const signRes = await fetch("/api/cloudinary/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!signRes.ok) {
      const err = (await signRes.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error || "Could not prepare upload");
    }

    const { signature, timestamp, apiKey, cloudName, folder } =
      (await signRes.json()) as SignResponse;

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable && onProgress) {
          onProgress(Math.round((ev.loaded / ev.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText) as {
              secure_url?: string;
              error?: { message?: string };
            };
            if (data.secure_url) {
              resolve(data.secure_url);
            } else {
              reject(new Error(data.error?.message || "Upload failed"));
            }
          } catch {
            reject(new Error("Invalid response from Cloudinary"));
          }
        } else {
          reject(new Error(xhr.responseText || `Upload failed (${xhr.status})`));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", folder);
      xhr.send(form);
    });
  })();
}
