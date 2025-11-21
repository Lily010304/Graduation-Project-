import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const FeatureCard = ({ title, icon }) => (
  <div className="flex h-full items-center justify-center">
    <div className="w-[360px] h-full rounded-2xl border border-white/15 bg-[#034242] text-white shadow-xl">
      <div className="p-5">
        <div className="mb-3 text-4xl" aria-hidden>{icon}</div>
        <div className="whitespace-pre-line text-lg font-semibold leading-snug">{title}</div>
      </div>
    </div>
  </div>
);

export default function FeaturesCarousel({ autoplay = true }) {
  const autoplayPlugin = React.useMemo(() => {
    if (!autoplay) return null;
    return Autoplay({
      delay: 2500,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      playOnInit: true,
    });
  }, [autoplay]);

  const plugins = [];
  if (autoplayPlugin) plugins.push(autoplayPlugin);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      axis: 'y',
      loop: true,
      align: 'start',
      slidesToScroll: 1,
    },
    plugins
  );

  // Resume autoplay after 3s of no interaction
  const RESUME_DELAY = 3000;
  const resumeTimeout = React.useRef(null);
  const scheduleResume = React.useCallback(() => {
    if (!autoplayPlugin) return; // no-op when autoplay disabled
    autoplayPlugin.stop();
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    resumeTimeout.current = setTimeout(() => {
      autoplayPlugin.play();
    }, RESUME_DELAY);
  }, [autoplayPlugin]);

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    };
  }, []);

  // Treat drag/touch as interaction that pauses and schedules resume
  React.useEffect(() => {
    if (!emblaApi) return;
    const onPointerDown = () => scheduleResume();
    emblaApi.on('pointerDown', onPointerDown);
    return () => {
      emblaApi.off('pointerDown', onPointerDown);
    };
  }, [emblaApi, scheduleResume]);

  const scrollPrev = React.useCallback(() => {
    if (!emblaApi) return;
    scheduleResume();
    emblaApi.scrollPrev();
  }, [emblaApi, scheduleResume]);
  const scrollNext = React.useCallback(() => {
    if (!emblaApi) return;
    scheduleResume();
    emblaApi.scrollNext();
  }, [emblaApi, scheduleResume]);

  const items = [
    { title: 'Placement via\nproficiency exam', icon: '🎯' },
    { title: 'Parental oversight\nsupport', icon: '👨‍👩‍👧‍👦' },
    { title: 'Integrated\npayment system', icon: '💳' },
  ];

  return (
    <div className="group relative flex items-center justify-center">
      <div className="embla h-[420px] w-[380px] overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex h-full flex-col">
          {items.map((it) => (
            <div className="embla__slide h-full flex-[0_0_100%]" key={it.title}>
              <FeatureCard {...it} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
  <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
        <button
          aria-label="Previous feature"
          className="rounded-full bg-accent px-3 py-2 text-dark shadow transition hover:bg-[#034242] hover:text-white"
          onClick={scrollPrev}
        >
          ↑
        </button>
        <button
          aria-label="Next feature"
          className="rounded-full bg-accent px-3 py-2 text-dark shadow transition hover:bg-[#034242] hover:text-white"
          onClick={scrollNext}
        >
          ↓
        </button>
      </div>
      {/* Mobile controls inline below for small screens */}
      <div className="mt-3 flex gap-3 md:hidden">
        <button
          aria-label="Previous feature"
          className="rounded-full bg-accent px-3 py-2 text-dark shadow transition hover:bg-[#034242] hover:text-white"
          onClick={scrollPrev}
        >
          ↑
        </button>
        <button
          aria-label="Next feature"
          className="rounded-full bg-accent px-3 py-2 text-dark shadow transition hover:bg-[#034242] hover:text-white"
          onClick={scrollNext}
        >
          ↓
        </button>
      </div>
    </div>
  );
}
