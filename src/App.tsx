/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, FormEvent, useRef, forwardRef } from 'react';
import type { HTMLProps } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  ChevronRight,
  Users,
  Globe,
  BookOpen,
  ShieldCheck,
  Shield,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Info,
  MessageSquare,
  ExternalLink,
  Github,
  MessageCircle,
  Send,
  Search,
  Hash,
  Bell,
  BellOff,
  Settings,
  LogOut,
  User as UserIcon,
  Plus,
  Bot,
  Edit,
  Clock,
  Heart,
  MoreHorizontal,
  Share2,
  Image,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Phone,
  Video,
  PhoneOff,
  Smile,
  Check,
  ChevronLeft,
  Monitor,
  Download,
  CalendarDays,
  StickyNote,
  Mail
} from 'lucide-react';

// --- Types ---

interface User {
  id: number;
  name: string;
  email: string;
  campus: string;
  avatar?: string;
  cover_photo?: string;
  background_url?: string;
  bio?: string;
  student_id?: string;
  program?: string;
  year_level?: string;
  department?: string;
  posts_count?: number;
  following_count?: number;
  followers_count?: number;
}

interface Message {
  id: number | string;
  sender_id: number;
  sender_name: string;
  content: string;
  room_id: string;
  media_url?: string;
  media_type?: string;
  reaction_count?: number;
  user_reaction?: string | null;
  timestamp: string;
  deleted?: boolean;
}

interface Campus {
  name: string;
  slug: string;
  location: string;
  description: string;
  stats: {
    students: string;
    courses: string;
  };
  top: string;
  left: string;
  color: string;
  website: string;
  mapUrl: string;
  sources: { label: string; url: string }[];
}

interface CampusTimelineEvent {
  year: string;
  title: string;
  detail: string;
  sourceLabel: string;
  sourceUrl: string;
}

// --- Constants ---

