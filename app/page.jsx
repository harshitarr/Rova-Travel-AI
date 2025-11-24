import Hero from './_components/Hero';
import { InteractiveCarousel } from './_components/Carousel';
import { WorldMapDemo } from './_components/Worldmap';


export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <Hero />
      <InteractiveCarousel />
      <WorldMapDemo />
      

    </div>
  );
}
