import { appFontFamilyForText } from "@/constants/appFonts";
import {
  REMOTE_FONT_FACE_SETS,
  type RemoteFontFaceSet,
  type RemoteFontId,
  type RemoteFontSource,
} from "@/constants/remoteFonts";
import { Directory, File, Paths } from "expo-file-system";
import * as Font from "expo-font";

const remoteFontsDir = new Directory(Paths.document, "remote-fonts");

function ensureDir(): void {
  if (!remoteFontsDir.exists) {
    remoteFontsDir.create({ intermediates: true, idempotent: true });
  }
}

const inFlightDownloads = new Map<string, Promise<string>>();

/** 이미 받아둔 파일이면 로컬 uri를 바로 반환, 아니면 다운로드 후 캐싱 */
export async function ensureRemoteFontDownloaded(
  source: RemoteFontSource,
): Promise<string> {
  ensureDir();
  const file = new File(remoteFontsDir, source.fileName);
  if (file.exists) return file.uri;

  const pending = inFlightDownloads.get(source.fileName);
  if (pending) return pending;

  const promise = File.downloadFileAsync(source.url, remoteFontsDir, {
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

const registeredTextFonts = new Set<RemoteFontId>();
const pendingTextRegistrations = new Map<RemoteFontId, Promise<void>>();

/** 원격 폰트를 다운로드하고 RN <Text>/<TextInput>에서 쓸 수 있게 expo-font에 등록 */
export function ensureRemoteFontRegisteredForText(id: RemoteFontId): Promise<void> {
  if (registeredTextFonts.has(id)) return Promise.resolve();

  const pending = pendingTextRegistrations.get(id);
  if (pending) return pending;

  const promise = ensureRemoteFontSetDownloaded(REMOTE_FONT_FACE_SETS[id])
    .then(({ regularUri, boldUri }) =>
      Font.loadAsync({
        [appFontFamilyForText(id, "normal")]: { uri: regularUri },
        [appFontFamilyForText(id, "bold")]: { uri: boldUri },
      }),
    )
    .then(() => {
      registeredTextFonts.add(id);
    })
    .finally(() => {
      pendingTextRegistrations.delete(id);
    });

  pendingTextRegistrations.set(id, promise);
  return promise;
}
