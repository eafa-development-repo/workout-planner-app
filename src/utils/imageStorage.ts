import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';

const IMAGES_DIRNAME = 'images';
const EXTENSION = '.jpg';

/**
 * Images chosen through the system picker live in a temporary cache folder that
 * Android may purge. We copy them into the app's document directory so the
 * record keeps working offline, permanently, with no remote storage.
 */
function imagesDirectory(): Directory {
  const directory = new Directory(Paths.document, IMAGES_DIRNAME);
  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }
  return directory;
}

function randomName(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}-${random}${EXTENSION}`;
}

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
}

/**
 * Opens the Android photo picker and copies the chosen image into the app's
 * own storage. The system photo picker grants access per selection, so no
 * broad storage permission is required.
 */
export async function pickImageFromDevice(): Promise<PickedImage | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset?.uri) return null;

  const source = new File(asset.uri);
  const destination = new File(imagesDirectory(), randomName());
  await source.copy(destination);

  return {
    uri: destination.uri,
    width: asset.width,
    height: asset.height,
  };
}

/** Removes a stored image. Safe to call for paths that no longer exist. */
export function deleteStoredImage(uri: string | null | undefined): void {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // A missing or locked file must never break a delete flow.
  }
}
