
import { Artist, ThemeConfig, ArtistId, Artwork } from './types';

// Helper to generate placeholder Zora links
const zoraBase = "https://zora.co/collect/base:";

export const RESIDENCY_PHOTOS = [
  "https://i.postimg.cc/vH38QLJM/kaskskaks.jpg",
  "https://i.postimg.cc/sDwfV9kx/lala.jpg",
  "https://i.postimg.cc/VLDsYBx6/lalalala.jpg",
  "https://i.postimg.cc/4NB4JbDK/photo-4985803014971001725-w.jpg",
  "https://i.postimg.cc/CLmMFH3d/photo-4985803014971001727-w.jpg",
  "https://i.postimg.cc/wT0x6cCD/photo-4985803014971001728-w.jpg",
  "https://i.postimg.cc/tC2RXtKW/photo-4985803014971001732-w.jpg",
  "https://i.postimg.cc/ZKVYTFGr/photo-4985803014971001733-w.jpg",
  "https://i.postimg.cc/ZKVYTFG3/sato.jpg",
  "https://i.postimg.cc/vZTYDxyc/Whats-App-Image-2025-11-26-at-00-49-08-(1).jpg",
  "https://i.postimg.cc/L859hgSg/Whats-App-Image-2025-11-26-at-00-49-09-(1).jpg",
  "https://i.postimg.cc/8zcpsfGF/Whats-App-Image-2025-11-26-at-00-49-09-(2).jpg",
  "https://i.postimg.cc/Cx5hdn0B/Whats-App-Image-2025-11-26-at-00-49-09-(3).jpg",
  "https://i.postimg.cc/T31dh5xb/Whats-App-Image-2025-11-26-at-00-49-09-(4).jpg",
  "https://i.postimg.cc/YC0rjL7Q/Whats-App-Image-2025-11-26-at-00-49-09-(5).jpg",
  "https://i.postimg.cc/RZhSqJmK/Whats-App-Image-2025-11-26-at-00-49-10.jpg"
];

