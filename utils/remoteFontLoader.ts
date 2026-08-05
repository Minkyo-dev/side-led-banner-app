import type { RemoteFontFaceSet, RemoteFontSource } from "@/constants/remoteFonts";
import { Directory, File, Paths } from "expo-file-system";

const remoteFontsDir = new Directory(Paths.document, "remote-fonts");
const inFlightDownloads = new Map<string, Promise<string>>();

export async function ensureRemoteFontDownloaded(
  source: RemoteFontSource,
): Promise<string> {
  if (!remoteFontsDir.exists) {
    remoteFontsDir.create({ intermediates: true, idempotent: true });
  }
  const file = new File(remoteFontsDir, source.fileName);
  if (file.exists) return file.uri;

  const pending = inFlightDownloads.get(source.fileName);
  if (pending) return pending;

  const promise = File.downloadFileAsync(source.url, file, {
    idempotent: true,
  })
    .then((downloaded) => downloaded.uri)
    .finally(() => {
      inFlightDownloads.delete(source.fileName);
    });
  inFlightDownloads.set(source.fileName, promise);
  return promise;
}

export async function ensureRemoteFontSetDownloaded(
  set: RemoteFontFaceSet,
): Promise<{ regularUri: string; boldUri: string }> {
  const [regularUri, boldUri] = await Promise.all([
    ensureRemoteFontDownloaded(set.regular),
    ensureRemoteFontDownloaded(set.bold),
  ]);
  return { regularUri, boldUri };
}
