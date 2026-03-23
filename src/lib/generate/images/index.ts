export { generateImage, getDefaultImageProviderId } from "@/lib/generate/images/generate-image";
export { mapImageProviderError } from "@/lib/generate/images/errors";
export { getImageProvider } from "@/lib/generate/images/registry";
export type {
  GeneratedImageResult,
  ImageGenerationOptions,
  ImageGenerationProvider,
  ImageProviderId,
} from "@/lib/generate/images/types";
