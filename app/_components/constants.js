import { Globe2, Plane, Landmark, Sparkles, Map, Leaf } from 'lucide-react';

// Footer component data
export const footerLinks = [
  { name: 'Terms of Service', href: '#' },
  { name: 'Privacy Policy', href: '#' },
  { name: 'Contact', href: '#' },
  { name: 'Company', href: '#' }
];

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
    title: 'Create New Trip',
    icon: Globe2,
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-500',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-400'
  },
  {
    title: 'Inspire Me Where to Go',
    icon: Plane,
    bgColor: 'bg-green-50',
    hoverColor: 'hover:bg-green-500',
    borderColor: 'border-green-200',
    iconColor: 'text-green-400'
  },
  {
    title: 'Discover Historical Gems',
    icon: Landmark,
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:bg-purple-500',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-400'
  },
  {
    title: 'Adventure Destinations',
    icon: Sparkles,
    bgColor: 'bg-amber-50',
    hoverColor: 'hover:bg-amber-500',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-400'
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
    title: "Popular Mountain Destinations",
    images: [
      {
        src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop",
        title: "Swiss Alps, Switzerland",
        description: "Home to the iconic Matterhorn and Jungfrau peaks. World-class skiing, hiking trails, and charming alpine villages. Experience breathtaking cable car rides and luxury mountain resorts."
      },
      {
        src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
        title: "Himalayas, Nepal",
        description: "Trek to Everest Base Camp and witness the world's highest peaks. Explore ancient Buddhist monasteries and Sherpa culture. Experience spiritual journeys through mountain landscapes."
      },
      {
        src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop",
        title: "Rocky Mountains, USA",
        description: "Discover pristine wilderness in Colorado and Montana. Enjoy wildlife watching, fly fishing, and scenic drives. Visit stunning national parks like Yellowstone and Glacier."
      }
    ]
  },
  "Urban Dreams": {
    title: "Iconic City Destinations",
    images: [
      {
        src: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1200&auto=format&fit=crop",
        title: "Paris, France",
        description: "Visit the Eiffel Tower, Louvre Museum, and Notre-Dame Cathedral. Stroll along the Seine River and explore charming Montmartre. Indulge in world-famous French cuisine and wine."
      },
      {
        src: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1200&auto=format&fit=crop",
        title: "Tokyo, Japan",
        description: "Experience the perfect blend of ancient temples and futuristic technology. Explore vibrant neighborhoods like Shibuya and Harajuku. Savor authentic sushi, ramen, and Japanese street food."
      },
      {
        src: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1200&auto=format&fit=crop",
        title: "New York City, USA",
        description: "See the Statue of Liberty, Times Square, and Central Park. Experience Broadway shows and world-class museums. Enjoy diverse cuisine from every corner of the globe."
      }
    ]
  },
  "Neon Nights": {
    title: "Best Nightlife Cities",
    images: [
      {
        src: "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1200&auto=format&fit=crop",
        title: "Las Vegas, USA",
        description: "Experience legendary casinos, spectacular shows, and vibrant nightclubs. Enjoy world-class entertainment and dining on the Strip. Witness stunning fountain shows and neon lights."
      },
      {
        src: "https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?q=80&w=1200&auto=format&fit=crop",
        title: "Bangkok, Thailand",
        description: "Explore bustling night markets and rooftop bars with skyline views. Experience traditional Thai massage and street food culture. Visit illuminated temples and riverside attractions."
      },
      {
        src: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop",
        title: "Dubai, UAE",
        description: "Marvel at the illuminated Burj Khalifa and Dubai Fountain. Enjoy luxury beach clubs and desert night safaris. Experience opulent dining and shopping in futuristic malls."
      }
    ]
  },
  "Desert Whispers": {
    title: "Stunning Desert Destinations",
    images: [
      {
        src: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
        title: "Sahara Desert, Morocco",
        description: "Ride camels through endless golden dunes in Merzouga. Camp under stars in traditional Berber tents. Experience authentic Moroccan hospitality and desert culture."
      },
      {
        src: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?q=80&w=1200&auto=format&fit=crop",
        title: "Wadi Rum, Jordan",
        description: "Explore the dramatic red desert landscapes of the Valley of the Moon. Visit ancient petroglyphs and Bedouin camps. Experience jeep tours and hot air balloon rides."
      },
      {
        src: "https://images.unsplash.com/photo-1682686581551-867e0b208bd1?q=80&w=1200&auto=format&fit=crop",
        title: "Atacama Desert, Chile",
        description: "Witness the world's clearest night skies for stargazing. Explore salt flats, geysers, and colorful lagoons. Visit unique lunar-like landscapes and ancient ruins."
      }
    ]
  }
};


export const SelectTravelesList = [
  {
    id: 1,
    title: 'Just Me',
    desc: 'A sole traveles in exploration',
    icon: '✈️',
    people: '1'
  },
  {
    id: 2,
    title: 'A Couple',
    desc: 'Two traveles in tandem',
    icon: '🥂',
    people: '2 People'
  },
  {
    id: 3,
    title: 'Family',
    desc: 'A group of fun loving adv',
    icon: '🏡',
    people: '3 to 5 People'
  },
  {
    id: 4,
    title: 'Friends',
    desc: 'A bunch of thrill-seekes',
    icon: '⛵',
    people: '4 to 10 People'
  },
];

export const SelectBudgetOptions = [
  {
    id: 1,
    title: 'Cheap',
    desc: 'Stay conscious of costs',
    icon: '💵',
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 2,
    title: 'Moderate',
    desc: 'Keep cost on the average side',
    icon: '💰',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    id: 3,
    title: 'Luxury',
    desc: 'Don\'t worry about cost',
    icon: '💸',
    color: 'bg-purple-100 text-purple-600',
  },
]


export const SelectTravelInterests = [
  {
    id: 1,
    title: 'Adventure',
    desc: 'Thrilling activities and bold experiences',
    icon: '🏔️',
    type: 'Adventure'
  },
  {
    id: 2,
    title: 'Culture',
    desc: 'Historical places, traditions and local vibes',
    icon: '🏛️',
    type: 'Culture'
  },
  {
    id: 3,
    title: 'Food',
    desc: 'Exploring cuisines and unique flavours',
    icon: '🍜',
    type: 'Food'
  },
  {
    id: 4,
    title: 'Relaxation',
    desc: 'Calm, peaceful and slow travel experiences',
    icon: '🌴',
    type: 'Relaxation'
  },
];
