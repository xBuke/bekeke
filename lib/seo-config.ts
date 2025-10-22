// Centralni SEO config - izmijeni ove vrijednosti kad odabereš naziv i domenu
export const seoConfig = {
  name: "MARKETPLACE_NAME", // Promijeni u finalni naziv
  url: "https://YOUR-DOMAIN.com", // Promijeni u finalnu domenu
  description: "Pronađite provjerene majstore i pružatelje usluga u vašem gradu. Vodoinstalateri, električari, čistačice i više.",
  keywords: [
    'usluge',
    'majstori', 
    'hrvatska',
    'split',
    'zagreb',
    'rijeka',
    'osijek',
    'dubrovnik',
    'vodoinstalateri',
    'električari',
    'bravar',
    'keramičar',
    'soboslikar',
    'čistačica',
    'dadilja',
    'instruktor',
    'it stručnjak',
    'frizer'
  ],
  ogImage: "/og-image.png", // Dodaj sliku kasnije
  twitterHandle: "@marketplace_hr", // Promijeni kad odabereš handle
  author: "Marketplace Team",
  locale: "hr_HR",
  
  // Gradovi
  cities: [
    { name: "Split", slug: "split" },
    { name: "Zagreb", slug: "zagreb" },
    { name: "Rijeka", slug: "rijeka" },
    { name: "Osijek", slug: "osijek" },
    { name: "Dubrovnik", slug: "dubrovnik" }
  ],
  
  // Kategorije
  categories: [
    { name: "Vodoinstalater", slug: "vodoinstalater", icon: "🚰" },
    { name: "Električar", slug: "elektricar", icon: "⚡" },
    { name: "Bravar", slug: "bravar", icon: "🔐" },
    { name: "Keramičar", slug: "keramicar", icon: "🧱" },
    { name: "Soboslikar", slug: "soboslikar", icon: "🎨" },
    { name: "Čistačica", slug: "cisticica", icon: "🧹" },
    { name: "Dadilja", slug: "dadilja", icon: "👶" },
    { name: "Instruktor", slug: "instruktor", icon: "📚" },
    { name: "IT stručnjak", slug: "it-strucnjak", icon: "💻" },
    { name: "Frizer", slug: "frizer", icon: "💇" }
  ]
} as const;

// Helper funkcije za SEO
export function generatePageTitle(pageTitle: string): string {
  return `${pageTitle} | ${seoConfig.name}`;
}

export function generatePageDescription(baseDescription: string, city?: string, category?: string): string {
  let description = baseDescription;
  
  if (city && category) {
    description = `Pronađite najbolje ${category} u ${city}u. ${baseDescription}`;
  } else if (city) {
    description = `Pronađite provjerene majstore u ${city}u. ${baseDescription}`;
  } else if (category) {
    description = `Najbolji ${category} u Hrvatskoj. ${baseDescription}`;
  }
  
  return description;
}

export function generateOpenGraphTitle(title: string, city?: string, category?: string): string {
  if (city && category) {
    return `${category} u ${city}u - ${seoConfig.name}`;
  }
  return `${title} - ${seoConfig.name}`;
}
