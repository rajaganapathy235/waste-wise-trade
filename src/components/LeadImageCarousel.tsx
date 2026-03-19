import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { getMaterialImage } from "@/lib/materialImages";
import { cn } from "@/lib/utils";

// Generate up to 5 images for a lead (reuses material image + slight variations via query params)
function getLeadImages(materialType: string): string[] {
  const base = getMaterialImage(materialType);
  if (!base) return [];
  // Return 5 copies — in production these would be distinct uploaded photos
  return Array.from({ length: 5 }, () => base);
}

interface LeadImageCarouselProps {
  materialType: string;
}

export default function LeadImageCarousel({ materialType }: LeadImageCarouselProps) {
  const images = getLeadImages(materialType);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  if (images.length === 0) return null;

  return (
    <div className="relative mb-4 rounded-lg overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {images.map((src, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0">
              <div className="aspect-[4/3]">
                <img
                  src={src}
                  alt={`${materialType} ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              selectedIndex === i
                ? "w-5 bg-white"
                : "w-1.5 bg-white/50"
            )}
          />
        ))}
      </div>
      {/* Image counter */}
      <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
        {selectedIndex + 1}/{images.length}
      </div>
    </div>
  );
}
