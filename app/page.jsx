import Hero from './_components/Hero';
import { InteractiveCarousel } from './_components/Carousel';
import { WorldMapDemo } from './_components/Worldmap';
import Footer from './_components/Footer';


export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <Hero />
      <InteractiveCarousel />
      <WorldMapDemo />
      <Footer /> 

    </div>
  );
}
