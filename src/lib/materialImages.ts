import comberNoil from "@/assets/materials/comber-noil.jpg";
import hosieryClips from "@/assets/materials/hosiery-clips.jpg";
import recycledFiber from "@/assets/materials/recycled-fiber.jpg";
import oeYarn from "@/assets/materials/oe-yarn.jpg";
import denimClips from "@/assets/materials/denim-clips.jpg";
import knittingWaste from "@/assets/materials/knitting-waste.jpg";
import polyesterFiber from "@/assets/materials/polyester-fiber.jpg";
import blendedYarn from "@/assets/materials/blended-yarn.jpg";

const materialImages: Record<string, string> = {
  "Comber Noil": comberNoil,
  "Hosiery Clips": hosieryClips,
  "Recycled Fiber": recycledFiber,
  "OE Yarn": oeYarn,
  "Denim Clips": denimClips,
  "Knitting Waste": knittingWaste,
  "Polyester Fiber": polyesterFiber,
  "Blended Yarn": blendedYarn,
};

export function getMaterialImage(materialType: string): string | undefined {
  return materialImages[materialType];
}