export const ARTISTS: Record<ArtistId, Artist> = {
  qab: {
    id: 'qab',
    name: 'QABQABQAB',
    shortDescription: 'Pop Gestual Urbano',
    profileImage: 'https://i.postimg.cc/jSntxpYw/qab-profile.webp',
    creatorCoinLink: 'https://app.uniswap.org/explore/tokens/base/0x05c135cf39c17686f9d2a17308db12bc7cbb8c2a',
    creatorCoinAddress: '0x05c135cf39c17686f9d2a17308db12bc7cbb8c2a',
    mainArtwork: { 
      id: 'qab-1', 
      title: 'Da Kismet Female Energy', 
      imageUrl: 'https://i.postimg.cc/RZSqXtGT/qab-da-kismet-female-energy.png',
      zoraLink: 'https://zora.co/coin/base:0x6384cf1831d559f1d63c863df127e5d8983f615e?referrer=0x316a8ebc554735a19ee54b3144a816ac773a32e8'
    },
    gallery: [],
    socials: { 
      twitter: 'https://x.com/qabqabqab', 
      instagram: 'https://instagram.com/qabqabqabqabqab', 
      farcaster: 'https://warpcast.com/qabqabqab' 
    }
  },
  gressie: {
    id: 'gressie',
    name: 'GRESSIE',
    shortDescription: 'Etéreo Suave',
    profileImage: 'https://i.postimg.cc/fRSDzGQJ/profile-gressie.webp',
    creatorCoinLink: 'https://app.uniswap.org/explore/tokens/base/0x134f2bfdd5682ed3e8ac43c0866728bf56b2ed82',
    creatorCoinAddress: '0x134f2bfdd5682ed3e8ac43c0866728bf56b2ed82',
    mainArtwork: { 
      id: 'gressie-1', 
      title: 'House of Chaos', 
      imageUrl: 'https://i.postimg.cc/nhFM0mT4/gressie-house-of-chaos.png',
      zoraLink: 'https://zora.co/coin/base:0xad2bb08028179f56382627fb1673ceee7aca64e0?referrer=0x741a32135cf5fe53b3af8bddc47c72cf0ca61855'
    },
    gallery: [],
    socials: { 
      twitter: 'https://x.com/gressieU', 
      instagram: 'https://instagram.com/gressie.art', 
      farcaster: 'https://warpcast.com/gressie' 
    }
  },
  noistruct: {
    id: 'noistruct',
    name: 'NOISTRUCT',
    shortDescription: 'Biomecánico / Reliquia Gótica',
    profileImage: 'https://i.postimg.cc/XYB4jR6d/profile-noistruct.webp',
    creatorCoinLink: 'https://app.uniswap.org/explore/tokens/base/0x677402dda2155a34980b7e54e920ff964848c297',
    creatorCoinAddress: '0x677402dda2155a34980b7e54e920ff964848c297',
    mainArtwork: { 
      id: 'noi-1', 
      title: '17h Maho Shoujo Error Bronze', 
      imageUrl: 'https://i.postimg.cc/mgLh89VQ/noistruct-17h-maho-shoujo-error-bronze.png',
      zoraLink: 'https://zora.co/coin/base:0x9eb7d5315033a221bd5623117d7938a7c5d6d2ac?referrer=0x5f3d4685e5f5bfa83abb85972845d52f474e7a6f'
    },
    gallery: [],
    socials: { 
      twitter: 'https://x.com/noistruct', 
      instagram: 'https://instagram.com/noistruct', 
      farcaster: 'https://warpcast.com/noistruct' 
    }
  },
  sulkian: {
    id: 'sulkian',
    name: 'SULKIAN CORE',
    shortDescription: 'Biomecanoide Tech-Futurista',
    profileImage: 'https://i.postimg.cc/W1qTNBcZ/sulkian-profile.webp',
    creatorCoinLink: 'https://app.uniswap.org/explore/tokens/base/0x61d5a80fcf601b9adb95843f52cceec587acd1a0',
    creatorCoinAddress: '0x61d5a80fcf601b9adb95843f52cceec587acd1a0',
    mainArtwork: { 
      id: 'sulk-1', 
      title: 'DS-L-Oₓₓₓ I', 
      imageUrl: 'https://i.postimg.cc/mgLh89V6/sulkian-DS-L-Oₓₓₓ-1.png',
      zoraLink: 'https://zora.co/coin/base:0x2a7d91d99027b79c7a95244fc3490fc512604f60?referrer=0xceaaa9422a8fcc90690fc3b6d37afbc4cbc12889'
    },
    gallery: [
      { id: 'sulk-2', title: 'DS-L-Oₓₓₓ II', imageUrl: 'https://i.postimg.cc/9QmzJ918/sulkian-DS-L-Oₓₓₓ-2.png', zoraLink: 'https://zora.co/@sulkian_core' },
      { id: 'sulk-3', title: 'DS-L-Oₓₓₓ III', imageUrl: 'https://i.postimg.cc/Dwx0DzYQ/sulkian-DS-L-Oₓₓₓ-3.png', zoraLink: 'https://zora.co/@sulkian_core' },
    ],
    socials: { 
      twitter: 'https://x.com/Sulki4n', 
      instagram: 'https://instagram.com/sulkian', 
      farcaster: 'https://warpcast.com/sulkian' 
    }
  },
  kathonejo: {
    id: 'kathonejo',
    name: 'KATHONEJO',
    shortDescription: 'Modo Cielo Kawaii Místico',
    profileImage: 'https://i.postimg.cc/K83xG6h4/profile-kathonejo.webp',
    creatorCoinLink: 'https://app.uniswap.org/explore/tokens/base/0x06fa26fa09cea9dbe412d620538a5e284cf7a115',
    creatorCoinAddress: '0x06fa26fa09cea9dbe412d620538a5e284cf7a115',
    mainArtwork: { 
      id: 'kath-1', 
      title: 'Collage Kismet Residence', 
      imageUrl: 'https://i.postimg.cc/HkYjBM3X/kathonejo-Collage-Kismet-residence.png',
      zoraLink: 'https://zora.co/coin/base:0xd5c732d9b506d3f11c2e6a3560efede19fe783c4?referrer=0x21e5fc1efc822f25e1dff11f81214c9c65032d79'
    },
    gallery: [],
    socials: { 
      twitter: 'https://x.com/kathonejo', 
      instagram: 'https://instagram.com/kathonejo', 
      farcaster: 'https://warpcast.com/kathonejo' 
    }
  },
  arbstein: {
    id: 'arbstein',
    name: 'ARBSTEIN',
    shortDescription: 'Orgánico-Viscoso',
    profileImage: 'https://i.postimg.cc/fRSDzGQV/arbstein-profile.webp',
    creatorCoinLink: 'https://app.uniswap.org/explore/tokens/base/0x059855e99930dd3bacf2d8d147c676d8d7b9139f',
    creatorCoinAddress: '0x059855e99930dd3bacf2d8d147c676d8d7b9139f',
    mainArtwork: { 
      id: 'arb-1', 
      title: 'Phyloem', 
      imageUrl: 'https://i.postimg.cc/13m4JFMq/arbstein-phyloem.png',
      zoraLink: 'https://zora.co/coin/base:0x25e346fa9bdf11e046a1287c4f89fa1202517e55?referrer=0x262390d44c186efdbd06df0e891c591b99bc0d3e'
    },
    gallery: [],
    socials: { 
      twitter: 'https://x.com/arbstein', 
      instagram: 'https://instagram.com/arbstein', 
      farcaster: 'https://warpcast.com/arbstein' 
    }
  },
  sato: {
    id: 'sato',
    name: 'SATO',
    shortDescription: 'Cuaderno de Grafito',
    profileImage: 'https://i.postimg.cc/Mpfq6CJj/sato-profile.webp',
    creatorCoinLink: 'https://app.uniswap.org/explore/tokens/base/0x677e936d6b41191213c68c3e25c3eb203a84d56e',
    creatorCoinAddress: '0x677e936d6b41191213c68c3e25c3eb203a84d56e',
    mainArtwork: { 
      id: 'sato-1', 
      title: 'Untitled', 
      imageUrl: 'https://i.postimg.cc/Vkf5Dt4W/sato-Untitled.png',
      zoraLink: 'https://zora.co/coin/base:0xb85aa0a8721641be7667249a1eedbf22755ba0b9?referrer=0x37569fcc69536a32e12e4b6245f9f7c842382370'
    },
    gallery: [],
    socials: { 
      twitter: 'https://x.com/sato_sato99', 
      instagram: 'https://instagram.com/sato.0o', 
      farcaster: 'https://warpcast.com/sato99' 
    }
  },
  alva: {
    id: 'alva',
    name: 'ALVABRINA',
    shortDescription: 'Portal Energético',
    profileImage: 'https://i.postimg.cc/Df1GZNFG/alva-profile.webp',
    creatorCoinLink: 'https://app.uniswap.org/explore/tokens/base/0x43f0479f3daa2a095ac12a208d62a20cffeed7d9',
    creatorCoinAddress: '0x43f0479f3daa2a095ac12a208d62a20cffeed7d9',
    mainArtwork: { 
      id: 'alva-1', 
      title: 'Yellow Birth', 
      imageUrl: 'https://i.postimg.cc/c4MrRh78/alva-Yellow-Birth.png',
      zoraLink: 'https://zora.co/coin/base:0xbb6364a2a6319407ceb4c8a228c8d99e7a6e96de?referrer=0x3ac25f0cdb84bdc7a6508adc1b43e09596163b10'
    },
    gallery: [],
    socials: { 
      twitter: 'https://x.com/AlvaBrina', 
      instagram: 'https://instagram.com/alva.brina', 
      farcaster: 'https://warpcast.com/alvabrina' 
    }
  },
  pinkyblue: {
    id: 'pinkyblue',
    name: 'PINKYBLU',
    shortDescription: 'Pixel-Sueño Líquido',
    profileImage: 'https://i.postimg.cc/g2LmzCbJ/pinky-profile.webp',
    creatorCoinLink: 'https://app.uniswap.org/explore/tokens/base/0x490e46a791bbc641e23f3637d84d713130b92ef0',
    creatorCoinAddress: '0x490e46a791bbc641e23f3637d84d713130b92ef0',
    mainArtwork: { 
      id: 'pb-1', 
      title: 'Other Sunlights', 
      imageUrl: 'https://i.postimg.cc/pTTD77ZD/pinkyblu-Other-sunlights.gif',
      zoraLink: 'https://zora.co/coin/base:0x872995c84234e25b48633ff2741ec16305358e80?referrer=0xcd230444967a155ec02fb9d4bfb08cfcee158c28'
    },
    gallery: [],
    socials: { 
      twitter: 'https://x.com/Pinkyblu_', 
      farcaster: 'https://warpcast.com/pinkyblu' 
    }
  }
};

