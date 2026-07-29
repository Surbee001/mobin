/**
 * ─────────────────────────────────────────────────────────────
 *  EVERY piece of text on this site lives in this one file.
 *  Edit here — nothing else. TypeScript will catch typos.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
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
    /** Initials pressed into the wax seal. */
    monogram: 'M&M',
  },

  /**
   * The date & time of the event.
   * ISO 8601 with an explicit UTC offset — this is what the
   * countdown and the calendar link both read from.
   * Example below is 8:00 PM Tehran time (+03:30).
   */
  event: {
    /**
     * The Gregorian instant. The countdown and the .ics calendar file both
     * read from THIS field, not from `cardDate` below — so if the Hijri date
     * on the card moves, this has to move with it.
     */
    iso: '2026-09-18T20:00:00+03:30',
    /** The one line beneath the names on the card. */
    cardDate: "17 Rabi'",
    /** The line under the hero, on the scroll cue. */
    dateLine: "17 Rabi'",
    /** Persian date line, shown in the invitation section. */
    dateFa: 'جمعه ۲۷ شهریور ۱۴۰۵ — ساعت ۸ شب',
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
   * Sūrat ar-Rūm (30), āyah 21 — in full, including the closing clause.
   * This is the verse that fades into colour as you scroll.
   */
  aya: {
    /** Keep this as one continuous string — it is split per-word. */
    arabic:
      'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ',
    reference: 'سورهٔ روم — آیهٔ ۲۱',
    /**
     * What the line under the verse says before anything has been touched —
     * and the only hint that the words can be touched at all.
     */
    glossPrompt: 'واژه‌ای را لمس کنید',
    /**
     * The verse word by word, in Persian.
     *
     * One entry per word of `arabic` above, IN ORDER, counted by splitting
     * that line on its spaces — which includes the pause mark ۚ standing on
     * its own. It gets an empty string and stays untouchable.
     *
     * Position is the only thing tying a gloss to its word, so the two lists
     * have to stay exactly the same length: add a word above without adding
     * its gloss here and every gloss after it lands on the wrong word.
     * Aya.tsx counts them and quietly turns touching off rather than gloss
     * the verse wrongly — so if the words stop responding, this is why.
     *
     * A plain reading rather than a translation: enough that a guest who does
     * not read Arabic can follow the sentence, and no more. Worth the
     * families' eyes on the wording before this goes out.
     */
    gloss: [
      'و از', // وَمِنْ
      'نشانه‌های او', // آيَاتِهِ
      'این‌که', // أَنْ
      'آفرید', // خَلَقَ
      'برای شما', // لَكُم
      'از', // مِّنْ
      'جنس خودتان', // أَنفُسِكُمْ
      'همسرانی', // أَزْوَاجًا
      'تا آرام گیرید', // لِّتَسْكُنُوا
      'در کنار آنان', // إِلَيْهَا
      'و قرار داد', // وَجَعَلَ
      'میان شما', // بَيْنَكُم
      'دوستی', // مَّوَدَّةً
      'و مهربانی', // وَرَحْمَةً
      '', // ۚ — a mark of pause, not a word
      'بی‌گمان', // إِنَّ
      'در', // فِي
      'این', // ذَٰلِكَ
      'نشانه‌هایی است', // لَآيَاتٍ
      'برای مردمی که', // لِّقَوْمٍ
      'می‌اندیشند', // يَتَفَكَّرُونَ
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
    /** How long the event runs, in minutes. */
    durationMinutes: 240,
  },

  /** The prompt on the sealed envelope, before it is opened. */
  opening: {
    prompt: 'برای گشودن، لمس کنید',
    promptEn: 'TOUCH TO OPEN',
  },
} as const

export type Site = typeof site
