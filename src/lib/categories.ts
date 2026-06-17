// Master-template category presets. Each category drives the icon, accent
// colors, default tagline, services suggestions, and the WhatsApp greeting for
// a landing page — so one template adapts to any kind of business.
//
// NOTE: Tailwind scans this file for class names, so the color classes below
// must be written as complete literal strings (no dynamic concatenation).

export interface CategoryPreset {
  id: string;
  label: string;
  icon: string; // emoji — universal, no asset pipeline needed
  tagline: string;
  whatsappGreeting: string;
  serviceSuggestions: string[];
  // Theme classes (literal so Tailwind keeps them).
  gradient: string;
  iconBg: string;
  accentText: string;
  primaryBtn: string;
}

export const CATEGORY_PRESETS: CategoryPreset[] = [
  {
    id: "general",
    label: "General Business",
    icon: "🏢",
    tagline: "Quality service you can trust",
    whatsappGreeting: "Hi, I would like to know more about your services.",
    serviceSuggestions: [
      "Trusted & Reliable",
      "Affordable Pricing",
      "Friendly Service",
      "Open 6 Days a Week",
    ],
    gradient: "from-slate-800 to-slate-950",
    iconBg: "bg-slate-100",
    accentText: "text-slate-700",
    primaryBtn: "bg-slate-800 hover:bg-slate-900",
  },
  {
    id: "salon",
    label: "Salon & Beauty",
    icon: "💇",
    tagline: "Look your best, feel your best",
    whatsappGreeting: "Hi, I would like to book an appointment.",
    serviceSuggestions: [
      "Haircut & Styling",
      "Bridal Makeup",
      "Facials & Skincare",
      "Walk-ins Welcome",
    ],
    gradient: "from-pink-500 to-rose-600",
    iconBg: "bg-pink-100",
    accentText: "text-pink-700",
    primaryBtn: "bg-pink-600 hover:bg-pink-700",
  },
  {
    id: "food",
    label: "Food & Restaurant",
    icon: "🍽️",
    tagline: "Delicious food, made fresh daily",
    whatsappGreeting: "Hi, I would like to place an order / book a table.",
    serviceSuggestions: [
      "Dine-In & Takeaway",
      "Home Delivery Available",
      "Fresh Ingredients",
      "Pure Veg / Non-Veg",
    ],
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-100",
    accentText: "text-amber-700",
    primaryBtn: "bg-orange-600 hover:bg-orange-700",
  },
  {
    id: "clinic",
    label: "Clinic & Healthcare",
    icon: "🩺",
    tagline: "Caring for your health and wellbeing",
    whatsappGreeting: "Hi, I would like to book an appointment.",
    serviceSuggestions: [
      "Experienced Doctors",
      "Appointment Booking",
      "Affordable Consultation",
      "Open All Days",
    ],
    gradient: "from-cyan-600 to-blue-700",
    iconBg: "bg-cyan-100",
    accentText: "text-cyan-700",
    primaryBtn: "bg-cyan-700 hover:bg-cyan-800",
  },
  {
    id: "tutoring",
    label: "Tuition & Coaching",
    icon: "📚",
    tagline: "Learn with confidence, succeed with ease",
    whatsappGreeting: "Hi, I would like to know more about your classes.",
    serviceSuggestions: [
      "Experienced Faculty",
      "Small Batch Sizes",
      "Flexible Timings",
      "Free Demo Class",
    ],
    gradient: "from-indigo-600 to-violet-700",
    iconBg: "bg-indigo-100",
    accentText: "text-indigo-700",
    primaryBtn: "bg-indigo-600 hover:bg-indigo-700",
  },
  {
    id: "automotive",
    label: "Automotive & Repair",
    icon: "🔧",
    tagline: "Reliable service for your vehicle",
    whatsappGreeting: "Hi, I would like to enquire about your services.",
    serviceSuggestions: [
      "Expert Mechanics",
      "Genuine Spare Parts",
      "Quick Turnaround",
      "Doorstep Service",
    ],
    gradient: "from-zinc-700 to-zinc-900",
    iconBg: "bg-zinc-100",
    accentText: "text-zinc-700",
    primaryBtn: "bg-zinc-800 hover:bg-zinc-900",
  },
  {
    id: "retail",
    label: "Shop & Retail",
    icon: "🛍️",
    tagline: "Great products at great prices",
    whatsappGreeting: "Hi, I would like to know more about your products.",
    serviceSuggestions: [
      "Wide Range of Products",
      "Best Prices Guaranteed",
      "Home Delivery",
      "New Arrivals Weekly",
    ],
    gradient: "from-emerald-600 to-teal-700",
    iconBg: "bg-emerald-100",
    accentText: "text-emerald-700",
    primaryBtn: "bg-emerald-600 hover:bg-emerald-700",
  },
  {
    id: "fitness",
    label: "Gym & Fitness",
    icon: "💪",
    tagline: "Stronger every single day",
    whatsappGreeting: "Hi, I would like to know about your memberships.",
    serviceSuggestions: [
      "Modern Equipment",
      "Certified Trainers",
      "Flexible Memberships",
      "Free Trial Session",
    ],
    gradient: "from-red-600 to-rose-700",
    iconBg: "bg-red-100",
    accentText: "text-red-700",
    primaryBtn: "bg-red-600 hover:bg-red-700",
  },
  {
    id: "realestate",
    label: "Real Estate & Property",
    icon: "🏠",
    tagline: "Find the perfect place to call home",
    whatsappGreeting: "Hi, I would like to know more about your properties.",
    serviceSuggestions: [
      "Verified Listings",
      "Buy / Sell / Rent",
      "Trusted Agents",
      "Site Visits Available",
    ],
    gradient: "from-blue-700 to-indigo-800",
    iconBg: "bg-blue-100",
    accentText: "text-blue-700",
    primaryBtn: "bg-blue-700 hover:bg-blue-800",
  },
  {
    id: "services",
    label: "Home & Local Services",
    icon: "🛠️",
    tagline: "Dependable help, right at your doorstep",
    whatsappGreeting: "Hi, I would like to book your service.",
    serviceSuggestions: [
      "Skilled Professionals",
      "On-Time Service",
      "Transparent Pricing",
      "Doorstep Available",
    ],
    gradient: "from-amber-600 to-yellow-700",
    iconBg: "bg-amber-100",
    accentText: "text-amber-700",
    primaryBtn: "bg-amber-600 hover:bg-amber-700",
  },
];

const DEFAULT_PRESET = CATEGORY_PRESETS[0];

export function getCategoryPreset(id: string | null | undefined): CategoryPreset {
  return CATEGORY_PRESETS.find((c) => c.id === id) ?? DEFAULT_PRESET;
}

export const CATEGORY_OPTIONS = CATEGORY_PRESETS.map((c) => ({
  value: c.id,
  label: `${c.icon}  ${c.label}`,
}));