export const THEMES: Record<ArtistId, ThemeConfig> = {
  qab: {
    id: 'qab',
    bgClass: 'bg-yellow-400',
    textClass: 'text-black font-black selection:bg-purple-500 selection:text-white',
    fontClass: 'font-["Space_Grotesk"]',
    borderClass: 'border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
    buttonClass: 'bg-purple-500 text-white hover:translate-x-1 hover:-translate-y-1 transition-transform',
    motionType: 'pop',
    customStyle: {
      backgroundImage: 'radial-gradient(circle, #ff00ff 2px, transparent 2.5px)',
      backgroundSize: '30px 30px'
    }
  },
  gressie: {
    id: 'gressie',
    bgClass: 'bg-gradient-to-b from-slate-200 via-blue-100 to-white',
    textClass: 'text-slate-600',
    fontClass: 'font-sans tracking-widest',
    borderClass: 'border border-white/80 backdrop-blur-md shadow-2xl shadow-blue-200/50 rounded-xl',
    buttonClass: 'bg-white/40 hover:bg-white/60 text-blue-800',
    motionType: 'ethereal',
  },
  noistruct: {
    id: 'noistruct',
    // Heavy, dark metallic base
    bgClass: 'bg-zinc-950',
    // Engraved steel text effect with drop shadows
    textClass: 'text-zinc-400 drop-shadow-[0_2px_1px_rgba(0,0,0,1)] selection:bg-zinc-700 selection:text-white',
    // Industrial monospaced font
    fontClass: 'font-["JetBrains_Mono"] uppercase tracking-widest',
    // Machined metal container look: Double borders, heavy shadows
    borderClass: 'border-2 border-zinc-700 bg-zinc-900/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-sm',
    // Physical button feel
    buttonClass: 'bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-600 text-zinc-300 hover:text-white hover:border-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] active:translate-y-px transition-all',
    motionType: 'mechanic',
    customStyle: {
      // Complex composition: Scratches + Blue/Bronze Glints + Dark Steel
      backgroundImage: `
        repeating-linear-gradient(110deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 15px),
        radial-gradient(circle at 10% 20%, rgba(6, 182, 212, 0.05) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(180, 83, 9, 0.05) 0%, transparent 40%),
        linear-gradient(to bottom, #18181b, #09090b)
      `,
      backgroundSize: '100% 100%',
      // Inner shadow vignette for depth
      boxShadow: 'inset 0 0 150px rgba(0,0,0,0.8)' 
    }
  },
  sulkian: {
    id: 'sulkian',
    bgClass: 'bg-black',
    textClass: 'text-green-400',
    fontClass: 'font-mono',
    borderClass: 'border-2 border-green-600/50 bg-black/80 box-shadow-[0_0_20px_rgba(0,255,0,0.2)]',
    buttonClass: 'bg-green-900/20 border border-green-500/50 hover:bg-green-500 hover:text-black',
    motionType: 'glitch',
    customStyle: {
        backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(32, 255, 77, .03) 25%, rgba(32, 255, 77, .03) 26%, transparent 27%, transparent 74%, rgba(32, 255, 77, .03) 75%, rgba(32, 255, 77, .03) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(32, 255, 77, .03) 25%, rgba(32, 255, 77, .03) 26%, transparent 27%, transparent 74%, rgba(32, 255, 77, .03) 75%, rgba(32, 255, 77, .03) 76%, transparent 77%, transparent)',
        backgroundSize: '50px 50px'
    }
  },
  kathonejo: {
    id: 'kathonejo',
    bgClass: 'bg-slate-950',
    textClass: 'text-pink-200',
    fontClass: 'font-["Inter"]',
    borderClass: 'border-2 border-pink-300/30 bg-slate-900/80 rounded-3xl shadow-[0_0_20px_rgba(249,168,212,0.2)]',
    buttonClass: 'bg-pink-500/10 text-pink-200 hover:bg-pink-400/20 hover:shadow-[0_0_15px_rgba(249,168,212,0.4)]',
    motionType: 'float',
    customStyle: {
       backgroundImage: 'radial-gradient(white 1px, transparent 0)',
       backgroundSize: '40px 40px',
       opacity: 0.8
    }
  },
  arbstein: {
    id: 'arbstein',
    bgClass: 'bg-rose-100',
    textClass: 'text-rose-900',
    fontClass: 'font-sans font-bold',
    borderClass: 'rounded-[3rem] border-8 border-rose-200/50 bg-white/40 shadow-inner',
    buttonClass: 'bg-rose-300 text-white rounded-full hover:scale-110 transition-transform',
    motionType: 'elastic',
    customStyle: {
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, transparent 50%)',
      backgroundSize: '100% 100%'
    }
  },
  sato: {
    id: 'sato',
    bgClass: 'bg-[#f7f5f0]',
    textClass: 'text-stone-600',
    fontClass: 'font-["Cormorant_Garamond"] italic text-xl',
    borderClass: 'border-b border-stone-300 bg-transparent',
    buttonClass: 'underline underline-offset-4 decoration-stone-300 hover:decoration-stone-600',
    motionType: 'sketch',
    customStyle: {
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")'
    }
  },
  alva: {
    id: 'alva',
    bgClass: 'bg-blue-950',
    textClass: 'text-yellow-200',
    fontClass: 'font-["Space_Grotesk"]',
    borderClass: 'border border-yellow-400/40 bg-blue-900/30 backdrop-blur-xl rounded-full shadow-[0_0_50px_rgba(250,204,21,0.2)]',
    buttonClass: 'bg-yellow-400/10 text-yellow-300 border border-yellow-400/20 hover:bg-yellow-400 hover:text-blue-950',
    motionType: 'radial',
    customStyle: {
        backgroundImage: 'conic-gradient(from 90deg at 50% 50%, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)'
    }
  },
  pinkyblue: {
    id: 'pinkyblue',
    bgClass: 'bg-indigo-950',
    textClass: 'text-purple-200',
    fontClass: 'font-["VT323"] text-xl',
    borderClass: 'border-4 border-purple-500 bg-indigo-950/90 shadow-[4px_4px_0px_0px_rgba(168,85,247,1)]',
    buttonClass: 'bg-purple-600 text-white hover:bg-pink-500',
    motionType: 'pixel',
    customStyle: {
        imageRendering: 'pixelated',
        backgroundImage: 'linear-gradient(45deg, #312e81 25%, transparent 25%, transparent 75%, #312e81 75%, #312e81), linear-gradient(45deg, #312e81 25%, transparent 25%, transparent 75%, #312e81 75%, #312e81)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px'
    }
  }
};

// Helper to get all artworks for floating background
export const getAllArtworks = (): Artwork[] => {
  const all: Artwork[] = [];
  Object.values(ARTISTS).forEach(artist => {
    all.push(artist.mainArtwork);
    if (artist.gallery) all.push(...artist.gallery);
  });
  return all;
};
