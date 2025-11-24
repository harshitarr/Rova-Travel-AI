import { Globe2, Plane, Landmark, Sparkles, Map, Leaf } from 'lucide-react';

// Navbar menu options
export const menuOptions = [
  {
    name: 'Home',
    path: '/'
  },
  {
    name: 'Pricing',
    path: '/pricing'
  },
  {
    name: 'Contact us',
    path: '/contact-us'
  }
];

// Hero component suggestions data
export const suggestions = [
  {
    title: 'Plan a Europe backpacking trip',
    icon: Globe2
  },
  {
    title: 'Find cheap flights to Bali',
    icon: Plane
  },
  {
    title: 'Best historical sites in Rome',
    icon: Landmark
  },
  {
    title: 'Weekend getaway in the mountains',
    icon: Sparkles
  },
];

// Hero component features data for Globe Section
export const features = [
  {
    title: 'Custom Itineraries',
    icon: Map,
    description: 'Instant, personalized daily plans tailored to your interests and pace.'
  },
  {
    title: 'Sustainable Travel Tips',
    icon: Leaf,
    description: 'Eco-friendly recommendations for transportation and local experiences.'
  },
];

// Slide data for carousel
export const slideData = [
  {
    title: "Mystic Mountains",
    button: "Explore Component",
    src: "https://images.unsplash.com/photo-1494806812796-244fe51b774d?q=80&w=3534&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Urban Dreams",
    button: "Explore Component",
    src: "https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Neon Nights",
    button: "Explore Component",
    src: "https://images.unsplash.com/photo-1590041794748-2d8eb73a571c?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Desert Whispers",
    button: "Explore Component",
    src: "https://images.unsplash.com/photo-1679420437432-80cfbf88986c?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

// Overlay content data for each destination
export const overlayContent = {
  "Mystic Mountains": {
    title: "Mystic Mountains Adventure",
    images: [
      {
        src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop",
        title: "Peak Exploration",
        description: "Discover breathtaking summit views and challenging hiking trails. Experience the thrill of conquering majestic peaks. Perfect for adventure seekers and nature enthusiasts."
      },
      {
        src: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000&auto=format&fit=crop",
        title: "Mountain Camping",
        description: "Sleep under starlit skies in pristine mountain wilderness. Enjoy peaceful nights surrounded by nature's beauty. Wake up to spectacular sunrise views over the peaks."
      },
      {
        src: "https://images.unsplash.com/photo-1464822759844-d150baec843a?q=80&w=1000&auto=format&fit=crop",
        title: "Wildlife Encounters",
        description: "Observe rare mountain wildlife in their natural habitat. Learn about diverse ecosystems and conservation efforts. Capture unforgettable moments with nature photography."
      }
    ]
  },
  "Urban Dreams": {
    title: "Urban Dreams Experience",
    images: [
      {
        src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000&auto=format&fit=crop",
        title: "City Skylines",
        description: "Marvel at stunning architectural masterpieces and modern cityscapes. Experience the energy of bustling metropolitan life. Discover iconic landmarks and hidden urban gems."
      },
      {
        src: "https://images.unsplash.com/photo-1551916437-d6ce467a4c00?q=80&w=1000&auto=format&fit=crop",
        title: "Cultural Districts",
        description: "Immerse yourself in vibrant arts and culture scenes. Explore museums, galleries, and street art installations. Experience diverse neighborhoods and local traditions."
      },
      {
        src: "https://images.unsplash.com/photo-1481833761820-0509d3217039?q=80&w=1000&auto=format&fit=crop",
        title: "Culinary Adventures",
        description: "Savor world-class dining and street food experiences. Discover local flavors and international cuisine. Enjoy rooftop restaurants with panoramic city views."
      }
    ]
  },
  "Neon Nights": {
    title: "Neon Nights Experience",
    images: [
      {
        src: "https://images.unsplash.com/photo-1520637836862-4d197d17c91a?q=80&w=1000&auto=format&fit=crop",
        title: "Nightlife Scenes",
        description: "Experience electrifying nightlife and entertainment districts. Dance the night away at trendy clubs and bars. Enjoy live music and spectacular light shows."
      },
      {
        src: "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1000&auto=format&fit=crop",
        title: "Illuminated Landmarks",
        description: "Witness iconic monuments and buildings beautifully lit after dark. Capture stunning night photography opportunities. Experience the city's magical transformation at night."
      },
      {
        src: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1000&auto=format&fit=crop",
        title: "Evening Markets",
        description: "Explore vibrant night markets and evening bazaars. Taste exotic street food and shop for unique souvenirs. Experience local culture and community gatherings."
      }
    ]
  },
  "Desert Whispers": {
    title: "Desert Whispers Journey",
    images: [
      {
        src: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?q=80&w=1000&auto=format&fit=crop",
        title: "Endless Dunes",
        description: "Traverse vast golden sand dunes stretching to the horizon. Experience the profound silence and beauty of desert landscapes. Enjoy camel trekking and sandboarding adventures."
      },
      {
        src: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1000&auto=format&fit=crop",
        title: "Starlit Nights",
        description: "Witness breathtaking stargazing opportunities in clear desert skies. Sleep in traditional Bedouin camps under countless stars. Experience the magic of desert astronomy."
      },
      {
        src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1000&auto=format&fit=crop",
        title: "Oasis Discovery",
        description: "Find hidden oases with crystal-clear springs and palm groves. Learn about desert survival and ancient trade routes. Discover unique flora and fauna adaptations."
      }
    ]
  }
};