const CAMPUSES_RAW: Campus[] = [
  {
    name: "MSU Main",
    slug: "msu-main",
    location: "Marawi City, Lanao del Sur",
    description: "The flagship campus of the Mindanao State University System and the core academic and cultural hub of MSU.",
    stats: { students: "25k+", courses: "180+" },
    top: "10%", left: "8%",
    color: "#8e1212",
    website: "https://www.msumain.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Main+Campus+Marawi+City",
    sources: [
      { label: "MSU Main Official", url: "https://www.msumain.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU IIT",
    slug: "msu-iit",
    location: "Iligan City",
    description: "A leading institute in science, engineering, IT, and liberal arts in Northern Mindanao.",
    stats: { students: "18k+", courses: "120+" },
    top: "18%", left: "82%",
    color: "#1a3a5a",
    website: "https://www.msuiit.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU-IIT+Iligan+City",
    sources: [
      { label: "MSU-IIT Official", url: "https://www.msuiit.edu.ph/" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Mindanao_State_University%E2%80%93Iligan_Institute_of_Technology" }
    ]
  },
  {
    name: "MSU Gensan",
    slug: "msu-gensan",
    location: "General Santos City",
    description: "Serving the SOCCSKSARGEN region through programs in education, business, and applied sciences.",
    stats: { students: "12k+", courses: "90+" },
    top: "30%", left: "12%",
    color: "#1b5e20",
    website: "https://gensan.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+General+Santos+Campus",
    sources: [
      { label: "MSU Gensan Official", url: "https://gensan.msu.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU Tawi-Tawi",
    slug: "msu-tawi-tawi",
    location: "Bongao, Tawi-Tawi",
    description: "Known for fisheries, marine science, and ocean-related studies in the southern Philippines.",
    stats: { students: "8k+", courses: "45+" },
    top: "42%", left: "78%",
    color: "#01579b",
    website: "https://tawitawi.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Tawi-Tawi+College+of+Technology+and+Oceanography",
    sources: [
      { label: "MSU Tawi-Tawi Official", url: "https://tawitawi.msu.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU Naawan",
    slug: "msu-naawan",
    location: "Naawan, Misamis Oriental",
    description: "A center for fisheries, aquaculture, and coastal resource research and development.",
    stats: { students: "5k+", courses: "35+" },
    top: "14%", left: "68%",
    color: "#e65100",
    website: "https://naawan.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Naawan",
    sources: [
      { label: "MSU Naawan Official", url: "https://naawan.msu.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU Maguindanao",
    slug: "msu-maguindanao",
    location: "Datu Odin Sinsuat, Maguindanao",
    description: "A major MSU campus focused on inclusive development, governance, and community-based learning.",
    stats: { students: "7k+", courses: "50+" },
    top: "60%", left: "10%",
    color: "#33691e",
    website: "https://maguindanao.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Maguindanao",
    sources: [
      { label: "MSU Maguindanao Official", url: "https://maguindanao.msu.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU Sulu",
    slug: "msu-sulu",
    location: "Jolo, Sulu",
    description: "Supports higher education access and peace-building initiatives in Sulu and nearby island communities.",
    stats: { students: "6k+", courses: "40+" },
    top: "48%", left: "86%",
    color: "#bf360c",
    website: "https://sulu.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Sulu",
    sources: [
      { label: "MSU Sulu Official", url: "https://sulu.msu.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU Buug",
    slug: "msu-buug",
    location: "Buug, Zamboanga Sibugay",
    description: "Provides programs in teacher education, agriculture, and community extension services.",
    stats: { students: "4k+", courses: "30+" },
    top: "72%", left: "68%",
    color: "#4a148c",
    website: "https://buug.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Buug",
    sources: [
      { label: "MSU Buug Official", url: "https://buug.msu.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU-Lanao National College of Arts and Trades (LNCAT)",
    slug: "msu-lncat",
    location: "Marawi",
    description: "Lanao National College of Arts and Trades, an MSU external campus for industry-oriented education.",
    stats: { students: "3k+", courses: "25+" },
    top: "28%", left: "54%",
    color: "#004d40",
    website: "https://www.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+LNCAT+Marawi",
    sources: [
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU-Maigo School of Arts and Trades (MSAT/MSU-Maigo)",
    slug: "msu-maigo-sat",
    location: "Lanao del Norte",
    description: "An MSU external unit offering technical-vocational and teacher education pathways.",
    stats: { students: "2k+", courses: "20+" },
    top: "22%", left: "60%",
    color: "#0d47a1",
    website: "https://www.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Maigo+School+of+Arts+and+Trades",
    sources: [
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU-Lanao del Norte Agricultural College (LNAC)",
    slug: "msu-lnac",
    location: "Sultan Naga Dimaporo",
    description: "Lanao del Norte Agricultural College, an MSU campus dedicated to agriculture and related fields.",
    stats: { students: "2.5k+", courses: "18+" },
    top: "35%", left: "45%",
    color: "#01579b",
    website: "https://www.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+LNAC+Sultan+Naga+Dimaporo",
    sources: [
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU Marantao Community High School",
    slug: "msu-marantao-extension",
    location: "Marantao, Lanao del Sur",
    description: "An MSU-linked extension community high school supporting secondary education access.",
    stats: { students: "900+", courses: "HS Tracks" },
    top: "50%", left: "30%",
    color: "#283593",
    website: "https://www.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Marantao+Community+High+School",
    sources: [
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU Malabang Community High School",
    slug: "msu-malabang-extension",
    location: "Malabang, Lanao del Sur",
    description: "Community high school extension under the MSU system serving local learners.",
    stats: { students: "1k+", courses: "HS Tracks" },
    top: "58%", left: "22%",
    color: "#6a1b9a",
    website: "https://www.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Malabang+Community+High+School",
    sources: [
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU Masiu Community High School",
    slug: "msu-masiu-extension",
    location: "Masiu, Lanao del Sur",
    description: "A community high school extension connected to the MSU system in the Lanao area.",
    stats: { students: "800+", courses: "HS Tracks" },
    top: "66%", left: "26%",
    color: "#ad1457",
    website: "https://www.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Masiu+Community+High+School",
    sources: [
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU Balindong Community High School",
    slug: "msu-balindong-extension",
    location: "Balindong, Lanao del Sur",
    description: "MSU extension-focused community high school for underserved municipalities.",
    stats: { students: "700+", courses: "HS Tracks" },
    top: "74%", left: "34%",
    color: "#37474f",
    website: "https://www.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Balindong+Community+High+School",
    sources: [
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  }
];

const CAMPUSES: Campus[] = (() => {
  const seen = new Set<string>();
  const excluded = new Set<string>([
    'msu-marantao-extension',
    'msu-malabang-extension',
    'msu-masiu-extension',
    'msu-balindong-extension'
  ]);
  const unique: Campus[] = [];
  for (const campus of CAMPUSES_RAW) {
    if (excluded.has(campus.slug)) continue;
    if (seen.has(campus.slug)) continue;
    seen.add(campus.slug);
    unique.push(campus);
  }
  return unique;
})();

const SPARKLES = [
  { top: "10%", left: "14%" },
  { top: "22%", left: "78%" },
  { top: "36%", left: "20%" },
  { top: "54%", left: "72%" },
  { top: "68%", left: "16%" },
  { top: "82%", left: "60%" },
];

const CAMPUS_TIMELINES: Record<string, CampusTimelineEvent[]> = {
  'msu-main': [
    { year: '1961', title: 'Establishment', detail: 'MSU Main was established under RA 1387 as the flagship campus.', sourceLabel: 'Official', sourceUrl: 'https://www.msumain.edu.ph/' },
    { year: '1970s', title: 'Expansion', detail: 'Significant growth in academic programs and infrastructure.', sourceLabel: 'History', sourceUrl: 'https://www.msumain.edu.ph/' },
    { year: '2017', title: 'Resilience', detail: 'The campus remained a beacon of hope during the Marawi Siege.', sourceLabel: 'News', sourceUrl: 'https://www.msumain.edu.ph/' },
    { year: 'Today', title: 'Flagship Excellence', detail: 'Continuing as the premier center for education in Lanao.', sourceLabel: 'System', sourceUrl: 'https://www.msu.edu.ph/' }
  ],
  'msu-iit': [
    { year: '1968', title: 'Creation', detail: 'Founded as a technical institute within the MSU system.', sourceLabel: 'IIT Official', sourceUrl: 'https://www.msuiit.edu.ph/' },
    { year: '1975', title: 'Autonomy', detail: 'Granted autonomous status for its excellence in technology.', sourceLabel: 'Charter', sourceUrl: 'https://www.msuiit.edu.ph/' },
    { year: 'Today', title: 'Global Leader', detail: 'Leading in engineering and science education in Mindanao.', sourceLabel: 'IIT Official', sourceUrl: 'https://www.msuiit.edu.ph/' }
  ],
  'msu-gensan': [
    { year: '1973', title: 'Founding', detail: 'Established to serve the SOCCSKSARGEN region.', sourceLabel: 'Gensan Official', sourceUrl: 'https://gensan.msu.edu.ph/' },
    { year: 'Today', title: 'Growth', detail: 'A top-performing campus in Southern Mindanao.', sourceLabel: 'System', sourceUrl: 'https://gensan.msu.edu.ph/' }
  ],
  'msu-tawi-tawi': [
    { year: '1969', title: 'Establishment', detail: 'Created as a fisheries college in Bongao.', sourceLabel: 'Official', sourceUrl: 'https://tawitawi.msu.edu.ph/' },
    { year: 'Today', title: 'Oceanic Hub', detail: 'Leading research in marine biodiversity.', sourceLabel: 'System', sourceUrl: 'https://tawitawi.msu.edu.ph/' }
  ],
  'msu-naawan': [
    { year: '1981', title: 'Founding', detail: 'Specialized in marine sciences and fisheries.', sourceLabel: 'Naawan Official', sourceUrl: 'https://naawan.msu.edu.ph/' },
    { year: 'Today', title: 'Research Center', detail: 'Center for excellence in aquaculture.', sourceLabel: 'System', sourceUrl: 'https://naawan.msu.edu.ph/' }
  ],
  'msu-maguindanao': [
    { year: '1973', title: 'Creation', detail: 'Serving the Maguindanao province.', sourceLabel: 'Maguindanao Official', sourceUrl: 'https://maguindanao.msu.edu.ph/' },
    { year: 'Today', title: 'Inclusive Dev', detail: 'Focusing on community and agricultural development.', sourceLabel: 'System', sourceUrl: 'https://maguindanao.msu.edu.ph/' }
  ],
  'msu-sulu': [
    { year: '1974', title: 'Founding', detail: 'Established to provide higher education in Jolo.', sourceLabel: 'Sulu Official', sourceUrl: 'https://sulu.msu.edu.ph/' },
    { year: 'Today', title: 'Peace & Education', detail: 'Active center for peace-building through learning.', sourceLabel: 'System', sourceUrl: 'https://sulu.msu.edu.ph/' }
  ],
  'msu-buug': [
    { year: '1971', title: 'Establishment', detail: 'Founded as a community unit in Zamboanga Sibugay.', sourceLabel: 'Buug Official', sourceUrl: 'https://buug.msu.edu.ph/' },
    { year: 'Today', title: 'Expansion', detail: 'Now offering full degree programs in various fields.', sourceLabel: 'System', sourceUrl: 'https://buug.msu.edu.ph/' }
  ],
  'msu-lncat': [
    { year: '1971', title: 'Founding', detail: 'Established as a technical school to serve the industrial needs of Lanao.', sourceLabel: 'System', sourceUrl: 'https://www.msu.edu.ph/' },
    { year: 'Today', title: 'Skills Development', detail: 'A premier campus for vocational and technical excellence.', sourceLabel: 'Official', sourceUrl: 'https://www.msu.edu.ph/' }
  ],
  'msu-lnfc': [
    { year: '1969', title: 'Establishment', detail: 'Founded to boost the fisheries industry in Lanao del Norte.', sourceLabel: 'System', sourceUrl: 'https://www.msu.edu.ph/' },
    { year: 'Today', title: 'Aquaculture Leader', detail: 'A key contributor to marine and aquatic research.', sourceLabel: 'Official', sourceUrl: 'https://www.msu.edu.ph/' }
  ],
  'msu-maigo-sat': [
    { year: '1970', title: 'Creation', detail: 'Founded as a trade school under the MSU system.', sourceLabel: 'System', sourceUrl: 'https://www.msu.edu.ph/' },
    { year: 'Today', title: 'Technical Arts', detail: 'Continuing the legacy of craftsmanship and technology.', sourceLabel: 'Official', sourceUrl: 'https://www.msu.edu.ph/' }
  ],
  default: [
    {
      year: '1961',
      title: 'MSU System established',
      detail: 'The Mindanao State University System was established under Republic Act No. 1387.',
      sourceLabel: 'MSU System',
      sourceUrl: 'https://www.msu.edu.ph/'
    },
    {
      year: 'History',
      title: 'Regional Impact',
      detail: 'This campus was founded to extend the MSU mission to its specific local community.',
      sourceLabel: 'System',
      sourceUrl: 'https://www.msu.edu.ph/'
    },
    {
      year: 'Today',
      title: 'Campus actively serves its local community',
      detail: 'This campus continues delivering instruction, extension, and community service as part of the MSU System network.',
      sourceLabel: 'MSU System',
      sourceUrl: 'https://www.msu.edu.ph/'
    }
  ]
};


// --- Components ---

const Logo = ({ className = "w-full h-full" }: { className?: string }) => (
  <div className={`${className} relative group`}>
    <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-[#1a1310] to-[#0a0502] border border-amber-500/30 p-1.5 shadow-2xl overflow-hidden backdrop-blur-sm transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.1),transparent)]" />
      <img 
        src="/logo.png" 
        className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
        alt="ONEMSU Logo" 
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://www.msu.edu.ph/images/msu-logo.png';
        }} 
      />
      <div className="absolute inset-0 border-t border-l border-white/10 rounded-2xl pointer-events-none" />
    </div>
  </div>
);

const BrandLogoChoice = ({ variant, className = "w-20 h-20" }: { variant: number; className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`brand-g-${variant}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f5d36b"/>
        <stop offset="100%" stopColor="#b99740"/>
      </linearGradient>
    </defs>
    <rect x="8" y="8" width="84" height="84" rx="22" fill="#0b0b0d" stroke={`url(#brand-g-${variant})`} strokeWidth="2"/>
    {variant === 1 && <path d="M50 20 L78 50 L50 80 L22 50 Z" fill="none" stroke="url(#brand-g-1)" strokeWidth="6"/>}
    {variant === 2 && <path d="M50 20 C66 30 75 42 75 56 C75 70 64 79 50 84 C36 79 25 70 25 56 C25 42 34 30 50 20 Z" fill="none" stroke="url(#brand-g-2)" strokeWidth="6"/>}
    {variant === 3 && <circle cx="50" cy="50" r="26" fill="none" stroke="url(#brand-g-3)" strokeWidth="6"/>}
    {variant === 4 && <path d="M20 52 H80 M50 20 V80" stroke="url(#brand-g-4)" strokeWidth="6" strokeLinecap="round"/>}
    {variant === 5 && <path d="M22 70 L50 24 L78 70 Z" fill="none" stroke="url(#brand-g-5)" strokeWidth="6"/>}
    <text x="50" y="58" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="800">ONE</text>
  </svg>
);

const CAMPUS_MEMORIES: Record<string, { tag: string; title: string; body: string }[]> = {
  'msu-main': [
    { tag: 'Trivia', title: 'A campus built on stories', body: 'Students often describe MSU Main as a place where classrooms, open grounds, and community spaces feel connected like one big neighborhood.' },
    { tag: 'Memory', title: 'Sunset walk tradition', body: 'A common student memory is walking the main paths at sunset after long lectures, with friends sharing plans and deadlines.' },
    { tag: 'Past Event', title: 'Campus-wide community days', body: 'Many remember days where organizations set up booths, performances happen, and the whole campus feels like a festival.' },
    { tag: 'Alumni', title: '“You’ll miss the noise”', body: 'Alumni often say the busiest hours—queues, chatter, and quick hellos—are what they miss most after graduation.' }
  ],
  'msu-iit': [
    { tag: 'Trivia', title: 'A culture of building', body: 'Students often talk about the “builder mindset”—projects, labs, and teamwork that continue beyond the classroom.' },
    { tag: 'Memory', title: 'Late-night group work', body: 'A classic IIT memory is coordinating tasks with classmates when a deadline is close, then celebrating the smallest wins.' },
    { tag: 'Past Event', title: 'Showcase moments', body: 'Student-led demos and showcases are memorable because you see ideas turn into something real in front of everyone.' },
    { tag: 'Alumni', title: '“Learn fast, stay kind”', body: 'Alumni advice usually sounds like this: keep learning, but don’t forget to support your teammates.' }
  ],
  default: [
    { tag: 'Fun Fact', title: 'More than a campus', body: 'Every MSU campus has its own rhythm—people, places, and routines that become part of your student life.' },
    { tag: 'Trivia', title: 'Small moments become memories', body: 'A quick meal after class, a lucky seat in the library, or a familiar hallway can become a core college memory.' },
    { tag: 'Past Event', title: 'Organization life', body: 'From orientations to community activities, student orgs often shape the most unforgettable days on campus.' },
    { tag: 'Alumni', title: '“It was worth it”', body: 'Alumni often look back and say the challenges were real, but so was the growth that came with them.' }
  ]
};

const CampusMemories = ({ campus }: { campus: Campus }) => {
  const items = CAMPUS_MEMORIES[campus.slug] || CAMPUS_MEMORIES.default;
  const cards = items.slice(0, 6);
  const iconFor = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes('memory') || t.includes('alumni')) return Heart;
    if (t.includes('past') || t.includes('event')) return Clock;
    return Sparkles;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map((c, idx) => {
        const Icon = iconFor(c.tag);
        return (
          <div key={`${campus.slug}-${idx}-${c.title}`} className="rounded-3xl border border-white/10 bg-black/30 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-amber-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-300/80">{c.tag}</span>
                  <span className="text-[10px] text-gray-600">•</span>
                  <span className="text-[10px] text-gray-500 truncate">{campus.name}</span>
                </div>
                <div className="text-base font-black text-white mb-2">{c.title}</div>
                <div className="text-sm text-gray-300 leading-relaxed">{c.body}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  
  const statuses = [
    "Connecting to MSU Mainframe...",
    "Synchronizing Campus Nodes...",
    "Activating JARVIS Neural Link...",
    "Optimizing Digital Ecosystem...",
    "Finalizing Unity Protocol..."
  ];

  useEffect(() => {
    const duration = 7000;
    const interval = 50;
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress(prev => Math.min(prev + increment, 100));
    }, interval);

    const statusTimer = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % statuses.length);
    }, 1400);

    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
    };
  }, []);

  useEffect(() => {
    if (progress < 100) return;
    const doneTimer = setTimeout(() => onComplete(), 1200);
    return () => clearTimeout(doneTimer);
  }, [progress, onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] grid place-items-center overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
      </div>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-lg flex flex-col items-center justify-center gap-8 md:gap-10 px-6"
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 blur-3xl bg-amber-500/20 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 relative z-10">
            <Logo />
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-center"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-[0.25em] sm:tracking-[0.3em] text-white mb-4 flex items-center justify-center">
            ONE<span className="text-amber-500">MSU</span>
          </h1>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mx-auto mb-4" />
          <p className="text-amber-500/60 text-[10px] sm:text-xs uppercase tracking-[0.45em] sm:tracking-[0.6em] font-medium">
            Unity in Diversity
          </p>
        </motion.div>
        
        {/* Advanced Loading Indicator */}
        <div className="w-full max-w-sm space-y-4">
          <div className="flex justify-between items-end mb-1">
            <motion.span 
              key={statusIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-[10px] font-mono text-gray-500 uppercase tracking-widest"
            >
              {statuses[statusIndex]}
            </motion.span>
            <span className="text-[10px] font-mono text-amber-500/80">
              {Math.round(progress)}%
            </span>
          </div>
          
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/10 backdrop-blur-sm">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.6)]"
              style={{ width: `${progress}%` }}
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            />
            {/* Scanning Light Effect */}
            <motion.div 
              className="absolute inset-y-0 w-20 bg-white/20 skew-x-12"
              animate={{ left: ['-20%', '120%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </motion.div>
      
      {/* Data Stream Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-8 bg-gradient-to-b from-amber-500/0 via-amber-500/40 to-amber-500/0"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: "-10%",
              opacity: 0
            }}
            animate={{ 
              y: "110%",
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 3 + 2, 
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  );
};

const CampusLogo = ({ slug, className = "w-full h-full" }: { slug: string, className?: string }) => {
  const campus = CAMPUSES.find(c => c.slug === slug);
  const primary = campus?.color || "#b99740";
  const nameTokens = (campus?.name || slug)
    .replace(/MSU|College|School|Community|High|of|and|the|Campus/gi, "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  const initials = nameTokens.slice(0, 2).map(t => t[0]?.toUpperCase()).join("") || "MS";

  const lower = `${campus?.name ?? ''} ${campus?.description ?? ''}`.toLowerCase();
  const iconVariant = lower.includes('marine') || lower.includes('fisher') || lower.includes('ocean')
    ? 2
    : lower.includes('technology') || lower.includes('science') || lower.includes('engineering')
      ? 1
      : lower.includes('peace') || lower.includes('security') || lower.includes('governance')
        ? 3
        : 0;
  const accent = ["#f8e38c", "#c5e1ff", "#c8f7c5", "#ffd5b0"][iconVariant];

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`badge-${slug}`} cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor={primary} stopOpacity="1" />
          <stop offset="100%" stopColor="#090909" stopOpacity="0.95" />
        </radialGradient>
        <linearGradient id={`ring-${slug}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill={`url(#badge-${slug})`} />
      <circle cx="50" cy="50" r="41" fill="none" stroke={`url(#ring-${slug})`} strokeWidth="2" />

      {iconVariant === 0 && <path d="M50 23 L74 68 L26 68 Z" fill="rgba(255,255,255,0.92)" />}
      {iconVariant === 1 && <rect x="30" y="28" width="40" height="40" rx="8" fill="rgba(255,255,255,0.9)" />}
      {iconVariant === 2 && <path d="M50 22 C64 31 72 44 72 56 C72 67 62 76 50 80 C38 76 28 67 28 56 C28 44 36 31 50 22 Z" fill="rgba(255,255,255,0.9)" />}
      {iconVariant === 3 && <path d="M50 22 L58 40 L78 42 L63 56 L68 76 L50 66 L32 76 L37 56 L22 42 L42 40 Z" fill="rgba(255,255,255,0.9)" />}

      <text x="50" y="61" textAnchor="middle" fill={primary} fontSize="16" fontWeight="900" fontFamily="Inter, sans-serif" letterSpacing="1.5">
        {initials}
      </text>
    </svg>
  );
};

export default function App() {
  const validViews = ['home', 'explorer', 'about', 'privacy', 'terms', 'dashboard', 'messenger', 'live', 'reels', 'newsfeed', 'profile', 'timeline', 'confession', 'feedbacks', 'lostfound', 'scheduler'] as const;

  const getViewFromPath = () => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname.replace('/', '').trim();
    return validViews.includes(path as any) ? (path as typeof validViews[number]) : 'home';
  };

  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('onemsu_auth') === 'true';
      return !isLoggedIn;
    }
    return true;
  });
  const [view, setViewState] = useState<typeof validViews[number]>(() => {
    return getViewFromPath();
  });
  const viewRef = useRef(view);
  const campusDetailsRef = useRef<HTMLDivElement | null>(null);
  const campusMemoriesRef = useRef<HTMLDivElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      const newView = getViewFromPath();
      setViewState(newView);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    viewRef.current = view;
    localStorage.setItem('onemsu_view', view);
  }, [view]);

  useEffect(() => {
    const handleResize = () => {
      setShowDashboardSidebar(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setView = (newView: typeof validViews[number]) => {
    if (newView !== view) {
      window.history.pushState(null, '', `/${newView}`);
      setViewState(newView);
    }
  };

  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [showCampusModal, setShowCampusModal] = useState(false);
  const [activeCampusSlug, setActiveCampusSlug] = useState(CAMPUSES[0].slug);
  const [showCampusDirectory, setShowCampusDirectory] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('onemsu_auth') === 'true';
    }
    return false;
  });
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onemsu_user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [directMessageList, setDirectMessageList] = useState<{ roomId: string; partner: User; lastMessage?: string }[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onemsu_room');
      return saved || 'announcements';
    }
    return 'announcements';
  });

  useEffect(() => {
    localStorage.setItem('onemsu_room', activeRoom);
  }, [activeRoom]);
  const activeRoomRef = useRef(activeRoom);
  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);
  const socketRef = useRef<WebSocket | null>(null);
  const [otherLastRead, setOtherLastRead] = useState<string | null>(null);
  const [groups, setGroups] = useState<{ id: number; name: string; description: string; campus: string; logo_url?: string }[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<{ id: number; name: string; description: string; campus: string; logo_url?: string }[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [feedbacks, setFeedbacks] = useState<{ id: number; user_id: number; content: string; timestamp: string }[]>([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [freedomPosts, setFreedomPosts] = useState<{ id: number; user_id: number | null; alias: string; content: string; campus: string; image_url?: string; likes: number; shares?: number; reports: number; comment_count?: number; user_liked?: number; timestamp: string }[]>([]);
  const [timelinePosts, setTimelinePosts] = useState<{ id: number; user_id: number | null; alias: string; content: string; campus: string; image_url?: string; likes: number; shares?: number; reports: number; comment_count?: number; user_liked?: number; timestamp: string }[]>([]);
  const [newsfeedUpdates, setNewsfeedUpdates] = useState<Message[]>([]);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [freedomText, setFreedomText] = useState('');
  const [freedomImagePreview, setFreedomImagePreview] = useState<string | null>(null);
  const [confessionAlias, setConfessionAlias] = useState('ONEMSU');
  const [freedomCampusFilter, setFreedomCampusFilter] = useState<string>('All Posts');
  const [showFreedomComposer, setShowFreedomComposer] = useState(false);
  const isOwner = (email?: string) => email === 'xandercamarin@gmail.com' || email === 'sophiakayeaninao@gmail.com';
  const isVerified = (email?: string) => isOwner(email) || email === 'krisandrea.gonzaga@g.msuiit.edu.ph' || email === 'marcoalfons.bollozos@g.msuiit.edu.ph';
  const [selectedGroup, setSelectedGroup] = useState<{ id: number; name: string; description: string; campus: string; logo_url?: string } | null>(null);
  const [newGroup, setNewGroup] = useState<{ name: string; description: string; campus: string; logoPreview: string | null }>({ name: '', description: '', campus: '', logoPreview: null });
  const [dashboardCreateOpen, setDashboardCreateOpen] = useState(false);
  const [dashboardCreating, setDashboardCreating] = useState(false);
  const [mutedRooms, setMutedRooms] = useState<string[]>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('onemsu_muted_rooms') : null;
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [compactBubbles, setCompactBubbles] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'account' | 'profile' | 'privacy' | 'id'>('account');
  const [staff, setStaff] = useState<{ id: number; name: string; role: string; category: string; image_url: string }[]>([
    { id: 1, name: "Calvin", role: "The owner of the discord server and the creator of the website", category: "owner", image_url: "https://cdn.discordapp.com/avatars/836128654983168002/efd5ddadfbd8fba027a6fd0628284996.png?size=4096&ignore=true" },
    { id: 2, name: "soya", role: "The most supportive and beautiful girlfriend! <3", category: "gf", image_url: "https://cdn.discordapp.com/avatars/769044460117557248/57c61d82184be564386079b33d1e2a2a.png?size=4096&ignore=true" },
    { id: 3, name: "cj", role: "Head admin", category: "head_admin", image_url: "https://images-ext-1.discordapp.net/external/9YbVrHrbBezpi7cCqndNnw0ciwYqKGW_8HU_3HFk2oQ/%3Fsize%3D4096%26ignore%3Dtrue%29./https/cdn.discordapp.com/avatars/1435755251717111818/9483192911bbba608461ecf14543355a.png?format=webp&quality=lossless" },
    { id: 4, name: "peony", role: "Head admin", category: "head_admin", image_url: "https://cdn.discordapp.com/avatars/757210164360380486/afc1abd342a34c7b46107efa1d09a2ed.png?size=4096&ignore=true" },
    { id: 5, name: "fronz", role: "Head admin", category: "head_admin", image_url: "https://cdn.discordapp.com/avatars/717612658890768404/53a6534fe0aae4d4c122bc584d9975c5.png?size=4096&ignore=true" },
    { id: 7, name: "Akvil", role: "Head moderator", category: "head_moderator", image_url: "https://cdn.discordapp.com/avatars/825354185544695840/e3b712d60557f5dcccca0c1a612576e5.png?size=4096&ignore=true" },
    { id: 8, name: "Kitty", role: "Head moderator", category: "head_moderator", image_url: "https://cdn.discordapp.com/avatars/1062697990948663306/b084f681c7731c04aa241a7a56b5fbfa.png?size=4096&ignore=true" },
    { id: 9, name: "Raelle", role: "Head moderator", category: "head_moderator", image_url: "https://cdn.discordapp.com/avatars/1248354072189337609/448bfbb74017c7b73f8cb8176cad65a7.png?size=4096&ignore=true" },
    { id: 10, name: "yasqut", role: "Moderator", category: "moderator", image_url: "https://cdn.discordapp.com/avatars/1375587228482408489/df0d65c57cca430359238385900f8df6.png?size=4096&ignore=true" },
    { id: 11, name: "meiha", role: "Moderator", category: "moderator", image_url: "https://cdn.discordapp.com/avatars/1180524405160431686/eefd573d525b34c4b8a5ae9be4d14d67.png?size=4096&ignore=true" },
    { id: 12, name: "Tenmo", role: "Original Member (OG)", category: "og", image_url: "https://cdn.discordapp.com/avatars/739431999806111784/7d86bd995a09aaccc91eaf3a116c293f.png?size=4096&ignore=true" },
    { id: 13, name: "inanis", role: "Original Member (OG)", category: "og", image_url: "https://cdn.discordapp.com/avatars/1439246309469982771/4b4c528f1a0687d716bf0834dd69d08e.png?size=4096&ignore=true" },
    { id: 14, name: "ame", role: "Original Member (OG)", category: "og", image_url: "" },
    { id: 15, name: "brader", role: "Original Member (OG)", category: "og", image_url: "https://cdn.discordapp.com/avatars/689067673807880252/17fd88a82def44db4067ade2854e8fd8.png?size=4096&ignore=true" },
    { id: 16, name: "chiquie", role: "Original Member (OG)", category: "og", image_url: "https://cdn.discordapp.com/avatars/766184428321505301/e5e5caf8ab19efa1f81c0a199d70bb08.png?size=4096&ignore=true" },
    { id: 17, name: "chiyo", role: "Original Member (OG)", category: "og", image_url: "https://cdn.discordapp.com/avatars/926757288230944800/ce2c6a0d3f472f0ffe861b5e94ab171b.png?size=4096&ignore=true" },
    { id: 18, name: "hin", role: "Original Member (OG)", category: "og", image_url: "https://cdn.discordapp.com/avatars/472000060000043059/7f4d4cddef87f30adaf05ce575c864f4.png?size=4096&ignore=true" },
    { id: 19, name: "jai", role: "Original Member (OG)", category: "og", image_url: "" },
    { id: 20, name: "jkl", role: "Original Member (OG)", category: "og", image_url: "https://cdn.discordapp.com/avatars/919004991845462177/67dce056d105e335ca38ef9ed36c219d.png?size=4096&ignore=true" },
    { id: 21, name: "minju", role: "Original Member (OG)", category: "og", image_url: "https://cdn.discordapp.com/avatars/452426833028448267/b23b2186476feb27a3fa567ade968c0f.png?size=4096&ignore=true" },
    { id: 22, name: "minjae", role: "Original Member (OG)", category: "og", image_url: "https://cdn.discordapp.com/avatars/580674066675924994/758b587f3943ddd9fd66b052f39d4cda.png?size=4096&ignore=true" },
    { id: 23, name: "poupon", role: "Original Member (OG)", category: "og", image_url: "https://cdn.discordapp.com/avatars/337540352313393155/2712991c6925250d0c4fab0214dc0a99.png?size=4096&ignore=true" },
    { id: 24, name: "rai", role: "Original Member (OG)", category: "og", image_url: "https://cdn.discordapp.com/avatars/1046345479308455976/5ef5792e3c746133bf27eb266e791f06.png?size=4096&ignore=true" },
    { id: 25, name: "ryu", role: "Original Member (OG)", category: "og", image_url: "https://cdn.discordapp.com/avatars/747286081480818730/79763d60334b2333591c499a0b2deecc.png?size=4096&ignore=true" },
    { id: 26, name: "talkworm", role: "Original Member (OG)", category: "og", image_url: "https://cdn.discordapp.com/avatars/703490912722092053/ed3e45474f5e623d501f1f9fd0f99a22.png?size=4096&ignore=true" },
    { id: 27, name: "tempta", role: "Original Member (OG)", category: "og", image_url: "https://cdn.discordapp.com/avatars/902373851923640331/5e445d5e435431055dc736ed63fdc9ef.png?size=4096&ignore=true" },
    { id: 28, name: "Oreo", role: "Original Member (OG)", category: "og", image_url: "" },
  ]);
  const [newPostContent, setNewPostContent] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [updateText, setUpdateText] = useState('');
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [newsfeedCampusSlug, setNewsfeedCampusSlug] = useState<string>('all');
  const [newsfeedRefreshTick, setNewsfeedRefreshTick] = useState(0);
  const [postingPost, setPostingPost] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [userPreferences, setUserPreferences] = useState({
    profileVisible: true,
    onlineStatus: true,
    allowMessages: true,
    emailNotifications: true
  });
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSavedAt, setPrefsSavedAt] = useState<number | null>(null);
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [passwordNext, setPasswordNext] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSavedAt, setPasswordSavedAt] = useState<number | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [ dashboardSidebarVisible, setDashboardSidebarState ] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768; // md breakpoint
    }
    return true;
  });

  const showDashboardSidebar = useMemo(() => dashboardSidebarVisible, [dashboardSidebarVisible]);
  const setShowDashboardSidebar = (val: boolean | ((prev: boolean) => boolean)) => {
    if (typeof val === 'function') {
      setDashboardSidebarState(val);
    } else {
      setDashboardSidebarState(val);
    }
  };
  const [showMobileProfilePanel, setShowMobileProfilePanel] = useState(false);
  const [swipeStart, setSwipeStart] = useState<{ x: number; y: number } | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [toast, setToast] = useState<{ kind: 'message' | 'notification'; message: string; roomId?: string } | null>(null);
  const [isInVoice, setIsInVoice] = useState(false);
  const [voicePeers, setVoicePeers] = useState<string[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<number, RTCPeerConnection>>(new Map());
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<Map<number, MediaStream>>(new Map());

  useEffect(() => {
    if (!user?.campus) return;
    const matched = CAMPUSES.find(c => c.name === user.campus)?.slug;
    if (!matched) return;
    setNewsfeedCampusSlug(prev => (prev === 'all' ? matched : prev));
  }, [user]);

  const normalizeIncoming = (raw: any) => {
    // Accept both server styles: roomId vs room_id, senderId vs sender_id, etc.
    const roomId = raw.roomId ?? raw.room_id ?? raw.room ?? '';
    const sender_id = raw.sender_id ?? raw.senderId ?? raw.sender ?? null;
    const sender_name = raw.sender_name ?? raw.senderName ?? raw.name ?? 'Unknown';
    const content = raw.content ?? raw.message ?? '';
    const timestamp = raw.timestamp ?? raw.created_at ?? new Date().toISOString();

    const media_url = raw.media_url ?? raw.mediaUrl ?? raw.media ?? undefined;
    const media_type = raw.media_type ?? raw.mediaType ?? raw.mimeType ?? undefined;

    const id = 
      raw.id ?? 
      raw.message_id ?? 
      raw.msgId ?? 
      // fallback deterministic-ish id 
      `${roomId}-${timestamp}-${sender_id ?? 'x'}`;

    const clientId = raw.clientId ?? raw.client_id ?? undefined;

    return { 
      id, 
      clientId, 
      sender_id, 
      sender_name, 
      content, 
      room_id: roomId, 
      roomId, 
      media_url, 
      media_type, 
      timestamp 
    } as any;
  };

  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('onemsu_unread') : null;
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('onemsu_unread', JSON.stringify(unreadCounts));
  }, [unreadCounts]);

  const [notesByRoom, setNotesByRoom] = useState<Record<string, string>>(() => {
    try {
      const key = typeof window !== 'undefined'
        ? (user ? `onemsu_notes_${user.id}` : 'onemsu_notes_guest')
        : 'onemsu_notes_guest';
      const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [schedulerForm, setSchedulerForm] = useState({ title: '', details: '', scheduleDate: '', scheduleTime: '', location: '' });
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [activeReminders, setActiveReminders] = useState<any[]>([]);
  const [dismissedReminders, setDismissedReminders] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user || scheduleItems.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      const upcoming = scheduleItems.filter(item => {
        if (dismissedReminders.has(item.id)) return false;
        
        const scheduleDateTime = new Date(`${item.schedule_date}T${item.schedule_time}`);
        const diffMs = scheduleDateTime.getTime() - now.getTime();
        const diffMins = diffMs / (1000 * 60);
        
        // Notify if between 0 and 30 minutes away
        return diffMins > 0 && diffMins <= 30;
      });

      setActiveReminders(upcoming);
    };

    const timer = setInterval(checkReminders, 30000); // Check every 30 seconds
    checkReminders(); // Initial check

    return () => clearInterval(timer);
  }, [user, scheduleItems, dismissedReminders]);

  const [stickyNotes, setStickyNotes] = useState<{ id: string; content: string; color: string; createdAt: string }[]>(() => {
    try {
      const key = typeof window !== 'undefined'
        ? (user ? `onemsu_stickies_${user.id}` : 'onemsu_stickies_guest')
        : 'onemsu_stickies_guest';
      const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });


  const [schedulerItems, setSchedulerItems] = useState<{ id: string; title: string; date: string; note: string }[]>(() => {
    try {
      const key = typeof window !== 'undefined'
        ? (user ? `onemsu_sched_${user.id}` : 'onemsu_sched_guest')
        : 'onemsu_sched_guest';
      const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const safeJson = async (r: Response) => {
    try {
      const t = await r.text();
      if (!t) return {};
      return JSON.parse(t);
    } catch {
      return {};
    }
  };

  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const mouseRafRef = useRef<number | null>(null);
  const pendingMouseRef = useRef({ x: 0, y: 0 });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    if (isLoggedIn && user) {
      const fetchUnreadCount = async () => {
        const data = await safeFetch(`/api/notifications/unread-count?userId=${user.id}`);
        if (data.success) {
          setUnreadNotificationsCount(data.count);
        }
      };
      
      fetchUnreadCount();
      
      safeFetch(`/api/notifications?userId=${user.id}`)
        .then(data => {
          if (Array.isArray(data)) {
            setNotifications(data);
          }
        });

      safeFetch(`/api/preferences?userId=${user.id}`)
        .then((data) => {
          if (data?.success && data.prefs) {
            setUserPreferences({
              profileVisible: !!data.prefs.profile_visible,
              onlineStatus: !!data.prefs.show_online,
              allowMessages: !!data.prefs.allow_messages,
              emailNotifications: !!data.prefs.email_notifications
            });
          }
        });

      safeFetch(`/api/messenger/recent-dms?userId=${user.id}`).then((data) => {
        if (Array.isArray(data)) {
          setDirectMessageList(data.map((u: User) => ({
            roomId: `dm-${Math.min(user.id, u.id)}-${Math.max(user.id, u.id)}`,
            partner: u,
            lastMessage: 'Chat started'
          })));
        }
      });
    }
  }, [isLoggedIn, user]);

  const markNotificationsAsRead = async () => {
    if (!user) return;
    await safeFetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    setUnreadNotificationsCount(0);
  };

  useEffect(() => {
    const key = user ? `onemsu_sched_${user.id}` : 'onemsu_sched_guest';
    localStorage.setItem(key, JSON.stringify(schedulerItems));
  }, [schedulerItems, user]);

  const isUserOnline = (userId: number) => onlineUsers.includes(Number(userId));

  const [ enrCourses, setEnrolledCourses ] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onemsu_courses');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const enrolledCourses = useMemo(() => enrCourses, [enrCourses]);

  useEffect(() => {
    if (view !== 'home') {
      setMouse({ x: 0, y: 0 });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      pendingMouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };

      if (mouseRafRef.current !== null) return;

      mouseRafRef.current = requestAnimationFrame(() => {
        mouseRafRef.current = null;
        setMouse((prev) => {
          const next = pendingMouseRef.current;
          const movedEnough = Math.abs(prev.x - next.x) > 0.02 || Math.abs(prev.y - next.y) > 0.02;
          return movedEnough ? next : prev;
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseRafRef.current !== null) {
        cancelAnimationFrame(mouseRafRef.current);
        mouseRafRef.current = null;
      }
    };
  }, [view]);

  useEffect(() => {
    if (view === 'explorer' && selectedCampus) {
      setActiveCampusSlug(selectedCampus.slug);
    }
    if (view === 'explorer') setShowCampusDirectory(true);
  }, [view, selectedCampus]);

  useEffect(() => {
    localStorage.setItem('onemsu_auth', isLoggedIn.toString());
    if (user) localStorage.setItem('onemsu_user', JSON.stringify(user));
    else localStorage.removeItem('onemsu_user');
  }, [isLoggedIn, user]);

  useEffect(() => {
    localStorage.setItem('onemsu_courses', JSON.stringify(enrolledCourses));
  }, [enrolledCourses]);

  useEffect(() => {
    if (view === 'about') {
      fetch('/api/staff').then(r => r.json()).then(res => {
        if (res.success && res.staff && res.staff.length > 0) setStaff(res.staff);
      });
    }
  }, [view]);

  useEffect(() => {
    if (isLoggedIn && user) {
      fetch(`/api/profile/${user.id}`)
        .then(r => r.json())
        .then(res => {
          if (res.success) {
            setUser(res.user);
            localStorage.setItem('onemsu_user', JSON.stringify(res.user));
          }
        });
    }
  }, [view, isLoggedIn]);

  useEffect(() => {
    if (view === 'dashboard' || view === 'explorer') {
      setLoadingGroups(true);
      safeFetch('/api/groups')
        .then((data) => {
          if (Array.isArray(data)) setGroups(data);
        })
        .finally(() => setLoadingGroups(false));
      
      if (user) {
        safeFetch(`/api/users/${user.id}/groups`)
          .then(data => {
            if (Array.isArray(data)) setJoinedGroups(data);
          });
      }

      if (true) {
        safeFetch('/api/feedbacks')
          .then((data) => {
            if (Array.isArray(data)) setFeedbacks(data);
          });
        // Highlights should show posts from all campuses
        safeFetch(`/api/freedomwall${user ? `?userId=${encodeURIComponent(String(user.id))}` : ''}`)
          .then((data) => {
            if (Array.isArray(data)) {
              setFreedomPosts(data);
              setLikedPosts(new Set<number>(data.filter((p: any) => Number(p.user_liked) === 1).map((p: any) => Number(p.id))));
            }
          });
        
        // Dashboard also needs newsfeed highlights
        const room = 'newsfeed-all'; // Fetch from global newsfeed so everyone can see
        safeFetch(`/api/messages/${room}?limit=50&sort=desc`)
          .then((data) => {
            if (Array.isArray(data)) setNewsfeedUpdates(data);
          });
      }
    }
  }, [view, user]);

  useEffect(() => {
    if (!user || view !== 'timeline') return;
    safeFetch(`/api/freedomwall/user/${user.id}?viewerId=${encodeURIComponent(String(user.id))}`)
      .then((res) => {
        if (res?.success && Array.isArray(res.items)) {
          setTimelinePosts(res.items);
          setLikedPosts(new Set<number>(res.items.filter((p: any) => Number(p.user_liked) === 1).map((p: any) => Number(p.id))));
        }
      });
  }, [view, user]);

  useEffect(() => {
    if (!user || view !== 'reels') return;
    if (activeRoom !== 'reels') setActiveRoom('reels');
    safeFetch(`/api/messages/reels?userId=${encodeURIComponent(String(user.id))}&limit=50`)
      .then((data: any) => {
        if (Array.isArray(data)) setReelMessages(data);
      });
  }, [view, user]);
  useEffect(() => {
    if (isLoggedIn && view === 'home') setView('dashboard');
  }, [isLoggedIn, view]);

  useEffect(() => {
    let reconnectTimeout: any;
    let heartbeatInterval: any;

    const connectWebSocket = () => {
      if (!isLoggedIn || !user) return;
      if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
        return;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socketUrl = `${protocol}//${window.location.host}`;
      console.log(`Connecting to WebSocket at ${socketUrl}`);
      
      try {
        const socket = new WebSocket(socketUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          console.log("WebSocket connected");
          if (user) {
            socket.send(JSON.stringify({ type: 'join', userId: user.id, roomId: activeRoomRef.current }));
          }
          // Start heartbeat
          heartbeatInterval = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: 'presence_ping', userId: user.id }));
            }
          }, 30000);
        };

        socket.onerror = (error) => {
          console.error("WebSocket error observed:", error);
        };

        socket.onclose = (event) => {
          console.log(`WebSocket closed: ${event.code} ${event.reason}. Reconnecting in 3s...`);
          socketRef.current = null;
          clearInterval(heartbeatInterval);
          if (isLoggedIn) {
            reconnectTimeout = setTimeout(connectWebSocket, 3000);
          }
        };

        socket.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'chat') {
              const msg = normalizeIncoming(data);

              const msgId = String(msg.id);
              const currentView = viewRef.current;
              const currentRoom = activeRoomRef.current;
              const isInCorrectView = (currentView === 'newsfeed' || currentView === 'explorer');
              const isCurrentRoom = (msg.roomId === currentRoom);

              const isReelsRoom = msg.roomId === 'reels' && viewRef.current === 'reels';
              if (isReelsRoom) {
                setReelMessages(prev => {
                  if (prev.some(m => String((m as any).id) === msgId || ((m as any).clientId && (m as any).clientId === msg.clientId))) return prev;
                  return [...prev, msg];
                });
              } else if (isCurrentRoom && isInCorrectView) {
                setMessages(prev => {
                  // Avoid duplicates
                  if (prev.some(m => String((m as any).id) === msgId || ((m as any).clientId && (m as any).clientId === msg.clientId))) return prev;
                  return [...prev, msg];
                });
              }

              // Update newsfeedUpdates if it's a newsfeed post
              if (msg.roomId.startsWith('newsfeed-') || msg.roomId === 'announcements') {
                setNewsfeedUpdates(prev => {
                  const existingIdx = prev.findIndex(m => String((m as any).id) === msgId || ((m as any).clientId && (m as any).clientId === msg.clientId) || String((m as any).id) === msg.clientId);
                  if (existingIdx !== -1) {
                    const updated = [...prev];
                    updated[existingIdx] = msg;
                    return updated;
                  }
                  return [msg, ...prev].slice(0, 50);
                });
              }

              // Update DM list with last message
              if (msg.roomId.startsWith('dm-')) {
                setDirectMessageList(prev => {
                  const idx = prev.findIndex(dm => dm.roomId === msg.roomId);
                  if (idx !== -1) {
                    const updated = [...prev];
                    updated[idx] = { ...updated[idx], lastMessage: String(msg.content).substring(0, 40) };
                    const item = updated.splice(idx, 1)[0];
                    return [item, ...updated];
                  }
                  return prev;
                });
              }
            } else if (data.type === 'notification') {
              const newNotif = data.notification;
              setNotifications(prev => [newNotif, ...prev]);
              setUnreadNotificationsCount(prev => prev + 1);
              setToast({ kind: 'notification', message: newNotif.title });
              setTimeout(() => setToast(null), 5000);
            } else if (data.type === 'presence') {
              setOnlineUsers(data.onlineUsers);
            } else if (data.type === 'voice-existing-users') {
              data.users.forEach(async (targetId: number) => {
                createPeerConnection(targetId, true);
              });
            } else if (data.type === 'user-joined-voice') {
              if (data.userId !== user?.id) {
                createPeerConnection(data.userId, false);
              }
            } else if (data.type === 'user-left-voice') {
              const pc = peerConnections.current.get(data.userId);
              if (pc) {
                pc.close();
                peerConnections.current.delete(data.userId);
              }
              setRemoteStreams(prev => {
                const next = new Map(prev);
                next.delete(data.userId);
                return next;
              });
            } else if (data.type === 'voice-signal') {
              handleVoiceSignal(data);
            }
          } catch (e) {
            console.error("Error parsing WebSocket message:", e);
          }
        };
      } catch (err) {
        console.error("WebSocket connection failed:", err);
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) socketRef.current.close();
      clearTimeout(reconnectTimeout);
      clearInterval(heartbeatInterval);
    };
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN || !user) return;
    socketRef.current.send(JSON.stringify({ type: 'join', userId: user.id, roomId: activeRoom }));
  }, [activeRoom, user, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && activeRoom) {
      // Clear unread for this room when viewed
      setUnreadCounts(prev => {
        if (!prev[activeRoom]) return prev;
        const next = { ...prev };
        delete next[activeRoom];
        return next;
      });
      
      setMessages([]);
      const url = `/api/messages/${activeRoom}?userId=${user?.id || ''}&limit=50`;
      safeFetch(url)
        .then((data: any) => {
          if (Array.isArray(data)) {
            setMessages(data);
          }
          if (activeRoom.startsWith('dm-') && user) {
            safeFetch(`/api/receipts/${activeRoom}?viewer=${user.id}`).then((res) => {
              if (res.success) setOtherLastRead(res.last_read || null);
            });
          } else {
            setOtherLastRead(null);
          }
        })
        .finally(() => setIsLoadingMore(false));
    }
  }, [isLoggedIn, activeRoom, user]);

  useEffect(() => {
    try { localStorage.setItem('onemsu_muted_rooms', JSON.stringify(mutedRooms)); } catch {}
  }, [mutedRooms]);
  useEffect(() => {
    try {
      const key = user ? `onemsu_notes_${user.id}` : 'onemsu_notes_guest';
      localStorage.setItem(key, JSON.stringify(notesByRoom));
    } catch {}
  }, [notesByRoom, user]);
  useEffect(() => {
    try {
      const key = user ? `onemsu_notes_${user.id}` : 'onemsu_notes_guest';
      const saved = localStorage.getItem(key);
      setNotesByRoom(saved ? JSON.parse(saved) : {});
    } catch {
      setNotesByRoom({});
    }
  }, [user]);
  useEffect(() => {
    try {
      const key = user ? `onemsu_stickies_${user.id}` : 'onemsu_stickies_guest';
      localStorage.setItem(key, JSON.stringify(stickyNotes));
    } catch {}
  }, [stickyNotes, user]);


  useEffect(() => {
    if (!user || view !== 'scheduler') return;
    fetch(`/api/schedules?userId=${user.id}`).then(r => r.json()).then(res => {
      if (res.success) setScheduleItems(res.items || []);
    });
  }, [user, view]);
  useEffect(() => {
    try {
      const key = user ? `onemsu_stickies_${user.id}` : 'onemsu_stickies_guest';
      const saved = localStorage.getItem(key);
      setStickyNotes(saved ? JSON.parse(saved) : []);
    } catch {
      setStickyNotes([]);
    }
  }, [user]);

  // Handle swipe gestures for mobile back navigation
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      // Only track swipes that start from the left edge (first 30px)
      if (touch.clientX < 30) {
        setSwipeStart({ x: touch.clientX, y: touch.clientY });
        setSwipeProgress(0);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!swipeStart) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - swipeStart.x;
      const deltaY = Math.abs(touch.clientY - swipeStart.y);

      // Only consider it a swipe if vertical movement is minimal
      if (deltaY < 100 && deltaX > 0) {
        // Update swipe progress (0 to 1)
        const progress = Math.min(deltaX / 200, 1);
        setSwipeProgress(progress);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!swipeStart) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - swipeStart.x;
      const deltaY = Math.abs(touch.clientY - swipeStart.y);

      // Swipe right gesture (deltaX > 50px, vertical movement less than horizontal)
      if (deltaX > 50 && deltaY < 100) {
        // Go back to appropriate view based on current view
        if (view === 'profile') {
          setView('dashboard');
        } else if (view === 'explorer') {
          setView('dashboard');
        } else if (view === 'newsfeed') {
          setView('dashboard');
        } else if (view === 'confession') {
          setView('dashboard');
        } else if (view === 'feedbacks') {
          setView('dashboard');
        } else if (view === 'lostfound') {
          setView('dashboard');
        } else if (view === 'scheduler') {
          setView('dashboard');
        }
      }

      setSwipeStart(null);
      setSwipeProgress(0);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [swipeStart, view]);

  const joinGroup = async (group: any) => {
    if (!user) return;
    const res = await safeFetch(`/api/groups/${group.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    if (res.success) {
      setJoinedGroups(prev => {
        if (prev.some(g => g.id === group.id)) return prev;
        return [...prev, group];
      });
      setView('newsfeed');
    }
  };
  const safeFetch = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.error(`Fetch error for ${url}:`, err);
      return { success: false, error: err };
    }
  };

  const createPeerConnection = async (targetId: number, initiator: boolean) => {
    if (!socketRef.current || !user) return;
    
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnections.current.set(targetId, pc);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.send(JSON.stringify({
          type: 'voice-signal',
          targetId,
          payload: { type: 'candidate', candidate: event.candidate }
        }));
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams(prev => {
        const next = new Map(prev);
        next.set(targetId, event.streams[0]);
        return next;
      });
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    if (initiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.send(JSON.stringify({
        type: 'voice-signal',
        targetId,
        payload: { type: 'offer', sdp: offer }
      }));
    }
  };

  const handleVoiceSignal = async (data: any) => {
    const { senderId, payload } = data;
    let pc = peerConnections.current.get(senderId);

    if (!pc) {
      await createPeerConnection(senderId, false);
      pc = peerConnections.current.get(senderId);
    }
    
    if (!pc) return;

    if (payload.type === 'offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current?.send(JSON.stringify({
        type: 'voice-signal',
        targetId: senderId,
        payload: { type: 'answer', sdp: answer }
      }));
    } else if (payload.type === 'answer') {
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    } else if (payload.type === 'candidate') {
      await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
    }
  };

  const removePeerConnection = (userId: number) => {
    const pc = peerConnections.current.get(userId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(userId);
    }
    setRemoteStreams(prev => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
  };

  const joinVoiceChannel = async (withVideo?: boolean, specificRoom?: string) => {
    const targetRoom = specificRoom || activeRoom;
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN || !user || !targetRoom) {
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        alert("Messenger connection is still connecting. Please wait a moment...");
      }
      return;
    }
    try {
      const wantVideo = withVideo ?? cameraOn;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: wantVideo });
      localStreamRef.current = stream;
      setIsInVoice(true);
      setCameraOn(wantVideo);
      socketRef.current.send(JSON.stringify({ type: 'join-voice', roomId: targetRoom, userId: user.id }));
    } catch (err) {
      console.error("Failed to get media", err);
      alert("Could not access microphone/camera. Please ensure permissions are granted.");
    }
  };

  const leaveVoiceChannel = () => {
    if (!socketRef.current || !user || !activeRoom) return;
    
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    setRemoteStreams(new Map());
    
    socketRef.current.send(JSON.stringify({ type: 'leave-voice', roomId: activeRoom, userId: user.id }));
    setIsInVoice(false);
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !micOn;
        setMicOn(!micOn);
      }
    }
  };

  const toggleCamera = async () => {
    if (!localStreamRef.current) return;
    
    if (cameraOn) {
      // Turn off
      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) {
        track.stop();
        localStreamRef.current.removeTrack(track);
        // Renegotiate? For simplicity, we might need to restart connection or use replaceTrack if we kept the track but disabled it. 
        // Disabling track is easier:
        // track.enabled = false;
        // But to really stop camera light, we stop track.
        setCameraOn(false);
      }
    } else {
      // Turn on
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = videoStream.getVideoTracks()[0];
        localStreamRef.current.addTrack(videoTrack);
        setCameraOn(true);
        // We need to add this track to all peer connections
        peerConnections.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          } else {
            pc.addTrack(videoTrack, localStreamRef.current!);
          }
        });
      } catch (e) {
        console.error("No camera", e);
      }
    }
  };

  useEffect(() => {
    const el = localVideoRef.current;
    if (!el || !localStreamRef.current) return;
    (el as any).srcObject = localStreamRef.current;
    el.muted = true;
    el.play().catch(() => {});
  }, [isInVoice, cameraOn, view]);

  const parseMaybeJson = async (r: Response) => {
    try {
      const t = await r.text();
      if (!t) return {};
      return JSON.parse(t);
    } catch {
      return {};
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).trim().toLowerCase();
    const password = (formData.get('password') as string).trim();

    setAuthError(null);
    setIsAuthLoading(true);
    try {
      const data = await safeFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (data.success) {
        setUser(data.user);
        setIsLoggedIn(true);
        setView('dashboard');
        setIsLoginOpen(false);
      } else {
        setAuthError(data.message || 'Invalid credentials.');
      }
    } catch (error: any) {
      setAuthError('Unable to sign in right now. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).trim().toLowerCase();
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const campus = formData.get('campus') as string;
    const student_id = formData.get('student_id') as string;
    const program = formData.get('program') as string;
    const year_level = formData.get('year_level') as string;

    setAuthError(null);
    setIsAuthLoading(true);
    try {
      const data = await safeFetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, campus, student_id, program, year_level })
      });

      if (data.success) {
        setUser(data.user);
        setIsLoggedIn(true);
        setView('dashboard');
        setIsSignupOpen(false);
      } else {
        setAuthError(data.message || 'Failed to create account.');
      }
    } catch (_error: any) {
      setAuthError('Unable to sign up right now. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setView('home');
    localStorage.removeItem('onemsu_auth');
    localStorage.removeItem('onemsu_user');
  };

  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).trim().toLowerCase();

    setIsAuthLoading(true);
    try {
      const res = await safeFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      setIsAuthLoading(false);
      if (res.success) {
        alert(res.message);
        setIsForgotOpen(false);
        setIsLoginOpen(true);
      } else {
        alert(res.message || "Failed to send reset link.");
      }
    } catch {
      setIsAuthLoading(false);
      alert("Failed to send reset link. Please try again later.");
    }
  };

  const clearChat = async () => {
    if (!user || !activeRoom) return;
    const res = await safeFetch('/api/messages/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, roomId: activeRoom })
    });
    if (res.success) {
      setMessages([]);
      setSettingsOpen(false);
    }
  };

  const deleteMessage = async (msgId: number) => {
    if (!user) return;
    const res = await safeFetch(`/api/messages/${msgId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    if (res.success) {
      setMessages(prev => prev.filter(m => m.id !== msgId));
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`).then(r => r.json());
        setSearchResults(res);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const renderDashboard = () => {
    const updatesUnread = Object.entries(unreadCounts)
      .filter(([room]) => room.startsWith('newsfeed-') || room === 'announcements')
      .reduce((sum, [_, count]) => (sum as number) + (count as number), 0);

    const sidebarNavItems = [
      { icon: <Globe size={20} />, label: 'Home', action: () => setView('dashboard') },
      { icon: <Video size={20} />, label: 'Live', action: () => setView('live') },
      { icon: <Monitor size={20} />, label: 'Reels', action: () => setView('reels') },
      { icon: <Search size={20} />, label: 'Lost & Found', action: () => setView('lostfound') },
      { icon: <BookOpen size={20} />, label: 'Explore', action: () => setView('explorer') },
      { icon: <MessageSquare size={20} />, label: 'Updates', action: () => setView('newsfeed'), unread: updatesUnread },
      { icon: <MessageCircle size={20} />, label: 'Messenger', action: () => setView('messenger') },
      { icon: <CalendarDays size={20} />, label: 'Scheduler', action: () => setView('scheduler') },
      { icon: <Sparkles size={20} />, label: 'Confession', action: () => setView('confession') },
      { icon: <Settings size={20} />, label: 'Settings', action: () => setView('profile') },
      { icon: <Info size={20} />, label: 'Support', action: () => setView('feedbacks') },
    ];

    return (
      <div className="relative h-full w-full bg-[#050507] text-gray-200 flex flex-col md:flex-row overflow-hidden">
        <div className="pointer-events-none absolute -top-44 -right-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(142,18,18,0.15)_0%,rgba(142,18,18,0)_70%)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-24 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.1)_0%,rgba(245,158,11,0)_72%)] blur-3xl" />
        {/* Mobile/Tablet Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 glass-nav sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2 font-bold text-sm cursor-pointer" onClick={() => setView('home')}>
            <div className="w-8 h-8"><Logo /></div>
            <span className="text-white hidden sm:inline tracking-tight">ONE<span className="text-amber-500">MSU</span></span>
          </div>
          <button
            onClick={() => setShowDashboardSidebar(!showDashboardSidebar)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {showDashboardSidebar ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {showDashboardSidebar && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden" onClick={() => setShowDashboardSidebar(false)} />
        )}

        {/* Left Sidebar Navigation */}
        <div className={`fixed md:static inset-y-0 left-0 w-64 bg-[#0a0b0f]/95 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col overflow-y-auto z-40 transform transition-transform duration-300 shadow-[20px_0_50px_rgba(0,0,0,0.5)] ${showDashboardSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:transform-none md:flex md:h-full shrink-0`}>
          <div className="flex items-center gap-3 font-bold text-lg mb-8 cursor-pointer hover:opacity-80 group" onClick={() => { setView('home'); if (window.innerWidth < 768) setShowDashboardSidebar(false); }}>
            <Logo className="w-10 h-10" />
            <span className="text-white tracking-tighter">ONE<span className="text-amber-500">MSU</span></span>
          </div>

          <div className="flex-1 space-y-2">
            {sidebarNavItems.map((item) => {
              const isActive = view === (item as any).viewKey;
              return (
                <button
                  key={item.label}
                  onClick={() => { item.action(); if (window.innerWidth < 768) setShowDashboardSidebar(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-sm font-bold relative group border ${isActive ? 'bg-gradient-to-r from-amber-500/20 to-transparent border-amber-500/30 text-amber-400 shadow-[inset_4px_0_0_#b99740]' : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-amber-300'}`}
                >
                  <span className={`${isActive ? 'text-amber-400 scale-110' : 'text-gray-500 group-hover:text-amber-500 group-hover:scale-110'} transition-all duration-300`}>{item.icon}</span>
                  <span>{item.label}</span>
                  {(item as any).unread > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                    transition={{ scale: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
                    className="absolute right-3 min-w-[22px] h-5.5 px-1.5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                  >
                    {(item as any).unread > 99 ? '99+' : (item as any).unread}
                  </motion.span>
                )}
              </button>
            );
          })}
          </div>

          {user?.email === 'xandercamarin@gmail.com' && (
            <div className="mt-8 pt-6 px-3 border-t border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 mb-4 px-1">
                <Shield size={16} className="text-amber-500" />
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Admin Controls</span>
              </div>
              <button
                onClick={() => {
                  const res = confirm('Are you sure? This action cannot be undone.');
                  if (res) {
                    setFreedomPosts([]);
                    alert('All posts cleared');
                  }
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-rose-400 text-xs hover:bg-rose-500/10 transition-colors"
              >
                Delete All Posts
              </button>
              <button
                onClick={() => {
                  const res = confirm('Reset all user data?');
                  if (res) {
                    alert('Data reset function available');
                  }
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-rose-400 text-xs hover:bg-rose-500/10 transition-colors"
              >
                Reset User Data
              </button>
              <button
                onClick={() => alert('Moderation dashboard coming soon')}
                className="w-full text-left px-3 py-2 rounded-lg text-amber-400 text-xs hover:bg-amber-500/10 transition-colors"
              >
                Moderation Tools
              </button>
              <button
                onClick={() => alert('Settings available')}
                className="w-full text-left px-3 py-2 rounded-lg text-amber-400 text-xs hover:bg-amber-500/10 transition-colors"
              >
                System Settings
              </button>
            </div>
          )}
        </div>

        {/* Main Feed */}
        <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide flex flex-col pb-20 md:pb-0 h-full">
          <div className="w-full max-w-3xl mx-auto p-3 sm:p-4 md:p-6 flex-1">
            {/* Search Bar - Dashboard Header */}
            <div className="mb-6 relative">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for MSUans by full name..."
                  className="w-full bg-[#1a1310] border border-amber-400/20 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-lg group-hover:border-amber-400/30"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchQuery.length >= 2 && (searchResults.length > 0 || isSearching) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1a1310] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                  >
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setProfileData(u);
                            setView('timeline');
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                        >
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold overflow-hidden shrink-0">
                            {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : (u.name?.[0] || 'U')}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-white truncate">{u.name}</div>
                            <div className="text-[11px] text-gray-500 truncate">{u.campus} • {u.email}</div>
                          </div>
                        </button>
                      ))}
                      {!isSearching && searchResults.length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-sm">
                          No users found matching "{searchQuery}"
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search & Post Area */}
            <div className="mb-8 space-y-4">
              {/* Mobile Profile Quick Access */}
              <div className="md:hidden flex items-center justify-between">
                <button
                  onClick={() => setShowMobileProfilePanel(!showMobileProfilePanel)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-card hover:border-amber-500/30 transition-all flex-1"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-900/40 flex items-center justify-center text-amber-500 font-black text-sm border border-amber-500/20 shadow-inner">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="text-sm font-black text-white truncate">{user?.name || 'MSUan'}</div>
                    <div className="text-[11px] text-amber-500/70 font-medium truncate">@{user?.student_id || 'student'}</div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              </div>

              <div className="glass-card p-4 sm:p-5 rounded-3xl space-y-4 mb-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-900/40 flex items-center justify-center text-amber-500 font-bold text-sm sm:text-base shrink-0 border border-amber-500/20 shadow-inner">
                    {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" /> : (user?.name?.[0] || 'U')}
                  </div>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="What's on your mind, MSUan?"
                    rows={1}
                    className="flex-1 bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all resize-none placeholder:text-gray-500"
                    style={{ minHeight: '48px' }}
                  />
                </div>
                {postImage && (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 mt-3">
                    <img src={postImage} alt="" className="w-full max-h-64 object-cover" />
                    <button onClick={() => setPostImage(null)} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-rose-500 transition-colors backdrop-blur-md">
                      <X size={16} />
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/5">
                  <div className="flex gap-4">
                    <label className="cursor-pointer text-gray-400 hover:text-amber-500 transition-colors flex items-center gap-2 text-xs font-medium group">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-amber-500/30 transition-colors">
                        <Image size={18} />
                      </div>
                      <span className="hidden sm:inline">Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setPostImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <button
                    onClick={async () => {
                      if (!user || (!newPostContent.trim() && !postImage)) return;
                      setPostingPost(true);
                      try {
                        let imageUrl: string | undefined;
                        if (postImage) {
                          const up = await fetch('/api/upload', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ dataUrl: postImage })
                          }).then(r => r.json());
                          if (up.success) imageUrl = up.url;
                        }
                        
                        // Dashboard posts go to global newsfeed so everyone can see
                        const roomId = 'newsfeed-all';
                        const content = newPostContent.trim();
                        const clientId = `newsfeed-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                        
                        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                          socketRef.current.send(JSON.stringify({
                            type: 'chat',
                            clientId,
                            senderId: user.id,
                            senderName: user.name || 'ONEMSU',
                            content,
                            roomId,
                            mediaUrl: imageUrl,
                            timestamp: new Date().toISOString()
                          }));
                        } else {
                          await fetch('/api/messages', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              senderId: user.id,
                              senderName: user.name || 'ONEMSU',
                              content,
                              roomId,
                              mediaUrl: imageUrl,
                              timestamp: new Date().toISOString()
                            })
                          });
                        }
                        
                        // Optimistically update the feed
                        setNewsfeedUpdates(prev => [{
                          id: clientId,
                          sender_id: user.id,
                          sender_name: user.name || 'ONEMSU',
                          content,
                          room_id: roomId,
                          media_url: imageUrl,
                          timestamp: new Date().toISOString()
                        } as any, ...prev].slice(0, 50));
                        
                        setNewPostContent('');
                        setPostImage(null);
                      } finally {
                        setPostingPost(false);
                      }
                    }}
                    disabled={(!newPostContent.trim() && !postImage) || postingPost}
                    className="px-5 py-2.5 rounded-xl btn-primary-glow font-bold text-sm disabled:opacity-50 flex items-center gap-2 shrink-0"
                  >
                    <Send size={16} />
                    <span className="hidden sm:inline">{postingPost ? 'Posting...' : 'Post'}</span>
                    <span className="sm:hidden">{postingPost ? '...' : 'Post'}</span>
                  </button>
                </div>
              </div>

            {/* Tab Navigation */}
              <div className="flex gap-4 sm:gap-6 border-b border-white/5 mb-6">
                <button className={`pb-3 text-xs sm:text-sm font-bold transition-all relative ${view === 'dashboard' ? 'text-amber-500' : 'text-gray-500 hover:text-gray-300'}`}>
                  For You
                  {view === 'dashboard' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
                </button>
                <button className="pb-3 text-xs sm:text-sm font-bold text-gray-500 hover:text-gray-300 transition-all relative">
                  Following
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4 sm:space-y-6">
              {newsfeedUpdates.length > 0 ? (
                newsfeedUpdates.map((post) => (
                  <div key={post.id} className="glass-card rounded-3xl overflow-hidden group/card transition-all duration-300">
                    {/* Post Header */}
                    <div className="p-5 flex items-center justify-between border-b border-white/5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-900/40 flex items-center justify-center text-amber-500 font-black text-lg shrink-0 border border-amber-500/20 shadow-inner group-hover/card:border-amber-500/40 transition-colors">
                          {post.sender_name?.[0] || 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-base font-bold text-white truncate group-hover/card:text-amber-400 transition-colors">{post.sender_name}</div>
                          <div className="text-xs text-gray-500 truncate flex items-center gap-1.5 mt-0.5">
                            <span className="text-amber-500/70 font-medium">
                              {post.room_id?.startsWith('newsfeed-') ? (CAMPUSES.find(c => c.slug === post.room_id.replace('newsfeed-', ''))?.name || 'Campus Update') : 'Announcement'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                            {post.timestamp ? new Date(post.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </div>
                        </div>
                      </div>
                      {(user?.id === post.sender_id || user?.email === 'xandercamarin@gmail.com' || user?.email === 'sophiakayeaninao@gmail.com') && (
                        <div className="relative group shrink-0">
                          <button className="p-2 rounded-lg hover:bg-white/5 transition text-gray-500 hover:text-gray-300">
                            <MoreHorizontal size={18} />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-40 bg-[#0a0b0f] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 backdrop-blur-xl">
                            <button
                              onClick={async () => {
                                if (!confirm('Delete this update?')) return;
                                try {
                                  const res = await safeFetch(`/api/messages/${post.id}`, {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ userId: user?.id, forEveryone: true })
                                  });
                                  if (res.success) {
                                    setNewsfeedUpdates(prev => prev.filter(p => p.id !== post.id));
                                  } else {
                                    alert('Failed to delete post');
                                  }
                                } catch (err) {
                                  console.error('Delete failed', err);
                                  alert('Error deleting post');
                                }
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition font-medium"
                            >
                              Delete Post
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="p-5 space-y-4">
                      <p className="text-sm md:text-base text-gray-200 leading-relaxed break-words">{post.content}</p>
                      {post.media_url && (
                        <div className="rounded-2xl overflow-hidden border border-white/5 shadow-lg">
                          <img src={post.media_url} alt="" className="w-full object-cover max-h-[500px] hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-around p-2 text-gray-400 text-xs font-bold gap-2 border-t border-white/5 bg-white/[0.02]">
                      <button className="flex items-center gap-2 hover:bg-rose-500/10 hover:text-rose-500 px-4 py-3 rounded-xl transition-all flex-1 justify-center group/btn">
                        <Heart size={18} className="group-hover/btn:scale-110 transition-transform" />
                        <span>Like</span>
                      </button>
                      <button
                        onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                        className="flex items-center gap-2 hover:bg-amber-500/10 hover:text-amber-500 px-4 py-3 rounded-xl transition-all flex-1 justify-center group/btn"
                      >
                        <MessageCircle size={18} className="group-hover/btn:scale-110 transition-transform" />
                        <span>Comment</span>
                      </button>
                    </div>
                    
                    {expandedComments[post.id] && (
                      <div className="px-4 pb-4">
                        <PostComments postId={post.id as number} />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <Sparkles className="mx-auto mb-4 text-gray-700 animate-pulse" size={48} />
                  <p className="text-gray-500 font-medium">No updates yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Profile Panel */}
        <div className="hidden lg:flex lg:w-80 bg-[linear-gradient(160deg,rgba(35,19,16,0.95),rgba(15,8,8,0.95))] border-l border-amber-400/20 p-6 flex-col overflow-y-auto h-full shrink-0 shadow-[-10px_0_30px_rgba(120,28,28,0.16)]">
          {/* User Profile Card */}
          <div className="mb-8 glass-card rounded-3xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-amber-600/40 to-amber-900/20" />
            <div className="relative z-10 text-center mt-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-900/40 flex items-center justify-center text-amber-500 font-black text-2xl mx-auto mb-3 border-4 border-[#1a1310] shadow-xl overflow-hidden">
                {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : (user?.name?.[0] || 'U')}
              </div>
              <h3 className="text-white font-black text-lg tracking-tight">{user?.name || 'MSUan'}</h3>
              <p className="text-xs text-amber-500/70 font-medium mb-4">@{user?.student_id || 'student'}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5 relative z-10">
              <div className="text-center">
                <div className="text-white font-black text-lg">{user?.posts_count || 0}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-white font-black text-lg">{user?.following_count || 0}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Following</div>
              </div>
              <div className="text-center">
                <div className="text-white font-black text-lg">{user?.followers_count || 0}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Followers</div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-5 relative z-10">
              <p className="text-xs text-gray-300 leading-relaxed mb-5 italic text-center">
                "{user?.bio || 'MSU Student | Explorer'}"
              </p>
              <button
                onClick={() => { setProfileData(user); setView('timeline'); }}
                className="w-full py-3 rounded-xl btn-primary-glow font-bold text-sm flex items-center justify-center gap-2"
              >
                View Profile
              </button>
            </div>
          </div>

          {/* About Me */}
          <div className="glass-card rounded-3xl p-5">
            <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info size={14} /> About Me
            </h4>
            <div className="space-y-4 text-sm">
              <div className="bg-white/5 p-3 rounded-xl">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Campus</div>
                <div className="text-white font-medium">{user?.campus || 'Not Set'}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Program</div>
                <div className="text-white font-medium">{user?.program || 'Not Set'}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Year Level</div>
                <div className="text-white font-medium">{user?.year_level || 'Not Set'}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Mobile Profile Panel Overlay */}
        {showMobileProfilePanel && (
          <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30" onClick={() => setShowMobileProfilePanel(false)} />
        )}

        {/* Mobile Profile Panel */}
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: showMobileProfilePanel ? 0 : '100%', opacity: showMobileProfilePanel ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden fixed right-0 top-0 h-screen w-80 bg-[linear-gradient(160deg,rgba(35,19,16,0.98),rgba(15,8,8,0.98))] border-l border-amber-400/20 overflow-y-auto z-40 flex flex-col"
        >
          <div className="sticky top-0 flex items-center justify-between p-4 bg-[linear-gradient(160deg,rgba(35,19,16,0.95),rgba(15,8,8,0.95))] border-b border-amber-400/15 z-10">
            <h3 className="font-black text-white">Profile</h3>
            <button onClick={() => setShowMobileProfilePanel(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* User Profile Card */}
            <div className="glass-card rounded-3xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-amber-600/40 to-amber-900/20" />
              <div className="relative z-10 text-center mt-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-900/40 flex items-center justify-center text-amber-500 font-black text-xl mx-auto mb-2 border-4 border-[#1a1310] shadow-xl overflow-hidden">
                  {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : (user?.name?.[0] || 'U')}
                </div>
                <h3 className="text-white font-black text-lg tracking-tight">{user?.name || 'MSUan'}</h3>
                <p className="text-xs text-amber-500/70 font-medium mb-4">@{user?.student_id || 'student'}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 relative z-10">
                <div className="text-center">
                  <div className="text-white font-black text-base">{user?.posts_count || 0}</div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-black text-base">{user?.following_count || 0}</div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-black text-base">{user?.followers_count || 0}</div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Followers</div>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-4 relative z-10">
                <p className="text-xs text-gray-300 leading-relaxed mb-4 italic text-center">
                  "{user?.bio || 'MSU Student | Explorer'}"
                </p>
                <button
                  onClick={() => { setProfileData(user); setView('timeline'); setShowMobileProfilePanel(false); }}
                  className="w-full py-2.5 rounded-xl btn-primary-glow font-bold text-sm flex items-center justify-center gap-2"
                >
                  View Profile
                </button>
              </div>
            </div>

            {/* About Me */}
            <div className="glass-card rounded-3xl p-5">
              <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Info size={14} /> About Me
              </h4>
              <div className="space-y-3 text-sm">
                <div className="bg-white/5 p-3 rounded-xl">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Campus</div>
                  <div className="text-white font-medium">{user?.campus || 'Not Set'}</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Program</div>
                  <div className="text-white font-medium">{user?.program || 'Not Set'}</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Year Level</div>
                  <div className="text-white font-medium">{user?.year_level || 'Not Set'}</div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 glass-nav flex justify-around items-center h-20 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] px-4 pb-2">
          {sidebarNavItems.slice(0, 5).map((item) => (
            <button
              key={item.label}
              onClick={() => item.action()}
              className={`flex flex-col items-center justify-center gap-1.5 flex-1 py-2 transition-all relative min-w-0 ${view === (item as any).viewKey ? 'text-amber-500 scale-110' : 'text-gray-500'}`}
              title={item.label}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${view === (item as any).viewKey ? 'bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : ''}`}>
                <span className="text-xl">{item.icon}</span>
              </div>
              <span className={`text-[9px] font-bold truncate w-full text-center uppercase tracking-tighter ${view === (item as any).viewKey ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
              {(item as any).unread > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                  transition={{ scale: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
                  className="absolute top-1 right-2 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] font-black shadow-lg"
                >
                  {(item as any).unread > 99 ? '99+' : (item as any).unread}
                </motion.span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderHome = () => (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 text-center overflow-hidden hero-metallic">
      {/* Navigation Header */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-2 sm:gap-3 font-bold text-lg sm:text-xl cursor-pointer" onClick={() => setView('home')}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
            <Logo className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <span className="hidden sm:inline tracking-tighter">ONE<span className="text-amber-500">MSU</span></span>
        </div>
        
        {/* Scheduler Reminders Popup */}
        <AnimatePresence>
          {activeReminders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-24 right-8 z-[60] w-80 space-y-3 pointer-events-auto"
            >
              {activeReminders.map((reminder) => (
                <motion.div
                  key={reminder.id}
                  layout
                  className="p-4 rounded-2xl bg-[#1a1310]/95 border border-amber-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                      <Bell size={20} className="animate-bounce" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-0.5">Upcoming Schedule</p>
                      <h4 className="text-sm font-bold text-white truncate">{reminder.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Starts at <span className="text-gray-200 font-bold">{reminder.schedule_time}</span>
                        {reminder.location && <span> @ {reminder.location}</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => setDismissedReminders(prev => new Set([...prev, reminder.id]))}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="mt-3 flex gap-2 relative z-10">
                    <button
                      onClick={() => {
                        setView('scheduler');
                        setDismissedReminders(prev => new Set([...prev, reminder.id]));
                      }}
                      className="flex-1 py-2 rounded-xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-tighter hover:bg-amber-400 transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button onClick={() => setView('explorer')} className="text-gray-400 hover:text-white transition-colors">Campuses</button>
          <button onClick={() => setView('about')} className="text-gray-400 hover:text-white transition-colors">About</button>
          <button 
            onClick={() => isLoggedIn ? setView('dashboard') : setIsLoginOpen(true)}
            className="px-5 py-2 rounded-full bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
          >
            {isLoggedIn ? 'Dashboard' : 'Sign In'}
          </button>
        </div>
      </div>

      {/* Background Elements */}
      <motion.div
        aria-hidden
        animate={{ x: mouse.x * 20, y: mouse.y * 12 }}
        transition={{ type: "spring", stiffness: 40, damping: 18 }}
        className="pointer-events-none absolute -top-40 -right-28 w-[30rem] h-[30rem] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(248,196,64,0.18),transparent_60%)] blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ x: mouse.x * -16, y: mouse.y * -10 }}
        transition={{ type: "spring", stiffness: 40, damping: 18 }}
        className="pointer-events-none absolute -bottom-44 -left-32 w-[26rem] h-[26rem] rounded-full bg-[radial-gradient(circle_at_70%_70%,rgba(229,57,53,0.22),transparent_60%)] blur-3xl"
      />
      {SPARKLES.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.9, 1.2, 0.9] }}
          transition={{ duration: 2.6 + i * 0.2, repeat: Infinity }}
          style={{ top: p.top, left: p.left }}
          className="pointer-events-none absolute w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(245,197,24,0.6)]"
        />
      ))}

      {/* Campus Chips (Floating) */}
      {CAMPUSES.map((c, i) => (
        <motion.div
          key={c.slug}
          style={{ top: c.top, left: c.left }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.4, y: [0, -10, 0], x: [0, 5, 0] }}
          transition={{ duration: 5 + (i % 3), repeat: Infinity, ease: "easeInOut" }}
          className="absolute pointer-events-auto select-none hidden md:block cursor-pointer z-20"
          onClick={() => {
            setActiveCampusSlug(c.slug);
            setSelectedCampus(null);
            setShowCampusModal(false);
            setView('explorer');
          }}
        >
          <span className="px-3 py-1 rounded-full text-[10px] font-medium border border-amber-400/20 bg-amber-100/5 text-amber-200/60 backdrop-blur-sm hover:bg-amber-400/20 hover:text-amber-200 transition-colors">
            {c.name}
          </span>
        </motion.div>
      ))}

      {/* Main Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="mb-8" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-100/10 text-amber-200 text-xs md:text-sm mb-6"
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-amber-400"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Mindanao State University
        </motion.div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-metallic-gold">
          ONE<span className="text-white">MSU</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-300/90 max-w-2xl mb-8 md:mb-12 leading-relaxed px-4 sm:px-0">
          The digital heart of the MSU community. Connect, explore, and thrive across all campuses in one unified experience.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('explorer')}
            className="flex-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
          >
            Explore Campuses <ArrowRight size={18} />
          </motion.button>
          
          {!isLoggedIn && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setAuthError(null); setIsLoginOpen(true); }}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-xl font-bold backdrop-blur-md transition-colors"
            >
              Log in
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md card-gold p-8 rounded-3xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-metallic-gold">Connect to ONEMSU</h3>
                <button onClick={() => setIsLoginOpen(false)} className="text-gray-500 hover:text-white"><X /></button>
              </div>
              
              <form className="space-y-6" onSubmit={handleLogin}>
                {authError && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{authError}</p>}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                  <input 
                    name="email"
                    type="email" 
                    placeholder="e.g. juan.delacruz@msumain.edu.ph"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                  <input 
                    name="password"
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                    <input type="checkbox" className="rounded border-white/10 bg-white/5 text-amber-500" />
                    Remember me
                  </label>
                  <button 
                    type="button"
                    onClick={() => { setIsLoginOpen(false); setIsForgotOpen(true); }}
                    className="text-amber-500 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <button 
                  type="submit"
                  disabled={isAuthLoading}
                  className={`w-full bg-amber-500 text-black py-4 rounded-xl font-bold transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 ${isAuthLoading ? 'opacity-70 cursor-not-allowed scale-95' : 'hover:bg-amber-400 active:scale-95'}`}
                >
                  {isAuthLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                      />
                      Connecting...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
              
              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <p className="text-sm text-gray-500">
                  Don't have an account? <button onClick={() => { setAuthError(null); setIsLoginOpen(false); setIsSignupOpen(true); }} className="text-amber-500 font-semibold hover:underline">Register here</button>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Signup Modal */}
      <AnimatePresence>
        {isSignupOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md card-gold p-8 rounded-3xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-metallic-gold">Join ONEMSU</h3>
                <button onClick={() => setIsSignupOpen(false)} className="text-gray-500 hover:text-white"><X /></button>
              </div>
              
              <form className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide" onSubmit={handleSignup}>
                {authError && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{authError}</p>}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Full Name</label>
                    <input 
                      name="name"
                      type="text" 
                      placeholder="Juan Dela Cruz"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Student ID</label>
                    <input 
                      name="student_id"
                      type="text" 
                      placeholder="2024-0001"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Course / Program</label>
                    <input 
                      name="program"
                      type="text" 
                      placeholder="BS Computer Science"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Year Level</label>
                    <select 
                      name="year_level"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      required
                    >
                      <option value="1st" className="bg-[#0a0502]">1st Year</option>
                      <option value="2nd" className="bg-[#0a0502]">2nd Year</option>
                      <option value="3rd" className="bg-[#0a0502]">3rd Year</option>
                      <option value="4th" className="bg-[#0a0502]">4th Year</option>
                      <option value="5th" className="bg-[#0a0502]">5th Year</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
                  <input 
                    name="email"
                    type="email" 
                    placeholder="juan.delacruz@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Campus</label>
                  <select 
                    name="campus"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  >
                    {CAMPUSES.map(c => <option key={c.slug} value={c.name} className="bg-[#0a0502]">{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
                  <input 
                    name="password"
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={isAuthLoading}
                  className={`w-full bg-amber-500 text-black py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 ${isAuthLoading ? 'opacity-70 cursor-not-allowed scale-95' : 'hover:bg-amber-400 active:scale-95'}`}
                >
                  {isAuthLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                      />
                      Creating...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
              
              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <p className="text-sm text-gray-500">
                  Already have an account? <button onClick={() => { setAuthError(null); setIsSignupOpen(false); setIsLoginOpen(true); }} className="text-amber-500 font-semibold hover:underline">Sign In</button>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md card-gold p-8 rounded-3xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-metallic-gold">Reset Password</h3>
                <button onClick={() => setIsForgotOpen(false)} className="text-gray-500 hover:text-white"><X /></button>
              </div>
              
              <p className="text-gray-400 text-sm mb-8">
                Enter your registered Gmail address and we'll send you a link to reset your password.
              </p>
              
              <form className="space-y-6" onSubmit={handleForgotPassword}>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gmail Address</label>
                  <input 
                    name="email"
                    type="email" 
                    placeholder="juan.delacruz@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                    pattern=".+@gmail\.com"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={isAuthLoading}
                  className={`w-full bg-amber-500 text-black py-4 rounded-xl font-bold transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 ${isAuthLoading ? 'opacity-70 cursor-not-allowed scale-95' : 'hover:bg-amber-400 active:scale-95'}`}
                >
                  {isAuthLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                      />
                      Sending Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
              
              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <button 
                  onClick={() => { setIsForgotOpen(false); setIsLoginOpen(true); }} 
                  className="text-sm text-gray-500 hover:text-amber-500 flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  <ArrowRight className="rotate-180" size={16} /> Back to Sign In
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 text-gray-500 text-xs">
        <span className="flex items-center gap-1"><ShieldCheck size={14} /> Secure Access</span>
        <span className="flex items-center gap-1"><Globe size={14} /> Global Network</span>
        <a href="https://discord.gg/nRpkj5SuTs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-amber-500 transition-colors">
          <MessageCircle size={14} /> Contact Us
        </a>
      </div>
    </div>
  );

  const renderExplorer = () => {
    const activeCampus = CAMPUSES.find(campus => campus.slug === activeCampusSlug) || CAMPUSES[0];

    return (
      <div className="h-[100dvh] w-full bg-[radial-gradient(circle_at_top,#1f1a12,#090909_58%)] flex md:flex-row overflow-hidden">
        {/* Sidebar - Campus List */}
        <div className={`w-full md:w-72 lg:w-80 border-r border-white/5 ${showCampusDirectory ? 'flex' : 'hidden'} md:flex flex-col shrink-0 bg-[#121317]/95 backdrop-blur-md`}>
          <div className="p-6 border-b border-white/5">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-white">MSU <span className="text-amber-500">System</span></h2>
              <button onClick={() => setView('home')} className="text-gray-500 hover:text-white"><X /></button>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-amber-400/70 font-bold">{CAMPUSES.length} campuses and extension units loaded</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
            {CAMPUSES.map((campus) => (
              <button
                key={campus.slug}
                onClick={() => { setActiveCampusSlug(campus.slug); setShowCampusDirectory(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group ${activeCampus.slug === campus.slug ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:bg-white/5'}`}
              >
                <div className="w-10 h-10 shrink-0 rounded-xl overflow-hidden shadow-inner">
                  <CampusLogo slug={campus.slug} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-black truncate uppercase tracking-tight">{campus.name}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${activeCampus.slug === campus.slug ? 'text-black/60' : 'text-gray-500'}`}>{campus.location}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 ${showCampusDirectory ? 'hidden md:flex' : 'flex'} flex-col min-w-0 overflow-y-auto scrollbar-hide bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-fixed opacity-95`}>
          <div className="md:hidden p-3 border-b border-white/10 bg-black/40 sticky top-0 z-20">
            <button onClick={() => setShowCampusDirectory(true)} className="px-3 py-2 rounded-lg text-xs font-bold bg-amber-500 text-black">All Campuses</button>
          </div>
          {/* Cover Area */}
          <div className="relative h-64 md:h-80 shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0502]" />
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <CampusLogo slug={activeCampus.slug} className="w-[500px] h-[500px]" />
            </div>
            
            <div className="absolute bottom-8 left-4 right-4 md:left-8 md:right-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div className="flex items-end gap-4 md:gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-36 md:h-36 rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-black/60 border-2 md:border-4 border-white/10 p-4 md:p-6 backdrop-blur-xl shadow-2xl relative group shrink-0">
                  <CampusLogo slug={activeCampus.slug} />
                  <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="pb-1 md:pb-2">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={activeCampus.slug}
                  >
                    <h1 className="text-2xl sm:text-3xl md:text-6xl font-black text-white mb-1 md:mb-2 tracking-tighter drop-shadow-2xl uppercase truncate max-w-[200px] sm:max-w-none">
                      {activeCampus.name}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <p className="text-amber-500 flex items-center gap-1.5 font-bold text-[10px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em]"><MapPin size={12} /> {activeCampus.location}</p>
                      <span className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
                      <p className="text-gray-500 font-bold text-[10px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em]">Established 1961</p>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
                <button
                  onClick={() => window.open(activeCampus.website, '_blank', 'noopener,noreferrer')}
                  className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-xl bg-gradient-to-br from-[#2f2a1b] to-[#1a1712] border border-[#b99740]/35 text-[10px] md:text-xs font-bold text-[#f1dfab] hover:from-[#3a3422] hover:to-[#211d16] transition-all backdrop-blur-md"
                >
                  Official Website
                </button>
                <button
                  onClick={() => {
                    campusDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-xl bg-gradient-to-br from-[#2f2a1b] to-[#1a1712] border border-[#b99740]/35 text-[10px] md:text-xs font-bold text-[#f1dfab] hover:from-[#3a3422] hover:to-[#211d16] transition-all backdrop-blur-md"
                >
                  Snapshot
                </button>
                <button
                  onClick={() => campusMemoriesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-xl royal-accent text-black font-bold text-[10px] md:text-xs hover:brightness-110 transition-all shadow-lg shadow-[#b99740]/30"
                >
                  Memories
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div ref={campusDetailsRef} className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full pb-24">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <section className="royal-panel rounded-3xl p-5 xl:col-span-1">
                <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-300/80 mb-3">Campus Overview</h3>
                <p className="text-gray-200 text-sm leading-relaxed mb-4">{activeCampus.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-black/25 border border-white/10 p-3">
                    <p className="text-[10px] uppercase text-gray-400">Students</p>
                    <p className="text-xl font-black text-white">{activeCampus.stats.students}</p>
                  </div>
                  <div className="rounded-xl bg-black/25 border border-white/10 p-3">
                    <p className="text-[10px] uppercase text-gray-400">Programs</p>
                    <p className="text-xl font-black text-white">{activeCampus.stats.courses}</p>
                  </div>
                </div>
                <div className="mt-3 rounded-xl bg-black/25 border border-white/10 p-3">
                  <p className="text-[10px] uppercase text-gray-400">Location</p>
                  <p className="text-sm font-bold text-white">{activeCampus.location}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeCampus.sources.slice(0, 3).map((source) => (
                    <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full text-[11px] bg-white/5 border border-white/10 hover:border-amber-400/40">
                      {source.label}
                    </a>
                  ))}
                </div>
              </section>

              <section className="royal-panel rounded-3xl p-5 xl:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-black text-white flex items-center gap-2"><MessageSquare className="text-amber-400" size={18} /> Campus Timeline</h3>
                </div>
                <div className="space-y-3">
                  <CampusTimeline campus={activeCampus} />
                </div>
              </section>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <section className="royal-panel rounded-3xl p-5 lg:col-span-2">
                <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2"><BookOpen className="text-amber-400" size={18} /> Campus History</h3>
                <div className="space-y-3 text-sm text-gray-200 leading-relaxed">
                  <p>
                    {activeCampus.name} is part of the Mindanao State University System, serving its surrounding communities through instruction, research, and extension services.
                  </p>
                  <p>
                    Explore the milestones above to see how this campus developed over time, including key expansions, leadership initiatives, and community impact.
                  </p>
                </div>
              </section>
              <section className="royal-panel rounded-3xl p-5">
                <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2"><Globe className="text-amber-400" size={18} /> Links</h3>
                <div className="grid gap-2">
                  <button
                    onClick={() => window.open(activeCampus.website, '_blank', 'noopener,noreferrer')}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-left text-sm font-bold text-white hover:bg-white/10 transition-colors"
                  >
                    Official Website
                  </button>
                  <button
                    onClick={() => window.open(activeCampus.mapUrl, '_blank', 'noopener,noreferrer')}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-left text-sm font-bold text-white hover:bg-white/10 transition-colors"
                  >
                    Open in Google Maps
                  </button>
                  <button onClick={() => campusMemoriesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="w-full px-4 py-2 rounded-xl royal-accent text-left text-sm font-black">
                    Campus Memories
                  </button>
                </div>
              </section>
            </div>

            <section ref={campusMemoriesRef} className="mt-4 royal-panel rounded-3xl p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2"><Sparkles className="text-amber-400" size={18} /> Campus Fun Facts & Memories</h3>
              </div>
              <CampusMemories campus={activeCampus} />
            </section>
          </div>
        </div>

        {/* Campus Detail Modal */}
        <AnimatePresence>
          {showCampusModal && selectedCampus && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-2xl card-gold rounded-3xl overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-amber-900/40 to-black relative flex items-center justify-center">
                  <div className="w-32 h-32">
                    <CampusLogo slug={selectedCampus.slug} />
                  </div>
                  <button 
                    onClick={() => { setShowCampusModal(false); setSelectedCampus(null); }}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="absolute bottom-6 left-8">
                    <h3 className="text-4xl font-bold text-white mb-1">{selectedCampus.name}</h3>
                    <p className="text-amber-400 flex items-center gap-1"><MapPin size={16} /> {selectedCampus.location}</p>
                  </div>
                </div>
                <div className="p-8 max-h-[80vh] overflow-y-auto scrollbar-hide">
                  <div className="mb-8">
                    <p className="text-gray-300 text-lg leading-relaxed mb-4">
                      {selectedCampus.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Student Body</p>
                        <p className="text-2xl font-bold text-white">{selectedCampus.stats.students}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Academic Programs</p>
                        <p className="text-2xl font-bold text-white">{selectedCampus.stats.courses}</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-white/10 mb-8" />
                  
                  <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MessageSquare className="text-amber-500" size={20} /> Campus Timeline
                  </h4>
                  <CampusTimeline campus={selectedCampus} />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {selectedGroup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-xl card-gold rounded-3xl overflow-hidden"
              >
                <div className="h-40 bg-gradient-to-br from-amber-900/40 to-black relative flex items-center justify-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
                    {selectedGroup.logo_url ? <img src={selectedGroup.logo_url} alt="" className="w-full h-full object-cover" /> : selectedGroup.name[0]}
                  </div>
                  <button 
                    onClick={() => setSelectedGroup(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="absolute bottom-6 left-8">
                    <h3 className="text-3xl font-bold text-white mb-1">{selectedGroup.name}</h3>
                    <p className="text-amber-400">{selectedGroup.campus}</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-300 mb-6">{selectedGroup.description || 'No description provided.'}</p>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setSelectedGroup(null)} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">Close</button>
                    <button
                      onClick={() => {
                        joinGroup(selectedGroup);
                        setSelectedGroup(null);
                      }}
                      className="px-4 py-2 rounded-lg bg-cyan-300 text-[#07111f] font-bold hover:bg-cyan-200 transition-colors"
                    >
                      {joinedGroups.some(g => g.id === selectedGroup.id) ? 'Open Chat' : 'Join Chat'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const CampusTimeline = ({ campus }: { campus: Campus }) => {
    const timeline = CAMPUS_TIMELINES[campus.slug] || CAMPUS_TIMELINES.default;

    return (
      <div className="space-y-5">
        {timeline.map((event, index) => (
          <div
            key={`${campus.slug}-${event.year}-${index}`}
            className="p-5 rounded-3xl border bg-black/30"
            style={{ borderColor: `${campus.color}66` }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: campus.color }} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: campus.color }}>
                    {event.year}
                  </span>
                  <span className="text-white font-bold text-sm md:text-base">{event.title}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{event.detail}</p>
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs mt-3 font-semibold hover:underline"
                  style={{ color: campus.color }}
                >
                  <ExternalLink size={12} /> Source: {event.sourceLabel}
                </a>
              </div>
            </div>
          </div>
        ))}

        <div className="p-4 rounded-2xl border bg-black/30" style={{ borderColor: `${campus.color}55` }}>
          <p className="text-xs font-bold uppercase tracking-[0.16em] mb-2" style={{ color: campus.color }}>
            Official Reference Links
          </p>
          <div className="grid gap-2">
            {campus.sources.map((source) => (
              <a
                key={`${campus.slug}-${source.url}`}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-300 hover:text-white transition-colors"
              >
                • {source.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  };


  const StaffCard = ({ member }: { member: any }) => {
    const handleUpload = async (file: File) => {
      if (!user) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const up = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl })
        }).then(r => r.json());
        
        if (up.success) {
          const res = await fetch(`/api/staff/${member.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: up.url, ownerEmail: user.email })
          }).then(r => r.json());
          
          if (res.success) {
            setStaff(prev => prev.map(s => s.id === member.id ? res.item : s));
          }
        }
      };
      reader.readAsDataURL(file);
    };

    return (
      <div className="flex flex-row items-center gap-6 p-6 rounded-[2.5rem] bg-[#120d0b] border border-white/10 group hover:border-amber-500/30 transition-all shadow-2xl relative overflow-hidden h-full min-h-[160px]">
        {/* Background glow effect */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
        
        <div className="flex-1 min-w-0 z-10">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-xl font-black text-white uppercase tracking-widest break-words leading-tight">{member.name}</h4>
            <span className="text-amber-500 font-black text-xl shrink-0">:</span>
          </div>
          <p className="text-[13px] text-gray-400 leading-relaxed mb-4 font-medium line-clamp-3">
            {member.role}
          </p>
          <div className="flex">
            <span className="text-[9px] px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black uppercase tracking-[0.1em] shadow-sm">
              {member.category.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 z-10">
          <div className="w-full h-full rounded-[2rem] overflow-hidden bg-[#0a0a0a] border-2 border-white/10 flex items-center justify-center text-amber-500 font-black text-4xl sm:text-5xl shadow-2xl group-hover:border-amber-500/50 transition-all duration-500 transform group-hover:scale-[1.02]">
            {member.image_url ? (
              <img src={member.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <span className="drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">{member.name[0]?.toUpperCase()}</span>
            )}
          </div>
          {isOwner(user?.email) && (
            <label className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all duration-300 rounded-[2rem] backdrop-blur-md">
              <div className="flex flex-col items-center gap-2 scale-90 group-hover:scale-100 transition-transform">
                <Plus size={28} className="text-white" />
                <span className="text-[9px] text-white font-black uppercase tracking-widest">Edit</span>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }} />
            </label>
          )}
          {/* Subtle outer ring */}
          <div className="absolute -inset-1.5 rounded-[2.2rem] border border-amber-500/0 group-hover:border-amber-500/20 transition-all duration-700 pointer-events-none" />
        </div>
      </div>
    );
  };

  const renderAbout = () => (
    <div className="min-h-screen bg-[#0a0502] text-gray-200">
      <nav className="p-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3 font-bold text-xl cursor-pointer" onClick={() => setView('home')}>
          <div className="w-10 h-10"><Logo /></div>
          <span>ONE<span className="text-amber-500">MSU</span></span>
        </div>
        <button onClick={() => setView('home')} className="text-gray-400 hover:text-white transition-colors"><X /></button>
      </nav>

      <main className="max-w-4xl mx-auto p-8 md:p-16">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-metallic-gold text-center">Our Legacy</h2>
          <p className="text-xl text-gray-400 leading-relaxed mb-6">
            Mindanao State University was established on September 1, 1961, through Republic Act 1387, as amended. It was the brain-child of the late Senator Domocao A. Alonto, as one of the government’s responses to the so-called “Mindanao Problem.”
          </p>
          <p className="text-xl text-gray-400 leading-relaxed">
            The University's original mission was anchored on instruction, research and extension. Its primary objective was to integrate the Muslims and other cultural minorities into the mainstream of Philippine body politic.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10"
          >
            <h3 className="text-2xl font-bold mb-4 text-amber-400">Vision</h3>
            <p className="text-gray-400 leading-relaxed">
              To be a premier supra-regional university in the ASEAN region, committed to the development of Mindanao, Palawan, and the Sulu Archipelago.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10"
          >
            <h3 className="text-2xl font-bold mb-4 text-amber-400">Mission</h3>
            <p className="text-gray-400 leading-relaxed">
              To provide relevant and quality education, research and extension services for the socio-economic and cultural transformation of the communities.
            </p>
          </motion.div>
        </div>

        <section className="text-center">
          <h2 className="text-3xl font-bold mb-12">Join the Community</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => {
                if (isLoggedIn) setView('dashboard');
                else {
                  setView('home');
                  setIsSignupOpen(true);
                }
              }}
              className="px-8 py-3 rounded-full bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
            >
              Apply Now
            </button>
            <a href="https://discord.gg/nRpkj5SuTs" target="_blank" rel="noopener noreferrer" className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors">Contact Us</a>
          </div>
        </section>
        <div className="mt-16 p-6 rounded-3xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-black text-white mb-2">Disclaimer</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            ONEMSU is a student-built community project created to help MSUans connect across campuses. It is not an official Mindanao State University System website and is not affiliated with, endorsed by, or operated by the University.
          </p>
        </div>

        <section className="mt-24">
          <h2 className="text-4xl font-bold mb-12 text-center text-metallic-gold">Meet the Team</h2>
          
          <div className="space-y-16">
            {/* Owners */}
            <div>
              <h3 className="text-xl font-bold text-amber-500 mb-8 border-b border-amber-500/20 pb-2">Founders & Owners</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {staff.filter(s => s.category === 'owner' || s.category === 'gf').map(s => (
                  <div key={s.id}><StaffCard member={s} /></div>
                ))}
              </div>
            </div>

            {/* Admins */}
            <div>
              <h3 className="text-xl font-bold text-amber-500 mb-8 border-b border-amber-500/20 pb-2">Head Administrators</h3>
              <p className="text-sm text-gray-500 mb-6 -mt-6">This 3 help us grow the server and its community</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {staff.filter(s => s.category === 'head_admin').map(s => (
                  <div key={s.id}><StaffCard member={s} /></div>
                ))}
              </div>
            </div>

            {/* Head Moderators */}
            <div>
              <h3 className="text-xl font-bold text-amber-500 mb-8 border-b border-amber-500/20 pb-2">Head Moderators</h3>
              <p className="text-sm text-gray-500 mb-6 -mt-6">This staff / members help us organize and keep the server active which really help our server</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {staff.filter(s => s.category === 'head_moderator').map(s => (
                  <div key={s.id}><StaffCard member={s} /></div>
                ))}
              </div>
            </div>

            {/* Moderators */}
            <div>
              <h3 className="text-xl font-bold text-amber-500 mb-8 border-b border-amber-500/20 pb-2">Moderators</h3>
              <p className="text-sm text-gray-500 mb-6 -mt-6">They also help grow the server and keeps the server fun and active</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {staff.filter(s => s.category === 'moderator').map(s => (
                  <div key={s.id}><StaffCard member={s} /></div>
                ))}
              </div>
            </div>

            {/* OGs */}
            <div>
              <h3 className="text-xl font-bold text-amber-500 mb-8 border-b border-amber-500/20 pb-2">The OGs (Originals)</h3>
              <p className="text-sm text-gray-500 mb-6 -mt-6">Now this are the OG who are really was there since the 1st week of the discord server and they became part of the family and the most important piece in the server</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {staff.filter(s => s.category === 'og').map(s => (
                  <div key={s.id}><StaffCard member={s} /></div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="p-12 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>© 2026 ONEMSU. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          <a href="https://discord.gg/nRpkj5SuTs" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">Contact Us</a>
          <button onClick={() => setView('privacy')} className="hover:text-amber-500 transition-colors">Privacy Policy</button>
          <button onClick={() => setView('terms')} className="hover:text-amber-500 transition-colors">Terms of Service</button>
        </div>
      </footer>
    </div>
  );

  const renderPrivacy = () => (
    <div className="min-h-screen bg-[#0a0502] text-gray-200">
      <nav className="p-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3 font-bold text-xl cursor-pointer" onClick={() => setView('about')}>
          <div className="w-10 h-10"><Logo /></div>
          <span>ONE<span className="text-amber-500">MSU</span></span>
        </div>
        <button onClick={() => setView('about')} className="text-gray-400 hover:text-white transition-colors"><X /></button>
      </nav>

      <main className="max-w-4xl mx-auto p-8 md:p-16 space-y-10">
        <header>
          <h2 className="text-4xl font-black text-white tracking-tight">Privacy Policy</h2>
          <p className="text-sm text-gray-500 mt-2">
            ONEMSU is a student-built project for MSUans and is not affiliated with Mindanao State University System.
          </p>
        </header>

        <section className="p-6 rounded-3xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-black text-white mb-3">What We Collect</h3>
          <div className="space-y-2 text-sm text-gray-300 leading-relaxed">
            <p>- Account details you provide (name, email, campus).</p>
            <p>- Profile details you add (avatar, bio, student info fields).</p>
            <p>- Messages and posts you create inside the app.</p>
            <p>- Basic technical data needed to operate the service (e.g., timestamps).</p>
          </div>
        </section>

        <section className="p-6 rounded-3xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-black text-white mb-3">How We Use Information</h3>
          <div className="space-y-2 text-sm text-gray-300 leading-relaxed">
            <p>- Provide core features like messaging, groups, and campus feeds.</p>
            <p>- Maintain safety features (moderation signals, spam reduction, abuse prevention).</p>
            <p>- Improve the experience based on bug reports and feedback.</p>
          </div>
        </section>

        <section className="p-6 rounded-3xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-black text-white mb-3">Your Choices</h3>
          <div className="space-y-2 text-sm text-gray-300 leading-relaxed">
            <p>- You can update your profile information in settings.</p>
            <p>- You can mute rooms and manage notifications in the app.</p>
            <p>- You can contact the creator via the Contact Us link for privacy requests.</p>
          </div>
        </section>
      </main>
    </div>
  );

  const renderTerms = () => (
    <div className="min-h-screen bg-[#0a0502] text-gray-200">
      <nav className="p-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3 font-bold text-xl cursor-pointer" onClick={() => setView('about')}>
          <div className="w-10 h-10"><Logo /></div>
          <span>ONE<span className="text-amber-500">MSU</span></span>
        </div>
        <button onClick={() => setView('about')} className="text-gray-400 hover:text-white transition-colors"><X /></button>
      </nav>

      <main className="max-w-4xl mx-auto p-8 md:p-16 space-y-10">
        <header>
          <h2 className="text-4xl font-black text-white tracking-tight">Terms of Service</h2>
          <p className="text-sm text-gray-500 mt-2">
            ONEMSU is a student-built community project and is not affiliated with Mindanao State University System.
          </p>
        </header>

        <section className="p-6 rounded-3xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-black text-white mb-3">Use of the Service</h3>
          <div className="space-y-2 text-sm text-gray-300 leading-relaxed">
            <p>- Be respectful. No harassment, hate speech, or threats.</p>
            <p>- Do not share private information without permission.</p>
            <p>- Do not post illegal content or attempt to break the app.</p>
          </div>
        </section>

        <section className="p-6 rounded-3xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-black text-white mb-3">Student Project Disclaimer</h3>
          <div className="space-y-2 text-sm text-gray-300 leading-relaxed">
            <p>- This platform is created and maintained by a student for community connection.</p>
            <p>- It is not an official university portal and should not be used for official announcements unless explicitly marked.</p>
          </div>
        </section>

        <section className="p-6 rounded-3xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-black text-white mb-3">Availability</h3>
          <div className="space-y-2 text-sm text-gray-300 leading-relaxed">
            <p>- The service may change or be unavailable at times.</p>
            <p>- We may update these terms to improve safety and functionality.</p>
          </div>
        </section>
      </main>
    </div>
  );

  const renderFeedbacks = () => (
    <div className="min-h-screen bg-[#0a0502] text-gray-200 p-6 md:p-12 overflow-y-auto scrollbar-hide">
      <div className="max-w-4xl mx-auto pb-20">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">Feedback <span className="text-amber-500">Hub</span></h2>
            <p className="text-gray-500 text-sm mt-1">Help us improve the ONE MSU ecosystem.</p>
          </div>
          <button onClick={() => setView('dashboard')} className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all hover:scale-110">
            <X size={24} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 sticky top-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <MessageSquare size={20} className="text-amber-500" /> 
                Submit Feedback
              </h3>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">Your suggestions directly influence the future of this platform. We review every submission.</p>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!user || !feedbackText.trim()) return;
                  fetch('/api/feedbacks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, content: feedbackText.trim() })
                  })
                    .then((r) => r.json())
                    .then((res) => {
                      if (res.success) {
                        setFeedbacks((prev) => [res.item, ...prev]);
                        setFeedbackText('');
                      }
                    });
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Your Message</label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all min-h-[150px] resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!user || !feedbackText.trim()}
                  className="w-full py-4 rounded-2xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Feedback
                </button>
              </form>
            </div>
          </div>

          <div className="md:col-span-1 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Recent Submissions</h4>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-500">All</span>
                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-500">My Feedback</span>
              </div>
            </div>

            {feedbacks.map((f) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={f.id} 
                className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Anonymous MSUan</div>
                      <div className="text-[10px] text-gray-500">{new Date(f.timestamp).toLocaleDateString()} • {new Date(f.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${f.id % 3 === 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                    {f.id % 3 === 0 ? 'Resolved' : 'Pending'}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{f.content}</p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4">
                  <button className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                    <Heart size={12} /> Helpful
                  </button>
                  <button className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                    <MessageCircle size={12} /> Comment
                  </button>
                </div>
              </motion.div>
            ))}
            {feedbacks.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Info className="mx-auto mb-4 text-gray-600" size={40} />
                <p className="text-gray-500">No feedback submissions yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNewsfeed = () => {
    const isDM = activeRoom.startsWith('dm-');
    const feedRoom = isDM ? activeRoom : (newsfeedCampusSlug === 'all' ? 'newsfeed-all' : `newsfeed-${newsfeedCampusSlug}`);
    const feedLabel = isDM 
      ? 'Direct Message' 
      : (newsfeedCampusSlug === 'all' ? 'All Campuses' : (CAMPUSES.find(c => c.slug === newsfeedCampusSlug)?.name || 'Campus'));

    return (
      <div className="min-h-screen bg-[#0a0502] text-gray-200 p-6 md:p-12 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div className="min-w-0">
              <h2 className="text-3xl font-bold text-metallic-gold truncate">{isDM ? 'Chat' : 'Newsfeed'}</h2>
              <p className="text-xs text-gray-500 mt-1 truncate">{isDM ? 'Private Conversation' : `${feedLabel} updates`}</p>
            </div>
            <div className="flex items-center gap-3">
              {!isDM && (
                <select
                  value={newsfeedCampusSlug}
                  onChange={(e) => setNewsfeedCampusSlug(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  <option value="all" className="bg-[#0a0502]">All Campuses</option>
                  {CAMPUSES.map(c => (
                    <option key={c.slug} value={c.slug} className="bg-[#0a0502]">{c.name}</option>
                  ))}
                </select>
              )}
              <button onClick={() => setView(isDM ? 'messenger' : 'dashboard')} className="text-gray-500 hover:text-white"><X /></button>
            </div>
          </header>
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-900/40 flex items-center justify-center text-amber-500 font-black text-lg border border-amber-500/20 shadow-inner">
                  {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-2xl" /> : (user?.name?.[0] || 'U')}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{isDM ? 'Send a Message' : 'Post an Update'}</h3>
                  <p className="text-xs text-gray-500 font-medium">{isDM ? 'Type your message below' : `Share an update to ${feedLabel}`}</p>
                </div>
              </div>
              <textarea
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                placeholder={isDM ? "Type a message..." : "What's new?"}
                rows={3}
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all resize-none mb-4 placeholder:text-gray-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    if (!user || !updateText.trim()) return;
                    setPostingUpdate(true);
                    try {
                      const content = updateText.trim();
                      const roomId = feedRoom;
                      const clientId = `${isDM ? 'dm' : 'newsfeed'}-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

                      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                        socketRef.current.send(JSON.stringify({
                          type: 'chat',
                          clientId,
                          senderId: user.id,
                          senderName: user.name || 'ONEMSU',
                          content,
                          roomId
                        }));
                        setUpdateText('');
                        setNewsfeedRefreshTick(t => t + 1);
                      } else {
                        const res = await fetch('/api/messages', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            senderId: user.id,
                            senderName: user.name || 'ONEMSU',
                            content,
                            roomId
                          })
                        }).then(r => r.json());
                        if (res.success) {
                          setUpdateText('');
                          setNewsfeedRefreshTick(t => t + 1);
                        }
                      }
                    } finally {
                      setPostingUpdate(false);
                    }
                  }}
                  disabled={!updateText.trim() || postingUpdate}
                  className="px-6 py-2.5 rounded-xl btn-primary-glow font-bold disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {postingUpdate ? 'Sending...' : (isDM ? 'Send Message' : 'Post Update')}
                </button>
              </div>
            </div>
            <div className="glass-card p-6 rounded-3xl">
              <h4 className="font-black mb-6 flex items-center gap-2 text-white">
                {isDM ? <MessageCircle size={20} className="text-amber-500" /> : <MessageSquare size={20} className="text-amber-500" />}
                {isDM ? 'Conversation' : feedLabel}
              </h4>
              <Feed room={feedRoom} refreshTick={newsfeedRefreshTick} sort={isDM ? 'asc' : 'desc'} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Feed = ({ room, refreshTick, sort = 'desc' }: { room: string; refreshTick?: number; sort?: 'asc' | 'desc' }) => {
    const [items, setItems] = useState<Message[]>([]);
    const [expandedFeedComments, setExpandedFeedComments] = useState<Record<string, boolean>>({});
    const isDM = room.startsWith('dm-');

    useEffect(() => {
      const qp = user?.id ? `userId=${encodeURIComponent(String(user.id))}&` : '';
      fetch(`/api/messages/${encodeURIComponent(room)}?${qp}sort=${sort}`).then(r => r.json()).then(setItems);
    }, [room, refreshTick, user?.id, sort]);

    if (isDM) {
      return (
        <div className="space-y-4 pb-4">
          {items.map((m, i) => {
            const isMe = m.sender_id === user?.id;
            return (
              <div key={m.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group/msg`}>
                <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-900/40 shrink-0 border border-white/10 self-end mb-1">
                      {m.sender_avatar ? <img src={m.sender_avatar} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-amber-500">{m.sender_name[0]}</div>}
                    </div>
                  )}
                  <div className="flex flex-col space-y-1">
                    <div className={`px-4 py-2.5 rounded-[1.25rem] text-sm break-words shadow-sm transition-all ${isMe ? 'bg-amber-500 text-black font-medium rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none hover:bg-white/[0.15]'}`}>
                      {m.content}
                    </div>
                    {m.media_url && (
                      <div className={`rounded-2xl overflow-hidden border border-white/10 shadow-lg ${isMe ? 'self-end' : 'self-start'}`}>
                        <img src={m.media_url} alt="" className="max-w-xs max-h-64 object-cover" />
                      </div>
                    )}
                    <div className={`text-[10px] text-gray-500 font-bold opacity-0 group-hover/msg:opacity-100 transition-opacity px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {items.map((m, i) => (
          <div key={m.id || i} className="glass-card p-5 rounded-3xl overflow-hidden group/card transition-all duration-300">
            <div className="flex items-center gap-3 min-w-0 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-900/40 flex items-center justify-center text-amber-500 font-black text-sm shrink-0 border border-amber-500/20 shadow-inner group-hover/card:border-amber-500/40 transition-colors">
                {m.sender_name?.[0] || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate group-hover/card:text-amber-400 transition-colors">{m.sender_name}</div>
                <div className="text-[11px] text-gray-500 truncate flex items-center gap-1.5 mt-0.5">
                  {new Date(m.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <div className="text-sm md:text-base text-gray-200 leading-relaxed break-words">{m.content}</div>
            {m.media_url && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-white/5 shadow-lg">
                <img src={m.media_url} alt="" className="w-full object-cover max-h-[400px] hover:scale-105 transition-transform duration-500" />
              </div>
            )}
            
            {!isDM && (
              <>
                <div className="flex items-center justify-around p-2 text-gray-400 text-xs font-bold gap-2 border-t border-white/5 bg-white/[0.02] mt-4 -mx-5 -mb-5">
                  <button className="flex items-center gap-2 hover:bg-rose-500/10 hover:text-rose-500 px-4 py-3 rounded-xl transition-all flex-1 justify-center group/btn">
                    <Heart size={18} className="group-hover/btn:scale-110 transition-transform" />
                    <span>Like</span>
                  </button>
                  <button 
                    onClick={() => setExpandedFeedComments(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                    className="flex items-center gap-2 hover:bg-amber-500/10 hover:text-amber-500 px-4 py-3 rounded-xl transition-all flex-1 justify-center group/btn"
                  >
                    <MessageCircle size={18} className="group-hover/btn:scale-110 transition-transform" />
                    <span>Comment</span>
                  </button>
                </div>
                {expandedFeedComments[m.id] && (
                  <div className="mt-6">
                    <PostComments postId={m.id} />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-16 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <MessageSquare className="mx-auto mb-4 text-gray-700 animate-pulse" size={40} />
            <p className="text-gray-500 font-medium">No messages yet.</p>
          </div>
        )}
      </div>
    );
  };

  const PostComments = ({ postId }: { postId: number | string }) => {
    const [comments, setComments] = useState<Message[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const roomId = `post-${postId}`;

    useEffect(() => {
      fetch(`/api/messages/${roomId}?sort=asc`).then(r => r.json()).then(setComments);
    }, [postId]);

    const submitComment = async () => {
      if (!user || !newComment.trim()) return;
      setLoading(true);
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          senderName: user.name || 'Anonymous',
          content: newComment.trim(),
          roomId
        })
      }).then(r => r.json());
      
      if (res.success) {
        setComments(prev => [...prev, res.item]);
        setNewComment('');
      }
      setLoading(false);
    };

    return (
      <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-900/40 flex items-center justify-center text-amber-500 font-black text-xs shrink-0 border border-amber-500/20 shadow-inner">
                {c.sender_name[0]}
              </div>
              <div className="flex-1 min-w-0 bg-white/5 rounded-2xl rounded-tl-none p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-white">{c.sender_name}</span>
                  <span className="text-[10px] text-gray-500">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 items-center mt-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-900/40 flex items-center justify-center text-amber-500 font-black text-xs shrink-0 border border-amber-500/20 shadow-inner">
            {user?.name?.[0] || 'U'}
          </div>
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-gray-500"
            onKeyDown={(e) => e.key === 'Enter' && submitComment()}
          />
          <button
            onClick={submitComment}
            disabled={loading || !newComment.trim()}
            className="p-2.5 rounded-xl btn-primary-glow disabled:opacity-50 flex items-center justify-center"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    );
  };

  const renderMessenger = () => {
    if (!user) return null;
    const currentDM = directMessageList.find(dm => dm.roomId === activeRoom);

    return (
      <div className="h-screen w-full bg-[#0a0502] text-gray-200 flex overflow-hidden">
        {/* Sidebar - Conversation List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col shrink-0 bg-[#0f0b0a]/95 backdrop-blur-xl">
          <div className="p-6 pb-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white tracking-tight">Chats</h2>
              <button onClick={() => setView('dashboard')} className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>
            
            {/* Search within chats */}
            <div className="relative group mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search Messenger" 
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
            {directMessageList.map((dm) => (
              <button
                key={dm.roomId}
                onClick={() => setActiveRoom(dm.roomId)}
                className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all group relative ${activeRoom === dm.roomId ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-900/40 border-2 border-[#1a1310] overflow-hidden shadow-lg">
                    {dm.partner.avatar ? <img src={dm.partner.avatar} className="w-full h-full object-cover" /> : (dm.partner.name?.[0] || 'U')}
                  </div>
                  <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#1a1310] rounded-full shadow-sm" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-sm font-bold text-white truncate">{dm.partner.name}</span>
                    <span className="text-[10px] text-gray-500 font-medium">4:20 PM</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${activeRoom === dm.roomId ? 'text-amber-500/80 font-medium' : 'text-gray-500'}`}>
                      {dm.lastMessage || 'Start a conversation'}
                    </p>
                    {activeRoom !== dm.roomId && <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
                  </div>
                </div>
              </button>
            ))}
            
            {directMessageList.length === 0 && (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-gray-600 mx-auto mb-4 border border-dashed border-white/10">
                  <MessageCircle size={32} />
                </div>
                <p className="text-sm font-bold text-gray-500">No chats yet</p>
                <p className="text-xs text-gray-600 mt-2">Find MSUans in the dashboard to start chatting</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-[#0a0502] relative">
          {activeRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 px-6 border-b border-white/5 flex items-center justify-between bg-[#0a0502]/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative cursor-pointer" onClick={() => { setProfileData(currentDM?.partner); setView('timeline'); }}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-900/40 border border-white/10 overflow-hidden">
                      {currentDM?.partner.avatar ? <img src={currentDM.partner.avatar} className="w-full h-full object-cover" /> : (currentDM?.partner.name?.[0] || 'U')}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0a0502] rounded-full" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-white truncate hover:text-amber-500 transition-colors cursor-pointer" onClick={() => { setProfileData(currentDM?.partner); setView('timeline'); }}>
                      {currentDM?.partner.name}
                    </h3>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active Now</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2.5 rounded-xl hover:bg-white/5 text-amber-500 transition-all"><Phone size={18} /></button>
                  <button className="p-2.5 rounded-xl hover:bg-white/5 text-amber-500 transition-all"><Video size={18} /></button>
                  <button className="p-2.5 rounded-xl hover:bg-white/5 text-amber-500 transition-all"><Info size={18} /></button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide flex flex-col">
                <div className="flex-1" /> {/* Spacer */}
                
                {/* Profile Snapshot in Chat */}
                <div className="flex flex-col items-center py-12 space-y-3">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-900/40 border-4 border-white/5 overflow-hidden shadow-2xl">
                    {currentDM?.partner.avatar ? <img src={currentDM.partner.avatar} className="w-full h-full object-cover" /> : (currentDM?.partner.name?.[0] || 'U')}
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-black text-white">{currentDM?.partner.name}</h4>
                    <p className="text-sm text-gray-500 font-medium">{currentDM?.partner.campus || 'MSU System'}</p>
                    <p className="text-xs text-gray-600 mt-1 max-w-xs mx-auto italic">You're friends on ONEMSU</p>
                  </div>
                  <button 
                    onClick={() => { setProfileData(currentDM?.partner); setView('timeline'); }}
                    className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/10 transition-all mt-4"
                  >
                    View Profile
                  </button>
                </div>

                <div className="space-y-4">
                  <Feed room={activeRoom} sort="asc" />
                </div>
              </div>

              {/* Message Input Area */}
              <div className="p-4 px-6 border-t border-white/5 bg-[#0a0502]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <button className="p-2 rounded-xl hover:bg-white/5 text-amber-500 transition-all"><PlusCircle size={20} /></button>
                    <button className="p-2 rounded-xl hover:bg-white/5 text-amber-500 transition-all"><Image size={20} /></button>
                    <button className="p-2 rounded-xl hover:bg-white/5 text-amber-500 transition-all"><Mic size={20} /></button>
                  </div>
                  
                  <div className="flex-1 relative">
                    <input 
                      type="text"
                      value={updateText}
                      onChange={(e) => setUpdateText(e.target.value)}
                      placeholder="Aa"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && updateText.trim()) {
                          // Existing logic to send message
                          const content = updateText.trim();
                          const roomId = activeRoom;
                          const clientId = `dm-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

                          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                            socketRef.current.send(JSON.stringify({
                              type: 'chat',
                              clientId,
                              senderId: user.id,
                              senderName: user.name || 'ONEMSU',
                              content,
                              roomId
                            }));
                            setUpdateText('');
                          }
                        }
                      }}
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:scale-110 transition-transform">
                      <Smile size={18} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (!updateText.trim()) return;
                      const content = updateText.trim();
                      const roomId = activeRoom;
                      const clientId = `dm-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

                      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                        socketRef.current.send(JSON.stringify({
                          type: 'chat',
                          clientId,
                          senderId: user.id,
                          senderName: user.name || 'ONEMSU',
                          content,
                          roomId
                        }));
                        setUpdateText('');
                      }
                    }}
                    className={`p-2.5 rounded-xl transition-all ${updateText.trim() ? 'btn-primary-glow scale-110' : 'text-amber-500 hover:bg-white/5'}`}
                  >
                    {updateText.trim() ? <Send size={18} /> : <ThumbsUp size={20} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
              <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 to-amber-900/20 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_50px_rgba(185,151,64,0.1)]">
                <MessageCircle size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">Select a Conversation</h3>
                <p className="text-gray-500 max-w-sm text-sm font-medium leading-relaxed">
                  Start a new conversation with your MSU classmates or continue where you left off.
                </p>
              </div>
              <button 
                onClick={() => setView('dashboard')}
                className="px-8 py-3 rounded-2xl btn-primary-glow font-bold text-sm"
              >
                Find People
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    const profile = profileData || user;
    if (!user || !profile) return null;

    const updateMedia = async (field: 'avatar' | 'cover_photo' | 'background_url', file: File) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const up = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl })
        }).then(r => r.json());
        if (!up.success) return;
        const res = await fetch(`/api/profile/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: up.url })
        }).then(r => r.json());
        if (res.success) {
          setUser(res.user);
          setProfileData(res.user);
        }
      };
      reader.readAsDataURL(file);
    };

    const posts = timelinePosts;

    return (
      <div className="min-h-screen bg-[#0a0502] text-gray-200" style={profile.background_url ? { backgroundImage: `url(${profile.background_url})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' } : {}}>
        <div className={`max-w-5xl mx-auto pb-20 ${profile.background_url ? 'bg-black/60 backdrop-blur-md min-h-screen' : ''}`}>
          {/* Cover Photo Section */}
          <div className="relative h-72 md:h-96 rounded-b-[3rem] overflow-hidden border-b border-white/10 shadow-2xl">
            {profile.cover_photo ? (
              <img src={profile.cover_photo} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full hero-metallic" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0502] via-black/40 to-transparent" />
            
            {/* Top Navigation */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
              <button onClick={() => setView('dashboard')} className="p-3 rounded-2xl glass-surface text-white hover:bg-white/10 transition-all hover:scale-105">
                <ChevronLeft size={20} />
              </button>
            </div>
            <div className="absolute top-6 right-6 flex items-center gap-3">
              {user.id === profile.id && (
                <>
                  <button onClick={() => document.getElementById('timeline-bg-upload')?.click()} className="px-4 py-2.5 rounded-2xl glass-surface text-xs font-bold hover:bg-white/10 transition-all text-amber-400 flex items-center gap-2">
                    <Image size={14} /> Background
                  </button>
                  <button onClick={() => document.getElementById('timeline-cover-upload')?.click()} className="px-4 py-2.5 rounded-2xl glass-surface text-xs font-bold hover:bg-white/10 transition-all text-white flex items-center gap-2">
                    <Camera size={14} /> Cover
                  </button>
                </>
              )}
              <input id="timeline-bg-upload" type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) updateMedia('background_url', file); }} />
              <input id="timeline-cover-upload" type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) updateMedia('cover_photo', file); }} />
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="px-6 md:px-12 -mt-24 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                <div className="relative group">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#0f1016] border-4 border-[#0a0502] overflow-hidden shadow-2xl ring-2 ring-amber-500/20">
                    <button onClick={() => user.id === profile.id && document.getElementById('timeline-avatar-upload')?.click()} className="w-full h-full relative">
                      {profile.avatar ? (
                        <img src={profile.avatar} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-amber-500 font-black text-5xl bg-gradient-to-br from-amber-500/20 to-amber-900/40">
                          {(profile.name || 'U')[0]}
                        </div>
                      )}
                      {user.id === profile.id && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={24} className="text-white" />
                        </div>
                      )}
                    </button>
                  </div>
                  <input id="timeline-avatar-upload" type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) updateMedia('avatar', file); }} />
                </div>
                
                <div className="pb-2 md:pb-4">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{profile.name || 'MSUan'}</h1>
                    {isVerified(profile.email) && <ShieldCheck size={24} className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
                  </div>
                  <div className="text-sm font-medium text-amber-500/80 flex items-center justify-center md:justify-start gap-1.5">
                    <MapPin size={14} />
                    {profile.campus || 'MSU System'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3 pb-2 md:pb-4">
                {user.id === profile.id ? (
                  <button onClick={() => setView('profile')} className="px-6 py-3 rounded-2xl glass-surface text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                    <Edit size={16} /> Edit Profile
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => toggleFollow(profile.id)}
                      className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${isFollowing ? 'glass-surface text-gray-300 hover:bg-white/10' : 'btn-primary-glow'}`}
                    >
                      {isFollowing ? <Check size={16} /> : <Plus size={16} />}
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button 
                      onClick={() => {
                        setActiveRoom(`dm-${Math.min(user.id, profile.id)}-${Math.max(user.id, profile.id)}`);
                        setView('messenger');
                      }}
                      className="p-3 rounded-2xl glass-surface text-white hover:bg-white/10 transition-all"
                    >
                      <MessageCircle size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-2xl mx-auto md:mx-0">
              <div className="glass-card rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-white mb-1">{profile.posts_count || 0}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Posts</div>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-white mb-1">{profile.following_count || 0}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Following</div>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-white mb-1">{profile.followers_count || 0}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Followers</div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - About */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card rounded-3xl p-6">
                  <h3 className="text-sm font-black text-white mb-6 flex items-center gap-2">
                    <Info size={16} className="text-amber-500" /> About
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-gray-400 text-xs font-medium">Student ID</span>
                      <span className="font-bold text-white">{profile.student_id || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-gray-400 text-xs font-medium">Program</span>
                      <span className="font-bold text-white text-right max-w-[60%] truncate">{profile.program || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-gray-400 text-xs font-medium">Year Level</span>
                      <span className="font-bold text-white">{profile.year_level || 'N/A'}</span>
                    </div>
                    {profile.bio && (
                      <div className="pt-4 mt-2 border-t border-white/10">
                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Bio</div>
                        <p className="text-gray-300 leading-relaxed italic">"{profile.bio}"</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-card rounded-3xl p-6">
                  <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                    <Shield size={16} className="text-amber-500" /> Digital ID
                  </h3>
                  <button onClick={downloadDigitalId} className="w-full py-3.5 rounded-xl btn-primary-glow font-bold flex items-center justify-center gap-2 text-sm">
                    <Download size={16} />
                    Download ID Card
                  </button>
                </div>
              </div>

              {/* Right Column - Posts */}
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                  <Clock size={20} className="text-amber-500" /> Timeline
                </h3>
                {posts.map((post) => (
                  <div key={post.id} className="glass-card rounded-3xl overflow-hidden group/post transition-all duration-300">
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-900/40 border border-amber-500/20 overflow-hidden flex items-center justify-center text-amber-400 font-black text-lg shadow-inner">
                            {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : (profile.name || 'U')[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="text-base font-bold text-white truncate group-hover/post:text-amber-400 transition-colors">{profile.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                              <span className="text-amber-500/70 font-medium">{post.campus}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-600" />
                              {new Date(post.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.id === profile.id && (
                            <button
                              onClick={async () => {
                                if (!confirm('Delete this post?')) return;
                                try {
                                  const res = await fetch(`/api/freedomwall/${post.id}`, {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' }
                                  }).then(r => r.json());
                                  if (res.success) {
                                    setTimelinePosts(prev => prev.filter(p => p.id !== post.id));
                                  }
                                } catch (e) { console.error(e); }
                              }}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          )}
                          <div className="text-[11px] text-gray-500 flex items-center gap-2">
                            <Clock size={14} />
                            {post.timestamp ? new Date(post.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Just now'}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-200 leading-relaxed mb-4">{post.content}</div>
                      {post.image_url && (
                        <div className="rounded-2xl overflow-hidden border border-white/10 mb-4">
                          <img src={post.image_url} className="w-full max-h-[520px] object-cover" />
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-gray-500 border-t border-white/10 pt-4">
                        <button className="flex items-center gap-1 hover:text-rose-500 transition-colors">
                          <Heart size={14} /> {post.likes || 0}
                        </button>
                        <button className="flex items-center gap-1 hover:text-amber-500 transition-colors">
                          <MessageCircle size={14} /> {post.comment_count || 0}
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                          <Share2 size={14} /> {post.shares || 0}
                        </button>
                      </div>

                      <PostComments postId={post.id} />
                    </div>
                  </div>
                ))}
                {posts.length === 0 && (
                  <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <Sparkles className="mx-auto mb-4 text-gray-600" size={40} />
                    <p className="text-gray-500">No posts yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLive = () => {
    if (!user) return null;
    const campusSlug = CAMPUSES.find(c => c.name === user.campus)?.slug || 'all';
    const roomId = `live-global`; // Use a global room for all users
    const remote = Array.from(remoteStreams.entries());

    return (
      <div className="min-h-screen bg-[#0a0502] text-gray-200 p-6 md:p-12 overflow-y-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto pb-24">
          <header className="flex items-center justify-between gap-4 mb-8">
            <div className="min-w-0">
              <h2 className="text-4xl font-black text-white tracking-tight">Live Broadcast</h2>
              <p className="text-gray-500 text-sm mt-1 truncate font-medium">Connect with MSUans across all campuses</p>
            </div>
            <button onClick={() => setView('dashboard')} className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
              <X size={22} />
            </button>
          </header>

          <div className="flex flex-wrap items-center gap-3 mb-8">
            {!isInVoice ? (
              <button 
                onClick={() => {
                  if (activeRoom !== roomId) setActiveRoom(roomId);
                  joinVoiceChannel(true, roomId);
                }} 
                className="px-8 py-3 rounded-2xl bg-amber-500 text-black font-black flex items-center gap-2 hover:bg-amber-400 transition-all shadow-lg shadow-amber-900/20"
              >
                <Video size={20} />
                Start Live
              </button>
            ) : (
              <button onClick={leaveVoiceChannel} className="px-8 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 font-black flex items-center gap-2 hover:bg-rose-500/20 transition-all">
                <PhoneOff size={20} />
                Stop Live
              </button>
            )}
            <div className="h-10 w-px bg-white/10 mx-2" />
            <button 
              onClick={toggleMic} 
              disabled={!isInVoice} 
              className={`p-3 rounded-2xl border transition-all ${!isInVoice ? 'opacity-20 cursor-not-allowed bg-white/5 border-white/10' : micOn ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'}`}
              title={micOn ? 'Mute' : 'Unmute'}
            >
              {micOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button 
              onClick={toggleCamera} 
              disabled={!isInVoice} 
              className={`p-3 rounded-2xl border transition-all ${!isInVoice ? 'opacity-20 cursor-not-allowed bg-white/5 border-white/10' : cameraOn ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'}`}
              title={cameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
            >
              {cameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
            <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-[#120d0b] shadow-2xl group transition-all">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-xs border border-amber-500/20">
                    {user.name?.[0] || 'U'}
                  </div>
                  <div className="text-sm font-black text-white">{user.name} (You)</div>
                </div>
                <div className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${isInVoice ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
                  {isInVoice ? 'Live' : 'Offline'}
                </div>
              </div>
              <div className="aspect-video bg-black flex items-center justify-center relative group-hover:bg-[#0a0a0a] transition-colors">
                <video ref={localVideoRef} className="w-full h-full object-cover" playsInline autoPlay muted />
                {!isInVoice && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-sm">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                      <CameraOff size={24} />
                    </div>
                    <span className="text-gray-400 text-sm font-medium">Click "Start Live" to broadcast</span>
                  </div>
                )}
                {isInVoice && !cameraOn && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-md">
                     <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-2xl">
                       {user.name?.[0] || 'U'}
                     </div>
                     <span className="text-amber-500 text-sm font-black uppercase tracking-widest">Camera Off</span>
                   </div>
                )}
              </div>
            </div>
            {remote.map(([uid, stream]) => (
              <div key={uid} className="rounded-[2rem] overflow-hidden border border-white/10 bg-[#120d0b] shadow-2xl group transition-all">
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-xs border border-amber-500/20">
                      ?
                    </div>
                    <div className="text-sm font-black text-white">MSUan #{String(uid).substring(0, 4)}</div>
                  </div>
                  <div className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-black uppercase tracking-widest animate-pulse">
                    Live
                  </div>
                </div>
                <div className="aspect-video bg-black relative">
                  <video
                    className="w-full h-full object-cover"
                    playsInline
                    autoPlay
                    ref={(el) => {
                      if (!el) return;
                      (el as any).srcObject = stream;
                      el.play().catch(() => {});
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderReels = () => {
    if (!user) return null;
    const items = reelMessages.filter(m => String(m.media_type || '').startsWith('video/'));

    return (
      <div className="min-h-screen bg-[#0a0502] text-gray-200">
        <div className="max-w-2xl mx-auto">
          <header className="p-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-white">Reels</h2>
              <p className="text-xs text-gray-500">Vertical video feed</p>
            </div>
            <button onClick={() => setView('dashboard')} className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
              <X size={22} />
            </button>
          </header>

          <div className="px-6 pb-6">
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <input
                  value={reelCaption}
                  onChange={(e) => setReelCaption(e.target.value)}
                  placeholder="Caption..."
                  className="flex-1 bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50"
                />
                <label className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-black text-gray-300 hover:bg-white/10 cursor-pointer transition-colors flex items-center justify-center gap-2">
                  <Video size={18} className="text-amber-400" />
                  {reelUploading ? 'Uploading...' : 'Upload Video'}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    disabled={reelUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setReelUploading(true);
                      try {
                        const dataUrl = await new Promise<string>((resolve, reject) => {
                          const reader = new FileReader();
                          reader.onload = () => resolve(String(reader.result));
                          reader.onerror = () => reject(new Error('read failed'));
                          reader.readAsDataURL(file);
                        });
                        const up = await fetch('/api/upload', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ dataUrl })
                        }).then(r => r.json());
                        if (!up.success) return;

                        const roomId = 'reels';
                        const clientId = `reels-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                        const optimistic = {
                          id: `temp-${clientId}`,
                          clientId,
                          sender_id: user.id,
                          sender_name: user.name,
                          content: reelCaption.trim(),
                          room_id: roomId,
                          media_url: up.url,
                          media_type: file.type || 'video/mp4',
                          timestamp: new Date().toISOString(),
                          reaction_count: 0,
                          user_reaction: null
                        };
                        setReelMessages(prev => [...prev, optimistic]);
                        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                          socketRef.current.send(JSON.stringify({
                            type: 'chat',
                            clientId,
                            senderId: user.id,
                            senderName: user.name,
                            content: reelCaption.trim(),
                            roomId,
                            mediaUrl: up.url,
                            mediaType: file.type || 'video/mp4'
                          }));
                        } else {
                          await fetch('/api/messages', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              senderId: user.id,
                              senderName: user.name,
                              content: reelCaption.trim(),
                              roomId,
                              mediaUrl: up.url,
                              mediaType: file.type || 'video/mp4'
                            })
                          });
                          setTimeout(() => {
                            safeFetch(`/api/messages/reels?userId=${encodeURIComponent(String(user.id))}&limit=50`).then((data: any) => {
                              if (Array.isArray(data)) setReelMessages(data);
                            });
                          }, 400);
                        }
                        setReelCaption('');
                      } finally {
                        setReelUploading(false);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </label>
              </div>
              <p className="text-[11px] text-gray-500 mt-3">Short clips work best. Large videos may fail to upload.</p>
            </div>
          </div>

          <div className="h-[calc(100vh-260px)] overflow-y-auto snap-y snap-mandatory">
            {items.map((m: any) => (
              <div key={String(m.id)} className="h-[calc(100vh-260px)] snap-start flex items-center justify-center px-6 pb-6">
                <div className="w-full rounded-3xl overflow-hidden border border-white/10 bg-black/40 relative">
                  <video src={m.media_url} className="w-full h-[calc(100vh-260px)] object-cover" controls playsInline />
                  <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                    <div className="text-sm font-black text-white">{m.sender_name}</div>
                    {m.content && <div className="text-sm text-gray-200 mt-1">{m.content}</div>}
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        onClick={() => {
                          const liked = !!m.user_reaction;
                          fetch(`/api/messages/${m.id}/react`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: user.id, reaction: liked ? '' : '❤️' })
                          }).then(r => r.json()).then(res => {
                            if (!res?.success) return;
                            setReelMessages(prev => prev.map(x => x.id === m.id ? { ...x, reaction_count: res.reaction_count, user_reaction: res.user_reaction } : x));
                          });
                        }}
                        className={`px-4 py-2 rounded-2xl border text-sm font-black ${m.user_reaction ? 'bg-rose-500/10 border-rose-500/25 text-rose-300' : 'bg-white/5 border-white/10 text-gray-200'}`}
                      >
                        ❤️ {m.reaction_count || 0}
                      </button>
                      <button onClick={() => setView('newsfeed')} className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-sm font-black text-gray-200">
                        Updates
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="h-[calc(100vh-260px)] flex items-center justify-center text-gray-500">
                No videos yet.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ProfileForm = ({ user, onSaved }: { user: User | null; onSaved: (u: User) => void }) => {
    const [form, setForm] = useState({
      name: user?.name || '',
      campus: user?.campus || '',
      avatar: user?.avatar || '',
      student_id: '',
      program: '',
      year_level: '',
      department: '',
      bio: '',
      cover_photo: ''
    });
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<number | null>(null);
    useEffect(() => {
      if (user) {
        fetch(`/api/profile/${user.id}?viewerId=${user.id}`).then(r => r.json()).then((res) => {
          if (res.success) setForm((prev) => ({
            ...prev,
            name: res.user.name ?? '',
            campus: res.user.campus ?? '',
            avatar: res.user.avatar ?? '',
            student_id: res.user.student_id ?? '',
            program: res.user.program ?? '',
            year_level: res.user.year_level ?? '',
            department: res.user.department ?? '',
            bio: res.user.bio ?? '',
            cover_photo: res.user.cover_photo ?? ''
          }));
        });
      }
    }, [user]);
    const save = async (e?: FormEvent) => {
      if (e) e.preventDefault();
      if (!user) return;
      setSaving(true);
      const res = await fetch(`/api/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      }).then(r => r.json());
      setSaving(false);
      if (res.success) {
        onSaved(res.user);
        setSavedAt(Date.now());
        setTimeout(() => setSavedAt(null), 2000);
      }
    };
    return (
      <form className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6" onSubmit={save}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Edit Your Profile</h3>
          <button type="button" onClick={() => onSaved(user!)} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div 
                className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-2xl overflow-hidden ring-2 ring-amber-500/30 relative group/avatar cursor-pointer"
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                {form.avatar ? <img src={form.avatar} alt="" className="w-full h-full object-cover" /> : (form.name || 'U')[0]}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                  Change
                </div>
              </div>
              <input 
                id="avatar-upload"
                type="file" 
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  // Convert to base64
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    const dataUrl = ev.target?.result as string;
                    try {
                      const res = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ dataUrl })
                      }).then(r => r.json());
                      
                      if (res.success) {
                        setForm(prev => ({ ...prev, avatar: res.url }));
                      }
                    } catch (err) {
                      console.error('Upload failed', err);
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <div className="flex-1">
                <Input label="Display Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Campus</div>
            <select 
              value={form.campus} 
              onChange={(e) => setForm({ ...form, campus: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
            >
              <option value="" disabled className="bg-[#0a0502]">Select your campus</option>
              {CAMPUSES.map(c => (
                <option key={c.slug} value={c.name} className="bg-[#0a0502]">{c.name}</option>
              ))}
            </select>
          </div>
          <Input label="Student ID" value={form.student_id} onChange={(v) => setForm({ ...form, student_id: v })} />
          <Input label="Course / Program" value={form.program} onChange={(v) => setForm({ ...form, program: v })} />
          <Input label="Year Level" value={form.year_level} onChange={(v) => setForm({ ...form, year_level: v })} />
          <Input label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} />
          <div className="md:col-span-2">
            <Textarea label="Bio / Intro" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} />
          </div>
          
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Avatar Image URL" value={form.avatar} onChange={(v) => setForm({ ...form, avatar: v })} />
            <Input label="Cover Image URL" value={form.cover_photo} onChange={(v) => setForm({ ...form, cover_photo: v })} />
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              type="submit" 
              disabled={saving} 
              className={`px-8 py-3 rounded-xl bg-amber-500 text-black font-bold transition-all shadow-lg shadow-amber-900/20 ${saving ? 'opacity-60 cursor-not-allowed scale-95' : 'hover:bg-amber-400 hover:scale-105 active:scale-95'}`}
            >
              {saving ? 'Saving Changes...' : 'Save Profile'}
            </button>
            {savedAt && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="text-sm text-emerald-400 font-medium flex items-center gap-1"
              >
                <ShieldCheck size={16} /> All changes saved!
              </motion.span>
            )}
          </div>
          <button 
            type="button"
            onClick={() => onSaved(user!)} 
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };
  
  const Input = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div>
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
    </div>
  );
  const Textarea = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="md:col-span-2">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
    </div>
  );
  const [profileData, setProfileData] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const toggleFollow = async (targetId: number) => {
    if (!user) return;
    const res = await fetch('/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followerId: user.id, followingId: targetId })
    }).then(r => r.json());

    if (res.success) {
      setIsFollowing(res.following);
      // Refresh profile data to get updated counts
      fetch(`/api/profile/${targetId}`).then(r => r.json()).then(res => {
        if (res.success) setProfileData(res.user);
      });
    }
  };
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const [tempCover, setTempCover] = useState<string | null>(null);

  useEffect(() => {
    if (user && (view === 'profile' || view === 'timeline') && profileData?.id) {
      fetch(`/api/profile/${profileData.id}?viewerId=${user.id}`).then(r => r.json()).then(res => {
        if (res.success) {
          setProfileData(res.user);
          setIsFollowing(!!res.user.isFollowing);
        }
      });
    } else if (user && view === 'profile') {
      fetch(`/api/profile/${user.id}?viewerId=${user.id}`).then(r => r.json()).then(res => {
        if (res.success) {
          setProfileData(res.user);
          setIsFollowing(false); // Can't follow yourself
        }
      });
    }
  }, [user, view, profileData?.id]);

  const idCardRef = useRef<HTMLDivElement | null>(null);

  const downloadDigitalId = async () => {
    const profile = profileData || user;
    if (!profile) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 760;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#0d0d0d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#d4a32a';
    ctx.fillRect(0, 0, canvas.width, 140);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 42px Arial';
    ctx.fillText('MINDANAO STATE UNIVERSITY', 36, 70);
    ctx.font = 'bold 24px Arial';
    ctx.fillText('SYSTEM DIGITAL ID', 36, 108);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px Arial';
    ctx.fillText((profile.name || 'Student Name').toUpperCase(), 320, 255);
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#d4a32a';
    ctx.fillText(`Student ID: ${profile.student_id || 'N/A'}`, 320, 315);
    ctx.fillStyle = '#fff';
    ctx.fillText(`Program: ${profile.program || 'N/A'}`, 320, 365);
    ctx.fillText(`Year Level: ${profile.year_level || 'N/A'}`, 320, 415);
    ctx.fillText(`Campus: ${profile.campus || 'N/A'}`, 320, 465);

    ctx.fillStyle = 'rgba(212,163,42,0.2)';
    ctx.fillRect(36, 180, 240, 280);
    ctx.fillStyle = '#d4a32a';
    ctx.font = 'bold 30px Arial';
    ctx.fillText((profile.name || 'U')[0].toUpperCase(), 140, 330);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${(profile.name || 'onemsu').replace(/\s+/g, '-').toLowerCase()}-digital-id.png`;
    link.click();
  };

  const renderProfile = () => {
    const profile = profileData || user;

    const settingsTabs = [
      { id: 'account' as const, label: 'Account', icon: <UserIcon size={18} />, desc: 'Email and security settings' },
      { id: 'profile' as const, label: 'Profile Information', icon: <Globe size={18} />, desc: 'Your campus and academic info' },
      { id: 'privacy' as const, label: 'Privacy & Security', icon: <ShieldCheck size={18} />, desc: 'Control your experience' },
      { id: 'id' as const, label: 'Digital ID', icon: <Download size={18} />, desc: 'View and download your ID' },
    ];

    return (
      <div className="h-full w-full bg-[#0a0502] text-gray-200 flex overflow-hidden">
        {/* Settings Sidebar */}
        <div className="hidden md:flex md:w-64 bg-[#1a1310] border-r border-amber-500/20 p-6 flex-col overflow-y-auto">
          <div className="flex items-center gap-2 font-bold text-lg mb-8 text-amber-500">
            <Settings size={20} />
            <span className="text-white">Settings</span>
          </div>

          <nav className="space-y-2 flex-1">
            {settingsTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSettingsTab(tab.id)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  settingsTab === tab.id
                    ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className={settingsTab === tab.id ? 'text-amber-500' : 'text-gray-500'}>{tab.icon}</span>
                  <span className="font-bold text-sm">{tab.label}</span>
                </div>
                <p className="text-[11px] text-gray-600">{tab.desc}</p>
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Main Settings Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-4xl mx-auto p-6 md:p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400">Manage your account and preferences</p>
              </div>
              <button onClick={() => setView('dashboard')} className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>

            {/* Account Settings */}
            {settingsTab === 'account' && (
              <div className="space-y-8">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h2 className="text-xl font-bold text-white mb-6">Account</h2>
                  <p className="text-sm text-gray-400 mb-6">Real-time information and activities of your account</p>

                  {/* Profile Picture */}
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white mb-1">Profile picture</h3>
                        <p className="text-xs text-gray-500">PNG, JPEG under 15MB</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-lg overflow-hidden">
                          {profile?.avatar ? (
                            <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            (profile?.name?.[0] || 'U')
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => document.getElementById('avatar-file')?.click()}
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                          >
                            Upload new picture
                          </button>
                          <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-gray-400 hover:text-rose-400 transition-colors">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    <input
                      id="avatar-file"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !user) return;
                        const reader = new FileReader();
                        reader.onload = async () => {
                          const dataUrl = reader.result as string;
                          const res = await fetch('/api/upload', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ dataUrl })
                          }).then(r => r.json());
                          if (res.success) {
                            const upRes = await fetch(`/api/profile/${user.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ avatar: res.url })
                            }).then(r => r.json());
                            if (upRes.success) {
                              setUser(upRes.user);
                              setProfileData(upRes.user);
                            }
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </div>

                  {/* Full Name */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block font-bold">First name</label>
                      <input
                        type="text"
                        defaultValue={profile?.name?.split(' ')[0] || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value + ' ' + (profile?.name?.split(' ')[1] || '') }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block font-bold">Last name</label>
                      <input
                        type="text"
                        defaultValue={profile?.name?.split(' ')[1] || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: (profile?.name?.split(' ')[0] || '') + ' ' + e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>

                  {/* Contact Email */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-white mb-3">Contact email</h3>
                    <p className="text-xs text-gray-500 mb-3">Manage your accounts email addresses for the invoices</p>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      <input
                        type="email"
                        defaultValue={user?.email || ''}
                        disabled
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-400 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3">Password</h3>
                    <p className="text-xs text-gray-500 mb-3">Modify your current password</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Current password</label>
                        <input value={passwordCurrent} onChange={(e) => setPasswordCurrent(e.target.value)} type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">New password</label>
                        <input value={passwordNext} onChange={(e) => setPasswordNext(e.target.value)} type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="text-xs">
                        {passwordError && <span className="text-rose-400 font-bold">{passwordError}</span>}
                        {!passwordError && passwordSavedAt && <span className="text-emerald-300 font-bold">Password updated</span>}
                      </div>
                      <button
                        onClick={async () => {
                          if (!user) return;
                          setPasswordError(null);
                          if (!passwordCurrent || !passwordNext) {
                            setPasswordError('Fill in both fields');
                            return;
                          }
                          setPasswordSaving(true);
                          try {
                            const res = await fetch('/api/auth/change-password', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ userId: user.id, currentPassword: passwordCurrent, newPassword: passwordNext })
                            }).then(r => r.json());
                            if (!res?.success) {
                              setPasswordError(res?.message || 'Failed to update password');
                              return;
                            }
                            setPasswordCurrent('');
                            setPasswordNext('');
                            setPasswordSavedAt(Date.now());
                            setTimeout(() => setPasswordSavedAt(null), 2000);
                          } finally {
                            setPasswordSaving(false);
                          }
                        }}
                        disabled={passwordSaving}
                        className="px-5 py-2 rounded-xl btn-red-metallic font-bold disabled:opacity-50"
                      >
                        {passwordSaving ? 'Saving...' : 'Update Password'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Information */}
            {settingsTab === 'profile' && (
              <div className="space-y-8">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
                  <p className="text-sm text-gray-400 mb-6">Your academic and campus details</p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block font-bold">Campus</label>
                      <select
                        defaultValue={profile?.campus || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, campus: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50"
                      >
                        <option value="" className="bg-[#0a0502]">Select your campus</option>
                        {CAMPUSES.map(c => (
                          <option key={c.slug} value={c.name} className="bg-[#0a0502]">{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block font-bold">Student ID</label>
                      <input
                        type="text"
                        defaultValue={profile?.student_id || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, student_id: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block font-bold">Course / Program</label>
                      <input
                        type="text"
                        defaultValue={profile?.program || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, program: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block font-bold">Year Level</label>
                        <input
                          type="text"
                          defaultValue={profile?.year_level || ''}
                          onChange={(e) => setProfileData(prev => ({ ...prev, year_level: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block font-bold">Department</label>
                        <input
                          type="text"
                          defaultValue={profile?.department || ''}
                          onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block font-bold">Bio / Intro</label>
                      <textarea
                        defaultValue={profile?.bio || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50 resize-none"
                      />
                    </div>

                    <button
                      onClick={async () => {
                        if (!user) return;
                        const res = await fetch(`/api/profile/${user.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(profileData)
                        }).then(r => r.json());
                        if (res.success) {
                          setUser(res.user);
                          setProfileData(res.user);
                        }
                      }}
                      className="mt-6 px-6 py-3 rounded-lg bg-amber-500 text-black font-bold hover:bg-amber-400 transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Security */}
            {settingsTab === 'privacy' && (
              <div className="space-y-8">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h2 className="text-xl font-bold text-white mb-6">Privacy & Security</h2>
                  <p className="text-sm text-gray-400 mb-6">Control your experience and data</p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10">
                      <div>
                        <h3 className="text-sm font-bold text-white">Profile Visibility</h3>
                        <p className="text-xs text-gray-500 mt-1">Allow other students to see your profile</p>
                      </div>
                      <input type="checkbox" checked={userPreferences.profileVisible} onChange={(e) => setUserPreferences(prev => ({ ...prev, profileVisible: e.target.checked }))} className="w-5 h-5 rounded accent-amber-500" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10">
                      <div>
                        <h3 className="text-sm font-bold text-white">Show Online Status</h3>
                        <p className="text-xs text-gray-500 mt-1">Let others know when you're active</p>
                      </div>
                      <input type="checkbox" checked={userPreferences.onlineStatus} onChange={(e) => setUserPreferences(prev => ({ ...prev, onlineStatus: e.target.checked }))} className="w-5 h-5 rounded accent-amber-500" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10">
                      <div>
                        <h3 className="text-sm font-bold text-white">Allow Messages from Anyone</h3>
                        <p className="text-xs text-gray-500 mt-1">Receive direct messages from all users</p>
                      </div>
                      <input type="checkbox" checked={userPreferences.allowMessages} onChange={(e) => setUserPreferences(prev => ({ ...prev, allowMessages: e.target.checked }))} className="w-5 h-5 rounded accent-amber-500" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10">
                      <div>
                        <h3 className="text-sm font-bold text-white">Notifications</h3>
                        <p className="text-xs text-gray-500 mt-1">Receive email notifications</p>
                      </div>
                      <input type="checkbox" checked={userPreferences.emailNotifications} onChange={(e) => setUserPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))} className="w-5 h-5 rounded accent-amber-500" />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {prefsSavedAt && <span className="text-emerald-300 font-bold">Saved</span>}
                    </div>
                    <button
                      onClick={async () => {
                        if (!user) return;
                        setPrefsSaving(true);
                        try {
                          const res = await fetch('/api/preferences', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              userId: user.id,
                              profile_visible: userPreferences.profileVisible,
                              show_online: userPreferences.onlineStatus,
                              allow_messages: userPreferences.allowMessages,
                              email_notifications: userPreferences.emailNotifications
                            })
                          }).then(r => r.json());
                          if (res?.success) {
                            setPrefsSavedAt(Date.now());
                            setTimeout(() => setPrefsSavedAt(null), 2000);
                          }
                        } finally {
                          setPrefsSaving(false);
                        }
                      }}
                      disabled={prefsSaving}
                      className="px-6 py-2 rounded-xl btn-red-metallic font-bold disabled:opacity-50"
                    >
                      {prefsSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Digital ID */}
            {settingsTab === 'id' && (
              <div className="space-y-8">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h2 className="text-xl font-bold text-white mb-6">Your Digital Identity Card</h2>
                  <p className="text-sm text-gray-400 mb-8">Download and manage your MSU Digital ID</p>

                  {/* ID Card Preview */}
                  <motion.div
                    ref={idCardRef}
                    initial={{ rotateY: -10, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    className="w-full max-w-sm mx-auto aspect-[1.58/1] bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl border-2 border-white/10 shadow-2xl overflow-hidden relative preserve-3d mb-8"
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                      <Logo className="w-full h-full scale-150 rotate-12" />
                    </div>

                    {/* Header Strip */}
                    <div className="h-16 bg-gradient-to-r from-amber-600 to-amber-400 flex items-center px-6 justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg p-1.5 backdrop-blur-md">
                          <Logo className="w-full h-full" />
                        </div>
                        <div>
                          <h3 className="text-black font-black text-sm leading-none uppercase tracking-tighter">Mindanao State University</h3>
                          <p className="text-black/70 text-[8px] font-bold uppercase tracking-widest mt-0.5">System Digital Identity</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-black font-black text-xs uppercase tracking-widest">ONE MSU</p>
                      </div>
                    </div>

                    <div className="p-8 flex gap-8">
                      {/* Profile Picture Area */}
                      <div className="shrink-0">
                        <div className="w-32 h-32 rounded-2xl border-4 border-white/10 overflow-hidden bg-black/40 relative group/pic">
                          {profile?.avatar ? (
                            <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-amber-500/20">
                              {profile?.name?.[0] || 'M'}
                            </div>
                          )}
                        </div>
                        <div className="mt-4 text-center">
                          <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Student ID</div>
                          <div className="text-sm font-mono font-bold text-white tracking-widest">
                            {profile?.student_id || '2024-XXXX'}
                          </div>
                        </div>
                      </div>

                      {/* Info Area */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] mb-1">Full Name</div>
                          <h4 className="text-xl font-black text-white uppercase tracking-tight leading-tight mb-4">
                            {profile?.name || 'Student Name'}
                          </h4>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">Course / Program</div>
                              <p className="text-[10px] font-bold text-gray-200 uppercase truncate">
                                {profile?.program || 'Not Set'}
                              </p>
                            </div>
                            <div>
                              <div className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">Year Level</div>
                              <p className="text-[10px] font-bold text-gray-200 uppercase">
                                {profile?.year_level ? `${profile.year_level} Year` : 'Not Set'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/5 pt-4">
                          <div>
                            <div className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">Campus</div>
                            <p className="text-[10px] font-bold text-amber-500 uppercase">
                              {profile?.campus || 'MSU System'}
                            </p>
                          </div>
                          <div className="w-12 h-12 opacity-20">
                            <Logo />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Holographic Overlays */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 blur-[60px] rounded-full translate-y-1/2 -translate-x-1/2" />
                  </motion.div>

                  <div className="flex justify-center gap-4">
                    <button onClick={downloadDigitalId} className="px-8 py-3 rounded-lg bg-amber-500 text-black font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2">
                      <Download size={18} />
                      Download Digital ID
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const [lostFoundItems, setLostFoundItems] = useState<{ id: number; title: string; description: string; location: string; campus?: string; type: 'lost' | 'found'; status: 'open' | 'claimed'; timestamp: string; image_url?: string; user_id: number }[]>([]);
  const [lostFoundForm, setLostFoundForm] = useState({ title: '', description: '', location: '', type: 'lost' as 'lost' | 'found', imagePreview: null as string | null });
  const [lostFoundTab, setLostFoundTab] = useState<'all' | 'lost' | 'found'>('all');
  const [lostFoundSearch, setLostFoundSearch] = useState('');
  const [showLostFoundComposer, setShowLostFoundComposer] = useState(false);
  const [reelMessages, setReelMessages] = useState<any[]>([]);
  const [reelCaption, setReelCaption] = useState('');
  const [reelUploading, setReelUploading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && view === 'lostfound') {
      fetch('/api/lostfound').then(r => r.json()).then(setLostFoundItems);
    }
  }, [isLoggedIn, view]);

  const renderLostFound = () => {
    const openContact = (ownerId: number) => {
      if (!user) return;
      const roomId = `dm-${Math.min(user.id, ownerId)}-${Math.max(user.id, ownerId)}`;
      setActiveRoom(roomId);
      setView('newsfeed');
    };

    const filtered = lostFoundItems
      .filter((item) => {
        if (lostFoundTab !== 'all' && item.type !== lostFoundTab) return false;
        const q = lostFoundSearch.trim().toLowerCase();
        if (!q) return true;
        const hay = `${item.title} ${item.description || ''} ${item.location || ''} ${item.campus || ''}`.toLowerCase();
        return hay.includes(q);
      });

    return (
      <div className="min-h-screen bg-[#0a0502] text-gray-200 p-6 md:p-12 overflow-y-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto pb-20">
          <header className="flex items-center justify-between gap-4 mb-10">
            <div className="min-w-0">
              <h2 className="text-4xl font-black text-white tracking-tight">Lost & <span className="text-amber-500">Found</span></h2>
              <p className="text-gray-500 text-sm mt-1">Help reunite items with their owners.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowLostFoundComposer(true)} className="px-5 py-2.5 rounded-xl btn-red-metallic font-black text-sm flex items-center gap-2">
                <Plus size={18} />
                Report
              </button>
              <button onClick={() => setView('dashboard')} className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
                <X size={22} />
              </button>
            </div>
          </header>

          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10 w-fit">
              <button
                onClick={() => setLostFoundTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${lostFoundTab === 'all' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setLostFoundTab('lost')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${lostFoundTab === 'lost' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}
              >
                Lost
              </button>
              <button
                onClick={() => setLostFoundTab('found')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${lostFoundTab === 'found' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}
              >
                Found
              </button>
            </div>

            <div className="flex-1 max-w-md">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10">
                <Search size={16} className="text-gray-500" />
                <input
                  value={lostFoundSearch}
                  onChange={(e) => setLostFoundSearch(e.target.value)}
                  placeholder="Search items..."
                  className="w-full bg-transparent outline-none text-sm text-white placeholder:text-gray-600"
                />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {filtered.map((item) => (
              <div key={item.id} className="rounded-3xl bg-gradient-to-br from-white/5 to-black/20 border border-amber-500/20 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.type === 'lost' ? 'bg-rose-500/20 border border-rose-500/30 text-rose-300' : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-200'}`}>
                          {item.type === 'lost' ? 'Lost' : 'Found'}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-white truncate">{item.title}</h4>
                    </div>
                    <div className="shrink-0 text-[11px] text-gray-500 flex items-center gap-2">
                      <Clock size={14} />
                      {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-300 leading-relaxed mb-4">{item.description}</p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4 text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-amber-500/80" />
                        <span className="font-semibold">{item.campus || 'MSU System'}</span>
                      </div>
                      {item.location && (
                        <div className="text-gray-500">{item.location}</div>
                      )}
                    </div>
                    <div className="text-gray-500 text-xs font-medium">
                      Contact info available in profile
                    </div>
                    {user && item.user_id !== user.id && (
                      <button
                        onClick={() => openContact(item.user_id)}
                        className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all"
                      >
                        Contact Owner
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Search className="mx-auto mb-4 text-gray-600" size={40} />
                <p className="text-gray-500">No items found.</p>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showLostFoundComposer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowLostFoundComposer(false)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 10 }}
                className="w-full max-w-xl rounded-3xl bg-[#0f1016] border border-white/10 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-300">
                      <Plus size={18} />
                    </div>
                    <div>
                      <div className="text-lg font-black text-white">Report Item</div>
                      <div className="text-xs text-gray-500">Post a lost or found report to help MSUans.</div>
                    </div>
                  </div>
                  <button onClick={() => setShowLostFoundComposer(false)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10 w-fit">
                    <button
                      onClick={() => setLostFoundForm(prev => ({ ...prev, type: 'lost' }))}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${lostFoundForm.type === 'lost' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                      Lost
                    </button>
                    <button
                      onClick={() => setLostFoundForm(prev => ({ ...prev, type: 'found' }))}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${lostFoundForm.type === 'found' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                      Found
                    </button>
                  </div>

                  <input
                    placeholder="Item title (e.g., Blue Backpack - Jansport)"
                    value={lostFoundForm.title}
                    onChange={e => setLostFoundForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                  <textarea
                    placeholder="Describe the item..."
                    value={lostFoundForm.description}
                    onChange={e => setLostFoundForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 min-h-[120px] resize-none"
                  />
                  <input
                    placeholder="Where (e.g., Engineering building)"
                    value={lostFoundForm.location}
                    onChange={e => setLostFoundForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-gray-400 hover:bg-white/10 cursor-pointer transition-colors flex items-center gap-2">
                      <Image size={16} className="text-amber-400" />
                      {lostFoundForm.imagePreview ? 'Change Photo' : 'Add Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => setLostFoundForm(prev => ({ ...prev, imagePreview: reader.result as string }));
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    {lostFoundForm.imagePreview && (
                      <button onClick={() => setLostFoundForm(prev => ({ ...prev, imagePreview: null }))} className="px-4 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-black">
                        Remove
                      </button>
                    )}
                  </div>

                  {lostFoundForm.imagePreview && (
                    <div className="rounded-2xl overflow-hidden border border-white/10">
                      <img src={lostFoundForm.imagePreview} className="w-full max-h-72 object-cover" />
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-white/5 flex justify-end">
                  <button
                    onClick={async () => {
                      if (!user || !lostFoundForm.title.trim()) return;
                      let imageUrl: string | undefined;
                      if (lostFoundForm.imagePreview) {
                        const up = await fetch('/api/upload', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ dataUrl: lostFoundForm.imagePreview })
                        }).then(r => r.json());
                        if (up.success) imageUrl = up.url;
                      }
                      const res = await fetch('/api/lostfound', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...lostFoundForm, userId: user.id, imageUrl })
                      }).then(r => r.json());
                      if (res.success) {
                        setLostFoundItems(prev => [res.item, ...prev]);
                        setLostFoundForm({ title: '', description: '', location: '', type: 'lost', imagePreview: null });
                        setShowLostFoundComposer(false);
                      }
                    }}
                    className="px-6 py-3 rounded-2xl btn-red-metallic font-black"
                  >
                    Post Report
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderScheduler = () => (
    <div className="min-h-screen bg-[#0a0502] text-gray-200 p-6 md:p-12 overflow-y-auto scrollbar-hide">
      <div className="max-w-5xl mx-auto pb-20">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">Student <span className="text-amber-500">Scheduler</span></h2>
            <p className="text-gray-500 text-sm mt-1">Plan classes, deadlines, and campus tasks in one place.</p>
          </div>
          <button onClick={() => setView('dashboard')} className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all hover:scale-110">
            <X size={24} />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="md:col-span-1 lg:col-span-1 p-6 rounded-3xl bg-white/5 border border-white/10">
            <h3 className="font-bold text-white mb-4">Create Schedule</h3>
            <div className="space-y-3">
              <input value={schedulerForm.title} onChange={(e) => setSchedulerForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Title" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm" />
              <textarea value={schedulerForm.details} onChange={(e) => setSchedulerForm(prev => ({ ...prev, details: e.target.value }))} placeholder="Details" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm min-h-24" />
              <input type="date" value={schedulerForm.scheduleDate} onChange={(e) => setSchedulerForm(prev => ({ ...prev, scheduleDate: e.target.value }))} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm" />
              <input type="time" value={schedulerForm.scheduleTime} onChange={(e) => setSchedulerForm(prev => ({ ...prev, scheduleTime: e.target.value }))} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm" />
              <input value={schedulerForm.location} onChange={(e) => setSchedulerForm(prev => ({ ...prev, location: e.target.value }))} placeholder="Location" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm" />
              <button
                onClick={async () => {
                  if (!user || !schedulerForm.title || !schedulerForm.scheduleDate || !schedulerForm.scheduleTime) return;
                  const res = await fetch('/api/schedules', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, ...schedulerForm })
                  }).then(r => r.json());
                  if (res.success) {
                    setScheduleItems(prev => [...prev, res.item].sort((a, b) => `${a.schedule_date} ${a.schedule_time}`.localeCompare(`${b.schedule_date} ${b.schedule_time}`)));
                    setSchedulerForm({ title: '', details: '', scheduleDate: '', scheduleTime: '', location: '' });
                  }
                }}
                className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400"
              >Save Schedule</button>
            </div>
          </div>

          <div className="md:col-span-1 lg:col-span-2 space-y-4">
            {scheduleItems.map((item) => (
              <div key={item.id} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-white">{item.title}</p>
                    <p className="text-xs text-amber-500 mt-1">{item.schedule_date} • {item.schedule_time}{item.location ? ` • ${item.location}` : ''}</p>
                    {item.details && <p className="text-sm text-gray-300 mt-3">{item.details}</p>}
                  </div>
                  <button onClick={async () => {
                    if (!user) return;
                    const res = await fetch(`/api/schedules/${item.id}?userId=${user.id}`, { method: 'DELETE' }).then(r => r.json());
                    if (res.success) setScheduleItems(prev => prev.filter(x => x.id !== item.id));
                  }} className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">Delete</button>
                </div>
              </div>
            ))}
            {scheduleItems.length === 0 && <div className="text-center text-gray-500 py-14 border border-dashed border-white/10 rounded-3xl">No schedules yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfession = () => {
    const campusFilters = [
      'All Posts',
      ...Array.from(new Set(freedomPosts.map(p => p.campus).filter(Boolean))).slice(0, 10)
    ];
    const selectedCampus = campusFilters.includes(freedomCampusFilter) ? freedomCampusFilter : 'All Posts';
    const filtered = freedomPosts.filter(p => selectedCampus === 'All Posts' ? true : p.campus === selectedCampus);

    return (
      <div className="min-h-screen bg-[#0a0502] text-gray-200 p-6 md:p-12 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto pb-20">
          <header className="flex items-start justify-between gap-4 mb-8">
            <div className="min-w-0">
              <h2 className="text-4xl font-black text-white tracking-tight">Freedom <span className="text-amber-500">Wall</span></h2>
              <p className="text-gray-500 text-sm mt-1">Share your thoughts anonymously.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowFreedomComposer(true)} className="px-5 py-2.5 rounded-xl btn-red-metallic font-black text-sm flex items-center gap-2">
                <Plus size={18} />
                Post
              </button>
              <button onClick={() => setView('dashboard')} className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
                <X size={22} />
              </button>
            </div>
          </header>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8">
            {campusFilters.map((c) => (
              <button
                key={c}
                onClick={() => setFreedomCampusFilter(c)}
                className={`px-4 py-2 rounded-full border text-xs font-black whitespace-nowrap transition-colors ${selectedCampus === c ? 'bg-amber-500 text-black border-amber-400/40' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {filtered.map((p) => (
              <div key={p.id} className="rounded-3xl bg-gradient-to-br from-white/5 to-black/20 border border-amber-500/20 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 text-sm font-black text-amber-300">
                          <ShieldCheck size={16} className="text-amber-300/80" />
                          <span className="truncate">{p.alias}</span>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-gray-200">
                          {p.campus}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                      {user && p.user_id === user.id && (
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this post?')) return;
                            try {
                              const res = await fetch(`/api/freedomwall/${p.id}`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' }
                              }).then(r => r.json());
                              if (res.success) {
                                setFreedomPosts(prev => prev.filter(x => x.id !== p.id));
                              }
                            } catch (e) { console.error(e); }
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                      <div className="text-[11px] text-gray-500 flex items-center gap-2">
                        <Clock size={14} />
                        {p.timestamp ? new Date(p.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Just now'}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-200 leading-relaxed">{p.content}</p>

                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          if (!user) return;
                          fetch(`/api/freedomwall/${p.id}/react`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ type: 'like', userId: user.id })
                          }).then(r => r.json()).then(res => {
                            if (!res?.success) return;
                            setFreedomPosts((prev) => prev.map(x => x.id === p.id ? res.item : x));
                            setLikedPosts(prev => {
                              const next = new Set(prev);
                              if (Number(res.item?.user_liked) === 1) next.add(p.id);
                              else next.delete(p.id);
                              return next;
                            });
                          });
                        }}
                        className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-rose-300 transition-colors"
                      >
                        <Heart size={16} className={Number(p.user_liked) === 1 ? 'fill-rose-500 text-rose-500' : ''} />
                        {p.likes}
                      </button>
                      <button className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-amber-500 transition-colors">
                        <MessageCircle size={16} />
                        {p.comment_count || 0}
                      </button>
                    </div>
                    <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Anonymous</div>
                  </div>

                  <PostComments postId={p.id} />
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Sparkles className="mx-auto mb-4 text-gray-600" size={40} />
                <p className="text-gray-500">No posts yet.</p>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showFreedomComposer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowFreedomComposer(false)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 10 }}
                className="w-full max-w-xl rounded-3xl bg-[#0f1016] border border-white/10 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-300">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <div className="text-lg font-black text-white">New Post</div>
                      <div className="text-xs text-gray-500">Your post will show your chosen nickname.</div>
                    </div>
                  </div>
                  <button onClick={() => setShowFreedomComposer(false)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <input
                    value={confessionAlias}
                    onChange={(e) => setConfessionAlias(e.target.value.slice(0, 40))}
                    placeholder="Nickname (e.g., Silent Observer)"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                  <textarea
                    value={freedomText}
                    onChange={(e) => setFreedomText(e.target.value)}
                    placeholder="Share something..."
                    rows={5}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-gray-400 hover:bg-white/10 cursor-pointer transition-colors flex items-center gap-2">
                      <Image size={16} className="text-amber-400" />
                      {freedomImagePreview ? 'Change Image' : 'Attach Image'}
                      <input
                        type="file"
                        accept="image/*,.gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => setFreedomImagePreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />
                    </label>
                    {freedomImagePreview && (
                      <button onClick={() => setFreedomImagePreview(null)} className="px-4 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-black">
                        Remove
                      </button>
                    )}
                  </div>

                  {freedomImagePreview && (
                    <div className="rounded-2xl overflow-hidden border border-white/10">
                      <img src={freedomImagePreview} alt="" className="w-full max-h-72 object-cover" />
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-white/5 flex justify-end">
                  <button
                    onClick={async () => {
                      if (!user || !freedomText.trim()) return;
                      let imageUrl: string | undefined;
                      if (freedomImagePreview) {
                        const up = await fetch('/api/upload', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ dataUrl: freedomImagePreview })
                        }).then(r => r.json());
                        if (up.success) imageUrl = up.url;
                      }
                      const res = await fetch('/api/freedomwall', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id, alias: confessionAlias || 'ONEMSU', content: freedomText.trim(), campus: user.campus || 'Global', imageUrl })
                      }).then(r => r.json());
                      if (res.success) {
                        setFreedomText('');
                        setFreedomImagePreview(null);
                        setFreedomPosts((prev) => [res.item, ...prev]);
                        setShowFreedomComposer(false);
                      }
                    }}
                    className="px-6 py-3 rounded-2xl btn-red-metallic font-black"
                  >
                    Post
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  const speakText = (text: string) => {
    if (!speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const ProfileDetail = ({ id, onClose }: { id: number; onClose: () => void }) => {
    const [pUser, setPUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
      if (!id || isNaN(id)) {
        setError(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(false);
      fetch(`/api/profile/${id}?viewerId=${user?.id}`)
        .then(r => r.json())
        .then(res => {
          if (res.success) setPUser(res.user);
          else setError(true);
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
      <div className="text-white flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="font-bold">Loading profile...</div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-sm">Cancel</button>
      </div>
    );

    if (error || !pUser) return (
      <div className="bg-[#0a0502] p-8 rounded-2xl border border-white/10 text-center max-w-sm">
        <div className="text-rose-500 font-bold mb-2">Profile Not Found</div>
        <p className="text-gray-400 text-sm mb-6">Could not load user information.</p>
        <button onClick={onClose} className="px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20 text-white font-medium">Close</button>
      </div>
    );

    const handleFollow = async () => {
      await toggleFollow(id);
      fetch(`/api/profile/${id}?viewerId=${user?.id}`).then(r => r.json()).then(res => res.success && setPUser(res.user));
    };

    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md card-gold rounded-3xl overflow-hidden shadow-2xl"
      >
        <div 
          className="h-32 bg-gradient-to-br from-amber-600/30 to-black relative"
          style={{ backgroundImage: pUser.cover_photo ? `url(${pUser.cover_photo})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 pb-8 relative">
          <div className="absolute -top-12 left-6">
            <div className="w-24 h-24 rounded-full ring-4 ring-black overflow-hidden bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-3xl">
              {pUser.avatar ? <img src={pUser.avatar} alt="" className="w-full h-full object-cover" /> : pUser.name[0]}
            </div>
          </div>
          <div className="pt-14">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  {pUser.name}
                  {isOwner(pUser.email) && (
                    <span className="p-1 rounded-full bg-amber-500 text-black" title="Verified Owner">
                      <ShieldCheck size={14} />
                    </span>
                  )}
                </h3>
                <p className="text-amber-500 text-sm font-medium">{pUser.campus}</p>
              </div>
              {user && user.id !== id && (
                <button
                  onClick={handleFollow}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${pUser.isFollowing ? 'bg-white/10 text-white border border-white/20' : 'bg-amber-500 text-black'}`}
                >
                  {pUser.isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            
            <div className="mt-4 flex gap-6 text-center">
              <div>
                <div className="text-lg font-bold text-white">{pUser.followers || 0}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Followers</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{pUser.following || 0}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Following</div>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm text-gray-300">
              {pUser.program && <p><span className="text-gray-500 uppercase text-[10px] block">Program</span> {pUser.program}</p>}
              {pUser.bio && <p className="italic text-gray-400">"{pUser.bio}"</p>}
            </div>
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => {
                  onClose();
                  setView('newsfeed');
                }}
                className="flex-1 bg-amber-500 text-black font-bold py-3 rounded-xl hover:bg-amber-400 transition-all"
              >
                View Updates
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-[100dvh] w-full selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden overflow-y-auto scrollbar-hide">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999]"
          >
            <SplashScreen onComplete={() => setShowSplash(false)} />
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderHome()}
          </motion.div>
        )}
        {view === 'explorer' && (
          <motion.div
            key="explorer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderExplorer()}
          </motion.div>
        )}
        {view === 'about' && (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderAbout()}
          </motion.div>
        )}
        {view === 'privacy' && (
          <motion.div
            key="privacy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderPrivacy()}
          </motion.div>
        )}
        {view === 'terms' && (
          <motion.div
            key="terms"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderTerms()}
          </motion.div>
        )}
        {view === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {renderDashboard()}
          </motion.div>
        )}
        {view === 'messenger' && (
          <motion.div
            key="messenger"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderMessenger()}
          </motion.div>
        )}
        {view === 'newsfeed' && (
          <motion.div
            key="newsfeed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderNewsfeed()}
          </motion.div>
        )}
        {view === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderProfile()}
          </motion.div>
        )}
        {view === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderTimeline()}
          </motion.div>
        )}
        {view === 'confession' && (
          <motion.div
            key="confession"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderConfession()}
          </motion.div>
        )}
        {view === 'feedbacks' && (
          <motion.div
            key="feedbacks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderFeedbacks()}
          </motion.div>
        )}
        {view === 'lostfound' && (
          <motion.div
            key="lostfound"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderLostFound()}
          </motion.div>
        )}
        {view === 'scheduler' && (
          <motion.div
            key="scheduler"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderScheduler()}
          </motion.div>
        )}
        {view === 'live' && (
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderLive()}
          </motion.div>
        )}
        {view === 'reels' && (
          <motion.div
            key="reels"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderReels()}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[min(92vw,560px)] px-5 py-4 rounded-2xl bg-amber-500 text-black font-bold shadow-2xl shadow-amber-900/40 flex items-center gap-3 cursor-pointer hover:bg-amber-400 transition-colors"
            onClick={() => {
              if (toast.kind === 'message' && toast.roomId) {
                setView('newsfeed');
              } else {
                setView('dashboard');
                setShowNotifications(true);
              }
              setToast(null);
            }}
          >
            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
              {toast.kind === 'message' ? <MessageCircle size={18} /> : <Bell size={18} />}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs opacity-70 uppercase tracking-wider">{toast.kind === 'message' ? 'New Message' : 'Notification'}</span>
              <span className="truncate">{toast.message}</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setToast(null); }}
              className="ml-2 p-1 rounded-lg hover:bg-black/10 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Navigation Overlay (Mobile) */}
      {!isLoggedIn && (
        <div className="fixed top-6 right-6 z-50 md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 rounded-full bg-amber-500 text-black shadow-lg"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      )}

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-40 bg-black/95 flex flex-col items-center justify-center p-8 md:hidden"
          >
            <div className="flex flex-col gap-8 text-center">
              <button onClick={() => { setView('home'); setIsMenuOpen(false); }} className="text-4xl font-bold text-white">Home</button>
              <button onClick={() => { setView('explorer'); setIsMenuOpen(false); }} className="text-4xl font-bold text-white">Campuses</button>
              <button onClick={() => { setView('about'); setIsMenuOpen(false); }} className="text-4xl font-bold text-white">About</button>
              <div className="h-px w-24 bg-amber-500/30 mx-auto my-4" />
              <div className="flex gap-6 justify-center text-amber-500">
                <Github size={24} />
                <Globe size={24} />
                <Info size={24} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Indicator (Mobile) */}
      {swipeProgress > 0 && (
        <div className="md:hidden fixed left-0 top-0 bottom-0 pointer-events-none z-50 w-1 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent"
          style={{ opacity: swipeProgress, width: `${swipeProgress * 60}px` }}
        />
      )}

      {/* Swipe Hint (shown on certain views) */}
      {['profile', 'explorer', 'newsfeed', 'confession'].includes(view) && swipeProgress === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          className="md:hidden fixed left-2 top-1/2 -translate-y-1/2 pointer-events-none z-10"
        >
          <div className="text-amber-400/40 text-xs font-bold">&lt;</div>
        </motion.div>
      )}
    </div>
  );
}
