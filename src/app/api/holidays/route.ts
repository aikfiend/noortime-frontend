import { NextRequest, NextResponse } from 'next/server';

interface IslamicHoliday {
  name: string;
  description: string;
  date: string;
  hijriDate: string;
  type: 'eid' | 'ramadan' | 'observance';
}

const HIJRI_HOLIDAYS: {
  day: number;
  month: number;
  name: string;
  description: string;
  type: IslamicHoliday['type'];
}[] = [
  { day: 1,  month: 1,  name: 'Islamic New Year',          type: 'observance', description: 'The first day of Muharram marks the beginning of the Islamic lunar calendar year.' },
  { day: 10, month: 1,  name: 'Ashura',                    type: 'observance', description: 'Observed on the 10th of Muharram. A day of fasting commemorating the day Musa and the Israelites were saved from Pharaoh.' },
  { day: 12, month: 3,  name: 'Mawlid al-Nabi',            type: 'observance', description: "Celebration of the birth of the Prophet Muhammad ﷺ on the 12th of Rabi' al-Awwal." },
  { day: 27, month: 7,  name: "Laylat al-Isra' wal-Mi'raj", type: 'observance', description: "Commemorates the Night Journey and Ascension of the Prophet Muhammad ﷺ to the heavens." },
  { day: 1,  month: 9,  name: 'First Day of Ramadan',      type: 'ramadan',    description: 'The beginning of the holy month of fasting, prayer, and reflection.' },
  { day: 27, month: 9,  name: 'Laylat al-Qadr',            type: 'ramadan',    description: "The Night of Power — the night the Qur'an was first revealed. Typically observed on the 27th of Ramadan." },
  { day: 1,  month: 10, name: 'Eid al-Fitr',               type: 'eid',        description: 'The Festival of Breaking the Fast, celebrating the end of Ramadan.' },
  { day: 9,  month: 12, name: 'Day of Arafah',             type: 'observance', description: 'The most important day of Hajj. Fasting on this day is said to expiate sins of the past and coming year.' },
  { day: 10, month: 12, name: 'Eid al-Adha',               type: 'eid',        description: 'The Festival of Sacrifice, commemorating the willingness of Ibrahim to sacrifice his son in obedience to Allah.' },
];

const HIJRI_MONTHS = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhul Qi'dah", 'Dhul Hijjah',
];

const ALADHAN = 'https://api.aladhan.com/v1';
const TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<number, { ts: number; data: IslamicHoliday[] }>();

async function gToHYear(day: number, month: number, year: number): Promise<number> {
  const date = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
  const res = await fetch(`${ALADHAN}/gToH/${date}`, { next: { revalidate: 86400 } });
  const json = await res.json() as { data: { hijri: { year: string } } };
  return parseInt(json.data.hijri.year);
}

async function convertHoliday(
  h: (typeof HIJRI_HOLIDAYS)[number],
  hijriYear: number,
  targetGregorianYear: number,
): Promise<IslamicHoliday | null> {
  try {
    const date = `${String(h.day).padStart(2, '0')}-${String(h.month).padStart(2, '0')}-${hijriYear}`;
    const res = await fetch(`${ALADHAN}/hToG/${date}`, { next: { revalidate: 86400 } });
    const json = await res.json() as { data: { gregorian: { date: string } } };
    const [dd, mm, yyyy] = json.data.gregorian.date.split('-');
    if (parseInt(yyyy) !== targetGregorianYear) return null;
    return {
      name: h.name,
      description: h.description,
      date: `${yyyy}-${mm}-${dd}`,
      hijriDate: `${h.day} ${HIJRI_MONTHS[h.month - 1]} ${hijriYear} AH`,
      type: h.type,
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()), 10);

  if (isNaN(year)) {
    return NextResponse.json({ message: 'Invalid year' }, { status: 400 });
  }

  const cached = cache.get(year);
  if (cached && Date.now() - cached.ts < TTL_MS) {
    return NextResponse.json(cached.data);
  }

  const [h1, h2] = await Promise.all([
    gToHYear(1, 1, year),
    gToHYear(31, 12, year),
  ]);

  const conversions: Promise<IslamicHoliday | null>[] = [];
  for (let hy = h1; hy <= h2; hy++) {
    for (const h of HIJRI_HOLIDAYS) {
      conversions.push(convertHoliday(h, hy, year));
    }
  }

  const results = (await Promise.all(conversions))
    .filter((h): h is IslamicHoliday => h !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  cache.set(year, { ts: Date.now(), data: results });
  return NextResponse.json(results);
}
