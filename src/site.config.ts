/**
 * ─────────────────────────────────────────────────────────────
 *  EVERY piece of text on this site lives in this one file.
 *  Edit here — nothing else. TypeScript will catch typos.
 * ─────────────────────────────────────────────────────────────
 */

/** The four hero designs. See `design.hero`. */
export type HeroDesign =
  /** The invitation card: names over two lines, three columns at the foot. */
  | 'card'
  /** The poster: two lines, the names on one line, two lines. */
  | 'verse'
  /** The plate: the names alone, inside an engraved border. */
  | 'frame'
  /** The monogram: two initials the height of the card, the notice between. */
  | 'monogram'

export const site = {
  /** Which design is showing. Change it here and reload — all four are built. */
  design: {
    hero: 'card' as HeroDesign,
  },

  /** Shown in the browser tab / when the link is shared. */
  meta: {
    title: 'مینا و مبین',
    description: 'دعوت‌نامهٔ مراسم نامزدی',
  },

  /** The two names, for the card + hero. */
  couple: {
    one: 'MINA',
    two: 'MOBIN',
    /**
     * The same two lines in Persian — the card slides between the two settings
     * on a loop. Each line has to carry its own conjunction, because the whole
     * line is replaced: the `&` belongs to the English setting and goes with
     * it, and `و` comes in with the Persian.
     */
    oneFa: 'مینا و',
    twoFa: 'مبین',
    /** The italic pair either side of the rule at the top of the card. */
    oneFull: 'Mina Akhoondi',
    twoFull: 'Mobin Yousefi',
    /**
     * The pair on one line, for the designs that set them side by side rather
     * than stacked. Both settings, because the line swaps language like the
     * stacked one does — and the `&` is in the Persian too, as the mark the
     * two names meet at rather than as a word.
     */
    pair: { en: 'MINA & MOBIN', fa: 'مینا & مبین' },
    /**
     * The two initials, for the monogram design — one set in script at the
     * head of the card and one in the display face at its foot, both run off
     * the edge. Kept separate from the names rather than sliced off them: the
     * pair happen to share a letter here, and a design that leans on that
     * should say so out loud rather than compute it and look like a bug.
     */
    initials: { one: 'M', two: 'M' },
    /** Initials pressed into the wax seal. */
    monogram: 'M&M',
  },

  /**
   * The date & time of the event.
   *
   * ISO 8601 with an explicit UTC offset — the countdown, the four phases it
   * moves through, and the calendar file all read from it, so this one field
   * is the whole schedule. +03:30 is Tehran, all year: Iran stopped observing
   * daylight saving in 2022, so there is no summer offset to catch anyone out.
   */
  event: {
    /**
     * The Gregorian instant. The countdown and the .ics calendar file both
     * read from THIS field, not from `cardDate` below — so if the Hijri date
     * on the card moves, this has to move with it.
     *
     * 2026-08-30 is 17 Rabiʻ al-Awwal 1448 by the Umm al-Qura calendar.
     * Civil-tabular reckoning puts that a day later, on the 31st — worth
     * confirming against whichever the families are going by.
     */
    iso: '2026-08-30T23:00:00+03:30',
    /** The one line beneath the names on the card. */
    cardDate: "17 Rabi'",
    /** The line under the hero, on the scroll cue. */
    dateLine: "17 Rabi'",
    /** Persian date line, shown in the invitation section. */
    dateFa: 'یکشنبه ۸ شهریور ۱۴۰۵ — ساعت ۱۱ شب',
  },

  /**
   * The three columns along the foot of the card, divided by the engraved
   * flourishes: why, when, and where. Between them they are the whole of the
   * rest of the site — a guest who reads nothing but the hero still knows
   * what they have been invited to, on what day, and where to go.
   *
   * Written in Persian, in the voice of the rest of the site, with no heading
   * over any of them — the flourishes divide the three, and that is division
   * enough.
   *
   * Keep the lines SHORT — two apiece. They set in a column about a third of
   * the card wide, and a line long enough to wrap breaks the three columns out
   * of alignment with one another.
   */
  cardInfo: [
    {
      stamp: false,
      lines: ['حضور شما عزیزان', 'جشن ما را کامل می‌کند'],
    },
    {
      /**
       * The one column with no lines of its own. It carries `event.cardDate`
       * instead, stamped in the grotesque, and nothing else: the date is the
       * middle of the three and says itself.
       */
      stamp: true,
      lines: [],
    },
    {
      stamp: false,
      lines: ['دفتر ازدواج مهردریا', 'بلوار دریا'],
    },
  ],

  /**
   * The alternate hero, `design.hero: 'verse'`. Two lines above the names and
   * two below, and nothing else on the card at all.
   *
   * Each line is set on one line and stretched with kashidas until it is the
   * width of the names. That sets the length: too SHORT and the stretching has
   * to do all the work, and the line arrives as a row of long dashes with
   * letters scattered along it; too LONG and it is already wider than the
   * names and wraps, which takes the whole shape with it. Thirty to forty
   * characters is the window.
   */
  verse: {
    above: ['با تمام عشق و شادی، در آغاز فصلی تازه', 'دوست داریم این روز را با شما قسمت کنیم'],
    below: ['خداوندا میان ما مهر و مهربانی بگذار', 'و روزهای پیش رویمان را برکت ده'],
  },

  /**
   * Sūrat ar-Rūm (30), āyah 21 — in full, including the closing clause.
   * This is the verse that fades into colour as you scroll.
   */
  aya: {
    /** Keep this as one continuous string — it is split per-word. */
    arabic:
      'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ',
    reference: 'سورهٔ روم — آیهٔ ۲۱',
  },

  /**
   * A devotional couplet, set on its own panel after the verse.
   *
   * Transcribed from the card as written. Note the third line reads بأسم
   * there, where باسم is the usual spelling — left as found rather than
   * silently corrected.
   */
  poem: {
    /** The invocation, set above the couplet and apart from it. */
    bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    lines: [
      'على حُبِّ عَلي وفاطمة نمضي',
      'وعلى حُبِّ سَادتنا الأطهار نسير',
      'بأسم النورين الحَسن والحُسين',
    ],
  },

  /** The families speaking directly to their guests. */
  invitation: {
    /**
     * The greeting. Set on its own line, above and apart from the body —
     * it opens the letter rather than belonging to the sentence after it.
     */
    opening: 'با سپاس از خداوند مهربان،',
    /**
     * Each string is its own paragraph.
     * Written in the families' own voice.
     */
    paragraphs: [
      'حضور شما عزیزان را در جشن نامزدی فرزندانمان گرامی می‌داریم.',
      'شادی ما زمانی کامل می‌شود که شما در کنارمان باشید؛ قدم‌تان بر چشم ما.',
    ],
    /** The sign-off. */
    signature: 'خانواده‌های آخوندی و یوسفی',
  },

  /**
   * The notice at the centre of the monogram card. English, like the rest of
   * the card faces — the Persian on this site all lives below the hero.
   */
  monogram: {
    /** Two lines of script above the names. */
    lead: ['Save the date', 'for the engagement of'],
    /** Under the date. Set in wide small capitals. */
    footer: 'FORMAL INVITATION TO FOLLOW',
  },

  /** Where it happens. */
  location: {
    eyebrow: 'نشانی',
    name: 'دفتر ازدواج مهردریا',
    /**
     * As Google lists it for this place. Tidied of its duplicated
     * "تهران، استان تهران، تهران" prefix — check it against how the
     * families would actually write it. Leave empty to hide the line.
     */
    address: 'تهران، منطقهٔ ۲، بلوار دریا، نبش خیابان برادران صرافها',
    /**
     * What the embedded map searches for. Google resolved the shared link
     * from exactly this string, so it lands on the same place.
     */
    mapQuery: 'دفتر ازدواج مهردریا',
    /** The button destination — the original share link, so it is exact. */
    mapUrl: 'https://share.google/y2TSUxLgtAyXrFghq',
    /** Text on the button that opens Google Maps. */
    linkLabel: 'مشاهده روی نقشه',
  },

  /**
   * The countdown block — which knows what day it is.
   *
   * It moves through four settings, and the line above the clock is what
   * announces each one. Up to midnight in Tehran on the day itself it simply
   * counts. From that midnight it is `eyebrowToday`, and the clock drops the
   * days column because there are none left. From the hour of the party the
   * clock goes altogether and `nowLine` stands in its place, with the button
   * beneath it turning into directions rather than a calendar entry — on the
   * night, the only thing a guest wants from this page is the way there.
   * Afterwards, `passedLine`.
   *
   * The boundaries all come off `event.iso`, in the event's own timezone, so
   * moving the date moves every one of them. See components/eventPhase.ts.
   */
  countdown: {
    eyebrow: 'تا آن روز',
    /** From midnight on the day itself. */
    eyebrowToday: 'امشب',
    /** From the hour it begins. */
    eyebrowNow: 'همین حالا',
    /** And once it is over. */
    eyebrowPassed: 'آن روز فرا رسید',
    labels: {
      days: 'روز',
      hours: 'ساعت',
      minutes: 'دقیقه',
      seconds: 'ثانیه',
    },
    /** Stands where the clock was, while the party is happening. */
    nowLine: 'جشن آغاز شده است — منتظر شماییم',
    /** And after it. */
    passedLine: 'سپاس که در این شادی کنار ما بودید',
  },

  /** The quiet "add to calendar" link at the very end. */
  calendar: {
    label: 'افزودن به تقویم',
    /** Title of the event as it appears in the guest's calendar. */
    eventTitle: 'جشن نامزدی مینا و مبین',
    /** How long the event runs, in minutes. 240 from 11pm ends it at 3am. */
    durationMinutes: 240,
    /**
     * The revision number of the invitation, as calendars understand it.
     *
     * Every guest's copy carries the same UID, which is what lets a second
     * download replace the first rather than sit beside it as a duplicate.
     * But a calendar only accepts the replacement if this number is HIGHER
     * than the one it already has — with an unchanging sequence, someone who
     * added the event before the date moved keeps the old time for ever, and
     * nothing about the site tells them otherwise.
     *
     * So: bump it by one whenever the date, the time, the length or the venue
     * changes. It costs nothing to bump needlessly and it costs a guest the
     * evening not to bump when it mattered.
     *
     * 0 → 1: moved from 18 September, 8pm to 30 August, 11pm.
     */
    sequence: 1,
  },

  /** The prompt on the sealed envelope, before it is opened. */
  opening: {
    prompt: 'برای گشودن، لمس کنید',
    promptEn: 'TOUCH TO OPEN',
  },
} as const

export type Site = typeof site
